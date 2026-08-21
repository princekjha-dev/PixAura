// High-Performance Web Audio API Analyzer & Cosmic Synthesizer (Strictly NO Emojis)

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.micStream = null;
    this.source = null;
    this.synthOsc = null;
    this.synthGain = null;
    this.synthInterval = null;
    this.dataArray = null;
    this.mode = 'off'; // 'off' | 'synth' | 'mic'
    this.metrics = {
      bass: 0,
      mid: 0,
      treble: 0,
      energy: 0,
      beat: false,
    };
    this.beatThreshold = 0.65;
    this.prevBass = 0;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  async setMode(newMode) {
    this.initContext();
    this.stopCurrent();

    this.mode = newMode;

    if (newMode === 'mic') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        this.micStream = stream;
        this.source = this.ctx.createMediaStreamSource(stream);
        this.source.connect(this.analyser);
      } catch (e) {
        console.error('Microphone audio access denied:', e);
        this.mode = 'off';
        return false;
      }
    } else if (newMode === 'synth') {
      // Cosmic ambient rhythm synthesizer
      this.startCosmicSynth();
    }

    return true;
  }

  startCosmicSynth() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    // Master bus
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.25;
    masterGain.connect(this.analyser);
    // Don't connect directly to destination to avoid unwanted loud blasts unless desired, or subtle audio
    const outGain = ctx.createGain();
    outGain.gain.value = 0.08;
    masterGain.connect(outGain);
    outGain.connect(ctx.destination);

    // Procedural rhythm loop (Deep Sub Bass + Cosmic Sweeps)
    let step = 0;
    const playBeat = () => {
      if (this.mode !== 'synth' || !this.ctx) return;
      const now = ctx.currentTime;
      step++;

      // Sub Bass Kick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);

      gain.gain.setValueAtTime(0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.35);

      // Hi-hat / Sparkle
      if (step % 2 === 0) {
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, now + 0.15);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        noise.connect(noiseGain);
        noiseGain.connect(masterGain);
        noise.start(now + 0.15);
      }

      // Cosmic Synth Pad Sweep on every 4th beat
      if (step % 4 === 0) {
        const pad = ctx.createOscillator();
        const padGain = ctx.createGain();
        pad.type = 'sawtooth';
        const freqs = [220, 261.63, 329.63, 392, 440];
        const f = freqs[Math.floor(Math.random() * freqs.length)];
        pad.frequency.setValueAtTime(f, now);
        pad.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.8);

        padGain.gain.setValueAtTime(0.01, now);
        padGain.gain.linearRampToValueAtTime(0.2, now + 0.4);
        padGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

        pad.connect(padGain);
        padGain.connect(masterGain);
        pad.start(now);
        pad.stop(now + 1.05);
      }
    };

    playBeat();
    this.synthInterval = setInterval(playBeat, 500); // 120 BPM
  }

  stopCurrent() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((t) => t.stop());
      this.micStream = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
  }

  update() {
    if (this.mode === 'off' || !this.analyser || !this.dataArray) {
      this.metrics = { bass: 0, mid: 0, treble: 0, energy: 0, beat: false };
      return this.metrics;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    const bins = this.dataArray.length;

    // Bass: bins 0 to 4
    let bassSum = 0;
    for (let i = 0; i < 4; i++) bassSum += this.dataArray[i];
    const bass = bassSum / (4 * 255);

    // Mid: bins 4 to 20
    let midSum = 0;
    for (let i = 4; i < 20; i++) midSum += this.dataArray[i];
    const mid = midSum / (16 * 255);

    // Treble: bins 20 to 64
    let trebleSum = 0;
    for (let i = 20; i < bins; i++) trebleSum += this.dataArray[i];
    const treble = trebleSum / ((bins - 20) * 255);

    const energy = bass * 0.5 + mid * 0.3 + treble * 0.2;
    const isBeat = bass > this.beatThreshold && bass - this.prevBass > 0.15;
    this.prevBass = bass;

    this.metrics = {
      bass,
      mid,
      treble,
      energy,
      beat: isBeat,
    };

    return this.metrics;
  }
}

export const audioEngine = new AudioEngine();
