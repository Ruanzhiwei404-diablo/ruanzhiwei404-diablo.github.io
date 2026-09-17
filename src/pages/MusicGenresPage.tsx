import { useState } from 'react';
import { Link } from 'react-router-dom';

const GENRE_COLORS: Record<string, string> = {
  classical: '#a855f7',
  jazz: '#06b6d4',
  electronic: '#8b5cf6',
  rock: '#ef4444',
  film: '#f59e0b',
  world: '#22c55e',
  pop: '#ec4899',
};

const sections = [
  {
    key: 'classical',
    label: '🎹 古典音乐',
    icon: 'M9 19V6l12-3v13M9 19c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z',
    items: [
      {
        name: '巴洛克音乐',
        en: 'Baroque Music',
        era: '1600-1750',
        origin: '🇮🇹 意大利',
        tags: ['🧘 宁静', '👑 优雅', '🏛️ 庄重', '✨ 华丽'],
        history: '起源于17世纪初的意大利，"巴洛克"一词源自葡萄牙语"barroco"，意为不规则的珍珠。这一时期的音乐以复杂的对位法、华丽的装饰音和强烈的情感表达为特征，宗教音乐与世俗音乐并行发展。',
        instruments: ['羽管键琴', '管风琴', '弦乐（小提琴家族）', '通奏低音', '自然小号'],
        instrumentsDetail: '以羽管键琴（大键琴）、管风琴、弦乐器（小提琴家族）为主；通奏低音（Basso Continuo）是核心特征，由大提琴或大管与键盘乐器共同承担；管乐使用自然小号、圆号；乐队规模较小但编制精致，复调织体丰富。',
        artists: ['J.S. 巴赫', '维瓦尔第', '亨德尔', '泰勒曼'],
      },
      {
        name: '古典主义',
        en: 'Classical Period',
        era: '1750-1820',
        origin: '🇦🇹 维也纳',
        tags: ['😊 欢快', '👑 优雅', '☀️ 明朗', '🎯 平衡'],
        history: '启蒙运动时期的产物，追求理性、清晰与形式的完美。维也纳成为欧洲音乐中心，奏鸣曲式在这一时期成熟，交响曲、弦乐四重奏等体裁确立标准形式。',
        instruments: ['钢琴', '管弦乐队标准化编制', '木管乐器', '铜管乐器', '打击乐'],
        instrumentsDetail: '管弦乐队标准化编制（弦乐+木管+铜管+打击乐）；钢琴取代羽管键琴成为主要键盘乐器；追求音色的平衡与透明感；力度对比（强弱变化）成为重要表现手段，奏鸣曲式要求精密的声部平衡。',
        artists: ['莫扎特', '海顿', '贝多芬', '舒伯特'],
      },
      {
        name: '浪漫主义',
        en: 'Romantic Period',
        era: '1820-1900',
        origin: '🇪🇺 欧洲',
        tags: ['🔥 激昂', '💕 浪漫', '🎭 戏剧性', '🌙 诗意'],
        history: '对古典主义理性的反叛，强调个人情感的表达。文学、绘画与音乐深度融合，标题音乐兴起，民族乐派在各国的兴起是这一时期的重要特征。',
        instruments: ['大幅扩展的管弦乐队', '铜管乐器', '竖琴', '英国管', '色彩性乐器'],
        instrumentsDetail: '管弦乐队规模大幅扩展，从莫扎特时代的30人增至马勒时代的100人以上；铜管乐器获得重要地位，圆号与小号使用更频繁；竖琴、英国管、巴松等色彩性乐器加入；追求音色的丰富变化与戏剧性的动态对比，音色本身成为表达情感的重要手段。',
        artists: ['肖邦', '李斯特', '柴可夫斯基', '勃拉姆斯', '瓦格纳'],
      },
    ],
  },
  {
    key: 'jazz',
    label: '🎷 爵士蓝调',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z',
    items: [
      {
        name: '蓝调',
        en: 'Blues',
        era: '1890s-今',
        origin: '🇺🇸 美国南部',
        tags: ['😢 忧郁', '💙 深情', '🎸 原始', '🌙 灵魂'],
        history: '19世纪末起源于美国密西西比三角洲的非裔美国人社区，是爵士乐、摇滚乐、R&B的根基。蓝调表达了被奴役和压迫人民的苦难与希望，12小节蓝调形式成为西方流行音乐最重要的和声结构之一。',
        instruments: ['原声吉他', '口琴', '电吉他', '电贝斯', '滑棒吉他（Slide Guitar）'],
        instrumentsDetail: '传统三角洲蓝调：原声吉他+口琴的最简配置；芝加哥蓝调：电吉他+电贝斯+鼓+口琴+钢琴的完整编制；蓝调摇滚：加入更多失真效果和全乐队编制。滑棒吉他（Slide Guitar）是标志性技巧，用玻璃或金属管在弦上滑动产生独特哭泣般的音色。',
        artists: ['B.B. King', 'Muddy Waters', 'Robert Johnson', 'Stevie Ray Vaughan'],
      },
      {
        name: '爵士乐',
        en: 'Jazz',
        era: '1890s-今',
        origin: '🇺🇸 新奥尔良',
        tags: ['🎷 即兴', '👔 优雅', '🎵 摇摆', '✨ 自由'],
        history: '19世纪末20世纪初诞生于美国新奥尔良，是非洲节奏、蓝调、拉格泰姆与欧洲和声的融合。爵士乐强调即兴演奏、切分节奏和独特的摇摆感，被称为"美国的古典音乐"。',
        instruments: ['小号/萨克斯', '钢琴', '贝斯', '鼓', '吉他'],
        instrumentsDetail: '传统爵士五重奏：小号/萨克斯+钢琴+贝斯+鼓+吉他；大乐队编制：铜管组（小号、长号）+木管组（萨克斯家族）+节奏组；波普爵士：小型组合强调即兴技巧；融合爵士：加入电钢琴、电贝斯和合成器等电声乐器，音色更加多元化。',
        artists: ['Louis Armstrong', 'Miles Davis', 'John Coltrane', 'Duke Ellington', 'Charlie Parker'],
      },
      {
        name: '冷爵士 / 巴萨诺瓦',
        en: 'Cool Jazz / Bossa Nova',
        era: '1950s-今',
        origin: '🇧🇷 巴西 / 🇺🇸 美国',
        tags: ['🧘 放松', '👔 优雅', '💕 浪漫', '🌴 热带'],
        history: '冷爵士是1950年代对波普爵士激烈风格的反叛，追求更柔和、更理性的声音。Bossa Nova诞生于1950年代末的巴西，将桑巴节奏与爵士和声结合，Jobim与Getz的合作将其推向世界。',
        instruments: ['尼龙弦吉他', '长笛/萨克斯', '钢琴三重奏', '轻柔打击乐', '葡萄牙语演唱'],
        instrumentsDetail: '冷爵士：柔和的小号音色（使用弱音器）、钢琴三重奏为主、较少的激烈即兴，整体氛围克制而优雅；巴萨诺瓦：尼龙弦吉他提供节奏骨架，轻柔的打击乐（如邦戈鼓）加入微妙律动，长笛或萨克斯吹奏温暖旋律，葡萄牙语演唱带来热带气息。',
        artists: ['Antônio Carlos Jobim', 'Stan Getz', 'Bill Evans', 'João Gilberto'],
      },
    ],
  },
  {
    key: 'electronic',
    label: '🎛️ 电子音乐',
    icon: 'M12 3v18M8 7c0-2.2 1.8-4 4-4s4 1.8 4 4M8 17c0 2.2 1.8 4 4 4s4-1.8 4-4M3 12h18M7 8c-2.2 0-4 1.8-4 4s1.8 4 4 4M17 8c2.2 0 4 1.8 4 4s-1.8 4-4 4',
    items: [
      {
        name: '合成器流行 / 电子',
        en: 'Synth-pop / Electronic',
        era: '1970s-今',
        origin: '🇩🇪 德国 / 🇬🇧 英国',
        tags: ['🔮 迷幻', '🤖 未来感', '💃 律动', '⚡ 能量'],
        history: '1970年代由Kraftwerk等德国乐队开创，使用合成器、鼓机和音序器创造全新声音。1980年代synth-pop达到商业巅峰，影响了从舞曲到独立音乐的各种流派。',
        instruments: ['模拟/数字合成器', '鼓机（TR-808/909）', '音序器', '声码器', '贝斯合成器'],
        instrumentsDetail: '模拟/数字合成器（Moog、Roland、Yamaha）创造全新的电子音色；鼓机（Roland TR-808/909）提供精准的节拍基础；音序器控制旋律与节奏的自动化演奏；人声通过声码器（Vocoder）处理产生机器人般的电子人声（如Kraftwerk）；贝斯合成器提供低频律动。',
        artists: ['Kraftwerk', 'Depeche Mode', 'New Order', 'Daft Punk'],
      },
      {
        name: '浩室 / EDM',
        en: 'House / EDM',
        era: '1980s-今',
        origin: '🇺🇸 芝加哥',
        tags: ['💃 律动', '⚡ 能量', '🎉 派对', '🔮 迷幻'],
        history: '1980年代诞生于芝加哥的地下俱乐部，由DJ Frankie Knuckles开创。以4/4拍、每分钟120-130拍的速度为特征。EDM（电子舞曲）是21世纪对house、trance、dubstep等的商业统称。',
        instruments: ['Four-on-the-floor鼓点', '合成器贝斯', '效果器', '人声采样', 'Build-up/Drop结构'],
        instrumentsDetail: '标志性的"four-on-the-floor"鼓点（底鼓每拍一下，速度120-130 BPM）是核心律动；合成器贝斯线条提供低频驱动力；渐强（Build-up）与跌落（Drop）结构制造情绪高潮；大量使用混响、延迟等效果器营造空间感；人声采样与切碎处理增添层次。',
        artists: ['Avicii', 'David Guetta', 'Calvin Harris', 'Martin Garrix'],
      },
      {
        name: '氛围 / IDM',
        en: 'Ambient / IDM',
        era: '1970s-今',
        origin: '🇬🇧 英国',
        tags: ['🌫️ 氛围', '🧘 宁静', '🔮 未来感', '🎨 实验'],
        history: '由Brian Eno在1970年代开创，追求"既可被忽略，又能被关注"的音乐。IDM（智能舞曲）是1990年代英国对实验电子的称呼，特点是复杂的节奏与抽象的声音设计。',
        instruments: ['缓慢变化的和弦', '大量混响与延迟', '碎拍（breakbeats）', 'Glitch音效', '复杂合成器音色'],
        instrumentsDetail: '氛围音乐（Ambient）：缓慢变化的和弦铺底、无明确节拍、大量混响与延迟营造空间感，追求"既可被忽略，又能被关注"的聆听体验；IDM（智能舞曲）：碎拍（breakbeats）、Glitch音效、不规则节拍、复杂的合成器音色设计，将实验性与可听性完美融合。',
        artists: ['Brian Eno', 'Aphex Twin', 'Tycho', 'Bonobo'],
      },
    ],
  },
  {
    key: 'rock',
    label: '🎸 摇滚金属',
    icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    items: [
      {
        name: '经典摇滚',
        en: 'Classic Rock',
        era: '1950s-1980s',
        origin: '🇺🇸 美国 / 🇬🇧 英国',
        tags: ['🔥 激昂', '✊ 叛逆', '💪 力量', '⚡ 活力'],
        history: '1950年代由节奏布鲁斯、乡村音乐与福音音乐融合诞生。摇滚乐代表了战后青年文化的崛起，从Chuck Berry的吉他摇滚到Beatles的英伦入侵，再到迷幻摇滚、前卫摇滚等分支。',
        instruments: ['电吉他（主音+节奏）', '电贝斯', '鼓', '键盘/合成器', '人声'],
        instrumentsDetail: '经典四大件：电吉他（分为主音吉他Lead和节奏吉他Rhythm）、电贝斯、鼓、人声构成核心编制。后期加入键盘、合成器拓展音色层次。强调电吉他的失真音色与独奏（Solo），强有力的节奏组（贝斯+鼓）是音乐的骨架，人声从低吟到嘶吼充满表现力。',
        artists: ['The Beatles', 'Led Zeppelin', 'Pink Floyd', 'Queen', 'The Rolling Stones'],
      },
      {
        name: '重金属',
        en: 'Heavy Metal',
        era: '1960s-今',
        origin: '🇬🇧 英国 / 🇺🇸 美国',
        tags: ['⚔️ 激烈', '🖤 黑暗', '🤘 力量', '🔥 激情'],
        history: '1960年代末由Black Sabbath、Deep Purple和Led Zeppelin开创。重金属追求更大的音量、更厚重的音色和更激进的情绪表达。后续发展出激流金属、死亡金属、力量金属等众多分支。',
        instruments: ['高增益失真电吉他', '五弦/七弦电吉他', '快速双踩鼓', '低沉贝斯', '嘶吼/歌剧唱腔'],
        instrumentsDetail: '大量使用高增益失真电吉他，音色厚重而具攻击性；五弦或七弦电吉他扩展低音区，Riff（重复段落）是核心驱动力；快速的双踩鼓点（Double Kick）提供密集的节奏火力；低沉有力的贝斯支撑整体厚度；人声从嘶吼、低吼到歌剧式高音唱腔，情感表达极致。',
        artists: ['Metallica', 'Iron Maiden', 'Black Sabbath', 'Slayer', 'Judas Priest'],
      },
      {
        name: '朋克摇滚',
        en: 'Punk Rock',
        era: '1970s-今',
        origin: '🇬🇧 英国 / 🇺🇸 美国',
        tags: ['✊ 叛逆', '⚡ 能量', '🎸 原始', '🏙️ 街头'],
        history: '1970年代中期在英国和美国兴起，对华丽摇滚和前卫摇滚的过度技术化进行反叛。"三和弦革命"追求最简化的音乐形式，DIY精神和反建制态度是其核心。',
        instruments: ['快速粗糙电吉他', '简单直接鼓点（4/4拍高速）', '同步贝斯与底鼓', '呼喊咆哮人声', '短小精悍歌曲（2-3分钟）'],
        instrumentsDetail: '快速、粗糙、高失真度的电吉他演奏，和弦简单直接（常只用三和弦）；简单直接的鼓点，通常是4/4拍高速进行；贝斯与底鼓同步推进形成强力节奏；人声以呼喊、咆哮为主，不做作修饰；歌曲短小精悍（通常2-3分钟），反对华丽复杂的前卫摇滚风格。',
        artists: ['Sex Pistols', 'The Ramones', 'The Clash', 'Green Day'],
      },
      {
        name: '垃圾摇滚',
        en: 'Grunge',
        era: '1980s-1990s',
        origin: '🇺🇸 西雅图',
        tags: ['😤 愤怒', '😢 忧郁', '💪 力量', '🌧️ 阴郁'],
        history: '1980年代中期诞生于西雅图，融合朋克的愤怒、重金属的厚重和独立摇滚的旋律感。Nirvana的《Nevermind》(1991)将Grunge推向主流，成为90年代美国青年文化的代表。',
        instruments: ['厚重失真吉他', '极端音量动态变化', '旋律化清音与失真对比', '黑暗贝斯线条', '有力但不过于复杂的鼓'],
        instrumentsDetail: '厚重的失真吉他（类似金属但更脏、更不精致）；极端的音量动态变化（从安静到爆发的"静→爆"对比）；旋律化的清音段落与失真段落形成鲜明对比；贝斯线条突出且黑暗，带有蓝调影响；鼓点有力但不过于复杂，服务于歌曲整体的情绪张力。',
        artists: ['Nirvana', 'Pearl Jam', 'Soundgarden', 'Alice in Chains'],
      },
    ],
  },
  {
    key: 'film',
    label: '🎬 影视游戏',
    icon: 'M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z',
    items: [
      {
        name: '电影配乐',
        en: 'Film Score',
        era: '1930s-今',
        origin: '🇺🇸 好莱坞',
        tags: ['🎬 史诗', '😢 感人', '😰 紧张', '✨ 壮丽'],
        history: '电影配乐诞生于1920年代末的有声电影时代，Max Steiner的《金刚》(1933)确立了现代电影配乐的基本形式。从古典交响到电子实验，电影音乐已成为20世纪最重要的音乐体裁之一。',
        instruments: ['大型交响乐团', '电子合成器', '世界民族乐器', '灵活编制变化', '合唱团'],
        instrumentsDetail: '以大型交响乐团为基础，弦乐组提供情感骨架，铜管营造力量与气势，木管增添色彩与细腻；结合电子合成器创造特殊音效（如Hans Zimmer的标志性低音Bwah）；大量运用世界民族乐器（如二胡、塔布拉、迪吉里杜管）；根据画面情绪灵活变化编制规模，从独奏到百人交响。',
        artists: ['John Williams', 'Hans Zimmer', '久石让', 'Ennio Morricone', 'Danny Elfman'],
      },
      {
        name: '游戏配乐',
        en: 'Video Game Music',
        era: '1980s-今',
        origin: '🎮 全球',
        tags: ['🎮 史诗', '😰 紧张', '⚔️ 冒险', '📟 怀旧'],
        history: '从1980年代8-bit芯片音乐发展至今，游戏音乐已成为当代最具影响力的音乐形式之一。日本作曲家（植松伸夫、近藤浩治）奠定了JRPG音乐传统，西方管弦乐编制与电子音乐的融合创造了独特的互动音乐体验。',
        instruments: ['早期芯片音源（Square/Triangle/Noise）', '完整交响乐团', '电子合成器', '世界民族乐器', '循环音乐（Loop）设计'],
        instrumentsDetail: '早期：芯片音源（Square波、Triangle波、噪声通道）的极简主义，在有限硬件条件下创造无限可能（如8-bit经典）；现代：完整交响乐团+电子合成器+世界民族乐器全方位融合；独特的"循环音乐"（Loop）设计适应游戏交互；互动音乐系统根据游戏状态动态变化，是游戏配乐区别于传统配乐的核心特征。',
        artists: ['植松伸夫', '近藤浩治', '下村阳子', 'Jeremy Soule', 'Austin Wintory'],
      },
      {
        name: '日系配乐',
        en: 'Japanese Score',
        era: '1980s-今',
        origin: '🇯🇵 日本',
        tags: ['🌸 唯美', '📖 叙事', '🎋 东方', '💚 治愈'],
        history: '日本配乐深受西方古典与现代电子音乐影响，同时保留了独特的东方美学。从宫崎骏动画到黑泽明电影，从JRPG到视觉小说，日系配乐以其精致的旋律线条和丰富的情感层次闻名世界。',
        instruments: ['钢琴与小提琴对话式旋律', '尺八、三味线、太鼓', '电子合成器梦幻音色', '合唱团营造史诗感', '细腻动态编曲'],
        instrumentsDetail: '钢琴与小提琴的对话式旋律（如久石让的标志性写法）是其灵魂；民族乐器（尺八、三味线、太鼓、神乐铃）与西方管弦乐有机融合；电子合成器创造梦幻般的音色铺底；合唱团在高潮段落营造史诗感和神圣感；编曲注重细腻的动态变化，从极简独奏到宏大管弦，情绪层次极为丰富。',
        artists: ['久石让', '梅林茂', '川井宪次', '梶浦由记', '泽野弘之'],
      },
      {
        name: '中国风配乐',
        en: 'Chinese Style Score',
        era: '2000s-今',
        origin: '🇨🇳 中国',
        tags: ['🎋 古风', '🌫️ 意境', '🖋️ 诗意', '🏔️ 大气'],
        history: '融合中国传统音乐元素与现代电影配乐技法的独特风格。从赵季平的民族交响到谭盾的"有机音乐"，中国风配乐在电影、游戏、电视剧等领域都有广泛应用。',
        instruments: ['古筝', '二胡', '笛子', '琵琶', '中国大鼓、锣、编钟'],
        instrumentsDetail: '民族乐器（古筝、二胡、笛子、琵琶、箫）与西洋管弦乐融合，中西合璧；五声音阶（宫商角徵羽）与西方和声体系结合，形成独特调性色彩；打击乐使用中国大鼓、锣、编钟营造庄严气势；人声吟唱或戏曲唱腔元素增添文化韵味；空灵的女声独唱常用于唯美段落。',
        artists: ['赵季平', '谭盾', '阿鲲', '林海', '陈致逸'],
      },
      {
        name: '恐怖配乐',
        en: 'Horror Score',
        era: '1930s-今',
        origin: '🎬 好莱坞 / 全球',
        tags: ['😱 恐惧', '😰 不安', '🔮 悬疑', '👻 诡异'],
        history: '1930年代环球怪物电影（《德古拉》《科学怪人》）奠定基调，Bernard Herrmann在《惊魂记》(1960)中用弦乐尖叫重新定义恐怖音效。恐怖配乐追求生理与心理的双重恐惧，是电影音乐中最具实验性的分支。',
        instruments: ['不和谐音程（三全音、小二度）', '次声波（18-20Hz）', '反向演奏', 'Prepared Piano（加料钢琴）', '电子合成器冰冷氛围'],
        instrumentsDetail: '不和谐音程（三全音"魔鬼音程"、小二度）制造本能不安感；18-20Hz次声波引发生理恐惧（观众感到胸闷却不知为何）；反向演奏、加料钢琴（Prepared Piano）在琴弦间放置异物创造陌生音色；电子合成器营造冰冷诡异氛围；"静→爆"的Jump Scare结构通过突然的音量变化打破预期。',
        artists: ['Bernard Herrmann', 'John Carpenter', 'Akira Yamaoka', 'Joseph Bishara', 'Goblin'],
      },
    ],
  },
  {
    key: 'world',
    label: '🌍 世界音乐',
    icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z',
    items: [
      {
        name: '史诗 / 中世纪',
        en: 'Epic / Medieval Score',
        era: '2000s-今',
        origin: '🏰 欧洲 / 现代',
        tags: ['⚔️ 史诗', '👑 庄严', '🔮 神秘', '⚡ 战斗'],
        history: '以中世纪、奇幻、史诗为题材的电影和游戏配乐风格。从《指环王》到《权力的游戏》，从Two Steps From Hell的预告片音乐到各类奇幻RPG，这种风格追求宏大的气势和强烈的情感冲击。',
        instruments: ['大型交响乐团+电子混合', '拉丁文圣咏合唱', '竖琴、鲁特琴、风笛', '战鼓与定音鼓', '辉煌铜管+急促弦乐'],
        instrumentsDetail: '大型交响乐团与电子音乐混合，营造宏大的史诗气势；合唱团（尤其是拉丁文圣咏）增添神圣庄严感；中世纪古乐器（竖琴、鲁特琴、风笛）赋予历史厚重感；战鼓与定音鼓营造紧张战斗氛围；辉煌的铜管音色与急促的弦乐节奏制造强烈的情感冲击。',
        artists: ['Two Steps From Hell', 'Audiomachine', 'Hans Zimmer', 'Howard Shore', 'Ramin Djawadi'],
      },
      {
        name: '凯尔特 / 爱尔兰',
        en: 'Celtic / Irish',
        era: '古代-今',
        origin: '🇮🇪 爱尔兰 / 苏格兰',
        tags: ['🍀 神秘', '🌲 自然', '✨ 空灵', '📜 古老'],
        history: '源自爱尔兰、苏格兰、威尔士、布列塔尼等凯尔特地区的传统音乐，有着数千年的历史。以口传心授的方式流传，与凯尔特神话、民间传说紧密相连。在《指环王》《巫师3》《刺客信条》等游戏中广泛应用。',
        instruments: ['风笛（Uilleann/Highland pipes）', '爱尔兰长笛', '锡口笛', '小提琴（Fiddle）', '宝思兰鼓（Bodhrán）', '竖琴'],
        instrumentsDetail: '风笛（Uilleann pipes、Highland pipes）是灵魂乐器，提供持续低音与装饰音；爱尔兰长笛、锡口笛（Tin Whistle）吹奏灵动旋律；小提琴（Fiddle）以独特的弓法演奏快速舞曲；宝思兰鼓（Bodhrán）提供节奏脉搏；竖琴增添空灵色彩；女声吟唱（如Enya式的空灵唱腔）营造神秘氛围；多利亚调式与混合利底亚调式是常用音阶。',
        artists: ['Enya', 'Loreena McKennitt', 'The Chieftains', 'Altan', 'Clannad'],
      },
      {
        name: '北欧 / 维京',
        en: 'Nordic / Viking',
        era: '古代-今',
        origin: '🇸🇪 斯堪的纳维亚',
        tags: ['⚔️ 史诗', '❄️ 寒冷', '🔮 神秘', '🛡️ 战斗'],
        history: '源自斯堪的纳维亚半岛的古老传统，与维京文化、北欧神话、萨满信仰紧密相关。现代北欧音乐复兴运动（Wardruna、Heilung）将古代乐器与仪式音乐带回大众视野，在《战神》《英灵神殿》《巫师》等游戏中大量使用。',
        instruments: ['塔戈哈拉普（Tagelharpa）', '胡斯（Hurdy-gurdy）', '鹿皮鼓', '骨笛', '山羊角号', '喉音唱法'],
        instrumentsDetail: '古代北欧乐器是核心：塔戈哈拉普（Tagelharpa，弓弦擦奏的共鸣弦乐器）产生原始而深沉的音色；胡斯（Hurdy-gurdy，手摇弦琴）提供持续低音与旋律；鹿皮鼓、骨笛、山羊角号营造远古仪式感；喉音唱法（Khoomei）模拟自然之声；低沉的男声合唱与模拟风雪的采样增添苍凉氛围。',
        artists: ['Wardruna', 'Heilung', 'Danheim', 'Eivør', 'SKÁLD'],
      },
      {
        name: '斯拉夫 / 东欧',
        en: 'Slavic / Eastern European',
        era: '古代-今',
        origin: '🇷🇺 俄罗斯 / 东欧',
        tags: ['😢 忧郁', '💙 深情', '🎭 民族', '🌨️ 史诗'],
        history: '源自俄罗斯、波兰、乌克兰、巴尔干等斯拉夫地区的传统音乐，深受东正教圣咏与民间歌谣影响。俄罗斯民族乐派（强力集团）将这种风格带入古典音乐殿堂，在《地铁》《巫师》《原子之心》等东欧游戏中大量使用。',
        instruments: ['巴拉莱卡琴', '多姆拉琴', '手风琴', '排箫', '大提琴与低音提琴', '合唱'],
        instrumentsDetail: '巴拉莱卡琴（Balalaika，三角形体琴）是标志性的拨弦乐器；多姆拉琴（Domra）提供明亮的高音旋律；手风琴（Bayan）增添厚重的和弦与节奏；排箫（Pan Flute）吹奏悠远古朴的旋律；低沉浑厚的大提琴与低音提琴提供深沉的音色基础；宏大的合唱（受俄罗斯东正教圣咏影响）营造庄严感；五声音阶与弗里几亚调式结合，旋律线条哀婉动人。',
        artists: ['Tchaikovsky', 'Mussorgsky', 'Rimsky-Korsakov', 'Borodin', 'Shostakovich'],
      },
      {
        name: '地中海 / 弗拉门戈',
        en: 'Mediterranean / Flamenco',
        era: '古代-今',
        origin: '🇪🇸 西班牙 / 希腊',
        tags: ['☀️ 阳光', '💃 热情', '💕 浪漫', '🏛️ 异域'],
        history: '源自地中海沿岸（西班牙、希腊、意大利）的音乐传统。弗拉门戈诞生于西班牙安达卢西亚的吉普赛人社区，融合了阿拉伯、犹太、印度与西班牙本土元素。在《刺客信条》《古墓丽影》《文明》等游戏中经常出现。',
        instruments: ['古典/弗拉门戈吉他', '卡洪鼓（Cajón）', '响板', '布祖基琴', '乌德琴', '复杂节奏型（Bulerías/Soleá）'],
        instrumentsDetail: '弗拉门戈吉他：快速指法（Picado）、刮奏（Rasgueado）和击板技巧是其灵魂；卡洪鼓（Cajón）提供节奏基础；响板（Castanets）增添清脆的节拍；希腊的布祖基琴与中东的乌德琴带来异域风情；热情的女声吟唱与观众的呼喊（Olé!）形成互动；弗里几亚属七和弦（Phrygian Dominant）营造西班牙风格；复杂的节奏型（如Bulerías12拍、Soleá4拍）是其核心特征。',
        artists: ['Paco de Lucía', 'Yanni', 'Armik', 'Jesse Cook', 'Camarón de la Isla'],
      },
      {
        name: '格里高利圣咏',
        en: 'Gregorian Chant',
        era: '中世纪-今',
        origin: '🇻🇦 欧洲中世纪',
        tags: ['⛪ 神圣', '👑 庄严', '📜 古老', '🕯️ 神秘'],
        history: '中世纪天主教礼仪音乐，以教皇格里高利一世命名，约形成于9-10世纪。单声部、无伴奏的男声合唱，是西方古典音乐的源头。在现代影视游戏中常用于表现教堂、圣殿、神圣仪式、中世纪场景。',
        instruments: ['纯人声（男声为主）', '无乐器伴奏', '单声部旋律（Monophonic）', '拉丁文演唱', '教会调式', '教堂混响'],
        instrumentsDetail: '纯人声（以男声为主），完全无乐器伴奏（A Cappella）；单声部旋律（Monophonic），所有声部齐唱同一旋律；拉丁文演唱，歌词取自圣经经文；自由的节奏（无固定小节线划分），旋律如波浪般起伏；教会调式（多利亚、弗里几亚、利底亚等）取代大小调系统；在石质教堂中的自然混响赋予神圣空灵的质感；现代变体（如Enigma、Era）将其与电子节拍融合。',
        artists: ['Benedictine Monks', 'Hildegard von Bingen', 'Enigma', 'Era', 'Libera'],
      },
      {
        name: '拉丁音乐',
        en: 'Latin Music',
        era: '1900s-今',
        origin: '🇨🇺 古巴 / 🇧🇷 巴西',
        tags: ['🔥 热情', '💃 律动', '🌴 异域', '💕 感性'],
        history: '融合非洲节奏、欧洲和声与美洲本土音乐元素。包括古巴的Son和Salsa、巴西的Samba和Bossa Nova、阿根廷的Tango等。切分节奏与复杂的多层打击乐是其标志。',
        instruments: ['丰富的打击乐组', '尼龙弦吉他', '小号/长号（Salsa）', '手风琴（Tango）', '贝斯与钢琴'],
        instrumentsDetail: '丰富的打击乐组（康加鼓Conga、邦戈鼓Bongo、天巴鼓Timbales、克拉维斯Claves）构成节奏骨架；尼龙弦吉他或西班牙吉他提供和声与旋律；Salsa风格中，小号和长号吹奏激烈的铜管旋律线条；探戈（Tango）中，班多钮手风琴（Bandoneón）是灵魂乐器；贝斯与钢琴/键盘提供和声基础；切分节奏与复合节拍是所有拉丁音乐的共同特征。',
        artists: ['Buena Vista Social Club', 'Astor Piazzolla', 'Celia Cruz', 'Santana'],
      },
      {
        name: '印度 / 中东',
        en: 'Indian / Middle Eastern',
        era: '古代-今',
        origin: '🇮🇳 印度 / 🇹🇷 中东',
        tags: ['🔮 神秘', '🧘 宁静', '🏛️ 古老', '🎭 精神'],
        history: '印度古典音乐拥有数千年的历史，以拉格（Raga，旋律框架）和塔拉（Tala，节奏循环）为基础。阿拉伯音乐对欧洲中世纪音乐有深远影响，其马卡姆音阶系统复杂精妙。',
        instruments: ['西塔琴（Sitar）', '塔布拉鼓（Tabla）', '萨罗德琴（Sarod）', '竹笛（Bansuri）', '乌德琴（Oud）', '卡农琴（Qanun）'],
        instrumentsDetail: '印度古典音乐：西塔琴（Sitar）以其共鸣弦产生独特嗡鸣音色，是印度音乐最具辨识度的乐器；塔布拉鼓（Tabla）提供复杂精妙的节奏循环（Tala）；萨罗德琴（Sarod）演奏深沉抒情的旋律；竹笛（Bansuri）吹奏空灵悠远的乐句。中东/阿拉伯音乐：乌德琴（Oud，阿拉伯鲁特琴）是核心旋律乐器；卡农琴（Qanun，齐特尔琴）提供华丽的装饰音；达尔布卡鼓（Darbuka）和奈伊笛（Ney）增添异域色彩。',
        artists: ['Ravi Shankar', 'Nusrat Fateh Ali Khan', 'Yo-Yo Ma (Silk Road)', 'Anouar Brahem'],
      },
      {
        name: '雷鬼',
        en: 'Reggae',
        era: '1960s-今',
        origin: '🇯🇲 牙买加',
        tags: ['🧘 放松', '✌️ 反战', '☀️ 阳光', '🌴 热带'],
        history: '1960年代末诞生于牙买加金士顿的贫民区，由Ska和Rocksteady演化而来。Bob Marley将雷鬼与拉斯塔法里信仰推向世界，成为反战、和平与社会正义的象征。',
        instruments: ['反拍吉他切音', '深沉电贝斯线条', '风琴/电钢琴', '鼓强调第三拍', '口琴与萨克斯'],
        instrumentsDetail: '标志性的反拍吉他切音（Offbeat Skank），在2、4拍上轻扫和弦，形成独特的慵懒律动；深沉浑厚的电贝斯线条是雷鬼音乐的灵魂，贝斯比其他乐器更突出；键盘乐器（风琴Organ、电钢琴Rhodes）提供温暖和弦填充；鼓强调第三拍（"一拍空、三拍重"），与常规摇滚鼓点截然不同；口琴、萨克斯作为旋律乐器增添色彩。',
        artists: ['Bob Marley', 'Peter Tosh', 'Jimmy Cliff', 'Toots & the Maytals'],
      },
    ],
  },
  {
    key: 'pop',
    label: '🎤 流行商业',
    icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z',
    items: [
      {
        name: '流行 / R&B',
        en: 'Pop / R&B',
        era: '1950s-今',
        origin: '🇺🇸 美国',
        tags: ['😊 欢快', '💼 商业', '💕 感性', '🎤 时尚'],
        history: '流行音乐是面向大众市场的商业音乐，从1950年代的摇滚乐发展而来，不断吸收各种音乐元素。R&B（节奏布鲁斯）起源于1940年代非裔美国人社区，是现代流行、嘻哈和灵魂乐的根基。',
        instruments: ['电子鼓机', '合成器贝斯', '采样', 'Auto-Tune人声', '复杂和声'],
        instrumentsDetail: '高度标准化的商业制作流程：电子鼓机提供精准节拍；合成器贝斯与Sub Bass占据低频；采样技术截取老唱片片段进行重组；Auto-Tune等音高修正技术处理人声；R&B分支强调复杂的和声进行、灵魂乐唱腔（Melisma花腔）与现代节奏制作（Trap Beat、PBR&B等）的结合。',
        artists: ['Michael Jackson', 'Beyoncé', 'Taylor Swift', 'The Weeknd'],
      },
      {
        name: '嘻哈 / 说唱',
        en: 'Hip-Hop / Rap',
        era: '1970s-今',
        origin: '🇺🇸 纽约布朗克斯',
        tags: ['🏙️ 街头', '⚡ 能量', '✊ 态度', '🎤 表达'],
        history: '1970年代纽约布朗克斯区非裔与拉丁裔社区诞生的文化运动，包含说唱（MCing）、DJing、涂鸦和街舞四大元素。从街头派对文化发展成为21世纪最具影响力的音乐形式。',
        instruments: ['鼓机（TR-808）', '采样器', '合成器贝斯', 'DJ搓盘', 'Beat制作'],
        instrumentsDetail: '鼓机（Roland TR-808是传奇经典）提供基础节奏骨架；采样器（MPC等）截取老唱片片段（Soul、Funk、Jazz）进行切割重组，形成"拼贴"式的音乐创作；合成器贝斯（如808 Bass）提供低频冲击力；DJ搓盘（Scratch）技巧将唱机变为乐器；Beat制作是核心，强调节奏（Kick、Snare、Hi-hat的编排）与人声的紧密配合。',
        artists: ['2Pac', 'The Notorious B.I.G.', 'Kendrick Lamar', 'Eminem', 'Jay-Z'],
      },
      {
        name: '灵魂乐',
        en: 'Soul',
        era: '1950s-今',
        origin: '🇺🇸 美国',
        tags: ['💙 深情', '🔥 热情', '💕 感性', '🎤 真挚'],
        history: '1950年代末在美国非裔社区诞生，融合福音音乐的虔诚、R&B的节奏与蓝调的感性。Motown唱片的流行化与Stax唱片的南方粗犷风格形成双雄并立，影响至今。',
        instruments: ['呼喊颤音滑音人声', '紧密节奏组', '弦乐编曲', '铜管高光', '钢琴和Hammond B3风琴'],
        instrumentsDetail: '人声是绝对核心：呼喊（Call）、颤音（Vibrato）、滑音（Melisma花腔）等技巧展现灵魂乐唱腔的极致表现力；节奏组（鼓、贝斯、吉他）紧密配合形成"口袋"（The Pocket）般的律动；弦乐编曲（Violin、Cello）增加情感厚度与戏剧性；铜管（小号、长号、萨克斯）提供高光时刻（Hook）；钢琴和Hammond B3风琴是灵魂乐的标志性键盘乐器。',
        artists: ['Aretha Franklin', 'Stevie Wonder', 'Marvin Gaye', 'Otis Redding', 'Sam Cooke'],
      },
      {
        name: '放克',
        en: 'Funk',
        era: '1960s-今',
        origin: '🇺🇸 美国',
        tags: ['💃 律动', '😊 欢快', '💋 性感', '🔥 热情'],
        history: '1960年代中期由James Brown开创，将灵魂乐、R&B的律动推向极致。Funk强调"第一拍"（The One），贝斯线条复杂而主导，是Hip-hop采样最重要的来源之一。',
        instruments: ['电贝斯（Slap技巧）', '铜管组（小号/长号/萨克斯）', '切分节奏吉他', '第一拍和第三拍鼓', '合成器'],
        instrumentsDetail: '电贝斯是绝对核心乐器，Slap（拍弦）技巧产生清脆有力的打击感，贝斯线条复杂而主导整个律动；铜管组（小号Trumpet、长号Trombone、萨克斯Saxophone）吹奏强劲有力的Riff段落；节奏吉他以切分节奏（Syncopation）扫弦，制造"错位"的律动感；鼓强调第一拍（The One）和第三拍，形成Funk特有的节奏骨架；合成器在70-80年代加入后进一步丰富了音色层次。',
        artists: ['James Brown', 'Prince', 'Parliament-Funkadelic', 'Sly & the Family Stone'],
      },
    ],
  },
];

