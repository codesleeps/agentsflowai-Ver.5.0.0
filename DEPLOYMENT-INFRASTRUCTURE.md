# AgentsFlowAI Production Infrastructure

This document provides a comprehensive guide for deploying and managing AgentsFlowAI in a production environment.

## Overview

The production infrastructure includes:

- **PM2 Process Manager**: Cluster mode with 4 instances for 4 vCPU cores
- **Nginx Reverse Proxy**: SSL termination, gzip compression, rate limiting, security headers
- **Let's Encrypt SSL**: Automated certificate management with Certbot
- **Monitoring & Alerting**: Comprehensive health checks and notifications
- **Log Rotation**: Automated log management and retention
- **Deployment Automation**: Scripts for zero-d deployments and rollbacks

## Quick Start

### 1. Server Setup

Run the server setup script on a fresh Ubuntu/Debian server:

```bash
# Download and run the setup script
sudo bash scripts/setup-server.sh
```

This script will:

- Update system packages
- Create a `deploy` user with SSH access
- Install Node.js 24.x, PM2, Nginx
- Optionally install PostgreSQL and Redis
- Configure system limits and security settings
- Set up directories and permissions

### 2. SSL Certificate Setup

Set up SSL certificates using Let's Encrypt:

```bash
# Replace your-domain.com with your actual domain
sudo bash scripts/setup-ssl.sh your-domain.com admin@your-domain.com
```

### 3. Application Deployment

Deploy your application:

```bash
# Deploy the application
sudo bash scripts/deploy.sh

# Or run with specific command
sudo bash scripts/deploy.sh deploy    # Default: deploy application
sudo bash scripts/deploy.sh rollback  # Rollback to previous version
sudo bash scripts/deploy.sh status    # Show application status
sudo bash scripts/deploy.sh logs      # View application logs
sudo bash scripts/deploy.sh restart   # Restart application
```

### 4. Monitoring

Set up monitoring and alerts:

```bash
# Run comprehensive health check
sudo bash scripts/monitor.sh

# Check specific components
sudo bash scripts/monitor.sh app       # Application health
sudo bash scripts/monitor.sh system    # System resources
sudo bash scripts/monitor.sh nginx     # Nginx status
sudo bash scripts/monitor.sh ssl       # SSL certificates
sudo bash scripts/monitor.sh report    # Generate report
```

## Configuration Files

### `ecosystem.config.js`

PM2 configuration with:

- 4 cluster instances for 4 vCPU cores
- Auto-restart on crashes
- Memory limits and monitoring
- Log management
- Environment-specific settings

### `nginx.conf`

Nginx reverse proxy configuration with:

- HTTP to HTTPS redirection
- SSL/TLS optimization
- Gzip compression
- Static file caching
- Security headers
- Rate limiting (10 req/s for API, 5 req/min for auth)
- Health check endpoint

### Log Rotation

Automatic log rotation configured for:

- Application logs (30-day retention)
- Nginx access and error logs
- PM2 process logs
- Compression and delayed compression

## Directory Structure

```
/var/www/agentsflowai/
├── ecosystem.config.js          # PM2 configuration
├── nginx.conf                   # Nginx configuration
├── .env.production              # Production environment variables
├── logs/                        # Application logs
│   ├── combined.log
│   ├── out.log
│   └── error.log
├── .next/                       # Next.js build output
└── current/                     # Current deployment symlink

/etc/nginx/sites-available/
└── agentsflowai                 # Nginx site configuration

/etc/letsencrypt/live/
└── your-domain.com/             # SSL certificates

/var/backups/agentsflowai/        # Deployment backups
```

## Security Features

### SSL/TLS Configuration

- TLS 1.2 and 1.3 support
- Strong cipher suites
- HSTS with preload
- OCSP stapling

### Security Headers

- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy: restrictive policy

### Rate Limiting

- API endpoints: 10 requests/second
- Authentication endpoints: 5 requests/minute
- Burst protection

### Firewall Rules

- SSH (port 22)
- HTTP (port 80)
- HTTPS (port 443)

## Performance Optimizations

