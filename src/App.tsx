import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from './data/resources';
import { generateId, formatTime, RESOURCES, CATEGORIES } from './data/resources';

type Page = 'chat' | 'resources' | 'tools' | 'about';

const NAV_ITEMS: { p: Page; label: string }[] = [
  { p: 'chat', label: '对话' },
  { p: 'resources', label: '资源导航' },
  { p: 'tools', label: '工具箱' },
  { p: 'about', label: '关于' },
];

function App() {
  const [page, setPage] = useState<Page>('chat');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const saveKey = (k: string) => {
    localStorage.setItem('openai_api_key', k);
    setApiKey(k);
    setShowSettings(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#030311', display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(3,3,17,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => setPage('chat')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, padding: 0 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🦊</div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>AI<span style={{ color: '#818cf8' }}>Hub</span></span>
        </button>

        <div className="desktop-nav" style={{ display: 'flex', gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <button key={item.p} onClick={() => setPage(item.p)}
              style={{ background: page === item.p ? 'rgba(79,70,229,0.2)' : 'transparent', border: 'none', borderRadius: 8, padding: '6px 14px', color: page === item.p ? '#a5b4fc' : '#6b7280', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>
              {item.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setShowSettings(s => !s)}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 12px', color: apiKey ? '#4ade80' : '#facc15', fontSize: 12, cursor: 'pointer' }}>
            {apiKey ? '✅ 已配置' : '⚠️ 未配置'}
          </button>
          <button onClick={() => setMobileOpen(o => !o)} className="mobile-toggle"
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20, cursor: 'pointer', display: 'none' }}>☰</button>
        </div>
      </nav>

      {mobileOpen && (
        <div style={{ background: 'rgba(3,3,17,0.98)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 24px 20px' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.p} onClick={() => { setPage(item.p); setMobileOpen(false); }}
              style={{ display: 'block', width: '100%', background: 'transparent', border: 'none', borderRadius: 8, padding: '10px 12px', color: page === item.p ? '#a5b4fc' : '#6b7280', fontSize: 14, cursor: 'pointer', textAlign: 'left' }}>
              {item.label}
            </button>
          ))}
        </div>
      )}

      {showSettings && <SettingsModal onSave={saveKey} currentKey={apiKey} onClose={() => setShowSettings(false)} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {page === 'chat' && <ChatPage apiKey={apiKey} />}
        {page === 'resources' && <ResourcesPage />}
        {page === 'tools' && <ToolsPage />}
        {page === 'about' && <AboutPage />}
      </div>

      <style>{`
        @media(max-width:768px){.desktop-nav{display:none!important}.mobile-toggle{display:block!important}}
        @media(min-width:769px){.desktop-nav{display:flex!important}.mobile-toggle{display:none!important}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:2px}
      `}</style>
    </div>
  );
}

/* ── Settings Modal ── */
function SettingsModal({ onSave, currentKey, onClose }: { onSave: (k: string) => void; currentKey: string; onClose: () => void }) {
  const [key, setKey] = useState(currentKey);
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#0f0f23', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 28, maxWidth: 480, width: '100%', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>⚙️ API 配置</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>
        <p style={{ color: '#9ca3af', fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>
          AI 对话需要 <strong style={{ color: '#a5b4fc' }}>OpenAI API Key</strong> 才能正常回答，支持 GPT-4o / GPT-4o mini 等模型。Key 仅存储在本地浏览器。
        </p>
        <input type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
          style={{ width: '100%', padding: '10px 14px', background: '#1a1a30', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, color: '#e5e7eb', fontSize: 13, outline: 'none', marginBottom: 12, fontFamily: 'monospace' }} />
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => key && onSave(key)} disabled={!key}
            style={{ flex: 1, padding: '9px 0', background: 'linear-gradient(135deg, #4f46e5, #6d28d9)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 600, cursor: key ? 'pointer' : 'not-allowed', opacity: key ? 1 : 0.5 }}>
            保存并使用
          </button>
          <button onClick={onClose} style={{ padding: '9px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>取消</button>
        </div>
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer"
          style={{ display: 'block', textAlign: 'center', color: '#818cf8', fontSize: 12, marginTop: 14, textDecoration: 'none' }}>→ 去 OpenAI 官网获取 API Key →</a>
      </div>
    </div>
  );
}

/* ── Chat Page ── */
function ChatPage({ apiKey }: { apiKey: string }) {
  const [messages, setMessages] = useState<Message[]>(() => { try { return JSON.parse(localStorage.getItem('chat_messages') || '[]'); } catch { return []; } });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('chat_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { id: generateId(), role: 'user', content: input.trim(), time: formatTime() };
    setMessages(prev => [...prev, userMsg]);
    const text = input.trim();
    setInput('');
    setLoading(true);

    if (!apiKey) {
      await new Promise(r => setTimeout(r, 800));
      setLoading(false);
      setMessages(prev => [...prev, {
        id: generateId(), role: 'assistant', time: formatTime(),
        content: '⚠️ 尚未配置 API Key。\n\n请先点击右上角「未配置」按钮，填入你的 OpenAI API Key。\n\n获取方式：\n1. 打开 https://platform.openai.com/api-keys\n2. 登录账号 → 点击 Create new secret key\n3. 复制 Key 并粘贴到设置弹窗',
      }]);
      return;
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [...messages.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: text }],
          stream: true,
        }),
      });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error?.message || `请求失败 (${res.status})`); }
      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应流');
      let content = '';
      const assistantMsg: Message = { id: generateId(), role: 'assistant', content: '', time: formatTime() };
      setMessages(prev => [...prev, assistantMsg]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text2 = new TextDecoder().decode(value);
        for (const line of text2.split('\n')) {
          const d = line.trim();
          if (!d.startsWith('data: ') || d === 'data: [DONE]') continue;
          try {
            const delta = JSON.parse(d.slice(6)).choices?.[0]?.delta?.content;
            if (delta) { content += delta; setMessages(prev => prev.map(m => m.id === assistantMsg.id ? { ...m, content } : m)); }
          } catch { /* skip */ }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessages(prev => [...prev, { id: generateId(), role: 'assistant', time: formatTime(), content: `❌ 出错了：${msg}` }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, apiKey, messages]);

  const clearChat = () => { setMessages([]); localStorage.removeItem('chat_messages'); };

  const presets = ['帮我写一封求职邮件', '解释一下什么是 RAG', 'Python 写一个快速排序', '把这段话翻译成英文'];

  return (
    <div style={{ flex: 1, display: 'flex', maxWidth: 1100, width: '100%', margin: '0 auto', padding: '0 16px', minHeight: 0 }}>
      {/* Sidebar */}
      <div className="sidebar" style={{ width: 220, padding: '16px 12px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
        <button onClick={clearChat} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', color: '#9ca3af', fontSize: 12.5, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span>➕</span> 新对话
        </button>
        <div style={{ marginTop: 12, flex: 1 }}>
          <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', padding: '0 8px', marginBottom: 6 }}>最近</div>
          {messages.filter(m => m.role === 'user').slice(-6).reverse().map(m => (
            <div key={m.id} style={{ fontSize: 12, color: '#6b7280', padding: '5px 8px', borderRadius: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.content.slice(0, 22)}{m.content.length > 22 ? '…' : ''}
            </div>
          ))}
          {messages.filter(m => m.role === 'user').length === 0 && <div style={{ fontSize: 12, color: '#374151', padding: '4px 8px' }}>暂无记录</div>}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px', minWidth: 0 }}>
        {messages.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🦊</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>AIHub 对话助手</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>
              基于 GPT-4o mini，支持对话、写作、代码、翻译等<br />
              <span style={{ fontSize: 11.5, color: '#4b5563' }}>按 Enter 发送，Shift+Enter 换行</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
              {presets.map((q, i) => (
                <button key={i} onClick={() => setInput(q)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '6px 14px', color: '#9ca3af', fontSize: 12, cursor: 'pointer', transition: 'border-color 0.2s, color 0.2s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(79,70,229,0.4)'; el.style.color = '#a5b4fc'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.color = '#9ca3af'; }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 12, marginTop: 16 }}>
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: msg.role === 'user' ? 'linear-gradient(135deg, #4f46e5, #6d28d9)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div style={{ maxWidth: '72%', padding: '12px 16px', borderRadius: 14, background: msg.role === 'user' ? 'linear-gradient(135deg, #312e81, #4c1d95)' : 'rgba(255,255,255,0.05)', border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: 13.5, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  <MsgContent text={msg.content} />
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {messages.length > 0 && (
          <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'flex-end', gap: 8, padding: '8px 14px', marginBottom: 16 }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }}}
              placeholder="输入问题…" rows={1}
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 13.5, lineHeight: 1.6, resize: 'none', maxHeight: 120, overflowY: 'auto' }} />
            <button onClick={sendMessage} disabled={!input.trim() || loading}
              style={{ width: 32, height: 32, borderRadius: 8, background: input.trim() && !loading ? 'linear-gradient(135deg, #4f46e5, #6d28d9)' : 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', fontSize: 14, cursor: input.trim() && !loading ? 'pointer' : 'not-allowed', opacity: input.trim() && !loading ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {loading ? '⏳' : '↑'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MsgContent({ text }: { text: string }) {
  const html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.9em">$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" style="color:#818cf8;text-decoration:none">$1</a>')
    .replace(/^- (.+)$/gm, '<div style="padding-left:12px;margin:1px 0">• $1</div>')
    .replace(/^(\d+)\. (.+)$/gm, '<div style="padding-left:12px;margin:1px 0">$1. $2</div>');
  const lines = html.split('\n');
  return <>{lines.map((line, i) => <div key={i} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />)}</>;
}

/* ── Resources Page ── */
function ResourcesPage() {
  const [activeCategory, setActiveCategory] = useState('全部');
  const [search, setSearch] = useState('');

  const filtered = RESOURCES.filter(r => {
    const matchCat = activeCategory === '全部' || r.category === activeCategory;
    const matchSearch = !search || r.title.includes(search) || r.desc.includes(search) || r.tags.some(t => t.includes(search));
    return matchCat && matchSearch;
  });

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>🧭 AI 资源导航</h1>
        <p style={{ fontSize: 13.5, color: '#6b7280' }}>收录全网优质 AI 工具，持续更新 · 共 {RESOURCES.length} 个资源</p>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索工具名称或标签…"
        style={{ width: '100%', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#e2e8f0', fontSize: 13.5, outline: 'none', marginBottom: 16 }} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {['全部', ...CATEGORIES].map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 500, background: activeCategory === cat ? 'linear-gradient(135deg, #4f46e5, #6d28d9)' : 'rgba(255,255,255,0.05)', border: `1px solid ${activeCategory === cat ? 'rgba(79,70,229,0.4)' : 'rgba(255,255,255,0.08)'}`, color: activeCategory === cat ? '#fff' : '#9ca3af', cursor: 'pointer' }}>
            {cat}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
        {filtered.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noreferrer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(79,70,229,0.4)'; el.style.background = 'rgba(79,70,229,0.07)'; el.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.background = 'rgba(255,255,255,0.04)'; el.style.transform = ''; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 28 }}>{r.icon}</div>
              <div style={{ fontSize: 10, color: '#818cf8', background: 'rgba(129,140,248,0.12)', padding: '2px 8px', borderRadius: 6, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.category}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 5 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.65 }}>{r.desc}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {r.tags.map(t => <span key={t} style={{ fontSize: 10, color: '#818cf8', background: 'rgba(129,140,248,0.1)', padding: '2px 7px', borderRadius: 6 }}>{t}</span>)}
            </div>
          </a>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: '#374151', fontSize: 14 }}>🔍 没有找到匹配的资源</div>}
    </div>
  );
}

/* ── Tools Page ── */
function ToolsPage() {
  const tools = [
    { name: 'AI 对话', desc: 'GPT-4o 智能对话助手', icon: '💬', color: '#4f46e5', bg: 'rgba(79,70,229,0.15)' },
    { name: '资源导航', desc: '收录全网优质 AI 工具', icon: '🧭', color: '#0891b2', bg: 'rgba(8,145,178,0.15)' },
    { name: '图片生成', desc: 'AI 文生图工具集合', icon: '🎨', color: '#db2777', bg: 'rgba(219,39,119,0.15)' },
    { name: '视频制作', desc: 'AI 视频生成与编辑工具', icon: '🎬', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
    { name: 'PPT 生成', desc: '输入主题，AI 自动出幻灯片', icon: '📊', color: '#d97706', bg: 'rgba(217,119,6,0.15)' },
    { name: '代码助手', desc: 'AI 编程辅助工具合集', icon: '💻', color: '#059669', bg: 'rgba(5,150,105,0.15)' },
  ];
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>🧩 AI 工具箱</h1>
        <p style={{ fontSize: 13.5, color: '#6b7280' }}>精选实用 AI 工具，一站直达</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {tools.map((tool, i) => (
          <button key={i} style={{ background: tool.bg, border: `1px solid ${tool.color}30`, borderRadius: 16, padding: 24, textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', gap: 10 }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-3px)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = ''}>
            <div style={{ fontSize: 36 }}>{tool.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{tool.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af' }}>{tool.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── About Page ── */
function AboutPage() {
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, margin: '0 auto 16px', boxShadow: '0 8px 32px rgba(79,70,229,0.4)' }}>🦊</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9', marginBottom: 6 }}>AIHub</h1>
        <p style={{ fontSize: 13, color: '#6b7280' }}>开源 AI 工具导航站 · GitHub Pages + React 构建</p>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
        <p style={{ fontSize: 13, color: '#9ca3af', lineHeight: 2 }}>AIHub 致力于收集和推荐最优质的 AI 工具与资源，帮助你快速找到适合的 AI 产品。</p>
        <br />
        <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 2 }}>
          <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}>🎯 核心功能</div>
          <ul style={{ paddingLeft: 20, marginBottom: 12 }}>
            <li>实时更新的 AI 工具资源库（{RESOURCES.length} 个资源）</li>
            <li>内置 AI 对话助手（需配置 OpenAI API Key）</li>
            <li>支持流式响应，实时输出内容</li>
            <li>全站深色主题，优化阅读体验</li>
          </ul>
          <div style={{ color: '#e2e8f0', fontWeight: 600, marginBottom: 4 }}>🛠️ 技术栈</div>
          <ul style={{ paddingLeft: 20 }}>
            <li>前端：React + TypeScript + Vite</li>
            <li>样式：内联 CSS（零依赖）</li>
            <li>部署：GitHub Pages</li>
            <li>AI：OpenAI GPT-4o mini API</li>
          </ul>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#374151' }}>© 2026 AIHub · 开源免费 · 持续更新</div>
    </div>
  );
}

export default App;
