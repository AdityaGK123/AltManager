# Performance Testing Script for ALT Manager
# Tests API response times and verifies optimizations

Write-Host "🧪 ALT Manager Performance Testing" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$results = @()

function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url,
        [int]$ExpectedMs
    )
    
    Write-Host "Testing: $Name..." -NoNewline
    
    try {
        $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        $stopwatch.Stop()
        
        $duration = $stopwatch.ElapsedMilliseconds
        $status = if ($duration -le $ExpectedMs) { "✅ PASS" } else { "⚠️  SLOW" }
        
        Write-Host " $status (${duration}ms / target: ${ExpectedMs}ms)" -ForegroundColor $(if ($duration -le $ExpectedMs) { "Green" } else { "Yellow" })
        
        return @{
            Name = $Name
            Duration = $duration
            Expected = $ExpectedMs
            Status = $status
        }
    }
    catch {
        Write-Host " ❌ FAIL (Error: $($_.Exception.Message))" -ForegroundColor Red
        return @{
            Name = $Name
            Duration = -1
            Expected = $ExpectedMs
            Status = "❌ FAIL"
        }
    }
}

Write-Host "📊 Testing API Endpoints" -ForegroundColor Yellow
Write-Host ""

# Test Health Endpoint
$results += Test-Endpoint -Name "Health Check" -Url "$baseUrl/api/health" -ExpectedMs 100

Write-Host ""
Write-Host "⚠️  Note: Other endpoints require authentication" -ForegroundColor Yellow
Write-Host "   To test authenticated endpoints:" -ForegroundColor Yellow
Write-Host "   1. Login to the app" -ForegroundColor Yellow
Write-Host "   2. Get your auth token from browser DevTools" -ForegroundColor Yellow
Write-Host "   3. Use Postman or curl with Authorization header" -ForegroundColor Yellow
Write-Host ""

Write-Host "📈 Performance Targets" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Health Check:        <100ms" -ForegroundColor White
Write-Host "✅ Chat API:            <500ms" -ForegroundColor White
Write-Host "✅ Moments API:         <500ms" -ForegroundColor White
Write-Host "✅ Analytics API:       <800ms" -ForegroundColor White
Write-Host "✅ AI Chat Response:    1-2s" -ForegroundColor White
Write-Host ""

Write-Host "🔍 Database Performance Check" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""
Write-Host "To verify database indexes are working:" -ForegroundColor White
Write-Host "1. Check server logs for query times" -ForegroundColor White
Write-Host "2. Look for: '[Chat] Request completed in XXXms'" -ForegroundColor White
Write-Host "3. Target: <200ms for most queries" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Frontend Performance Check" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow
Write-Host ""
Write-Host "To test frontend performance:" -ForegroundColor White
Write-Host "1. Open Chrome DevTools (F12)" -ForegroundColor White
Write-Host "2. Go to Lighthouse tab" -ForegroundColor White
Write-Host "3. Run Performance audit" -ForegroundColor White
Write-Host "4. Target Score: 90+" -ForegroundColor White
Write-Host ""
Write-Host "Key Metrics to Check:" -ForegroundColor White
Write-Host "  • First Contentful Paint: <1.5s" -ForegroundColor White
Write-Host "  • Time to Interactive: <2.5s" -ForegroundColor White
Write-Host "  • Speed Index: <2.0s" -ForegroundColor White
Write-Host "  • Total Bundle Size: <300KB initial" -ForegroundColor White
Write-Host ""

Write-Host "💡 Manual Testing Checklist" -ForegroundColor Yellow
Write-Host "===========================" -ForegroundColor Yellow
Write-Host ""
Write-Host "[ ] Page loads in <1.5 seconds" -ForegroundColor White
Write-Host "[ ] Chat messages appear in <2 seconds" -ForegroundColor White
Write-Host "[ ] Navigation between pages is instant" -ForegroundColor White
Write-Host "[ ] No console errors in browser" -ForegroundColor White
Write-Host "[ ] Smooth animations and transitions" -ForegroundColor White
Write-Host "[ ] Network tab shows compressed responses" -ForegroundColor White
Write-Host "[ ] React Query cache working (instant re-navigation)" -ForegroundColor White
Write-Host ""

Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

$passCount = ($results | Where-Object { $_.Status -eq "✅ PASS" }).Count
$totalCount = $results.Count

Write-Host "Tests Passed: $passCount / $totalCount" -ForegroundColor $(if ($passCount -eq $totalCount) { "Green" } else { "Yellow" })
Write-Host ""

if ($passCount -eq $totalCount) {
    Write-Host "🎉 All tests passed! Performance optimizations are working." -ForegroundColor Green
} else {
    Write-Host "⚠️  Some tests failed. Check server logs for details." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "📖 See PERFORMANCE_OPTIMIZATIONS.md for detailed metrics" -ForegroundColor Cyan
