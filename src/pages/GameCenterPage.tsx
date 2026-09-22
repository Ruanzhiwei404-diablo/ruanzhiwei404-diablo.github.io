import { Link } from 'react-router-dom';

type GameSlot = { id: string; label: string; icon: string; tagline: string; desc: string; href?: string };

const GAME_SLOTS: GameSlot[] = [
  {
    id: 'synth-racer',
    label: '合成器竞速',
    icon: '🏎️',
    tagline: 'SYNTH RACER',
    desc: '用 CrystalPrism / SubBass 的实时音色做引擎声与音效的网页竞速小游戏，边玩边调音色。',
    href: '/game-center/synth-racer',
  },
  {
    id: 'rhythm-code',
    label: '节奏编码',
    icon: '🎵',
    tagline: 'RHYTHM CODE',
    desc: '把乐器语言(Instrument Language)语法编成节奏关卡，听音辨词、按拍输入的网页音乐游戏。',
  },
  {
    id: 'boss-mixer',
    label: 'Boss 混音战',
    icon: '🎚️',
    tagline: 'BOSS MIXER',
    desc: '实时混音对抗玩法，用你在本站调出的合成器 patch 当武器挑战 Boss。',
  },
];

export default function GameCenterPage() {
  return (
    <div className="max-w-[1000px] mx-auto py-8 px-6 w-full">
      {/* 头部 */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5 flex items-center justify-center gap-2">
          <span>🎮</span> 游戏中心
        </h1>
        <p className="text-[13.5px] text-gray-500">
          Web 小游戏 · 把声音设计变成可玩的玩具
        </p>
      </div>

      {/* 占位说明 */}
      <div className="rounded-xl border border-dashed border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.04)] p-6 text-center mb-8">
        <div className="text-3xl mb-2">🚧</div>
        <div className="text-sm font-semibold text-gray-300 mb-1">建设中 · Coming Soon</div>
        <div className="text-xs text-gray-500 max-w-[640px] mx-auto">
          游戏中心板块正在规划中。后续将在此接入一系列基于本站声音设计能力（CrystalPrism / SubBass / 乐器语言）的网页小游戏——可直接用你调出的合成器音色当玩法素材。
        </div>
      </div>

      {/* 规划中的游戏栏位 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {GAME_SLOTS.map((g) => (
          <div className="card p-6 relative overflow-hidden" key={g.id}>
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, #a855f7, transparent)' }}
            />

            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                  boxShadow: '0 4px 14px #a855f740',
                }}
              >
                {g.icon}
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-bright">{g.label}</h2>
                <p className="text-[10px] font-mono text-gray-500 tracking-widest">{g.tagline}</p>
              </div>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">{g.desc}</p>

            {g.href ? (
              <Link
                to={g.href}
                className="mt-5 block text-center rounded-xl bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold py-3 px-4 transition-colors"
              >
                🏎️ 进入游戏 →
              </Link>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.04)] p-4 text-center">
                <div className="text-xl mb-1">🚧</div>
                <div className="text-xs text-gray-500">规划中 · Coming Soon</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 返回 */}
      <div className="mt-6 text-center">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          ← 返回首页
        </Link>
      </div>
    </div>
  );
}
