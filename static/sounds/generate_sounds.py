import struct
import wave
import math
import os

def generate_wave(filename, frequency=440, duration=1.0, sample_rate=44100, amplitude=0.5, wave_type='sine'):
    """Generate a simple WAV audio file with a tone"""
    n_samples = int(sample_rate * duration)
    amplitude_scaled = amplitude * 32767

    with wave.open(filename, 'wb') as wav:
        wav.setnchannels(1)  # Mono
        wav.setsampwidth(2)  # 2 bytes = 16-bit
        wav.setframerate(sample_rate)

        for i in range(n_samples):
            t = float(i) / sample_rate
            if wave_type == 'sine':
                value = amplitude_scaled * math.sin(2 * math.pi * frequency * t)
            elif wave_type == 'square':
                value = amplitude_scaled if math.sin(2 * math.pi * frequency * t) >= 0 else -amplitude_scaled
            elif wave_type == 'sawtooth':
                value = amplitude_scaled * (2 * (t * frequency % 1) - 1)
            elif wave_type == 'noise':
                import random
                value = amplitude_scaled * (random.random() * 2 - 1)
            else:
                value = amplitude_scaled * math.sin(2 * math.pi * frequency * t)

            envelope = 1.0
            if i < sample_rate * 0.01:
                envelope = i / (sample_rate * 0.01)
            elif i > n_samples - int(sample_rate * 0.05):
                envelope = (n_samples - i) / (sample_rate * 0.05)

            sample = int(value * envelope)
            data = struct.pack('<h', sample)
            wav.writeframesraw(data)

os.makedirs('.', exist_ok=True)
print("Generating sound files...")

# Suspense - low drones
files = [
    ('suspense_ambient.wav', 60, 2.0, 'sine'),
    ('suspense_drone.wav', 80, 2.0, 'sawtooth'),
    ('heartbeat.wav', 80, 0.5, 'square'),
    ('tension_crash.wav', 200, 0.8, 'noise'),
    ('happy_tune.wav', 523, 0.5, 'sine'),
    ('happy_bell.wav', 880, 0.3, 'sine'),
    ('happy_chime.wav', 1047, 0.4, 'sine'),
    ('comedy_laugh.wav', 300, 0.6, 'square'),
    ('comedy_squeak.wav', 800, 0.2, 'sawtooth'),
    ('sad_piano.wav', 130, 1.5, 'sine'),
    ('sad_strings.wav', 110, 2.0, 'sawtooth'),
    ('sad_cry.wav', 200, 0.8, 'square'),
    ('neutral_pad.wav', 220, 1.5, 'sine'),
    ('neutral_drone.wav', 150, 2.0, 'sine'),
]

for (fname, freq, dur, wtype) in files:
    generate_wave(fname, frequency=freq, duration=dur, wave_type=wtype)
    size = os.path.getsize(fname)
    print(f"[OK] {fname} - {size} bytes")

print(f"\nTotal: {len(files)} WAV files generated")

# Verify
import wave
for f in sorted([f for f in os.listdir('.') if f.endswith('.wav')]):
    try:
        with wave.open(f, 'rb') as w:
            print(f"  OK {f}: {w.getnframes()} frames, {w.getframerate()} Hz, {w.getnchannels()} ch")
    except Exception as e:
        print(f"  FAIL {f}: INVALID - {e}")
