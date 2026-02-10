#!/bin/bash

# Install react-router-dom in running Docker container

echo "📦 Installing react-router-dom in Docker container..."

# Try to install in running container
if docker exec remsana-dev sh -c "cd /app && npm install react-router-dom@6.16.0" 2>/dev/null; then
    echo "✅ Successfully installed react-router-dom!"
    echo ""
    echo "⏳ Wait 5 seconds for the server to reload..."
    echo "🌐 Then refresh your browser at http://localhost:5173"
    echo ""
    echo "📝 Don't forget to change src/main.tsx back to:"
    echo "   import App from './app/App.tsx';"
else
    echo "❌ Container not accessible or not running"
    echo ""
    echo "Please run this command manually in your terminal:"
    echo ""
    echo "docker exec remsana-dev sh -c 'cd /app && npm install react-router-dom@6.16.0'"
    echo ""
    echo "Or restart the container:"
    echo "./INSTALL_AND_START.sh"
fi
