import { useState, useEffect, useRef, useCallback, type PointerEvent as ReactPointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { RhythmCodeEngine, TIMBRES, type Timbre } from '../audio/rhythmCodeEngine';
import { RhythmCodeRenderer } from '../utils/rhythmCodeCanvas';
import {
  DIFFS,
  LANE_KEYS,
  SONG_METAS,
  getSong,
  loadBests,
  saveBest,
  type Best,
  type Diff,
  type Song,
} from '../utils/rhythmCodeSongs';

/* ============================================================
 * 节奏编码（RHYTHM CODE）
 * 把旋律当代码，按拍输入：4 轨下落 token（带音名），
 * D/F/J/K 或点击轨道命中即奏出该音 —— 打完 = 把旋律「编译」出来。
 * 引擎纯 Web Audio 合成（4 音色），谱面来自内置公有领域旋律编码。
 * ============================================================ */

const GRAD = 'linear-gradient(135deg, #a855f7, #ec4899)';
const GRAD_SOFT = 'linear-gradient(90deg, #a855f7, transparent)';
const GRADE_COLOR: Record<string, string> = {
  S: '#22d3ee',
  A: '#a855f7',
  B: '#ec4899',
  C: '#f59e0b',
  D: '#6b7280',
};

type Phase = 'menu' | 'play' | 'result';

type RunState = {
  songStartAt: number; // 音频时钟上的歌曲 0 点（含倒数）
  lastTickBeat: number;
  firstPending: number; // 未判定音的扫描起点
  combo: number;
  maxCombo: number;
  score: number;
  weight: number; // 准度权重（perfect=1 good=0.6）
  judged: number;
  perfect: number;
  good: number;
  miss: number;
  paused: boolean;
  finished: boolean;
};

type Result = {
  grade: string;
  score: number;
  acc: number;
  perfect: number;
  good: number;
  miss: number;
  maxCombo: number;
  fc: boolean;
  newBest: boolean;
};

export default function RhythmCodePage() {
  const [phase, setPhase] = useState<Phase>('menu');
  const [songId, setSongId] = useState(SONG_METAS[0].id);
  const [diff, setDiff] = useState<Diff>('normal');
  const [timbre, setTimbre] = useState<Timbre>('pulse');
  const [bests, setBests] = useState<Record<string, Best>>(loadBests);
  const [hud, setHud] = useState({ score: 0, combo: 0, acc: 100 });
  const [countdown, setCountdown] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const engine = useRef(new RhythmCodeEngine());
  const songRef = useRef<Song | null>(null);
  const runRef = useRef<RunState | null>(null);
  const rendererRef = useRef<RhythmCodeRenderer | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef<HTMLDivElement | null>(null);
  const cdRef = useRef<number | null>(null);
  const songIdRef = useRef(songId);
  const diffRef = useRef(diff);
  const pausedRef = useRef(false);

  songIdRef.current = songId;
  diffRef.current = diff;

  /* ---------------- 开始 / 判定 / 结束 ---------------- */

  const startGame = useCallback(async () => {
    const eng = engine.current;
    eng.ensure();
    eng.timbre = timbre;
    await eng.resume();
    const song = getSong(songIdRef.current, diffRef.current);
    const spb = 60 / song.bpm;
    songRef.current = song;
    runRef.current = {
      songStartAt: eng.now + 4 * spb,
      lastTickBeat: -999,
      firstPending: 0,
      combo: 0,
      maxCombo: 0,
      score: 0,
      weight: 0,
      judged: 0,
      perfect: 0,
      good: 0,
      miss: 0,
      paused: false,
      finished: false,
    };
    pausedRef.current = false;
    setPaused(false);
    setHud({ score: 0, combo: 0, acc: 100 });
    setResult(null);
    setCountdown(null);
    cdRef.current = null;
    setPhase('play');
  }, [timbre]);

  const finish = useCallback(() => {
    const run = runRef.current;
    const song = songRef.current;
    if (!run || !song || run.finished) return;
    run.finished = true;
    const d = DIFFS[diffRef.current];
    const acc = run.judged > 0 ? (run.weight / run.judged) * 100 : 0;
    const fc = run.miss === 0 && run.judged === song.notes.length;
    const score = Math.round(run.score + (fc ? 1000 * d.mult : 0));
    const grade = acc >= 95 ? 'S' : acc >= 88 ? 'A' : acc >= 78 ? 'B' : acc >= 65 ? 'C' : 'D';
    const prev = bests[`${song.id}:${diffRef.current}`];
    const newBest = !prev || score > prev.score;
    saveBest(`${song.id}:${diffRef.current}`, { score, acc, grade, fc });
    setBests(loadBests());
    setResult({
      grade,
      score,
      acc,
      perfect: run.perfect,
      good: run.good,
      miss: run.miss,
      maxCombo: run.maxCombo,
      fc,
      newBest,
    });
    engine.current.playResult(grade as 'S' | 'A' | 'B' | 'C' | 'D');
    setPhase('result');
  }, [bests]);

  const hitLane = useCallback((lane: number) => {
    const run = runRef.current;
    const song = songRef.current;
    const renderer = rendererRef.current;
    if (!run || !song || run.paused || run.finished) return;
    const d = DIFFS[diffRef.current];
    const eng = engine.current;
    const t = eng.now - run.songStartAt;
    // 找该轨道最近的未判定音
    let best: (typeof song.notes)[number] | null = null;
    let bestDt = Infinity;
    for (let i = run.firstPending; i < song.notes.length; i++) {
      const n = song.notes[i];
      if (n.t - t > d.good) break;
      if (n.judged || n.lane !== lane) continue;
      const dt = Math.abs(n.t - t);
      if (dt < bestDt) {
        bestDt = dt;
        best = n;
      }
    }
    if (best && bestDt <= d.good) {
      const perfect = bestDt <= d.perfect;
      best.judged = perfect ? 'perfect' : 'good';
      run.judged++;
      run.combo++;
      run.maxCombo = Math.max(run.maxCombo, run.combo);
      run.score += Math.round(((perfect ? 300 : 120) + Math.min(run.combo, 100) * 3) * d.mult);
      run.weight += perfect ? 1 : 0.6;
      if (perfect) run.perfect++;
      else run.good++;
      eng.playTone(best.midi, best.dur);
      eng.playHit(perfect ? 'perfect' : 'good');
      renderer?.addFlash(lane);
      renderer?.addRing(lane, perfect ? '#22d3ee' : '#a855f7');
      renderer?.addPopup(lane, perfect ? 'PERFECT' : 'GOOD', perfect ? '#22d3ee' : '#c084fc');
      const acc = run.judged > 0 ? (run.weight / run.judged) * 100 : 100;
      setHud({ score: run.score, combo: run.combo, acc });
    } else {
      // 空拍：轻响对应轨道的「基础音」，可自由拨弦不扣分
      let base = 60 + lane * 3;
      const laneNotes = song.notes.filter((n) => n.lane === lane);
      if (laneNotes.length) {
        base = Math.round(laneNotes.reduce((s2, n) => s2 + n.midi, 0) / laneNotes.length);
      }
      eng.playFree(base);
      renderer?.addFlash(lane);
    }
  }, []);

  const togglePause = useCallback(async () => {
    const run = runRef.current;
    if (!run || run.finished) return;
    pausedRef.current = !pausedRef.current;
    run.paused = pausedRef.current;
    setPaused(pausedRef.current);
    if (pausedRef.current) await engine.current.suspend();
    else await engine.current.resume();
  }, []);

  /* ---------------- 游戏循环（phase === 'play' 时挂载） ---------------- */

  useEffect(() => {
    if (phase !== 'play') return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const renderer = new RhythmCodeRenderer(canvas);
    rendererRef.current = renderer;
    const ro = new ResizeObserver(() => renderer.resize(wrap.clientWidth));
    ro.observe(wrap);
    renderer.resize(wrap.clientWidth);

    let raf = 0;
    const loop = (nowMs: number) => {
      raf = requestAnimationFrame(loop);
      const run = runRef.current;
      const song = songRef.current;
      if (!run || !song) return;
      const eng = engine.current;
      const d = DIFFS[diffRef.current];
      const t = eng.now - run.songStartAt;
      const spb = 60 / song.bpm;

      if (!run.paused && !run.finished) {
        // 倒数节拍
        if (t < 0) {
          const b = Math.ceil(-t / spb);
          if (cdRef.current !== b) {
            cdRef.current = b;
            setCountdown(b);
            eng.playTick(false);
          }
        } else if (cdRef.current !== null) {
          cdRef.current = null;
          setCountdown(null);
        }
        // 陪拍 tick（每拍，逢 4 拍重音）
        if (t >= 0) {
          const beat = Math.floor(t / spb);
          if (beat !== run.lastTickBeat && beat < Math.ceil(song.duration / spb)) {
            run.lastTickBeat = beat;
            eng.playTick(beat % 4 === 0);
          }
        }
        // miss 扫描
        for (let i = run.firstPending; i < song.notes.length; i++) {
          const n = song.notes[i];
          if (n.t - t > d.good) break;
          if (!n.judged && t - n.t > d.good) {
            n.judged = 'miss';
            run.miss++;
            run.combo = 0;
            eng.playMiss();
            renderer.addPopup(n.lane, 'MISS', '#6b7280');
          }
          if (n.judged && i === run.firstPending) run.firstPending++;
        }
        // 进度条直写 DOM，避免每帧 re-render
        if (progressRef.current) {
          progressRef.current.style.width = `${Math.max(0, Math.min(100, (t / song.duration) * 100))}%`;
        }
        // 结束
        if (t > song.duration) finish();
      }

      renderer.draw(
        { notes: song.notes, songTime: t, speed: d.speed, playing: !run.paused },
        nowMs,
      );
    };
    raf = requestAnimationFrame(loop);

    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const k = e.key.toUpperCase();
      if (k === 'ESCAPE') {
        void togglePause();
        return;
      }
      const lane = LANE_KEYS.indexOf(k);
      if (lane >= 0) {
        e.preventDefault();
        hitLane(lane);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('keydown', onKey);
    };
  }, [phase, hitLane, finish, togglePause]);

  // 离开页面时释放音频
  useEffect(() => {
    return () => {
      void engine.current.suspend();
    };
  }, []);

  /* ---------------- 输入（触屏 / 鼠标） ---------------- */

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const lane = renderer.laneAt(e.clientX - rect.left);
    if (lane >= 0) hitLane(lane);
  };

  /* ---------------- 渲染 ---------------- */

  if (phase === 'menu') {
    return (
      <div className="max-w-[1000px] mx-auto py-8 px-6 w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-extrabold text-text-bright mb-1.5 flex items-center justify-center gap-2">
            <span>🎵</span> 节奏编码
          </h1>
          <p className="text-[13.5px] text-gray-500 font-mono tracking-widest">RHYTHM CODE</p>
          <p className="text-[13px] text-gray-400 mt-2">
            把旋律当代码，按拍输入 —— 音符沿轨道落下，在判定线按键命中即奏出该音，打完 = 把整段旋律「编译」出来。
          </p>
        </div>

        {/* 选曲 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {SONG_METAS.map((s) => {
            const key = `${s.id}:${diff}`;
            const b = bests[key];
            const sel = s.id === songId;
            return (
              <button
                key={s.id}
                onClick={() => setSongId(s.id)}
                className={`card p-5 text-left transition-all cursor-pointer ${
                  sel ? 'ring-2 ring-[#a855f7] shadow-[0_0_24px_#a855f740]' : 'hover:border-[#a855f780]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-base font-bold text-text-bright">
                      {s.title} <span className="text-[10px] font-mono text-gray-500 tracking-widest ml-1">{s.en}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5 font-mono">
                      BPM {s.bpm} · tokens {s.total}
                    </div>
                  </div>
                  {b ? (
                    <div className="text-right">
                      <div className="text-lg font-extrabold" style={{ color: GRADE_COLOR[b.grade] }}>
                        {b.grade}
                      </div>
                      <div className="text-[11px] text-gray-500 font-mono">{b.score.toLocaleString()}</div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-gray-600 font-mono">NO PLAY</div>
                  )}
                </div>
                <div
                  className="h-[2px] rounded-full"
                  style={{ background: sel ? GRAD_SOFT : 'rgba(255,255,255,0.06)' }}
                />
              </button>
            );
          })}
        </div>

        {/* 难度 + 音色 */}
        <div className="card p-5 mb-6">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <div>
              <div className="text-xs text-gray-500 mb-2">难度</div>
              <div className="flex gap-2">
                {(Object.keys(DIFFS) as Diff[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setDiff(k)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                      diff === k
                        ? 'bg-[#a855f7] text-white shadow-[0_0_16px_#a855f760]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {DIFFS[k].label}
                    <span className="text-[9px] font-mono ml-1 opacity-70">{DIFFS[k].en}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2">音色</div>
              <div className="flex gap-2 flex-wrap">
                {TIMBRES.map((tb) => (
                  <button
                    key={tb.id}
                    onClick={() => setTimbre(tb.id)}
                    title={tb.hint}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                      timbre === tb.id
                        ? 'bg-[#ec4899] text-white shadow-[0_0_16px_#ec489960]'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    {tb.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 玩法说明 */}
        <div className="card p-5 mb-8 text-sm text-gray-400 leading-relaxed">
          <div className="font-bold text-gray-300 mb-1.5">玩法</div>
          音符（代码 token）沿 4 条轨道下落，到判定线时按对应键
          <span className="font-mono text-gray-300 mx-1">D / F / J / K</span>
          （或点击 / 触摸轨道）。按得越准分越高：
          <span className="text-[#22d3ee] mx-1">PERFECT</span>→
          <span className="text-[#c084fc] mx-1">GOOD</span>→
          <span className="text-gray-500 mx-1">MISS</span>
          ，连击有加成，全曲无 MISS 触发 <span className="text-[#22d3ee] mx-1">FULL COMBO</span>
          。每个 token 标着音名，命中即发声 —— 高音在右轨、低音在左轨。Esc 暂停。
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => void startGame()}
            className="rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold py-3.5 px-10 text-base transition-colors shadow-[0_4px_20px_#a855f750] cursor-pointer"
          >
            ▶ 开始编译
          </button>
          <Link
            to="/game-center"
            className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← 返回游戏大厅
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto py-6 px-6 w-full">
      {/* HUD */}
      <div className="flex items-center justify-between mb-3 gap-4">
        <div className="font-mono">
          <div className="text-[10px] text-gray-500 tracking-widest">SCORE</div>
          <div className="text-xl font-extrabold text-text-bright">{hud.score.toLocaleString()}</div>
        </div>
        <div className="text-center">
          {hud.combo > 1 && (
            <>
              <div className="text-2xl font-extrabold text-[#c084fc] leading-none">{hud.combo}</div>
              <div className="text-[10px] text-gray-500 tracking-widest font-mono">COMBO</div>
            </>
          )}
        </div>
        <div className="text-right font-mono">
          <div className="text-[10px] text-gray-500 tracking-widest">ACC</div>
          <div className="text-xl font-extrabold text-text-bright">{hud.acc.toFixed(1)}%</div>
        </div>
        <button
          onClick={() => void togglePause()}
          className="rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm px-4 py-2 transition-colors cursor-pointer"
        >
          {paused ? '继续' : '暂停'}
        </button>
      </div>

      {/* 进度条 */}
      <div className="h-1.5 rounded-full bg-white/5 overflow-hidden mb-4">
        <div ref={progressRef} className="h-full rounded-full" style={{ background: GRAD, width: '0%' }} />
      </div>

      {/* 谱面 */}
      <div ref={wrapRef} className="relative">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          className="w-full block rounded-2xl border border-white/10 touch-none select-none"
        />
        {/* 倒数 */}
        {countdown !== null && countdown > 0 && !paused && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-7xl font-extrabold text-[#c084fc] drop-shadow-[0_0_24px_#a855f7]">
              {countdown}
            </div>
          </div>
        )}
        {/* 暂停层 */}
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
                退出选曲
              </button>
            </div>
            <div className="text-xs text-gray-500 font-mono">ESC 继续</div>
          </div>
        )}
      </div>

      <div className="mt-3 text-center text-xs text-gray-600 font-mono">
        {SONG_METAS.find((s) => s.id === songId)?.title} · {DIFFS[diff].label} · {TIMBRES.find((t) => t.id === timbre)?.label}
      </div>

      {/* 结算层 */}
      {phase === 'result' && result && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="card p-8 w-full max-w-[420px] text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: GRAD_SOFT }} />
            <div className="text-[11px] font-mono text-gray-500 tracking-widest mb-1">COMPILE RESULT</div>
            <div
              className="text-7xl font-extrabold leading-none mb-1"
              style={{ color: GRADE_COLOR[result.grade], textShadow: `0 0 32px ${GRADE_COLOR[result.grade]}80` }}
            >
              {result.grade}
            </div>
            {result.fc && (
              <div className="text-[#22d3ee] font-bold text-sm mb-1 font-mono">★ FULL COMBO ★</div>
            )}
            {result.newBest && <div className="text-[#f59e0b] text-xs font-bold mb-1">🏆 新纪录！</div>}
            <div className="text-3xl font-extrabold text-text-bright my-3 font-mono">
              {result.score.toLocaleString()}
            </div>
            <div className="grid grid-cols-4 gap-2 text-center mb-5 font-mono">
              <div>
                <div className="text-[#22d3ee] font-bold text-lg">{result.perfect}</div>
                <div className="text-[10px] text-gray-500">PERFECT</div>
              </div>
              <div>
                <div className="text-[#c084fc] font-bold text-lg">{result.good}</div>
                <div className="text-[10px] text-gray-500">GOOD</div>
              </div>
              <div>
                <div className="text-gray-400 font-bold text-lg">{result.miss}</div>
                <div className="text-[10px] text-gray-500">MISS</div>
              </div>
              <div>
                <div className="text-text-bright font-bold text-lg">{result.acc.toFixed(1)}%</div>
                <div className="text-[10px] text-gray-500">ACC</div>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => void startGame()}
                className="rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold py-2.5 px-8 transition-colors cursor-pointer"
              >
                再来一次
              </button>
              <button
                onClick={() => setPhase('menu')}
                className="rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 font-bold py-2.5 px-8 transition-colors cursor-pointer"
              >
                返回选曲
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
