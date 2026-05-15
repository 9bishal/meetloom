# ✅ DEPLOYMENT - AUTOMATED vs MANUAL TASKS

**Complete Breakdown of What Can Be Automated and What Must Be Done Manually**

---

## 🤖 AUTOMATED TASKS (Done by Script)

These tasks are fully automated by the `deploy-azure-cli.sh` script:

```bash
./deploy-azure-cli.sh
```

### ✅ Automated in Azure

- [x] **Create Resource Group** - Container for all resources
- [x] **Create Static Web App** - Frontend hosting
- [x] **Create App Service Plan** - Backend computing resources
- [x] **Create App Service** - Backend hosting
- [x] **Configure Always On** - Keeps backend running 24/7
- [x] **Set Startup Command** - Tells App Service how to start Node.js
- [x] **Set Node.js Version** - Uses Node.js 20 LTS
- [x] **Create Initial App Service Settings** - Basic configuration

### ✅ Automated Output

- [x] **Resource URLs** - Shows you where apps will be hosted
- [x] **Deployment Instructions** - Guide for next steps
- [x] **Verification Commands** - CLI commands to check status

---

## 📝 MANUAL TASKS (Must Be Done by You)

These tasks **CANNOT** be automated and must be completed manually:

### 1️⃣ Get GitHub Personal Access Token (PAT)

**Why:** Script needs permission to connect GitHub to Azure

**Where:** https://github.com/settings/tokens

**Steps:**
```
1. Log in to GitHub
2. Go to: Settings → Developer settings → Personal access tokens → Tokens (classic)
3. Click "Generate new token (classic)"
4. Set name: "Azure MeetLoom Deployment"
5. Check these scopes:
   ✓ repo (all)
   ✓ workflow
6. Click "Generate token"
7. COPY THE TOKEN (you won't see it again!)
```

**How to provide to script:**
```bash
# When script asks "GitHub Personal Access Token (PAT):"
# Paste the token you just created
```

---

### 2️⃣ Get Static Web App Deployment Token

**Why:** GitHub Actions need this to deploy frontend

**Where:** Azure Portal → Static Web Apps → meetloom-web → Manage deployment token

**Steps:**
```
1. Go to: https://portal.azure.com
2. Search for: "Static Web Apps"
3. Click: "meetloom-web"
4. Left sidebar → "Manage deployment token"
5. COPY the token shown
```

**Where to use:**
```
Add to GitHub Secrets:
  Name: AZURE_STATIC_WEB_APPS_API_TOKEN
  Value: [paste the token]
```

**How to add to GitHub:**
```
1. Go to: https://github.com/YOUR_USERNAME/meetloom
2. Click: Settings (top right)
3. Left menu: "Secrets and variables" → "Actions"
4. Click: "New repository secret"
5. Name: AZURE_STATIC_WEB_APPS_API_TOKEN
6. Value: [paste token from Azure]
7. Click: "Add secret"
```

---

### 3️⃣ Get App Service Publish Profile

**Why:** GitHub Actions need this to deploy backend

**Where:** Azure Portal → App Services → meetloom-api → Download publish profile

**Steps:**
```
1. Go to: https://portal.azure.com
2. Search for: "App Services"
3. Click: "meetloom-api"
4. Top menu → "Get publish profile" button
5. File will download (typically .PublishSettings)
6. Open in text editor
7. COPY all the XML content
```

**Where to use:**
```
Add to GitHub Secrets:
  Name: AZURE_APP_SERVICE_PUBLISH_PROFILE
  Value: [paste entire XML content]
```

**How to add to GitHub:**
```
Same as step above, but:
  Name: AZURE_APP_SERVICE_PUBLISH_PROFILE
  Value: [entire XML file content]
```

---

### 4️⃣ Add Required GitHub Secrets

**Why:** GitHub Actions need credentials to deploy to Azure

**Required Secrets:**

