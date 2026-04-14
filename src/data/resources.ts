export const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

export interface Resource {
  title: string;
  desc: string;
  url: string;
  icon: string;
  category: string;
  tags: string[];
}

export const RESOURCES: Resource[] = [
  // AI 大模型
  { title: 'ChatGPT', desc: 'OpenAI 最强对话模型，支持 GPT-4o', url: 'https://chat.openai.com', icon: '🤖', category: 'AI 大模型', tags: ['LLM', '对话'] },
  { title: 'Claude', desc: 'Anthropic 出品，擅长长文本与编程', url: 'https://claude.ai', icon: '🧠', category: 'AI 大模型', tags: ['LLM', '对话'] },
  { title: 'Gemini', desc: 'Google AI，支持多模态与联网搜索', url: 'https://gemini.google.com', icon: '✨', category: 'AI 大模型', tags: ['LLM', '多模态'] },
  { title: 'DeepSeek', desc: '国产顶级开源大模型，性价比极高', url: 'https://www.deepseek.com', icon: '🔮', category: 'AI 大模型', tags: ['LLM', '开源'] },
  { title: 'Kimi', desc: '月之暗面出品，支持 20 万字上下文', url: 'https://kimi.moonshot.cn', icon: '🌙', category: 'AI 大模型', tags: ['LLM', '国产'] },
  { title: '通义千问', desc: '阿里云大模型，覆盖全面场景', url: 'https://tongyi.aliyun.com', icon: '🐉', category: 'AI 大模型', tags: ['LLM', '国产'] },
  { title: '讯飞星火', desc: '科大讯飞大模型，语音能力突出', url: 'https://xinghuo.xfyun.cn', icon: '🔥', category: 'AI 大模型', tags: ['LLM', '语音'] },
  { title: '智谱清言', desc: '清华出品，中文理解能力强', url: 'https://www.zhipuai.cn', icon: '⚡', category: 'AI 大模型', tags: ['LLM', '国产'] },

  // AI 图像
  { title: 'Midjourney', desc: 'AI 图像生成天花板，艺术感极强', url: 'https://www.midjourney.com', icon: '🎨', category: 'AI 图像', tags: ['图像', '设计'] },
  { title: 'DALL·E 3', desc: 'OpenAI 官方图像生成，GPT 深度集成', url: 'https://openai.com/dall-e-3', icon: '🖼️', category: 'AI 图像', tags: ['图像', '设计'] },
  { title: 'Stable Diffusion', desc: '最强开源图像生成，可本地部署', url: 'https://stability.ai', icon: '🌊', category: 'AI 图像', tags: ['图像', '开源'] },
  { title: 'Canva AI', desc: '在线设计工具 + AI 出图，快速便捷', url: 'https://www.canva.com', icon: '🎯', category: 'AI 图像', tags: ['设计', '模板'] },
  { title: '标小智', desc: '国产 AI Logo 与设计素材生成', url: 'https://biaoxiao.com', icon: '✏️', category: 'AI 图像', tags: ['Logo', '国产'] },

  // AI 视频
  { title: 'Sora', desc: 'OpenAI 视频生成模型，物理世界模拟', url: 'https://openai.com/sora', icon: '🎬', category: 'AI 视频', tags: ['视频', '生成'] },
  { title: 'Runway', desc: 'AI 视频编辑与生成，导演级工具', url: 'https://runwayml.com', icon: '🎥', category: 'AI 视频', tags: ['视频', '编辑'] },
  { title: 'Pika', desc: '文本/图片转视频，新一代 AI 视频', url: 'https://pika.art', icon: '⚡', category: 'AI 视频', tags: ['视频', '生成'] },
  { title: 'HeyGen', desc: 'AI 数字人视频，营销视频神器', url: 'https://heygen.com', icon: '👤', category: 'AI 视频', tags: ['数字人', '营销'] },

  // AI 音频
  { title: 'ElevenLabs', desc: '最逼真的 AI 语音合成，支持克隆', url: 'https://elevenlabs.io', icon: '🎙️', category: 'AI 音频', tags: ['TTS', '语音'] },
  { title: '讯飞听见', desc: '科大讯飞语音转文字，准确率高', url: 'https://www.iflyrec.com', icon: '🎧', category: 'AI 音频', tags: ['STT', '转写'] },
  { title: '天工 SkySound', desc: '昆仑万维 AI 音乐与音频生成', url: 'https://modelers.cn', icon: '🎵', category: 'AI 音频', tags: ['音乐', '国产'] },

  // AI 办公 & 开发
  { title: 'Notion AI', desc: '笔记 + AI，写文章、总结、翻译全搞定', url: 'https://notion.so', icon: '📝', category: 'AI 办公', tags: ['笔记', '写作'] },
  { title: 'Copilot', desc: 'GitHub AI 编程助手，代码生成加速', url: 'https://github.com/features/copilot', icon: '💻', category: 'AI 开发', tags: ['编程', '代码'] },
  { title: 'Cursor', desc: 'AI 代码编辑器，基于 GPT-4 全方位辅助', url: 'https://cursor.sh', icon: '📌', category: 'AI 开发', tags: ['IDE', '代码'] },
  { title: 'Gamma', desc: 'AI PPT 生成，输入主题自动出幻灯片', url: 'https://gamma.app', icon: '📊', category: 'AI 办公', tags: ['PPT', '演示'] },
  { title: '通义听悟', desc: '阿里会议转录 + 摘要 + 翻译', url: 'https://tingwu.aliyun.com', icon: '🎚️', category: 'AI 办公', tags: ['会议', '转写'] },

  // 学习 & 资讯
  { title: 'AI Newsletter', desc: '每日 AI 行业资讯精选', url: 'https://buttondown.email/ainews', icon: '📬', category: '学习资讯', tags: ['资讯', 'Newsletter'] },
  { title: 'Hugging Face', desc: '全球最大 AI 模型社区与开源模型库', url: 'https://huggingface.co', icon: '🤗', category: '学习资讯', tags: ['模型', '开源'] },
  { title: 'Papers with Code', desc: 'AI 论文 + 代码实现，对照学习', url: 'https://paperswithcode.com', icon: '📄', category: '学习资讯', tags: ['论文', '代码'] },
  { title: 'AI Tool 导航', desc: '收录全网 AI 工具，每周更新', url: 'https://theresanaiforthat.com', icon: '🧭', category: '学习资讯', tags: ['导航', '工具'] },

  // 实用工具
  { title: 'Perplexity', desc: 'AI 搜索引擎，实时联网，给出答案来源', url: 'https://www.perplexity.ai', icon: '🔍', category: '实用工具', tags: ['搜索', '联网'] },
  { title: 'Phind', desc: '开发者专属 AI 搜索引擎', url: 'https://www.phind.com', icon: '🔎', category: '实用工具', tags: ['搜索', '开发'] },
  { title: 'Monica', desc: 'AI 助手浏览器插件，全网页面随时呼出', url: 'https://monica.im', icon: '🧩', category: '实用工具', tags: ['插件', '浏览器'] },
  { title: 'Kimi 浏览器助手', desc: 'Kimi 出品浏览器插件，AI 随时在侧', url: 'https://kimi.moonshot.cn', icon: '🌙', category: '实用工具', tags: ['插件', '浏览器'] },
  { title: '通义效率', desc: '阿里 AI 全家桶：翻译、总结、PPT', url: 'https://tongyi.aliyun.com/qianwen', icon: '🐉', category: '实用工具', tags: ['效率', '全家桶'] },
];

export const CATEGORIES = [...new Set(RESOURCES.map(r => r.category))];

export function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function formatTime() {
  return new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}
