#!/bin/bash
set -e

echo "🚀 Deploying MeetLoom to Azure..."
echo ""

# Configuration - using centralus which usually works with student subscriptions
PROJECT="meetloom"
LOCATION="centralus"
RG="${PROJECT}-rg"
SWA="${PROJECT}-web"
APP="${PROJECT}-api"
PLAN="${PROJECT}-api-plan"

# Step 1: Create Resource Group
echo "1️⃣  Creating Resource Group..."
az group create --name "$RG" --location "$LOCATION" > /dev/null
echo "✅ Resource Group created: $RG"

# Step 2: Create App Service Plan
echo ""
echo "2️⃣  Creating App Service Plan..."
az appservice plan create --name "$PLAN" --resource-group "$RG" --sku B1 --is-linux > /dev/null
echo "✅ App Service Plan created: $PLAN"

# Step 3: Create App Service
echo ""
echo "3️⃣  Creating App Service..."
az webapp create --name "$APP" --resource-group "$RG" --plan "$PLAN" --runtime "NODE|20-lts" > /dev/null
echo "✅ App Service created: $APP"

# Step 4: Configure App Service
echo ""
echo "4️⃣  Configuring App Service..."
az webapp config set --name "$APP" --resource-group "$RG" --always-on true > /dev/null
az webapp config appsettings set --name "$APP" --resource-group "$RG" --settings STARTUP_COMMAND="npm start" > /dev/null
echo "✅ App Service configured (Always On enabled)"

# Step 5: Set environment variables
echo ""
echo "5️⃣  Setting environment variables..."
az webapp config appsettings set \
  --name "$APP" \
  --resource-group "$RG" \
  --settings \
    NODE_ENV="production" \
    PORT="8080" \
    GROQ_API_KEY="placeholder-update-me" \
    CORS_ORIGIN="https://${SWA}.azurewebsites.net" > /dev/null
echo "✅ Environment variables set"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ DEPLOYMENT COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "�� Resources Created:"
echo "  • Resource Group: $RG"
echo "  • App Service: $APP"
echo "  • App Service Plan: $PLAN"
echo "  • Location: $LOCATION"
echo ""
echo "🌐 Backend URLs:"
echo "  • API: https://${APP}.azurewebsites.net"
echo "  • Health: https://${APP}.azurewebsites.net/api/health"
echo ""
echo "📝 IMPORTANT: Manual Steps Required"
echo ""
echo "1. Update GROQ_API_KEY (it's currently a placeholder):"
echo "   az webapp config appsettings set \\"
echo "     --name $APP \\"
echo "     --resource-group $RG \\"
echo "     --settings GROQ_API_KEY='your-grok-api-key-here'"
echo ""
echo "2. Deploy backend code from GitHub:"
echo "   git push origin master"
echo ""
echo "3. Verify deployment:"
echo "   curl https://${APP}.azurewebsites.net/api/health"
echo ""
echo "4. View logs if issues:"
echo "   az webapp log tail --name $APP --resource-group $RG"
echo ""
