@echo off
echo ========================================
echo  Push litnetX to GitHub Repository: CRM
echo ========================================
echo.

REM Check if git is installed
where git >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed!
    echo.
    echo Please install Git first:
    echo 1. Download: https://git-scm.com/download/win
    echo 2. Install (check "Add Git to PATH")
    echo 3. Restart terminal and run this script again
    echo.
    echo OR use GitHub Desktop: https://desktop.github.com/
    echo.
    pause
    exit /b 1
)

echo [OK] Git is installed. Proceeding...
echo.

REM Try to get token from environment variable first
if "%GITHUB_TOKEN%"=="" (
    REM Try to read from .env file (basic parsing)
    for /f "tokens=2 delims==" %%a in ('findstr /C:"GITHUB_TOKEN=" .env 2^>nul') do set GITHUB_TOKEN=%%a
    REM If still empty, use default
    if "%GITHUB_TOKEN%"=="" set GITHUB_TOKEN=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
)

set /p GITHUB_USERNAME="Enter your GitHub username: "
set REPO_NAME=CRM

echo.
echo ========================================
echo  Repository: CRM
echo  Username: %GITHUB_USERNAME%
echo ========================================
echo.

echo [1/6] Initializing Git repository...
if exist .git (
    echo [OK] Git repository already initialized
) else (
    git init
    echo [OK] Git repository initialized
)

echo.
echo [2/6] Adding all files...
git add .
echo [OK] Files added

echo.
echo [3/6] Creating commit...
git commit -m "Initial commit: litnetX CRM system with GitHub deployment setup" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Files committed
) else (
    echo [INFO] No new changes to commit
)

echo.
echo [4/6] Setting up remote...
git remote remove origin 2>nul
git remote add origin https://%GITHUB_USERNAME%:%GITHUB_TOKEN%@github.com/%GITHUB_USERNAME%/%REPO_NAME%.git
echo [OK] Remote configured: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%

echo.
echo [5/6] Setting branch to main...
git branch -M main
echo [OK] Branch set to main

echo.
echo [6/6] Pushing to GitHub repository "CRM"...
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUCCESS! Files pushed to GitHub!
    echo ========================================
    echo.
    echo Repository URL: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
    echo.
    echo All files have been uploaded to the CRM repository.
    echo.
    echo Next steps:
    echo 1. Visit your repository to verify files
    echo 2. See DEPLOYMENT.md to deploy your app
    echo.
) else (
    echo.
    echo [ERROR] Push failed. Possible reasons:
    echo - Repository 'CRM' doesn't exist on GitHub
    echo - Token doesn't have 'repo' permissions
    echo - Username is incorrect
    echo.
    echo IMPORTANT: Make sure you created the repository first:
    echo 1. Go to: https://github.com/new
    echo 2. Repository name: CRM
    echo 3. DO NOT initialize with README
    echo 4. Click "Create repository"
    echo 5. Run this script again
    echo.
)

pause

