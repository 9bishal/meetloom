# MeetLoom Azure Deployment Guide

Complete guide for deploying the MeetLoom full-stack application to Microsoft Azure with CI/CD automation.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Azure Resources Setup](#azure-resources-setup)
4. [Configuration](#configuration)
5. [GitHub Setup](#github-setup)
6. [Deployment](#deployment)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)
9. [Scaling & Monitoring](#scaling--monitoring)
10. [Costs](#costs)

---

## Prerequisites

### Required Tools
- Azure account with active subscription (free tier eligible for initial testing)
- GitHub account with your repository
- Node.js 20.x (ensure locally for testing)
- Azure CLI (optional but recommended): `brew install azure-cli`

### Subscription Requirements
- Minimum: Free tier or Pay-As-You-Go
- Static Web Apps: Free tier includes 1 GB/month
- App Service: Free or B1 tier recommended

### API Keys Required
- Grok API key (from xAI) or OpenAI API key
- Ensure you have budget allocated for API calls

---

## Architecture Overview

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│  (Push to main branch → Triggers GitHub Actions)            │
└─────────────────────────────────────────────────────────────┘
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│ Frontend Workflow│   │ Backend Workflow │
│  (deploy-        │   │  (deploy-        │
│   frontend.yml)  │   │   backend.yml)   │
└─────────────────┘   └──────────────────┘
         │                     │
         ▼                     ▼
┌─────────────────────┐ ┌─────────────────────┐
│ Azure Static Web    │ │ Azure App Service   │
│ Apps (Frontend)     │ │ (Backend)           │
│                     │ │                     │
│ https://meetloom-ui │ │ https://meetloom-api│
│ .azurestaticapps    │ │ .azurewebsites      │
│ .net                │ │ .net                │
└─────────────────────┘ └─────────────────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌────────────────────┐
         │  Grok/OpenAI API   │
         │   (External)       │
         └────────────────────┘
```

### Components

| Component | Service | URL | Runtime |
|-----------|---------|-----|---------|
| Frontend | Azure Static Web Apps | https://meetloom-ui.azurestaticapps.net | Managed |
| Backend | Azure App Service | https://meetloom-api.azurewebsites.net | Node.js 20 |
| Database | None (stateless) | N/A | N/A |
| CI/CD | GitHub Actions | GitHub | Managed |

---

## Azure Resources Setup

### Step 1: Create Resource Group

```bash
# Login to Azure
az login

# Create resource group
az group create \
  --name meetloom-rg \
  --location eastus

# Verify
az group show --name meetloom-rg
```

### Step 2: Create Azure Static Web Apps (Frontend)

#### Option A: Using Azure Portal

1. Navigate to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → Search for **Static Web App**
3. Fill in details:
   - **Name**: `meetloom-ui`
   - **Plan type**: Free (for initial deployment)
   - **Azure Functions API location**: East US
   - **Repository**: Select your GitHub repo
   - **Branch**: `main`
   - **Build presets**: Vite
   - **App location**: `client`
   - **API location**: (leave empty - using external backend)
   - **Output location**: `dist`

4. Complete the wizard - GitHub Actions workflow will be created automatically

#### Option B: Using Azure CLI

```bash
az staticwebapp create \
  --name meetloom-ui \
  --resource-group meetloom-rg \
  --location eastus \
  --branch main \
  --repo-url https://github.com/YOUR_USERNAME/meetloom \
  --repository-token YOUR_GITHUB_PAT \
  --app-location "client" \
  --output-location "dist" \
  --build-properties-app-build-command "npm run build" \
  --build-properties-app-install-command "npm ci"
```

### Step 3: Create Azure App Service (Backend)

#### Option A: Using Azure Portal

1. Navigate to [Azure Portal](https://portal.azure.com)
2. Click **Create a resource** → Search for **App Service**
3. Fill in details:
   - **Name**: `meetloom-api`
   - **Publish**: Code
   - **Runtime stack**: Node 20
   - **Operating System**: Linux
   - **Region**: East US (same as Static Web Apps)
   - **App Service Plan**: 
     - Create new: `meetloom-api-plan`
     - Pricing tier: Free (B1 recommended for production)

4. Click **Review + Create** → **Create**

#### Option B: Using Azure CLI

```bash
# Create App Service Plan
az appservice plan create \
  --name meetloom-api-plan \
  --resource-group meetloom-rg \
  --sku B1 \
  --is-linux

# Create App Service
az webapp create \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --plan meetloom-api-plan \
  --runtime "NODE:20-lts"
```

### Step 4: Configure App Service Settings

```bash
# Enable Always On (prevents app from stopping after 20 min of inactivity)
az webapp config set \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --always-on true

# Enable HTTPS only
az webapp update \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --https-only

# Set Node environment to production
az webapp config appsettings set \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --settings NODE_ENV=production

# Set startup command
az webapp config set \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --startup-file "node server.js"
```

### Step 5: Get Publish Profile

For GitHub Actions deployment:

```bash
# Get publish profile
az webapp deployment list-publishing-profiles \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --query "[?publishMethod=='MSDeploy'].publishProfile" \
  --output tsv > profile.publishsettings

cat profile.publishsettings
```

---

## Configuration

### Step 1: Static Web Apps Configuration

The `staticwebapp.config.json` file is already created with:

- **API routing** to backend
- **Fallback** to index.html for SPA
- **Security headers** (CSP, X-Frame-Options, etc.)
- **Cache headers** for assets

**Key sections:**

```json
{
  "routes": [
    {
      "route": "/api/*",
      "rewrite": "https://meetloom-api.azurewebsites.net/api/*"
    },
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ]
}
```

### Step 2: App Service Configuration

The `azure-app-service-config.json` file includes:

- **Runtime**: Node.js 20
- **Always On**: Enabled (prevents idle shutdown)
- **Auto-heal**: Enabled (automatically restarts on repeated 500 errors)
- **HTTP logging**: Enabled
- **Request tracing**: Enabled

### Step 3: Environment Variables Setup

#### Frontend Environment Variables

In **Azure Static Web Apps**:

1. Go to **Settings** → **Configuration**
2. Add these **Application settings**:
   ```
   VITE_API_URL = https://meetloom-api.azurewebsites.net
   NODE_ENV = production
   ```

Frontend build uses these at compile time (not runtime).

#### Backend Environment Variables

In **Azure App Service**:

1. Go to **Settings** → **Configuration** → **Application settings**
2. Add these **settings**:

   ```
   PORT = 8080
   NODE_ENV = production
   GROK_API_KEY = your_grok_api_key_here
   OPENAI_API_KEY = your_openai_api_key_here (if using OpenAI)
   ```

3. Or via CLI:

   ```bash
   az webapp config appsettings set \
     --resource-group meetloom-rg \
     --name meetloom-api \
     --settings \
       PORT=8080 \
       NODE_ENV=production \
       GROK_API_KEY="your_key" \
       OPENAI_API_KEY="your_key"
   ```

**Important**: Never commit API keys to GitHub. Use GitHub Secrets instead.

### Step 4: CORS Configuration

The backend CORS middleware already handles requests from:
- `https://meetloom-ui.azurestaticapps.net`
- `http://localhost:3000` (for local development)

Verify in `server/middleware/cors.js`:

```javascript
const ALLOWED_ORIGINS = [
  'https://meetloom-ui.azurestaticapps.net',
  'http://localhost:3000',
  'http://localhost:5173',
];
```

---

## GitHub Setup

### Step 1: Create GitHub Secrets

These secrets allow GitHub Actions to deploy to Azure:

1. Go to **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions**

2. Create these secrets:

   | Secret Name | Value |
   |------------|-------|
   | `AZURE_STATIC_WEB_APPS_API_TOKEN` | From Static Web Apps → Manage deployment token |
   | `AZURE_PUBLISH_PROFILE` | The publish profile XML from App Service |
   | `GROK_API_KEY` | Your Grok API key |
   | `OPENAI_API_KEY` | Your OpenAI API key (if used) |

### Step 2: Get Static Web Apps Deployment Token

```bash
# Using Azure CLI
az staticwebapp secrets list \
  --name meetloom-ui \
  --resource-group meetloom-rg
```

Or from Azure Portal:
1. Go to **Static Web Apps** → `meetloom-ui`
2. **Manage deployment token** in the top bar
3. Copy the token

### Step 3: Get App Service Publish Profile

```bash
# Using Azure CLI (already shown above)
az webapp deployment list-publishing-profiles \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --query "[?publishMethod=='MSDeploy'].publishProfile" \
  --output tsv
```

Or from Azure Portal:
1. Go to **App Service** → `meetloom-api`
2. Click **Download publish profile** (right side)
3. Open XML file and copy entire contents

### Step 4: GitHub Actions Workflows

The following workflows are already created:

- **`.github/workflows/deploy-frontend.yml`**: Deploys frontend to Static Web Apps
- **`.github/workflows/deploy-backend.yml`**: Deploys backend to App Service
- **`.github/workflows/validate-deployment.yml`**: Validates configuration files

These trigger automatically on pushes to `main` branch.

---

## Deployment

### Automatic Deployment (Recommended)

Simply push to the `main` branch:

```bash
git add .
git commit -m "Deploy to Azure"
git push origin main
```

**GitHub Actions will automatically:**
1. Install dependencies
2. Run linting
3. Build frontend & backend
4. Deploy to Azure Static Web Apps & App Service
5. Run post-deployment health checks

Monitor progress:
1. Go to **GitHub Repository** → **Actions**
2. Click the running workflow
3. View real-time logs

### Manual Deployment

If you need to deploy without pushing code:

#### Frontend

```bash
# Using Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Build frontend
cd client && npm run build && cd ..

# Deploy (requires auth)
swa deploy ./client/dist \
  --deployment-token $AZURE_STATIC_WEB_APPS_API_TOKEN
```

#### Backend

```bash
# Using Azure CLI
az webapp deployment source config-zip \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --src server.zip
```

---

## Post-Deployment

### Step 1: Verify Deployment

#### Frontend

```bash
# Should return 200 and display app
curl -I https://meetloom-ui.azurestaticapps.net

# Test API routing
curl https://meetloom-ui.azurestaticapps.net/ -I
```

#### Backend

```bash
# Health check
curl https://meetloom-api.azurewebsites.net/

# Should return:
# {
#   "success": true,
#   "message": "MeetLoom API is running",
#   "version": "1.0.0"
# }

# Test analyze endpoint
curl -X POST https://meetloom-api.azurewebsites.net/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript": "Meeting notes here..."}'
```

### Step 2: Test API Integration

From frontend (browser console):

```javascript
// Test API connectivity
fetch('https://meetloom-api.azurewebsites.net/')
  .then(r => r.json())
  .then(data => console.log('✅ Backend connected:', data))
  .catch(e => console.error('❌ Backend error:', e))
```

### Step 3: Custom Domain (Optional)

To use your own domain:

**Static Web Apps:**
1. Go to **Settings** → **Custom domains**
2. Add your domain
3. Follow DNS verification steps

**App Service:**
1. Go to **Settings** → **Custom domains**
2. Add your domain
3. Follow DNS verification steps
4. Auto-provision SSL certificate

### Step 4: Enable HTTPS

Both services auto-provision SSL from Let's Encrypt (FREE).

Verify HTTPS:
```bash
curl -I https://meetloom-ui.azurestaticapps.net/
curl -I https://meetloom-api.azurewebsites.net/
```

---

## Troubleshooting

### Frontend Issues

#### **White Screen / 404 Errors**

Problem: App shows blank page or 404

**Solutions:**
1. Check build output in GitHub Actions
2. Verify `staticwebapp.config.json` exists and is valid JSON
3. Ensure `vite.config.js` has correct output location (`dist`)
4. Check VITE_API_URL is set correctly

```bash
# Test locally first
cd client && npm run build
npm run preview
```

#### **API Calls Returning 404**

Problem: Frontend can't reach backend

**Solutions:**
1. Verify backend is deployed: `curl https://meetloom-api.azurewebsites.net/`
2. Check CORS headers in response (should allow Static Web Apps domain)
3. Verify API URL in `staticwebapp.config.json` is correct
4. Check browser console Network tab for actual request URL

#### **Styling Not Applied**

Problem: TailwindCSS classes not working

**Solutions:**
1. Verify Tailwind CSS build completed: check `client/dist/` for CSS files
2. Ensure `tailwindcss` is in dependencies (not devDependencies)
3. Check Vite build removed console logs but kept CSS
4. Try hard refresh: `Cmd+Shift+R` on Mac

### Backend Issues

#### **App Service Not Starting**

Problem: Backend shows "Application Insights Unavailable" or 502 error

**Solutions:**
1. Check startup command: `az webapp config show --resource-group meetloom-rg --name meetloom-api`
2. Verify Node.js version: `node --version` should show 20.x
3. Check logs:
   ```bash
   az webapp log tail --resource-group meetloom-rg --name meetloom-api
   ```
4. Verify dependencies installed: `npm ci` (not `npm install`)

#### **"Environment Variable Not Found"**

Problem: App crashes with "GROK_API_KEY is not defined"

**Solutions:**
1. Verify environment variables in Portal: **Settings** → **Configuration**
2. Apply settings: App must restart after configuration changes
3. Force restart:
   ```bash
   az webapp restart --resource-group meetloom-rg --name meetloom-api
   ```
4. Check that keys are actually set (not empty)

#### **502 Bad Gateway**

Problem: Backend returns 502 error

**Solutions:**
1. Check for crashes in logs: `az webapp log tail ...`
2. Verify API endpoints are working:
   ```bash
   curl -v https://meetloom-api.azurewebsites.net/
   ```
3. Check if Auto-heal kicked in (look for recent restarts)
4. Monitor memory/CPU: Azure Portal → **Metrics**

#### **Timeout Errors**

Problem: Requests timeout or hang

**Solutions:**
1. Check if API calls to Grok/OpenAI are slow
2. Increase App Service tier (Free tier has resource limits)
3. Configure timeout in fetch:
   ```javascript
   fetch(url, { signal: AbortSignal.timeout(30000) })
   ```
4. Monitor performance: Azure Portal → **Application Insights** (if enabled)

### GitHub Actions Issues

#### **Deployment Fails with "Permission Denied"**

Problem: GitHub Actions can't deploy

**Solutions:**
1. Verify GitHub Secrets are set correctly
2. Ensure Static Web Apps API token is valid (not expired)
3. Check publish profile XML is complete and valid
4. Regenerate secrets if unsure

#### **Build Fails with "Module Not Found"**

Problem: GitHub Actions build fails during `npm ci`

**Solutions:**
1. Ensure `package-lock.json` is committed to repository
2. Check Node.js version matches locally: `node --version`
3. Verify all dependencies are in `package.json`
4. Try clearing node_modules and reinstalling locally

---

## Scaling & Monitoring

### Monitoring

#### Azure Portal Dashboard

1. Create resource group dashboard:
   ```bash
   az group show --name meetloom-rg --output json | jq
   ```

2. Add metrics to dashboard:
   - Static Web Apps: Page views, build duration
   - App Service: CPU, memory, HTTP response time
   - Application Insights: Request rate, exceptions

#### Application Insights (Optional but Recommended)

```bash
# Create Application Insights resource
az monitor app-insights component create \
  --app meetloom-insights \
  --location eastus \
  --resource-group meetloom-rg \
  --application-type web

# Connect to App Service
az webapp config appsettings set \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --settings APPINSIGHTS_INSTRUMENTATIONKEY=$(az monitor app-insights component show \
    --resource-group meetloom-rg \
    --app meetloom-insights \
    --query instrumentationKey -o tsv)
```

#### Log Streaming

```bash
# Real-time logs
az webapp log tail --resource-group meetloom-rg --name meetloom-api

# Save logs to file
az webapp log tail --resource-group meetloom-rg --name meetloom-api > logs.txt
```

### Scaling Up

#### Frontend (Static Web Apps)

Free tier includes:
- 1 GB bandwidth/month
- 100 MB storage

For more:
1. Go to **Static Web Apps** → `meetloom-ui`
2. **Manage** → Upgrade plan (Standard tier)

#### Backend (App Service)

Increase capacity:

```bash
# View current plan
az appservice plan show --resource-group meetloom-rg --name meetloom-api-plan

# Scale up to Standard tier (more CPU/memory)
az appservice plan update \
  --name meetloom-api-plan \
  --resource-group meetloom-rg \
  --sku S1

# Or scale out (more instances)
az appservice plan update \
  --name meetloom-api-plan \
  --resource-group meetloom-rg \
  --number-of-workers 2
```

### Auto-Scaling

For production, configure auto-scaling:

```bash
# Create auto-scale rule
az monitor autoscale create \
  --name meetloom-autoscale \
  --resource-group meetloom-rg \
  --resource-type "Microsoft.Web/serverFarms" \
  --resource-name meetloom-api-plan \
  --min-count 1 \
  --max-count 3 \
  --count 1
```

---

## Costs

### Estimated Monthly Costs (USD)

| Service | Tier | Cost |
|---------|------|------|
| Static Web Apps | Free | $0 |
| App Service | B1 | ~$12.50 |
| Application Insights | (Optional) | Variable |
| **Total (Free/Minimal)** | | ~$12.50 |
| **Total (With Monitoring)** | | ~$20-30 |

### Cost Optimization

1. **Use Free Tier** for prototyping
2. **Enable Auto-Shutdown** for non-24/7 apps
3. **Monitor usage** via Azure Cost Management
4. **Reserved Instances** for predictable workloads (saves 30-40%)

### View Costs

```bash
# View current costs
az costmanagement query create \
  --scope "/subscriptions/{subscriptionId}" \
  --timeframe TheLastMonth

# Or use Azure Portal: **Cost Management + Billing**
```

---

## Environment Variables Reference

### Frontend (VITE_* are compile-time)

| Variable | Value | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | `https://meetloom-api.azurewebsites.net` | Backend API base URL |
| `NODE_ENV` | `production` | React optimization mode |

Set in **Static Web Apps** → **Settings** → **Configuration**

### Backend (Loaded at runtime)

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | `8080` | Server port (App Service default) |
| `NODE_ENV` | `production` | Express optimization mode |
| `GROK_API_KEY` | `your_key` | Grok API authentication |
| `OPENAI_API_KEY` | `your_key` | OpenAI API (if using) |

Set in **App Service** → **Settings** → **Configuration**

---

## Security Best Practices

1. **Never commit secrets** to Git
2. **Use GitHub Secrets** for sensitive values
3. **Rotate API keys** regularly
4. **Enable HTTPS only** (already configured)
5. **Use Strong CSP headers** (already configured)
6. **Monitor logs** for errors/attacks
7. **Keep dependencies updated** (Dependabot)
8. **Use Azure Key Vault** for production (advanced)

---

## Next Steps

1. ✅ Create Azure resources (Static Web Apps + App Service)
2. ✅ Set up GitHub Secrets
3. ✅ Configure environment variables
4. ✅ Push to main branch to trigger deployment
5. ✅ Verify both frontend and backend are running
6. ✅ Test end-to-end functionality
7. ✅ Set up monitoring and alerts
8. ✅ Configure custom domain (optional)

---

## Quick Reference - CLI Commands

```bash
# View all resources
az resource list --resource-group meetloom-rg

# Check deployment status
az deployment group show --resource-group meetloom-rg --name deployment-name

# View logs
az webapp log tail --resource-group meetloom-rg --name meetloom-api

# Restart services
az webapp restart --resource-group meetloom-rg --name meetloom-api

# Set environment variables
az webapp config appsettings set \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --settings KEY=VALUE

# Get resource URLs
az staticwebapp show --name meetloom-ui --resource-group meetloom-rg --query "defaultDomain"
az webapp show --name meetloom-api --resource-group meetloom-rg --query "defaultHostName"
```

---

## Support & Documentation

- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure App Service Docs](https://learn.microsoft.com/en-us/azure/app-service/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [MeetLoom GitHub](https://github.com/YOUR_USERNAME/meetloom)

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅
