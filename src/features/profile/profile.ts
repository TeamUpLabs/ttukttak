export type Track = 'beginner' | 'regular' | 'expert'
export type FeedbackType = 'bug' | 'ux' | 'code' | 'kudo'

/** 한 주에 낸 제출 하나. rank는 트랙 순위, 이번 주처럼 아직 집계 전이면 null. */
export type Entry = {
  weekId: string
  title: string
  track: Track
  votes: number
  rank: number | null
  /** 이번 주 제출작처럼 상세 페이지가 있는 경우 */
  submissionId?: string
}

export type Feedback = {
  id: string
  type: FeedbackType
  targetTitle: string
  targetHandle: string
  targetId: string
  body: string
  helpful: number
  createdAt: string
}

export type User = {
  handle: string
  name: string
  bio: string
  links: { github: string | null; blog: string | null }
  joinedAt: string
  followers: number
  following: number
  history: Entry[]
  feedbacks: Feedback[]
}

/** 통계에 필요한 주차 정보만 */
export type WeekLite = { id: string; type: string; code: string; title: string; schedule: { opensAt: string } }

export type Cell = { kind: 0 | 1 | 2; label: string; isNow: boolean }

const isTop3 = (e: Entry) => e.rank !== null && e.rank <= 3

/**
 * 52주 격자와 통계. 휴식 주는 연속 기록을 끊지 않고,
 * 아직 진행 중인 이번 주에 안 냈어도 연속 기록은 지난주까지로 세요.
 */
export function profileStats(weeks: WeekLite[], entries: Entry[], now: Date) {
  const t = now.getTime()
  const nowIndex = weeks.findLastIndex((w) => Date.parse(w.schedule.opensAt) <= t)
  const byWeek = new Map(entries.map((e) => [e.weekId, e]))

  const recent = weeks.slice(Math.max(0, nowIndex - 51), nowIndex + 1)
  const cells: Cell[] = [
    ...Array.from({ length: 52 - recent.length }, () => ({ kind: 0 as const, label: '기록 없음', isNow: false })),
    ...recent.map((w, i) => {
      const e = byWeek.get(w.id)
      const kind = !e ? 0 : isTop3(e) ? 2 : 1
      const what = w.type === 'break' ? '휴식 주' : ['쉼', '제출', '제출 · 트랙 TOP 3'][kind]
      return { kind, label: `${w.id.slice(0, 4)} ${w.code} · ${what}`, isNow: i === recent.length - 1 } as Cell
    }),
  ]

  let streak = 0
  for (let i = nowIndex; i >= 0; i--) {
    const w = weeks[i]
    if (w.type !== 'theme') continue
    if (byWeek.has(w.id)) streak++
    else if (i === nowIndex) continue
    else break
  }

  return {
    cells,
    streak,
    recentCount: recent.filter((w) => byWeek.has(w.id)).length,
    top3: entries.filter(isTop3).length,
    votes: entries.reduce((sum, e) => sum + e.votes, 0),
  }
}
