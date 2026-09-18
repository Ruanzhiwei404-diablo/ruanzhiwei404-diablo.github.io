// Shared audio types for Synth Lab engines

// === CrystalPrism types ===

export type Scale =
  | 'chromatic' | 'major' | 'minor'
  | 'pentatonic_maj' | 'pentatonic_min'
  | 'dorian' | 'lydian';

export type ArpMode =
  | 'off' | 'up' | 'down' | 'up-down' | 'down-up'
  | 'converge' | 'diverge' | 'pinky' | 'random' | 'rain';

export type ArpRate = '1/1' | '1/2' | '1/4' | '1/8' | '1/16' | '1/32';

export interface EngineParams {
  mainVol: number;
  speed: number;
  scale: Scale;
  arpMode: ArpMode;
  rate: ArpRate;
  rootFreq: number;
  decay: number;
  arpGate: number;
  tone: number;
  impact: number;
  octave: number;
  drift: number;
  movement: number;
  stereo: number;
  shimmer: number;
  magic: number;
}

export interface PresetDef {
  name: string;
  category: string;
  params: Partial<EngineParams>;
  waveform: OscillatorType;
}

export const DEFAULT_PARAMS: EngineParams = {
  mainVol: 0.8,
  speed: 120,
  scale: 'major',
  arpMode: 'up',
  rate: '1/8',
  rootFreq: 600,
  decay: 0.5,
  arpGate: 0.8,
  tone: 0.8,
  impact: 0.2,
  octave: 1,
  drift: 0.0,
  movement: 0.8,
  stereo: 0.3,
  shimmer: 0.1,
  magic: 0.0,
};

// === SubBass types ===

export type SubBassPattern = 'DROP' | 'PULSE' | 'WOBBLE' | 'ROLL' | 'OFF';

export interface SubBassParams {
  volume: number;       // 0-1 master volume
  dropLevel: number;    // 0-1 sub oscillator level
  impactLevel: number;  // 0-1 transient/noise level
  rumbleLevel: number;  // 0-1 sub-harmonic level
  distortion: number;   // 0-1 wave shaper amount
  cutoff: number;       // 0-1 filter cutoff
  resonance: number;    // 0-1 filter Q
  lfoRate: number;      // 0-1 LFO speed
  lfoDepth: number;     // 0-1 LFO amount
  attack: number;       // 0-1 attack time
  decay: number;        // 0-1 decay time
  bpm: number;          // 60-200
  rootFreq: number;     // 30-150 Hz
  pattern: SubBassPattern;
}

export const DEFAULT_SUBBASS_PARAMS: SubBassParams = {
  volume: 0.7,
  dropLevel: 0.8,
  impactLevel: 0.3,
  rumbleLevel: 0.5,
  distortion: 0.2,
  cutoff: 0.5,
  resonance: 0.3,
  lfoRate: 0.3,
  lfoDepth: 0.4,
  attack: 0.1,
  decay: 0.5,
  bpm: 120,
  rootFreq: 55,
  pattern: 'DROP',
};

export interface SubBassPresetDef {
  name: string;
  category: string;
  params: Partial<SubBassParams>;
}

// === CuteSynth types ===

export type CuteShape = 'sine' | 'triangle' | 'square' | 'sawtooth';

export interface CuteSynthParams {
  frequency: number;    // 50-2000 Hz
  shape: CuteShape;
  sweep: number;        // -1 to 1 (pitch sweep)
  filterFreq: number;   // 100-5000 Hz
  filterQ: number;      // 0-20
  filterEnv: number;    // -2000 to 2000 Hz
  attack: number;       // 0.005-0.5 s
  decay: number;        // 0.05-2.0 s
  modDepth: number;     // 0-2000
  modSpeed: number;     // 0-200 Hz
  delay: number;        // 0-1
  wobble: number;       // 0-0.5
  volume: number;       // 0-1 master volume
}

export const DEFAULT_CUTE_PARAMS: CuteSynthParams = {
  frequency: 600,
  shape: 'sine',
  sweep: -0.5,
  filterFreq: 2000,
  filterQ: 5,
  filterEnv: 0,
  attack: 0.01,
  decay: 0.2,
  modDepth: 0,
  modSpeed: 0,
  delay: 0.0,
  wobble: 0.0,
  volume: 0.6,
};

