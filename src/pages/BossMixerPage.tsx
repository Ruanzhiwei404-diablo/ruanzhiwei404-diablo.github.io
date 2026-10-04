import { useState, useEffect, useRef, useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { BossMixerEngine } from '../audio/bossMixerEngine';
import { BossMixerRenderer } from '../utils/bossMixerCanvas';
import {
  BOSSES,
  MATCH_GRACE,
  PLAYER_DPS,
  loadBmBests,
  matchRate,
  moveIndexAt,
  saveBmBest,
  targetAt,
  type BossDef,
} from '../utils/bossMixerData';

/* ============================================================
 * Boss 混音战（BOSS MIXER）
 * 混音台就是武器：Boss 逐拍输出「目标声纹」（4 频段目标能量），
 * 你用 4 通道合成器 + 主低通 + 律动 LFO 实时混音，
 * 实测频谱与目标越匹配 Boss 掉血越快；越离谱你自己掉血。
 * ============================================================ */

const GRAD = 'linear-gradient(135deg, #a855f7, #ec4899)';
const GRAD_SOFT = 'linear-gradient(90deg, #a855f7, transparent)';
const CH_LABELS = [
  { label: 'SUB', hint: '55Hz 正弦 · 低频' },
  { label: 'SAW', hint: '220Hz 锯齿 · 中低' },
  { label: 'SQR', hint: '880Hz 方波 · 中高' },
  { label: 'NZ', hint: '白噪高通 · 高频' },
];

type Phase = 'menu' | 'battle' | 'result';

type Run = {
  t: number; // 战斗时间（秒，暂停不累计）
  beat: number;
  hpBoss: number;
  hpPlayer: number;
  matchSum: number;
  frames: number;
  paused: boolean;
  finished: boolean;
  grooveAcc: number;
};

type BmResult = { win: boolean; stars: number; hpLeft: number; avgMatch: number; time: number };

function starsFor(hpLeft: number): number {
  return hpLeft >= 0.7 ? 3 : hpLeft >= 0.4 ? 2 : 1;
}

/* ---------------- 竖直推子 ---------------- */
function VFader({
  value,
  onChange,
  label,
  hint,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  hint: string;
  color: string;
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const apply = (clientY: number) => {
    const el = trackRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const v = 1 - Math.min(1, Math.max(0, (clientY - r.top) / r.height));
    onChange(Math.round(v * 100) / 100);
  };

  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      <div
        ref={trackRef}
        className="relative w-11 h-40 rounded-xl bg-black/40 border border-white/10 cursor-pointer touch-none overflow-hidden"
        onPointerDown={(e: ReactPointerEvent<HTMLDivElement>) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          apply(e.clientY);
        }}
        onPointerMove={(e: ReactPointerEvent<HTMLDivElement>) => {
          if (dragging.current) apply(e.clientY);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
      >
        <div
          className="absolute bottom-0 left-0 right-0 rounded-b-xl"
          style={{ height: `${value * 100}%`, background: `linear-gradient(180deg, ${color}cc, ${color}44)` }}
        />
        <div
          className="absolute left-0.5 right-0.5 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
          style={{ bottom: `calc(${value * 100}% - 4px)` }}
        />
      </div>
      <div className="font-mono text-[11px] font-bold" style={{ color }}>
        {label}
      </div>
      <div className="text-[9px] text-gray-600 text-center leading-tight">{hint}</div>
    </div>
  );
}

/* ---------------- 页面 ---------------- */
export default function BossMixerPage() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [bossId, setBossId] = useState(BOSSES[0].id);
  const [bests, setBests] = useState(loadBmBests);
  const [levels, setLevels] = useState([0, 0, 0, 0]);
  const [cutoff, setCutoff] = useState(1);
  const [groove, setGroove] = useState(0.4);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<BmResult | null>(null);

  const engine = useRef(new BossMixerEngine());
  const runRef = useRef<Run | null>(null);
  const bossRef = useRef<BossDef>(BOSSES[0]);
  const levelsRef = useRef([0, 0, 0, 0]);
  const cutoffRef = useRef(1);
  const grooveRef = useRef(0.4);
  const smoothedRef = useRef([0, 0, 0, 0]);
  const pausedRef = useRef(false);
  const rendererRef = useRef<BossMixerRenderer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const hpBossRef = useRef<HTMLDivElement | null>(null);
  const hpPlayerRef = useRef<HTMLDivElement | null>(null);

  levelsRef.current = levels;
  cutoffRef.current = cutoff;
  grooveRef.current = groove;

  const boss = BOSSES.find((b) => b.id === bossId) ?? BOSSES[0];

  const startBattle = useCallback(async () => {
    const b = BOSSES.find((x) => x.id === bossId) ?? BOSSES[0];
    bossRef.current = b;
    const eng = engine.current;
    eng.ensure();
    eng.silenceAll();
    eng.setCutoff(12000);
    await eng.resume();
    runRef.current = {
      t: 0,
      beat: 0,
      hpBoss: b.hp,
      hpPlayer: 100,
      matchSum: 0,
      frames: 0,
      paused: false,
      finished: false,
      grooveAcc: 0,
    };
    pausedRef.current = false;
    setPaused(false);
    setLevels([0, 0, 0, 0]);
    smoothedRef.current = [0, 0, 0, 0];
    setResult(null);
    setPhase('battle');
  }, [bossId]);

  const finish = useCallback(
    (win: boolean) => {
      const run = runRef.current;
      if (!run || run.finished) return;
      run.finished = true;
      const b = bossRef.current;
      const hpLeft = Math.max(0, run.hpPlayer / 100);
      const stars = win ? starsFor(hpLeft) : 0;
      saveBmBest(b.id, { win, hpLeft, stars });
      setBests(loadBmBests());
      setResult({
        win,
        stars,
        hpLeft,
        avgMatch: run.frames ? run.matchSum / run.frames : 0,
        time: run.t,
      });
      engine.current.silenceAll();
      setPhase('result');
    },
    [],
  );

  const togglePause = useCallback(async () => {
    const run = runRef.current;
    if (!run || run.finished) return;
    pausedRef.current = !pausedRef.current;
    run.paused = pausedRef.current;
    setPaused(pausedRef.current);
    if (pausedRef.current) {
      engine.current.silenceAll();
      await engine.current.suspend();
    } else {
      await engine.current.resume();
    }
  }, []);

  useEffect(() => {
    return () => {
      void engine.current.dispose();
    };
  }, []);

  /* ---------------- 战斗循环 ---------------- */
  useEffect(() => {
    if (phase !== 'battle') return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const renderer = new BossMixerRenderer(canvas);
    rendererRef.current = renderer;
    const ro = new ResizeObserver(() => renderer.resize(wrap.clientWidth));
    ro.observe(wrap);
    renderer.resize(wrap.clientWidth);

    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const run = runRef.current;
      const b = bossRef.current;
      if (!run) return;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!run.paused && !run.finished) {
        run.t += dt;
        run.beat = (run.t * b.bpm) / 60;
        const target = targetAt(b, run.beat);
        // 实测频谱平滑
        const raw = engine.current.bands();
        for (let i = 0; i < 4; i++) {
          smoothedRef.current[i] += (raw[i] - smoothedRef.current[i]) * 0.28;
        }
        const player = smoothedRef.current;
        const match = matchRate(player, target);
        run.matchSum += match;
        run.frames++;
        // 伤害结算
        run.hpBoss = Math.max(0, run.hpBoss - dt * PLAYER_DPS * Math.pow(match, 1.5));
        const dmgK = Math.max(0, 1 - match / MATCH_GRACE);
        run.hpPlayer = Math.max(0, run.hpPlayer - dt * b.dps * dmgK);
        // 律动 LFO 参数（10Hz 节流）
        run.grooveAcc += dt;
        if (run.grooveAcc > 0.1) {
          run.grooveAcc = 0;
          engine.current.setGroove(b.bpm, grooveRef.current, levelsRef.current);
        }
        // HP 条直写 DOM
        if (hpBossRef.current) {
          const k = run.hpBoss / b.hp;
          hpBossRef.current.style.width = `${k * 100}%`;
          hpBossRef.current.style.background = k > 0.4 ? GRAD : 'linear-gradient(90deg,#f43f5e,#ec4899)';
        }
        if (hpPlayerRef.current) {
          hpPlayerRef.current.style.width = `${run.hpPlayer}%`;
        }
        // 结束判定
        if (run.hpBoss <= 0) {
          finish(true);
        } else if (run.hpPlayer <= 0) {
          finish(false);
        }
        // 绘制
        const mi = moveIndexAt(b, run.beat);
        const silent = b.moves[mi].levels.every((l) => l === 0);
        renderer.draw({
          target,
          player,
          match,
          beatFrac: run.beat % 1,
          moveName: silent ? '🔇 静音领域 — 全部拉零！' : null,
          bossIcon: b.icon,
          bossColor: b.color,
          running: true,
        });
      } else {
        renderer.draw({
          target: [0, 0, 0, 0],
          player: [0, 0, 0, 0],
          match: 0,
          beatFrac: 0,
          moveName: null,
          bossIcon: b.icon,
          bossColor: b.color,
          running: false,
        });
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase, finish]);

  /* ---------------- 操控 ---------------- */
  const setLevel = (i: number, v: number) => {
    setLevels((prev) => {
      const next = [...prev];
      next[i] = v;
      engine.current.setChannel(i as 0 | 1 | 2 | 3, v);
      return next;
    });
  };

  const changeCutoff = (v: number) => {
    setCutoff(v);
    engine.current.setCutoff(200 * Math.pow(60, v)); // 200Hz ~ 12kHz 对数
  };

  /* ---------------- 渲染 ---------------- */
  if (phase === 'menu') {
    return (
      <div className="max-w-[1000px] mx-auto py-8 px-6 w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold text-text-bright mb-1.5 flex items-center justify-center gap-2">
            <span>🎚️</span> Boss 混音战
          </h1>
          <p className="text-[13.5px] text-gray-500 font-mono tracking-widest">BOSS MIXER</p>
          <p className="text-[13px] text-gray-400 mt-2">
            混音台就是武器：Boss 逐拍发出「目标声纹」（虚线幽灵条），把你的实时频谱（实心条）贴上去 ——
            匹配越准 Boss 掉血越快，越离谱你自己掉血。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {BOSSES.map((b) => {
            const sel = b.id === bossId;
            const best = bests[b.id];
            return (
              <button
                key={b.id}
                onClick={() => setBossId(b.id)}
                className={`card p-5 text-left transition-all cursor-pointer ${
                  sel ? 'ring-2 shadow-[0_0_24px_#a855f740]' : 'hover:border-[#a855f780]'
                }`}
                style={sel ? { ['--tw-ring-color' as string]: b.color } : undefined}
              >
                <div className="text-4xl mb-2" style={{ textShadow: `0 0 18px ${b.color}90` }}>
                  {b.icon}
                </div>
                <div className="text-base font-bold text-text-bright">
                  {b.name}
                  <span className="text-[10px] font-mono text-gray-500 tracking-widest ml-1.5">{b.en}</span>
                </div>
                <div className="text-xs text-gray-500 font-mono mt-0.5 mb-2">
                  BPM {b.bpm} · HP {b.hp} · 威胁 {b.dps}/s
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-3">{b.intro}</p>
                <div className="text-sm tracking-widest">
                  {best ? (best.stars ? '★'.repeat(best.stars) + '☆'.repeat(3 - best.stars) : '已挑战') : '未挑战'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="card p-5 mb-8 text-sm text-gray-400 leading-relaxed">
          <div className="font-bold text-gray-300 mb-1.5">玩法</div>
          四根推子 = 四个频段武器（SUB 低频 / SAW 中低 / SQR 中高 / NZ 高频），
          <span className="text-gray-300 mx-1">CUTOFF</span>
          主低通把高频滤掉（NZ 全靠它），
          <span className="text-gray-300 mx-1">GROOVE</span>
          让通道按 Boss 的 BPM 自动律动（偷懒神器但别开太猛）。
          目标条随节拍脉动、会换招 —— 看到 <span className="text-pink-300 mx-1">🔇 静音领域</span>
          就把所有推子拉到底！匹配度 &gt;55% 时你不会掉血。拖动推子或用鼠标都行，手机可玩。
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => void startBattle()}
            className="rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold py-3.5 px-10 text-base transition-colors shadow-[0_4px_20px_#a855f750] cursor-pointer"
          >
            ⚔ 开战
          </button>
          <Link to="/game-center" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← 返回游戏大厅
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto py-6 px-6 w-full">
      {/* 血条区 */}
      <div className="mb-4 space-y-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-bold" style={{ color: boss.color }}>
              {boss.icon} {boss.name}
            </span>
            <span className="font-mono text-gray-500">BOSS</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <div ref={hpBossRef} className="h-full rounded-full transition-none" style={{ width: '100%', background: GRAD }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-300">你（混音台）</span>
            <span className="font-mono text-gray-500">HP</span>
          </div>
          <div className="h-3 rounded-full bg-white/5 overflow-hidden">
            <div ref={hpPlayerRef} className="h-full rounded-full bg-[#22d3ee]" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* 频谱对决 */}
      <div ref={wrapRef} className="relative mb-5">
        <canvas ref={canvasRef} className="w-full block rounded-2xl border border-white/10 select-none" />
        {paused && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4">
            <div className="text-xl font-bold text-text-bright">已暂停</div>
            <div className="flex gap-3">
              <button
                onClick={() => void togglePause()}
                className="rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold py-2.5 px-8 transition-colors cursor-pointer"
              >
                继续
              </button>
              <button
                onClick={() => setPhase('menu')}
                className="rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 font-bold py-2.5 px-8 transition-colors cursor-pointer"
              >
                撤退
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 调音台 */}
      <div className="card p-5">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div className="flex gap-3">
            {CH_LABELS.map((c, i) => (
              <VFader
                key={c.label}
                label={c.label}
                hint={c.hint}
                color={['#a855f7', '#f59e0b', '#22d3ee', '#ec4899'][i]}
                value={levels[i]}
                onChange={(v) => setLevel(i, v)}
              />
            ))}
          </div>
          <div className="flex gap-6">
            <div>
              <div className="text-xs text-gray-500 mb-2">
                CUTOFF <span className="font-mono">{Math.round(200 * Math.pow(60, cutoff))}Hz</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={cutoff}
                onChange={(e) => changeCutoff(parseFloat(e.target.value))}
                className="w-36 accent-[#22d3ee] cursor-pointer"
              />
              <div className="text-[9px] text-gray-600 mt-1">主低通 · 把高频滤掉</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2">
                GROOVE <span className="font-mono">{Math.round(groove * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={groove}
                onChange={(e) => setGroove(parseFloat(e.target.value))}
                className="w-36 accent-[#ec4899] cursor-pointer"
              />
              <div className="text-[9px] text-gray-600 mt-1">律动 LFO · 按拍自动脉动</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => void togglePause()}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
        >
          {paused ? '▶ 继续' : '⏸ 暂停'}
        </button>
      </div>

      {/* 结算 */}
      {phase === 'result' && result && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="card p-8 w-full max-w-[420px] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: GRAD_SOFT }} />
            <div className="text-[11px] font-mono text-gray-500 tracking-widest mb-2">BATTLE RESULT</div>
            <div className="text-5xl mb-2">{result.win ? '🏆' : '💀'}</div>
            <div className="text-2xl font-extrabold text-text-bright mb-1">
              {result.win ? `${bossRef.current.name} 被混音压制！` : '被 Boss 的声浪淹没了…'}
            </div>
            <div className="text-3xl tracking-widest my-3">
              <span style={{ color: '#f59e0b' }}>{result.win ? '★'.repeat(result.stars) : ''}</span>
              <span className="text-gray-700">{result.win ? '☆'.repeat(3 - result.stars) : '☆☆☆'}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center mb-5 font-mono text-sm">
              <div>
                <div className="text-text-bright font-bold">{Math.round(result.hpLeft * 100)}%</div>
                <div className="text-[10px] text-gray-500">剩余HP</div>
              </div>
              <div>
                <div className="text-[#22d3ee] font-bold">{Math.round(result.avgMatch * 100)}%</div>
                <div className="text-[10px] text-gray-500">平均匹配</div>
              </div>
              <div>
                <div className="text-text-bright font-bold">{result.time.toFixed(1)}s</div>
                <div className="text-[10px] text-gray-500">战斗时长</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => void startBattle()}
                className="rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold py-2.5 px-8 transition-colors cursor-pointer"
              >
                再战
              </button>
              <button
                onClick={() => setPhase('menu')}
                className="rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 font-bold py-2.5 px-8 transition-colors cursor-pointer"
              >
                返回选 Boss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
