# 🚀 Deploy ALT Manager to Netlify

## Quick Deployment Guide

Your application is **ready to deploy**! Follow these steps to deploy to Netlify.

---

## 📋 Prerequisites

- ✅ Frontend built successfully (`client/dist` folder exists)
- ✅ Backend needs separate deployment (Render/Railway recommended)
- ✅ Database on Neon.tech (or any PostgreSQL provider)

---

## 🎯 Option 1: Deploy via Netlify Web UI (Easiest)

### **Step 1: Deploy Frontend**

1. **Go to Netlify**: https://app.netlify.com/
2. **Click "Add new site"** → **"Deploy manually"**
3. **Drag and drop** the `client/dist` folder into the upload area
4. **Wait for deployment** (usually takes 30-60 seconds)
5. **Your site is live!** You'll get a URL like: `https://random-name-123.netlify.app`

### **Step 2: Configure Environment Variables**

1. In Netlify dashboard, go to **Site settings** → **Environment variables**
2. Add the following variable:
   - **Key:** `VITE_API_URL`
   - **Value:** Your backend URL + `/api` (e.g., `https://your-backend.onrender.com/api`)
3. **Redeploy** the site for changes to take effect

### **Step 3: Custom Domain (Optional)**

1. Go to **Domain settings**
2. Click **Add custom domain**
3. Follow the instructions to configure your DNS

---

## 🎯 Option 2: Deploy via Netlify CLI

### **Step 1: Install Netlify CLI**

```bash
npm install -g netlify-cli
```

### **Step 2: Login to Netlify**

```bash
netlify login
```

This will open your browser for authentication.

### **Step 3: Deploy from Client Directory**

```bash
cd client
netlify deploy --prod
```

When prompted:
- **Create & configure a new site**: Yes
- **Team**: Select your team
- **Site name**: `alt-manager-app` (or your preferred name)
- **Publish directory**: `dist`

### **Step 4: Set Environment Variables**

```bash
netlify env:set VITE_API_URL "https://your-backend-url.com/api"
```

---

## 🎯 Option 3: Deploy via Git (Continuous Deployment)

### **Step 1: Push to GitHub**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### **Step 2: Connect to Netlify**

1. Go to https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and select your repository
4. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `client/dist`
5. Add environment variables:
   - `VITE_API_URL`: Your backend URL + `/api`
6. Click **Deploy site**

### **Benefits of Git Deployment:**
- ✅ Automatic deployments on every push
- ✅ Preview deployments for pull requests
- ✅ Easy rollbacks
- ✅ Build logs and history

---

## 🔧 Backend Deployment (Required)

Your frontend needs a backend API. Deploy the backend separately:

### **Recommended: Deploy to Render**

1. Go to https://dashboard.render.com/
2. Click **"New"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `alt-manager-backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Environment Variables**:
     ```
     NODE_ENV=production
     PORT=3000
     DATABASE_URL=<your-neon-postgres-url>
     JWT_SECRET=<generate-32-char-secret>
     GEMINI_API_KEY=<your-gemini-api-key>
     CORS_ORIGIN=<your-netlify-url>
     ```
5. Click **Create Web Service**
6. Copy the backend URL (e.g., `https://alt-manager-backend.onrender.com`)
7. Update `VITE_API_URL` in Netlify to this URL + `/api`

---

## 🗄️ Database Setup

### **Using Neon.tech (Free Tier)**

1. Go to https://neon.tech/
2. Create a new project
3. Copy the connection string
4. Add to `DATABASE_URL` in Render environment variables
5. Run migrations:
   ```bash
   # Connect to your deployed backend
   # Run migrations via Render shell or locally with production DATABASE_URL
   npm run db:push
   ```

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Frontend loads at your Netlify URL
- [ ] Backend health check works: `https://your-backend.onrender.com/api/health`
- [ ] User registration works
- [ ] Login/logout works
- [ ] Manager Moments load
- [ ] Chat functionality works
- [ ] No CORS errors in browser console

---

## 🐛 Troubleshooting

### **CORS Errors**
- Ensure `CORS_ORIGIN` in backend matches your Netlify URL exactly
- Include `https://` and no trailing slash
- Example: `https://alt-manager-app.netlify.app`

### **API Connection Errors**
- Verify `VITE_API_URL` in Netlify includes `/api` at the end
- Check backend is running and accessible
- Test backend health endpoint directly

### **Build Failures**
- Check build logs in Netlify dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version is 18+

### **Environment Variables Not Working**
- Redeploy after adding/changing environment variables
- Clear browser cache
- Check variable names match exactly (case-sensitive)

---

## 📊 Monitoring

### **Netlify Analytics**
- Enable in Site settings → Analytics
- Track page views, bandwidth, and performance

### **Backend Monitoring (Render)**
- View logs in Render dashboard
- Set up alerts for downtime
- Monitor resource usage

---

## 💰 Cost Estimate

### **Free Tier (Recommended for Testing)**
- **Netlify**: Free (100GB bandwidth, 300 build minutes/month)
- **Render**: Free (750 hours/month, sleeps after 15 min inactivity)
- **Neon**: Free (3GB storage, 1 project)
- **Total**: $0/month

### **Production Tier**
- **Netlify Pro**: $19/month (1TB bandwidth, unlimited builds)
- **Render Starter**: $7/month (always-on, 512MB RAM)
- **Neon Pro**: $19/month (10GB storage, autoscaling)
- **Total**: ~$45/month

---

## 🎉 Success!

Once deployed, your application will be live at:
- **Frontend**: `https://your-site-name.netlify.app`
- **Backend**: `https://your-backend.onrender.com`

Share the frontend URL with users to access your ALT Manager application!

---

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Render Documentation](https://render.com/docs)
- [Neon Documentation](https://neon.tech/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review deployment logs in Netlify/Render dashboards
3. Test backend health endpoint
4. Verify all environment variables are set correctly
5. Check browser console for specific error messages

**Happy Deploying! 🚀**