### Nginx Optimizations

- Gzip compression (level 6)
- Static file caching (1 year)
- Keep-alive connections
- Buffer optimization

### Application Optimizations

- PM2 cluster mode (4 instances)
- Memory limits (1GB per instance)
- Graceful restarts
- Health checks

### System Optimizations

- Increased file descriptor limits
- TCP tuning parameters
- Swap configuration

## Monitoring & Alerting

### Health Checks

- Application health endpoint
- PM2 process monitoring
- System resource monitoring
- Nginx status checks
- SSL certificate expiry monitoring

### Alerting Options

- Email notifications
- Discord webhooks
- Slack webhooks

### Metrics Tracked

- CPU usage (>80% alerts)
- Memory usage (>80% alerts)
- Disk usage (>80% alerts)
- Response time (>5s alerts)
- Error rates
- Process restarts

## Deployment Workflow

### Standard Deployment

1. Backup current deployment
2. Pull latest code
3. Install dependencies
4. Build application
5. Run database migrations
6. Reload PM2 processes
7. Verify deployment

### Zero-Downtime Deployment

- PM2 graceful reload
- Rolling restarts across cluster instances
- Health checks before traffic routing

### Rollback Process

1. Stop current processes
2. Restore from backup
3. Restart application
4. Verify rollback

## Environment Variables

Create `.env.production` with:

```bash
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/agentsflowai

# Next.js
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# External services
REDIS_URL=redis://localhost:6379
```

## Maintenance Tasks

### Daily

- Log rotation (automatic)
- SSL certificate renewal check

### Weekly

- System updates
- Backup verification
- Performance monitoring

### Monthly

- Security updates
- SSL certificate renewal (automatic)
- Log cleanup

## Troubleshooting

### Common Issues

**PM2 Processes Not Starting**

```bash
# Check PM2 status
sudo -u deploy pm2 status

# View logs
sudo -u deploy pm2 logs

# Restart processes
sudo -u deploy pm2 restart ecosystem.config.js
```

**Nginx Configuration Errors**

```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

**SSL Certificate Issues**

```bash
# Check certificate expiry
sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/your-domain.com/fullchain.pem

# Test renewal
sudo certbot renew --dry-run

# Force renewal
sudo certbot renew --force-renewal
```

### Performance Issues

**High CPU Usage**

```bash
# Check process usage
sudo top
sudo htop

# Monitor PM2 processes
sudo -u deploy pm2 monit
```

**High Memory Usage**

```bash
# Check memory usage
free -h
ps aux --sort=-%mem | head

# Restart PM2 if needed
sudo -u deploy pm2 restart ecosystem.config.js
```

## Backup Strategy

### Application Backups

- Automatic backup before each deployment
- Retain last 10 backups
- Stored in `/var/backups/agentsflowai/`

### Database Backups

- Configure PostgreSQL automated backups
- Daily backups with 30-day retention
- Point-in-time recovery capability

### SSL Certificate Backups

- Certificates managed by Let's Encrypt
- Automatic renewal and backup

## Scaling Considerations

### Horizontal Scaling

- Add more PM2 instances
- Load balancer configuration
- Database read replicas

### Vertical Scaling

- Increase server resources
- Adjust PM2 instance count
- Optimize memory limits

### Database Scaling

- Connection pooling
- Query optimization
- Index optimization

## Security Best Practices

### Regular Updates

- System packages
- Node.js dependencies
- SSL certificates

### Access Control

- SSH key authentication
- Limited sudo access
- Regular user audits

### Monitoring

- Security log monitoring
- Intrusion detection
- Vulnerability scanning

## Support

For issues with the deployment infrastructure:

1. Check the logs in `/var/www/agentsflowai/logs/`
2. Run the monitoring script: `sudo bash scripts/monitor.sh`
3. Review Nginx logs: `/var/log/nginx/`
4. Check PM2 status: `sudo -u deploy pm2 status`

## Contributing

When modifying the deployment infrastructure:

1. Test changes in a staging environment
2. Update documentation
3. Verify all scripts are executable
4. Test rollback procedures
