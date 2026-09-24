// 色彩排列（Water Sort / 水排序）— 关卡生成与求解器
// 规则：试管容量 4 层；只有当目标管为空、或目标管顶层颜色与源管顶层相同时才能倒；
// 倒水量 = min(源管顶层连续同色块, 目标管剩余空间)；每根管同色满管（或空管）即「归位」，
// 全部颜色归位即过关。

export type LevelConfig = { colors: number; empty: number; tubes: number; scramble: number; par: number };

export type Move = { from: number; to: number; count: number };
export type Tubes = number[][]; // 每根管 bottom -> top，存颜色 id（1 起）

export const CAPACITY = 4;
export const LEVEL_COUNT = 137;
export const MAX_COLORS = 12;

/** 12 种高区分度颜色（深色背景友好） */
export const COLORS: string[] = [
  '#ef4444', // 1 红
  '#f97316', // 2 橙
  '#facc15', // 3 黄
  '#4ade80', // 4 绿
  '#14b8a6', // 5 青
  '#38bdf8', // 6 天蓝
  '#3b82f6', // 7 蓝
  '#8b5cf6', // 8 紫
  '#d946ef', // 9 品红
  '#ec4899', // 10 粉
  '#a3e635', // 11 青柠
  '#94a3b8', // 12 银灰
];

/** 难度曲线：第 1-6 关 4 色，之后每 6 关 +1 色，封顶 12 色；永给 2 根空管 */
export function levelConfig(n: number): LevelConfig {
  const colors = Math.min(4 + Math.floor((n - 1) / 6), MAX_COLORS);
  const empty = 2;
  const tubes = colors + empty;
  // 反倒水混合步数：碎块要够多才有解谜感
  const scramble = Math.min(12 + colors * 2, 38);
  return { colors, empty, tubes, scramble, par: scramble };
}

/** 可复现的伪随机（mulberry32） */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function topBlock(t: number[]): number {
  if (!t.length) return 0;
  const c = t[t.length - 1];
  let n = 0;
  for (let i = t.length - 1; i >= 0 && t[i] === c; i--) n++;
  return n;
}

export function canPour(t: Tubes, from: number, to: number): boolean {
  if (from === to) return false;
  const A = t[from];
  const B = t[to];
  if (!A.length || B.length >= CAPACITY) return false;
  return !B.length || B[B.length - 1] === A[A.length - 1];
}

/** 就地执行一次合法倾倒（返回是否成功） */
export function applyPour(t: Tubes, from: number, to: number): number {
  if (!canPour(t, from, to)) return 0;
  const amt = Math.min(topBlock(t[from]), CAPACITY - t[to].length);
  for (let i = 0; i < amt; i++) t[to].push(t[from].pop()!);
  return amt;
}

export function cloneTubes(t: Tubes): Tubes {
  return t.map((x) => x.slice());
}

/** 过关判定：每根管要么空、要么同色满管 */
export function isSolved(t: Tubes): boolean {
  return t.every((x) => x.length === 0 || (x.length === CAPACITY && x.every((c) => c === x[0])));
}

/** 已归位颜色数 */
export function settledCount(t: Tubes): number {
  return t.filter((x) => x.length === CAPACITY && x.every((c) => c === x[0])).length;
}

function stateKey(t: Tubes): string {
  return t
    .map((x) => x.join(','))
    .sort()
    .join('|');
}

/** 启发式排序的合法走法（剪掉「整管同色倒入空管」这类无意义步骤） */
function orderedMoves(t: Tubes): Move[] {
  const out: { mv: Move; score: number }[] = [];
  for (let a = 0; a < t.length; a++) {
    const A = t[a];
    if (!A.length) continue;
    const block = topBlock(A);
    const uniform = block === A.length;
    for (let b = 0; b < t.length; b++) {
      if (!canPour(t, a, b)) continue;
      const B = t[b];
      const space = CAPACITY - B.length;
      const amt = Math.min(block, space);
      let score = 0;
      if (B.length) score += 2; // 同色合并
      if (B.length + amt === CAPACITY && B.every((c) => c === B[0])) score += 3; // 直接归位
      if (A.length - amt === 0) score += 1; // 腾空管子
      if (!B.length && uniform && block === CAPACITY) continue; // 同色满管挪空管 = 无意义
      if (!B.length && uniform) score -= 4; // 整管同色倒空管，尽量少做
      out.push({ mv: { from: a, to: b, count: amt }, score });
    }
  }
  out.sort((x, y) => y.score - x.score);
  return out.map((x) => x.mv);
}

