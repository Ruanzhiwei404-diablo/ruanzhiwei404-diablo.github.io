import { useState, useRef, useEffect, useCallback } from 'react';
import { CuteSynthEngine } from '../audio/cuteSynthEngine';
import type { CuteSynthParams, CuteShape, CuteCategory } from '../audio/types';
import { DEFAULT_CUTE_PARAMS, KEYBOARD_MAP, midiToFreq } from '../audio/types';
import { CUTE_PRESETS } from '../audio/cuteSynthPresets';
import Slider from '../components/Slider';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMIDI } from '../hooks/useMIDI';
import { useRecorder } from '../hooks/useRecorder';

const CATEGORY_COLORS: Record<CuteCategory, string> = {
  Physics: '#06b6d4',
  Emotions: '#ec4899',
  Magic: '#f59e0b',
  Interface: '#8b5cf6',
};

const CATEGORY_ICONS: Record<CuteCategory, string> = {
  Physics: '⚙',
  Emotions: '♥',
  Magic: '★',
  Interface: '⌖',
};

const SHAPES: CuteShape[] = ['sine', 'triangle', 'square', 'sawtooth'];

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

type ParamKey = keyof CuteSynthParams;

export default function CuteSynthPage() {
  const engineRef = useRef<CuteSynthEngine | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const [audioStarted, setAudioStarted] = useState(false);
  const [activePreset, setActivePreset] = useState(0);
  const [params, setParams] = useState<CuteSynthParams>({ ...DEFAULT_CUTE_PARAMS });
  const [lockedParams, setLockedParams] = useState<Set<ParamKey>>(new Set());
  const [lastTrigger, setLastTrigger] = useState(0);

  useEffect(() => {
    const engine = new CuteSynthEngine();
    engineRef.current = engine;
    const preset = CUTE_PRESETS[0];
    const newParams = { ...DEFAULT_CUTE_PARAMS, ...preset.params } as CuteSynthParams;
    engine.setParams(newParams);
    setParams(newParams);
    setLockedParams(new Set(preset.locks));
    return () => { engine.destroy(); };
  }, []);

  const engine = engineRef.current;

  // --- Preset loading ---
  const loadPreset = useCallback((idx: number) => {
    if (!engine) return;
    setActivePreset(idx);
    const preset = CUTE_PRESETS[idx];
    const newParams = { ...DEFAULT_CUTE_PARAMS, ...preset.params } as CuteSynthParams;
    // Preserve volume
    newParams.volume = params.volume;
    engine.setParams(newParams);
    setParams(newParams);
    setLockedParams(new Set(preset.locks));
    engine.triggerSound();
  }, [engine, params.volume]);

  // --- Param update ---
  const updateParam = useCallback(<K extends ParamKey>(key: K, value: CuteSynthParams[K]) => {
    if (!engine) return;
    engine.setParam(key, value);
    setParams(prev => ({ ...prev, [key]: value }));
  }, [engine]);

  const toggleLock = useCallback((key: ParamKey) => {
    setLockedParams(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  // --- Trigger ---
  const triggerSound = useCallback(async () => {
    if (!engine) return;
    if (!audioStarted) setAudioStarted(true);
    await engine.triggerSound();
    setLastTrigger(Date.now());
  }, [engine, audioStarted]);

  // --- Randomize (respects locks) ---
  const randomize = useCallback(() => {
    if (!engine) return;
    const r = (min: number, max: number) => Math.random() * (max - min) + min;
    const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

    const next = { ...params };
    const update = (key: ParamKey, val: CuteSynthParams[ParamKey]) => {
      if (!lockedParams.has(key)) (next as any)[key] = val;
    };

    update('frequency', Math.round(r(100, 1500)));
    update('shape', pick(SHAPES));
    update('sweep', Math.round(r(-8, 8) * 10) / 10);
    update('filterFreq', Math.round(r(200, 4000)));
    update('filterQ', Math.round(r(1, 20)));
    update('filterEnv', Math.round(r(-1000, 1000)));
    update('decay', Math.round(r(5, 50) * 10) / 100);
    update('modDepth', Math.random() > 0.6 ? Math.round(r(100, 1000)) : 0);
    update('modSpeed', Math.round(r(10, 100)));
    update('delay', Math.random() > 0.8 ? Math.round(r(0, 30)) / 100 : 0);
    update('wobble', Math.round(r(0, 20)) / 100);

    engine.setParams(next);
    setParams(next);
    engine.triggerSound();
    setLastTrigger(Date.now());
  }, [engine, params, lockedParams]);

  // --- Keyboard ---
  const handleNoteOn = useCallback(async (freq: number) => {
    if (!engine) return;
    if (!audioStarted) setAudioStarted(true);
    await engine.triggerSound(freq);
    setLastTrigger(Date.now());
  }, [engine, audioStarted]);

  const { octave, activeNotes } = useKeyboard({
    onNoteOn: handleNoteOn,
    onNoteOff: () => {},
    baseOctave: 4,
  });

  // --- Mouse piano ---
  const [mouseActive, setMouseActive] = useState<Set<string>>(new Set());
  const handleMouseNoteOn = useCallback(async (key: string) => {
    if (!engine) return;
    const offset = KEYBOARD_MAP[key];
    if (offset === undefined) return;
    const midi = (octave + 1) * 12 + offset;
    if (!audioStarted) setAudioStarted(true);
    await engine.triggerSound(midiToFreq(midi));
    setLastTrigger(Date.now());
    setMouseActive(prev => new Set(prev).add(key));
  }, [engine, octave, audioStarted]);

  const handleMouseNoteOff = useCallback((key: string) => {
    setMouseActive(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  // --- MIDI ---
  const midi = useMIDI({
    onNoteOn: async (freq) => {
      if (engine) {
        if (!audioStarted) setAudioStarted(true);
        await engine.triggerSound(freq);
        setLastTrigger(Date.now());
      }
    },
    onNoteOff: () => {},
  });

  // --- Recording ---
  const recorder = useRecorder(() => engine?.getRecordStream() ?? null);

  // --- Oscilloscope ---
  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      const analyser = engine?.getAnalyser();
      if (!canvas) { animRef.current = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d')!;
      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#0d0510';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#1a0a20';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < w; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = 0; y < h; y += 40) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();

      if (analyser) {
        const bufLen = analyser.frequencyBinCount;
        const data = new Uint8Array(bufLen);
        analyser.getByteTimeDomainData(data);

        // Trigger flash
        const sinceTrig = Date.now() - lastTrigger;
        if (sinceTrig < 200) {
          ctx.fillStyle = `rgba(236, 72, 153, ${0.12 * (1 - sinceTrig / 200)})`;
          ctx.fillRect(0, 0, w, h);
        }

        // Waveform
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#f472b6';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ec4899';
        ctx.beginPath();
        const slice = w / bufLen;
        let x = 0;
        for (let i = 0; i < bufLen; i++) {
          const v = data[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
          x += slice;
        }
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        // Idle line
        ctx.strokeStyle = '#3a1a30';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
      }

      // Recording border
      if (recorder.isRecording) {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, w - 4, h - 4);
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [engine, lastTrigger, recorder.isRecording]);

  // Group presets by category
  const groupedPresets = CUTE_PRESETS.reduce((acc, p, i) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push({ ...p, idx: i });
    return acc;
  }, {} as Record<CuteCategory, (typeof CUTE_PRESETS[number] & { idx: number })[]>);

  const currentPreset = CUTE_PRESETS[activePreset];
  const presetColor = CATEGORY_COLORS[currentPreset.category];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d0510] via-[#0f0815] to-[#0a0410] text-zinc-300">
      {/* Header */}
      <div className="border-b border-pink-500/15 bg-[#0d0510]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #ec4899, #db2777)',
              boxShadow: '0 4px 14px #ec489940',
            }}
          >
            <span className="text-white text-lg">★</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tighter">
              CuteSynth <span className="text-pink-400">DSP</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest">ANIME SFX ENGINE · 12 PRESETS</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {midi.midiReady && (
              <div className="px-2 py-1 rounded-lg text-[10px] font-mono border border-pink-500/30 bg-pink-500/10 text-pink-400">
                MIDI: {midi.midiDevices.join(', ') || 'connected'}
              </div>
            )}
            <button
              onClick={randomize}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-pink-500/30 text-pink-400 hover:bg-pink-500/10 transition-all flex items-center gap-1.5 active:scale-95"
            >
              🎲 RANDOMIZE
            </button>
            <button
              onClick={() => recorder.isRecording ? recorder.stop() : recorder.start()}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5"
              style={{
                background: recorder.isRecording ? '#ef444420' : 'transparent',
                borderColor: recorder.isRecording ? '#ef444450' : '#ef444430',
                color: recorder.isRecording ? '#ef4444' : '#ef444490',
              }}
            >
              <span className={`w-2 h-2 rounded-full ${recorder.isRecording ? 'bg-red-500 animate-pulse' : 'bg-red-500/50'}`} />
              {recorder.isRecording ? 'STOP' : 'REC'}
            </button>
            {recorder.audioUrl && !recorder.isRecording && (
              <button
                onClick={recorder.download}
                className="px-3 py-1.5 rounded-xl text-xs font-bold border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all"
              >
                Download
              </button>
            )}
            <button
              onClick={triggerSound}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2"
              style={{
                background: '#ec489920',
                border: '1.5px solid #ec489950',
                color: '#ec4899',
              }}
            >
              ▶ TRIGGER
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Left: Presets */}
        <div className="w-full lg:w-60 flex-shrink-0 border-r border-pink-500/10 bg-[#0d0510]/50 p-4 max-h-[calc(100vh-73px)] overflow-y-auto">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
            音色预设 <span className="text-pink-400 ml-1">{CUTE_PRESETS.length} presets</span>
          </h3>
          {(Object.entries(groupedPresets) as [CuteCategory, typeof groupedPresets[CuteCategory]][]).map(([category, presets]) => {
            const color = CATEGORY_COLORS[category];
            return (
              <div key={category} className="mb-5">
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 pl-1 flex items-center gap-1.5" style={{ color }}>
                  <span style={{ color: color + '80' }}>{CATEGORY_ICONS[category]}</span>
                  {category}
                </div>
                {presets.map((p) => (
                  <button
                    key={p.idx}
                    onClick={() => loadPreset(p.idx)}
                    className="w-full text-left p-2 rounded-xl border transition-all duration-150 flex items-center gap-2.5 mb-1"
                    style={{
                      borderColor: activePreset === p.idx ? color + '50' : 'transparent',
                      background: activePreset === p.idx ? color + '12' : 'transparent',
                    }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                      style={{
                        background: activePreset === p.idx ? color + '20' : '#1a0a18',
                      }}
                    >
                      {p.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-[11px] font-bold tracking-wide truncate"
                        style={{ color: activePreset === p.idx ? color : '#a1a1aa' }}
                      >
                        {p.name}
                      </div>
                      <div className="text-[9px] text-zinc-600 truncate font-mono">
                        {p.params.frequency ?? '?'}Hz
                      </div>
                    </div>
                    {activePreset === p.idx && (
                      <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: color }} />
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Right: Visualizer + Controls */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-73px)]">
          {/* Oscilloscope */}
          <div
            className="relative h-48 rounded-2xl overflow-hidden cursor-pointer border border-pink-500/20 mb-6 group"
            onClick={triggerSound}
          >
            <canvas
              ref={canvasRef}
              width={1000}
              height={300}
              className="w-full h-full"
            />
            {!audioStarted && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0d0510]/80 z-10 backdrop-blur-sm">
                <div className="bg-pink-500 text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-pink-500/30 animate-pulse flex items-center gap-2">
                  ⚡ CLICK TO START
                </div>
              </div>
            )}
            <div className="absolute bottom-3 right-5 text-[10px] text-zinc-600 font-mono pointer-events-none tracking-widest">
              OSCILLOSCOPE
            </div>
            <div className="absolute top-3 left-5 text-[10px] font-mono pointer-events-none tracking-widest" style={{ color: presetColor }}>
              {currentPreset.emoji} {currentPreset.name.toUpperCase()}
            </div>
          </div>

          {/* Master Volume */}
          <div className="rounded-2xl border border-pink-500/15 bg-pink-500/5 p-4 mb-6">
            <Slider
              label="MASTER VOLUME"
              value={params.volume}
              onChange={(v) => updateParam('volume', v)}
              min={0} max={1} step={0.01}
              color="#ec4899"
              displayValue={`${Math.round(params.volume * 100)}%`}
            />
          </div>

          {/* Parameter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            {/* 1. WAVEFORM */}
            <ParamSection title="Waveform" color="#ec4899">
              {/* Shape selector */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] font-bold text-zinc-500">SHAPE</span>
                  <LockBtn locked={lockedParams.has('shape')} onClick={() => toggleLock('shape')} />
                </div>
                <div
                  className="grid grid-cols-4 gap-1 p-1 rounded-lg border border-pink-500/15"
                  style={{ opacity: lockedParams.has('shape') ? 0.5 : 1 }}
                >
                  {SHAPES.map(s => (
                    <button
                      key={s}
                      onClick={() => !lockedParams.has('shape') && updateParam('shape', s)}
                      disabled={lockedParams.has('shape')}
                      className="h-8 rounded flex items-center justify-center transition-all"
                      style={{
                        background: params.shape === s ? '#ec489920' : 'transparent',
                        color: params.shape === s ? '#f472b6' : '#52525b',
                      }}
                    >
                      {s === 'sine' && <span className="text-xs">∿</span>}
                      {s === 'triangle' && <span className="text-xs">△</span>}
                      {s === 'square' && <span className="text-xs">⊓</span>}
                      {s === 'sawtooth' && <span className="text-xs">⩘</span>}
                    </button>
                  ))}
                </div>
              </div>
              <LockSlider
                label="Frequency"
                value={params.frequency}
                min={50} max={2000} step={1}
                unit="Hz"
                color="#ec4899"
                onChange={(v) => updateParam('frequency', v)}
                locked={lockedParams.has('frequency')}
                onToggleLock={() => toggleLock('frequency')}
              />
              <LockSlider
                label="Sweep (Pitch)"
                value={params.sweep}
                min={-1} max={1} step={0.1}
                unit=""
                color="#ec4899"
                onChange={(v) => updateParam('sweep', v)}
                locked={lockedParams.has('sweep')}
                onToggleLock={() => toggleLock('sweep')}
              />
            </ParamSection>

            {/* 2. FILTER & ENV */}
            <ParamSection title="Filter & Env" color="#06b6d4">
              <LockSlider
                label="Cutoff"
                value={params.filterFreq}
                min={100} max={5000} step={10}
                unit="Hz"
                color="#06b6d4"
                onChange={(v) => updateParam('filterFreq', v)}
                locked={lockedParams.has('filterFreq')}
                onToggleLock={() => toggleLock('filterFreq')}
              />
              <LockSlider
                label="Pop (Resonance)"
                value={params.filterQ}
                min={0} max={20} step={0.5}
                unit="Q"
                color="#06b6d4"
                onChange={(v) => updateParam('filterQ', v)}
                locked={lockedParams.has('filterQ')}
                onToggleLock={() => toggleLock('filterQ')}
              />
              <LockSlider
                label="Filter Env"
                value={params.filterEnv}
                min={-2000} max={2000} step={50}
                unit="Hz"
                color="#06b6d4"
                onChange={(v) => updateParam('filterEnv', v)}
                locked={lockedParams.has('filterEnv')}
                onToggleLock={() => toggleLock('filterEnv')}
              />
              <LockSlider
                label="Decay (Length)"
                value={params.decay}
                min={0.05} max={2.0} step={0.05}
                unit="s"
                color="#06b6d4"
                onChange={(v) => updateParam('decay', v)}
                locked={lockedParams.has('decay')}
                onToggleLock={() => toggleLock('decay')}
              />
            </ParamSection>

            {/* 3. FM TEXTURE */}
            <ParamSection title="FM Texture" color="#8b5cf6">
              <LockSlider
                label="FM Speed"
                value={params.modSpeed}
                min={0} max={200} step={1}
                unit="Hz"
                color="#8b5cf6"
                onChange={(v) => updateParam('modSpeed', v)}
                locked={lockedParams.has('modSpeed')}
                onToggleLock={() => toggleLock('modSpeed')}
              />
              <LockSlider
                label="FM Depth"
                value={params.modDepth}
                min={0} max={2000} step={10}
                unit=""
                color="#8b5cf6"
                onChange={(v) => updateParam('modDepth', v)}
                locked={lockedParams.has('modDepth')}
                onToggleLock={() => toggleLock('modDepth')}
              />
            </ParamSection>

            {/* 4. FX BUS */}
            <ParamSection title="FX Bus" color="#f59e0b">
              <LockSlider
                label="Tape Delay"
                value={params.delay}
                min={0} max={1} step={0.05}
                unit=""
                color="#f59e0b"
                onChange={(v) => updateParam('delay', v)}
                locked={lockedParams.has('delay')}
                onToggleLock={() => toggleLock('delay')}
              />
              <LockSlider
                label="Delay Wobble"
                value={params.wobble}
                min={0} max={0.5} step={0.01}
                unit=""
                color="#f59e0b"
                onChange={(v) => updateParam('wobble', v)}
                locked={lockedParams.has('wobble')}
                onToggleLock={() => toggleLock('wobble')}
              />
            </ParamSection>
          </div>

          {/* Signal Flow */}
          <div className="rounded-2xl border border-pink-500/10 bg-pink-500/3 p-5 mb-6">
            <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
              DSP 信号流 · ANIME SFX ENGINE
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px]">
              {[
                { label: 'OSC', sub: params.shape, color: '#ec4899' },
                { label: 'FILTER', sub: `LP ${Math.round(params.filterFreq)}Hz`, color: '#06b6d4' },
                { label: 'ENV', sub: `${Math.round(params.decay * 1000)}ms`, color: '#8b5cf6' },
              ].map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div
                    className="px-3 py-2 rounded-lg text-center min-w-[70px]"
                    style={{ background: stage.color + '12', border: `1px solid ${stage.color}30` }}
                  >
                    <div className="font-bold uppercase tracking-wider" style={{ color: stage.color }}>{stage.label}</div>
                    <div className="text-[9px] text-zinc-600">{stage.sub}</div>
                  </div>
                  {i < 2 && <span className="text-zinc-700">→</span>}
                </div>
              ))}
              <span className="text-zinc-700 mx-1">→</span>
              <div className="px-3 py-2 rounded-lg text-center" style={{ background: '#f59e0b12', border: '1px solid #f59e0b30' }}>
                <div className="font-bold uppercase tracking-wider text-[#f59e0b]">FX</div>
                <div className="text-[9px] text-zinc-600">Delay + Wobble</div>
              </div>
              <span className="text-zinc-700">→</span>
              <div className="px-3 py-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="font-bold uppercase tracking-wider text-zinc-300">MASTER</div>
                <div className="text-[9px] text-zinc-600">Compressor → Out</div>
              </div>
            </div>
          </div>

          {/* Keyboard */}
          <div className="rounded-2xl border border-pink-500/10 bg-pink-500/3 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                键盘演奏 <span className="text-pink-400">Octave {octave}</span>
              </h4>
              <span className="text-[10px] text-zinc-600">键盘 A-K · 鼠标点击 · Z/X 八度 · MIDI: {midi.midiReady ? 'ON' : 'OFF'}</span>
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
                        ? (isBlack ? '#ec4899' : '#ec489930')
                        : (isBlack ? '#1a0a18' : '#27272a'),
                      border: `1px solid ${isActive ? '#ec4899' : '#3f3f46'}`,
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
                    <span
                      className="text-[9px] font-mono mb-1.5"
                      style={{ color: isActive ? '#fff' : (isBlack ? '#52525b' : '#71717a') }}
                    >
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

// --- Sub Components ---

function ParamSection({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl border p-4 space-y-3"
      style={{ borderColor: color + '20', background: color + '05' }}
    >
      <div
        className="text-[10px] font-bold uppercase tracking-widest pb-2 border-b"
        style={{ color, borderColor: color + '15' }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function LockSlider({
  label, value, min, max, step, unit, color, onChange, locked, onToggleLock,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  color: string;
  onChange: (v: number) => void;
  locked: boolean;
  onToggleLock: () => void;
}) {
  const display = value !== undefined && !isNaN(value)
    ? `${Math.round(value * 100) / 100}${unit}`
    : `0${unit}`;

  return (
    <div style={{ opacity: locked ? 0.6 : 1 }}>
      <div className="flex justify-between items-center mb-1">
        <span
          className="text-[10px] font-bold transition-colors"
          style={{ color: locked ? '#06b6d4' : '#a1a1aa' }}
        >
          {label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-zinc-500">{display}</span>
          <LockBtn locked={locked} onClick={onToggleLock} />
        </div>
      </div>
      <Slider
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        color={locked ? '#06b6d4' : color}
        displayValue={display}
      />
    </div>
  );
}

function LockBtn({ locked, onClick }: { locked: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-0.5 rounded hover:bg-zinc-800 transition-colors"
      style={{ color: locked ? '#06b6d4' : '#52525b' }}
    >
      {locked ? '🔒' : '🔓'}
    </button>
  );
}
