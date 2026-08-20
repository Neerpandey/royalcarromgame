// Web Audio API procedural sound synthesizer for Royal Carrom

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private volume: number = 0.8;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.35;
  private isBgmPlaying: boolean = false;
  private bgmOscillators: OscillatorNode[] = [];
  private bgmInterval: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
        this.bgmGain.connect(this.masterGain);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : this.volume, this.ctx.currentTime);
    }
    if (muted && this.isBgmPlaying) {
      this.stopAmbientBGM();
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
    }
  }

  public getMuted() {
    return this.isMuted;
  }

  public getVolume() {
    return this.volume;
  }

  public getBgmVolume() {
    return this.bgmVolume;
  }

  // Realistic wooden clack sound with pitch & velocity dynamics
  public playWoodStrike(intensity: number = 0.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const clampedIntensity = Math.max(0.1, Math.min(1.0, intensity));
    const now = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const osc3 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'triangle';
    osc2.type = 'sine';
    osc3.type = 'sawtooth';

    const baseFreq = 420 + clampedIntensity * 320 + (Math.random() * 50 - 25);
    osc1.frequency.setValueAtTime(baseFreq * 2.2, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, now + 0.05);

    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 0.2, now + 0.04);

    osc3.frequency.setValueAtTime(baseFreq * 0.8, now);
    osc3.frequency.exponentialRampToValueAtTime(80, now + 0.03);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(baseFreq * 1.6, now);
    filter.Q.setValueAtTime(4.0, now);

    const hitGain = 0.38 * clampedIntensity;
    gainNode.gain.setValueAtTime(hitGain, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc3.start(now);
    osc1.stop(now + 0.075);
    osc2.stop(now + 0.075);
    osc3.stop(now + 0.075);
  }

  // Cushion wooden rebound with lower frequency thud
  public playCushionHit(intensity: number = 0.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const clampedIntensity = Math.max(0.1, Math.min(1.0, intensity));
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    const baseFreq = 150 + clampedIntensity * 90;
    osc.frequency.setValueAtTime(baseFreq * 1.4, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.09);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, now);

    gainNode.gain.setValueAtTime(0.32 * clampedIntensity, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  // Pocket drop resonance (net swish + wooden chamber hollow thump)
  public playPocketSound(isQueen: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // 1. Net Swish White Noise impulse
    const bufferSize = this.ctx.sampleRate * 0.08;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1400, now);
    noiseFilter.Q.setValueAtTime(2.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    whiteNoise.start(now);

    // 2. Hollow drop thump
    const dropOsc = this.ctx.createOscillator();
    const dropGain = this.ctx.createGain();
    dropOsc.type = 'sine';
    dropOsc.frequency.setValueAtTime(240, now);
    dropOsc.frequency.exponentialRampToValueAtTime(75, now + 0.16);

    dropGain.gain.setValueAtTime(0.45, now);
    dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    dropOsc.connect(dropGain);
    dropGain.connect(this.sfxGain);
    dropOsc.start(now);
    dropOsc.stop(now + 0.2);

    // 3. Royal Chime Harmonic if Queen
    if (isQueen) {
      const chimeOsc1 = this.ctx.createOscillator();
      const chimeOsc2 = this.ctx.createOscillator();
      const chimeGain = this.ctx.createGain();

      chimeOsc1.type = 'triangle';
      chimeOsc2.type = 'sine';
      chimeOsc1.frequency.setValueAtTime(880, now + 0.04);
      chimeOsc1.frequency.setValueAtTime(1320, now + 0.14);
      chimeOsc2.frequency.setValueAtTime(1760, now + 0.04);

      chimeGain.gain.setValueAtTime(0.35, now + 0.04);
      chimeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      chimeOsc1.connect(chimeGain);
      chimeOsc2.connect(chimeGain);
      chimeGain.connect(this.sfxGain);

      chimeOsc1.start(now + 0.04);
      chimeOsc2.start(now + 0.04);
      chimeOsc1.stop(now + 0.6);
      chimeOsc2.stop(now + 0.6);
    }
  }

  // Foul buzzer / penalty tone
  public playFoulSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.linearRampToValueAtTime(90, now + 0.3);

    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(142, now); // Dissonant beating
    osc2.frequency.linearRampToValueAtTime(85, now + 0.3);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(380, now);

    gainNode.gain.setValueAtTime(0.32, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.35);
    osc2.stop(now + 0.35);
  }

  // Striker powerful release impulse
  public playStrikerRelease(power: number = 0.5) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const clampedPower = Math.max(0.2, Math.min(1.0, power));

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(190 + clampedPower * 180, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.09);

    gainNode.gain.setValueAtTime(0.28 * clampedPower, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  // UI Button click
  public playButtonClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(780, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

    gainNode.gain.setValueAtTime(0.14, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Striker placement tick
  public playPlacementTick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(270, now + 0.018);

    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.026);
  }

  // Countdown timer tick (pitch rises on low time)
  public playTimerTick(secondsLeft: number) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    const isUrgent = secondsLeft <= 5;
    const freq = isUrgent ? 880 : 440;

    osc.type = isUrgent ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.04);

    gainNode.gain.setValueAtTime(isUrgent ? 0.15 : 0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

    osc.connect(gainNode);
    gainNode.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Royal Grand Victory fanfare
  public playWinFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 523.25, t: 0.0, d: 0.18 }, // C5
      { f: 659.25, t: 0.18, d: 0.18 }, // E5
      { f: 783.99, t: 0.36, d: 0.18 }, // G5
      { f: 1046.5, t: 0.54, d: 0.6 },  // C6
      { f: 1318.5, t: 0.72, d: 0.7 },  // E6
    ];

    notes.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.28, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + note.t);
      osc.stop(now + note.t + note.d + 0.06);
    });
  }

  // Grand Royal Queen Secured fanfare
  public playQueenSecured() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Ascending radiant imperial chime arpeggio (C5, G5, C6, E6, G6)
    const notes = [
      { f: 523.25, t: 0.0, d: 0.25 },
      { f: 659.25, t: 0.12, d: 0.25 },
      { f: 783.99, t: 0.24, d: 0.3 },
      { f: 1046.5, t: 0.36, d: 0.4 },
      { f: 1318.51, t: 0.48, d: 0.5 },
      { f: 1567.98, t: 0.6, d: 0.8 },
    ];

    notes.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.32, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + note.t);
      osc.stop(now + note.t + note.d + 0.06);
    });
  }

  // Dramatic Queen Lost / Cover Missed Sound
  public playQueenLost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Somber minor drop chords (Eb4 -> C4 -> Ab3 -> F3)
    const notes = [
      { f: 311.13, t: 0.0, d: 0.3 },
      { f: 261.63, t: 0.18, d: 0.3 },
      { f: 207.65, t: 0.36, d: 0.4 },
      { f: 174.61, t: 0.55, d: 0.7 },
    ];

    notes.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(360, now + note.t);

      gain.gain.setValueAtTime(0.24, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + note.t);
      osc.stop(now + note.t + note.d + 0.06);
    });
  }

  // Dignified Defeat / Better Luck Consolation sound
  public playDefeatSound() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 392.0, t: 0.0, d: 0.35 },  // G4
      { f: 369.99, t: 0.35, d: 0.35 }, // F#4
      { f: 329.63, t: 0.7, d: 0.4 },  // E4
      { f: 293.66, t: 1.1, d: 0.8 },  // D4
    ];

    notes.forEach((note) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.f, now + note.t);

      gain.gain.setValueAtTime(0.2, now + note.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + note.t);
      osc.stop(now + note.t + note.d + 0.08);
    });
  }

  // Royal Ambient Tanpura / Meditative Drone Synth
  public startAmbientBGM() {
    if (this.isMuted || this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx || !this.bgmGain) return;

    this.isBgmPlaying = true;
    this.stopAmbientBGM(); // Clear any existing

    // Fundamental frequencies in C# (Sa - Pa drone: C#3 = 138.59 Hz, G#3 = 207.65 Hz)
    const freqs = [69.3, 138.59, 207.65, 277.18, 415.3];

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.bgmGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Subtle detune shimmer
      osc.detune.setValueAtTime((idx - 2) * 4, this.ctx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.04 / (idx + 1), this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgmGain);

      osc.start();
      this.bgmOscillators.push(osc);
    });
  }

  public stopAmbientBGM() {
    this.bgmOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // already stopped
      }
    });
    this.bgmOscillators = [];
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public toggleBGM(enable: boolean) {
    if (enable) {
      this.startAmbientBGM();
    } else {
      this.stopAmbientBGM();
    }
  }
}

export const soundManager = new SoundManager();

