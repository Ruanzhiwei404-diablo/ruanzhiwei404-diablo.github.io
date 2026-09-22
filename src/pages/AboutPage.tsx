export default function AboutPage() {
  return (
    <div className="max-w-[640px] mx-auto py-8 px-6 w-full">
      <div className="text-center mb-9">
        <img
          src="/icon-v2.png"
          alt="because"
          className="w-24 h-24 rounded-3xl block mx-auto mb-5 shadow-[0_10px_48px_rgba(219,39,119,0.4)]"
        />
        <h1 className="text-xl font-extrabold text-text-bright mb-1.5">because</h1>
        <p className="text-[13px] text-gray-500">AI 声音技术平台 · 开源免费 · 持续更新</p>
      </div>

      <div className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] rounded-2xl p-6">
        <p className="text-[13px] text-gray-400 leading-loose">
          because 致力于用 AI 技术降低声音创作的门槛，让每个人都能拥有独特的标志性声音。
        </p>
        <br />
        <div className="text-[13px] text-gray-400 leading-loose">
          <div className="text-gray-200 font-semibold mb-1">🎯 核心功能</div>
          <ul className="list-disc pl-5 mb-3 space-y-1">
            <li>AI 声音克隆与模型生成</li>
            <li>智能编曲与轨道生成</li>
            <li>AI 歌声合成与混音</li>
            <li>多语言声音演绎</li>
            <li>实时音效处理与高清导出</li>
          </ul>
          <div className="text-gray-200 font-semibold mb-1">🛠️ 技术栈</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>前端：React + TypeScript + Vite</li>
            <li>AI：OpenAI 兼容 API</li>
            <li>部署：GitHub Pages</li>
            <li>资源库：34 个 AI 工具收录</li>
          </ul>
        </div>
      </div>

      <div className="text-center mt-6 text-xs text-gray-800">© 2026 because · 打造独有标志性声音</div>
    </div>
  );
}
