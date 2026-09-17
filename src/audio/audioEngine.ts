// CrystalPrism Web Audio Engine
// PRISM PRO Architecture: PHYSICS -> MATERIAL -> ORGANIC -> ATMOSPHERE

import type { Scale, ArpMode, ArpRate, EngineParams, PresetDef } from './types';
import { DEFAULT_PARAMS, midiToFreq } from './types';

// Re-export for backward compatibility
export type { Scale, ArpMode, ArpRate, EngineParams, PresetDef };
export { DEFAULT_PARAMS };

const SCALES: Record<Scale, number[]> = {
  chromatic: [0,1,2,3,4,5,6,7,8,9,10,11],
  major:     [0,2,4,5,7,9,11],
  minor:     [0,2,3,5,7,8,10],
  pentatonic_maj: [0,2,4,7,9],
  pentatonic_min: [0,3,5,7,10],
  dorian:    [0,2,3,5,7,9,10],
  lydian:    [0,2,4,6,7,9,11],
};

const RATE_DIVISORS: Record<ArpRate, number> = {
  '1/1': 1, '1/2': 2, '1/4': 4, '1/8': 8, '1/16': 16, '1/32': 32,
};

export class CrystalEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private recordDest: MediaStreamAudioDestinationNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private stereoNode: StereoPannerNode | null = null;
  private reverbNode: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayGain: GainNode | null = null;
  private delayFeedback: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  private activeOscs: { osc: OscillatorNode; gain: GainNode; stopAt: number }[] = [];

  private arpTimer: number | null = null;
  private arpStep = 0;
  private arpNotes: number[] = [];
  private isPlaying = false;
  private currentWaveform: OscillatorType = 'sine';

  params: EngineParams = { ...DEFAULT_PARAMS };

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
    this.masterGain.gain.value = this.params.mainVol;
    this.masterGain.connect(c.destination);

    this.recordDest = c.createMediaStreamDestination();
    this.masterGain.connect(this.recordDest);

    this.filterNode = c.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 600 + this.params.tone * 5000;
    this.filterNode.Q.value = 0.7 + this.params.impact * 8;
    this.filterNode.connect(this.masterGain);

    this.stereoNode = c.createStereoPanner();
    this.stereoNode.pan.value = 0;
    this.stereoNode.connect(this.filterNode);

    this.dryGain = c.createGain();
    this.dryGain.gain.value = 0.7;
    this.dryGain.connect(this.stereoNode);

    this.reverbNode = c.createConvolver();
    this.reverbNode.buffer = this.makeReverbIR(c, 2.5);
    this.reverbGain = c.createGain();
    this.reverbGain.gain.value = this.params.shimmer;
    this.reverbNode.connect(this.reverbGain);
    this.reverbGain.connect(this.stereoNode);

    this.delayNode = c.createDelay(1.5);
    this.delayNode.delayTime.value = 0.375;
    this.delayGain = c.createGain();
    this.delayGain.gain.value = this.params.magic;
    this.delayFeedback = c.createGain();
    this.delayFeedback.gain.value = 0.4;
    this.delayNode.connect(this.delayGain);
    this.delayGain.connect(this.stereoNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);

    this.lfoNode = c.createOscillator();
    this.lfoNode.frequency.value = 0.2 + this.params.movement * 8;
    this.lfoGain = c.createGain();
    this.lfoGain.gain.value = 300 * this.params.movement;
    this.lfoNode.connect(this.lfoGain);
    this.lfoGain.connect(this.filterNode.frequency);
    this.lfoNode.start();
  }

  private makeReverbIR(ctx: AudioContext, duration: number): AudioBuffer {
    const sr = ctx.sampleRate;
    const len = sr * duration;
    const buf = ctx.createBuffer(2, len, sr);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (sr * 1.2));
      }
    }
    return buf;
  }

  destroy() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  // === VOICE ===

  private playNote(freq: number, time: number, dur: number, ctx: AudioContext) {
    const c = ctx;
    const now = c.currentTime + time;

    const oscTypes: OscillatorType[] = [this.currentWaveform];
    if (this.currentWaveform === 'sine') oscTypes.push('triangle');
    if (this.currentWaveform === 'sawtooth') oscTypes.push('square');

    oscTypes.forEach((type, i) => {
      const osc = c.createOscillator();
      osc.type = type;
      osc.frequency.value = freq + (i * 0.7);
      osc.frequency.setValueAtTime(freq, now);
      if (this.params.drift > 0) {
        const driftAmt = this.params.drift * 4;
        osc.frequency.setTargetAtTime(
          freq + (Math.random() - 0.5) * driftAmt,
          now + 0.05, 0.1
        );
      }

      const gain = c.createGain();
      const vol = type === this.currentWaveform ? 0.5 : 0.15;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + 0.003);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
      gain.connect(this.dryGain!);
      gain.connect(this.reverbNode!);
      gain.connect(this.delayNode!);

      osc.connect(gain);
      osc.start(now);
      const stopAt = now + dur + 0.05;
      osc.stop(stopAt);

      this.activeOscs.push({ osc, gain, stopAt });
    });

    // Clean up finished oscillators
    const cutoff = c.currentTime + time + dur + 0.2;
    this.activeOscs = this.activeOscs.filter(a => a.stopAt > cutoff - 0.1);
  }

  // === ARPEGGIATOR ===

  private buildScale(scale: Scale, rootFreq: number, octaves: number): number[] {
    const intervals = SCALES[scale];
    const baseMidi = Math.round(12 * Math.log2(rootFreq / 440) + 69);
    const notes: number[] = [];
    for (let o = 0; o < octaves; o++) {
      for (const interval of intervals) {
        notes.push(midiToFreq(baseMidi + interval + o * 12));
      }
    }
    return notes;
  }

  private getArpPattern(mode: ArpMode, notes: number[]): number[] {
    const n = notes.length;
    switch (mode) {
      case 'up':       return [...notes];
      case 'down':     return [...notes].reverse();
      case 'up-down':  return [...notes, ...notes.slice(1, -1).reverse()];
      case 'down-up':  return [...notes].reverse().concat(notes.slice(1, -1));
      case 'converge': {
        const pat: number[] = [];
        for (let i = 0; i < Math.ceil(n / 2); i++) {
          pat.push(notes[i]);
          if (n - 1 - i !== i) pat.push(notes[n - 1 - i]);
        }
        return pat;
      }
      case 'diverge': {
        const pat: number[] = [];
        const mid = Math.floor((n - 1) / 2);
        for (let i = 0; i <= mid; i++) {
          pat.push(notes[mid - i]);
          if (mid + 1 + i < n) pat.push(notes[mid + 1 + i]);
        }
        return pat;
      }
      case 'pinky':   return [...notes, notes[notes.length - 1], notes[notes.length - 2]];
      case 'random':  return [...notes].sort(() => Math.random() - 0.5);
      case 'rain':    return [...notes].sort(() => Math.random() - 0.5).slice(0, Math.max(3, n / 2));
      default:        return [...notes];
    }
  }

  private arpTick = () => {
    if (!this.isPlaying || this.params.arpMode === 'off' || !this.ctx) return;

    const divisor = RATE_DIVISORS[this.params.rate];
    const beatMs = (60 / this.params.speed) * 1000 / divisor;
    const noteDur = (beatMs / 1000) * this.params.arpGate;

    if (this.arpNotes.length > 0) {
      const freq = this.arpNotes[this.arpStep % this.arpNotes.length];
      this.playNote(freq, 0, Math.max(0.02, noteDur), this.ctx);
      this.arpStep++;
      if (this.arpStep >= this.arpNotes.length) {
        if (this.params.arpMode === 'random' || this.params.arpMode === 'rain') {
          this.arpNotes = this.getArpPattern(this.params.arpMode, this.buildScale(
            this.params.scale, this.params.rootFreq, this.params.octave
          ));
        }
        this.arpStep = 0;
      }
    }

    this.arpTimer = window.setTimeout(this.arpTick, beatMs);
  };

  // === PUBLIC API ===

  async play() {
    const ctx = await this.ensureCtx();
    this.isPlaying = true;
    this.arpStep = 0;
    this.arpNotes = this.getArpPattern(
      this.params.arpMode,
      this.buildScale(this.params.scale, this.params.rootFreq, this.params.octave)
    );
    if (this.params.arpMode !== 'off') {
      this.arpTick();
    } else {
      const notes = this.buildScale(this.params.scale, this.params.rootFreq, this.params.octave);
      notes.slice(0, 4).forEach((f, i) => {
        this.playNote(f, i * 0.03, Math.max(0.1, this.params.decay * 2), ctx);
      });
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.arpTimer) {
      clearTimeout(this.arpTimer);
      this.arpTimer = null;
    }
  }

  async triggerNote(freq?: number) {
    const ctx = await this.ensureCtx();
    const f = freq ?? this.params.rootFreq;
    this.playNote(f, 0, Math.max(0.05, this.params.decay), ctx);
  }

  getRecordStream(): MediaStream | null {
    return this.recordDest?.stream ?? null;
  }

  setParam<K extends keyof EngineParams>(key: K, value: EngineParams[K]) {
    this.params[key] = value;
    this.applyParams();
  }

  setParams(partial: Partial<EngineParams>) {
    Object.assign(this.params, partial);
    this.applyParams();
  }

  setWaveform(wf: OscillatorType) {
    this.currentWaveform = wf;
  }

  private applyParams() {
    if (!this.ctx) return;
    const p = this.params;

    if (this.masterGain) this.masterGain.gain.value = p.mainVol;
    if (this.filterNode) {
      this.filterNode.frequency.value = 200 + p.tone * 5000;
      this.filterNode.Q.value = 0.5 + p.impact * 10;
    }
    if (this.stereoNode) this.stereoNode.pan.value = (p.stereo - 0.5) * 2;
    if (this.reverbGain) this.reverbGain.gain.value = p.shimmer;
    if (this.delayGain) this.delayGain.gain.value = p.magic;
    if (this.lfoNode) {
      this.lfoNode.frequency.value = 0.1 + p.movement * 10;
      if (this.lfoGain) this.lfoGain.gain.value = 400 * p.movement;
    }
  }
}
