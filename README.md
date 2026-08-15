<p align="center">
  <img
    src="https://capsule-render.vercel.app/api?type=waving&color=0:7C3AED,45:DB2777,100:F97316&height=260&section=header&text=Instagram%20Reels%20AI%20Pipeline&fontSize=42&fontColor=FFFFFF&animation=fadeIn&fontAlignY=38&desc=Save%20a%20Reel.%20Keep%20the%20idea.&descAlignY=58&descSize=19"
    alt="Instagram Reels AI Pipeline — Save a Reel. Keep the idea."
    width="100%"
  />
</p>

<h1 align="center">🎬 Instagram Reels AI Pipeline</h1>

<p align="center">
  <strong>📥 Capture &nbsp;•&nbsp; 🧠 Understand &nbsp;•&nbsp; 🗂️ Organise</strong>
  <br />
  Turn selected saved Reels into a searchable Google Sheets knowledge library.
</p>

<p align="center">
  <a href="https://n8n.io/"><img src="https://img.shields.io/badge/⚙️_Orchestration-n8n-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white" alt="n8n" /></a>
  <a href="https://www.docker.com/"><img src="https://img.shields.io/badge/📦_Runtime-Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
  <a href="https://pptr.dev/"><img src="https://img.shields.io/badge/🤖_Browser-Puppeteer-40B5A4?style=for-the-badge&logo=puppeteer&logoColor=white" alt="Puppeteer" /></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/✨_AI-Google%20Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" /></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/🎯_Purpose-Reels%20to%20actionable%20insights-7C3AED?style=flat-square" alt="Purpose: Reels to actionable insights" />
  <img src="https://img.shields.io/badge/🛠️_Setup-Docker%20powered-0EA5E9?style=flat-square" alt="Docker powered setup" />
  <img src="https://img.shields.io/badge/📊_Output-Google%20Sheets-16A34A?style=flat-square" alt="Google Sheets output" />
</p>

<p align="center">
  <a href="#-why-it-exists">Why it exists</a>
  ·
  <a href="#-the-pipeline">The pipeline</a>
  ·
  <a href="#-quick-start">Quick start</a>
  ·
  <a href="#-project-structure">Project structure</a>
  ·
  <a href="#-contributing">Contributing</a>
</p>

---

## ✨ Why It Exists

Instagram Reels can be an excellent source of tutorials, recipes, ideas, prompts, and creative references. The problem is that useful content can quickly disappear into a long saved-items list. **Instagram Reels AI Pipeline** turns selected saved content into clear, reusable notes—without the tedious copying and pasting.

> **Save the inspiration. Keep the insight.**

| 📥 You save | 🧠 The pipeline does the work | 🗂️ You keep |
| :-- | :-- | :-- |
| A useful Instagram Reel | Captures the strongest available content signal, then creates an AI summary | A structured, searchable record in Google Sheets |

---

## 🗺️ The Pipeline

<p align="center">
  <img src="hero-image.png" alt="n8n workflow for the Instagram Reels AI Pipeline" width="100%" />
  <br />
  <sub><strong>Live workflow architecture:</strong> n8n coordinates capture, extraction, analysis, storage, and cleanup.</sub>
</p>

```mermaid
flowchart LR
    A[📱 Selected saved Reels] --> B[⚙️ n8n workflow]
    B --> C[🤖 Puppeteer browser session]
    C --> D{What is available?}
    D -->|On-screen copy| E[🔎 Tesseract OCR]
    D -->|Spoken content| F[🎙️ Browser audio capture]
    E --> G[✨ Gemini analysis]
    F --> G
    G --> H[(📊 Google Sheets)]
    F --> I[🧹 Temporary-file cleanup]

    classDef source fill:#E1306C,stroke:#ffffff,color:#ffffff
    classDef process fill:#7C3AED,stroke:#ffffff,color:#ffffff
    classDef output fill:#16A34A,stroke:#ffffff,color:#ffffff
    class A source
    class B,C,D,E,F,G,I process
    class H output
```

### 🔄 From Reel to Insight

| Step | What happens | Why it matters |
| :--: | :-- | :-- |
| **① 📱 Capture** | Puppeteer opens the selected Reel in a controlled browser session. | The workflow starts from the content you have chosen to save. |
| **② 🔎 Extract** | It reads meaningful on-screen text; when audio is the stronger signal, it captures the browser audio instead. | The pipeline adapts to the kind of information in the Reel. |
| **③ ✨ Understand** | Google Gemini turns the extracted material into a concise summary. | You get the key idea without replaying the video. |
| **④ 📊 Organise** | The Reel URL, date, caption, and AI insight are stored in Google Sheets. | Your saved content becomes easy to search and review. |
| **⑤ 🧹 Clean up** | Temporary audio files are removed after processing. | The workspace stays tidy and lightweight. |

