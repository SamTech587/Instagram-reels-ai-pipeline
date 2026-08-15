const puppeteer = require('puppeteer-core');
const fs = require('fs');
const { execSync } = require('child_process');

const PROGRESS_FILE = '/scripts/scraped_progress.jsonl'; 

function randomDelay(minMs, maxMs) {
    return new Promise(r => setTimeout(r, minMs + Math.floor(Math.random() * (maxMs - minMs))));
}

async function humanMouseMove(page) {
    const moves = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < moves; i++) {
        await page.mouse.move(
            200 + Math.floor(Math.random() * 600),
            100 + Math.floor(Math.random() * 500),
            { steps: 10 + Math.floor(Math.random() * 20) }
        );
        await randomDelay(80, 300);
    }
}

async function humanScroll(page) {
    const scrollBursts = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < scrollBursts; i++) {
        const scrollAmount = 180 + Math.floor(Math.random() * 400);
        await page.evaluate((amt) => window.scrollBy({ top: amt, behavior: 'smooth' }), scrollAmount);
        await randomDelay(300, 900); 
    }
    if (Math.random() < 0.2) {
        await randomDelay(3000, 7000);
    }
}

function readingDelay(captionLength) {
    const base = Math.min(Math.max(captionLength * 1, 1500), 8000);
    const variance = Math.floor(Math.random() * 2000);
    return new Promise(r => setTimeout(r, base + variance));
}

function loadAlreadyScraped() {
    if (!fs.existsSync(PROGRESS_FILE)) return new Set();
    const lines = fs.readFileSync(PROGRESS_FILE, 'utf-8').split('\n').filter(Boolean);
    return new Set(lines.map(line => JSON.parse(line).url));
}

const http = require('http' );

function getBrowserWSEndpoint(devtoolsHost, devtoolsPort) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            host: devtoolsHost,
            port: devtoolsPort,
            path: '/json/version',
            method: 'GET',
            headers: { 'Host': 'localhost' }
        }, (res ) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    return reject(new Error(`Failed to reach DevTools endpoint: HTTP ${res.statusCode}`));
                }
                try {
                    const data = JSON.parse(body);
                    const wsPath = new URL(data.webSocketDebuggerUrl).pathname;
                    resolve(`ws://${devtoolsHost}:${devtoolsPort}${wsPath}`);
                } catch (e) {
                    reject(e);
                }
            });
        });
        req.on('error', reject);
        req.end();
    });
}

async function detectLoginWall(page) {
    try {
        const url = page.url();
        if (url.includes('/accounts/login')) return true;
        const hasLoginForm = await page.evaluate(() => {
            return !!document.querySelector('input[name="username"]');
        });
        return hasLoginForm;
    } catch (e) {
        return false; 
    }
}

const AUDIO_CACHE_DIR = '/scripts/audio_cache'; 

