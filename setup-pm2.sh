#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info "Setting up TruyenDex with PM2..."

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_warning "Running as root is not recommended for security reasons"
   print_warning "Consider creating a non-root user: adduser truyendex && usermod -aG sudo truyendex"
   read -p "Do you want to continue as root? (y/N): " -n 1 -r
   echo
   if [[ ! $REPLY =~ ^[Yy]$ ]]; then
       print_error "Setup cancelled"
       exit 1
   fi
fi

# Stop Docker containers if running
print_info "Stopping Docker containers..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    print_info "Installing PM2..."
    npm install -g pm2
    print_success "PM2 installed successfully"
else
    print_success "PM2 is already installed"
fi

# Create logs directory
print_info "Creating logs directory..."
mkdir -p logs

# Install dependencies
print_info "Installing backend dependencies..."
cd backend
npm install --production
cd ..

print_info "Installing frontend dependencies..."
npm install --production

# Build frontend
print_info "Building frontend..."
npm run build

# Generate Prisma client
print_info "Generating Prisma client..."
cd backend
npx prisma generate
npm prisma migrate
npm prisma seed
cd ..

# Create PM2 startup script
print_info "Setting up PM2 startup..."
pm2 startup

print_success "PM2 setup complete!"
print_info "Next steps:"
print_info "1. Update environment variables in ecosystem.config.js"
print_info "2. Run: pm2 start ecosystem.config.js"
print_info "3. Run: pm2 save"
print_info "4. Update Nginx configuration to proxy to localhost:8000 and localhost:3000"
