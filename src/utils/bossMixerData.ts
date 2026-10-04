// Boss 混音战 — Boss 定义与目标声纹数学
// 每个 Boss = 一串「招式」（moves）：每招持续若干拍，声明 4 频段目标电平
// + 调制方式（pulse 按拍冲脉 / wave 流动 / flat 静持）。
// targetAt(boss, beat) 纯函数：任意拍位 → 当前 4 频段目标电平。

export type Mod = 'pulse' | 'wave' | 'flat';
export type Move = { dur: number; levels: [number, number, number, number]; mod: Mod };

export type BossDef = {
  id: string;
  name: string;
  en: string;
  icon: string;
  color: string;
  bpm: number;
  hp: number; // Boss 血量
  dps: number; // 玩家最大承伤速率（match=0 时）
  intro: string;
  moves: Move[];
};

export const PLAYER_DPS = 3.0; // 玩家输出速率（match=1 时），实际 × match^1.5
export const MATCH_GRACE = 0.55; // match 高于此值玩家不掉血

export const BOSSES: BossDef[] = [
  {
    id: 'sub-monster',
    name: '低频兽',
    en: 'SUB MONSTER',
    icon: '👾',
    color: '#a855f7',
    bpm: 92,
    hp: 100,
    dps: 1.6,
    intro: '只会低音轰鸣的入门 Boss。跟着它的拍子推起 Sub，它换招你就换招。',
    moves: [
      { dur: 8, levels: [0.95, 0, 0, 0], mod: 'pulse' },
      { dur: 8, levels: [0.85, 0.55, 0, 0], mod: 'pulse' },
      { dur: 8, levels: [0.7, 0, 0.35, 0], mod: 'wave' },
      { dur: 8, levels: [0, 0.65, 0.3, 0], mod: 'pulse' },
    ],
  },
  {
    id: 'phantom',
    name: '频率幽灵',
    en: 'PHANTOM',
    icon: '👻',
    color: '#22d3ee',
    bpm: 108,
    hp: 130,
    dps: 2.2,
    intro: '声纹在频段间瞬移，招式只有 4 拍。手要快，推子要跟得住它的鬼影。',
    moves: [
      { dur: 4, levels: [0.9, 0, 0, 0], mod: 'pulse' },
      { dur: 4, levels: [0, 0.9, 0, 0], mod: 'pulse' },
      { dur: 4, levels: [0, 0, 0.9, 0], mod: 'wave' },
      { dur: 4, levels: [0.5, 0, 0, 0.6], mod: 'pulse' },
      { dur: 4, levels: [0, 0.45, 0.85, 0], mod: 'wave' },
      { dur: 4, levels: [0.8, 0.5, 0, 0.4], mod: 'pulse' },
    ],
  },
  {
    id: 'noise-lord',
    name: '噪声领主',
    en: 'NOISE LORD',
    icon: '💀',
    color: '#ec4899',
    bpm: 126,
    hp: 160,
    dps: 2.8,
    intro: '终极 Boss：全频段压制 + 静音领域（目标归零时把推子全部拉到底！）+ 高频碎拍。',
    moves: [
      { dur: 4, levels: [0.9, 0.5, 0, 0], mod: 'pulse' },
      { dur: 4, levels: [0, 0.5, 0.9, 0.45], mod: 'pulse' },
      { dur: 2, levels: [0, 0, 0, 0], mod: 'flat' },
      { dur: 4, levels: [0.55, 0, 0.9, 0.75], mod: 'wave' },
      { dur: 2, levels: [0, 0, 0, 0], mod: 'flat' },
      { dur: 4, levels: [0.95, 0.75, 0.55, 0.35], mod: 'pulse' },
      { dur: 4, levels: [0, 0.9, 0, 0.9], mod: 'wave' },
    ],
  },
];

/** 整个招式循环的拍数 */
export function loopBeats(boss: BossDef): number {
  return boss.moves.reduce((s, m) => s + m.dur, 0);
}

/** 拍位 → 当前目标电平（纯函数）。beat 可为小数，超出循环取模 */
export function targetAt(boss: BossDef, beat: number): [number, number, number, number] {
  const b = ((beat % loopBeats(boss)) + loopBeats(boss)) % loopBeats(boss);
  let acc = 0;
  for (const m of boss.moves) {
    if (b < acc + m.dur) {
      const beatFrac = (b - acc) % 1;
      let k = 1;
      if (m.mod === 'pulse') k = 0.3 + 0.7 * (1 - beatFrac);
      else if (m.mod === 'wave') k = 0.55 + 0.45 * Math.sin(2 * Math.PI * beatFrac);
      return [
        m.levels[0] * k,
        m.levels[1] * k,
        m.levels[2] * k,
        m.levels[3] * k,
      ];
    }
    acc += m.dur;
  }
  return [0, 0, 0, 0];
}

/** 当前招式序号（用于提示 Boss 在干嘛） */
export function moveIndexAt(boss: BossDef, beat: number): number {
  const b = ((beat % loopBeats(boss)) + loopBeats(boss)) % loopBeats(boss);
  let acc = 0;
  for (let i = 0; i < boss.moves.length; i++) {
    if (b < acc + boss.moves[i].dur) return i;
    acc += boss.moves[i].dur;
  }
  return 0;
}

/** 匹配度 0..1：4 频段平均偏差 → 1.6 倍惩罚系数 */
export function matchRate(player: number[], target: number[]): number {
  let err = 0;
  for (let i = 0; i < 4; i++) err += Math.abs(player[i] - target[i]);
  return Math.max(0, 1 - (err / 4) * 1.6);
}

export const BM_BEST_KEY = 'bm-best-v1';

export type BmBest = { win: boolean; hpLeft: number; stars: number };

export function loadBmBests(): Record<string, BmBest> {
  try {
    return JSON.parse(localStorage.getItem(BM_BEST_KEY) || '{}') as Record<string, BmBest>;
  } catch {
    return {};
  }
}

export function saveBmBest(key: string, b: BmBest): void {
  try {
    const all = loadBmBests();
    const cur = all[key];
    if (!cur || b.stars > cur.stars || (b.stars === cur.stars && b.hpLeft > cur.hpLeft)) {
      all[key] = b;
      localStorage.setItem(BM_BEST_KEY, JSON.stringify(all));
    }
  } catch {
    /* ignore */
  }
}
