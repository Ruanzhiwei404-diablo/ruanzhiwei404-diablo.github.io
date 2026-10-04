// 节奏编码 — Web Audio 引擎
// 纯合成（零采样）：旋律音 = osc + 低通 + 包络；打击反馈 = 短促 blip；
// miss = 滤波噪声；节拍器 = 计数/陪拍 tick。音色可选，呼应本站合成器血统。

export type Timbre = 'pulse' | 'triangle' | 'square' | 'sawtooth';

type Wave = OscillatorType;

export const TIMBRES: { id: Timbre; label: string; hint: string }[] = [
  { id: 'pulse', label: '脉冲', hint: '芯片音 · 经典 8bit' },
  { id: 'triangle', label: '三角', hint: '柔和 · 入门友好' },
  { id: 'square', label: '方波', hint: '复古 · 颗粒感' },
  { id: 'sawtooth', label: '锯齿', hint: '明亮 · 合成器味' },
];

export class RhythmCodeEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  timbre: Timbre = 'pulse';
  enabled = true;

  ensure(): AudioContext {
    if (!this.ctx) {
      const AC: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  async resume(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume();
  }

  async suspend(): Promise<void> {
    if (this.ctx && this.ctx.state === 'running') await this.ctx.suspend();
  }

  /** 音频时钟（秒）。suspend 时会冻结，天然支持暂停 */
  get now(): number {
    return this.ctx ? this.ctx.currentTime : 0;
  }

  private wave(): Wave {
    return this.timbre === 'pulse' ? 'square' : (this.timbre as Wave);
  }

  private vel(): number {
    return this.timbre === 'triangle' ? 0.62 : this.timbre === 'pulse' ? 0.3 : 0.4;
  }

  /** 旋律音：命中时即时发声，dur = 该音的谱面时长（秒） */
  playTone(midi: number, durSec: number, velScale = 1): void {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!this.master) return;
    const t0 = ctx.currentTime + 0.001;
    const f = 440 * Math.pow(2, (midi - 69) / 12);
    const vel = this.vel() * velScale;
    const osc = ctx.createOscillator();
    osc.type = this.wave();
    osc.frequency.value = f;
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = Math.min(9000, f * 5 + 900);
    flt.Q.value = 0.6;
    const g = ctx.createGain();
    const rel = Math.min(0.3, durSec * 0.45 + 0.09);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vel, t0 + 0.007);
    g.gain.linearRampToValueAtTime(vel * 0.8, t0 + Math.max(0.02, durSec));
    g.gain.exponentialRampToValueAtTime(0.001, t0 + durSec + rel);
    osc.connect(flt);
    flt.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + durSec + rel + 0.05);
  }

  /** 空拍按键：对应轨道的基础音（轻），可自由「拨代码」 */
  playFree(midi: number): void {
    this.playTone(midi, 0.16, 0.4);
  }

  /** 命中反馈 blip */
  playHit(kind: 'perfect' | 'good'): void {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!this.master) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    const f = kind === 'perfect' ? 1568 : 1046;
    osc.frequency.setValueAtTime(f, t0);
    osc.frequency.exponentialRampToValueAtTime(f * 0.55, t0 + 0.08);
    g.gain.setValueAtTime(kind === 'perfect' ? 0.18 : 0.11, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.09);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.1);
  }

  /** miss：短促闷噪声 */
  playMiss(): void {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!this.master) return;
    const t0 = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * 0.1);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const flt = ctx.createBiquadFilter();
    flt.type = 'lowpass';
    flt.frequency.value = 420;
    const g = ctx.createGain();
    g.gain.value = 0.3;
    src.connect(flt);
    flt.connect(g);
    g.connect(this.master);
    src.start(t0);
  }

  /** 节拍器 tick（倒数 / 陪拍） */
  playTick(accent = false): void {
    if (!this.enabled) return;
    const ctx = this.ensure();
    if (!this.master) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = accent ? 2100 : 1400;
    g.gain.setValueAtTime(accent ? 0.14 : 0.08, t0);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + 0.06);
  }

  /** 结算小旋律：评级揭晓 */
  playResult(grade: 'S' | 'A' | 'B' | 'C' | 'D'): void {
    if (!this.enabled) return;
    const seq =
      grade === 'S' ? [72, 76, 79, 84] : grade === 'A' ? [72, 76, 79] : grade === 'D' ? [62, 58] : [67, 72];
    const step = grade === 'S' ? 0.14 : 0.18;
    seq.forEach((m, i) => {
      window.setTimeout(() => this.playTone(m, 0.22, 0.8), i * step * 1000);
    });
  }
}