async function extractMediaForSummary(page, tagId) {
    const framesDir = `/tmp/frames_${tagId}`;
    fs.mkdirSync(framesDir, { recursive: true });
    fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
    const audioPath = `${AUDIO_CACHE_DIR}/reel_${tagId}_${Date.now()}.mp3`;

    let ocrText = '';
    let audioSaved = false;

    // --- PRIORITY 1: OCR (Subtitles) ---
    try {
        const videoBox = await page.evaluate(() => {
            const v = document.querySelector('video');
            if (!v) return null;
            const r = v.getBoundingClientRect();
            return { x: r.x, y: r.y, width: r.width, height: r.height };
        });

        if (videoBox && videoBox.width > 0 && videoBox.height > 0) {
            const cropped = {
                x: videoBox.x,
                y: videoBox.y + videoBox.height * 0.10,
                width: videoBox.width,
                height: videoBox.height * 0.70 
            };
            const shots = 6;
            for (let s = 0; s < shots; s++) {
                try {
                    await page.screenshot({ path: `${framesDir}/frame_${String(s).padStart(3, '0')}.png`, clip: cropped });
                } catch (e) { }
                await randomDelay(700, 1100);
            }
        } else {
            console.error(`[${tagId}] No video element found on page — skipping OCR.`);
        }
    } catch (err) {
        console.error(`[${tagId}] Screenshot capture failed: ${err.message}`);
    }

    const UI_NOISE_PATTERNS = [/original audio/i, /ginal audio/i, /inal audio/i, /sponsored/i, /view profile/i, /add comment/i, /see translation/i];

    try {
        const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.png'));
        const ocrLines = new Set(); 
        for (const f of frameFiles) {
            try {
                const text = execSync(`tesseract ${framesDir}/${f} stdout 2>/dev/null`).toString().trim();
                const cleaned = text.replace(/\s+/g, ' ').trim();
                const letters = cleaned.replace(/[^a-zA-Z]/g, '').length;
                const isNoise = UI_NOISE_PATTERNS.some(p => p.test(cleaned));
                if (cleaned.length > 2 && letters >= 6 && !isNoise) ocrLines.add(cleaned);
            } catch (e) { }
        }
        ocrText = [...ocrLines].join(' | ');
    } catch (err) {
        console.error(`[${tagId}] OCR pass failed: ${err.message}`);
    } finally {
        fs.rmSync(framesDir, { recursive: true, force: true });
    }

    // --- PRIORITY 2: Audio (Only if Priority 1 found nothing) ---
    if (ocrText.length > 0) {
        console.error(`[${tagId}] On-screen text found — skipping audio extraction (Priority 1 met).`);
    } else {
        console.error(`[${tagId}] No on-screen text found. Recording audio directly from browser (Priority 2)...`);
        try {
            const recordResult = await page.evaluate(async (recordDurationMs) => {
                const video = document.querySelector('video');
                if (!video) return { error: 'No video element found to record' };

                // 1. Scroll video into view and click it to bypass Chrome's autoplay/mute restrictions
                video.scrollIntoView({ block: 'center' });
                video.click();
                await new Promise(r => setTimeout(r, 500));

                // 2. Force unmute and play
                video.muted = false;
                video.volume = 1.0;
                try { await video.play(); } catch(e) {}

                // 3. Wait a moment for the audio track to actually buffer and initialize
                await new Promise(r => setTimeout(r, 1500));

                let stream;
                try {
                    stream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
                } catch (e) {
                    return { error: 'captureStream failed: ' + e.message };
                }

                let audioTracks = stream.getAudioTracks();
                
                // 4. If tracks are still loading, wait a bit longer and try one more time
                if (audioTracks.length === 0) {
                    await new Promise(r => setTimeout(r, 2000));
                    audioTracks = stream.getAudioTracks();
                }

                if (audioTracks.length === 0) {
                    return { error: 'No audio tracks found in the video stream even after waiting' };
                }

                const audioStream = new MediaStream(audioTracks);
                const recorder = new MediaRecorder(audioStream, { mimeType: 'audio/webm' });
                const chunks = [];

                recorder.ondataavailable = e => {
                    if (e.data.size > 0) chunks.push(e.data);
                };

                return new Promise((resolve) => {
                    recorder.onstop = () => {
                        const blob = new Blob(chunks, { type: 'audio/webm' });
                        const reader = new FileReader();
                        reader.readAsDataURL(blob);
                        reader.onloadend = () => resolve({ base64: reader.result });
                    };
                    recorder.start();
                    setTimeout(() => {
                        if (recorder.state === 'recording') recorder.stop();
                    }, recordDurationMs);
                });
            }, 12000); 

            if (recordResult && recordResult.error) {
                console.error(`[${tagId}] Browser audio recording failed: ${recordResult.error}`);
            } else if (recordResult && recordResult.base64) {
                const b64Data = recordResult.base64.split(',')[1];
                const webmPath = `/tmp/reel_${tagId}.webm`;
                fs.writeFileSync(webmPath, Buffer.from(b64Data, 'base64'));
                
                execSync(`ffmpeg -y -loglevel error -i ${webmPath} -vn -acodec libmp3lame ${audioPath}`, { stdio: 'pipe' });
                audioSaved = fs.existsSync(audioPath);
                fs.rmSync(webmPath, { force: true });
                console.error(`[${tagId}] Audio successfully recorded and saved.`);
            }
        } catch (err) {
            console.error(`[${tagId}] Audio extraction failed: ${err.message}`);
        }
    }

    return { ocrText, audioPath: audioSaved ? audioPath : '' };
}

