# Fix Backend Script
# 1. Kill any process on port 5000
$port = 5000
$process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "Killing process on port $port..." -ForegroundColor Yellow
    Stop-Process -Id $process.OwningProcess -Force
}

# 2. Check .env
if (-not (Test-Path .env)) {
    Write-Host "Warning: .env file missing!" -ForegroundColor Red
} else {
    Write-Host "Found .env file." -ForegroundColor Green
}

# 3. Start the server
Write-Host "Starting server with nodemon..." -ForegroundColor Cyan
npm run dev
