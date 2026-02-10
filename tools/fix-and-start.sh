#!/bin/bash

# Fix and Start Remsana Server
# This script stops any existing container and starts fresh with updated dependencies

cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1

echo "🛑 Stopping any existing containers..."
docker stop remsana-dev 2>/dev/null || echo "  (No container to stop)"
docker rm remsana-dev 2>/dev/null || echo "  (No container to remove)"

echo ""
echo "🚀 Starting fresh server with all dependencies..."
echo "   This will install react-router-dom and other dependencies..."
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
    echo "✅ Server started successfully!"
    echo ""
    echo "⏳ Please wait 30-60 seconds for dependencies to install..."
    echo ""
    echo "📋 To view installation progress:"
    echo "   docker logs -f remsana-dev"
    echo ""
    echo "🌐 Once ready, open: http://localhost:5173"
    echo ""
else
    echo ""
    echo "❌ Failed to start server"
    echo ""
    echo "Make sure Docker Desktop is running!"
fi
