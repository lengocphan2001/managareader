#!/bin/bash

# Clear Cache Script for TruyenDex
# Run this after deploying updates to force cache refresh

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

print_status "Clearing caches and updating service worker..."

# Navigate to application directory
cd /var/www/truyendex

# Clear nginx cache
print_status "Clearing nginx cache..."
sudo rm -rf /var/cache/nginx/*
sudo nginx -s reload

# Clear browser caches (if running in browser context)
print_status "Service worker cache will be updated on next page load"

# Force service worker update by changing revision
print_status "Updating service worker revision..."
if [ -f "next.config.js" ]; then
    # Create a temporary file with new revision
    sed 's/crypto.randomUUID()/crypto.randomUUID() + "_'$(date +%s)'"/' next.config.js > next.config.js.tmp
    mv next.config.js.tmp next.config.js
    print_status "Service worker revision updated"
else
    print_warning "next.config.js not found, skipping service worker update"
fi

# Restart services to ensure new configuration is loaded
print_status "Restarting services..."
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

print_status "Cache clearing completed!"
print_status "Users will need to refresh their browser to get the new service worker"
print_status "Old cached images will be replaced with new ones on next load"
