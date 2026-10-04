// 节奏编码 — Canvas 渲染器
// 4 轨下落谱面：音符是「代码 token」（mono 字体 + 音名），逐帧绘制
// 轨道 / 判定线 / token / 命中特效（轨道闪光 + 扩散环 + 判定浮字）。

import { LANE_COLORS, LANE_KEYS, midiName, type ChartNote } from './rhythmCodeSongs';

export type RcDrawState = {
  notes: ChartNote[];
  songTime: number; // 当前歌曲时间（秒），<0 = 倒数中
  speed: number; // px / 秒
  playing: boolean;
};

type Ring = { lane: number; t0: number; color: string };
type Popup = { lane: number; text: string; color: string; t0: number };

const smooth = (n: number) => n * n * (3 - 2 * n);

export class RhythmCodeRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  width = 0;
  height = 0;
  private laneW = 0;
  private boardX = 0;
  judgeY = 0;
  private flashes: number[] = [0, 0, 0, 0];
  private rings: Ring[] = [];
  private popups: Popup[] = [];
  private lastFrame = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    this.ctx = ctx;
  }

  resize(width: number): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = width;
    this.height = Math.round(Math.min(560, Math.max(380, width * 0.52)));
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.laneW = Math.min(116, (width - 24) / 4);
    this.boardX = (width - this.laneW * 4) / 2;
    this.judgeY = this.height * 0.8;
  }

  /** 命中 x 坐标 → 轨道号，不在轨道内返回 -1 */
  laneAt(px: number): number {
    const i = Math.floor((px - this.boardX) / this.laneW);
    return i >= 0 && i < 4 ? i : -1;
  }

  laneCenter(lane: number): number {
    return this.boardX + this.laneW * (lane + 0.5);
  }

  addFlash(lane: number): void {
    this.flashes[lane] = 1;
  }

  addRing(lane: number, color: string): void {
    this.rings.push({ lane, t0: performance.now(), color });
    if (this.rings.length > 24) this.rings.shift();
  }

  addPopup(lane: number, text: string, color: string): void {
    this.popups.push({ lane, text, color, t0: performance.now() });
    if (this.popups.length > 12) this.popups.shift();
  }

  draw(s: RcDrawState, now: number): void {
    const { ctx } = this;
    const dt = this.lastFrame ? Math.min(0.05, (now - this.lastFrame) / 1000) : 0;
    this.lastFrame = now;
    for (let i = 0; i < 4; i++) this.flashes[i] = Math.max(0, this.flashes[i] - dt * 5.5);

    ctx.clearRect(0, 0, this.width, this.height);
    const boardW = this.laneW * 4;

    // 轨道底
    for (let i = 0; i < 4; i++) {
      const x = this.boardX + i * this.laneW;
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.045)';
      ctx.fillRect(x, 0, this.laneW, this.height);
      if (this.flashes[i] > 0) {
        const grad = ctx.createLinearGradient(x, this.judgeY, x, 0);
        grad.addColorStop(0, `${LANE_COLORS[i]}${Math.round(this.flashes[i] * 88).toString(16).padStart(2, '0')}`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x, 0, this.laneW, this.judgeY);
      }
    }
    // 轨道分隔线
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const x = this.boardX + i * this.laneW;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }

    // 判定线
    ctx.save();
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(this.boardX, this.judgeY);
    ctx.lineTo(this.boardX + boardW, this.judgeY);
    ctx.stroke();
    ctx.restore();

    // token：还没判定的音
    const tokenH = Math.max(22, this.laneW * 0.26);
    for (const n of s.notes) {
      if (n.judged) continue;
      const y = this.judgeY - (n.t - s.songTime) * s.speed;
      if (y < -tokenH * 2 || y > this.height + tokenH * 2) continue;
      const x = this.laneCenter(n.lane);
      const w = this.laneW * 0.78;
      const color = LANE_COLORS[n.lane];
      ctx.save();
      ctx.translate(x, y);
      const r = 7;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + r, -tokenH / 2);
      ctx.arcTo(w / 2, -tokenH / 2, w / 2, tokenH / 2, r);
      ctx.arcTo(w / 2, tokenH / 2, -w / 2, tokenH / 2, r);
      ctx.arcTo(-w / 2, tokenH / 2, -w / 2, -tokenH / 2, r);
      ctx.arcTo(-w / 2, -tokenH / 2, w / 2, -tokenH / 2, r);
      ctx.closePath();
      ctx.fillStyle = 'rgba(15,15,30,0.92)';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.stroke();
      // 时值尾巴（长音向右下画延长线）
      if (n.dur > 0.45) {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `${color}55`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 6, 0);
        ctx.lineTo(Math.min(w / 2 + (n.dur - 0.3) * 46, this.laneW * 1.4), 0);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.fillStyle = color;
      ctx.font = `bold ${Math.round(tokenH * 0.44)}px ui-monospace, Consolas, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(midiName(n.midi), 0, 1);
      ctx.restore();
    }

    // 命中环
    this.rings = this.rings.filter((r) => now - r.t0 < 380);
    for (const r of this.rings) {
      const k = (now - r.t0) / 380;
      ctx.save();
      ctx.globalAlpha = 1 - k;
      ctx.strokeStyle = r.color;
      ctx.lineWidth = 3 * (1 - k) + 0.5;
      ctx.beginPath();
      ctx.arc(this.laneCenter(r.lane), this.judgeY, 8 + smooth(k) * 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 判定浮字
    this.popups = this.popups.filter((p) => now - p.t0 < 520);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (const p of this.popups) {
      const k = (now - p.t0) / 520;
      ctx.save();
      ctx.globalAlpha = 1 - k * k;
      ctx.fillStyle = p.color;
      ctx.font = `bold 13px ui-monospace, Consolas, monospace`;
      ctx.fillText(p.text, this.laneCenter(p.lane), this.judgeY - 16 - smooth(k) * 26);
      ctx.restore();
    }

    // 键位帽
    for (let i = 0; i < 4; i++) {
      const x = this.laneCenter(i);
      const y = this.judgeY + 22;
      const active = this.flashes[i] > 0.35;
      ctx.beginPath();
      ctx.roundRect?.(x - 20, y - 14, 40, 28, 7);
      if (!ctx.roundRect) ctx.rect(x - 20, y - 14, 40, 28);
      ctx.fillStyle = active ? LANE_COLORS[i] : 'rgba(255,255,255,0.08)';
      ctx.fill();
      ctx.strokeStyle = `${LANE_COLORS[i]}99`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = active ? '#0f0f1e' : 'rgba(255,255,255,0.65)';
      ctx.font = 'bold 13px ui-monospace, Consolas, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(LANE_KEYS[i], x, y + 1);
    }
  }
}
