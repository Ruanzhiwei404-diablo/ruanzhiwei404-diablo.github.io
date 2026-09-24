import { useState, useEffect, useRef, useCallback, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { LianliankanSfx } from '../audio/lianliankanSfx';

/* ============================================================
 * 连连看 (Tile Connect / Onet)
 * 玩法：选中两块相同图案，若能用「最多 2 个转弯（≤3 段直线）」的
 * 水平/垂直路径连接（可绕外圈），即可消除。清空全盘即获胜。
 * ============================================================ */

type Pt = { r: number; c: number };

type Theme = {
  id: string;
  name: string;
  icon: string;
  accent: string;
  emojis: string[];
};

// 当前 web 主题：精致萌宠 🐾 + 清雅植物 🌿；本次新增 缤纷水果 🍓
const THEMES: Theme[] = [
  {
    id: 'pets',
    name: '精致萌宠',
    icon: '🐾',
    accent: '#38bdf8',
    emojis: [
      '🐶', '🐱', '🐰', '🐻', '🐼', '🐯', '🐸', '🐵', '🐧', '🐨',
      '🦊', '🐷', '🐮', '🐭', '🐹', '🐔', '🐤', '🐺', '🐗', '🐙',
    ],
  },
  {
    id: 'plants',
    name: '清雅植物',
    icon: '🌿',
    accent: '#4ade80',
    emojis: [
      '🌿', '🌸', '🌻', '🌹', '🌺', '🌷', '🌳', '🌲', '🍀', '🌵',
      '🌴', '🍃', '🌱', '💐', '🍄', '🌾', '🎋', '🪷', '🌼', '🍁',
    ],
  },
  {
    id: 'fruits',
    name: '缤纷水果',
    icon: '🍓',
    accent: '#fb7185',
    emojis: [
      '🍎', '🍊', '🍋', '🍉', '🍇', '🍓', '🍑', '🍒', '🍌', '🥝',
      '🍍', '🥥', '🍐', '🍈', '🫐', '🥭', '🍅', '🍆', '🥑', '🌽',
    ],
  },
];

type Level = { id: string; name: string; rows: number; cols: number; time: number; num: number };

const LEVELS: Level[] = [
  { id: 'beginner', name: '新手', rows: 4, cols: 6, time: 120, num: 1 },
  { id: 'advanced', name: '进阶', rows: 6, cols: 8, time: 200, num: 2 },
  { id: 'master', name: '高手', rows: 6, cols: 10, time: 260, num: 3 },
  { id: 'zen', name: '禅意', rows: 8, cols: 12, time: 360, num: 4 },
];

const GRAD = 'linear-gradient(135deg, #a855f7, #ec4899)';
const GRAD_SOFT = 'linear-gradient(90deg, #a855f7, transparent)';

/* ---------------- 连连看核心算法 ---------------- */

// 在「带 1 圈空边框」的 padded 网格上判断：b[r][c] === 0 视为可通行
function isEmpty(b: number[][], rows: number, cols: number, r: number, c: number): boolean {
  if (r < 0 || c < 0 || r > rows + 1 || c > cols + 1) return false;
  return b[r][c] === 0;
}

// 两点同行或同列，且中间格全部为空
function lineClear(b: number[][], rows: number, cols: number, p1: Pt, p2: Pt): boolean {
  if (p1.r === p2.r) {
    const r = p1.r;
    const lo = Math.min(p1.c, p2.c);
    const hi = Math.max(p1.c, p2.c);
    for (let c = lo + 1; c < hi; c++) if (!isEmpty(b, rows, cols, r, c)) return false;
    return true;
  }
  if (p1.c === p2.c) {
    const c = p1.c;
    const lo = Math.min(p1.r, p2.r);
    const hi = Math.max(p1.r, p2.r);
    for (let r = lo + 1; r < hi; r++) if (!isEmpty(b, rows, cols, r, c)) return false;
    return true;
  }
  return false;
}

// 返回连接路径（padded 坐标点序列），无路可连返回 null。最多 2 个转弯（≤3 段直线）。
function findPath(b: number[][], rows: number, cols: number, a: Pt, bb: Pt): Pt[] | null {
  // 0 转弯：直线相连
  if ((a.r === bb.r || a.c === bb.c) && lineClear(b, rows, cols, a, bb)) return [a, bb];
  // 1 转弯：两个 L 形拐点
  const corners1: Pt[] = [
    { r: a.r, c: bb.c },
    { r: bb.r, c: a.c },
  ];
  for (const k of corners1) {
    if (isEmpty(b, rows, cols, k.r, k.c) && lineClear(b, rows, cols, a, k) && lineClear(b, rows, cols, k, bb)) {
      return [a, k, bb];
    }
  }
  // 2 转弯：横向扫描拐点行
  for (let r = 0; r <= rows + 1; r++) {
    const k1 = { r, c: a.c };
    const k2 = { r, c: bb.c };
    if (
      isEmpty(b, rows, cols, k1.r, k1.c) &&
      isEmpty(b, rows, cols, k2.r, k2.c) &&
      lineClear(b, rows, cols, a, k1) &&
      lineClear(b, rows, cols, k1, k2) &&
      lineClear(b, rows, cols, k2, bb)
    ) {
      return [a, k1, k2, bb];
    }
  }
  // 2 转弯：纵向扫描拐点列
  for (let c = 0; c <= cols + 1; c++) {
    const k1 = { r: a.r, c };
    const k2 = { r: bb.r, c };
    if (
      isEmpty(b, rows, cols, k1.r, k1.c) &&
      isEmpty(b, rows, cols, k2.r, k2.c) &&
      lineClear(b, rows, cols, a, k1) &&
      lineClear(b, rows, cols, k1, k2) &&
      lineClear(b, rows, cols, k2, bb)
    ) {
      return [a, k1, k2, bb];
    }
  }
  return null;
}

// 生成棋盘：用主题图库循环成对的图案填满偶数格
function buildBoard(rows: number, cols: number, pool: string[]): number[][] {
  const total = rows * cols;
  const pairs = total / 2;
  const tiles: number[] = [];
  for (let i = 0; i < pairs; i++) {
    const t = (i % pool.length) + 1; // 图案 id 从 1 开始
    tiles.push(t, t);
  }
  for (let i = tiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  const b: number[][] = Array.from({ length: rows + 2 }, () => new Array<number>(cols + 2).fill(0));
  let k = 0;
  for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++) b[r][c] = tiles[k++];
  return b;
}

function countTiles(b: number[][], rows: number, cols: number): number {
  let n = 0;
  for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++) if (b[r][c] !== 0) n++;
  return n;
}

