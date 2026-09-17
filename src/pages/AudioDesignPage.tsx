import { useState } from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '音效管理中心',
    desc: '游戏音效资源的核心枢纽 — 从名词术语查询到专业音效检索软件 Soundminer 的使用指南，再到个人音效库的高效管理流程，一站式覆盖音效设计的全部需求。',
    tags: ['音效名词表', 'Soundminer 指南', '音效库管理'],
    link: '/audio/sound-effects',
    color: '#a855f7',
  },
  {
    title: '音乐百科全书',
    desc: '从基础乐理到专业制作技巧，覆盖音乐流派的全面知识体系。特别收录游戏音乐设计师手册，帮助你将音乐理论与游戏场景完美结合。',
    tags: ['音乐流派', '乐理基础', '制作技巧', '游戏音乐手册'],
    link: '/audio/music',
    extraLinks: [
      { label: '设计师手册', url: '/audio/music-handbook' },
    ],
    color: '#ec4899',
  },
  {
    title: 'Wwise 音频引擎',
    desc: '游戏音频中间件 Wwise 的技术文档中心 — 从项目初始配置到与游戏引擎（UE / Unity）的深度集成，再到性能优化的最佳实践经验。',
    tags: ['项目配置', '集成指南', '最佳实践'],
    link: '/audio/wwise',
    color: '#06b6d4',
  },
  {
    title: 'Synth Lab 声音合成器',
    desc: '探索 Web Audio 合成器的声音设计宇宙 — 拆解 CrystalPrism、TITAN_SUB 等在线合成器的参数架构与音色预设，为游戏音效设计提供即时灵感与原型参考。',
    tags: ['Web 合成器', '音色设计', '合成器参数'],
    link: '/audio/synth-lab',
    color: '#f59e0b',
  },
];

function AppIcon({ type }: { type: 'sfx' | 'music' | 'engine' | 'synth' | 'graph' }) {
  const gradients: Record<string, [string, string]> = {
    sfx: ['#a855f7', '#6d28d9'],
    music: ['#ec4899', '#e11d48'],
    engine: ['#06b6d4', '#0284c7'],
    synth: ['#f59e0b', '#d97706'],
    graph: ['#10b981', '#059669'],
  };
  const [c1, c2] = gradients[type];

  return (
    <div
      className="w-11 h-11 rounded-[11px] flex items-center justify-center flex-shrink-0 shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        boxShadow: `0 4px 14px ${c1}40`,
      }}
    >
      {type === 'sfx' && (
        <svg width="32" height="32" viewBox="0 0 22 22" fill="none">
          <path d="M8 11c0-1.7 1.3-3 3-3s3 1.3 3 3-1.3 3-3 3" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M5.5 11c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5-2.5 5.5-5.5 5.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" opacity=".7"/>
          <path d="M3 11c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8" stroke="white" strokeWidth="1.1" strokeLinecap="round" opacity=".4"/>
        </svg>
      )}
      {type === 'music' && (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M9 18V5l12-2v13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="6" cy="18" r="3" stroke="white" strokeWidth="1.8"/>
          <circle cx="18" cy="16" r="3" stroke="white" strokeWidth="1.8"/>
        </svg>
      )}
      {type === 'engine' && (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="white" strokeWidth="1.6"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {type === 'synth' && (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="8" width="2" height="8" rx="1" fill="white" opacity=".4"/>
          <rect x="7" y="5" width="2" height="14" rx="1" fill="white" opacity=".6"/>
          <rect x="11" y="3" width="2" height="18" rx="1" fill="white" opacity=".8"/>
          <rect x="15" y="6" width="2" height="12" rx="1" fill="white" opacity=".7"/>
          <rect x="19" y="9" width="2" height="6" rx="1" fill="white" opacity=".5"/>
          <path d="M3.5 10l3.5 3.5L3.5 17" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity=".3"/>
          <path d="M20.5 10l-3.5 3.5 3.5 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity=".3"/>
        </svg>
      )}
      {type === 'graph' && (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <circle cx="8" cy="8" r="3" stroke="white" strokeWidth="1.5" opacity=".9"/>
          <circle cx="16" cy="8" r="3" stroke="white" strokeWidth="1.5" opacity=".7"/>
          <circle cx="12" cy="16" r="3" stroke="white" strokeWidth="1.5" opacity=".8"/>
          <path d="M10.5 9.5L13.5 9.5" stroke="white" strokeWidth="1.2" opacity=".5"/>
          <path d="M9.5 10.5L11 14" stroke="white" strokeWidth="1.2" opacity=".5"/>
          <path d="M14.5 10.5L13 14" stroke="white" strokeWidth="1.2" opacity=".5"/>
        </svg>
      )}
    </div>
  );
}