/**
 * DFS 求解（状态去重 + 节点预算）。返回走法序列（从 start 出发），无解/超预算返回 null。
 */
export function solveTubes(start: Tubes, budget = 60000): Move[] | null {
  const visited = new Set<string>([stateKey(start)]);
  const path: Move[] = [];
  let nodes = 0;

  const dfs = (t: Tubes): boolean => {
    if (isSolved(t)) return true;
    if (nodes++ >= budget) return false;
    for (const mv of orderedMoves(t)) {
      const nt = cloneTubes(t);
      applyPour(nt, mv.from, mv.to);
      const k = stateKey(nt);
      if (visited.has(k)) continue;
      visited.add(k);
      path.push(mv);
      if (dfs(nt)) return true;
      path.pop();
    }
    return false;
  };

  return dfs(cloneTubes(start)) ? path.slice() : null;
}

/**
 * 反倒水打乱（anti-pour）：从已解状态逆向构造混合局面。
 * 两条硬约束保证「每一步的逆操作都是一次合法游戏倒水」，从而构造出的局面**必然可解**：
 *   约束1：只能倒在空管、或顶层颜色 ≠ 该色的管上（保证目标管顶层连续块恰好 = k）；
 *   约束2：k < 源管顶层块，或 k = 块且源管恰好搬空（保证源管倒完后顶层仍为该色或为空）。
 * 逆放整条 anti 序列即得本关标准解法。
 */
function scrambleFromSolved(cfg: LevelConfig, rng: () => number): { tubes: Tubes; moves: Move[] } {
  const t: Tubes = [];
  for (let c = 1; c <= cfg.colors; c++) t.push([c, c, c, c]);
  for (let e = 0; e < cfg.empty; e++) t.push([]);
  const moves: Move[] = [];
  let guard = 0;

  while (moves.length < cfg.scramble && guard++ < cfg.scramble * 40) {
    const cands: { a: number; b: number; k: number }[] = [];
    for (let a = 0; a < t.length; a++) {
      const A = t[a];
      if (!A.length) continue;
      const c = A[A.length - 1];
      const block = topBlock(A);
      for (let b = 0; b < t.length; b++) {
        if (a === b) continue;
        const B = t[b];
        const space = CAPACITY - B.length;
        if (space === 0) continue;
        if (B.length && B[B.length - 1] === c) continue; // 约束1
        const maxK = Math.min(block, space);
        for (let k = 1; k <= maxK; k++) {
          if (k === block && A.length > block) continue; // 约束2
          // 整根纯管原样搬去空管 = 无意义（除非真的没别的选择），降权
          cands.push({ a, b, k });
        }
      }
    }
    if (!cands.length) break;
    // 轻微偏好小 k（碎块混合更充分），随机取
    const m = cands[Math.floor(rng() * cands.length)];
    for (let i = 0; i < m.k; i++) t[m.b].push(t[m.a].pop()!);
    moves.push({ from: m.a, to: m.b, count: m.k });
  }
  return { tubes: t, moves };
}

export type GenResult = { tubes: Tubes; par: number; solution: Move[] };

/**
 * 生成第 n 关：反向打乱（构造即保证可解）。若意外打回已解状态则换 seed 重试。
 * 关卡由种子决定，每次进入同一关棋面一致；solution 为该关标准解法。
 */
export function generateLevel(n: number): GenResult {
  const cfg = levelConfig(n);
  for (let attempt = 0; attempt < 8; attempt++) {
    const rng = mulberry32(n * 7919 + attempt * 104729 + 17);
    const { tubes, moves } = scrambleFromSolved(cfg, rng);
    if (isSolved(tubes) || !moves.length) continue; // 打了个寂寞，重试
    // 标准解法 = 反倒水序列的逆放
    const solution: Move[] = moves
      .slice()
      .reverse()
      .map((m) => ({ from: m.to, to: m.from, count: m.count }));
    return { tubes, par: moves.length, solution };
  }
  // 理论上到不了这里；兜底返回已解相邻的可解局面
  const rng = mulberry32(n * 31 + 7);
  const { tubes, moves } = scrambleFromSolved({ ...cfg, scramble: 6 }, rng);
  const solution: Move[] = moves
    .slice()
    .reverse()
    .map((m) => ({ from: m.to, to: m.from, count: m.count }));
  return { tubes, par: Math.max(6, moves.length), solution };
}
