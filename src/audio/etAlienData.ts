// ET 外星人 — 音素映射 / 情感配置 / 预设短语
// 移植自 https://dengjinsh139-stack.github.io/Yellow-pages-game/alien-language-synth.html
// 设计灵感：安迪·威尔《挽救计划》中洛基的多声调语言——硅基生物靠体内多个气囊
// 同时振动产生和弦，音高变化表达情感，节奏密度传递紧急程度。

export type EmotionKey =
  | 'greeting'
  | 'question'
  | 'warning'
  | 'happy'
  | 'sad'
  | 'angry'
  | 'neutral';

export type EmotionConfig = {
  name: string;
  icon: string;
  color: string;
  /** 播放该情感时覆盖的合成参数 */
  params: { harmonics: number; vibrato: number; baseFreq: number; envelope: number };
  keywords: string[];
};

/** 中性基准频率：情感基频按比例缩放的参照点 */
export const NEUTRAL_BASE_FREQ = 264;

export const EMOTION_CONFIG: Record<EmotionKey, EmotionConfig> = {
  greeting: {
    name: '问候',
    icon: '👋',
    color: '#00d4aa',
    params: { harmonics: 3, vibrato: 3, baseFreq: 220, envelope: 600 },
    keywords: ['你好', '您好', 'hello', 'hi', 'hey', '欢迎', '早上好', '晚上好', '下午好', 'hallo', 'greetings'],
  },
  question: {
    name: '疑问',
    icon: '❓',
    color: '#00a8e8',
    params: { harmonics: 2, vibrato: 8, baseFreq: 330, envelope: 500 },
    keywords: ['吗', '呢', '什么', '为什么', '怎么', '谁', '哪里', '多少', 'what', 'why', 'how', 'who', 'where', 'when', '?', '？'],
  },
  warning: {
    name: '警告',
    icon: '⚠️',
    color: '#ffa502',
    params: { harmonics: 4, vibrato: 12, baseFreq: 150, envelope: 300 },
    keywords: ['警告', '危险', '小心', '注意', '别', '不要', '禁止', 'stop', 'danger', 'warning', 'caution', 'alert', ' careful', '别动'],
  },
  happy: {
    name: '喜悦',
    icon: '✨',
    color: '#ffd700',
    params: { harmonics: 3, vibrato: 6, baseFreq: 440, envelope: 500 },
    keywords: ['好', '棒', '优秀', '开心', '快乐', '赞', '恭喜', '谢谢', '感谢', 'great', 'good', 'excellent', 'happy', 'joy', 'thanks', 'congratulations', 'awesome', 'wonderful', 'love', '喜欢'],
  },
  sad: {
    name: '悲伤',
    icon: '💧',
    color: '#6495ed',
    params: { harmonics: 2, vibrato: 2, baseFreq: 180, envelope: 800 },
    keywords: ['难过', '伤心', '抱歉', '对不起', '遗憾', 'sad', 'sorry', 'apologize', 'regret', 'miss', '失去', '别走', '再见', 'farewell'],
  },
  angry: {
    name: '愤怒',
    icon: '💢',
    color: '#ff4757',
    params: { harmonics: 5, vibrato: 15, baseFreq: 120, envelope: 200 },
    keywords: ['可恶', '混蛋', '生气', '愤怒', '讨厌', '恨', 'angry', 'hate', 'damn', 'stupid', 'idiot', 'fuck', 'shit', '气死'],
  },
  neutral: {
    name: '中性',
    icon: '⚪',
    color: '#8aa4b8',
    params: { harmonics: 3, vibrato: 4, baseFreq: 264, envelope: 500 },
    keywords: [],
  },
};

/**
 * 字符 → 频率映射表
 *
 * 注意：原实现中「中文声母/韵母」段与「英文字母」段存在重名键（如 b / p / m…），
 * 对象字面量后写覆盖先写，因此单字母最终取的是英文字母段的值。
 * 这里按 TS 要求去重，已保留**最终生效值**；多字母拼音键（zh/ch/ai/ang…）原样保留。
 */
