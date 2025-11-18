# Manager Moments Seed Verification Guide

## Database Seeding Steps

### 1. Ensure Database is Running

Check if your PostgreSQL database is running:

```powershell
# If using Docker
docker ps | findstr postgres

# If using local PostgreSQL
Get-Service postgresql*
```

If not running, start it:
```powershell
# Docker
docker-compose up -d db

# Or start all services
npm run dev
```

### 2. Run the Seed Script

Once database is running:

```powershell
cd server
node src/db/run-migration.js src/db/seed-moments.sql
```

Expected output:
```
✅ Connected
📄 Reading migration file: src/db/seed-moments.sql
🚀 Running migration...
✅ Migration completed successfully
```

### 3. Verify Data Insertion

Check the count:
```powershell
node src/db/check-tables.js
```

You should see:
```
📊 Existing moment-related tables:
   - manager_moments
   - moment_completions
   - moment_debriefs
   - moment_peer_examples
   - moment_practice_variants
```

### 4. Test Backend API

Start the server:
```powershell
# From project root
npm run dev
```

Test the endpoint:
```powershell
# In a new terminal
curl http://localhost:3000/api/moments
```

Expected: JSON array with 10 moment objects

### 5. Verify Frontend

Open browser to: http://localhost:5173/moments

You should see:
- ✅ 10 moment cards displayed in a grid
- ✅ Each card shows title, description, category
- ✅ "Start Practice" button on each card
- ✅ No "No moments available yet" message

### 6. Test a Moment

Click "Start Practice" on any moment:
- ✅ Modal opens
- ✅ Safety framing displays
- ✅ Situation/caselet displays
- ✅ Stakeholder prompt displays
- ✅ Can proceed through 6-stage flow

## Troubleshooting

### "Control plane request failed"
- Database is not running
- Check DATABASE_URL in server/.env
- Restart Docker: `docker-compose restart db`

### "No moments available yet"
- Seed script didn't run successfully
- Check browser console for API errors
- Verify `/api/moments` returns data

### "Moment configuration not found"
- AI service templates missing for new moments
- Only first 3 moments have full templates
- Others will work for display but not practice flow

## Seeded Moments

1. ✅ BLUF Your Message (full template)
2. ✅ Turn Slack Chaos into Signal (full template)
3. ✅ Write a Repair Note After a Misstep (full template)
4. ✅ Handle Escalation with Composure
5. ✅ Ask for Feedback That Helps You Grow
6. ✅ Push Back on Unrealistic Deadlines
7. ✅ Delegate Without Dropping Ownership
8. ✅ Navigate Ambiguity in Requirements
9. ✅ Coach a Peer on Missed Deliverables
10. ✅ Celebrate Wins Authentically

**Note:** Moments 4-10 are seeded in the database but need AI service templates added to `momentsAIService.ts` for full practice flow functionality.

## Quick Verification Checklist

- [ ] Database running
- [ ] Seed script executed successfully
- [ ] `/api/moments` returns 10 items
- [ ] Frontend displays 10 cards
- [ ] Can click "Start Practice" on moments 1-3
- [ ] Modal opens with correct content

## Next Steps

To enable full practice flow for moments 4-10, add templates to `server/src/services/momentsAIService.ts` following the pattern of the first 3 moments.
