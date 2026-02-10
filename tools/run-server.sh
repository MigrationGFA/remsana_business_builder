#!/bin/bash

# Remsana Development Server - Simple Startup Script

cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 Starting Remsana Development Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Clean up any existing container with this name
echo "🧹 Cleaning up any existing containers..."
docker stop remsana-dev 2>/dev/null || echo "  (No existing container to stop)"
docker rm remsana-dev 2>/dev/null || echo "  (No existing container to remove)"
echo ""

# Start the new container
echo "📦 Starting Docker container..."
echo "   This will install dependencies and start the server..."
echo ""

docker run --rm -d \
  --name remsana-dev \
  -p 5173:5173 \
  -v "$(pwd)":/app \
  -w /app \
  node:18-alpine \
  sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 5173"

# Check if container started successfully
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Container started successfully!"
    echo ""
    echo "⏳ Waiting for server to initialize (this may take 30-60 seconds)..."
    echo ""
    
    # Wait and show logs
    sleep 3
    
    echo "📋 Server logs (press Ctrl+C to stop viewing logs, server will keep running):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    # Show logs for a bit, then give instructions
    timeout 10 docker logs -f remsana-dev 2>/dev/null || docker logs remsana-dev
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  🌐 Server should be running!"
    echo "  👉 Open your browser: http://localhost:5173"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Useful commands:"
    echo "  View logs:    docker logs -f remsana-dev"
    echo "  Stop server:  docker stop remsana-dev"
    echo "  Check status: docker ps | grep remsana-dev"
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
