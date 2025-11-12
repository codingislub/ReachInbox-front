# ==============================================
# 🌟 ReachInbox — Quick Start Guide
# ==============================================
# Run this script in PowerShell to launch the app
# ==============================================

Write-Host "`n🚀 Launching ReachInbox Email Aggregator..." -ForegroundColor Cyan
Write-Host ""

# --- Step 1: Check if Docker is running ---
Write-Host "🔍 Checking Docker status..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Looks like Docker isn’t running yet." -ForegroundColor Red
    Write-Host "👉 Please open Docker Desktop and rerun this script." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Docker is up and running!" -ForegroundColor Green
Write-Host ""

# --- Step 2: Verify configuration (.env file) ---
Write-Host "🧩 Checking configuration files..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Write-Host "⚠️  Missing backend\.env file. Creating a placeholder..." -ForegroundColor Yellow
    Copy-Item "backend\.env.example" "backend\.env" -ErrorAction SilentlyContinue
    Write-Host "❌ Please update backend\.env with your IMAP credentials and API keys." -ForegroundColor Red
    Write-Host "📘 Refer to SETUP_GUIDE.md for step-by-step setup instructions." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Configuration file found!" -ForegroundColor Green
Write-Host ""

# --- Step 3: Start required Docker services ---
Write-Host "🧱 Starting Docker services (PostgreSQL + Elasticsearch)..." -ForegroundColor Yellow
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Docker services." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker containers are running!" -ForegroundColor Green
Write-Host ""

# --- Step 4: Wait for containers to initialize ---
Write-Host "⏳ Waiting 30 seconds for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# --- Step 5: Verify Elasticsearch connectivity ---
Write-Host "🔍 Checking Elasticsearch health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9200" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Elasticsearch is ready to go!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Elasticsearch might still be starting. Try again in a few moments..." -ForegroundColor Yellow
}
Write-Host ""

# --- Step 6: Display service info ---
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "             🌐 ReachInbox Environment Ready            " -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📦  Frontend:      http://localhost:3000" -ForegroundColor White
Write-Host "🧠  Backend API:   http://localhost:3001" -ForegroundColor White
Write-Host "📊  Elasticsearch: http://localhost:9200" -ForegroundColor White
Write-Host ""
Write-Host "💡 Press Ctrl+C anytime to stop all services." -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# --- Step 7: Launch the app ---
Write-Host "🚀 Starting development servers..." -ForegroundColor Green
npm run dev
