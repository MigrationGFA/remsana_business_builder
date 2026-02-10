#!/bin/bash

# Complete Install and Start Script for Remsana
# This will ensure all dependencies including react-router-dom are installed

cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Remsana Development Server - Complete Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Step 1: Stop and remove existing container
echo "📦 Step 1: Cleaning up existing containers..."
docker stop remsana-dev 2>/dev/null && echo "  ✓ Stopped existing container" || echo "  ℹ No container to stop"
docker rm remsana-dev 2>/dev/null && echo "  ✓ Removed existing container" || echo "  ℹ No container to remove"
echo ""

# Step 2: Start new container with fresh install
echo "📦 Step 2: Starting fresh container..."
echo "   This will install ALL dependencies including react-router-dom"
echo ""

docker run --rm -d \
  --name remsana-dev \
  -p 5173:5173 \
  -v "$(pwd)":/app \
  -w /app \
  node:18-alpine \
  sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 5173"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Container started successfully!"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  ⏳ Installing dependencies..."
    echo "  This may take 30-60 seconds"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📋 To watch installation progress, run:"
    echo "   docker logs -f remsana-dev"
    echo ""
    echo "🌐 Once installation completes, open:"
    echo "   http://localhost:5173"
    echo ""
    echo "💡 Tip: Wait until you see 'VITE' in the logs before opening browser"
    echo ""
else
    echo ""
    echo "❌ Failed to start container"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Make sure Docker Desktop is running"
    echo "  2. Check Docker status: docker ps"
    echo "  3. Try: docker run hello-world (to test Docker)"
    echo ""
fi
