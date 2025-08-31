#!/bin/bash

echo "🔧 Updating Nginx configuration for PM2..."

# Backup current config
sudo cp /etc/nginx/sites-available/truyendex /etc/nginx/sites-available/truyendex.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# Update Nginx config
sudo cp nginx-pm2.conf /etc/nginx/sites-available/truyendex

# Test Nginx config
echo "🧪 Testing Nginx configuration..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx configuration is valid"
    echo "🔄 Reloading Nginx..."
    sudo systemctl reload nginx
    echo "✅ Nginx updated successfully!"
else
    echo "❌ Nginx configuration has errors"
    echo "🔄 Restoring backup..."
    sudo cp /etc/nginx/sites-available/truyendex.backup.* /etc/nginx/sites-available/truyendex 2>/dev/null || true
    exit 1
fi
