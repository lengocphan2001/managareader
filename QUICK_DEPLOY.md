# Quick Deployment Guide for ninetails.site

## 🚀 One-Command Deployment

Follow these steps to deploy your TruyenDex site to ninetails.site:

### 1. Prepare Your VPS

- Get a VPS with Ubuntu 20.04+ (recommended: 2GB RAM, 2 CPU cores)
- Point your domain `ninetails.site` to your VPS IP address
- SSH into your VPS: `ssh root@your-vps-ip`

### 2. Upload Your Code

```bash
# Clone your repository
git clone <your-repo-url> /var/www/truyendex
cd /var/www/truyendex
```

### 3. Configure Environment

```bash
# Copy and edit the environment file
cp env.production.example .env.production
nano .env.production
```

**Required values to fill in:**

- `POSTGRES_PASSWORD`: A strong password for your database
- `JWT_SECRET`: A random secret key for JWT tokens
- `SMTP_USER` & `SMTP_PASS`: Email credentials for user registration
- `TURNSTILE_SECRET_KEY` & `TURNSTILE_SITE_KEY`: Cloudflare Turnstile keys

### 4. Deploy Everything

```bash
# Make scripts executable and run deployment
chmod +x deploy.sh deploy-app.sh
./deploy.sh

# Log out and back in (to apply Docker group changes)
exit
ssh root@your-vps-ip
cd /var/www/truyendex

# Deploy the application
./deploy-app.sh
```

### 5. Get API Keys

#### Cloudflare Turnstile (Required)

1. Go to [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)
2. Create a new site
3. Add domain: `ninetails.site`
4. Copy Site Key and Secret Key to your `.env.production`

#### Gmail App Password (For Email)

1. Enable 2FA on your Gmail account
2. Generate an App Password
3. Use your Gmail and the app password in `.env.production`

### 6. Verify Deployment

- Visit: https://ninetails.site
- Check logs: `docker-compose -f docker-compose.prod.yml logs -f`

## 🔧 What Gets Installed

- **Node.js 20**: Latest LTS version
- **Docker & Docker Compose**: For containerized deployment
- **Nginx**: Reverse proxy and static file serving
- **PostgreSQL**: Production database
- **Redis**: Session storage
- **SSL Certificate**: Automatic Let's Encrypt setup
- **Firewall**: UFW with proper rules

## 📊 Architecture

```
Internet → Nginx (Port 443/80) → Frontend (Port 3000) → Backend (Port 8000) → PostgreSQL (Port 5432)
                                                      ↘ Redis (Port 6379)
```

## 🛠️ Management Commands

```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart services
docker-compose -f docker-compose.prod.yml restart

# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## 🔒 Security Features

- ✅ SSL/TLS encryption (Let's Encrypt)
- ✅ Firewall configuration (UFW)
- ✅ Rate limiting
- ✅ Security headers
- ✅ Database password protection
- ✅ Environment variable protection

## 📈 Performance Features

- ✅ Nginx caching for static files
- ✅ Gzip compression
- ✅ Docker containerization
- ✅ PostgreSQL for better performance
- ✅ Redis for session management

## 🆘 Troubleshooting

**Site not loading?**

```bash
docker-compose -f docker-compose.prod.yml logs frontend
```

**API not working?**

```bash
docker-compose -f docker-compose.prod.yml logs backend
```

**Database issues?**

```bash
docker-compose -f docker-compose.prod.yml logs postgres
```

**SSL problems?**

```bash
sudo certbot renew --dry-run
```

## 📝 Post-Deployment Checklist

- [ ] Site loads at https://ninetails.site
- [ ] User registration works
- [ ] Email verification works
- [ ] Database is accessible
- [ ] SSL certificate is valid
- [ ] All services are running
- [ ] Logs are being generated
- [ ] Backup script is set up

## 🎯 Next Steps

1. **Set up monitoring**: Consider using tools like UptimeRobot
2. **Configure backups**: Database backups are already set up
3. **Set up CDN**: Consider Cloudflare for better performance
4. **Monitor resources**: Use `htop` and `df -h` regularly

Your TruyenDex site should now be live at https://ninetails.site! 🎉
