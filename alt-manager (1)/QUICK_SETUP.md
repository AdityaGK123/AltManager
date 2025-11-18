# 🚀 Quick Setup Guide - Manager Moments

## Prerequisites
- Node.js installed
- PostgreSQL database (Neon DB) configured
- `.env` file in `server/` directory with `DATABASE_URL`

## Step-by-Step Setup

### 1. Install Dependencies
```powershell
# From project root
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
npm install --save-dev @types/uuid

# Return to root
cd ..
```

### 2. Run Database Migrations
```powershell
# From project root
.\setup-moments.ps1
```

**If the script fails**, run migrations manually:
```powershell
cd server
node src/db/run-migration.js src/db/migrations/add_manager_moments_tables.sql
node src/db/run-migration.js src/db/seed-moments.sql
cd ..
```

### 3. Start Development Servers
```powershell
# From project root
npm run dev
```

This starts:
- **Client:** http://localhost:5173
- **Server:** http://localhost:3000

### 4. Test Manager Moments
1. Navigate to http://localhost:5173/moments
2. Click "Start Practice" on any moment card
3. Complete the 5-step flow:
   - Safety framing
   - Caselet (scenario)
   - Role-play (3 turns)
   - Debrief (score + feedback)
   - Apply (micro-habit + templates)

## Troubleshooting

### Error: "relation user_moments does not exist"
**Solution:** Run the migration script:
```powershell
cd server
node src/db/run-migration.js src/db/migrations/add_manager_moments_tables.sql
```

### Error: "Could not find module 'uuid'"
**Solution:** Install types:
```powershell
cd server
npm install --save-dev @types/uuid
```

### Error: "Missing script: dev"
**Solution:** Install root dependencies:
```powershell
npm install
```

### Error: "psql is not recognized"
**Solution:** Use the Node.js migration runner instead:
```powershell
cd server
node src/db/run-migration.js src/db/migrations/add_manager_moments_tables.sql
```

## Database Tables Created

- `moment_completions` - Tracks each practice attempt
- `moment_debriefs` - Stores rubric scores and feedback
- `moment_peer_examples` - Anonymized peer examples
- `moment_practice_variants` - Harder/easier practice versions

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/moments` | List all moments |
| POST | `/api/moments/:id/start` | Start practice session |
| POST | `/api/moments/:id/response` | Submit user response |
| POST | `/api/moments/:id/debrief` | Generate feedback |
| POST | `/api/moments/:id/practice` | Create variant |
| GET | `/api/moments/:id/progress` | Get progress |

## Environment Variables

Ensure `server/.env` contains:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
JWT_SECRET=your_secret_key_min_32_chars
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
PORT=3000
```

## Next Steps

1. ✅ Complete setup above
2. 📝 Test the 3 seeded moments (BLUF, Slack Chaos, Repair Note)
3. 🎯 Add more moments by extending `MOMENT_PROMPTS` in `server/src/services/moments.service.ts`
4. 📊 View progress tracking in `/moments` page
5. 🏆 Implement trophy/badge system (optional)

---

**Need Help?** Check `MANAGER_MOMENTS_SUMMARY.md` for full documentation.
