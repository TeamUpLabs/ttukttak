import { useQuery } from '@tanstack/react-query'
import { weeksApi } from '../../api/weeks.ts'
import { submissionsApi } from '../../api/submissions.ts'
import { useNow } from '../../shared/hooks/useNow.ts'
import { weekStatus, type ResultEntry } from './results.ts'
import type { Week } from './thisWeek.ts'
import { fromSummary } from './useThisWeek.ts'

// 주차 정보는 GET /weeks/:weekId, 제출작은 GET /weeks/:weekId/submissions?sort=votes에서 받아요.
// ponytail: 제출작은 최대 50개, 한 줄 회고는 목록 카드에 없어서 비어요. 서버가 podium·회고를 주면 채워요.

/** 주차 id("2026-w45")로 결과 화면에 필요한 걸 모아요. 불러오는 중이면 undefined, 없는 주면 null. */
export function useWeekResults(id: string) {
  const now = useNow(60_000)
  const { data, isPending } = useQuery({ queryKey: ['weeks', id], queryFn: () => weeksApi.get(id) })
  const list = useQuery({
    queryKey: ['submissions', id, { sort: 'votes' }],
    queryFn: () => submissionsApi.list(id, { sort: 'votes', limit: 50 }),
  })
  if (isPending || list.isPending) return undefined
  if (!data) return null

  const week: Week = {
    ...fromSummary(data.week),
    announcement: data.week.announcement ?? '',
    constraints: data.week.constraints ?? [],
    participantCount: data.stats.participants,
    submissionCount: data.stats.submissions,
  }
  const entries: ResultEntry[] = (list.data?.items ?? []).map((s) => ({
    key: s.id, title: s.title, handle: s.author.handle, track: s.track, votes: s.voteCount,
    submittedAt: s.submittedAt, stack: s.stack, retro: null, href: `/p/${s.id}`, hasProfile: true,
  }))
  return { week, prev: data.prev, next: data.next, status: weekStatus(week, now), entries }
}
