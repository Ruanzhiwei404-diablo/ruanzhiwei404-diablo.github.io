// Boss 混音战 — Web Audio 引擎
// 你操控的「武器混音台」：4 通道合成器（Sub 正弦 / 锯齿 / 方波 / 噪声）
// + 主低通滤波（CUTOFF）+ 律动 LFO（GROOVE，按拍调制各通道音量）。
// master 后挂 AnalyserNode：实时测你的输出频谱，与 Boss 目标声纹对比。
//
// 通道 ↔ 频段对应（玩家心智模型：推子从左到右 = 频率从低到高）：
//   ch0 Sub    55Hz 正弦      → band0  30~140Hz
//   ch1 锯齿  220Hz（谐波丰富）→ band1 140~600Hz
//   ch2 方波  880Hz           → band2 600~2600Hz
//   ch3 噪声  高通 2.5k 白噪   → band3 2.6k~9kHz

export const BAND_EDGES = [30, 140, 600, 2600, 9000];

export type BossChannel = 0 | 1 | 2 | 3;

export class BossMixerEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private analyser: AnalyserNode | null = null;
  private freqData: Uint8Array<ArrayBuffer> | null = null;
  private gains: GainNode[] = [];
  private lfos: { osc: OscillatorNode; depth: GainNode }[] = [];
  private noiseSrc: AudioBufferSourceNode | null = null;

  ensure(): AudioContext {
    if (this.ctx) return this.ctx;
    const AC: typeof AudioContext =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;

    this.filter = ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 12000;
    this.filter.Q.value = 0.5;

    this.analyser = ctx.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.5;
    this.freqData = new Uint8Array(new ArrayBuffer(this.analyser.frequencyBinCount));

    this.master = ctx.createGain();
    this.master.gain.value = 0.6;
    this.filter.connect(this.master);
    this.master.connect(this.analyser);
    this.analyser.connect(ctx.destination);

    // ch0: 55Hz 正弦
    this.makeOscChannel(0, 'sine', 55);
    // ch1: 220Hz 锯齿
    this.makeOscChannel(1, 'sawtooth', 220);
    // ch2: 880Hz 方波
    this.makeOscChannel(2, 'square', 880);
    // ch3: 噪声（高通 2.5k）
    {
      const g = ctx.createGain();
      g.gain.value = 0;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 2500;
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      src.connect(hp);
      hp.connect(g);
      g.connect(this.filter);
      src.start();
      this.noiseSrc = src;
      this.gains[3] = g;
      // 噪声也挂律动 LFO（2 倍频，碎拍感）
      this.attachLfo(3, g);
    }
    return ctx;
  }

  private makeOscChannel(i: BossChannel, type: OscillatorType, freq: number): void {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = 0;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    osc.connect(g);
    g.connect(this.filter!);
    osc.start();
    this.gains[i] = g;
    // 律动 LFO：倍频在 setGroove 里按通道设定
    this.attachLfo(i, g);
  }

  private attachLfo(i: BossChannel, target: GainNode): void {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 2; // setBpm 会重设
    const depth = ctx.createGain();
    depth.gain.value = 0;
    osc.connect(depth);
    depth.connect(target.gain);
    osc.start();
    this.lfos[i] = { osc, depth };
  }

  async resume(): Promise<void> {
    if (this.ctx?.state === 'suspended') await this.ctx.resume();
  }

  async suspend(): Promise<void> {
    if (this.ctx?.state === 'running') await this.ctx.suspend();
  }

  /** 通道音量 0..1（平滑过渡，避免爆音） */
  setChannel(i: BossChannel, v: number): void {
    if (!this.ctx || !this.gains[i]) return;
    this.gains[i].gain.setTargetAtTime(v * 0.9, this.ctx.currentTime, 0.03);
  }

  /** 全部通道拉零（静音领域 / 退场用） */
  silenceAll(): void {
    for (let i = 0; i < 4; i++) this.setChannel(i as BossChannel, 0);
  }

  /** 主低通截止（Hz，200~12000 对数映射由页面负责） */
  setCutoff(freq: number): void {
    if (!this.ctx || !this.filter) return;
    this.filter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.03);
  }

  /** 律动：BPM 与 LFO 深度 0..1（深度按各通道当前音量成比例注入） */
  setGroove(bpm: number, depth: number, levels: number[]): void {
    if (!this.ctx) return;
    const beatHz = bpm / 60;
    for (let i = 0; i < 4; i++) {
      const l = this.lfos[i];
      if (!l) continue;
      l.osc.frequency.setTargetAtTime(beatHz * (i >= 2 ? 2 : 1), this.ctx.currentTime, 0.05);
      l.depth.gain.setTargetAtTime(depth * (levels[i] ?? 0) * 0.45, this.ctx.currentTime, 0.05);
    }
  }

  /** 当前输出 4 频段能量 0..1（来自 AnalyserNode 实测） */
  bands(): number[] {
    if (!this.analyser || !this.freqData) return [0, 0, 0, 0];
    this.analyser.getByteFrequencyData(this.freqData);
    const nyquist = (this.ctx?.sampleRate ?? 48000) / 2;
    const bins = this.freqData.length;
    const out: number[] = [];
    for (let b = 0; b < 4; b++) {
      const lo = Math.max(1, Math.floor((BAND_EDGES[b] / nyquist) * bins));
      const hi = Math.min(bins - 1, Math.ceil((BAND_EDGES[b + 1] / nyquist) * bins));
      let sum = 0;
      let n = 0;
      for (let i = lo; i <= hi; i++) {
        sum += this.freqData![i];
        n++;
      }
      out.push(n ? sum / n / 255 : 0);
    }
    return out;
  }

  /** 退场：停声源、挂起 */
  async dispose(): Promise<void> {
    this.silenceAll();
    try {
      this.noiseSrc?.stop();
    } catch {
      /* ignore */
    }
    await this.suspend();
  }
}
