import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [hc, setHc] = useState<number | null>(null);

  const feat = [
    { i: '🎙️', t: 'AI 声音克隆', d: '上传30秒音频，AI 完美复刻你的音色与演唱风格，打造独特音色模型', c: '#7c3aed' },
    { i: '🎵', t: '智能编曲生成', d: '输入任意风格描述，AI 生成完整编曲轨道，支持多种乐器与节拍组合', c: '#db2777' },
    { i: '🎤', t: 'AI 歌声合成', d: '文字直接转歌声，支持情感控制与混音效果，打造专业级人声输出', c: '#0891b2' },
    { i: '🌐', t: '多语言演绎', d: '用你的声音演唱日语、英语、韩语等多语言歌曲，突破语言与地域边界', c: '#059669' },
    { i: '⚡', t: '实时音效处理', d: '专业级混响、均衡、压缩处理，让每一个声音细节都饱满立体', c: '#d97706' },
    { i: '🔊', t: '高清无损导出', d: '支持 WAV、FLAC 等无损格式导出，保留每一个声音细节与层次', c: '#dc2626' },
  ];

  const stats = [
    { v: '10K+', l: '活跃用户' },
    { v: '50K+', l: '生成曲目' },
    { v: '99.9%', l: '音色还原度' },
    { v: '24/7', l: '在线服务' },
  ];

  const pts = [
    { l: '12%', t: '15%', c: '#a855f7', s: 3 }, { l: '78%', t: '8%', c: '#ec4899', s: 2 },
    { l: '55%', t: '72%', c: '#06b6d4', s: 2 }, { l: '88%', t: '45%', c: '#a855f7', s: 3 },
    { l: '8%', t: '60%', c: '#ec4899', s: 2 }, { l: '35%', t: '85%', c: '#06b6d4', s: 3 },
    { l: '92%', t: '75%', c: '#a855f7', s: 2 }, { l: '65%', t: '18%', c: '#ec4899', s: 3 },
  ];

  const bars = Array.from({ length: 44 }, (_, i) => 24 + Math.abs(Math.sin(i * 0.6) * 26) + Math.abs(Math.cos(i * 0.3) * 16));

  const floatAnims = ['float1', 'float2', 'float3'];

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-6 pt-20 pb-16 overflow-hidden text-center">
        {/* 背景光晕 */}
        <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle,rgba(124,58,237,0.2)_0%,rgba(219,39,119,0.08)_40%,transparent_70%)] pointer-events-none blur-[50px]" />
        <div className="absolute bottom-[15%] left-[5%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(168,85,247,0.1)_0%,transparent_60%)] pointer-events-none blur-[70px]" />
        <div className="absolute top-[25%] right-[5%] w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(236,72,153,0.07)_0%,transparent_60%)] pointer-events-none blur-[60px]" />

        {/* 粒子 */}
        {pts.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              background: p.c,
              width: p.s,
              height: p.s,
              left: p.l,
              top: p.t,
              opacity: 0.18,
              animation: `${floatAnims[i % 3]} ${3 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }}
          />
        ))}

        {/* because 艺术字 */}
        <h2
          className="text-[clamp(72px,14vw,160px)] font-normal tracking-[6px] leading-none mb-0 animate-fadeInUp"
          style={{
            fontFamily: '"Righteous", cursive',
            background: 'linear-gradient(135deg, #ffffff 0%, #e0c3fc 35%, #c084fc 60%, #f0abfc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 40px rgba(168,85,247,0.5))',
          }}
        >
          because
        </h2>

        {/* 标签 */}
        <div className="inline-flex items-center gap-2 bg-[rgba(124,58,237,0.12)] border border-[rgba(124,58,237,0.3)] rounded-full px-4 py-1.5 mb-9 animate-fadeInUp">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-400" style={{ animation: 'pulseDot 2s ease-in-out infinite' }} />
          <span className="text-[13px] text-purple-400 font-semibold tracking-wide">AI 声音技术 · 全新体验</span>
        </div>

        {/* 主标题 */}
        <h1 className="text-[clamp(54px,9.5vw,108px)] font-black text-white leading-[1.06] mb-2.5 tracking-tight max-w-[960px] animate-fadeInUp-1" style={{ textShadow: '0 0 100px rgba(124,58,237,0.4)' }}>
          打造独有
        </h1>
        <h1 className="text-[clamp(54px,9.5vw,108px)] font-black leading-[1.06] mb-6 tracking-tight animate-fadeInUp-2 gradient-text">
          标志性声音
        </h1>

        {/* 副标题 */}
        <p className="text-[clamp(15px,2.2vw,19px)] text-gray-400 max-w-[560px] leading-relaxed mb-13 animate-fadeInUp-3">
          用 AI 解锁声音的无限可能——克隆音色、智能编曲、AI 歌声合成，把普通音频变成专业级作品
        </p>

        {/* CTA */}
        <div className="flex gap-3.5 flex-wrap justify-center mb-16 animate-fadeInUp-4">
          <Link to="/chat" className="btn-primary flex items-center gap-2 no-underline">
            <span>🎤</span> 立即体验
          </Link>
          <Link to="/resources" className="btn-ghost flex items-center gap-2 no-underline">
            <span>🧭</span> 资源导航
          </Link>
        </div>

        {/* 音波条 */}
        <div className="flex items-end gap-[3px] h-[76px] animate-fadeInUp-5">
          {bars.map((h, i) => (
            <div
              key={i}
              className="w-[3.5px] rounded-sm"
              style={{
                background: 'linear-gradient(to top, #7c3aed, #ec4899)',
                height: `${Math.min(h, 75)}px`,
                animation: `waveBar ${0.8 + (i % 4) * 0.2}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.04}s`,
                opacity: 0.5 + (h / 80) * 0.5,
              }}
            />
          ))}
        </div>

        {/* 向下箭头 */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
          <span className="text-[10px] text-gray-800 tracking-[2px] uppercase">向下探索</span>
          <div className="w-px h-7 bg-gradient-to-b from-purple-600 to-transparent" style={{ animation: 'pulse 2s ease-in-out infinite' }} />
        </div>
      </section>

      {/* 数据统计 */}
      <section className="px-10 pb-16 max-w-[1000px] mx-auto">
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-2xl px-12 py-8 grid grid-cols-4">
          {stats.map((s, i) => (
            <div key={i} className={`text-center py-2 ${i < 3 ? 'border-r border-[rgba(255,255,255,0.06)]' : ''}`}>
              <div className="text-[30px] font-black gradient-text-subtle mb-1">{s.v}</div>
              <div className="text-xs text-gray-500 font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 核心能力 */}
      <section className="px-10 pb-20 max-w-[1100px] mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-[30px] font-extrabold text-white mb-3">核心能力</h2>
          <p className="text-sm text-gray-500 max-w-[480px] mx-auto leading-relaxed">六大技术模块，覆盖从声音克隆到专业混音的全链路</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {feat.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHc(i)}
              onMouseLeave={() => setHc(null)}
              className="card p-6 cursor-pointer"
              style={{
                transform: hc === i ? 'translateY(-5px)' : 'none',
                boxShadow: hc === i ? `0 16px 48px ${f.c}18` : 'none',
              }}
            >
              <div className="flex items-center gap-3.5 mb-3.5">
                <div className="w-11 h-11 rounded-[13px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-xl">
                  {f.i}
                </div>
                <div>
                  <div className="text-[15px] font-bold text-text-bright mb-0.5">{f.t}</div>
                  <div className="text-[10px] font-bold tracking-widest" style={{ color: f.c }}>AI POWERED</div>
                </div>
              </div>
              <p className="text-[13px] text-gray-400 leading-relaxed">{f.d}</p>
              <div className="mt-3.5 text-xs font-bold transition-opacity duration-200" style={{ color: f.c, opacity: hc === i ? 1 : 0 }}>
                了解更多 →
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 底部 */}
      <section className="px-10 pb-20 max-w-[900px] mx-auto">
        <div className="relative overflow-hidden rounded-3xl p-14 text-center" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(219,39,119,0.08))', border: '1px solid rgba(124,58,237,0.2)' }}>
          <div className="absolute -top-16 -right-16 w-60 h-60 bg-[radial-gradient(circle,rgba(168,85,247,0.12),transparent_70%)] pointer-events-none" />
          <div className="text-4xl mb-4">🎵</div>
          <h2 className="text-[26px] font-extrabold text-white mb-3">准备好创造你的标志性声音了吗？</h2>
          <p className="text-sm text-gray-400 max-w-[400px] mx-auto mb-7 leading-relaxed">免费注册，即刻开始 AI 声音创作之旅</p>
          <Link to="/chat" className="btn-primary inline-flex items-center gap-2 no-underline">
            🚀 开始免费使用
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,255,255,0.05)] py-6 px-10 text-center">
        <div className="text-xs text-gray-800">© 2026 because · 打造独有标志性声音</div>
      </footer>
    </div>
  );
}
