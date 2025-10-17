#!/bin/bash

# Main Website Deployment Script
echo "🚀 Main Website Deployment Script"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the main_website directory"
    exit 1
fi

print_status "Starting deployment process..."

# Step 1: Backend deployment
print_status "Step 1: Preparing backend for deployment..."
cd backend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found in backend directory"
    exit 1
fi

# Install dependencies
print_status "Installing backend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Test backend build
print_status "Testing backend..."
npm start &
BACKEND_PID=$!
sleep 5

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    print_success "Backend is running successfully"
    kill $BACKEND_PID
else
    print_warning "Backend health check failed, but continuing..."
    kill $BACKEND_PID 2>/dev/null
fi

cd ..

# Step 2: Frontend deployment
print_status "Step 2: Preparing frontend for deployment..."
cd frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found in frontend directory"
    exit 1
fi

# Install dependencies
print_status "Installing frontend dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Build frontend
print_status "Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Frontend built successfully"
else
    print_error "Failed to build frontend"
    exit 1
fi

cd ..

print_success "Deployment preparation completed!"
echo ""
print_status "Next steps:"
echo "1. Deploy backend to Railway or Render"
echo "2. Deploy frontend to Vercel"
echo "3. Set environment variables"
echo "4. Test the integration"
echo ""
print_status "For detailed instructions, see MAIN_WEBSITE_DEPLOYMENT_GUIDE.md"
echo ""
print_success "🎉 Ready for deployment!"
