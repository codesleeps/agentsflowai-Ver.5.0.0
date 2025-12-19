# Deployment Guide - AgentsFlowAI

> Quick Start Commands (for experienced developers)
>
> ```bash
> git clone <repo-url> /var/www/agentsflowai
> cd /var/www/agentsflowai
> cp .env.production.example .env
> nano .env  # Configure all variables
> npm install
> npm run build
> pm2 start ecosystem.config.js
> pm2 save
> sudo certbot --nginx -d yourdomain.com
> ```
>
> ⚠️ **Warning**: Read the full documentation for first-time deployment to understand all requirements and potential issues.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [VPS Initial Setup](#vps-initial-setup)
3. [Ollama Installation](#ollama-installation)
4. [Domain Configuration](#domain-configuration)
5. [SSL Certificate Setup](#ssl-certificate-setup)
6. [Application Deployment](#application-deployment)
7. [Environment Variables Configuration](#environment-variables-configuration)
8. [PM2 Process Management](#pm2-process-management)
9. [Nginx Configuration](#nginx-configuration)
10. [Database Migration](#database-migration)
11. [Verification & Testing](#verification--testing)
12. [Troubleshooting](#troubleshooting)
13. [Maintenance & Updates](#maintenance--updates)
14. [Security Best Practices](#security-best-practices)
15. [Rollback Procedure](#rollback-procedure)
16. [Environment Variables Reference](#environment-variables-reference)

## Prerequisites

### VPS Specifications

- **Provider**: Hostinger VPS
- **Specifications**: 4 vCPU, 16GB RAM, 200GB NVMe SSD, 16TB bandwidth
- **Operating System**: Ubuntu 20.04 LTS or later

### Required Accounts

- **Neon**: PostgreSQL database (https://console.neon.tech/)
- **Inngest**: Background job processing (https://app.inngest.com/)
- **OpenAI**: AI API fallback (https://platform.openai.com/)
- **Sentry**: Error tracking (https://sentry.io/)
- **Domain Registrar**: For domain management

### Required Software

- Node.js 24.x
- npm (comes with Node.js)
- Git
- PM2 (Process Manager)
- Nginx (Web Server)
- Certbot (SSL Certificates)

## VPS Initial Setup

### SSH Access

Connect to your Hostinger VPS via SSH:

```bash
ssh root@your-vps-ip-address
```

### System Updates

Update the system packages:

```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 24.x

Install Node.js using NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Verify Node.js installation:

```bash
node --version  # Should show v24.x.x
npm --version   # Should show compatible npm version
```

### Install PM2

Install PM2 globally for process management:

```bash
npm install -g pm2
```

### Install Nginx

Install Nginx web server:

```bash
sudo apt install nginx -y
```

### Install Certbot for SSL

Install Certbot and Nginx plugin:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Configure Firewall

Configure UFW firewall to allow essential ports:

```bash
sudo ufw allow 22,80,443/tcp
sudo ufw enable
```

## Ollama Installation

### Install Ollama

Download and install Ollama on the VPS:

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Start Ollama Service

Enable and start Ollama as a system service:

```bash
sudo systemctl enable ollama
sudo systemctl start ollama
```

### Pull AI Models

Pull required AI models (example with Mistral):

```bash
ollama pull mistral
```

You can pull additional models as needed:

```bash
ollama pull llama2
ollama pull codellama
```

### Verify Ollama Installation

Test Ollama API endpoint:

```bash
curl http://localhost:11434/api/tags
```

Expected response should show available models.

### Configure Ollama for Auto-start

Ensure Ollama starts on boot:

```bash
sudo systemctl status ollama  # Should show "active (running)"
```

## Domain Configuration

### Point Domain to VPS

1. Go to your domain registrar's DNS settings
2. Create an A record pointing your domain to the VPS IP address
3. Optionally create a www subdomain A record pointing to the same IP

Example DNS records:

```
Type: A    Name: @         Value: your-vps-ip    TTL: 3600
Type: A    Name: www       Value: your-vps-ip    TTL: 3600
```

### DNS Propagation

Wait for DNS propagation (can take up to 48 hours). Verify with:

```bash
dig yourdomain.com
# or
nslookup yourdomain.com
```

## SSL Certificate Setup

### Obtain SSL Certificate

Run Certbot to obtain and configure SSL certificates:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the interactive prompts:

1. Enter email address for renewal notices
2. Agree to terms of service
3. Choose whether to share email with EFF
4. Select whether to redirect HTTP to HTTPS (recommended: choose redirect)

### Verify Auto-renewal

Test certificate renewal process:

```bash
sudo certbot renew --dry-run
```

### Certificate Location

SSL certificates are stored at:

- Certificate: `/etc/letsencrypt/live/yourdomain.com/fullchain.pem`
- Private Key: `/etc/letsencrypt/live/yourdomain.com/privkey.pem`

## Application Deployment

### Clone Repository

Clone the application to the web directory:

```bash
git clone <your-repository-url> /var/www/agentsflowai
cd /var/www/agentsflowai
```

### Set Up Environment File

Copy production template and configure:

```bash
cp .env.production.example .env
nano .env
```

Configure all required environment variables (see [Environment Variables Configuration](#environment-variables-configuration)).

### Install Dependencies

Install Node.js dependencies:

```bash
npm install
```

### Build Application

Build the production version:

```bash
npm run build
```

### Test Local Build

Test the application locally on the VPS:

```bash
npm start
```

Test by accessing `http://your-vps-ip:3000` in your browser. Press `Ctrl+C` to stop.

## Environment Variables Configuration

### Database Configuration

**DATABASE_URL**:

- Login to Neon console → Select your project → Connection Details
- Copy the connection string with pooling enabled
- Format: `postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require&pool=true`

### Authentication & Security

**VYBE_SERVER_SECRET**:

- Generate a strong random string: `openssl rand -base64 32`
- Use this exact value in your production `.env` file

### Inngest Configuration

**INNGEST_APP_ID**:

- Go to Inngest dashboard → Your app → Settings → App ID
- Copy the App ID

**INNGEST_EVENT_KEY**:

- Inngest dashboard → Event keys → Create new key
- Copy the generated key

**INNGEST_SIGNING_KEY**:

- Inngest dashboard → Signing keys → Copy production signing key
- Required for webhook verification in production

### AI Integration

**OLLAMA_BASE_URL**:

- Use `http://localhost:11434` for local VPS installation
- Verify Ollama is running: `curl http://localhost:11434/api/tags`

**OPENAI_API_KEY**:

- Go to https://platform.openai.com/api-keys
- Create new secret key
- Copy the key (starts with `sk-`)

### Monitoring

**SENTRY_DSN**:

- Sentry project → Settings → Client Keys (DSN)
- Copy the DSN URL

### Application Configuration

Configure the remaining variables based on your production requirements:

- `NEXT_PUBLIC_APP_NAME`: Your production application name
- `NEXT_PUBLIC_VYBE_INTEGRATIONS_DOMAIN`: Your production domain
- `NODE_ENV`: Set to `production`

## PM2 Process Management

### PM2 Configuration File

Reference the `ecosystem.config.js` file (to be created in next phase) for process configuration.

### Start Application with PM2

```bash
pm2 start ecosystem.config.js
```

### Save PM2 Configuration

```bash
pm2 save
```

### Setup PM2 Startup Script

Generate and install PM2 startup script:

```bash
pm2 startup
```

Follow the instructions provided by PM2 (usually involves running a command with sudo).

### PM2 Management Commands

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart all

# Stop application
pm2 stop all

# Delete application from PM2
pm2 delete all

# List all processes
pm2 status
```

## Nginx Configuration

### Copy Nginx Configuration

Reference the `nginx.conf` file (to be created in next phase):

```bash
sudo cp nginx.conf /etc/nginx/sites-available/agentsflowai
```

### Enable Site

Create symbolic link to enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/agentsflowai /etc/nginx/sites-enabled/
```

### Test Nginx Configuration

```bash
sudo nginx -t
```

### Reload Nginx

```bash
sudo systemctl reload nginx
```

### Restart Nginx

```bash
sudo systemctl restart nginx
```

## Database Migration

### Run Database Migrations

If using Prisma or similar ORM:

```bash
npm run db:migrate
```

### Verify Database Connection

Test API endpoints that require database access to ensure connectivity.

## Verification & Testing

### Check Application Status

```bash
pm2 status
```

### Test Domain Access

Open your browser and navigate to `https://yourdomain.com`

### Verify SSL Certificate

Check for the padlock icon in your browser's address bar.

### Test API Endpoints

Test the health endpoint (to be created in later phase):

```bash
curl https://yourdomain.com/api/health
```

### Test Ollama Connectivity

```bash
curl https://yourdomain.com/api/ai/ollama
```

### Monitor Logs

```bash
pm2 logs --lines 100
```

## Troubleshooting

### Port 3000 Already in Use

```bash
sudo lsof -i :3000
# Kill the process using the PID
sudo kill -9 <PID>
```

### Nginx 502 Bad Gateway

- Check if PM2 process is running: `pm2 status`
- Check PM2 logs: `pm2 logs`
- Verify application is listening on port 3000: `netstat -tlnp | grep :3000`

### SSL Certificate Errors

- Verify domain DNS: `dig yourdomain.com`
- Check Certbot configuration: `sudo certbot certificates`
- Re-run Certbot if needed: `sudo certbot --nginx -d yourdomain.com`

### Database Connection Errors

- Verify DATABASE_URL format
- Check Neon IP whitelist settings
- Test connection: `psql "your-database-url"`

### Ollama Not Responding

```bash
# Check Ollama service status
sudo systemctl status ollama

# Restart Ollama if needed
sudo systemctl restart ollama

# Check logs
sudo journalctl -u ollama
```

### Permission Issues

```bash
# Fix file ownership
sudo chown -R www-data:www-data /var/www/agentsflowai

# Fix file permissions
sudo chmod -R 755 /var/www/agentsflowai
```

## Maintenance & Updates

### Update Application

```bash
cd /var/www/agentsflowai
git pull
npm install
npm run build
pm2 restart all
```

### Update SSL Certificates

Certbot automatically renews certificates. Verify renewal is working:

```bash
sudo certbot renew --dry-run
```

### Monitor System Resources

```bash
# Check disk space
df -h

# Check memory usage
free -h

# Monitor running processes
htop

# Check system load
uptime
```

### Backup Database

Neon provides automatic backups. Verify in Neon console:

- Point-in-time recovery settings
- Backup retention period
- Export backup if needed

### Security Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update npm dependencies
npm audit
npm audit fix
```

## Security Best Practices

### Environment Security

- Never commit `.env` file to version control
- Use strong, unique secrets for all keys
- Regularly rotate API keys and secrets
- Use environment-specific secret management services

### Application Security

- Keep Node.js and dependencies updated
- Run regular security audits: `npm audit`
- Monitor Sentry for security issues and errors
- Implement proper rate limiting (to be added in security phase)

### Server Security

- Use SSH key-based authentication only
- Disable password authentication in SSH
- Configure fail2ban for SSH protection
- Regular security updates and patches

### Network Security

- Use HTTPS for all external service integrations
- Configure firewall properly
- Implement proper IP whitelisting for database access
- Use VPN for administrative access when possible

## Rollback Procedure

### Create Backup Before Deployment

```bash
git tag backup-$(date +%Y%m%d-%H%M%S)
```

### Rollback Application

```bash
git checkout <previous-tag>
npm install
npm run build
pm2 restart all
```

### Database Rollback

Use Neon's point-in-time recovery:

1. Go to Neon console
2. Select your database
3. Choose point-in-time recovery
4. Select the timestamp to rollback to
5. Follow the recovery instructions

### Verify Rollback

Test the application thoroughly after rollback to ensure functionality.

## Environment Variables Reference

| Variable                             | Required        | Default                | Description                       | Where to Obtain             |
| ------------------------------------ | --------------- | ---------------------- | --------------------------------- | --------------------------- |
| DATABASE_URL                         | Yes             | -                      | Neon PostgreSQL connection string | Neon Console                |
| VYBE_SERVER_SECRET                   | Yes             | -                      | Server authentication secret      | Generate with openssl       |
| INNGEST_APP_ID                       | Yes             | -                      | Inngest application ID            | Inngest Dashboard           |
| INNGEST_EVENT_KEY                    | Yes             | local                  | Inngest event key                 | Inngest Dashboard           |
| INNGEST_SIGNING_KEY                  | Production only | -                      | Webhook signing key               | Inngest Dashboard           |
| OLLAMA_BASE_URL                      | No              | http://localhost:11434 | Ollama API endpoint               | VPS local installation      |
| OPENAI_API_KEY                       | No              | -                      | OpenAI API key for fallback       | OpenAI Platform             |
| SENTRY_DSN                           | Recommended     | -                      | Sentry error tracking DSN         | Sentry Project Settings     |
| NODE_ENV                             | Yes             | development            | Environment mode                  | Set to "production"         |
| NEXT_PUBLIC_APP_NAME                 | No              | AgentsFlowAI           | Application display name          | Custom value                |
| NEXT_PUBLIC_VYBE_INTEGRATIONS_DOMAIN | No              | https://vybe.build     | Vybe integrations domain          | Production domain           |
| NEXT_PUBLIC_SHOW_LIVE_DATA           | No              | false                  | Use live data in development      | Set to "true" in production |

### Development-Only Variables

The following variables should NEVER be set in production environments:

- `NEXT_PUBLIC_DEV_USER_NAME`
- `NEXT_PUBLIC_DEV_USER_EMAIL`
- `NEXT_PUBLIC_DEV_USER_IMAGE`

These variables bypass authentication and are only intended for development convenience.

## Visual Architecture

```mermaid
graph TD
    A[VPS Server - Hostinger] --> B[Nginx Reverse Proxy]
    B --> C[Next.js App on PM2]
    C --> D[Neon PostgreSQL]
    C --> E[Ollama Local]
    C --> F[OpenAI API]
    C --> G[Inngest]
    C --> H[Sentry]
    I[Domain + SSL] --> B

    style A fill:#e1f5ff
    style C fill:#fff4e1
    style D fill:#e8f5e9
    style E fill:#f3e5f5
    style F fill:#f3e5f5
```

## Additional Notes

### Performance Optimization

- Enable gzip compression in Nginx
- Configure proper caching headers
- Use CDN for static assets if needed
- Monitor application performance regularly

### Monitoring and Alerting

- Set up Sentry error monitoring
- Configure uptime monitoring
- Monitor system resources and alerts
- Set up log aggregation for better debugging

### Scaling Considerations

- Monitor VPS resource usage
- Consider load balancing for high traffic
- Implement database connection pooling
- Plan for horizontal scaling when needed
