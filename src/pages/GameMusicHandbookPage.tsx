import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────── 配色 ─────────────────── */
const COLOR = '#ec4899';

/* ─────────────────── 章节定义 ─────────────────── */
const chapters = [
  {
    key: 'fundamentals',
    title: '基础理论',
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    color: '#a855f7',
    topics: [
      {
        title: '乐理基础 — 音程与和弦',
        desc: '音程是两个音之间的距离关系，是和声与旋律的基石。半音（小二度）是最小单位，全音=两个半音。协和音程（纯一度、纯五度、大三度等）听起来稳定悦耳，不协和音程（三全音、小二度）产生紧张感。和弦是三个或更多音同时发声的组合，大三和弦（根音+大三度+纯五度）明亮愉悦，小三和弦（根音+小三度+纯五度）忧郁悲伤。',
        tags: ['音程', '和弦', '协和', '和声'],
      },
      {
        title: '调式与音阶 — 五声音阶到教会调式',
        desc: '大调音阶（全全半全全全半）和小调音阶（全半全全半全全）是现代音乐基础。五声音阶（宫商角徵羽）是中国风配乐的灵魂。教会调式（多利亚、弗里几亚、利底亚等）中，弗里几亚调式常用于中东/西班牙风格，利底亚调式的增四度赋予梦幻与漂浮感。选择调式直接决定音乐的"性格"。',
        tags: ['调式', '音阶', '五声音阶', '教会调式'],
      },
      {
        title: '节奏与节拍 — 心跳的律动',
        desc: '4/4拍是游戏配乐最常用节拍，稳重有力；3/4拍营造华尔兹般的优雅流动；6/8拍产生摇摆感。切分节奏打破预期，制造张力与驱动感。BPM（每分钟节拍数）决定情绪速度：60-80 BPM 沉思/悲伤，80-120 BPM 叙事/探索，120-160 BPM 动作/紧张。游戏中的节奏还需考虑与交互事件的对齐。',
        tags: ['节拍', 'BPM', '切分', '律动'],
      },
      {
        title: '编曲与配器 — 音色的建筑学',
        desc: '编曲是将旋律、和声、节奏、音色组织为完整作品的过程。低频（贝斯/大提琴）是地基，中频（人声/吉他/钢琴）是主体，高频（镲片/铃音）是装饰。游戏中编曲需考虑"水平"（横向旋律线）和"垂直"（纵向和声层）两个维度。密度控制很重要——过度编曲会掩盖游戏音效和语音对话。',
        tags: ['编曲', '配器', '频段', '层次'],
      },
    ],
  },
  {
    key: 'genres',
    title: '游戏音乐类型',
    icon: 'M9 19V6l12-3v13M9 19c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM21 16c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z',
    color: '#f97316',
    topics: [
      {
        title: '史诗管弦 — 从指环王到艾尔登法环',
        desc: '游戏音乐中应用最广泛的类型之一。以大型交响乐团为核心，铜管制造战争与英雄主义的气势，弦乐铺陈情感深度，合唱团增添神圣庄严感。代表作：《艾尔登法环》《巫师3》《最终幻想》系列。核心技法：①主导动机（Leitmotif）— 为角色/地点/事件设定专属旋律；②动态分层 — 根据游戏状态叠加或削减乐器层；③混合利底亚调式 — 营造梦幻与宏大并存的感觉。制作要点：控制弦乐分谱密度，为音效和语音留出频段空间。',
        tags: ['管弦乐', '史诗', 'Leitmotif', 'RPG'],
      },
      {
        title: '电子 / 合成器 — 赛博朋克与科幻',
        desc: '赛博朋克、科幻、竞速类游戏的核心音乐类型。从1980年代芯片音乐（Chiptune）进化到现代精密合成器设计。代表作：《赛博朋克2077》《DEVOLVER》《Electro Man》《命运》。核心音色：①低频脉冲（Bwah Bass）— 史诗级低音冲击；②Arp 琶音 — 快速琶音制造科技感与速度感；③Pad 氛围层 — 大量混响的合成铺底营造空间感；④FM 金属音色 — DX7 经典的冷冽音色。常用合成器：Serum、Massive X、Omnisphere。BPM 通常在 120-140 之间，与游戏动作节奏同步。',
        tags: ['合成器', '赛博朋克', '电子', 'Sci-Fi'],
      },
      {
        title: '氛围 / 环境音乐 — 探索与沉浸',
        desc: '探索类、冒险类、恐怖类游戏的灵魂。目的不是被"听到"，而是被"感受到"。代表作：《风之旅人》《空洞骑士》《死亡搁浅》《外星人：隔离》。核心技法：①长持续音（Drone）— 提供声音地平线，建立空间感；②粒子合成（Granular）— 将声音分解再重组，创造流动的纹理；③实时混响 — 利用 Wwise 的 Auxiliary Bus 和游戏空间几何动态调整混响参数；④"少即是多"— 大量留白，让环境音效（风声、水声、脚步声）成为音乐的一部分。关键：氛围音乐需要与游戏音效深度整合，不能互相抢频段。',
        tags: ['氛围', 'Drone', '环境', '探索'],
      },
      {
        title: '中国风 / 东方美学 — 五声与水墨',
        desc: '国产游戏与文化出海的核心音乐风格。代表作：《原神》（璃月地区）《黑神话：悟空》《仙剑奇侠传》《古剑奇谭》。核心要素：①五声音阶（宫商角徵羽）— 中国风旋律的灵魂骨架；②民族乐器融合 — 古筝（旋律）、二胡（情感）、笛子（灵动）、琵琶（节奏）、大鼓（气势）与西洋管弦乐混编；③留白美学 — 借鉴水墨画的"计白当黑"，音乐中刻意留出空隙；④戏曲元素 — 京剧唱腔、梆子节奏、锣鼓经作为点睛之笔。制作建议：民族乐器实录效果远好于采样，但要注意录音环境的声学处理。',
        tags: ['中国风', '五声音阶', '民族乐器', '东方美学'],
      },
      {
        title: '日系 RPG / 动漫配乐 — 旋律即王道',
        desc: '日本游戏音乐独有的美学传统，以优美的旋律线和丰富的情感层次著称。代表作：《最终幻想》《塞尔达传说》《勇者斗恶龙》《女神异闻录》。核心特征：①主旋律至上 — 精心雕琢的可哼唱旋律，植松伸夫的《Aria di Mezzo Carattere》是典范；②情感起伏 — 从极简独奏到百人交响的剧烈动态对比；③和声语言 — 大量使用日本流行音乐特有的 IV-V-vi-iii 和声进行（"王道进行"）；④音色偏好 — 钢琴独奏、弦乐群奏、电吉他 Solo 交替出现。特别注意：日系配乐的混音通常比西方更"亮"，高频更多，弦乐更突出。',
        tags: ['JRPG', '旋律', '日系', '和声进行'],
      },
      {
        title: '摇滚 / 金属 — 动作与速度',
        desc: '动作游戏、格斗游戏、竞速游戏的标配。从经典摇滚到极端金属，根据游戏风格选择子类型。代表作：《DOOM》（Mick Gordon 的 Djent 金属）、《鬼泣》、《战神（2018）》、《真人快打》。子类型匹配：①Alternative Rock（另类摇滚）— 开放世界探索；②Heavy Metal（重金属）— Boss 战；③Djent/Progressive Metal — 现代动作游戏，低频密集、节奏复杂；④Post-Rock（后摇）— 过场动画、情感高潮。制作要点：吉他音色需要 Real Amp 录音或 Neural DSP/Axe-Fx 模拟，采样吉他缺乏动态。鼓建议实录或使用 SSD5、GetGood Drums 等高端采样。',
        tags: ['摇滚', '金属', 'Djent', '动作游戏'],
      },
      {
        title: '恐怖 / 惊悚 — 不安与恐惧',
        desc: '恐怖游戏的音乐设计是所有类型中最具挑战性的——如何让观众"感到"恐惧而不是被音乐"吵"到。代表作：《寂静岭》（山冈晃）、《生化危机》、《死亡空间》、《PT》。核心技法：①不和谐音程 — 三全音（魔鬼音程）、小二度制造本能不安；②次声波（18-20Hz）— 引发生理层面的恐惧反应；③"静→爆"结构 — 长时间极度安静后突然爆发，利用对比制造 Jump Scare；④反向音频 — 将音频波形反转播放，制造超现实的不熟悉感；⑤极简主义 — 恐怖游戏音乐越少越好，让玩家自己的想象力完成80%的工作。',
        tags: ['恐怖', '不和谐', 'Jump Scare', '氛围'],
      },
      {
        title: '休闲 / 像素复古 — 怀旧与治愈',
        desc: '独立游戏、手游、休闲类游戏的音乐风格，正在经历"Chiptune 复兴"。代表作：《星露谷物语》《Undertale》《Celeste》《动物森友会》。核心方向：①Chiptune（芯片音乐）— 模拟 8-bit/16-bit 时代的方波、三角波、噪声通道音色，可用 DefleMask 或现代 DAW 的 8-bit 插件制作；②Lo-fi Hip Hop — 缓慢的鼓机节拍 + 失真钢琴 + 黑胶噼啪声，适合休闲模拟类；③Acoustic Folk — 木吉他 + 口琴 + 简单打击乐，温馨治愈。关键洞察：休闲游戏的音乐循环通常很短（15-30秒），循环点设计比任何类型都重要，任何突兀感都会在数百次循环后被无限放大。',
        tags: ['Chiptune', '像素', 'Lo-fi', '独立游戏'],
      },
    ],
  },
  {
    key: 'design',
    title: '游戏音乐设计',
    icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z',
    color: '#ec4899',
    topics: [
      {
        title: '互动音乐 — 线性到非线性的跃迁',
        desc: '传统音乐是线性播放，游戏音乐需要根据玩家行为实时变化。核心概念：①垂直分层（Vertical Layering）— 叠加/移除乐器层改变紧张度；②水平切换（Horizontal Re-sequencing）— 在不同音乐段落间过渡；③过渡设计（Transition）— 淡入淡出、节拍对齐、Quick-Transition 等方式无缝衔接。Wwise 的 Interactive Music 系统是实现这些理念的主力工具。',
        tags: ['互动音乐', '分层', '过渡', '自适应'],
      },
      {
        title: '音乐与情绪 — 用声音引导玩家感受',
        desc: '游戏音乐的核心任务之一是情绪引导。战斗音乐需要高密度打击乐+快速铜管Riff制造紧张感；探索音乐用缓慢弦乐+环境音色营造好奇与宁静；悲伤场景以独奏乐器（大提琴/钢琴）配合大量留白。关键技巧：音乐的"密度"与游戏节奏同步，避免在需要安静聆听对话时播放复杂编曲。',
        tags: ['情绪', '氛围', '密度控制', '留白'],
      },
      {
        title: '音乐循环与无缝衔接',
        desc: '游戏中音乐通常是循环播放的，需要精心设计循环点。循环需注意：①首尾和声兼容 — 循环起始和弦应能自然接续结束和弦；②节奏对齐 — 循环长度建议为4或8小节的整数倍；③避免突兀结尾 — 循环末尾渐弱处理或设计一个"回归动机"。在Wwise中，Music Playlist + Music Segment + Music Transition 三层结构完美支持循环管理。',
        tags: ['循环', '无缝', 'Music Segment', 'Playlist'],
      },
      {
        title: '音乐状态切换与游戏事件',
        desc: '通过 Wwise State 系统驱动音乐切换是游戏音频设计的核心技能。典型设计：战斗/探索/菜单三个主State，每个State对应不同音乐内容。切换方式：① Immediate（立即切换）— 适合紧急事件；②Fade（淡入淡出）— 适合情绪渐变；③Beat-sync（节拍对齐）— 在下一个强拍处切换，最自然。通过 RTPC 参数还可以实现音乐的渐变而非突变。',
        tags: ['State', 'RTPC', '事件驱动', '切换'],
      },
    ],
  },
  {
    key: 'ai-workflow',
    title: 'AI音频工作流程',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: '#8b5cf6',
    topics: [
      {
        title: 'AI辅助创意流程 — 五阶段工作流',
        desc: '从概念到实现的完整游戏音乐制作流程，AI 贯穿每个阶段加速迭代。①需求分析：研读游戏设计文档（GDD），建立音乐情绪板（Mood Board），收集参考曲目库（Reference Tracks），明确音乐在游戏中的角色定位；②AI探索：利用 AI 工具生成多种风格片段，快速试错创意方向，收集灵感素材，在数小时内完成原本需要数天的原型迭代；③深度创作：基于 AI 生成的旋律骨架进行人工编曲深化，创作主题旋律与变奏，叠加真人演奏润色提升人文温度；④技术实现：将成品导入 Wwise/FMOD 中间件进行互动音乐编程，设置垂直分层、水平切换、RTPC 参数等交互逻辑；⑤测试迭代：游戏内实际测试，收集玩家反馈，用数据驱动优化音乐体验。核心理念：善用 AI 工具进行创意探索，但始终保留人类创作者的最终艺术决策权。',
        tags: ['AI工作流', '五阶段', '创意探索', 'GDD'],
      },
      {
        title: 'AI 音乐生成工具实战',
        desc: '2025年 AI 音乐生成工具已进入实用阶段，游戏音乐制作人需要掌握核心工具链。①Suno / Udio — 文本生成完整歌曲，适合快速产出 Demo 和概念验证，可通过 Prompt 描述风格、情绪、乐器编制来控制输出；②AIVA — 专为影视/游戏配乐设计的 AI 作曲平台，支持导出 MIDI 和音频分轨，可与 DAW 工作流无缝衔接；③Mubert — 实时生成免版权背景音乐，适合休闲游戏和手游的快速填充；④Stable Audio / AudioCraft — Meta 和 Stability AI 的开源音频生成模型，支持精细控制音频时长和风格；⑤Magisterlorus / PLAI — 游戏音乐专用 AI 工具，支持根据游戏画面自动匹配音乐风格。使用策略：AI 生成旋律骨架 + 人工编曲深化 + 真人演奏润色，形成"AI 生成 30% + 人工精修 70%"的高效协作模式。',
        tags: ['Suno', 'AIVA', 'Mubert', 'AI生成'],
      },
      {
        title: '技术音频设计 — 行业标配技能',
        desc: 'Technical Sound Design 技能需求自 2020 年以来翻倍，已成为游戏音频设计师的硬性要求。核心技能栈：①Python 脚本 — 用于批量音频处理、格式转换、元数据管理、自动化测试；②C# 脚本（Unity）/ C++（Unreal）— 在游戏引擎中实现音频逻辑：动态音乐切换、空间音频参数控制、音频资源预加载管理；③Wwise/FMOD 深度掌握 — 不只是导入音频，而是精通 Interactive Music 系统、State/RTPC/Switch 机制、Spatial Audio 配置；④音频引擎性能优化 — 控制 Voice Count、管理内存占用、优化 CPU 使用率，确保音频系统在目标平台上流畅运行；⑤版本控制与协作工具 — Perforce/Git 管理音频资产，Wwise Authoring Assistant 实现团队协作。技术音频设计师的薪资通常比纯创作型高 20-30%。',
        tags: ['Python', 'C#', 'Wwise', '性能优化'],
      },
      {
        title: 'AI + 人工协作最佳实践',
        desc: 'AI 与人工协作的正确姿势：AI 不是替代人类，而是大幅提升创作效率。最佳实践案例——腾讯音频中心采用 AI 编曲系统，为《王者荣耀》全球 120 个版本适配区域化主题音乐。这种"AI + 人工"协作模式将制作周期缩短 40%，同时保障了艺术品质。协作流程：①AI 根据风格 Brief 生成 10-20 个候选片段；②音乐总监筛选 2-3 个方向进入深度制作；③作曲家在 AI 片段基础上重新编曲、调整和声进行、替换音色；④加入真人弦乐/管乐实录提升品质；⑤混音师统一混音风格与响度标准。关键原则：AI 负责速度和数量，人类负责品味和质量。AI 生成的素材永远是"原材料"，需要人类审美进行筛选和重塑。',
        tags: ['协作模式', '腾讯案例', '王者荣耀', '效率提升'],
      },
      {
        title: '提示词工程 — 控制 AI 音乐输出',
        desc: 'AI 音乐生成的质量高度依赖提示词（Prompt）的设计。游戏音乐领域的 Prompt 工程要点：①风格描述要具体 — 不写"激昂的音乐"，而是"史诗管弦，铜管主导，90 BPM，混合利底亚调式，参考 Hans Zimmer 的沙丘风格"；②乐器编制明确 — "弦乐群奏 + 法国号独奏 + 定音鼓 + 合唱团 Sustained"，减少 AI 的随机性；③情绪分层 — "前 30 秒神秘低沉，中段逐渐 builds up 到全编制高潮，结尾回归安静独奏"；④结构控制 — "A-B-A\' 结构，A段 16 小节弦乐主题，B段 16 小节铜管变奏，A\'段 16 小节回归并加入合唱"；⑤负面提示 — 排除不想要的元素："无电子鼓、无 Auto-Tune 人声、无迪斯科节拍"。建立团队 Prompt 模板库，标准化 AI 输出流程。',
        tags: ['Prompt', '提示词', 'AI控制', '模板化'],
      },
    ],
  },
  {
    key: 'production',
    title: '制作实战',
    icon: 'M9 19V6l12-3v13M9 19c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zM21 16c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z',
    color: '#06b6d4',
    topics: [
      {
        title: 'DAW 选择与工作流',
        desc: '主流 DAW 对比：Logic Pro（Mac 专属，MIDI 编写优秀，内置音色库丰富）；Cubase/Nuendo（行业标配，与 Wwise 交互流畅）；Pro Tools（录音/混音行业标准）；Reaper（轻量高效，脚本自动化强大）；Ableton Live（电子音乐/实时演奏利器）。游戏音乐制作推荐 Cubase 或 Logic Pro，配合 Wwise 的中间件流程最高效。',
        tags: ['DAW', 'Logic Pro', 'Cubase', 'Reaper'],
      },
      {
        title: '管弦乐配器 — 做出"电影级"游戏配乐',
        desc: '现代游戏配乐大量使用管弦乐编制。核心原则：①弦乐是灵魂 — 提供旋律线、和声铺垫与情感表达；②铜管制造力量感 — 战斗、史诗场景的主力；③木管增添色彩 — 独奏段落中展现细腻情感；④定音鼓/打击乐驱动节奏。虚幻管弦（Sample Library）推荐：BBC Symphony Orchestra、Spitfire Audio、EastWest Hollywood 系列。',
        tags: ['管弦乐', '音色库', '配器', 'Sample'],
      },
      {
        title: '电子音色设计 — 合成器与音效',
        desc: '电子音乐元素在现代游戏配乐中不可或缺。合成器类型：①减法合成（Subtractive）— 经典模拟音色，低通滤波器塑造音色；②FM 合成（FM）— DX7 标志性的金属感音色；③波表合成（Wavetable）— Serum 的强项，复杂音色演变；④粒子合成（Granular）— 制造氛围纹理。常用合成器：Serum、Massive X、Omnisphere、Diva。合成器音色常用于科幻、赛博朋克、UI 界面音效等场景。',
        tags: ['合成器', '电子音色', 'Serum', 'FM合成'],
      },
      {
        title: '混音与母带 — 让音乐在游戏中好听',
        desc: '游戏音乐混音的特殊性：①需要留出空间给音效和语音 — 不要把音乐混得太满；②关注低频管理 — 贝斯不要与音效的低频冲突；③动态范围控制 — 游戏引擎有自身的 HDR 系统，避免过度压缩；④响度标准化 — 游戏音乐通常在 -18 到 -14 LUFS 之间。母带处理轻量即可：均衡修整 + 轻微限制器 + 响度匹配。导出格式：WAV 48kHz/24bit（游戏标准）。',
        tags: ['混音', '母带', 'LUFS', '动态范围'],
      },
    ],
  },
  {
    key: 'integration',
    title: '引擎集成',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
    color: '#22c55e',
    topics: [
      {
        title: 'Wwise 互动音乐实战流程',
        desc: '完整工作流：①在 DAW 中作曲并导出各分层 Stems（旋律层、和弦层、节奏层、低音层）；②导入 Wwise，创建 Interactive Music Hierarchy（Music Playlist → Music Container → Music Segment）；③为各段设置 Transition 规则（Entry/Exit/Playlist）；④创建 Game Parameter 绑定 RTPC 控制音乐参数；⑤在游戏引擎中通过代码调用 PostEvent 触发音乐、SetState 切换状态、SetRTPCValue 调整参数。',
        tags: ['Wwise', 'Stems', 'Music Segment', '工作流'],
      },
      {
        title: 'FMOD 互动音乐方案',
        desc: 'FMOD Studio 的互动音乐通过 Event Instrument 实现。核心概念：①Music Timeline — 可视化时间轴编排音乐片段；②Transition Region — 定义过渡触发区域；③Destination Marker — 标记过渡目标位置；④Parameter — 与 Wwise 的 RTPC 类似，驱动音乐变化。FMOD 的优势是 DSP 效果器链更灵活，适合需要实时音频处理的项目。独立游戏和中小项目中 FMOD 使用更广泛。',
        tags: ['FMOD', 'Event', 'Parameter', 'Timeline'],
      },
      {
        title: 'UE / Unity 集成要点',
        desc: 'Unreal Engine 集成：安装 Wwise Unreal Integration Package → Wwise Picker 拖放绑定 →蓝图或 C++ 调用 AkAudioEvent。Unity 集成：导入 Wwise Unity Integration → AkAmbient / AkEvent 组件挂载到 GameObject → C# 脚本调用。关键注意：①初始化与终止要成对调用；②内存管理 — SoundBank 的 Load/Unload 要配合关卡切换；③多平台验证 — 不同平台的音频输出格式需分别测试。',
        tags: ['UE', 'Unity', 'AkEvent', 'SoundBank'],
      },
      {
        title: '移动端与跨平台适配',
        desc: '移动平台音频限制：①CPU/内存有限 — 控制同时发声数（Voice Count），通常限制在 16-24 个；②文件体积 — 使用压缩格式（Vorbis/opus），背景音乐建议 64-128kbps；③延迟敏感 — 输入响应音效优先级最高。跨平台注意：iOS 用 AAC，Android 用 Vorbis/opus，PC 用无压缩 WAV。在 Wwise 中通过 Conversion Settings 为每个平台配置不同的编码格式和采样率。',
        tags: ['移动端', '压缩', 'Voice Count', '跨平台'],
      },
    ],
  },
  {
    key: 'career',
    title: '大师与作品',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    color: '#f59e0b',
    topics: [
      {
        title: '植松伸夫 — JRPG 音乐的奠基者',
        desc: '《最终幻想》系列御用作曲家，定义了 JRPG 音乐的标准范式。代表作：《最终幻想》系列（FFVI 的《Aria di Mezzo Carattere》、FFVII 的《One-Winged Angel》）。风格特点：宏大的交响编曲 + 精美的主旋律 + 戏剧性的和声进行。他的音乐将游戏从"背景音乐"提升为"独立的音乐艺术作品"。近年创作独立游戏《Forspoken》配乐。',
        tags: ['最终幻想', 'JRPG', '植松伸夫', 'Symphonic'],
      },
      {
        title: 'Hans Zimmer — 影视配乐革命者',
        desc: '好莱坞最具影响力的配乐大师，代表作：《盗梦空间》《星际穿越》《沙丘》。对游戏音乐的影响深远：①低音脉冲（Bwah）音色成为史诗配乐标配；②电子与传统管弦的融合；③极简动机的重复与渐变发展。Zimmer 的团队（Remote Control Productions）成员（如 John Paesano、Tom Holkenborg）也大量参与 AAA 游戏配乐。',
        tags: ['Hans Zimmer', '影视配乐', 'Bwah', 'Remote Control'],
      },
      {
        title: '近藤浩治 — 任天堂的音乐魔术师',
        desc: '《超级马里奥》《塞尔达传说》《星际火狐》系列作曲家。他的音乐理念："音乐不应该只是背景，而应该是游戏体验的一部分。"代表作：Zelda 主旋律（仅用5个音就创造了游戏史上最辨识度的旋律之一）。技术成就：N64 时代用极少的音轨和采样创造丰富听感，是"少即是多"的典范。',
        tags: ['任天堂', '塞尔达', '近藤浩治', '动机写作'],
      },
      {
        title: 'Austin Wintory — 互动音乐的先锋',
        desc: '《风之旅人》（Journey）配乐作曲家，首位获格莱美提名的游戏音乐作曲家。《风之旅人》的音乐系统是互动音乐设计的里程碑：完全根据玩家位置和游戏进度动态编排，没有两个玩家的音乐体验完全相同。他的其他作品：《ABZU》《The Banner Saga》。核心理念：将游戏音乐视为"活的有机体"而非"预录的音频文件"。',
        tags: ['Journey', 'ABZU', '动态音乐', '格莱美'],
      },
    ],
  },
  {
    key: 'resources',
    title: '资源与工具',
    icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1',
    color: '#ef4444',
    topics: [
      {
        title: '免费音色库与采样',
        desc: '高质量免费音源推荐：①Spitfire LABS — 管弦乐/合唱团免费音色；②BBC Symphony Orchestra Discover — 完整管弦乐免费版；③VSCO 2 Chamber Orchestra — 开源管弦乐采样；④Vital — 免费波表合成器（音色质量媲美 Serum）；⑤Piano One — 真实施坦威钢琴采样；⑥Orchestral Tools Layers — 电影级音色免费包。对于独立开发者，这些资源完全足够制作专业级配乐。',
        tags: ['音色库', '免费', '采样', 'Spitfire'],
      },
      {
        title: '学习资源与社区',
        desc: '推荐学习路径：①YouTube — "8-bit Music Theory"（解析游戏音乐理论）、"Alex Moukala"（游戏音乐翻奏与解析）、"Guy Michelmore"（电影配乐教程）；②GDC Vault — 每年 GDC 的游戏音频演讲合集；③Game Audio Network Guild (G.A.N.G.) — 游戏音频行业组织；④books — 《A Composer\'s Guide to Game Music》(Winifred Phillips)；⑤Coursera — Berklee 的 Game Music 课程。',
        tags: ['学习', 'YouTube', 'GDC', 'Berklee'],
      },
      {
        title: '行业工具链推荐',
        desc: '游戏音乐制作人必备工具：DAW: Cubase / Logic Pro / Reaper；音源: Kontakt + Spitfire + Omnisphere；合成器: Serum + Massive X + Vital；混音: iZotope Ozone + Neutron；采样管理: Soundminer；中间件: Wwise（AAA）/ FMOD（独立）；音频修复: iZotope RX；MIDI 编辑: MIDI Monitor + MIDI Ox；乐谱: Dorico / Sibelius。所有工具中，DAW + 1款综合音源 + Wwise/FMOD 是最低配置。',
        tags: ['工具链', 'Kontakt', 'iZotope', '工作流'],
      },
    ],
  },
];

