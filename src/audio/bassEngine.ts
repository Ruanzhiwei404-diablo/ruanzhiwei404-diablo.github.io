// Bass Engine — TITAN-inspired quadrature sub-bass synth
// Three modes: DROP (pitched descent), IMPACT (transient hit), RUMBLE (sustained LFO)
// Master chain: Inflator (WaveShaper) → Dry+DarkReverb → Limiter → Mono/Stereo → MasterGain → Analyser

import type { BassParams, EnvPoint } from './types';
import { DEFAULT_BASS_PARAMS } from './types';

// === DSP Helpers ===

function createDarkReverbIR(ctx: AudioContext, duration = 2.5, decay = 3.0): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * duration);
  const impulse = ctx.createBuffer(2, length, rate);
  const L = impulse.getChannelData(0);
  const R = impulse.getChannelData(1);
  let lastL = 0, lastR = 0;
  for (let i = 0; i < length; i++) {
    const env = Math.pow(1 - i / length, decay);
    const whiteL = Math.random() * 2 - 1;
    const whiteR = Math.random() * 2 - 1;
    lastL = (lastL + (0.02 * whiteL)) / 1.02;
    lastR = (lastR + (0.02 * whiteR)) / 1.02;
    L[i] = lastL * env * 2.0;
    R[i] = lastR * env * 2.0;
  }
  return impulse;
}

function generateInflatorCurve(curveValue: number, effectValue: number, clip: boolean): Float32Array<ArrayBuffer> {
  const n = 65536;
  const curve = new Float32Array(n);
  const wet = effectValue * 0.01;
  const dry = 1 - wet;
  const A = curveValue * 0.01 + 1.5;
  const B = curveValue * -0.02;
  const C = curveValue * 0.01 - 0.5;
  const D = 0.0625 - (curveValue * 0.0025) + (curveValue * curveValue * 0.000025);
  for (let i = 0; i < n; ++i) {
    const x = (i * 2) / n - 1;
    const y = Math.abs(x);
    let shaped = y < 1
      ? A * y + B * y * y + C * y * y * y - D * (y * y - 2 * y * y * y + y * y * y * y)
      : (y < 2 ? 2 * y - y * y : y);
    let out = shaped * wet * Math.sign(x) + x * dry;
    if (clip) out = Math.max(-1, Math.min(1, out));
    curve[i] = out;
  }
  return curve;
}

function getWaveforms(ctx: AudioContext) {
  const sineWave = ctx.createPeriodicWave(new Float32Array([0, 0]), new Float32Array([0, 1]));
  const cosWave = ctx.createPeriodicWave(new Float32Array([0, 1]), new Float32Array([0, 0]));
  return { sineWave, cosWave };
}

function createNoiseLfo(ctx: AudioContext, start: number, speed: number) {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.Q.value = 0.5;
  filter.frequency.value = 0.5 + (speed / 100) * 15;
  noise.connect(filter);
  noise.start(start);
  return { output: filter, node: noise };
}

// === Engine ===

export class BassEngine {
  private ctx: AudioContext | null = null;
  private recordDest: MediaStreamAudioDestinationNode | null = null;

  // Master chain nodes
  private globalShaper: WaveShaperNode | null = null;
  private dryBus: GainNode | null = null;
  private verbBus: GainNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private preMaster: GainNode | null = null;
  private monoMerge: ChannelMergerNode | null = null;
  private stereoMerge: ChannelMergerNode | null = null;
  private finalRoute: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;

  // Active nodes for cleanup
  private activeNodes: AudioNode[] = [];

  params: BassParams = { ...DEFAULT_BASS_PARAMS };

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
    const ctx = this.ctx!;

    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = this.params.masterVol;

    this.limiter = ctx.createDynamicsCompressor();
    this.limiter.threshold.value = -0.1;
    this.limiter.ratio.value = 20;
    this.limiter.attack.value = 0.001;

    this.dryBus = ctx.createGain();
    this.verbBus = ctx.createGain();
    this.verbBus.gain.value = this.params.reverbMix / 100;

