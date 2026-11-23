import { getData, saveData } from '@/plugins/storage'

export type MusicParserFormat = 'meting' | 'json'

export interface MusicParserProfile {
  id: string
  name: string
  format: MusicParserFormat
  url: string
  method: 'GET' | 'POST'
  enabled: boolean
  timeout: number
  responsePath: string
  params: Record<string, string>
  headers: Record<string, string>
  body: string
}

const STORAGE_KEY = '@music_parser_profiles'
const sourceMap: Record<string, string> = {
  kw: 'kuwo',
  kg: 'kugou',
  tx: 'tencent',
  wy: 'netease',
  mg: 'migu',
  xm: 'ximalaya',
}

export const getMusicParserProfiles = async(): Promise<MusicParserProfile[]> => {
  const profiles = await getData<MusicParserProfile[]>(STORAGE_KEY)
  return Array.isArray(profiles) ? profiles : []
}

export const saveMusicParserProfiles = async(profiles: MusicParserProfile[]) => {
  await saveData(STORAGE_KEY, profiles)
}

const getValueByPath = (value: any, path: string): any => {
  if (!path) return undefined
  return path.split('.').reduce((current, key) => {
    if (current == null) return undefined
    const index = /^\\d+$/.test(key) ? Number(key) : key
    return current[index]
  }, value)
}

const fillTemplate = (value: string, musicInfo: LX.Music.MusicInfoOnline, quality: LX.Quality) => {
  return value
    .replace(/\\{source\\}/g, musicInfo.source)
    .replace(/\\{id\\}/g, encodeURIComponent(musicInfo.id))
    .replace(/\\{name\\}/g, encodeURIComponent(musicInfo.name))
    .replace(/\\{artist\\}/g, encodeURIComponent(musicInfo.singer))
    .replace(/\\{album\\}/g, encodeURIComponent(musicInfo.meta.albumName ?? ''))
    .replace(/\\{quality\\}/g, quality)
}

const isPlayableUrl = (value: unknown): value is string => {
  if (typeof value !== 'string' || !value.trim()) return false
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const getResponseUrl = (payload: any, responsePath: string): string | null => {
  if (typeof payload === 'string') {
    const text = payload.trim().replace(/^["']|["']$/g, '')
    if (isPlayableUrl(text)) return text
    try {
      payload = JSON.parse(text)
    } catch {
      return null
    }
  }
  const candidates = [
    responsePath ? getValueByPath(payload, responsePath) : undefined,
    payload?.url,
    payload?.data?.url,
    payload?.data?.[0]?.url,
    payload?.[0]?.url,
    payload?.src,
    payload?.data?.src,
  ]
  const result = candidates.find(isPlayableUrl)
  return result ?? null
}

const requestProfile = async(profile: MusicParserProfile, musicInfo: LX.Music.MusicInfoOnline, quality: LX.Quality) => {
  const values = {
    source: musicInfo.source,
    id: musicInfo.id,
    name: musicInfo.name,
    artist: musicInfo.singer,
    album: musicInfo.meta.albumName ?? '',
    quality,
  }
  let url = fillTemplate(profile.url, musicInfo, quality)
  const headers = { ...profile.headers }
  let body: string | undefined
  const params: Record<string, string> = { ...profile.params }

  if (profile.format === 'meting') {
    const server = sourceMap[musicInfo.source]
    if (!server) throw new Error('Meting 不支援此音源代碼')
    params.server = params.server || server
    params.type = params.type || 'url'
    params.id = params.id || musicInfo.id
  } else {
    for (const key of Object.keys(params)) params[key] = fillTemplate(params[key], musicInfo, quality)
  }

  const query = Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&')
  if (query) url += `${url.includes('?') ? '&' : '?'}${query}`
  if (profile.method === 'POST') {
    const rawBody = profile.body || JSON.stringify({
      source: '{source}', id: '{id}', name: '{name}', artist: '{artist}', quality: '{quality}',
    })
    body = rawBody.replace(/\\{(source|id|name|artist|album|quality)\\}/g, (_, key: keyof typeof values) => String(values[key]))
    if (!headers['Content-Type'] && !headers['content-type']) headers['Content-Type'] = 'application/json'
  }

  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
  const timeout = Math.max(3000, Math.min(profile.timeout || 10000, 30000))
  const timer = setTimeout(() => controller?.abort(), timeout)
  try {
    const response = await fetch(url, {
      method: profile.method,
      headers,
      body,
      signal: controller?.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const text = await response.text()
    let payload: any = text
    try {
      payload = JSON.parse(text)
    } catch {
      // Meting endpoints may return a plain URL string.
    }
    const playUrl = getResponseUrl(payload, profile.responsePath)
    if (!playUrl) throw new Error('回應中找不到有效的播放網址')
    return { url: playUrl, type: quality }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Run enabled parser profiles by priority order. The native music source remains
 * the primary provider; this resolver is called only after native URL lookup fails.
 */
export const getParsedMusicUrl = async(musicInfo: LX.Music.MusicInfoOnline, quality: LX.Quality) => {
  const profiles = (await getMusicParserProfiles()).filter(profile => profile.enabled && profile.url.trim())
  if (!profiles.length) throw new Error('尚未設定啟用中的音樂解析 API')

  const errors: string[] = []
  for (const profile of profiles) {
    try {
      return await requestProfile(profile, musicInfo, quality)
    } catch (error: any) {
      errors.push(`${profile.name}: ${error?.message ?? '解析失敗'}`)
    }
  }
  throw new Error(errors.join('；') || '所有音樂解析 API 均無法使用')
}

export const testMusicParserProfile = async(profile: MusicParserProfile) => {
  const sampleMusic = {
    source: 'wy',
    id: 'parser-test-song-id',
    name: '測試歌曲',
    singer: '測試歌手',
    meta: { albumName: '測試專輯' },
  } as LX.Music.MusicInfoOnline
  return requestProfile(profile, sampleMusic, '128k')
}
