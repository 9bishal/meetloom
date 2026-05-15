#!/bin/bash

# MeetLoom Azure Deployment Script - Full Automation
# This script automates Azure resource creation and deployment setup via CLI
# Some manual steps may still be required (marked clearly)

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
PROJECT_NAME="meetloom"
LOCATION="eastus"
RESOURCE_GROUP="${PROJECT_NAME}-rg"
STATIC_WEB_APP_NAME="${PROJECT_NAME}-web"
APP_SERVICE_NAME="${PROJECT_NAME}-api"
APP_SERVICE_PLAN_NAME="${PROJECT_NAME}-api-plan"
GITHUB_REPO_OWNER=""
GITHUB_REPO_NAME=""
GITHUB_TOKEN=""

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║   🚀 MeetLoom Azure Deployment Script - Full Automation        ║"
echo "║      Powered by Azure CLI                                      ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print success message
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning message
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error message
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
print_section "Step 1: Checking Prerequisites"

# Check Azure CLI
if ! command -v az &> /dev/null; then
    print_error "Azure CLI not found. Please install it from: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi
print_success "Azure CLI is installed"

# Check Git
if ! command -v git &> /dev/null; then
    print_error "Git not found. Please install it."
    exit 1
fi
print_success "Git is installed"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install it."
    exit 1
fi
print_success "Node.js is installed ($(node --version))"

# Check if logged into Azure
if ! az account show > /dev/null 2>&1; then
    print_warning "Not logged into Azure. Opening login..."
    az login
fi
print_success "Logged into Azure"

# Get current subscription
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
print_success "Using subscription: $SUBSCRIPTION_ID"

# Get GitHub information
print_section "Step 2: GitHub Configuration"

echo -e "${YELLOW}Enter your GitHub information:${NC}"
read -p "GitHub repo owner (username): " GITHUB_REPO_OWNER
read -p "GitHub repo name (e.g., meetloom): " GITHUB_REPO_NAME
read -sp "GitHub Personal Access Token (PAT): " GITHUB_TOKEN
echo ""

if [ -z "$GITHUB_REPO_OWNER" ] || [ -z "$GITHUB_REPO_NAME" ] || [ -z "$GITHUB_TOKEN" ]; then
    print_error "GitHub information is required"
    exit 1
fi
print_success "GitHub configuration received"

# Create Resource Group
print_section "Step 3: Creating Azure Resource Group"

echo "Creating resource group: $RESOURCE_GROUP (in $LOCATION)..."
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    > /dev/null 2>&1

print_success "Resource group created: $RESOURCE_GROUP"

# Create Static Web App
print_section "Step 4: Creating Azure Static Web App"

echo "Creating Static Web App: $STATIC_WEB_APP_NAME..."
SWA_RESPONSE=$(az staticwebapp create \
    --name "$STATIC_WEB_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --source "https://github.com/$GITHUB_REPO_OWNER/$GITHUB_REPO_NAME" \
    --branch master \
    --login-with-github \
    --token "$GITHUB_TOKEN" \
    --build-folder "client/dist" \
    --app-build-folder "dist" \
    --output-location "" \
    2>&1 || true)

if echo "$SWA_RESPONSE" | grep -q "error\|Error"; then
    print_warning "Static Web App creation may need manual setup"
    echo "Please create manually in Azure Portal with these settings:"
    echo "  - Name: $STATIC_WEB_APP_NAME"
    echo "  - Resource Group: $RESOURCE_GROUP"
    echo "  - Source: GitHub ($GITHUB_REPO_OWNER/$GITHUB_REPO_NAME)"
    echo "  - Build folder: client"
    echo "  - App location: dist"
else
    print_success "Static Web App created: $STATIC_WEB_APP_NAME"
fi

