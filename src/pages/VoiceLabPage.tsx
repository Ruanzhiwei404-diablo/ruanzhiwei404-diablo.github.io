import { Link } from 'react-router-dom';

// href: 外链到静态页（如 public 下的独立 HTML 工具）
// to:   站内 React Router 路由
type Section = {
  id: string;
  label: string;
  icon: string;
  tagline: string;
  desc: string;
  href?: string;
  to?: string;
  cta?: string;
};

const CTA_CLASS =
  'block text-center rounded-xl bg-[#22d3ee] hover:bg-[#06b6d4] text-[#062a30] font-bold py-3 px-4 transition-colors';

const SECTIONS: Section[] = [
  {
    id: 'instrument',
    label: '乐器语言',
    icon: '🎼',
    tagline: 'INSTRUMENT LANGUAGE',
    desc: '用乐器音色与演奏语法构建的一套「会发声的语言」——每个词汇由乐器音色、音高走向与节奏型编码而成，可用于游戏内文明、族裔的听觉身份设计。',
    href: '/sound-effects/instrument-language-synth.html',
    cta: '🎹 进入乐器语言合成器 →',
  },
  {
    id: 'et',
    label: 'ET 外星人',
    icon: '🛸',
    tagline: 'ET ALIEN VOICE',
    desc: '基于共振峰(formant)元音 + 环形调制(ring-mod)金属嗓音的外星语音合成实验场，可构造具备「非人类」质感的外星对话与呐喊。已接入多振荡器外星语言合成器：音素映射、情感匹配、实时演奏与录制。',
    to: '/audio/voice-lab/et-alien',
    cta: '🛸 进入外星语言合成器 →',
  },
];

export default function VoiceLabPage() {
  return (
    <div className="max-w-[1000px] mx-auto py-8 px-6 w-full">
      {/* 头部 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5 flex items-center justify-center gap-2">
          <span>🛸</span> Voice lab 语言实验室
        </h1>
        <p className="text-[13.5px] text-gray-500">
          乐器语言 · ET 外星人 — 声音叙事的构造实验场
        </p>
      </div>

      {/* 并列双栏 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {SECTIONS.map((s) => (
          <div className="card p-6 relative overflow-hidden flex flex-col" key={s.id}>
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, #22d3ee, transparent)' }}
            />

            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #22d3ee, #0891b2)',
                  boxShadow: '0 4px 14px #22d3ee40',
                }}
              >
                {s.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-bright">{s.label}</h2>
                <p className="text-[10px] font-mono text-gray-500 tracking-widest">{s.tagline}</p>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed mb-5 flex-grow">{s.desc}</p>

            {/* 进入按钮 / 建设中占位 */}
            {s.href ? (
              <a href={s.href} className={CTA_CLASS}>
                {s.cta}
              </a>
            ) : s.to ? (
              <Link to={s.to} className={CTA_CLASS}>
                {s.cta}
              </Link>
            ) : (
              <div className="rounded-xl border border-dashed border-[rgba(34,211,238,0.3)] bg-[rgba(34,211,238,0.04)] p-6 text-center">
                <div className="text-3xl mb-2">🚧</div>
                <div className="text-sm font-semibold text-gray-300 mb-1">建设中 · Coming Soon</div>
                <div className="text-xs text-gray-500">
                  该模块的交互式合成器正在规划中。后续将在此接入共振峰 / 环形调制语音引擎与可点击发音的构造语言词库。
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 返回 */}
      <div className="mt-6 text-center">
        <Link
          to="/audio"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← 返回音频设计中心
        </Link>
      </div>
    </div>
  );
}
