# ALT Manager - Restart and Test Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ALT Manager - Restart and Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop all node processes
Write-Host "Step 1: Stopping all Node processes..." -ForegroundColor Yellow
try {
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Write-Host "SUCCESS: All Node processes stopped" -ForegroundColor Green
} catch {
    Write-Host "INFO: No Node processes to stop" -ForegroundColor Gray
}
Start-Sleep -Seconds 2
Write-Host ""

# Step 2: Start backend server
Write-Host "Step 2: Starting backend server..." -ForegroundColor Yellow
$backendPath = "C:\Users\maddu\CascadeProjects\alt-manager\server"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Starting Backend Server...' -ForegroundColor Cyan; npm run dev"
Write-Host "SUCCESS: Backend server starting in new window" -ForegroundColor Green
Write-Host "INFO: Wait for 'Server running on port 3000' message" -ForegroundColor Gray
Start-Sleep -Seconds 8
Write-Host ""

# Step 3: Test backend health
Write-Host "Step 3: Testing backend health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 5
    Write-Host "SUCCESS: Backend is healthy" -ForegroundColor Green
    Write-Host "   Status: $($health.status)" -ForegroundColor Gray
} catch {
    Write-Host "WARNING: Backend not responding yet" -ForegroundColor Yellow
    Write-Host "   Wait a few more seconds and try again" -ForegroundColor Gray
}
Write-Host ""

# Step 4: Start frontend server
Write-Host "Step 4: Starting frontend server..." -ForegroundColor Yellow
$frontendPath = "C:\Users\maddu\CascadeProjects\alt-manager\client"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Starting Frontend Server...' -ForegroundColor Cyan; npm run dev"
Write-Host "SUCCESS: Frontend server starting in new window" -ForegroundColor Green
Write-Host "INFO: Wait for 'Local: http://localhost:5173' message" -ForegroundColor Gray
Start-Sleep -Seconds 5
Write-Host ""

# Step 5: Run authentication tests
Write-Host "Step 5: Running authentication tests..." -ForegroundColor Yellow
Write-Host "INFO: Waiting for servers to fully start..." -ForegroundColor Gray
Start-Sleep -Seconds 3

try {
    & powershell -ExecutionPolicy Bypass -File "C:\Users\maddu\CascadeProjects\alt-manager\test-auth-simple.ps1"
} catch {
    Write-Host "WARNING: Test script failed to run" -ForegroundColor Yellow
    Write-Host "   You can run it manually: powershell -ExecutionPolicy Bypass -File test-auth-simple.ps1" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3000" -ForegroundColor White
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Check backend window for any errors" -ForegroundColor White
Write-Host "2. Check frontend window for Vite startup" -ForegroundColor White
Write-Host "3. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host "4. Test registration and login" -ForegroundColor White
Write-Host ""
Write-Host "To run tests manually:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File test-auth-simple.ps1" -ForegroundColor Gray
Write-Host ""
