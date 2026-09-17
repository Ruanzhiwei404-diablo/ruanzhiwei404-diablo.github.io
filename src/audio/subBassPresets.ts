import type { SubBassPresetDef } from './types';

export const SUBBASS_PRESETS: SubBassPresetDef[] = [
  {
    name: 'DEEP DROP',
    category: 'SUB',
    params: { volume: 0.7, dropLevel: 0.9, impactLevel: 0.15, rumbleLevel: 0.4, distortion: 0.1, cutoff: 0.3, resonance: 0.2, lfoRate: 0.15, lfoDepth: 0.2, attack: 0.05, decay: 0.7, bpm: 120, rootFreq: 41, pattern: 'DROP' },
  },
  {
    name: '808 PUNCH',
    category: 'SUB',
    params: { volume: 0.8, dropLevel: 0.7, impactLevel: 0.6, rumbleLevel: 0.2, distortion: 0.05, cutoff: 0.6, resonance: 0.5, lfoRate: 0.1, lfoDepth: 0.1, attack: 0.01, decay: 0.4, bpm: 140, rootFreq: 55, pattern: 'PULSE' },
  },
  {
    name: 'WOBBLE BASS',
    category: 'DUB',
    params: { volume: 0.75, dropLevel: 0.6, impactLevel: 0.3, rumbleLevel: 0.5, distortion: 0.35, cutoff: 0.4, resonance: 0.7, lfoRate: 0.5, lfoDepth: 0.8, attack: 0.02, decay: 0.3, bpm: 140, rootFreq: 65, pattern: 'WOBBLE' },
  },
  {
    name: 'REAPER',
    category: 'DUB',
    params: { volume: 0.85, dropLevel: 0.5, impactLevel: 0.5, rumbleLevel: 0.7, distortion: 0.5, cutoff: 0.35, resonance: 0.8, lfoRate: 0.7, lfoDepth: 0.9, attack: 0.01, decay: 0.2, bpm: 150, rootFreq: 49, pattern: 'WOBBLE' },
  },
  {
    name: 'SEISMIC',
    category: 'CINEMATIC',
    params: { volume: 0.9, dropLevel: 0.8, impactLevel: 0.4, rumbleLevel: 0.9, distortion: 0.15, cutoff: 0.2, resonance: 0.3, lfoRate: 0.08, lfoDepth: 0.5, attack: 0.15, decay: 0.9, bpm: 90, rootFreq: 33, pattern: 'ROLL' },
  },
  {
    name: 'TITAN',
    category: 'CINEMATIC',
    params: { volume: 0.95, dropLevel: 0.9, impactLevel: 0.7, rumbleLevel: 0.85, distortion: 0.25, cutoff: 0.25, resonance: 0.4, lfoRate: 0.05, lfoDepth: 0.3, attack: 0.2, decay: 1.0, bpm: 80, rootFreq: 28, pattern: 'DROP' },
  },
  {
    name: 'NEON ROLL',
    category: 'ELECTRONIC',
    params: { volume: 0.7, dropLevel: 0.5, impactLevel: 0.4, rumbleLevel: 0.3, distortion: 0.4, cutoff: 0.7, resonance: 0.6, lfoRate: 0.8, lfoDepth: 0.5, attack: 0.01, decay: 0.25, bpm: 160, rootFreq: 73, pattern: 'ROLL' },
  },
  {
    name: 'GLITCH',
    category: 'ELECTRONIC',
    params: { volume: 0.65, dropLevel: 0.4, impactLevel: 0.8, rumbleLevel: 0.2, distortion: 0.6, cutoff: 0.8, resonance: 0.9, lfoRate: 0.9, lfoDepth: 0.7, attack: 0.005, decay: 0.15, bpm: 170, rootFreq: 82, pattern: 'PULSE' },
  },
];