const iconMap = ['sfx', 'music', 'engine', 'synth'] as const;

export default function AudioDesignPage() {
  const [musicOn, setMusicOn] = useState(false);

  return (
    <div className="max-w-[800px] mx-auto py-8 px-6 w-full">
      {/* 页面头部 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5">
          🎧 音频设计中心
        </h1>
        <p className="text-[13.5px] text-gray-500">
          为游戏音频设计师打造的专业资讯导航
        </p>
      </div>

      {/* 分区卡片 */}
      <div className="flex flex-col gap-5">
        {sections.map((s, i) => (
          <div
            key={i}
            className="card p-6 relative overflow-hidden group"
          >
            {/* 顶部色条 */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }}
            />

            {/* 图标 + 标题 */}
            <div className="flex items-center gap-3 mb-4">
              <AppIcon type={iconMap[i]} />
              <h2
                className="text-lg font-bold"
                style={{
                  borderBottom: `2px solid ${s.color}40`,
                  paddingBottom: '4px',
                  color: s.color,
                }}
              >
                {s.title}
              </h2>
            </div>

            {/* 描述 */}
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              {s.desc}
            </p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2.5 mb-5">
              {s.tags.map((t, j) => (
                <span
                  key={j}
                  className="text-xs px-3 py-1.5 rounded-lg border transition-all duration-200 hover:scale-[1.03]"
                  style={{
                    borderColor: `${s.color}25`,
                    background: `${s.color}08`,
                    color: `${s.color}cc`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* 进入链接 */}
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                to={s.link}
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:gap-2.5"
                style={{ color: s.color }}
              >
                进入 →
              </Link>
              {'extraLinks' in s && s.extraLinks && (
                <>
                  {s.extraLinks.map((el) => (
                    <Link
                      key={el.label}
                      to={el.url}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-lg transition-all duration-200 hover:scale-[1.03]"
                      style={{
                        borderColor: `${s.color}25`,
                        background: `${s.color}12`,
                        color: `${s.color}cc`,
                        border: `1px solid ${s.color}25`,
                      }}
                    >
                      📖 {el.label}
                    </Link>
                  ))}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 相关板块 — 跨域入口，弱化呈现以区别于上方 /audio 子页面 */}
      <div className="mt-10 pt-6 border-t border-[rgba(255,255,255,0.06)]">
        <div className="text-[11px] text-gray-600 mb-3 tracking-wide">相关板块</div>
        <Link
          to="/music"
          className="flex items-center gap-3.5 p-4 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.015)] no-underline transition-all duration-200 hover:bg-[rgba(16,185,129,0.05)] hover:border-[#10b98140] group"
        >
          <AppIcon type="graph" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-300 group-hover:text-[#10b981] transition-colors">
              音乐图谱
            </div>
            <div className="text-xs text-gray-600 mt-0.5">
              基于 MusicBrainz 的乐器 → 艺人 → 录音 → 流派四层知识网络
            </div>
          </div>
          <span className="text-xs text-gray-600 group-hover:text-[#10b981] transition-colors shrink-0">
            进入 →
          </span>
        </Link>
      </div>

      {/* 底部音乐控制 */}
      <div className="mt-10 text-center">
        <button
          onClick={() => setMusicOn(!musicOn)}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors cursor-pointer px-4 py-2 rounded-xl border border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.12)]"
        >
          {musicOn ? '🔊 背景音乐' : '🔇 开启音乐'}
        </button>
      </div>
    </div>
  );
}
