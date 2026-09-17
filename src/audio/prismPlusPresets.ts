// PRISM Plus Presets — 17 presets ported from CrystalPrism.html
import type { PrismPlusPresetDef } from './types';

export const PRISM_PLUS_PRESETS: PrismPlusPresetDef[] = [
  // --- CLASSIC CRYSTAL ---
  {
    name: 'PRISM',
    category: 'CLASSIC CRYSTAL',
    desc: 'Drifting Crystal',
    icon: 'sun',
    params: { engine: 'PRISM', pitch: 1200, duration: 3.0, timbre: 0.2, impact: 0.8, width: 0.4, space: 0.5, magic: 0.5, drift: 0.2, movement: 0.3, scale: 'major', arp: 'rain', arpRate: 0.25, arpOctave: 3, arpGate: 0.4 },
  },
  {
    name: 'CHIME',
    category: 'CLASSIC CRYSTAL',
    desc: 'Wind Rods',
    icon: 'stars',
    params: { engine: 'CHIME', pitch: 1500, duration: 2.5, timbre: 0.6, impact: 0.5, width: 0.9, space: 0.4, magic: 0.7, drift: 0.4, movement: 0.5, scale: 'pentatonic_maj', arp: 'up', arpRate: 0.5, arpOctave: 2, arpGate: 0.5 },
  },
  {
    name: 'HALO',
    category: 'CLASSIC CRYSTAL',
    desc: 'Breathing Glass',
    icon: 'moon',
    params: { engine: 'HALO', pitch: 880, duration: 5.0, timbre: 0.3, impact: 0.1, width: 0.6, space: 0.8, magic: 0.8, drift: 0.6, movement: 0.2, scale: 'minor', arp: 'off', arpRate: 0.5, arpOctave: 1, arpGate: 0.8 },
  },
  {
    name: 'GLINT',
    category: 'CLASSIC CRYSTAL',
    desc: 'Scattered Light',
    icon: 'sparkles',
    params: { engine: 'GLINT', pitch: 2000, duration: 1.5, timbre: 0.8, impact: 1.0, width: 1.0, space: 0.3, magic: 0.3, drift: 0.3, movement: 0.8, scale: 'major', arp: 'random', arpRate: 0.125, arpOctave: 2, arpGate: 0.2 },
  },
  {
    name: 'STELLA',
    category: 'CLASSIC CRYSTAL',
    desc: 'Kind Stars',
    icon: 'bell',
    params: { engine: 'STELLA', pitch: 1000, duration: 3.5, timbre: 0.5, impact: 0.6, width: 0.8, space: 0.6, magic: 0.7, drift: 0.2, movement: 0.5, scale: 'pentatonic_maj', arp: 'rain', arpRate: 0.25, arpOctave: 2, arpGate: 0.6 },
  },

  // --- CLASSIC ETHEREAL ---
  {
    name: 'LUMEN',
    category: 'CLASSIC ETHEREAL',
    desc: 'Liquid Light',
    icon: 'waves',
    params: { engine: 'LUMEN', pitch: 440, duration: 4.0, timbre: 0.5, impact: 0.2, width: 0.7, space: 0.9, magic: 0.5, drift: 0.5, movement: 0.7, scale: 'major', arp: 'off', arpRate: 0.5, arpOctave: 1, arpGate: 0.8 },
  },
  {
    name: 'SHARD',
    category: 'CLASSIC ETHEREAL',
    desc: 'Broken Ice',
    icon: 'snowflake',
    params: { engine: 'SHARD', pitch: 1800, duration: 1.2, timbre: 0.9, impact: 0.9, width: 0.8, space: 0.4, magic: 0.2, drift: 0.7, movement: 0.9, scale: 'chromatic', arp: 'down', arpRate: 0.25, arpOctave: 2, arpGate: 0.3 },
  },
  {
    name: 'AURA',
    category: 'CLASSIC ETHEREAL',
    desc: 'Resonant Drone',
    icon: 'radio',
    params: { engine: 'AURA', pitch: 220, duration: 6.0, timbre: 0.4, impact: 0.1, width: 0.5, space: 1.0, magic: 0.5, drift: 0.3, movement: 0.1, scale: 'minor', arp: 'off', arpRate: 1.0, arpOctave: 1, arpGate: 1.0 },
  },

  // --- NEW LIQUID ---
  {
    name: 'JELLY',
    category: 'NEW LIQUID',
    desc: 'Wobbly LPG',
    icon: 'beaker',
    params: { engine: 'JELLY', pitch: 150, duration: 1.5, timbre: 0.8, impact: 0.9, width: 0.4, space: 0.3, magic: 0.2, drift: 0.8, movement: 0.7, scale: 'pentatonic_min', arp: 'off', arpRate: 0.5, arpOctave: 1, arpGate: 0.8 },
  },
  {
    name: 'MERCURY',
    category: 'NEW LIQUID',
    desc: 'Metallic FM',
    icon: 'layers',
    params: { engine: 'MERCURY', pitch: 400, duration: 3.0, timbre: 0.6, impact: 0.5, width: 0.8, space: 0.7, magic: 0.4, drift: 0.2, movement: 0.3, scale: 'dorian', arp: 'off', arpRate: 0.5, arpOctave: 1, arpGate: 0.8 },
  },
  {
    name: 'RUBBER',
    category: 'NEW LIQUID',
    desc: 'Elastic Sub',
    icon: 'circle',
    params: { engine: 'RUBBER', pitch: 100, duration: 2.0, timbre: 0.8, impact: 0.8, width: 0.3, space: 0.2, magic: 0.1, drift: 0.1, movement: 0.6, scale: 'minor', arp: 'up', arpRate: 0.5, arpOctave: 1, arpGate: 0.5 },
  },
  {
    name: 'FLUX',
    category: 'NEW LIQUID',
    desc: 'Water Flow',
    icon: 'droplets',
    params: { engine: 'FLUX', pitch: 800, duration: 4.0, timbre: 0.7, impact: 0.6, width: 0.8, space: 0.7, magic: 0.5, drift: 0.5, movement: 0.8, scale: 'lydian', arp: 'off', arpRate: 0.5, arpOctave: 1, arpGate: 0.8 },
  },

  // --- KAWAII / UI ---
  {
    name: 'POP',
    category: 'KAWAII / UI',
    desc: 'Cute Bubbles',
    icon: 'smile',
    params: { engine: 'POP', pitch: 600, duration: 0.5, timbre: 0.8, impact: 0.2, width: 0.3, space: 0.1, magic: 0.0, drift: 0.0, movement: 0.8, scale: 'major', arp: 'off', arpRate: 0.5, arpOctave: 1, arpGate: 0.8 },
  },
  {
    name: 'KIRA',
    category: 'KAWAII / UI',
    desc: 'Magic Sparkle',
    icon: 'star',
    params: { engine: 'KIRA', pitch: 1200, duration: 1.5, timbre: 0.7, impact: 0.8, width: 0.9, space: 0.5, magic: 0.6, drift: 0.3, movement: 0.6, scale: 'lydian', arp: 'random', arpRate: 0.25, arpOctave: 2, arpGate: 0.5 },
  },

  // --- CLASSIC FX ---
  {
    name: 'WHOOSH',
    category: 'CLASSIC FX',
    desc: 'Air Transition',
    icon: 'wind',
    params: { engine: 'WHOOSH', pitch: 800, duration: 1.5, timbre: 0.5, impact: 0.8, width: 0.5, space: 0.3, magic: 0.0, drift: 0.0, movement: 0.9, scale: 'chromatic', arp: 'off', arpRate: 0.5, arpOctave: 1, arpGate: 0.8 },
  },
  {
    name: 'IMPACT',
    category: 'CLASSIC FX',
    desc: 'Combat Hit',
    icon: 'activity',
    params: { engine: 'IMPACT', pitch: 150, duration: 1.0, timbre: 0.8, impact: 1.0, width: 0.5, space: 0.4, magic: 0.0, drift: 0.0, movement: 0.5, scale: 'chromatic', arp: 'off', arpRate: 0.5, arpOctave: 1, arpGate: 0.8 },
  },
  {
    name: 'CHARGE',
    category: 'CLASSIC FX',
    desc: 'Power Up',
    icon: 'zap',
    params: { engine: 'CHARGE', pitch: 200, duration: 2.5, timbre: 0.7, impact: 0.5, width: 0.5, space: 0.6, magic: 0.1, drift: 0.0, movement: 0.8, scale: 'chromatic', arp: 'off', arpRate: 0.5, arpOctave: 1, arpGate: 0.8 },
  },
];
