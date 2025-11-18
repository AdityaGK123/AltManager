# Manager Moments Seed Setup Script
# Run this after starting Docker Desktop

Write-Host "🌟 Manager Moments Seed Setup" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Check if Docker is running
Write-Host "1️⃣ Checking Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker is not running" -ForegroundColor Red
    Write-Host "   Please start Docker Desktop and run this script again`n" -ForegroundColor Gray
    exit 1
}
Write-Host "✅ Docker is running`n" -ForegroundColor Green

# Start database if not running
Write-Host "2️⃣ Starting database..." -ForegroundColor Yellow
docker-compose up -d db
Start-Sleep -Seconds 3
Write-Host "✅ Database started`n" -ForegroundColor Green

# Run seed script
Write-Host "3️⃣ Seeding 10 Manager Moments..." -ForegroundColor Yellow
Set-Location server
node src/db/run-migration.js src/db/seed-moments.sql
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Seed failed. Check database connection`n" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Seed completed`n" -ForegroundColor Green

# Verify seed
Write-Host "4️⃣ Verifying data..." -ForegroundColor Yellow
node src/db/verify-seed.js
Write-Host ""

# Instructions
Write-Host "🚀 Setup Complete!" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Cyan
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Start dev servers: npm run dev" -ForegroundColor Gray
Write-Host "   2. Open: http://localhost:5173/moments" -ForegroundColor Gray
Write-Host "   3. You should see 10 moment cards`n" -ForegroundColor Gray

Set-Location ..
