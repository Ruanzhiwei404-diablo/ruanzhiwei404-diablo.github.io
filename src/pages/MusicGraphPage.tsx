import { Link } from 'react-router-dom';

const cards = [
  {
    id: 'instruments',
    title: '乐器百科',
    desc: '探索 51+ 电子乐器的完整档案 — 多语言别名、社区标签、关联流派、演奏者关系。从模拟合成器到鼓机，每一个声音工具的历史与归属。',
    icon: '🎹',
    link: '/music/instruments',
    color: '#10b981',
    gradient: ['#10b981', '#059669'],
    tags: ['51+ 电子乐器', '多语言别名', '标签分类', '流派关联'],
  },
  {
    id: 'artists',
    title: '演奏者图谱',
    desc: '谁用过这个合成器？从 Kraftwerk 到 Aphex Twin，追溯每个乐器背后的演奏者网络，发现隐藏的声音传承脉络。',
    icon: '👤',
    link: '/music/artists',
    color: '#8b5cf6',
    gradient: ['#8b5cf6', '#6d28d9'],
    tags: ['艺术家检索', '乐器关联', '历史脉络'],
  },
  {
    id: 'recordings',
    title: '录音考古',
    desc: '这个合成器出现在哪些经典歌曲中？每一段录音都是音乐史上的化石碎片，拼接出声音工具在时间线上的完整轨迹。',
    icon: '📼',
    link: '/music/recordings',
    color: '#f59e0b',
    gradient: ['#f59e0b', '#d97706'],
    tags: ['录音检索', '时长/专辑', 'ISRC'],
  },
  {
    id: 'genres',
    title: '流派地图',
    desc: '数千个细分流派构成的声景地貌 — 从 synth-pop 到 dungeon synth，从 acid house 到 witch house，每个流派都与乐器和艺人交织。',
    icon: '🗺️',
    link: '/music/genres',
    color: '#ec4899',
    gradient: ['#ec4899', '#db2777'],
    tags: ['数千流派', '层级浏览', '乐器-流派关联'],
  },
];

export default function MusicGraphPage() {
  return (
    <div className="max-w-[800px] mx-auto py-8 px-6 w-full">
      {/* 页面头部 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5">
          🌐 音乐图谱
        </h1>
        <p className="text-[13.5px] text-gray-500">
          基于 MusicBrainz 的乐器 → 艺人 → 录音 → 流派四层知识网络
        </p>
      </div>

      {/* 四宫格导航 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {cards.map((c) => (
          <Link
            key={c.id}
            to={c.link}
            className="card p-6 relative overflow-hidden group block no-underline"
          >
            {/* 顶部色条 */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: `linear-gradient(90deg, ${c.color}, transparent)` }}
            />

            {/* 图标 */}
            <div
              className="w-11 h-11 rounded-[11px] flex items-center justify-center flex-shrink-0 shadow-lg mb-4"
              style={{
                background: `linear-gradient(135deg, ${c.gradient[0]}, ${c.gradient[1]})`,
                boxShadow: `0 4px 14px ${c.color}40`,
              }}
            >
              <span className="text-xl">{c.icon}</span>
            </div>

            {/* 标题 */}
            <h2
              className="text-lg font-bold mb-2"
              style={{
                borderBottom: `2px solid ${c.color}40`,
                paddingBottom: '4px',
                color: c.color,
              }}
            >
              {c.title}
            </h2>

            {/* 描述 */}
            <p className="text-sm text-gray-400 leading-relaxed mb-3">
              {c.desc}
            </p>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              {c.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 rounded-lg border"
                  style={{
                    borderColor: `${c.color}25`,
                    background: `${c.color}08`,
                    color: `${c.color}cc`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>

            {/* 进入箭头 */}
            <div
              className="absolute bottom-4 right-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ color: c.color }}
            >
              →
            </div>
          </Link>
        ))}
      </div>

      {/* 底部信息 */}
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-600">
          数据来源：MusicBrainz · 免费 API · 无需认证 · 社区维护
        </p>
        <div className="flex items-center justify-center gap-4 mt-3">
          <Link
            to="/audio/synth-lab"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors no-underline"
          >
            🔬 Synth Lab 合成器实验室
          </Link>
          <span className="text-gray-700">|</span>
          <Link
            to="/audio"
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors no-underline"
          >
            🎧 音频设计中心
          </Link>
        </div>
      </div>
    </div>
  );
}
