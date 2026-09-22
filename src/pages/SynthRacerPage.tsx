import { useEffect, useRef, useState, useCallback } from 'react';
import { CarVoiceEngine } from '../audio/carVoiceEngine';
import type { CarVoiceParams, Waveform } from '../audio/carVoiceEngine';
import Slider from '../components/Slider';
import { Link } from 'react-router-dom';

// ===== 赛道（世界坐标，闭合环线）=====
const ROAD_W = 80; // 路面半宽
const MAX_SPEED = 360;
const ACCEL = 340;
const BRAKE = 520;
const DRAG = 0.7;
const STEER = 2.9; // rad/s @ full speed
const TOTAL_LAPS = 3;

interface Vec { x: number; y: number; }

// 闭合赛道控制点：底部直线（起跑直道）+ 右大弯 + 顶部 S 形弯道 + 左大弯，自然闭环
const TRACK_CONTROL: Vec[] = [
  { x: -400, y: 200 },  // 0 起点/终点（底部直道左端）
  { x: 400, y: 200 },   // 1 底部直道右端（起跑直线）
  { x: 560, y: 150 },   // 2 右弯入口
  { x: 620, y: 0 },     // 3 右侧顶点
  { x: 560, y: -150 },  // 4 右弯出口
  { x: 400, y: -210 },  // 5 S 弯道起点
  { x: 250, y: -170 },  // 6 S 上弯
  { x: 150, y: -250 },  // 7 S 下弯
  { x: 0, y: -190 },    // 8 S 回正
  { x: -180, y: -210 }, // 9 顶部直道
  { x: -560, y: -150 }, // 10 左弯入口
  { x: -620, y: 0 },    // 11 左侧顶点
  { x: -560, y: 150 },  // 12 左弯出口
];

