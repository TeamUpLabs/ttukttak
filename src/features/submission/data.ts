import weekData from '../../../mocks/weeks.json'

export type Track = 'beginner' | 'regular' | 'expert'

export const TRACK_LABELS = weekData.labels.track as Record<Track, string>

/** 참가자가 올린 링크는 https만 써요(javascript: 같은 주소 차단). */
export function safeHttps(url: string) {
  try {
    return new URL(url).protocol === 'https:' ? url : null
  } catch {
    return null
  }
}
