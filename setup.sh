#!/bin/bash
echo "==================================================="
echo "  🚀 Instagram Reels AI Pipeline - 1-Click Setup"
echo "==================================================="
echo ""

echo "[1/4] 📁 Creating necessary folder structure..."
mkdir -p scripts/audio_cache

echo "[2/4] 📄 Organizing files..."
if [ -f "scrape_reels.js" ]; then
    mv scrape_reels.js scripts/
fi

echo "[3/4] 🐳 Building and starting Docker containers..."
docker compose up -d --build

echo ""
echo "==================================================="
echo "  ✅ SETUP COMPLETE!"
echo "==================================================="
echo "🌐 1. Open n8n in your browser: http://localhost:5678"
echo "📥 2. Import the Workflow.json file into n8n"
echo "🔑 3. Add your Gemini API Key and Google Sheets credentials"
echo "==================================================="
