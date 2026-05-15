# MeetLoom Azure Deployment - Complete Setup Guide

## 📖 Start Here

Welcome! This directory contains everything needed to deploy MeetLoom to Microsoft Azure with CI/CD automation.

**Estimated Setup Time**: 1-2 hours  
**Difficulty Level**: Intermediate  
**Prerequisites**: Azure account, GitHub account, Node.js 20+

## 🎯 What You'll Get

After following this guide, your application will be:

- ✅ **Frontend** deployed to Azure Static Web Apps (CDN, automatic HTTPS, free tier available)
- ✅ **Backend** deployed to Azure App Service (always-on, auto-heal, scalable)
- ✅ **CI/CD** automated with GitHub Actions (automatic deployments on code push)
- ✅ **HTTPS** enabled everywhere (auto-provisioned SSL certificates)
- ✅ **Monitoring** configured with logging and health checks
- ✅ **Production-ready** with security headers and best practices

**Result URLs**:
- Frontend: `https://meetloom-ui.azurestaticapps.net`
- Backend: `https://meetloom-api.azurewebsites.net`

## 📚 Documentation Files

Read these in order:

### 1. **DEPLOYMENT-SUMMARY.md** (5-10 minutes) ⭐ START HERE
   Quick overview of what's been set up, 4-phase deployment checklist, and key features.
   ```bash
   cat DEPLOYMENT-SUMMARY.md
   ```

### 2. **AZURE-DEPLOYMENT-GUIDE.md** (30-45 minutes) - REFERENCE MANUAL
   Comprehensive 500+ line guide with:
   - Prerequisites and tools
   - Step-by-step Azure resource setup (Portal + CLI)
   - Environment variable configuration
   - GitHub Actions setup
   - Troubleshooting (20+ solutions)
   - Scaling and monitoring
   - Cost breakdown

### 3. **ENVIRONMENT-VARIABLES.md** (10-15 minutes)
   How to set up environment variables:
   - Frontend variables (VITE_API_URL)
   - Backend variables (API keys, etc.)
   - GitHub Secrets setup
   - Verification steps

### 4. **DEPLOYMENT-FILES.md** (Reference)
   Inventory and description of all deployment files:
   - Configuration files (JSON)
   - GitHub workflows (YAML)
   - Documentation
   - What each file does

## 🚀 Quick Start (4 Steps)

### Step 1: Run Setup Script (15 minutes)

The automated script creates all Azure resources:

```bash
bash azure-setup.sh
```

**What it does:**
- Checks Azure CLI installation
- Prompts for your configuration
- Creates resource group
- Creates Static Web Apps (frontend)
- Creates App Service (backend)
- Configures all settings
- Generates publish profile

**You'll need:**
- Azure subscription (free trial works)
- GitHub token (for repo access)
- GitHub repo URL

### Step 2: Configure GitHub Secrets (5 minutes)

Copy secrets from script output to GitHub:

1. Go to: GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Create these secrets:
   - `AZURE_STATIC_WEB_APPS_API_TOKEN` ← from script
   - `AZURE_PUBLISH_PROFILE` ← from `publish-profile.xml`
   - `GROK_API_KEY` ← your API key
   - `OPENAI_API_KEY` ← your API key (optional)

### Step 3: Configure Azure Environment Variables (5 minutes)

Set these in Azure Portal:

**Static Web Apps** (Settings → Configuration):
```
VITE_API_URL = https://meetloom-api.azurewebsites.net
NODE_ENV = production
```

**App Service** (Settings → Configuration):
```
PORT = 8080
NODE_ENV = production
GROK_API_KEY = your_key
OPENAI_API_KEY = your_key (optional)
```

### Step 4: Deploy (Automatic)

Push code to main branch:

```bash
git add .
git commit -m "Configure Azure deployment"
git push origin main
```

**GitHub Actions will automatically:**
1. Build and lint code
2. Deploy frontend to Static Web Apps
3. Deploy backend to App Service
4. Run health checks