| Secret Name | Value | Example |
|---|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | From Step 2 | `eyJ0eXAiOiJ...` |
| `AZURE_APP_SERVICE_PUBLISH_PROFILE` | From Step 3 | `<?xml version="1.0"...` |
| `AZURE_APP_SERVICE_NAME` | Backend app name | `meetloom-api` |
| `AZURE_SUBSCRIPTION_ID` | Your subscription ID | `12345678-1234-1234-1234-123456789012` |

**How to get Subscription ID:**
```bash
az account show --query id -o tsv
```

**How to add each secret:**
```
1. Go to: https://github.com/YOUR_USERNAME/meetloom/settings/secrets/actions
2. For each secret in table above:
   a. Click: "New repository secret"
   b. Name: [secret name from table]
   c. Value: [value from table]
   d. Click: "Add secret"
```

---

### 5️⃣ Set App Service Environment Variables

**Why:** Backend needs these to run properly

**Environment Variables to Set:**

| Variable | Value | Example |
|---|---|---|
| `GROQ_API_KEY` | Your Grok API key | `gsk_dZcSgBSJXwk0g10Pq...` |
| `NODE_ENV` | Should be "production" | `production` |
| `CORS_ORIGIN` | Frontend URL | `https://meetloom-web.azurewebsites.net` |
| `PORT` | Should be "8080" | `8080` |

**How to set in Azure Portal:**
```
1. Go to: https://portal.azure.com
2. Search for: "App Services"
3. Click: "meetloom-api"
4. Left menu → "Configuration"
5. Tab: "Application settings"
6. For each variable above:
   a. Click: "+ New application setting"
   b. Name: [variable name]
   c. Value: [variable value]
   d. Click: "OK"
7. Click: "Save" at top
8. Wait for app to restart
```

**Or via CLI:**
```bash
az webapp config appsettings set \
  --name meetloom-api \
  --resource-group meetloom-rg \
  --settings \
    GROQ_API_KEY="your-grok-key-here" \
    NODE_ENV="production" \
    CORS_ORIGIN="https://meetloom-web.azurewebsites.net" \
    PORT="8080"
```

---

### 6️⃣ Push to GitHub (Trigger Deployment)

**Why:** This triggers the GitHub Actions workflows to deploy your app

**Steps:**
```bash
# Make sure all changes are committed
git status

# Push to GitHub (this starts the deployment)
git push origin master

# Monitor deployment:
# 1. Go to: https://github.com/YOUR_USERNAME/meetloom/actions
# 2. You should see 2 workflows running:
#    - Deploy Frontend to Azure Static Web Apps
#    - Deploy Backend to Azure App Service
# 3. Wait for both to complete (show green checkmarks)
```

---

### 7️⃣ Verify Deployment

**Why:** Confirm everything is working correctly

**Steps:**

```bash
# 1. Test Frontend
curl https://meetloom-web.azurewebsites.net/
# Expected: HTML response with React app

# 2. Test Backend Health Check
curl https://meetloom-api.azurewebsites.net/api/health
# Expected: {"status":"ok","timestamp":"2026-05-15T..."}

# 3. Test API Endpoint
curl -X POST https://meetloom-api.azurewebsites.net/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"transcript":"test meeting"}'
# Expected: Analysis result
```

**Or check Azure Portal:**
```
Frontend:
  1. Go to: https://portal.azure.com
  2. Search: "Static Web Apps"
  3. Click: "meetloom-web"
  4. You should see "Success" status

Backend:
  1. Go to: https://portal.azure.com
  2. Search: "App Services"
  3. Click: "meetloom-api"
  4. Status should be "Running"
```

---

