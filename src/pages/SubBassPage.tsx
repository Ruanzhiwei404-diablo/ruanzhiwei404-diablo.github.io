import { useState, useRef, useEffect, useCallback } from 'react';
import { SubBassEngine } from '../audio/subBassEngine';
import type { SubBassParams, SubBassPattern } from '../audio/types';
import { DEFAULT_SUBBASS_PARAMS, KEYBOARD_MAP, midiToFreq } from '../audio/types';
import { SUBBASS_PRESETS } from '../audio/subBassPresets';
import Knob from '../components/Knob';
import Slider from '../components/Slider';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMIDI } from '../hooks/useMIDI';
import { useRecorder } from '../hooks/useRecorder';

const GROUP_COLORS: Record<string, string> = {
  'SUB': '#f59e0b',
  'DUB': '#8b5cf6',
  'CINEMATIC': '#ef4444',
  'ELECTRONIC': '#06b6d4',
};

const PATTERNS: SubBassPattern[] = ['DROP', 'PULSE', 'WOBBLE', 'ROLL', 'OFF'];

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

export default function SubBassPage() {
  const engineRef = useRef<SubBassEngine | null>(null);
  const [activePreset, setActivePreset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [params, setParams] = useState<SubBassParams>({ ...DEFAULT_SUBBASS_PARAMS });

  useEffect(() => {
    const engine = new SubBassEngine();
    engineRef.current = engine;
    const preset = SUBBASS_PRESETS[0];
    const newParams = { ...DEFAULT_SUBBASS_PARAMS, ...preset.params } as SubBassParams;
    engine.setParams(newParams);
    setParams(newParams);
    return () => { engine.destroy(); };
  }, []);

  const engine = engineRef.current;

  const selectPreset = useCallback((idx: number) => {
    if (!engine) return;
    setActivePreset(idx);
    const preset = SUBBASS_PRESETS[idx];
    const newParams = { ...DEFAULT_SUBBASS_PARAMS, ...preset.params } as SubBassParams;
    engine.setParams(newParams);
    setParams(newParams);
  }, [engine]);

  const updateParam = useCallback(<K extends keyof SubBassParams>(key: K, value: SubBassParams[K]) => {
    if (!engine) return;
    engine.setParam(key, value);
    setParams(prev => ({ ...prev, [key]: value }));
  }, [engine]);

  const togglePlay = useCallback(async () => {
    if (!engine) return;
    if (isPlaying) {
      engine.stop();
      setIsPlaying(false);
    } else {
      await engine.play();
      setIsPlaying(true);
    }
  }, [engine, isPlaying]);

  const triggerPreview = useCallback(async () => {
    if (!engine) return;
    await engine.triggerNote();
  }, [engine]);

  // Keyboard
  const handleNoteOn = useCallback(async (freq: number) => {
    if (!engine) return;
    await engine.triggerNote(freq);
  }, [engine]);
  const { octave, activeNotes } = useKeyboard({
    onNoteOn: handleNoteOn,
    onNoteOff: () => {},
    baseOctave: 2,
  });

  // Mouse/touch input on piano keys
  const [mouseActive, setMouseActive] = useState<Set<string>>(new Set());

  const handleMouseNoteOn = useCallback(async (key: string) => {
    if (!engine) return;
    const offset = KEYBOARD_MAP[key];
    if (offset === undefined) return;
    const midi = (octave + 1) * 12 + offset;
    await engine.triggerNote(midiToFreq(midi));
    setMouseActive(prev => new Set(prev).add(key));
  }, [engine, octave]);

  const handleMouseNoteOff = useCallback((key: string) => {
    setMouseActive(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, []);

  // MIDI
  const midi = useMIDI({
    onNoteOn: async (freq) => { if (engine) await engine.triggerNote(freq); },
    onNoteOff: () => {},
  });

  // Recording
  const recorder = useRecorder(() => engine?.getRecordStream() ?? null);

  const groupedPresets = SUBBASS_PRESETS.reduce((acc, p, i) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push({ ...p, idx: i });
    return acc;
  }, {} as Record<string, (typeof SUBBASS_PRESETS[number] & { idx: number })[]>);

  const freqDisplay = `${Math.round(params.rootFreq)} Hz`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900 text-zinc-300">
      {/* Header */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              boxShadow: '0 4px 14px #8b5cf640',
            }}
          >
            <span className="text-white font-black text-lg">T</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tighter">
              Sub_Bass
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono tracking-widest">V10.2 · 三引擎低音合成器</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {midi.midiReady && (
              <div className="px-2 py-1 rounded-lg text-[10px] font-mono border border-purple-500/30 bg-purple-500/10 text-purple-400">
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
              {recorder.isRecording ? 'STOP' : 'REC'}
            </button>
            {recorder.audioUrl && !recorder.isRecording && (
              <button
                onClick={recorder.download}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all"
              >
                Download
              </button>
            )}
            <button
              onClick={triggerPreview}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
            >
              Preview
            </button>
            <button
              onClick={togglePlay}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2"
              style={{
                background: isPlaying ? '#ef444420' : '#22c55e20',
                border: `1.5px solid ${isPlaying ? '#ef444450' : '#22c55e50'}`,
                color: isPlaying ? '#ef4444' : '#22c55e',
              }}
            >
              {isPlaying ? '■ STOP' : '▶ PLAY'}
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row">
        {/* Left: Presets */}
        <div className="w-full lg:w-60 flex-shrink-0 border-r border-zinc-800/60 bg-zinc-950/50 p-4 max-h-[calc(100vh-73px)] overflow-y-auto">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
            音色预设 <span className="text-purple-400 ml-1">{SUBBASS_PRESETS.length} presets</span>
          </h3>
          {Object.entries(groupedPresets).map(([category, presets]) => {
            const color = GROUP_COLORS[category] || '#71717a';
            return (
              <div key={category} className="mb-5">
                <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5 pl-1" style={{ color }}>
                  {category}
                </div>
                {presets.map((p) => (
                  <button
                    key={p.idx}
                    onClick={() => selectPreset(p.idx)}
                    className="w-full text-left p-2 rounded-lg border transition-all duration-150 flex items-center gap-2.5 mb-0.5"
                    style={{
                      borderColor: activePreset === p.idx ? color + '50' : 'transparent',
                      background: activePreset === p.idx ? color + '10' : 'transparent',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                      style={{
                        background: activePreset === p.idx ? color + '20' : '#18181b',
                        color: activePreset === p.idx ? color : '#71717a',
                      }}
                    >
                      {p.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold tracking-wide truncate"
                           style={{ color: activePreset === p.idx ? color : '#a1a1aa' }}>
                        {p.name}
                      </div>
                      <div className="text-[10px] text-zinc-600 truncate">
                        {p.params.rootFreq}Hz · {p.params.pattern}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* Right: Parameters */}
        <div className="flex-1 p-6 overflow-y-auto max-h-[calc(100vh-73px)]">
          {/* SEQUENCE + ENGINE INFO */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="col-span-2 card p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-3">SEQUENCE</h4>
              <div className="space-y-3">
                <Slider
                  label="BPM"
                  value={params.bpm}
                  onChange={(v) => updateParam('bpm', v)}
                  min={60} max={200} step={1}
                  color="#8b5cf6"
                  displayValue={`${Math.round(params.bpm)} BPM`}
                />
                <Slider
                  label="VOLUME"
                  value={params.volume}
                  onChange={(v) => updateParam('volume', v)}
                  min={0} max={1} step={0.01}
                  color="#8b5cf6"
                  displayValue={`${Math.round(params.volume * 100)}%`}
                />
              </div>
            </div>

            <div className="card p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-3">PATTERN</h4>
              <div className="space-y-2">
                {PATTERNS.map((pat) => (
                  <button
                    key={pat}
                    onClick={() => updateParam('pattern', pat)}
                    className="w-full px-2 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all"
                    style={{
                      background: params.pattern === pat ? '#f59e0b20' : 'transparent',
                      border: `1px solid ${params.pattern === pat ? '#f59e0b50' : '#27272a'}`,
                      color: params.pattern === pat ? '#f59e0b' : '#71717a',
                    }}
                  >
                    {pat}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex flex-col justify-center items-center gap-1">
              <div className="text-[10px] text-zinc-600 uppercase tracking-widest">ACTIVE</div>
              <div className="text-xl font-black text-white tracking-tight">
                {SUBBASS_PRESETS[activePreset].name}
              </div>
              <div className="text-xs text-zinc-500">
                {SUBBASS_PRESETS[activePreset].category}
              </div>
            </div>
          </div>

          {/* ENGINE MIX */}
          <div className="rounded-2xl border border-zinc-800/40 bg-zinc-900/20 p-5 mb-6">
            <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">ENGINE MIX · 三层引擎</h4>
            <div className="grid grid-cols-3 gap-6">
              <Knob label="DROP" sublabel="Sub Oscillator" value={params.dropLevel}
                    onChange={(v) => updateParam('dropLevel', v)} color="#f59e0b"
                    size={72} displayValue={`${Math.round(params.dropLevel * 100)}%`} />
              <Knob label="IMPACT" sublabel="Noise Transient" value={params.impactLevel}
                    onChange={(v) => updateParam('impactLevel', v)} color="#ef4444"
                    size={72} displayValue={`${Math.round(params.impactLevel * 100)}%`} />
              <Knob label="RUMBLE" sublabel="Sub-Harmonic" value={params.rumbleLevel}
                    onChange={(v) => updateParam('rumbleLevel', v)} color="#8b5cf6"
                    size={72} displayValue={`${Math.round(params.rumbleLevel * 100)}%`} />
            </div>
          </div>

          {/* SHAPE + MOD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* SHAPE */}
            <ParamCard title="SHAPE" color="#10b981">
              <Knob label="DISTORTION" sublabel="Wave Shaper" value={params.distortion}
                    onChange={(v) => updateParam('distortion', v)} color="#10b981" />
              <Knob label="CUTOFF" sublabel="Filter Cutoff" value={params.cutoff}
                    onChange={(v) => updateParam('cutoff', v)} color="#10b981" />
              <Knob label="RESONANCE" sublabel="Filter Q" value={params.resonance}
                    onChange={(v) => updateParam('resonance', v)} color="#10b981" />
            </ParamCard>

            {/* MOD + ENV */}
            <ParamCard title="MOD / ENV" color="#06b6d4">
              <Knob label="LFO RATE" sublabel="Mod Speed" value={params.lfoRate}
                    onChange={(v) => updateParam('lfoRate', v)} color="#06b6d4" />
              <Knob label="LFO DEPTH" sublabel="Mod Amount" value={params.lfoDepth}
                    onChange={(v) => updateParam('lfoDepth', v)} color="#06b6d4" />
              <Knob label="ATTACK" sublabel="Env Attack" value={params.attack}
                    onChange={(v) => updateParam('attack', v)} color="#06b6d4" />
              <Knob label="DECAY" sublabel="Env Decay" value={params.decay}
                    onChange={(v) => updateParam('decay', v)} color="#06b6d4" />
            </ParamCard>
          </div>

          {/* ROOT FREQ */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 mb-6">
            <Slider
              label="ROOT FREQUENCY"
              value={params.rootFreq}
              onChange={(v) => updateParam('rootFreq', v)}
              min={28} max={150} step={1}
              color="#f59e0b"
              displayValue={freqDisplay}
            />
          </div>

          {/* Signal Flow */}
          <div className="rounded-2xl border border-zinc-800/40 bg-zinc-900/20 p-5 mb-6">
            <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
              DSP 合成架构 · 三层引擎叠加
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px]">
              {[
                { label: 'DROP', color: '#f59e0b', sub: 'Sub Osc' },
                { label: 'IMPACT', color: '#ef4444', sub: 'Noise Burst' },
                { label: 'RUMBLE', color: '#8b5cf6', sub: 'Sub-Harm' },
              ].map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div
                    className="px-3 py-2 rounded-lg text-center min-w-[80px]"
                    style={{
                      background: stage.color + '12',
                      border: `1px solid ${stage.color}30`,
                    }}
                  >
                    <div className="font-bold uppercase tracking-wider" style={{ color: stage.color }}>
                      {stage.label}
                    </div>
                    <div className="text-[9px] text-zinc-600">{stage.sub}</div>
                  </div>
                  {i < 2 && <span className="text-zinc-700 text-lg">+</span>}
                </div>
              ))}
              <span className="text-zinc-700 text-lg mx-1">→</span>
              <div className="px-3 py-2 rounded-lg text-center" style={{ background: '#10b98112', border: '1px solid #10b98130' }}>
                <div className="font-bold uppercase tracking-wider text-[#10b981]">SHAPER</div>
                <div className="text-[9px] text-zinc-600">Distortion</div>
              </div>
              <span className="text-zinc-700 text-lg">→</span>
              <div className="px-3 py-2 rounded-lg text-center" style={{ background: '#06b6d412', border: '1px solid #06b6d430' }}>
                <div className="font-bold uppercase tracking-wider text-[#06b6d4]">FILTER</div>
                <div className="text-[9px] text-zinc-600">LP + LFO</div>
              </div>
              <span className="text-zinc-700 text-lg">→</span>
              <div className="px-3 py-2 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="font-bold uppercase tracking-wider text-zinc-300">MASTER</div>
                <div className="text-[9px] text-zinc-600">Output</div>
              </div>
            </div>
          </div>

          {/* Keyboard */}
          <div className="rounded-2xl border border-zinc-800/40 bg-zinc-900/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                键盘演奏 <span className="text-purple-400">Octave {octave}</span>
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
                        ? (isBlack ? '#8b5cf6' : '#8b5cf630')
                        : (isBlack ? '#18181b' : '#27272a'),
                      border: `1px solid ${isActive ? '#8b5cf6' : '#3f3f46'}`,
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

function ParamCard({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div
      className="card p-4 rounded-2xl border flex flex-wrap justify-center gap-3"
      style={{ borderColor: color + '20', background: color + '05' }}
    >
      <div className="w-full text-center mb-1">
        <h4 className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}
