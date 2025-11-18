# 🚀 Deploy ALT Manager - Quick Start

## Option 1: Automated Deployment (Recommended)

### Windows (PowerShell):
```powershell
.\deploy.ps1
```

### Linux/Mac (Bash):
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## Option 2: Manual Deployment (Step-by-Step)

### ✅ Step 1: Verify Environment
```bash
# Check if .env exists
cat server/.env

# Verify required variables:
# - DATABASE_URL
# - JWT_SECRET
# - GEMINI_API_KEY
```

### ✅ Step 2: Install Dependencies
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
cd ..
```

### ✅ Step 3: Run Database Migration
```bash
cd server
node run-coaching-migration.js
```

**Expected Output:**
```
🚀 Starting Conversational Coaching System Migration...
✅ Connected to database
✅ Tables created successfully
🏆 Badge definitions: 20 badges loaded
✅ Initialized XP tracking for X users
🎉 Migration completed successfully!
```

### ✅ Step 4: Build Backend
```bash
cd server
npm run build
```

### ✅ Step 5: Build Frontend
```bash
cd client
npm run build
```

### ✅ Step 6: Test Moments (Optional)
```bash
cd server
node test-moments-completion.js
```

### ✅ Step 7: Start Server

#### Option A: Production (PM2 - Recommended)
```bash
cd server
npm install -g pm2
pm2 start npm --name "alt-manager" -- start
pm2 save
pm2 startup
```

**PM2 Commands:**
- View logs: `pm2 logs alt-manager`
- Stop: `pm2 stop alt-manager`
- Restart: `pm2 restart alt-manager`
- Status: `pm2 status`

#### Option B: Development
```bash
cd server
npm run dev
```

#### Option C: Direct Production
```bash
cd server
npm start
```

---

## 🧪 Verify Deployment

### 1. Check Server Health
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-17T...",
  "database": "connected",
  "ai": {
    "mode": "Google MakerSuite (Free Tier)",
    "model": "gemini-2.5-flash"
  }
}
```

### 2. Test Moments API
```bash
curl http://localhost:3000/api/moments \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Progress API
```bash
curl http://localhost:3000/api/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test Frontend
Open browser: `http://localhost:5173` (dev) or your production URL

---

## 🔍 Troubleshooting

### Issue: Migration Fails
**Solution:**
```bash
# Check database connection
cd server
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL)"

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: Server Won't Start
**Solution:**
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Mac/Linux

# Kill process if needed
taskkill /PID <PID> /F         # Windows
kill -9 <PID>                  # Mac/Linux
```

### Issue: Frontend Build Fails
**Solution:**
```bash
cd client
rm -rf node_modules
npm install
npm run build
```

### Issue: Moments Still Stuck
**Solution:**
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Check server logs
pm2 logs alt-manager  # If using PM2
# OR check terminal output
```

---

## 📊 Post-Deployment Checklist

- [ ] Server starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Database migration completed
- [ ] Badge definitions loaded (20 badges)
- [ ] Test 2-turn moment (Managing Stress)
- [ ] Test 3-turn moment (BLUF Your Message)
- [ ] Verify debrief generates automatically
- [ ] Check XP and badges award correctly
- [ ] Frontend loads without errors
- [ ] Test on mobile device
- [ ] Check browser console (no errors)
- [ ] Monitor server logs (no errors)

---

## 🌐 Production Deployment (Cloud)

### Deploy to Vercel (Frontend)
```bash
cd client
npm install -g vercel
vercel --prod
```

### Deploy to Railway/Render (Backend)
1. Connect GitHub repository
2. Set environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `GEMINI_API_KEY`
   - `NODE_ENV=production`
3. Deploy from `server` directory
4. Run migration: `node run-coaching-migration.js`

### Deploy to Heroku (Full Stack)
```bash
# Install Heroku CLI
heroku login
heroku create alt-manager

# Set environment variables
heroku config:set DATABASE_URL=your_db_url
heroku config:set JWT_SECRET=your_secret
heroku config:set GEMINI_API_KEY=your_key

# Deploy
git push heroku main

# Run migration
heroku run node server/run-coaching-migration.js
```

---

## 📈 Monitoring

### Server Logs
```bash
# PM2
pm2 logs alt-manager --lines 100

# Direct
tail -f server/logs/app.log  # If logging to file
```

### Database Queries
```sql
-- Check recent completions
SELECT * FROM moment_completions 
ORDER BY created_at DESC LIMIT 10;

-- Check badge progress
SELECT COUNT(*) as total_badges FROM user_badges;

-- Check XP tracking
SELECT COUNT(*) as users_with_xp FROM user_xp_tracking;
```

### Performance Monitoring
```bash
# API response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/health

# Create curl-format.txt:
echo "time_total: %{time_total}s\n" > curl-format.txt
```

---

## 🔄 Update Deployment

### Pull Latest Changes
```bash
git pull origin main
```

### Rebuild & Restart
```bash
# Backend
cd server
npm install
npm run build
pm2 restart alt-manager

# Frontend
cd ../client
npm install
npm run build
```

---

## 🆘 Emergency Rollback

### Rollback Code
```bash
git log --oneline -5  # Find previous commit
git checkout <commit-hash>
npm install
npm run build
pm2 restart alt-manager
```

### Rollback Database
```bash
psql $DATABASE_URL < backup_TIMESTAMP.sql
```

---

## 📞 Support

### Check Documentation
- `DEPLOYMENT-READY-STATUS.md` - Full deployment guide
- `MOMENT-DEBRIEF-FIX.md` - Moment fix details
- `QUICK-START-COACHING.md` - Coaching system setup

### Debug Commands
```bash
# Test moments completion
node server/test-moments-completion.js

# Check environment
node -e "require('dotenv').config(); console.log(process.env)"

# Test database
psql $DATABASE_URL -c "\dt"
```

---

## ✅ Success!

Your ALT Manager is now deployed and running! 🎉

**Access your application:**
- Frontend: http://localhost:5173 (dev) or your production URL
- Backend API: http://localhost:3000
- Health Check: http://localhost:3000/api/health

**Next Steps:**
1. Create a user account
2. Test Manager Moments
3. Earn your first badge
4. Track your progress

**Happy Coaching!** 🚀
