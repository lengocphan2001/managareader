#!/bin/bash

# Cache Debugging and Fix Script for TruyenDex
# This script will help diagnose and fix image caching issues

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

print_status "Starting cache debugging and fix process..."

# Navigate to application directory
cd /var/www/truyendex

# Check if we're in the right directory
if [ ! -f "next.config.js" ] || [ ! -f "nginx.conf" ]; then
    print_error "Required files not found! Please run this script from the truyendex directory."
    exit 1
fi

# 1. Check current service worker status
print_status "1. Checking service worker status..."
if [ -f "public/sw.js" ]; then
    print_debug "Service worker file exists"
    ls -la public/sw.js
else
    print_warning "Service worker file not found"
fi

# 2. Check nginx configuration
print_status "2. Checking nginx configuration..."
if sudo nginx -t 2>/dev/null; then
    print_debug "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors"
    sudo nginx -t
fi

# 3. Check nginx cache directory
print_status "3. Checking nginx cache..."
if [ -d "/var/cache/nginx" ]; then
    print_debug "Nginx cache directory exists"
    ls -la /var/cache/nginx/
else
    print_warning "Nginx cache directory not found"
fi

# 4. Check browser cache headers
print_status "4. Checking cache headers..."
print_debug "Current nginx cache headers:"
grep -n "Cache-Control\|proxy_cache_valid" nginx.conf

# 5. Force clear all caches
print_status "5. Clearing all caches..."

# Clear nginx cache
if [ -d "/var/cache/nginx" ]; then
    print_debug "Clearing nginx cache..."
    sudo rm -rf /var/cache/nginx/*
fi

# Clear system cache
print_debug "Clearing system cache..."
sudo sync && sudo echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true

# 6. Update service worker revision
print_status "6. Updating service worker revision..."
if [ -f "next.config.js" ]; then
    # Create backup
    cp next.config.js next.config.js.backup.$(date +%Y%m%d_%H%M%S)
    
    # Update revision to force service worker update
    sed -i 's/crypto.randomUUID()/crypto.randomUUID() + "_'$(date +%s)'"/' next.config.js
    
    print_debug "Service worker revision updated"
else
    print_warning "next.config.js not found, skipping service worker update"
fi

# 7. Rebuild and restart services
print_status "7. Rebuilding and restarting services..."

# Check if using PM2
if command -v pm2 &> /dev/null; then
    print_debug "Using PM2 - restarting services..."
    pm2 restart truyendex-frontend
    pm2 restart truyendex-backend
    print_status "PM2 services restarted"
    
    # Check PM2 status
    print_debug "PM2 status:"
    pm2 status
elif command -v docker-compose &> /dev/null; then
    print_debug "Using Docker Compose - rebuilding and restarting..."
    docker-compose -f docker-compose.prod.yml down
    docker-compose -f docker-compose.prod.yml build --no-cache
    docker-compose -f docker-compose.prod.yml up -d
    print_status "Docker services rebuilt and restarted"
else
    print_warning "No service manager found, please restart services manually"
fi

# 8. Reload nginx
print_status "8. Reloading nginx..."
if sudo systemctl reload nginx; then
    print_status "Nginx reloaded successfully"
else
    print_error "Failed to reload nginx"
    sudo systemctl status nginx
fi

# 9. Check service status
print_status "9. Checking service status..."
if command -v pm2 &> /dev/null; then
    pm2 status
elif command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.prod.yml ps
fi

# 10. Final instructions
print_status "10. Cache debugging and fix completed!"
echo ""
print_status "Next steps:"
echo "1. Clear your browser cache completely (Ctrl+Shift+Delete)"
echo "2. Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)"
echo "3. Check browser console for any remaining errors"
echo "4. Monitor the Network tab to see if images are loading"
echo ""
print_warning "If images still don't load:"
echo "1. Check browser console for CSP violations"
echo "2. Verify service worker is active (Application tab in DevTools)"
echo "3. Check if external image URLs are accessible"
echo "4. Verify nginx is properly configured and running"
echo ""
print_debug "Debug information saved to:"
echo "- nginx.conf.backup.*"
echo "- next.config.js.backup.*"
