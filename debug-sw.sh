#!/bin/bash

# Debug Service Worker Script
# This script will help diagnose why manga images disappear on Ctrl+R

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

print_status "Debugging Service Worker and Manga Image Caching..."

# Navigate to application directory
cd /var/www/truyendex

# 1. Check if service worker exists
print_status "1. Checking service worker..."
if [ -f "public/sw.js" ]; then
    print_status "Service worker exists"
    ls -la public/sw.js
    echo "Service worker size: $(wc -c < public/sw.js) bytes"
else
    print_error "Service worker not found!"
    exit 1
fi

# 2. Check service worker content
print_status "2. Checking service worker content..."
if [ -f "public/sw.js" ]; then
    echo "First 10 lines of service worker:"
    head -10 public/sw.js
    echo ""
    echo "Last 10 lines of service worker:"
    tail -10 public/sw.js
fi

# 3. Check nginx configuration
print_status "3. Testing nginx configuration..."
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors!"
    exit 1
fi

# 4. Check nginx cache directory
print_status "4. Checking nginx cache..."
if [ -d "/var/cache/nginx" ]; then
    print_debug "Nginx cache directory exists"
    ls -la /var/cache/nginx/
    echo "Cache directory size: $(du -sh /var/cache/nginx/)"
else
    print_warning "Nginx cache directory not found"
fi

# 5. Check service status
print_status "5. Checking service status..."
if command -v pm2 &> /dev/null; then
    pm2 status
else
    print_warning "PM2 not found"
fi

# 6. Test endpoints
print_status "6. Testing endpoints..."
echo "Testing frontend..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000 || echo "Frontend not responding"
echo "Testing backend..."
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8000 || echo "Backend not responding"

# 7. Check browser cache headers
print_status "7. Checking cache headers..."
echo "Testing manga cover cache headers..."
curl -s -I "http://localhost:3000/test-cover.jpg" | grep -E "Cache-Control|X-Cache-Status" || echo "No cache headers found"

print_status "Debug completed!"
echo ""
print_status "Manual Testing Instructions:"
echo "1. Open your browser and go to your site"
echo "2. Wait for manga covers to load"
echo "3. Open DevTools (F12) → Application tab → Service Workers"
echo "4. Check if service worker is active"
echo "5. Press Ctrl+R - check console for errors"
echo "6. Look for 'manga-covers' cache in Application → Storage → Cache Storage"
echo ""
print_status "Common Issues:"
echo "• Service worker not registered"
echo "• Cache not being created"
echo "• Nginx cache conflicting with service worker"
echo "• Service worker not intercepting fetch requests"
echo ""
print_status "Next Steps:"
echo "1. Check browser console for errors"
echo "2. Verify service worker is active"
echo "3. Check if 'manga-covers' cache exists"
echo "4. Look for fetch request logs in console"
