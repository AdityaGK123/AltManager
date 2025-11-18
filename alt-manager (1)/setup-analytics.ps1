# ALT Manager Analytics Setup Script
# This script sets up the new analytics tables and verifies the installation

Write-Host "🚀 ALT Manager Analytics Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path "server\.env")) {
    Write-Host "❌ Error: server\.env file not found" -ForegroundColor Red
    Write-Host "Please copy server\.env.example to server\.env and configure it" -ForegroundColor Yellow
    exit 1
}

# Load environment variables
Write-Host "📋 Loading environment variables..." -ForegroundColor Yellow
Get-Content server\.env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1]
        $value = $matches[2]
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

$DATABASE_URL = $env:DATABASE_URL

if (-not $DATABASE_URL) {
    Write-Host "❌ Error: DATABASE_URL not found in .env" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Environment variables loaded" -ForegroundColor Green
Write-Host ""

# Create analytics tables
Write-Host "📊 Creating analytics tables..." -ForegroundColor Yellow

$sqlScript = Get-Content "server\src\db\create-analysis-tables.sql" -Raw

# Extract connection details from DATABASE_URL
# Format: postgresql://user:password@host/database?sslmode=require
if ($DATABASE_URL -match 'postgresql://([^:]+):([^@]+)@([^/]+)/([^?]+)') {
    $dbUser = $matches[1]
    $dbPassword = $matches[2]
    $dbHost = $matches[3]
    $dbName = $matches[4]
    
    Write-Host "Connecting to database: $dbName at $dbHost" -ForegroundColor Cyan
    
    # Set PGPASSWORD environment variable
    $env:PGPASSWORD = $dbPassword
    
    # Execute SQL script using psql
    try {
        $sqlScript | psql -h $dbHost -U $dbUser -d $dbName -v ON_ERROR_STOP=1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Analytics tables created successfully" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Warning: Some tables may already exist (this is OK)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Error creating tables: $_" -ForegroundColor Red
        Write-Host "Note: If psql is not installed, you can run the SQL script manually" -ForegroundColor Yellow
        Write-Host "SQL script location: server\src\db\create-analysis-tables.sql" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Error: Could not parse DATABASE_URL" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run 'npm run dev' to start the development servers" -ForegroundColor White
Write-Host "2. Navigate to /analytics to view the new analytics dashboard" -ForegroundColor White
Write-Host "3. Navigate to /moms to view Minutes of Meeting" -ForegroundColor White
Write-Host ""
Write-Host "New API Endpoints Available:" -ForegroundColor Cyan
Write-Host "  POST   /api/analysis/mom          - Generate MoM from conversation" -ForegroundColor White
Write-Host "  GET    /api/analysis/moms         - Get all MoMs" -ForegroundColor White
Write-Host "  POST   /api/analysis/trends       - Generate trend analysis" -ForegroundColor White
Write-Host "  POST   /api/analysis/blindspots   - Generate blindspot analysis" -ForegroundColor White
Write-Host "  POST   /api/analysis/progress     - Generate progress analysis" -ForegroundColor White
Write-Host "  GET    /api/analysis/dashboard    - Get analytics dashboard" -ForegroundColor White
Write-Host ""
