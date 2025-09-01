#!/bin/bash

# Quick CSP Fix Script for Cloudflare Turnstile
# Run this to fix the CSP blocking Turnstile script

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

print_status "Fixing CSP to allow Cloudflare Turnstile and Google Tag Manager..."

# Navigate to application directory
cd /var/www/truyendex

# Check if nginx config exists
if [ ! -f "nginx.conf" ]; then
    print_error "nginx.conf not found in current directory!"
    print_warning "Please run this script from the directory containing nginx.conf"
    exit 1
fi

# Backup original nginx config
print_status "Backing up original nginx.conf..."
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# Update nginx config with new CSP
print_status "Updating nginx.conf with new CSP..."
sed -i 's|script-src '\''self'\'' '\''unsafe-inline'\'' '\''unsafe-eval'\'' https:;|script-src '\''self'\'' '\''unsafe-inline'\'' '\''unsafe-eval'\'' https: https://challenges.cloudflare.com https://www.googletagmanager.com;|g' nginx.conf
sed -i 's|connect-src '\''self'\'' https://api.mangadex.org https://proxy.ninetails.site https://api.iconify.design;|connect-src '\''self'\'' https://api.mangadex.org https://proxy.ninetails.site https://api.iconify.design https://challenges.cloudflare.com https://www.googletagmanager.com;|g' nginx.conf

print_status "nginx.conf updated successfully!"

# Copy nginx config to system location
print_status "Copying nginx config to system location..."
sudo cp nginx.conf /etc/nginx/sites-available/truyendex

# Test nginx configuration
print_status "Testing nginx configuration..."
if sudo nginx -t; then
    print_status "Nginx configuration is valid!"
    
    # Reload nginx
    print_status "Reloading nginx..."
    sudo systemctl reload nginx
    print_status "Nginx reloaded successfully!"
else
    print_error "Nginx configuration test failed!"
    print_warning "Please check the configuration manually"
    exit 1
fi

# Restart services if using PM2
if command -v pm2 &> /dev/null; then
    print_status "Restarting PM2 services..."
    pm2 restart truyendex-frontend
    pm2 restart truyendex-backend
    print_status "PM2 services restarted!"
elif command -v docker-compose &> /dev/null; then
    print_status "Restarting Docker services..."
    docker-compose -f docker-compose.prod.yml restart
    print_status "Docker services restarted!"
else
    print_warning "No service manager found, please restart services manually"
fi

print_status "CSP fix completed successfully!"
print_status "Cloudflare Turnstile and Google Tag Manager should now work without CSP violations"
print_status "You may need to clear browser cache or hard refresh the page"