function catmullRom(p0: Vec, p1: Vec, p2: Vec, p3: Vec, t: number): Vec {
  const t2 = t * t;
  const t3 = t2 * t;
  return {
    x: 0.5 * (2 * p1.x + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
    y: 0.5 * (2 * p1.y + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
  };
}

const SAMPLES_PER_SEG = 14;
const TRACK_POINTS: Vec[] = (() => {
  const pts: Vec[] = [];
  const m = TRACK_CONTROL.length;
  for (let i = 0; i < m; i++) {
    const p0 = TRACK_CONTROL[(i - 1 + m) % m];
    const p1 = TRACK_CONTROL[i];
    const p2 = TRACK_CONTROL[(i + 1) % m];
    const p3 = TRACK_CONTROL[(i + 2) % m];
    for (let s = 0; s < SAMPLES_PER_SEG; s++) {
      pts.push(catmullRom(p0, p1, p2, p3, s / SAMPLES_PER_SEG));
    }
  }
  return pts;
})();
const N = TRACK_POINTS.length;

function trackTangent(i: number): Vec {
  const a = TRACK_POINTS[(i - 1 + N) % N];
  const b = TRACK_POINTS[(i + 1) % N];
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  return { x: dx / len, y: dy / len };
}

function nearestIndex(px: number, py: number): number {
  let best = 0;
  let bd = Infinity;
  for (let i = 0; i < N; i++) {
    const dx = TRACK_POINTS[i].x - px;
    const dy = TRACK_POINTS[i].y - py;
    const d = dx * dx + dy * dy;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}

// ===== 游戏状态 =====
interface GameState {
  x: number; y: number; angle: number; speed: number;
  accum: number; prevIdx: number; onTrack: boolean;
  lapStartTime: number; raceStartTime: number;
  bestLap: number; lapsCompleted: number; prevLaps: number;
  boostTimer: number; boostCd: number; finished: boolean;
}

const INITIAL_PARAMS: CarVoiceParams = {
  waveform: 'sawtooth', cutoff: 0.6, detune: 0, reverbWet: 0.12, volume: 0.5,
};

const WAVEFORMS: { id: Waveform; label: string }[] = [
  { id: 'sine', label: '正弦' },
  { id: 'triangle', label: '三角' },
  { id: 'sawtooth', label: '锯齿' },
  { id: 'square', label: '方波' },
];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function SynthRacerPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CarVoiceEngine | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const runningRef = useRef(false);
  const rafRef = useRef<number>(0);
  const lastTRef = useRef(0);
  const lastHudRef = useRef(0);
  const paramsRef = useRef<CarVoiceParams>({ ...INITIAL_PARAMS });

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);
  const [params, setParams] = useState<CarVoiceParams>({ ...INITIAL_PARAMS });
  const [hud, setHud] = useState({ speed: 0, lap: 1, total: TOTAL_LAPS, cur: 0, best: 0, wrongWay: false, offTrack: false });

  const resetState = useCallback(() => {
    const start = TRACK_POINTS[0];
    const tan = trackTangent(0);
    stateRef.current = {
      x: start.x, y: start.y, angle: Math.atan2(tan.y, tan.x), speed: 0,
      accum: 0, prevIdx: 0, onTrack: true,
      lapStartTime: performance.now(), raceStartTime: performance.now(),
      bestLap: Infinity, lapsCompleted: 0, prevLaps: 0,
      boostTimer: 0, boostCd: 0, finished: false,
    };
  }, []);

  const startGame = useCallback(async () => {
    const engine = new CarVoiceEngine();
    engineRef.current = engine;
    engine.setParams(paramsRef.current);
    await engine.start();
    resetState();
    setFinished(false);
    setPaused(false);
    setStarted(true);
    runningRef.current = true;
    lastTRef.current = performance.now();
  }, [resetState]);

  // 驾驶舱面板改参数 -> 实时作用于引擎
  useEffect(() => {
    paramsRef.current = params;
    engineRef.current?.setParams(params);
  }, [params]);

  // 主循环
  useEffect(() => {
    if (!started) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const st = stateRef.current!;
      const w = canvas.width, h = canvas.height;
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, w, h);

      const zoom = 0.92;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(-st.x, -st.y);

      // 路面
      ctx.beginPath();
      ctx.moveTo(TRACK_POINTS[0].x, TRACK_POINTS[0].y);
      for (let i = 1; i < N; i++) ctx.lineTo(TRACK_POINTS[i].x, TRACK_POINTS[i].y);
      ctx.closePath();
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.lineWidth = ROAD_W * 2;
      ctx.strokeStyle = '#1e2536';
      ctx.stroke();
      // 路缘
      ctx.lineWidth = ROAD_W * 2;
      ctx.strokeStyle = 'rgba(34,211,238,0.10)';
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#334155';
      ctx.stroke();
      // 中心虚线
      ctx.setLineDash([22, 22]);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#475569';
      ctx.stroke();
      ctx.setLineDash([]);

      // 起跑/终点线（棋盘格）
      const t0 = trackTangent(0);
      const nx = -t0.y, ny = t0.x;
      const sx = TRACK_POINTS[0].x, sy = TRACK_POINTS[0].y;
      const cells = 8;
      for (let c = 0; c < cells; c++) {
        const o = -ROAD_W + (c + 0.5) * (ROAD_W * 2 / cells);
        for (let r = 0; r < 2; r++) {
          ctx.fillStyle = ((c + r) % 2 === 0) ? '#e2e8f0' : '#0f172a';
          ctx.fillRect(
            sx + nx * o - t0.x * 6 + (r === 0 ? 0 : t0.x * 12) - 6,
            sy + ny * o - t0.y * 6 + (r === 0 ? 0 : t0.y * 12) - 6,
            12, 12,
          );
        }
      }

      // 车辆
      ctx.save();
      ctx.translate(st.x, st.y);
      ctx.rotate(st.angle);
      ctx.fillStyle = st.onTrack ? '#22d3ee' : '#f87171';
      ctx.strokeStyle = '#0a0a14';
      ctx.lineWidth = 2;
      const L = 34, W = 16;
      ctx.beginPath();
      ctx.moveTo(L / 2, 0);
      ctx.lineTo(-L / 2 + 6, -W / 2);
      ctx.lineTo(-L / 2, -W / 2 + 4);
      ctx.lineTo(-L / 2, W / 2 - 4);
      ctx.lineTo(-L / 2 + 6, W / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // 座舱
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-6, -5, 12, 10);
      ctx.restore();

      ctx.restore();
    };

    const loop = (t: number) => {
      if (!runningRef.current) return;
      const st = stateRef.current!;
      const dt = Math.min(0.05, (t - lastTRef.current) / 1000 || 0);
      lastTRef.current = t;

      const keys = keysRef.current;
      const up = keys.has('ArrowUp') || keys.has('KeyW');
      const down = keys.has('ArrowDown') || keys.has('KeyS');
      const left = keys.has('ArrowLeft') || keys.has('KeyA');
      const right = keys.has('ArrowRight') || keys.has('KeyD');

      // 计时器
      st.boostTimer = Math.max(0, st.boostTimer - dt);
      st.boostCd = Math.max(0, st.boostCd - dt);

      const boosting = st.boostTimer > 0;
      const offPenalty = st.onTrack ? 1 : 0.45;

      if (up) st.speed += ACCEL * dt;
      if (down) st.speed -= BRAKE * dt;
      st.speed *= (1 - DRAG * dt);
      const cap = MAX_SPEED * offPenalty * (boosting ? 1.5 : 1);
      st.speed = clamp(st.speed, -MAX_SPEED * 0.4, cap);

      const steer = (left ? -1 : 0) + (right ? 1 : 0);
      const steerFactor = STEER * (st.speed / MAX_SPEED) * dt * (st.speed >= 0 ? 1 : -1);
      st.angle += steer * steerFactor;

      st.x += Math.cos(st.angle) * st.speed * dt;
      st.y += Math.sin(st.angle) * st.speed * dt;

      // 赛道进度 / 圈数
      const idx = nearestIndex(st.x, st.y);
      const dist = Math.hypot(TRACK_POINTS[idx].x - st.x, TRACK_POINTS[idx].y - st.y);
      const wasOnTrack = st.onTrack;
      st.onTrack = dist <= ROAD_W;
      if (wasOnTrack && !st.onTrack) {
        engineRef.current?.playImpact(clamp(Math.abs(st.speed) / MAX_SPEED, 0.3, 1));
      }

      let d = idx - st.prevIdx;
      if (d > N / 2) d -= N; else if (d < -N / 2) d += N;
      st.accum += d;
      st.prevIdx = idx;

      const lapFloat = st.accum / N;
      st.lapsCompleted = Math.max(0, Math.floor(lapFloat));

      if (st.lapsCompleted > st.prevLaps) {
        const now = performance.now();
        const lapTime = (now - st.lapStartTime) / 1000;
        if (lapTime < st.bestLap) st.bestLap = lapTime;
        st.lapStartTime = now;
        st.prevLaps = st.lapsCompleted;
      }

      // 逆行检测
      const tan = trackTangent(idx);
      const vx = Math.cos(st.angle), vy = Math.sin(st.angle);
      const wrongWay = st.speed > 20 && (vx * tan.x + vy * tan.y) < -0.2;

      // 完成
      if (st.lapsCompleted >= TOTAL_LAPS && !st.finished) {
        st.finished = true;
        runningRef.current = false;
        engineRef.current?.setEngineLevel(0);
        setFinished(true);
        setHud(prev => ({ ...prev, cur: st.bestLap === Infinity ? 0 : st.bestLap }));
        return;
      }

      // 引擎声
      const rpm = clamp(st.speed / MAX_SPEED, 0, 1);
      const throttle = up ? 1 : (boosting ? 1 : 0);
      engineRef.current?.update(rpm, throttle);

      render();

      // HUD 节流
      if (t - lastHudRef.current > 100) {
        lastHudRef.current = t;
        const now = performance.now();
        const curLap = st.finished ? 0 : (now - st.lapStartTime) / 1000;
        setHud({
          speed: Math.round(Math.abs(st.speed) * 0.6),
          lap: Math.min(st.lapsCompleted + 1, TOTAL_LAPS),
          total: TOTAL_LAPS,
          cur: curLap,
          best: st.bestLap === Infinity ? 0 : st.bestLap,
          wrongWay,
          offTrack: !st.onTrack,
        });
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      runningRef.current = false;
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [started]);

  // 键盘
  useEffect(() => {
    if (!started) return;
    const down = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      keysRef.current.add(e.code);
      if (e.code === 'Space' && stateRef.current && stateRef.current.boostCd <= 0 && !stateRef.current.finished) {
        stateRef.current.boostTimer = 0.7;
        stateRef.current.boostCd = 3;
        engineRef.current?.playBoost();
      }
      if (e.code === 'KeyP') togglePause();
      if (e.code === 'KeyR') { resetState(); setFinished(false); setPaused(false); runningRef.current = true; lastTRef.current = performance.now(); }
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, [started, resetState]);

  const togglePause = useCallback(() => {
    setPaused(prev => {
      const next = !prev;
      runningRef.current = !next;
      if (next) engineRef.current?.setEngineLevel(0);
      else { lastTRef.current = performance.now(); engineRef.current?.setEngineLevel(0.0001); }
      return next;
    });
  }, []);

  const fmt = (s: number) => s > 0 ? s.toFixed(2) + 's' : '--';

  return (
    <div className="relative w-full" style={{ height: 'calc(100vh - 73px)' }}>
      <canvas ref={canvasRef} className="block w-full h-full" />

      {/* 返回游戏中心 */}
      <Link
        to="/game-center"
        className="absolute bottom-4 left-4 z-30 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-gray-200 text-xs font-semibold border border-white/15 backdrop-blur transition-all"
      >
        ← 游戏中心
      </Link>

      {/* HUD */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
        <div className="bg-black/50 backdrop-blur rounded-xl px-4 py-3 border border-white/10">
          <div className="text-[10px] text-gray-500 tracking-widest">SPEED</div>
          <div className="text-2xl font-black text-cyan-400 tabular-nums">{hud.speed}<span className="text-sm text-gray-500 ml-1">km/h</span></div>
        </div>
        <div className="bg-black/50 backdrop-blur rounded-xl px-4 py-3 border border-white/10">
          <div className="text-[10px] text-gray-500 tracking-widest">LAP</div>
          <div className="text-lg font-bold text-white tabular-nums">{hud.lap} / {hud.total}</div>
          <div className="text-[11px] text-gray-400 tabular-nums">本圈 {fmt(hud.cur)}</div>
          <div className="text-[11px] text-purple-300 tabular-nums">最佳 {fmt(hud.best)}</div>
        </div>
      </div>

      {(hud.wrongWay || hud.offTrack) && !finished && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-500/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg animate-pulse">
          {hud.wrongWay ? '⚠ 逆行 WRONG WAY' : '⚠ 偏离赛道'}
        </div>
      )}

      {/* 驾驶舱面板 */}
      {started && (
        <div className="absolute top-4 right-4 w-64 bg-black/55 backdrop-blur rounded-2xl p-4 border border-purple-500/25">
          <div className="text-[10px] font-bold text-purple-300 tracking-widest mb-3">SYNTH COCKPIT · 声音皮肤</div>
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            {WAVEFORMS.map(w => (
              <button
                key={w.id}
                onClick={() => setParams(p => ({ ...p, waveform: w.id }))}
                className="text-[11px] py-1.5 rounded-lg border transition-all"
                style={{
                  borderColor: params.waveform === w.id ? '#a855f7aa' : 'rgba(255,255,255,0.1)',
                  background: params.waveform === w.id ? '#a855f720' : 'transparent',
                  color: params.waveform === w.id ? '#c4b5fd' : '#94a3b8',
                }}
              >
                {w.label}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            <Slider label="CUTOFF 亮度" value={params.cutoff} onChange={(v) => setParams(p => ({ ...p, cutoff: v }))} min={0} max={1} step={0.01} color="#a855f7" displayValue={`${Math.round(params.cutoff * 100)}%`} />
            <Slider label="DETUNE 失谐" value={params.detune} onChange={(v) => setParams(p => ({ ...p, detune: v }))} min={-100} max={100} step={1} color="#a855f7" displayValue={`${Math.round(params.detune)}¢`} />
            <Slider label="REVERB 空间" value={params.reverbWet} onChange={(v) => setParams(p => ({ ...p, reverbWet: v }))} min={0} max={1} step={0.01} color="#a855f7" displayValue={`${Math.round(params.reverbWet * 100)}%`} />
            <Slider label="VOLUME 音量" value={params.volume} onChange={(v) => setParams(p => ({ ...p, volume: v }))} min={0} max={1} step={0.01} color="#a855f7" displayValue={`${Math.round(params.volume * 100)}%`} />
          </div>
        </div>
      )}

      {/* 开始遮罩 */}
      {!started && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center max-w-md px-6">
            <div className="text-5xl mb-3">🏎️</div>
            <h1 className="text-2xl font-black text-white mb-2">合成器竞速 · Synth Racer</h1>
            <p className="text-sm text-gray-400 leading-relaxed mb-1">
              用你调出的合成器音色当引擎声。转速驱动音高、油门驱动明亮度，
            </p>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
              右侧驾驶舱可实时改波形 / 滤波 / 失谐 / 混响——边开边调。
            </p>
            <button
              onClick={startGame}
              className="px-6 py-3 rounded-xl text-white font-bold text-sm transition-all"
              style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}
            >
              ▶ 开始驾驶
            </button>
            <p className="text-[11px] text-gray-500 mt-4">方向键 / WASD 驾驶 · 空格 Boost · P 暂停 · R 重开</p>
          </div>
        </div>
      )}

      {/* 暂停遮罩 */}
      {started && paused && !finished && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-2xl font-black text-white mb-4">⏸ 已暂停</div>
            <button onClick={togglePause} className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm mr-2">继续</button>
            <button onClick={() => { resetState(); setFinished(false); setPaused(false); runningRef.current = true; lastTRef.current = performance.now(); }} className="px-5 py-2.5 rounded-xl border border-white/20 text-gray-300 hover:text-white font-bold text-sm">重开</button>
          </div>
        </div>
      )}

      {/* 完成遮罩 */}
      {finished && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center">
            <div className="text-4xl mb-2">🏁</div>
            <h2 className="text-2xl font-black text-white mb-1">完赛！</h2>
            <p className="text-sm text-gray-300 mb-1">最佳单圈 <span className="text-purple-300 font-bold">{fmt(hud.best)}</span></p>
            <p className="text-xs text-gray-500 mb-5">共 {TOTAL_LAPS} 圈</p>
            <button onClick={() => { resetState(); setFinished(false); setPaused(false); runningRef.current = true; lastTRef.current = performance.now(); }} className="px-6 py-3 rounded-xl text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg,#a855f7,#7c3aed)' }}>再来一局</button>
          </div>
        </div>
      )}
    </div>
  );
}
