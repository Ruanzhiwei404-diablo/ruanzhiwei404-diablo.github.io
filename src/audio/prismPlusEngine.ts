// PRISM Plus Web Audio Engine
// 18 sound engines + Global FX Bus (Reverb + Delay + Compressor + Limiter)
// Ported from CrystalPrism.html (96kHz Studio Architecture)

import type { Scale, ArpMode, PrismPlusEngineName, PrismPlusParams } from './types';
import { DEFAULT_PRISM_PLUS_PARAMS, midiToFreq } from './types';

const SCALES_MAP: Record<Scale, number[]> = {
  chromatic:      [0,1,2,3,4,5,6,7,8,9,10,11],
  major:          [0,2,4,5,7,9,11],
  minor:          [0,2,3,5,7,8,10],
  pentatonic_maj: [0,2,4,7,9],
  pentatonic_min: [0,3,5,7,10],
  dorian:         [0,2,3,5,7,9,10],
  lydian:         [0,2,4,6,7,9,11],
};

// --- Audio helpers ---

function createShimmerBuffer(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
  if (isNaN(duration) || duration <= 0) duration = 4.0;
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * duration);
  const impulse = ctx.createBuffer(2, len, sr);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      const n = i / len;
      const env = Math.pow(1 - n, decay);
      data[i] = (Math.random() * 2 - 1) * env;
    }
  }
  return impulse;
}

function createPanner(ctx: AudioContext, panValue: number): StereoPannerNode {
  const safePan = isNaN(panValue) ? 0 : Math.max(-1, Math.min(1, panValue));
  const panner = ctx.createStereoPanner();
  panner.pan.value = safePan;
  return panner;
}

function createOrganicLFO(
  ctx: AudioContext,
  targetParam: AudioParam,
  startTime: number,
  duration: number,
  depth: number,
  speed = 1,
): void {
  if (depth === 0 || isNaN(depth)) return;
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain = ctx.createGain();
  osc1.frequency.value = 0.1 * (speed || 1);
  osc2.frequency.value = 0.17 * (speed || 1);
  osc1.type = 'sine';
  osc2.type = 'triangle';
  gain.gain.value = depth;
  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(targetParam);
  osc1.start(startTime);
  osc2.start(startTime);
  osc1.stop(startTime + duration);
  osc2.stop(startTime + duration);
}

function getDegreeFreq(rootFreq: number, scaleName: Scale, degreeIndex: number): number {
  const scale = SCALES_MAP[scaleName] || SCALES_MAP.chromatic;
  const scaleLen = scale.length;
  const octave = Math.floor(degreeIndex / scaleLen);
  const indexInScale = Math.abs(degreeIndex % scaleLen);
  const interval = scale[indexInScale];
  const totalSemitones = (octave * 12) + interval;
  const rootLog = Math.log2(rootFreq / 440);
  const rootMidi = 69 + 12 * rootLog;
  const targetMidi = rootMidi + totalSemitones;
  return 440 * Math.pow(2, (targetMidi - 69) / 12);
}

function getScaleFreq(rootFreq: number, scaleName: Scale, stepsFromRoot = 0): number {
  if (scaleName === 'chromatic') {
    const rootLog = Math.log2(rootFreq / 440);
    const rootMidi = 69 + 12 * rootLog;
    return 440 * Math.pow(2, (rootMidi + stepsFromRoot - 69) / 12);
  }
  return getDegreeFreq(rootFreq, scaleName, Math.floor(stepsFromRoot));
}

// --- 18 Sound Engine Functions ---

type EngineFn = (c: AudioContext, d: GainNode, t: number, p: PrismPlusParams) => void;

const enginePrism: EngineFn = (c, d, t, p) => {
  const rs = [1, 1.5, 2, 2.5, 3, 4];
  rs.forEach((r, i) => {
    if (Math.random() > 0.7 && i > 0) return;
    const o = c.createOscillator(), e = c.createGain();
    const pn = createPanner(c, (Math.random() * 2 - 1) * p.width * 0.5);
    const f = getScaleFreq(p.pitch, p.scale, Math.floor(Math.log2(r) * 12));
    o.frequency.setValueAtTime(f, t);
    o.type = 'sine';
    createOrganicLFO(c, o.detune, t, p.duration, p.drift * 50, p.movement);
    e.gain.setValueAtTime(0, t);
    e.gain.linearRampToValueAtTime(0.4 / (i + 1), t + 0.01);
    e.gain.exponentialRampToValueAtTime(0.001, t + p.duration / (i + 1));
    o.connect(e); e.connect(pn); pn.connect(d);
    o.start(t); o.stop(t + p.duration + 1);
  });
};

