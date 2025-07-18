@echo off
echo.
echo ====================================
echo   Voice Betting Terminal - Windows
echo ====================================
echo.
echo Checking if port 5000 is free...
netstat -an | find "5000" >nul
if %errorlevel%==0 (
    echo Port 5000 is busy, using port 3000 instead
    echo Starting simple server on port 3000...
    node simple-start.js
) else (
    echo Port 5000 is free, trying main server...
    set NODE_ENV=development
    npx tsx server/index.ts
)
echo.
echo Press any key to exit...
pause >nul