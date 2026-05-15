# 🚀 MeetLoom Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] No hardcoded secrets in code
- [ ] API endpoints tested
- [ ] Frontend builds without errors
- [ ] Backend starts cleanly
- [ ] CORS configured correctly
- [ ] Error handling verified

## Frontend Deployment (Vercel)

### Step 1: Prepare for Deployment

```bash
cd client
npm run build
```

Verify the `dist/` folder is created without errors.

### Step 2: Connect to Vercel

1. Sign up at [vercel.com](https://vercel.com)
2. Connect your GitHub repository
3. Select the `/client` directory as root
4. Build command: `npm run build`
5. Output directory: `dist`

### Step 3: Configure Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables**:

```
VITE_API_URL = https://your-backend-api.com
```

### Step 4: Deploy

- Push to main branch, Vercel auto-deploys
- Or click "Deploy" in Vercel dashboard
- Monitor deployment logs

### Step 5: Verify

```bash
# Visit your Vercel deployment URL
https://meetloom.vercel.app
```

## Backend Deployment (Render)

### Step 1: Prepare for Deployment

```bash
cd server
npm install
npm start  # Test locally
```

### Step 2: Connect to Render

1. Sign up at [render.com](https://render.com)
2. Click "New → Web Service"
3. Connect your GitHub repository
4. Select your repo

### Step 3: Configure Build & Runtime

**Build Command:**
```
npm install
```

**Start Command:**
```
npm start
```

**Root Directory:** `server`

### Step 4: Configure Environment Variables

In Render dashboard, go to **Environment**:

```
GROK_API_KEY=sk-your-actual-key
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-url.vercel.app
```

### Step 5: Deploy

- Render auto-deploys on push to main
- Monitor logs in Render dashboard
- Check health at `/api/health`

## Deployment Workflow

### Production Checklist

```bash
# 1. Test locally
npm run dev

# 2. Build for production
npm run build

# 3. Run production build locally
node server/server.js

# 4. Push to main branch
git add .
git commit -m "Production release"
git push origin main

# 5. Monitor deployments
# - Watch Vercel deployment logs
# - Watch Render deployment logs
# - Test endpoints after deploy
```

## Environment Variables by Environment

### Development (.env files)

**server/.env:**
```
GROK_API_KEY=sk-test-key
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**client/.env:**
```
VITE_API_URL=http://localhost:5000
```

### Staging

**server (Render):**
```
GROK_API_KEY=sk-staging-key
PORT=10000
NODE_ENV=staging
CORS_ORIGIN=https://staging.meetloom.vercel.app
```

### Production

**server (Render):**
```
GROK_API_KEY=sk-production-key
PORT=10000
NODE_ENV=production
CORS_ORIGIN=https://meetloom.vercel.app
```

## Monitoring in Production

### Vercel Monitoring

1. **Dashboard Metrics**
   - Build times
   - Function executions
   - Error rates
   - Response times

2. **Set Up Analytics**
   - Web Vitals
   - Performance metrics
   - User interactions

### Render Monitoring

1. **Logs**
   - Real-time logs visible in dashboard
   - Search and filter logs
   - Export logs

2. **Metrics**
   - CPU usage
   - Memory usage
   - Network metrics
   - Health checks

### Third-Party Monitoring (Optional)

**Sentry for Error Tracking:**
```javascript
// Add to frontend
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/id",
  environment: "production",
});

// Add to backend
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://your-sentry-dsn@sentry.io/id",
});
```

**Uptime Robot (Optional):**
- Monitor health checks every 5 minutes
- Get alerts if service goes down
- Free tier available

## Troubleshooting Deployments

### Frontend Won't Build

```bash
# Clear cache and rebuild
rm -rf dist/
npm cache clean --force
npm install
npm run build
```

### Backend Not Starting

1. Check environment variables in dashboard
2. Verify GROK_API_KEY is set
3. Check logs for errors
4. Test locally: `npm start`

### CORS Errors

Check that CORS_ORIGIN matches frontend URL exactly:
- ✅ `https://meetloom.vercel.app`
- ❌ `https://meetloom.vercel.app/`
- ❌ `http://meetloom.vercel.app`

### API Timeout

Increase timeout in frontend:

```javascript
// client/src/services/api.js
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increase to 60 seconds
});
```

### Memory Issues

1. Check Render dashboard for memory usage
2. Upgrade to higher tier if needed
3. Optimize code (no memory leaks)
4. Monitor background processes

