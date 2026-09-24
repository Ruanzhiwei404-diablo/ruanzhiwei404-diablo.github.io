// 连连看 — 轻量 Web Audio 音效引擎
// 用户手势（开始游戏）后由 ensure() 创建 AudioContext，规避自动播放限制。
// 引擎统一放在 src/audio/ 下，与本站其它游戏音频引擎约定一致。

export class LianliankanSfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = true;

  /** 在开始游戏（用户手势）时调用 */
  ensure() {
    if (this.ctx) return;
    try {
      const AC: typeof AudioContext =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  resume() {
    this.ctx?.resume?.();
  }

  private blip(freq: number, dur: number, type: OscillatorType = 'sine', gain = 1) {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  select() {
    this.blip(540, 0.07, 'triangle', 0.5);
  }

  match(combo = 1) {
    // combo 越高音越亮
    const base = 700 + Math.min(combo, 6) * 60;
    this.blip(base, 0.12, 'sine', 0.9);
    this.blip(base * 1.33, 0.14, 'sine', 0.45);
  }

  invalid() {
    this.blip(170, 0.12, 'square', 0.35);
  }

  win() {
    [523, 659, 784, 1047].forEach((f, i) =>
      window.setTimeout(() => this.blip(f, 0.26, 'sine', 0.8), i * 110),
    );
  }

  lose() {
    this.blip(320, 0.18, 'sawtooth', 0.4);
    window.setTimeout(() => this.blip(200, 0.32, 'sawtooth', 0.4), 130);
  }
}