    const verb = ctx.createConvolver();
    verb.buffer = createDarkReverbIR(ctx, 2.5, 3.0);
    const verbFilter = ctx.createBiquadFilter();
    verbFilter.type = 'lowpass';
    verbFilter.frequency.value = 400;
    const verbLimit = ctx.createDynamicsCompressor();
    verbLimit.threshold.value = -3;
    verbLimit.ratio.value = 10;

    this.verbBus.connect(verb);
    verb.connect(verbFilter);
    verbFilter.connect(verbLimit);
    verbLimit.connect(this.limiter);
    this.dryBus.connect(this.limiter);

    this.globalShaper = ctx.createWaveShaper();
    this.globalShaper.curve = generateInflatorCurve(this.params.inflatorCurve, this.params.inflatorAmt, this.params.inflatorClip);
    this.globalShaper.connect(this.dryBus);
    this.globalShaper.connect(this.verbBus);

    this.preMaster = ctx.createGain();
    this.limiter.connect(this.preMaster);

    const splitter = ctx.createChannelSplitter(2);
    this.monoMerge = ctx.createChannelMerger(1);
    this.stereoMerge = ctx.createChannelMerger(2);
    this.preMaster.connect(splitter);
    splitter.connect(this.monoMerge, 0, 0);
    splitter.connect(this.monoMerge, 1, 0);
    splitter.connect(this.stereoMerge, 0, 0);
    splitter.connect(this.stereoMerge, 1, 1);

    this.finalRoute = ctx.createGain();
    this.stereoMerge.connect(this.finalRoute!);

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;

    this.finalRoute.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    this.recordDest = ctx.createMediaStreamDestination();
    this.masterGain.connect(this.recordDest);