async function scrapeReels() {
    let browser;
    try {
        console.error("Connecting to browser...");

        const DEVTOOLS_HOST = 'host.docker.internal';
        const DEVTOOLS_PORT = 9222;

        const wsEndpoint = await getBrowserWSEndpoint(DEVTOOLS_HOST, DEVTOOLS_PORT);
        console.error("Using WS endpoint:", wsEndpoint);

        browser = await puppeteer.connect({
            browserWSEndpoint: wsEndpoint,
            defaultViewport: null,
            headers: { 'Host': 'localhost' } 
        });
        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36');

        await page.goto('https://www.instagram.com/ii__sami.__ii/saved/all-posts/', { waitUntil: 'domcontentloaded', timeout: 60000 }  );

        await randomDelay(2000, 4500);
        await humanMouseMove(page);

        await page.waitForSelector('a[href^="/p/"]', { timeout: 15000 }).catch(() => {});

        const allUrls = new Set();
        let sameCountStreak = 0;
        let scrollRound = 0;

        while (sameCountStreak < 5) {
            const currentBatch = await page.evaluate(() =>
                Array.from(document.querySelectorAll('a[href^="/p/"]')).map(a => a.getAttribute('href'))
            );
            const sizeBefore = allUrls.size;
            currentBatch.forEach(href => allUrls.add(href));
            if (allUrls.size === sizeBefore) sameCountStreak++;
            else sameCountStreak = 0;

            scrollRound++;
            if (scrollRound >= 3) break;
            console.error(`Scroll round ${scrollRound} — unique URLs so far: ${allUrls.size}`);

            await humanScroll(page);
            if (Math.random() < 0.3) await humanMouseMove(page);
        }

        const postUrls = [...allUrls].map(href => 'https://www.instagram.com' + href  );
        console.error("Total unique URLs found:", postUrls.length);

        const alreadyDone = loadAlreadyScraped();
        const toProcess = postUrls.filter(url => !alreadyDone.has(url)).slice(0, 5);
        console.error(`Already scraped: ${alreadyDone.size} | Processing now: ${toProcess.length}`);

        const results = []; 
        let loginRequired = false; 

        for (let i = 0; i < toProcess.length; i++) {
            const url = toProcess[i];
            const dateSaved = new Date().toISOString().split('T')[0];

            try {
                if (Math.random() < 0.1) {
                    const distraction = 8000 + Math.floor(Math.random() * 15000);
                    console.error(`[${i + 1}] Taking a longer break (${Math.round(distraction/1000)}s)...`);
                    await new Promise(r => setTimeout(r, distraction));
                }

                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

                const hitLoginWall = await detectLoginWall(page);
                if (hitLoginWall) {
                    console.error(`[${i + 1}/${toProcess.length}] Login wall detected at ${url} — stopping run.`);
                    loginRequired = true;
                    results.push({ url, date: dateSaved, caption: '', status: 'login_wall', onScreenText: '' });
                    break; 
                }

                let metaLoadedInTime = true;
                await page.waitForFunction(() => {
                    const meta = document.querySelector('meta[property="og:description"]');
                    return meta && meta.getAttribute('content') && meta.getAttribute('content').length > 5;
                }, { timeout: 15000 }).catch(() => {
                    metaLoadedInTime = false;
                    console.error(`Caption taking too long to load for ${url}`);
                });

                await randomDelay(800, 2000);
                await humanMouseMove(page);

                const { caption, hadQuotes, metaExists } = await page.evaluate(() => {
                    const meta = document.querySelector('meta[property="og:description"]');
                    if (!meta) return { caption: '', hadQuotes: false, metaExists: false };
                    const text = meta.getAttribute('content') || '';
                    const firstQuote = text.indexOf('"');
                    const lastQuote = text.lastIndexOf('"');
                    if (firstQuote !== -1 && lastQuote > firstQuote) {
                        return { caption: text.slice(firstQuote + 1, lastQuote).trim(), hadQuotes: true, metaExists: true };
                    }
                    return { caption: '', hadQuotes: false, metaExists: true };
                });

                let status;
                if (!metaExists) {
                    status = 'selector_not_found';
                } else if (!metaLoadedInTime) {
                    status = 'load_timeout';
                } else if (hadQuotes && caption.length > 0) {
                    status = 'ok';
                } else {
                    status = 'empty_confirmed';
                }

                let ocrText = '';
                let audioPath = '';
                if (status === 'ok' || status === 'empty_confirmed') {
                    const media = await extractMediaForSummary(page, `${i + 1}`);
                    ocrText = media.ocrText;
                    audioPath = media.audioPath;
                }

                await readingDelay(caption.length);

                if (Math.random() < 0.4) {
                    await humanScroll(page);
                    await randomDelay(500, 1500);
                }

                if (status === 'ok' || status === 'empty_confirmed') {
                    fs.appendFileSync(PROGRESS_FILE, JSON.stringify({ url, date: dateSaved, caption, status, ocrText, audioPath }) + '\n');
                } else {
                    console.error(`[${i + 1}/${toProcess.length}] Transient failure (${status}) for ${url} — will retry next run.`);
                }
                results.push({ url, date: dateSaved, caption, status, ocrText, audioPath });
                console.error(`[${i + 1}/${toProcess.length}] Done: ${url} — status: ${status}${audioPath ? ' — media captured for AI Summary' : ''}`);

            } catch (err) {
                results.push({ url, date: dateSaved, caption: '', status: 'error', ocrText: '', audioPath: '' });
                console.error(`[${i + 1}/${toProcess.length}] Failed: ${url} - ${err.message} — will retry next run.`);
            }

            await randomDelay(1200, 2500);
        }

        const finalCount = loadAlreadyScraped().size;
        console.error(`ALL DONE. Total scraped (terminal): ${finalCount}`);
        await page.close();
        browser.disconnect();

        console.log(JSON.stringify({
            Reels: results.map(r => ({ url: r.url, caption: r.caption, date: r.date, status: r.status, ocrText: r.ocrText, audioPath: r.audioPath })),
            loginRequired
        }));

    } catch (error) {
        console.error("Failed:", error);
        process.exitCode = 1;
    }
}

scrapeReels();
