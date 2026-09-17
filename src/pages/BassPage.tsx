import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BassEngine } from '../audio/bassEngine';
import type { BassParams, BassMode, EnvPoint } from '../audio/types';
import { DEFAULT_BASS_PARAMS, KEYBOARD_MAP, midiToFreq } from '../audio/types';
import { BASS_PRESETS } from '../audio/bassPresets';
import Slider from '../components/Slider';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMIDI } from '../hooks/useMIDI';
import { useRecorder } from '../hooks/useRecorder';

const MODE_COLORS: Record<BassMode, string> = {
  DROP: '#fb923c',
  IMPACT: '#3b82f6',
  RUMBLE: '#ef4444',
};

const MODE_LABELS: Record<BassMode, string> = {
  DROP: 'SOURCE QUADRATURE',
  IMPACT: 'TRANSIENT',
  RUMBLE: 'DARK SEISMIC',
};

const PIANO_KEYS = [
  { key: 'a', note: 'C', type: 'white' },
  { key: 'w', note: 'C#', type: 'black' },
  { key: 's', note: 'D', type: 'white' },
  { key: 'e', note: 'D#', type: 'black' },
  { key: 'd', note: 'E', type: 'white' },
  { key: 'f', note: 'F', type: 'white' },
  { key: 't', note: 'F#', type: 'black' },
  { key: 'g', note: 'G', type: 'white' },
  { key: 'y', note: 'G#', type: 'black' },
  { key: 'h', note: 'A', type: 'white' },
  { key: 'u', note: 'A#', type: 'black' },
  { key: 'j', note: 'B', type: 'white' },
  { key: 'k', note: 'C', type: 'white' },
];

const genId = () => Math.random().toString(36).substr(2, 9);

const initPts = (arr: [number, number][]): EnvPoint[] =>
  arr.map(([x, y]) => ({ x, y, tension: 0, id: genId() }));

// === Graph Editor Component ===

