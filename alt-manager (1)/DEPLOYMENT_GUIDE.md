# 🚀 Complete Deployment Guide for ALT Manager

This guide provides step-by-step instructions for deploying ALT Manager to various platforms.

## 📋 Table of Contents
1. [Quick Deploy Options](#quick-deploy-options)
2. [Platform-Specific Guides](#platform-specific-guides)
3. [Environment Variables](#environment-variables)
4. [Post-Deployment](#post-deployment)

---

## 🎯 Quick Deploy Options

### Option 1: Render (Recommended - Full Stack)
**Best for**: Complete deployment with database included
**Time**: 15-20 minutes
**Cost**: Free tier available

### Option 2: Vercel + Railway
**Best for**: Optimal performance and scalability
**Time**: 20-25 minutes
**Cost**: Free tier available

### Option 3: Docker (Self-Hosted)
**Best for**: Complete control, local or VPS deployment
**Time**: 10-15 minutes
**Cost**: Depends on hosting

---

## 🚀 Platform-Specific Deployment Guides

## 1️⃣ Render (Full Stack - Easiest)

### Prerequisites
- GitHub account
- Render account (free at render.com)
- Google Gemini API key

### Steps

#### A. Push to GitHub (if not already done)
```bash
cd C:\Users\maddu\CascadeProjects\alt-manager
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/alt-manager.git
git push -u origin main
```

#### B. Deploy via Render Dashboard

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +" → "Blueprint"**
3. **Connect your GitHub repository**
4. **Render will detect `render.yaml` and create:**
   - PostgreSQL database
   - Backend API service
   - Frontend static site

5. **Set Environment Variables** (in Render dashboard):
   - `GEMINI_API_KEY`: Your Google Gemini API key
   - `CORS_ORIGIN`: Your frontend URL (e.g., https://alt-manager-frontend.onrender.com)
   - `VITE_API_URL`: Your backend URL (e.g., https://alt-manager-api.onrender.com/api)

6. **Deploy**: Click "Apply" and wait for deployment

#### C. Run Database Migrations
Once backend is deployed:
```bash
# In Render Shell (Backend service)
npm run db:migrate
```

---

## 2️⃣ Vercel (Frontend) + Railway (Backend + DB)

### Part A: Deploy Database & Backend to Railway

1. **Go to Railway**: https://railway.app
2. **New Project → Deploy from GitHub**
3. **Add PostgreSQL Database**:
   - Click "+ New" → Database → PostgreSQL
   - Note the connection string

4. **Deploy Backend**:
   - Click "+ New" → GitHub Repo
   - Select your repository
   - Set root directory: `server`
   - Add environment variables:
     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_URL=(auto-filled from PostgreSQL)
     JWT_SECRET=(generate a strong secret)
     JWT_EXPIRES_IN=7d
     GEMINI_API_KEY=(your API key)
     CORS_ORIGIN=(your Vercel frontend URL)
     ```
   - Deploy

5. **Run Migrations**:
   - In Railway dashboard → Backend service → Shell
   - Run: `npm run db:migrate`

### Part B: Deploy Frontend to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Import Project** from GitHub
3. **Configure**:
   - Framework Preset: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variable**:
   - `VITE_API_URL`: Your Railway backend URL + `/api`
   - Example: `https://alt-manager-api.railway.app/api`

5. **Deploy**

6. **Update CORS**: Go back to Railway and update `CORS_ORIGIN` with your Vercel URL

---

## 3️⃣ Docker Deployment (Local or VPS)

### Prerequisites
- Docker and Docker Compose installed
- VPS or local machine with Docker

### Steps

1. **Clone repository** (if on VPS):
```bash
git clone https://github.com/YOUR_USERNAME/alt-manager.git
cd alt-manager
```

2. **Create .env file**:
```bash
cp .env.example .env
```

3. **Edit .env file**:
```env
DB_PASSWORD=your_secure_password
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
GEMINI_API_KEY=your_gemini_api_key
```

4. **Build and start containers**:
```bash
docker-compose up -d
```

5. **Run migrations**:
```bash
docker-compose exec backend npm run db:migrate
```

6. **Access application**:
- Frontend: http://localhost
- Backend: http://localhost:3000

### For VPS Deployment
If deploying to a VPS with a domain:

1. **Update docker-compose.yml**:
   - Change `CORS_ORIGIN` to your domain
   - Update `VITE_API_URL` to your API domain

2. **Set up Nginx reverse proxy** (optional):
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
    }

    location /api {
        proxy_pass http://localhost:3000;
    }
}
```

3. **Set up SSL with Let's Encrypt**:
```bash
sudo certbot --nginx -d yourdomain.com
```

---

## 4️⃣ Netlify (Frontend) + Render (Backend)

### Part A: Deploy Backend to Render

1. **Go to Render**: https://dashboard.render.com
2. **New Web Service** from GitHub
3. **Configure**:
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add PostgreSQL database
   - Set environment variables (see Render section above)

4. **Deploy and run migrations**

### Part B: Deploy Frontend to Netlify

1. **Go to Netlify**: https://app.netlify.com
2. **Import from GitHub**
3. **Netlify will detect `netlify.toml`**
4. **Add environment variable**:
   - `VITE_API_URL`: Your Render backend URL + `/api`

5. **Deploy**

---

## 🔐 Environment Variables Reference

### Backend (.env in server directory)

```env
# Required
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=min-32-character-random-string
GEMINI_API_KEY=your-google-gemini-api-key
CORS_ORIGIN=https://your-frontend-domain.com

# Optional
JWT_EXPIRES_IN=7d
```

### Frontend (.env in client directory)

```env
VITE_API_URL=https://your-backend-domain.com/api
```

### How to Get API Keys

#### Google Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

#### Generate JWT Secret
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## ✅ Post-Deployment Checklist

### 1. Verify Backend
```bash
curl https://your-backend-url.com/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. Test Registration
```bash
curl -X POST https://your-backend-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }'
```

### 3. Test Frontend
1. Open your frontend URL
2. Click "Sign Up"
3. Create an account
4. Complete onboarding
5. Test chat feature
6. Test Manager Moments

### 4. Monitor Logs
- **Render**: Dashboard → Service → Logs
- **Railway**: Dashboard → Service → Deployments → Logs
- **Vercel**: Dashboard → Project → Deployments → Function Logs
- **Docker**: `docker-compose logs -f`

### 5. Set Up Monitoring (Optional)
- Add error tracking: Sentry
- Add analytics: Google Analytics, Plausible
- Add uptime monitoring: UptimeRobot, Pingdom

---

## 🔧 Troubleshooting

### Issue: CORS Errors
**Solution**: Ensure `CORS_ORIGIN` in backend matches frontend URL exactly (including https://)

### Issue: Database Connection Failed
**Solution**: 
- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure SSL is enabled for cloud databases

### Issue: AI Not Responding
**Solution**:
- Verify `GEMINI_API_KEY` is valid
- Check API quota limits
- Review backend logs for errors

### Issue: Frontend Shows "Network Error"
**Solution**:
- Verify `VITE_API_URL` is correct
- Check backend is running
- Verify CORS is configured

### Issue: JWT Token Errors
**Solution**:
- Ensure `JWT_SECRET` is set and same across all instances
- Check token hasn't expired
- Clear browser localStorage and re-login

---

## 🎯 Production Optimization

### 1. Database
- Enable connection pooling
- Set up automated backups
- Add database indexes for performance
- Monitor query performance

### 2. Backend
- Enable rate limiting (already configured)
- Set up CDN for static assets
- Configure caching headers
- Monitor memory usage

### 3. Frontend
- Enable CDN (automatic on Vercel/Netlify)
- Optimize images
- Enable gzip compression (automatic)
- Monitor Core Web Vitals

### 4. Security
- Enable HTTPS (automatic on most platforms)
- Set up security headers (already configured)
- Regular dependency updates
- Monitor for vulnerabilities

---

## 📊 Cost Estimates

### Free Tier (Hobby Projects)
- **Render**: Free (with limitations)
- **Vercel**: Free (generous limits)
- **Railway**: $5/month credit
- **Netlify**: Free (100GB bandwidth)
- **Total**: $0-5/month

### Production (Low Traffic)
- **Render**: $7/month (web) + $7/month (DB)
- **Vercel**: Free - $20/month
- **Railway**: $10-20/month
- **Total**: $14-47/month

### Production (Medium Traffic)
- **Render**: $25/month (web) + $15/month (DB)
- **Vercel**: $20/month
- **Total**: $60/month

---

## 🆘 Support

If you encounter issues:
1. Check the logs first
2. Review the troubleshooting section
3. Consult platform-specific documentation
4. Check GitHub issues

---

## 🎉 Success!

Once deployed, your ALT Manager will be live at:
- **Frontend**: Your chosen platform URL
- **Backend API**: Your backend platform URL
- **Database**: Managed by your chosen platform

**Next Steps**:
1. Share the URL with users
2. Monitor performance and errors
3. Gather feedback
4. Plan next features

---

**Last Updated**: October 13, 2025
**Deployment Status**: ✅ Ready for Production
