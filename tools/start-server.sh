#!/bin/bash

################################################################################
# Remsana Development Server Startup Script
# This script will start the development server using Docker
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Remsana Development Server Startup                        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Docker is running
echo -e "${YELLOW}[1/3]${NC} Checking Docker..."
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running or not accessible${NC}"
    echo ""
    echo "Please do one of the following:"
    echo "  1. Open Docker Desktop application"
    echo "  2. Wait for Docker Desktop to fully start"
    echo "  3. Try running this script again"
    echo ""
    echo "Or if you have Node.js installed, you can run:"
    echo "  npm install && npm run dev"
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Check if container is already running
if docker ps | grep -q remsana-dev; then
    echo -e "${YELLOW}⚠️  Container 'remsana-dev' is already running${NC}"
    echo -e "${BLUE}Server should be available at: http://localhost:5173${NC}"
    echo ""
    echo "To stop the server, run:"
    echo "  docker stop remsana-dev"
    exit 0
fi

# Stop any existing container
echo -e "${YELLOW}[2/3]${NC} Cleaning up any existing containers..."
docker stop remsana-dev 2>/dev/null || true
docker rm remsana-dev 2>/dev/null || true

# Start the development server
echo -e "${YELLOW}[3/3]${NC} Starting development server..."
echo ""

docker run --rm -d \
  --name remsana-dev \
  -p 5173:5173 \
  -v "$PWD":/app \
  -w /app \
  node:18-alpine \
  sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 5173"

# Wait a moment for server to start
sleep 3

# Check if container is running
if docker ps | grep -q remsana-dev; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ Server Started Successfully!                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}🌐 Open your browser and visit:${NC}"
    echo -e "${GREEN}   http://localhost:5173${NC}"
    echo ""
    echo -e "${YELLOW}To view logs:${NC}"
    echo "  docker logs -f remsana-dev"
    echo ""
    echo -e "${YELLOW}To stop the server:${NC}"
    echo "  docker stop remsana-dev"
    echo ""
else
    echo -e "${RED}❌ Failed to start server${NC}"
    echo "Check logs with: docker logs remsana-dev"
    exit 1
fi
