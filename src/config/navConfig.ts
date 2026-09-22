/**
 * because — 统一导航配置
 * React 版 nav-config.js，所有页面的导航菜单从此文件读取
 * 修改此文件即可同步全站导航
 */

export type NavItem = {
  id: string;
  label: string;
  path: string;         // React Router path
  icon?: string;        // 可选图标（未来用 lucide 替代 emoji）
  children?: NavItem[]; // 子菜单
};

export const APP_VERSION = 'v2.0.1';

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '首页', path: '/' },
  { id: 'chat', label: 'AI 对话', path: '/chat' },
  { id: 'resources', label: '资源导航', path: '/resources' },
  { id: 'tools', label: '工具箱', path: '/tools' },
  { id: 'audio', label: '音频设计', path: '/audio' },
  { id: 'music', label: '音乐图谱', path: '/music' },
  { id: 'game', label: '游戏百科', path: '/game' },
  { id: 'game-center', label: '游戏中心', path: '/game-center' },
  { id: 'about', label: '关于', path: '/about' },
];

/** 根据 path 查找当前激活的导航项 */
export function getActiveNav(pathname: string): string {
  if (pathname === '/') return 'home';
  // 1) 精确匹配（最高优先）
  const exact = NAV_ITEMS.find(n => n.path === pathname);
  if (exact) return exact.id;
  // 2) 前缀匹配：必须 path + '/'，避免 /game-center 误命中 /game
  const prefix = NAV_ITEMS.find(n => n.path !== '/' && pathname.startsWith(n.path + '/'));
  return prefix?.id ?? 'home';
}
