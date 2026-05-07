# 🎭 Drama BGM Player — Keyboard SFX Controller

A **local web application** that plays sound effects triggered by keyboard presses. Designed for drama productions, live performances, or creative storytelling — each key on your keyboard is mapped to an emotional SFX category (Tension, Suspense, Happy, Comedy, Sad, Neutral).

![Style](https://img.shields.io/badge/Style-Glassmorphism_Neon-8B5CF6?style=flat)
![Local](https://img.shields.io/badge/Runs-Locally_Only-22C55E?style=flat)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat)

---

## ✨ Key Features

- **🎹 QWERTY Keyboard SFX** — Every key plays a unique sound effect
- **🎨 Emotion Color Coding** — Visual color scheme by emotion (Red=Tension, Purple=Suspense, Yellow=Happy, Pink=Comedy, Cyan=Sad, Green=Neutral)
- **💎 Glassmorphism + Neon UI** — Stunning dark OLED-optimized interface with glowing elements
- **⚡ Real-time Playback** — Low-latency Web Audio API, supports polyphony (multiple simultaneous sounds)
- **🔧 Customizable Bindings** — Click any key to rebind it to a different sound
- **💾 Persistent Settings** — Volume, polyphony, and key map saved locally
- **🚀 No Server Needed** — Runs entirely on localhost, no internet required after setup
- **📁 Easy SFX Management** — Just drop MP3/WAV/OGG files into the `sounds/` folder

---

## 📋 Requirements

- Python 3.8+
- A modern web browser (Chrome, Firefox, Edge, Safari)
- SFX audio files in MP3, WAV, OGG, or M4A format

---

## 🚀 Quick Start

### Option 1: One-Command Setup (Recommended)

```bash
# Clone or download the project, then:
pip install -r requirements.txt
python app.py
```

### Option 2: Manual Steps

1. **Install Python dependencies**
   ```bash
   pip install Flask
   ```

2. **Add your SFX files**
   - Place audio files in the `static/sounds/` directory
   - Name them to match the default key labels (e.g., `cheer.mp3`, `sad_violin.wav`)
   - Supported formats: `.mp3`, `.wav`, `.ogg`, `.m4a`

3. **Start the server**
   ```bash
   python app.py
   ```

4. **Open your browser**
   - The app automatically opens at `http://localhost:5000`
   - If not, manually navigate to: http://127.0.0.1:5000

---

## 🎹 Default Key Bindings

| Key | Sound Label | Emotion |
|-----|-------------|---------|
| Q | Suspense Drone | <span style="color:#8B5CF6">● Suspense</span> |
| W | Heartbeat | <span style="color:#EF4444">● Tension</span> |
| E | Cheer | <span style="color:#EAB308">● Happy</span> |
| R | Boing | <span style="color:#EC4899">● Comedy</span> |
| T | Sigh | <span style="color:#06B6D4">● Sad</span> |
| Y | Whoosh | <span style="color:#22C55E">● Neutral</span> |
| U | Ticking | <span style="color:#EF4444">● Tension</span> |
| I | Creak | <span style="color:#8B5CF6">● Suspense</span> |
| O | Sparkle | <span style="color:#EAB308">● Happy</span> |
| P | Slide Whistle | <span style="color:#EC4899">● Comedy</span> |
| A | Rain | <span style="color:#06B6D4">● Sad</span> |
| S | Thunder | <span style="color:#EF4444">● Tension</span> |
| D | Wind | <span style="color:#8B5CF6">● Suspense</span> |
| F | Birds Chirping | <span style="color:#EAB308">● Happy</span> |
| G | Cymbal Crash | <span style="color:#EC4899">● Comedy</span> |
| H | Footsteps | <span style="color:#22C55E">● Neutral</span> |
| J | Fast Heartbeat | <span style="color:#EF4444">● Tension</span> |
| K | Crying | <span style="color:#06B6D4">● Sad</span> |
| L | Laughter | <span style="color:#EAB308">● Happy</span> |
| Z | Ominous Bell | <span style="color:#8B5CF6">● Suspense</span> |
| X | Drum Roll | <span style="color:#EF4444">● Tension</span> |
| C | Squeak | <span style="color:#EC4899">● Comedy</span> |
| V | Trumpet Fanfare | <span style="color:#EAB308">● Happy</span> |
| B | Sad Violin | <span style="color:#06B6D4">● Sad</span> |
| N | Nature Ambient | <span style="color:#22C55E">● Neutral</span> |
| M | Alarm | <span style="color:#EF4444">● Tension</span> |

> **Note:** If a sound file is missing from `static/sounds/`, the key will still register the press visually, but no audio will play.

---

## 🛠️ Configuration

### Modifying Key Bindings

The configuration file is at: `config/key-bindings.json`

```json
{
  "keyBindings": {
    "q": {
      "emotion": "suspense",
      "sound": "suspense_drone",
      "label": "Suspense Drone"
    }
    // ... more keys
  },
  "emotions": {
    "tension": {
      "name": "Tension",
      "color": "#EF4444",
      "description": "Builds suspense and urgency"
    }
    // ... more emotions
  }
}
```

**Or use the UI:**
1. Click any key on the virtual keyboard
2. Press the new letter key you want to assign
3. Press Escape to cancel

### Sound File Organization

Place your audio files in: `static/sounds/`

| Sound Name | Expected Filename |
|-------------|-------------------|
| Suspense Drone | `suspense_drone.mp3` |
| Heartbeat | `heartbeat.mp3` |
| Cheer | `cheer.mp3` |
| ... | ... |

**Adding a new sound:**
1. Add `<sound_name>.<ext>` to `static/sounds/`
2. Update `config/key-bindings.json` to reference the new sound
3. Refresh the browser

---

## 🎨 Customization

### Changing Emotions & Colors

Edit the `emotions` section in `config/key-bindings.json`:

```json
"emotions": {
  "custom": {
    "name": "My Emotion",
    "color": "#FF00FF",
    "glow": "#F0F0F0"
  }
}
```

Then use `"emotion": "custom"` in your key bindings.

### Adjusting Global Settings

```json
"globalSettings": {
  "masterVolume": 0.8,    // 0.0 to 1.0
  "polyphony": 5,         // Max simultaneous sounds (1-10, or "unlimited")
  "keyboardLayout": "qwerty"
}
```

---

## 🎯 Usage Tips

### Sound Production Advice

- **For drama tension** — Use lower frequencies, longer sustain, subtle risers
- **For comedy** — Short, punchy sounds with bright timbre
- **For suspense** — Ambient drones, creaks, wind effects
- **For happy** — Major chords, bells, chimes
- **For sadness** — Minor strings, soft pads, slow attacks

### Performance Optimization

- Keep audio files under 2MB for quick loading
- Use MP3 for music/speech, WAV for short effects
- Pre-Ogg for best compression with decent quality
- Sample rate: 44.1kHz is standard
- Bit depth: 16-bit is fine for SFX

### Live Performance Setup

1. **Open in full-screen browser** (F11)
2. **Connect a MIDI keyboard** (optional — see advanced setup)
3. **Preview sounds** before going live (press keys quietly)
4. **Set polyphony to 2-3** to avoid sound stacking chaos

---

## 🖥️ Project Structure

```
BGM-PLAYER/
├── app.py                      # Flask server (runs on localhost)
├── requirements.txt             # Python dependencies
├── config/
│   └── key-bindings.json       # SFX mapping configuration
├── static/
│   ├── css/
│   │   └── style.css           # Glassmorphism neon theme
│   ├── js/
│   │   └── app.js              # Web Audio API + keyboard handler
│   └── sounds/                 # ← Drop your .mp3/.wav files here
├── templates/
│   └── index.html              # Main UI page
└── README.md                   # This file
```

---

## ⚙️ Technical Details

### Architecture

- **Backend:** Python Flask (lightweight, no DB)
- **Frontend:** Vanilla HTML/CSS/JS (no frameworks)
- **Audio:** Web Audio API (`AudioContext`, `AudioBuffer`, `GainNode`)
- **Storage:** `localStorage` for user preferences, JSON files for config
- **Port:** Default 5000 (fallback: 8888)

### Design System

Based on **UI/UX Pro Max** design intelligence:

| Attribute | Value |
|-----------|-------|
| Theme | Dark Mode (OLED) |
| Style | Glassmorphism + Neon |
| Typography | Righteous (headings) + Poppins (body) |
| Accent Colors | Multi-color emotion palette |
| Effects | Backdrop-blur(15px), animated blobs, glow |

### Accessibility

- Full keyboard navigation (Tab through settings)
- Color + emotion label (not color-only info)
- Focus indicators on all interactive elements
- `prefers-reduced-motion` respected
- Screen reader friendly labels on buttons

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "No sounds playing" | 1. Check browser console for errors 2. Verify files are in `static/sounds/` 3. Ensure filenames match config sound names |
| "Port already in use" | Kill the process on port 5000: `netstat -ano | findstr :5000` (Windows) |
| "Audio not allowed" | Click anywhere on the page first — browsers block auto-play |
| "Keys not responding" | Make sure the page has focus (click it) |
| "Laggy sound" | Reduce file sizes, convert to MP3 128kbps VBR |
| "Can't remap keys" | Ensure you're pressing a letter key (A-Z), not F1, arrows, etc. |

---

## 📦 Packaging for Distribution

To create an installable version for others:

1. **Include your SFX library** in `static/sounds/`
2. **Freeze to executable:**
   ```bash
   pip install pyinstaller
   pyinstaller --onefile --noconsole app.py
   ```
3. **Share the `dist/` folder** — users just run `app.exe`

Or create a simple installer with `nsis` or `inno setup`.

---

## 🎭 Advanced Ideas

Want to extend this?

- **MIDI controller support** — Map MIDI notes to SFX
- **Slider controls for pitch/bend** — Add real-time audio effects
- **Recording & playback** — Capture keystrokes as a performance
- **Scene presets** — Save/load key mapping sets per drama
- **Fade in/out** — Smooth volume envelopes on sustained sounds
- **Visualizer** — Real-time waveform or spectrum display

---

## 📜 License

MIT — Free to use, modify, and distribute. See LICENSE file for details.

---

## 🙋 Support

Found a bug? Have a feature request?

1. Open an issue with details about your OS, browser, and setup
2. Include console logs (F12 → Console tab) if audio fails
3. List your sound files and their formats

---

**Made with ❤️ for drama sound designers**
