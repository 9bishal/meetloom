#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║    🚀 MeetLoom Azure Deployment Checklist                      ║"
echo "║    Verification Script - May 15, 2026                          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0

check_result() {
    if [ $2 -eq 0 ]; then
        echo -e "${GREEN}✅${NC} $1"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}❌${NC} $1"
        ((CHECKS_FAILED++))
    fi
}

echo -e "${BLUE}📋 1. Checking Project Structure${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -d "client" ] && check_result "Frontend directory exists" 0 || check_result "Frontend directory exists" 1
[ -d "server" ] && check_result "Backend directory exists" 0 || check_result "Backend directory exists" 1
[ -f "package.json" ] && check_result "Root package.json exists" 0 || check_result "Root package.json exists" 1

echo ""
echo -e "${BLUE}📋 2. Checking Azure Deployment Files${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "staticwebapp.config.json" ] && check_result "Static Web Apps config exists" 0 || check_result "Static Web Apps config exists" 1
[ -f "azure-app-service-config.json" ] && check_result "App Service config exists" 0 || check_result "App Service config exists" 1

echo ""
echo -e "${BLUE}📋 3. Checking GitHub Actions Workflows${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f ".github/workflows/deploy-frontend.yml" ] && check_result "Frontend deployment workflow" 0 || check_result "Frontend deployment workflow" 1
[ -f ".github/workflows/deploy-backend.yml" ] && check_result "Backend deployment workflow" 0 || check_result "Backend deployment workflow" 1

echo ""
echo -e "${BLUE}📋 4. Checking Documentation${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "AZURE-DEPLOYMENT-GUIDE.md" ] && check_result "Deployment guide" 0 || check_result "Deployment guide" 1
[ -f "ENVIRONMENT-VARIABLES.md" ] && check_result "Environment variables guide" 0 || check_result "Environment variables guide" 1

echo ""
echo -e "${BLUE}📋 5. Checking Environment & Git${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

[ -f "server/.env" ] && check_result "Server .env file exists" 0 || check_result "Server .env file exists" 1
grep -q "\.env" .gitignore 2>/dev/null && check_result ".env is in .gitignore" 0 || check_result ".env is in .gitignore" 1

BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "none")
[ "$BRANCH" = "master" ] || [ "$BRANCH" = "main" ] && check_result "On main/master branch ($BRANCH)" 0 || check_result "On main/master branch ($BRANCH)" 1

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                     📊 SUMMARY                                 ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║ ✅ Checks Passed: $CHECKS_PASSED"
echo "║ ❌ Checks Failed: $CHECKS_FAILED"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for Azure deployment.${NC}"
    echo ""
    echo "📝 Next Steps:"
    echo "   1. git push origin master"
    echo "   2. Follow AZURE-DEPLOYMENT-GUIDE.md"
    echo "   3. Configure GitHub Secrets"
    echo "   4. Set environment variables in Azure"
    echo "   5. Trigger deployment"
else
    echo -e "${YELLOW}⚠️  Review failed checks above${NC}"
fi
echo ""
