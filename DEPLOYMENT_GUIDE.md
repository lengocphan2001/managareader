# TruyenDex Deployment Guide

This guide will help you deploy TruyenDex to a VPS with the domain ninetails.site.

## Prerequisites

- A VPS with Ubuntu 20.04+ or Debian 11+
- Domain name (ninetails.site) pointing to your VPS IP
- SSH access to your VPS
- Basic knowledge of Linux commands

## Step-by-Step Deployment

### 1. Prepare Your VPS

Connect to your VPS via SSH:

```bash
ssh root@your-vps-ip
```

### 2. Create a Non-Root User (Recommended)

```bash
# Create a new user
adduser truyendex
usermod -aG sudo truyendex

# Switch to the new user
su - truyendex
```

### 3. Upload Your Code

Upload your project files to the VPS. You can use one of these methods:

**Option A: Git Clone (Recommended)**

```bash
# Install git if not already installed
sudo apt update && sudo apt install git -y

# Clone your repository
git clone <your-repository-url> /var/www/truyendex
cd /var/www/truyendex
```

**Option B: SCP Upload**

```bash
# From your local machine
scp -r /path/to/truyendex truyendex@your-vps-ip:/var/www/
```

### 4. Configure Domain DNS

Point your domain ninetails.site to your VPS IP address:

- Create an A record: `ninetails.site` → `your-vps-ip`
- Create a CNAME record: `www.ninetails.site` → `ninetails.site`

### 5. Run the Deployment Scripts

Make the scripts executable and run them:

```bash
cd /var/www/truyendex
chmod +x deploy.sh deploy-app.sh

# Run the system setup script
./deploy.sh

# Log out and log back in to apply Docker group changes
exit
ssh truyendex@your-vps-ip

# Run the application deployment script
cd /var/www/truyendex
./deploy-app.sh
```

### 6. Configure Environment Variables

Before running the deployment, create your production environment file:

```bash
cp env.production.example .env.production
nano .env.production
```

Fill in the required values:

```bash
# Database
POSTGRES_PASSWORD=your-super-secure-postgres-password

# JWT
JWT_SECRET=your-super-secret-jwt-key-for-production

# Email Configuration (Required for user registration)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Turnstile (Cloudflare) - Required for captcha
TURNSTILE_SECRET_KEY=your-turnstile-secret-key
TURNSTILE_SITE_KEY=your-turnstile-site-key
```

### 7. Get Required API Keys

#### Turnstile (Cloudflare Captcha)

1. Go to [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
2. Create a new site
3. Add your domain: `ninetails.site`
4. Copy the Site Key and Secret Key

#### Email Service (Gmail Example)

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password
3. Use your Gmail address and the app password

### 8. Deploy the Application

```bash
cd /var/www/truyendex
./deploy-app.sh
```

### 9. Verify Deployment

1. Check if all services are running:

```bash
docker-compose -f docker-compose.prod.yml ps
```

2. Check logs if there are issues:

```bash
docker-compose -f docker-compose.prod.yml logs -f
```

3. Visit your site: https://ninetails.site

## Post-Deployment Tasks

### 1. Set Up Monitoring

Monitor your application with:

```bash
# View real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Check system resources
htop
df -h
```

### 2. Backup Database

Set up automated database backups:

```bash
# Create backup script
sudo nano /usr/local/bin/backup-truyendex.sh
```

Add this content:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/truyendex"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker-compose -f /var/www/truyendex/docker-compose.prod.yml exec -T postgres pg_dump -U truyendex truyendex > $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days of backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

Make it executable:

```bash
sudo chmod +x /usr/local/bin/backup-truyendex.sh
```

Add to crontab for daily backups:

```bash
crontab -e
# Add this line:
0 2 * * * /usr/local/bin/backup-truyendex.sh
```

### 3. Update Application

To update your application:

```bash
cd /var/www/truyendex
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Common Issues

1. **SSL Certificate Issues**

   ```bash
   sudo certbot renew --dry-run
   ```

2. **Database Connection Issues**

   ```bash
   docker-compose -f docker-compose.prod.yml logs postgres
   ```

3. **Frontend Not Loading**

   ```bash
   docker-compose -f docker-compose.prod.yml logs frontend
   ```

4. **Backend API Issues**
   ```bash
   docker-compose -f docker-compose.prod.yml logs backend
   ```

### Useful Commands

```bash
# Restart all services
docker-compose -f docker-compose.prod.yml restart

# View service status
docker-compose -f docker-compose.prod.yml ps

# Access database
docker-compose -f docker-compose.prod.yml exec postgres psql -U truyendex -d truyendex

# View Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Security Considerations

1. **Firewall**: The deployment script configures UFW with basic rules
2. **SSL**: Automatic SSL certificate setup with Let's Encrypt
3. **Database**: PostgreSQL with password protection
4. **Environment Variables**: Sensitive data stored in environment files
5. **Updates**: Regular system and application updates recommended

## Performance Optimization

1. **Nginx Caching**: Static files are cached for better performance
2. **Gzip Compression**: Enabled for text-based files
3. **Docker**: Containerized services for better resource management
4. **Database**: PostgreSQL for better performance than SQLite

## Support

If you encounter issues:

1. Check the logs first
2. Verify all environment variables are set correctly
3. Ensure your domain DNS is properly configured
4. Check firewall settings

For additional help, check the application logs and system resources.
