import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─────────────────── 配色 ─────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  rpg: '#f59e0b',
  fps: '#ef4444',
  slg: '#3b82f6',
  moba: '#8b5cf6',
  action: '#22c55e',
};

/* ─────────────────── 数据 ─────────────────── */
const categories = [
  {
    key: 'rpg',
    label: '🎭 RPG · 角色扮演',
    desc: '玩家扮演虚拟世界中的角色，通过完成任务、战斗、探索来推进剧情',
    subCategories: [
      {
        name: 'ARPG · 动作角色扮演',
        desc: '结合动作战斗与角色扮演元素',
        games: [
          {
            name: '黑暗之魂3',
            en: 'Dark Souls III',
            dev: 'FromSoftware',
            desc: '洛斯里克王国的火焰即将熄灭，不死人被唤醒执行传火使命。在破败的城堡与阴森的地下墓穴中，玩家将面对昔日的英雄与堕落的神明，探索火之时代的终结与轮回的宿命。',
            links: [
              { label: '官方网站', url: 'https://www.fromsoftware.jp/jp/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Dark+Souls+3+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Dark+Souls+3+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Dark+Souls+3+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '巫师3：狂猎',
            en: 'The Witcher 3: Wild Hunt',
            dev: 'CD Projekt Red',
            desc: '在大陆战火纷飞的年代，猎魔人杰洛特寻找失踪的养女希里。政治阴谋、种族冲突与超自然威胁交织，玩家的每一个选择都将影响这片大陆的命运走向。',
            links: [
              { label: '官方网站', url: 'https://www.cdprojekt.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=The+Witcher+3+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=The+Witcher+3+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=The+Witcher+3+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '艾尔登法环',
            en: 'Elden Ring',
            dev: 'FromSoftware',
            desc: '交界地的艾尔登法环破碎，半神们争夺大卢恩引发破碎战争。被玷污者重返这片土地，探索黄金树下的秘密，挑战半神，最终成为艾尔登之王或带来新时代的秩序。',
            links: [
              { label: '官方网站', url: 'https://www.fromsoftware.jp/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Elden+Ring+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Elden+Ring+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Elden+Ring+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
      {
        name: 'SRPG · 策略角色扮演',
        desc: '结合策略战棋与角色扮演元素',
        games: [
          {
            name: '火焰纹章：风花雪月',
            en: 'Fire Emblem: Three Houses',
            dev: 'Intelligent Systems',
            desc: '芙朵拉大陆上，三国鼎立。玩家作为士官学校教师，培养来自三个国家的年轻贵族。在学院日常与战场厮杀中，揭开千年历史的真相，决定大陆的未来。',
            links: [
              { label: '官方网站', url: 'https://www.intsys.co.jp/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Fire+Emblem+Three+Houses+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Fire+Emblem+Three+Houses+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Fire+Emblem+Three+Houses+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '最终幻想战略版',
            en: 'Final Fantasy Tactics',
            dev: 'Square Enix',
            desc: '伊瓦利斯王国，两个贵族家族争夺王位的狮子战争。主角拉姆萨在阴谋与背叛中，逐渐揭开圣石背后的黑暗真相，挑战操纵历史的教会势力。',
            links: [
              { label: '官方网站', url: 'https://www.square-enix.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Final+Fantasy+Tactics+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Final+Fantasy+Tactics+opening', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Final+Fantasy+Tactics+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: 'XCOM 2',
            en: 'XCOM 2',
            dev: 'Firaxis Games',
            desc: '外星征服者统治地球已二十年，XCOM组织沦为抵抗军。玩家指挥地下游击队，从废墟城市中招募战士，夺回地球自由，揭露外星人改造人类的阴谋。',
            links: [
              { label: '官方网站', url: 'https://www.firaxis.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=XCOM+2+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=XCOM+2+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=XCOM+2+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
      {
        name: 'JRPG · 日式角色扮演',
        desc: '源自日本的传统回合制RPG风格',
        games: [
          {
            name: '最终幻想VII 重制版',
            en: 'Final Fantasy VII Remake',
            dev: 'Square Enix',
            desc: '米德加都市，神罗公司榨取星球生命能源。前神罗战士克劳德加入雪崩组织，在破坏魔晄炉的任务中，逐渐发现自己过去的真相与星球命运的联系。',
            links: [
              { label: '官方网站', url: 'https://www.square-enix.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Final+Fantasy+7+Remake+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Final+Fantasy+7+Remake+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Final+Fantasy+7+Remake+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '女神异闻录5 皇家版',
            en: 'Persona 5 Royal',
            dev: 'Atlus',
            desc: '东京，心灵扭曲的大人构建腐败社会。一群高中生觉醒人格面具力量，潜入恶人内心的认知空间"宫殿"，偷取扭曲的欲望，让恶人悔改，成为侠盗团的革命物语。',
            links: [
              { label: '官方网站', url: 'https://www.atlus.co.jp/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Persona+5+Royal+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Persona+5+Royal+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Persona+5+Royal+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '勇者斗恶龙XI',
            en: 'Dragon Quest XI',
            dev: 'Square Enix',
            desc: '勇者诞生时即被预言将毁灭世界，故乡被魔王军攻陷后踏上旅程。在洛特泽塔西亚大陆上，勇者集结伙伴，揭开自己身世的秘密，对抗黑暗势力。',
            links: [
              { label: '官方网站', url: 'https://www.square-enix.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Dragon+Quest+11+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Dragon+Quest+11+opening', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Dragon+Quest+11+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
      {
        name: 'MMORPG · 大型多人在线',
        desc: '支持数千玩家同时在线的RPG',
        games: [
          {
            name: '魔兽世界',
            en: 'World of Warcraft',
            dev: 'Blizzard Entertainment',
            desc: '艾泽拉斯大陆，联盟与部落战火绵延。从东部王国到外域，从诺森德到潘达利亚，英雄们对抗燃烧军团、古神低语与亡灵天灾，书写属于自己的传奇。',
            links: [
              { label: '官方网站', url: 'https://www.blizzard.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=World+of+Warcraft+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=World+of+Warcraft+cinematic', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=World+of+Warcraft+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '最终幻想XIV',
            en: 'Final Fantasy XIV',
            dev: 'Square Enix',
            desc: '海德林与佐迪亚克，光与暗的星球。冒险者从普通冒险者成长为光之战士，穿越第一世界与第十三世界，阻止末日降临，探索古代文明灭亡的真相。',
            links: [
              { label: '官方网站', url: 'https://www.square-enix.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Final+Fantasy+14+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Final+Fantasy+14+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Final+Fantasy+14+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '原神',
            en: 'Genshin Impact',
            dev: 'miHoYo',
            desc: '旅行者寻找失散的血亲，游历提瓦特七国。每座城邦对应一种元素与一种理念，在探索中揭开"天理"与"神之眼"的秘密，见证神明的陨落与新秩序的建立。',
            links: [
              { label: '官方网站', url: 'https://www.mihoyo.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Genshin+Impact+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Genshin+Impact+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Genshin+Impact+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'fps',
    label: '🎯 FPS · 第一人称射击',
    desc: '以第一人称视角进行的射击游戏',
    subCategories: [
      {
        name: '战术射击',
        desc: '强调团队配合与战术策略',
        games: [
          {
            name: '反恐精英2',
            en: 'Counter-Strike 2',
            dev: 'Valve',
            desc: '全球反恐精英与恐怖分子之间的对抗。从炙热沙城到核子危机，经典的爆破模式与人质模式考验团队配合，是全球电竞史上最经典的FPS竞技游戏。',
            links: [
              { label: '官方网站', url: 'https://www.valvesoftware.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Counter-Strike+2+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Counter-Strike+2+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Counter-Strike+2+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '彩虹六号：围攻',
            en: 'Rainbow Six Siege',
            dev: 'Ubisoft',
            desc: '全球反恐特种部队彩虹小队，面对白面具恐怖组织。可破坏的墙体、独特的干员技能、高度战术化的室内近距离作战，重新定义战术射击游戏体验。',
            links: [
              { label: '官方网站', url: 'https://www.ubisoft.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Rainbow+Six+Siege+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Rainbow+Six+Siege+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Rainbow+Six+Siege+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: 'Valorant',
            en: 'Valorant',
            dev: 'Riot Games',
            desc: '近未来的地球，一场名为"First Light"的事件让部分人类获得超能力。特工们装备符文科技武器，在回合制战术射击中运用独特技能争夺胜利。',
            links: [
              { label: '官方网站', url: 'https://www.riotgames.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Valorant+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Valorant+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Valorant+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
      {
        name: '竞技场射击',
        desc: '快节奏、强调身法的射击对战',
        games: [
          {
            name: '毁灭战士：永恒',
            en: 'DOOM Eternal',
            dev: 'id Software',
            desc: '地狱大军入侵地球，毁灭战士从地狱要塞苏醒。在火星与地狱的战场中，以狂暴的近战与火器撕裂恶魔，阻止地狱祭司吞噬人类灵魂的阴谋。',
            links: [
              { label: '官方网站', url: 'https://www.idsoftware.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=DOOM+Eternal+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=DOOM+Eternal+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=DOOM+Eternal+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '雷神之锤：冠军',
            en: 'Quake Champions',
            dev: 'id Software',
            desc: '雷神之锤宇宙中的竞技场，来自不同时空的战士们为荣耀而战。火箭跳、空中转身、超高速移动，经典竞技场FPS的现代化演绎。',
            links: [
              { label: '官方网站', url: 'https://www.idsoftware.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Quake+Champions+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Quake+Champions+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Quake+Champions+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '虚幻竞技场',
            en: 'Unreal Tournament',
            dev: 'Epic Games',
            desc: '新地球政府的血腥竞技场赛事，参赛者使用各种未来武器互相厮杀。从传统的死亡竞赛到独特的占旗模式，纯粹的竞技射击体验。',
            links: [
              { label: '官方网站', url: 'https://www.epicgames.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Unreal+Tournament+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Unreal+Tournament+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Unreal+Tournament+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
      {
        name: '大逃杀',
        desc: '百人竞技，最后生存者获胜',
        games: [
          {
            name: '绝地求生',
            en: 'PUBG: Battlegrounds',
            dev: 'KRAFTON',
            desc: '在废弃的东欧岛屿上，一百名玩家空投作战。搜集武器、装备，在不断缩小的安全区内生存，成为最后站立的胜利者，开创大逃杀游戏类型。',
            links: [
              { label: '官方网站', url: 'https://www.krafton.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=PUBG+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=PUBG+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=PUBG+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: 'Apex英雄',
            en: 'Apex Legends',
            dev: 'Respawn Entertainment',
            desc: '边境星系，Apex竞技场比赛。来自泰坦陨落宇宙的传奇角色，三人小队合作，利用角色独特技能在快节奏战斗中生存，揭开源氏与IMC战争的后续。',
            links: [
              { label: '官方网站', url: 'https://www.respawn.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Apex+Legends+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Apex+Legends+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Apex+Legends+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '使命召唤：战区',
            en: 'Call of Duty: Warzone',
            dev: 'Infinity Ward',
            desc: '佛丹斯科战区，150人同场竞技。从使命召唤现代战争宇宙中延伸，结合系列经典武器系统与载具，提供快节奏的大逃杀体验。',
            links: [
              { label: '官方网站', url: 'https://www.infinityward.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Call+of+Duty+Warzone+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Call+of+Duty+Warzone+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Call+of+Duty+Warzone+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'slg',
    label: '⚔️ SLG · 策略模拟',
    desc: '强调策略规划、资源管理、模拟经营',
    subCategories: [
      {
        name: 'RTS · 即时战略',
        desc: '实时进行的战略对战游戏',
        games: [
          {
            name: '星际争霸2',
            en: 'StarCraft II',
            dev: 'Blizzard Entertainment',
            desc: '科普鲁星区，人族、虫族、神族三足鼎立。吉姆·雷诺、凯瑞甘、阿塔尼斯等英雄的命运交织，对抗堕落的萨尔纳加与虚空中的黑暗。',
            links: [
              { label: '官方网站', url: 'https://www.blizzard.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=StarCraft+2+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=StarCraft+2+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=StarCraft+2+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '帝国时代4',
            en: 'Age of Empires IV',
            dev: 'Relic Entertainment',
            desc: '从黑暗时代到帝国时代，指挥历史上的伟大文明。英格兰、蒙古、中国等文明拥有独特单位与科技树，在中世纪战场上书写帝国兴衰。',
            links: [
              { label: '官方网站', url: 'https://www.relic.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Age+of+Empires+4+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Age+of+Empires+4+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Age+of+Empires+4+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '全面战争：三国',
            en: 'Total War: Three Kingdoms',
            dev: 'Creative Assembly',
            desc: '东汉末年，群雄逐鹿。扮演曹操、刘备、孙权等诸侯，通过回合制战略管理内政外交，实时战斗指挥千军万马，体验三国英雄的史诗篇章。',
            links: [
              { label: '官方网站', url: 'https://www.creative-assembly.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Total+War+Three+Kingdoms+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Total+War+Three+Kingdoms+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Total+War+Three+Kingdoms+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
      {
        name: '回合制策略',
        desc: '轮流行动的深度策略游戏',
        games: [
          {
            name: '文明6',
            en: "Sid Meier's Civilization VI",
            dev: 'Firaxis Games',
            desc: '从石器时代到信息时代，领导文明跨越六千年。秦始皇、甘地、彼得大帝等领袖登场，发展科技、文化、宗教，建立能经受时间考验的帝国。',
            links: [
              { label: '官方网站', url: 'https://www.firaxis.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Civilization+6+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Civilization+6+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Civilization+6+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: 'XCOM 2',
            en: 'XCOM 2',
            dev: 'Firaxis Games',
            desc: '外星征服者统治地球已二十年，XCOM组织沦为抵抗军。玩家指挥地下游击队，从废墟城市中招募战士，夺回地球自由，揭露外星人改造人类的阴谋。',
            links: [
              { label: '官方网站', url: 'https://www.firaxis.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=XCOM+2+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=XCOM+2+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=XCOM+2+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '神界：原罪2',
            en: 'Divinity: Original Sin 2',
            dev: 'Larian Studios',
            desc: '绿维珑世界，秘源术士被净源导师迫害。玩家扮演被囚禁的秘源术士，在浮空城中逃生，寻找成为神的方法，同时揭开虚空异兽入侵的真相。',
            links: [
              { label: '官方网站', url: 'https://www.larian.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Divinity+Original+Sin+2+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Divinity+Original+Sin+2+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Divinity+Original+Sin+2+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
      {
        name: '4X策略',
        desc: '探索、扩张、开发、征服',
        games: [
          {
            name: '群星',
            en: 'Stellaris',
            dev: 'Paradox Interactive',
            desc: '银河系，数千星辰等待探索。从单一星球文明发展为星际帝国，遭遇外星种族、上古文明遗迹、维度裂缝。外交、战争、科技、种族特性，打造独特的太空史诗。',
            links: [
              { label: '官方网站', url: 'https://www.paradoxinteractive.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Stellaris+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Stellaris+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Stellaris+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '无尽空间2',
            en: 'Endless Space 2',
            dev: 'Amplitude Studios',
            desc: '无尽宇宙，多个独特种族争夺银河霸权。每个种族拥有专属任务链与胜利条件，从吞噬星球的藤智者到数字生命的虚拟族，体验完全不同的太空文明发展之路。',
            links: [
              { label: '官方网站', url: 'https://www.amplitude-studios.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Endless+Space+2+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Endless+Space+2+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Endless+Space+2+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '银河文明3',
            en: 'Galactic Civilizations III',
            dev: 'Stardock',
            desc: '23世纪，人类首次接触外星文明。选择人类或外星种族，在巨大的银河地图上建立帝国。深度的飞船设计与外交系统，塑造属于你的太空文明传奇。',
            links: [
              { label: '官方网站', url: 'https://www.stardock.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Galactic+Civilizations+3+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Galactic+Civilizations+3+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Galactic+Civilizations+3+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'moba',
    label: '⚡ MOBA · 多人在线竞技',
    desc: '两队对抗，推倒对方基地获胜',
    subCategories: [
      {
        name: '经典MOBA',
        desc: '传统三路对抗模式',
        games: [
          {
            name: '英雄联盟',
            en: 'League of Legends',
            dev: 'Riot Games',
            desc: '符文之地，众多城邦与势力纷争不断。召唤师召唤英雄在正义之地战斗解决争端。从德玛西亚的骑士到诺克萨斯的刺客，每位英雄都有独特的背景故事与能力。',
            links: [
              { label: '官方网站', url: 'https://www.riotgames.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=League+of+Legends+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=League+of+Legends+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=League+of+Legends+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: 'DOTA2',
            en: 'Dota 2',
            dev: 'Valve',
            desc: '天辉与夜魇两座远古遗迹矗立在战场上。英雄们为各自阵营而战，争夺神秘的神杖与不朽之守护。起源于魔兽争霸3的经典地图，电竞奖金最高的赛事之一。',
            links: [
              { label: '官方网站', url: 'https://www.valvesoftware.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Dota+2+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Dota+2+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Dota+2+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '风暴英雄',
            en: 'Heroes of the Storm',
            dev: 'Blizzard Entertainment',
            desc: '时空枢纽，暴雪所有宇宙的交汇点。萨尔、迪亚波罗、凯瑞甘等传奇英雄跨越世界并肩作战。独特的团队经验共享机制与多样化战场目标，团队合作的极致体现。',
            links: [
              { label: '官方网站', url: 'https://www.blizzard.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Heroes+of+the+Storm+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Heroes+of+the+Storm+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Heroes+of+the+Storm+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
      {
        name: '移动端MOBA',
        desc: '专为移动设备优化的MOBA',
        games: [
          {
            name: '王者荣耀',
            en: 'Honor of Kings',
            dev: 'Tencent Games',
            desc: '王者峡谷，东西方历史与神话人物齐聚一堂。李白、貂蝉、亚瑟等英雄在5v5战场上对决。专为手机优化的操作体验，全球最火爆的移动端MOBA游戏。',
            links: [
              { label: '官方网站', url: 'https://www.tencent.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Honor+of+Kings+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Honor+of+Kings+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Honor+of+Kings+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '英雄联盟手游',
            en: 'League of Legends: Wild Rift',
            dev: 'Riot Games',
            desc: '符文之地的移动端版本，保留英雄联盟核心玩法与英雄技能，针对触屏操作重新设计。同样的史诗战场，随时随地的5v5竞技体验。',
            links: [
              { label: '官方网站', url: 'https://www.riotgames.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Wild+Rift+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Wild+Rift+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Wild+Rift+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '无尽对决',
            en: 'Mobile Legends: Bang Bang',
            dev: 'Moonton',
            desc: '幻境大陆，东西方神话融合的世界。每局10秒匹配，10分钟一局，快节奏的移动端MOBA体验。在东南亚与全球市场广受欢迎，国际化的电竞赛事体系。',
            links: [
              { label: '官方网站', url: 'https://www.moonton.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Mobile+Legends+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Mobile+Legends+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Mobile+Legends+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
    ],
  },
  {
    key: 'action',
    label: '👊 Action · 动作',
    desc: '强调操作技巧、反应速度的战斗游戏',
    subCategories: [
      {
        name: '砍杀类',
        desc: '爽快的连击与大规模战斗',
        games: [
          {
            name: '战神',
            en: 'God of War',
            dev: 'Santa Monica Studio',
            desc: '北欧神话世界，奎托斯带着儿子阿特柔斯踏上旅程。在米德加尔特的冰天雪地中，父子将面对诸神黄昏的预言，揭开神族与巨人的恩怨。',
            links: [
              { label: '官方网站', url: 'https://www.santamonicastudio.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=God+of+War+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=God+of+War+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=God+of+War+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '鬼泣5',
            en: 'Devil May Cry 5',
            dev: 'Capcom',
            desc: '恶魔猎人但丁、尼禄与新角色V联手对抗恶魔之王尤里曾。在风格化的战斗中施展华丽连击，揭开红魔之树事件的真相，系列15周年的巅峰之作。',
            links: [
              { label: '官方网站', url: 'https://www.capcom.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Devil+May+Cry+5+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Devil+May+Cry+5+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Devil+May+Cry+5+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '猎天使魔女2',
            en: 'Bayonetta 2',
            dev: 'PlatinumGames',
            desc: '魔女贝优妮塔为了拯救好友贞德，深入地狱与天使大军战斗。在神曲风格的地狱景观中，以变身、召唤魔物与华丽的格斗技巧击败神话中的神明。',
            links: [
              { label: '官方网站', url: 'https://www.platinumgames.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Bayonetta+2+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Bayonetta+2+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Bayonetta+2+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
      {
        name: '平台跳跃',
        desc: '精准的跳跃与关卡探索',
        games: [
          {
            name: '超级马里奥：奥德赛',
            en: 'Super Mario Odyssey',
            dev: 'Nintendo',
            desc: '马里奥的帽子凯比拥有附身能力。在沙之国、森之国等独特的王国中冒险，收集月亮力量阻止酷霸王与桃花公主的婚礼，开启3D平台跳跃新纪元。',
            links: [
              { label: '官方网站', url: 'https://www.nintendo.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Super+Mario+Odyssey+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Super+Mario+Odyssey+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Super+Mario+Odyssey+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '空洞骑士',
            en: 'Hollow Knight',
            dev: 'Team Cherry',
            desc: '圣巢王国，一座巨大的地下昆虫文明废墟。玩家扮演沉默的骑士探索交错的地道，与疯狂的神明后裔战斗，揭开瘟疫的源头与自身存在的意义。',
            links: [
              { label: '官方网站', url: 'https://www.teamcherry.com.au/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Hollow+Knight+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Hollow+Knight+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Hollow+Knight+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '蔚蓝',
            en: 'Celeste',
            dev: 'Maddy Makes Games',
            desc: '玛德琳攀登塞莱斯特山，一座能实现愿望的神秘山峰。在精准的平台跳跃中，她面对内心的焦虑与抑郁，用毅力征服山峰也征服内心的恶魔。',
            links: [
              { label: '官方网站', url: 'http://www.maddymakesgames.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Celeste+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Celeste+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Celeste+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
      {
        name: '潜行类',
        desc: '隐匿行动、策略潜入',
        games: [
          {
            name: '合金装备5：幻痛',
            en: 'Metal Gear Solid V: The Phantom Pain',
            dev: 'Kojima Productions',
            desc: '1984年，大首领从昏迷中苏醒建立钻石犬佣兵团。在阿富汗与非洲的开放世界中执行潜行任务，建立基地、招募士兵，寻找摧毁MSF的凶手，揭开身份之谜。',
            links: [
              { label: '官方网站', url: 'https://www.kojimaproductions.jp/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Metal+Gear+Solid+5+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Metal+Gear+Solid+5+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Metal+Gear+Solid+5+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '刺客信条：英灵殿',
            en: "Assassin's Creed Valhalla",
            dev: 'Ubisoft',
            desc: '维京时代，艾沃尔带领族人从挪威来到英格兰。在劫掠、定居与政治联盟中，与撒克逊国王和上古维序者斗争，同时揭开刺客与圣殿骑士千年战争的序幕。',
            links: [
              { label: '官方网站', url: 'https://www.ubisoft.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Assassins+Creed+Valhalla+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Assassins+Creed+Valhalla+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Assassins+Creed+Valhalla+soundtrack', icon: '🎵' },
            ],
          },
          {
            name: '耻辱2',
            en: 'Dishonored 2',
            dev: 'Arkane Studios',
            desc: '卡纳卡城邦，女巫德莱拉篡夺王位。玩家扮演科沃或艾米丽，利用超自然印记能力，在蒸汽朋克风格的城市中潜行或杀戮，夺回帝国的王座。',
            links: [
              { label: '官方网站', url: 'https://www.arkane-studios.com/', icon: '🌐' },
              { label: '实机演示', url: 'https://www.youtube.com/results?search_query=Dishonored+2+gameplay', icon: '🎮' },
              { label: '预告片', url: 'https://www.youtube.com/results?search_query=Dishonored+2+trailer', icon: '🎬' },
              { label: '原声音乐', url: 'https://www.youtube.com/results?search_query=Dishonored+2+soundtrack', icon: '🎵' },
            ],
          },
        ],
      },
    ],
  },
];

/* 统计 */
const totalGames = categories.reduce(
  (sum, cat) => sum + cat.subCategories.reduce((s, sub) => s + sub.games.length, 0),
  0
);

/* ─────────────────── 分类标签 ─────────────────── */
const tabDefs = categories.map(cat => ({
  key: cat.key,
  label: cat.label,
}));

export default function GameWorldPage() {
  const [activeCategory, setActiveCategory] = useState<string>('rpg');
  const [searchQuery, setSearchQuery] = useState('');

  /* 搜索过滤 */
  const filterCat = (cat: typeof categories[0]) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.label.toLowerCase().includes(q) ||
      cat.subCategories.some(
        sub =>
          sub.name.toLowerCase().includes(q) ||
          sub.games.some(
            g =>
              g.name.toLowerCase().includes(q) ||
              g.en.toLowerCase().includes(q) ||
              g.dev.toLowerCase().includes(q) ||
              g.desc.includes(q)
          )
      )
    );
  };

  const displayCategories = searchQuery.trim()
    ? categories.filter(filterCat)
    : categories.filter(c => c.key === activeCategory);

  return (
    <div className="max-w-[800px] mx-auto py-8 px-6 w-full">
      {/* 面包屑 */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
        <Link to="/game" className="hover:text-gray-300 transition-colors no-underline text-gray-500">
          游戏百科
        </Link>
        <span className="text-gray-600">/</span>
        <span style={{ color: CATEGORY_COLORS[activeCategory] || '#f59e0b' }}>
          游戏世界
        </span>
      </nav>

      {/* 页面头部 */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-text-bright mb-1.5">
          🎮 游戏世界
        </h1>
        <p className="text-[13.5px] text-gray-500">
          {categories.length} 大类 · {categories.reduce((s, c) => s + c.subCategories.length, 0)} 子类 · {totalGames} 款经典游戏
        </p>
      </div>

      {/* 搜索栏 */}
      <div className="relative mb-5">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
          width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="搜索游戏、开发商、类型..."
          value={searchQuery}
          onChange={e => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim() && activeCategory !== 'all') setActiveCategory('all');
          }}
          className="w-full pl-10 pr-4 py-2.5 bg-[#0d0d1a] border border-[rgba(255,255,255,0.08)] rounded-xl text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-[rgba(255,255,255,0.15)] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 bg-transparent border-none cursor-pointer text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* 分类标签 */}
      {!searchQuery.trim() && (
        <div className="sticky top-16 z-10 -mx-6 px-6 pt-3 pb-3 bg-[#0a0a0f] border-b border-[rgba(255,255,255,0.04)] mb-8">
          <div className="flex flex-wrap gap-2">
            {tabDefs.map(tab => {
              const isActive = activeCategory === tab.key;
              const color = CATEGORY_COLORS[tab.key] || '#f59e0b';
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className="flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer"
                  style={{
                    borderColor: isActive ? `${color}50` : 'rgba(255,255,255,0.06)',
                    background: isActive ? `${color}12` : 'transparent',
                    color: isActive ? color : '#6b7280',
                    boxShadow: isActive ? `0 0 12px ${color}15` : 'none',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 搜索结果提示 */}
      {searchQuery.trim() && (
        <p className="text-xs text-gray-500 mb-6">
          找到 {displayCategories.length} 个大类匹配「{searchQuery}」
        </p>
      )}

      {/* 内容区域 */}
      {displayCategories.map(cat => (
        <div key={cat.key} className="mb-10">
          {/* 大类标题 */}
          <div className="flex items-center gap-3 mb-2">
            <h2
              className="text-lg font-bold"
              style={{ color: CATEGORY_COLORS[cat.key] || '#f59e0b' }}
            >
              {cat.label}
            </h2>
            <span className="text-xs text-gray-600">{cat.subCategories.length} 个子类</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">{cat.desc}</p>

          {/* 子类 */}
          {cat.subCategories.map(sub => {
            const color = CATEGORY_COLORS[cat.key] || '#f59e0b';

            return (
            <div
              key={sub.name}
              className="mb-8 rounded-xl p-5 transition-all duration-300"
              style={{
                background: `linear-gradient(135deg, ${color}20 0%, ${color}10 60%, rgba(255,255,255,0.02) 100%)`,
                border: `1px solid ${color}30`,
                boxShadow: `0 0 20px ${color}08`,
              }}
            >
              {/* 子类标题栏 */}
              <div className="flex items-center gap-2 mb-1">
                <div
                  className="w-1.5 h-6 rounded-full"
                  style={{ background: color, boxShadow: `0 0 6px ${color}60` }}
                />
                <h3 className="text-sm font-bold text-text-bright">
                  {sub.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500 ml-3 mb-4">{sub.desc}</p>

              {/* 游戏卡片 - 网格方块 */}
              <div className="grid grid-cols-3 gap-3">
                {sub.games.map((game, gi) => {
                  const color = CATEGORY_COLORS[cat.key] || '#f59e0b';

                  return (
                    <div
                      key={`${cat.key}-${sub.name}-${gi}`}
                      className="card p-4 relative overflow-hidden transition-all duration-300 border group hover:scale-[1.02] flex flex-col"
                      style={{
                        borderColor: 'rgba(255,255,255,0.06)',
                      }}
                    >
                      {/* 左侧色条 */}
                      <div
                        className="absolute top-0 left-0 w-[3px] bottom-0 opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: color }}
                      />

                      {/* 游戏名 */}
                      <h4 className="text-[14px] font-bold text-text-bright mb-1 pr-1 leading-snug">
                        {game.name}
                      </h4>
                      <p className="text-[11px] text-gray-600 mb-2 truncate">{game.en}</p>

                      {/* 开发商标签 */}
                      <span
                        className="inline-block text-[10px] px-2 py-0.5 rounded mb-2"
                        style={{
                          background: `${color}10`,
                          color: `${color}aa`,
                          border: `1px solid ${color}18`,
                        }}
                      >
                        {game.dev}
                      </span>

                      {/* 描述 */}
                      <p className="text-[12px] text-gray-400 leading-relaxed mt-1 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                        {game.desc}
                      </p>

                      {/* 链接按钮 */}
                      {'links' in game && game.links && (
                        <div className="grid grid-cols-2 gap-1.5 mt-auto pt-2 border-t border-[rgba(255,255,255,0.05)]">
                          {game.links.map((link) => (
                            <a
                              key={link.label}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-1 h-7 text-[11px] font-medium px-2 rounded-md transition-all duration-200"
                              style={{
                                background: color,
                                color: '#000',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.filter = 'brightness(1.15)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.filter = 'none';
                              }}
                            >
                              <span>{link.icon}</span>
                              {link.label}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>
      ))}

      {/* 底部 */}
      <div className="mt-6 pt-6 border-t border-[rgba(255,255,255,0.04)] text-center">
        <p className="text-xs text-gray-600">
          涵盖 RPG / FPS / SLG / MOBA / Action 五大类型 · 持续更新中
        </p>
      </div>
    </div>
  );
}
