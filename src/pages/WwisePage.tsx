import { useState } from 'react';
import { Link } from 'react-router-dom';

const tabDefs = [
  { key: 'all', label: '全部', icon: 'M4 6h16M4 12h16M4 18h16' },
  { key: 'basics', label: '入门基础', color: '#06b6d4', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { key: 'containers', label: '容器系统', color: '#a855f7', icon: 'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16zM3.27 6.96L12 12.01l8.73-5.05M12 22.08V12' },
  { key: 'spatial', label: '空间音频', color: '#22c55e', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' },
  { key: 'music', label: '互动音乐', color: '#ec4899', icon: 'M9 18V5l12-2v13M9 18c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM21 16c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z' },
  { key: 'mixing', label: '混音技术', color: '#f59e0b', icon: 'M12 3v18M8 7c0-2.2 1.8-4 4-4s4 1.8 4 4M8 17c0 2.2 1.8 4 4 4s4-1.8 4-4M3 12h18M7 8c-2.2 0-4 1.8-4 4s1.8 4 4 4M17 8c2.2 0 4 1.8 4 4s-1.8 4-4 4' },
  { key: 'cases', label: '实战案例', color: '#ef4444', icon: 'M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z' },
  { key: 'qa', label: '常见问答', color: '#8b5cf6', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const modules = [
  {
    key: 'basics',
    title: '入门基础',
    emoji: '🚀',
    color: '#06b6d4',
    cards: [
      {
        emoji: '📥',
        title: 'Wwise 安装与环境配置',
        desc: '从 Audiokinetic 官网下载 Wwise Launcher，完成许可证激活、项目创建和初始工程目录结构搭建。',
        tags: ['安装', '配置', '入门'],
      },
      {
        emoji: '🏗️',
        title: '项目结构与工作流程',
        desc: '了解 Wwise 项目的标准工作流程：声音文件导入、对象层级构建、Event 创建、SoundBank 打包到游戏引擎集成。',
        tags: ['工作流', '项目管理', '入门'],
      },
      {
        emoji: '🎮',
        title: '游戏引擎集成概览',
        desc: 'Wwise 与 Unreal Engine、Unity 的集成方式对比，Wwise Picker、集成包安装、初始化配置步骤。',
        tags: ['UE', 'Unity', '集成'],
      },
      {
        emoji: '📊',
        title: 'SoundBank 打包与加载',
        desc: 'SoundBank 的生成策略、按需加载、内存管理以及在不同平台上的优化配置方案。',
        tags: ['SoundBank', '内存', '优化'],
      },
    ],
  },
  {
    key: 'containers',
    title: '容器系统',
    emoji: '📦',
    color: '#a855f7',
    cards: [
      {
        emoji: '🎲',
        title: 'Random Container 随机容器',
        desc: '使用随机容器实现音效变化，支持权重分配、避免连续重复、过渡时间等进阶设置。',
        tags: ['随机', '变化', '容器'],
      },
      {
        emoji: '🔀',
        title: 'Switch Container 切换容器',
        desc: '通过游戏状态切换不同的声音内容，如角色在不同地面材质上的脚步声自动切换。',
        tags: ['状态切换', '条件', '容器'],
      },
      {
        emoji: '🎶',
        title: 'Sequence Container 序列容器',
        desc: '按固定顺序或随机顺序播放声音序列，适用于对话系统、过场动画音效等场景。',
        tags: ['序列', '顺序播放', '容器'],
      },
      {
        emoji: '✂️',
        title: 'Blend Container 混合容器',
        desc: '多个声音的无缝混合过渡，常用于引擎声、天气系统等需要连续变化的声音设计。',
        tags: ['混合', '过渡', '容器'],
      },
    ],
  },
  {
    key: 'spatial',
    title: '空间音频',
    emoji: '🌐',
    color: '#22c55e',
    cards: [
      {
        emoji: '📍',
        title: '3D 空间定位基础',
        desc: '声音在 3D 空间中的定位原理：Position、Direction、Cone 设置，以及 Listener 的概念。',
        tags: ['3D', '定位', '空间'],
      },
      {
        emoji: '🏛️',
        title: 'Room 与 Portal 系统',
        desc: '使用 Room 和 Portal 模拟建筑空间的声学传播，实现门开关时声音自然变化的效果。',
        tags: ['Room', 'Portal', '声学'],
      },
      {
        emoji: '🧱',
        title: '障碍物与遮挡系统',
        desc: '声音传播中的障碍物遮挡效果设置，墙壁阻挡、距离衰减曲线调整等空间声学处理。',
        tags: ['遮挡', '障碍物', '衰减'],
      },
      {
        emoji: '🔊',
        title: 'Spatial Audio API',
        desc: 'Wwise Spatial Audio 的技术架构和 API 调用方式，与游戏引擎的深度集成方案。',
        tags: ['API', '集成', '技术'],
      },
    ],
  },
  {
    key: 'music',
    title: '互动音乐',
    emoji: '🎵',
    color: '#ec4899',
    cards: [
      {
        emoji: '🎼',
        title: '互动音乐系统架构',
        desc: 'Wwise 互动音乐的核心理念：Music Playlist、Music Segment、Music Track 的层级关系和工作方式。',
        tags: ['架构', '层级', '入门'],
      },
      {
        emoji: '🔄',
        title: 'State 驱动音乐切换',
        desc: '使用 Wwise State 实现战斗、探索、菜单等不同游戏状态间的音乐无缝切换与过渡。',
        tags: ['State', '切换', '过渡'],
      },
      {
        emoji: '🎺',
        title: 'Music Transition 音乐过渡',
        desc: '精细控制音乐片段之间的过渡方式：立即切换、淡入淡出、节拍对齐过渡等高级设置。',
        tags: ['过渡', '淡入淡出', '节拍'],
      },
      {
        emoji: '🎹',
        title: '分层音乐与自适应配乐',
        desc: '使用 Music Track 分层叠加实现紧张度渐变的自适应音乐系统，竖向与横向音乐设计方法。',
        tags: ['分层', '自适应', '紧张度'],
      },
    ],
  },
  {
    key: 'mixing',
    title: '混音技术',
    emoji: '🎛️',
    color: '#f59e0b',
    cards: [
      {
        emoji: '⚡',
        title: 'HDR 动态范围系统',
        desc: 'Wwise HDR System 的工作原理：响度归一化、动态压缩，让不同声音在混音中保持平衡。',
        tags: ['HDR', '响度', '动态'],
      },
      {
        emoji: '📉',
        title: 'Attenuation 衰减曲线',
        desc: '自定义声音的距离衰减曲线，球面衰减、基于形状的衰减，以及不同环境下的衰减策略。',
        tags: ['衰减', '距离', '曲线'],
      },
      {
        emoji: '🌳',
        title: '效果器链与插件',
        desc: 'Wwise 内置效果器（EQ、压缩、混响、延迟）的使用，以及第三方 VST/AU 插件的集成方法。',
        tags: ['效果器', 'EQ', '混响'],
      },
      {
        emoji: '🎚️',
        title: 'Mixing Session 混音会话',
        desc: '使用 Mixing Session 管理游戏内实时混音，游戏状态驱动的自动混音切换方案。',
        tags: ['混音', '会话', '自动化'],
      },
    ],
  },
];

const caseCards = [
  {
    source: 'Audiokinetic Blog',
    emoji: '🚶',
    title: '《死亡搁浅》的步行声音系统',
    desc: '小岛秀夫团队的音频总监分享如何用 Wwise 实现不同地形、不同负重下的脚步声变化系统。',
    tags: ['脚步声', '地形', '物理'],
  },
  {
    source: 'Game Audio Network',
    emoji: '🌌',
    title: '《原神》开放世界音频设计',
    desc: '米哈游音频团队对《原神》大世界环境声、区域音乐过渡系统的技术实现解析。',
    tags: ['开放世界', '环境声', '过渡'],
  },
  {
    source: 'GDC Talk',
    emoji: '🎵',
    title: '《战神：诸神黄昏》互动音乐',
    desc: 'Santa Monica Studio 如何在 Wwise 中构建北欧神话风格的互动音乐系统，战斗与探索的音乐切换。',
    tags: ['互动音乐', 'GDC', '战斗'],
  },
  {
    source: 'Audiokinetic Blog',
    emoji: '🔫',
    title: 'FPS 游戏武器射击音效系统',
    desc: '使用 Switch Container + RTPC 实现 FPS 游戏中枪械射击的材质反馈、距离变化和消音器切换。',
    tags: ['FPS', '武器', 'RTPC'],
  },
  {
    source: 'Unity Learn',
    emoji: '🎧',
    title: 'Unity + Wwise VR 音频实战',
    desc: '在 VR 项目中集成 Wwise 实现头相关传输函数(HRTF)空间音频，提升沉浸感。',
    tags: ['VR', 'HRTF', 'Unity'],
  },
  {
    source: 'UE Community',
    emoji: '🏄',
    title: '《黑神话：悟空》Boss 战音频解析',
    desc: '分析游戏中 Boss 战的动态混音策略、音乐与音效的协同设计、以及碰撞音效的实时生成。',
    tags: ['Boss战', '动态混音', '实时'],
  },
];

const qaList = [
  {
    q: 'Wwise 和 FMOD 有什么区别？',
    a: 'Wwise 是 Audiokinetic（索尼旗下）开发的音频中间件，与 PlayStation 深度集成；FMOD 是 Firelight Technologies 开发的独立中间件。Wwise 在大型 3A 项目中使用更广泛（如《死亡搁浅》《原神》），FMOD 则在独立游戏和中小型项目中更流行（如《空洞骑士》《茶杯头》）。Wwise 的互动音乐系统更强大，FMOD 的 DSP 效果器链更灵活。',
  },
  {
    q: 'Wwise 免费吗？如何获取许可证？',
    a: 'Wwise 对个人开发者和年收入低于一定门槛的独立团队免费（Wwise Indie 许可）。商业项目需要购买 Wwise SDK 许可证。通过 Wwise Launcher 登录后可自动激活对应许可证类型。注意 Wwise Indie 许可有设备数量限制。',
  },
  {
    q: '如何在 Wwise 中实现脚步声系统？',
    a: '典型方案：1) 创建 Switch Container，设置 Game Parameter（如地面材质 Surface_Type）作为 Switch；2) 为每种材质（石头、草地、木板等）创建子容器；3) 每个子容器内放 Random Container 包含多组脚步声变体；4) 游戏端通过 SetSwitch 接口切换材质，PostEvent 触发播放。',
  },
  {
    q: 'SoundBank 优化有哪些策略？',
    a: '1) 按场景/关卡拆分 SoundBank，按需加载；2) 使用 Streaming 而非 In Memory 处理大文件；3) 利用 Voice Count 限制同屏最大声音数；4) 使用 Virtual Voice 机制优先级管理；5) 定期审查未使用的音频资产并清理；6) 对环境音等长循环使用 loops+transition 避免重复加载。',
  },
  {
    q: 'Wwise 的 RTPC 是什么？',
    a: 'RTPC（Real-Time Parameter Control）是 Wwise 的实时参数控制机制。游戏端可以通过 SetRTPCValue 接口实时修改 Wwise 中的参数值，比如根据车速改变引擎声的 pitch、根据血量改变受伤音效的 intensity、根据环境大小改变混响的 decay time 等。',
  },
];

const stats = [
  { label: '技术模块', value: '5' },
  { label: '知识文档', value: '20' },
  { label: '实战案例', value: '6' },
  { label: '常见问答', value: '5' },
];

function ModuleSection({ mod }: { mod: typeof modules[0] }) {
  return (
    <div id={mod.key} className="mb-8 scroll-mt-36">
      {/* 模块标题 */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
          style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}30` }}
        >
          {mod.emoji}
        </div>
        <h2 className="text-lg font-bold" style={{ color: mod.color }}>
          {mod.title}
        </h2>
        <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${mod.color}30, transparent)` }} />
        <span className="text-xs text-gray-600">{mod.cards.length} 篇</span>
      </div>

      {/* 卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mod.cards.map((card, i) => (
          <div key={i} className="card p-4 relative overflow-hidden group">
            <div
              className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${mod.color}, transparent)` }}
            />
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{card.emoji}</span>
              <h3 className="text-sm font-bold text-text-bright">{card.title}</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-2.5">{card.desc}</p>
            <div className="flex flex-wrap gap-1.5">
              {card.tags.map((t, j) => (
                <span
                  key={j}
                  className="text-[10px] px-2 py-0.5 rounded border text-gray-500"
                  style={{ borderColor: `${mod.color}20`, background: `${mod.color}08` }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WwisePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQa, setExpandedQa] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const query = searchQuery.toLowerCase();

  const handleTabClick = (key: string) => {
    setActiveTab(key);
    if (key === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(key);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filteredModules = modules.map(mod => ({
    ...mod,
    cards: mod.cards.filter(card =>
      !query ||
      card.title.toLowerCase().includes(query) ||
      card.desc.toLowerCase().includes(query) ||
      card.tags.some(t => t.toLowerCase().includes(query))
    ),
  })).filter(mod => mod.cards.length > 0);

  const filteredCases = caseCards.filter(card =>
    !query ||
    card.title.toLowerCase().includes(query) ||
    card.desc.toLowerCase().includes(query) ||
    card.tags.some(t => t.toLowerCase().includes(query))
  );

  const filteredQa = qaList.filter(qa =>
    !query ||
    qa.q.toLowerCase().includes(query) ||
    qa.a.toLowerCase().includes(query)
  );

  const hasResults = filteredModules.length > 0 || filteredCases.length > 0 || filteredQa.length > 0;

  return (
    <div className="max-w-[860px] mx-auto py-8 px-6 w-full">
      {/* 面包屑导航 */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link to="/audio" className="hover:text-gray-300 transition-colors">音频设计中心</Link>
        <span>/</span>
        <span className="text-[#06b6d4]">Wwise 声音引擎</span>
      </nav>

      {/* 页面头部 */}
      <div className="mb-10">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl leading-none">⚙️</span>
          <div>
            <h1 className="text-5xl font-extrabold text-[#06b6d4] mb-3">
              Wwise 声音引擎
            </h1>
            <p className="text-sm text-gray-400 tracking-wide">
              专业游戏音频中间件知识库与设计师案例
            </p>
          </div>
        </div>
      </div>

      {/* 统计栏 */}
      <div className="flex flex-wrap gap-5 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="text-[#06b6d4] font-bold text-xl">{s.value}</span>
            <span className="text-gray-500">{s.label}</span>
          </div>
        ))}
      </div>

      {/* 搜索栏 */}
      <div className="mb-5">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="搜索文档、标签..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-3 text-base text-gray-200 placeholder-gray-600 outline-none focus:border-[#06b6d4]40 transition-colors"
          />
        </div>
      </div>

      {/* 标签导航 */}
      <div className="sticky top-16 z-10 -mx-6 px-6 pt-3 pb-3 bg-[#0a0a0f] border-b border-[rgba(255,255,255,0.04)] mb-8 flex gap-2 overflow-x-auto scrollbar-hide">
        {tabDefs.map(tab => {
          const isActive = activeTab === tab.key;
          const tabColor = tab.color || '#06b6d4';
          return (
            <button
              key={tab.key}
              onClick={() => handleTabClick(tab.key)}
              className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer"
              style={{
                borderColor: isActive ? `${tabColor}50` : 'rgba(255,255,255,0.06)',
                background: isActive ? `${tabColor}12` : 'transparent',
                color: isActive ? tabColor : '#6b7280',
                boxShadow: isActive ? `0 0 12px ${tabColor}15` : 'none',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={tab.icon} />
              </svg>
              {tab.label}
            </button>
          );
        })}
      </div>

      {!hasResults ? (
        <div className="text-center py-16 text-gray-600 text-sm">未找到匹配的内容</div>
      ) : (
        <>
          {/* 各技术模块 */}
          {filteredModules.map(mod => (
            <ModuleSection key={mod.key} mod={mod} />
          ))}

          {/* 实战案例 */}
          {filteredCases.length > 0 && (
            <div id="cases" className="mb-8 scroll-mt-36">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  style={{ background: '#ef444415', border: '1px solid #ef444430' }}
                >
                  💼
                </div>
                <h2 className="text-lg font-bold text-[#ef4444]">实战案例</h2>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #ef444430, transparent)' }} />
                <span className="text-xs text-gray-600">{filteredCases.length} 篇</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCases.map((card, i) => (
                  <div key={i} className="card p-4 relative overflow-hidden group">
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(90deg, #ef4444, transparent)' }}
                    />
                    <div className="text-[10px] text-gray-600 mb-1">来源: {card.source}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{card.emoji}</span>
                      <h3 className="text-sm font-bold text-text-bright">{card.title}</h3>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-2.5">{card.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {card.tags.map((t, j) => (
                        <span
                          key={j}
                          className="text-[10px] px-2 py-0.5 rounded border text-gray-500"
                          style={{ borderColor: '#ef444420', background: '#ef444408' }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 常见问答 */}
          {filteredQa.length > 0 && (
            <div id="qa" className="mb-8 scroll-mt-36">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-base"
                  style={{ background: '#8b5cf615', border: '1px solid #8b5cf630' }}
                >
                  ❓
                </div>
                <h2 className="text-lg font-bold text-[#8b5cf6]">常见问答</h2>
                <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #8b5cf630, transparent)' }} />
                <span className="text-xs text-gray-600">{filteredQa.length} 条</span>
              </div>
              <div className="flex flex-col gap-2">
                {filteredQa.map((qa, i) => (
                  <div
                    key={i}
                    className="card overflow-hidden cursor-pointer"
                    onClick={() => setExpandedQa(expandedQa === i ? null : i)}
                  >
                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm font-medium text-text-bright">{qa.q}</span>
                      <svg
                        className={`text-gray-500 transition-transform duration-200 flex-shrink-0 ml-2 ${expandedQa === i ? 'rotate-180' : ''}`}
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                    <div
                      className={`overflow-hidden transition-all duration-300 ${expandedQa === i ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="px-4 pb-4 text-xs text-gray-400 leading-relaxed border-t border-[rgba(255,255,255,0.04)] pt-3">
                        {qa.a}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 返回 */}
      <div className="text-center mt-4">
        <Link to="/audio" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
          ← 返回音频设计中心
        </Link>
      </div>
    </div>
  );
}
