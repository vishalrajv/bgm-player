#!/usr/bin/env python3
"""
Drama BGM Player - Local SFX Keyboard Controller
A local web application that plays sound effects triggered by keyboard presses.
"""

import os
import json
import re
import webbrowser
from pathlib import Path
from flask import Flask, render_template, jsonify, request, send_from_directory

app = Flask(__name__)

# Configuration
BASE_DIR = Path(__file__).parent.absolute()
CONFIG_DIR = BASE_DIR / 'config'
SOUNDS_DIR = BASE_DIR / 'static' / 'sounds'
DEFAULT_PORT = 5000

# Ensure directories exist
CONFIG_DIR.mkdir(exist_ok=True)
SOUNDS_DIR.mkdir(parents=True, exist_ok=True)


def load_key_bindings():
    """Load key bindings configuration"""
    config_path = CONFIG_DIR / 'key-bindings.json'
    if config_path.exists():
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None


def save_key_bindings(config):
    """Save key bindings configuration"""
    config_path = CONFIG_DIR / 'key-bindings.json'
    with open(config_path, 'w', encoding='utf-8') as f:
        json.dump(config, f, indent=2, ensure_ascii=False)


@app.route('/')
def index():
    """Serve main page"""
    config = load_key_bindings()
    return render_template('index.html', config=config)


@app.route('/api/config')
def get_config():
    """API endpoint to get current configuration"""
    config = load_key_bindings()
    return jsonify(config)


@app.route('/api/config', methods=['POST'])
def update_config():
    """API endpoint to update key bindings"""
    try:
        new_config = request.get_json(force=True)
    except Exception as e:
        print(f"[ERROR] JSON parse failed: {e}")
        return jsonify({"status": "error", "message": str(e)}), 400

    if not new_config:
        print("[ERROR] Empty config received")
        return jsonify({"status": "error", "message": "Empty config"}), 400

    print(f"[DEBUG] Received config with keys: {list(new_config.keys())}")
    print(f"[DEBUG] keyBindings count: {len(new_config.get('keyBindings', {}))}")
    print(f"[DEBUG] emotions count: {len(new_config.get('emotions', {}))}")

    try:
        save_key_bindings(new_config)
        print(f"[INFO] Configuration saved to disk")
    except Exception as e:
        print(f"[ERROR] Failed to save: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

    return jsonify({"status": "success", "message": "Configuration saved"})


@app.route('/api/sounds')
def list_sounds():
    """List available sound files"""
    sounds = []
    if SOUNDS_DIR.exists():
        for file in SOUNDS_DIR.iterdir():
            if file.suffix.lower() in ['.mp3', '.wav', '.ogg', '.m4a']:
                sounds.append({
                    "name": file.stem,
                    "filename": file.name,
                    "size": file.stat().st_size
                })
    return jsonify({"sounds": sounds})


@app.route('/api/upload-sound', methods=['POST'])
def upload_sound():
    """Upload a sound file to static/sounds/"""
    if 'sound' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400
    file = request.files['sound']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No file selected"}), 400

    # Validate file extension
    allowed = {'.mp3', '.wav', '.ogg', '.m4a'}
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed:
        return jsonify({
            "status": "error",
            "message": f"Unsupported format. Use: {', '.join(allowed)}"
        }), 400

    # Sanitize and ensure unique filename
    stem = Path(file.filename).stem
    safe_stem = re.sub(r'[^a-zA-Z0-9_]', '_', stem)
    target_path = SOUNDS_DIR / f"{safe_stem}{ext}"
    counter = 1
    while target_path.exists():
        target_path = SOUNDS_DIR / f"{safe_stem}_{counter}{ext}"
        counter += 1

    file.save(str(target_path))

    return jsonify({
        "status": "success",
        "soundName": target_path.stem,
        "filename": target_path.name,
        "size": target_path.stat().st_size
    })


@app.route('/static/<path:filename>')
def serve_static(filename):
    """Serve static files"""
    return send_from_directory('static', filename)


@app.route('/sounds/<path:filename>')
def serve_sounds(filename):
    """Serve sound files"""
    return send_from_directory(str(SOUNDS_DIR), filename)


@app.route('/config/<path:filename>')
def serve_config(filename):
    """Serve config files"""
    return send_from_directory(str(CONFIG_DIR), filename)


def open_browser(port):
    """Open default browser to the application"""
    url = f'http://localhost:{port}'
    try:
        webbrowser.open(url)
        print(f"Opening browser at {url}")
    except Exception as e:
        print(f"WARNING: Could not open browser: {e}")
        print(f"   Please open {url} manually in your browser.")


if __name__ == '__main__':
    import sys
    import socket

    # Find available port
    port = DEFAULT_PORT
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        if s.connect_ex(('localhost', port)) == 0:
            port = 8888
            print(f"WARNING: Port {DEFAULT_PORT} in use, using {port}")

    print("\n" + "="*50)
    print("Drama BGM Player Starting...")
    print("="*50)
    print(f"Local Server: http://localhost:{port}")
    print(f"Sounds Directory: {SOUNDS_DIR}")
    print(f"Config Directory: {CONFIG_DIR}")
    print("="*50)
    print("\nAdd your SFX files to:", SOUNDS_DIR)
    print("Supported formats: MP3, WAV, OGG, M4A\n")

    # Open browser shortly after server starts
    import threading
    timer = threading.Timer(1.5, lambda: open_browser(port))
    timer.start()

    # Run Flask app
    app.run(host='127.0.0.1', port=port, debug=False, use_reloader=False)
