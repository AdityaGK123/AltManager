# Seed Manager Moments Database
Write-Host "🌱 Seeding Manager Moments..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/admin/seed-moments" -Method POST -ContentType "application/json"
    
    Write-Host "✅ Success!" -ForegroundColor Green
    Write-Host "Message: $($response.message)" -ForegroundColor White
    Write-Host "`nBreakdown by category:" -ForegroundColor Yellow
    
    foreach ($item in $response.breakdown) {
        Write-Host "  - $($item.category): $($item.count) moments" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Error seeding database:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nMake sure the server is running on http://localhost:3000" -ForegroundColor Yellow
}