// 找出任意一对可消除的相同图案
function findAnyPair(b: number[][], rows: number, cols: number): [Pt, Pt] | null {
  const cells: Pt[] = [];
  for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++) if (b[r][c] !== 0) cells.push({ r, c });
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      if (b[cells[i].r][cells[i].c] === b[cells[j].r][cells[j].c]) {
        if (findPath(b, rows, cols, cells[i], cells[j])) return [cells[i], cells[j]];
      }
    }
  }
  return null;
}

// 洗牌：保持已占据格位置，重排图案
function shuffleBoard(b: number[][], rows: number, cols: number): number[][] {
  const cells: Pt[] = [];
  const vals: number[] = [];
  for (let r = 1; r <= rows; r++) for (let c = 1; c <= cols; c++) if (b[r][c] !== 0) {
    cells.push({ r, c });
    vals.push(b[r][c]);
  }
  for (let i = vals.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [vals[i], vals[j]] = [vals[j], vals[i]];
  }
  const nb = b.map((row) => row.slice());
  cells.forEach((cell, idx) => {
    nb[cell.r][cell.c] = vals[idx];
  });
  return nb;
}

function bestKey(themeId: string, levelId: string) {
  return `llk-best-${themeId}-${levelId}`;
}

/* ---------------- 组件 ---------------- */

type Phase = 'menu' | 'playing' | 'win' | 'lose';

