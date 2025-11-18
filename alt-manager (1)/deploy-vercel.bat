@echo off
echo ========================================
echo   ALT Manager - Vercel Deployment
echo ========================================
echo.

echo Step 1: Building application...
call npm run build:client
if %errorlevel% neq 0 (
    echo Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying to Vercel...
cd client
call vercel --prod

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Note your deployment URL
echo 2. Deploy backend to Render/Railway
echo 3. Update VITE_API_URL in Vercel dashboard
echo.
pause
