# ALT Manager - Authentication Flow Test Script
Write-Host "Testing ALT Manager Authentication Flow" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Backend Health Check
Write-Host "Test 1: Backend Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
    Write-Host "SUCCESS: Backend is running" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Backend health check failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 2: Test Registration
Write-Host "Test 2: User Registration" -ForegroundColor Yellow
$testEmail = "test_$(Get-Random)@example.com"
$registrationData = @{
    email = $testEmail
    password = "TestPass123"
    name = "Test User"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method Post -Body $registrationData -ContentType "application/json"
    
    Write-Host "SUCCESS: Registration successful" -ForegroundColor Green
    Write-Host "   User ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "   Token received: YES" -ForegroundColor Gray
    
    $token = $response.token
    $userId = $response.user.id
} catch {
    Write-Host "FAILED: Registration failed" -ForegroundColor Red
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
    password = "TestPass123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginData -ContentType "application/json"
    
    Write-Host "SUCCESS: Login successful" -ForegroundColor Green
    Write-Host "   User ID: $($loginResponse.user.id)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Login failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 4: Test Protected Route
Write-Host "Test 4: Protected Route Access" -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
    }
    $profile = Invoke-RestMethod -Uri "http://localhost:3000/api/user/profile" -Method Get -Headers $headers
    
    Write-Host "SUCCESS: Profile access successful" -ForegroundColor Green
    Write-Host "   User: $($profile.user.name)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: Profile access failed: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All authentication tests passed!" -ForegroundColor Green
Write-Host ""
