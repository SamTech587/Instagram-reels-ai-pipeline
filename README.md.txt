# Instagram Reels AI Pipeline 🤖🎬

An automated, Dockerized n8n pipeline that scrapes saved Instagram Reels, extracts on-screen text (OCR) and spoken audio, and uses Google's Gemini AI to generate intelligent summaries directly into a Google Sheet.

## 🚀 Features
* **Smart Media Extraction:** Intelligently prioritizes on-screen text (subtitles) over audio to save processing time.
* **Advanced Audio Capture:** Bypasses Instagram's fragmented video streaming by injecting a `MediaRecorder` script to capture audio directly from the browser's memory.
* **Anti-Bot Evasion:** Uses randomized human-like scrolling, mouse movements, and reading delays via Puppeteer.
* **Custom Docker Environment:** Runs in a custom n8n container built with `ffmpeg` and `tesseract-ocr` for local media processing.
* **Graceful Fallbacks:** Automatically routes videos with no text/audio to a fallback branch to prevent pipeline crashes.

## 🛠️ Tech Stack
* **Automation:** n8n
* **Scraping:** Puppeteer (BrowserOS)
* **Media Processing:** FFmpeg, Tesseract OCR
* **AI / LLM:** Google Gemini (gemini-1.5-flash)
* **Storage:** Google Sheets

## ⚙️ Setup Instructions
1. Build the custom n8n image using the provided `Dockerfile`.
2. Mount your local scripts folder to `/scripts` in the container.
3. Import `workflow.json` into your n8n instance.
4. Add your Gemini API key and Google Sheets credentials in n8n.
5. Update the target Instagram URL in `scrape_reels.js`.