---

## ⚡ What Makes It Different

| Feature | The engineering behind it |
| :-- | :-- |
| **🎙️ Audio-first fallback** | When video downloads are fragmented or unreliable, the pipeline records audio directly inside the browser. |
| **🎯 Focused OCR** | UI-heavy regions are trimmed before OCR so irrelevant interface text does not overwhelm the result. |
| **⏱️ Deliberate pacing** | Each run handles a small batch of Reels, which keeps processing predictable and easy to inspect. |
| **🛎️ Session-aware handling** | If a sign-in screen interrupts the workflow, processing stops safely and can trigger an alert for manual review. |
| **📦 Dockerised runtime** | Docker bundles n8n, FFmpeg, Tesseract, and supporting dependencies into a reproducible environment. |

<details>
<summary><strong>💡 What can I save with this?</strong></summary>

You can use the pipeline to build a library of useful short-form content such as learning notes, recipes, productivity ideas, creator references, product inspiration, or prompts worth revisiting.

</details>

---

## 🚀 Quick Start

### ✅ Before You Begin

Install and start [Docker Desktop](https://www.docker.com/products/docker-desktop/). You will also need the service connections used by the workflow, including access to the relevant Instagram session, Google Gemini, and Google Sheets.

| Platform | Run this |
| :-- | :-- |
| **🪟 Windows** | `setup.bat` |
| **🍎 macOS / 🐧 Linux** | `chmod +x setup.sh && ./setup.sh` |

### 🧩 Configure the Workflow

1. Import `Workflow.json` into your n8n instance.
2. Configure the required service credentials and choose the destination Google Sheet.
3. Run a small test batch first.
4. Confirm that the resulting rows include the Reel details and a useful AI summary.

> **🔐 Responsible use:** Process only content and accounts that you are authorised to access. Use the project in line with applicable platform terms, privacy expectations, and local law.

---

## 📁 Project Structure

```text
Instagram-reels-ai-pipeline/
├── scripts/
│   ├── audio_cache/        # 🎙️ Temporary audio storage
│   └── scrape_reels.js     # 🤖 Core Puppeteer browser logic
├── docker-compose.yml      # 📦 Local container orchestration
├── Dockerfile              # 🛠️ Custom n8n image with FFmpeg + Tesseract
├── setup.bat               # 🪟 Windows setup script
├── setup.sh                # 🐧 macOS/Linux setup script
├── Workflow.json           # ⚙️ Exported n8n workflow
├── hero-image.png          # 🗺️ n8n workflow screenshot
└── README.md               # 📖 Project documentation
```

---

## 🧰 Built With

| Tool | Role |
| :-- | :-- |
| [n8n](https://n8n.io/) | ⚙️ Workflow automation and service integration. |
| [Docker](https://www.docker.com/) | 📦 Consistent local runtime and dependency packaging. |
| [Puppeteer](https://pptr.dev/) | 🤖 Automated browser session and media capture. |
| [Tesseract OCR](https://tesseract-ocr.github.io/) | 🔎 On-screen text extraction. |
| [Google Gemini](https://ai.google.dev/) | ✨ AI-generated content summaries. |
| [Google Sheets](https://www.google.com/sheets/about/) | 📊 A simple, searchable destination for your knowledge base. |

---

## 🤝 Contributing

Ideas, fixes, and improvements are welcome. Please open an issue to discuss substantial changes, then submit a focused pull request.

```bash
# Create a focused branch
git checkout -b feature/your-improvement

# Commit your change
git commit -m "feat: describe your improvement"

# Push and open a pull request
git push origin feature/your-improvement
```

---

## 📄 License

This project is distributed under the **MIT License**. See `LICENSE` for more information.

<p align="center">
  <strong>🎬 Save a Reel. ✨ Keep the idea. 🚀 Build your library.</strong>
  <br />
  <sub>If this project is useful, please consider giving the repository a star.</sub>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:F97316,52:DB2777,100:7C3AED&height=120&section=footer" alt="Colourful project footer" width="100%" />
</p>

## References

[1]: https://docs.github.com/github/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax "GitHub Docs — Basic writing and formatting syntax"
[2]: https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/quickstart-for-writing-on-github "GitHub Docs — Quickstart for writing on GitHub"
