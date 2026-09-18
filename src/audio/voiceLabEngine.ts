// Voice Lab Web Audio Engine
// INSTRUMENT LANGUAGE / ET ALIEN VOICE SYNTH — formant + ring-mod (alienize) voice engine

import type { VoiceLabParams, VoiceSyllable, VoiceConsonant } from './types';
import { DEFAULT_VOICE_LAB_PARAMS, VOWELS } from './types';

export class VoiceLabEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private recordDest: MediaStreamAudioDestinationNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  // Space (delay) bus
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  private delayGain: GainNode | null = null;

  params: VoiceLabParams = { ...DEFAULT_VOICE_LAB_PARAMS };

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

    // Space delay bus
    this.delayNode = c.createDelay(1.0);
    this.delayNode.delayTime.value = 0.28;
    this.delayFeedback = c.createGain();
    this.delayFeedback.gain.value = 0.32;
    this.delayFilter = c.createBiquadFilter();
    this.delayFilter.type = 'lowpass';
    this.delayFilter.frequency.value = 1800;
    this.delayGain = c.createGain();
    this.delayGain.gain.value = this.params.space;

    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayFilter);
    this.delayFilter.connect(this.delayNode);
    this.delayNode.connect(this.delayGain);

    this.delayGain.connect(this.compressor);
    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.analyser);

    this.recordDest = c.createMediaStreamDestination();
    this.analyser.connect(this.recordDest);
    this.analyser.connect(c.destination);

    // Pre-render white noise buffer for consonants / breath
    const len = Math.floor(c.sampleRate * 1.0);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuffer = buf;
  }

  destroy() {
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  // === VOICE PRIMITIVES ===

  private playSyllable(
    freq: number,
    vowelKey: string,
    consonant: VoiceConsonant,
    when: number,
    dur: number,
    consAmt: number,
    breath: number,
  ) {
    const c = this.ctx!;
    const p = this.params;
    const v = VOWELS[vowelKey] ?? VOWELS.a;

    // Glottal source
    const src = c.createOscillator();
    src.type = p.source;
    src.frequency.setValueAtTime(freq, when);
    if (p.contour !== 0) {
      src.frequency.exponentialRampToValueAtTime(Math.max(20, freq * (1 + p.contour)), when + dur);
    }

    // Ring modulation (alienize)
    const ringMix = c.createGain();
    ringMix.gain.setValueAtTime(1 - p.alienize, when);
    const carrier = c.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.setValueAtTime(p.carrierFreq, when);
    const carrierScale = c.createGain();
    carrierScale.gain.value = p.alienize;
    carrier.connect(carrierScale);
    carrierScale.connect(ringMix.gain); // audio-rate modulation of gain
    src.connect(ringMix);
    carrier.start(when);
    carrier.stop(when + dur + 0.1);

    // Parallel formant band-pass filters (vowel character)
    const bp1 = c.createBiquadFilter();
    bp1.type = 'bandpass';
    bp1.frequency.value = v.f1;
    bp1.Q.value = p.formantQ;
    const bp2 = c.createBiquadFilter();
    bp2.type = 'bandpass';
    bp2.frequency.value = v.f2;
    bp2.Q.value = p.formantQ;
    ringMix.connect(bp1);
    ringMix.connect(bp2);
    const fGain = c.createGain();
    fGain.gain.value = 1.3;
    bp1.connect(fGain);
    bp2.connect(fGain);

    // Amplitude envelope
    const env = c.createGain();
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(1, when + 0.02);
    env.gain.setValueAtTime(1, when + Math.max(0.04, dur - 0.05));
    env.gain.exponentialRampToValueAtTime(0.001, when + dur);
    fGain.connect(env);
    env.connect(this.masterGain!);
    env.connect(this.delayNode!);

    src.start(when);
    src.stop(when + dur + 0.1);

    // Consonant burst
    if (consonant !== 'none' && consAmt > 0) {
      this.playConsonant(consonant, when, consAmt);
    }
    // Breath noise bed
    if (breath > 0) {
      this.playBreath(when, dur, breath);
    }
  }

  private playConsonant(type: VoiceConsonant, when: number, amt: number) {
    const c = this.ctx!;
    if (!this.noiseBuffer) return;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filt = c.createBiquadFilter();
    const env = c.createGain();
    const peak = 0.55 * amt;

    if (type === 's' || type === 'sh') {
      filt.type = 'highpass';
      filt.frequency.value = type === 'sh' ? 2600 : 5200;
      env.gain.setValueAtTime(0, when);
      env.gain.linearRampToValueAtTime(peak, when + 0.005);
      env.gain.setValueAtTime(peak, when + 0.07);
      env.gain.exponentialRampToValueAtTime(0.001, when + 0.13);
    } else {
      // t / k / plosive — short transient burst
      filt.type = type === 'k' ? 'bandpass' : 'highpass';
      filt.frequency.value = type === 'k' ? 1500 : 3200;
      env.gain.setValueAtTime(0, when);
      env.gain.linearRampToValueAtTime(peak, when + 0.003);
      env.gain.exponentialRampToValueAtTime(0.001, when + 0.06);
    }
    src.connect(filt);
    filt.connect(env);
    env.connect(this.masterGain!);
    env.connect(this.delayNode!);
    src.start(when);
    src.stop(when + 0.25);
  }

  private playBreath(when: number, dur: number, amt: number) {
    const c = this.ctx!;
    if (!this.noiseBuffer) return;
    const src = c.createBufferSource();
    src.buffer = this.noiseBuffer;
    const filt = c.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 1100;
    filt.Q.value = 0.6;
    const env = c.createGain();
    env.gain.value = 0.09 * amt;
    src.connect(filt);
    filt.connect(env);
    env.connect(this.masterGain!);
    src.start(when);
    src.stop(when + dur + 0.1);
  }

  // === TRIGGERS ===

  async triggerSound(overrideFreq?: number) {
    const ctx = await this.ensureCtx();
    if (!this.masterGain || !this.delayNode) return;
    const when = ctx.currentTime + 0.02;
    const freq = overrideFreq ?? this.params.pitch;
    this.playSyllable(
      freq,
      this.params.vowel,
      this.params.consonant,
      when,
      this.params.decay,
      this.params.consAmt,
      this.params.breath,
    );
  }

  async speakWord(syllables: VoiceSyllable[]) {
    const ctx = await this.ensureCtx();
    if (!this.masterGain || !this.delayNode) return;
    let when = ctx.currentTime + 0.05;
    const base = this.params.pitch;
    for (const syl of syllables) {
      const freq = base * Math.pow(2, (syl.pitchOffset ?? 0) / 12);
      const dur = this.params.decay * 0.9;
      this.playSyllable(
        freq,
        syl.vowel,
        syl.consonant,
        when,
        dur,
        Math.max(this.params.consAmt, syl.consonant !== 'none' ? 0.85 : 0),
        this.params.breath,
      );
      when += dur + 0.05;
    }
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getRecordStream(): MediaStream | null {
    return this.recordDest?.stream ?? null;
  }

  setParam<K extends keyof VoiceLabParams>(key: K, value: VoiceLabParams[K]) {
    this.params[key] = value;
    this.applyParams();
  }

  setParams(partial: Partial<VoiceLabParams>) {
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
      this.delayGain.gain.setTargetAtTime(p.space, t, 0.05);
    }
  }
}
