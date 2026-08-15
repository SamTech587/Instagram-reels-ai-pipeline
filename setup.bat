@echo off
chcp 65001 >nul
:: Define colors
set ESC=
set GREEN=%ESC%[32m
set CYAN=%ESC%[36m
set YELLOW=%ESC%[33m
set RESET=%ESC%[0m

echo %CYAN%===================================================%RESET%
echo %GREEN%  🚀 Instagram Reels AI Pipeline - 1-Click Setup%RESET%
echo %CYAN%===================================================%RESET%
echo.

echo %YELLOW%[1/4] 📁 Creating necessary folder structure...%RESET%
if not exist "scripts" mkdir scripts
if not exist "scripts\audio_cache" mkdir scripts\audio_cache

echo %YELLOW%[2/4] 📄 Organizing files...%RESET%
if exist "scrape_reels.js" move scrape_reels.js scripts\

echo %YELLOW%[3/4] 🐳 Building and starting Docker containers...%RESET%
docker compose up -d --build

echo.
echo %CYAN%===================================================%RESET%
echo %GREEN%  ✅ SETUP COMPLETE!%RESET%
echo %CYAN%===================================================%RESET%
echo %RESET%🌐 1. Open n8n in your browser: %CYAN%http://localhost:5678%RESET%
echo %RESET%📥 2. Import the %YELLOW%Workflow.json%RESET% file into n8n
echo %RESET%🔑 3. Add your Gemini API Key and Google Sheets credentials
echo %CYAN%===================================================%RESET%
pause
