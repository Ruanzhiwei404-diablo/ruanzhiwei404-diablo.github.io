import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS, APP_VERSION } from '../config/navConfig';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const apiKey = localStorage.getItem('openai_api_key');

  return (
    <>
      {/* 桌面导航 */}
      <nav className="sticky top-0 z-50 flex items-center justify-between glass border-b border-[rgba(255,255,255,0.06)] px-10 h-[var(--nav-height)]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 no-underline shrink-0" onClick={() => setMobileOpen(false)}>
          <img
            src="/ruanzhiwei404-diablo.github.io/icon-v2.png"
            alt="because"
            className="w-[52px] h-[52px] rounded-xl block shadow-[0_6px_24px_rgba(219,39,119,0.4)]"
          />
          <div className="flex flex-col">
            <span className="text-white font-extrabold text-[17px] leading-tight tracking-tight">because</span>
            <span className="text-[0.7rem] text-primary font-medium bg-[rgba(0,212,170,0.1)] px-2 py-0.5 rounded border border-[rgba(0,212,170,0.2)] leading-none">
              {APP_VERSION}
            </span>
          </div>
        </Link>

        {/* 桌面菜单 */}
        <div className="hidden md:flex gap-1">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.id}
              to={item.path}
              className={`no-underline px-5 py-2 rounded-lg text-[16px] transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-[rgba(124,58,237,0.18)] text-purple-400 font-bold'
                  : 'text-gray-500 font-semibold hover:bg-[rgba(255,255,255,0.04)] hover:text-gray-300'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* 右侧按钮区 */}
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowSettings(s => !s)}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-all duration-200 ${
              apiKey
                ? 'bg-[rgba(74,222,128,0.1)] border-green-500/20 text-green-400'
                : 'bg-[rgba(250,204,21,0.1)] border-yellow-500/20 text-yellow-400'
            }`}
          >
            {apiKey ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
                API Keys
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                API Keys
              </>
            )}
          </button>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden bg-transparent border-none text-white text-xl cursor-pointer p-1"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* 移动端菜单 */}
      {mobileOpen && (
        <div className="md:hidden bg-[rgba(3,3,17,0.97)] border-b border-[rgba(255,255,255,0.06)] px-6 py-3 pb-5">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`block w-full no-underline rounded-lg py-2.5 px-3 text-[15px] mb-0.5 transition-all duration-200 ${
                isActive(item.path)
                  ? 'text-purple-400 font-semibold'
                  : 'text-gray-500 font-normal hover:bg-[rgba(255,255,255,0.04)]'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}

      {/* API 设置弹窗 */}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}

function SettingsModal({ onClose }: { onClose: () => void }) {
  const [baseUrl, setBaseUrl] = useState(() => localStorage.getItem('openai_base_url') || 'https://api.openai.com/v1');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_api_key') || '');
  const [model, setModel] = useState(() => localStorage.getItem('openai_model') || 'Qwen/Qwen2.5-7B-Instruct');

  const save = () => {
    localStorage.setItem('openai_api_key', apiKey);
    localStorage.setItem('openai_base_url', baseUrl);
    localStorage.setItem('openai_model', model);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-sm flex items-center justify-center p-5" onClick={onClose}>
      <div
        className="bg-[#0f0f23] border border-[rgba(255,255,255,0.1)] rounded-2xl p-7 max-w-[480px] w-full shadow-[0_24px_80px_rgba(0,0,0,0.6)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-white text-[17px] font-bold">⚙️ API 配置</h2>
          <button onClick={onClose} className="bg-transparent border-none text-gray-500 text-xl cursor-pointer hover:text-gray-300">✕</button>
        </div>

        <p className="text-gray-400 text-[13px] leading-relaxed mb-3.5">
          支持 <strong className="text-purple-400">OpenAI 格式</strong>的任意 API 接口（OpenAI / 硅基流动 / Groq 等）。Key 仅存储在本地浏览器。
        </p>

        <div className="mb-2.5">
          <label className="text-[11.5px] text-gray-500 mb-1 block">接口地址</label>
          <input
            type="text"
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="https://api.openai.com/v1"
            className="w-full px-3 py-2.5 bg-[#1a1a30] border border-[rgba(255,255,255,0.12)] rounded-xl text-gray-200 text-[12.5px] outline-none font-mono focus:border-purple-500/40 transition-colors"
          />
        </div>

        <div className="mb-2.5">
          <label className="text-[11.5px] text-gray-500 mb-1 block">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-xxxxxxxx"
            className="w-full px-3 py-2.5 bg-[#1a1a30] border border-[rgba(255,255,255,0.12)] rounded-xl text-gray-200 text-[12.5px] outline-none font-mono focus:border-purple-500/40 transition-colors"
          />
        </div>

        <div className="mb-3.5">
          <label className="text-[11.5px] text-gray-500 mb-1 block">模型名称</label>
          <input
            type="text"
            value={model}
            onChange={e => setModel(e.target.value)}
            placeholder="Qwen/Qwen2.5-7B-Instruct"
            className="w-full px-3 py-2.5 bg-[#1a1a30] border border-[rgba(255,255,255,0.12)] rounded-xl text-gray-200 text-[12.5px] outline-none font-mono focus:border-purple-500/40 transition-colors"
          />
        </div>

        <div className="text-[11.5px] text-gray-500 mb-3.5 leading-loose bg-[rgba(255,255,255,0.03)] rounded-lg p-2.5">
          <div>💡 <strong className="text-gray-200">硅基流动</strong> → baseUrl: <code className="text-purple-400">https://api.siliconflow.cn/v1</code></div>
          <div>💡 <strong className="text-gray-200">OpenAI</strong> → baseUrl: <code className="text-purple-400">https://api.openai.com/v1</code></div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={save}
            disabled={!apiKey}
            className="flex-1 py-2.5 rounded-xl text-white text-[13px] font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer gradient-primary"
          >
            保存并使用
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-transparent border border-[rgba(255,255,255,0.1)] rounded-xl text-gray-400 text-[13px] cursor-pointer hover:border-[rgba(255,255,255,0.2)] hover:text-gray-300 transition-all duration-200"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
