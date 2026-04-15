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
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('openai_base_url') || 'https://api.openai.com/v1');
  const [model, setModel] = useState(() => localStorage.getItem('openai_model') || 'Qwen/Qwen2.5-7B-Instruct');
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
          <img src="/icon-v2.png" alt="because" style={{ width: 52, height: 52, borderRadius: 12, display: 'block', flexShrink: 0, boxShadow: '0 6px 24px rgba(219,39,119,0.4)' }} />
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
            <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
              支持 <strong style={{ color: '#a855f7' }}>OpenAI 格式</strong>的任意 API 接口（OpenAI / 硅基流动 / Groq 等）。Key 仅存储在本地浏览器。
            </p>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 4 }}>接口地址</div>
              <input type="text" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://api.openai.com/v1"
                style={{ width: '100%', padding: '9px 12px', background: '#1a1a30', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#e5e7eb', fontSize: 12.5, outline: 'none', fontFamily: 'monospace' }} />
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 4 }}>API Key</div>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="sk-xxxxxxxx"
                style={{ width: '100%', padding: '9px 12px', background: '#1a1a30', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#e5e7eb', fontSize: 12.5, outline: 'none', fontFamily: 'monospace' }} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 4 }}>模型名称</div>
              <input type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="Qwen/Qwen2.5-7B-Instruct"
                style={{ width: '100%', padding: '9px 12px', background: '#1a1a30', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#e5e7eb', fontSize: 12.5, outline: 'none', fontFamily: 'monospace' }} />
            </div>

            <div style={{ fontSize: 11.5, color: '#6b7280', marginBottom: 14, lineHeight: 1.8, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px' }}>
              <div>💡 <strong style={{ color: '#e2e8f0' }}>硅基流动</strong> → baseUrl: <code style={{ color: '#a855f7' }}>https://api.siliconflow.cn/v1</code></div>
              <div>💡 <strong style={{ color: '#e2e8f0' }}>OpenAI</strong> → baseUrl: <code style={{ color: '#a855f7' }}>https://api.openai.com/v1</code></div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => {
                localStorage.setItem('openai_api_key', apiKey);
                localStorage.setItem('openai_base_url', baseUrl);
                localStorage.setItem('openai_model', model);
                setShowSettings(false);
              }}
                disabled={!apiKey}
                style={{ flex: 1, padding: '9px 0', background: 'linear-gradient(135deg, #7c3aed, #db2777)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: apiKey ? 'pointer' : 'not-allowed', opacity: apiKey ? 1 : 0.5 }}>
                保存并使用
              </button>
              <button onClick={() => setShowSettings(false)} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>取消</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {page === 'home' && <Home onNav={setPage} />}
        {page === 'chat' && <ChatPage apiKey={apiKey} baseUrl={baseUrl} model={model} />}
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
              <img src="/icon-v2.png" alt="because" style={{ width: 100, height: 100, borderRadius: 24, display: 'block', margin: '0 auto 20px', boxShadow: '0 10px 48px rgba(219,39,119,0.4)' }} />
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
                  <li>AI：OpenAI 兼容 API</li>
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