export const PHONEME_MAP: Record<string, number> = {
  // —— 中文声母（单字母已被英文字母段覆盖，此处保留多字母声母）——
  'zh': 523, 'ch': 587, 'sh': 659,

  // —— 中文韵母（多字母）——
  'ai': 392, 'ei': 440, 'ao': 493, 'ou': 523, 'an': 587, 'en': 659,
  'ang': 698, 'eng': 783, 'ong': 1046,
  'ia': 220, 'iao': 261, 'ian': 293, 'iang': 329,
  'ie': 349, 'in': 392, 'ing': 440, 'iong': 493,
  'ua': 523, 'uo': 587, 'uai': 659, 'ui': 698,
  'uan': 783, 'un': 493, 'uang': 987, 'ue': 440,

  // —— 英文字母 A-Z（220Hz → 932Hz）——
  'a': 220, 'b': 233, 'c': 246, 'd': 261, 'e': 277, 'f': 293, 'g': 311,
  'h': 329, 'i': 349, 'j': 369, 'k': 392, 'l': 415, 'm': 440, 'n': 466,
  'o': 493, 'p': 523, 'q': 554, 'r': 587, 's': 622, 't': 659, 'u': 698,
  'v': 739, 'w': 783, 'x': 830, 'y': 880, 'z': 932,

  // —— 数字 0-9 ——
  '0': 261, '1': 293, '2': 329, '3': 349, '4': 392,
  '5': 440, '6': 493, '7': 523, '8': 587, '9': 659,

  // —— 标点（0 = 停顿，不发声）——
  ' ': 0, '，': 0, '。': 0, ',': 0, '.': 0,
  '!': 880, '?': 196, '！': 880, '？': 196,
};

/** 取字符对应频率，支持情感基频按比例缩放 */
export function getCharFrequency(char: string, emotionBaseFreq?: number | null): number {
  let baseFreq = PHONEME_MAP[char];

  if (baseFreq === undefined) {
    baseFreq = PHONEME_MAP[char.toLowerCase()];
  }

  // 未命中映射表 → 用 Unicode 码点生成频率（中文字符走这条路径）
  if (baseFreq === undefined) {
    const code = char.charCodeAt(0);
    baseFreq = 150 + (code % 50) * 15;
  }

  if (emotionBaseFreq && baseFreq > 0) {
    const ratio = emotionBaseFreq / NEUTRAL_BASE_FREQ;
    return Math.max(80, Math.min(2000, Math.round(baseFreq * ratio)));
  }

  return baseFreq;
}

/**
 * 转义正则元字符
 *
 * 原实现直接 `new RegExp(keyword)`，而 question 的关键词里含 `?`——
 * 会抛 SyntaxError: Nothing to repeat，导致勾选情感匹配后整页崩溃。
 * 这里统一转义后再匹配。
 */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 关键词计数式情感分析 */
export function analyzeEmotion(text: string): { emotion: EmotionKey; config: EmotionConfig; score: number } {
  const lower = text.toLowerCase();
  const scores: Partial<Record<EmotionKey, number>> = {};

  for (const key of Object.keys(EMOTION_CONFIG) as EmotionKey[]) {
    if (key === 'neutral') continue;
    let score = 0;
    for (const keyword of EMOTION_CONFIG[key].keywords) {
      const matches = lower.match(new RegExp(escapeRegExp(keyword), 'gi'));
      if (matches) score += matches.length;
    }
    scores[key] = score;
  }

  let maxScore = 0;
  let detected: EmotionKey = 'neutral';
  for (const [key, score] of Object.entries(scores) as [EmotionKey, number][]) {
    if (score > maxScore) {
      maxScore = score;
      detected = key;
    }
  }

  return { emotion: detected, config: EMOTION_CONFIG[detected], score: maxScore };
}

export type TextSegment = {
  text: string;
  emotion: EmotionKey;
  config: EmotionConfig;
  charCount: number;
};

