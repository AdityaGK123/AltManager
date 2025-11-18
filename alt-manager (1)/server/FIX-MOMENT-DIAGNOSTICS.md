# Fix: moment_diagnostics Table Missing

## 🎯 Problem
```
relation "moment_diagnostics" does not exist
```

This error occurs because the `moment_diagnostics` table is defined in your schema (`src/db/schema.ts`) but hasn't been created in your Neon database yet.

---

## ⚡ Quick Fix (Recommended)

### Option 1: Automated Fix Script
```bash
cd server
npm run db:fix
```

This will:
- ✅ Connect to your Neon database
- ✅ Create the `moment_diagnostics` table
- ✅ Create necessary indexes
- ✅ Verify table structure

**Then restart the server:**
```bash
npm run dev
```

---

## 🔧 Alternative Methods

### Option 2: Drizzle Migration (Standard Approach)
```bash
cd server

# Generate migration from schema
npm run db:generate

# Apply migration to database
npm run db:migrate

# Restart server
npm run dev
```

### Option 3: Manual SQL (Direct Database)
If you prefer to run SQL directly in Neon console:

1. Go to your Neon dashboard
2. Open SQL Editor
3. Run this SQL:

```sql
-- Create enum type
CREATE TYPE diagnostic_status AS ENUM ('success', 'error', 'timeout', 'retry');

-- Create table
CREATE TABLE moment_diagnostics (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    status diagnostic_status NOT NULL,
    duration_ms INTEGER NOT NULL,
    error_message TEXT,
    user_id INTEGER,
    metadata JSONB,
    logged_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_moment_diagnostics_slug ON moment_diagnostics(slug);
CREATE INDEX idx_moment_diagnostics_logged_at ON moment_diagnostics(logged_at);
CREATE INDEX idx_moment_diagnostics_status ON moment_diagnostics(status);
```

---

## 📊 Table Structure

The `moment_diagnostics` table stores performance monitoring data:

| Column | Type | Description |
|--------|------|-------------|
| `id` | SERIAL | Primary key |
| `slug` | VARCHAR(255) | Moment identifier |
| `endpoint` | VARCHAR(255) | API endpoint path |
| `status` | ENUM | success, error, timeout, retry |
| `duration_ms` | INTEGER | Response time in milliseconds |
| `error_message` | TEXT | Error details (if any) |
| `user_id` | INTEGER | User who triggered the request |
| `metadata` | JSONB | Additional diagnostic data |
| `logged_at` | TIMESTAMP | When the diagnostic was logged |

---

## ✅ Verification Steps

### 1. Check if table exists
```bash
cd server
npm run db:fix
```

Look for:
```
✅ moment_diagnostics table created successfully
```

### 2. Restart server
```bash
npm run dev
```

**Expected:** No more "relation does not exist" errors in logs

### 3. Test endpoints
```bash
npm run test:endpoints
```

**Expected:** All endpoints return 200 OK

### 4. Check server logs
Look for:
```
✅ All startup checks passed!
🚀 Server running on port 3000
```

---

## 🔍 Troubleshooting

### Error: "type diagnostic_status already exists"
**Solution:** The enum already exists, which is fine. The script handles this.

### Error: "table moment_diagnostics already exists"
**Solution:** Table is already created! Just restart the server:
```bash
npm run dev
```

### Error: "permission denied"
**Solution:** Check your DATABASE_URL has proper permissions:
```bash
npm run diagnose
```

### Error: "cannot connect to database"
**Solution:** 
1. Verify DATABASE_URL in `.env`
2. Check if Neon database is accessible
3. Ensure SSL is enabled for Neon connections

---

## 🚀 Post-Fix Checklist

- [ ] Run `npm run db:fix` successfully
- [ ] Restart server with `npm run dev`
- [ ] No "relation does not exist" errors in logs
- [ ] All startup checks pass (✅)
- [ ] Run `npm run test:endpoints` - all pass
- [ ] Frontend loads without 500 errors
- [ ] Can navigate to all pages

---

## 📝 What This Table Does

The `moment_diagnostics` table is used by the performance monitoring system to track:
- API endpoint response times
- Success/failure rates
- Error patterns
- Performance bottlenecks

This helps identify slow or failing endpoints for optimization.

---

## 🎯 Success Criteria

After running the fix:

✅ **Server starts cleanly:**
```
✅ Database Connection       Connected (50ms)
✅ Critical Tables           All critical tables exist
✅ Optional Tables           All optional tables exist
```

✅ **No errors in logs:**
```
🚀 Server running on port 3000
📊 Environment: development
🔗 Health check: http://localhost:3000/api/health
```

✅ **All endpoints healthy:**
```
✅ Health Check              200 PASS
✅ User Profile (no auth)    401 (expected)
✅ Skills (no auth)          401 (expected)
✅ Goals (no auth)           401 (expected)
```

---

## 💡 Prevention

To avoid this in the future:

1. **Always run migrations after schema changes:**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

2. **Commit migration files** (if not gitignored)

3. **Document schema changes** in your team

4. **Use Drizzle Studio** to visualize schema:
   ```bash
   npm run db:studio
   ```

---

**Need help?** Run `npm run diagnose` to check your environment setup.
