import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────── 配色 ─────────────────── */
const COLOR = '#a855f7'; // 紫色，与 AudioDesignPage 入口一致

/* ─────────────────── 分类定义 ─────────────────── */
const SECTION_COLORS: Record<string, string> = {
  tools: '#a855f7',
  ucs: '#06b6d4',
  workflow: '#22c55e',
  naming: '#f59e0b',
  library: '#ef4444',
  glossary: '#ec4899',
};

/* ─────────────────── 数据：功能卡片 ─────────────────── */
const toolCards = [
  {
    key: 'soundminer',
    icon: '🔧',
    title: 'Soundminer 完全指南',
    subtitle: '专业音效检索软件中文文档',
    color: '#a855f7',
    isNew: false,
    tags: ['📚 7大章节', '🔍 大白话搜索', '🔗 DAW集成'],
    desc: '专业音效管理软件中文完整文档，涵盖 Basic / Plus / Pro 三版本，从基础操作到高级搜索、DAW 集成与音频处理工作流，是音效设计师必备的工具手册。',
    features: ['资产导入与库管理', '高级元数据搜索', 'Protools / Reaper 集成', '批量音频处理', '自定义标签体系'],
    link: null,
  },
  {
    key: 'ucs-glossary',
    icon: '📖',
    title: '国际音效名词表',
    subtitle: 'UCS 8.2 标准 · 23 大类 188 子类',
    color: '#06b6d4',
    isNew: false,
    tags: ['🎯 23大类/188子类', '🌐 UCS 8.2标准', '🔍 中文搜索'],
    desc: '基于 UCS（Universal Category System）8.2 国际标准，完整收录 23 大类 188 个子类音效分类，支持中文关键词搜索，附 CatID 命名规范，是音效命名与分类的权威参考。',
    features: ['完整 UCS 8.2 分类树', 'CatID 命名规范', '中英双语对照', '子类说明与示例', '快速搜索过滤'],
    link: null,
  },
  {
    key: 'translator',
    icon: '🌐',
    title: '音频术语翻译助手',
    subtitle: '离线可用 · 中英互译',
    color: '#22c55e',
    isNew: false,
    tags: ['📄 离线可用', '🎯 60+ 术语', '🔄 中英互译'],
    desc: '专为音频设计师打造的离线术语翻译工具，内置 60+ 条专业音频术语，中英互译，一键复制，无需网络。覆盖 Wwise、Pro Tools、Soundminer 等专业软件常见词汇。',
    features: ['60+ 专业术语库', 'Wwise / Pro Tools 词汇', '一键复制结果', '离线本地运行', '支持模糊匹配'],
    link: null,
  },
  {
    key: 'prism',
    icon: '🔮',
    title: 'PRISM 合成器',
    subtitle: '物理建模 · 水晶音色',
    color: '#8b5cf6',
    isNew: false,
    tags: ['🔮 物理建模', '🎛️ 8参数维度', '📤 导出WAV'],
    desc: '基于物理建模算法的音色合成器，模拟水晶、风铃、玻璃等共鸣体的自然音色。6 种水晶模型、8 个参数维度，实时可视化，支持导出 WAV 格式用于音效制作。',
    features: ['6种水晶共鸣模型', '8参数实时调节', '实时频谱可视化', '导出 WAV 格式', '适合UI音效制作'],
    link: null,
  },
  {
    key: 'alien-synth',
    icon: '👽',
    title: '外星语言合成器',
    subtitle: '多振荡器 · 实时演奏',
    color: '#ef4444',
    isNew: true,
    tags: ['🎛️ 5振荡器', '🎹 实时演奏', '📤 录音导出'],
    desc: '基于《挽救计划》洛基语言设计的音色合成器，多振荡器合成引擎，支持实时键盘演奏与参数调节，可录音导出。适合制作科幻、外星、机械等异世界音效。',
    features: ['5振荡器并联合成', '实时键盘映射演奏', '可调谐滤波器', '内置效果器链', '录音一键导出'],
    link: null,
  },
  {
    key: 'instrument-synth',
    icon: '🎹',
    title: '乐器语言合成器',
    subtitle: '文字转演奏 · 情感分析',
    color: '#f59e0b',
    isNew: true,
    tags: ['🎹 6种乐器', '🎵 情感分析', '🔊 实时合成'],
    desc: '输入文字自动转换为对应乐器演奏，内置 6 种音色（钢琴 / 吉他 / 长笛 / 木琴 / 小号 / 合成器），自动分析情感语气并匹配演奏风格。适合快速生成背景音效素材。',
    features: ['6种乐器音色', '自动情感语气识别', '演奏速度/力度调节', '实时合成输出', '适合原型设计验证'],
    link: null,
  },
];

