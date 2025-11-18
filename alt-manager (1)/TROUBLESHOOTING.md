# ALT Manager - Troubleshooting Registration Issue

## Current Status
- ✅ Database tables created successfully in Neon
- ✅ Backend health check responds (http://localhost:3000/api/health)
- ❌ Registration endpoint returns 500 error
- ❌ No error logs visible in server console

## Problem Analysis

The registration is failing with a 500 error, but we're not seeing error logs. This suggests:
1. Server might not be running with proper logging
2. There might be a TypeScript compilation issue
3. Environment variables might not be loaded correctly

## Solution Steps

### Step 1: Verify Environment Variables

Check that `server/.env` file exists and contains:
```
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://neondb_owner:npg_L7dNSbg5VTzc@ep-late-rain-ado95vne.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=AIzaSyDdv8L8qDB2_ZpDbeMOglt7yRI52kkPUVw
CORS_ORIGIN=http://localhost:5173
```

### Step 2: Stop All Node Processes

```powershell
Stop-Process -Name node -Force
```

### Step 3: Start Backend Server

```powershell
cd C:\Users\maddu\CascadeProjects\alt-manager\server
npm run dev
```

Wait for: `🚀 Server running on port 3000`

### Step 4: Start Frontend Server (in new terminal)

```powershell
cd C:\Users\maddu\CascadeProjects\alt-manager\client
npm run dev
```

### Step 5: Test Registration

Open browser to: http://localhost:5173/register

Register with:
- Name: Hasini Madduri
- Email: maddurihasini25@gmail.com
- Password: (your choice, min 6 characters)

## If Still Failing

### Check Browser Console (F12)
Look for network errors or CORS issues

### Check Server Logs
The server terminal should show:
```
Registration error: [error details]
Error message: [specific message]
```

### Manual Database Test

Run this to test database directly:
```powershell
cd C:\Users\maddu\CascadeProjects\alt-manager\server
node debug-register.cjs
```

This will:
- Connect to database
- Create a test user
- Show exactly where it fails

## Common Issues

### Issue 1: JWT_SECRET Not Set
**Error**: `JWT_SECRET is undefined`
**Fix**: Ensure `.env` file has `JWT_SECRET=...`

### Issue 2: Database Connection
**Error**: `connection terminated`
**Fix**: Check Neon database is active and connection string is correct

### Issue 3: CORS Error
**Error**: `CORS policy blocked`
**Fix**: Ensure backend has `CORS_ORIGIN=http://localhost:5173`

### Issue 4: Port Already in Use
**Error**: `EADDRINUSE`
**Fix**: Kill all node processes and restart

## Quick Fix Script

Save this as `restart-app.ps1`:

```powershell
# Stop all node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\maddu\CascadeProjects\alt-manager\server; npm run dev"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\maddu\CascadeProjects\alt-manager\client; npm run dev"

Write-Host "✅ Servers starting..."
Write-Host "Backend: http://localhost:3000"
Write-Host "Frontend: http://localhost:5173"
```

Run with:
```powershell
powershell -ExecutionPolicy Bypass -File restart-app.ps1
```

## Next Steps After Registration Works

Once you can register successfully, you'll:
1. Complete the 3-step onboarding flow
2. Access the AI Manager chat interface
3. Try Manager Moments
4. Track your progress

Then we can begin implementing the Phase 1 enhancements from the redesign document.