# Get Static Web App info
echo "Fetching Static Web App details..."
SWA_DETAILS=$(az staticwebapp show \
    --name "$STATIC_WEB_APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --output json 2>&1 || echo "{}")

SWA_URL=$(echo "$SWA_DETAILS" | grep -o '"defaultHostname": "[^"]*' | cut -d'"' -f4 || echo "")
if [ -z "$SWA_URL" ]; then
    SWA_URL="https://${STATIC_WEB_APP_NAME}.azurewebsites.net"
fi
print_success "Static Web App URL: $SWA_URL"

# Create App Service Plan
print_section "Step 5: Creating Azure App Service Plan"

echo "Creating App Service Plan: $APP_SERVICE_PLAN_NAME..."
az appservice plan create \
    --name "$APP_SERVICE_PLAN_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --sku B1 \
    --is-linux \
    > /dev/null 2>&1

print_success "App Service Plan created: $APP_SERVICE_PLAN_NAME"

# Create App Service
print_section "Step 6: Creating Azure App Service"

echo "Creating App Service: $APP_SERVICE_NAME..."
az webapp create \
    --name "$APP_SERVICE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$APP_SERVICE_PLAN_NAME" \
    --runtime "NODE|20-lts" \
    > /dev/null 2>&1

print_success "App Service created: $APP_SERVICE_NAME"

# Configure App Service
print_section "Step 7: Configuring App Service Settings"

echo "Enabling Always On..."
az webapp config set \
    --name "$APP_SERVICE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --always-on true \
    > /dev/null 2>&1

print_success "Always On enabled"

echo "Configuring startup command..."
az webapp config appsettings set \
    --name "$APP_SERVICE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --settings STARTUP_COMMAND="npm start" \
    > /dev/null 2>&1

print_success "Startup command configured"

echo "Setting Node.js version to 20..."
az webapp config set \
    --name "$APP_SERVICE_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --linux-fx-version "NODE|20-lts" \
    > /dev/null 2>&1

print_success "Node.js version set to 20-lts"

# Configure environment variables
print_section "Step 8: Setting Environment Variables"

print_warning "Manual Action Required:"
print_warning "You must set these environment variables in Azure Portal:"
print_warning ""
echo "Steps:"
echo "  1. Go to Azure Portal → App Services → $APP_SERVICE_NAME"
echo "  2. Click 'Configuration' in left menu"
echo "  3. Click '+ New application setting' and add:"
echo ""
echo "  Variable Name          | Value"
echo "  ─────────────────────────────────────────────────────"
echo "  GROQ_API_KEY          | [Your Grok API Key]"
echo "  NODE_ENV              | production"
echo "  CORS_ORIGIN           | $SWA_URL"
echo "  PORT                  | 8080"
echo ""
echo "  4. Click 'Save' button"
echo "  5. Wait for app to restart"
echo ""
read -p "Press Enter when you've completed the above steps..."

# Configure GitHub Deployment
print_section "Step 9: Setting Up GitHub Deployment"

print_warning "Manual Action Required:"
print_warning "Configure GitHub deployment by following these steps:"
echo ""
echo "Steps for Frontend (Static Web App):"
echo "  1. Go to Azure Portal → Static Web Apps → $STATIC_WEB_APP_NAME"
echo "  2. Click 'Deployment token' and copy it"
echo "  3. Go to GitHub → Settings → Secrets and variables → Actions"
echo "  4. Add secret: AZURE_STATIC_WEB_APPS_API_TOKEN = [paste token]"
echo ""
echo "Steps for Backend (App Service):"
echo "  1. Go to Azure Portal → App Services → $APP_SERVICE_NAME"
echo "  2. Click 'Deployment Center' → Deployment credentials"
echo "  3. Copy username and password"
echo "  4. Go to GitHub Secrets and add:"
echo "     - AZURE_APP_SERVICE_NAME = $APP_SERVICE_NAME"
echo "     - AZURE_APP_SERVICE_PUBLISH_PROFILE = [from Publish profile]"
echo "     - AZURE_SUBSCRIPTION_ID = $SUBSCRIPTION_ID"
echo ""
read -p "Press Enter when you've completed the above steps..."

# Display summary
print_section "Deployment Summary"

echo ""
echo -e "${GREEN}✅ Azure Resources Created:${NC}"
echo "  • Resource Group: $RESOURCE_GROUP"
echo "  • Static Web App: $STATIC_WEB_APP_NAME"
echo "  • App Service: $APP_SERVICE_NAME"
echo "  • App Service Plan: $APP_SERVICE_PLAN_NAME"
echo ""
echo -e "${GREEN}📊 Access Points:${NC}"
echo "  • Frontend URL: $SWA_URL"
echo "  • Backend URL: https://${APP_SERVICE_NAME}.azurewebsites.net"
echo "  • API Health Check: https://${APP_SERVICE_NAME}.azurewebsites.net/api/health"
echo ""
echo -e "${GREEN}📋 GitHub Actions Workflows:${NC}"
echo "  • Frontend deployment: .github/workflows/deploy-frontend.yml"
echo "  • Backend deployment: .github/workflows/deploy-backend.yml"
echo ""
echo -e "${YELLOW}📝 What to do next:${NC}"
echo "  1. Verify GitHub secrets are set correctly"
echo "  2. Verify App Service environment variables are set"
echo "  3. Push to GitHub: git push origin master"
echo "  4. Monitor GitHub Actions for deployment status"
echo "  5. Check Azure Portal for deployment logs if issues occur"
echo ""
echo -e "${GREEN}🧪 Verification Commands:${NC}"
echo ""
echo "  # Check Static Web App status:"
echo "  az staticwebapp show --name $STATIC_WEB_APP_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "  # Check App Service status:"
echo "  az webapp show --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "  # View App Service logs:"
echo "  az webapp log tail --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP"
echo ""
echo "  # Get App Service publish profile:"
echo "  az webapp deployment list-publishing-profiles --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP --output table"
echo ""

print_section "Next Steps"

echo -e "${YELLOW}1. Configure Environment Variables in Azure:${NC}"
echo "   az webapp config appsettings set \\"
echo "     --name $APP_SERVICE_NAME \\"
echo "     --resource-group $RESOURCE_GROUP \\"
echo "     --settings \\"
echo "       GROQ_API_KEY='[your-key]' \\"
echo "       NODE_ENV='production' \\"
echo "       CORS_ORIGIN='$SWA_URL' \\"
echo "       PORT='8080'"
echo ""

echo -e "${YELLOW}2. Push to GitHub:${NC}"
echo "   git push origin master"
echo ""

echo -e "${YELLOW}3. Monitor Deployment:${NC}"
echo "   # GitHub Actions"
echo "   # Azure Portal → Deployment Center"
echo ""

echo -e "${GREEN}✅ Deployment setup complete!${NC}"
echo ""