export type CuteCategory = 'Physics' | 'Emotions' | 'Magic' | 'Interface';

export interface CuteSynthPresetDef {
  name: string;
  category: CuteCategory;
  emoji: string;
  params: Partial<CuteSynthParams>;
  locks: (keyof CuteSynthParams)[];
}

// === PRISM Plus types ===

export type PrismPlusEngineName =
  | 'PRISM' | 'CHIME' | 'HALO' | 'GLINT' | 'LUMEN' | 'SHARD' | 'AURA'
  | 'WHOOSH' | 'STELLA' | 'IMPACT' | 'CHARGE' | 'RUBBER' | 'FLUX'
  | 'JELLY' | 'MERCURY' | 'POP' | 'KIRA';

export interface PrismPlusParams {
  engine: PrismPlusEngineName;
  pitch: number;       // 50-2000 Hz root frequency
  duration: number;    // 0.2-5.0 s decay time
  timbre: number;      // 0-1 tone character
  impact: number;      // 0-1 attack strength
  width: number;       // 0-1 stereo width
  space: number;       // 0-1 reverb size
  magic: number;       // 0-1 delay amount
  drift: number;       // 0-1 instability
  movement: number;    // 0-1 LFO speed
  scale: Scale;
  arp: ArpMode;
  arpRate: number;     // beat multiplier (4.0, 2.0, 1.0, 0.5, 0.25, 0.125)
  arpOctave: number;   // 1-4 octave range
  arpGate: number;     // 0.1-1.0 note gate
  bpm: number;         // 60-400 tempo
  mainVol: number;     // 0-1 master volume
}

export const DEFAULT_PRISM_PLUS_PARAMS: PrismPlusParams = {
  engine: 'PRISM',
  pitch: 1200,
  duration: 3.0,
  timbre: 0.2,
  impact: 0.8,
  width: 0.4,
  space: 0.5,
  magic: 0.5,
  drift: 0.2,
  movement: 0.3,
  scale: 'major',
  arp: 'rain',
  arpRate: 0.25,
  arpOctave: 3,
  arpGate: 0.4,
  bpm: 120,
  mainVol: 0.8,
};

export interface PrismPlusPresetDef {
  name: PrismPlusEngineName;
  category: string;
  desc: string;
  icon: string;
  params: Partial<PrismPlusParams>;
}

export const PRISM_PLUS_RATES = [
  { label: '1/1', value: 4.0 },
  { label: '1/2', value: 2.0 },
  { label: '1/4', value: 1.0 },
  { label: '1/8', value: 0.5 },
  { label: '1/16', value: 0.25 },
  { label: '1/32', value: 0.125 },
] as const;

// === Bass (TITAN-inspired) types ===

export type BassMode = 'DROP' | 'IMPACT' | 'RUMBLE';

export interface EnvPoint {
  x: number;      // 0-1 normalized time
  y: number;      // 0-1 normalized value
  tension: number; // -1.5 to 1.5 curve tension
  id?: string;     // unique id for React keys
}

export interface BassParams {
  mode: BassMode;

  // DROP params
  dropWidth: number;     // 0-100 stereo width (quadrature)
  dropTone: number;      // 0-100 inflator tone
  dropDuration: number;  // 0.5-5.0 seconds

  // IMPACT params
  impactDrive: number;   // 0-100
  impactWidth: number;   // 0-100

  // RUMBLE params
  rumbleShake: number;   // 0-100 FM/AM amount
  rumbleSpeed: number;   // 0-100 LFO speed
  rumbleWeight: number;  // 0-100 distortion
  rumbleWidth: number;   // 0-100
  rumbleDuration: number; // 1-8 seconds

  // Master chain
  masterVol: number;     // 0-1
  inflatorCurve: number; // -50 to 50
  inflatorAmt: number;   // 0-100
  inflatorClip: boolean;
  reverbMix: number;     // 0-100 dark space
  isMono: boolean;

  // Root frequency
  rootFreq: number;      // 20-200 Hz
}

