# ALT Manager - Pre-Deployment Verification Script
# Run this before deploying to ensure everything is ready

Write-Host "🚀 ALT Manager - Pre-Deployment Verification" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$errors = 0
$warnings = 0

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Not in project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Checking Project Structure..." -ForegroundColor Yellow
Write-Host ""

# Check required directories
$requiredDirs = @("client", "server")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✅ $dir directory exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir directory missing" -ForegroundColor Red
        $errors++
    }
}

Write-Host ""
Write-Host "📦 Checking Dependencies..." -ForegroundColor Yellow
Write-Host ""

# Check if node_modules exist
if (Test-Path "server/node_modules") {
    Write-Host "✅ Server dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Server dependencies not installed" -ForegroundColor Yellow
    Write-Host "   Run: cd server && npm install" -ForegroundColor Gray
    $warnings++
}

if (Test-Path "client/node_modules") {
    Write-Host "✅ Client dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️  Client dependencies not installed" -ForegroundColor Yellow
    Write-Host "   Run: cd client && npm install" -ForegroundColor Gray
    $warnings++
}

Write-Host ""
Write-Host "🔐 Checking Environment Variables..." -ForegroundColor Yellow
Write-Host ""

# Check for .env file
if (Test-Path "server/.env") {
    Write-Host "✅ Server .env file exists" -ForegroundColor Green
    
    # Check for required variables
    $envContent = Get-Content "server/.env" -Raw
    $requiredVars = @("DATABASE_URL", "JWT_SECRET", "GEMINI_API_KEY")
    
    foreach ($var in $requiredVars) {
        if ($envContent -match $var) {
            Write-Host "  ✅ $var is set" -ForegroundColor Green
        } else {
            Write-Host "  ❌ $var is missing" -ForegroundColor Red
            $errors++
        }
    }
} else {
    Write-Host "⚠️  Server .env file not found" -ForegroundColor Yellow
    Write-Host "   Copy server/.env.example to server/.env" -ForegroundColor Gray
    $warnings++
}

Write-Host ""
Write-Host "📝 Checking Deployment Files..." -ForegroundColor Yellow
Write-Host ""

$deployFiles = @(
    @{Name="vercel.json"; Desc="Vercel config"},
    @{Name="render.yaml"; Desc="Render config"},
    @{Name="netlify.toml"; Desc="Netlify config"},
    @{Name="docker-compose.yml"; Desc="Docker Compose"},
    @{Name="Dockerfile.backend"; Desc="Backend Dockerfile"},
    @{Name="Dockerfile.frontend"; Desc="Frontend Dockerfile"}
)

foreach ($file in $deployFiles) {
    if (Test-Path $file.Name) {
        Write-Host "✅ $($file.Desc) exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️  $($file.Desc) missing" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔍 Checking TypeScript Compilation..." -ForegroundColor Yellow
Write-Host ""

# Check if TypeScript compiles (server)
Push-Location server
$tsCheckServer = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Server TypeScript compiles successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Server TypeScript compilation errors" -ForegroundColor Red
    $errors++
}
Pop-Location

# Check if TypeScript compiles (client)
Push-Location client
$tsCheckClient = npx tsc --noEmit 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Client TypeScript compiles successfully" -ForegroundColor Green
} else {
    Write-Host "⚠️  Client TypeScript has warnings" -ForegroundColor Yellow
    $warnings++
}
Pop-Location

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "📊 Verification Summary" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

if ($errors -eq 0 -and $warnings -eq 0) {
    Write-Host "✅ All checks passed! Ready for deployment! 🎉" -ForegroundColor Green
} elseif ($errors -eq 0) {
    Write-Host "⚠️  $warnings warning(s) found. Review before deploying." -ForegroundColor Yellow
} else {
    Write-Host "❌ $errors error(s) and $warnings warning(s) found. Fix before deploying." -ForegroundColor Red
}

Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Review DEPLOYMENT_GUIDE.md for platform-specific instructions" -ForegroundColor White
Write-Host "2. Choose your deployment platform (Render, Vercel, Docker, etc.)" -ForegroundColor White
Write-Host "3. Set up environment variables on your platform" -ForegroundColor White
Write-Host "4. Deploy and test!" -ForegroundColor White
Write-Host ""

if ($errors -gt 0) {
    exit 1
}
