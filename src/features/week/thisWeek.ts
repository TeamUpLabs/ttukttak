export type Track = 'beginner' | 'regular' | 'expert'
export type Difficulty = 'low' | 'medium' | 'high'

export type Week = {
  id: string
  type: 'theme' | 'break'
  round: number | null
  code: string
  title: string
  announcement: string
  rule: string | null
  difficulty: Difficulty | null
  examples: Record<Track, string> | null
  schedule: {
    opensAt: string
    submissionClosesAt: string | null
    votingClosesAt: string | null
    resultsAt: string | null
  }
  /** 지난 주에만 집계돼 있어요 */
  submissionCount?: number
}

export type Phase = '제출 마감까지' | '투표 마감까지' | '결과 발표까지' | '다음 주제 공개까지'

/**
 * now 기준으로 열려 있는 주와 다음 마감을 골라요.
 * week가 없으면 시즌 시작 전, phase가 없으면 시즌이 끝난 거예요.
 */
export function getThisWeek(weeks: Week[], now: Date) {
  const t = now.getTime()
  const i = weeks.findLastIndex((w) => Date.parse(w.schedule.opensAt) <= t)
  const week: Week | undefined = weeks[i]
  // 휴식 주가 이어질 수 있어서 다음 "주제" 주를 찾아요.
  const next = weeks.slice(i + 1).find((w) => w.type === 'theme')

  const steps: [Phase, string | null | undefined][] = [
    ['제출 마감까지', week?.schedule.submissionClosesAt],
    ['투표 마감까지', week?.schedule.votingClosesAt],
    ['결과 발표까지', week?.schedule.resultsAt],
    ['다음 주제 공개까지', next?.schedule.opensAt],
  ]
  const step = steps.find(([, at]) => at && Date.parse(at) > t)

  return {
    week,
    next,
    phase: step?.[0],
    deadline: step?.[1] ? new Date(step[1]) : undefined,
  }
}

/** 결과까지 발표된 주제 주. 최근 주가 먼저. */
export function getPastWeeks(weeks: Week[], now: Date) {
  return weeks
    .filter((w) => w.type === 'theme' && w.schedule.resultsAt && Date.parse(w.schedule.resultsAt) <= now.getTime())
    .sort((a, b) => Date.parse(b.schedule.opensAt) - Date.parse(a.schedule.opensAt))
}
