import { Link } from 'react-router-dom';

export default function SynthLabPage() {
  return (
    <div className="max-w-[800px] mx-auto py-8 px-6 w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5">
          🔬 Synth Lab 声音合成器
        </h1>
        <p className="text-[13.5px] text-gray-500">
          Web Audio 合成器拆解与音色设计实验
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {/* CrystalPrism */}
        <div className="card p-6 relative overflow-hidden group">
          <div
            className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(90deg, #f59e0b, transparent)' }}
          />
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-11 h-11 rounded-[11px] flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                boxShadow: '0 4px 14px #f59e0b40',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" opacity=".6"/>
                <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" opacity=".4"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#f59e0b]">CrystalPrism</h2>
              <p className="text-xs text-gray-500">96kHz / 24-bit 工作室级光谱合成器</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            Lab开发的三层合成引擎（PRISM PRO 架构），通过根频率、衰减时间、ARP Gate 等物理参数驱动音色生成，内置 17 个音色预设。
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['17 预设', 'SPECTRAL 引擎', 'ARP Gate'].map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{
                  borderColor: '#f59e0b25',
                  background: '#f59e0b08',
                  color: '#f59e0bcc',
                }}
              >
                {t}
              </span>
            ))}
            <Link
              to="/audio/synth-lab/crystal-prism/prism-plus"
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors duration-200 hover:brightness-110"
              style={{
                borderColor: '#06b6d455',
                background: 'linear-gradient(135deg, #06b6d420, #06b6d408)',
                color: '#06b6d4',
              }}
            >
              PRISM PLUS ✦
            </Link>
          </div>
          <Link
            to="/audio/synth-lab/crystal-prism"
            className="text-sm font-medium transition-all duration-200 hover:gap-2.5"
            style={{ color: '#f59e0b' }}
          >
            进入 →
          </Link>
        </div>

        {/* Sub_Bass */}
        <div className="card p-6 relative overflow-hidden group">
          <div
            className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(90deg, #8b5cf6, transparent)' }}
          />
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-11 h-11 rounded-[11px] flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                boxShadow: '0 4px 14px #8b5cf640',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="2" fill="white"/>
                <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="1.5" opacity=".6"/>
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1" opacity=".3"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#8b5cf6]">Sub_Bass</h2>
              <p className="text-xs text-gray-500">三引擎低音合成器 · 地震级低频</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            SHAKE / RUMBLE / IMPACT 三引擎架构，融合 SEQUENCES / DARK SEISMIC 模块，SHAKE 40%、SPEED 15%、WEIGHT 50% 参数驱动，提供地震级的低频声音设计能力。
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['三引擎', 'RUMBLE', 'IMPACT'].map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{
                  borderColor: '#8b5cf625',
                  background: '#8b5cf608',
                  color: '#8b5cf6cc',
                }}
              >
                {t}
              </span>
            ))}
            <Link
              to="/audio/synth-lab/sub-bass/bass"
              className="text-xs px-3 py-1.5 rounded-lg border transition-colors duration-200 hover:brightness-110"
              style={{
                borderColor: '#fb923c55',
                background: 'linear-gradient(135deg, #fb923c20, #fb923c08)',
                color: '#fb923c',
              }}
            >
              BASS ◆ WAVA
            </Link>
          </div>
          <Link
            to="/audio/synth-lab/sub-bass"
            className="text-sm font-medium transition-all duration-200 hover:gap-2.5"
            style={{ color: '#8b5cf6' }}
          >
            进入 →
          </Link>
        </div>

        {/* CuteSynth */}
        <div className="card p-6 relative overflow-hidden group">
          <div
            className="absolute top-0 left-0 right-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: 'linear-gradient(90deg, #ec4899, transparent)' }}
          />
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-11 h-11 rounded-[11px] flex items-center justify-center flex-shrink-0 shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #ec4899, #db2777)',
                boxShadow: '0 4px 14px #ec489940',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#ec4899]">CuteSynth</h2>
              <p className="text-xs text-gray-500">动漫音效引擎 · 可爱即正义</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-3">
            一个可爱又色彩缤纷的声音游乐场，包含动漫风格的音效预设、物理建模以及互动琶音器。快速原型和即兴音色设计实验的合成器。
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {['12 预设', 'ANIME SFX', 'FM 合成', '锁/随机化'].map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1.5 rounded-lg border"
                style={{
                  borderColor: '#ec489925',
                  background: '#ec489908',
                  color: '#ec4899cc',
                }}
              >
                {t}
              </span>
            ))}
          </div>
          <Link
            to="/audio/synth-lab/cute-synth"
            className="text-sm font-medium transition-all duration-200 hover:gap-2.5"
            style={{ color: '#ec4899' }}
          >
            进入 →
          </Link>
        </div>
      </div>
    </div>
  );
}