    this.applyMasterSettings(true);
  }

  private applyMasterSettings(immediate = false) {
    if (!this.ctx || !this.globalShaper) return;
    const ctx = this.ctx;
    this.globalShaper.curve = generateInflatorCurve(
      this.params.inflatorCurve, this.params.inflatorAmt, this.params.inflatorClip
    );
    if (immediate) {
      this.masterGain!.gain.setValueAtTime(this.params.masterVol, ctx.currentTime);
      this.verbBus!.gain.setValueAtTime(this.params.reverbMix / 100, ctx.currentTime);
    } else {
      this.masterGain!.gain.setTargetAtTime(this.params.masterVol, ctx.currentTime, 0.05);
      this.verbBus!.gain.setTargetAtTime(this.params.reverbMix / 100, ctx.currentTime, 0.05);
    }

    // Mono/Stereo routing — only disconnect inputs, NOT finalRoute's output to masterGain
    try { this.stereoMerge!.disconnect(this.finalRoute!); } catch {}
    try { this.monoMerge!.disconnect(this.finalRoute!); } catch {}
    if (this.params.isMono) {
      this.monoMerge!.connect(this.finalRoute!);
    } else {
      this.stereoMerge!.connect(this.finalRoute!);
    }
  }

  destroy() {
    this.stopActiveVoices();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getRecordStream(): MediaStream | null {
    return this.recordDest?.stream ?? null;
  }

  // === VOICE TRIGGER ===

  stopActiveVoices() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    this.activeNodes.forEach(node => {
      const anyNode = node as any;
      if (anyNode.gain && anyNode.gain.cancelScheduledValues) {
        anyNode.gain.cancelScheduledValues(now);
        anyNode.gain.setTargetAtTime(0, now, 0.015);
      }
      if (anyNode.stop) {
        try { anyNode.stop(now + 0.05); } catch {}
      }
    });
    this.activeNodes = [];
  }

  async trigger(pitchEnv: EnvPoint[], ampEnv: EnvPoint[]) {
    const ctx = await this.ensureCtx();
    this.stopActiveVoices();
    this.applyMasterSettings();

    const t = ctx.currentTime;
    const p = this.params;
    const mode = p.mode;

    let newNodes: AudioNode[] = [];

    if (mode === 'DROP' || mode === 'IMPACT') {
      const duration = mode === 'DROP' ? p.dropDuration : 0.8;
      const width = mode === 'DROP' ? p.dropWidth : p.impactWidth;
      const tone = mode === 'DROP' ? p.dropTone : p.impactDrive;
      const pitchMin = mode === 'DROP' ? 20 : 30;
      const pitchMax = mode === 'DROP' ? 150 : 180;

      const { sineWave, cosWave } = getWaveforms(ctx);
      const oscL = ctx.createOscillator();
      const oscR_A = ctx.createOscillator();
      const oscR_B = ctx.createOscillator();
      oscL.setPeriodicWave(sineWave);
      oscR_A.setPeriodicWave(sineWave);
      oscR_B.setPeriodicWave(cosWave);

      // Schedule pitch envelope
      const sortedPitch = [...pitchEnv].sort((a, b) => a.x - b.x);
      const scheduleFreq = (osc: OscillatorNode) => {
        osc.frequency.setValueAtTime(0, t);
        sortedPitch.forEach((pt, idx) => {
          const time = t + pt.x * duration;
          const freq = pitchMin + pt.y * (pitchMax - pitchMin);
          if (idx === 0) osc.frequency.setValueAtTime(freq, time);
          else osc.frequency.exponentialRampToValueAtTime(Math.max(1, freq), time);
        });
      };
      scheduleFreq(oscL);
      scheduleFreq(oscR_A);
      scheduleFreq(oscR_B);

      // Schedule amp envelope
      const sortedAmp = [...ampEnv].sort((a, b) => a.x - b.x);
      const ampL = ctx.createGain();
      const ampR = ctx.createGain();
      const scheduleAmp = (gainNode: GainNode) => {
        gainNode.gain.setValueAtTime(0, t);
        sortedAmp.forEach((pt, idx) => {
          const time = t + pt.x * duration;
          if (idx === 0) gainNode.gain.setValueAtTime(pt.y, time);
          else gainNode.gain.linearRampToValueAtTime(pt.y, time);
        });
        gainNode.gain.linearRampToValueAtTime(0, t + duration + 0.1);
      };
      scheduleAmp(ampL);
      scheduleAmp(ampR);

      // Tone shaper
      const shaperL = ctx.createWaveShaper();
      const shaperR = ctx.createWaveShaper();
      const curve = generateInflatorCurve(0, tone, false);
      shaperL.curve = curve;
      shaperR.curve = curve;

      // Width (quadrature)
      const gainR_A = ctx.createGain();
      const gainR_B = ctx.createGain();
      const w = width / 100;
      if (w <= 0.5) {
        const ratio = w * 2;
        gainR_A.gain.value = 1 - ratio;
        gainR_B.gain.value = ratio;
      } else {
        const ratio = (w - 0.5) * 2;
        gainR_A.gain.value = -1 * ratio;
        gainR_B.gain.value = 1 - ratio;
      }

      oscL.connect(ampL);
      ampL.connect(shaperL);
      oscR_A.connect(gainR_A);
      oscR_B.connect(gainR_B);
      gainR_A.connect(ampR);
      gainR_B.connect(ampR);
      ampR.connect(shaperR);

      const merger = ctx.createChannelMerger(2);
      shaperL.connect(merger, 0, 0);
      shaperR.connect(merger, 0, 1);
      merger.connect(this.globalShaper!);

      oscL.start(t);
      oscR_A.start(t);
      oscR_B.start(t);
      oscL.stop(t + duration + 1);
      oscR_A.stop(t + duration + 1);
      oscR_B.stop(t + duration + 1);

      newNodes = [oscL, oscR_A, oscR_B, ampL, ampR];
    } else if (mode === 'RUMBLE') {
      const duration = p.rumbleDuration;
      const { sineWave, cosWave } = getWaveforms(ctx);
      const oscL = ctx.createOscillator();
      oscL.setPeriodicWave(sineWave);
      const oscR_Main = ctx.createOscillator();
      oscR_Main.setPeriodicWave(sineWave);
      const oscR_Quad = ctx.createOscillator();
      oscR_Quad.setPeriodicWave(cosWave);

      // FM LFO
      const fmLfo = createNoiseLfo(ctx, t, p.rumbleSpeed);
      const fmGain = ctx.createGain();
      fmGain.gain.value = p.rumbleShake * 2;
      fmLfo.output.connect(fmGain);
      fmGain.connect(oscL.frequency);
      fmGain.connect(oscR_Main.frequency);
      fmGain.connect(oscR_Quad.frequency);

      // AM LFO (tremolo)
      const amLfo = createNoiseLfo(ctx, t, p.rumbleSpeed * 1.5);
      const amGain = ctx.createGain();
      amGain.gain.value = 0.4 * (p.rumbleShake / 100);
      const tremL = ctx.createGain();
      tremL.gain.value = 0.6;
      const tremR = ctx.createGain();
      tremR.gain.value = 0.6;
      amLfo.output.connect(amGain);
      amGain.connect(tremL.gain);
      amGain.connect(tremR.gain);

      // Amp envelope
      const sortedAmp = [...ampEnv].sort((a, b) => a.x - b.x);
      const env = ctx.createGain();
      sortedAmp.forEach((pt, i) => {
        const time = t + pt.x * duration;
        if (i === 0) env.gain.setValueAtTime(pt.y, time);
        else env.gain.linearRampToValueAtTime(pt.y, time);
      });

      // Pitch schedule
      const sortedPitch = [...pitchEnv].sort((a, b) => a.x - b.x);
      const scheduleF = (osc: OscillatorNode) => {
        osc.frequency.setValueAtTime(40, t);
        sortedPitch.forEach((pt) => {
          const time = t + pt.x * duration;
          osc.frequency.linearRampToValueAtTime(30 + pt.y * 50, time);
        });
      };
      scheduleF(oscL);
      scheduleF(oscR_Main);
      scheduleF(oscR_Quad);

      // Distortion
      const distL = ctx.createWaveShaper();
      const distR = ctx.createWaveShaper();
      const k = p.rumbleWeight * 0.02;
      const c = new Float32Array(4096);
      for (let i = 0; i < 4096; i++) {
        const x = (i * 2) / 4096 - 1;
        c[i] = (Math.PI + k) * x / (Math.PI + k * Math.abs(x));
      }
      distL.curve = c;
      distR.curve = c;

      // Width
      const w = p.rumbleWidth / 100;
      const gainR_Main = ctx.createGain();
      const gainR_Quad = ctx.createGain();
      if (w <= 0.5) {
        const ratio = w * 2;
        gainR_Main.gain.value = 1 - ratio;
        gainR_Quad.gain.value = ratio;
      } else {
        const ratio = (w - 0.5) * 2;
        gainR_Main.gain.value = -1 * ratio;
        gainR_Quad.gain.value = 1 - ratio;
      }

      oscR_Main.connect(gainR_Main);
      oscR_Quad.connect(gainR_Quad);

      const envL = ctx.createGain();
      const envR = ctx.createGain();
      const applyEnv = (g: GainNode) => {
        g.gain.setValueAtTime(0, t);
        sortedAmp.forEach((pt, i) => {
          const time = t + pt.x * duration;
          if (i === 0) g.gain.setValueAtTime(pt.y, time);
          else g.gain.linearRampToValueAtTime(pt.y, time);
        });
      };
      applyEnv(envL);
      applyEnv(envR);

      oscL.connect(envL);
      envL.connect(tremL);
      tremL.connect(distL);

      const rMix = ctx.createGain();
      gainR_Main.connect(rMix);
      gainR_Quad.connect(rMix);
      rMix.connect(envR);
      envR.connect(tremR);
      tremR.connect(distR);

      const merger = ctx.createChannelMerger(2);
      distL.connect(merger, 0, 0);
      distR.connect(merger, 0, 1);
      merger.connect(this.globalShaper!);

      oscL.start(t);
      oscR_Main.start(t);
      oscR_Quad.start(t);
      oscL.stop(t + duration + 1);
      oscR_Main.stop(t + duration + 1);
      oscR_Quad.stop(t + duration + 1);

      newNodes = [oscL, oscR_Main, oscR_Quad, envL, envR, amLfo.node, fmLfo.node];
    }

    this.activeNodes = newNodes;
  }

  // === PARAM API ===

  setParam<K extends keyof BassParams>(key: K, value: BassParams[K]) {
    this.params[key] = value;
    this.applyMasterSettings();
  }

  setParams(partial: Partial<BassParams>) {
    Object.assign(this.params, partial);
    this.applyMasterSettings();
  }
}
