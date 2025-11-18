# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Validation

Your backend is **production-ready**. Follow this checklist before deploying.

---

## 📋 Environment Configuration

### 1. Production `.env` File

Create `server/.env` with production values:

```env
# Database (Production)
DATABASE_URL=postgresql://user:pass@production-host/db?sslmode=require&pgbouncer=true

# JWT Configuration (Production)
JWT_SECRET=<64-char-production-secret>
JWT_EXPIRES_IN=7d

# AI Service (Production - Paid Tier Recommended)
GEMINI_API_KEY=<production-api-key>

# Server Configuration
PORT=3000
NODE_ENV=production

# CORS (Your Production Domain)
CORS_ORIGIN=https://your-production-domain.com

# Optional: Monitoring
ENABLE_ROUTE_MONITORING=true
ENABLE_PERFORMANCE_MONITORING=true
```

### 2. Generate Production JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy output to `JWT_SECRET` in production `.env`

---

## 🗄️ Database Setup

### 1. Neon Production Database

**Option A: Upgrade Current Database**
- Go to Neon dashboard
- Upgrade to Pro plan ($19/month)
- Enable auto-scaling
- Enable connection pooling

**Option B: Create New Production Database**
```bash
# Create new Neon project for production
# Copy connection string
# Update DATABASE_URL in production .env
```

### 2. Apply All Migrations
```bash
cd server
npm run db:migrate
```

**Verify:**
```bash
npm run diagnose
# Should show: ✅ All critical tables exist
```

### 3. Add Optional Tables (If Needed)
```bash
npm run db:add-optional
```

---

## 🔒 Security Hardening

### 1. Environment Variables
- [ ] JWT_SECRET is 64+ characters
- [ ] JWT_SECRET is unique (never reuse dev secret)
- [ ] DATABASE_URL uses SSL (`sslmode=require`)
- [ ] CORS_ORIGIN matches production domain
- [ ] No default/example values used

### 2. Database Security
- [ ] Connection pooling enabled (`?pgbouncer=true`)
- [ ] SSL/TLS enforced
- [ ] Database user has minimal permissions
- [ ] Backup strategy configured

### 3. API Security
- [ ] Rate limiting enabled (express-rate-limit)
- [ ] Helmet middleware active
- [ ] CORS properly configured
- [ ] Input validation on all routes

---

## 🏗️ Build & Test

### 1. Build Production Bundle
```bash
cd server
npm run build
```

**Expected Output:**
```
✅ TypeScript compilation successful
✅ No errors
✅ dist/ folder created
```

### 2. Test Production Build Locally
```bash
NODE_ENV=production npm start
```

**Verify:**
- Server starts without errors
- All routes accessible
- No console warnings

### 3. Run Endpoint Tests
```bash
npm run test:endpoints
```

**Expected:**
```
✅ All endpoints responding correctly!
✅ No 500 errors occurred
```

---

## 🌐 Deployment Options

### Option 1: Render.com (Recommended)

**Steps:**
1. Create new Web Service on Render
2. Connect GitHub repository
3. Configure:
   - **Build Command:** `cd server && npm install && npm run build`
   - **Start Command:** `cd server && npm start`
   - **Environment:** Add all `.env` variables
4. Deploy

**Render Configuration:**
```yaml
services:
  - type: web
    name: alt-manager-backend
    env: node
    buildCommand: cd server && npm install && npm run build
    startCommand: cd server && npm start
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: GEMINI_API_KEY
        sync: false
      - key: NODE_ENV
        value: production
```

### Option 2: Railway.app

**Steps:**
1. Create new project on Railway
2. Connect GitHub repository
3. Add environment variables
4. Deploy automatically

**Railway Configuration:**
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd server && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd server && npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Option 3: Vercel (Serverless)

**Steps:**
1. Install Vercel CLI: `npm i -g vercel`
2. Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/src/index.ts"
    }
  ]
}
```
3. Deploy: `vercel --prod`

### Option 4: AWS EC2 / DigitalOcean

**Setup:**
```bash
# SSH into server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone <your-repo-url>
cd alt-manager/server

# Install dependencies
npm install

# Build
npm run build

# Setup PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name alt-manager-backend
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt-get install nginx
# Configure nginx to proxy to localhost:3000
```

---

## 🔍 Post-Deployment Verification

### 1. Health Check
```bash
curl https://your-production-domain.com/api/health
```

**Expected:**
```json
{
  "status": "healthy",
  "database": "connected",
  "ai": {
    "mode": "MakerSuite (Free)",
    "model": "gemini-2.5-flash"
  }
}
```

### 2. Test Authentication
```bash
# Should return 401
curl https://your-production-domain.com/api/user/profile

