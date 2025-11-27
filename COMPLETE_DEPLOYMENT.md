# WowManga Deployment Guide (PM2 + Nginx)

This guide will help you deploy WowManga to your VPS at `/var/www/wowmanga.uk` using PM2 for process management and Nginx as a reverse proxy.

**Note:** This configuration uses different ports (3001 for frontend, 8001 for backend) to avoid conflicts with existing `nettruyen-vn.com` deployment (port 3000).

## Prerequisites

- Ubuntu/Debian VPS with root access
- Domain `wowmanga.uk` pointing to your VPS IP
- At least 2GB RAM and 20GB storage
- Basic knowledge of Linux commands

## Table of Contents

1. [Server Setup](#1-server-setup)
2. [Install Dependencies](#2-install-dependencies)
3. [Database Setup](#3-database-setup)
4. [Application Deployment](#4-application-deployment)
5. [Environment Configuration](#5-environment-configuration)
6. [Build and Start Applications](#6-build-and-start-applications)
7. [Nginx Configuration](#7-nginx-configuration)
8. [SSL Certificate Setup](#8-ssl-certificate-setup)
9. [CORS Configuration](#9-cors-configuration)
10. [Testing and Verification](#10-testing-and-verification)
11. [Monitoring and Maintenance](#11-monitoring-and-maintenance)

---

## 1. Server Setup

### 1.1 Update System

```bash
# Update package list
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git unzip software-properties-common
```

### 1.2 Create Application Directory

```bash
# Create main application directory
mkdir -p /var/www/wowmanga.uk
cd /var/www/wowmanga.uk

# Set proper permissions
chown -R www-data:www-data /var/www/wowmanga.uk
chmod -R 755 /var/www/wowmanga.uk
```

---

## 2. Install Dependencies

### 2.1 Install Node.js 20

```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

# Install Node.js
apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2.2 Install PM2

```bash
# Install PM2 globally
npm install -g pm2

# Setup PM2 startup script
pm2 startup

# Follow the instructions provided by the command above
```

### 2.3 Install Nginx

```bash
# Install Nginx
apt install -y nginx

# Start and enable Nginx
systemctl start nginx
systemctl enable nginx

# Check status
systemctl status nginx
```

### 2.4 Install PostgreSQL

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Check status
systemctl status postgresql
```

### 2.5 Install Redis (Optional)

```bash
# Install Redis
apt install -y redis-server

# Start and enable Redis
systemctl start redis-server
systemctl enable redis-server

# Check status
systemctl status redis-server
```

---

## 3. Database Setup

### 3.1 Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE mangareader;
CREATE USER mangareader_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE mangareader TO mangareader_user;
ALTER USER mangareader_user CREATEDB;

# Exit PostgreSQL
\q
```

### 3.2 Test Database Connection

```bash
# Test connection
sudo -u postgres psql -d mangareader -c "SELECT version();"
```

---

## 4. Application Deployment

### 4.1 Clone/Upload Your Application

```bash
# If using Git (replace with your repository URL)
cd /var/www/wowmanga.uk
git clone https://github.com/yourusername/managareader.git .

# Or upload your files using SCP/SFTP to /var/www/wowmanga.uk
```

### 4.2 Install Frontend Dependencies

```bash
# Navigate to frontend directory
cd /var/www/wowmanga.uk

# Install dependencies
npm install

# Set proper permissions for node_modules
chmod -R +x node_modules/.bin
chown -R www-data:www-data node_modules
```

### 4.3 Install Backend Dependencies

```bash
# Navigate to backend directory
cd /var/www/wowmanga.uk/backend

# Install dependencies
npm install

# Set proper permissions for node_modules and Prisma
chmod -R +x node_modules/.bin
chmod +x node_modules/.bin/prisma
chown -R www-data:www-data node_modules
chown -R www-data:www-data node_modules/.bin
```

---

## 5. Environment Configuration

### 5.1 Frontend Environment Variables

```bash
# Create frontend environment file
cd /var/www/wowmanga.uk
cat > .env.production << 'EOF'
# Frontend Environment Variables
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://wowmanga.uk
NEXT_PUBLIC_BACKEND_URL=https://wowmanga.uk
NEXT_PUBLIC_APP_URL=https://wowmanga.uk
NEXT_PUBLIC_CORS_URL=https://proxy.wowmanga.uk
NEXT_PUBLIC_CORS_V2_URL=https://proxy.wowmanga.uk
NEXT_PUBLIC_GTM_ID="GTM-T8T8T8KF"
NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
# Other frontend variables
NEXT_PUBLIC_APP_NAME=WowManga
NEXT_PUBLIC_APP_VERSION=1.0.0
EOF
```

### 5.2 Backend Environment Variables

```bash
# Create backend environment file
cd /var/www/wowmanga.uk/backend
cat > .env << 'EOF'
# Backend Environment Variables
NODE_ENV=production
PORT=8001

# Database Configuration
DATABASE_URL="postgresql://mangareader_user:password@localhost:5432/mangareader"

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://wowmanga.uk
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Session Configuration
SESSION_SECRET=your_session_secret_here

# Redis Configuration (if using Redis)
REDIS_URL=redis://localhost:6379

# Email Configuration (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/wowmanga.uk/uploads

# Security
BCRYPT_ROUNDS=12
EOF
```

### 5.3 Set Proper Permissions

```bash
# Set permissions for environment files
chmod 600 /var/www/wowmanga.uk/.env.production
chmod 600 /var/www/wowmanga.uk/backend/.env

# Set ownership
chown -R www-data:www-data /var/www/wowmanga.uk
```

---

## 6. Build and Start Applications

### 6.1 Generate Prisma Client

```bash
# Navigate to backend directory
cd /var/www/wowmanga.uk/backend

# Ensure Prisma has execution permissions
chmod +x node_modules/.bin/prisma
chmod -R +x node_modules/.bin

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed database (if you have seed data)
# Note: Make sure package.json has "prisma.seed" configuration
# See Troubleshooting section 6 if you encounter errors
npx prisma db seed
```

### 6.2 Build Frontend

```bash
# Navigate to frontend directory
cd /var/www/wowmanga.uk

# IMPORTANT: Make sure .env.production has the correct values before building
# The build process embeds environment variables, so you must rebuild after changing them
cat .env.production

# Build the application with increased memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Verify build
ls -la .next/

# Note: If you change environment variables after building, you MUST rebuild:
# 1. Update .env.production
# 2. Run: NODE_OPTIONS="--max-old-space-size=4096" npm run build
# 3. Restart PM2: pm2 restart wowmanga-frontend
```

### 6.3 Create PM2 Configuration

```bash
# Create PM2 ecosystem file
cd /var/www/wowmanga.uk
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "wowmanga-backend",
      script: "src/server.js",
      cwd: "/var/www/wowmanga.uk/backend",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 8001,
      },
      error_file: "./logs/backend-error.log",
      out_file: "./logs/backend-out.log",
      log_file: "./logs/backend-combined.log",
      time: true,
      max_memory_restart: "512M",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
    },
    {
      name: "wowmanga-frontend",
      script: "npm",
      args: "start",
      cwd: "/var/www/wowmanga.uk",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "./logs/frontend-error.log",
      out_file: "./logs/frontend-out.log",
      log_file: "./logs/frontend-combined.log",
      time: true,
      max_memory_restart: "1G",
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: "10s",
    },
  ],
};
EOF

# Create logs directory
mkdir -p /var/www/wowmanga.uk/logs
```

### 6.4 Start Applications with PM2

```bash
# Start both applications
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Check status
pm2 status

# View logs
pm2 logs
```

---

## 7. Nginx Configuration

### 7.1 Create Nginx Configuration

```bash
# Create Nginx site configuration
cat > /etc/nginx/sites-available/wowmanga.uk << 'EOF'
# Rate limiting (using unique zone names to avoid conflicts with other sites)
limit_req_zone $binary_remote_addr zone=wowmanga_api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=wowmanga_login:10m rate=5r/m;

# No cache zones needed - always fresh load

# Upstream servers
upstream wowmanga_backend {
    server 127.0.0.1:8001;
}

upstream wowmanga_frontend {
    server 127.0.0.1:3001;
}

# Main server block
server {
    listen 80;
    listen [::]:80;
    server_name wowmanga.uk www.wowmanga.uk;

    # Security headers with proper CSP for Cloudflare Turnstile and Google Tag Manager
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://wowmanga.uk https://www.wowmanga.uk https://api.mangadex.org https://proxy.wowmanga.uk https://api.iconify.design https://challenges.cloudflare.com https://www.googletagmanager.com https://*.wowmanga.uk wss://wowmanga.uk wss://www.wowmanga.uk; style-src 'self' 'unsafe-inline' https: data: https://fonts.googleapis.com; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://challenges.cloudflare.com https://www.googletagmanager.com; img-src 'self' data: https: blob: https://resizer.f-ck.me https://mangadex.org https://www.googletagmanager.com; font-src 'self' data: https: https://fonts.googleapis.com https://fonts.gstatic.com; object-src 'none'; base-uri 'self';" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json
        application/xml
        image/svg+xml;

    # API routes - proxy to backend
    location /api/ {
        limit_req zone=wowmanga_api burst=20 nodelay;

        proxy_pass http://wowmanga_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 75s;
        proxy_send_timeout 75s;
        proxy_read_timeout 75s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://wowmanga_backend/health;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files with caching
    location /_next/static/ {
        proxy_pass http://wowmanga_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache static files
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Manga cover images - NO CACHING (always fresh load)
    location ~* /covers/.*\.(jpg|jpeg|png|gif|webp)$ {
        proxy_pass http://wowmanga_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # NO CACHING - always fresh load
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        add_header X-Cache-Status "DISABLED";
    }

    # External manga cover images (MangaDex, resizer) - NO CACHING
    location ~* ^/.*/covers/.*\.(jpg|jpeg|png|gif|webp)$ {
        proxy_pass http://wowmanga_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # NO CACHING - always fresh load
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        add_header X-Cache-Status "DISABLED";
    }

    # Other images - NO CACHING
    location ~* \.(jpg|jpeg|png|gif|webp)$ {
        proxy_pass http://wowmanga_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Don't cache other images
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        add_header X-Cache-Status "DISABLED";
    }

    # Other static files
    location ~* \.(js|css|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://wowmanga_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Cache static files
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker - no caching
    location /sw.js {
        proxy_pass http://wowmanga_frontend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }

    # Frontend - proxy to Next.js
    location / {
        proxy_pass http://wowmanga_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 75s;
        proxy_send_timeout 75s;
        proxy_read_timeout 75s;
    }
}
EOF
```

### 7.2 Enable Site and Test Configuration

```bash
# Enable the site
ln -s /etc/nginx/sites-available/wowmanga.uk /etc/nginx/sites-enabled/

# Note: Do not remove default site if other sites are using it
# Only remove if you're sure no other sites need it

# Test Nginx configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

---

## 8. SSL Certificate Setup

### 8.1 Install Certbot

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx
```

### 8.2 Obtain SSL Certificate

```bash
# Get SSL certificate
certbot --nginx -d wowmanga.uk -d www.wowmanga.uk --non-interactive --agree-tos --email lengocphan503@gmail.com
certbot --nginx -d proxy.wowmanga.uk --non-interactive --agree-tos --email lengocphan503@gmail.com
# Test automatic renewal
certbot renew --dry-run
```

### 8.3 Setup Auto-renewal

```bash
# Add cron job for auto-renewal
crontab -e

# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 9. CORS Configuration

### 9.1 Backend CORS Setup

```bash
# Navigate to backend directory
cd /var/www/wowmanga.uk/backend

# Check if CORS is already configured in your backend
grep -r "cors" src/ || echo "CORS not found in backend"
```

If CORS is not configured, add it to your backend:

```bash
# Install CORS package if not already installed
npm install cors

# Add CORS configuration to your server.js or main app file
cat >> src/server.js << 'EOF'

// CORS Configuration
const cors = require('cors');

// Enable CORS for all routes
app.use(cors({
  origin: [
    'https://wowmanga.uk',
    'https://www.wowmanga.uk',
    'http://localhost:3001', // For development
    'http://localhost:3002'  // For development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.sendStatus(200);
});

EOF
```

### 9.2 Frontend CORS Configuration

```bash
# Navigate to frontend directory
cd /var/www/wowmanga.uk

# Create or update next.config.js to handle CORS
cat >> next.config.js << 'EOF'

// Add CORS headers for API routes
const nextConfig = {
  // ... existing config ...

  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};

EOF
```

### 9.3 Nginx CORS Headers

```bash
# Update Nginx configuration to add CORS headers
cat >> /etc/nginx/sites-available/wowmanga.uk << 'EOF'

# Add CORS headers for API routes
location /api/ {
    # Add CORS headers
    add_header Access-Control-Allow-Origin "https://wowmanga.uk" always;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization" always;

    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header Access-Control-Allow-Origin "https://wowmanga.uk";
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Origin, X-Requested-With, Content-Type, Accept, Authorization";
        add_header Access-Control-Max-Age 1728000;
        add_header Content-Type "text/plain; charset=utf-8";
        add_header Content-Length 0;
        return 204;
    }

    # ... existing proxy configuration ...
}

EOF
```

### 9.4 Environment Variables for CORS

```bash
# Update backend environment variables
cd /var/www/wowmanga.uk/backend

# Add CORS configuration to .env
cat >> .env << 'EOF'

# CORS Configuration
CORS_ORIGIN=https://wowmanga.uk,https://www.wowmanga.uk
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization,X-Requested-With

EOF
```

### 9.5 Restart Services

```bash
# Restart backend to apply CORS changes
pm2 restart wowmanga-backend

# Rebuild and restart frontend
cd /var/www/wowmanga.uk
npm run build
pm2 restart wowmanga-frontend

# Test and reload Nginx
nginx -t
systemctl reload nginx
```

---

## 10. Testing and Verification

### 10.1 Test Backend API

```bash
# Test backend health
curl -I http://localhost:8001/health

# Test backend API
curl -I http://localhost:8001/api/health
```

### 10.2 Test Frontend

```bash
# Test frontend
curl -I http://localhost:3001

# Test through Nginx
curl -I https://wowmanga.uk
```

### 10.3 Test CORS Configuration

```bash
# Test CORS headers
curl -H "Origin: https://wowmanga.uk" -H "Access-Control-Request-Method: GET" -H "Access-Control-Request-Headers: X-Requested-With" -X OPTIONS https://wowmanga.uk/api/health

# Test API with CORS
curl -H "Origin: https://wowmanga.uk" https://wowmanga.uk/api/health
```

### 10.4 Test Full Application

```bash
# Test main site
curl -I https://wowmanga.uk

# Test API endpoints
curl -I https://wowmanga.uk/api/health
```

---

## 11. Monitoring and Maintenance

### 11.1 PM2 Monitoring

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs

# Monitor resources
pm2 monit

# Restart applications
pm2 restart all

# Stop applications
pm2 stop all

# Delete applications
pm2 delete all
```

### 11.2 System Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check Nginx status
systemctl status nginx

# Check PostgreSQL status
systemctl status postgresql

# Check Redis status (if using)
systemctl status redis-server
```

### 11.3 Log Management

```bash
# View application logs
tail -f /var/www/wowmanga.uk/logs/backend-combined.log
tail -f /var/www/wowmanga.uk/logs/frontend-combined.log

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# View system logs
journalctl -u nginx -f
journalctl -u postgresql -f
```

### 11.4 Backup Strategy

```bash
# Create backup script
cat > /var/www/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/wowmanga"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump -h localhost -U mangareader_user mangareader > $BACKUP_DIR/database_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/application_$DATE.tar.gz /var/www/wowmanga.uk

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/backup.sh

# Add to crontab for daily backups
crontab -e
# Add: 0 2 * * * /var/www/backup.sh
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. PM2 Applications Not Starting

```bash
# Check PM2 logs
pm2 logs

# Check application logs
pm2 logs wowmanga-backend
pm2 logs wowmanga-frontend

# Restart applications
pm2 restart all
```

#### 2. Database Connection Issues

```bash
# Check PostgreSQL status
systemctl status postgresql

# Check database connection
sudo -u postgres psql -d mangareader -c "SELECT version();"

# Check environment variables
cat /var/www/wowmanga.uk/backend/.env
```

#### 3. Nginx Configuration Issues

```bash
# Test Nginx configuration
nginx -t

# Check Nginx error logs
tail -f /var/log/nginx/error.log

# Reload Nginx
systemctl reload nginx
```

#### 4. SSL Certificate Issues

```bash
# Check certificate status
certbot certificates

# Renew certificate manually
certbot renew

# Check certificate expiration
openssl x509 -in /etc/letsencrypt/live/wowmanga.uk/cert.pem -text -noout | grep "Not After"
```

#### 5. Memory Issues

```bash
# Check memory usage
free -h
pm2 monit

# Restart applications if needed
pm2 restart all

# Increase memory limits in ecosystem.config.js if needed
```

#### 6. Prisma Seed Configuration Error

If you encounter the error: "To configure seeding in your project you need to add a 'prisma.seed' property in your package.json":

```bash
# Navigate to backend directory
cd /var/www/wowmanga.uk/backend

# Ensure package.json has prisma.seed configuration
# It should look like this:
# "prisma": {
#   "seed": "node scripts/seed.js"
# }

# If the seed script doesn't exist, create it:
cat > scripts/seed.js << 'EOF'
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Your seed data here
  console.log('Seeding database...');
  // Example: Create roles, admin user, etc.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
EOF

# Make sure the script is executable
chmod +x scripts/seed.js

# Now try seeding again
npx prisma db seed
```

#### 7. Permission Denied for Prisma

If you get `Permission denied` errors when running Prisma commands:

```bash
# Navigate to backend directory
cd /var/www/wowmanga.uk/backend

# Fix permissions for node_modules
chmod -R +x node_modules/.bin
chmod +x node_modules/.bin/prisma

# Fix ownership
chown -R www-data:www-data node_modules
chown -R www-data:www-data node_modules/.bin

# Try again
npx prisma generate
npx prisma db push
```

#### 8. Port Already in Use (EADDRINUSE)

If you get `EADDRINUSE: address already in use :::3001` or similar errors:

```bash
# Check which process is using the port
lsof -i :3001
# Or
netstat -tulpn | grep :3001

# Kill the process using the port (replace PID with actual process ID)
kill -9 <PID>

# Or kill all processes on that port
kill -9 $(lsof -t -i:3001)

# If it's a PM2 process, stop it first
pm2 stop wowmanga-frontend
pm2 delete wowmanga-frontend

# Then restart
pm2 start ecosystem.config.js
```

#### 9. Content Security Policy (CSP) Errors

If you get errors like "Refused to connect because it violates the document's Content Security Policy":

```bash
# Edit the Nginx configuration
nano /etc/nginx/sites-available/wowmanga.uk

# Find the Content-Security-Policy header and ensure it includes:
# - 'self' (allows same-origin requests)
# - https://wowmanga.uk and https://www.wowmanga.uk (explicit domain)
# - All required external domains (api.mangadex.org, proxy.wowmanga.uk, etc.)

# The connect-src directive should look like:
# connect-src 'self' https://wowmanga.uk https://www.wowmanga.uk https://api.mangadex.org ...

# After updating, test and reload Nginx
nginx -t
systemctl reload nginx

# If the issue persists, you can temporarily make CSP more permissive for debugging:
# connect-src 'self' https: wss: http: ws:
# (Remember to tighten it back after identifying the issue)
```

#### 10. Application Still Using Old Domain/Proxy URL

If the application is still using the old domain (e.g., `proxy.nettruyen-vn.com` instead of `proxy.wowmanga.uk`):

```bash
# 1. Check environment variables are set correctly
cd /var/www/wowmanga.uk
cat .env.production | grep CORS

# Should show:
# NEXT_PUBLIC_CORS_URL=https://proxy.wowmanga.uk
# NEXT_PUBLIC_CORS_V2_URL=https://proxy.wowmanga.uk
# NEXT_PUBLIC_APP_URL=https://wowmanga.uk

# 2. If incorrect, update .env.production
nano .env.production
# Update the values to use wowmanga.uk

# 3. IMPORTANT: Rebuild the frontend (env vars are embedded at build time)
cd /var/www/wowmanga.uk
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# 4. Restart PM2 to load the new build
pm2 restart wowmanga-frontend

# 5. Clear browser cache or test in incognito mode
# The old domain might be cached in the browser

# 6. Verify the build includes correct values
# Check the built files (optional, for debugging)
grep -r "proxy.wowmanga.uk" .next/ || echo "Not found - may need rebuild"
```

**Important Notes:**

- Next.js embeds environment variables at **build time**, not runtime
- Changing `.env.production` requires a **rebuild** (`npm run build`)
- Simply restarting PM2 is **not enough** - you must rebuild
- The CSP in `next.config.js` now uses environment variables dynamically

---

## Security Considerations

### 1. Firewall Configuration

```bash
# Install UFW
apt install -y ufw

# Configure firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

### 2. Regular Updates

```bash
# Update system packages
apt update && apt upgrade -y

# Update Node.js packages
cd /var/www/wowmanga.uk
npm audit fix

cd /var/www/wowmanga.uk/backend
npm audit fix
```

### 3. Environment Security

```bash
# Secure environment files
chmod 600 /var/www/wowmanga.uk/.env.production
chmod 600 /var/www/wowmanga.uk/backend/.env

# Use strong passwords
# Generate strong JWT secrets
# Use HTTPS only
```

---

## Performance Optimization

### 1. Nginx Optimization

```bash
# Edit Nginx main configuration
nano /etc/nginx/nginx.conf

# Add these optimizations:
# worker_processes auto;
# worker_connections 1024;
# keepalive_timeout 65;
# gzip on;
# gzip_comp_level 6;
```

### 2. Database Optimization

```bash
# Edit PostgreSQL configuration
nano /etc/postgresql/*/main/postgresql.conf

# Optimize for your server:
# shared_buffers = 256MB
# effective_cache_size = 1GB
# maintenance_work_mem = 64MB
```

### 3. PM2 Optimization

```bash
# Use cluster mode for better performance
# Update ecosystem.config.js:
# exec_mode: "cluster",
# instances: "max",
```

---

## Conclusion

Your WowManga application should now be fully deployed and running on your VPS. The setup includes:

- ✅ Frontend (Next.js) running on port 3001 (to avoid conflict with nettruyen-vn.com on port 3000)
- ✅ Backend (Node.js/Express) running on port 8001 (to avoid conflicts)
- ✅ Database (PostgreSQL) configured and running
- ✅ Reverse proxy (Nginx) handling SSL and routing
- ✅ Process management (PM2) for reliability
- ✅ SSL certificates for HTTPS
- ✅ Monitoring and backup strategies

### Next Steps:

1. Test all functionality
2. Set up monitoring alerts
3. Configure automated backups
4. Set up log rotation
5. Monitor performance and optimize as needed

### Useful Commands:

```bash
# Check everything is running
pm2 status
systemctl status nginx postgresql

# View logs
pm2 logs
tail -f /var/log/nginx/error.log

# Restart services
pm2 restart all
systemctl restart nginx
```

Your WowManga application is now live at `https://wowmanga.uk`! 🎉

**Note:** This deployment uses ports 3001 (frontend) and 8001 (backend) to avoid conflicts with the existing `nettruyen-vn.com` deployment on port 3000.
