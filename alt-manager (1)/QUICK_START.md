# 🚀 Quick Start - Get Running in 5 Minutes

## Prerequisites
- Node.js 18+ installed
- PostgreSQL running
- Google Gemini API key

## Installation

### 1. Install Dependencies (1 min)
```bash
npm run install:all
```

### 2. Setup Database (1 min)
```bash
# Create database
createdb alt_manager

# Run migrations
cd server
npm run db:generate
npm run db:migrate
```

### 3. Configure Environment (1 min)
Create `server/.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/alt_manager
JWT_SECRET=your-secret-key-min-32-characters-long
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGIN=http://localhost:5173
```

### 4. Seed Sample Data (30 sec)
```bash
cd server
npx tsx src/db/seed.ts
```

### 5. Start Application (30 sec)
```bash
# From project root
npm run dev
```

## Access
- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## First Steps
1. Register a new account
2. Complete onboarding (3 steps)
3. Try the chat feature
4. Explore Manager Moments
5. Track your progress

## Need Help?
See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions.

---
**That's it! You're ready to go! 🎉**
