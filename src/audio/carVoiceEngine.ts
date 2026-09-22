// CarVoiceEngine — 合成器竞速的「车辆声音皮肤」引擎
// 复用本站 SubBass/CrystalPrism 的 Web Audio 套路：振荡器 + 低通滤波 + 包络 + 卷积混响
// 持续振荡器当引擎声（转速 -> 音高，油门 -> 明亮度），碰撞触发 SubBass 风格低频打击

export type Waveform = 'sine' | 'triangle' | 'sawtooth' | 'square';

export interface CarVoiceParams {
  waveform: Waveform; // 引擎波形（挂挡/音色）
  cutoff: number;     // 0..1 低通滤波基准亮度
  detune: number;     // -100..100 音分，双振荡失谐厚度
  reverbWet: number;  // 0..1 混响湿声
  volume: number;     // 0..1 总音量
}

const DEFAULT_PARAMS: CarVoiceParams = {
  waveform: 'sawtooth',
  cutoff: 0.6,
  detune: 0,
  reverbWet: 0.12,
  volume: 0.5,
};

export class CarVoiceEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private wet: GainNode | null = null;
  private dry: GainNode | null = null;

  // 引擎声链：osc + sub -> lowpass -> engineGain -> (dry + convolver)
  private engineOsc: OscillatorNode | null = null;
  private engineSub: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private engineGain: GainNode | null = null;

  params: CarVoiceParams = { ...DEFAULT_PARAMS };

  // === 生命周期 ===

  async start(): Promise<void> {
    await this.ensureCtx();
    if (!this.engineOsc) this.buildEngine();
    if (this.ctx!.state === 'suspended') await this.ctx!.resume();
  }

  private async ensureCtx(): Promise<void> {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext({ sampleRate: 48000 });
      this.buildGraph();
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();
  }

  private buildGraph(): void {
    const c = this.ctx!;
    this.master = c.createGain();
    this.master.gain.value = this.params.volume;
    this.master.connect(c.destination);

    // 混响：卷积 + 干湿分离（与本站合成器一致的做法）
    this.convolver = c.createConvolver();
    this.convolver.buffer = this.makeImpulse(1.6, 2.5);
    this.wet = c.createGain();
    this.wet.gain.value = this.params.reverbWet;
    this.dry = c.createGain();
    this.dry.gain.value = 1 - this.params.reverbWet;
    this.convolver.connect(this.wet);
    this.wet.connect(this.master);
    this.dry.connect(this.master);
  }

  private makeImpulse(seconds: number, decay: number): AudioBuffer {
    const c = this.ctx!;
    const rate = c.sampleRate;
    const len = Math.max(1, Math.floor(rate * seconds));
    const buf = c.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  }

  private buildEngine(): void {
    const c = this.ctx!;
    this.engineOsc = c.createOscillator();
    this.engineOsc.type = this.params.waveform;
    this.engineOsc.frequency.value = 60;
    this.engineOsc.detune.value = this.params.detune;

    // sub 层增加厚度（与 SubBass 的 RUMBLE 思路一致）
    this.engineSub = c.createOscillator();
    this.engineSub.type = 'sine';
    this.engineSub.frequency.value = 30;

    this.engineFilter = c.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.value = 280 + this.params.cutoff * 5000;
    this.engineFilter.Q.value = 6;

    this.engineGain = c.createGain();
    this.engineGain.gain.value = 0.0001;

    const subGain = c.createGain();
    subGain.gain.value = 0.4;
    this.engineOsc.connect(this.engineFilter);
    this.engineSub.connect(subGain);
    subGain.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    const dryNode = this.dry!;
    const convNode = this.convolver!;
    this.engineGain.connect(dryNode);
    this.engineGain.connect(convNode);

    this.engineOsc.start();
    this.engineSub.start();
  }

  // === 每帧驱动（rpm / throttle 均为 0..1）===
  update(rpm: number, throttle: number): void {
    if (!this.ctx || !this.engineOsc || !this.engineGain || !this.engineFilter) return;
    const now = this.ctx.currentTime;
    const r = Math.max(0, Math.min(1, rpm));
    const th = Math.max(0, Math.min(1, throttle));
    const baseFreq = 42 + r * 360;
    this.engineOsc.frequency.setTargetAtTime(baseFreq, now, 0.04);
    this.engineSub!.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.04);
    // 亮度 = 面板 cutoff 基准 + 油门/转速调制
    const cutoff = 250 + this.params.cutoff * 5000 + th * 1600 + r * 1200;
    this.engineFilter.frequency.setTargetAtTime(cutoff, now, 0.05);
    const targetGain = 0.05 + th * 0.16 + r * 0.12;
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.06);
  }

  // 暂停 / 静音引擎
  setEngineLevel(level: number): void {
    if (!this.ctx || !this.engineGain) return;
    this.engineGain.gain.setTargetAtTime(level, this.ctx.currentTime, 0.05);
  }

  // 碰撞：SubBass 风格低频打击 + 噪声瞬态
  playImpact(intensity = 1): void {
    if (!this.ctx || !this.master) return;
    const c = this.ctx;
    const now = c.currentTime;

    const osc = c.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(82, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + 0.35);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.55 * intensity, now + 0.006);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.5);

    const bufSize = Math.floor(c.sampleRate * 0.12);
    const nb = c.createBuffer(1, bufSize, c.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.015));
    const ns = c.createBufferSource();
    ns.buffer = nb;
    const nf = c.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = 180;
    nf.Q.value = 0.8;
    const ng = c.createGain();
    ng.gain.value = 0.3 * intensity;
    ns.connect(nf);
    nf.connect(ng);
    ng.connect(this.master);
    ns.start(now);
    ns.stop(now + 0.12);
  }

  // 加速带 / boost：上升扫频
  playBoost(): void {
    if (!this.ctx || !this.master) return;
    const c = this.ctx;
    const now = c.currentTime;
    const osc = c.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.25);
    const g = c.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    const f = c.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 2200;
    osc.connect(f);
    f.connect(g);
    g.connect(this.master);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  // === 参数（驾驶舱面板实时改）===
  setParam<K extends keyof CarVoiceParams>(key: K, value: CarVoiceParams[K]): void {
    this.params[key] = value;
    this.applyParams();
  }

  setParams(p: Partial<CarVoiceParams>): void {
    Object.assign(this.params, p);
    this.applyParams();
  }

  private applyParams(): void {
    if (!this.ctx) return;
    const p = this.params;
    if (this.master) this.master.gain.value = p.volume;
    if (this.engineOsc) this.engineOsc.type = p.waveform;
    if (this.engineOsc) this.engineOsc.detune.value = p.detune;
    if (this.engineFilter) this.engineFilter.frequency.value = 280 + p.cutoff * 5000;
    if (this.wet) this.wet.gain.value = p.reverbWet;
    if (this.dry) this.dry.gain.value = 1 - p.reverbWet;
  }

  isRunning(): boolean {
    return !!this.ctx && this.ctx.state === 'running' && !!this.engineOsc;
  }

  destroy(): void {
    // 先把增益压到 0，避免直接 stop 产生爆音（click）
    try {
      if (this.ctx && this.engineGain) {
        this.engineGain.gain.cancelScheduledValues(this.ctx.currentTime);
        this.engineGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
      }
    } catch { /* noop */ }
    try { this.engineOsc?.stop(); } catch { /* noop */ }
    try { this.engineSub?.stop(); } catch { /* noop */ }
    this.engineOsc = null;
    this.engineSub = null;
    this.engineFilter = null;
    this.engineGain = null;
    if (this.ctx) {
      this.ctx.close().catch(() => { /* noop */ });
      this.ctx = null;
    }
    this.master = null;
    this.convolver = null;
    this.wet = null;
    this.dry = null;
  }
}
