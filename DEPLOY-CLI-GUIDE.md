# 🚀 MeetLoom Azure CLI Deployment Guide

**Quick Deploy via CLI** - Automate as much as possible, with clear instructions for manual steps.

---

## 📋 Prerequisites

Before running the deployment script, ensure you have:

```bash
# Check Azure CLI
az --version

# Check Git
git --version

# Check Node.js
node --version

# Login to Azure (if not already logged in)
az login
```

If any are missing, install them:
- **Azure CLI:** https://docs.microsoft.com/cli/azure/install-azure-cli
- **Git:** https://git-scm.com/downloads
- **Node.js:** https://nodejs.org/

---

## 🚀 Quick Start: 3 Commands

### Option 1: Full Automated Deployment (Recommended)

```bash
# 1. Run the automated deployment script
cd /Users/bishalkumarshah/meetloom
chmod +x deploy-azure-cli.sh
./deploy-azure-cli.sh

# The script will guide you through the process
# Follow all prompts carefully
```

### Option 2: Manual Step-by-Step

If you prefer manual control, follow the steps below.

---

## 📋 Manual Deployment Steps (if not using script)

### Step 1: Login to Azure

```bash
az login
```

### Step 2: Create Resource Group

```bash
az group create \
  --name meetloom-rg \
  --location eastus
```

### Step 3: Create Static Web App (Frontend)

```bash
az staticwebapp create \
  --name meetloom-web \
  --resource-group meetloom-rg \
  --source https://github.com/YOUR_USERNAME/meetloom \
  --branch master \
  --login-with-github \
  --token YOUR_GITHUB_PAT \
  --build-folder client \
  --app-build-folder dist
```

**Note:** You need a GitHub Personal Access Token (PAT). Get one at:
https://github.com/settings/tokens

Scopes needed:
- `public_repo`
- `workflow`

### Step 4: Create App Service Plan (Backend)

```bash
az appservice plan create \
  --name meetloom-api-plan \
  --resource-group meetloom-rg \
  --sku B1 \
  --is-linux
```

### Step 5: Create App Service (Backend)

```bash
az webapp create \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --plan meetloom-api-plan \
  --runtime "NODE|20-lts"
```

### Step 6: Configure App Service

```bash
# Enable Always On
az webapp config set \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --always-on true

# Set startup command
az webapp config appsettings set \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --settings STARTUP_COMMAND="npm start"
```

### Step 7: Set Environment Variables

```bash
az webapp config appsettings set \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --settings \
    GROQ_API_KEY="your-grok-api-key" \
    NODE_ENV="production" \
    CORS_ORIGIN="https://meetloom-web.azurewebsites.net" \
    PORT="8080"
```

---

## ⚙️ Manual Configuration Steps (Cannot be Automated)

These steps MUST be done manually in GitHub and Azure Portal.

### 1. Get Static Web App Deployment Token

**Location:** Azure Portal → Static Web Apps → meetloom-web → Manage deployment token

```bash
# Copy the token and add to GitHub Secrets:
# AZURE_STATIC_WEB_APPS_API_TOKEN = [paste here]
```

**Steps:**
1. Go to: https://portal.azure.com
2. Search for: "Static Web Apps"
3. Click: "meetloom-web"
4. Left menu → "Manage deployment token"
5. Copy the token
6. Go to: https://github.com/YOUR_USERNAME/meetloom/settings/secrets/actions
7. Click: "New repository secret"
8. Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
9. Value: [paste token]
10. Click: "Add secret"

### 2. Get App Service Publish Profile

**Location:** Azure Portal → App Services → meetloom-api → Download publish profile

```bash
# Or use CLI:
az webapp deployment list-publishing-profiles \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --output table
```

**Steps:**
1. Go to: https://portal.azure.com
2. Search for: "App Services"
3. Click: "meetloom-api"
4. Top menu → "Get publish profile" (download button)
5. Open the downloaded file with text editor
6. Copy all content
7. Go to: https://github.com/YOUR_USERNAME/meetloom/settings/secrets/actions
8. Click: "New repository secret"
9. Name: `AZURE_APP_SERVICE_PUBLISH_PROFILE`
10. Value: [paste entire XML content]
11. Click: "Add secret"

### 3. Add GitHub Secrets

**Required Secrets:**

| Secret Name | Value | How to Get |
|------------|-------|-----------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Static Web App token | Step 1 above |
| `AZURE_APP_SERVICE_PUBLISH_PROFILE` | App Service profile | Step 2 above |
| `AZURE_APP_SERVICE_NAME` | `meetloom-api` | Type this |
| `AZURE_SUBSCRIPTION_ID` | Your subscription ID | `az account show --query id -o tsv` |

**How to add secrets:**
1. Go to: https://github.com/YOUR_USERNAME/meetloom
2. Click: Settings (top menu)
3. Left sidebar: "Secrets and variables" → "Actions"
4. Click: "New repository secret"
5. Add each secret from table above
6. Click: "Add secret"

### 4. Verify App Service Settings

