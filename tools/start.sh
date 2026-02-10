#!/bin/bash
# Simple one-command server startup

cd /Users/apple/Desktop/Projects/REMSANA-Business-Builder-1

echo "🚀 Starting Remsana Development Server..."
echo ""

# Stop any existing container
docker stop remsana-dev 2>/dev/null || true
docker rm remsana-dev 2>/dev/null || true

# Start the server
docker run --rm -d \
  --name remsana-dev \
  -p 5173:5173 \
  -v "$PWD":/app \
  -w /app \
  node:18-alpine \
  sh -c "npm install && npm run dev -- --host 0.0.0.0 --port 5173"

echo ""
echo "✅ Server starting..."
echo "⏳ Waiting for server to be ready..."
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🌐 Your server is running!"
echo "  👉 Open: http://localhost:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "To view logs:    docker logs -f remsana-dev"
echo "To stop server:  docker stop remsana-dev"
echo ""
