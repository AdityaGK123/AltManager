# ALT Manager - Authentication Flow Test Script
Write-Host "🔍 Testing ALT Manager Authentication Flow" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health Check
Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
    Write-Host "✅ Backend is running" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
    Write-Host "   Timestamp: $($health.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend health check failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Test Registration
Write-Host "Test 2: User Registration" -ForegroundColor Yellow
$testEmail = "test_$(Get-Random)@example.com"
$registrationData = @{
    email = $testEmail
    password = "TestPass123!"
    name = "Test User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" `
        -Method Post `
        -Body $registrationData `
        -ContentType "application/json"
    
    Write-Host "✅ Registration successful" -ForegroundColor Green
    Write-Host "   User ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "   Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
    
    $token = $response.token
    $userId = $response.user.id
} catch {
    Write-Host "❌ Registration failed" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}
Write-Host ""

# Test 3: Test Login
Write-Host "Test 3: User Login" -ForegroundColor Yellow
$loginData = @{
    email = $testEmail
    password = "TestPass123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
        -Method Post `
        -Body $loginData `
        -ContentType "application/json"
    
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "   User ID: $($loginResponse.user.id)" -ForegroundColor Gray
    Write-Host "   Token: $($loginResponse.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 4: Test Protected Route (Get Profile)
Write-Host "Test 4: Protected Route Access" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $profile = Invoke-RestMethod -Uri "http://localhost:3000/api/user/profile" `
        -Method Get `
        -Headers $headers
    
    Write-Host "✅ Profile access successful" -ForegroundColor Green
    Write-Host "   User: $($profile.user.name) ($($profile.user.email))" -ForegroundColor Gray
    Write-Host "   Onboarding: $($profile.profile.onboardingCompleted)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Profile access failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 5: Test CORS Headers
Write-Host "Test 5: CORS Configuration" -ForegroundColor Yellow
try {
    $corsTest = Invoke-WebRequest -Uri "http://localhost:3000/api/health" `
        -Method Options `
        -Headers @{"Origin" = "http://localhost:5173"}
    
    $corsHeader = $corsTest.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Host "✅ CORS configured" -ForegroundColor Green
        Write-Host "   Allowed Origin: $corsHeader" -ForegroundColor Gray
    } else {
        Write-Host "⚠️  CORS headers not found" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  CORS test inconclusive: $_" -ForegroundColor Yellow
}
Write-Host ""

# Test 6: Frontend Availability
Write-Host "Test 6: Frontend Server" -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:5173" -Method Get -TimeoutSec 5
    Write-Host "✅ Frontend is running" -ForegroundColor Green
    Write-Host "   Status: $($frontend.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Frontend check failed: $_" -ForegroundColor Yellow
    Write-Host "   Make sure frontend is running: npm run dev" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ All authentication tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host "2. Register a new account" -ForegroundColor White
Write-Host "3. Complete onboarding flow" -ForegroundColor White
Write-Host "4. Test chat and other features" -ForegroundColor White
Write-Host ""
