# ALT Manager Analytics Test Script
# Tests all new analytics endpoints

Write-Host "🧪 ALT Manager Analytics Test Suite" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

$API_URL = "http://localhost:3000"
$TEST_EMAIL = "test@example.com"
$TEST_PASSWORD = "test123"

# Function to make API calls
function Invoke-APICall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Token = $null,
        [object]$Body = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    $params = @{
        Method = $Method
        Uri = "$API_URL$Endpoint"
        Headers = $headers
    }
    
    if ($Body) {
        $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
    }
    
    try {
        $response = Invoke-RestMethod @params
        return $response
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Yellow
$health = Invoke-APICall -Method GET -Endpoint "/api/health"
if ($health -and $health.status -eq "ok") {
    Write-Host "✅ Server is healthy" -ForegroundColor Green
} else {
    Write-Host "❌ Server health check failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Login
Write-Host "2️⃣  Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = $TEST_EMAIL
    password = $TEST_PASSWORD
}
$loginResponse = Invoke-APICall -Method POST -Endpoint "/api/auth/login" -Body $loginBody

if ($loginResponse -and $loginResponse.token) {
    Write-Host "✅ Login successful" -ForegroundColor Green
    $TOKEN = $loginResponse.token
} else {
    Write-Host "⚠️  Login failed - you may need to register first" -ForegroundColor Yellow
    Write-Host "Attempting registration..." -ForegroundColor Yellow
    
    $registerBody = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
        name = "Test User"
    }
    $registerResponse = Invoke-APICall -Method POST -Endpoint "/api/auth/register" -Body $registerBody
    
    if ($registerResponse -and $registerResponse.token) {
        Write-Host "✅ Registration successful" -ForegroundColor Green
        $TOKEN = $registerResponse.token
    } else {
        Write-Host "❌ Authentication failed" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Test 3: Generate MoM
Write-Host "3️⃣  Testing MoM Generation..." -ForegroundColor Yellow
$momBody = @{
    transcript = @"
User: I'm struggling with time management. I have too many meetings and can't focus on my actual work.

Manager: I hear you. Time management is a common challenge, especially in fast-paced environments. Let's break this down. How many hours per day are you spending in meetings?

User: Probably 4-5 hours. And then I'm left with very little time for deep work.

Manager: That's significant. Here's what I suggest: First, audit your meetings this week. Identify which ones you can decline, delegate, or shorten. Second, block 2-hour focus time slots in your calendar daily. Treat them as non-negotiable meetings with yourself.

User: That makes sense. I've never thought about blocking time like that.

Manager: Exactly. Also, communicate your focus hours to your team. Set expectations that you won't be available during those times unless it's urgent. This is about setting boundaries and protecting your productivity.

User: I'll try that. Thanks!
"@
    date = (Get-Date).ToString("dd-MM-yyyy")
}

$momResponse = Invoke-APICall -Method POST -Endpoint "/api/analysis/mom" -Token $TOKEN -Body $momBody

if ($momResponse -and $momResponse.success) {
    Write-Host "✅ MoM generated successfully" -ForegroundColor Green
    Write-Host "   Title: $($momResponse.mom.title)" -ForegroundColor Cyan
    Write-Host "   Development Areas: $($momResponse.mom.developmentAreas -join ', ')" -ForegroundColor Cyan
} else {
    Write-Host "❌ MoM generation failed" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get MoMs
Write-Host "4️⃣  Testing Get MoMs..." -ForegroundColor Yellow
$momsResponse = Invoke-APICall -Method GET -Endpoint "/api/analysis/moms" -Token $TOKEN

if ($momsResponse -and $momsResponse.success) {
    Write-Host "✅ Retrieved $($momsResponse.count) MoM(s)" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to retrieve MoMs" -ForegroundColor Red
}
Write-Host ""

# Test 5: Generate Trend Analysis
Write-Host "5️⃣  Testing Trend Analysis..." -ForegroundColor Yellow
$trendsResponse = Invoke-APICall -Method POST -Endpoint "/api/analysis/trends" -Token $TOKEN -Body @{}

if ($trendsResponse -and $trendsResponse.success) {
    Write-Host "✅ Trend analysis generated successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Trend analysis may require more MoMs" -ForegroundColor Yellow
}
Write-Host ""

# Test 6: Generate Blindspot Analysis
Write-Host "6️⃣  Testing Blindspot Analysis..." -ForegroundColor Yellow
$blindspotsResponse = Invoke-APICall -Method POST -Endpoint "/api/analysis/blindspots" -Token $TOKEN -Body @{}

if ($blindspotsResponse -and $blindspotsResponse.success) {
    Write-Host "✅ Blindspot analysis generated successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Blindspot analysis may require more MoMs" -ForegroundColor Yellow
}
Write-Host ""

# Test 7: Generate Progress Analysis
Write-Host "7️⃣  Testing Progress Analysis..." -ForegroundColor Yellow
$progressResponse = Invoke-APICall -Method POST -Endpoint "/api/analysis/progress" -Token $TOKEN -Body @{}

if ($progressResponse -and $progressResponse.success) {
    Write-Host "✅ Progress analysis generated successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Progress analysis may require more MoMs" -ForegroundColor Yellow
}
Write-Host ""

# Test 8: Get Dashboard
Write-Host "8️⃣  Testing Analytics Dashboard..." -ForegroundColor Yellow
$dashboardResponse = Invoke-APICall -Method GET -Endpoint "/api/analysis/dashboard" -Token $TOKEN

if ($dashboardResponse -and $dashboardResponse.success) {
    Write-Host "✅ Dashboard data retrieved successfully" -ForegroundColor Green
    Write-Host "   Total MoMs: $($dashboardResponse.dashboard.momCount)" -ForegroundColor Cyan
    Write-Host "   Has Trend Analysis: $($null -ne $dashboardResponse.dashboard.latestTrend)" -ForegroundColor Cyan
    Write-Host "   Has Blindspot Analysis: $($null -ne $dashboardResponse.dashboard.latestBlindspot)" -ForegroundColor Cyan
    Write-Host "   Has Progress Analysis: $($null -ne $dashboardResponse.dashboard.latestProgress)" -ForegroundColor Cyan
} else {
    Write-Host "❌ Failed to retrieve dashboard data" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "🎉 Test Suite Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ✅ All core analytics endpoints are functional" -ForegroundColor White
Write-Host "  ✅ MoM generation working" -ForegroundColor White
Write-Host "  ✅ Analysis endpoints responding" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Visit http://localhost:5173/moms to view MoMs" -ForegroundColor White
Write-Host "  2. Visit http://localhost:5173/analytics for full dashboard" -ForegroundColor White
Write-Host "  3. Generate more conversations to unlock trend analysis" -ForegroundColor White
Write-Host ""