/** 按标点切句，逐句做情感分析 */
export function segmentText(text: string): TextSegment[] {
  const sentences = text.split(/([。！？.!?;；]+)/).filter(s => s.trim());
  const segments: TextSegment[] = [];

  for (let i = 0; i < sentences.length; i += 2) {
    const content = sentences[i];
    const punctuation = sentences[i + 1] || '';
    const fullSentence = content + punctuation;
    if (fullSentence.trim()) {
      const analysis = analyzeEmotion(fullSentence);
      segments.push({
        text: fullSentence.trim(),
        emotion: analysis.emotion,
        config: analysis.config,
        charCount: fullSentence.length,
      });
    }
  }

  // 无标点 → 整段作为一段
  if (segments.length === 0 && text.trim()) {
    const analysis = analyzeEmotion(text);
    segments.push({
      text: text.trim(),
      emotion: analysis.emotion,
      config: analysis.config,
      charCount: text.length,
    });
  }

  return segments;
}

// === 预设短语 ===

export type EtPresetKey =
  | 'greeting' | 'question' | 'warning' | 'happy'
  | 'sad' | 'numbers' | 'name' | 'goodbye';

export type EtPreset = {
  key: EtPresetKey;
  label: string;
  icon: string;
  freq: number;
  harmonics: number;
  vibrato: number;
  /** 音高倍数序列，逐个播放形成「语调」 */
  pattern: number[];
};

export const ET_PRESETS: EtPreset[] = [
  { key: 'greeting', label: '问候', icon: '👋', freq: 220, harmonics: 3, vibrato: 3, pattern: [1, 0.8, 1.2, 1] },
  { key: 'question', label: '疑问', icon: '❓', freq: 330, harmonics: 2, vibrato: 8, pattern: [1, 1.2, 1.5] },
  { key: 'warning',  label: '警告', icon: '⚠️', freq: 150, harmonics: 4, vibrato: 12, pattern: [1, 0.5, 1, 0.5] },
  { key: 'happy',    label: '喜悦', icon: '✨', freq: 440, harmonics: 3, vibrato: 6, pattern: [1, 1.1, 0.9, 1.2] },
  { key: 'sad',      label: '悲伤', icon: '💧', freq: 180, harmonics: 2, vibrato: 2, pattern: [1, 0.9, 0.8] },
  { key: 'numbers',  label: '数字', icon: '🔢', freq: 264, harmonics: 3, vibrato: 4, pattern: [1, 1.1, 1.2, 1.3, 1.4] },
  { key: 'name',     label: '名字', icon: '📝', freq: 352, harmonics: 3, vibrato: 5, pattern: [1, 0.8, 1.1, 0.9] },
  { key: 'goodbye',  label: '告别', icon: '🌟', freq: 196, harmonics: 2, vibrato: 4, pattern: [1, 0.7, 0.5] },
];

/** 随机短语只在这 5 种里抽 */
export const RANDOM_PRESET_KEYS: EtPresetKey[] = ['greeting', 'question', 'warning', 'happy', 'sad'];

// === 实时演奏键盘 ===

export type EtKey = { key: string; note: string; freq: number };

export const ET_KEYS: EtKey[] = [
  { key: 'a', note: 'C3', freq: 130.81 },
  { key: 's', note: 'D3', freq: 146.83 },
  { key: 'd', note: 'E3', freq: 164.81 },
  { key: 'f', note: 'F3', freq: 174.61 },
  { key: 'g', note: 'G3', freq: 196.0 },
  { key: 'h', note: 'A3', freq: 220.0 },
  { key: 'j', note: 'B3', freq: 246.94 },
  { key: 'k', note: 'C4', freq: 261.63 },
  { key: 'l', note: 'D4', freq: 293.66 },
  { key: ';', note: 'E4', freq: 329.63 },
];

export const ET_NOTE_FREQUENCIES: Record<string, number> = Object.fromEntries(
  ET_KEYS.map(k => [k.key, k.freq]),
);
