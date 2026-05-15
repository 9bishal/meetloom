#!/bin/bash

# Azure App Service startup script for Node.js

# Set Node environment
export NODE_ENV=${NODE_ENV:-production}

# Log startup
echo "🚀 Starting MeetLoom API Server"
echo "Environment: $NODE_ENV"
echo "Port: ${PORT:-8080}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm ci --production
fi

# Start the server
echo "🎯 Starting Node.js server..."
exec node server/server.js
