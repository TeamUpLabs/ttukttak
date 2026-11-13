import { useNow } from '../../shared/hooks/useNow.ts'
import type { FeedbackType } from '../../shared/ui/FeedbackType/types.ts'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../../api/users.ts'
import weekData from '../../../mocks/weeks.json'
import submissions from '../../../mocks/submissions.json'
import feedback from '../../../mocks/feedback.json'
import { profileStats, type Entry, type Feedback, type Track, type WeekLite } from './profile.ts'

// 프로필은 서버(GET /users/:handle)에서 받아요.
// ponytail: 제출 기록·피드백·팔로우는 아직 서버에 없어서 목 데이터로 채워요. 해당 API가 생기면 바꿔요.
const weeks = weekData.weeks as WeekLite[]
const weekById = new Map(weeks.map((w) => [w.id, w]))
const submissionById = new Map(submissions.map((s) => [s.id, s]))
export const trackLabels = weekData.labels.track as Record<Track, string>

/** 핸들("jh.park")로 프로필과 통계를 찾아요. 불러오는 중이면 undefined, 없으면 null. */
export function useProfile(handle: string) {
  const now = useNow(60_000)
  const { data, isPending } = useQuery({
    queryKey: ['users', handle],
    queryFn: () => usersApi.get(handle),
    enabled: handle !== '',
  })
  if (isPending) return undefined
  if (!data) return null
  const user = { ...data.user, followers: 0, following: 0 }

  // 이번 주처럼 아직 집계 전인 제출은 submissions에서 가져와요.
  const entries: Entry[] = submissions
    .filter((s) => s.handle.replace(/^@/, '') === handle)
    .map((s) => ({ weekId: s.weekId, title: s.title, track: s.track as Track, votes: s.voteCount, rank: null, submissionId: s.id }))

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
