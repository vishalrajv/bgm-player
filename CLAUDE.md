# CLAUDE.md — Project Instructions for Claude Code

> This file provides instructions, conventions, and context for working on the **Drama BGM Player** project. It overrides default behavior where noted.

---

## 📋 Project Overview

**Name:** Drama BGM Player — Keyboard SFX Controller  
**Type:** Local web application (Flask + vanilla HTML/CSS/JS)  
**Purpose:** Real-time sound effect playback via keyboard for drama productions  
**Status:** MVP complete, tested with Playwright, sound files installed, hand-dominant clustered layout

### Key Features
- 26-key QWERTY keyboard mapped to emotional SFX (6 categories)
- Glassmorphism + Neon UI (dark OLED theme)
- Configurable key bindings (click-to-rebind)
- Web Audio API for low-latency polyphonic playback
- Volume + polyphony controls
- Persistent localStorage settings
- Flask backend serving static files on localhost

---

## 🎯 Developer Profile

**Developer:** Vishal Raj V — Senior Engineer  
**Stack:** Python (Flask), HTML5, CSS3, ES6 JavaScript  
**Environment:** Windows 11, VS Code, pip  
**Preferences:**
- Clear, practical documentation (avoid theory)
- Code that works first, optimize later
- Single-file solutions over complex abstractions
- Explicit error handling and logging

---

## 🚀 Quick Start

```bash
cd E:\VISHAL-WORK\BGM-PLAYER

# First-time setup
python -m venv venv
./venv/Scripts/pip install -r requirements.txt

# Run the app
./venv/Scripts/python.exe app.py
# → Opens http://localhost:5000 (or 8888 if busy)

# Add sound files to: static/sounds/
# Expected filenames: suspense_drone.mp3, heartbeat.wav, etc.
```

---

## 📁 Project Structure

```
BGM-PLAYER/
├── app.py                         # Flask server (entry point)
├── requirements.txt                # Flask dependency
├── config/
│   └── key-bindings.json          # 26 key mappings + emotion colors + global settings
├── static/
│   ├── css/style.css              # Glassmorphism neon theme (~800 lines)
│   ├── js/app.js                  # BGMPlayer class — Web Audio + keyboard handlers
│   └── sounds/                    # ← Add your SFX files here (MP3/WAV/OGG)
├── templates/
│   └── index.html                 # Main UI — QWERTY keyboard + settings + help
├── README.md                      # User guide
├── SETUP_GUIDE.md                 # Installation + troubleshooting
├── design-system.md               # UI/UX specs (colors, typography, animations)
├── .playwright-cli/tests.js       # Automated test suite
└── run.bat / run.sh               # Platform launchers
```

---

## 🎹 Default Key Bindings

**Hand-Dominant Clustered Layout** — Each emotion is grouped on one side of the keyboard:

| Row | Q W E R T | Y U I O P | A S D F G | H J K L | Z X C | V B N M |
|-----|-----------|-----------|-----------|---------|-------|---------|
| **Emotion** | 🟢 Neutral | 🟣 Suspense | 🔵 Sad | 🔴 Tension / 🟡 Happy | 🩷 Comedy | 🟢 Neutral / 🟡 H / 🔴 T |
| **Details** | All neutral fillers | 4 keys (top-right) | 5 keys (home left) | Tension home + Happy pinky | 3 keys (left pinky cluster) | Scattered remaining |

**Full mapping:**

| Key | Emotion | Sound |
|-----|---------|-------|
| Q W E R T | Neutral | neutral_pad / neutral_drone |
| Y U I O | Suspense | suspense_ambient |
| P | Happy | happy_tune |
| A S D F G | Sad | sad_strings / sad_piano / sad_cry |
| H J K | Tension | heartbeat / tension_crash |
| L | Happy | happy_bell |
| Z X C | Comedy | comedy_laugh / comedy_squeak |
| V B | Neutral | neutral_pad / neutral_drone |
| N | Happy | happy_chime |
| M | Tension | tension_crash |

See `config/key-bindings.json` for full 26-key mapping.

---

## 🎨 Design System Reference

**Style:** Dark Mode (OLED) + Glassmorphism + Neon accents  
**Colors:**
- Background: `#0F0F23` (deep indigo, not pure black)
- Accent: `#22C55E` (green)
- 6 Emotion neons: Red (Tension), Purple (Suspense), Yellow (Happy), Pink (Comedy), Cyan (Sad), Green (Neutral)

**Typography:** Righteous (headings) + Poppins (body) — Google Fonts  
**Effects:** Backdrop blur(15px), animated RGB blobs, box-shadow glow on active keys

Full specs: `design-system.md`

---

## ⚙️ Configuration

### Key Bindings (`config/key-bindings.json`)

```json
{
  "keyBindings": {
    "q": { "emotion": "suspense", "sound": "suspense_drone", "label": "Suspense Drone" },
    // ... 25 more
  },
  "emotions": {
    "suspense": { "color": "#8B5CF6", "name": "Suspense", ... },
    // ... 5 more
  },
  "globalSettings": {
    "masterVolume": 0.8,   // 0.0–1.0
    "polyphony": 5,         // Max simultaneous sounds
    "keyboardLayout": "qwerty"
  }
}
```

