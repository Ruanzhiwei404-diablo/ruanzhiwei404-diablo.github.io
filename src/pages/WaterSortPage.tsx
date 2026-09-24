import { useState, useEffect, useRef, useCallback, type MouseEvent as ReactMouseEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  CAPACITY,
  LEVEL_COUNT,
  canPour,
  applyPour,
  cloneTubes,
  isSolved,
  settledCount,
  solveTubes,
  generateLevel,
  levelConfig,
  topBlock,
  type Tubes,
  type Move,
} from '../utils/waterSortLevels';
import { WaterSortRenderer, type AnimState } from '../utils/waterSortCanvas';
import { WaterSortSfx } from '../audio/waterSortSfx';

/* ============================================================
 * 色彩排列（Water Sort / 水排序）— Canvas 版
 * 游戏区为 Canvas 逐帧渲染，完整复刻参考站倒水动画：
 * 源管倾斜、液面恒水平、水柱流注、1050ms 补间、点击排队。
 * HUD / 关卡地图 / 弹层仍为 DOM。
 * ============================================================ */

const PROGRESS_KEY = 'ws-progress-v1';
const POUR_MS = 1150; // 飞行+悬停倾倒+飞回（倾倒段与参考站 1050ms 相当）
const GRAD = 'linear-gradient(135deg, #a855f7, #ec4899)';
const GRAD_SOFT = 'linear-gradient(90deg, #a855f7, transparent)';

type Phase = 'map' | 'playing';

function loadProgress(): Record<number, number> {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}') as Record<number, number>;
  } catch {
    return {};
  }
}

function saveProgress(p: Record<number, number>) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

