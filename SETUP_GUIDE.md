# 🎭 Drama BGM Player — Setup Guide

Follow these steps to get your BGM Player running locally.

## Prerequisites Checklist

- [ ] Python 3.8+ installed (`python --version` should show 3.x)
- [ pip package manager working (`pip --version`)
- [ ] Modern web browser (Chrome, Firefox, Edge, Safari)
- [ ] Audio files ready (or willingness to add them later)

---

## Installation

### 1. Download / Clone the Project

Download the ZIP from the repo or:
```bash
git clone https://github.com/vishalrajv/bgm-player.git
cd bgm-player
```

### 2. Install Flask

```bash
pip install -r requirements.txt
```

If that fails:
```bash
pip install Flask==3.0.0
```

Expected output: `Successfully installed Flask-3.0.0`

### 3. Add SFX Files (Optional but recommended)

Copy your SFX audio files into the `static/sounds/` directory.

**Quick test:** Add just one or two MP3 files named `heartbeat.mp3` and `cheer.mp3` to hear immediate results.

**Bulk setup:** Download free SFX packs from:
- [Freesound.org](https://freesound.org/) — Creative Commons licensed
- [Zapsplat](https://www.zapsplat.com/) — Free sound effects library
- [YouTube Audio Library](https://www.youtube.com/audiolibrary) — Royalty-free

### 4. Run the Application

#### On Windows
Double-click `run.bat` **or** open Command Prompt in the project folder:
```cmd
python app.py
```

#### On macOS / Linux
```bash
chmod +x run.sh
./run.sh
```

or:
```bash
python3 app.py
```

---

## First Run

1. **Your browser opens automatically** at `http://localhost:5000`
2. **Page loads** with a sleek glassmorphism neon interface
3. **Click anywhere on the page** to activate audio (browser security requirement)
4. **Press any letter key** — hear the corresponding SFX!

### What You Should See

```
🎭 Drama BGM Player
────────────────────
Press Keys to Play SFX
[Q] [W] [E] [R] ...
```

Each key shows a colored border based on its emotion:
- 🔴 Red = Tension
- 🟣 Purple = Suspense
- 🟡 Yellow = Happy
- 🌸 Pink = Comedy
- 🔵 Cyan = Sad
- 🟢 Green = Neutral

---

## Troubleshooting

### "Python not recognized"
→ Install Python from [python.org](https://python.org) and tick "Add to PATH"

### "Flask not found"
→ Run `pip install Flask`

### "No sounds playing"
1. Check `Console` (F12) for errors
2. Confirm files are in `static/sounds/` (all lowercase, correct spelling)
3. Refresh and click page first (browser blocks audio without user gesture)

### "Port 5000 is in use"
Another process is using the port. Find it:
- Windows: `netstat -ano | findstr :5000` → kill with `taskkill /PID <id> /F`
- Mac/Linux: `lsof -ti:5000 | xargs kill`

The app will automatically try port **8888** if 5000 fails.

### "Keyboard doesn't respond"
Click anywhere inside the browser window to give it focus, then try again.

---

## Project Layout

```
BGM-PLAYER/
├── app.py                    ← Start here
├── run.bat / run.sh          ← Quick launchers
├── requirements.txt          ← Python deps (Flask)
├── config/
│   └── key-bindings.json    ← Sound → key mapping
├── static/
│   ├── css/style.css        ← Neon glass UI styles
│   ├── js/app.js            ← Web Audio engine
│   └── sounds/              ← YOUR SFX FILES GO HERE
└── templates/index.html     ← Main page
```

---

## Next Steps

1. **Customize key bindings** — Open `config/key-bindings.json` or click keys in the UI
2. **Add more sounds** — Drop files into `static/sounds/`, refresh page
3. **Change colors** — Edit `emotions` section in config JSON
4. **Export config** — Click "Export" button to save your custom setup
5. **Package for others** — Run `pyinstaller --onefile app.py` (requires pyinstaller)

---

## Need Help?

- Check browser console (F12) for error messages
- Read the full README.md for configuration details
- Ensure audio files are in supported formats (MP3, WAV, OGG, M4A)
