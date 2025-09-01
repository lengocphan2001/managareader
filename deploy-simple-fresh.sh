#!/bin/bash

# Simple Fresh Load Deployment Script
# This script deploys a simple solution: no caching, always fresh images

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

print_status "🚀 Deploying simple fresh load solution..."

# Navigate to application directory
cd /var/www/truyendex

# 1. Build the application
print_status "1. Building application..."
if npm run build; then
    print_status "✅ Build successful!"
else
    print_error "❌ Build failed!"
    exit 1
fi

# 2. Backup current nginx config
print_status "2. Creating backup of nginx configuration..."
sudo cp /etc/nginx/sites-available/truyendex /etc/nginx/sites-available/truyendex.backup.$(date +%Y%m%d_%H%M%S)

# 3. Copy updated nginx config (no caching)
print_status "3. Updating nginx configuration (no caching)..."
sudo cp nginx.conf /etc/nginx/sites-available/truyendex

# 4. Test nginx configuration
print_status "4. Testing nginx configuration..."
if sudo nginx -t; then
    print_status "✅ Nginx configuration is valid"
else
    print_error "❌ Nginx configuration has errors!"
    print_status "Restoring backup..."
    sudo cp /etc/nginx/sites-available/truyendex.backup.* /etc/nginx/sites-available/truyendex
    exit 1
fi

# 5. Reload nginx
print_status "5. Reloading nginx..."
sudo systemctl reload nginx

# 6. Restart services
print_status "6. Restarting services..."
if command -v pm2 &> /dev/null; then
    pm2 restart truyendex-frontend
    pm2 restart truyendex-backend
    print_status "✅ PM2 services restarted"
elif command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.prod.yml restart
    print_status "✅ Docker services restarted"
else
    print_warning "⚠️ No service manager found"
fi

# 7. Wait for services to be ready
print_status "7. Waiting for services to be ready..."
sleep 15

# 8. Test endpoints
print_status "8. Testing endpoints..."
echo "Testing frontend..."
curl -s -o /dev/null -w "Frontend: %{http_code}\n" http://localhost:3000 || echo "Frontend not responding"
echo "Testing backend..."
curl -s -o /dev/null -w "Backend: %{http_code}\n" http://localhost:8000 || echo "Backend not responding"

print_status "🎉 Simple fresh load deployment completed!"
echo ""
print_status "✅ What this solution does:"
echo "• NO CACHING for manga covers - always fresh load"
echo "• Service worker forces fresh requests with cache: 'no-cache'"
echo "• Nginx sends no-cache headers for all manga images"
echo "• Images will always load fresh on Ctrl+R"
echo ""
print_status "🔧 Technical changes:"
echo "• Removed all proxy_cache directives for manga covers"
echo "• Added no-cache headers for manga cover locations"
echo "• Service worker intercepts manga cover requests"
echo "• Forces fresh fetch with cache: 'no-cache'"
echo ""
print_status "🧪 Testing Instructions:"
echo "1. Clear browser cache completely (Ctrl+Shift+Delete)"
echo "2. Visit your site and wait for manga covers to load"
echo "3. Press Ctrl+R (normal refresh)"
echo "4. Images should load fresh every time"
echo "5. Check browser console for 'forcing fresh load' logs"
echo ""
print_status "📋 Expected behavior:"
echo "• Images load fresh on every page visit"
echo "• Ctrl+R always shows fresh images"
echo "• No more disappearing images"
echo "• Slightly slower loading (but always reliable)"
echo ""
print_status "🚨 If images still disappear:"
echo "• Check browser console for errors"
echo "• Verify service worker is active"
echo "• Check nginx error logs: sudo tail -f /var/log/nginx/error.log"
echo "• Make sure nginx config was reloaded"
