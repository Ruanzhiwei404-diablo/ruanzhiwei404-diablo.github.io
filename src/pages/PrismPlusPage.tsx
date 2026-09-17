import { useState, useRef, useEffect, useCallback } from 'react';
import { PrismPlusEngine, ENGINE_COLORS } from '../audio/prismPlusEngine';
import { PRISM_PLUS_PRESETS } from '../audio/prismPlusPresets';
import type { PrismPlusParams, Scale, ArpMode } from '../audio/types';
import { DEFAULT_PRISM_PLUS_PARAMS, PRISM_PLUS_RATES, KEYBOARD_MAP, midiToFreq } from '../audio/types';
import Knob from '../components/Knob';
import Slider from '../components/Slider';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMIDI } from '../hooks/useMIDI';
import { useRecorder } from '../hooks/useRecorder';

const SCALES: Scale[] = ['chromatic', 'major', 'minor', 'pentatonic_maj', 'pentatonic_min', 'dorian', 'lydian'];
const ARP_MODES: ArpMode[] = ['off', 'up', 'down', 'up-down', 'down-up', 'converge', 'diverge', 'pinky', 'random', 'rain'];

const SCALES_MAP: Record<Scale, number[]> = {
  chromatic:      [0,1,2,3,4,5,6,7,8,9,10,11],
  major:          [0,2,4,5,7,9,11],
  minor:          [0,2,3,5,7,8,10],
  pentatonic_maj: [0,2,4,7,9],
  pentatonic_min: [0,3,5,7,10],
  dorian:         [0,2,3,5,7,9,10],
  lydian:         [0,2,4,6,7,9,11],
};

