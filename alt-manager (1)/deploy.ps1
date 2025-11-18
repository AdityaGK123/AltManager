# ALT Manager Deployment Script (PowerShell)
# Automated deployment for Windows

Write-Host "`n🚀 ALT Manager Deployment Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Pre-deployment checks
Write-Host "📋 Step 1: Pre-deployment Checks" -ForegroundColor Yellow
Write-Host "--------------------------------"

# Check if .env exists
if (-not (Test-Path "server\.env")) {
    Write-Host "❌ Error: server\.env file not found" -ForegroundColor Red
    Write-Host "Please create server\.env with required variables"
    exit 1
}

# Check if DATABASE_URL is set
$envContent = Get-Content "server\.env" -Raw
if ($envContent -notmatch "DATABASE_URL=") {
    Write-Host "❌ Error: DATABASE_URL not found in .env" -ForegroundColor Red
    exit 1
}

# Check if GEMINI_API_KEY is set
if ($envContent -notmatch "GEMINI_API_KEY=") {
    Write-Host "❌ Error: GEMINI_API_KEY not found in .env" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment variables configured" -ForegroundColor Green
Write-Host ""

# Step 2: Database Backup
Write-Host "💾 Step 2: Database Backup" -ForegroundColor Yellow
Write-Host "-------------------------"
$backup = Read-Host "Create database backup? (y/n)"
if ($backup -eq "y") {
    $backupFile = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql"
    Write-Host "⚠️  Manual backup recommended: $backupFile" -ForegroundColor Yellow
}
Write-Host ""

# Step 3: Install Dependencies
Write-Host "📦 Step 3: Installing Dependencies" -ForegroundColor Yellow
Write-Host "----------------------------------"

Write-Host "Installing server dependencies..."
Set-Location server
npm install --production
Set-Location ..

Write-Host "Installing client dependencies..."
Set-Location client
npm install
Set-Location ..

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 4: Run Database Migration
Write-Host "🗄️  Step 4: Database Migration" -ForegroundColor Yellow
Write-Host "-----------------------------"
$migrate = Read-Host "Run coaching system migration? (y/n)"
if ($migrate -eq "y") {
    Set-Location server
    Write-Host "Running migration..."
    node run-coaching-migration.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Migration completed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Migration failed" -ForegroundColor Red
        exit 1
    }
    Set-Location ..
} else {
    Write-Host "⚠️  Skipping migration" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Build Backend
Write-Host "🔨 Step 5: Building Backend" -ForegroundColor Yellow
Write-Host "---------------------------"
Set-Location server
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Backend build failed" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host ""

# Step 6: Build Frontend
Write-Host "🎨 Step 6: Building Frontend" -ForegroundColor Yellow
Write-Host "----------------------------"
Set-Location client
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend build failed" -ForegroundColor Red
    exit 1
}
Set-Location ..
Write-Host ""

# Step 7: Test Moments Completion
Write-Host "🧪 Step 7: Testing Moments" -ForegroundColor Yellow
Write-Host "--------------------------"
$test = Read-Host "Run moments completion test? (y/n)"
if ($test -eq "y") {
    Set-Location server
    node test-moments-completion.js
    Set-Location ..
}
Write-Host ""

# Step 8: Start Production Server
Write-Host "🚀 Step 8: Starting Production Server" -ForegroundColor Yellow
Write-Host "-------------------------------------"
$start = Read-Host "Start server now? (y/n)"
if ($start -eq "y") {
    Write-Host "Starting server..."
    Set-Location server
    
    # Check if PM2 is available
    $pm2Available = Get-Command pm2 -ErrorAction SilentlyContinue
    
    if ($pm2Available) {
        Write-Host "Using PM2 process manager..."
        pm2 stop alt-manager 2>$null
        pm2 start npm --name "alt-manager" -- start
        pm2 save
        Write-Host "✅ Server started with PM2" -ForegroundColor Green
        Write-Host "View logs: pm2 logs alt-manager"
        Write-Host "Stop server: pm2 stop alt-manager"
    } else {
        Write-Host "Starting server directly..."
        Start-Process -NoNewWindow npm -ArgumentList "start"
        Write-Host "✅ Server started" -ForegroundColor Green
    }
    
    Set-Location ..
} else {
    Write-Host "⚠️  Server not started" -ForegroundColor Yellow
    Write-Host "To start manually: cd server && npm start"
}
Write-Host ""

# Step 9: Deployment Summary
Write-Host "📊 Deployment Summary" -ForegroundColor Cyan
Write-Host "===================="
Write-Host ""
Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Server URL: http://localhost:3000"
Write-Host "🔗 API Health: http://localhost:3000/api/health"
Write-Host ""
Write-Host "📝 Next Steps:"
Write-Host "1. Test the application: http://localhost:5173 (dev) or your production URL"
Write-Host "2. Verify moments work correctly"
Write-Host "3. Check server logs for errors"
Write-Host "4. Monitor API response times"
Write-Host ""
Write-Host "📚 Documentation:"
Write-Host "- DEPLOYMENT-READY-STATUS.md - Full deployment guide"
Write-Host "- MOMENT-DEBRIEF-FIX.md - Moment fix details"
Write-Host "- QUICK-START-COACHING.md - Coaching system setup"
Write-Host ""
Write-Host "🎉 Your ALT Manager is ready!" -ForegroundColor Green
Write-Host ""
