#!/bin/bash

# Monitoring Script for AgentsFlowAI
# This script provides comprehensive monitoring and alerting capabilities

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="agentsflowai"
APP_DIR="/var/www/agentsflowai"
LOG_DIR="$APP_DIR/logs"
ALERT_EMAIL="admin@your-domain.com"
DISCORD_WEBHOOK_URL=""  # Optional: Add your Discord webhook URL
SLACK_WEBHOOK_URL=""     # Optional: Add your Slack webhook URL

# Thresholds
CPU_THRESHOLD=80
MEMORY_THRESHOLD=80
DISK_THRESHOLD=80
RESPONSE_TIME_THRESHOLD=5

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to send alerts
send_alert() {
    local message="$1"
    local severity="$2"
    
    echo "$message"
    
    # Send email alert if configured
    if [ -n "$ALERT_EMAIL" ]; then
        echo "$message" | mail -s "AgentsFlowAI Alert: $severity" "$ALERT_EMAIL" 2>/dev/null || true
    fi
    
    # Send Discord alert if configured
    if [ -n "$DISCORD_WEBHOOK_URL" ]; then
        curl -H "Content-Type: application/json" \
             -X POST \
             -d "{\"content\":\"**AgentsFlowAI Alert: $severity**\n$message\"}" \
             "$DISCORD_WEBHOOK_URL" 2>/dev/null || true
    fi
    
    # Send Slack alert if configured
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
             --data "{\"text\":\"**AgentsFlowAI Alert: $severity**\n$message\"}" \
             "$SLACK_WEBHOOK_URL" 2>/dev/null || true
    fi
}

# Function to check PM2 processes
check_pm2_status() {
    print_status "Checking PM2 process status..."
    
    local status_output=$(sudo -u deploy pm2 jlist 2>/dev/null)
    
    if [ -z "$status_output" ]; then
        send_alert "PM2 is not responding" "CRITICAL"
        return 1
    fi
    
    local failed_processes=$(echo "$status_output" | jq -r '.[] | select(.pm2_env.status != "online") | .name' 2>/dev/null || echo "")
    
    if [ -n "$failed_processes" ]; then
        send_alert "PM2 processes not online: $failed_processes" "CRITICAL"
        return 1
    fi
    
    local restart_count=$(echo "$status_output" | jq -r '.[] | select(.pm2_env.restart_time > 5) | "\(.name) (\(.pm2_env.restart_time) restarts)"' 2>/dev/null || echo "")
    
    if [ -n "$restart_count" ]; then
        send_alert "PM2 processes with high restart count: $restart_count" "WARNING"
    fi
    
    print_success "PM2 processes are healthy"
    return 0
}

# Function to check application health
check_application_health() {
    print_status "Checking application health..."
    
    local health_check=false
    local response_time=0
    
    # Check if application responds to health endpoint
    local start_time=$(date +%s%N)
    if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
        local end_time=$(date +%s%N)
        response_time=$(( (end_time - start_time) / 1000000 ))  # Convert to milliseconds
        
        if [ $response_time -le $((RESPONSE_TIME_THRESHOLD * 1000)) ]; then
            health_check=true
        fi
    fi
    
    if [ "$health_check" = false ]; then
        send_alert "Application health check failed or response time > ${RESPONSE_TIME_THRESHOLD}s (${response_time}ms)" "CRITICAL"
        return 1
    fi
    
    print_success "Application is healthy (${response_time}ms response time)"
    return 0
}

# Function to check system resources
check_system_resources() {
    print_status "Checking system resources..."
    
    local alerts=false
    
    # Check CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//' | cut -d. -f1)
    if [ "$cpu_usage" -gt "$CPU_THRESHOLD" ]; then
        send_alert "High CPU usage: ${cpu_usage}%" "WARNING"
        alerts=true
    fi
    
    # Check memory usage
    local memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$memory_usage" -gt "$MEMORY_THRESHOLD" ]; then
        send_alert "High memory usage: ${memory_usage}%" "WARNING"
        alerts=true
    fi
    
    # Check disk usage
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt "$DISK_THRESHOLD" ]; then
        send_alert "High disk usage: ${disk_usage}%" "WARNING"
        alerts=true
    fi
    
    # Check load average
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_cores=$(nproc)
    local load_threshold=$((cpu_cores * 2))
    
    if (( $(echo "$load_avg > $load_threshold" | bc -l) )); then
        send_alert "High load average: $load_avg (cores: $cpu_cores)" "WARNING"
        alerts=true
    fi
    
    if [ "$alerts" = false ]; then
        print_success "System resources are within normal limits"
        return 0
    else
        return 1
    fi
}

# Function to check Nginx status
check_nginx_status() {
    print_status "Checking Nginx status..."
    
    if ! systemctl is-active --quiet nginx; then
        send_alert "Nginx is not running" "CRITICAL"
        return 1
    fi
    
    if ! nginx -t > /dev/null 2>&1; then
        send_alert "Nginx configuration test failed" "CRITICAL"
        return 1
    fi
    
    # Check for recent Nginx errors
    local error_count=$(grep -c "$(date '+%Y/%m/%d')" /var/log/nginx/error.log 2>/dev/null || echo "0")
    if [ "$error_count" -gt 10 ]; then
        send_alert "High number of Nginx errors today: $error_count" "WARNING"
    fi
    
    print_success "Nginx is running properly"
    return 0
}

