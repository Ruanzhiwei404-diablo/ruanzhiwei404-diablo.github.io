import { useState, useRef, useEffect, useCallback } from 'react';
import { CrystalEngine, DEFAULT_PARAMS } from '../audio/audioEngine';
import type { EngineParams, Scale, ArpMode, ArpRate } from '../audio/types';
import { KEYBOARD_MAP, midiToFreq } from '../audio/types';
import { PRESETS } from '../audio/presets';
import Knob from '../components/Knob';
import Slider from '../components/Slider';
import { useKeyboard } from '../hooks/useKeyboard';
import { useMIDI } from '../hooks/useMIDI';
import { useRecorder } from '../hooks/useRecorder';

const GROUP_COLORS: Record<string, string> = {
  'CLASSIC CRYSTAL': '#06b6d4',
  'CLASSIC ETHEREAL': '#a855f7',
  'NEW LIQUID': '#3b82f6',
  'KAWAII / UI': '#ec4899',
  'CLASSIC FX': '#f59e0b',
};

const SCALES: Scale[] = ['chromatic', 'major', 'minor', 'pentatonic_maj', 'pentatonic_min', 'dorian', 'lydian'];
const ARP_MODES: ArpMode[] = ['off', 'up', 'down', 'up-down', 'down-up', 'converge', 'diverge', 'pinky', 'random', 'rain'];
const RATES: ArpRate[] = ['1/1', '1/2', '1/4', '1/8', '1/16', '1/32'];

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

