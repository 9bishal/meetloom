#!/bin/bash

# MeetLoom Azure Deployment Setup Script
# This script helps set up Azure resources for MeetLoom deployment
# Usage: bash azure-setup.sh

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed"
        log_info "Install from: https://learn.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        exit 1
    fi
    
    log_success "Prerequisites checked"
}

# Login to Azure
login_azure() {
    log_info "Logging into Azure..."
    az login
    log_success "Azure login successful"
}

# Create resource group
create_resource_group() {
    local rg_name="$1"
    local location="$2"
    
    log_info "Creating resource group: $rg_name"
    
    if az group exists --name "$rg_name" | grep -q true; then
        log_warning "Resource group $rg_name already exists"
        return 0
    fi
    
    az group create --name "$rg_name" --location "$location"
    log_success "Resource group created: $rg_name"
}

# Create Static Web Apps
create_static_web_app() {
    local app_name="$1"
    local rg_name="$2"
    local repo_url="$3"
    local repo_token="$4"
    
    log_info "Creating Static Web App: $app_name"
    
    az staticwebapp create \
        --name "$app_name" \
        --resource-group "$rg_name" \
        --location eastus \
        --branch main \
        --repo-url "$repo_url" \
        --repository-token "$repo_token" \
        --app-location "client" \
        --output-location "dist" \
        --build-properties-app-build-command "npm run build" \
        --build-properties-app-install-command "npm ci"
    
    log_success "Static Web App created: $app_name"
    
    # Get deployment token
    local token=$(az staticwebapp secrets list --name "$app_name" --resource-group "$rg_name" --query "properties.apiToken" -o tsv)
    log_info "Deployment token: $token"
    log_warning "Copy this token to GitHub Secrets as AZURE_STATIC_WEB_APPS_API_TOKEN"
}

# Create App Service Plan
create_app_service_plan() {
    local plan_name="$1"
    local rg_name="$2"
    local sku="$3"
    
    log_info "Creating App Service Plan: $plan_name (SKU: $sku)"
    
    if az appservice plan show --name "$plan_name" --resource-group "$rg_name" &> /dev/null; then
        log_warning "App Service Plan $plan_name already exists"
        return 0
    fi
    
    az appservice plan create \
        --name "$plan_name" \
        --resource-group "$rg_name" \
        --sku "$sku" \
        --is-linux
    
    log_success "App Service Plan created: $plan_name"
}

# Create App Service
create_app_service() {
    local app_name="$1"
    local rg_name="$2"
    local plan_name="$3"
    
    log_info "Creating App Service: $app_name"
    
    if az webapp show --name "$app_name" --resource-group "$rg_name" &> /dev/null; then
        log_warning "App Service $app_name already exists"
        return 0
    fi
    
    az webapp create \
        --name "$app_name" \
        --resource-group "$rg_name" \
        --plan "$plan_name" \
        --runtime "NODE|20-lts"
    
    log_success "App Service created: $app_name"
}

# Configure App Service
configure_app_service() {
    local app_name="$1"
    local rg_name="$2"
    
    log_info "Configuring App Service: $app_name"
    
    # Enable Always On
    az webapp config set \
        --resource-group "$rg_name" \
        --name "$app_name" \
        --always-on true
    
    # Enable HTTPS only
    az webapp update \
        --resource-group "$rg_name" \
        --name "$app_name" \
        --https-only
    
    # Set environment variables
    az webapp config appsettings set \
        --resource-group "$rg_name" \
        --name "$app_name" \
        --settings \
            NODE_ENV=production \
            PORT=8080
    
    # Set startup command
    az webapp config set \
        --resource-group "$rg_name" \
        --name "$app_name" \
        --startup-file "node server.js"
    
    log_success "App Service configured"
}

# Get publish profile
get_publish_profile() {
    local app_name="$1"
    local rg_name="$2"
    
    log_info "Getting publish profile for: $app_name"
    
    local profile=$(az webapp deployment list-publishing-profiles \
        --resource-group "$rg_name" \
        --name "$app_name" \
        --query "[?publishMethod=='MSDeploy'].publishProfile" \
        --output tsv)
    
    if [ -z "$profile" ]; then
        log_error "Could not retrieve publish profile"
        return 1
    fi
    
    echo "$profile" > "publish-profile.xml"
    log_success "Publish profile saved to: publish-profile.xml"
    log_warning "Copy this file contents to GitHub Secrets as AZURE_PUBLISH_PROFILE"
}

# Main execution
main() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   MeetLoom Azure Deployment Setup      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Login to Azure
    read -p "Do you want to login to Azure? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        login_azure
    fi
    
    # Configuration
    read -p "Enter resource group name (default: meetloom-rg): " rg_name
    rg_name=${rg_name:-meetloom-rg}
    
    read -p "Enter Static Web App name (default: meetloom-ui): " swa_name
    swa_name=${swa_name:-meetloom-ui}
    
    read -p "Enter App Service name (default: meetloom-api): " app_name
    app_name=${app_name:-meetloom-api}
    
    read -p "Enter App Service Plan name (default: meetloom-api-plan): " plan_name
    plan_name=${plan_name:-meetloom-api-plan}
    
    read -p "Enter App Service SKU tier (default: B1, options: B1, B2, B3, S1, S2, S3): " sku
    sku=${sku:-B1}
    
    read -p "Enter GitHub repository URL: " repo_url
    read -p "Enter GitHub Personal Access Token (for repo access): " repo_token
    
    # Create resources
    log_info "Starting Azure resource creation..."
    echo ""
    
    create_resource_group "$rg_name" "eastus"
    create_static_web_app "$swa_name" "$rg_name" "$repo_url" "$repo_token"
    create_app_service_plan "$plan_name" "$rg_name" "$sku"
    create_app_service "$app_name" "$rg_name" "$plan_name"
    configure_app_service "$app_name" "$rg_name"
    
    # Get publish profile
    get_publish_profile "$app_name" "$rg_name"
    
    echo ""
    log_success "Azure deployment setup completed!"
    echo ""
    log_info "Next steps:"
    echo "  1. Set up GitHub Secrets:"
    echo "     - AZURE_STATIC_WEB_APPS_API_TOKEN"
    echo "     - AZURE_PUBLISH_PROFILE"
    echo "     - GROK_API_KEY"
    echo "     - OPENAI_API_KEY (if using)"
    echo ""
    echo "  2. Configure App Service environment variables in Azure Portal:"
    echo "     - GROK_API_KEY"
    echo "     - OPENAI_API_KEY (if using)"
    echo ""
    echo "  3. Push code to main branch to trigger deployment:"
    echo "     git push origin main"
    echo ""
    echo "  4. Monitor deployment in GitHub Actions"
    echo ""
    
    # Display resource information
    echo -e "${BLUE}═════════════════════════════════════════${NC}"
    echo "Resource Information:"
    echo -e "${BLUE}═════════════════════════════════════════${NC}"
    
    log_info "Static Web App URL:"
    az staticwebapp show --name "$swa_name" --resource-group "$rg_name" --query "defaultDomain" -o tsv | xargs echo "  https://"
    
    log_info "App Service URL:"
    az webapp show --name "$app_name" --resource-group "$rg_name" --query "defaultHostName" -o tsv | xargs echo "  https://"
}

# Run main function
main "$@"