export default function LianliankanPage() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [menuThemeId, setMenuThemeId] = useState('pets');
  const [menuLevelId, setMenuLevelId] = useState('beginner');

  const [theme, setTheme] = useState<Theme>(THEMES[0]);
  const [level, setLevel] = useState<Level>(LEVELS[0]);
  const [rows, setRows] = useState(LEVELS[0].rows);
  const [cols, setCols] = useState(LEVELS[0].cols);

  const [board, setBoard] = useState<number[][]>([]);
  const [sel, setSel] = useState<Pt | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [hints, setHints] = useState(5);
  const [shuffles, setShuffles] = useState(3);
  const [hintCells, setHintCells] = useState<[Pt, Pt] | null>(null);
  const [lastPath, setLastPath] = useState<{ pts: Pt[]; key: number } | null>(null);
  const [finalBonus, setFinalBonus] = useState(0);
  const [autoShuffled, setAutoShuffled] = useState(false);
  const [muted, setMuted] = useState(false);

  const comboRef = useRef(0);
  const lastMatchRef = useRef(0);
  const sfx = useRef(new LianliankanSfx());

  const boardRef = useRef<HTMLDivElement>(null);

  /* 计时 */
  useEffect(() => {
    if (phase !== 'playing') return;
    const t = window.setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      sfx.current.lose();
      setPhase('lose');
    }
  }, [timeLeft, phase]);

  const bestScore = (() => {
    try {
      return Number(localStorage.getItem(bestKey(menuThemeId, menuLevelId)) || 0);
    } catch {
      return 0;
    }
  })();

  const startGame = useCallback((th: Theme, lv: Level) => {
    const b = buildBoard(lv.rows, lv.cols, th.emojis);
    sfx.current.enabled = !muted;
    sfx.current.ensure();
    sfx.current.resume();
    setTheme(th);
    setLevel(lv);
    setRows(lv.rows);
    setCols(lv.cols);
    setBoard(b);
    setSel(null);
    setScore(0);
    setCombo(0);
    comboRef.current = 0;
    lastMatchRef.current = 0;
    setHints(5);
    setShuffles(3);
    setTimeLeft(lv.time);
    setHintCells(null);
    setLastPath(null);
    setFinalBonus(0);
    setAutoShuffled(false);
    setPhase('playing');
  }, [muted]);

  const handleTileClick = useCallback(
    (r: number, c: number) => {
      if (phase !== 'playing') return;
      if (!board[r] || board[r][c] === 0) return;

      if (!sel) {
        setSel({ r, c });
        sfx.current.select();
        return;
      }
      if (sel.r === r && sel.c === c) {
        setSel(null);
        return;
      }
      // 图案不同 → 改选新砖
      if (board[sel.r][sel.c] !== board[r][c]) {
        setSel({ r, c });
        sfx.current.select();
        return;
      }
      const path = findPath(board, rows, cols, sel, { r, c });
      if (!path) {
        sfx.current.invalid();
        setSel({ r, c });
        return;
      }

      // —— 成功消除 ——
      const nb = board.map((row) => row.slice());
      nb[sel.r][sel.c] = 0;
      nb[r][c] = 0;

      const now = Date.now();
      const newCombo = now - lastMatchRef.current <= 3000 ? comboRef.current + 1 : 1;
      const bonus = Math.max(0, newCombo - 1) * 5;
      comboRef.current = newCombo;
      lastMatchRef.current = now;
      setCombo(newCombo);
      sfx.current.match(newCombo);

      const gained = 10 + bonus;
      const curScore = score;
      const afterScore = curScore + gained;
      setScore(afterScore);

      const pathKey = now;
      setLastPath({ pts: path, key: pathKey });
      window.setTimeout(() => {
        setLastPath((cur) => (cur && cur.key === pathKey ? null : cur));
      }, 430);

      setSel(null);
      setBoard(nb); // 立即写回棋盘，确保最后消除的一对也能从画面消失

      const remaining = countTiles(nb, rows, cols);
      if (remaining === 0) {
        const winBonus = hints * 50 + shuffles * 50 + timeLeft * 10 + level.num * 100;
        const total = afterScore + winBonus;
        setFinalBonus(winBonus);
        setScore(total);
        try {
          const key = bestKey(theme.id, level.id);
          const prevBest = Number(localStorage.getItem(key) || 0);
          if (total > prevBest) localStorage.setItem(key, String(total));
        } catch {
          /* ignore */
        }
        sfx.current.win();
        setPhase('win');
        return;
      }

      // 死局检测：无可消对子则自动洗牌
      let working = nb;
      if (!findAnyPair(working, rows, cols)) {
        let tries = 0;
        do {
          working = shuffleBoard(working, rows, cols);
          tries++;
        } while (!findAnyPair(working, rows, cols) && tries < 30);
        if (!findAnyPair(working, rows, cols)) {
          setBoard(working);
          sfx.current.lose();
          setPhase('lose');
          return;
        }
        setAutoShuffled(true);
        window.setTimeout(() => setAutoShuffled(false), 1700);
      }
      setBoard(working);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phase, board, sel, rows, cols, score, hints, shuffles, timeLeft, theme, level],
  );

  const doHint = useCallback(() => {
    if (phase !== 'playing' || hints <= 0) return;
    const pair = findAnyPair(board, rows, cols);
    if (!pair) return;
    setHintCells(pair);
    setHints((h) => h - 1);
    window.setTimeout(() => setHintCells(null), 1500);
  }, [phase, hints, board, rows, cols]);

  const doShuffle = useCallback(() => {
    if (phase !== 'playing' || shuffles <= 0) return;
    let nb = board;
    let tries = 0;
    do {
      nb = shuffleBoard(nb, rows, cols);
      tries++;
    } while (!findAnyPair(nb, rows, cols) && tries < 30);
    setBoard(nb);
    setShuffles((s) => s - 1);
    setSel(null);
    setHintCells(null);
  }, [phase, shuffles, board, rows, cols]);

  const toMenu = () => {
    setPhase('menu');
    setBoard([]);
    setSel(null);
  };

  /* 渲染 */
  const renderTile = (r: number, c: number) => {
    const v = board[r][c];
    const selected = sel?.r === r && sel?.c === c;
    const hinted = hintCells
      ? (hintCells[0].r === r && hintCells[0].c === c) || (hintCells[1].r === r && hintCells[1].c === c)
      : false;
    if (v === 0) {
      return <div key={`${r}-${c}`} className="aspect-square" />;
    }
    const style: CSSProperties = {
      background: 'linear-gradient(160deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
      border: '1px solid rgba(255,255,255,0.10)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.30)',
    };
    if (selected) {
      style.border = `2px solid ${theme.accent}`;
      style.boxShadow = `0 0 0 3px ${theme.accent}55, 0 4px 16px ${theme.accent}66`;
      style.transform = 'scale(1.07)';
    } else if (hinted) {
      style.border = `2px solid ${theme.accent}`;
      style.boxShadow = `0 0 16px ${theme.accent}aa`;
      style.animation = 'pulse 0.9s ease-in-out infinite';
    }
    return (
      <button
        key={`${r}-${c}`}
        onClick={() => handleTileClick(r, c)}
        className="aspect-square rounded-xl flex items-center justify-center text-2xl sm:text-3xl select-none transition-all duration-150"
        style={style}
      >
        {theme.emojis[v - 1]}
      </button>
    );
  };

  return (
    <div className="max-w-[860px] mx-auto py-8 px-6 w-full">
      {/* 头部 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5 flex items-center justify-center gap-2">
          <span>🔗</span> 连连看
        </h1>
        <p className="text-[13.5px] text-gray-500">
          萌宠 · 植物 · 水果三套主题 · 最多两个转弯即可消除
        </p>
      </div>

      {/* 菜单 */}
      {phase === 'menu' && (
        <>
          {/* 规则 */}
          <div className="card p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: GRAD_SOFT }} />
            <h2 className="text-base font-bold text-text-bright mb-2 flex items-center gap-2">
              <span>📖</span> 游戏玩法
            </h2>
            <ul className="space-y-2 text-[13px] text-gray-400">
              <li>· <span className="text-gray-200 font-semibold">消除</span>：点击两块相同图案，若能用「最多 2 个转弯（≤3 段直线）」的水平/垂直路径连接（可绕外圈），即可消除。</li>
              <li>· <span className="text-gray-200 font-semibold">胜利</span>：清空全盘即过关，剩余时间、未用道具都会计入奖励分。</li>
              <li>· <span className="text-gray-200 font-semibold">道具</span>：💡提示（高亮一对可消图案）、🔀洗牌（重排剩余图案）；死局会自动洗牌。</li>
              <li>· <span className="text-gray-200 font-semibold">计分</span>：每对 +10 分，3 秒内连消触发连击加成，过关另有奖励分。</li>
            </ul>
          </div>

          {/* 主题选择 */}
          <div className="card p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: GRAD_SOFT }} />
            <div className="text-sm font-semibold text-gray-300 mb-4">🎨 选择主题</div>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((th) => {
                const active = menuThemeId === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => setMenuThemeId(th.id)}
                    className="rounded-xl p-4 flex flex-col items-center gap-2 transition-all border"
                    style={{
                      background: active ? `${th.accent}1f` : 'rgba(255,255,255,0.03)',
                      borderColor: active ? th.accent : 'rgba(255,255,255,0.10)',
                      boxShadow: active ? `0 0 0 2px ${th.accent}55` : 'none',
                    }}
                  >
                    <div className="text-3xl">{th.icon}</div>
                    <div className="text-sm font-bold" style={{ color: active ? th.accent : '#e2e8f0' }}>
                      {th.name}
                    </div>
                    <div className="text-lg leading-none tracking-tight">
                      {th.emojis.slice(0, 4).join(' ')}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 难度选择 */}
          <div className="card p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: GRAD_SOFT }} />
            <div className="text-sm font-semibold text-gray-300 mb-4">🎯 选择难度</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {LEVELS.map((lv) => {
                const active = menuLevelId === lv.id;
                return (
                  <button
                    key={lv.id}
                    onClick={() => setMenuLevelId(lv.id)}
                    className="rounded-xl py-4 px-2 flex flex-col items-center gap-1 transition-all border"
                    style={{
                      background: active ? 'rgba(168,85,247,0.16)' : 'rgba(255,255,255,0.03)',
                      borderColor: active ? '#a855f7' : 'rgba(255,255,255,0.10)',
                    }}
                  >
                    <div className="text-sm font-bold" style={{ color: active ? '#d8b4fe' : '#e2e8f0' }}>
                      {lv.name}
                    </div>
                    <div className="text-xs text-gray-500">{lv.rows}×{lv.cols}</div>
                    <div className="text-[10px] text-gray-600">⏱ {lv.time}s</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-center mb-5 text-xs text-gray-500">
            🏆 当前最佳：<span className="text-[#d8b4fe] font-bold">{bestScore}</span> 分
          </div>

          <button
            onClick={() => {
              const th = THEMES.find((t) => t.id === menuThemeId)!;
              const lv = LEVELS.find((l) => l.id === menuLevelId)!;
              startGame(th, lv);
            }}
            className="w-full rounded-xl py-3.5 font-bold text-white text-base mb-3"
            style={{ background: GRAD }}
          >
            🎮 开始游戏
          </button>
        </>
      )}

      {/* 游戏区 */}
      {phase !== 'menu' && (
        <>
          {/* HUD */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{theme.icon}</span>
              <div>
                <div className="text-sm font-bold text-text-bright leading-none">{theme.name}</div>
                <div className="text-[10px] text-gray-500">{level.name} · {rows}×{cols}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="text-center">
                <div className="text-[10px] text-gray-500">得分</div>
                <div className="font-bold text-text-bright">{score}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500">时间</div>
                <div className="font-bold" style={{ color: timeLeft <= 15 ? '#fb7185' : '#a5f3fc' }}>
                  {timeLeft}s
                </div>
              </div>
              {combo >= 2 && (
                <div className="text-center px-2 py-1 rounded-lg" style={{ background: 'rgba(168,85,247,0.18)' }}>
                  <div className="text-[10px] text-gray-400">连击</div>
                  <div className="font-bold text-[#f0abfc]">×{combo}</div>
                </div>
              )}
            </div>
          </div>

          {/* 棋盘 */}
          <div className="relative mx-auto mb-4" style={{ maxWidth: 720 }}>
            <div
              ref={boardRef}
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
            >
              {board.slice(1, rows + 1).map((row, ri) =>
                row.slice(1, cols + 1).map((_v, ci) => renderTile(ri + 1, ci + 1)),
              )}
            </div>

            {/* 连接线 */}
            {lastPath && (
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ overflow: 'visible' }}
                viewBox={`${-1} ${-1} ${cols + 2} ${rows + 2}`}
                preserveAspectRatio="none"
              >
                <polyline
                  points={lastPath.pts.map((p) => `${p.c - 0.5},${p.r - 0.5}`).join(' ')}
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth={0.42}
                  strokeOpacity={0.35}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={lastPath.pts.map((p) => `${p.c - 0.5},${p.r - 0.5}`).join(' ')}
                  fill="none"
                  stroke={theme.accent}
                  strokeWidth={0.16}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}

            {autoShuffled && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="px-4 py-2 rounded-xl font-bold text-white" style={{ background: 'rgba(168,85,247,0.85)' }}>
                  🔀 无可消除，已自动洗牌
                </div>
              </div>
            )}
          </div>

          {/* 控制 */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={doHint}
              disabled={phase !== 'playing' || hints <= 0}
              className="flex-1 rounded-xl py-3 font-bold text-white disabled:opacity-30 transition-colors"
              style={{ background: GRAD }}
            >
              💡 提示 ({hints})
            </button>
            <button
              onClick={doShuffle}
              disabled={phase !== 'playing' || shuffles <= 0}
              className="flex-1 rounded-xl py-3 font-bold text-white disabled:opacity-30 transition-colors"
              style={{ background: GRAD }}
            >
              🔀 洗牌 ({shuffles})
            </button>
            <button
              onClick={() => setMuted((m) => !m)}
              className="rounded-xl py-3 px-4 font-bold text-gray-300 border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.05)]"
              title="声音开关"
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>

          {/* 胜利 */}
          {phase === 'win' && (
            <div className="card p-7 text-center relative overflow-hidden mb-4">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: GRAD_SOFT }} />
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-extrabold mb-1 gradient-text-subtle">通关！</h2>
              <p className="text-sm text-gray-400 mb-5">主题：{theme.name} · 难度：{level.name}</p>
              <div className="rounded-xl border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.05)] p-5 mb-5 text-left text-sm">
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">消除得分</span>
                  <span className="font-bold text-text-bright">{score - finalBonus}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-400">过关奖励（道具 + 时间 + 难度）</span>
                  <span className="font-bold text-[#a5f3fc]">+{finalBonus}</span>
                </div>
                <div className="flex justify-between py-1 border-t border-[rgba(255,255,255,0.1)] mt-1 pt-2">
                  <span className="text-gray-300 font-semibold">总分</span>
                  <span className="font-extrabold text-[#f0abfc] text-lg">{score}</span>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => startGame(theme, level)}
                  className="rounded-xl px-6 py-3 font-bold text-white"
                  style={{ background: GRAD }}
                >
                  🔄 再来一局
                </button>
                <button
                  onClick={toMenu}
                  className="rounded-xl px-6 py-3 font-bold text-gray-300 border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)]"
                >
                  ⚙️ 换主题 / 难度
                </button>
              </div>
            </div>
          )}

          {/* 失败 */}
          {phase === 'lose' && (
            <div className="card p-7 text-center relative overflow-hidden mb-4">
              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: GRAD_SOFT }} />
              <div className="text-5xl mb-3">⏰</div>
              <h2 className="text-2xl font-extrabold mb-1 text-[#fb7185]">
                {board.length ? '时间到 / 死局' : '游戏结束'}
              </h2>
              <p className="text-sm text-gray-400 mb-5">本次得分 {score} · 主题：{theme.name} · 难度：{level.name}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => startGame(theme, level)}
                  className="rounded-xl px-6 py-3 font-bold text-white"
                  style={{ background: GRAD }}
                >
                  🔄 重新开始
                </button>
                <button
                  onClick={toMenu}
                  className="rounded-xl px-6 py-3 font-bold text-gray-300 border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)]"
                >
                  ⚙️ 返回菜单
                </button>
              </div>
            </div>
          )}

          <div className="text-center">
            <Link
              to="/game-center"
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              ← 返回游戏中心
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
