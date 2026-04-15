import Logo from './logo';
import { useState } from 'react';
import Home from './pages/Home';
import ChatPage from './pages/ChatPage';
import ResourcesPage from './pages/ResourcesPage';

type Page = 'home' | 'chat' | 'resources' | 'tools' | 'about';

const NAV: { p: Page; label: string }[] = [
  { p: 'home', label: '首页' },
  { p: 'chat', label: 'AI 对话' },
  { p: 'resources', label: '资源导航' },
  { p: 'tools', label: '工具箱' },
  { p: 'about', label: '关于' },
];

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const tools = [
    { name: 'AI 对话', desc: 'GPT-4o 智能对话助手', icon: '💬', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
    { name: '资源导航', desc: '收录全网优质 AI 工具', icon: '🧭', color: '#0891b2', bg: 'rgba(8,145,178,0.15)' },
    { name: '图片生成', desc: 'AI 文生图工具集合', icon: '🎨', color: '#db2777', bg: 'rgba(219,39,119,0.15)' },
    { name: '视频制作', desc: 'AI 视频生成与编辑工具', icon: '🎬', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
    { name: 'PPT 生成', desc: '输入主题，AI 自动出幻灯片', icon: '📊', color: '#d97706', bg: 'rgba(217,119,6,0.15)' },
    { name: '代码助手', desc: 'AI 编程辅助工具合集', icon: '💻', color: '#059669', bg: 'rgba(5,150,105,0.15)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#030311', display: 'flex', flexDirection: 'column' }}>
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(3,3,17,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 40px', height: 66, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: 0 }}>
          <Logo />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>because</span>
        </button>
        <div className="dnav" style={{ display: 'flex', gap: 4 }}>
          {NAV.map(item => (
            <button key={item.p} onClick={() => setPage(item.p)}
              style={{ background: page === item.p ? 'rgba(124,58,237,0.18)' : 'transparent', border: 'none', borderRadius: 8, padding: '8px 18px', color: page === item.p ? '#c084fc' : '#6b7280', fontSize: 16, fontWeight: page === item.p ? 700 : 600, cursor: 'pointer' }}>
              {item.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setShowSettings(s => !s)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 14px', color: apiKey ? '#4ade80' : '#facc15', fontSize: 12, cursor: 'pointer' }}>
            {apiKey ? '✅ 已配置' : '⚠️ 未配置'}
          </button>
          <button onClick={() => setMobileOpen(o => !o)} className="mtog"
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'none' }}>☰</button>
        </div>
      </nav>

      {mobileOpen && (
        <div style={{ background: 'rgba(3,3,17,0.97)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px 20px' }}>
          {NAV.map(item => (
            <button key={item.p} onClick={() => { setPage(item.p); setMobileOpen(false); }}
              style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', borderRadius: 8, padding: '10px 12px', color: page === item.p ? '#c084fc' : '#6b7280', fontSize: 15, cursor: 'pointer', textAlign: 'left', fontWeight: page === item.p ? 600 : 400 }}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {showSettings && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, maxWidth: 480, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>⚙️ API 配置</h2>
              <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>
              AI 对话需要 <strong style={{ color: '#a855f7' }}>OpenAI API Key</strong> 才能正常回答，支持 GPT-4o / GPT-4o mini 等模型。Key 仅存储在本地浏览器。
            </p>
            <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
              style={{ width: '100%', padding: '10px 14px', background: '#1a1a30', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#e5e7eb', fontSize: 13, outline: 'none', marginBottom: 12, fontFamily: 'monospace' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => { localStorage.setItem('openai_api_key', apiKey); setShowSettings(false); }}
                disabled={!apiKey}
                style={{ flex: 1, padding: '9px 0', background: 'linear-gradient(135deg, #7c3aed, #db2777)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: apiKey ? 'pointer' : 'not-allowed', opacity: apiKey ? 1 : 0.5 }}>
                保存并使用
              </button>
              <button onClick={() => setShowSettings(false)} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>取消</button>
            </div>
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer"
              style={{ display: 'block', textAlign: 'center', color: '#a855f7', fontSize: 12, marginTop: 14, textDecoration: 'none' }}>
              → 去 OpenAI 官网获取 API Key →
            </a>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {page === 'home' && <Home onNav={setPage} />}
        {page === 'chat' && <ChatPage apiKey={apiKey} />}
        {page === 'resources' && <ResourcesPage />}
        {page === 'tools' && (
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>🧩 AI 工具箱</h1>
              <p style={{ fontSize: 13.5, color: '#6b7280' }}>精选实用 AI 工具，一站直达</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {tools.map((tool, i) => (
                <button key={i} style={{ background: tool.bg, border: '1px solid ' + tool.color + '30', borderRadius: 16, padding: 24, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 10 }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = ''}>
                  <div style={{ fontSize: 36 }}>{tool.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{tool.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{tool.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
        {page === 'about' && (
          <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(219,39,119,0.25)' }}>
                <div style={{ width: 80, height: 80 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" width="80" height="80">
                    <defs>
                      <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fff5f7"/>
                        <stop offset="100%" stopColor="#fff0f3"/>
                      </linearGradient>
                      <linearGradient id="p1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f9a8d4" stopOpacity="0.85"/>
                        <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6"/>
                      </linearGradient>
                      <linearGradient id="p2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbcfe8" stopOpacity="0.9"/>
                        <stop offset="100%" stopColor="#f472b6" stopOpacity="0.65"/>
                      </linearGradient>
                      <linearGradient id="c2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fdf2f8"/>
                        <stop offset="40%" stopColor="#f9a8d4"/>
                        <stop offset="100%" stopColor="#db2777"/>
                      </linearGradient>
                      <filter id="sw2"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#ec4899" floodOpacity="0.22"/></filter>
                    </defs>
                    <rect x="4" y="4" width="72" height="72" rx="18" fill="url(#bg2)"/>
                    <g filter="url(#sw2)">
                      <ellipse cx="40" cy="20" rx="7.5" ry="13" fill="url(#p1)" opacity="0.75" transform="rotate(0 40 40)"/>
                      <ellipse cx="40" cy="20" rx="7.5" ry="13" fill="url(#p1)" opacity="0.75" transform="rotate(90 40 40)"/>
                      <ellipse cx="40" cy="20" rx="7.5" ry="13" fill="url(#p1)" opacity="0.75" transform="rotate(180 40 40)"/>
                      <ellipse cx="40" cy="20" rx="7.5" ry="13" fill="url(#p1)" opacity="0.75" transform="rotate(270 40 40)"/>
                    </g>
                    <g opacity="0.88">
                      <ellipse cx="40" cy="22" rx="6.5" ry="11" fill="url(#p2)" transform="rotate(45 40 40)"/>
                      <ellipse cx="40" cy="22" rx="6.5" ry="11" fill="url(#p2)" transform="rotate(135 40 40)"/>
                      <ellipse cx="40" cy="22" rx="6.5" ry="11" fill="url(#p2)" transform="rotate(225 40 40)"/>
                      <ellipse cx="40" cy="22" rx="6.5" ry="11" fill="url(#p2)" transform="rotate(315 40 40)"/>
                    </g>
                    <circle cx="40" cy="40" r="9" fill="url(#c2)" opacity="0.9"/>
                    <ellipse cx="36.5" cy="36.5" rx="3" ry="2.2" fill="white" opacity="0.7" transform="rotate(-30 36.5 36.5)"/>
                    <circle cx="38" cy="38" r="1" fill="white" opacity="0.5"/>
                  </svg>
                </div>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>because</h1>
              <p style={{ fontSize: 13, color: '#6b7280' }}>AI 声音技术平台 · 开源免费 · 持续更新</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
              <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 2 }}>because 致力于用 AI 技术降低声音创作的门槛，让每个人都能拥有独特的标志性声音。</p>
              <br />
              <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 2 }}>
                <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}>🎯 核心功能</div>
                <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
                  <li>AI 声音克隆与模型生成</li>
                  <li>智能编曲与轨道生成</li>
                  <li>AI 歌声合成与混音</li>
                  <li>多语言声音演绎</li>
                  <li>实时音效处理与高清导出</li>
                </ul>
                <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}>🛠️ 技术栈</div>
                <ul style={{ paddingLeft: 20 }}>
                  <li>前端：React + TypeScript + Vite</li>
                  <li>AI：OpenAI GPT-4o mini API</li>
                  <li>部署：GitHub Pages</li>
                  <li>资源库：34 个 AI 工具收录</li>
                </ul>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#374151' }}>© 2026 because · 打造独有标志性声音</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fSU{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes f0{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
        @keyframes f1{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
        @keyframes f2{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
        @keyframes wA{from{transform:scaleY(0.4)}to{transform:scaleY(1)}}
        @keyframes sP{0%,100%{opacity:0.3}50%{opacity:1}}
        @keyframes pD{0%,100%{opacity:1}50%{opacity:0.4}}
        @media(max-width:768px){.dnav{display:none!important}.mtog{display:block!important}}
        @media(min-width:769px){.dnav{display:flex!important}.mtog{display:none!important}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
        ::selection{background:rgba(124,58,237,0.3);color:#fff}
      `}</style>
    </div>
  );
}
