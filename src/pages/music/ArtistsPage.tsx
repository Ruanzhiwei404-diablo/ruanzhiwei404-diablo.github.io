import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  searchEntity,
  lookupEntity,
  type MBArtist,
  type MBEntityDetail,
  type MBTag,
  type MBGenreRef,
  type MBRelation,
} from '../../lib/musicbrainz-client';

const COLOR = '#8b5cf6';

export default function ArtistsPage() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MBArtist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<MBEntityDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const data = await searchEntity('artist', q, { limit: 50 });
      const artists: MBArtist[] = data.artists ?? [];
      setResults(artists);
      setTotal(data.count ?? artists.length);
    } catch (e: any) {
      setError(e.message ?? '搜索失败');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) search(initialQuery);
  }, [initialQuery, search]);

  const loadDetail = async (mbid: string) => {
    setDetailLoading(true);
    try {
      const detail = await lookupEntity('artist', mbid, [
        'aliases', 'tags', 'genres', 'instrument-rels', 'recording-rels', 'url-rels',
      ]);
      setSelected(detail);
    } catch (e: any) {
      setError(e.message ?? '加载详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const getTypeLabel = (type?: string) => {
    const map: Record<string, string> = {
      'Person': '个人',
      'Group': '乐队/组合',
      'Character': '虚拟角色',
      'Other': '其他',
    };
    return map[type ?? ''] ?? type ?? '—';
  };

  return (
    <div className="min-h-screen bg-bg-dark p-6">
      <div className="max-w-[1100px] mx-auto">
        {/* 头部 */}
        <div className="mb-6">
          <Link to="/music" className="text-xs text-gray-500 hover:text-gray-300 no-underline">
            ← 音乐图谱
          </Link>
          <h1 className="text-xl font-extrabold mt-2" style={{ color: COLOR }}>
            👤 演奏者图谱
          </h1>
          <p className="text-sm text-gray-500">
            谁用过这个合成器？追溯每个乐器背后的演奏者网络
          </p>
        </div>

        {/* 搜索栏 */}
        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search(query)}
            placeholder="搜索艺术家… (如 Kraftwerk, Aphex Twin, Jean-Michel Jarre)"
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-purple-600 focus:outline-none transition-colors"
          />
          <button
            onClick={() => search(query)}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
            style={{
              background: `linear-gradient(135deg, ${COLOR}, #6d28d9)`,
              color: 'white',
            }}
          >
            {loading ? '搜索中…' : '搜索'}
          </button>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg px-4 py-3 text-sm text-red-300 mb-4">
            {error}
          </div>
        )}

        {/* 两栏布局 */}
        <div className="flex gap-5 flex-col lg:flex-row">
          {/* 左：列表 */}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 mb-3">
              {loading ? '加载中…' : `共 ${total} 个结果`}
            </div>

            {results.length === 0 && !loading && !error && (
              <div className="text-sm text-gray-600 text-center py-10">
                输入关键词搜索艺术家
              </div>
            )}

            <div className="flex flex-col gap-3">
              {results.map((artist) => (
                <button
                  key={artist.id}
                  onClick={() => loadDetail(artist.id)}
                  className="card p-4 text-left cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                  style={{
                    borderColor: selected?.id === artist.id ? `${COLOR}60` : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                      style={{
                        background: `${COLOR}20`,
                        color: COLOR,
                      }}
                    >
                      👤
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-text-bright truncate">
                        {artist.name}
                        {artist.disambiguation && (
                          <span className="text-gray-500 ml-1">({artist.disambiguation})</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {getTypeLabel(artist.type)}
                        {artist.country && ` · ${artist.country}`}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 右：详情 */}
          <div className="lg:w-[420px] lg:min-w-[420px]">
            {selected ? (
              <div className="card p-5 sticky top-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-[10px] flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${COLOR}, #6d28d9)`,
                    }}
                  >
                    <span className="text-lg">👤</span>
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-bright">{selected.name}</h2>
                    <div className="text-xs text-gray-500">
                      {getTypeLabel(selected.type)}
                      {selected.disambiguation && ` · ${selected.disambiguation}`}
                    </div>
                  </div>
                </div>

                {/* 关联流派 */}
                {selected.genres?.length && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1.5">关联流派</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(selected.genres as MBGenreRef[]).map((g) => (
                        <Link
                          key={g.id}
                          to={`/music/genres?search=${encodeURIComponent(g.name)}`}
                          className="text-xs px-2 py-0.5 rounded border no-underline transition-colors hover:brightness-110"
                          style={{
                            borderColor: '#ec489925',
                            background: '#ec489912',
                            color: '#ec4899',
                          }}
                        >
                          {g.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* 标签 */}
                {selected.tags?.length && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1.5">社区标签</div>
                    <div className="flex flex-wrap gap-1.5">
                      {(selected.tags as MBTag[]).slice(0, 15).map((tag) => (
                        <span
                          key={tag.name}
                          className="text-xs px-2 py-0.5 rounded border"
                          style={{
                            borderColor: `${COLOR}25`,
                            background: `${COLOR}08`,
                            color: `${COLOR}cc`,
                          }}
                        >
                          {tag.name} ×{tag.count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 使用乐器 */}
                {selected.relations?.filter(r => (r as any)['target-type'] === 'instrument').length && (
                  <div className="mb-3">
                    <div className="text-xs text-gray-500 mb-1.5">使用的乐器</div>
                    <div className="flex flex-col gap-1.5">
                      {(selected.relations as MBRelation[])
                        .filter(r => (r as any)['target-type'] === 'instrument')
                        .slice(0, 10)
                        .map((rel, i) => (
                          <Link
                            key={i}
                            to={`/music/instruments?search=${encodeURIComponent(rel.target?.name ?? '')}`}
                            className="text-xs px-2 py-1 rounded bg-zinc-800/50 border border-zinc-700 no-underline hover:border-emerald-600 transition-colors"
                          >
                            <span className="text-gray-500">{rel.type}</span>
                            <span className="text-emerald-400 ml-1.5 font-medium">{rel.target?.name ?? '—'}</span>
                          </Link>
                        ))}
                    </div>
                  </div>
                )}

                {/* 录音关联 */}
                <Link
                  to={`/music/recordings?artist=${selected.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium mt-3 no-underline transition-colors hover:gap-2.5"
                  style={{ color: '#f59e0b' }}
                >
                  📼 查看此艺人的录音 →
                </Link>
              </div>
            ) : detailLoading ? (
              <div className="card p-5 text-center">
                <div className="text-sm text-gray-500 animate-pulse">加载详情…</div>
              </div>
            ) : (
              <div className="card p-5 text-center">
                <div className="text-sm text-gray-600">点击左侧艺术家查看详情</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
