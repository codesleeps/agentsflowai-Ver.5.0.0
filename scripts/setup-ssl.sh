#!/bin/bash

# SSL/HTTPS Setup Script for AgentsFlowAI using Let's Encrypt (Certbot)
# This script automates the SSL certificate setup and renewal process

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="your-domain.com"
EMAIL="admin@your-domain.com"
WEB_ROOT="/var/www/agentsflowai"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

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

# Function to check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root or with sudo"
        exit 1
    fi
}

# Function to update system packages
update_system() {
    print_status "Updating system packages..."
    apt update && apt upgrade -y
    print_success "System packages updated"
}

# Function to install required packages
install_dependencies() {
    print_status "Installing required dependencies..."
    
    # Install Nginx if not already installed
    if ! command -v nginx &> /dev/null; then
        apt install nginx -y
        print_success "Nginx installed"
    else
        print_status "Nginx is already installed"
    fi
    
    # Install Certbot
    apt install certbot python3-certbot-nginx -y
    print_success "Certbot installed"
    
    # Install other useful packages
    apt install curl wget git -y
    print_success "Additional dependencies installed"
}

# Function to setup Nginx configuration
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    # Create Nginx sites directory if it doesn't exist
    mkdir -p $NGINX_SITES_AVAILABLE $NGINX_SITES_ENABLED
    
    # Backup default Nginx config
    if [ -f "$NGINX_SITES_AVAILABLE/default" ]; then
        mv $NGINX_SITES_AVAILABLE/default $NGINX_SITES_AVAILABLE/default.backup
        print_status "Default Nginx config backed up"
    fi
    
    # Copy our Nginx configuration
    if [ -f "./nginx.conf" ]; then
        cp ./nginx.conf $NGINX_SITES_AVAILABLE/agentsflowai
        print_status "Nginx configuration copied"
    else
        print_error "nginx.conf not found in current directory"
        exit 1
    fi
    
    # Replace placeholder domain with actual domain
    sed -i "s/your-domain.com/$DOMAIN/g" $NGINX_SITES_AVAILABLE/agentsflowai
    print_status "Domain name updated in Nginx config"
    
    # Create symbolic link to enable site
    ln -sf $NGINX_SITES_AVAILABLE/agentsflowai $NGINX_SITES_ENABLED/agentsflowai
    print_status "Site enabled in Nginx"
    
    # Test Nginx configuration
    nginx -t
    print_success "Nginx configuration test passed"
}

# Function to obtain SSL certificate
obtain_ssl_certificate() {
    print_status "Obtaining SSL certificate for $DOMAIN..."
    
    # Obtain SSL certificate using Certbot
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect
    
    if [ $? -eq 0 ]; then
        print_success "SSL certificate obtained successfully"
    else
        print_error "Failed to obtain SSL certificate"
        exit 1
    fi
}

# Function to setup auto-renewal
setup_auto_renewal() {
    print_status "Setting up SSL certificate auto-renewal..."
    
    # Create renewal hook script
    cat > /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh << 'EOF'
#!/bin/bash
# Reload Nginx after certificate renewal
systemctl reload nginx
EOF
    
    chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh
    
    # Add cron job for certificate renewal
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook \"/etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh\"") | crontab -
    
    print_success "Auto-renewal setup completed"
}

# Function to setup firewall
setup_firewall() {
    print_status "Setting up firewall rules..."
    
    # Allow SSH, HTTP, and HTTPS
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Enable firewall
    ufw --force enable
    
    print_success "Firewall configured"
}

# Function to create logrotate configuration
setup_log_rotation() {
    print_status "Setting up log rotation..."
    
    cat > /etc/logrotate.d/agentsflowai << EOF
# Log rotation for AgentsFlowAI application
/var/www/agentsflowai/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload pm2-agentsflowai || true
    endscript
}

# Log rotation for Nginx
/var/log/nginx/agentsflowai_*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 \`cat /var/run/nginx.pid\`
        fi
    endscript
}
EOF
    
    print_success "Log rotation configured"
}

# Function to create PM2 startup script
setup_pm2_startup() {
    print_status "Setting up PM2 startup script..."
    
    # Create PM2 startup script
    cat > /etc/systemd/system/pm2-agentsflowai.service << EOF
[Unit]
Description=PM2 process manager for AgentsFlowAI
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=deploy
WorkingDirectory=/var/www/agentsflowai
ExecStart=/usr/bin/pm2 start ecosystem.config.js --env production
ExecReload=/usr/bin/pm2 reload ecosystem.config.js --env production
ExecStop=/usr/bin/pm2 stop ecosystem.config.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=pm2-agentsflowai

[Install]
WantedBy=multi-user.target
EOF
    
    # Enable and start the service
    systemctl daemon-reload
    systemctl enable pm2-agentsflowai
    
    print_success "PM2 startup service configured"
}

# Function to verify installation
verify_installation() {
    print_status "Verifying SSL installation..."
    
    # Check if SSL certificate exists
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        print_success "SSL certificate found"
        
        # Check certificate expiry
        EXPIRY=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" | cut -d= -f2)
        print_status "Certificate expires on: $EXPIRY"
        
        # Test SSL configuration
        openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            print_success "SSL configuration is working"
        else
            print_warning "SSL configuration may have issues"
        fi
    else
        print_error "SSL certificate not found"
        exit 1
    fi
}

# Function to display final instructions
display_instructions() {
    print_success "SSL/HTTPS setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Update your DNS records to point $DOMAIN to this server's IP"
    echo "2. Test your website at https://$DOMAIN"
    echo "3. Update the DOMAIN variable in this script if needed"
    echo "4. Deploy your application using the deployment scripts"
    echo
    echo "Important files and locations:"
    echo "- SSL certificates: /etc/letsencrypt/live/$DOMAIN/"
    echo "- Nginx config: $NGINX_SITES_AVAILABLE/agentsflowai"
    echo "- Application logs: /var/www/agentsflowai/logs/"
    echo "- Nginx logs: /var/log/nginx/agentsflowai_*.log"
    echo
    echo "Certificate renewal is automated via cron job"
    echo "You can test renewal with: certbot renew --dry-run"
}

# Main execution function
main() {
    print_status "Starting SSL/HTTPS setup for AgentsFlowAI..."
    
    # Check for required arguments
    if [ $# -eq 2 ]; then
        DOMAIN="$1"
        EMAIL="$2"
        print_status "Using domain: $DOMAIN"
        print_status "Using email: $EMAIL"
    else
        print_warning "Usage: $0 <domain.com> <email@domain.com>"
        print_warning "Using default values - update them in the script if needed"
    fi
    
    # Execute setup steps
    check_root
    update_system
    install_dependencies
    setup_nginx
    obtain_ssl_certificate
    setup_auto_renewal
    setup_firewall
    setup_log_rotation
    setup_pm2_startup
    verify_installation
    display_instructions
    
    print_success "SSL/HTTPS setup completed!"
}

# Execute main function with all arguments
main "$@"
