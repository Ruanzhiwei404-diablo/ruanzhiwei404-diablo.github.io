// CrystalPrism 17 Presets
// Based on scraped data from the original PRISM PRO synthesizer

import type { PresetDef } from './types';

export const PRESETS: PresetDef[] = [
  // === CLASSIC CRYSTAL ===
  {
    name: 'PRISM',
    category: 'CLASSIC CRYSTAL',
    waveform: 'sine',
    params: { rootFreq: 600, decay: 0.50, arpGate: 0.80, tone: 0.80, impact: 0.20, octave: 1, drift: 0.00, movement: 0.80, stereo: 0.30, shimmer: 0.10, magic: 0.00, arpMode: 'up', rate: '1/8' },
  },
  {
    name: 'CHIME',
    category: 'CLASSIC CRYSTAL',
    waveform: 'triangle',
    params: { rootFreq: 800, decay: 0.35, arpGate: 0.60, tone: 0.90, impact: 0.15, octave: 2, drift: 0.05, movement: 0.60, stereo: 0.50, shimmer: 0.25, magic: 0.05, arpMode: 'up-down', rate: '1/16' },
  },
  {
    name: 'HALO',
    category: 'CLASSIC CRYSTAL',
    waveform: 'sine',
    params: { rootFreq: 400, decay: 0.80, arpGate: 0.90, tone: 0.60, impact: 0.10, octave: 2, drift: 0.10, movement: 0.40, stereo: 0.70, shimmer: 0.50, magic: 0.15, arpMode: 'converge', rate: '1/4' },
  },
  {
    name: 'GLINT',
    category: 'CLASSIC CRYSTAL',
    waveform: 'triangle',
    params: { rootFreq: 1000, decay: 0.20, arpGate: 0.40, tone: 0.95, impact: 0.30, octave: 3, drift: 0.02, movement: 0.90, stereo: 0.60, shimmer: 0.15, magic: 0.08, arpMode: 'pinky', rate: '1/32' },
  },
  {
    name: 'STELLA',
    category: 'CLASSIC CRYSTAL',
    waveform: 'sine',
    params: { rootFreq: 500, decay: 0.60, arpGate: 0.75, tone: 0.70, impact: 0.25, octave: 1, drift: 0.08, movement: 0.50, stereo: 0.45, shimmer: 0.35, magic: 0.10, arpMode: 'up', rate: '1/8' },
  },

  // === CLASSIC ETHEREAL ===
  {
    name: 'LUMEN',
    category: 'CLASSIC ETHEREAL',
    waveform: 'sine',
    params: { rootFreq: 300, decay: 1.20, arpGate: 0.95, tone: 0.40, impact: 0.05, octave: 2, drift: 0.15, movement: 0.25, stereo: 0.85, shimmer: 0.70, magic: 0.25, arpMode: 'diverge', rate: '1/4' },
  },
  {
    name: 'SHARD',
    category: 'CLASSIC ETHEREAL',
    waveform: 'triangle',
    params: { rootFreq: 700, decay: 0.45, arpGate: 0.55, tone: 0.85, impact: 0.20, octave: 2, drift: 0.06, movement: 0.70, stereo: 0.55, shimmer: 0.40, magic: 0.12, arpMode: 'rain', rate: '1/16' },
  },
  {
    name: 'AURA',
    category: 'CLASSIC ETHEREAL',
    waveform: 'sine',
    params: { rootFreq: 200, decay: 1.50, arpGate: 0.90, tone: 0.35, impact: 0.02, octave: 1, drift: 0.20, movement: 0.15, stereo: 0.90, shimmer: 0.85, magic: 0.30, arpMode: 'converge', rate: '1/2' },
  },

  // === NEW LIQUID ===
  {
    name: 'JELLY',
    category: 'NEW LIQUID',
    waveform: 'triangle',
    params: { rootFreq: 350, decay: 0.40, arpGate: 0.65, tone: 0.55, impact: 0.35, octave: 1, drift: 0.12, movement: 0.75, stereo: 0.40, shimmer: 0.20, magic: 0.05, arpMode: 'up-down', rate: '1/8' },
  },
  {
    name: 'MERCURY',
    category: 'NEW LIQUID',
    waveform: 'sawtooth',
    params: { rootFreq: 550, decay: 0.30, arpGate: 0.50, tone: 0.75, impact: 0.40, octave: 2, drift: 0.08, movement: 0.85, stereo: 0.50, shimmer: 0.15, magic: 0.08, arpMode: 'random', rate: '1/16' },
  },
  {
    name: 'RUBBER',
    category: 'NEW LIQUID',
    waveform: 'square',
    params: { rootFreq: 150, decay: 0.25, arpGate: 0.45, tone: 0.50, impact: 0.50, octave: 1, drift: 0.04, movement: 0.90, stereo: 0.30, shimmer: 0.05, magic: 0.02, arpMode: 'down', rate: '1/8' },
  },
  {
    name: 'FLUX',
    category: 'NEW LIQUID',
    waveform: 'sine',
    params: { rootFreq: 450, decay: 0.55, arpGate: 0.70, tone: 0.65, impact: 0.25, octave: 2, drift: 0.18, movement: 0.55, stereo: 0.65, shimmer: 0.45, magic: 0.18, arpMode: 'rain', rate: '1/4' },
  },

  // === KAWAII / UI ===
  {
    name: 'POP',
    category: 'KAWAII / UI',
    waveform: 'triangle',
    params: { rootFreq: 700, decay: 0.15, arpGate: 0.35, tone: 0.90, impact: 0.35, octave: 3, drift: 0.01, movement: 0.95, stereo: 0.40, shimmer: 0.08, magic: 0.03, arpMode: 'pinky', rate: '1/32' },
  },
  {
    name: 'KIRA',
    category: 'KAWAII / UI',
    waveform: 'sine',
    params: { rootFreq: 900, decay: 0.18, arpGate: 0.30, tone: 0.95, impact: 0.30, octave: 2, drift: 0.03, movement: 0.88, stereo: 0.55, shimmer: 0.12, magic: 0.04, arpMode: 'up', rate: '1/16' },
  },

  // === CLASSIC FX ===
  {
    name: 'WHOOSH',
    category: 'CLASSIC FX',
    waveform: 'sawtooth',
    params: { rootFreq: 250, decay: 1.00, arpGate: 0.90, tone: 0.30, impact: 0.15, octave: 1, drift: 0.25, movement: 0.10, stereo: 0.80, shimmer: 0.60, magic: 0.20, arpMode: 'diverge', rate: '1/2' },
  },
  {
    name: 'IMPACT',
    category: 'CLASSIC FX',
    waveform: 'square',
    params: { rootFreq: 120, decay: 0.30, arpGate: 0.85, tone: 0.45, impact: 0.80, octave: 1, drift: 0.02, movement: 0.20, stereo: 0.60, shimmer: 0.30, magic: 0.10, arpMode: 'converge', rate: '1/4' },
  },
  {
    name: 'CHARGE',
    category: 'CLASSIC FX',
    waveform: 'sawtooth',
    params: { rootFreq: 200, decay: 0.40, arpGate: 0.70, tone: 0.85, impact: 0.60, octave: 2, drift: 0.10, movement: 0.30, stereo: 0.50, shimmer: 0.35, magic: 0.15, arpMode: 'up', rate: '1/8' },
  },
];