export const DEFAULT_BASS_PARAMS: BassParams = {
  mode: 'DROP',
  dropWidth: 0,
  dropTone: 0,
  dropDuration: 2.0,
  impactDrive: 30,
  impactWidth: 0,
  rumbleShake: 40,
  rumbleSpeed: 15,
  rumbleWeight: 50,
  rumbleWidth: 0,
  rumbleDuration: 4.0,
  masterVol: 0.4,
  inflatorCurve: 0,
  inflatorAmt: 20,
  inflatorClip: true,
  reverbMix: 0,
  isMono: false,
  rootFreq: 55,
};

export interface BassPresetDef {
  name: string;
  category: string;
  mode: BassMode;
  params: Partial<BassParams>;
  pitchEnv: EnvPoint[];
  ampEnv: EnvPoint[];
}

// === MIDI note utilities ===

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

export const KEYBOARD_MAP: Record<string, number> = {
  'a': 0, 'w': 1, 's': 2, 'e': 3, 'd': 4, 'f': 5,
  't': 6, 'g': 7, 'y': 8, 'h': 9, 'u': 10, 'j': 11,
  'k': 12, 'o': 13, 'l': 14, 'p': 15, ';': 16,
};

// === Voice Lab types (instrument language / ET alien) ===

export type VoiceConsonant = 'none' | 't' | 'k' | 's' | 'sh' | 'plosive';

export interface VoiceSyllable {
  consonant: VoiceConsonant; // articulation placed before the vowel
  vowel: string;             // key into VOWELS
  pitchOffset: number;       // semitone offset for this syllable
}

export interface VoiceWord {
  name: string;        // alien spelling
  gloss: string;       // human meaning
  category: string;
  syllables: VoiceSyllable[];
}

export interface VoiceLabParams {
  volume: number;        // 0-1 master volume
  source: OscillatorType;// glottal waveform
  pitch: number;         // 70-400 Hz base speaking pitch
  contour: number;       // -1..1 pitch glide across the syllable
  vowel: string;         // active vowel key (quick picker)
  formant1: number;      // 250-1000 Hz F1
  formant2: number;      // 700-2800 Hz F2
  formantQ: number;      // 3-20 formant resonance
  alienize: number;      // 0-1 ring-modulation (ET) depth
  carrierFreq: number;   // 50-2000 Hz ring-mod carrier
  consonant: VoiceConsonant; // default articulation
  consAmt: number;       // 0-1 consonant amount
  breath: number;        // 0-1 breath noise
  space: number;         // 0-1 space delay amount
  decay: number;         // 0.1-1.5 s syllable length
}

export const DEFAULT_VOICE_LAB_PARAMS: VoiceLabParams = {
  volume: 0.6,
  source: 'sawtooth',
  pitch: 140,
  contour: 0.1,
  vowel: 'a',
  formant1: 800,
  formant2: 1200,
  formantQ: 8,
  alienize: 0.35,
  carrierFreq: 320,
  consonant: 'none',
  consAmt: 0.6,
  breath: 0.1,
  space: 0.3,
  decay: 0.35,
};

// Vowel formant table (approximate) — human vowels + alien vowels
export const VOWELS: Record<string, { f1: number; f2: number; label: string }> = {
  a:  { f1: 800,  f2: 1200, label: 'A' },
  e:  { f1: 400,  f2: 2300, label: 'E' },
  i:  { f1: 300,  f2: 2700, label: 'I' },
  o:  { f1: 450,  f2: 800,  label: 'O' },
  u:  { f1: 320,  f2: 800,  label: 'U' },
  ae: { f1: 600,  f2: 1600, label: 'Æ' },
  eu: { f1: 500,  f2: 1000, label: 'EU' },
  ix: { f1: 350,  f2: 2100, label: 'Ï' },
};

export const CONSONANTS: { id: VoiceConsonant; label: string }[] = [
  { id: 'none', label: '∅' },
  { id: 't', label: 'T' },
  { id: 'k', label: 'K' },
  { id: 's', label: 'S' },
  { id: 'sh', label: 'SH' },
  { id: 'plosive', label: 'P' },
];