**Monitor at**: GitHub repo → **Actions** tab

## 📋 Configuration Files Overview

### staticwebapp.config.json
Routes and security settings for frontend hosting.
- Routes API calls to backend
- Sets up SPA routing
- Configures security headers

### azure-app-service-config.json
Runtime settings for backend service.
- Node.js 20 configuration
- Always-on setting (prevents shutdown)
- Auto-heal configuration
- Logging settings

### .github/workflows/deploy-frontend.yml
Automated frontend deployment.
- Triggers on push to main
- Builds Vite app
- Runs linting
- Deploys to Azure

### .github/workflows/deploy-backend.yml
Automated backend deployment.
- Triggers on push to main
- Builds Node.js app
- Runs health checks
- Deploys to Azure

## 🔍 File Structure

```
meetloom/
├── DEPLOYMENT-SUMMARY.md           ← START HERE
├── AZURE-DEPLOYMENT-GUIDE.md       ← Full reference guide
├── ENVIRONMENT-VARIABLES.md        ← Env var setup
├── DEPLOYMENT-FILES.md             ← File inventory
├── README-AZURE.md                 ← This file
├── azure-setup.sh                  ← Automated setup script (executable)
├── staticwebapp.config.json        ← Frontend hosting config
├── azure-app-service-config.json   ← Backend config
├── .github/workflows/
│   ├── deploy-frontend.yml         ← Frontend CI/CD
│   ├── deploy-backend.yml          ← Backend CI/CD
│   └── validate-deployment.yml     ← Configuration validation
├── client/                         ← React + Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── server/                         ← Node.js + Express backend
    ├── app.js
    ├── server.js
    └── package.json
```

## ⚠️ Prerequisites

### Required

- [ ] Azure subscription (free tier or pay-as-you-go)
- [ ] GitHub account with repository push access
- [ ] Node.js 20+ installed locally (for testing)
- [ ] Git installed

### Optional but Recommended

