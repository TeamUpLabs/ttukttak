import { useNow } from '../../shared/hooks/useNow.ts'
import users from '../../../mocks/users.json'
import weekData from '../../../mocks/weeks.json'
import submissions from '../../../mocks/submissions.json'
import { profileStats, type Entry, type Track, type User, type WeekLite } from './profile.ts'

// ponytail: 목 데이터 고정. Supabase 붙이면 profiles·submissions 쿼리로 바꿔요.
const weeks = weekData.weeks as WeekLite[]
const weekById = new Map(weeks.map((w) => [w.id, w]))
export const trackLabels = weekData.labels.track as Record<Track, string>

/** 핸들("jh.park")로 프로필과 통계를 찾아요. 없으면 null. */
export function useProfile(handle: string) {
  const now = useNow(60_000)
  const user = (users as User[]).find((u) => u.handle === handle)
  if (!user) return null

  // 이번 주처럼 아직 집계 전인 제출은 submissions에서 가져와요.
  const live: Entry[] = submissions
    .filter((s) => s.handle.replace(/^@/, '') === handle && !user.history.some((h) => h.weekId === s.weekId))
    .map((s) => ({ weekId: s.weekId, title: s.title, track: s.track as Track, votes: s.voteCount, rank: null, submissionId: s.id }))
  const entries = [...live, ...user.history]

  return { user, entries, now, weekOf: (id: string) => weekById.get(id), ...profileStats(weeks, entries, now) }
}
