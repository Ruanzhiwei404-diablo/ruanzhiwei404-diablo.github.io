// Boss 混音战 — Canvas 渲染器
// 上半：Boss 的目标声纹（幽灵条）vs 你的实时输出（实心条），4 频段并排；
//       拍点闪光 + 匹配度仪表；Boss 出招时顶部横幅闪烁招式名。

/** 通道色：ch0 紫(低) / ch1 琥珀 / ch2 青 / ch3 粉(高) */
export const CH_COLORS = ['#a855f7', '#f59e0b', '#22d3ee', '#ec4899'];

export type BmDrawState = {
  target: number[]; // 4 频段目标 0..1
  player: number[]; // 4 频段实测 0..1
  match: number; // 0..1
  beatFrac: number; // 0..1 拍内相位
  moveName: string | null; // 当前招式名（静音领域等）
  bossIcon: string;
  bossColor: string;
  running: boolean;
};

export class BossMixerRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  width = 0;
  height = 0;
  private matchSmooth = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    this.ctx = ctx;
  }

  resize(width: number): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = width;
    this.height = Math.round(Math.min(360, Math.max(260, width * 0.34)));
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  draw(s: BmDrawState): void {
    const { ctx } = this;
    this.matchSmooth += (s.match - this.matchSmooth) * 0.15;
    ctx.clearRect(0, 0, this.width, this.height);

    const pad = 18;
    const groupW = (this.width - pad * 2) / 4;
    const barW = Math.min(64, groupW * 0.42);
    const chartTop = 64;
    const chartBot = this.height - 54;
    const chartH = chartBot - chartTop;

    // 拍点背景脉动
    const pulse = 1 - s.beatFrac;
    ctx.fillStyle = `rgba(255,255,255,${0.012 + pulse * 0.02})`;
    ctx.fillRect(0, 0, this.width, this.height);

    // Boss 头像区
    ctx.font = '40px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.shadowColor = s.bossColor;
    ctx.shadowBlur = 14 + pulse * 14;
    ctx.fillText(s.bossIcon, this.width / 2, 34 + pulse * 3);
    ctx.restore();

    // 招式横幅（静音领域等特殊招）
    if (s.moveName) {
      ctx.save();
      ctx.font = 'bold 15px ui-monospace, Consolas, monospace';
      const tw = ctx.measureText(s.moveName).width + 28;
      ctx.fillStyle = 'rgba(236,72,153,0.16)';
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 1.5;
      const bx = (this.width - tw) / 2;
      ctx.beginPath();
      ctx.roundRect?.(bx, 58, tw, 26, 13);
      if (!ctx.roundRect) ctx.rect(bx, 58, tw, 26);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#f9a8d4';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.moveName, this.width / 2, 72);
      ctx.restore();
    }

    // 4 频段：目标幽灵条 + 玩家实心条
    for (let i = 0; i < 4; i++) {
      const cx = pad + groupW * i + groupW / 2;
      const tH = Math.max(2, s.target[i] * chartH);
      const pH = Math.max(2, s.player[i] * chartH);
      // 目标（幽灵描边，向上）
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.roundRect?.(cx - barW / 2, chartBot - tH, barW, tH, 6);
      if (!ctx.roundRect) ctx.rect(cx - barW / 2, chartBot - tH, barW, tH);
      ctx.stroke();
      ctx.setLineDash([]);
      // 玩家（实心，颜色按通道）
      const color = CH_COLORS[i];
      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect?.(cx - barW / 2, chartBot - pH, barW, pH, 6);
      if (!ctx.roundRect) ctx.rect(cx - barW / 2, chartBot - pH, barW, pH);
      ctx.fill();
      ctx.restore();
      // 偏差提示：目标顶与实际顶之间画红色隙
      const gapTop = chartBot - Math.max(tH, pH);
      const gapBot = chartBot - Math.min(tH, pH);
      if (gapBot - gapTop > 4) {
        ctx.fillStyle = 'rgba(244,63,94,0.5)';
        ctx.fillRect(cx - barW / 2 + 3, gapTop, barW - 6, gapBot - gapTop);
      }
      // 频段标签
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '10px ui-monospace, Consolas, monospace';
      ctx.fillText(['SUB', 'LOW', 'MID', 'HIGH'][i], cx, this.height - 40);
    }

    // 匹配度仪表（底部横条）
    const mw = this.width - pad * 2;
    const my = this.height - 20;
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath();
    ctx.roundRect?.(pad, my, mw, 8, 4);
    if (!ctx.roundRect) ctx.rect(pad, my, mw, 8);
    ctx.fill();
    const mColor = this.matchSmooth > 0.7 ? '#22d3ee' : this.matchSmooth > 0.45 ? '#f59e0b' : '#f43f5e';
    ctx.fillStyle = mColor;
    ctx.save();
    ctx.shadowColor = mColor;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.roundRect?.(pad, my, Math.max(3, mw * this.matchSmooth), 8, 4);
    if (!ctx.roundRect) ctx.rect(pad, my, Math.max(3, mw * this.matchSmooth), 8);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = 'bold 10px ui-monospace, Consolas, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('MATCH', pad, my - 8);
    ctx.textAlign = 'right';
    ctx.fillText(`${Math.round(this.matchSmooth * 100)}%`, pad + mw, my - 8);
    ctx.textAlign = 'center';

    // 暂停时压暗
    if (!s.running) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(0, 0, this.width, this.height);
    }
  }
}
