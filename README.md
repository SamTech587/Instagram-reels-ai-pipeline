<div align="center">
  <img src="hero-image.png" alt="n8n Workflow Architecture" width="100%" style="border-radius: 10px;">
    
  


  <h1>🎬 Instagram Reels AI Pipeline</h1>
  
  <p><b>An automated, Dockerized AI pipeline that scrapes saved Instagram Reels, extracts on-screen text and spoken audio, and uses Google's Gemini AI to generate intelligent summaries directly into a Google Sheet.</b></p>

    


  <img src="https://img.shields.io/badge/n8n-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white" alt="n8n">
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/puppeteer-%2340B5A4.svg?style=for-the-badge&logo=puppeteer&logoColor=white" alt="Puppeteer">
  <img src="https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Gemini">
  
    
  

</div>

---

## 🧠 How It Works

The pipeline intelligently routes data based on what it finds in the video:

| Step | Action | Description |
| :--- | :--- | :--- |
| 1️⃣ | **Scrape** | Puppeteer navigates Instagram with human-like delays and mouse movements. |
| 2️⃣ | **Extract** | Captures on-screen text via Tesseract OCR. If no text exists, it records the audio via a browser-injected `MediaRecorder`. |
| 3️⃣ | **Analyze** | Routes the extracted media to Google Gemini (1.5 Flash ) for summarization. |
| 4️⃣ | **Store** | Appends the Reel URL, Date, Caption, and AI Summary to a Google Sheet. |
| 5️⃣ | **Clean** | Automatically deletes temporary audio files to save disk space. |

---

## ✨ Advanced Engineering Features
* **Bypasses Fragmented Video:** Instagram streams video in chunks. Instead of failing to download them, this script injects a `MediaRecorder` to record audio directly from the browser's memory.
* **Smart OCR Cropping:** Crops out Instagram's UI overlays before running OCR to prevent garbage data.
* **Anti-Bot Evasion:** Uses randomized scrolling, reading delays, and a strict 5-Reel-per-run limit to stay under the radar.
* **Automated Alerting:** If Instagram throws a login wall, the script safely aborts and n8n emails you an alert to log back in.

---

## 🚀 1-Click Setup

We have included automated setup scripts to get you running in under 5 minutes.

**Prerequisites:** You must have [Docker Desktop](https://www.docker.com/products/docker-desktop/ ) installed and running.

### For Windows:
Double-click the `setup.bat` file, or run this in your terminal:
```cmd
setup.bat
