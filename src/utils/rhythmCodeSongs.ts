// 节奏编码 — 曲库与谱面生成
// 旋律 = 公有领域经典片段，用 [拍位, MIDI, 时值拍] 三元组编码；
// 编码器把旋律展开成时间轴谱面：每个音成为一个下落 token，
// 音高 → 轨道（低音在左、高音在右），命中即奏出该音 —— 玩 = 编译旋律。

export type Diff = 'easy' | 'normal' | 'hard';

export const DIFFS: Record<
  Diff,
  { label: string; en: string; speed: number; perfect: number; good: number; mult: number }
> = {
  easy: { label: '轻松', en: 'EASY', speed: 290, perfect: 0.09, good: 0.17, mult: 1 },
  normal: { label: '进阶', en: 'NORMAL', speed: 380, perfect: 0.068, good: 0.135, mult: 1.2 },
  hard: { label: '狂热', en: 'HARD', speed: 475, perfect: 0.05, good: 0.1, mult: 1.5 },
};

export const LANE_KEYS = ['D', 'F', 'J', 'K'];
export const LANE_COLORS = ['#a855f7', '#ec4899', '#22d3ee', '#f59e0b'];

export type ChartNote = {
  id: number;
  t: number; // 命中时刻（秒，从歌曲 0 点起）
  midi: number;
  dur: number; // 时值（秒）
  lane: number;
  judged: null | 'perfect' | 'good' | 'miss';
};

export type Song = {
  id: string;
  title: string;
  en: string;
  bpm: number;
  notes: ChartNote[];
  duration: number; // 秒（含收尾）
  count: number;
};

type Def = { id: string; title: string; en: string; bpm: number; melody: [number, number, number][] };
// melody: [起始拍, MIDI, 时值拍]

