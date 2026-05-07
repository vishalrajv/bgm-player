/**
 * Drama BGM Player — Main Application
 * Glassmorphism Neon Keyboard SFX Controller
 * Uses Web Audio API for low-latency sound playback
 */

class BGMPlayer {
    constructor() {
        this.audioContext = null;
        this.sounds = new Map();          // soundName -> AudioBuffer
        this.activeSounds = [];           // Currently playing sounds
        this.config = null;
        this.isAudioInitialized = false;
        this.maxPolyphony = 5;
        this.masterVolume = 0.8;

        // Key config modal state
        this.configModalOpen = false;
        this.currentConfigKey = null;        // The key letter being configured (e.g., 'q')
        this.selectedEmotion = null;          // Selected emotion for this key
        this.selectedSound = null;            // Selected or uploaded sound filename stem
        this.customLabel = '';                // Optional custom label
        this.pendingSoundFile = null;         // File object awaiting upload

        this.init();
    }

    async init() {
        try {
            // Load configuration
            await this.loadConfig();
            await this.loadSoundFiles();

            // Setup UI
            this.renderKeyboard();
            this.renderEmotionLegend();
            this.bindEvents();
            this.loadSettings();

            // Initialize audio on first user interaction
            document.addEventListener('click', () => this.initAudio(), { once: true });
            document.addEventListener('keydown', () => this.initAudio(), { once: true });

            this.updateStatus('Click anywhere or press a key to activate audio', false);
        } catch (error) {
            console.error('Init error:', error);
            this.showToast('Failed to initialize. Check console.', 'error');
        }
    }

    async loadConfig() {
        const response = await fetch('/api/config');
        this.config = await response.json();
        this.maxPolyphony = this.config.globalSettings?.polyphony || 5;
        this.masterVolume = this.config.globalSettings?.masterVolume || 0.8;
    }

    async loadSoundFiles() {
        const response = await fetch('/api/sounds');
        const data = await response.json();

        for (const sound of data.sounds) {
            await this.loadSound(sound.name, sound.filename);
        }

        console.log(`Loaded ${this.sounds.size} sound(s)`);
        this.updateStatus(`✓ Ready — ${this.sounds.size} SFX loaded`, true);
    }

    async loadSound(name, filename) {
        try {
            const response = await fetch(`/sounds/${filename}`);
            const arrayBuffer = await response.arrayBuffer();
            // Ensure AudioContext exists before decoding
            if (!this.audioContext) {
                await this.initAudio();
            }
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds.set(name, audioBuffer);
        } catch (error) {
            console.warn(`Could not load sound "${name}":`, error);
        }
    }

    initAudio() {
        if (this.isAudioInitialized) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioContext();

        // Master gain node
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.masterVolume;
        this.masterGain.connect(this.audioContext.destination);

        this.isAudioInitialized = true;
        this.updateStatus('🎵 Audio Active — Press keys to play sounds', true);
        this.showToast('Audio engine initialized! Start pressing keys.', 'success');
    }

    playSound(soundName, keyCode) {
        if (!this.isAudioInitialized) {
            this.initAudio();
        }

        const buffer = this.sounds.get(soundName);
        if (!buffer) {
            console.warn(`Sound not found: ${soundName}`);
            return;
        }

        // Polyphony limit
        if (this.activeSounds.length >= this.maxPolyphony) {
            const oldest = this.activeSounds.shift();
            oldest.source.stop();
            oldest.gain.disconnect();
        }

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;

        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 1.0;

        source.connect(gainNode);
        gainNode.connect(this.masterGain);

        source.start();

        // Visual feedback
        const keyEl = document.querySelector(`.key[data-key="${keyCode}"]`);
        if (keyEl) {
            keyEl.classList.add('active');
            setTimeout(() => keyEl.classList.remove('active'), 150);
        }

        // Track active sound
        const soundEntry = {
            source,
            gain: gainNode,
            name: soundName,
            startTime: Date.now()
        };
        this.activeSounds.push(soundEntry);
        this.updateActiveSoundsDisplay();

        // Auto-remove from active list when finished
        source.onended = () => {
            const idx = this.activeSounds.indexOf(soundEntry);
            if (idx > -1) {
                this.activeSounds.splice(idx, 1);
                this.updateActiveSoundsDisplay();
            }
        };
    }

