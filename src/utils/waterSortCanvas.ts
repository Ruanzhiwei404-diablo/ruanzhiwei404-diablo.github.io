// 色彩排列 — Canvas 渲染器（复刻参考站 webgames.fun 的逐帧倒水动画）
// 核心技巧与其一致：clip 管内区域后把坐标系旋回竖直，再画「水平水带」——
// 液面因此永远保持水平。
// 倒水时间线（参考截图行为）：
//   0~0.20 源管飞起、移到目标管口上方（途中开始倾斜）
//   0.20~0.70 悬停倾倒：液面恒水平、水柱流注、双方水位此消彼长
//   0.70~0.80 转回竖直
//   0.80~1.00 飞回原位
import { CAPACITY, COLORS, type Tubes } from './waterSortLevels';

export type TubePos = { x: number; y: number; w: number; h: number };

export type AnimState = {
  from: number;
  to: number;
  count: number; // 本步转移层数
  color: number; // 转移的颜色 id（1 起）
  start: number; // performance.now()
  duration: number; // ms
};

export type DrawState = {
  tubes: Tubes; // 已提交棋面（动画中的增量由渲染器按 progress 叠加）
  anim: AnimState | null;
  progress: number; // 0..1
  selected: number | null;
  lifts: number[]; // 每管当前抬升偏移（选中缓动）
  showNums: boolean;
};

const smooth = (n: number) => n * n * (3 - 2 * n); // smoothstep（参考站同款）
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const T_FLY = 0.2; // 飞行段结束
const T_POUR_END = 0.7; // 倾倒段结束
const T_BACK = 0.8; // 转回竖直
const MAX_TILT = 1.8; // ≈103°，让液面越过管口

function tiltAt(p: number, dir: number): number {
  if (p <= 0 || p >= 1) return 0;
  if (p < 0.1) return MAX_TILT * smooth(p / 0.1) * dir; // 飞行途中转出
  if (p > T_POUR_END) return MAX_TILT * smooth((T_BACK - p) / (T_BACK - T_POUR_END)) * dir;
  return MAX_TILT * dir;
}

/** 液体转移进度：悬停倾倒段内推进 */
function transferAt(p: number): number {
  return smooth(clamp01((p - T_FLY) / (T_POUR_END - T_FLY)));
}

