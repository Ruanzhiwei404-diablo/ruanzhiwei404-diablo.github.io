import { useState } from 'react';

type Page = 'chat' | 'resources' | 'tools' | 'about';

export default function Home({ onNav }: { onNav: (p: Page) => void }) {
  const [hc, setHc] = useState<number | null>(null);

  const feat = [
    { i: '🎙️', t: 'AI 声音克隆', d: '上传30秒音频，AI 完美复刻你的音色与演唱风格，打造独特音色模型', c: '#7c3aed', b: 'rgba(124,58,237,0.12)', bd: 'rgba(124,58,237,0.25)' },
    { i: '🎵', t: '智能编曲生成', d: '输入任意风格描述，AI 生成完整编曲轨道，支持多种乐器与节拍组合', c: '#db2777', b: 'rgba(219,39,119,0.12)', bd: 'rgba(219,39,119,0.25)' },
    { i: '🎤', t: 'AI 歌声合成', d: '文字直接转歌声，支持情感控制与混音效果，打造专业级人声输出', c: '#0891b2', b: 'rgba(8,145,178,0.12)', bd: 'rgba(8,145,178,0.25)' },
    { i: '🌐', t: '多语言演绎', d: '用你的声音演唱日语、英语、韩语等多语言歌曲，突破语言与地域边界', c: '#059669', b: 'rgba(5,150,105,0.12)', bd: 'rgba(5,150,105,0.25)' },
    { i: '⚡', t: '实时音效处理', d: '专业级混响、均衡、压缩处理，让每一个声音细节都饱满立体', c: '#d97706', b: 'rgba(217,119,6,0.12)', bd: 'rgba(217,119,6,0.25)' },
    { i: '🔊', t: '高清无损导出', d: '支持 WAV、FLAC 等无损格式导出，保留每一个声音细节与层次', c: '#dc2626', b: 'rgba(220,38,38,0.12)', bd: 'rgba(220,38,38,0.25)' },
  ];

  const stats = [{ v: '10K+', l: '活跃用户' }, { v: '50K+', l: '生成曲目' }, { v: '99.9%', l: '音色还原度' }, { v: '24/7', l: '在线服务' }];

  const pts = [
    { l: '12%', t: '15%', c: '#a855f7', s: 3 }, { l: '78%', t: '8%', c: '#ec4899', s: 2 },
    { l: '55%', t: '72%', c: '#06b6d4', s: 2 }, { l: '88%', t: '45%', c: '#a855f7', s: 3 },
    { l: '8%', t: '60%', c: '#ec4899', s: 2 }, { l: '35%', t: '85%', c: '#06b6d4', s: 3 },
    { l: '92%', t: '75%', c: '#a855f7', s: 2 }, { l: '65%', t: '18%', c: '#ec4899', s: 3 },
  ];

  const bars = Array.from({ length: 44 }, (_, i) => 24 + Math.abs(Math.sin(i * 0.6) * 26) + Math.abs(Math.cos(i * 0.3) * 16));

  return (
    <div style={{ overflowX: 'hidden' }}>
      <section style={{ position: 'relative', minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 24px 60px', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%)', width: 800, height: 800, background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, rgba(219,39,119,0.08) 40%, transparent 70%)', pointerEvents: 'none', filter: 'blur(50px)' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 60%)', pointerEvents: 'none', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', top: '25%', right: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 60%)', pointerEvents: 'none', filter: 'blur(60px)' }} />

        {/* because 艺术字 */}
        <div style={{
          fontFamily: '"Righteous", cursive',
          fontSize: 'clamp(72px, 14vw, 160px)',
          fontWeight: 400,
          letterSpacing: '6px',
          background: 'linear-gradient(135deg, #ffffff 0%, #e0c3fc 35%, #c084fc 60%, #f0abfc 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          filter: 'drop-shadow(0 0 40px rgba(168,85,247,0.5))',
          marginBottom: 0,
          lineHeight: 1,
          animation: 'fSU 0.5s ease-out both',
        }}>because</div>

        {pts.map((p, i) => (
          <div key={i} style={{ position: 'absolute', borderRadius: '50%', background: p.c, width: p.s, height: p.s, left: p.l, top: p.t, opacity: 0.18, animation: 'f' + (i % 3) + ' ' + (3 + (i % 3)) + 's ease-in-out infinite', animationDelay: (i * 0.4) + 's' }} />
        ))}

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 20, padding: '6px 16px', marginBottom: 36, animation: 'fSU 0.6s ease-out both' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7', animation: 'pD 2s ease-in-out infinite' }} />
          <span style={{ fontSize: 13, color: '#c084fc', fontWeight: 600, letterSpacing: '0.5px' }}>AI 声音技术 · 全新体验</span>
        </div>

        <h1 style={{ fontSize: 'clamp(54px, 9.5vw, 108px)', fontWeight: 900, color: '#fff', lineHeight: 1.06, marginBottom: 10, letterSpacing: '-2px', maxWidth: 960, animation: 'fSU 0.6s ease-out 0.1s both', textShadow: '0 0 100px rgba(124,58,237,0.4)' }}>打造独有</h1>
        <h1 style={{ fontSize: 'clamp(54px, 9.5vw, 108px)', fontWeight: 900, lineHeight: 1.06, marginBottom: 24, letterSpacing: '-2px', animation: 'fSU 0.6s ease-out 0.15s both', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>标志性声音</h1>

        <p style={{ fontSize: 'clamp(15px, 2.2vw, 19px)', color: '#9ca3af', maxWidth: 560, lineHeight: 1.85, marginBottom: 52, animation: 'fSU 0.6s ease-out 0.2s both' }}>
          用 AI 解锁声音的无限可能——克隆音色、智能编曲、AI 歌声合成，把普通音频变成专业级作品
        </p>

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 64, animation: 'fSU 0.6s ease-out 0.3s both' }}>
          <button onClick={() => onNav('chat')} style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', border: 'none', borderRadius: 16, padding: '18px 44px', color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 48px rgba(124,58,237,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎤</span> 立即体验
          </button>
          <button onClick={() => onNav('resources')} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '18px 44px', color: '#e2e8f0', fontSize: 16, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🧭</span> 资源导航
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 76, animation: 'fSU 0.6s ease-out 0.4s both' }}>
          {bars.map((h, i) => (
            <div key={i} style={{ width: 3.5, borderRadius: 3, background: 'linear-gradient(to top, #7c3aed, #ec4899)', height: Math.min(h, 75) + 'px', animation: 'wA ' + (0.8 + (i % 4) * 0.2) + 's ease-in-out infinite alternate', animationDelay: (i * 0.04) + 's', opacity: 0.5 + (h / 80) * 0.5 }} />
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, color: '#374151', letterSpacing: '2px', textTransform: 'uppercase' }}>向下探索</span>
          <div style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, #7c3aed, transparent)', animation: 'sP 2s ease-in-out infinite' }} />
        </div>
      </section>

      <section style={{ padding: '0 40px 64px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '32px 48px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '8px 0', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
              <div style={{ fontSize: 30, fontWeight: 900, background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 4 }}>{s.v}</div>
              <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '40px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#fff', marginBottom: 12 }}>核心能力</h2>
          <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>六大技术模块，覆盖从声音克隆到专业混音的全链路</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {feat.map((f, i) => (
            <div key={i} onMouseEnter={() => setHc(i)} onMouseLeave={() => setHc(null)}
              style={{ background: hc === i ? f.b : 'rgba(255,255,255,0.03)', border: '1px solid ' + (hc === i ? f.bd : 'rgba(255,255,255,0.07)'), borderRadius: 16, padding: 24, cursor: 'pointer', transition: 'all 0.3s ease', transform: hc === i ? 'translateY(-5px)' : 'none', boxShadow: hc === i ? '0 16px 48px ' + f.c + '18' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: f.b, border: '1px solid ' + f.bd, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 21 }}>{f.i}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>{f.t}</div>
                  <div style={{ fontSize: 10, color: f.c, fontWeight: 700, letterSpacing: '1px' }}>AI POWERED</div>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.8 }}>{f.d}</p>
              <div style={{ marginTop: 14, color: f.c, fontSize: 12, fontWeight: 700, opacity: hc === i ? 1 : 0, transition: 'opacity 0.2s' }}>了解更多 →</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '40px 40px 80px', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(219,39,119,0.08))', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 24, padding: '52px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, background: 'radial-gradient(circle, rgba(168,85,247,0.12), transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ fontSize: 44, marginBottom: 16 }}>🎵</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 12 }}>准备好创造你的标志性声音了吗？</h2>
          <p style={{ fontSize: 14, color: '#9ca3af', maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.8 }}>免费注册，即刻开始 AI 声音创作之旅</p>
          <button onClick={() => onNav('chat')} style={{ background: 'linear-gradient(135deg, #7c3aed, #db2777)', border: 'none', borderRadius: 14, padding: '15px 40px', color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 36px rgba(124,58,237,0.38)' }}>🚀 开始免费使用</button>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#374151' }}>© 2026 because · 打造独有标志性声音</div>
      </footer>
    </div>
  );
}
