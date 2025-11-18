# 🚀 Server Restart Instructions

## Critical: Server Must Be Restarted

The following fixes have been applied and require a server restart:

### ✅ Fixes Applied
1. **Database Connection Pool Optimization** - Prevents connection exhaustion
2. **Enhanced Chat Route Logging** - Better error tracking
3. **Database Health Check Utilities** - Easy diagnostics
4. **Enhanced Startup Checks** - Clearer error messages

---

## 📋 Restart Steps

### Option 1: Quick Restart (Recommended)

1. **Stop the current server:**
   - Find the terminal running the server
   - Press `Ctrl+C` to stop it

2. **Restart the server:**
   ```bash
   cd server
   npm run dev
   ```

3. **Watch for successful startup:**
   ```
   🚀 Running startup checks...
   ✅ Environment Variables    All required variables present
   ✅ Database Connection      Connected (XXms)
   ✅ Critical Tables          All critical tables exist
   ✅ Gemini API              Configured (MakerSuite/Google Cloud)
   ✅ All startup checks passed!
   
   🚀 Server running on port 3000
   📊 Environment: development
   🔗 Health check: http://localhost:3000/api/health
   ```

---

### Option 2: Full Restart (If Issues Persist)

1. **Stop all Node processes:**
   ```powershell
   # Find Node processes
   Get-Process -Name node
   
   # Stop specific process (replace PID with actual process ID)
   Stop-Process -Id <PID> -Force
   ```

2. **Clear any stale connections:**
   ```bash
   cd server
   node test-db-connection.js
   ```
   
   Expected output:
   ```
   ✅ Database connection successful
   ✅ users                - X rows
   ✅ conversations        - X rows
   ✅ messages             - X rows
   ✅ manager_moments      - X rows
   ```

3. **Rebuild TypeScript:**
   ```bash
   npm run build
   ```

4. **Start fresh:**
   ```bash
   npm run dev
   ```

---

## 🔍 Verification After Restart

### 1. Check Server Logs
Look for these indicators:
- ✅ `[DB Pool] ✅ New client connected` - Pool is working
- ✅ `[Chat] GET /conversations - userId: X` - Logging is active
- ✅ No error messages during startup

### 2. Test Chat Endpoint
Open a new terminal:
```bash
cd server
node test-chat-endpoint.js
```

Expected results:
- ✅ Login successful
- ✅ Conversations fetched
- ✅ Message sent and AI responded
- ✅ No 500 errors

### 3. Check Browser
1. Open http://localhost:5173
2. Login to your account
3. Navigate to Chat page
4. Open DevTools → Network tab
5. Click "Start Chatting" or refresh
6. Verify:
   - ✅ `/api/chat/conversations` returns 200 (not 500)
   - ✅ Response time < 1 second
   - ✅ Conversations load properly

---

## ⚠️ Troubleshooting

### Issue: Server won't start
**Check:**
```bash
# Verify environment variables
cd server
node diagnose-500-errors.js

# Check database connection
node test-db-connection.js

# Check for port conflicts
netstat -ano | findstr :3000
```

### Issue: Still getting 500 errors
**Debug:**
1. Check server console for error messages
2. Look at `server/logs/errors.log`
3. Run diagnostics:
   ```bash
   node diagnose-500-errors.js
   node test-chat-endpoint.js
   ```
4. Check if database tables exist:
   ```bash
   node test-db-connection.js
   ```

### Issue: Slow response times
**Check pool status:**
- Look for `[DB Pool]` messages in console
- Should see: `Total: X, Idle: Y, Waiting: 0`
- If `Waiting > 0`, pool might be exhausted

**Fix:**
- Restart server
- Check for connection leaks in code
- Verify database is responsive

---

## 🎯 Success Indicators

After restart, you should see:

### Server Console
```
[DB Pool] ✅ New client connected - Total: 2, Idle: 2, Waiting: 0
🚀 Server running on port 3000
[Chat] GET /conversations - userId: 1
[Chat] GET /conversations - Found 5 conversations
```

### Browser Network Tab
```
GET /api/chat/conversations    200 OK    150ms
GET /api/moments              200 OK    200ms
GET /api/analysis/moms        200 OK    180ms
```

### No Errors
- ❌ No 500 Internal Server Error
- ❌ No slow requests (> 1s)
- ❌ No connection timeouts

---

## 📞 Next Steps

1. **Restart the server** using Option 1 above
2. **Verify** using the verification steps
3. **Test** all features: Chat, Moments, Analytics
4. **Monitor** server logs for any issues

If everything works:
- ✅ Chat functionality restored
- ✅ Moments working perfectly
- ✅ Analytics functioning correctly
- ✅ No 500 errors
- ✅ Fast response times

---

**Status:** Ready for restart  
**Estimated Downtime:** < 10 seconds  
**Risk:** Low (all changes are improvements)
