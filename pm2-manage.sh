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

case "$1" in
    start)
        print_info "Starting TruyenDex applications..."
        pm2 start ecosystem.config.js
        pm2 save
        print_success "Applications started!"
        ;;
    stop)
        print_info "Stopping TruyenDex applications..."
        pm2 stop ecosystem.config.js
        print_success "Applications stopped!"
        ;;
    restart)
        print_info "Restarting TruyenDex applications..."
        pm2 restart ecosystem.config.js
        print_success "Applications restarted!"
        ;;
    reload)
        print_info "Reloading TruyenDex applications..."
        pm2 reload ecosystem.config.js
        print_success "Applications reloaded!"
        ;;
    status)
        print_info "TruyenDex applications status:"
        pm2 status
        ;;
    logs)
        if [ -z "$2" ]; then
            print_info "Showing logs for all applications..."
            pm2 logs
        else
            print_info "Showing logs for $2..."
            pm2 logs $2
        fi
        ;;
    monitor)
        print_info "Opening PM2 monitor..."
        pm2 monit
        ;;
    delete)
        print_info "Deleting TruyenDex applications..."
        pm2 delete ecosystem.config.js
        print_success "Applications deleted!"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|reload|status|logs|monitor|delete}"
        echo ""
        echo "Commands:"
        echo "  start   - Start all applications"
        echo "  stop    - Stop all applications"
        echo "  restart - Restart all applications"
        echo "  reload  - Reload all applications (zero-downtime)"
        echo "  status  - Show application status"
        echo "  logs    - Show logs (optionally specify app name)"
        echo "  monitor - Open PM2 monitor"
        echo "  delete  - Delete all applications"
        echo ""
        echo "Examples:"
        echo "  $0 start"
        echo "  $0 logs truyendex-backend"
        echo "  $0 restart"
        exit 1
        ;;
esac
