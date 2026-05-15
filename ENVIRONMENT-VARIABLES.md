# MeetLoom Production Environment Variables Template

This file documents the environment variables needed for production deployment.

## Frontend Environment Variables

Set these in **Azure Static Web Apps** → **Settings** → **Configuration** → **Application settings**

```
VITE_API_URL=https://meetloom-api.azurewebsites.net
NODE_ENV=production
```

### Explanation

- `VITE_API_URL`: Base URL for backend API calls (compile-time variable for Vite)
- `NODE_ENV`: Environment mode for React optimizations

## Backend Environment Variables

Set these in **Azure App Service** → **Settings** → **Configuration** → **Application settings**

```
PORT=8080
NODE_ENV=production
GROK_API_KEY=your_grok_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Explanation

- `PORT`: Server port (Azure App Service requires flexibility, default 8080)
- `NODE_ENV`: Environment mode for Express optimizations
- `GROK_API_KEY`: API key for Grok/xAI service (required if using Grok)
- `OPENAI_API_KEY`: API key for OpenAI service (optional, if using OpenAI)

## GitHub Actions Secrets

Set these in **GitHub Repository** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

```
AZURE_STATIC_WEB_APPS_API_TOKEN=<deployment_token_from_swa>
AZURE_PUBLISH_PROFILE=<xml_from_app_service>
GROK_API_KEY=<your_grok_key>
OPENAI_API_KEY=<your_openai_key>
```

### Explanation

- `AZURE_STATIC_WEB_APPS_API_TOKEN`: Deployment token for Static Web Apps (from Azure)
- `AZURE_PUBLISH_PROFILE`: XML publish profile from App Service (from Azure)
- `GROK_API_KEY`: For GitHub Actions to pass to backend (same as backend env var)
- `OPENAI_API_KEY`: For GitHub Actions to pass to backend (same as backend env var)

## How to Get These Values

### Getting Static Web Apps Token

```bash
az staticwebapp secrets list \
  --name meetloom-ui \
  --resource-group meetloom-rg
```

Or from Azure Portal:
1. Navigate to **Static Web Apps** → `meetloom-ui`
2. Click **Manage deployment token** in top right
3. Copy the token

### Getting App Service Publish Profile

```bash
az webapp deployment list-publishing-profiles \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --query "[?publishMethod=='MSDeploy'].publishProfile" \
  --output tsv
```

Or from Azure Portal:
1. Navigate to **App Service** → `meetloom-api`
2. Click **Get publish profile** (usually top-right or in Overview)
3. Open XML file and copy entire contents

### Getting API Keys

- **Grok API Key**: Sign up at [console.x.ai](https://console.x.ai) and generate key
- **OpenAI API Key**: Sign up at [platform.openai.com](https://platform.openai.com) and generate key

## Verification Steps

### Frontend

1. Verify environment variable is set:
   ```bash
   # In Azure Portal → Static Web Apps → Settings
   # Should show VITE_API_URL = https://meetloom-api.azurewebsites.net
   ```

2. Test in browser console:
   ```javascript
   // After frontend loads
   console.log(import.meta.env.VITE_API_URL)
   // Should log: https://meetloom-api.azurewebsites.net
   ```

### Backend

1. Verify environment variables are set:
   ```bash
   # View all app settings
   az webapp config appsettings list \
     --resource-group meetloom-rg \
     --name meetloom-api
   ```

2. Test API is working:
   ```bash
   curl -s https://meetloom-api.azurewebsites.net/ | jq
   # Should return JSON response with success:true
   ```

3. Check environment is production:
   ```bash
   curl -s https://meetloom-api.azurewebsites.net/ | grep version
   ```

## Common Issues

### Frontend Can't Connect to Backend

**Problem**: "Cannot read properties of undefined" when trying to fetch from API

**Solution**:
1. Check `VITE_API_URL` is set in Static Web Apps settings
2. Rebuild frontend after changing env vars: trigger new deployment
3. Check CORS headers in backend response (should allow Static Web Apps domain)

### Backend Crashes with "GROK_API_KEY is not defined"

**Problem**: Backend throws error about missing API key

**Solution**:
1. Verify `GROK_API_KEY` is set in App Service settings
2. Restart App Service: `az webapp restart --resource-group meetloom-rg --name meetloom-api`
3. Wait 1-2 minutes for service to restart
4. Check logs: `az webapp log tail --resource-group meetloom-rg --name meetloom-api`

### GitHub Actions Deployment Fails

**Problem**: "Permission denied" or "Authentication failed"

**Solution**:
1. Verify GitHub Secrets are set correctly:
   - Go to repo → Settings → Secrets → Actions
   - Check all 4 secrets exist
2. Regenerate tokens if needed (especially publish profile)
3. Check secret values don't have extra quotes or spaces
4. Test manually: look at GitHub Actions logs for exact error

## Setting Variables via Azure CLI

### Frontend (Static Web Apps)

Note: Static Web Apps doesn't have traditional "application settings" like App Service. 
Instead, set environment variables at build time:

1. Through GitHub Actions (in workflow file)
2. Through Azure Portal → Configuration

### Backend (App Service)

```bash
# Set single variable
az webapp config appsettings set \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --settings PORT=8080

# Set multiple variables
az webapp config appsettings set \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --settings \
    NODE_ENV=production \
    GROK_API_KEY="your_key" \
    OPENAI_API_KEY="your_key"

# Remove variable
az webapp config appsettings delete \
  --resource-group meetloom-rg \
  --name meetloom-api \
  --setting-names OLD_KEY
```

## Security Best Practices

✅ **DO:**
- Store all API keys in Azure Key Vault for production
- Use GitHub Secrets for sensitive values
- Rotate API keys regularly (monthly recommended)
- Enable Azure Portal audit logging
- Use least-privilege API keys (limit scopes if available)

❌ **DON'T:**
- Commit `.env` files to Git
- Commit API keys to GitHub
- Share API keys via email or Slack
- Use same key across multiple environments
- Expose keys in error messages or logs

## Troubleshooting

### Variables Not Taking Effect

1. **For Frontend**: Rebuild and redeploy
   - Push code to main branch or manually trigger deployment
   - Frontend builds with env vars at compile time

2. **For Backend**: Restart app service
   ```bash
   az webapp restart --resource-group meetloom-rg --name meetloom-api
   ```

### Verify Variables Are Set

```bash
# Backend
az webapp config appsettings list \
  --resource-group meetloom-rg \
  --name meetloom-api

# Frontend (via Azure Portal or check in deployment logs)
```

### Check Deployment Logs

```bash
# Backend logs
az webapp log tail --resource-group meetloom-rg --name meetloom-api

# Frontend logs (via Azure Portal → Deployment logs)
```

---

**Last Updated**: 2024
**Version**: 1.0.0