    getSoundForKey(key) {
        if (!this.config || !this.config.keyBindings) return null;
        return this.config.keyBindings[key.toLowerCase()];
    }

    updateActiveSoundsDisplay() {
        const container = document.getElementById('active-sounds');
        if (this.activeSounds.length === 0) {
            container.innerHTML = '<p class="empty-state">No sounds playing. Press a key to start!</p>';
            return;
        }

        container.innerHTML = this.activeSounds.map(entry => {
            const binding = this.config.keyBindings?.[entry.name.split('_')[0]];
            const emotion = binding?.emotion || 'neutral';
            return `
                <div class="active-sound ${emotion}" style="
                    background: var(--glass-bg);
                    border: 1px solid var(--color-${emotion});
                    color: var(--color-${emotion});
                ">
                    <span class="sound-name">${entry.name.replace(/_/g, ' ')}</span>
                    <span class="sound-key">${entry.name.charAt(0).toUpperCase()}</span>
                </div>
            `;
        }).join('');

        // Limit display to 15 items
        const items = container.querySelectorAll('.active-sound');
        for (let i = items.length - 1; i >= 15; i--) {
            items[i].remove();
        }
    }

    renderKeyboard() {
        const keys = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'];

        keys.forEach((row, rowIdx) => {
            const rowEl = document.querySelectorAll('.keyboard-row')[rowIdx];
            if (!rowEl) return;

            row.split('').forEach((keyChar, colIdx) => {
                const keyEl = rowEl.children[colIdx];
                if (!keyEl) return;

                const binding = this.config.keyBindings?.[keyChar];
                const keyHintEl = keyEl.querySelector('.key-hint');
                if (binding) {
                    keyEl.dataset.emotion = binding.emotion;
                    document.getElementById(`label-${keyChar}`).textContent = binding.sound.replace(/_/g, ' ');
                    keyHintEl.textContent = this.config.emotions[binding.emotion]?.name || binding.emotion;
                } else {
                    keyEl.classList.add('unbound');
                    keyEl.dataset.emotion = 'neutral';
                    keyHintEl.textContent = 'Unbound';
                }
            });
        });
    }

    renderEmotionLegend() {
        const container = document.getElementById('emotion-legend');
        const emotions = Object.entries(this.config?.emotions || {});

        container.innerHTML = emotions.map(([key, data]) => `
            <li class="legend-item">
                <span class="emotion-dot" style="background: ${data.color}; color: ${data.color}; box-shadow: 0 0 8px ${data.color}"></span>
                <span>${data.name}</span>
            </li>
        `).join('');
    }