**Steps:**
1. Go to: https://portal.azure.com
2. Search for: "App Services"
3. Click: "meetloom-api"
4. Left menu: "Configuration"
5. Check Application settings tab:
   - `GROQ_API_KEY` ✅
   - `NODE_ENV` = "production" ✅
   - `CORS_ORIGIN` = "https://meetloom-web.azurewebsites.net" ✅
   - `PORT` = "8080" ✅

If any are missing, click "New application setting" and add them.

---

## 🧪 Verification Commands

After setup, verify everything is working:

```bash
# Check subscription
az account show

# Check resource group
az group show --name meetloom-rg

# Check Static Web App
az staticwebapp show --name meetloom-web --resource-group meetloom-rg

# Check App Service
az webapp show --name meetloom-api --resource-group meetloom-rg

# View App Service environment variables
az webapp config appsettings list \
  --name meetloom-api \
  --resource-group meetloom-rg

# View App Service logs (real-time)
az webapp log tail --name meetloom-api --resource-group meetloom-rg

# View deployment history
az webapp deployment list --name meetloom-api --resource-group meetloom-rg
```

---

## 🚀 Trigger First Deployment

After everything is configured:

```bash
# Push to GitHub (this triggers the workflows)
git push origin master

# Monitor in GitHub:
# 1. Go to: https://github.com/YOUR_USERNAME/meetloom/actions
# 2. Watch the workflows run
# 3. Wait for both to complete successfully
```

---

## ✅ Post-Deployment Tests

Once deployment completes:

```bash
# 1. Test frontend is live
curl https://meetloom-web.azurewebsites.net/
# Expected: HTML response

# 2. Test backend health
curl https://meetloom-api.azurewebsites.net/api/health
# Expected: {"status":"ok","timestamp":"..."}

# 3. Test API endpoint
curl -X POST https://meetloom-api.azurewebsites.net/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript":"test"}'
# Expected: Analysis result
```

---

## 🆘 Troubleshooting

### Azure CLI Login Failed

```bash
# Clear cached credentials
az logout

# Login again
az login

# If using service principal:
az login --service-principal \
  -u <app-id> \
  -p <app-secret> \
  --tenant <tenant-id>
```

### Static Web App Build Failed

Check logs:
```bash
az staticwebapp show --name meetloom-web --resource-group meetloom-rg
```

See: Azure Portal → Static Web Apps → meetloom-web → Build history

### App Service Not Starting

Check logs:
```bash
# Real-time logs
az webapp log tail --name meetloom-api --resource-group meetloom-rg

# App settings
az webapp config appsettings list --name meetloom-api --resource-group meetloom-rg

# Restart app
az webapp restart --name meetloom-api --resource-group meetloom-rg
```

### CORS Errors

Update CORS origin:
```bash
az webapp config appsettings set \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --settings CORS_ORIGIN="https://YOUR_STATIC_WEB_APP_URL"
```

Then restart:
```bash
az webapp restart --name meetloom-api --resource-group meetloom-rg
```

---

## 📊 Useful CLI Commands

```bash
# List all resources in resource group
az resource list --resource-group meetloom-rg --output table

# Update environment variable
az webapp config appsettings set \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --settings GROQ_API_KEY="new-key"

# Delete entire deployment (if needed)
az group delete --name meetloom-rg --yes --no-wait

# Get metrics
az monitor metrics list --resource /subscriptions/SUB_ID/resourceGroups/meetloom-rg/providers/Microsoft.Web/sites/meetloom-api

# Scale up App Service
az appservice plan update \
  --name meetloom-api-plan \
  --resource-group meetloom-rg \
  --sku S1
```

---

## 📝 Deployment Checklist

- [ ] Install Azure CLI, Git, Node.js
- [ ] Run `az login` and verify subscription
- [ ] Run `./deploy-azure-cli.sh` OR follow manual steps
- [ ] Get Static Web App deployment token
- [ ] Get App Service publish profile
- [ ] Add all GitHub Secrets
- [ ] Verify App Service environment variables
- [ ] Run `git push origin master`
- [ ] Monitor GitHub Actions workflows
- [ ] Test frontend and backend URLs
- [ ] Check Application Logs in Azure Portal

---

## 🎯 What Gets Done Automatically

✅ Resource Group creation  
✅ Static Web App creation  
✅ App Service Plan creation  
✅ App Service creation  
✅ App Service configuration (Always On, startup command)  
✅ Initial environment variables setup  

---

## 📝 What Must Be Done Manually

❌ Get Static Web App deployment token  
❌ Get App Service publish profile  
❌ Add GitHub Secrets  
❌ Verify final configuration in Azure Portal  
❌ Push to GitHub to trigger deployment  
❌ Monitor first deployment

---

## 📞 Support

- **Azure CLI Docs:** https://docs.microsoft.com/cli/azure/
- **GitHub Actions:** https://docs.github.com/actions
- **Troubleshooting Guide:** See `AZURE-DEPLOYMENT-GUIDE.md`

---

**Status:** Ready to Deploy 🚀
