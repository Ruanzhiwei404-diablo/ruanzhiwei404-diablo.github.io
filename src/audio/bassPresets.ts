// Bass Presets — TITAN-inspired sound design presets
import type { BassPresetDef, EnvPoint } from './types';

const id = () => Math.random().toString(36).substr(2, 9);

const mkPts = (pts: [number, number][]): EnvPoint[] =>
  pts.map(([x, y]) => ({ x, y, tension: 0, id: id() }));

export const BASS_PRESETS: BassPresetDef[] = [
  // DROP
  {
    name: 'Titan Drop',
    category: 'DROP',
    mode: 'DROP',
    params: { dropWidth: 0, dropTone: 0, dropDuration: 2.0, reverbMix: 0 },
    pitchEnv: mkPts([[0, 0.8], [0.3, 0.2], [1, 0]]),
    ampEnv: mkPts([[0, 0], [0.1, 1], [0.8, 0.5], [1, 0]]),
  },
  {
    name: 'Deep Quake',
    category: 'DROP',
    mode: 'DROP',
    params: { dropWidth: 20, dropTone: 15, dropDuration: 3.5, reverbMix: 30, inflatorAmt: 40 },
    pitchEnv: mkPts([[0, 1], [0.15, 0.3], [0.6, 0.1], [1, 0]]),
    ampEnv: mkPts([[0, 0], [0.05, 0.9], [0.7, 0.6], [1, 0]]),
  },
  {
    name: 'Stereo Sweep',
    category: 'DROP',
    mode: 'DROP',
    params: { dropWidth: 35, dropTone: 50, dropDuration: 2.5, reverbMix: 15 },
    pitchEnv: mkPts([[0, 0.9], [0.2, 0.5], [0.5, 0.2], [1, 0]]),
    ampEnv: mkPts([[0, 0], [0.08, 1], [0.85, 0.4], [1, 0]]),
  },
  {
    name: 'Abyss',
    category: 'DROP',
    mode: 'DROP',
    params: { dropWidth: 0, dropTone: 0, dropDuration: 5.0, reverbMix: 60, inflatorAmt: 30, masterVol: 0.5 },
    pitchEnv: mkPts([[0, 0.6], [0.1, 0.15], [0.5, 0.05], [1, 0]]),
    ampEnv: mkPts([[0, 0], [0.15, 0.8], [0.9, 0.3], [1, 0]]),
  },

  // IMPACT
  {
    name: 'Cinema Hit',
    category: 'IMPACT',
    mode: 'IMPACT',
    params: { impactDrive: 30, impactWidth: 0, reverbMix: 20, inflatorAmt: 35 },
    pitchEnv: mkPts([[0, 1], [0.05, 0], [1, 0]]),
    ampEnv: mkPts([[0, 1], [0.8, 0]]),
  },
  {
    name: 'Steel Plate',
    category: 'IMPACT',
    mode: 'IMPACT',
    params: { impactDrive: 70, impactWidth: 40, reverbMix: 40, inflatorAmt: 50, inflatorClip: true },
    pitchEnv: mkPts([[0, 0.8], [0.03, 0.3], [0.2, 0.1], [1, 0]]),
    ampEnv: mkPts([[0, 1], [0.5, 0.3], [1, 0]]),
  },
  {
    name: 'Concrete',
    category: 'IMPACT',
    mode: 'IMPACT',
    params: { impactDrive: 50, impactWidth: 10, reverbMix: 5, inflatorAmt: 25 },
    pitchEnv: mkPts([[0, 1], [0.02, 0.2], [1, 0]]),
    ampEnv: mkPts([[0, 1], [0.3, 0.2], [1, 0]]),
  },
  {
    name: 'Wide Slap',
    category: 'IMPACT',
    mode: 'IMPACT',
    params: { impactDrive: 40, impactWidth: 45, reverbMix: 25, inflatorAmt: 35 },
    pitchEnv: mkPts([[0, 0.9], [0.04, 0.15], [1, 0]]),
    ampEnv: mkPts([[0, 1], [0.6, 0.15], [1, 0]]),
  },

  // RUMBLE
  {
    name: 'Dark Seismic',
    category: 'RUMBLE',
    mode: 'RUMBLE',
    params: { rumbleShake: 40, rumbleSpeed: 15, rumbleWeight: 50, rumbleWidth: 0, rumbleDuration: 4.0, reverbMix: 10 },
    pitchEnv: mkPts([[0, 0.2], [0.5, 0.3], [1, 0.1]]),
    ampEnv: mkPts([[0, 0], [0.2, 1], [0.8, 0.8], [1, 0]]),
  },
  {
    name: 'Tectonic',
    category: 'RUMBLE',
    mode: 'RUMBLE',
    params: { rumbleShake: 70, rumbleSpeed: 25, rumbleWeight: 80, rumbleWidth: 20, rumbleDuration: 6.0, reverbMix: 30, inflatorAmt: 45 },
    pitchEnv: mkPts([[0, 0.3], [0.3, 0.4], [0.7, 0.2], [1, 0.1]]),
    ampEnv: mkPts([[0, 0], [0.15, 0.9], [0.85, 0.7], [1, 0]]),
  },
  {
    name: 'Fault Line',
    category: 'RUMBLE',
    mode: 'RUMBLE',
    params: { rumbleShake: 55, rumbleSpeed: 8, rumbleWeight: 65, rumbleWidth: 0, rumbleDuration: 8.0, reverbMix: 20 },
    pitchEnv: mkPts([[0, 0.15], [0.4, 0.25], [1, 0.05]]),
    ampEnv: mkPts([[0, 0], [0.3, 0.8], [0.9, 0.5], [1, 0]]),
  },
  {
    name: 'Storm Front',
    category: 'RUMBLE',
    mode: 'RUMBLE',
    params: { rumbleShake: 85, rumbleSpeed: 40, rumbleWeight: 60, rumbleWidth: 30, rumbleDuration: 5.0, reverbMix: 45, inflatorAmt: 50 },
    pitchEnv: mkPts([[0, 0.4], [0.2, 0.5], [0.6, 0.3], [1, 0.15]]),
    ampEnv: mkPts([[0, 0], [0.1, 1], [0.7, 0.85], [1, 0]]),
  },
];
