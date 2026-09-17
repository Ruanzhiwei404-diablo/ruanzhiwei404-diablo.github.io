import type { CuteSynthPresetDef } from './types';

export const CUTE_PRESETS: CuteSynthPresetDef[] = [
  // === PHYSICS ===
  {
    name: 'Bubble',
    category: 'Physics',
    emoji: '🫧',
    params: { frequency: 450, shape: 'sine', sweep: -0.6, filterFreq: 800, filterQ: 15, filterEnv: 600, decay: 0.15, modDepth: 0 },
    locks: ['shape', 'filterQ', 'sweep', 'modDepth'],
  },
  {
    name: 'Jump',
    category: 'Physics',
    emoji: '🦘',
    params: { frequency: 220, shape: 'square', sweep: 0.8, filterFreq: 1500, filterQ: 2, filterEnv: 500, decay: 0.3, modDepth: 0 },
    locks: ['shape', 'sweep'],
  },
  {
    name: 'Boing',
    category: 'Physics',
    emoji: '🌀',
    params: { frequency: 150, shape: 'sine', sweep: 0.0, filterFreq: 600, filterQ: 5, filterEnv: 0, decay: 0.6, modDepth: 200, modSpeed: 15 },
    locks: ['modSpeed', 'modDepth', 'decay'],
  },

  // === EMOTIONS ===
  {
    name: 'Happy ^_^',
    category: 'Emotions',
    emoji: '😊',
    params: { frequency: 880, shape: 'triangle', sweep: 0.1, filterFreq: 4000, filterQ: 1, filterEnv: 0, decay: 0.1, modDepth: 0 },
    locks: ['shape'],
  },
  {
    name: 'Sad T_T',
    category: 'Emotions',
    emoji: '😢',
    params: { frequency: 500, shape: 'triangle', sweep: -0.15, filterFreq: 800, filterQ: 1, filterEnv: -200, decay: 0.6, modDepth: 0, wobble: 0.15 },
    locks: ['shape', 'sweep', 'wobble', 'decay'],
  },
  {
    name: 'Anxiety >_<',
    category: 'Emotions',
    emoji: '😰',
    params: { frequency: 200, shape: 'sawtooth', sweep: 0, filterFreq: 3000, filterQ: 1, filterEnv: 0, decay: 0.1, modDepth: 500, modSpeed: 40 },
    locks: ['modSpeed', 'shape'],
  },
  {
    name: 'Angry è_é',
    category: 'Emotions',
    emoji: '😠',
    params: { frequency: 100, shape: 'sawtooth', sweep: -0.1, filterFreq: 500, filterQ: 10, filterEnv: 2000, decay: 0.2, modDepth: 800, modSpeed: 80 },
    locks: ['shape', 'filterEnv', 'modDepth'],
  },

  // === MAGIC ===
  {
    name: 'Sparkle',
    category: 'Magic',
    emoji: '✨',
    params: { frequency: 1200, shape: 'sine', sweep: 0, filterFreq: 5000, filterQ: 1, filterEnv: 0, decay: 0.5, modDepth: 1000, modSpeed: 80, delay: 0.3, wobble: 0.2 },
    locks: ['modSpeed'],
  },
  {
    name: 'Transform',
    category: 'Magic',
    emoji: '🌟',
    params: { frequency: 300, shape: 'sine', sweep: 1.0, filterFreq: 2000, filterQ: 8, filterEnv: 2000, decay: 1.5, modDepth: 200, modSpeed: 20, delay: 0.2 },
    locks: ['sweep', 'decay'],
  },

  // === INTERFACE ===
  {
    name: 'Click',
    category: 'Interface',
    emoji: '👆',
    params: { frequency: 1500, shape: 'sine', sweep: -0.9, filterFreq: 5000, filterQ: 1, filterEnv: 0, decay: 0.05, modDepth: 0 },
    locks: ['decay', 'sweep'],
  },
  {
    name: 'Question ?',
    category: 'Interface',
    emoji: '❓',
    params: { frequency: 400, shape: 'sine', sweep: 0.5, filterFreq: 2000, filterQ: 1, filterEnv: 0, decay: 0.25, modDepth: 0 },
    locks: ['sweep', 'shape'],
  },
  {
    name: 'Error',
    category: 'Interface',
    emoji: '❌',
    params: { frequency: 100, shape: 'sawtooth', sweep: 0, filterFreq: 500, filterQ: 1, filterEnv: 0, decay: 0.2, modDepth: 500, modSpeed: 30 },
    locks: ['shape', 'modSpeed'],
  },
];
