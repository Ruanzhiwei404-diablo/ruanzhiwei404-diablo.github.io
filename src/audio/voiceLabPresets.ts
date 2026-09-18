// Voice Lab — constructed alien / instrument language vocabulary
// Each word = a sequence of syllables (consonant + vowel + pitch offset)

import type { VoiceWord } from './types';

export const VOICE_WORDS: VoiceWord[] = [
  // === 问候 GREETINGS ===
  {
    name: 'Kóra',
    gloss: '你好 · Hello',
    category: '问候',
    syllables: [
      { consonant: 'k', vowel: 'o', pitchOffset: 0 },
      { consonant: 'none', vowel: 'a', pitchOffset: 3 },
    ],
  },
  {
    name: 'Vela-shi',
    gloss: '欢迎 · Welcome',
    category: '问候',
    syllables: [
      { consonant: 'none', vowel: 'e', pitchOffset: 0 },
      { consonant: 'sh', vowel: 'i', pitchOffset: 5 },
    ],
  },
  {
    name: 'Zün',
    gloss: '再见 · Farewell',
    category: '问候',
    syllables: [
      { consonant: 'none', vowel: 'u', pitchOffset: 0 },
      { consonant: 'none', vowel: 'eu', pitchOffset: -4 },
    ],
  },

  // === 数字 NUMBERS ===
  {
    name: 'Tol',
    gloss: '一 · One',
    category: '数字',
    syllables: [{ consonant: 't', vowel: 'o', pitchOffset: 0 }],
  },
  {
    name: 'Tin',
    gloss: '二 · Two',
    category: '数字',
    syllables: [{ consonant: 't', vowel: 'i', pitchOffset: 2 }],
  },
  {
    name: 'Kos',
    gloss: '三 · Three',
    category: '数字',
    syllables: [
      { consonant: 'k', vowel: 'o', pitchOffset: 0 },
      { consonant: 's', vowel: 'u', pitchOffset: 4 },
    ],
  },

  // === 情绪 EMOTION ===
  {
    name: 'Sora',
    gloss: '喜悦 · Joy',
    category: '情绪',
    syllables: [
      { consonant: 's', vowel: 'o', pitchOffset: 0 },
      { consonant: 'none', vowel: 'a', pitchOffset: 4 },
    ],
  },
  {
    name: 'Nülo',
    gloss: '忧伤 · Sorrow',
    category: '情绪',
    syllables: [
      { consonant: 'none', vowel: 'u', pitchOffset: 0 },
      { consonant: 'none', vowel: 'o', pitchOffset: -3 },
    ],
  },
  {
    name: 'Raki',
    gloss: '勇气 · Courage',
    category: '情绪',
    syllables: [
      { consonant: 'none', vowel: 'a', pitchOffset: 0 },
      { consonant: 'k', vowel: 'i', pitchOffset: 5 },
    ],
  },

  // === 指令 COMMANDS ===
  {
    name: 'Gó-shu',
    gloss: '启动 · Activate',
    category: '指令',
    syllables: [
      { consonant: 'none', vowel: 'o', pitchOffset: 0 },
      { consonant: 'sh', vowel: 'u', pitchOffset: -2 },
    ],
  },
  {
    name: 'Pala',
    gloss: '停止 · Stop',
    category: '指令',
    syllables: [
      { consonant: 'plosive', vowel: 'a', pitchOffset: 0 },
      { consonant: 'none', vowel: 'a', pitchOffset: -5 },
    ],
  },
  {
    name: 'Vex',
    gloss: '前进 · Forward',
    category: '指令',
    syllables: [
      { consonant: 'none', vowel: 'e', pitchOffset: 0 },
      { consonant: 's', vowel: 'ix', pitchOffset: 3 },
    ],
  },

  // === 自然 NATURE ===
  {
    name: 'Lume',
    gloss: '星光 · Starlight',
    category: '自然',
    syllables: [
      { consonant: 'none', vowel: 'u', pitchOffset: 0 },
      { consonant: 'none', vowel: 'e', pitchOffset: 7 },
    ],
  },
  {
    name: 'Aqua',
    gloss: '水 · Water',
    category: '自然',
    syllables: [
      { consonant: 'none', vowel: 'a', pitchOffset: 0 },
      { consonant: 'k', vowel: 'a', pitchOffset: -2 },
    ],
  },
  {
    name: 'Thar',
    gloss: '风 · Wind',
    category: '自然',
    syllables: [
      { consonant: 't', vowel: 'a', pitchOffset: 0 },
      { consonant: 'none', vowel: 'ae', pitchOffset: 3 },
    ],
  },
];
