# MeetLoom - Azure Deployment Guide

Complete guide for deploying MeetLoom to Azure with separate frontend and backend services.

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture](#architecture)
3. [Required Files](#required-files)
4. [Frontend Deployment (Azure Static Web Apps)](#frontend-deployment)
5. [Backend Deployment (Azure App Service)](#backend-deployment)
6. [Verification & Testing](#verification--testing)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- Azure CLI (`az` command)
- Git
- Node.js 18+ (for local testing)
- npm or yarn

### Azure Account Setup
```bash
# Login to Azure
az login

# Set your subscription
az account set --subscription "Azure for Students"

# Verify login
az account show
```

### Required Information
- Azure Resource Group name: `meetloom-rg`
- App Service name (backend): `meetloom-api`
- App Service plan name: `meetloom-plan`
- Region: `Southeast Asia` (or your preferred region)
- GitHub repository: `https://github.com/9bishal/meetloom`

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                 Azure Resources                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────┐      ┌────────────────┐  │
│  │ Static Web Apps  │      │  App Service   │  │
│  │  (Frontend)      │─────▶│  (Backend)     │  │
│  │  React + Vite    │      │  Node.js       │  │
│  └──────────────────┘      └────────────────┘  │
│         ▲                           ▲           │
│         │                           │           │
│    GitHub: frontend          GitHub: backend    │
│    branch deployment        branch deployment   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Required Files

### File Structure
```
meetloom/
├── package.json                    # Root dependencies (orchestration)
├── package-lock.json               # Lock file
├── startup.sh                      # Azure App Service startup script
├── web.config                      # IIS configuration for Azure
├── staticwebapp.config.json        # Static Web Apps routing config
├── README.md                       # Main documentation
│
├── client/                         # React Frontend
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   └── ...
│   └── public/
│
└── server/                         # Node.js Backend
    ├── package.json
    ├── package-lock.json
    ├── server.js                   # Entry point
    ├── app.js                      # Express app setup
    ├── .env.example
    ├── controllers/
    ├── routes/
    ├── services/
    ├── middleware/
    └── prompts/
```

### Critical Configuration Files

#### 1. **root/package.json** (Root Orchestration)
```json
{
  "name": "meetloom",
  "version": "1.0.0",
  "description": "AI-powered meeting intelligence platform",
  "type": "module",
  "main": "server/server.js",
  "scripts": {
    "dev": "concurrently \"cd client && npm run dev\" \"cd server && npm run dev\"",
    "start": "node server/server.js",
    "build": "cd client && npm run build",
    "server": "cd server && npm start",
    "client": "cd client && npm run dev"
  },
  "keywords": ["meetloom", "meeting", "analysis", "ai"],
  "author": "",
  "license": "MIT",
  "dependencies": {},
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

#### 2. **startup.sh** (Azure App Service Startup)
```bash
#!/bin/bash

# Azure App Service startup script for Node.js
# This script runs when the App Service starts

set -x  # Enable debug mode to see execution logs

# Set Node environment
export NODE_ENV=${NODE_ENV:-production}

echo "🚀 Starting MeetLoom API Server"
echo "Environment: $NODE_ENV"
echo "Port: ${PORT:-8080}"
echo "Current directory: $(pwd)"
echo "Contents: $(ls -la)"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm ci --production || npm install --production

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server || exit 1
npm ci --production || npm install --production
cd .. || exit 1

# Start the server
echo "🎯 Starting Node.js server from $(pwd)"
node server/server.js
```

#### 3. **web.config** (IIS Configuration for Azure)
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <!-- Disable WebSocket -->
    <webSocket enabled="false" />
    
    <!-- IIS Node handler for Node.js -->
    <handlers>
      <add name="iisnode" path="server/server.js" verb="*" modules="iisnode" />
    </handlers>
    
    <!-- URL Rewrite rules -->
    <rewrite>
      <rules>
        <!-- Skip Node Inspector URLs -->
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server\/debug[\/]?" />
        </rule>
        
        <!-- Route all requests to server/server.js -->
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
          </conditions>
          <action type="Rewrite" url="server/server.js" />
        </rule>
      </rules>
    </rewrite>
    
    <!-- Custom 404 error handler -->
    <httpErrors>
      <remove statusCode="404" subStatusCode="-1" />
      <error statusCode="404" prefixLanguageFilePath="" path="server/server.js" responseMode="ExecuteURL" />
    </httpErrors>
    
    <!-- IIS Node configuration -->
    <iisnode 
      watchedFiles="*.js;node_modules\*;routes\*.js;middleware\*.js;controllers\*.js"
      node_env="production"
      nodeProcessCommandLine="&quot;D:\Program Files (x86)\nodejs\node.exe&quot;" />
  </system.webServer>
</configuration>
```

#### 4. **staticwebapp.config.json** (Azure Static Web Apps)
```json
{
  "routes": [
    {
      "route": "/api/*",
      "rewrite": "https://meetloom-api.azurewebsites.net/api/*",
      "allowedRoles": []
    },
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{svg,png,jpg,jpeg,gif}", "/css/*"]
  },
  "globalHeaders": {
    "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://meetloom-api.azurewebsites.net",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block"
  }
}
```

#### 5. **server/server.js** (Entry Point)
```javascript
import dotenv from 'dotenv';

// Load environment variables BEFORE importing app
dotenv.config();

const { default: app } = await import('./app.js');

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const HOST = '0.0.0.0'; // Listen on all interfaces for Azure

// Start server
const server = app.listen(PORT, HOST, () => {
  console.log(`
╔════════════════════════════════════════╗
║       🎯 MeetLoom Server Started       ║
╠════════════════════════════════════════╣
║ Environment: ${NODE_ENV.padEnd(25)} ║
║ Port: ${String(PORT).padEnd(31)} ║
║ Host: 0.0.0.0 (all interfaces)        ║
╚════════════════════════════════════════╝
  `);

  console.log('📍 Available Endpoints:');
  console.log(`   GET  /              - API root (health check)`);
  console.log(`   GET  /api/health    - Detailed health status`);
  console.log(`   POST /api/analyze   - Analyze meeting transcript`);
});

// Error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use`);
  } else {
    console.error('❌ Server error:', error.message);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📛 SIGTERM received: closing server');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default server;
```

---

## Frontend Deployment

### Step 1: Create Azure Static Web Apps Resource
```bash
# Create resource group (if not exists)
az group create \
  --name meetloom-rg \
  --location "Southeast Asia"

# Create Static Web Apps resource
az staticwebapp create \
  --name meetloom-frontend \
  --resource-group meetloom-rg \
  --source https://github.com/9bishal/meetloom \
  --branch frontend \
  --app-location "client" \
  --api-location "api" \
  --output-location "dist" \
  --build-properties appBuildCommand="npm run build"
```

### Step 2: Verify Frontend Deployment
```bash
# Get deployment status
az staticwebapp show \
  --name meetloom-frontend \
  --resource-group meetloom-rg

# Get default URL
az staticwebapp show \
  --name meetloom-frontend \
  --resource-group meetloom-rg \
  --query "defaultHostname"
```

### Step 3: Configure API Endpoint
Update `staticwebapp.config.json` with your backend API URL:
```json
"rewrite": "https://YOUR-BACKEND-URL/api/*"
```

---

## Backend Deployment

### Step 1: Create App Service Plan
```bash
# Create App Service plan
az appservice plan create \
  --name meetloom-plan \
  --resource-group meetloom-rg \
  --sku B1 \
  --is-linux
```

### Step 2: Create Web App
```bash
# Create Node.js web app
az webapp create \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --plan meetloom-plan \
  --runtime "NODE|22-lts"
```

### Step 3: Configure Application Settings
```bash
# Set environment variables
az webapp config appsettings set \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --settings \
    "GROQ_API_KEY=your-groq-api-key-here" \
    "NODE_ENV=production" \
    "PORT=8080" \
    "WEBSITE_NODE_DEFAULT_VERSION=~22" \
    "SCM_DO_BUILD_DURING_DEPLOYMENT=true"
```

### Step 4: Set Startup Command
```bash
# Configure startup script
az webapp config set \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --startup-file "startup.sh"
```

### Step 5: Deploy Code from Git Archive
```bash
# Deploy from backend branch as zip
az webapp deployment source config-zip \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --src <(cd /Users/bishalkumarshah/meetloom && git archive --format zip backend)
```

### Step 6: Restart App Service
```bash
# Restart to apply changes
az webapp restart \
  --name meetloom-api \
  --resource-group meetloom-rg
```

### Step 7: Verify Backend Deployment
```bash
# Get app URL
az webapp show \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --query "defaultHostNames[0]"

# Test health endpoint
curl https://meetloom-api.azurewebsites.net/api/health
```

---

## Verification & Testing

### Test Frontend
```bash
# Open in browser
https://YOUR-FRONTEND-URL

# Check console for API connection errors
```

### Test Backend Health
```bash
# Health check endpoint
curl https://meetloom-api.azurewebsites.net/api/health

# Expected response
{
  "success": true,
  "message": "MeetLoom API is healthy",
  "status": "ok",
  "timestamp": "2026-05-15T12:34:56.789Z",
  "environment": "production",
  "version": "1.0.0"
}
```

### Test Analyze Endpoint
```bash
# Send test transcript
curl -X POST https://meetloom-api.azurewebsites.net/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript": "John: Let'\''s discuss the Q2 roadmap. Sarah: I agree, we should focus on performance improvements."}'

# Expected response
{
  "success": true,
  "data": {
    "summary": "Discussion about Q2 roadmap with focus on performance improvements",
    "tasks": [...]
  }
}
```

---

## Troubleshooting

### Issue: 500 Internal Server Error

**Cause:** Missing dependencies or incorrect configuration

**Solution:**
```bash
# Check logs
az webapp log tail --name meetloom-api --resource-group meetloom-rg

# Redeploy code
az webapp deployment source config-zip \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --src <(cd /Users/bishalkumarshah/meetloom && git archive --format zip backend)

# Restart app
az webapp restart --name meetloom-api --resource-group meetloom-rg
```

### Issue: API Key Not Working

**Cause:** Invalid or missing GROQ_API_KEY

**Solution:**
```bash
# Verify API key is set correctly
az webapp config appsettings show \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --query "[?name=='GROQ_API_KEY']"

# Update API key if needed
az webapp config appsettings set \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --settings "GROQ_API_KEY=your-new-key-here"
```

### Issue: Static Web Apps Not Connecting to Backend

**Cause:** Incorrect API endpoint in staticwebapp.config.json

**Solution:**
```bash
# Update config with correct backend URL
# Edit staticwebapp.config.json and redeploy frontend branch

# Verify CORS headers in backend
# Check app.js middleware configuration
```

### Issue: 502 Bad Gateway

**Cause:** App Service not started or port configuration issue

**Solution:**
```bash
# Verify port is set to 8080
az webapp config appsettings show \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --query "[?name=='PORT']"

# Verify startup script runs without errors
az webapp log tail --name meetloom-api --resource-group meetloom-rg

# Restart service
az webapp restart --name meetloom-api --resource-group meetloom-rg
```

---

## Git Branch Strategy

### master branch
- Complete monorepo with all files
- Used for local development
- Contains both client and server

### frontend branch
- Optimized for Azure Static Web Apps
- Contains client/ and server/ (for reference)
- Deployed to Static Web Apps
- Trigger: Push to `frontend` branch

### backend branch
- Optimized for Azure App Service
- Contains client/ and server/ (full stack)
- Deployed to App Service
- Trigger: Push to `backend` branch

---

## Environment Variables

### Backend (server/server.js)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GROQ_API_KEY` | Yes | - | Groq API key for meeting analysis |
| `PORT` | No | 8080 | Server port |
| `NODE_ENV` | No | production | Environment (development/production) |
| `CORS_ORIGIN` | No | * | CORS allowed origin |

### Frontend (client)
| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | No | /api | Backend API base URL |

---

## Quick Reference Commands

```bash
# View all resources
az resource list --resource-group meetloom-rg --output table

# View app configuration
az webapp config show --name meetloom-api --resource-group meetloom-rg

# View app settings
az webapp config appsettings list --name meetloom-api --resource-group meetloom-rg

# Check deployment history
az webapp deployment list --name meetloom-api --resource-group meetloom-rg

# Stream logs
az webapp log tail --name meetloom-api --resource-group meetloom-rg

# Delete resources (if needed)
az group delete --name meetloom-rg --yes --no-wait
```

---

## Support & Resources

- [Azure Static Web Apps Documentation](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure App Service Node.js Documentation](https://learn.microsoft.com/en-us/azure/app-service/quickstart-nodejs)
- [Azure CLI Reference](https://learn.microsoft.com/en-us/cli/azure/)
- [MeetLoom GitHub Repository](https://github.com/9bishal/meetloom)

---

**Last Updated:** May 15, 2026  
**MeetLoom Version:** 1.0.0
