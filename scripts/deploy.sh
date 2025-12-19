#!/bin/bash

# Deployment Script for AgentsFlowAI
# This script handles the complete deployment process

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
BACKUP_DIR="/var/backups/agentsflowai"
LOG_DIR="/var/www/agentsflowai/logs"
GIT_REPO="https://github.com/codesleeps/agentsflowai-Ver.5.0.0.git"
GIT_BRANCH="main"
DEPLOY_USER="deploy"

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

# Function to create necessary directories
setup_directories() {
    print_status "Setting up directories..."
    
    mkdir -p $APP_DIR
    mkdir -p $BACKUP_DIR
    mkdir -p $LOG_DIR
    mkdir -p $APP_DIR/.next
    
    # Set proper permissions
    chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR
    chown -R $DEPLOY_USER:$DEPLOY_USER $BACKUP_DIR
    chown -R $DEPLOY_USER:$DEPLOY_USER $LOG_DIR
    
    print_success "Directories created and permissions set"
}

# Function to backup current deployment
backup_current() {
    if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
        print_status "Backing up current deployment..."
        
        BACKUP_NAME="backup-$(date +%Y%m%d-%H%M%S)"
        BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
        
        # Create backup
        cp -r $APP_DIR $BACKUP_PATH
        
        # Keep only last 10 backups
        cd $BACKUP_DIR
        ls -t | tail -n +11 | xargs -r rm -rf
        
        print_success "Backup created: $BACKUP_PATH"
    else
        print_status "No existing deployment to backup"
    fi
}

# Function to deploy the application
deploy_app() {
    print_status "Deploying application..."
    
    # Switch to deploy user
    cd $APP_DIR
    
    # Clone or pull the latest code
    if [ ! -d ".git" ]; then
        print_status "Cloning repository..."
        sudo -u $DEPLOY_USER git clone $GIT_REPO .
        sudo -u $DEPLOY_USER git checkout $GIT_BRANCH
    else
        print_status "Pulling latest changes..."
        sudo -u $DEPLOY_USER git fetch origin
        sudo -u $DEPLOY_USER git reset --hard origin/$GIT_BRANCH
    fi
    
    print_success "Repository updated"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing dependencies..."
    
    cd $APP_DIR
    
    # Install Node.js dependencies
    sudo -u $DEPLOY_USER npm ci --production=false
    
    # Run database migrations if needed
    if [ -f "package.json" ] && grep -q "db:migrate" package.json; then
        print_status "Running database migrations..."
        sudo -u $DEPLOY_USER npm run db:migrate
    fi
    
    print_success "Dependencies installed"
}

# Function to build the application
build_app() {
    print_status "Building application..."
    
    cd $APP_DIR
    
    # Set production environment
    export NODE_ENV=production
    
    # Build the application
    sudo -u $DEPLOY_USER npm run build
    
    print_success "Application built successfully"
}

# Function to restart application with PM2
restart_app() {
    print_status "Restarting application with PM2..."
    
    cd $APP_DIR
    
    # Start or restart PM2 process
    if sudo -u $DEPLOY_USER pm2 list | grep -q "$APP_NAME"; then
        sudo -u $DEPLOY_USER pm2 reload ecosystem.config.js --env production
    else
        sudo -u $DEPLOY_USER pm2 start ecosystem.config.js --env production
    fi
    
    # Save PM2 configuration
    sudo -u $DEPLOY_USER pm2 save
    
    print_success "Application restarted"
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Check if PM2 process is running
    if sudo -u $DEPLOY_USER pm2 list | grep -q "$APP_NAME.*online"; then
        print_success "PM2 process is running"
    else
        print_error "PM2 process is not running"
        return 1
    fi
    
    # Check if application is responding
    sleep 5
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        print_success "Application is responding"
    else
        print_warning "Application health check failed"
    fi
    
    # Check Nginx status
    if systemctl is-active --quiet nginx; then
        print_success "Nginx is running"
    else
        print_error "Nginx is not running"
        return 1
    fi
}

# Function to cleanup old files
cleanup() {
    print_status "Cleaning up old files..."
    
    # Clean npm cache
    sudo -u $DEPLOY_USER npm cache clean --force
    
    # Clean old PM2 logs
    sudo -u $DEPLOY_USER pm2 flush
    
    print_success "Cleanup completed"
}

# Function to display deployment status
display_status() {
    print_success "Deployment completed successfully!"
    echo
    echo "Application Status:"
    sudo -u $DEPLOY_USER pm2 status
    echo
    echo "Recent Logs:"
    sudo -u $DEPLOY_USER pm2 logs --lines 20
    echo
    echo "Application URL: https://your-domain.com"
    echo "Health Check: https://your-domain.com/health"
}

# Function to rollback deployment
rollback() {
    print_status "Rolling back deployment..."
    
    LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -n 1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        print_error "No backup found to rollback to"
        exit 1
    fi
    
    print_status "Restoring from backup: $LATEST_BACKUP"
    
    # Stop current application
    sudo -u $DEPLOY_USER pm2 stop $APP_NAME || true
    
    # Restore backup
    rm -rf $APP_DIR/*
    cp -r $BACKUP_DIR/$LATEST_BACKUP/* $APP_DIR/
    
    # Restart application
    restart_app
    
    print_success "Rollback completed"
}

# Function to display help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  deploy      Deploy the application (default)"
    echo "  rollback    Rollback to the previous backup"
    echo "  status      Show application status"
    echo "  logs        Show application logs"
    echo "  restart     Restart the application"
    echo "  help        Show this help message"
}

# Main execution function
main() {
    case "${1:-deploy}" in
        "deploy")
            check_root
            setup_directories
            backup_current
            deploy_app
            install_dependencies
            build_app
            restart_app
            verify_deployment
            cleanup
            display_status
            ;;
        "rollback")
            check_root
            rollback
            verify_deployment
            ;;
        "status")
            sudo -u $DEPLOY_USER pm2 status
            sudo -u $DEPLOY_USER pm2 logs --lines 10
            ;;
        "logs")
            sudo -u $DEPLOY_USER pm2 logs
            ;;
        "restart")
            check_root
            restart_app
            verify_deployment
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