export default function CrystalPrismPage() {
  const engineRef = useRef<CrystalEngine | null>(null);
  const [activePreset, setActivePreset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [params, setParams] = useState<EngineParams>({ ...DEFAULT_PARAMS });

  useEffect(() => {
    const engine = new CrystalEngine();
    engineRef.current = engine;
    const preset = PRESETS[0];
    engine.setParams({ ...DEFAULT_PARAMS, ...preset.params } as EngineParams);
    engine.setWaveform(preset.waveform);
    setParams(engine.params);
    return () => { engine.destroy(); };
  }, []);

  const engine = engineRef.current;

  const selectPreset = useCallback((idx: number) => {
    if (!engine) return;
    setActivePreset(idx);
    const preset = PRESETS[idx];
    const newParams = { ...DEFAULT_PARAMS, ...preset.params } as EngineParams;
    engine.setParams(newParams);
    engine.setWaveform(preset.waveform);
    setParams(newParams);
  }, [engine]);

  const updateParam = useCallback(<K extends keyof EngineParams>(key: K, value: EngineParams[K]) => {
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

  // Keyboard input
  const handleNoteOn = useCallback(async (freq: number) => {
    if (!engine) return;
    await engine.triggerNote(freq);
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

  // MIDI input
  const midi = useMIDI({
    onNoteOn: async (freq) => { if (engine) await engine.triggerNote(freq); },
    onNoteOff: () => {},
  });

  // Recording
  const recorder = useRecorder(() => engine?.getRecordStream() ?? null);

  const freqDisplay = params.rootFreq < 1000
    ? `${Math.round(params.rootFreq)} Hz`
    : `${(params.rootFreq / 1000).toFixed(2)} kHz`;

  const groupedPresets = PRESETS.reduce((acc, p, i) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push({ ...p, idx: i });
    return acc;
  }, {} as Record<string, (typeof PRESETS[number] & { idx: number })[]>);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* Header */}
      <div className="border-b border-slate-800/60 bg-slate-950/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
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
              PRISM <span className="text-pink-300">PRO</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-mono tracking-widest">96kHz 24-BIT STUDIO · CrystalPrism</p>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* MIDI status */}
            {midi.midiReady && (
              <div className="px-2 py-1 rounded-lg text-[10px] font-mono border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                MIDI: {midi.midiDevices.join(', ') || 'connected'}
              </div>
            )}
            {/* Record button */}
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
            {/* Preview button */}
            <button
              onClick={triggerPreview}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all"
            >
              Preview
            </button>
            {/* Play/Stop */}
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
        <div className="w-full lg:w-64 flex-shrink-0 border-r border-slate-800/60 bg-slate-950/50 p-4 max-h-[calc(100vh-73px)] overflow-y-auto">
          <h3 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">
            音色预设 <span className="text-cyan-400 ml-1">{PRESETS.length} presets</span>
          </h3>
          {Object.entries(groupedPresets).map(([category, presets]) => {
            const color = GROUP_COLORS[category] || '#64748b';
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
                        background: activePreset === p.idx ? color + '20' : '#1e293b',
                        color: activePreset === p.idx ? color : '#64748b',
                      }}
                    >
                      {p.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] font-bold tracking-wide truncate"
                           style={{ color: activePreset === p.idx ? color : '#94a3b8' }}>
                        {p.name}
                      </div>
                      <div className="text-[10px] text-slate-600 truncate">
                        {p.params.rootFreq}Hz · {p.waveform}
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
          {/* SEQUENCER + TRANSPORT */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="col-span-2 lg:col-span-2 card p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-3">SEQUENCER</h4>
              <div className="space-y-3">
                <Slider
                  label="SPEED (BPM)"
                  value={params.speed}
                  onChange={(v) => updateParam('speed', v)}
                  min={40} max={300} step={1}
                  color="#f59e0b"
                  displayValue={`${Math.round(params.speed)} BPM`}
                />
                <Slider
                  label="MAIN VOL"
                  value={params.mainVol}
                  onChange={(v) => updateParam('mainVol', v)}
                  min={0} max={1} step={0.01}
                  color="#f59e0b"
                  displayValue={`${Math.round(params.mainVol * 100)}%`}
                />
              </div>
            </div>

            {/* THEORY */}
            <div className="card p-4 rounded-2xl border border-purple-500/20 bg-purple-500/5">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-3">THEORY</h4>
              <div className="space-y-3">
                <SelectField label="SCALE" value={params.scale} options={SCALES}
                  onChange={(v) => updateParam('scale', v as Scale)} color="#8b5cf6" />
                <SelectField label="ARP MODE" value={params.arpMode} options={ARP_MODES}
                  onChange={(v) => updateParam('arpMode', v as ArpMode)} color="#8b5cf6" />
                <SelectField label="RATE" value={params.rate} options={RATES}
                  onChange={(v) => updateParam('rate', v as ArpRate)} color="#8b5cf6" />
              </div>
            </div>
          </div>

          {/* KNOB GROUPS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* PHYSICS */}
            <ParamCard title="PHYSICS" color="#06b6d4">
              <Knob label="ROOT FREQ" sublabel="Base Frequency" value={(params.rootFreq - 20) / 1980}
                    onChange={(v) => updateParam('rootFreq', 20 + v * 1980)}
                    color="#06b6d4" displayValue={freqDisplay} />
              <Knob label="DECAY" sublabel="Decay Time" value={params.decay / 3}
                    onChange={(v) => updateParam('decay', Math.max(0.03, v * 3))}
                    color="#06b6d4" displayValue={`${params.decay.toFixed(2)}s`} />
              <Knob label="ARP GATE" sublabel="Note Length" value={params.arpGate}
                    onChange={(v) => updateParam('arpGate', v)} color="#06b6d4" />
            </ParamCard>

            {/* MATERIAL */}
            <ParamCard title="MATERIAL" color="#10b981">
              <Knob label="TONE" sublabel="Timbre Balance" value={params.tone}
                    onChange={(v) => updateParam('tone', v)} color="#10b981" />
              <Knob label="IMPACT" sublabel="Attack Strength" value={params.impact}
                    onChange={(v) => updateParam('impact', v)} color="#10b981" />
              <Knob label="OCTAVE" sublabel="Arp Range" value={(params.octave - 1) / 3}
                    onChange={(v) => updateParam('octave', Math.round(1 + v * 3))}
                    color="#10b981" displayValue={`${params.octave} oct`} />
            </ParamCard>

            {/* ORGANIC */}
            <ParamCard title="ORGANIC" color="#ec4899">
              <Knob label="DRIFT" sublabel="Instability" value={params.drift}
                    onChange={(v) => updateParam('drift', v)} color="#ec4899" />
              <Knob label="MOVEMENT" sublabel="LFO Speed" value={params.movement}
                    onChange={(v) => updateParam('movement', v)} color="#ec4899" />
            </ParamCard>
          </div>

          {/* ATMOSPHERE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ParamCard title="ATMOSPHERE" color="#6366f1">
              <Knob label="STEREO" sublabel="Stereo Width" value={params.stereo}
                    onChange={(v) => updateParam('stereo', v)} color="#6366f1" />
              <Knob label="SHIMMER" sublabel="Reverb Size" value={params.shimmer}
                    onChange={(v) => updateParam('shimmer', v)} color="#6366f1" />
              <Knob label="MAGIC" sublabel="Magic Delay" value={params.magic}
                    onChange={(v) => updateParam('magic', v)} color="#6366f1" />
            </ParamCard>

            {/* Active Preset Info */}
            <div className="card p-4 rounded-2xl border border-slate-800 bg-slate-900/40 flex flex-col justify-center items-center gap-2">
              <div className="text-[10px] text-slate-600 uppercase tracking-widest">ACTIVE PRESET</div>
              <div className="text-2xl font-black text-white tracking-tight">
                {PRESETS[activePreset].name}
              </div>
              <div className="text-xs text-slate-500">
                {PRESETS[activePreset].category} · {PRESETS[activePreset].waveform}
              </div>
              <div className="flex gap-1 mt-2">
                {Object.entries(GROUP_COLORS).map(([cat, color]) => {
                  const ct = PRESETS.filter(p => p.category === cat).length;
                  return (
                    <div key={cat} className="flex items-center gap-1 text-[9px] text-slate-600"
                         title={`${cat}: ${ct} presets`}>
                      <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                      {ct}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Signal Flow */}
          <div className="rounded-2xl border border-slate-800/40 bg-slate-900/20 p-5 mb-6">
            <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">
              PRISM PRO 信号流
            </h4>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px]">
              {[
                { label: 'PHYSICS', color: '#06b6d4' },
                { label: 'MATERIAL', color: '#10b981' },
                { label: 'ORGANIC', color: '#ec4899' },
                { label: 'ATMOSPHERE', color: '#6366f1' },
              ].map((stage, i) => (
                <div key={stage.label} className="flex items-center gap-2">
                  <div
                    className="px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider"
                    style={{
                      background: stage.color + '15',
                      color: stage.color,
                      border: `1px solid ${stage.color}30`,
                    }}
                  >
                    {stage.label}
                  </div>
                  {i < 3 && <span className="text-slate-700 text-lg">→</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Keyboard */}
          <div className="rounded-2xl border border-slate-800/40 bg-slate-900/20 p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                键盘演奏 <span className="text-cyan-400">Octave {octave}</span>
              </h4>
              <span className="text-[10px] text-slate-600">键盘 A-K · 鼠标点击 · Z/X 八度 · MIDI: {midi.midiReady ? 'ON' : 'OFF'}</span>
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
                        ? (isBlack ? '#06b6d4' : '#06b6d430')
                        : (isBlack ? '#18181b' : '#27272a'),
                      border: `1px solid ${isActive ? '#06b6d4' : '#3f3f46'}`,
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

function SelectField({ label, value, options, onChange, color }: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  color: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-zinc-400 tracking-wide block mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-[11px] font-mono font-bold rounded-lg px-2 py-1.5 cursor-pointer outline-none transition-colors"
        style={{
          background: '#18181b',
          border: `1px solid ${color}30`,
          color,
        }}
      >
        {options.map((opt) => (
          <option key={opt} value={opt} style={{ background: '#18181b', color }}>
            {opt.replace(/_/g, ' ').toUpperCase()}
          </option>
        ))}
      </select>
    </div>
  );
}