export default function MusicGenresPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('all');
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const query = searchQuery.toLowerCase();

  const handleSectionClick = (key: string) => {
    setActiveSection(key);
    if (key === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(key);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const filtered = sections.map(s => ({
    ...s,
    items: s.items.filter(item =>
      !query ||
      item.name.includes(query) ||
      item.en.toLowerCase().includes(query) ||
      item.tags.some(t => t.includes(query)) ||
      item.history.includes(query) ||
      item.artists.some(a => a.toLowerCase().includes(query)) ||
      item.instruments.some(i => i.includes(query)) ||
      (item.instrumentsDetail && item.instrumentsDetail.includes(query)) ||
      s.label.includes(query)
    ),
  })).filter(s => s.items.length > 0);

  return (
    <div className="max-w-[900px] mx-auto py-8 px-6 w-full">
      {/* 面包屑导航 */}
      <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6">
        <Link to="/audio" className="hover:text-gray-300 transition-colors">音频设计中心</Link>
        <span>/</span>
        <span className="text-[#ec4899]">音乐百科全书</span>
      </nav>

      {/* 页面头部 */}
      <div className="mb-10">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl leading-none">🎵</span>
          <div>
            <h1 className="text-5xl font-extrabold text-[#ec4899] mb-3">
              音乐百科全书
            </h1>
            <p className="text-sm text-gray-400 tracking-wide">
              游戏配乐设计师手册 · 流派 · 乐理 · 制作技巧
            </p>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="mb-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="搜索流派、乐器、艺术家、历史..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-[#ec4899]40 transition-colors"
          />
        </div>
      </div>

      {/* 分类导航栏 - 分层展示 */}
      <div className="sticky top-16 z-10 -mx-6 px-6 pt-3 pb-3 bg-[#0a0a0f] border-b border-[rgba(255,255,255,0.04)] mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSectionClick('all')}
            className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer"
            style={{
              borderColor: activeSection === 'all' ? '#ec489950' : 'rgba(255,255,255,0.06)',
              background: activeSection === 'all' ? '#ec489912' : 'transparent',
              color: activeSection === 'all' ? '#ec4899' : '#6b7280',
              boxShadow: activeSection === 'all' ? '0 0 12px #ec489915' : 'none',
            }}
          >
            全部
          </button>
          {sections.map(sec => {
            const isActive = activeSection === sec.key;
            const color = GENRE_COLORS[sec.key] || '#ec4899';
            return (
              <button
                key={sec.key}
                onClick={() => handleSectionClick(sec.key)}
                className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isActive ? `${color}50` : 'rgba(255,255,255,0.06)',
                  background: isActive ? `${color}12` : 'transparent',
                  color: isActive ? color : '#6b7280',
                  boxShadow: isActive ? `0 0 12px ${color}15` : 'none',
                }}
              >
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 分类模块渲染 */}
      {filtered.map(sec => {
        const color = GENRE_COLORS[sec.key] || '#ec4899';
        return (
          <div key={sec.key} id={sec.key} className="mb-12 scroll-mt-36">
            {/* 模块标题 */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}12`, border: `1px solid ${color}25` }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={sec.icon} />
                </svg>
              </div>
              <h2 className="text-lg font-bold" style={{ color }}>
                {sec.label}
              </h2>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}30, transparent)` }} />
              <span className="text-xs text-gray-500">{sec.items.length} 种风格</span>
            </div>

            {/* 风格卡片网格 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sec.items.map((item, idx) => {
                const cardId = `${sec.key}-${idx}`;
                const isOpen = expandedCard === cardId;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border overflow-hidden transition-all duration-300"
                    style={{
                      background: '#ffffff06',
                      borderColor: isOpen ? `${color}40` : `${color}18`,
                      boxShadow: isOpen ? `0 0 20px ${color}10` : 'none',
                    }}
                  >
                    {/* 卡片头部 */}
                    <button
                      onClick={() => setExpandedCard(isOpen ? null : cardId)}
                      className="w-full text-left p-4 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-white truncate">{item.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{item.en} · {item.era}</p>
                        </div>
                        <svg
                          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className="flex-shrink-0 mt-1 transition-transform duration-300"
                          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                        >
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <span>{item.origin}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {item.tags.map((tag, ti) => (
                          <span
                            key={ti}
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${color}12`, color: `${color}cc`, border: `1px solid ${color}20` }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>

                    {/* 展开内容 */}
                    {isOpen && (
                      <div className="px-4 pb-4 border-t" style={{ borderColor: `${color}15` }}>
                        <div className="pt-3 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-400 mb-1">📖 历史起源</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{item.history}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 mb-1">🎺 配器特点</p>
                            {item.instrumentsDetail ? (
                              <p className="text-sm text-gray-300 leading-relaxed mb-2">{item.instrumentsDetail}</p>
                            ) : null}
                            <div className="flex flex-wrap gap-1.5">
                              {item.instruments.map((inst, ii) => (
                                <span key={ii} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/8">
                                  {inst}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 mb-1">👨‍🎤 代表艺术家</p>
                            <div className="flex flex-wrap gap-1.5">
                              {item.artists.map((artist, ai) => (
                                <span key={ai} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-300 border border-white/8">
                                  {artist}
                                </span>
                              ))}
                            </div>
                          </div>
                          {/* 外链按钮 */}
                          <div className="flex gap-2 pt-1">
                            <a
                              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(item.name + ' ' + item.en)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                              style={{ borderColor: '#ff000030', color: '#ff6b6b', background: '#ff000008' }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/></svg>
                              YouTube
                            </a>
                            <a
                              href={`https://music.163.com/#/search/m/?s=${encodeURIComponent(item.name)}`}
                              target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all hover:opacity-80"
                              style={{ borderColor: '#c20c0c30', color: '#e85d5d', background: '#c20c0c08' }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z"/></svg>
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
        );
      })}

      {/* 空状态 */}
      {filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-500 text-sm">未找到匹配的音乐风格</p>
        </div>
      )}
    </div>
  );
}
