// SubBass Web Audio Engine
// Three-layer architecture: DROP (sub osc) + IMPACT (noise) + RUMBLE (sub-harmonic)

import type { SubBassParams, SubBassPattern } from './types';
import { DEFAULT_SUBBASS_PARAMS } from './types';

const PATTERNS: Record<SubBassPattern, number[]> = {
  DROP:   [0, 0, 0, 0, 0, 0, 0, 0],
  PULSE:  [0, -1, 0, -1, 0, -1, 0, -1],
  WOBBLE: [0, 0, 12, 0, -12, 0, 12, 0],
  ROLL:   [0, 0, 0, 12, 0, 0, 12, 0],
  OFF:    [],
};

export class SubBassEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private recordDest: MediaStreamAudioDestinationNode | null = null;

  // Signal chain nodes
  private filterNode: BiquadFilterNode | null = null;
  private shaperNode: WaveShaperNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Pattern sequencer
  private seqTimer: number | null = null;
  private seqStep = 0;
  private isPlaying = false;

  params: SubBassParams = { ...DEFAULT_SUBBASS_PARAMS };

  // === LIFECYCLE ===

  private async ensureCtx(): Promise<AudioContext> {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext({ sampleRate: 48000 });
      this.buildGraph();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  private buildGraph() {
    const c = this.ctx!;

    this.masterGain = c.createGain();
    this.masterGain.gain.value = this.params.volume;
    this.masterGain.connect(c.destination);

    // Recording destination (optional)
    this.recordDest = c.createMediaStreamDestination();
    this.masterGain.connect(this.recordDest);

    // Distortion -> Filter -> Master
    this.shaperNode = c.createWaveShaper();
    this.shaperNode.curve = this.makeDistortionCurve(this.params.distortion);

    this.filterNode = c.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 80 + this.params.cutoff * 1500;
    this.filterNode.Q.value = 0.5 + this.params.resonance * 20;

    this.shaperNode.connect(this.filterNode);
    this.filterNode.connect(this.masterGain);

    // LFO -> filter cutoff
    this.lfoNode = c.createOscillator();
    this.lfoNode.frequency.value = 0.5 + this.params.lfoRate * 15;
    this.lfoGain = c.createGain();
    this.lfoGain.gain.value = this.params.lfoDepth * 800;
    this.lfoNode.connect(this.lfoGain);
    this.lfoGain.connect(this.filterNode.frequency);
    this.lfoNode.start();
  }

  private makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
    const n = 256;
    const curve = new Float32Array(n);
    const k = amount * 50;
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = ((3 + k) * x * 20 * Math.PI / 180) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  destroy() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  // === VOICE ===

  private triggerVoice(freq: number, time: number, _dur: number, ctx: AudioContext) {
    const c = ctx;
    const now = c.currentTime + time;
    const p = this.params;

    // Layer 1: DROP — sub oscillator
    if (p.dropLevel > 0.01) {
      const osc = c.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = c.createGain();
      const vol = p.dropLevel * 0.6;
      const atk = p.attack * 0.1;
      const dec = 0.1 + p.decay * 2;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + atk);
      gain.gain.exponentialRampToValueAtTime(0.001, now + atk + dec);

      gain.connect(this.shaperNode!);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + atk + dec + 0.05);
    }

    // Layer 2: IMPACT — noise burst
    if (p.impactLevel > 0.01) {
      const bufSize = ctx.sampleRate * 0.15;
      const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = freq * 4;
      noiseFilter.Q.value = 2;

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = p.impactLevel * 0.4;
      noiseGain.gain.setValueAtTime(p.impactLevel * 0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.filterNode!);
      noise.start(now);
      noise.stop(now + 0.15);
    }

    // Layer 3: RUMBLE — sub-harmonic (freq/2)
    if (p.rumbleLevel > 0.01) {
      const osc = c.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq * 0.5;

      const gain = c.createGain();
      const vol = p.rumbleLevel * 0.4;
      const dec = 0.3 + p.decay * 3;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dec);

      gain.connect(this.filterNode!);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + dec + 0.05);
    }
  }

  // === SEQUENCER ===

  private seqTick = () => {
    if (!this.isPlaying || !this.ctx) return;
    const p = this.params;
    const pattern = PATTERNS[p.pattern];
    if (pattern.length === 0) return;

    const stepMs = (60 / p.bpm) * 1000 / 2; // 8th notes
    const offset = pattern[this.seqStep % pattern.length];

    if (offset !== -1) {
      const freq = p.rootFreq * Math.pow(2, offset / 12);
      this.triggerVoice(freq, 0, stepMs / 1000 * 0.9, this.ctx);
    }

    this.seqStep++;
    this.seqTimer = window.setTimeout(this.seqTick, stepMs);
  };

  // === PUBLIC API ===

  async play() {
    await this.ensureCtx();
    this.isPlaying = true;
    this.seqStep = 0;
    if (this.params.pattern !== 'OFF') {
      this.seqTick();
    } else {
      // Sustained drone
      this.triggerVoice(this.params.rootFreq, 0, 2, this.ctx!);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.seqTimer) {
      clearTimeout(this.seqTimer);
      this.seqTimer = null;
    }
  }

  async triggerNote(freq?: number) {
    const ctx = await this.ensureCtx();
    const f = freq ?? this.params.rootFreq;
    this.triggerVoice(f, 0, 0.5, ctx);
  }

  getRecordStream(): MediaStream | null {
    return this.recordDest?.stream ?? null;
  }

  setParam<K extends keyof SubBassParams>(key: K, value: SubBassParams[K]) {
    this.params[key] = value;
    this.applyParams();
  }

  setParams(partial: Partial<SubBassParams>) {
    Object.assign(this.params, partial);
    this.applyParams();
  }

  private applyParams() {
    if (!this.ctx) return;
    const p = this.params;
    if (this.masterGain) this.masterGain.gain.value = p.volume;
    if (this.filterNode) {
      this.filterNode.frequency.value = 80 + p.cutoff * 1500;
      this.filterNode.Q.value = 0.5 + p.resonance * 20;
    }
    if (this.shaperNode) this.shaperNode.curve = this.makeDistortionCurve(p.distortion);
    if (this.lfoNode) {
      this.lfoNode.frequency.value = 0.5 + p.lfoRate * 15;
      if (this.lfoGain) this.lfoGain.gain.value = p.lfoDepth * 800;
    }
  }
}