/* ─────────────────── Tab 定义 ─────────────────── */
const tabs = [
  { key: 'all', label: '全部' },
  ...chapters.map(c => ({ key: c.key, label: c.title })),
];

/* ═══════════════════ 组件 ═══════════════════ */
export default function GameMusicHandbookPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);

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

  const filteredChapters = chapters
    .map(ch => ({
      ...ch,
      topics: ch.topics.filter(
        t =>
          !query ||
          t.title.includes(query) ||
          t.desc.includes(query) ||
          t.tags.some(tag => tag.includes(query)) ||
          ch.title.includes(query)
      ),
    }))
    .filter(ch => ch.topics.length > 0);

  const totalTopics = chapters.reduce((sum, ch) => sum + ch.topics.length, 0);

  return (
    <div className="max-w-[900px] mx-auto py-8 px-6 w-full">
      {/* 面包屑导航 */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link to="/audio" className="hover:text-gray-300 transition-colors">音频设计中心</Link>
        <span>/</span>
        <Link to="/audio/music" className="hover:text-gray-300 transition-colors">音乐百科全书</Link>
        <span>/</span>
        <span style={{ color: COLOR }}>游戏音乐设计师手册</span>
      </nav>

      {/* 页面头部 */}
      <div className="mb-10">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl leading-none">🎮</span>
          <div>
            <h1 className="text-5xl font-extrabold mb-3" style={{ color: COLOR }}>
              游戏音乐设计师手册
            </h1>
            <p className="text-sm text-gray-400 tracking-wide">
              从乐理基础到AI工作流 · {totalTopics} 篇专题 · 8 大章节
            </p>
          </div>
        </div>
        {/* 主题说明 */}
        <div
          className="mt-6 rounded-xl p-5 border"
          style={{
            borderColor: `${COLOR}20`,
            background: `linear-gradient(135deg, ${COLOR}08 0%, ${COLOR}04 60%, transparent 100%)`,
          }}
        >
          <p className="text-sm text-gray-300 leading-relaxed">
            本手册从<strong className="text-white">乐理基础</strong>出发，经过<strong className="text-white">游戏音乐类型</strong>、<strong className="text-white">游戏音乐设计方法论</strong>、<strong className="text-white">AI音频工作流程</strong>、<strong className="text-white">DAW 制作实战</strong>、<strong className="text-white">音频引擎集成</strong>，到<strong className="text-white">大师作品赏析</strong>与<strong className="text-white">工具资源</strong>推荐——完整覆盖游戏音乐设计师的知识体系。无论你是入行新人还是资深从业者，都能找到有价值的参考。
          </p>
        </div>
      </div>

      {/* 统计栏 */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {[
          { num: '8', label: '核心章节', color: '#ec4899' },
          { num: String(totalTopics), label: '专题文章', color: '#a855f7' },
          { num: '4', label: '乐理基础', color: '#06b6d4' },
          { num: '4', label: '设计方法', color: '#22c55e' },
          { num: '5', label: 'AI工作流', color: '#8b5cf6' },
          { num: '8', label: '音乐类型', color: '#f97316' },
          { num: '4', label: '大师赏析', color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} className="rounded-lg py-2 px-1 text-center" style={{ background: `linear-gradient(135deg, ${stat.color}25, ${stat.color}08)`, border: `1px solid ${stat.color}30` }}>
            <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.num}</div>
            <div className="text-[10px] text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* 搜索栏 */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="搜索专题、标签、关键词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-[#ec4899]40 transition-colors"
          />
        </div>
      </div>

      {/* 分类导航栏 */}
      <div className="sticky top-16 z-10 -mx-6 px-6 pt-3 pb-3 bg-[#0a0a0f] border-b border-[rgba(255,255,255,0.04)] mb-10">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            const tabColor = chapters.find(c => c.key === tab.key)?.color || '#ec4899';
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className="text-xs px-3.5 py-1.5 rounded-lg transition-all duration-200 cursor-pointer font-medium"
                style={{
                  background: isActive ? tabColor : 'rgba(255,255,255,0.04)',
                  color: isActive ? '#fff' : tabColor,
                  boxShadow: isActive ? `0 2px 14px ${tabColor}50` : 'none',
                  border: 'none',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 章节渲染 */}
      {filteredChapters.map(ch => (
        <div key={ch.key} id={ch.key} className="mb-14 scroll-mt-36">
          {/* 章节标题 */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${ch.color}15`, border: `1px solid ${ch.color}30` }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={ch.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={ch.icon} />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: ch.color }}>
                {ch.title}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">{ch.topics.length} 篇专题</p>
            </div>
            <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${ch.color}30, transparent)` }} />
          </div>

          {/* 专题卡片列表 */}
          <div className="flex flex-col gap-4">
            {ch.topics.map((topic, idx) => {
              const topicId = `${ch.key}-${idx}`;
              const isExpanded = expandedTopic === topicId;
              return (
                <div
                  key={idx}
                  className="rounded-xl border overflow-hidden transition-all duration-300"
                  style={{
                    borderColor: isExpanded ? `${ch.color}40` : `${ch.color}18`,
                    boxShadow: isExpanded ? `0 0 20px ${ch.color}10` : 'none',
                    background: `linear-gradient(135deg, ${isExpanded ? ch.color + '32' : ch.color + '28'}, ${ch.color}06)`,
                  }}
                >
                  {/* 卡片头部 */}
                  <button
                    onClick={() => setExpandedTopic(isExpanded ? null : topicId)}
                    className="w-full text-left p-5 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="text-xs font-mono font-bold px-2 py-0.5 rounded"
                            style={{ background: `${ch.color}15`, color: ch.color, border: `1px solid ${ch.color}25` }}
                          >
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <h3 className="text-base font-bold text-white">{topic.title}</h3>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mt-1">
                          {topic.desc}
                        </p>
                      </div>
                      <svg
                        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ch.color}
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="flex-shrink-0 mt-2 transition-transform duration-300"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>

                    {/* 标签 */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {topic.tags.map((tag, ti) => (
                        <span
                          key={ti}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: `${ch.color}12`, color: `${ch.color}cc`, border: `1px solid ${ch.color}20` }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </button>

                  {/* 展开内容 */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t" style={{ borderColor: `${ch.color}15` }}>
                      <div className="pt-4">
                        {/* 关键要点 */}
                        <div className="mt-4 p-4 rounded-lg" style={{ background: `${ch.color}06`, border: `1px solid ${ch.color}12` }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: ch.color }}>💡 关键要点</p>
                          <ul className="space-y-2">
                            {topic.desc.split(/[。！？]/).filter(s => s.trim().length > 10).slice(0, 4).map((point, pi) => (
                              <li key={pi} className="flex items-start gap-2 text-xs text-gray-400">
                                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: ch.color }} />
                                <span>{point.trim()}。</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* 相关链接 */}
                        <div className="flex gap-2 mt-4">
                          <a
                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.title)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                            style={{ borderColor: '#ff000030', color: '#ff6b6b', background: '#ff000008' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" /></svg>
                            YouTube
                          </a>
                          <a
                            href={`https://music.163.com/#/search/m/?s=${encodeURIComponent(topic.title)}`}
                            target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                            style={{ borderColor: '#c20c0c30', color: '#e85d5d', background: '#c20c0c08' }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" /></svg>
                            网易云
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* 空状态 */}
      {filteredChapters.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-sm">未找到匹配的专题内容</p>
        </div>
      )}

      {/* 底部导航 */}
      <div className="mt-10 flex items-center justify-between">
        <Link
          to="/audio/music"
          className="inline-flex items-center gap-1.5 text-sm transition-all duration-200 hover:gap-2.5"
          style={{ color: COLOR }}
        >
          ← 返回音乐百科全书
        </Link>
        <Link
          to="/audio/sound-effects"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          前往音效管理中心 →
        </Link>
      </div>
    </div>
  );
}
