#!/bin/bash

# Server Setup Script for AgentsFlowAI
# This script sets up a fresh Ubuntu/Debian server for production deployment

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_USER="deploy"
NODE_VERSION="24"
APP_NAME="agentsflowai"
APP_DIR="/var/www/agentsflowai"

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
    apt install -y curl wget git build-essential software-properties-common
    print_success "System packages updated"
}

# Function to create deploy user
create_deploy_user() {
    print_status "Creating deploy user..."
    
    if id "$DEPLOY_USER" &>/dev/null; then
        print_status "Deploy user $DEPLOY_USER already exists"
    else
        useradd -m -s /bin/bash $DEPLOY_USER
        usermod -aG sudo $DEPLOY_USER
        
        # Set up SSH directory
        mkdir -p /home/$DEPLOY_USER/.ssh
        chmod 700 /home/$DEPLOY_USER/.ssh
        touch /home/$DEPLOY_USER/.ssh/authorized_keys
        chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
        chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
        
        print_success "Deploy user $DEPLOY_USER created"
        print_warning "Please add your SSH public key to /home/$DEPLOY_USER/.ssh/authorized_keys"
    fi
}

# Function to install Node.js
install_nodejs() {
    print_status "Installing Node.js $NODE_VERSION..."
    
    # Install Node.js using NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    
    # Verify installation
    NODE_VERSION_CHECK=$(node --version)
    NPM_VERSION_CHECK=$(npm --version)
    
    print_success "Node.js $NODE_VERSION_CHECK installed"
    print_success "npm $NPM_VERSION_CHECK installed"
    
    # Install PM2 globally
    npm install -g pm2
    
    # Save PM2 startup script
    env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER
    
    print_success "PM2 installed and configured"
}

# Function to install Nginx
install_nginx() {
    print_status "Installing Nginx..."
    
    apt install -y nginx
    
    # Enable and start Nginx
    systemctl enable nginx
    systemctl start nginx
    
    # Configure firewall
    ufw allow 'Nginx Full'
    
    print_success "Nginx installed and started"
}

# Function to install database (PostgreSQL optional)
install_database() {
    print_status "Installing PostgreSQL (optional)..."
    
    read -p "Do you want to install PostgreSQL? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        apt install -y postgresql postgresql-contrib
        
        # Enable and start PostgreSQL
        systemctl enable postgresql
        systemctl start postgresql
        
        # Create database user
        sudo -u postgres createuser --interactive
        
        print_success "PostgreSQL installed"
    else
        print_status "Skipping PostgreSQL installation"
    fi
}

# Function to install Redis (optional)
install_redis() {
    print_status "Installing Redis (optional)..."
    
    read -p "Do you want to install Redis? (y/n): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        apt install -y redis-server
        
        # Configure Redis
        sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
        
        # Enable and start Redis
        systemctl enable redis
        systemctl start redis
        
        print_success "Redis installed and configured"
    else
        print_status "Skipping Redis installation"
    fi
}

# Function to setup application directory
setup_app_directory() {
    print_status "Setting up application directory..."
    
    # Create application directory
    mkdir -p $APP_DIR
    mkdir -p $APP_DIR/logs
    
    # Set ownership
    chown -R $DEPLOY_USER:$DEPLOY_USER $APP_DIR
    
    print_success "Application directory setup completed"
}

# Function to configure logrotate
configure_logrotate() {
    print_status "Configuring log rotation..."
    
    cat > /etc/logrotate.d/agentsflowai << EOF
# Log rotation for AgentsFlowAI application
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $DEPLOY_USER $DEPLOY_USER
    postrotate
        systemctl reload pm2-agentsflowai || true
    endscript
}
EOF
    
    print_success "Log rotation configured"
}

# Function to setup monitoring scripts
setup_monitoring() {
    print_status "Setting up monitoring scripts..."
    
    # Create monitoring directory
    mkdir -p /usr/local/bin/agentsflowai
    
    # Copy monitoring script (will be created separately)
    # This is a placeholder for the monitoring script
    
    chown -R $DEPLOY_USER:$DEPLOY_USER /usr/local/bin/agentsflowai
    
    print_success "Monitoring setup completed"
}

# Function to configure system limits
configure_system_limits() {
    print_status "Configuring system limits..."
    
    # Increase file descriptor limits
    cat >> /etc/security/limits.conf << EOF

# AgentsFlowAI limits
$DEPLOY_USER soft nofile 65536
$DEPLOY_USER hard nofile 65536
$DEPLOY_USER soft nproc 65536
$DEPLOY_USER hard nproc 65536
EOF
    
    # Configure kernel parameters
    cat >> /etc/sysctl.conf << EOF

# AgentsFlowAI kernel parameters
net.core.somaxconn = 65536
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 1200
net.ipv4.tcp_max_tw_buckets = 5000
vm.swappiness = 10
EOF
    
    # Apply sysctl changes
    sysctl -p
    
    print_success "System limits configured"
}

# Function to create health check endpoint setup
setup_health_check() {
    print_status "Setting up health check..."
    
    # Create a simple health check script
    cat > /usr/local/bin/agentsflowai-health-check.sh << 'EOF'
#!/bin/bash

# Health check script for AgentsFlowAI
APP_NAME="agentsflowai"
APP_DIR="/var/www/agentsflowai"

# Check if PM2 process is running
if ! sudo -u deploy pm2 list | grep -q "$APP_NAME.*online"; then
    echo "ERROR: PM2 process is not running"
    exit 1
fi

# Check if application is responding
if ! curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "WARNING: Application health check failed"
    exit 1
fi

echo "OK: Application is healthy"
exit 0
EOF
    
    chmod +x /usr/local/bin/agentsflowai-health-check.sh
    
    print_success "Health check script created"
}

# Function to display final instructions
display_instructions() {
    print_success "Server setup completed successfully!"
    echo
    echo "Next steps:"
    echo "1. Add your SSH public key to /home/$DEPLOY_USER/.ssh/authorized_keys"
    echo "2. Copy your application files to $APP_DIR or use the deployment script"
    echo "3. Set up SSL certificates: ./scripts/setup-ssl.sh your-domain.com admin@your-domain.com"
    echo "4. Deploy your application: ./scripts/deploy.sh"
    echo
    echo "Important directories:"
    echo "- Application: $APP_DIR"
    echo "- Logs: $APP_DIR/logs"
    echo "- Nginx config: /etc/nginx/sites-available/agentsflowai"
    echo "- PM2 config: $APP_DIR/ecosystem.config.js"
    echo
    echo "Useful commands:"
    echo "- Check application status: sudo -u $DEPLOY_USER pm2 status"
    echo "- View logs: sudo -u $DEPLOY_USER pm2 logs"
    echo "- Restart application: sudo -u $DEPLOY_USER pm2 restart $APP_NAME"
    echo "- Nginx status: systemctl status nginx"
    echo "- Health check: /usr/local/bin/agentsflowai-health-check.sh"
}

# Main execution function
main() {
    print_status "Starting server setup for AgentsFlowAI..."
    
    check_root
    update_system
    create_deploy_user
    install_nodejs
    install_nginx
    install_database
    install_redis
    setup_app_directory
    configure_logrotate
    setup_monitoring
    configure_system_limits
    setup_health_check
    display_instructions
    
    print_success "Server setup completed!"
}

# Execute main function
main "$@"