**Adding new sounds:**
1. Drop file into `static/sounds/` (e.g., `my_sound.mp3`)
2. Add entry in `keyBindings` with matching `sound` name (without extension)
3. Refresh browser — auto-loaded

**Emotion colors** must be valid hex codes. The UI reads these from config at runtime.

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Page loads without console errors
- [ ] Click → "Audio Active" status appears
- [ ] Volume slider changes display value
- [ ] Polyphony selector updates
- [ ] Help modal opens / closes
- [ ] All 26 keys visible with emotion-colored borders
- [ ] Pressing letter keys triggers visual highlight (if audio present)
- [ ] Export button downloads JSON config
- [ ] Reset button shows confirmation

### Automated Testing

```bash
# Open browser
playwright-cli open http://localhost:5000

# Run test suite (located at .playwright-cli/tests.js)
playwright-cli run-code --filename=".playwright-cli/tests.js"
```

Test coverage: 14 UI/functional checks (see `Task #4` history for full results)

---

## 🐛 Known Issues & Workarounds

| Issue | Cause | Workaround |
|-------|-------|------------|
| UnicodeEncodeError in Windows console | `print()` with emoji → cp1252 | Use emoji-free strings (fixed in `app.py`) |
| Config file truncation on save | POST endpoint saves `this.config` (partial state) | Edit JSON file directly for now; restart server |
| Port 5000 sometimes busy | Previous instance not killed | App auto-falls back to port 8888 |
| No sounds without files | `static/sounds/` empty by default | Add MP3/WAV files matching key binding `sound` names |

---

## 🔧 Development Workflow

### When modifying files

1. **Backend (app.py)**
   - Run Flask in background, watch output for errors
   - Test endpoint manually: `curl http://localhost:5000/api/config`
   - Auto-reload disabled (Flask debug=False) — restart to see changes

2. **Frontend (CSS/JS)**
   - Hard refresh browser (`Ctrl+Shift+R`) after changes
   - Check DevTools Console for errors (F12)
   - Disable caching during dev: Network tab → "Disable cache"

3. **Config (JSON)**
   - Validate syntax: `python -c "import json; json.load(open('config/key-bindings.json'))"`
   - After edits, restart Flask or reload page (config cached in memory)

### Code Style

- **Python:** PEP 8, 4-space indent, docstrings for functions
- **JavaScript:** ES6+, single quotes, trailing semicolons, indent 4
- **CSS:** BEM-ish naming (`.keyboard-section`, `.glass-panel`), CSS custom properties
- **Formatting:** No trailing whitespace, one blank line before function defs

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Flask | 3.1.3 | Local HTTP server |
| (none else) | — | All frontend code is vanilla JS/CSS |

**Future dependencies (optional):**
- `pyinstaller` — for building standalone executable
- `werkzeug` — already included with Flask

---

## 🎯 Task Management

When working on this project, create tasks with:

```bash
TaskCreate --subject "Brief title" --description "Detailed scope" --status pending
```

Dependencies: use `addBlockedBy` on dependent tasks.  
Update progress with `TaskUpdate --taskId <id> --status in_progress|completed`

---

## 🗣️ Communication Style

- **Be concise** — short sentences, bullet points when listing
- **Show file refs** — `app.py:45` or `static/js/app.js:120`
- **Explain the "why"** for non-obvious decisions
- **Assume competence** — Vishal is an intermediate Python dev, no hand-holding needed

---

## 🔒 Security & Privacy

- **Local-only app** — no external network calls, no data collection
- **No authentication** — runs on localhost, trusted environment
- **Sound files** — user-provided, not scanned; owned by user
- **Config stored** — in `config/key-bindings.json` (plain JSON) + browser localStorage

---

## 🚢 Deployment / Distribution

### For Others (Executable)

```bash
pip install pyinstaller
pyinstaller --onefile --noconsole --name "BGM-Player" app.py
# Distribute: dist/BGM-Player.exe + static/ + config/ folders
```

### Portable Version

Copy entire project folder — requires Python + Flask installed on target machine.

---

## 📚 Resources

- Flask docs: https://flask.palletsprojects.com/
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- UI/UX Pro Max skill: design decisions documented in `design-system.md`
- Playwright CLI: for automated UI testing

---

## 🎓 Learning Notes

**Vishal's goals with this project:**
- Learn Flask routing & JSON APIs
- Master Web Audio API (AudioContext, BufferSource, GainNode)
- Practice vanilla JS (no frameworks) for performance
- Apply glassmorphism/neon CSS techniques
- Implement keyboard event handling + polyphony
- Build a complete local-first tool

**What makes this work:**
- Emotion-based color coding for rapid visual identification
- QWERTY layout learned by muscle memory — no learning curve
- Hand-dominant clustering: each emotion lives on one side of the keyboard, allowing fast intra-emotion switching (Comedy on left-pinky cluster ZXC, Suspense on right-top cluster YUIO, etc.)
- Local server means zero latency, no internet required
- Simple file-based config — easy to edit by hand

---

**Last updated:** 2026-05-07  
**Version:** 1.1.0 — Sound files installed + hand-dominant clustered layout + CSS visibility fix
