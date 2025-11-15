@echo off
title CRM Server - Starting...
color 0A
cls
echo ========================================
echo    CRM SYSTEM - Server Startup
echo ========================================
echo.

REM Check if port 3000 is in use
echo [1/4] Checking port 3000...
netstat -ano | findstr ":3000.*LISTENING" >nul 2>&1
if %errorlevel% == 0 (
    echo ⚠️  Port 3000 is already in use!
    echo.
    echo Stopping existing processes...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000.*LISTENING"') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
    echo ✅ Port cleared
) else (
    echo ✅ Port 3000 is available
)
echo.

REM Check if Node.js is installed
echo [2/4] Checking Node.js installation...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js found
echo.

REM Check if server.js exists
echo [3/4] Checking server files...
if not exist "server.js" (
    echo ❌ server.js not found!
    echo Please make sure you're in the correct directory.
    pause
    exit /b 1
)
if not exist "public\index.html" (
    echo ❌ Frontend files not found!
    echo Please make sure public folder exists with index.html
    pause
    exit /b 1
)
echo ✅ All files found
echo.

REM Start the server
echo [4/4] Starting CRM Server...
echo.
echo ========================================
echo    Server is starting...
echo ========================================
echo.
echo 📍 Access the CRM at: http://localhost:3000
echo 📍 Health check: http://localhost:3000/health
echo.
echo Login credentials:
echo    Username: admin
echo    Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node server.js

pause
