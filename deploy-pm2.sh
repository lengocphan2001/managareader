#!/bin/bash

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 TruyenDex PM2 Deployment${NC}"
echo "=================================="

# Stop Docker if running
echo -e "${YELLOW}📦 Stopping Docker containers...${NC}"
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Installing PM2...${NC}"
    npm install -g pm2
fi

# Create logs directory
mkdir -p logs

# Install backend dependencies
echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
cd backend
npm install --production
cd ..

# Install frontend dependencies
echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
npm install --production

# Build frontend with increased memory
echo -e "${YELLOW}🔨 Building frontend...${NC}"
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Generate Prisma client
echo -e "${YELLOW}🔧 Generating Prisma client...${NC}"
cd backend
npx prisma generate
cd ..

# Stop any existing PM2 processes
echo -e "${YELLOW}🛑 Stopping existing PM2 processes...${NC}"
pm2 delete all 2>/dev/null || true

# Start backend with PM2
echo -e "${YELLOW}🚀 Starting backend...${NC}"
cd backend
pm2 start src/server.js --name "truyendex-backend" --env production
cd ..

# Start frontend with PM2 (standalone mode)
echo -e "${YELLOW}🚀 Starting frontend...${NC}"
pm2 start "node .next/standalone/server.js" --name "truyendex-frontend"

# Save PM2 configuration
pm2 save

# Setup PM2 startup
pm2 startup

echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "📊 PM2 Status:"
pm2 status
echo ""
echo "📝 Useful commands:"
echo "  pm2 status          - Check status"
echo "  pm2 logs            - View logs"
echo "  pm2 restart all     - Restart all apps"
echo "  pm2 stop all        - Stop all apps"
echo ""
echo "🌐 Next steps:"
echo "1. Update Nginx configuration"
echo "2. Test your site: https://ninetails.site"
