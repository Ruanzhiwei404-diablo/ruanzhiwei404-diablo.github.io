import { useState } from 'react';
import { Link } from 'react-router-dom';

const sections = [
  {
    title: '游戏类型大全',
    desc: '从经典 RPG 到开放世界，从像素独立到 3A 大作 — 全面梳理游戏类型的发展脉络与核心设计要素。每种类型配以代表作、设计特点、玩家体验分析，帮助你快速建立游戏类型的知识体系。',
    tags: ['RPG', '动作冒险', '策略模拟', 'FPS射击', '独立游戏'],
    link: '/game/world',
    color: '#f59e0b',
    iconType: 'genres' as const,
  },
  {
    title: '游戏引擎技术',
    desc: 'Unreal Engine、Unity、Godot 三大引擎深度对比 — 从渲染管线到物理系统，从蓝图脚本到 shader 编程。无论你是策划、美术还是程序，都能找到适合你的引擎学习路径。',
    tags: ['UE5', 'Unity', 'Godot', '渲染技术', '蓝图/脚本'],
    link: '/game/engines',
    color: '#3b82f6',
    iconType: 'engine' as const,
  },
  {
    title: '游戏音频设计',
    desc: '游戏音频的专业知识入口 — 覆盖 Wwise/FMOD 中间件、互动音乐系统、音效设计流程、3D 空间音频等核心领域。从概念到实战，帮助你掌握游戏音频设计的完整技能树。',
    tags: ['Wwise', 'FMOD', '互动音乐', '3D音频', '音效设计'],
    link: '/audio/sound-effects',
    color: '#a855f7',
    iconType: 'audio' as const,
  },
  {
    title: '游戏开发流程',
    desc: '从概念原型到上线运营的完整开发流程 — 涵盖策划文档、原型设计、敏捷开发、QA 测试、版本管理等关键环节。附带实用的项目管理模板和团队协作经验分享。',
    tags: ['策划文档', '原型设计', '敏捷开发', 'QA测试', '版本管理'],
    link: '/game/workflow',
    color: '#22c55e',
    iconType: 'workflow' as const,
  },
  {
    title: '游戏行业洞察',
    desc: '全球游戏行业趋势分析 — 年度市场报告、热门品类数据、平台分发策略、商业模式演进。用数据驱动的方式理解玩家行为、市场竞争与技术浪潮。',
    tags: ['市场报告', '品类趋势', '平台分析', '商业模式', '玩家行为'],
    link: '/game/insights',
    color: '#ef4444',
    iconType: 'insight' as const,
  },
];

const GRADIENTS: Record<string, [string, string]> = {
  genres: ['#f59e0b', '#d97706'],
  engine: ['#3b82f6', '#2563eb'],
  audio: ['#a855f7', '#7c3aed'],
  workflow: ['#22c55e', '#16a34a'],
  insight: ['#ef4444', '#dc2626'],
};

function SectionIcon({ type }: { type: string }) {
  const [c1, c2] = GRADIENTS[type] || ['#f59e0b', '#d97706'];

  return (
    <div
      className="w-11 h-11 rounded-[11px] flex items-center justify-center flex-shrink-0 shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${c1}, ${c2})`,
        boxShadow: `0 4px 14px ${c1}40`,
      }}
    >
      {type === 'genres' && (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="1.6"/>
          <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="1.6"/>
          <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="1.6"/>
          <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="1.6"/>
        </svg>
      )}
      {type === 'engine' && (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
      {type === 'audio' && (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M11 5L6 9H2v6h4l5 4V5z" stroke="white" strokeWidth="1.6" strokeLinejoin="round"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
      )}
      {type === 'workflow' && (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.6"/>
        </svg>
      )}
      {type === 'insight' && (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6c0-1.2 4-6 9-6s9 4.8 9 6z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="2.5" stroke="white" strokeWidth="1.6"/>
        </svg>
      )}
    </div>
  );
}

export default function GameEncyclopediaPage() {
  const [, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="max-w-[800px] mx-auto py-8 px-6 w-full">
      {/* 页面头部 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5">
          🎮 游戏百科
        </h1>
        <p className="text-[13.5px] text-gray-500">
          从类型、引擎、音频到行业 — 游戏开发者的全景知识库
        </p>
      </div>

      {/* 分区卡片 */}
      <div className="flex flex-col gap-5">
        {sections.map((s, i) => (
          <div
            key={i}
            className="card p-6 relative overflow-hidden group transition-all duration-300"
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* 顶部色条 */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${s.color}, transparent)` }}
            />

            {/* 背景装饰 */}
            <div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500"
              style={{ background: s.color }}
            />

            {/* 图标 + 标题 */}
            <div className="flex items-center gap-3 mb-4">
              <SectionIcon type={s.iconType} />
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
            <Link
              to={s.link}
              className="inline-flex items-center gap-1.5 text-sm font-medium transition-all duration-200 hover:gap-2.5"
              style={{ color: s.color }}
            >
              进入 →
            </Link>
          </div>
        ))}
      </div>

      {/* 底部说明 */}
      <div className="mt-10 text-center">
        <p className="text-xs text-gray-600">
          持续更新中 · 内容覆盖游戏开发全链路知识
        </p>
      </div>
    </div>
  );
}
