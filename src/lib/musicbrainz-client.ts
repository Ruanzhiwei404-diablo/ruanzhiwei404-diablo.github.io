/**
 * MusicBrainz API Client
 * 免费音乐元数据库 — 无需 API Key / 无 OAuth / 1 req/s / JSON 直出
 * 文档: https://musicbrainz.org/doc/MusicBrainz_API
 */

const BASE = 'https://musicbrainz.org/ws/2';
const RATE_LIMIT_MS = 1100; // 略大于 1 req/s

let lastCall = 0;

async function throttledFetch(url: string): Promise<Response> {
  const now = Date.now();
  const gap = now - lastCall;
  if (gap < RATE_LIMIT_MS) {
    await new Promise(r => setTimeout(r, RATE_LIMIT_MS - gap));
  }
  lastCall = Date.now();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MusicBrainz API ${res.status}: ${res.statusText}`);
  return res;
}

/** 通用搜索 — 任意实体类型 */
export async function searchEntity(
  entity: MBEntity,
  query: string,
  opts?: { limit?: number; offset?: number; inc?: string[] },
): Promise<MBSearchResult> {
  const limit = opts?.limit ?? 25;
  const offset = opts?.offset ?? 0;
  const incStr = opts?.inc?.length ? `&inc=${opts.inc.join('+')}` : '';
  const url = `${BASE}/${entity}?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}${incStr}&fmt=json`;
  const res = await throttledFetch(url);
  return res.json();
}

/** Lookup — 已知 MBID 获取详情 */
export async function lookupEntity(
  entity: MBEntity,
  mbid: string,
  inc?: string[],
): Promise<MBEntityDetail> {
  const incStr = inc?.length ? `?inc=${inc.join('+')}` : '';
  const sep = incStr ? '&' : '?';
  const url = `${BASE}/${entity}/${mbid}${incStr}${sep}fmt=json`;
  const res = await throttledFetch(url);
  return res.json();
}

/** Browse — 按关联实体浏览 */
export async function browseEntity(
  entity: MBEntity,
  linkedEntity: string,
  linkedMBID: string,
  opts?: { limit?: number; offset?: number; inc?: string[] },
): Promise<MBBrowseResult> {
  const limit = opts?.limit ?? 25;
  const offset = opts?.offset ?? 0;
  const incStr = opts?.inc?.length ? `&inc=${opts.inc.join('+')}` : '';
  const url = `${BASE}/${entity}?${linkedEntity}=${linkedMBID}&limit=${limit}&offset=${offset}${incStr}&fmt=json`;
  const res = await throttledFetch(url);
  return res.json();
}

/** 获取所有流派 */
export async function getAllGenres(opts?: { limit?: number; offset?: number }): Promise<MBGenreList> {
  const limit = opts?.limit ?? 100;
  const offset = opts?.offset ?? 0;
  const url = `${BASE}/genre/all?limit=${limit}&offset=${offset}&fmt=json`;
  const res = await throttledFetch(url);
  return res.json();
}

// ——— Types ———

export type MBEntity =
  | 'instrument'
  | 'artist'
  | 'recording'
  | 'release'
  | 'release-group'
  | 'genre'
  | 'work'
  | 'label'
  | 'area'
  | 'event'
  | 'place'
  | 'series'
  | 'url';

export interface MBSearchResult {
  created?: string;
  count: number;
  offset: number;
  [key: string]: any; // instrument/artist/recording etc. keyed by entity type
}

export interface MBEntityDetail {
  id: string;
  name: string;
  type?: string;
  typeId?: string;
  disambiguation?: string;
  aliases?: MBAlias[];
  tags?: MBTag[];
  genres?: MBGenreRef[];
  relations?: MBRelation[];
  description?: string;
  [key: string]: any;
}

export interface MBBrowseResult {
  instrument?: MBInstrument[];
  instrumentOffset?: number;
  instrumentCount?: number;
  artist?: MBArtist[];
  artistOffset?: number;
  artistCount?: number;
  recording?: MBRecording[];
  recordingOffset?: number;
  recordingCount?: number;
  [key: string]: any;
}

export interface MBGenreList {
  genres: MBGenreRef[];
  genreOffset: number;
  genreCount: number;
}

export interface MBInstrument {
  id: string;
  name: string;
  type?: string;
  typeId?: string;
  disambiguation?: string;
  description?: string;
  aliases?: MBAlias[];
  tags?: MBTag[];
  genres?: MBGenreRef[];
}

export interface MBArtist {
  id: string;
  name: string;
  sortName?: string;
  type?: string;
  typeId?: string;
  disambiguation?: string;
  country?: string;
  beginArea?: { name: string; id: string };
  tags?: MBTag[];
  genres?: MBGenreRef[];
}

export interface MBRecording {
  id: string;
  title: string;
  length?: number;
  disambiguation?: string;
  artistCredit?: MBCredit[];
  releases?: MBReleaseRef[];
  relations?: MBRelation[];
}

export interface MBReleaseRef {
  id: string;
  title: string;
}

export interface MBCredit {
  artist: MBArtist;
  name: string;
  joinphrase?: string;
}

export interface MBGenreRef {
  id: string;
  name: string;
  count?: number;
}

export interface MBTag {
  name: string;
  count: number;
}

export interface MBAlias {
  name: string;
  sortName?: string;
  type?: string;
  typeId?: string;
  locale?: string;
  primary?: boolean;
}

export interface MBRelation {
  type: string;
  typeId: string;
  direction: string;
  target?: any;
  targetType?: string;
  begin?: string;
  end?: string;
  ended?: boolean;
  attributes?: any[];
  url?: { resource: string };
}
