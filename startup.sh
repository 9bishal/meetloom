#!/bin/bash

# Azure App Service startup script for Node.js

# Set Node environment
export NODE_ENV=${NODE_ENV:-production}

# Log startup
echo "🚀 Starting MeetLoom API Server"
echo "Environment: $NODE_ENV"
echo "Port: ${PORT:-8080}"

# Install root dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing root dependencies..."
  npm ci --production
fi

# Install server dependencies if needed
if [ ! -d "server/node_modules" ]; then
  echo "📦 Installing server dependencies..."
  cd server && npm ci --production && cd ..
fi

# Start the server
echo "🎯 Starting Node.js server..."
cd server && npm start
exec node server/server.js