function GraphEditor({
  pitchEnv, setPitchEnv, ampEnv, setAmpEnv,
  activeLayer, setActiveLayer, duration, minFreq,
  color, presetName,
}: {
  pitchEnv: EnvPoint[];
  setPitchEnv: (p: EnvPoint[]) => void;
  ampEnv: EnvPoint[];
  setAmpEnv: (p: EnvPoint[]) => void;
  activeLayer: 'PITCH' | 'AMP';
  setActiveLayer: (l: 'PITCH' | 'AMP') => void;
  duration: number;
  minFreq: number;
  color: string;
  presetName: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ width: 1, height: 1 });
  const [mode, setMode] = useState<'POINT' | 'CURVE'>('POINT');
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number; val: string; time: string } | null>(null);
  const [flash, setFlash] = useState(0);
  const prevPreset = useRef(presetName);

  // Flash effect when preset changes
  useEffect(() => {
    if (prevPreset.current !== presetName) {
      prevPreset.current = presetName;
      setFlash(f => f + 1);
    }
  }, [presetName]);

  // Re-measure container when preset changes
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (rect.width > 1 && rect.height > 1) {
      setDims({ width: Math.round(rect.width), height: Math.round(rect.height) });
    }
  }, [flash]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const update = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width > 1 && rect.height > 1) {
        setDims({ width: Math.round(rect.width), height: Math.round(rect.height) });
      }
    };
    const ro = new ResizeObserver(update);
    ro.observe(node);
    window.addEventListener('resize', update);
    update();
    const timer = setTimeout(update, 250);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); clearTimeout(timer); };
  }, []);

  const points = activeLayer === 'PITCH' ? pitchEnv : ampEnv;
  const setPoints = activeLayer === 'PITCH' ? setPitchEnv : setAmpEnv;

  const toPx = (p: EnvPoint) => ({ x: p.x * dims.width, y: (1 - p.y) * dims.height });
  const toNorm = (pxX: number, pxY: number) => ({
    x: Math.max(0, Math.min(1, pxX / Math.max(1, dims.width))),
    y: Math.max(0, Math.min(1, 1 - (pxY / Math.max(1, dims.height)))),
  });

  const getCP = (p1: EnvPoint, p2: EnvPoint, t: number) => {
    const a = toPx(p1), b = toPx(p2);
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + (t * 100) };
  };

  const makePath = (pts: EnvPoint[]) => {
    if (!pts.length) return '';
    const start = toPx(pts[0]);
    let d = `M ${start.x} ${start.y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[i], p2 = pts[i + 1];
      const dest = toPx(p2);
      if (Math.abs(p1.tension || 0) < 0.01) d += ` L ${dest.x} ${dest.y}`;
      else { const cp = getCP(p1, p2, p1.tension); d += ` Q ${cp.x} ${cp.y} ${dest.x} ${dest.y}`; }
    }
    return d;
  };

  const handleMouseDown = (e: React.MouseEvent, type: 'point' | 'line', idx: number) => {
    e.preventDefault();
    e.stopPropagation();
    if ((mode === 'CURVE' && type === 'point') || (mode === 'POINT' && type === 'line')) return;
    const startY = e.clientY;
    const startTension = type === 'line' ? (points[idx].tension || 0) : 0;

    const onMove = (ev: MouseEvent) => {
      const rect = containerRef.current!.getBoundingClientRect();
      const newPts = [...points];
      if (type === 'point') {
        const norm = toNorm(ev.clientX - rect.left, ev.clientY - rect.top);
        if (idx === 0) norm.x = 0;
        if (idx === points.length - 1) norm.x = 1;
        newPts[idx] = { ...newPts[idx], x: norm.x, y: norm.y };
        setPoints(newPts.sort((a, b) => a.x - b.x));
      } else {
        newPts[idx] = { ...newPts[idx], tension: Math.max(-1.5, Math.min(1.5, startTension + (startY - ev.clientY) * 0.005)) };
        setPoints(newPts);
      }
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleBgClick = (e: React.MouseEvent) => {
    if (mode !== 'POINT') return;
    const rect = containerRef.current!.getBoundingClientRect();
    const norm = toNorm(e.clientX - rect.left, e.clientY - rect.top);
    setPoints([...points, { ...norm, tension: 0, id: genId() }].sort((a, b) => a.x - b.x));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const norm = toNorm(e.clientX - rect.left, e.clientY - rect.top);
    const val = activeLayer === 'PITCH'
      ? `${(minFreq + norm.y * (200 - minFreq)).toFixed(0)} Hz`
      : `${(norm.y * 100).toFixed(0)}%`;
    setHoverPos({ x: e.clientX + 20, y: e.clientY + 20, val, time: (norm.x * duration).toFixed(2) + 's' });
  };

  const inactiveColor = '#333';
  const inactivePath = activeLayer === 'PITCH' ? makePath(ampEnv) : makePath(pitchEnv);

  return (
    <div
      ref={containerRef}
      className="relative w-full flex-1 bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden select-none group"
      style={{
        backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setHoverPos(null)}
      onMouseDown={handleBgClick}
    >
      <style>{`
        @keyframes flashFade {
          0% { opacity: 0.25; }
          100% { opacity: 0; }
        }
        @keyframes pulseOnce {
          0% { transform: scale(0.92); opacity: 0; }
          40% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pulse-once {
          animation: pulseOnce 0.4s ease-out;
        }
        .env-curve {
          transition: d 0.3s ease-out, opacity 0.3s ease-out;
        }
      `}</style>
      {/* Layer + Mode toggles */}
      <div className="absolute top-4 left-4 flex gap-4 z-20 pointer-events-none">
        <div className="pointer-events-auto flex gap-1 bg-zinc-900 rounded p-1 border border-zinc-700 shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
      >
          {(['PITCH', 'AMP'] as const).map(l => (
            <button key={l} onClick={() => setActiveLayer(l)}
              className={`text-[10px] px-3 py-1 font-bold rounded transition-all ${
                activeLayer === l
                  ? (l === 'PITCH' ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-700 text-white')
                  : 'text-zinc-500'
              }`}>
              {l}
            </button>
          ))}
        </div>
        <div className="pointer-events-auto flex gap-1 bg-zinc-900 rounded p-1 border border-zinc-700 shadow-xl"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {(['POINT', 'CURVE'] as const).map(m => (
            <button key={m} onClick={(e) => { e.stopPropagation(); setMode(m); }}
              className={`text-[10px] px-3 py-1 font-bold rounded transition-all ${
                mode === m
                  ? (m === 'POINT' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white')
                  : 'text-zinc-500'
              }`}>
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Preset name badge (top-right) */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none">
        <div
          key={flash}
          className="px-3 py-1.5 rounded-lg border shadow-xl font-bold text-[11px] tracking-wide animate-pulse-once"
          style={{
            borderColor: `${color}40`,
            background: `${color}15`,
            color: color,
          }}
        >
          {presetName}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoverPos && (
        <div className="fixed z-50 bg-zinc-900/95 border border-zinc-700 px-2 py-1 rounded text-[10px] font-mono text-green-400 pointer-events-none whitespace-nowrap shadow-xl"
          style={{ left: hoverPos.x, top: hoverPos.y }}>
          <div>T: {hoverPos.time}</div>
          <div>V: {hoverPos.val}</div>
        </div>
      )}

      {/* SVG paths */}
      <svg width="100%" height="100%" viewBox={`0 0 ${dims.width} ${dims.height}`} preserveAspectRatio="none"
        className={`absolute inset-0 w-full h-full ${mode === 'CURVE' ? 'cursor-ew-resize' : 'cursor-crosshair'}`}>
        {/* Flash overlay on preset change */}
        {flash > 0 && (
          <rect key={`flash-${flash}`} x={0} y={0} width={dims.width} height={dims.height}
            fill={color} opacity={0}
            style={{ animation: 'flashFade 0.6s ease-out forwards' }}
            pointerEvents="none"
          />
        )}
        {/* Inactive layer (dashed) */}
        <path d={inactivePath} fill="none" stroke={inactiveColor} strokeWidth="2" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
        {/* Active layer */}
        <path
          d={makePath(points)}
          fill="none"
          stroke={color}
          strokeWidth="3"
          className="env-curve"
          vectorEffect="non-scaling-stroke"
        />
        {/* Fill */}
        <path
          d={`${makePath(points)} L ${dims.width} ${dims.height} L 0 ${dims.height} Z`}
          fill={color}
          opacity="0.1"
          pointerEvents="none"
        />
        {/* Curve hit areas */}
        {mode === 'CURVE' && points.map((pt, i) => i < points.length - 1 && (
          <path key={`l${i}`} d={makePath([pt, points[i + 1]])} stroke="transparent" strokeWidth="20" fill="none"
            className="cursor-ns-resize" onMouseDown={(e) => handleMouseDown(e, 'line', i)} />
        ))}
        {/* Points */}
        {mode === 'POINT' && points.map((pt, i) => {
          const px = toPx(pt);
          return (
            <circle key={pt.id} cx={px.x} cy={px.y} r="6" fill="#18181b" stroke={color} strokeWidth="2"
              className="cursor-pointer hover:fill-white"
              onMouseDown={(e) => handleMouseDown(e, 'point', i)}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (i > 0 && i < points.length - 1) {
                  setPoints(points.filter((_, idx) => idx !== i));
                }
              }}
            />
          );
        })}
      </svg>

      {/* Instructions */}
      <div className="absolute bottom-3 right-4 text-[9px] text-zinc-600 font-mono pointer-events-none">
        CLICK: add · DRAG: move · DBL-CLICK: delete
      </div>
    </div>
  );
}

// === Main Page ===

export default function BassPage() {
  const engineRef = useRef<BassEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [activePreset, setActivePreset] = useState(0);
  const [params, setParams] = useState<BassParams>({ ...DEFAULT_BASS_PARAMS });

  // Envelope states
  const [dropPitch, setDropPitch] = useState<EnvPoint[]>(initPts([[0, 0.8], [0.3, 0.2], [1, 0]]));
  const [dropAmp, setDropAmp] = useState<EnvPoint[]>(initPts([[0, 0], [0.1, 1], [0.8, 0.5], [1, 0]]));
  const [impactPitch, setImpactPitch] = useState<EnvPoint[]>(initPts([[0, 1], [0.05, 0], [1, 0]]));
  const [impactAmp, setImpactAmp] = useState<EnvPoint[]>(initPts([[0, 1], [0.8, 0]]));
  const [rumblePitch, setRumblePitch] = useState<EnvPoint[]>(initPts([[0, 0.2], [0.5, 0.3], [1, 0.1]]));
  const [rumbleAmp, setRumbleAmp] = useState<EnvPoint[]>(initPts([[0, 0], [0.2, 1], [0.8, 0.8], [1, 0]]));
  const [activeLayer, setActiveLayer] = useState<'PITCH' | 'AMP'>('PITCH');

  const [mouseActiveKey, setMouseActiveKey] = useState<string | null>(null);

  useEffect(() => {
    const engine = new BassEngine();
    engineRef.current = engine;
    return () => { engine.destroy(); };
  }, []);

  const engine = engineRef.current;
  const mode = params.mode;
  const color = MODE_COLORS[mode];

  const getEnvs = useCallback(() => {
    if (mode === 'DROP') return { pitch: dropPitch, amp: dropAmp };
    if (mode === 'IMPACT') return { pitch: impactPitch, amp: impactAmp };
    return { pitch: rumblePitch, amp: rumbleAmp };
  }, [mode, dropPitch, dropAmp, impactPitch, impactAmp, rumblePitch, rumbleAmp]);

  const getCurrentDuration = useCallback(() => {
    if (mode === 'DROP') return params.dropDuration;
    if (mode === 'IMPACT') return 0.8;
    return params.rumbleDuration;
  }, [mode, params.dropDuration, params.rumbleDuration]);

  const trigger = useCallback(async (rootFreq?: number) => {
    if (!engine) return;
    if (rootFreq !== undefined) {
      engine.setParam('rootFreq', rootFreq);
    }
    const envs = getEnvs();
    await engine.trigger(envs.pitch, envs.amp);

    // Draw oscilloscope
    const draw = () => {
      const canvas = canvasRef.current;
      const analyser = engine.getAnalyser();
      if (!canvas || !analyser) return;
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width, h = canvas.height;
      const d = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteTimeDomainData(d);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 2;
      ctx.strokeStyle = color;
      ctx.beginPath();
      let x = 0;
      const slice = w / d.length;
      for (let i = 0; i < d.length; i++) {
        ctx[i === 0 ? 'moveTo' : 'lineTo'](x, (d[i] / 128.0) * h / 2);
        x += slice;
      }
      ctx.stroke();
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    const dur = getCurrentDuration();
    setTimeout(() => cancelAnimationFrame(rafRef.current), (dur + 3) * 1000);
  }, [engine, getEnvs, getCurrentDuration, color]);

  const selectPreset = useCallback((idx: number) => {
    setActivePreset(idx);
    const preset = BASS_PRESETS[idx];
    const newParams = { ...DEFAULT_BASS_PARAMS, ...preset.params, mode: preset.mode } as BassParams;
    if (engine) engine.setParams(newParams);
    setParams(newParams);

    if (preset.mode === 'DROP') {
      setDropPitch(preset.pitchEnv);
      setDropAmp(preset.ampEnv);
    } else if (preset.mode === 'IMPACT') {
      setImpactPitch(preset.pitchEnv);
      setImpactAmp(preset.ampEnv);
    } else {
      setRumblePitch(preset.pitchEnv);
      setRumbleAmp(preset.ampEnv);
    }
  }, [engine]);

  const updateParam = useCallback(<K extends keyof BassParams>(key: K, value: BassParams[K]) => {
    if (!engine) return;
    engine.setParam(key, value);
    setParams(prev => ({ ...prev, [key]: value }));
  }, [engine]);

  const switchMode = useCallback((m: BassMode) => {
    updateParam('mode', m);
  }, [updateParam]);

  // Keyboard
  const { octave, activeNotes } = useKeyboard({
    onNoteOn: (midi) => {
      const freq = midiToFreq(midi + (octave - 4) * 12 + 24); // low octave
      trigger(Math.max(20, Math.min(200, freq)));
    },
    onNoteOff: () => {},
    baseOctave: 2,
  });

  // MIDI
  const midi = useMIDI({
    onNoteOn: (note) => {
      const freq = midiToFreq(note + 24); // low octave
      trigger(Math.max(20, Math.min(200, freq)));
    },
    onNoteOff: () => {},
  });

  // Recorder
  const recorder = useRecorder(() => engine?.getRecordStream() ?? null);

  // Mouse piano
  const handlePianoDown = (pk: typeof PIANO_KEYS[0]) => {
    setMouseActiveKey(pk.key);
    const midi = KEYBOARD_MAP[pk.key] ?? 0;
    const freq = midiToFreq(midi + (octave - 4) * 12 + 24);
    trigger(Math.max(20, Math.min(200, freq)));
  };
  const handlePianoUp = () => setMouseActiveKey(null);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 flex flex-col">
      {/* Top bar */}
      <div className="border-b border-zinc-800 flex items-center justify-between px-6 py-3 bg-zinc-900/50 backdrop-blur z-10">
        <div className="flex items-center gap-6">
          <Link to="/audio/synth-lab" className="px-3 py-1.5 rounded border border-zinc-800 text-zinc-500 hover:text-white hover:bg-zinc-800 text-[10px] font-black tracking-widest transition-colors">
            ← LAB
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg text-black"
              style={{ background: color, boxShadow: `0 0 16px ${color}50` }}>
              T
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tighter leading-tight">
                BASS <span className="text-zinc-500 font-normal text-xs ml-1">TITAN V10</span>
              </h1>
              <p className="text-[9px] text-zinc-600 font-mono">QUADRATURE SUB ENGINE</p>
            </div>
          </div>

          {/* Mode tabs */}
          <div className="flex bg-zinc-900 rounded-lg p-1 border border-zinc-800">
            {(['DROP', 'IMPACT', 'RUMBLE'] as BassMode[]).map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className={`px-4 py-1.5 text-xs font-black tracking-widest rounded transition-all ${
                  mode === m
                    ? 'text-black'
                    : 'text-zinc-500 hover:text-white'
                }`}
                style={mode === m ? { background: MODE_COLORS[m] } : {}}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Oscilloscope */}
          <div className="w-32 h-8 bg-zinc-900 rounded border border-zinc-800 relative overflow-hidden">
            <canvas ref={canvasRef} width={128} height={32} className="w-full h-full opacity-60" />
          </div>

          {/* MIDI status */}
          {midi.midiReady && (
            <div className="px-2 py-1 rounded-lg text-[10px] font-mono border border-zinc-700 bg-zinc-900 text-zinc-400">
              MIDI: {midi.midiDevices.join(', ') || 'ON'}
            </div>
          )}

          {/* Record button */}
          <button
            onClick={() => recorder.isRecording ? recorder.stop() : recorder.start()}
            className={`px-3 py-1.5 rounded font-bold text-[10px] tracking-widest border transition-all flex items-center gap-1.5 ${
              recorder.isRecording
                ? 'bg-red-900/50 border-red-500 text-red-100 animate-pulse'
                : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white'
            }`}>
            <div className={`w-2 h-2 rounded-full ${recorder.isRecording ? 'bg-red-500' : 'bg-zinc-600'}`} />
            {recorder.isRecording ? 'STOP REC' : 'REC WAV'}
          </button>

          {/* Master volume */}
          <div className="w-28">
            <Slider label="VOLUME" value={params.masterVol} min={0} max={1} step={0.01}
              onChange={(v) => updateParam('masterVol', v)} color="#fff" />
          </div>

          {/* Trigger */}
          <button onClick={() => trigger()}
            className="px-8 py-2 rounded-full font-bold text-black shadow-lg hover:scale-105 active:scale-95 transition-all"
            style={{ background: color, boxShadow: `0 0 20px ${color}40` }}>
            TRIGGER
          </button>
        </div>
      </div>

      {/* Master FX bar */}
      <div className="border-b border-zinc-800 flex items-center px-8 py-3 gap-6 justify-center bg-zinc-900/30">
        <button onClick={() => updateParam('isMono', !params.isMono)}
          className={`px-4 py-1.5 rounded font-bold text-[10px] tracking-widest border transition-all ${
            params.isMono
              ? 'bg-yellow-500 text-black border-yellow-500'
              : 'bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white'
          }`}>
          {params.isMono ? '⚠ MONO' : 'STEREO'}
        </button>

        <div className="w-36">
          <Slider label="INFLATOR %" value={params.inflatorAmt} min={0} max={100} step={1}
            onChange={(v) => updateParam('inflatorAmt', v)} color="#a1a1aa" suffix="%" />
        </div>
        <div className="w-36">
          <Slider label="CURVE" value={params.inflatorCurve} min={-50} max={50} step={1}
            onChange={(v) => updateParam('inflatorCurve', v)} color="#a1a1aa" />
        </div>
        <div className="w-36">
          <Slider label="DARK SPACE" value={params.reverbMix} min={0} max={100} step={1}
            onChange={(v) => updateParam('reverbMix', v)} color="#a1a1aa" suffix="%" />
        </div>

        <div className="h-8 w-px bg-zinc-800 mx-1" />

        <button onClick={() => updateParam('inflatorClip', !params.inflatorClip)}
          className="flex items-center gap-2 cursor-pointer group">
          <div className={`w-3 h-3 rounded-full border transition-all ${
            params.inflatorClip ? 'bg-red-500 border-red-500 shadow-[0_0_8px_red]' : 'bg-zinc-800 border-zinc-600'
          }`} />
          <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300">CLIP</span>
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex p-6 min-h-0 gap-6">
        {/* Left: Presets */}
        <div className="w-48 flex flex-col gap-1.5 shrink-0">
          <div className="text-[10px] font-black tracking-widest text-zinc-500 border-b border-zinc-800 pb-2 mb-1">
            PRESETS
          </div>
          <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1">
            {BASS_PRESETS.map((preset, i) => {
              const isActive = i === activePreset;
              const pcolor = MODE_COLORS[preset.mode];
              return (
                <button key={i} onClick={() => selectPreset(i)}
                  className={`text-left px-3 py-2 rounded-lg border transition-all text-xs ${
                    isActive
                      ? 'border-zinc-600 bg-zinc-800/80'
                      : 'border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50'
                  }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: pcolor }} />
                    <span className={`font-bold ${isActive ? 'text-white' : 'text-zinc-400'}`}>{preset.name}</span>
                  </div>
                  <span className="text-[9px] text-zinc-600 ml-3.5">{preset.category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Mode params */}
        <div className="w-56 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-4 shrink-0 relative">
          <div className="absolute top-0 left-0 w-full h-1 rounded-t-2xl opacity-50"
            style={{ background: `linear-gradient(to right, ${color}, transparent)` }} />
          <div className="text-xs font-black tracking-widest border-b pb-2" style={{ color, borderColor: `${color}20` }}>
            {MODE_LABELS[mode]}
          </div>

          {mode === 'DROP' && (
            <>
              <Slider label="WIDTH" value={params.dropWidth} min={0} max={100} step={1}
                onChange={(v) => updateParam('dropWidth', v)} color={color} suffix="%"
                warning={params.dropWidth > 50}
                description={params.dropWidth > 50 ? '⚠ Phase cancellation in Mono' : 'Safe: Quadrature Phase'} />
              <Slider label="TONE" value={params.dropTone} min={0} max={100} step={1}
                onChange={(v) => updateParam('dropTone', v)} color={color} suffix="%" />
              <div className="my-1" />
              <Slider label="LENGTH" value={params.dropDuration} min={0.5} max={5.0} step={0.01}
                onChange={(v) => updateParam('dropDuration', v)} color={color} suffix="s" />
            </>
          )}

          {mode === 'IMPACT' && (
            <>
              <Slider label="DRIVE" value={params.impactDrive} min={0} max={100} step={1}
                onChange={(v) => updateParam('impactDrive', v)} color={color} suffix="%" />
              <Slider label="WIDTH" value={params.impactWidth} min={0} max={100} step={1}
                onChange={(v) => updateParam('impactWidth', v)} color={color} suffix="%"
                warning={params.impactWidth > 50}
                description={params.impactWidth > 50 ? '⚠ Phase cancellation in Mono' : 'Safe: Quadrature Phase'} />
            </>
          )}

          {mode === 'RUMBLE' && (
            <>
              <Slider label="SHAKE" value={params.rumbleShake} min={0} max={100} step={1}
                onChange={(v) => updateParam('rumbleShake', v)} color={color} suffix="%" />
              <Slider label="WIDTH" value={params.rumbleWidth} min={0} max={100} step={1}
                onChange={(v) => updateParam('rumbleWidth', v)} color={color} suffix="%"
                warning={params.rumbleWidth > 50}
                description={params.rumbleWidth > 50 ? '⚠ Phase cancellation in Mono' : 'Safe: Quadrature Phase'} />
              <Slider label="SPEED" value={params.rumbleSpeed} min={0} max={100} step={1}
                onChange={(v) => updateParam('rumbleSpeed', v)} color={color} suffix="%" />
              <Slider label="WEIGHT" value={params.rumbleWeight} min={0} max={100} step={1}
                onChange={(v) => updateParam('rumbleWeight', v)} color={color} suffix="%" />
              <div className="my-1" />
              <Slider label="LENGTH" value={params.rumbleDuration} min={1} max={8} step={0.01}
                onChange={(v) => updateParam('rumbleDuration', v)} color={color} suffix="s" />
            </>
          )}

          {/* DSP signal flow */}
          <div className="mt-auto pt-3 border-t border-zinc-800">
            <div className="text-[8px] font-mono text-zinc-600 leading-tight">
              <div style={{ color }}>● QUAD SRC</div>
              <div>↓</div>
              <div>○ INFLATOR</div>
              <div>↓</div>
              <div>○ DRY + DARK VERB</div>
              <div>↓</div>
              <div>○ LIMITER → {params.isMono ? 'MONO' : 'STEREO'}</div>
              <div>↓</div>
              <div>○ MASTER → ANALYSER</div>
            </div>
          </div>
        </div>

        {/* Right: Graph editor */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col relative">
          <GraphEditor
            pitchEnv={mode === 'DROP' ? dropPitch : mode === 'IMPACT' ? impactPitch : rumblePitch}
            setPitchEnv={mode === 'DROP' ? setDropPitch : mode === 'IMPACT' ? setImpactPitch : setRumblePitch}
            ampEnv={mode === 'DROP' ? dropAmp : mode === 'IMPACT' ? impactAmp : rumbleAmp}
            setAmpEnv={mode === 'DROP' ? setDropAmp : mode === 'IMPACT' ? setImpactAmp : setRumbleAmp}
            activeLayer={activeLayer}
            setActiveLayer={setActiveLayer}
            duration={getCurrentDuration()}
            minFreq={20}
            color={color}
            presetName={BASS_PRESETS[activePreset]?.name ?? '—'}
          />
        </div>
      </div>

      {/* Bottom: Piano keyboard */}
      <div className="border-t border-zinc-800 px-6 py-3 bg-zinc-900/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono text-zinc-600 tracking-widest">KEYBOARD TRIGGER</span>
            <span className="text-[10px] text-zinc-600">OCT: {octave}</span>
          </div>
          <span className="text-[10px] text-zinc-600">
            A-K 弹奏 · 鼠标点击 · Z/X 切换八度 · MIDI: {midi.midiReady ? 'ON' : 'OFF'}
          </span>
        </div>
        <div className="flex justify-center gap-0.5 select-none">
          {PIANO_KEYS.map((pk) => {
            const isActive = activeNotes.has(pk.key) || mouseActiveKey === pk.key;
            const isBlack = pk.type === 'black';
            return (
              <div
                key={pk.key}
                className="relative flex flex-col items-center justify-end rounded-b-md transition-all duration-100 cursor-pointer"
                style={{
                  width: isBlack ? 28 : 44,
                  height: isBlack ? 50 : 76,
                  background: isActive
                    ? (isBlack ? color : `${color}30`)
                    : (isBlack ? '#18181b' : '#27272a'),
                  border: `1px solid ${isActive ? color : '#3f3f46'}`,
                  zIndex: isBlack ? 2 : 1,
                  marginLeft: isBlack ? -14 : 0,
                  marginRight: isBlack ? -14 : 0,
                }}
                onMouseDown={() => handlePianoDown(pk)}
                onMouseUp={handlePianoUp}
                onMouseLeave={handlePianoUp}
                onTouchStart={(e) => { e.preventDefault(); handlePianoDown(pk); }}
                onTouchEnd={handlePianoUp}
              >
                <span className="text-[8px] text-zinc-600 mb-1">{pk.key.toUpperCase()}</span>
                <span className={`text-[9px] mb-1 ${isActive ? 'text-white' : 'text-zinc-500'}`}>{pk.note}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
