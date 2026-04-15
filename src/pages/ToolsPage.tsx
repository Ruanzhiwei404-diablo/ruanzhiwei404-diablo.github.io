export default function ToolsPage() {
  const tools = [
    { name: 'AI 对话', desc: 'GPT-4o 智能对话助手', icon: '💬', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
    { name: '资源导航', desc: '收录全网优质 AI 工具', icon: '🧭', color: '#0891b2', bg: 'rgba(8,145,178,0.15)' },
    { name: '图片生成', desc: 'AI 文生图工具集合', icon: '🎨', color: '#db2777', bg: 'rgba(219,39,119,0.15)' },
    { name: '视频制作', desc: 'AI 视频生成与编辑工具', icon: '🎬', color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
    { name: 'PPT 生成', desc: '输入主题，AI 自动出幻灯片', icon: '📊', color: '#d97706', bg: 'rgba(217,119,6,0.15)' },
    { name: '代码助手', desc: 'AI 编程辅助工具合集', icon: '💻', color: '#059669', bg: 'rgba(5,150,105,0.15)' },
  ];

  return (
    <div className="max-w-[800px] mx-auto py-8 px-6 w-full">
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5">🧩 AI 工具箱</h1>
        <p className="text-[13.5px] text-gray-500">精选实用 AI 工具，一站直达</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool, i) => (
          <button
            key={i}
            className="text-left cursor-pointer border-none rounded-2xl p-6 flex flex-col gap-2.5 transition-all duration-200"
            style={{ background: tool.bg, borderColor: tool.color + '30' }}
          >
            <div className="text-[36px]">{tool.icon}</div>
            <div className="text-[15px] font-bold text-text-bright">{tool.name}</div>
            <div className="text-xs text-gray-400">{tool.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
