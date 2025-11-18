# ALT Manager - Manager Moments Setup Script
# This script sets up the Manager Moments tables and seeds initial data

Write-Host "🚀 ALT Manager - Manager Moments Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if server/.env exists
if (-not (Test-Path "server\.env")) {
    Write-Host "❌ Error: server\.env file not found" -ForegroundColor Red
    Write-Host "Please copy server\.env.example to server\.env and configure it" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Environment file found" -ForegroundColor Green
Write-Host ""

# Navigate to server directory
Set-Location server

# Run migration using Node.js
Write-Host "📊 Creating Manager Moments tables..." -ForegroundColor Yellow

try {
    node src/db/run-migration.js src/db/migrations/add_manager_moments_tables.sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Manager Moments tables created successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Migration had issues (check output above)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error running migration: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "🌱 Seeding initial moments data..." -ForegroundColor Yellow

try {
    node src/db/run-migration.js src/db/seed-moments.sql
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Initial moments seeded successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Warning: Seeding had issues (check output above)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error seeding data: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Return to root directory
Set-Location ..

Write-Host ""
Write-Host "🎉 Manager Moments Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Install uuid types: npm install --save-dev @types/uuid" -ForegroundColor White
Write-Host "2. Start development servers:" -ForegroundColor White
Write-Host "   - From root: npm run dev" -ForegroundColor Gray
Write-Host "3. Navigate to http://localhost:5173/moments" -ForegroundColor White
Write-Host ""
Write-Host "New API Endpoints Available:" -ForegroundColor Cyan
Write-Host "  GET    /api/moments                    - List all moments" -ForegroundColor White
Write-Host "  POST   /api/moments/:id/start          - Start moment session" -ForegroundColor White
Write-Host "  POST   /api/moments/:id/response       - Submit user response" -ForegroundColor White
Write-Host "  POST   /api/moments/:id/debrief        - Generate debrief" -ForegroundColor White
Write-Host "  POST   /api/moments/:id/practice       - Create practice variant" -ForegroundColor White
Write-Host "  GET    /api/moments/:id/progress       - Get moment progress" -ForegroundColor White
Write-Host "  GET    /api/moments/:id/peer-examples  - Get peer examples" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation: MANAGER_MOMENTS_SUMMARY.md" -ForegroundColor Cyan
Write-Host ""