# Function to check SSL certificates
check_ssl_certificates() {
    print_status "Checking SSL certificates..."
    
    local domain="your-domain.com"  # Update this with actual domain
    local cert_path="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    
    if [ -f "$cert_path" ]; then
        local expiry_date=$(openssl x509 -enddate -noout -in "$cert_path" | cut -d= -f2)
        local expiry_epoch=$(date -d "$expiry_date" +%s)
        local current_epoch=$(date +%s)
        local days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
        
        if [ "$days_until_expiry" -lt 7 ]; then
            send_alert "SSL certificate expires in $days_until_expiry days!" "CRITICAL"
            return 1
        elif [ "$days_until_expiry" -lt 30 ]; then
            send_alert "SSL certificate expires in $days_until_expiry days" "WARNING"
        fi
        
        print_success "SSL certificate is valid ($days_until_expiry days remaining)"
    else
        print_warning "SSL certificate not found at $cert_path"
    fi
    
    return 0
}

# Function to check log files for errors
check_log_errors() {
    print_status "Checking application logs for errors..."
    
    local error_count=0
    local critical_count=0
    
    # Check PM2 logs for recent errors
    if [ -f "$LOG_DIR/error.log" ]; then
        local recent_errors=$(grep -c "$(date '+%Y-%m-%d')" "$LOG_DIR/error.log" 2>/dev/null || echo "0")
        error_count=$((error_count + recent_errors))
    fi
    
    # Check for critical errors
    if [ -f "$LOG_DIR/error.log" ]; then
        local critical_errors=$(grep -i -c "$(date '+%Y-%m-%d').*critical\|fatal\|panic" "$LOG_DIR/error.log" 2>/dev/null || echo "0")
        critical_count=$critical_errors
    fi
    
    if [ "$critical_count" -gt 0 ]; then
        send_alert "Found $critical_count critical errors in application logs" "CRITICAL"
        return 1
    elif [ "$error_count" -gt 20 ]; then
        send_alert "Found $error_count errors in application logs" "WARNING"
    fi
    
    print_success "Log error check completed"
    return 0
}

# Function to check database connectivity (if PostgreSQL is installed)
check_database_connectivity() {
    print_status "Checking database connectivity..."
    
    if command -v psql &> /dev/null; then
        # Check if PostgreSQL is running
        if systemctl is-active --quiet postgresql; then
            print_success "PostgreSQL is running"
            return 0
        else
            send_alert "PostgreSQL is not running" "CRITICAL"
            return 1
        fi
    else
        print_status "PostgreSQL not installed, skipping database check"
    fi
    
    return 0
}

# Function to generate monitoring report
generate_report() {
    print_status "Generating monitoring report..."
    
    local report_file="/tmp/agentsflowai-monitoring-$(date +%Y%m%d-%H%M%S).txt"
    
    {
        echo "AgentsFlowAI Monitoring Report"
        echo "Generated: $(date)"
        echo "================================"
        echo
        
        echo "System Information:"
        echo "- Uptime: $(uptime -p)"
        echo "- Kernel: $(uname -r)"
        echo "- OS: $(lsb_release -d | cut -f2)"
        echo "- CPU Cores: $(nproc)"
        echo "- Memory: $(free -h | grep Mem | awk '{print $2}')"
        echo "- Disk: $(df -h / | tail -1 | awk '{print $2}')"
        echo
        
        echo "Application Status:"
        sudo -u deploy pm2 status
        echo
        
        echo "Resource Usage:"
        echo "- CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2, $4}')"
        echo "- Memory: $(free -h | grep Mem | awk '{print $3"/"$2}')"
        echo "- Disk: $(df -h / | tail -1 | awk '{print $3"/"$2" ("$5")"}')"
        echo
        
        echo "Service Status:"
        echo "- Nginx: $(systemctl is-active nginx)"
        echo "- PM2: $(systemctl is-active pm2-agentsflowai 2>/dev/null || echo "Not configured")"
        echo "- PostgreSQL: $(systemctl is-active postgresql 2>/dev/null || echo "Not installed")"
        echo "- Redis: $(systemctl is-active redis 2>/dev/null || echo "Not installed")"
        
    } > "$report_file"
    
    print_success "Report generated: $report_file"
    
    # Send report via email if configured
    if [ -n "$ALERT_EMAIL" ]; then
        mail -s "AgentsFlowAI Monitoring Report" "$ALERT_EMAIL" < "$report_file" 2>/dev/null || true
    fi
}

# Function to display help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  check       Run all monitoring checks (default)"
    echo "  pm2         Check PM2 process status"
    echo "  app         Check application health"
    echo "  system      Check system resources"
    echo "  nginx       Check Nginx status"
    echo "  ssl         Check SSL certificates"
    echo "  logs        Check application logs for errors"
    echo "  database    Check database connectivity"
    echo "  report      Generate monitoring report"
    echo "  help        Show this help message"
}

# Main execution function
main() {
    case "${1:-check}" in
        "check")
            check_pm2_status
            check_application_health
            check_system_resources
            check_nginx_status
            check_ssl_certificates
            check_log_errors
            check_database_connectivity
            ;;
        "pm2")
            check_pm2_status
            ;;
        "app")
            check_application_health
            ;;
        "system")
            check_system_resources
            ;;
        "nginx")
            check_nginx_status
            ;;
        "ssl")
            check_ssl_certificates
            ;;
        "logs")
            check_log_errors
            ;;
        "database")
            check_database_connectivity
            ;;
        "report")
            generate_report
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            print_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Execute main function with all arguments
main "$@"