/* ─────────────────── 数据：UCS 分类 ─────────────────── */
const ucsSections = [
  {
    key: 'ucs',
    label: 'UCS 音效分类系统',
    color: '#06b6d4',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    categories: [
      { catId: 'AMB', name: '环境音', en: 'Ambience', sub: 18, desc: '自然与城市环境背景音效，包含室内/室外场景音层。' },
      { catId: 'ANI', name: '动物', en: 'Animals', sub: 12, desc: '各类动物叫声与行为音效，含野生动物、家禽、昆虫。' },
      { catId: 'BDY', name: '人体', en: 'Body', sub: 10, desc: '人体运动、关节、呼吸、心跳等生理音效。' },
      { catId: 'CMB', name: '战斗', en: 'Combat', sub: 14, desc: '近战、格斗、击打、防御等战斗行为音效。' },
      { catId: 'DES', name: '破坏', en: 'Destruction', sub: 11, desc: '爆炸、碰撞、破碎、坍塌等破坏性事件音效。' },
      { catId: 'ELE', name: '电子', en: 'Electronic', sub: 9, desc: '电流、机械、数字界面、设备操作等电子音效。' },
      { catId: 'EXP', name: '爆炸', en: 'Explosion', sub: 8, desc: '各类爆炸、烟火、冲击波音效，分室内/室外规模。' },
      { catId: 'FOL', name: '拟音', en: 'Foley', sub: 16, desc: '脚步声、衣物摩擦、道具碰触等传统拟音类音效。' },
      { catId: 'GUN', name: '枪械', en: 'Guns', sub: 15, desc: '手枪、步枪、霰弹枪等各类枪械机械音与射击音效。' },
      { catId: 'HIT', name: '打击', en: 'Hits & Impacts', sub: 10, desc: '通用打击、冲击、碰撞等力量感音效。' },
      { catId: 'HUM', name: '人声', en: 'Human Vocalizations', sub: 13, desc: '非语言人声：叫喊、笑声、哭泣、呼吸等情绪音效。' },
      { catId: 'INT', name: '界面', en: 'Interface', sub: 11, desc: 'UI 点击、通知、状态切换等数字界面交互音效。' },
      { catId: 'LND', name: '景观', en: 'Landscapes', sub: 7, desc: '山川、海洋、森林等大自然景观的背景氛围音效。' },
      { catId: 'MAG', name: '魔法', en: 'Magic', sub: 9, desc: '法术施放、能量释放、魔法效果等奇幻类音效。' },
      { catId: 'MSC', name: '杂项', en: 'Miscellaneous', sub: 6, desc: '不适合其他分类的通用音效素材。' },
      { catId: 'MUS', name: '乐器', en: 'Musical Instruments', sub: 12, desc: '原声乐器单音、技法、采样类音效素材。' },
      { catId: 'SCI', name: '科幻', en: 'Science Fiction', sub: 10, desc: '未来科技、太空、能量武器等科幻元素音效。' },
      { catId: 'SPC', name: '空间', en: 'Space', sub: 8, desc: '太空环境、飞行器、宇宙氛围等场景音效。' },
      { catId: 'SRF', name: '表面', en: 'Surfaces', sub: 14, desc: '不同材质表面接触：金属、木材、布料、玻璃等。' },
      { catId: 'TRN', name: '交通', en: 'Transportation', sub: 16, desc: '汽车、飞机、船舶、列车等各类交通工具音效。' },
      { catId: 'VHC', name: '载具', en: 'Vehicles', sub: 14, desc: '载具内外机械、启动、运行、刹车等细分音效。' },
      { catId: 'WPN', name: '武器', en: 'Weapons', sub: 13, desc: '近战、投掷、冷兵器等非枪械武器类音效。' },
      { catId: 'WTR', name: '水体', en: 'Water', sub: 10, desc: '雨水、河流、海浪、滴水等各种水体相关音效。' },
    ],
  },
];