# Should return 200 with valid token
curl -H "Authorization: Bearer <token>" \
     https://your-production-domain.com/api/user/profile
```

### 3. Monitor Logs
- Check deployment platform logs
- Look for errors or warnings
- Verify database connections

### 4. Performance Check
- Response times < 500ms
- Database latency < 5000ms
- No memory leaks
- CPU usage reasonable

---

## 📊 Monitoring Setup

### 1. Error Tracking (Optional)

**Sentry Integration:**
```bash
npm install @sentry/node
```

```javascript
// In src/index.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### 2. Uptime Monitoring

**Options:**
- UptimeRobot (free)
- Pingdom
- StatusCake

**Monitor:**
- `https://your-domain.com/api/health`
- Alert if down > 5 minutes

### 3. Performance Monitoring

**Built-in monitors:**
- Route Monitor (already active)
- Performance Monitor (already active)
- Database Health Check (already active)

**View logs:**
```bash
# On deployment platform
tail -f logs/app.log
```

---

## 🔄 CI/CD Pipeline (Optional)

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: cd server && npm ci
      
      - name: Run tests
        run: cd server && npm run test:endpoints
      
      - name: Build
        run: cd server && npm run build
      
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: |
          curl -X POST https://api.render.com/deploy/...
```

---

## 🎯 Production Checklist

### Pre-Launch
- [ ] Production `.env` configured
- [ ] JWT_SECRET is production-grade (64+ chars)
- [ ] DATABASE_URL points to production DB
- [ ] All migrations applied
- [ ] `npm run build` succeeds
- [ ] `npm run test:endpoints` passes
- [ ] CORS_ORIGIN set to production domain
- [ ] SSL/TLS enabled on database
- [ ] Connection pooling enabled

### Launch
- [ ] Deploy to hosting platform
- [ ] Verify health endpoint responds
- [ ] Test authentication flow
- [ ] Check all API routes
- [ ] Monitor logs for errors
- [ ] Verify database connections

### Post-Launch
- [ ] Setup uptime monitoring
- [ ] Configure error tracking
- [ ] Enable performance monitoring
- [ ] Setup automated backups
- [ ] Document deployment process
- [ ] Create rollback plan

---

## 🚨 Rollback Plan

### If Deployment Fails

**1. Immediate Rollback:**
```bash
# On Render/Railway
git revert HEAD
git push origin main
# Platform auto-deploys previous version
```

**2. Database Rollback:**
```bash
# If migration caused issues
npm run db:rollback
# Or restore from backup
```

**3. Verify Rollback:**
```bash
curl https://your-domain.com/api/health
npm run test:endpoints
```

---

## 📈 Scaling Considerations

### When to Scale

**Indicators:**
- Response times > 1000ms consistently
- Database connections maxed out
- CPU usage > 80%
- Memory usage > 80%

### Scaling Options

**1. Vertical Scaling (Upgrade Resources)**
- Increase Neon database tier
- Upgrade hosting plan (more CPU/RAM)

**2. Horizontal Scaling (More Instances)**
- Add load balancer
- Deploy multiple backend instances
- Use Redis for session storage

**3. Database Optimization**
- Enable connection pooling
- Add database indexes
- Implement caching (Redis)
- Use read replicas

---

## ✅ Success Criteria

Your deployment is successful when:

- ✅ Health endpoint returns 200 OK
- ✅ All API routes accessible
- ✅ Authentication working correctly
- ✅ Database connected and responsive
- ✅ No 500 errors in logs
- ✅ Response times < 500ms
- ✅ Frontend can communicate with backend
- ✅ Monitoring alerts configured

---

## 📞 Support & Resources

**Documentation:**
- `BACKEND-HEALTH-MONITORING.md` - Daily monitoring guide
- `FIXES-APPLIED.md` - All fixes and improvements
- `QUICK-FIX-GUIDE.md` - Fast troubleshooting

**Commands:**
```bash
npm run diagnose          # Check environment
npm run test:endpoints    # Test all routes
npm run db:migrate        # Apply migrations
npm run db:add-optional   # Add analytics tables
```

**Hosting Platforms:**
- [Render.com](https://render.com) - Recommended
- [Railway.app](https://railway.app) - Easy setup
- [Vercel](https://vercel.com) - Serverless option

**Database:**
- [Neon](https://neon.tech) - Current provider
- Upgrade to Pro for better performance

---

**Status:** Ready for Production Deployment ✅