    bindEvents() {
        // Keyboard input handling
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));

        // Volume control
        const volumeSlider = document.getElementById('master-volume');
        volumeSlider.addEventListener('input', (e) => {
            this.masterVolume = e.target.value / 100;
            if (this.masterGain) {
                this.masterGain.gain.setTargetAtTime(this.masterVolume, this.audioContext.currentTime, 0.05);
            }
            document.getElementById('volume-display').textContent = `${e.target.value}%`;
        });

        // Polyphony control
        document.getElementById('polyphony').addEventListener('change', (e) => {
            const val = e.target.value;
            this.maxPolyphony = val === 'unlimited' ? Infinity : parseInt(val, 10);
        });

        // Reset button
        document.getElementById('reset-bindings').addEventListener('click', () => {
            if (confirm('Reset all key bindings to defaults?')) {
                fetch('/api/config')
                    .then(res => res.json())
                    .then(defaultConfig => {
                        // Reload page will get fresh config from server
                        location.reload();
                    });
            }
        });

        // Export button
        document.getElementById('export-config').addEventListener('click', () => {
            this.exportConfig();
            this.showToast('Configuration exported to console (F12)', 'info');
        });

        // Help button
        document.getElementById('help-btn').addEventListener('click', () => {
            document.getElementById('help-panel').classList.remove('hidden');
        });

        document.getElementById('close-help').addEventListener('click', () => {
            document.getElementById('help-panel').classList.add('hidden');
        });

        // Click outside help panel to close
        document.getElementById('help-panel').addEventListener('click', (e) => {
            if (e.target.id === 'help-panel') {
                e.target.classList.add('hidden');
            }
        });

        // Key click — open config modal (instead of simple rebind)
        document.querySelectorAll('.key').forEach(keyEl => {
            keyEl.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openKeyConfigModal(keyEl.dataset.key);
            });
        });

        // --- Key Config Modal Event Wiring ---
        this.bindUploadHandlers();
        this.bindLabelInput();

        document.getElementById('config-cancel').addEventListener('click', () => this.onConfigCancel());
        document.getElementById('config-clear').addEventListener('click', () => this.onConfigClear());
        document.getElementById('config-save').addEventListener('click', () => this.onConfigSave());
        document.getElementById('config-sound-select').addEventListener('change', () => this.onSoundSelectChange());

        // Close modal on backdrop click or Escape
        document.getElementById('key-config-modal').addEventListener('click', (e) => {
            if (e.target.id === 'key-config-modal') {
                this.onConfigCancel();
            }
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.configModalOpen) {
                this.onConfigCancel();
            }
        });
    }

    handleKeyDown(e) {
        if (e.repeat) return;

        const key = e.key.toLowerCase();
        const binding = this.getSoundForKey(key);

        if (binding && this.sounds.has(binding.sound)) {
            e.preventDefault();
            this.playSound(binding.sound, key);
        }
    }

    handleKeyUp(e) {
        // Future: implement sound release/fadeout for sustained sounds
    }

    /* ============================================
       Key Configuration Modal
       ============================================ */

    openKeyConfigModal(keyChar) {
        this.currentConfigKey = keyChar;
        this.configModalOpen = true;

        const binding = this.getSoundForKey(keyChar);
        const emotions = this.config.emotions;

        this.selectedEmotion = binding?.emotion || 'neutral';
        this.selectedSound = binding?.sound || '';
        this.customLabel = binding?.label || '';
        this.pendingSoundFile = null;

        // Populate emotion grid
        const emotionGrid = document.getElementById('config-emotion-grid');
        emotionGrid.innerHTML = '';
        Object.entries(emotions).forEach(([key, data]) => {
            const isSelected = key === this.selectedEmotion;
            const div = document.createElement('div');
            div.className = `emotion-option ${isSelected ? 'selected' : ''}`;
            div.dataset.emotionKey = key;
            div.style.setProperty('--color-current', data.color);
            div.style.setProperty('--glow-current', data.glow || data.color + '80');
            div.innerHTML = `
                <div class="emotion-icon" style="background: ${data.color}; border-color: ${data.color}; box-shadow: 0 0 10px ${data.color}"></div>
                <span class="emotion-name">${data.name}</span>
            `;
            div.addEventListener('click', () => this.selectEmotion(key, data.color, data.glow));
            emotionGrid.appendChild(div);
        });

        // Populate sound select dropdown (from already loaded sounds)
        const soundSelect = document.getElementById('config-sound-select');
        soundSelect.innerHTML = '<option value="">-- Select sound --</option>';
        this.sounds.forEach((buffer, soundName) => {
            const option = document.createElement('option');
            option.value = soundName;
            option.textContent = this.formatSoundLabel(soundName);
            if (soundName === this.selectedSound) option.selected = true;
            soundSelect.appendChild(option);
        });
        soundSelect.value = this.selectedSound || '';

        document.getElementById('config-custom-label').value = this.customLabel;

        // Modal header
        const keyLetterEl = document.getElementById('config-key-letter');
        keyLetterEl.textContent = keyChar.toUpperCase();
        keyLetterEl.style.color = emotions[this.selectedEmotion]?.color || '#fff';

        // Reset upload status
        document.getElementById('config-upload-status').textContent = '';
        document.getElementById('config-upload-trigger').classList.remove('has-file');

        // Show modal
        document.getElementById('key-config-modal').classList.remove('hidden');
        this.configModalOpen = true;
    }

    formatSoundLabel(soundName) {
        return soundName.replace(/_/g, ' ');
    }

    formatBytes(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    selectEmotion(emotionKey, color, glow) {
        this.selectedEmotion = emotionKey;

        document.querySelectorAll('.emotion-option').forEach(opt => {
            opt.classList.toggle('selected', opt.dataset.emotionKey === emotionKey);
        });

        document.getElementById('config-key-letter').style.color = color;

        // Live preview on the keyboard key
        const keyEl = document.querySelector(`.key[data-key="${this.currentConfigKey}"]`);
        if (keyEl) {
            keyEl.dataset.emotion = emotionKey;
        }
    }

    onSoundSelectChange() {
        const selectEl = document.getElementById('config-sound-select');
        this.selectedSound = selectEl.value || '';
        this.pendingSoundFile = null;
        document.getElementById('config-upload-status').textContent = '';
        document.getElementById('config-upload-trigger').classList.remove('has-file');
    }

    bindUploadHandlers() {
        const fileInput = document.getElementById('config-sound-upload');
        const uploadBox = document.getElementById('config-upload-trigger');
        const statusEl = document.getElementById('config-upload-status');

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.pendingSoundFile = file;
                statusEl.textContent = `Selected: ${file.name} (${this.formatBytes(file.size)})`;
                uploadBox.classList.add('has-file');
                // Auto-populate custom label from filename if empty
                if (!this.customLabel) {
                    const clean = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, ' ');
                    document.getElementById('config-custom-label').value = clean.trim();
                    this.customLabel = clean.trim();
                }
            }
        });

        uploadBox.addEventListener('click', () => {
            if (!this.configModalOpen) return;
            fileInput.click();
        });

        uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadBox.classList.add('drag-over');
        });
        uploadBox.addEventListener('dragleave', () => {
            uploadBox.classList.remove('drag-over');
        });
        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadBox.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file) {
                this.pendingSoundFile = file;
                fileInput.files = e.dataTransfer.files;
                statusEl.textContent = `Selected: ${file.name} (${this.formatBytes(file.size)})`;
                uploadBox.classList.add('has-file');
                if (!this.customLabel) {
                    const clean = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_]/g, ' ');
                    document.getElementById('config-custom-label').value = clean.trim();
                    this.customLabel = clean.trim();
                }
            }
        });
    }

    bindLabelInput() {
        document.getElementById('config-custom-label').addEventListener('input', (e) => {
            this.customLabel = e.target.value;
        });
    }

    onConfigCancel() {
        this.closeKeyConfigModal();
    }

    closeKeyConfigModal() {
        this.configModalOpen = false;
        this.currentConfigKey = null;
        document.getElementById('key-config-modal').classList.add('hidden');
    }

    onConfigClear() {
        if (!confirm(`Remove sound binding from key "${this.currentConfigKey?.toUpperCase()}"?`)) return;

        const key = this.currentConfigKey;
        delete this.config.keyBindings[key];

        this.saveConfig().then(() => {
            this.renderKeyboard();
            this.renderEmotionLegend();
            this.closeKeyConfigModal();
            this.showToast(`Cleared binding for ${key.toUpperCase()}`, 'success');
        });
    }

    onConfigSave() {
        const key = this.currentConfigKey;
        if (!key || !this.selectedEmotion) {
            this.showToast('Please select an emotion', 'warning');
            return;
        }

        const binding = {
            emotion: this.selectedEmotion,
            sound: this.selectedSound || '',
            label: this.customLabel || ''
        };

        this.config.keyBindings[key] = binding;

        this.saveConfig().then(async () => {
            if (this.pendingSoundFile) {
                try {
                    const formData = new FormData();
                    formData.append('sound', this.pendingSoundFile);

                    this.showToast('Uploading sound...', 'info');
                    const uploadResponse = await fetch('/api/upload-sound', {
                        method: 'POST',
                        body: formData
                    });

                    if (!uploadResponse.ok) {
                        const err = await uploadResponse.json();
                        throw new Error(err.message || 'Upload failed');
                    }

                    const uploadResult = await uploadResponse.json();
                    binding.sound = uploadResult.soundName;
                    this.config.keyBindings[key] = binding;
                    await this.saveConfig();

                    await this.loadSound(uploadResult.soundName, uploadResult.filename);
                    this.showToast(`Sound "${uploadResult.soundName}" uploaded and assigned!`, 'success');
                } catch (err) {
                    console.error('Upload error:', err);
                    this.showToast(`Upload failed: ${err.message}`, 'error');
                    return;
                }
            } else {
                this.showToast(`Key ${key.toUpperCase()} configured!`, 'success');
            }

            this.renderKeyboard();
            this.renderEmotionLegend();
            this.closeKeyConfigModal();
        });
    }

    loadSettings() {
        const saved = localStorage.getItem('bgmplayer-volume');
        if (saved) {
            const vol = parseInt(saved, 10);
            this.masterVolume = vol / 100;
            document.getElementById('master-volume').value = vol;
            document.getElementById('volume-display').textContent = `${vol}%`;
            if (this.masterGain) {
                this.masterGain.gain.value = this.masterVolume;
            }
        }

        const savedPoly = localStorage.getItem('bgmplayer-polyphony');
        if (savedPoly) {
            this.maxPolyphony = savedPoly === 'unlimited' ? Infinity : parseInt(savedPoly, 10);
            document.getElementById('polyphony').value = savedPoly;
        }
    }

    saveSettings() {
        localStorage.setItem('bgmplayer-volume', Math.round(this.masterVolume * 100));
        localStorage.setItem('bgmplayer-polyphony', this.maxPolyphony === Infinity ? 'unlimited' : this.maxPolyphony);
    }

    updateStatus(msg, active) {
        const dot = document.querySelector('.indicator-dot');
        const text = document.querySelector('.indicator-text');
        text.textContent = msg;
        if (active) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span>${message}</span>
        `;
        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 250);
        }, 3000);
    }

    /* --- Key Rebind Logic --- */

    rebindTargetKey = null;

    startRebind(keyEl) {
        const keyChar = keyEl.dataset.key;
        this.rebindTargetKey = keyChar;

        const panel = document.getElementById('rebind-panel');
        const oldKeyDisplay = document.getElementById('rebind-old-key');
        const newKeyDisplay = document.getElementById('rebind-new-key');

        const binding = this.getSoundForKey(keyChar);
        oldKeyDisplay.textContent = keyChar.toUpperCase();

        newKeyDisplay.textContent = 'Waiting...';
        panel.classList.remove('hidden');

        // Capture next key press
        const handler = (e) => {
            e.preventDefault();
            e.stopPropagation();

            const newKey = e.key.toLowerCase();

            // Validate single character key
            if (newKey.length === 1 && /[a-z]/.test(newKey)) {
                this.completeRebind(keyChar, newKey);
            } else if (e.key === 'Escape') {
                this.cancelRebind();
            } else {
                this.showToast('Press a letter key (a-z) or Escape to cancel', 'warning');
            }
        };

        document.addEventListener('keydown', handler, { once: true });
    }

    completeRebind(oldKey, newKey) {
        // Swap bindings: newKey gets oldKey's binding, oldKey becomes unbound
        const oldBinding = this.config.keyBindings[oldKey];
        const newBinding = this.config.keyBindings[newKey];

        // If newKey already has a binding, swap them
        if (newBinding) {
            this.config.keyBindings[newKey] = oldBinding;
            this.config.keyBindings[oldKey] = newBinding;
        } else {
            // Just move binding
            this.config.keyBindings[newKey] = oldBinding;
            delete this.config.keyBindings[oldKey];
        }

        this.saveConfig();
        this.renderKeyboard();
        this.cancelRebind();
        this.showToast(`Rebound: ${oldKey.toUpperCase()} → ${newKey.toUpperCase()}`, 'success');
    }

    cancelRebind() {
        this.rebindTargetKey = null;
        document.getElementById('rebind-panel').classList.add('hidden');
    }

    async saveConfig() {
        await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.config)
        });
    }

    exportConfig() {
        console.log('=== BGM Player Configuration Export ===');
        console.log(JSON.stringify(this.config, null, 2));
        console.log('======================================');

        // Also download as file
        const blob = new Blob([JSON.stringify(this.config, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'bgm-player-config.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Workers/Service registration for PWA
if ('serviceWorker' in navigator) {
    // Could register for offline support
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.bgmPlayer = new BGMPlayer();
});