## 📊 Complete Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTOMATED (Script)                           │
│                                                                 │
│  1. Create Resource Group (Azure)                              │
│  2. Create Static Web App (Azure)                              │
│  3. Create App Service Plan (Azure)                            │
│  4. Create App Service (Azure)                                 │
│  5. Configure App Service Settings (Azure)                     │
│                                                                 │
│  ⏱️ Time: ~5 minutes                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                  MANUAL (You Do These)                          │
│                                                                 │
│  1. Get GitHub Personal Access Token (GitHub)                  │
│  2. Get Static Web App Deployment Token (Azure Portal)         │
│  3. Get App Service Publish Profile (Azure Portal)             │
│  4. Add GitHub Secrets (GitHub)                                │
│  5. Set App Service Environment Variables (Azure Portal)       │
│  6. Push to GitHub (Terminal)                                  │
│  7. Verify Deployment (Terminal/Browser)                       │
│                                                                 │
│  ⏱️ Time: ~10 minutes                                           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   AUTOMATED (GitHub Actions)                   │
│                                                                 │
│  1. Frontend Workflow:                                          │
│     - Build React app with Vite                                │
│     - Deploy to Static Web Apps                                │
│                                                                 │
│  2. Backend Workflow:                                           │
│     - Install Node.js dependencies                             │
│     - Deploy to App Service                                    │
│     - Start backend server                                     │
│                                                                 │
│  ⏱️ Time: ~5 minutes                                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
              ✅ Both apps live and accessible!
```

---

## ⏱️ Total Time Estimate

| Step | Who | Time |
|------|-----|------|
| Run automated script | You | 2 min |
| Get GitHub PAT | You | 2 min |
| Get Azure tokens/profiles | You | 3 min |
| Add GitHub Secrets | You | 2 min |
| Set App Service env vars | You | 2 min |
| Push to GitHub | You | 1 min |
| GitHub Actions deploy | Automated | 5 min |
| Verify & test | You | 3 min |
| **TOTAL** | | **20 min** |

---

## 🚀 START HERE: Quick Deployment Steps

### For Impatient People (Just do these 3 things):

```bash
# 1. Run the automated script
chmod +x deploy-azure-cli.sh
./deploy-azure-cli.sh

# 2. Follow the script's instructions for:
#    - Getting GitHub PAT
#    - Getting Azure tokens
#    - Adding GitHub Secrets
#    - Setting environment variables

# 3. Push to GitHub when done
git push origin master

# That's it! Deployment starts automatically!
```

---

## ✅ Pre-Deployment Checklist

Before running the script, verify:

- [ ] You have GitHub account
- [ ] You have Azure subscription (free trial OK)
- [ ] You have Azure CLI installed (`az --version`)
- [ ] You have Git installed (`git --version`)
- [ ] You have Node.js installed (`node --version`)
- [ ] You are logged into Azure (`az login`)
- [ ] You have your Grok API key ready

---

## 🆘 If Something Goes Wrong

**Script failed?**
```bash
# Check error message in script output
# Common issues:
# - Not logged into Azure: az login
# - Invalid GitHub PAT: Check token is valid
# - Resource already exists: Change resource names

# Re-run script:
./deploy-azure-cli.sh
```

**GitHub Actions failed?**
```
1. Go to: https://github.com/YOUR_USERNAME/meetloom/actions
2. Click on failed workflow
3. Click on failed job
4. Look for red error messages
5. See: AZURE-DEPLOYMENT-GUIDE.md for troubleshooting
```

**Backend not responding?**
```bash
# Check logs:
az webapp log tail --name meetloom-api --resource-group meetloom-rg

# Check if running:
az webapp show --name meetloom-api --resource-group meetloom-rg

# Restart:
az webapp restart --name meetloom-api --resource-group meetloom-rg
```

---

## 📞 Summary

**Automated (No action needed):** 🤖
- Azure resource creation
- GitHub Actions workflows
- App deployment

**Manual (Action required):** 👤
- Getting authentication tokens
- Adding GitHub secrets
- Setting environment variables
- Pushing to GitHub
- Verification testing

**Total manual work:** ~10-15 minutes
**Total time to live:** ~20 minutes

---

**Status:** ✅ Ready to Deploy
**Last Updated:** May 15, 2026
