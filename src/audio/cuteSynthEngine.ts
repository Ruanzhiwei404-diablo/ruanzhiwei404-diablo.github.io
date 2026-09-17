// CuteSynth Web Audio Engine
// ANIME SFX ENGINE — adapted from KawaiiSynth DSP 3.0

import type { CuteSynthParams } from './types';
import { DEFAULT_CUTE_PARAMS } from './types';

export class CuteSynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private recordDest: MediaStreamAudioDestinationNode | null = null;

  // Delay bus
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  private delayGain: GainNode | null = null;

  // Wobble LFO
  private wobbleLfo: OscillatorNode | null = null;
  private wobbleGain: GainNode | null = null;

  params: CuteSynthParams = { ...DEFAULT_CUTE_PARAMS };

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

    this.compressor = c.createDynamicsCompressor();

    this.analyser = c.createAnalyser();
    this.analyser.fftSize = 2048;

    // Delay bus
    this.delayNode = c.createDelay(1.0);
    this.delayNode.delayTime.value = 0.20;
    this.delayFeedback = c.createGain();
    this.delayFeedback.gain.value = 0.3;
    this.delayFilter = c.createBiquadFilter();
    this.delayFilter.frequency.value = 1500;
    this.delayGain = c.createGain();
    this.delayGain.gain.value = this.params.delay;

    // Wobble LFO modulates delay time
    this.wobbleLfo = c.createOscillator();
    this.wobbleLfo.type = 'sine';
    this.wobbleLfo.frequency.value = 0.5;
    this.wobbleGain = c.createGain();
    this.wobbleGain.gain.value = this.params.wobble * 0.005;
    this.wobbleLfo.connect(this.wobbleGain);
    this.wobbleGain.connect(this.delayNode.delayTime);
    this.wobbleLfo.start();

    // Connect delay feedback loop
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayFilter);
    this.delayFilter.connect(this.delayNode);
    this.delayNode.connect(this.delayGain);

    // Mix into compressor
    this.delayGain.connect(this.compressor);
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.analyser);

    // Recording dest
    this.recordDest = c.createMediaStreamDestination();
    this.analyser.connect(this.recordDest);

    this.analyser.connect(c.destination);
  }

  destroy() {
    if (this.wobbleLfo) {
      try { this.wobbleLfo.stop(); } catch {}
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  // === VOICE ===

  async triggerSound(overrideFreq?: number) {
    const ctx = await this.ensureCtx();
    if (!this.masterGain || !this.delayNode) return;

    const t = ctx.currentTime;
    const p = this.params;
    const baseFreq = overrideFreq ?? p.frequency;

    // Oscillator
    const osc = ctx.createOscillator();
    osc.type = p.shape;
    osc.frequency.setValueAtTime(baseFreq, t);

    // Pitch sweep
    if (p.sweep !== 0) {
      const endFreq = Math.max(20, baseFreq * (1 + p.sweep));
      osc.frequency.exponentialRampToValueAtTime(endFreq, t + p.decay);
    }

    // FM modulation
    if (p.modDepth > 0) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(p.modSpeed, t);
      lfoGain.gain.setValueAtTime(p.modDepth, t);
      lfoGain.gain.linearRampToValueAtTime(0, t + p.decay);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + p.decay + 0.1);
    }

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = p.filterQ;
    filter.frequency.setValueAtTime(p.filterFreq, t);

    if (p.filterEnv !== 0) {
      filter.frequency.linearRampToValueAtTime(
        Math.max(50, p.filterFreq + p.filterEnv),
        t + (p.attack || 0.01)
      );
      filter.frequency.exponentialRampToValueAtTime(
        Math.max(50, p.filterFreq), t + p.decay
      );
    }

    // Gain envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(1, t + (p.attack || 0.005));
    gainNode.gain.exponentialRampToValueAtTime(0.001, t + p.decay);

    // Connect: osc → filter → gain → (master + delay)
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);
    gainNode.connect(this.delayNode);

    osc.start(t);
    osc.stop(t + p.decay + 0.2);
  }

  // Convenience alias for keyboard/MIDI
  async triggerNote(freq?: number) {
    await this.triggerSound(freq);
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getRecordStream(): MediaStream | null {
    return this.recordDest?.stream ?? null;
  }

  setParam<K extends keyof CuteSynthParams>(key: K, value: CuteSynthParams[K]) {
    this.params[key] = value;
    this.applyParams();
  }

  setParams(partial: Partial<CuteSynthParams>) {
    Object.assign(this.params, partial);
    this.applyParams();
  }

  private applyParams() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const p = this.params;

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(p.volume, t, 0.05);
    }
    if (this.delayGain) {
      this.delayGain.gain.setTargetAtTime(p.delay, t, 0.05);
    }
    if (this.wobbleGain) {
      this.wobbleGain.gain.setTargetAtTime(p.wobble * 0.005, t, 0.05);
    }
  }
}
