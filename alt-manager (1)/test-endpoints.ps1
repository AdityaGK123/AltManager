# ALT Manager Endpoint Testing Script
# Tests all critical API endpoints to verify they're working

$API_URL = "http://localhost:3000"
$ErrorCount = 0
$SuccessCount = 0

Write-Host "`n🧪 ALT Manager Endpoint Testing" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Function to test endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    Write-Host "`nTesting: $Name" -ForegroundColor Yellow
    Write-Host "  URL: $Method $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 300) {
            Write-Host "  ✅ PASS ($($response.StatusCode))" -ForegroundColor Green
            $script:SuccessCount++
            return $true
        } else {
            Write-Host "  ❌ FAIL ($($response.StatusCode))" -ForegroundColor Red
            $script:ErrorCount++
            return $false
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host "  ❌ FAIL ($statusCode) - $($_.Exception.Message)" -ForegroundColor Red
        } else {
            Write-Host "  ❌ FAIL - $($_.Exception.Message)" -ForegroundColor Red
        }
        $script:ErrorCount++
        return $false
    }
}

# Test Health Endpoint
Write-Host "`n📊 Health Checks" -ForegroundColor Cyan
Write-Host "-" * 60 -ForegroundColor Gray
Test-Endpoint -Name "Health Check" -Url "$API_URL/api/health"
Test-Endpoint -Name "Database Health" -Url "$API_URL/api/health/db"

# Test Public Endpoints (No Auth Required)
Write-Host "`n🌐 Public Endpoints" -ForegroundColor Cyan
Write-Host "-" * 60 -ForegroundColor Gray

# Note: These will fail with 401 if auth is required, which is expected
Write-Host "`nNote: Auth-protected endpoints will return 401 (expected without token)" -ForegroundColor Gray

# Test Moments Endpoints (will need auth)
Write-Host "`n🎯 Moments Endpoints (Auth Required)" -ForegroundColor Cyan
Write-Host "-" * 60 -ForegroundColor Gray
Test-Endpoint -Name "Get All Moments" -Url "$API_URL/api/moments"

# Test Analysis Endpoints
Write-Host "`n📈 Analysis Endpoints (Auth Required)" -ForegroundColor Cyan
Write-Host "-" * 60 -ForegroundColor Gray
Test-Endpoint -Name "Get MoMs" -Url "$API_URL/api/analysis/moms"
Test-Endpoint -Name "Get Dashboard" -Url "$API_URL/api/analysis/dashboard"

# Test Habits Endpoints
Write-Host "`n✅ Habits Endpoints (Auth Required)" -ForegroundColor Cyan
Write-Host "-" * 60 -ForegroundColor Gray
Test-Endpoint -Name "Get Habits" -Url "$API_URL/api/habits"

# Test Achievements Endpoints
Write-Host "`n🏆 Achievements Endpoints (Auth Required)" -ForegroundColor Cyan
Write-Host "-" * 60 -ForegroundColor Gray
Test-Endpoint -Name "Get Achievements" -Url "$API_URL/api/achievements"

# Summary
Write-Host "`n" + "=" * 60 -ForegroundColor Cyan
Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "  ✅ Passed: $SuccessCount" -ForegroundColor Green
Write-Host "  ❌ Failed: $ErrorCount" -ForegroundColor Red

if ($ErrorCount -eq 0) {
    Write-Host "`n✅ All tests passed!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "`n⚠️  Some tests failed. Check the output above." -ForegroundColor Yellow
    Write-Host "Note: 401 errors are expected for auth-protected endpoints without a token." -ForegroundColor Gray
    exit 1
}