const engineChime: EngineFn = (c, d, t, p) => {
  const rc = 5 + Math.floor(p.timbre * 5);
  for (let i = 0; i < rc; i++) {
    const dl = Math.random() * p.duration * 0.5 * (1 - p.impact);
    const f = getScaleFreq(p.pitch, p.scale, Math.floor(Math.random() * 12));
    [1, 2.7, 5.2].forEach((r, k) => {
      const o = c.createOscillator(), e = c.createGain();
      const pn = createPanner(c, (Math.random() * 2 - 1) * p.width);
      o.frequency.value = f * r;
      o.type = 'sine';
      const tr = c.createGain();
      tr.gain.value = 1;
      createOrganicLFO(c, tr.gain, t, p.duration, p.drift * 0.4, p.movement * 3);
      const st = t + dl, dur = (p.duration * 0.5) / r;
      e.gain.setValueAtTime(0, st);
      e.gain.linearRampToValueAtTime(0.15 / (k + 1), st + 0.01);
      e.gain.exponentialRampToValueAtTime(0.001, st + dur);
      o.connect(tr); tr.connect(e); e.connect(pn); pn.connect(d);
      o.start(st); o.stop(st + dur + 1);
    });
  }
};

const engineHalo: EngineFn = (c, d, t, p) => {
  for (let i = 0; i < 4; i++) {
    const o = c.createOscillator(), e = c.createGain();
    const pn = createPanner(c, (Math.random() * 2 - 1) * p.width);
    const f = getScaleFreq(p.pitch, p.scale, i * 5);
    o.frequency.value = f;
    o.type = 'sine';
    createOrganicLFO(c, o.frequency, t, p.duration + 3, f * p.drift * 0.03, p.movement * 1.5);
    e.gain.setValueAtTime(0, t);
    e.gain.exponentialRampToValueAtTime(0.2 / 4, t + 0.5 + (1 - p.impact));
    e.gain.exponentialRampToValueAtTime(0.001, t + p.duration + 1);
    o.connect(e); e.connect(pn); pn.connect(d);
    o.start(t); o.stop(t + p.duration + 2);
  }
};

const engineGlint: EngineFn = (c, d, t, p) => {
  const pt = 20 + Math.floor(p.timbre * 60);
  for (let i = 0; i < pt; i++) {
    const o = c.createOscillator(), e = c.createGain();
    const pn = createPanner(c, (Math.random() * 2 - 1) * p.width);
    const f = getScaleFreq(p.pitch, p.scale, 12 + (Math.random() - 0.5) * p.drift * 12 + Math.random() * 24);
    o.frequency.value = f;
    o.type = 'sine';
    const st = t + Math.random() * p.duration * 0.8, dur = 0.05 + Math.random() * 0.1;
    e.gain.setValueAtTime(0, st);
    e.gain.linearRampToValueAtTime(0.05 * p.impact, st + 0.005);
    e.gain.exponentialRampToValueAtTime(0.0001, st + dur);
    o.connect(e); e.connect(pn); pn.connect(d);
    o.start(st); o.stop(st + dur + 0.1);
  }
};

const engineLumen: EngineFn = (c, d, t, p) => {
  const o1 = c.createOscillator(), o2 = c.createOscillator(), e = c.createGain();
  const pn = createPanner(c, 0);
  const f = getScaleFreq(p.pitch, p.scale, 0);
  o1.frequency.value = f; o2.frequency.value = f * 1.002;
  o1.type = 'sine'; o2.type = 'triangle';
  createOrganicLFO(c, o1.frequency, t, p.duration + 2, p.drift * 20, p.movement);
  const fl = c.createBiquadFilter();
  fl.type = 'lowpass';
  fl.Q.value = 2 + p.timbre * 5;
  fl.frequency.setValueAtTime(500, t);
  createOrganicLFO(c, fl.frequency, t, p.duration, 1000 * p.impact, p.movement * 2);
  e.gain.setValueAtTime(0, t);
  e.gain.linearRampToValueAtTime(0.3, t + p.duration * 0.4);
  e.gain.exponentialRampToValueAtTime(0.001, t + p.duration);
  o1.connect(fl); o2.connect(fl); fl.connect(e); e.connect(pn); pn.connect(d);
  o1.start(t); o2.start(t);
  o1.stop(t + p.duration + 0.5); o2.stop(t + p.duration + 0.5);
};

