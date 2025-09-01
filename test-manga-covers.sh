#!/bin/bash

# Test Manga Cover Caching Script
# This script tests if manga cover images are being cached properly

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

print_status "Testing manga cover caching..."

# Navigate to application directory
cd /var/www/truyendex

# 1. Check if service worker is generated
print_status "1. Checking service worker..."
if [ -f "public/sw.js" ]; then
    print_status "Service worker exists"
    ls -la public/sw.js
else
    print_error "Service worker not found!"
    exit 1
fi

# 2. Check nginx configuration
print_status "2. Testing nginx configuration..."
if sudo nginx -t; then
    print_status "Nginx configuration is valid"
else
    print_error "Nginx configuration has errors!"
    exit 1
fi

# 3. Check service status
print_status "3. Checking service status..."
if command -v pm2 &> /dev/null; then
    pm2 status
else
    print_warning "PM2 not found"
fi

# 4. Test endpoints
print_status "4. Testing endpoints..."
echo "Testing frontend..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000 || echo "Frontend not responding"
echo "Testing backend..."
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8000 || echo "Backend not responding"

# 5. Check cache headers
print_status "5. Checking cache headers for manga covers..."
echo "Testing nginx cache headers..."
curl -s -I "http://localhost:3000/test-cover.jpg" | grep -E "Cache-Control|X-Cache-Status" || echo "No cache headers found"

print_status "Testing completed!"
echo ""
print_status "Manual Testing Instructions:"
echo "1. Open your browser and go to your site"
echo "2. Wait for manga covers to load"
echo "3. Press Ctrl+R (normal refresh) - covers should STAY visible"
echo "4. Press Ctrl+Shift+R (hard refresh) - covers should reload but then stay cached"
echo "5. Navigate to different pages - covers should load instantly"
echo ""
print_status "Browser Console Checks:"
echo "1. Open DevTools (F12)"
echo "2. Go to Console tab"
echo "3. Look for 'Manga cover request:' logs"
echo "4. Look for 'Serving manga cover from cache:' logs"
echo "5. Look for 'Cached new manga cover:' logs"
echo ""
print_status "If images disappear on Ctrl+R:"
echo "• Check browser console for errors"
echo "• Verify service worker is active (Application tab)"
echo "• Check if 'manga-covers' cache exists in DevTools"
echo "• Run this test script again"