/* ─────────────────── 数据：命名规范 ─────────────────── */
const namingRules = [
  {
    title: 'UCS 标准命名格式',
    color: '#f59e0b',
    format: 'CatID_SubID_Description_Variation.wav',
    example: 'FOL_Footsteps_Stone_Walk_01.wav',
    fields: [
      { label: 'CatID', desc: '大类缩写（3位大写字母），如 FOL = Foley' },
      { label: 'SubID', desc: '子类缩写，如 Footsteps' },
      { label: 'Description', desc: '音效描述，使用下划线连接单词' },
      { label: 'Variation', desc: '变体编号，2位数字，如 01 / 02' },
    ],
  },
  {
    title: 'Wwise 事件命名规范',
    color: '#a855f7',
    format: 'Action_Object_Variant',
    example: 'Play_Footstep_Stone_Hard',
    fields: [
      { label: 'Action', desc: '触发动作前缀：Play / Stop / Pause / Set' },
      { label: 'Object', desc: '音效对象名称，首字母大写驼峰命名' },
      { label: 'Variant', desc: '材质/状态/强度等修饰词' },
    ],
  },
  {
    title: '项目内部规范（推荐）',
    color: '#22c55e',
    format: 'ProjectCode_Category_Description_v01',
    example: 'ToS_Footstep_Stone_Hard_v01',
    fields: [
      { label: 'ProjectCode', desc: '项目缩写，如 ToS = Tower of Sanctum' },
      { label: 'Category', desc: '对应 UCS 大类或自定义分类' },
      { label: 'Description', desc: '简洁描述，3-5个英文单词' },
      { label: 'v01', desc: '版本号，修改后递增' },
    ],
  },
];

/* ─────────────────── 数据：工作流 ─────────────────── */
const workflowSteps = [
  {
    step: '01',
    title: '采集 / 购买',
    color: '#06b6d4',
    icon: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z',
    items: ['现场录音（Sound Devices / Zoom）', '购买商业音效库（Boom Library / SoundSnap）', 'Freesound 免费素材', '游戏引擎自带素材包'],
  },
  {
    step: '02',
    title: '命名规范化',
    color: '#a855f7',
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    items: ['按 UCS 标准重命名', '填写元数据（BPM / Key / Description）', 'iXML 标签嵌入', '批量命名工具（AudioRenamer）'],
  },
  {
    step: '03',
    title: '入库管理',
    color: '#22c55e',
    icon: 'M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z',
    items: ['导入 Soundminer 建立索引', '添加自定义标签（情绪/场景/强度）', '双份备份（本地 + 云端）', '按项目建立虚拟库分组'],
  },
  {
    step: '04',
    title: '设计加工',
    color: '#f59e0b',
    icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    items: ['Reaper / Pro Tools 剪辑裁剪', '音调/时长处理（iZotope RX）', '效果叠加与混合', 'Pitch Shift / Time Stretch'],
  },
  {
    step: '05',
    title: '集成 Wwise',
    color: '#ec4899',
    icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    items: ['拖入 Wwise 音效容器', '配置随机 / 序列播放逻辑', '设置 RTPC 参数绑定', '与程序联调触发事件'],
  },
  {
    step: '06',
    title: '审核发布',
    color: '#ef4444',
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    items: ['与导演/制作人验收', '音量响度标准化（-23 LUFS）', '版本存档 + 发布日志', '更新 ZenTao 任务状态'],
  },
];

/* ─────────────────── 数据：常用音效库资源 ─────────────────── */
const libraryLinks = [
  { name: 'Boom Library', url: 'https://www.boomlibrary.com', desc: '高品质商业音效库，专业游戏/影视分类', color: '#f59e0b', tag: '商业' },
  { name: 'Soundsnap', url: 'https://www.soundsnap.com', desc: '订阅制在线音效库，30万+ 素材', color: '#06b6d4', tag: '订阅' },
  { name: 'Freesound', url: 'https://freesound.org', desc: 'CC 授权免费音效社区，生态活跃', color: '#22c55e', tag: '免费' },
  { name: 'Zapsplat', url: 'https://www.zapsplat.com', desc: '免费注册可下载，含专业包付费扩展', color: '#22c55e', tag: '免费' },
  { name: 'Sonniss GDC Bundle', url: 'https://sonniss.com/gameaudiogdc', desc: 'GDC 每年免费发布的游戏音效大合集', color: '#a855f7', tag: '免费' },
  { name: 'Soundly', url: 'https://getsoundly.com', desc: 'AI 驱动音效管理 + 在线库搜索一体化工具', color: '#ec4899', tag: '工具' },
  { name: 'iZotope RX', url: 'https://www.izotope.com/rx', desc: '行业标准音频修复与处理套件', color: '#ef4444', tag: '工具' },
  { name: 'UCS 官网', url: 'https://universalcategorysystem.com', desc: 'Universal Category System 官方标准文档', color: '#06b6d4', tag: '标准' },
];

/* ─────────────────── Tab 定义 ─────────────────── */
const tabs = [
  { key: 'all', label: '全部' },
  { key: 'tools', label: '工具集' },
  { key: 'ucs', label: 'UCS 分类' },
  { key: 'workflow', label: '工作流' },
  { key: 'naming', label: '命名规范' },
  { key: 'library', label: '资源导航' },
];

