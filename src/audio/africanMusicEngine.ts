// Generative modern soft African ambient music engine (Kora / Balafon pentatonic groove)
// Uses Web Audio API with smooth voiceover ducking and zero external audio file dependencies.

const PENTATONIC_SCALE_HZ = [
  146.83, // D3
  164.81, // E3
  196.0,  // G3
  220.0,  // A3
  246.94, // B3
  293.66, // D4
  329.63, // E4
  392.0,  // G4
  440.0,  // A4
  493.88, // B4
  587.33, // D5
];

// Gentle melodic 16-step kora/balafon pattern (indices into PENTATONIC_SCALE_HZ)
const MELODY_PATTERN = [5, 7, 8, 6, 9, 7, 5, 4, 5, 8, 10, 8, 7, 6, 4, 5];
const BASS_ROOTS = [146.83, 146.83, 196.0, 164.81]; // D3 - D3 - G3 - E3

export class AfricanMusicEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicBus: GainNode | null = null;
  private timerId: number | null = null;
  private step = 0;
  private isPlaying = false;
  private isMuted = false;
  private isDucked = false;
  private baseVolume = 0.24;

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = this.baseVolume;
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.musicBus.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public start(): void {
    const ctx = this.ensureContext();
    if (!ctx || this.isPlaying) return;
    this.isPlaying = true;
    this.step = 0;

    // 94 BPM eighth-note pulse (~319ms per step)
    const stepDurationMs = 319;
    this.triggerStep();
    this.timerId = window.setInterval(() => {
      if (this.isPlaying) {
        this.triggerStep();
      }
    }, stepDurationMs);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 1, now, 0.08);
    }
  }

  public setDucked(ducked: boolean): void {
    this.isDucked = ducked;
    if (this.ctx && this.musicBus) {
      const now = this.ctx.currentTime;
      const target = ducked ? 0.1 : this.baseVolume;
      this.musicBus.gain.cancelScheduledValues(now);
      this.musicBus.gain.setTargetAtTime(target, now, 0.25);
    }
  }

  private triggerStep(): void {
    if (!this.ctx || !this.musicBus || this.isMuted) {
      this.step = (this.step + 1) % 16;
      return;
    }

    const now = this.ctx.currentTime;
    const noteIdx = MELODY_PATTERN[this.step];
    const freq = PENTATONIC_SCALE_HZ[noteIdx];

    // Warm kora / wooden marimba pluck
    this.playKoraPluck(freq, now, this.step % 4 === 0 ? 0.22 : 0.14);

    // Subtle harmonic fifth on downbeats
    if (this.step % 4 === 0) {
      const chordBar = Math.floor(this.step / 4);
      this.playWarmBass(BASS_ROOTS[chordBar], now, 0.95);
      this.playWarmPad(BASS_ROOTS[chordBar] * 2, now, 1.15);
    }

    // Soft calabash shaker accent on off-beats
    if (this.step % 2 === 1) {
      this.playSoftShaker(now, this.step % 4 === 3 ? 0.035 : 0.02);
    }

    this.step = (this.step + 1) % 16;
  }

  private playKoraPluck(freq: number, startTime: number, peakGain: number): void {
    if (!this.ctx || !this.musicBus) return;
    const osc = this.ctx.createOscillator();
    const overtone = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    overtone.type = 'sine';
    overtone.frequency.setValueAtTime(freq * 2, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, startTime);
    filter.frequency.exponentialRampToValueAtTime(420, startTime + 0.45);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.014);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.55);

    const overtoneGain = this.ctx.createGain();
    overtoneGain.gain.value = 0.22;

    osc.connect(filter);
    overtone.connect(overtoneGain);
    overtoneGain.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);

    osc.start(startTime);
    overtone.start(startTime);
    osc.stop(startTime + 0.6);
    overtone.stop(startTime + 0.6);
  }

  private playWarmBass(freq: number, startTime: number, duration: number): void {
    if (!this.ctx || !this.musicBus) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq / 2, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.16, startTime + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.musicBus);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private playWarmPad(freq: number, startTime: number, duration: number): void {
    if (!this.ctx || !this.musicBus) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    filter.type = 'lowpass';
    filter.frequency.value = 650;

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.05, startTime + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  private playSoftShaker(startTime: number, peakGain: number): void {
    if (!this.ctx || !this.musicBus) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.045);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 4800;
    filter.Q.value = 1.6;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(peakGain, startTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);

    noise.start(startTime);
  }
}
