# 🚀 Quick Fix Guide - ALT Manager

## ⚡ Fast Track to Fix 500 Errors

### Step 1: Diagnose (30 seconds)
```bash
cd server
npm run diagnose
```

**Look for ❌ marks** - these are your problems!

---

### Step 2: Fix Environment Variables

#### Create `.env` file in `server/` directory:
```bash
cd server
```

Create `server/.env` with:
```env
# Database (Required)
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication (Required)
JWT_SECRET=your_secure_random_string_minimum_32_characters_long

# AI Service (Required)
GEMINI_API_KEY=your_gemini_api_key_from_makersuite

# Server Config (Optional)
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

#### Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

#### Get GEMINI_API_KEY:
1. Go to https://makersuite.google.com/app/apikey
2. Create API key (free)
3. Copy and paste into `.env`

---

### Step 3: Setup Database

#### If using Neon (recommended):
1. Go to https://neon.tech
2. Create free database
3. Copy connection string
4. Add to `.env` as `DATABASE_URL`

#### Push schema to database:
```bash
cd server
npm run db:generate
npm run db:migrate
```

---

### Step 4: Test Everything
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Test endpoints
cd server
npm run test:endpoints

# Terminal 3 - Start frontend
cd client
npm run dev
```

---

## 🔍 Common Issues & Quick Fixes

### ❌ "Cannot reach server"
```bash
# Make sure backend is running:
cd server
npm run dev
```

### ❌ "DATABASE_URL not set"
```bash
# Add to server/.env:
DATABASE_URL=postgresql://user:pass@host:port/db
```

### ❌ "JWT_SECRET not set"
```bash
# Generate and add to server/.env:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=<paste_generated_value>
```

### ❌ "Missing tables"
```bash
cd server
npm run db:migrate
```

### ❌ "401 Unauthorized"
**This is NORMAL for protected routes!**
- 401 = Need to login first
- 500 = Server error (BAD)

---

## ✅ Success Checklist

Run these commands in order:

```bash
# 1. Check environment
cd server && npm run diagnose

# 2. Start server (watch for errors)
npm run dev

# 3. Test APIs (should see ✅ marks)
npm run test:endpoints

# 4. Start frontend
cd ../client && npm run dev

# 5. Open browser
# http://localhost:5173
```

**Expected Results:**
- ✅ All environment variables present
- ✅ Database connected
- ✅ Server starts without errors
- ✅ No 500 errors in endpoint tests
- ✅ Frontend loads without console errors
- ✅ Can register/login

---

## 🎯 What Got Fixed

### 1. React Router Warnings ✅
- Added v7 future flags to `BrowserRouter`
- No more console warnings

### 2. Auth Middleware ✅
- Now checks for `JWT_SECRET` before using it
- Returns proper 500 error instead of crashing

### 3. Diagnostic Tools ✅
- `npm run diagnose` - Check environment
- `npm run test:endpoints` - Test all APIs

---

## 📞 Still Having Issues?

### Check Server Logs
```bash
cd server
npm run dev
# Watch for red error messages
```

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Go to Network tab
5. Look for failed requests (red)
6. Click on failed request
7. Check "Response" tab for error details

### Check Database Connection
```bash
cd server
npm run diagnose
# Look at "Database Connection Check" section
```

---

## 🚀 One-Command Setup (if starting fresh)

```bash
# Backend setup
cd server
npm install
npm run diagnose  # Fix any ❌ issues shown
npm run db:migrate
npm run dev

# Frontend setup (new terminal)
cd client
npm install
npm run dev
```

---

## 📝 Environment Template

Copy this to `server/.env`:

```env
# === REQUIRED ===
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=generate_with_crypto_randomBytes_32_chars_minimum
GEMINI_API_KEY=get_from_makersuite_google_com

# === OPTIONAL ===
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
ENABLE_ROUTE_MONITORING=true
ENABLE_PERFORMANCE_MONITORING=true
```

---

**Need Help?** Run `npm run diagnose` and check the output!