const engineShard: EngineFn = (c, d, t, p) => {
  const sh = 8 + Math.floor(p.timbre * 12);
  for (let i = 0; i < sh; i++) {
    const o = c.createOscillator(), e = c.createGain();
    const pn = createPanner(c, (Math.random() * 2 - 1) * p.width);
    const f = getScaleFreq(p.pitch, p.scale, Math.floor(Math.random() * 24));
    const m = c.createOscillator(), mg = c.createGain();
    m.frequency.value = f * 2.5; mg.gain.value = f * p.impact;
    m.connect(mg); mg.connect(o.frequency);
    m.start(t); m.stop(t + p.duration);
    o.frequency.value = f; o.type = 'sine';
    const st = t + Math.random() * p.drift * 0.5, dur = 0.05 + Math.random() * 0.2;
    e.gain.setValueAtTime(0, st);
    e.gain.linearRampToValueAtTime(0.2 / sh, st + 0.005);
    e.gain.exponentialRampToValueAtTime(0.001, st + dur);
    o.connect(e); e.connect(pn); pn.connect(d);
    o.start(st); o.stop(st + dur + 0.1);
  }
};

const engineAura: EngineFn = (c, d, t, p) => {
  const hm = [0, 7, 12, 19];
  const dl = c.createDelay();
  const f = getScaleFreq(p.pitch, p.scale, 0);
  dl.delayTime.value = 1 / f;
  const fb = c.createGain();
  fb.gain.value = 0.7 + p.timbre * 0.2;
  createOrganicLFO(c, dl.delayTime, t, p.duration, 0.001 * p.drift, p.movement);
  const me = c.createGain();
  me.gain.setValueAtTime(0, t);
  me.gain.linearRampToValueAtTime(0.4, t + 1);
  me.gain.exponentialRampToValueAtTime(0.001, t + p.duration);
  hm.forEach(h => {
    const o = c.createOscillator(), e = c.createGain();
    o.frequency.value = getScaleFreq(p.pitch, p.scale, h);
    o.type = 'sine';
    e.gain.value = 0.2 / hm.length;
    o.connect(e); e.connect(dl);
    o.start(t); o.stop(t + p.duration);
  });
  dl.connect(fb); fb.connect(dl); dl.connect(me); me.connect(d);
};