const SONGS: Def[] = [
  {
    id: 'twinkle',
    title: '小星星',
    en: 'TWINKLE TWINKLE',
    bpm: 100,
    melody: [
      [0, 60, 1], [1, 60, 1], [2, 67, 1], [3, 67, 1], [4, 69, 1], [5, 69, 1], [6, 67, 2],
      [8, 65, 1], [9, 65, 1], [10, 64, 1], [11, 64, 1], [12, 62, 1], [13, 62, 1], [14, 60, 2],
      [16, 67, 1], [17, 67, 1], [18, 65, 1], [19, 65, 1], [20, 64, 1], [21, 64, 1], [22, 62, 2],
      [24, 67, 1], [25, 67, 1], [26, 65, 1], [27, 65, 1], [28, 64, 1], [29, 64, 1], [30, 62, 2],
      [32, 60, 1], [33, 60, 1], [34, 67, 1], [35, 67, 1], [36, 69, 1], [37, 69, 1], [38, 67, 2],
      [40, 65, 1], [41, 65, 1], [42, 64, 1], [43, 64, 1], [44, 62, 1], [45, 62, 1], [46, 60, 2],
    ],
  },
  {
    id: 'lightly-row',
    title: '小蜜蜂',
    en: 'LIGHTLY ROW',
    bpm: 112,
    melody: [
      [0, 67, 2], [2, 64, 2], [4, 64, 2], [6, 65, 2], [8, 62, 2], [10, 62, 2],
      [12, 60, 1], [13, 62, 1], [14, 64, 1], [15, 65, 1], [16, 67, 2], [18, 67, 2], [20, 67, 2],
      [22, 65, 1], [23, 65, 1], [24, 64, 1], [25, 64, 1], [26, 62, 2], [28, 62, 2],
      [30, 67, 2], [32, 64, 2], [34, 64, 2], [36, 65, 2], [38, 62, 2], [40, 62, 2],
      [42, 60, 1], [43, 62, 1], [44, 64, 1], [45, 65, 1], [46, 67, 2], [48, 67, 2], [50, 67, 2],
      [52, 65, 1], [53, 65, 1], [54, 64, 1], [55, 64, 1], [56, 62, 1], [57, 62, 1], [58, 60, 2],
    ],
  },
  {
    id: 'ode-to-joy',
    title: '欢乐颂',
    en: 'ODE TO JOY',
    bpm: 122,
    melody: [
      [0, 64, 1], [1, 64, 1], [2, 65, 1], [3, 67, 1], [4, 67, 1], [5, 65, 1], [6, 64, 1], [7, 62, 1],
      [8, 60, 1], [9, 60, 1], [10, 62, 1], [11, 64, 1], [12, 64, 1.5], [13.5, 62, 0.5], [14, 62, 2],
      [16, 64, 1], [17, 64, 1], [18, 65, 1], [19, 67, 1], [20, 67, 1], [21, 65, 1], [22, 64, 1], [23, 62, 1],
      [24, 60, 1], [25, 60, 1], [26, 62, 1], [27, 64, 1], [28, 62, 1.5], [29.5, 60, 0.5], [30, 60, 2],
      [32, 62, 1], [33, 62, 1], [34, 64, 1], [35, 60, 1], [36, 62, 1], [37, 64, 0.5], [37.5, 65, 0.5], [38, 64, 1],
      [40, 60, 1], [41, 62, 1], [42, 64, 0.5], [42.5, 65, 0.5], [43, 64, 1], [44, 62, 1], [45, 60, 1], [46, 62, 1], [47, 55, 2],
      [52, 64, 1], [53, 64, 1], [54, 65, 1], [55, 67, 1], [56, 67, 1], [57, 65, 1], [58, 64, 1], [59, 62, 1],
      [60, 60, 1], [61, 60, 1], [62, 62, 1], [63, 64, 1], [64, 62, 1.5], [65.5, 60, 0.5], [66, 60, 2],
    ],
  },
  {
    id: 'fur-elise',
    title: '致爱丽丝',
    en: 'FÜR ELISE',
    bpm: 120,
    melody: [
      [0, 76, 0.5], [0.5, 75, 0.5], [1, 76, 0.5], [1.5, 75, 0.5], [2, 76, 0.5], [2.5, 71, 0.5], [3, 74, 0.5], [3.5, 72, 0.5],
      [4, 69, 1.5], [6, 60, 0.5], [6.5, 64, 0.5], [7, 69, 0.5], [7.5, 71, 0.5], [8, 64, 0.5], [8.5, 68, 0.5], [9, 71, 0.5], [9.5, 72, 0.5],
      [10, 64, 1], [11.5, 76, 0.5], [12, 75, 0.5], [12.5, 76, 0.5], [13, 75, 0.5], [13.5, 76, 0.5], [14, 71, 0.5], [14.5, 74, 0.5], [15, 72, 0.5],
      [15.5, 69, 1.5], [17.5, 60, 0.5], [18, 64, 0.5], [18.5, 69, 0.5], [19, 71, 0.5], [19.5, 64, 0.5], [20, 72, 0.5], [20.5, 71, 0.5], [21, 69, 2],
      [24, 76, 0.5], [24.5, 75, 0.5], [25, 76, 0.5], [25.5, 75, 0.5], [26, 76, 0.5], [26.5, 71, 0.5], [27, 74, 0.5], [27.5, 72, 0.5],
      [28, 69, 1.5], [30, 60, 0.5], [30.5, 64, 0.5], [31, 69, 0.5], [31.5, 71, 0.5], [32, 64, 0.5], [32.5, 68, 0.5], [33, 71, 0.5], [33.5, 72, 0.5],
      [34, 64, 1], [35.5, 76, 0.5], [36, 75, 0.5], [36.5, 76, 0.5], [37, 75, 0.5], [37.5, 76, 0.5], [38, 71, 0.5], [38.5, 74, 0.5], [39, 72, 0.5],
      [39.5, 69, 1.5], [41.5, 60, 0.5], [42, 64, 0.5], [42.5, 69, 0.5], [43, 71, 0.5], [43.5, 64, 0.5], [44, 72, 0.5], [44.5, 71, 0.5], [45, 69, 2],
    ],
  },
];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function midiName(midi: number): string {
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

/** 构建谱面：难度决定是否裁掉半拍音（easy 只留整拍），并把音高分桶到 4 轨 */
export function buildSong(def: Def, diff: Diff): Song {
  const spb = 60 / def.bpm;
  const kept = diff === 'easy' ? def.melody.filter(([b]) => Math.abs(b - Math.round(b)) < 1e-6) : def.melody;
  const pitches = [...new Set(kept.map(([, m]) => m))].sort((a, b) => a - b);
  const laneOf = new Map<number, number>();
  pitches.forEach((m, i) => laneOf.set(m, Math.min(3, Math.floor((i * 4) / pitches.length))));
  const notes: ChartNote[] = kept.map(([beat, midi, durBeats], i) => ({
    id: i,
    t: beat * spb,
    midi,
    dur: Math.max(0.14, durBeats * spb),
    lane: laneOf.get(midi) ?? 0,
    judged: null,
  }));
  const last = notes[notes.length - 1];
  return {
    id: def.id,
    title: def.title,
    en: def.en,
    bpm: def.bpm,
    notes,
    duration: last.t + last.dur + 1.2,
    count: notes.length,
  };
}

export function getSong(id: string, diff: Diff): Song {
  const def = SONGS.find((s) => s.id === id) ?? SONGS[0];
  return buildSong(def, diff);
}

export type SongMeta = { id: string; title: string; en: string; bpm: number; total: number };
export const SONG_METAS: SongMeta[] = SONGS.map((s) => ({
  id: s.id,
  title: s.title,
  en: s.en,
  bpm: s.bpm,
  total: s.melody.length,
}));

export const BEST_KEY = 'rc-best-v1';

export type Best = { score: number; acc: number; grade: string; fc: boolean };

export function loadBests(): Record<string, Best> {
  try {
    return JSON.parse(localStorage.getItem(BEST_KEY) || '{}') as Record<string, Best>;
  } catch {
    return {};
  }
}

export function saveBest(key: string, b: Best): void {
  try {
    const all = loadBests();
    const cur = all[key];
    if (!cur || b.score > cur.score) {
      all[key] = b;
      localStorage.setItem(BEST_KEY, JSON.stringify(all));
    }
  } catch {
    /* ignore */
  }
}