const GROUP_COLORS: Record<string, string> = {
  'CLASSIC CRYSTAL': '#06b6d4',
  'CLASSIC ETHEREAL': '#a855f7',
  'NEW LIQUID': '#3b82f6',
  'KAWAII / UI': '#ec4899',
  'CLASSIC FX': '#f59e0b',
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

type ParamKey = keyof PrismPlusParams;

export default function PrismPlusPage() {
  const engineRef = useRef<PrismPlusEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const lastTriggerRef = useRef(0);

  const [activePreset, setActivePreset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [params, setParams] = useState<PrismPlusParams>({ ...DEFAULT_PRISM_PLUS_PARAMS, ...PRISM_PLUS_PRESETS[0].params } as PrismPlusParams);
  const [lockedParams, setLockedParams] = useState<Set<string>>(new Set());

  const paramsRef = useRef(params);
  useEffect(() => { paramsRef.current = params; }, [params]);

  useEffect(() => {
    const engine = new PrismPlusEngine();
    engineRef.current = engine;
    const preset = PRISM_PLUS_PRESETS[0];
    const newParams = { ...DEFAULT_PRISM_PLUS_PARAMS, ...preset.params } as PrismPlusParams;
    engine.setParams(newParams);
    setParams(newParams);
    return () => { engine.destroy(); };
  }, []);

  const engine = engineRef.current;

  const selectPreset = useCallback((idx: number) => {
    if (!engine) return;
    setActivePreset(idx);
    const preset = PRISM_PLUS_PRESETS[idx];
    const newParams = { ...paramsRef.current, ...preset.params } as PrismPlusParams;
    // Respect locked params
    lockedParams.forEach(key => {
      (newParams as any)[key] = (paramsRef.current as any)[key];
    });
    engine.setParams(newParams);
    setParams(newParams);
    engine.triggerSound();
    lastTriggerRef.current = Date.now();
  }, [engine, lockedParams]);

  const updateParam = useCallback(<K extends ParamKey>(key: K, value: PrismPlusParams[K]) => {
    if (!engine) return;
    engine.setParam(key, value);
    setParams(prev => ({ ...prev, [key]: value }));
  }, [engine]);

  const toggleLock = useCallback((key: string) => {
    setLockedParams(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const randomize = useCallback(() => {
    if (!engine) return;
    const newParams = { ...paramsRef.current };
    const r = (key: ParamKey, min: number, max: number) => {
      if (!lockedParams.has(key as string)) {
        (newParams as any)[key] = min + Math.random() * (max - min);
      }
    };
    r('pitch', 100, 1500);
    r('duration', 0.2, 4.0);
    r('timbre', 0, 1);
    r('impact', 0.1, 1);
    r('width', 0.2, 1);
    r('space', 0.1, 0.9);
    r('magic', 0.0, 0.8);
    r('drift', 0.1, 0.8);
    r('movement', 0.1, 0.9);
    r('bpm', 60, 400);
    r('arpGate', 0.2, 1.0);

    if (!lockedParams.has('arp') && Math.random() > 0.7) {
      newParams.arp = ARP_MODES[Math.floor(Math.random() * ARP_MODES.length)];
    }
    if (!lockedParams.has('arpRate')) {
      newParams.arpRate = PRISM_PLUS_RATES[Math.floor(Math.random() * PRISM_PLUS_RATES.length)].value;
    }
    if (!lockedParams.has('arpOctave')) {
      newParams.arpOctave = Math.floor(Math.random() * 3) + 1;
    }

    engine.setParams(newParams);
    setParams(newParams);
    engine.triggerSound();
    lastTriggerRef.current = Date.now();
  }, [engine, lockedParams]);

  const togglePlay = useCallback(async () => {
    if (!engine) return;
    if (isPlaying) {
      engine.stop();
      setIsPlaying(false);
    } else {
      await engine.play();
      setIsPlaying(true);
      lastTriggerRef.current = Date.now();
    }
  }, [engine, isPlaying]);

  const triggerSound = useCallback(async () => {
    if (!engine) return;
    await engine.triggerSound();
    lastTriggerRef.current = Date.now();
  }, [engine]);

  // Keyboard input
  const handleNoteOn = useCallback(async (freq: number) => {
    if (!engine) return;
    await engine.triggerSound(freq);
    lastTriggerRef.current = Date.now();
  }, [engine]);
  const handleNoteOff = useCallback(() => {}, []);

  const { octave, activeNotes } = useKeyboard({
    onNoteOn: handleNoteOn,
    onNoteOff: handleNoteOff,
    baseOctave: 4,
  });

  // Mouse/touch input on piano keys
  const [mouseActive, setMouseActive] = useState<Set<string>>(new Set());

  const handleMouseNoteOn = useCallback(async (key: string) => {
    if (!engine) return;
    const offset = KEYBOARD_MAP[key];
    if (offset === undefined) return;
    const midi = (octave + 1) * 12 + offset;
    await engine.triggerSound(midiToFreq(midi));
    lastTriggerRef.current = Date.now();
    setMouseActive(prev => new Set(prev).add(key));
  }, [engine, octave]);

  const handleMouseNoteOff = useCallback((key: string) => {
    setMouseActive(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  // MIDI input
  const midi = useMIDI({
    onNoteOn: async (freq) => { if (engine) { await engine.triggerSound(freq); lastTriggerRef.current = Date.now(); } },
    onNoteOff: () => {},
  });

  // Recording
  const recorder = useRecorder(() => engine?.getRecordStream() ?? null);

  // === Visualizer ===
  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      const analyser = engine?.getAnalyser();
      if (!canvas || !analyser) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) { animRef.current = requestAnimationFrame(draw); return; }
      const w = canvas.width, h = canvas.height;

      ctx.fillStyle = 'rgba(2, 6, 20, 0.3)';
      ctx.fillRect(0, 0, w, h);

      const p = paramsRef.current;
      const color = ENGINE_COLORS[p.engine] || '#a5f3fc';

      // Scale grid lines
      if (p.scale && SCALES_MAP[p.scale]) {
        const intervals = SCALES_MAP[p.scale];
        ctx.lineWidth = 1;
        for (let oct = 0; oct < 6; oct++) {
          intervals.forEach(interval => {
            const relY = ((interval + (oct * 12)) % 72) / 72;
            const y = h - (relY * h);
            if (y > 0 && y < h) {
              ctx.beginPath();
              ctx.strokeStyle = color;
              ctx.globalAlpha = interval === 0 ? 0.6 : 0.2;
              ctx.moveTo(0, y);
              ctx.lineTo(w, y);
              ctx.stroke();
            }
          });
        }
        ctx.globalAlpha = 1.0;
      }

      // Recording border
      if (recorder.isRecording) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, w, h);
      }

      // Glow on trigger
      const timeSinceTrigger = Date.now() - lastTriggerRef.current;
      const safeDur = isNaN(p.duration) ? 1 : p.duration;
      const active = timeSinceTrigger < safeDur * 1000;
      const intensity = Math.max(0, 1 - timeSinceTrigger / (safeDur * 800));

      if (active) {
        const safeDrift = isNaN(p.drift) ? 0 : p.drift;
        const glowSize = intensity * 250 + (Math.random() * 50 * safeDrift);
        const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, glowSize);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.2;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1.0;
      }

      // Waveform
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 2 + (isNaN(p.drift) ? 0 : p.drift) * 2;
      ctx.strokeStyle = active ? color : '#334155';
      ctx.beginPath();
      const sliceWidth = w / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * h / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [engine, recorder.isRecording]);

  const currentEngine = params.engine;
  const engineColor = ENGINE_COLORS[currentEngine] || '#06b6d4';
  const freqDisplay = params.pitch < 1000 ? `${Math.round(params.pitch)} Hz` : `${(params.pitch / 1000).toFixed(2)} kHz`;

  const groupedPresets = PRISM_PLUS_PRESETS.reduce((acc, p, i) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push({ ...p, idx: i });
    return acc;
  }, {} as Record<string, (typeof PRISM_PLUS_PRESETS[number] & { idx: number })[]>);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300"
         style={{ background: 'radial-gradient(ellipse at top, #0c1740 0%, #020617 60%)' }}>
      {/* Header */}
      <div className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0d9488)',
              boxShadow: '0 4px 14px #06b6d440',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" opacity=".6"/>
              <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" opacity=".4"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              PRISM <span style={{ color: '#06b6d4' }}>PLUS</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest">
              96kHz 24-BIT · 18 ENGINES · GLOBAL FX BUS
            </p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {midi.midiReady && (
              <div className="px-2 py-1 rounded-lg text-[10px] font-mono border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                MIDI: {midi.midiDevices.join(', ') || 'connected'}
              </div>
            )}
            <button
              onClick={() => recorder.isRecording ? recorder.stop() : recorder.start()}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5"
              style={{
                background: recorder.isRecording ? '#ef444420' : 'transparent',
                borderColor: recorder.isRecording ? '#ef444450' : '#ef444430',
                color: recorder.isRecording ? '#ef4444' : '#ef444490',
              }}
            >
              <span className={`w-2 h-2 rounded-full ${recorder.isRecording ? 'bg-red-500 animate-pulse' : 'bg-red-500/50'}`} />
              {recorder.isRecording ? 'STOP' : 'REC 96k'}
            </button>
            {recorder.audioUrl && !recorder.isRecording && (
              <button onClick={recorder.download}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all">
                Download
              </button>
            )}
            <button onClick={triggerSound}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all">
              Preview
            </button>
            <button onClick={togglePlay}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2"
              style={{
                background: isPlaying ? '#ef444420' : '#06b6d420',
                border: `1.5px solid ${isPlaying ? '#ef444450' : '#06b6d450'}`,
                color: isPlaying ? '#ef4444' : '#06b6d4',
              }}>
              {isPlaying ? '■ STOP' : '▶ PLAY'}
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row">
        {/* Left: Presets */}
        <div className="w-full lg:w-60 flex-shrink-0 border-r border-slate-800/60 bg-slate-950/40 p-4 max-h-[calc(100vh-73px)] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              ENGINES <span className="text-cyan-400 ml-1">{PRISM_PLUS_PRESETS.length}</span>
            </h3>
          </div>
          {Object.entries(groupedPresets).map(([category, presets]) => {
            const color = GROUP_COLORS[category] || '#64748b';
            return (
              <div key={category} className="mb-5">
                <div className="text-[9px] font-bold uppercase tracking-widest mb-1.5 pl-1" style={{ color: color + '90' }}>
                  {category}
                </div>
                {presets.map((p) => (
                  <button
                    key={p.idx}
                    onClick={() => selectPreset(p.idx)}
                    className="w-full text-left p-2.5 rounded-lg border transition-all duration-150 flex items-center gap-2.5 mb-0.5 group"
                    style={{
                      borderColor: activePreset === p.idx ? engineColor + '50' : 'transparent',
                      background: activePreset === p.idx ? engineColor + '10' : 'transparent',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: activePreset === p.idx ? engineColor + '20' : '#1e293b',
                        color: activePreset === p.idx ? engineColor : '#64748b',
                      }}
                    >
                      <EngineIcon name={p.icon} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-bold tracking-wide truncate"
                           style={{ color: activePreset === p.idx ? '#fff' : '#94a3b8' }}>
                        {p.name}
                      </div>
                      <div className="text-[9px] text-slate-600 truncate">{p.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}

          {/* Randomize */}
          <button
            onClick={randomize}
            className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all active:scale-95 border border-slate-700 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-slate-300 hover:text-cyan-300 mt-4"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="group-hover:rotate-180 transition-transform duration-500">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <path d="M16 8h.01"/><path d="M8 8h.01"/>
              <path d="M8 16h.01"/><path d="M16 16h.01"/>
              <path d="M12 12h.01"/>
            </svg>
            RANDOMIZE
          </button>
        </div>

        {/* Right: Visualizer + Params */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-73px)]">
          {/* Visualizer */}
          <div
            className="relative rounded-2xl overflow-hidden border mb-6 cursor-pointer group"
            style={{
              borderColor: engineColor + '20',
              background: '#020617',
              height: 220,
            }}
            onMouseDown={(e) => { e.preventDefault(); triggerSound(); }}
            onTouchStart={(e) => { e.preventDefault(); triggerSound(); }}
          >
            <canvas ref={canvasRef} width={1200} height={440}
              className="w-full h-full opacity-80 mix-blend-screen" />
            {/* Play overlay */}
            {!isPlaying && !recorder.isRecording && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-full border border-white/10 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="white" opacity="0.9">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
              </div>
            )}
            {/* Engine name badge */}
            <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none">
              <div className="w-2 h-2 rounded-full" style={{ background: engineColor }} />
              <span className="text-xs font-bold tracking-widest" style={{ color: engineColor }}>
                {currentEngine}
              </span>
            </div>
            {/* Recording indicator */}
            {recorder.isRecording && (
              <div className="absolute top-3 right-4 flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/50 bg-red-500/10">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-red-400 tracking-widest">REC 24-BIT</span>
              </div>
            )}
          </div>

          {/* Transport bar */}
          <div className="flex items-center gap-6 mb-6 px-4 py-3 rounded-2xl border border-slate-800/60 bg-slate-900/40">
            <div className="flex-1">
              <Slider label="SPEED (BPM)" value={params.bpm} onChange={(v) => updateParam('bpm', v)}
                min={60} max={400} step={1} color={engineColor}
                displayValue={`${Math.round(params.bpm)} BPM`} />
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="flex-1">
              <Slider label="MAIN VOL" value={params.mainVol} onChange={(v) => updateParam('mainVol', v)}
                min={0} max={1} step={0.01} color={engineColor}
                displayValue={`${Math.round(params.mainVol * 100)}%`} />
            </div>
          </div>

          {/* Theory + Knob columns */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {/* THEORY */}
            <div className="rounded-2xl border p-4" style={{ borderColor: '#a855f720', background: '#a855f705' }}>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800/50">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                  <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
                </svg>
                <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">THEORY</span>
              </div>
              <div className="space-y-3">
                <LockableSelect label="SCALE" value={params.scale} options={SCALES}
                  onChange={(v) => updateParam('scale', v as Scale)}
                  locked={lockedParams.has('scale')} onToggleLock={() => toggleLock('scale')} color="#a855f7" />
                <LockableSelect label="ARP MODE" value={params.arp} options={ARP_MODES}
                  onChange={(v) => updateParam('arp', v as ArpMode)}
                  locked={lockedParams.has('arp')} onToggleLock={() => toggleLock('arp')} color="#a855f7" />
                <LockableSelect label="RATE" value={String(params.arpRate)}
                  options={PRISM_PLUS_RATES.map(r => String(r.value))}
                  optionLabels={PRISM_PLUS_RATES.map(r => r.label)}
                  onChange={(v) => updateParam('arpRate', parseFloat(v))}
                  locked={lockedParams.has('arpRate')} onToggleLock={() => toggleLock('arpRate')} color="#a855f7" />
              </div>
            </div>

            {/* PHYSICS */}
            <div className="rounded-2xl border p-4 flex flex-wrap justify-center gap-3"
              style={{ borderColor: '#06b6d420', background: '#06b6d405' }}>
              <div className="w-full text-center mb-1">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">PHYSICS</span>
              </div>
              <LockableKnob label="ROOT FREQ" value={(params.pitch - 50) / 1950}
                onChange={(v) => updateParam('pitch', 50 + v * 1950)}
                locked={lockedParams.has('pitch')} onToggleLock={() => toggleLock('pitch')}
                color="#06b6d4" displayValue={freqDisplay} />
              <LockableKnob label="DECAY" value={(params.duration - 0.2) / 4.8}
                onChange={(v) => updateParam('duration', Math.max(0.2, 0.2 + v * 4.8))}
                locked={lockedParams.has('duration')} onToggleLock={() => toggleLock('duration')}
                color="#06b6d4" displayValue={`${params.duration.toFixed(2)}s`} />
              <LockableKnob label="ARP GATE" value={params.arpGate}
                onChange={(v) => updateParam('arpGate', v)}
                locked={lockedParams.has('arpGate')} onToggleLock={() => toggleLock('arpGate')}
                color="#06b6d4" />
            </div>

            {/* MATERIAL */}
            <div className="rounded-2xl border p-4 flex flex-wrap justify-center gap-3"
              style={{ borderColor: '#10b98120', background: '#10b98105' }}>
              <div className="w-full text-center mb-1">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">MATERIAL</span>
              </div>
              <LockableKnob label="TONE" value={params.timbre}
                onChange={(v) => updateParam('timbre', v)}
                locked={lockedParams.has('timbre')} onToggleLock={() => toggleLock('timbre')}
                color="#10b981" />
              <LockableKnob label="IMPACT" value={params.impact}
                onChange={(v) => updateParam('impact', v)}
                locked={lockedParams.has('impact')} onToggleLock={() => toggleLock('impact')}
                color="#10b981" />
              <LockableKnob label="OCTAVE" value={(params.arpOctave - 1) / 3}
                onChange={(v) => updateParam('arpOctave', Math.round(1 + v * 3))}
                locked={lockedParams.has('arpOctave')} onToggleLock={() => toggleLock('arpOctave')}
                color="#10b981" displayValue={`${params.arpOctave} oct`} />
            </div>

            {/* ORGANIC */}
            <div className="rounded-2xl border p-4 flex flex-wrap justify-center gap-3"
              style={{ borderColor: '#ec489920', background: '#ec489905' }}>
              <div className="w-full text-center mb-1">
                <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest">ORGANIC</span>
              </div>
              <LockableKnob label="DRIFT" value={params.drift}
                onChange={(v) => updateParam('drift', v)}
                locked={lockedParams.has('drift')} onToggleLock={() => toggleLock('drift')}
                color="#ec4899" />
              <LockableKnob label="MOVEMENT" value={params.movement}
                onChange={(v) => updateParam('movement', v)}
                locked={lockedParams.has('movement')} onToggleLock={() => toggleLock('movement')}
                color="#ec4899" />
            </div>

            {/* ATMOSPHERE */}
            <div className="rounded-2xl border p-4 flex flex-wrap justify-center gap-3"
              style={{ borderColor: '#6366f120', background: '#6366f105' }}>
              <div className="w-full text-center mb-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">ATMOSPHERE</span>
              </div>
              <LockableKnob label="STEREO" value={params.width}
                onChange={(v) => updateParam('width', v)}
                locked={lockedParams.has('width')} onToggleLock={() => toggleLock('width')}
                color="#6366f1" />
              <LockableKnob label="SHIMMER" value={params.space}
                onChange={(v) => updateParam('space', v)}
                locked={lockedParams.has('space')} onToggleLock={() => toggleLock('space')}
                color="#6366f1" />
              <LockableKnob label="MAGIC" value={params.magic}
                onChange={(v) => updateParam('magic', v)}
                locked={lockedParams.has('magic')} onToggleLock={() => toggleLock('magic')}
                color="#6366f1" />
            </div>
          </div>

          {/* Signal Flow */}
          <div className="rounded-2xl border border-slate-800/40 bg-slate-900/20 p-5 mb-6">
            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">
              PRISM PLUS — GLOBAL FX BUS 信号流
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px]">
              {[
                { label: 'ENGINE', color: engineColor },
                { label: 'DRY', color: '#94a3b8' },
                { label: 'REVERB', color: '#6366f1' },
                { label: 'DELAY', color: '#ec4899' },
                { label: 'COMPRESSOR', color: '#10b981' },
                { label: 'LIMITER', color: '#f59e0b' },
                { label: 'MASTER', color: '#06b6d4' },
                { label: '96kHz OUT', color: '#fff' },
              ].map((stage, i, arr) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider"
                    style={{ background: stage.color + '15', color: stage.color, border: `1px solid ${stage.color}30` }}>
                    {stage.label}
                  </div>
                  {i < arr.length - 1 && <span className="text-slate-700 text-lg">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard */}
          <div className="rounded-2xl border border-slate-800/40 bg-slate-900/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                键盘演奏 <span style={{ color: engineColor }}>Octave {octave}</span>
              </h4>
              <span className="text-[10px] text-slate-600">
                键盘 A-K · 鼠标点击 · Z/X 八度 · MIDI: {midi.midiReady ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="flex justify-center gap-0.5 select-none">
              {PIANO_KEYS.map((pk) => {
                const isActive = activeNotes.has(pk.key) || mouseActive.has(pk.key);
                const isBlack = pk.type === 'black';
                return (
                  <div
                    key={pk.key}
                    className="relative flex flex-col items-center justify-end rounded-b-md transition-all duration-100 cursor-pointer"
                    style={{
                      width: isBlack ? 28 : 44,
                      height: isBlack ? 60 : 90,
                      background: isActive
                        ? (isBlack ? engineColor : engineColor + '30')
                        : (isBlack ? '#18181b' : '#27272a'),
                      border: `1px solid ${isActive ? engineColor : '#3f3f46'}`,
                      zIndex: isBlack ? 2 : 1,
                      marginLeft: isBlack ? -14 : 0,
                      marginRight: isBlack ? -14 : 0,
                      userSelect: 'none',
                      touchAction: 'none',
                    }}
                    onMouseDown={() => handleMouseNoteOn(pk.key)}
                    onMouseUp={() => handleMouseNoteOff(pk.key)}
                    onMouseLeave={() => handleMouseNoteOff(pk.key)}
                    onTouchStart={(e) => { e.preventDefault(); handleMouseNoteOn(pk.key); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleMouseNoteOff(pk.key); }}
                  >
                    <span className="text-[9px] font-mono mb-1.5"
                      style={{ color: isActive ? '#fff' : (isBlack ? '#52525b' : '#71717a') }}>
                      {pk.key.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Sub-components ----

function LockableKnob({ label, value, onChange, color, displayValue, locked, onToggleLock }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  displayValue?: string;
  locked: boolean;
  onToggleLock: () => void;
}) {
  return (
    <div className="relative">
      <Knob label={label} value={value} onChange={onChange} color={color} displayValue={displayValue} size={54} />
      <button
        onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
        className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-all"
        style={{
          background: locked ? color + '20' : '#27272a',
          border: `1px solid ${locked ? color : '#3f3f46'}`,
        }}
      >
        {locked ? (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        ) : (
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
          </svg>
        )}
      </button>
    </div>
  );
}

function LockableSelect({ label, value, options, optionLabels, onChange, color, locked, onToggleLock }: {
  label: string;
  value: string;
  options: readonly string[];
  optionLabels?: string[];
  onChange: (v: string) => void;
  color: string;
  locked: boolean;
  onToggleLock: () => void;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-[10px] font-semibold text-slate-400 tracking-wide">{label}</label>
        <button onClick={onToggleLock}
          className="hover:bg-slate-800 rounded p-0.5 transition-colors"
          style={{ color: locked ? color : '#475569' }}>
          {locked ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>
            </svg>
          )}
        </button>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={locked}
        className="w-full text-[11px] font-mono font-bold rounded-lg px-2 py-1.5 cursor-pointer outline-none transition-colors"
        style={{
          background: '#18181b',
          border: `1px solid ${color}30`,
          color: locked ? '#64748b' : color,
          opacity: locked ? 0.5 : 1,
        }}
      >
        {options.map((opt, i) => (
          <option key={opt} value={opt} style={{ background: '#18181b', color }}>
            {(optionLabels?.[i] || opt).replace(/_/g, ' ').toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}

function EngineIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></>,
    stars: <><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></>,
    moon: <><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></>,
    sparkles: <><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/><path d="M5 3v4M9 3v4M3 5h4M3 9h4"/></>,
    bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
    waves: <><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></>,
    snowflake: <><line x1="2" x2="22" y1="12" y2="12"/><line x1="12" x2="12" y1="2" y2="22"/><path d="m20 16-4-4 4-4M4 8l4 4-4 4M16 4l-4 4-4-4M8 20l4-4 4 4"/></>,
    radio: <><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></>,
    beaker: <><path d="M4.5 3h15M6 3v16a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V3"/></>,
    layers: <><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></>,
    circle: <><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/></>,
    droplets: <><path d="M7 16.3c2.2 0 4-1.8 4-4 0-1.3-.6-2.3-1.7-3.2S7.3 6.8 7 5.3c-.3 1.5-1.1 2.8-2.3 3.8S3 11.1 3 12.3c0 2.2 1.8 4 4 4z"/></>,
    smile: <><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></>,
    star: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    wind: <><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></>,
    activity: <><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></>,
    zap: <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
  };
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icons[name] || icons.sun}
    </svg>
  );
}
