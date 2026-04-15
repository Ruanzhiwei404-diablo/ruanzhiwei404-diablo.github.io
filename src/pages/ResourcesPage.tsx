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
    <div className="max-w-[960px] mx-auto py-8 px-6 w-full">
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5">🧭 AI 资源导航</h1>
        <p className="text-[13.5px] text-gray-500">收录全网优质 AI 工具，持续更新 · 共 {RESOURCES.length} 个资源</p>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="搜索工具名称或标签…"
        className="w-full px-4 py-2.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded-xl text-gray-200 text-[13.5px] outline-none mb-4 focus:border-purple-500/40 transition-colors"
      />

      <div className="flex gap-2 flex-wrap mb-6">
        {['全部', ...CATEGORIES].map(c => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all duration-200 ${
              cat === c
                ? 'gradient-primary border-purple-500/40 text-white'
                : 'bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.08)] text-gray-400 hover:bg-[rgba(255,255,255,0.08)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((r, i) => (
          <a
            key={i}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="card p-[18px] no-underline block"
          >
            <div className="flex justify-between items-start mb-2.5">
              <div className="text-[28px]">{r.icon}</div>
              <div className="text-[10px] text-purple-400 bg-[rgba(168,85,247,0.12)] px-2 py-0.5 rounded-md font-semibold whitespace-nowrap">{r.category}</div>
            </div>
            <div className="text-sm font-bold text-gray-200 mb-1.5">{r.title}</div>
            <div className="text-xs text-gray-400 leading-relaxed">{r.desc}</div>
            <div className="flex gap-1.5 flex-wrap mt-2.5">
              {r.tags.map(t => (
                <span key={t} className="text-[10px] text-purple-400 bg-[rgba(168,85,247,0.1)] px-1.5 py-0.5 rounded-md">{t}</span>
              ))}
            </div>
          </a>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-800 text-sm">🔍 没有找到匹配的资源</div>
      )}
    </div>
  );
}
