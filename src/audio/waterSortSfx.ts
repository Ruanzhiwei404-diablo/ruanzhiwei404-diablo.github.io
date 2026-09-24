// 色彩排列 — 轻量 Web Audio 音效引擎（倒水 / 选中 / 归位 / 过关）
// 用户手势（进入关卡）后由 ensure() 创建 AudioContext，规避自动播放限制。

export class WaterSortSfx {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = true;

  ensure() {
    if (this.ctx) return;
    try {
      const AC: typeof AudioContext =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

  /** 水滴下滑声：倒水 */
  pour() {
    this.blip(520, 0.1, 'sine', 0.55);
    window.setTimeout(() => this.blip(360, 0.12, 'sine', 0.45), 60);
  }

  select() {
    this.blip(600, 0.06, 'triangle', 0.45);
  }

  /** 颜色归位：清脆双音 */
  settle() {
    this.blip(784, 0.1, 'sine', 0.6);
    window.setTimeout(() => this.blip(1175, 0.14, 'sine', 0.5), 90);
  }

  invalid() {
    this.blip(160, 0.1, 'square', 0.3);
  }

  win() {
    [523, 659, 784, 1047].forEach((f, i) =>
      window.setTimeout(() => this.blip(f, 0.26, 'sine', 0.8), i * 110),
    );
  }
}