- [ ] Azure CLI: `brew install azure-cli` (Mac) or [Download](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- [ ] jq for JSON validation: `brew install jq` (Mac)

### API Keys

Obtain at least one:
- **Grok API Key**: Sign up at [console.x.ai](https://console.x.ai)
- **OpenAI API Key**: Sign up at [platform.openai.com](https://platform.openai.com)

## 🔐 Security Notes

**Never commit**:
- `.env` files
- API keys
- Publish profiles
- Credentials

**Always use**:
- GitHub Secrets for sensitive values
- Azure Key Vault for production
- HTTPS enforcement (automatic)
- Environment variable separation

## 🆘 Troubleshooting

### Script won't run
```bash
chmod +x azure-setup.sh    # Make executable
bash azure-setup.sh        # Run explicitly with bash
```

### Azure CLI not found
```bash
# Install Azure CLI
brew install azure-cli     # Mac
# or visit: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli
```

### GitHub Actions deployment fails
1. Check GitHub Secrets are set correctly
2. Verify secret values don't have extra spaces
3. Check publish profile is valid XML
4. View logs in GitHub Actions tab

### Frontend shows blank page
1. Verify build completed in GitHub Actions
2. Check VITE_API_URL is set in Static Web Apps
3. Hard refresh browser: `Cmd+Shift+R` (Mac)

### Backend returns 502 error
1. Check if app service started: `az webapp restart --resource-group meetloom-rg --name meetloom-api`
2. View logs: `az webapp log tail --resource-group meetloom-rg --name meetloom-api`
3. Verify env vars are set: `az webapp config appsettings list --resource-group meetloom-rg --name meetloom-api`

**For more issues**, see: **AZURE-DEPLOYMENT-GUIDE.md** → Troubleshooting section

## 📞 Help & Support

1. **First Time?** → Read DEPLOYMENT-SUMMARY.md
2. **Need Details?** → Read AZURE-DEPLOYMENT-GUIDE.md
3. **Setup Issues?** → Check Troubleshooting section above
4. **Env Var Problems?** → Read ENVIRONMENT-VARIABLES.md
5. **Still Stuck?** → Check file names in DEPLOYMENT-FILES.md

## ✅ Verification Checklist

After deployment, verify everything:

- [ ] Frontend loads at `https://meetloom-ui.azurestaticapps.net`
- [ ] Backend API responds at `https://meetloom-api.azurewebsites.net/`
- [ ] API returns JSON: `{"success": true, "message": "MeetLoom API is running"}`
- [ ] Frontend can fetch from backend (test in browser console)
- [ ] GitHub Actions shows successful deployments
- [ ] No errors in Azure logs

**Test frontend connection**:
```javascript
// Open browser console and run:
fetch('https://meetloom-api.azurewebsites.net/')
  .then(r => r.json())
  .then(data => console.log('✅ Connected:', data))
  .catch(e => console.error('❌ Error:', e))
```

## 💰 Cost Estimate

| Service | Tier | Monthly Cost |
|---------|------|-------------|
| Static Web Apps | Free | $0 |
| App Service | B1 (Basic) | ~$12.50 |
| Storage/Bandwidth | Minimal | Varies |
| **Total (Minimum)** | | **~$12.50** |

**Cost Optimization**:
- Start with free/B1 tiers
- Scale up only if needed
- Monitor usage in Azure Cost Management

## 🎓 Learning Resources

- [Azure Static Web Apps Docs](https://learn.microsoft.com/en-us/azure/static-web-apps/)
- [Azure App Service Docs](https://learn.microsoft.com/en-us/azure/app-service/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Azure CLI Reference](https://learn.microsoft.com/en-us/cli/azure/reference-index)

## 📊 Architecture

```
┌─────────────────────────────────────────────────────┐
│  Internet Users                                       │
└─────────────────────────────────────────────────────┘
            │                          │
            ▼                          ▼
    ┌─────────────────┐        ┌────────────────┐
    │ Static Web Apps │        │  App Service   │
    │   (Frontend)    │        │   (Backend)    │
    │ https://meetloom│        │ https://meetloom│
    │ -ui.azure       │        │ -api.azure     │
    │ staticapps.net  │        │ websites.net   │
    └─────────────────┘        └────────────────┘
            │                          │
            ├──────────────┬───────────┘
            │              │
            ▼              ▼
    ┌──────────────────────────┐
    │   GitHub Actions CI/CD   │
    │   (Auto Deployment)      │
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │  GitHub Repository       │
    │  (Code, Workflows)       │
    └──────────────────────────┘
            │
            ▼
    ┌──────────────────────────┐
    │  Grok/OpenAI API         │
    │  (AI Processing)         │
    └──────────────────────────┘
```

## 🚀 Next Steps

1. **Read**: DEPLOYMENT-SUMMARY.md (5 min)
2. **Run**: `bash azure-setup.sh` (15 min)
3. **Configure**: GitHub Secrets (5 min)
4. **Deploy**: `git push origin main` (automatic)
5. **Verify**: Check both URLs work (5 min)

**Total time**: ~30 minutes for first-time setup

---

## 📝 File Reference

| File | Purpose | Size |
|------|---------|------|
| `DEPLOYMENT-SUMMARY.md` | Quick reference | ~8 KB |
| `AZURE-DEPLOYMENT-GUIDE.md` | Complete guide | ~30 KB |
| `ENVIRONMENT-VARIABLES.md` | Env var setup | ~10 KB |
| `DEPLOYMENT-FILES.md` | File inventory | ~15 KB |
| `azure-setup.sh` | Automated setup | ~8 KB |
| `staticwebapp.config.json` | Frontend config | ~1.5 KB |
| `azure-app-service-config.json` | Backend config | ~2 KB |
| `.github/workflows/*` | CI/CD pipelines | ~5 KB total |

---

**Created**: 2024  
**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Support**: See documentation files above

**Start with**: DEPLOYMENT-SUMMARY.md →→→ Run: bash azure-setup.sh →→→ Deploy: git push origin main
