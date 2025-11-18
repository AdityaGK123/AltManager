# Stop all node processes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Start backend server
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\maddu\CascadeProjects\alt-manager\server; npm run dev"

# Wait for backend
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\maddu\CascadeProjects\alt-manager\client; npm run dev"

Write-Host ""
Write-Host "Servers are starting..." -ForegroundColor Green
Write-Host "Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait 10 seconds then open http://localhost:5173" -ForegroundColor Yellow
