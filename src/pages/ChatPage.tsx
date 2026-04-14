import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../data/resources';
import { generateId, formatTime } from '../data/resources';

export default function ChatPage({ apiKey }: { apiKey: string }) {
  const [msgs, setMsgs] = useState<Message[]>(() => { try { return JSON.parse(localStorage.getItem('c_msgs') || '[]'); } catch { return []; } });
  const [inp, setInp] = useState('');
  const [load, setLoad] = useState(false);
  const brem = useRef<HTMLDivElement>(null);

  useEffect(() => { localStorage.setItem('c_msgs', JSON.stringify(msgs)); }, [msgs]);
  useEffect(() => { brem.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = useCallback(async () => {
    if (!inp.trim() || load) return;
    const um: Message = { id: generateId(), role: 'user', content: inp.trim(), time: formatTime() };
    setMsgs(prev => [...prev, um]);
    const txt = inp.trim();
    setInp('');
    setLoad(true);

    if (!apiKey) {
      await new Promise(r => setTimeout(r, 800));
      setLoad(false);
      setMsgs(prev => [...prev, { id: generateId(), role: 'assistant', time: formatTime(), content: '⚠️ 尚未配置 API Key。\n\n请先点击右上角「未配置」按钮填入你的 OpenAI API Key。\n\n获取方式：打开 https://platform.openai.com/api-keys 创建 key' }]);
      return;
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey },
        body: JSON.stringify({ model: 'gpt-4o-mini', messages: [...msgs.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: txt }], stream: true }),
      });
      if (!res.ok) throw new Error('API 请求失败 (' + res.status + ')');
      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应');
      let content = '';
      const am: Message = { id: generateId(), role: 'assistant', content: '', time: formatTime() };
      setMsgs(prev => [...prev, am]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text2 = new TextDecoder().decode(value);
        for (const line of text2.split('\n')) {
          const d = line.trim();
          if (!d.startsWith('data: ') || d === 'data: [DONE]') continue;
          try {
            const delta = JSON.parse(d.slice(6)).choices?.[0]?.delta?.content;
            if (delta) { content += delta; setMsgs(prev => prev.map(m => m.id === am.id ? { ...m, content } : m)); }
          } catch {}
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMsgs(prev => [...prev, { id: generateId(), role: 'assistant', time: formatTime(), content: '❌ ' + msg }]);
    } finally { setLoad(false); }
  }, [inp, load, apiKey, msgs]);

  const clear = () => { setMsgs([]); localStorage.removeItem('c_msgs'); };

  const presets = ['帮我写一段 AI 声音克隆的简介', '解释一下声音合成的原理', '推荐几个 AI 音乐创作工具', '用文字描述一段史诗级编曲'];

  const renderMsg = (text: string) => {
    const html = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:1px 5px;border-radius:4px;font-family:monospace;font-size:0.9em">$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" style="color:#a855f7;text-decoration:none">$1</a>')
      .replace(/^- (.+)$/gm, '<div style="padding-left:12px;margin:1px 0">• $1</div>')
      .replace(/^(\d+)\. (.+)$/gm, '<div style="padding-left:12px;margin:1px 0">$1. $2</div>');
    return html.split('\n').map((line, i) => <div key={i} dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }} />);
  };

  return (
    <div style={{ flex: 1, display: 'flex', maxWidth: 1100, width: '100%', margin: '0 auto', padding: '0 16px', minHeight: 0 }}>
      <div style={{ width: 220, padding: '16px 12px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
        <button onClick={clear} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '8px 12px', color: '#9ca3af', fontSize: 12.5, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 7 }}>
          <span>➕</span> 新对话
        </button>
        <div style={{ marginTop: 12, flex: 1 }}>
          <div style={{ fontSize: 10, color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', padding: '0 8px', marginBottom: 6 }}>最近</div>
          {msgs.filter(m => m.role === 'user').slice(-6).reverse().map(m => (
            <div key={m.id} style={{ fontSize: 12, color: '#6b7280', padding: '5px 8px', borderRadius: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {m.content.slice(0, 22) + (m.content.length > 22 ? '…' : '')}
            </div>
          ))}
          {msgs.filter(m => m.role === 'user').length === 0 && <div style={{ fontSize: 12, color: '#374151', padding: '4px 8px' }}>暂无记录</div>}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px', minWidth: 0 }}>
        {msgs.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎵</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Sing+ AI 对话助手</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 2 }}>
              基于 GPT-4o mini，支持声音创作、编曲、AI 技术咨询等<br />
              <span style={{ fontSize: 11.5, color: '#4b5563' }}>按 Enter 发送，Shift+Enter 换行</span>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 24 }}>
              {presets.map((q, i) => (
                <button key={i} onClick={() => setInp(q)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '6px 16px', color: '#9ca3af', fontSize: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(124,58,237,0.4)'; el.style.color = '#c084fc'; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.color = '#9ca3af'; }}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14, marginTop: 16, marginBottom: 12 }}>
            {msgs.map(m => (
              <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, flexShrink: 0, background: m.role === 'user' ? 'linear-gradient(135deg, #7c3aed, #db2777)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                  {m.role === 'user' ? '👤' : '🤖'}
                </div>
                <div style={{ maxWidth: '72%', padding: '12px 16px', borderRadius: 14, background: m.role === 'user' ? 'linear-gradient(135deg, #312e81, #4c1d95)' : 'rgba(255,255,255,0.05)', border: m.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: 13.5, lineHeight: 1.75, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {renderMsg(m.content)}
                </div>
              </div>
            ))}
            <div ref={brem} />
          </div>
        )}

        <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'flex-end', gap: 8, padding: '8px 14px', marginBottom: 16 }}>
          <textarea value={inp} onChange={e => setInp(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
            placeholder="输入问题…" rows={1}
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#e2e8f0', fontSize: 13.5, lineHeight: 1.6, resize: 'none', maxHeight: 120, overflowY: 'auto' }} />
          <button onClick={send} disabled={!inp.trim() || load}
            style={{ width: 32, height: 32, borderRadius: 8, background: inp.trim() && !load ? 'linear-gradient(135deg, #7c3aed, #db2777)' : 'rgba(255,255,255,0.06)', border: 'none', color: '#fff', fontSize: 14, cursor: inp.trim() && !load ? 'pointer' : 'not-allowed', opacity: inp.trim() && !load ? 1 : 0.4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {load ? '⏳' : '↑'}
          </button>
        </div>
      </div>
    </div>
  );
}
