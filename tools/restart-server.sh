#!/bin/bash

# Script to restart the Remsana development server
# This ensures all dependencies are installed and the server is running

echo "🛑 Stopping existing container..."
docker-compose -f docker-compose.dev.yml down

echo "🗑️  Removing old container if exists..."
docker rm -f remsana-dev 2>/dev/null || true

echo "🔨 Rebuilding container with latest dependencies..."
docker-compose -f docker-compose.dev.yml build --no-cache

echo "🚀 Starting development server..."
docker-compose -f docker-compose.dev.yml up -d

echo "⏳ Waiting for server to start..."
sleep 5

echo "📦 Installing/updating dependencies..."
docker-compose -f docker-compose.dev.yml exec -T remsana-dev npm install

echo "✅ Server should be running at http://localhost:5173"
echo ""
echo "To view logs, run:"
echo "  docker-compose -f docker-compose.dev.yml logs -f"
echo ""
echo "To stop the server, run:"
echo "  docker-compose -f docker-compose.dev.yml down"
