# Fix missing TypeScript type definitions

Write-Host "🔧 Installing missing TypeScript types..." -ForegroundColor Cyan

npm install --save-dev @types/compression

Write-Host "✅ Type definitions installed!" -ForegroundColor Green
Write-Host "You can now rebuild the project without type errors." -ForegroundColor Gray
