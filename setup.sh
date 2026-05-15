#!/bin/bash

# MeetLoom - Development Setup Script
# This script helps set up the development environment

echo "🎯 MeetLoom - Development Setup"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo ""

# Create .env files if they don't exist
echo "📝 Checking environment files..."

if [ ! -f "server/.env" ]; then
    echo "   Creating server/.env..."
    cp server/.env.example server/.env
    echo "   ⚠️  Please edit server/.env and add your GROK_API_KEY"
else
    echo "   ✅ server/.env already exists"
fi

if [ ! -f "client/.env" ]; then
    echo "   Creating client/.env..."
    cp client/.env.example client/.env
    echo "   ✅ client/.env created"
else
    echo "   ✅ client/.env already exists"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install root dependencies
if [ -f "package.json" ]; then
    echo "   Installing root dependencies..."
    npm install --silent
fi

# Install server dependencies
echo "   Installing server dependencies..."
cd server
npm install --silent
cd ..

# Install client dependencies
echo "   Installing client dependencies..."
cd client
npm install --silent
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo ""
echo "1. Edit server/.env and add your GROK_API_KEY"
echo "   Get one at: https://console.x.ai/"
echo ""
echo "2. Start the development servers:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:5173 in your browser"
echo ""
echo "For more details, see QUICKSTART.md"
echo ""
