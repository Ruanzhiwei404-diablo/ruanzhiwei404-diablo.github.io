import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  browseEntity,
  searchEntity,
  lookupEntity,
  type MBRecording,
  type MBCredit,
  type MBRelation,
} from '../../lib/musicbrainz-client';

const COLOR = '#f59e0b';

/** 从 MusicBrainz url-rels 中提取 YouTube 视频 ID */
function extractYouTubeId(relations?: MBRelation[]): string | null {
  if (!relations?.length) return null;
  for (const rel of relations) {
    const url: string = rel.url?.resource ?? '';
    const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return watchMatch[1];
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return shortMatch[1];
    const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
    if (embedMatch) return embedMatch[1];
  }
  return null;
}

export default function RecordingsPage() {
  const [searchParams] = useSearchParams();
  const instrumentMBID = searchParams.get('instrument') ?? '';
  const instrumentName = searchParams.get('instrumentName') ?? '';
  const artistMBID = searchParams.get('artist') ?? '';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MBRecording[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState<'browse' | 'search'>(instrumentMBID || artistMBID ? 'browse' : 'search');

  // 播放状态
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [ytVideoIds, setYtVideoIds] = useState<Record<string, string | null>>({}); // mbid → ytId or null
  const [lookupLoading, setLookupLoading] = useState<string | null>(null); // 正在 lookup 的 mbid

  const browseRecordings = useCallback(async (mbid: string, linkedType: string, instrumentName?: string) => {
    setLoading(true);
    setError(null);
    try {
      let recs: MBRecording[] = [];
      let count = 0;

      if (linkedType === 'instrument' && instrumentName) {
        const data = await searchEntity('recording', `instrument:"${instrumentName}"`, { limit: 50 });
        recs = data.recordings ?? [];
        count = data.count ?? recs.length;
      } else if (linkedType === 'artist') {
        const data = await browseEntity('recording', 'artist', mbid, {
          limit: 50,
          inc: ['artist-credits', 'releases'],
        });
        recs = data.recordings ?? data.recording ?? [];
        count = data.recordingCount ?? data['recording-count'] ?? recs.length;
      }

      setResults(recs);
      setTotal(count);
    } catch (e: any) {
      setError(e.message ?? '加载失败');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchRecordings = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await searchEntity('recording', q, { limit: 50 });
      const recs: MBRecording[] = data.recordings ?? data.recording ?? [];
      setResults(recs);
      setTotal(data.count ?? recs.length);
    } catch (e: any) {
      setError(e.message ?? '搜索失败');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (instrumentMBID) {
      setMode('browse');
      browseRecordings(instrumentMBID, 'instrument', instrumentName);
    } else if (artistMBID) {
      setMode('browse');
      browseRecordings(artistMBID, 'artist');
    }
  }, [instrumentMBID, instrumentName, artistMBID, browseRecordings]);

  /** 点击播放按钮 — 按需 lookup url-rels */
  const handlePlay = useCallback(async (rec: MBRecording) => {
    const mbid = rec.id;

    // 如果已经在播放，关闭
    if (playingId === mbid) {
      setPlayingId(null);
      return;
    }

    // 如果之前已经 lookup 过（缓存）
    if (ytVideoIds[mbid] !== undefined) {
      setPlayingId(mbid);
      return;
    }

    // 开始 on-demand lookup
    setLookupLoading(mbid);
    setPlayingId(mbid);
    try {
      const detail = await lookupEntity('recording', mbid, ['url-rels']);
      const ytId = extractYouTubeId(detail.relations as MBRelation[]);
      setYtVideoIds(prev => ({ ...prev, [mbid]: ytId }));
    } catch {
      // lookup 失败 → 标记为无 YouTube 链接
      setYtVideoIds(prev => ({ ...prev, [mbid]: null }));
    } finally {
      setLookupLoading(null);
    }
  }, [playingId, ytVideoIds]);

  const formatDuration = (ms?: number) => {
    if (!ms) return '—';
    const s = Math.round(ms / 1000);
    const m = Math.floor(s / 60);
    return `${m}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const getArtistName = (credits?: MBCredit[]) => {
    if (!credits?.length) return '—';
    return credits.map(c => c.name ?? c.artist?.name).join(' / ');
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
            📼 录音考古
          </h1>
          <p className="text-sm text-gray-500">
            这个合成器出现在哪些经典歌曲中？每一段录音都是音乐史上的化石碎片
          </p>
        </div>

        {/* 搜索/浏览模式切换 */}
        <div className="flex gap-3 mb-4">
          <button
            onClick={() => { setMode('search'); setResults([]); setTotal(0); setPlayingId(null); }}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors cursor-pointer"
            style={{
              borderColor: mode === 'search' ? `${COLOR}60` : 'rgba(255,255,255,0.08)',
              background: mode === 'search' ? `${COLOR}15` : 'transparent',
              color: mode === 'search' ? COLOR : 'rgb(107,114,128)',
            }}
          >
            🔍 关键词搜索
          </button>
          {instrumentMBID && (
            <Link
              to={`/music/instruments?search=${encodeURIComponent(instrumentName || '')}`}
              className="text-xs px-3 py-1.5 rounded-lg border no-underline transition-colors"
              style={{
                borderColor: '#10b98140',
                background: '#10b98115',
                color: '#10b981',
              }}
            >
              🎹 返回乐器
            </Link>
          )}
          {artistMBID && (
            <Link
              to={`/music/artists?search=${searchParams.get('artistName') ?? ''}`}
              className="text-xs px-3 py-1.5 rounded-lg border no-underline transition-colors"
              style={{
                borderColor: '#8b5cf640',
                background: '#8b5cf615',
                color: '#8b5cf6',
              }}
            >
              👤 返回艺人
            </Link>
          )}
        </div>

        {/* 搜索栏（仅 search 模式） */}
        {mode === 'search' && (
          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchRecordings(query)}
              placeholder="搜索录音… (如 Tomorrow, Autoportrait)"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:border-amber-600 focus:outline-none transition-colors"
            />
            <button
              onClick={() => searchRecordings(query)}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer disabled:opacity-50"
              style={{
                background: `linear-gradient(135deg, ${COLOR}, #d97706)`,
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

        {/* 浏览模式标题 */}
        {mode === 'browse' && (
          <div className="mb-4 text-xs" style={{ color: `${COLOR}cc` }}>
            {instrumentMBID ? '按乐器浏览录音' : '按艺人浏览录音'} · {loading ? '加载中…' : `${total} 个录音`}
          </div>
        )}

        {/* 搜索模式标题 */}
        {mode === 'search' && !loading && results.length > 0 && (
          <div className="text-xs text-gray-500 mb-3">
            共 {total} 个结果
          </div>
        )}

        {results.length === 0 && !loading && (
          <div className="text-sm text-gray-600 text-center py-10">
            {mode === 'search' ? '输入关键词搜索录音' : '暂无录音数据'}
          </div>
        )}

        {/* 列表 */}
        <div className="flex flex-col gap-3">
          {results.map((rec) => {
            const isPlaying = playingId === rec.id;
            const cachedYtId = ytVideoIds[rec.id];
            const isLookingUp = lookupLoading === rec.id;
            // 已知有 YouTube 链接（从缓存中取）
            const knownYtId = cachedYtId ?? null;
            // 尚未 lookup 过，尚不确定
            const unknown = cachedYtId === undefined;

            // 构造 YouTube 搜索链接（用于 fallback）
            const artistStr = getArtistName(rec.artistCredit ?? (rec as any)['artist-credit']);
            const ytSearchQuery = encodeURIComponent(`${rec.title} ${artistStr}`);
            const ytSearchUrl = `https://www.youtube.com/results?search_query=${ytSearchQuery}`;

            return (
              <div
                key={rec.id}
                className="card overflow-hidden"
                style={{
                  borderColor: isPlaying ? '#ff000040' : undefined,
                }}
              >
                {/* 卡片头部 */}
                <div className="p-4 flex items-center gap-3">
                  {/* 播放按钮 */}
                  <button
                    onClick={() => handlePlay(rec)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all hover:scale-110"
                    style={{
                      background: isPlaying ? '#ff000025' : `${COLOR}20`,
                      color: isPlaying ? '#ff4444' : COLOR,
                      border: isPlaying ? '1px solid #ff000040' : '1px solid transparent',
                    }}
                    title={isPlaying ? '关闭播放' : '播放'}
                  >
                    {isLookingUp ? '⏳' : isPlaying ? '✕' : '▶'}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-text-bright truncate">
                      {rec.title}
                      {rec.disambiguation && (
                        <span className="text-gray-500 ml-1">({rec.disambiguation})</span>
                      )}
                      {knownYtId && !isPlaying && (
                        <span
                          className="ml-2 text-xs px-1.5 py-0.5 rounded"
                          style={{ background: '#ff000015', color: '#ff4444' }}
                        >
                          YouTube
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {artistStr}
                      {rec.length && ` · ${formatDuration(rec.length)}`}
                    </div>
                  </div>

                  {/* MusicBrainz 链接 */}
                  <a
                    href={`https://musicbrainz.org/recording/${rec.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gray-600 hover:text-gray-400 no-underline transition-colors"
                    title="在 MusicBrainz 查看"
                  >
                    {rec.id.slice(0, 8)}…
                  </a>
                </div>

                {/* 播放面板 */}
                {isPlaying && (
                  <div className="px-4 pb-4">
                    {isLookingUp && (
                      <div className="rounded-lg p-6 text-center text-sm text-gray-400 animate-pulse" style={{ background: '#00000040' }}>
                        正在查找 YouTube 链接…
                      </div>
                    )}

                    {/* 已知 YouTube 视频 ID → 嵌入 iframe */}
                    {!isLookingUp && knownYtId && (
                      <div className="rounded-lg overflow-hidden" style={{ background: '#000' }}>
                        <iframe
                          src={`https://www.youtube.com/embed/${knownYtId}?rel=0&modestbranding=1`}
                          title={`播放: ${rec.title}`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          style={{
                            width: '100%',
                            aspectRatio: '16/9',
                            border: 'none',
                            display: 'block',
                          }}
                        />
                      </div>
                    )}

                    {/* lookup 完成，无 YouTube 链接 → fallback 搜索 */}
                    {!isLookingUp && !unknown && !knownYtId && (
                      <div className="rounded-lg p-5" style={{ background: '#0f0f0f', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="text-xs text-gray-500 mb-3">
                          MusicBrainz 未收录此录音的 YouTube 链接
                        </div>
                        <a
                          href={ytSearchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold no-underline transition-all hover:scale-[1.02]"
                          style={{
                            background: 'linear-gradient(135deg, #ff0000, #cc0000)',
                            color: 'white',
                          }}
                        >
                          <span>▶</span> 在 YouTube 搜索「{rec.title} - {artistStr}」
                        </a>
                      </div>
                    )}

                    {/* 尚未 lookup（只在首次播放时出现，几乎瞬间被 lookupLoading 取代） */}
                    {!isLookingUp && unknown && (
                      <div className="rounded-lg p-6 text-center text-sm text-gray-400 animate-pulse" style={{ background: '#00000040' }}>
                        准备查找播放源…
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
