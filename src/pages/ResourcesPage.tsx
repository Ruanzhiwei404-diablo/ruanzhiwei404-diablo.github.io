import { useState } from 'react';
import { RESOURCES, CATEGORIES } from '../data/resources';

export default function ResourcesPage() {
  const [cat, setCat] = useState('全部');
  const [search, setSearch] = useState('');

  const filtered = RESOURCES.filter(r => {
    const mc = cat === '全部' || r.category === cat;
    const ms = !search || r.title.includes(search) || r.desc.includes(search) || r.tags.some(t => t.includes(search));
    return mc && ms;
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
        {['全部', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setCat(c)}
            style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12.5, fontWeight: 500, background: cat === c ? 'linear-gradient(135deg, #7c3aed, #db2777)' : 'rgba(255,255,255,0.05)', border: '1px solid ' + (cat === c ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'), color: cat === c ? '#fff' : '#9ca3af', cursor: 'pointer' }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
        {filtered.map((r, i) => (
          <a key={i} href={r.url} target="_blank" rel="noreferrer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18, textDecoration: 'none', display: 'block', transition: 'all 0.2s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(124,58,237,0.4)'; el.style.background = 'rgba(124,58,237,0.07)'; el.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.background = 'rgba(255,255,255,0.04)'; el.style.transform = ''; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div style={{ fontSize: 28 }}>{r.icon}</div>
              <div style={{ fontSize: 10, color: '#a855f7', background: 'rgba(168,85,247,0.12)', padding: '2px 8px', borderRadius: 6, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.category}</div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0', marginBottom: 5 }}>{r.title}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.65 }}>{r.desc}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {r.tags.map(t => <span key={t} style={{ fontSize: 10, color: '#a855f7', background: 'rgba(168,85,247,0.1)', padding: '2px 7px', borderRadius: 6 }}>{t}</span>)}
            </div>
          </a>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '60px 0', color: '#374151', fontSize: 14 }}>🔍 没有找到匹配的资源</div>}
    </div>
  );
}