export default function WaterSortPage() {
  const [phase, setPhase] = useState<Phase>('map');
  const [progress, setProgress] = useState<Record<number, number>>(loadProgress);

  const [levelNum, setLevelNum] = useState(1);
  const [tubes, setTubes] = useState<Tubes>([]);
  const [history, setHistory] = useState<Tubes[]>([]);
  const [moves, setMoves] = useState(0);
  const [showNums, setShowNums] = useState(false);
  const [winStars, setWinStars] = useState<number | null>(null);
  const [demoUsed, setDemoUsed] = useState(false);
  const [demoPlaying, setDemoPlaying] = useState(false);
  const [animActive, setAnimActive] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);

  const tubesRef = useRef<Tubes>([]);
  const movesRef = useRef(0);
  const parRef = useRef(0);
  const colorsRef = useRef(4);
  const tubeCountRef = useRef(0);
  const solutionRef = useRef<Move[]>([]);
  const winRef = useRef(false);
  const demoUsedRef = useRef(false);
  const selectedRef = useRef<number | null>(null);
  const showNumsRef = useRef(false);
  const animRef = useRef<AnimState | null>(null);
  const queueRef = useRef<{ from: number; to: number }[]>([]);
  const liftsRef = useRef<number[]>([]);
  const nextRef = useRef<(() => void) | null>(null);
  const sfx = useRef(new WaterSortSfx());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<WaterSortRenderer | null>(null);

  const cfg = levelConfig(levelNum);
  const settled = settledCount(tubes);

  useEffect(() => {
    sfx.current.enabled = !muted;
  }, [muted]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const clearSelection = useCallback(() => {
    selectedRef.current = null;
  }, []);

  /** 开始一次倒水动画（不立即提交棋面，rAF 循环走完后在 commitPour 提交） */
  const startPour = useCallback(
    (from: number, to: number) => {
      const cur = tubesRef.current;
      if (!canPour(cur, from, to)) return;
      const count = Math.min(topBlock(cur[from]), CAPACITY - cur[to].length);
      animRef.current = {
        from,
        to,
        count,
        color: cur[from][cur[from].length - 1],
        start: performance.now(),
        duration: POUR_MS,
      };
      setAnimActive(true);
      clearSelection();
      sfx.current.pour();
    },
    [clearSelection],
  );

  /** 队列续播：取下一条有效走法开始倒水 */
  const startNextQueued = useCallback(() => {
    const q = queueRef.current;
    while (q.length) {
      const mv = q.shift()!;
      if (canPour(tubesRef.current, mv.from, mv.to)) {
        startPour(mv.from, mv.to);
        return;
      }
    }
    setAnimActive(false);
  }, [startPour]);

  // 让 rAF 循环能调用到最新的 startNextQueued（避免循环依赖）
  nextRef.current = startNextQueued;

  /** 动画走完 → 提交棋面（唯一提交点） */
  const commitPour = useCallback(
    (a: AnimState) => {
      animRef.current = null;
      const cur = tubesRef.current;
      const nt = cloneTubes(cur);
      const amt = applyPour(nt, a.from, a.to);
      if (amt) {
        tubesRef.current = nt;
        setHistory((h) => [...h.slice(-199), cloneTubes(cur)]);
        setTubes(nt);
        movesRef.current += 1;
        setMoves(movesRef.current);

        const before = settledCount(cur);
        const after = settledCount(nt);
        if (after > before) sfx.current.settle();

        if (isSolved(nt) && !winRef.current) {
          winRef.current = true;
          setDemoPlaying(false);
          queueRef.current = [];
          window.setTimeout(() => {
            const par = parRef.current;
            let stars = movesRef.current <= par ? 3 : movesRef.current <= Math.ceil(par * 1.7) ? 2 : 1;
            if (demoUsedRef.current) stars = Math.min(stars, 1);
            setWinStars(stars);
            setProgress((p) => {
              const np = { ...p, [levelNum]: Math.max(p[levelNum] ?? 0, stars) };
              saveProgress(np);
              return np;
            });
            sfx.current.win();
          }, 450);
        }
      }
      nextRef.current?.();
    },
    [levelNum],
  );
  const commitRef = useRef(commitPour);
  commitRef.current = commitPour;

  const cancelAnim = useCallback(() => {
    animRef.current = null;
    queueRef.current = [];
    setAnimActive(false);
  }, []);

  const openLevel = useCallback(
    (n: number) => {
      const { tubes: t, par, solution } = generateLevel(n);
      sfx.current.enabled = !muted;
      sfx.current.ensure();
      sfx.current.resume();
      cancelAnim();
      setLevelNum(n);
      tubesRef.current = t;
      setTubes(t);
      tubeCountRef.current = t.length;
      liftsRef.current = new Array(t.length).fill(0);
      solutionRef.current = solution;
      setHistory([]);
      movesRef.current = 0;
      setMoves(0);
      parRef.current = par;
      colorsRef.current = levelConfig(n).colors;
      winRef.current = false;
      demoUsedRef.current = false;
      setDemoUsed(false);
      setDemoPlaying(false);
      setWinStars(null);
      clearSelection();
      setShowNums(false);
      setPhase('playing');
    },
    [muted, cancelAnim, clearSelection],
  );

  const restart = useCallback(() => {
    if (demoPlaying) return;
    const { tubes: t, par, solution } = generateLevel(levelNum);
    cancelAnim();
    tubesRef.current = t;
    setTubes(t);
    tubeCountRef.current = t.length;
    liftsRef.current = new Array(t.length).fill(0);
    solutionRef.current = solution;
    parRef.current = par;
    setHistory([]);
    movesRef.current = 0;
    setMoves(0);
    winRef.current = false;
    demoUsedRef.current = false;
    setDemoUsed(false);
    setDemoPlaying(false);
    setWinStars(null);
    clearSelection();
  }, [levelNum, demoPlaying, cancelAnim, clearSelection]);

  const undo = useCallback(() => {
    if (demoPlaying || animActive) return;
    cancelAnim();
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      tubesRef.current = prev;
      setTubes(prev);
      movesRef.current = Math.max(0, movesRef.current - 1);
      setMoves(movesRef.current);
      clearSelection();
      return h.slice(0, -1);
    });
  }, [demoPlaying, animActive, cancelAnim, clearSelection]);

  /** 演示解答：整条解法入队自动连播（每步 1050ms）；使用后本关最高 1 星 */
  const runDemo = useCallback(() => {
    if (demoPlaying || animActive || winRef.current) return;
    let sol: Move[] | null = null;
    if (history.length === 0 && solutionRef.current.length) {
      sol = solutionRef.current;
    } else {
      sol = solveTubes(tubesRef.current, 80000);
    }
    if (!sol || !sol.length) {
      showToast('暂未找到解法，先撤销几步再试试');
      return;
    }
    cancelAnim();
    demoUsedRef.current = true;
    setDemoUsed(true);
    setDemoPlaying(true);
    clearSelection();
    queueRef.current = sol.map((m) => ({ from: m.from, to: m.to }));
    showToast('演示解答中…');
    startNextQueued();
  }, [demoPlaying, animActive, history.length, cancelAnim, clearSelection, startNextQueued, showToast]);

  const clickTube = useCallback(
    (i: number) => {
      if (winRef.current || demoPlaying) return;
      const t = tubesRef.current;
      const sel = selectedRef.current;

      // 倒水动画中：允许继续选管 / 排队（参考站同款「自动接上」）
      if (animRef.current) {
        if (sel === null) {
          if (!t[i].length) {
            sfx.current.invalid();
            return;
          }
          selectedRef.current = i;
          showToast('当前倒水结束后自动接上');
          return;
        }
        if (sel === i) {
          clearSelection();
          return;
        }
        if (canPour(t, sel, i)) {
          queueRef.current.push({ from: sel, to: i });
          clearSelection();
          showToast(`已排队：${sel + 1} 号倒入 ${i + 1} 号`);
        } else {
          sfx.current.invalid();
          selectedRef.current = t[i].length ? i : null;
        }
        return;
      }

      // 空闲
      if (sel === null) {
        if (!t[i].length) {
          sfx.current.invalid();
          return;
        }
        selectedRef.current = i;
        sfx.current.select();
        return;
      }
      if (sel === i) {
        clearSelection();
        return;
      }
      if (canPour(t, sel, i)) {
        startPour(sel, i);
      } else {
        sfx.current.invalid();
        selectedRef.current = t[i].length ? i : null;
      }
    },
    [demoPlaying, startPour, clearSelection, showToast],
  );

  /* ---------- Canvas 渲染循环 ---------- */
  useEffect(() => {
    if (phase !== 'playing' || !canvasRef.current) return;
    let renderer: WaterSortRenderer | null = null;
    try {
      renderer = new WaterSortRenderer(canvasRef.current);
    } catch {
      return;
    }
    rendererRef.current = renderer;
    const wrap = wrapRef.current;
    if (wrap && wrap.clientWidth > 0) {
      renderer.resize(wrap.clientWidth, tubeCountRef.current);
    }

    let raf = 0;
    const loop = () => {
      const r = rendererRef.current;
      if (r) {
        const a = animRef.current;
        if (a && (performance.now() - a.start) / a.duration >= 1) {
          commitRef.current(a);
        }
        // 选中抬升缓动
        for (let i = 0; i < liftsRef.current.length; i++) {
          const target = selectedRef.current === i ? -14 : 0;
          liftsRef.current[i] += (target - liftsRef.current[i]) * 0.22;
        }
        r.draw({
          tubes: tubesRef.current,
          anim: animRef.current,
          progress:
            animRef.current
              ? Math.min(1, (performance.now() - animRef.current.start) / animRef.current.duration)
              : 0,
          selected: selectedRef.current,
          lifts: liftsRef.current,
          showNums: showNumsRef.current,
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      rendererRef.current = null;
    };
  }, [phase]);

  // 窗口尺寸变化 → 重排布局
  useEffect(() => {
    if (phase !== 'playing') return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const ro = new ResizeObserver(() => {
      if (rendererRef.current && wrap.clientWidth > 0) {
        rendererRef.current.resize(wrap.clientWidth, tubeCountRef.current);
      }
    });
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [phase]);

  // 关卡切换 → 管数变化重排
  useEffect(() => {
    if (phase !== 'playing') return;
    const wrap = wrapRef.current;
    if (rendererRef.current && wrap && wrap.clientWidth > 0) {
      rendererRef.current.resize(wrap.clientWidth, tubeCountRef.current);
    }
  }, [levelNum, phase]);

  useEffect(() => {
    showNumsRef.current = showNums;
  }, [showNums]);

  const handleCanvasClick = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement>) => {
      const r = rendererRef.current;
      const canvas = canvasRef.current;
      if (!r || !canvas) return;
      const rect = canvas.getBoundingClientRect();
      const idx = r.hitTest(e.clientX - rect.left, e.clientY - rect.top);
      if (idx >= 0) clickTube(idx);
    },
    [clickTube],
  );

  /* ============ 渲染 ============ */

  const doneLevels = Object.keys(progress).length;
  const totalStars = Object.values(progress).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-[1000px] mx-auto py-8 px-6 w-full">
      {/* 头部 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5 flex items-center justify-center gap-2">
          <span>🧪</span> 色彩排列
        </h1>
        <p className="text-[13.5px] text-gray-500">
          经典水排序益智 · 同色可倒、满管归位 · 137 关无倒计时
        </p>
      </div>

      {/* 关卡地图 */}
      {phase === 'map' && (
        <>
          <div className="card p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: GRAD_SOFT }} />
            <h2 className="text-base font-bold text-text-bright mb-2 flex items-center gap-2">
              <span>📖</span> 游戏玩法
            </h2>
            <ul className="space-y-2 text-[13px] text-gray-400">
              <li>· <span className="text-gray-200 font-semibold">倒水</span>：点击试管选中（会抬起），再点另一根；只有目标管为空、或顶层颜色相同时才能倒，整段同色水层流入目标管。</li>
              <li>· <span className="text-gray-200 font-semibold">归位</span>：同一颜色 4 层集满一根管即归位，全部颜色归位即过关。</li>
              <li>· <span className="text-gray-200 font-semibold">道具</span>：↩️撤销、🔄重开、🔢显示色号、🧠演示解答（自动求解连播，使用后本关最高 1 星）；倒水途中连点会自动排队接续。</li>
              <li>· <span className="text-gray-200 font-semibold">评星</span>：步数 ≤ 参照步数 ★★★，≤ 1.7 倍 ★★，否则 ★；通关自动解锁下一关，进度本地保存。</li>
            </ul>
            <p className="text-[12px] text-gray-500 mt-3">
              ✨ 共 {LEVEL_COUNT} 关 · 已完成 {doneLevels} 关 · ★ {totalStars} / {LEVEL_COUNT * 3}
            </p>
          </div>

          <div className="card p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: GRAD_SOFT }} />
            <div className="text-sm font-semibold text-gray-300 mb-4">🗺️ 关卡地图</div>
            <div className="grid grid-cols-8 sm:grid-cols-10 gap-2">
              {Array.from({ length: LEVEL_COUNT }, (_, idx) => idx + 1).map((n) => {
                const unlocked = n === 1 || progress[n - 1] != null;
                const stars = progress[n] ?? 0;
                return (
                  <button
                    key={n}
                    onClick={() => unlocked && openLevel(n)}
                    disabled={!unlocked}
                    className="rounded-lg py-2 flex flex-col items-center gap-0.5 transition-all border"
                    style={{
                      background: stars > 0 ? 'rgba(168,85,247,0.16)' : unlocked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                      borderColor: unlocked ? (stars > 0 ? '#a855f7' : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.05)',
                      opacity: unlocked ? 1 : 0.4,
                    }}
                  >
                    <span className="text-xs font-bold" style={{ color: unlocked ? '#e2e8f0' : '#4b5563' }}>
                      {unlocked ? n : '🔒'}
                    </span>
                    {unlocked && (
                      <span className="text-[9px] leading-none text-[#f0abfc] tracking-tighter">
                        {stars > 0 ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '···'}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* 游戏区 */}
      {phase === 'playing' && (
        <>
          {/* HUD */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🧪</span>
              <div>
                <div className="text-sm font-bold text-text-bright leading-none">
                  第 {levelNum} 关
                </div>
                <div className="text-[10px] text-gray-500">
                  {colorsRef.current} 色 · {cfg.tubes} 管 · 参照 {parRef.current} 步
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="text-center">
                <div className="text-[10px] text-gray-500">步数</div>
                <div className="font-bold text-text-bright">{String(moves).padStart(2, '0')}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-gray-500">已归位</div>
                <div className="font-bold text-[#a5f3fc]">
                  {settled} / {colorsRef.current}
                </div>
              </div>
            </div>
          </div>

          {/* Canvas 棋盘 */}
          <div className="card px-3 mb-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: GRAD_SOFT }} />
            <div ref={wrapRef} className="relative w-full">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="block w-full cursor-pointer touch-manipulation"
              />
              {toast && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[rgba(168,85,247,0.9)] whitespace-nowrap z-10">
                  {toast}
                </div>
              )}
              {demoPlaying && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-xs font-bold text-[#f0abfc] bg-[rgba(168,85,247,0.18)] border border-[rgba(168,85,247,0.4)] z-10">
                  🧠 演示解答中…
                </div>
              )}

              {/* 通关弹层 */}
              {winStars !== null && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[rgba(3,3,17,0.82)] backdrop-blur-sm z-20">
                  <div className="text-center">
                    <div className="text-5xl mb-2">🎉</div>
                    <div className="text-3xl mb-1 tracking-widest">
                      <span className="text-[#facc15]">{'★'.repeat(winStars)}</span>
                      <span className="text-gray-600">{'☆'.repeat(3 - winStars)}</span>
                    </div>
                    <div className="text-sm text-gray-400 mb-5">
                      第 {levelNum} 关通关 · {moves} 步{demoUsed ? '（演示解答）' : ''}
                    </div>
                    <div className="flex gap-3 justify-center">
                      {levelNum < LEVEL_COUNT && (
                        <button
                          onClick={() => openLevel(levelNum + 1)}
                          className="rounded-xl px-6 py-3 font-bold text-white"
                          style={{ background: GRAD }}
                        >
                          下一关 →
                        </button>
                      )}
                      <button
                        onClick={restart}
                        className="rounded-xl px-6 py-3 font-bold text-gray-300 border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)]"
                      >
                        🔄 重玩
                      </button>
                      <button
                        onClick={() => setPhase('map')}
                        className="rounded-xl px-6 py-3 font-bold text-gray-300 border border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)]"
                      >
                        🗺️ 关卡地图
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 控制 */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            <button
              onClick={undo}
              disabled={!history.length || demoPlaying || animActive || winStars !== null}
              className="flex-1 min-w-[80px] rounded-xl py-3 font-bold text-white disabled:opacity-30 transition-colors"
              style={{ background: GRAD }}
            >
              ↩️ 撤销
            </button>
            <button
              onClick={restart}
              disabled={demoPlaying || animActive}
              className="flex-1 min-w-[80px] rounded-xl py-3 font-bold text-white disabled:opacity-30 transition-colors"
              style={{ background: GRAD }}
            >
              🔄 重开
            </button>
            <button
              onClick={() => setShowNums((s) => !s)}
              className="flex-1 min-w-[80px] rounded-xl py-3 font-bold text-gray-300 border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.05)]"
            >
              🔢 {showNums ? '隐藏色号' : '显示色号'}
            </button>
            <button
              onClick={runDemo}
              disabled={demoPlaying || animActive || winStars !== null}
              className="flex-1 min-w-[80px] rounded-xl py-3 font-bold text-white disabled:opacity-30 transition-colors"
              style={{ background: GRAD }}
            >
              🧠 演示解答
            </button>
            <button
              onClick={() => setMuted((m) => !m)}
              className="rounded-xl py-3 px-4 font-bold text-gray-300 border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.05)]"
              title="声音开关"
            >
              {muted ? '🔇' : '🔊'}
            </button>
            <button
              onClick={() => {
                cancelAnim();
                setPhase('map');
              }}
              className="flex-1 min-w-[80px] rounded-xl py-3 font-bold text-gray-300 border border-[rgba(255,255,255,0.12)] hover:bg-[rgba(255,255,255,0.05)]"
            >
              🗺️ 关卡地图
            </button>
          </div>
        </>
      )}

      {/* 返回 */}
      <div className="mt-6 text-center">
        <Link
          to="/game-center"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← 返回游戏中心
        </Link>
      </div>
    </div>
  );
}
