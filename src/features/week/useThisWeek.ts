import { queryOptions, useQuery } from '@tanstack/react-query'
import { weeksApi, type CurrentWeekResponse, type WeekSummary } from '../../api/weeks.ts'
import { useNow } from '../../shared/hooks/useNow.ts'
import { getThisWeek, type Difficulty, type Track, type Week } from './thisWeek.ts'

export const weekLabels = {
  difficulty: { low: '낮음', medium: '보통', high: '높음' } satisfies Record<Difficulty, string>,
  track: { beginner: '입문', regular: '일반', expert: '고수' } satisfies Record<Track, string>,
}

/** 결과가 나온 주제 주(GET /weeks)를 화면용 Week로. 목록엔 주제 문구가 없어요. */
export const fromSummary = (w: WeekSummary): Week => ({
  ...w,
  title: w.title ?? '',
  announcement: '',
  rule: null,
  difficulty: null,
  examples: null,
})

// 서버는 다음 주차의 id와 공개 시각만 줘요(주제는 공개 전까지 비밀). "2026-w48" → "W48"
const fromNext = (n: NonNullable<CurrentWeekResponse['nextWeek']>): Week => ({
  id: n.id,
  type: 'theme',
  round: null,
  code: n.id.slice(5).toUpperCase(),
  title: '',
  announcement: '',
  rule: null,
  difficulty: null,
  examples: null,
  schedule: { opensAt: n.opensAt, submissionClosesAt: null, votingClosesAt: null, resultsAt: null },
})

// 마감·공개 순간에 새 주차로 넘어가도록 1분마다 다시 받아요.
const currentQuery = queryOptions({
  queryKey: ['weeks', 'current'],
  queryFn: weeksApi.current,
  refetchInterval: 60_000,
})

/**
 * 이번 주 정보(GET /weeks/current). 단계와 카운트다운은 tickMs마다 브라우저 시각으로 다시 계산해요.
 * ponytail: 브라우저 시계를 그대로 믿어요. 시계가 틀린 사용자가 많으면 serverTime과의 차이로 보정해요.
 */
export function useThisWeek(tickMs = 1000) {
  const now = useNow(tickMs)
  const { data, isPending } = useQuery(currentQuery)
  const weeks: Week[] = []
  if (data?.week) weeks.push(data.week)
  if (data?.nextWeek) weeks.push(fromNext(data.nextWeek))
  return { now, isPending, stats: data?.stats ?? null, ...getThisWeek(weeks, now) }
}

/** 지난 주제 최근 limit개 */
export function usePastWeeks(limit: number) {
  const { data } = useQuery({
    queryKey: ['weeks', { limit }],
    queryFn: () => weeksApi.archive({ limit }),
  })
  return data?.items.map(fromSummary) ?? []
}
