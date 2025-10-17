#!/bin/bash

# AayuLink Backend Render Deployment Script
echo "🚀 AayuLink Backend Render Deployment"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
if [ ! -f "package.json" ] || [ ! -f "src/server.js" ]; then
    print_error "Please run this script from the backend directory"
    exit 1
fi

print_status "Starting deployment preparation..."

# Step 1: Install dependencies
print_status "Step 1: Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# Step 2: Test the build
print_status "Step 2: Testing server startup..."
timeout 10s node src/server.js &
SERVER_PID=$!
sleep 5

# Check if server is running
if curl -s http://localhost:5000/ > /dev/null 2>&1; then
    print_success "Server started successfully"
    kill $SERVER_PID 2>/dev/null
else
    print_warning "Server test failed, but continuing..."
    kill $SERVER_PID 2>/dev/null
fi

# Step 3: Check for required files
print_status "Step 3: Checking deployment files..."

required_files=("package.json" "src/server.js" "render.yaml" "Procfile")
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✅ $file exists"
    else
        print_error "❌ $file missing"
        exit 1
    fi
done

# Step 4: Environment variables check
print_status "Step 4: Checking environment variables..."

env_vars=("MONGODB_URI" "JWT_SECRET" "GEMINI_API_KEY" "GROQ_API_KEY")
for var in "${env_vars[@]}"; do
    if [ -n "${!var}" ]; then
        print_success "✅ $var is set"
    else
        print_warning "⚠️ $var is not set (will need to be set in Render)"
    fi
done

print_success "Deployment preparation completed!"
echo ""
print_status "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Go to https://render.com"
echo "3. Create a new Web Service"
echo "4. Connect your GitHub repository"
echo "5. Set the root directory to 'main_website/backend'"
echo "6. Set environment variables in Render dashboard"
echo "7. Deploy!"
echo ""
print_status "For detailed instructions, see RENDER_DEPLOYMENT_GUIDE.md"
echo ""
print_success "🎉 Ready for Render deployment!"
