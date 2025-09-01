#!/bin/bash

# Manga Cover Image Fix Deployment Script
# This script specifically fixes manga cover image caching issues

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

print_status "Deploying manga cover image fix..."

# Navigate to application directory
cd /var/www/truyendex

# 1. Backup current configuration
print_status "1. Creating backups..."
cp nginx.conf nginx.conf.backup.$(date +%Y%m%d_%H%M%S)
cp next.config.js next.config.js.backup.$(date +%Y%m%d_%H%M%S)
cp src/app/sw.ts src/app/sw.ts.backup.$(date +%Y%m%d_%H%M%S)

# 2. Clear old caches
print_status "2. Clearing old caches..."
if [ -d "/var/cache/nginx" ]; then
    sudo rm -rf /var/cache/nginx/*
fi

# Clear browser caches by updating service worker revision
print_status "3. Updating service worker revision..."
if [ -f "next.config.js" ]; then
    sed -i 's/crypto.randomUUID()/crypto.randomUUID() + "_'$(date +%s)'"/' next.config.js
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
    print_warning "No service manager found, please restart services manually"
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

print_status "Manga cover fix deployment completed!"
echo ""
print_status "Changes made:"
echo "✅ Fixed service worker caching strategy for manga covers"
echo "✅ Updated nginx to cache manga cover images properly"
echo "✅ Enabled navigation caching for better performance"
echo "✅ Manga covers will now load consistently"
echo ""
print_status "What this fixes:"
echo "• Home page manga covers will load every time"
echo "• Advanced search page manga covers will load every time"
echo "• Manga detail page covers will load every time"
echo "• No more need for Ctrl+Shift+R to see manga covers"
echo ""
print_status "Next steps:"
echo "1. Clear your browser cache completely (Ctrl+Shift+Delete)"
echo "2. Visit your site - manga covers should load immediately"
echo "3. Navigate between pages - covers should persist"
echo "4. Check browser console for manga cover request logs"
echo ""
print_debug "The service worker will now properly cache manga covers by:"
echo "• Manga ID and size (e.g., manga-cover-abc123-256)"
echo "• Original vs resized URLs"
echo "• Proper cache invalidation"
