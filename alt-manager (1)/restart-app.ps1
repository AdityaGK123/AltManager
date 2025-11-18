# Stop all node processes
Write-Host "🛑 Stopping all Node processes..." -ForegroundColor Yellow
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Start backend
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\maddu\CascadeProjects\alt-manager\server; npm run dev"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend
Write-Host "🚀 Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\Users\maddu\CascadeProjects\alt-manager\client; npm run dev"

Write-Host ""
Write-Host "✅ Servers starting..." -ForegroundColor Green
Write-Host "📡 Backend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Wait 10 seconds, then open http://localhost:5173 in your browser" -ForegroundColor Yellow