const engineWhoosh: EngineFn = (c, d, t, p) => {
  const bs = Math.floor(c.sampleRate * p.duration);
  const bf = c.createBuffer(2, bs, c.sampleRate);
  for (let k = 0; k < 2; k++) {
    const dt = bf.getChannelData(k);
    for (let i = 0; i < bs; i++) dt[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const n = c.createBufferSource();
  n.buffer = bf;
  const fl = c.createBiquadFilter();
  fl.type = 'lowpass';
  fl.Q.value = 0.5 + p.timbre * 10;
  fl.frequency.setValueAtTime(50, t);
  fl.frequency.exponentialRampToValueAtTime(p.pitch * 3 + 200, t + p.duration * 0.5);
  fl.frequency.exponentialRampToValueAtTime(50, t + p.duration);
  const e = c.createGain();
  e.gain.setValueAtTime(0, t);
  e.gain.linearRampToValueAtTime(1 * p.impact, t + p.duration * 0.5);
  e.gain.linearRampToValueAtTime(0.001, t + p.duration);
  const pn = c.createStereoPanner();
  if (p.movement > 0.1) {
    pn.pan.setValueAtTime(-p.movement, t);
    pn.pan.linearRampToValueAtTime(p.movement, t + p.duration);
  } else {
    pn.pan.setValueAtTime(0, t);
  }
  n.connect(fl); fl.connect(e); e.connect(pn); pn.connect(d);
  n.start(t); n.stop(t + p.duration + 0.2);
};

const engineStella: EngineFn = (c, d, t, p) => {
  const ly = 3 + Math.floor(p.timbre * 4);
  for (let i = 0; i < ly; i++) {
    const o = c.createOscillator(), e = c.createGain();
    const pn = createPanner(c, (Math.random() * 2 - 1) * p.width);
    const ints = [0, 2, 4, 7, 9, 12];
    const int = ints[i % ints.length] + Math.floor(i / ints.length) * 12;
    const f = getScaleFreq(p.pitch, p.scale, int);
    o.frequency.setValueAtTime(f + (Math.random() - 0.5) * p.drift * 20, t);
    o.type = 'sine';
    const fm = c.createOscillator(), fmg = c.createGain();
    fm.frequency.value = f * 2;
    fmg.gain.setValueAtTime(p.impact * 1000, t);
    fmg.gain.exponentialRampToValueAtTime(0.01, t + 0.02);
    fm.connect(fmg); fmg.connect(o.frequency);
    fm.start(t); fm.stop(t + p.duration);
    const dl = i * 0.06 * p.movement;
    const dc = p.duration / (1 + i * 0.2);
    e.gain.setValueAtTime(0, t + dl);
    e.gain.linearRampToValueAtTime(0.3 / ly, t + dl + 0.01);
    e.gain.exponentialRampToValueAtTime(0.001, t + dl + dc);
    o.connect(e); e.connect(pn); pn.connect(d);
    o.start(t + dl); o.stop(t + dl + dc + 0.1);
  }
};

const engineImpact: EngineFn = (c, d, t, p) => {
  const s = c.createOscillator(), se = c.createGain();
  const ds = 0.1 + (1 - p.impact) * 0.4;
  s.frequency.setValueAtTime(p.pitch, t);
  s.frequency.exponentialRampToValueAtTime(20, t + ds);
  s.type = 'sine';
  se.gain.setValueAtTime(1, t);
  se.gain.exponentialRampToValueAtTime(0.001, t + ds + 0.2);
  const b = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
  const dt = b.getChannelData(0);
  for (let i = 0; i < b.length; i++) dt[i] = Math.random() * 2 - 1;
  const n = c.createBufferSource();
  n.buffer = b;
  const nf = c.createBiquadFilter();
  nf.type = 'lowpass';
  nf.frequency.setValueAtTime(500 + p.timbre * 8000, t);
  nf.frequency.exponentialRampToValueAtTime(100, t + 0.2);
  const ne = c.createGain();
  ne.gain.setValueAtTime(p.impact, t);
  ne.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
  const sh = c.createWaveShaper();
  const cv = new Float32Array(44100);
  const k = 100 * p.timbre;
  for (let i = 0; i < 44100; i++) {
    const x = (i * 2) / 44100 - 1;
    cv[i] = (3 + k) * x * 20 * (Math.PI / 180) / (Math.PI + k * Math.abs(x));
  }
  sh.curve = cv;
  const mix = c.createGain(), pn = c.createStereoPanner();
  pn.pan.value = (Math.random() * 2 - 1) * p.movement * 0.5;
  s.connect(se); se.connect(mix);
  n.connect(nf); nf.connect(ne); ne.connect(sh); sh.connect(mix);
  mix.connect(pn); pn.connect(d);
  s.start(t); s.stop(t + 1);
  n.start(t); n.stop(t + 1);
};

const engineCharge: EngineFn = (c, d, t, p) => {
  const o = c.createOscillator(), e = c.createGain();
  const pn = createPanner(c, 0);
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(p.pitch, t);
  o.frequency.exponentialRampToValueAtTime(p.pitch * 4, t + p.duration);
  const fl = c.createBiquadFilter();
  fl.type = 'lowpass';
  fl.Q.value = 5 + p.timbre * 15;
  const l = c.createOscillator(), lg = c.createGain();
  l.frequency.setValueAtTime(2 + p.movement * 5, t);
  l.frequency.exponentialRampToValueAtTime(20 + p.movement * 50, t + p.duration);
  lg.gain.value = 500 + p.impact * 2000;
  fl.frequency.setValueAtTime(200, t);
  fl.frequency.exponentialRampToValueAtTime(5000, t + p.duration);
  l.connect(lg); lg.connect(fl.frequency);
  e.gain.setValueAtTime(0, t);
  e.gain.linearRampToValueAtTime(0.5, t + p.duration);
  e.gain.linearRampToValueAtTime(0, t + p.duration + 0.1);
  o.connect(fl); fl.connect(e); e.connect(pn); pn.connect(d);
  o.start(t); o.stop(t + p.duration + 0.2);
  l.start(t); l.stop(t + p.duration + 0.2);
};

const engineRubber: EngineFn = (c, d, t, p) => {
  const o = c.createOscillator(), e = c.createGain();
  const pn = createPanner(c, 0);
  const tf = getScaleFreq(p.pitch, p.scale, -12);
  o.type = 'sine';
  o.frequency.setValueAtTime(tf, t);
  const ss = 15 + p.movement * 30;
  const dr = 5 + (1 - p.drift) * 10;
  const bd = tf * (0.2 + p.impact * 0.5);
  const st = 40;
  for (let i = 0; i < st; i++) {
    const tm = t + (i / st) * p.duration;
    const pr = (i / st) * p.duration;
    const off = Math.cos(pr * ss) * Math.exp(-pr * dr) * bd;
    o.frequency.linearRampToValueAtTime(tf + off, tm);
  }
  const fl = c.createBiquadFilter();
  fl.type = 'lowpass';
  fl.Q.value = 5 + p.timbre * 10;
  fl.frequency.setValueAtTime(tf * 2, t);
  createOrganicLFO(c, fl.frequency, t, p.duration, 200 * p.impact, p.movement * 2);
  e.gain.setValueAtTime(0, t);
  e.gain.linearRampToValueAtTime(1, t + 0.05);
  e.gain.exponentialRampToValueAtTime(0.001, t + p.duration);
  o.connect(fl); fl.connect(e); e.connect(pn); pn.connect(d);
  o.start(t); o.stop(t + p.duration + 0.2);
};

const engineFlux: EngineFn = (c, d, t, p) => {
  const pn = createPanner(c, (Math.random() * 2 - 1) * p.width);
  const mg = c.createGain();
  const dn = 5 + Math.floor(p.impact * 20);
  for (let i = 0; i < dn; i++) {
    const o = c.createOscillator(), g = c.createGain();
    const to = Math.random() * p.duration * 0.8;
    const dp = getScaleFreq(p.pitch, p.scale, 12 + Math.floor(Math.random() * 24));
    o.type = 'sine';
    o.frequency.setValueAtTime(dp, t + to);
    o.frequency.exponentialRampToValueAtTime(dp * 0.5, t + to + 0.1);
    g.gain.setValueAtTime(0, t + to);
    g.gain.linearRampToValueAtTime(0.4 / Math.sqrt(dn), t + to + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, t + to + 0.15);
    o.connect(g); g.connect(mg);
    o.start(t + to); o.stop(t + to + 0.2);
  }
  const fl = c.createBiquadFilter();
  fl.type = 'bandpass';
  fl.Q.value = 2 + p.timbre * 10;
  fl.frequency.setValueAtTime(400, t);
  fl.frequency.linearRampToValueAtTime(1200, t + p.duration);
  const n = c.createBufferSource();
  const bf = c.createBuffer(1, c.sampleRate * p.duration, c.sampleRate);
  const dt = bf.getChannelData(0);
  for (let i = 0; i < dt.length; i++) dt[i] = Math.random() * 2 - 1;
  n.buffer = bf;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0, t);
  ng.gain.linearRampToValueAtTime(0.1, t + 0.5);
  ng.gain.linearRampToValueAtTime(0, t + p.duration);
  n.connect(fl); fl.connect(ng); ng.connect(mg);
  n.start(t); n.stop(t + p.duration);
  mg.connect(pn); pn.connect(d);
};

const engineJelly: EngineFn = (c, d, t, p) => {
  const o = c.createOscillator(), e = c.createGain();
  const pn = createPanner(c, (Math.random() * 2 - 1) * p.width * 0.5);
  const f = getScaleFreq(p.pitch, p.scale, -5);
  o.frequency.setValueAtTime(f, t);
  o.type = 'sine';
  const v = c.createOscillator(), vg = c.createGain();
  v.frequency.value = 6 + p.movement * 10;
  vg.gain.value = f * 0.05 * p.drift;
  v.connect(vg); vg.connect(o.frequency);
  v.start(t); v.stop(t + p.duration);
  const fl = c.createBiquadFilter();
  fl.type = 'lowpass';
  fl.Q.value = 4 * p.timbre;
  const pk = 200 + p.impact * 2000;
  fl.frequency.setValueAtTime(200, t);
  fl.frequency.exponentialRampToValueAtTime(pk, t + 0.02);
  fl.frequency.exponentialRampToValueAtTime(200, t + p.duration * 0.6);
  e.gain.setValueAtTime(0, t);
  e.gain.linearRampToValueAtTime(1, t + 0.01);
  e.gain.exponentialRampToValueAtTime(0.001, t + p.duration * 0.6);
  o.connect(fl); fl.connect(e); e.connect(pn); pn.connect(d);
  o.start(t); o.stop(t + p.duration);
};

const engineMercury: EngineFn = (c, d, t, p) => {
  const cr = c.createOscillator(), md = c.createOscillator();
  const mg = c.createGain(), e = c.createGain();
  const pn = createPanner(c, 0);
  const f = getScaleFreq(p.pitch, p.scale, 0);
  cr.frequency.value = f;
  md.frequency.value = f * 1.5 + p.drift * 50;
  cr.type = 'sine'; md.type = 'triangle';
  mg.gain.value = f * (0.5 + p.timbre * 2);
  const me = c.createGain();
  me.gain.setValueAtTime(0, t);
  me.gain.linearRampToValueAtTime(1, t + 0.1);
  me.gain.exponentialRampToValueAtTime(0.2, t + p.duration);
  md.connect(me); me.connect(mg); mg.connect(cr.frequency);
  createOrganicLFO(c, pn.pan, t, p.duration, p.width, p.movement * 2);
  e.gain.setValueAtTime(0, t);
  e.gain.linearRampToValueAtTime(0.5 * p.impact, t + 0.05);
  e.gain.exponentialRampToValueAtTime(0.001, t + p.duration);
  md.start(t); cr.connect(e); e.connect(pn); pn.connect(d);
  cr.start(t); cr.stop(t + p.duration);
  md.stop(t + p.duration);
};

const enginePop: EngineFn = (c, d, t, p) => {
  const o = c.createOscillator(), e = c.createGain();
  const pn = createPanner(c, (Math.random() * 2 - 1) * p.width * 0.3);
  const f = getScaleFreq(p.pitch * 2, p.scale, Math.floor(Math.random() * 5));
  o.type = p.timbre > 0.5 ? 'triangle' : 'sine';
  o.frequency.setValueAtTime(f, t);
  if (p.movement > 0.5) {
    o.frequency.exponentialRampToValueAtTime(f * 2, t + 0.1);
  } else {
    o.frequency.setValueAtTime(f * 2, t);
    o.frequency.exponentialRampToValueAtTime(f, t + 0.05);
  }
  const dur = 0.05 + p.duration * 0.1;
  e.gain.setValueAtTime(0, t);
  e.gain.linearRampToValueAtTime(0.8, t + 0.005);
  e.gain.exponentialRampToValueAtTime(0.001, t + dur);
  if (p.impact > 0.5) {
    const cl = c.createOscillator(), ce = c.createGain();
    cl.frequency.value = 1000 + p.timbre * 2000;
    ce.gain.setValueAtTime(0.5, t);
    ce.gain.exponentialRampToValueAtTime(0.001, t + 0.01);
    cl.connect(ce); ce.connect(e);
    cl.start(t); cl.stop(t + 0.05);
  }
  o.connect(e); e.connect(pn); pn.connect(d);
  o.start(t); o.stop(t + dur + 0.1);
};

const engineKira: EngineFn = (c, d, t, p) => {
  const ct = 5 + Math.floor(p.impact * 10);
  const fl = c.createBiquadFilter();
  fl.type = 'highpass';
  fl.frequency.value = 1000 + p.timbre * 2000;
  for (let i = 0; i < ct; i++) {
    const o = c.createOscillator(), e = c.createGain();
    const pn = createPanner(c, (Math.random() * 2 - 1) * p.width);
    const f = getScaleFreq(p.pitch * 2, p.scale, 12 + Math.floor(Math.random() * 24));
    o.frequency.value = f;
    o.type = 'sine';
    const m = c.createOscillator(), mg = c.createGain();
    m.frequency.value = f * (2 + Math.floor(Math.random() * 3));
    mg.gain.value = f * p.drift * 2;
    m.connect(mg); mg.connect(o.frequency);
    m.start(t); m.stop(t + p.duration);
    const st = t + Math.random() * 0.2 * p.movement;
    const dur = 0.05 + Math.random() * 0.1;
    e.gain.setValueAtTime(0, st);
    e.gain.linearRampToValueAtTime(0.1, st + 0.01);
    e.gain.exponentialRampToValueAtTime(0.001, st + dur);
    o.connect(e); e.connect(pn); pn.connect(fl);
    o.start(st); o.stop(st + dur + 0.1);
  }
  fl.connect(d);
};

const ENGINES: Record<PrismPlusEngineName, EngineFn> = {
  PRISM: enginePrism,
  CHIME: engineChime,
  HALO: engineHalo,
  GLINT: engineGlint,
  LUMEN: engineLumen,
  SHARD: engineShard,
  AURA: engineAura,
  WHOOSH: engineWhoosh,
  STELLA: engineStella,
  IMPACT: engineImpact,
  CHARGE: engineCharge,
  RUBBER: engineRubber,
  FLUX: engineFlux,
  JELLY: engineJelly,
  MERCURY: engineMercury,
  POP: enginePop,
  KIRA: engineKira,
};

// Engine-specific visualizer colors
export const ENGINE_COLORS: Record<PrismPlusEngineName, string> = {
  PRISM:   '#a5f3fc',
  CHIME:   '#e2e8f0',
  HALO:    '#f0abfc',
  GLINT:   '#fef08a',
  LUMEN:   '#67e8f9',
  SHARD:   '#cbd5e1',
  AURA:    '#c4b5fd',
  WHOOSH:  '#ffffff',
  STELLA:  '#fcd34d',
  IMPACT:  '#f87171',
  CHARGE:  '#facc15',
  RUBBER:  '#fb923c',
  FLUX:    '#38bdf8',
  JELLY:   '#f472b6',
  MERCURY: '#94a3b8',
  POP:     '#f9a8d4',
  KIRA:    '#e9d5ff',
};

// === Main Engine Class ===

export class PrismPlusEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;

  // Global FX Bus
  private dryGain: GainNode | null = null;
  private reverbInput: GainNode | null = null;
  private convolver: ConvolverNode | null = null;
  private reverbGain: GainNode | null = null;
  private delayInput: GainNode | null = null;
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayFilter: BiquadFilterNode | null = null;
  private delayOutputGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private limiter: DynamicsCompressorNode | null = null;
  private masterGain: GainNode | null = null;
  private recordDest: MediaStreamAudioDestinationNode | null = null;

  // Arpeggiator
  private arpTimer: number | null = null;
  private arpIndex = 0;
  private isPlaying = false;

  params: PrismPlusParams = { ...DEFAULT_PRISM_PLUS_PARAMS };

  // === Lifecycle ===

  private async ensureCtx(): Promise<AudioContext> {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext({ sampleRate: 96000 });
      this.buildGraph();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  private buildGraph() {
    const c = this.ctx!;

    // 1. Input buses
    this.dryGain = c.createGain();
    this.reverbInput = c.createGain();
    this.delayInput = c.createGain();

    // 2. Reverb chain (shimmer convolution)
    this.convolver = c.createConvolver();
    this.convolver.buffer = createShimmerBuffer(c, 3.0, 3.5);
    this.reverbGain = c.createGain();
    this.reverbGain.gain.value = this.params.space * 1.5;
    this.reverbInput.connect(this.convolver);
    this.convolver.connect(this.reverbGain);

    // 3. Delay chain (with feedback + lowpass)
    this.delayNode = c.createDelay(2.0);
    this.delayNode.delayTime.value = 0.25;
    this.delayFeedback = c.createGain();
    this.delayFeedback.gain.value = Math.min(0.9, this.params.magic * 0.8);
    this.delayFilter = c.createBiquadFilter();
    this.delayFilter.type = 'lowpass';
    this.delayFilter.frequency.value = 2000;
    this.delayOutputGain = c.createGain();
    this.delayOutputGain.gain.value = this.params.magic;
    this.delayInput.connect(this.delayNode);
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayFilter);
    this.delayFilter.connect(this.delayNode);
    this.delayNode.connect(this.delayOutputGain);

    // 4. Mastering chain
    this.compressor = c.createDynamicsCompressor();
    this.compressor.threshold.value = -18;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    this.limiter = c.createDynamicsCompressor();
    this.limiter.threshold.value = -1.0;
    this.limiter.knee.value = 0.0;
    this.limiter.ratio.value = 20.0;
    this.limiter.attack.value = 0.001;
    this.limiter.release.value = 0.1;

    this.masterGain = c.createGain();
    this.masterGain.gain.value = this.params.mainVol;

    // 5. Summing: dry + reverb + delay → compressor → limiter → masterGain
    this.dryGain.connect(this.compressor);
    this.reverbGain.connect(this.compressor);
    this.delayOutputGain.connect(this.compressor);
    this.compressor.connect(this.limiter);
    this.limiter.connect(this.masterGain);

    // 6. Output & analytics
    this.analyser = c.createAnalyser();
    this.analyser.fftSize = 2048;
    this.masterGain.connect(this.analyser);
    this.analyser.connect(c.destination);

    // Recording
    this.recordDest = c.createMediaStreamDestination();
    this.masterGain.connect(this.recordDest);
  }

  destroy() {
    this.stop();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }

  // === Sound Generation ===

  private spawnSound(ctx: AudioContext, overridePitch?: number) {
    if (!this.dryGain) return;
    const t = ctx.currentTime;
    const p = overridePitch ? { ...this.params, pitch: overridePitch } : { ...this.params };

    // Apply arpGate to duration if arpeggiator is active
    if (p.arp !== 'off' && p.arpGate) {
      p.duration = p.duration * p.arpGate;
      p.duration = Math.max(0.01, p.duration);
    }

    // Local source bus
    const sourceBus = ctx.createGain();
    sourceBus.gain.value = 1.0;

    // Generate sound via the selected engine
    const fn = ENGINES[p.engine] || ENGINES.PRISM;
    fn(ctx, sourceBus, t, p);

    // Route to global buses
    sourceBus.connect(this.dryGain);
    sourceBus.connect(this.reverbInput!);
    if (p.magic > 0.01) {
      sourceBus.connect(this.delayInput!);
    }

    // Garbage collection
    const cleanupMs = (p.duration + 2.0) * 1000;
    setTimeout(() => {
      try { sourceBus.disconnect(); } catch {}
    }, cleanupMs);
  }

  // === Arpeggiator ===

  private calculateArpPitch(mode: ArpMode, index: number, p: PrismPlusParams): number {
    const scaleLen = SCALES_MAP[p.scale].length;
    const octaveRange = p.arpOctave || 1;
    const totalNotes = scaleLen * octaveRange;
    let degreeIndex = 0;

    switch (mode) {
      case 'up': degreeIndex = index % totalNotes; break;
      case 'down': degreeIndex = (totalNotes - 1) - (index % totalNotes); break;
      case 'up-down': {
        const cycle = totalNotes * 2 - 2;
        const pos = index % cycle;
        degreeIndex = pos < totalNotes ? pos : cycle - pos;
        break;
      }
      case 'down-up': {
        const cycle = totalNotes * 2 - 2;
        const pos = index % cycle;
        degreeIndex = (totalNotes - 1) - (pos < totalNotes ? pos : cycle - pos);
        break;
      }
      case 'converge': {
        const cycle = totalNotes;
        const step = index % cycle;
        if (step % 2 === 0) degreeIndex = step / 2;
        else degreeIndex = (totalNotes - 1) - Math.floor(step / 2);
        break;
      }
      case 'diverge': {
        const center = Math.floor(totalNotes / 2);
        const cycle = totalNotes;
        const step = index % cycle;
        if (step % 2 === 0) degreeIndex = center + (step / 2);
        else degreeIndex = center - Math.ceil(step / 2);
        degreeIndex = (degreeIndex + totalNotes) % totalNotes;
        break;
      }
      case 'pinky':
        if (index % 2 === 0) degreeIndex = 0;
        else degreeIndex = Math.floor(Math.random() * (totalNotes - 1)) + 1;
        break;
      case 'random': degreeIndex = Math.floor(Math.random() * totalNotes); break;
      case 'rain': {
        const shift = (octaveRange + 1) * scaleLen;
        const range = 12;
        degreeIndex = shift + Math.floor(Math.random() * range);
        break;
      }
      default: degreeIndex = 0;
    }

    return getDegreeFreq(p.pitch, p.scale, degreeIndex);
  }

  private arpTick = () => {
    if (!this.isPlaying || this.params.arp === 'off' || !this.ctx) return;

    const freq = this.calculateArpPitch(this.params.arp, this.arpIndex, this.params);
    this.spawnSound(this.ctx, freq);
    this.arpIndex++;

    const rateMultiplier = this.params.arpRate || 0.5;
    const intervalMs = (60000 / this.params.bpm) * rateMultiplier;
    this.arpTimer = window.setTimeout(this.arpTick, intervalMs);
  };

  // === Public API ===

  async play() {
    const ctx = await this.ensureCtx();
    this.isPlaying = true;
    this.arpIndex = 0;

    if (this.params.arp !== 'off') {
      this.arpTick();
    } else {
      this.spawnSound(ctx);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.arpTimer) {
      clearTimeout(this.arpTimer);
      this.arpTimer = null;
    }
  }

  async triggerSound(overridePitch?: number) {
    const ctx = await this.ensureCtx();
    this.spawnSound(ctx, overridePitch);
  }

  async triggerNote(midiNote: number) {
    const ctx = await this.ensureCtx();
    const freq = midiToFreq(midiNote);
    this.spawnSound(ctx, freq);
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  getRecordStream(): MediaStream | null {
    return this.recordDest?.stream ?? null;
  }

  setParam<K extends keyof PrismPlusParams>(key: K, value: PrismPlusParams[K]) {
    this.params[key] = value;
    this.applyParams();
  }

  setParams(partial: Partial<PrismPlusParams>) {
    Object.assign(this.params, partial);
    this.applyParams();
  }

  private applyParams() {
    if (!this.ctx) return;
    const p = this.params;
    const now = this.ctx.currentTime;
    const ramp = 0.05;

    if (this.reverbGain) {
      const revLevel = p.space > 0.05 ? Math.min(1.0, p.space * 1.5) : 0;
      this.reverbGain.gain.setTargetAtTime(revLevel, now, ramp);
    }
    if (this.delayOutputGain) {
      const delayLevel = p.magic > 0.05 ? p.magic : 0;
      this.delayOutputGain.gain.setTargetAtTime(delayLevel, now, ramp);
    }
    if (this.delayFeedback) {
      this.delayFeedback.gain.setTargetAtTime(Math.min(0.9, p.magic * 0.8), now, ramp);
    }
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(p.mainVol, now, ramp);
    }

    // Update shimmer buffer when space changes (debounced)
    if (this.convolver && this.ctx) {
      const tail = 1.0 + (p.space * 4.0);
      this.convolver.buffer = createShimmerBuffer(this.ctx, tail, 3.5);
    }
  }
}
