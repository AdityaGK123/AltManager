# Test Manager Moments API
Write-Host "🧪 Testing Manager Moments API..." -ForegroundColor Cyan

# First, let's check if server is running
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method GET
    Write-Host "✅ Server is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not running on http://localhost:3000" -ForegroundColor Red
    Write-Host "Please start the server first: cd server && npm run dev" -ForegroundColor Yellow
    exit 1
}

# Test seed endpoint
Write-Host "`n🌱 Testing seed endpoint..." -ForegroundColor Cyan
try {
    $seedResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/seed-moments" -Method POST -ContentType "application/json"
    Write-Host "✅ Seed successful!" -ForegroundColor Green
    Write-Host "Seeded $($seedResponse.breakdown.Count) categories" -ForegroundColor White
} catch {
    Write-Host "⚠️  Seed endpoint error: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "This might be okay if moments are already seeded" -ForegroundColor Gray
}

# Note: We can't test authenticated endpoints without a token
Write-Host "`n📝 Note: To test authenticated endpoints (like GET /api/moments), you need to:" -ForegroundColor Yellow
Write-Host "  1. Login through the web app" -ForegroundColor White
Write-Host "  2. Get the JWT token from browser localStorage" -ForegroundColor White
Write-Host "  3. Use it in Authorization header" -ForegroundColor White

Write-Host ""
Write-Host "Basic API tests complete" -ForegroundColor Green
