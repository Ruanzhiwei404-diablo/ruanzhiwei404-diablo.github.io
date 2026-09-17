import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getAllGenres,
  searchEntity,
  type MBGenreRef,
} from '../../lib/musicbrainz-client';

const COLOR = '#ec4899';

export default function GenresPage() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') ?? '';

  const [genres, setGenres] = useState<MBGenreRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [mode, setMode] = useState<'browse' | 'search'>(initialSearch ? 'search' : 'browse');

  const loadAllGenres = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllGenres({ limit: 100 });
      setGenres(data.genres ?? []);
      setTotal(data.genreCount ?? data.genres?.length ?? 0);
    } catch (e: any) {
      setError(e.message ?? '加载失败');
      setGenres([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchGenres = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchEntity('genre', q, { limit: 50 });
      setGenres(data.genres ?? []);
      setTotal(data.count ?? data.genres?.length ?? 0);
    } catch (e: any) {
      setError(e.message ?? '搜索失败');
      setGenres([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialSearch) {
      setMode('search');
      searchGenres(initialSearch);
    } else {
      loadAllGenres();
    }
  }, [initialSearch, searchGenres, loadAllGenres]);

  // 电子/合成器相关流派
  const electronicGenres = genres.filter(g =>
    /synth|electro|techno|house|ambient|trance|dub|drum|bass|chiptune|lo-fi|vaporwave|witch|dungeon|industrial|noise|glitch|IDM|break|hardcore|gabber|acid|deep|prog|algorave|EBM|new wave|wave|djent/i.test(g.name),
  );

  const otherGenres = genres.filter(g =>
    !/synth|electro|techno|house|ambient|trance|dub|drum|bass|chiptune|lo-fi|vaporwave|witch|dungeon|industrial|noise|glitch|IDM|break|hardcore|gabber|acid|deep|prog|algorave|EBM|new wave|wave|djent/i.test(g.name),
  );

  return (
    <div className="min-h-screen bg-bg-dark p-6">
      <div className="max-w-[900px] mx-auto">
        {/* 头部 */}
        <div className="mb-6">
          <Link to="/music" className="text-xs text-gray-500 hover:text-gray-300 no-underline">
            ← 音乐图谱
          </Link>
          <h1 className="text-xl font-extrabold mt-2" style={{ color: COLOR }}>
            🗺️ 流派地图
          </h1>
          <p className="text-sm text-gray-500">
            数千个细分流派构成的声景地貌 — 每个流派都与乐器和艺人交织
          </p>
        </div>

        {/* 搜索/浏览切换 */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => { setMode('browse'); loadAllGenres(); }}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
            style={{
              borderColor: mode === 'browse' ? `${COLOR}60` : 'rgba(255,255,255,0.08)',
              background: mode === 'browse' ? `${COLOR}15` : 'transparent',
              color: mode === 'browse' ? COLOR : 'rgb(107,114,128)',
            }}
          >
            📋 全部流派
          </button>
          <button
            onClick={() => setMode('search')}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
            style={{
              borderColor: mode === 'search' ? `${COLOR}60` : 'rgba(255,255,255,0.08)',
              background: mode === 'search' ? `${COLOR}15` : 'transparent',
              color: mode === 'search' ? COLOR : 'rgb(107,114,128)',
            }}
          >
            🔍 搜索流派
          </button>
        </div>

        {/* 搜索栏 */}
        {mode === 'search' && (
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchGenres(searchQuery)}
              placeholder="搜索流派… (如 synth-pop, ambient, techno)"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-pink-600 focus:outline-none transition-colors"
            />
            <button
              onClick={() => searchGenres(searchQuery)}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${COLOR}, #db2777)`,
                color: 'white',
              }}
            >
              {loading ? '搜索中…' : '搜索'}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-300 mb-4">
            {error}
          </div>
        )}

        <div className="text-xs text-gray-500 mb-3">
          {loading ? '加载中…' : `共 ${total} 个流派（显示 ${genres.length} 个）`}
        </div>

        {/* 电子/合成器相关流派 — 高亮区块 */}
        {mode === 'browse' && electronicGenres.length > 0 && (
          <div className="mb-6">
            <div
              className="text-sm font-semibold mb-3 px-3 py-2 rounded-lg"
              style={{ background: `${COLOR}15`, color: COLOR }}
            >
              ⚡ 电子 / 合成器相关流派
            </div>
            <div className="flex flex-wrap gap-2">
              {electronicGenres.map((g) => (
                <Link
                  key={g.id}
                  to={`/music/instruments?search=${encodeURIComponent(g.name)}`}
                  className="text-xs px-3 py-2 rounded-lg border no-underline transition-all duration-200 hover:scale-[1.03]"
                  style={{
                    borderColor: `${COLOR}35`,
                    background: `${COLOR}12`,
                    color: `${COLOR}cc`,
                  }}
                >
                  {g.name}
                  {g.count && <span className="ml-1 text-gray-500">×{g.count}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* 其他流派 */}
        {otherGenres.length > 0 && (
          <div className="mb-4">
            {mode === 'browse' && (
              <div className="text-sm font-semibold mb-3 text-gray-400">
                🎶 其他流派
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {otherGenres.slice(0, mode === 'browse' ? 60 : 50).map((g) => (
                <Link
                  key={g.id}
                  to={`/music/instruments?search=${encodeURIComponent(g.name)}`}
                  className="text-xs px-3 py-2 rounded-lg border no-underline transition-all duration-200 hover:scale-[1.03]"
                  style={{
                    borderColor: 'rgba(255,255,255,0.06)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'rgb(156,163,175)',
                  }}
                >
                  {g.name}
                  {g.count && <span className="ml-1 text-gray-600">×{g.count}</span>}
                </Link>
              ))}
            </div>
          </div>
        )}

        {genres.length === 0 && !loading && (
          <div className="text-sm text-gray-600 text-center py-10">
            {mode === 'search' ? '输入关键词搜索流派' : '暂无流派数据'}
          </div>
        )}
      </div>
    </div>
  );
}