/** 圆角管路径：[tl, tr, br, bl]，底部大圆角呈试管形 */
function roundedTubePath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tl: number,
  tr: number,
  br: number,
  bl: number,
) {
  ctx.moveTo(x + tl, y);
  ctx.lineTo(x + w - tr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
  ctx.lineTo(x + w, y + h - br);
  ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
  ctx.lineTo(x + bl, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
  ctx.lineTo(x, y + tl);
  ctx.quadraticCurveTo(x, y, x + tl, y);
  ctx.closePath();
}

export class WaterSortRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  positions: TubePos[] = [];
  width = 0;
  height = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');
    this.ctx = ctx;
  }

  /** 布局：每行 4~6 根（窄屏 4），居中排布；适配 devicePixelRatio。topPad 预留飞管悬停空间 */
  resize(width: number, tubeCount: number) {
    const perRow = tubeCount <= 8 || width < 620 ? 4 : 6;
    const rows = Math.ceil(tubeCount / perRow);
    const colW = Math.min((width - 20) / perRow, 178);
    const tw = Math.min(96, Math.max(36, colW * 0.6));
    const th = tw * 2.9;
    const rowGap = th + (width < 600 ? 52 : 62);
    const topPad = width < 600 ? 110 : 150;
    this.width = width;
    this.height = Math.round(topPad + (rows - 1) * rowGap + th + 20);
    this.positions = Array.from({ length: tubeCount }, (_, i) => {
      const row = Math.floor(i / perRow);
      const inRow = Math.min(perRow, tubeCount - row * perRow);
      return {
        x: width / 2 + (i % perRow - (inRow - 1) / 2) * colW,
        y: topPad + row * rowGap + th / 2,
        w: tw,
        h: th,
      };
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  hitTest(px: number, py: number): number {
    for (let i = 0; i < this.positions.length; i++) {
      const p = this.positions[i];
      if (Math.abs(px - p.x) <= p.w / 2 + 10 && Math.abs(py - p.y) <= p.h / 2 + 12) return i;
    }
    return -1;
  }

  draw(s: DrawState) {
    const { ctx } = this;
    ctx.clearRect(0, 0, this.width, this.height);
    const anim = s.anim;
    const p = s.progress;

    // 每管显示液量（单位=层，可小数）
    const fills: number[] = s.tubes.map((t) => t.length);

    // 绘制顺序：普通管 → 水柱 → 飞行中的源管最上层 → 描边
    const order: number[] = [];
    for (let i = 0; i < this.positions.length; i++) if (!anim || i !== anim.from) order.push(i);

    if (!anim) {
      for (const i of order) {
        this.drawGlass(i, s, null, 0);
        this.drawLiquid(s, i, fills[i], 0, null, null);
        this.drawOutline(i, s, null, 0);
      }
      return;
    }

    const { dir, srcPos } = this.hoverPos(anim, p);
    const tilt = tiltAt(p, dir);
    const q = transferAt(p);
    fills[anim.from] = Math.max(0, s.tubes[anim.from].length - q * anim.count);
    fills[anim.to] = s.tubes[anim.to].length + q * anim.count;

    for (const i of order) {
      this.drawGlass(i, s, null, 0);
      this.drawLiquid(s, i, fills[i], 0, anim, null);
    }
    if (q > 0.02 && q < 0.98) this.drawStream(s, anim, tilt, srcPos);
    this.drawGlass(anim.from, s, srcPos, tilt);
    this.drawLiquid(s, anim.from, fills[anim.from], tilt, anim, srcPos);
    for (const i of order) this.drawOutline(i, s, null, 0);
    this.drawOutline(anim.from, s, srcPos, tilt);
  }

  /**
   * 源管动画位置：home → 悬停(目标口正上方 ~30px) → home。
   * 倾斜方向 dir 选择：优先朝目标一侧（管身拖在来路方向）；
   * 若管身（最大倾角的包围盒）会出画布则翻转到另一侧，再不行就水平夹紧。
   */
  private hoverPos(anim: AnimState, p: number): { dir: number; srcPos: TubePos } {
    const home = this.positions[anim.from];
    const tp = this.positions[anim.to];
    const hm = home.h / 2 - 3;
    const sinM = Math.sin(MAX_TILT);
    const cosM = Math.abs(Math.cos(MAX_TILT));
    // 倾斜到 MAX_TILT 时：管口相对中心偏移 (dir·hm·sinM, +hm·cosM)（口在中心下前方）
    const mouthOffX = hm * sinM;
    const mouthOffY = hm * cosM;
    // 旋转包围盒半宽/半高（用于出界判断）
    const halfX = (home.h / 2) * sinM + (home.w / 2) * cosM;
    const halfY = (home.h / 2) * cosM + (home.w / 2) * sinM;
    const targetMouthY = tp.y - tp.h / 2 + 4;
    // 管口要落在目标口上方 ~62px（拉长水柱落程，更像"倒出来"）：中心 = 口 − 偏移；高度不得低于包围盒允许值
    const hy = Math.max(targetMouthY - 62 - mouthOffY, halfY + 6);
    const fits = (hx: number) => hx - halfX >= 4 && hx + halfX <= this.width - 4;
    const dir0 = Math.sign(tp.x - home.x) || (tp.x >= this.width / 2 ? -1 : 1);
    let dir = dir0;
    let hx = tp.x - dir * mouthOffX;
    if (!fits(hx)) {
      const flipped = -dir0;
      const hx2 = tp.x - flipped * mouthOffX;
      if (fits(hx2)) {
        dir = flipped;
        hx = hx2;
      } else {
        hx = Math.max(halfX + 4, Math.min(this.width - halfX - 4, hx));
      }
    }
    const hover: TubePos = { x: hx, y: hy, w: home.w, h: home.h };

    let cx: number;
    let cy: number;
    if (p < T_FLY) {
      const k = smooth(p / T_FLY);
      cx = lerp(home.x, hover.x, k);
      cy = lerp(home.y, hover.y, k);
    } else if (p <= T_BACK) {
      cx = hover.x;
      cy = hover.y;
    } else {
      const k = smooth((p - T_BACK) / (1 - T_BACK));
      cx = lerp(hover.x, home.x, k);
      cy = lerp(hover.y, home.y, k);
    }
    return { dir, srcPos: { x: cx, y: cy, w: home.w, h: home.h } };
  }

  /** 管体玻璃底（含投影/选中光晕）；rot = 源管当前倾角，玻璃随杯一起转 */
  private drawGlass(i: number, s: DrawState, override: TubePos | null, rot: number) {
    const { ctx } = this;
    const p = override ?? this.positions[i];
    const sel = !override && s.selected === i;
    ctx.save();
    ctx.translate(p.x, p.y - (override ? 0 : s.lifts[i]));
    ctx.rotate(rot);
    ctx.beginPath();
    roundedTubePath(ctx, -p.w / 2, -p.h / 2, p.w, p.h, 6, 6, p.w / 2, p.w / 2);
    ctx.fillStyle = 'rgba(255,255,255,0.07)';
    ctx.shadowColor = sel ? 'rgba(168,85,247,0.45)' : 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = sel ? 18 : 10;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.restore();
  }

  /**
   * 液体：clip 内腔 → 旋回竖直坐标系 → 画水平水带。
   * 水层从「旋转后内腔最低角」向上按层高排布，液面恒水平；
   * 倒水中源管 fill 递减 / 目标管 fill 递增，目标管超出的层用转移色。
   */
  private drawLiquid(
    s: DrawState,
    i: number,
    fill: number,
    tilt: number,
    anim: AnimState | null,
    override: TubePos | null,
  ) {
    if (fill <= 0.001) return;
    const { ctx } = this;
    const p = override ?? this.positions[i];
    const cw = p.w / 2 - 4;
    const chh = p.h / 2 - 5;
    const r = anim?.from === i ? tilt : 0;
    const sin = Math.sin(r);
    const cos = Math.cos(r);
    const corners = [
      [-cw, -chh],
      [cw, -chh],
      [cw, chh],
      [-cw, chh],
    ];
    const lowest = Math.max(...corners.map(([xc, yc]) => xc * sin + yc * cos));
    const lh = (2 * chh) / CAPACITY;
    const x1 = -(p.h / 2 + p.w / 2);
    const x2 = -x1;

    ctx.save();
    ctx.translate(p.x, p.y - (override ? 0 : s.lifts[i]));
    ctx.rotate(r);
    ctx.beginPath();
    roundedTubePath(ctx, -cw, -chh, cw * 2, chh * 2, 4, 4, cw, cw);
    ctx.clip();
    ctx.rotate(-r);

    const full = Math.floor(fill + 1e-6);
    const band = (yTop: number, yBot: number, cIdx: number) => {
      ctx.fillStyle = COLORS[cIdx - 1];
      ctx.fillRect(x1, yTop, x2 - x1, yBot - yTop);
    };
    for (let k = 0; k < full; k++) {
      band(lowest - (k + 1) * lh, lowest - k * lh, this.layerColor(s, i, k, anim));
    }
    if (fill > full + 1e-6) {
      band(lowest - fill * lh, lowest - full * lh, this.layerColor(s, i, full, anim));
    }

    if (s.showNums) {
      ctx.fillStyle = 'rgba(15,15,30,0.6)';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let k = 0; k < full; k++) {
        ctx.fillText(String(this.layerColor(s, i, k, anim)), 0, lowest - (k + 0.5) * lh);
      }
      if (fill > full + 1e-6) {
        ctx.fillText(String(this.layerColor(s, i, full, anim)), 0, lowest - ((fill + full) / 2) * lh);
      }
    }
    ctx.restore();
  }

  /** 层色：目标管超出已提交层数的部分 = 正在倒入的颜色 */
  private layerColor(s: DrawState, i: number, k: number, anim: AnimState | null): number {
    if (anim && anim.to === i && k >= s.tubes[i].length) return anim.color;
    return s.tubes[i][k];
  }

  /** 水柱：悬停中的源管口 → 目标管口。锥形（上粗下细）+ 高光 + 落点水花，倾泻感 */
  private drawStream(s: DrawState, anim: AnimState, tilt: number, srcPos: TubePos | null) {
    const { ctx } = this;
    const sp = srcPos ?? this.positions[anim.from];
    const tp = this.positions[anim.to];
    const hm = sp.h / 2 - 3;
    const sx = sp.x + hm * Math.sin(tilt);
    const sy = sp.y - hm * Math.cos(tilt);
    const tx = tp.x;
    const ty = tp.y - s.lifts[anim.to] - tp.h / 2 + 4;
    const wTop = Math.max(8, sp.w * 0.24); // 管口处最粗
    const wBot = wTop * 0.42; // 下坠收细
    // 控制点偏近管口、沿倾倒方向带出 —— 切向流出再受重力弯落
    const cx = sx + (tx - sx) * 0.25;
    const cy = sy + (ty - sy) * 0.3;
    const midY = (sy + ty) / 2;
    ctx.save();
    ctx.globalAlpha = 0.92;
    // 锥形水柱主体：左右两条二次曲线围合
    ctx.fillStyle = COLORS[anim.color - 1];
    ctx.beginPath();
    ctx.moveTo(sx - wTop / 2, sy);
    ctx.quadraticCurveTo(cx - wBot / 2 - (wTop - wBot) * 0.22, midY, tx - wBot / 2, ty);
    ctx.lineTo(tx + wBot / 2, ty);
    ctx.quadraticCurveTo(cx + wBot / 2 + (wTop - wBot) * 0.22, midY, sx + wTop / 2, sy);
    ctx.closePath();
    ctx.fill();
    // 中心高光：细亮线沿水柱中线，营造水流质感
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = Math.max(1.4, wBot * 0.32);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.quadraticCurveTo(cx, cy, tx, ty);
    ctx.stroke();
    // 落点水花：两枚小水珠循环弹起（纯渲染层动画，随 rAF 逐帧推进）
    const now = performance.now() / 1000;
    const r = Math.max(1.8, wBot * 0.3);
    ctx.fillStyle = COLORS[anim.color - 1];
    for (let k = 0; k < 2; k++) {
      const f = (now * 1.5 + k * 0.5) % 1; // 0..1 循环
      const dir = k === 0 ? -1 : 1;
      const dx = dir * (5 + 11 * f);
      const dy = -11 * Math.sin(Math.PI * f); // 上抛后回落
      ctx.globalAlpha = 0.85 * (1 - f * 0.6);
      ctx.beginPath();
      ctx.arc(tx + dx, ty + dy, r * (1 - f * 0.35), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** 管口描边（选中高亮）；rot = 当前倾角，杯框随杯一起转 */
  private drawOutline(i: number, s: DrawState, override: TubePos | null, rot: number) {
    const { ctx } = this;
    const p = override ?? this.positions[i];
    const sel = !override && s.selected === i;
    ctx.save();
    ctx.translate(p.x, p.y - (override ? 0 : s.lifts[i]));
    ctx.rotate(rot);
    ctx.beginPath();
    roundedTubePath(ctx, -p.w / 2, -p.h / 2, p.w, p.h, 6, 6, p.w / 2, p.w / 2);
    ctx.strokeStyle = sel ? '#a855f7' : 'rgba(255,255,255,0.32)';
    ctx.lineWidth = sel ? 3.2 : Math.max(2.2, p.w * 0.042);
    ctx.stroke();
    ctx.restore();
  }
}
