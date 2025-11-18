# ALT Manager - Quick Setup Guide

This guide will help you get ALT Manager up and running in under 10 minutes.

## Prerequisites Checklist

- [ ] Node.js v18+ installed
- [ ] PostgreSQL v14+ installed and running
- [ ] Google Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))
- [ ] Code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Install Dependencies (2 minutes)

```bash
# From the project root
npm run install:all
```

This installs all dependencies for root, client, and server.

### 2. Set Up Database (3 minutes)

#### Create the database:
```bash
# Using createdb command
createdb alt_manager

# OR using psql
psql -U postgres
CREATE DATABASE alt_manager;
\q
```

#### Configure database connection:
Create `server/.env` file:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/alt_manager
```
Replace `postgres:password` with your PostgreSQL username and password.

#### Run migrations:
```bash
cd server
npm run db:generate
npm run db:migrate
```

### 3. Configure Environment Variables (2 minutes)

#### Server configuration (`server/.env`):
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:password@localhost:5432/alt_manager
JWT_SECRET=your-random-secret-key-min-32-chars
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your-gemini-api-key-here
CORS_ORIGIN=http://localhost:5173
```

**Important:** 
- Replace `JWT_SECRET` with a random string (at least 32 characters)
- Get your `GEMINI_API_KEY` from [Google AI Studio](https://makersuite.google.com/app/apikey)

#### Client configuration (optional):
Create `client/.env` if needed:
```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Seed Sample Data (1 minute)

Add sample Manager Moments scenarios:
```bash
cd server
npx tsx src/db/seed.ts
```

### 5. Start the Application (1 minute)

#### Option A: Run everything together (recommended)
```bash
# From project root
npm run dev
```

#### Option B: Run separately
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 6. Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## First Time User Flow

1. **Register**: Click "Sign up" and create an account
2. **Onboarding**: Complete the 3-step setup:
   - Enter your role and experience
   - Define your career goals
   - Choose your manager tone
3. **Explore**: Try the chat, moments, and progress features!

## Verification Checklist

- [ ] Frontend loads at http://localhost:5173
- [ ] Backend API responds at http://localhost:3000/api/health
- [ ] Can register a new account
- [ ] Can complete onboarding
- [ ] Can start a chat conversation
- [ ] Can view Manager Moments

## Common Issues & Solutions

### Issue: Database connection fails
**Solution:**
```bash
# Check if PostgreSQL is running
# Windows:
services.msc  # Look for PostgreSQL service

# Verify connection string in server/.env
# Format: postgresql://username:password@localhost:5432/database_name
```

### Issue: Port already in use
**Solution:**
```bash
# Change ports in:
# - server/.env (PORT=3001)
# - client/vite.config.ts (port: 5174)
```

### Issue: Gemini API errors
**Solution:**
- Verify API key is correct in `server/.env`
- Check API quota at [Google AI Studio](https://makersuite.google.com/)
- Ensure no extra spaces in the API key

### Issue: Build errors
**Solution:**
```bash
# Clear and reinstall
rm -rf node_modules client/node_modules server/node_modules
npm run install:all
```

## Development Tips

### Useful Commands

```bash
# View database in Drizzle Studio
cd server
npm run db:studio

# Check backend logs
cd server
npm run dev  # Watch the console output

# Build for production
npm run build

# Run type checking
cd client && npx tsc --noEmit
cd server && npx tsc --noEmit
```

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- PostgreSQL (for database management)
- Thunder Client (for API testing)

### Testing the API

Use the health check endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-11T05:19:01.000Z"
}
```

## Next Steps

1. **Customize Manager Moments**: Add your own scenarios in `server/src/db/seed.ts`
2. **Adjust AI Behavior**: Modify prompts in `server/src/services/ai.service.ts`
3. **Style Customization**: Edit colors in `client/tailwind.config.js`
4. **Add Features**: Extend the API and UI as needed

## Getting Help

If you encounter issues:

1. Check the main [README.md](./README.md) for detailed documentation
2. Review error messages in browser console and server logs
3. Verify all environment variables are set correctly
4. Ensure PostgreSQL and Node.js versions meet requirements

## Production Deployment

For production deployment instructions, see the "Deployment" section in [README.md](./README.md).

---

**You're all set! 🎉**

Start building your career with ALT Manager!
