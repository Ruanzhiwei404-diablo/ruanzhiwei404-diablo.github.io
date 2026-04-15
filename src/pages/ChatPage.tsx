import { useState, useEffect, useRef, useCallback } from 'react';
import type { Message } from '../data/resources';
import { generateId, formatTime } from '../data/resources';
import SiriWave from '../components/SiriWave';

export default function ChatPage() {
  const apiKey = localStorage.getItem('openai_api_key') || '';
  const baseUrl = localStorage.getItem('openai_base_url') || 'https://api.openai.com/v1';
  const model = localStorage.getItem('openai_model') || 'Qwen/Qwen2.5-7B-Instruct';

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
      setMsgs(prev => [...prev, { id: generateId(), role: 'assistant', time: formatTime(), content: '⚠️ 尚未配置 API Key。\n\n请先点击右上角「未配置」按钮填入你的 API Key。' }]);
      return;
    }

    try {
      const res = await fetch(baseUrl + '/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + apiKey },
        body: JSON.stringify({ model, messages: [...msgs.map(m => ({ role: m.role, content: m.content })), { role: 'user', content: txt }], stream: true }),
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
          } catch { /* skip */ }
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMsgs(prev => [...prev, { id: generateId(), role: 'assistant', time: formatTime(), content: '❌ ' + msg }]);
    } finally { setLoad(false); }
  }, [inp, load, apiKey, baseUrl, model, msgs]);

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
    <div className="flex-1 flex max-w-[1100px] w-full mx-auto px-4 min-h-0">
      {/* 侧栏 */}
      <div className="w-52 py-4 px-3 border-r border-[rgba(255,255,255,0.05)] flex flex-col gap-1.5 overflow-y-auto shrink-0">
        <button
          onClick={clear}
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl py-2 px-3 text-gray-400 text-xs cursor-pointer text-left flex items-center gap-1.5 hover:bg-[rgba(255,255,255,0.07)] transition-colors"
        >
          <span>➕</span> 新对话
        </button>
        <div className="mt-3 flex-1">
          <div className="text-[10px] text-gray-800 font-bold uppercase tracking-[1.5px] px-2 mb-1.5">最近</div>
          {msgs.filter(m => m.role === 'user').slice(-6).reverse().map(m => (
            <div key={m.id} className="text-xs text-gray-500 py-1 px-2 rounded-lg truncate">
              {m.content.slice(0, 22) + (m.content.length > 22 ? '…' : '')}
            </div>
          ))}
          {msgs.filter(m => m.role === 'user').length === 0 && <div className="text-xs text-gray-800 px-2">暂无记录</div>}
        </div>
      </div>

      {/* 主区域 */}
      <div className="flex-1 flex flex-col px-5 min-w-0">
        {msgs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10">
            <SiriWave />
            <div className="text-xl font-bold text-text-bright mb-2">because AI 对话助手</div>
            <div className="text-[13px] text-gray-500 leading-loose">
              基于大语言模型，支持声音创作、编曲、AI 技术咨询等<br />
              <span className="text-[11.5px] text-gray-600">按 Enter 发送，Shift+Enter 换行</span>
            </div>
            <div className="flex gap-2.5 flex-wrap justify-center mt-6">
              {presets.map((q, i) => (
                <button
                  key={i}
                  onClick={() => setInp(q)}
                  className="bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-full px-4 py-1.5 text-gray-400 text-xs cursor-pointer transition-all duration-200 hover:border-purple-500/40 hover:text-purple-400"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col gap-3.5 mt-4 mb-3">
            {msgs.map(m => (
              <div key={m.id} className={`flex gap-2.5 items-start ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-[30px] h-[30px] rounded-lg shrink-0 flex items-center justify-center text-[13px] ${m.role === 'user' ? 'gradient-primary' : 'bg-[rgba(255,255,255,0.08)]'}`}>
                  {m.role === 'user' ? '👤' : '🤖'}
                </div>
                <div
                  className={`max-w-[72%] px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-wrap break-words ${
                    m.role === 'user'
                      ? 'bg-[linear-gradient(135deg,#312e81,#4c1d95)] text-white'
                      : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.06)] text-gray-200'
                  }`}
                >
                  {renderMsg(m.content)}
                </div>
              </div>
            ))}
            <div ref={brem} />
          </div>
        )}

        {/* 输入框 */}
        <div className="border border-[rgba(255,255,255,0.08)] rounded-xl bg-[rgba(255,255,255,0.04)] flex items-end gap-2 px-3.5 py-2 mb-4">
          <textarea
            value={inp}
            onChange={e => setInp(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="输入问题…"
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-gray-200 text-[13.5px] leading-relaxed resize-none max-h-[120px] overflow-y-auto"
          />
          <button
            onClick={send}
            disabled={!inp.trim() || load}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm border-none cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
            style={{
              background: inp.trim() && !load ? 'linear-gradient(135deg, #7c3aed, #db2777)' : 'rgba(255,255,255,0.06)',
            }}
          >
            {load ? '⏳' : '↑'}
          </button>
        </div>
      </div>
    </div>
  );
}
