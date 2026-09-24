/**
 * 谁是卧底 — 词库
 * 每对词：civilian = 平民词，spy = 卧底词（相近但可区分）
 * 参考 hiyamax.com/games/who-is-spy 的 8 大分类提炼
 */

export type WordPair = {
  category: string;
  civilian: string;
  spy: string;
};

export const WORD_PAIRS: WordPair[] = [
  // 水果
  { category: '水果', civilian: '苹果', spy: '梨子' },
  { category: '水果', civilian: '香蕉', spy: '芭蕉' },
  { category: '水果', civilian: '葡萄', spy: '提子' },
  { category: '水果', civilian: '橙子', spy: '橘子' },
  { category: '水果', civilian: '西瓜', spy: '哈密瓜' },
  { category: '水果', civilian: '草莓', spy: '杨梅' },
  { category: '水果', civilian: '芒果', spy: '黄桃' },
  { category: '水果', civilian: '樱桃', spy: '车厘子' },

  // 动物
  { category: '动物', civilian: '老虎', spy: '狮子' },
  { category: '动物', civilian: '兔子', spy: '老鼠' },
  { category: '动物', civilian: '蝴蝶', spy: '蜜蜂' },
  { category: '动物', civilian: '鲨鱼', spy: '鲸鱼' },
  { category: '动物', civilian: '麻雀', spy: '燕子' },
  { category: '动物', civilian: '乌龟', spy: '甲鱼' },
  { category: '动物', civilian: '刺猬', spy: '豪猪' },
  { category: '动物', civilian: '狐狸', spy: '狼' },

  // 职业
  { category: '职业', civilian: '医生', spy: '护士' },
  { category: '职业', civilian: '老师', spy: '教授' },
  { category: '职业', civilian: '警察', spy: '保安' },
  { category: '职业', civilian: '厨师', spy: '面点师' },
  { category: '职业', civilian: '司机', spy: '飞行员' },
  { category: '职业', civilian: '记者', spy: '主播' },
  { category: '职业', civilian: '画家', spy: '书法家' },
  { category: '职业', civilian: '理发师', spy: '美容师' },

  // 体育
  { category: '体育', civilian: '篮球', spy: '排球' },
  { category: '体育', civilian: '足球', spy: '橄榄球' },
  { category: '体育', civilian: '游泳', spy: '潜水' },
  { category: '体育', civilian: '乒乓球', spy: '羽毛球' },
  { category: '体育', civilian: '跑步', spy: '竞走' },
  { category: '体育', civilian: '体操', spy: '杂技' },
  { category: '体育', civilian: '滑雪', spy: '滑冰' },
  { category: '体育', civilian: '拳击', spy: '摔跤' },

  // 美食
  { category: '美食', civilian: '包子', spy: '馒头' },
  { category: '美食', civilian: '饺子', spy: '馄饨' },
  { category: '美食', civilian: '面条', spy: '米线' },
  { category: '美食', civilian: '火锅', spy: '麻辣烫' },
  { category: '美食', civilian: '烧烤', spy: '铁板烧' },
  { category: '美食', civilian: '咖啡', spy: '奶茶' },
  { category: '美食', civilian: '蛋糕', spy: '面包' },
  { category: '美食', civilian: '寿司', spy: '刺身' },

  // 地点
  { category: '地点', civilian: '医院', spy: '诊所' },
  { category: '地点', civilian: '学校', spy: '补习班' },
  { category: '地点', civilian: '超市', spy: '便利店' },
  { category: '地点', civilian: '公园', spy: '植物园' },
  { category: '地点', civilian: '电影院', spy: '剧院' },
  { category: '地点', civilian: '火车站', spy: '汽车站' },
  { category: '地点', civilian: '图书馆', spy: '书店' },
  { category: '地点', civilian: '银行', spy: '信用社' },

  // 历史
  { category: '历史', civilian: '唐朝', spy: '宋朝' },
  { category: '历史', civilian: '长城', spy: '故宫' },
  { category: '历史', civilian: '秦始皇', spy: '汉武帝' },
  { category: '历史', civilian: '三国', spy: '战国' },
  { category: '历史', civilian: '丝绸之路', spy: '茶马古道' },
  { category: '历史', civilian: '春节', spy: '元宵节' },
  { category: '历史', civilian: '孔子', spy: '老子' },
  { category: '历史', civilian: '兵马俑', spy: '莫高窟' },

  // 科技
  { category: '科技', civilian: '手机', spy: '平板' },
  { category: '科技', civilian: '电脑', spy: '笔记本' },
  { category: '科技', civilian: '微信', spy: 'QQ' },
  { category: '科技', civilian: '蓝牙', spy: 'WiFi' },
  { category: '科技', civilian: '相机', spy: '摄像机' },
  { category: '科技', civilian: '耳机', spy: '音箱' },
  { category: '科技', civilian: '无人机', spy: '遥控飞机' },
  { category: '科技', civilian: '人工智能', spy: '机器学习' },
];

/** 随机抽一对词 */
export function pickRandomPair(): WordPair {
  return WORD_PAIRS[Math.floor(Math.random() * WORD_PAIRS.length)];
}

/** Fisher–Yates 洗牌（返回新数组） */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
