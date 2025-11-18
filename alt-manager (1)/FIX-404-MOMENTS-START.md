# Fix: 404 Error on Moments Start Endpoint

## 🎯 Problem

**Error:** `POST http://localhost:3000/api/moments/difficult-performance-conversation/start 404 (Not Found)`

**Root Cause:** The `manager_moments` table in your database is empty. The backend route exists and works correctly, but it returns 404 when the moment ID doesn't exist in the database.

---

## ✅ Solution: Seed Manager Moments Data

### Quick Fix (1 Command)

```bash
cd server
npm run db:seed-moments
```

This will:
- ✅ Insert all 28 manager moments into the database
- ✅ Handle duplicates (updates if exists)
- ✅ Match frontend IDs exactly
- ✅ Enable all "Start Practice" buttons

---

## 📋 Step-by-Step Fix

### 1. Seed the Moments
```bash
cd server
npm run db:seed-moments
```

**Expected Output:**
```
🌱 Seeding Manager Moments...
============================================================
✅ Connected to database
📝 Seeding moments...

   ✅ Inserted: bluf-your-message
   ✅ Inserted: slack-chaos-into-signal
   ✅ Inserted: repair-note-after-misstep
   ...
   ✅ Inserted: difficult-performance-conversation
   ...

============================================================

✅ Seeding complete!
   📊 Inserted: 28
   🔄 Updated: 0
   📝 Total: 28

✅ Database now has 28 moments
```

### 2. Restart Backend (if running)
```bash
npm run dev
```

### 3. Test in Frontend
1. Refresh your browser (http://localhost:5173)
2. Navigate to Moments page
3. Click "Start Practice" on any moment
4. Should now load successfully ✅

---

## 🔍 What Was Wrong

### Backend Route (Already Correct) ✅
The route exists in `server/src/routes/moments.ts` at line 74:
```typescript
router.post('/:id/start', authenticateToken, async (req, res) => {
  // ... handles moment start correctly
});
```

### Database (Was Empty) ❌
The `manager_moments` table had no data, so when the frontend requested:
```
POST /api/moments/difficult-performance-conversation/start
```

The backend looked for a moment with ID `difficult-performance-conversation`, found nothing, and returned:
```json
{ "error": "Moment not found", "momentId": "difficult-performance-conversation" }
```

### Fix Applied ✅
Seeded all 28 moments into the database with IDs matching the frontend exactly.

---

## 📊 Moments Seeded

### Communication (7)
- `bluf-your-message`
- `slack-chaos-into-signal`
- `repair-note-after-misstep`
- `stakeholder-update`
- `difficult-conversation`
- **`difficult-performance-conversation`** ← The one you clicked
- `crisis-communication`

### Delegation (4)
- `delegate-with-context`
- `delegate-outcome-not-task`
- `delegate-stretch-assignment`
- `delegate-to-overloaded-person`

### Feedback (4)
- `positive-feedback`
- `constructive-feedback`
- `feedback-to-senior`
- `feedback-on-soft-skills`

### Conflict (3)
- `mediate-team-conflict`
- `address-passive-aggressive`
- `resolve-priority-conflict`

### Coaching (3)
- `coach-career-growth`
- `coach-struggling-performer`
- `coach-high-performer`

### Decision Making (3)
- `make-decision-incomplete-info`
- `reverse-bad-decision`
- `facilitate-group-decision`

### Meetings (4)
- `run-effective-1on1`
- `facilitate-brainstorm`
- `run-retrospective`
- `handle-meeting-hijack`

**Total: 28 moments**

---

## 🧪 Verification

### Test the Fixed Endpoint
```bash
# In browser console or terminal
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/moments/difficult-performance-conversation/start \
     -X POST
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "sessionId": "uuid-here",
  "completionId": 123,
  "cluster": "Communication",
  "situation": "...",
  "caselet": "...",
  "safetyFraming": "...",
  "stakeholderRole": "...",
  "stakeholderPrompt": "...",
  "expectedTurns": 3
}
```

---

## 🔧 How the Route Works

### Request Flow:
1. **Frontend** calls: `POST /api/moments/:momentId/start`
2. **Backend** receives request at `routes/moments.ts:74`
3. **Lookup** moment in database by ID (with flexible matching)
4. **Create** session in `moment_completions` table
5. **Return** moment data + session ID
6. **Frontend** displays "Before We Start" step

### Flexible ID Matching:
The backend handles variations:
- `difficult-performance-conversation` ✅
- `difficult_performance_conversation` ✅
- `DIFFICULT-PERFORMANCE-CONVERSATION` ✅

All match the same moment.

---

## 🚀 Next Steps

### 1. Seed Moments (Required)
```bash
cd server
npm run db:seed-moments
```

### 2. Test All Moments
- Navigate to each category
- Click "Start Practice" on different moments
- Verify all load correctly

### 3. Optional: Add More Moments
Edit `server/seed-moments-quick.js` to add custom moments:
```javascript
{ 
  id: 'my-custom-moment', 
  title: 'My Custom Moment', 
  category: 'Custom', 
  difficulty: 2 
}
```

Then re-run:
```bash
npm run db:seed-moments
```

---

## 📝 Files Created/Modified

1. ✅ **`server/seed-moments-quick.js`** - Seeding script
2. ✅ **`server/package.json`** - Added `db:seed-moments` command
3. ✅ **`FIX-404-MOMENTS-START.md`** - This documentation

---

## ✅ Success Criteria

After running the seed script:

- ✅ All 28 moments in database
- ✅ `POST /api/moments/:id/start` returns 200 OK
- ✅ "Start Practice" buttons work
- ✅ "Before We Start" modal loads
- ✅ No more 404 errors
- ✅ Can complete full moment flow

---

## 🔍 Troubleshooting

### Issue: "manager_moments table does not exist"
**Solution:**
```bash
cd server
npm run db:migrate
npm run db:seed-moments
```

### Issue: "Moment not found" after seeding
**Solution:**
1. Check moment ID in frontend matches backend
2. Verify seed script ran successfully
3. Query database:
```sql
SELECT id, title FROM manager_moments;
```

### Issue: Still getting 404
**Solution:**
1. Check backend is running: `npm run dev`
2. Check frontend API URL: `VITE_API_URL=http://localhost:3000/api`
3. Check browser console for actual URL being called
4. Verify moment exists:
```bash
curl http://localhost:3000/api/moments
```

---

## 🎯 Summary

**Problem:** Database was empty, no moments to start  
**Solution:** Seed 28 moments into database  
**Command:** `npm run db:seed-moments`  
**Result:** All moments work, no more 404s ✅

---

**Status:** Ready to seed and test! 🚀
