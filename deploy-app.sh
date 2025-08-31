#!/bin/bash

# TruyenDex Application Deployment Script
# Run this after deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_error ".env.production file not found!"
    print_warning "Please create .env.production file with your production environment variables"
    exit 1
fi

# Navigate to application directory
cd /var/www/truyendex

# Clone or update repository
if [ -d ".git" ]; then
    print_status "Updating repository..."
    git pull origin main
else
    print_error "Repository not found. Please clone your repository first:"
    print_warning "git clone <your-repo-url> /var/www/truyendex"
    exit 1
fi

# Copy environment file
print_status "Setting up environment..."
cp .env.production .env

# Build and start with Docker Compose
print_status "Building and starting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Run database migrations
print_status "Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend npx prisma migrate deploy

# Seed database if needed
print_status "Seeding database..."
docker-compose -f docker-compose.prod.yml exec backend node scripts/seed.js

# Setup Nginx configuration
print_status "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/truyendex << EOF
server {
    listen 80;
    server_name ninetails.site www.ninetails.site;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name ninetails.site www.ninetails.site;

    # SSL configuration will be added by certbot

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static files
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Images
    location /images/ {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 1d;
        add_header Cache-Control "public";
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/truyendex /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Setup SSL certificate
print_status "Setting up SSL certificate..."
sudo certbot --nginx -d ninetails.site -d www.ninetails.site --non-interactive --agree-tos --email admin@ninetails.site

# Setup automatic SSL renewal
print_status "Setting up automatic SSL renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/truyendex << EOF
/var/www/truyendex/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f /var/www/truyendex/docker-compose.prod.yml restart frontend backend
    endscript
}
EOF

print_status "✅ Deployment completed successfully!"
print_status "Your site should be available at: https://ninetails.site"
print_warning "Please check the logs if you encounter any issues:"
print_warning "docker-compose -f docker-compose.prod.yml logs -f"
