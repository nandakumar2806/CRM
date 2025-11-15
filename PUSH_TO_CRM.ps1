# PowerShell Script to Push to GitHub Repository "CRM"

param(
    [Parameter(Mandatory=$false)]
    [string]$GitHubUsername = "",
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubToken = "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",
    
    [Parameter(Mandatory=$false)]
    [string]$RepoName = "CRM"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Push litnetX to GitHub Repository: CRM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    $gitVersion = git --version 2>&1
    Write-Host "[OK] Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Git is not installed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Git first:" -ForegroundColor Yellow
    Write-Host "1. Download: https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "2. Install (check 'Add Git to PATH')" -ForegroundColor White
    Write-Host "3. Restart terminal and run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "OR use GitHub Desktop: https://desktop.github.com/" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# Get username if not provided
if ([string]::IsNullOrWhiteSpace($GitHubUsername)) {
    $GitHubUsername = Read-Host "Enter your GitHub username"
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Repository: $RepoName" -ForegroundColor White
Write-Host " Username: $GitHubUsername" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/6] Initializing Git repository..." -ForegroundColor Cyan
if (Test-Path .git) {
    Write-Host "[OK] Git repository already initialized" -ForegroundColor Green
} else {
    git init
    Write-Host "[OK] Git repository initialized" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/6] Adding all files..." -ForegroundColor Cyan
git add .
Write-Host "[OK] Files added" -ForegroundColor Green

Write-Host ""
Write-Host "[3/6] Creating commit..." -ForegroundColor Cyan
git commit -m "Initial commit: litnetX CRM system with GitHub deployment setup" 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Files committed" -ForegroundColor Green
} else {
    Write-Host "[INFO] No new changes to commit" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[4/6] Setting up remote..." -ForegroundColor Cyan
git remote remove origin 2>$null
$remoteUrl = "https://${GitHubUsername}:${GitHubToken}@github.com/${GitHubUsername}/${RepoName}.git"
git remote add origin $remoteUrl
Write-Host "[OK] Remote configured: https://github.com/${GitHubUsername}/${RepoName}" -ForegroundColor Green

Write-Host ""
Write-Host "[5/6] Setting branch to main..." -ForegroundColor Cyan
git branch -M main
Write-Host "[OK] Branch set to main" -ForegroundColor Green

Write-Host ""
Write-Host "[6/6] Pushing to GitHub repository 'CRM'..." -ForegroundColor Cyan
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host " SUCCESS! Files pushed to GitHub!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository URL: https://github.com/${GitHubUsername}/${RepoName}" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "All files have been uploaded to the CRM repository." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Visit your repository to verify files" -ForegroundColor White
    Write-Host "2. See DEPLOYMENT.md to deploy your app" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "[ERROR] Push failed. Possible reasons:" -ForegroundColor Red
    Write-Host "- Repository '$RepoName' doesn't exist on GitHub" -ForegroundColor Yellow
    Write-Host "- Token doesn't have 'repo' permissions" -ForegroundColor Yellow
    Write-Host "- Username is incorrect" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "IMPORTANT: Make sure you created the repository first:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/new" -ForegroundColor White
    Write-Host "2. Repository name: $RepoName" -ForegroundColor White
    Write-Host "3. DO NOT initialize with README" -ForegroundColor White
    Write-Host "4. Click 'Create repository'" -ForegroundColor White
    Write-Host "5. Run this script again" -ForegroundColor White
    Write-Host ""
}

Read-Host "Press Enter to exit"