/* ═══════════════════ 组件 ═══════════════════ */
export default function SoundEffectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [expandedUcs, setExpandedUcs] = useState<string | null>(null);

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

  const filteredTools = toolCards.filter(c =>
    !query ||
    c.title.includes(query) ||
    c.subtitle.includes(query) ||
    c.desc.includes(query) ||
    c.tags.some(t => t.includes(query)) ||
    c.features.some(f => f.includes(query))
  );

  const filteredLibrary = libraryLinks.filter(l =>
    !query || l.name.toLowerCase().includes(query) || l.desc.includes(query) || l.tag.includes(query)
  );

  return (
    <div className="max-w-[900px] mx-auto py-8 px-6 w-full">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link to="/audio" className="hover:text-gray-300 transition-colors">音频设计中心</Link>
        <span>/</span>
        <span style={{ color: COLOR }}>音效管理中心</span>
      </nav>

      {/* 页面头部 */}
      <div className="mb-10">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl leading-none">🔊</span>
          <div>
            <h1 className="text-5xl font-extrabold mb-3" style={{ color: COLOR }}>
              音效管理中心
            </h1>
            <p className="text-sm text-gray-400 tracking-wide">
              专业音效资源与工具库 · UCS 分类 · 命名规范 · 工作流
            </p>
          </div>
        </div>
      </div>

      {/* 统计栏 */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { num: '6', label: '专业工具', color: '#a855f7' },
          { num: '23', label: 'UCS 大类', color: '#06b6d4' },
          { num: '188', label: 'UCS 子类', color: '#22c55e' },
          { num: '6', label: '工作流节点', color: '#f59e0b' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}20` }}>
            <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.num}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 搜索栏 */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="搜索工具、分类、规范..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors"
          />
        </div>
      </div>

      {/* 标签导航 - 吸顶，flex-wrap 分层 */}
      <div className="sticky top-16 z-10 -mx-6 px-6 pt-3 pb-3 bg-[#0a0a0f] border-b border-[rgba(255,255,255,0.04)] mb-10">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            const tabColor = SECTION_COLORS[tab.key] || COLOR;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className="text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isActive ? `${tabColor}50` : 'rgba(255,255,255,0.06)',
                  background: isActive ? `${tabColor}12` : 'transparent',
                  color: isActive ? tabColor : '#6b7280',
                  boxShadow: isActive ? `0 0 12px ${tabColor}15` : 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 区块1: 工具集 ── */}
      <div id="tools" className="mb-14 scroll-mt-36">
        {/* 区块标题 */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#a855f715', border: '1px solid #a855f725' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#a855f7]">专业工具集</h2>
            <p className="text-xs text-gray-500 mt-0.5">音效管理 · 合成 · 翻译助手</p>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #a855f730, transparent)' }} />
        </div>

        {/* 工具卡片网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTools.map(card => {
            const isExpanded = expandedCard === card.key;
            return (
              <div
                key={card.key}
                className="rounded-xl border transition-all duration-300 overflow-hidden"
                style={{ borderColor: `${card.color}25`, background: `${card.color}06` }}
              >
                {/* 卡片头部 */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedCard(isExpanded ? null : card.key)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{card.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-100">{card.title}</h3>
                          {card.isNew && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                              style={{ background: '#ef444415', border: '1px solid #ef444430', color: '#ef4444' }}>
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{card.subtitle}</p>
                      </div>
                    </div>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b7280"
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      className={`flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  {/* 标签行 */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {card.tags.map((t, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-md"
                        style={{ background: `${card.color}10`, border: `1px solid ${card.color}25`, color: card.color }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 展开详情 */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: `${card.color}15` }}>
                    <p className="text-sm text-gray-300 leading-relaxed mt-3 mb-3">{card.desc}</p>
                    <p className="text-xs font-semibold text-gray-400 mb-2">✨ 核心功能</p>
                    <ul className="space-y-1">
                      {card.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-gray-400">
                          <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: card.color }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 区块2: UCS 分类 ── */}
      <div id="ucs" className="mb-14 scroll-mt-36">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#06b6d415', border: '1px solid #06b6d425' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#06b6d4]">UCS 音效分类系统</h2>
            <p className="text-xs text-gray-500 mt-0.5">Universal Category System 8.2 · 23大类 · 188子类</p>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #06b6d430, transparent)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {ucsSections[0].categories
            .filter(c => !query || c.name.includes(query) || c.en.toLowerCase().includes(query) || c.catId.toLowerCase().includes(query) || c.desc.includes(query))
            .map(cat => {
              const isExp = expandedUcs === cat.catId;
              return (
                <div
                  key={cat.catId}
                  className="rounded-lg border transition-all duration-200 overflow-hidden cursor-pointer"
                  style={{ borderColor: 'rgba(6,182,212,0.15)', background: 'rgba(6,182,212,0.04)' }}
                  onClick={() => setExpandedUcs(isExp ? null : cat.catId)}
                >
                  <div className="flex items-center gap-3 px-3.5 py-2.5">
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: '#06b6d415', color: '#06b6d4', border: '1px solid #06b6d425' }}>
                      {cat.catId}
                    </span>
                    <span className="text-sm font-medium text-gray-200">{cat.name}</span>
                    <span className="text-xs text-gray-500">{cat.en}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-gray-600">{cat.sub} 子类</span>
                      <svg
                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className={`transition-transform duration-200 ${isExp ? 'rotate-180' : ''}`}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </div>
                  </div>
                  {isExp && (
                    <div className="px-3.5 pb-3 border-t" style={{ borderColor: '#06b6d415' }}>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">{cat.desc}</p>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* ── 区块3: 工作流 ── */}
      <div id="workflow" className="mb-14 scroll-mt-36">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#22c55e15', border: '1px solid #22c55e25' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#22c55e]">音效生产工作流</h2>
            <p className="text-xs text-gray-500 mt-0.5">从采集到交付的完整节点</p>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #22c55e30, transparent)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflowSteps.map(step => (
            <div key={step.step} className="rounded-xl p-4 border"
              style={{ borderColor: `${step.color}20`, background: `${step.color}06` }}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-black" style={{ color: `${step.color}40` }}>{step.step}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${step.color}15`, border: `1px solid ${step.color}25` }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d={step.icon}/>
                  </svg>
                </div>
                <h3 className="text-sm font-bold" style={{ color: step.color }}>{step.title}</h3>
              </div>
              <ul className="space-y-1.5">
                {step.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                    <span className="w-1 h-1 rounded-full flex-shrink-0 mt-1.5" style={{ background: step.color }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* ── 区块4: 命名规范 ── */}
      <div id="naming" className="mb-14 scroll-mt-36">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#f59e0b15', border: '1px solid #f59e0b25' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#f59e0b]">命名规范</h2>
            <p className="text-xs text-gray-500 mt-0.5">UCS 标准 · Wwise 规范 · 项目内部规范</p>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #f59e0b30, transparent)' }} />
        </div>

        <div className="space-y-4">
          {namingRules.map(rule => (
            <div key={rule.title} className="rounded-xl p-5 border"
              style={{ borderColor: `${rule.color}25`, background: `${rule.color}06` }}>
              <h3 className="text-sm font-bold mb-2" style={{ color: rule.color }}>{rule.title}</h3>
              {/* 格式框 */}
              <div className="rounded-lg px-4 py-2.5 mb-3 font-mono text-sm text-gray-200"
                style={{ background: 'rgba(0,0,0,0.3)', border: `1px solid ${rule.color}20` }}>
                <span className="text-xs text-gray-500 mr-2">格式</span>{rule.format}
              </div>
              <div className="rounded-lg px-4 py-2.5 mb-4 font-mono text-sm"
                style={{ background: `${rule.color}08`, border: `1px solid ${rule.color}20`, color: rule.color }}>
                <span className="text-xs mr-2" style={{ color: `${rule.color}70` }}>示例</span>{rule.example}
              </div>
              {/* 字段说明 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {rule.fields.map(f => (
                  <div key={f.label} className="flex gap-2 text-xs">
                    <span className="font-mono font-bold flex-shrink-0" style={{ color: rule.color }}>{f.label}</span>
                    <span className="text-gray-400">{f.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 区块5: 资源导航 ── */}
      <div id="library" className="mb-8 scroll-mt-36">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: '#ef444415', border: '1px solid #ef444425' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#ef4444]">音效资源导航</h2>
            <p className="text-xs text-gray-500 mt-0.5">商业库 · 免费资源 · 专业工具</p>
          </div>
          <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #ef444430, transparent)' }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredLibrary.map(lib => (
            <a
              key={lib.name}
              href={lib.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl p-4 border transition-all duration-200 hover:scale-[1.01] group"
              style={{ borderColor: `${lib.color}20`, background: `${lib.color}06` }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${lib.color}15`, border: `1px solid ${lib.color}25` }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={lib.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-100 group-hover:text-white transition-colors">{lib.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    style={{ background: `${lib.color}15`, border: `1px solid ${lib.color}30`, color: lib.color }}>
                    {lib.tag}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{lib.desc}</p>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4b5563"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
