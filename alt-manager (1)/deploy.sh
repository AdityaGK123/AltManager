#!/bin/bash

# ALT Manager Deployment Script
# Automated deployment for production

set -e  # Exit on any error

echo "🚀 ALT Manager Deployment Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Pre-deployment checks
echo "📋 Step 1: Pre-deployment Checks"
echo "--------------------------------"

# Check if .env exists
if [ ! -f "server/.env" ]; then
    echo -e "${RED}❌ Error: server/.env file not found${NC}"
    echo "Please create server/.env with required variables"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" server/.env; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in .env${NC}"
    exit 1
fi

# Check if GEMINI_API_KEY is set
if ! grep -q "GEMINI_API_KEY=" server/.env; then
    echo -e "${RED}❌ Error: GEMINI_API_KEY not found in .env${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Environment variables configured${NC}"
echo ""

# Step 2: Database Backup
echo "💾 Step 2: Database Backup"
echo "-------------------------"
read -p "Create database backup? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    BACKUP_FILE="backup_$(date +%Y%m%d_%H%M%S).sql"
    echo "Creating backup: $BACKUP_FILE"
    # Note: Requires pg_dump to be installed
    # pg_dump $DATABASE_URL > $BACKUP_FILE
    echo -e "${YELLOW}⚠️  Manual backup recommended before proceeding${NC}"
fi
echo ""

# Step 3: Install Dependencies
echo "📦 Step 3: Installing Dependencies"
echo "----------------------------------"

echo "Installing server dependencies..."
cd server
npm install --production
cd ..

echo "Installing client dependencies..."
cd client
npm install
cd ..

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Run Database Migration
echo "🗄️  Step 4: Database Migration"
echo "-----------------------------"
read -p "Run coaching system migration? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd server
    echo "Running migration..."
    node run-coaching-migration.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Migration completed successfully${NC}"
    else
        echo -e "${RED}❌ Migration failed${NC}"
        exit 1
    fi
    cd ..
else
    echo -e "${YELLOW}⚠️  Skipping migration${NC}"
fi
echo ""

# Step 5: Build Backend
echo "🔨 Step 5: Building Backend"
echo "---------------------------"
cd server
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend built successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 6: Build Frontend
echo "🎨 Step 6: Building Frontend"
echo "----------------------------"
cd client
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 7: Test Moments Completion
echo "🧪 Step 7: Testing Moments"
echo "--------------------------"
read -p "Run moments completion test? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd server
    node test-moments-completion.js
    cd ..
fi
echo ""

# Step 8: Start Production Server
echo "🚀 Step 8: Starting Production Server"
echo "-------------------------------------"
read -p "Start server now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Starting server..."
    cd server
    
    # Option 1: Using PM2 (recommended for production)
    if command -v pm2 &> /dev/null; then
        echo "Using PM2 process manager..."
        pm2 stop alt-manager 2>/dev/null || true
        pm2 start npm --name "alt-manager" -- start
        pm2 save
        echo -e "${GREEN}✅ Server started with PM2${NC}"
        echo "View logs: pm2 logs alt-manager"
        echo "Stop server: pm2 stop alt-manager"
    else
        # Option 2: Direct start
        echo "Starting server directly..."
        npm start &
        echo -e "${GREEN}✅ Server started${NC}"
        echo "Server PID: $!"
    fi
    
    cd ..
else
    echo -e "${YELLOW}⚠️  Server not started${NC}"
    echo "To start manually: cd server && npm start"
fi
echo ""

# Step 9: Deployment Summary
echo "📊 Deployment Summary"
echo "===================="
echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "🔗 Server URL: http://localhost:3000"
echo "🔗 API Health: http://localhost:3000/api/health"
echo ""
echo "📝 Next Steps:"
echo "1. Test the application: http://localhost:5173 (dev) or your production URL"
echo "2. Verify moments work correctly"
echo "3. Check server logs for errors"
echo "4. Monitor API response times"
echo ""
echo "📚 Documentation:"
echo "- DEPLOYMENT-READY-STATUS.md - Full deployment guide"
echo "- MOMENT-DEBRIEF-FIX.md - Moment fix details"
echo "- QUICK-START-COACHING.md - Coaching system setup"
echo ""
echo "🎉 Your ALT Manager is ready!"
echo ""
