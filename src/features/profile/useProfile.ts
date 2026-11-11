import { useNow } from '../../shared/hooks/useNow.ts'
import type { FeedbackType } from '../../shared/ui/FeedbackType/types.ts'
import users from '../../../mocks/users.json'
import weekData from '../../../mocks/weeks.json'
import submissions from '../../../mocks/submissions.json'
import feedback from '../../../mocks/feedback.json'
import { profileStats, type Entry, type Feedback, type Track, type User, type WeekLite } from './profile.ts'

// ponytail: 목 데이터 고정. Supabase 붙이면 profiles·submissions·feedback 쿼리로 바꿔요.
const weeks = weekData.weeks as WeekLite[]
const weekById = new Map(weeks.map((w) => [w.id, w]))
const submissionById = new Map(submissions.map((s) => [s.id, s]))
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

  const feedbacks: Feedback[] = feedback
    .filter((f) => f.handle === handle)
    .flatMap((f) => {
      const target = submissionById.get(f.submissionId)
      if (!target) return []
      return [{
        id: f.id,
        type: f.type as FeedbackType,
        targetTitle: target.title,
        targetHandle: target.handle.replace(/^@/, ''),
        targetId: target.id,
        body: f.body,
        helpful: f.helpful,
        createdAt: f.createdAt,
      }]
    })

  return { user, entries, feedbacks, now, weekOf: (id: string) => weekById.get(id), ...profileStats(weeks, entries, now) }
}