## Scaling Strategy

### When to Scale

**Frontend (Vercel):**
- Auto-scales automatically
- Consider Pro plan for more bandwidth

**Backend (Render):**
- Scale up when >80% CPU usage
- Scale up when >90% memory usage
- Consider load balancing for multiple instances

### Vertical Scaling (Render)

1. Go to Settings → Tier
2. Upgrade to higher tier
3. Render handles the upgrade

### Horizontal Scaling

1. Deploy multiple backend instances
2. Use load balancer (e.g., CloudFlare)
3. Implement distributed caching

## Backup & Recovery

### Frontend Backup
- GitHub is your backup
- Vercel keeps deployment history
- Rollback to previous deployment anytime

### Backend Backup
- No database currently
- GitHub is your backup
- Render keeps deployment history

### Recovery Process

If something breaks:

1. Check error logs
2. Rollback to previous deployment
3. Fix locally
4. Deploy fix

**Vercel Rollback:**
- Dashboard → Deployments → Select previous
- Click "Redeploy"

**Render Rollback:**
- Dashboard → Deploys → Find previous
- Click "Deploy"

## Security in Production

### Secrets Management

✅ **Good:**
```bash
# Environment variables on platform
GROK_API_KEY in Render dashboard
```

❌ **Bad:**
```javascript
// Hardcoded keys
const API_KEY = "sk-xxxxx";
```

### HTTPS/SSL

- ✅ Vercel: Auto HTTPS
- ✅ Render: Auto HTTPS
- ✅ All traffic encrypted

### CORS Security

Only allow your frontend domain:
```bash
CORS_ORIGIN=https://meetloom.vercel.app
```

Not:
```bash
CORS_ORIGIN=*
```

### Rate Limiting

Add to backend (future enhancement):
```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
});

app.use("/api/", limiter);
```

## Cost Estimation

### Vercel (Frontend)
- **Hobby tier:** Free
- **Pro tier:** $20/month
- Per-function invocations: $0.50 per 1M

### Render (Backend)
- **Free tier:** Limited, good for testing
- **Starter tier:** $7/month (0.5GB RAM)
- **Standard tier:** $12/month (2GB RAM)

### Grok API
- Pay-as-you-go pricing
- Estimate: ~$0.01-0.05 per request
- Free tier available for development

### Total Estimate
- Development: ~$12/month
- Production (light): ~$50-100/month
- Production (heavy): $200+/month

## Performance Optimization

### Frontend Optimization

1. **Code Splitting** (already done with Vite)
2. **Image Optimization**
   ```bash
   # Add sharp for image optimization
   npm install sharp --save-dev
   ```

3. **Lazy Load Components** (if needed)
   ```javascript
   import { lazy, Suspense } from 'react';
   const SummaryCard = lazy(() => import('./components/SummaryCard'));
   
   <Suspense fallback={<LoadingState />}>
     <SummaryCard />
   </Suspense>
   ```

### Backend Optimization

1. **Add Caching**
   ```bash
   npm install redis
   ```

2. **Optimize Prompt**
   - Shorter prompt = faster response
   - Cache common responses

3. **Database for History** (future)
   - Cache frequently accessed data
   - Reduce API calls

## Maintenance

### Weekly
- Check error rates
- Monitor costs
- Review performance metrics

### Monthly
- Update dependencies
- Review security patches
- Analyze user metrics

### Quarterly
- Major version updates
- Architecture review
- Performance optimization

## Support & Help

### Debug Production Issues

1. **Check Logs**
   - Vercel: Deployments → Function logs
   - Render: Logs tab

2. **Test Endpoints**
   ```bash
   curl https://your-api.com/api/health
   ```

3. **Monitor Performance**
   - Use Vercel Analytics
   - Use Render metrics

### Common Issues

| Issue | Solution |
|-------|----------|
| API returns 401 | Check GROK_API_KEY |
| CORS error | Update CORS_ORIGIN |
| Timeout | Increase timeout value |
| Memory error | Upgrade tier |

## Next Deployment

When deploying new version:

```bash
# 1. Update version
# package.json: "version": "1.0.1"

# 2. Test locally
npm run dev

# 3. Build
npm run build

# 4. Commit and push
git add .
git commit -m "v1.0.1: feature description"
git push origin main

# 5. Monitor deployments
# Vercel and Render auto-deploy

# 6. Verify
curl https://api.meetloom.com/api/health
```

---

**Last Updated:** May 13, 2026
**Status:** Production Ready
