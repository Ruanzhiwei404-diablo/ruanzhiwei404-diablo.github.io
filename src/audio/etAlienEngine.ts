// ET 外星人 — 多振荡器语音合成引擎
// 移植自 alien-language-synth.html：基频 + 谐波 + 颤音 LFO + lowpass 共鸣 + 音量包络
// 每个谐波一路独立振荡器，模拟硅基生物「多个气囊同时振动产生和弦」的发声方式。

export type EtAlienParams = {
  /** 主频率 Hz */
  baseFreq: number;
  /** 谐波（振荡器）数量 1-5 */
  harmonics: number;
  /** 共鸣度 0-1，控制 lowpass 截止与 Q */
  resonance: number;
  /** 颤音速率 Hz，0 = 关闭 */
  vibrato: number;
  /** 包络时长 ms */
  envelope: number;
};

export const DEFAULT_ET_ALIEN_PARAMS: EtAlienParams = {
  baseFreq: 220,
  harmonics: 3,
  resonance: 0.5,
  vibrato: 5,
  envelope: 500,
};

export class EtAlienEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private recordDest: MediaStreamAudioDestinationNode | null = null;
  /** 受 stopAll() 管辖的振荡器（不参与 stopPrevious 的播放不入列） */
  private activeOscillators: OscillatorNode[] = [];

  params: EtAlienParams = { ...DEFAULT_ET_ALIEN_PARAMS };

  // === 生命周期 ===

  async init(): Promise<AudioContext> {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
      this.buildGraph();
    }
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        /* 浏览器策略限制，忽略 */
      }
    }
    return this.ctx;
  }

  private buildGraph() {
    const c = this.ctx!;

    this.masterGain = c.createGain();
    // 5 路谐波叠加峰值约 1.14，留一点余量避免削波
    this.masterGain.gain.value = 0.75;

    this.analyser = c.createAnalyser();
    this.analyser.fftSize = 2048;

    this.masterGain.connect(this.analyser);

    this.recordDest = c.createMediaStreamDestination();
    this.analyser.connect(this.recordDest);
    this.analyser.connect(c.destination);
  }

  isRunning(): boolean {
    return this.ctx?.state === 'running';
  }

  destroy() {
    this.stopAll();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  // === 参数 ===

  setParams(partial: Partial<EtAlienParams>) {
    Object.assign(this.params, partial);
  }

  // === 发声 ===

  /**
   * 播放一个合成音
   * @param frequency 覆盖基频，缺省用 params.baseFreq
   * @param durationSec 覆盖时长，缺省用 params.envelope
   * @param stopPrevious 是否掐掉上一个音（文案逐字播放时传 false）
   * @returns 声音播完才 resolve 的 Promise
   */
  playSound(frequency?: number, durationSec?: number, stopPrevious = true): Promise<void> {
    const ctx = this.ctx;
    if (!ctx || !this.masterGain) return Promise.resolve();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    if (stopPrevious) this.stopAll();

    const p = this.params;
    const oscCount = p.harmonics;
    const baseFreq = frequency ?? p.baseFreq;
    const dur = durationSec ?? p.envelope / 1000;
    const now = ctx.currentTime;
    const spawned: OscillatorNode[] = [];

    for (let i = 0; i < oscCount; i++) {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // 基频用正弦，谐波在三角/锯齿之间交替
      osc.type = i === 0 ? 'sine' : i % 2 === 0 ? 'triangle' : 'sawtooth';

      const harmonicFreq = baseFreq * (i + 1) * (1 + i * 0.1);
      osc.frequency.setValueAtTime(harmonicFreq, now);

      // 颤音：LFO 调制到振荡器频率上，深度为谐波频率的 2%
      if (p.vibrato > 0) {
        const vibratoOsc = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibratoOsc.frequency.setValueAtTime(p.vibrato, now);
        vibratoGain.gain.setValueAtTime(harmonicFreq * 0.02, now);
        vibratoOsc.connect(vibratoGain);
        vibratoGain.connect(osc.frequency);
        vibratoOsc.start(now);
        vibratoOsc.stop(now + dur + 0.1);
        spawned.push(vibratoOsc);
      }

      // 共鸣：lowpass 截止 400-6400Hz，Q 5-20
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400 + p.resonance * 6000, now);
      filter.Q.setValueAtTime(5 + p.resonance * 15, now);

      // 音量包络：谐波音量递减
      const vol = 0.5 / (i + 1);
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(vol, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + dur);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + dur + 0.05);
      spawned.push(osc);
    }

    if (stopPrevious) {
      this.activeOscillators.push(...spawned);
    }

    return new Promise(resolve => {
      setTimeout(() => {
        spawned.forEach(node => {
          try {
            node.stop();
          } catch {
            /* 已停止 */
          }
        });
        resolve();
      }, dur * 1000);
    });
  }

  stopAll() {
    this.activeOscillators.forEach(node => {
      try {
        node.stop();
      } catch {
        /* 已停止 */
      }
    });
    this.activeOscillators = [];
  }

  // === 对外接口 ===

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getRecordStream(): MediaStream | null {
    return this.recordDest?.stream ?? null;
  }
}
