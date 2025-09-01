#!/bin/bash

# Simple Test Deployment Script
# This script will deploy and test the new service worker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_debug() {
    echo -e "${BLUE}[DEBUG]${NC} $1"
}

print_status "Deploying and testing new service worker..."

# Navigate to application directory
cd /var/www/truyendex

# 1. Backup current files
print_status "1. Creating backups..."
cp src/app/sw.ts src/app/sw.ts.backup.$(date +%Y%m%d_%H%M%S)
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)

# 2. Update service worker revision
print_status "2. Updating service worker revision..."
if [ -f "next.config.js" ]; then
    sed -i 's/crypto.randomUUID()/crypto.randomUUID() + "_'$(date +%s)'"/' next.config.js
    print_debug "Service worker revision updated"
fi

# 3. Clear nginx cache
print_status "3. Clearing nginx cache..."
if [ -d "/var/cache/nginx" ]; then
    sudo rm -rf /var/cache/nginx/*
    print_debug "Nginx cache cleared"
fi

# 4. Copy nginx config to system
print_status "4. Updating nginx configuration..."
sudo cp nginx.conf /etc/nginx/sites-available/truyendex

# 5. Test nginx config
print_status "5. Testing nginx configuration..."
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors!"
    exit 1
fi

# 6. Reload nginx
print_status "6. Reloading nginx..."
sudo systemctl reload nginx

# 7. Restart services
print_status "7. Restarting services..."
if command -v pm2 &> /dev/null; then
    pm2 restart truyendex-frontend
    pm2 restart truyendex-backend
    print_status "PM2 services restarted"
elif command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.prod.yml restart
    print_status "Docker services restarted"
else
    print_warning "No service manager found"
fi

# 8. Wait for services to be ready
print_status "8. Waiting for services to be ready..."
sleep 15

# 9. Test endpoints
print_status "9. Testing endpoints..."
echo "Testing frontend..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000 || echo "Frontend not responding"
echo "Testing backend..."
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8000 || echo "Backend not responding"

print_status "Deployment completed!"
echo ""
print_status "Testing Instructions:"
echo "1. Clear browser cache completely (Ctrl+Shift+Delete)"
echo "2. Visit your site and wait for manga covers to load"
echo "3. Open DevTools (F12) → Console tab"
echo "4. Look for 'Manga cover request:' logs"
echo "5. Press Ctrl+R (normal refresh)"
echo "6. Check if images stay visible"
echo "7. Look for 'Serving manga cover from cache:' logs"
echo ""
print_status "If images still disappear:"
echo "• Check browser console for errors"
echo "• Verify service worker is active (Application tab)"
echo "• Look for 'manga-covers' cache in Cache Storage"
echo "• Run './debug-sw.sh' for detailed analysis"
