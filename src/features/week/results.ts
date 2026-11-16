import type { Track } from '../../api/weeks.ts'
import type { Week } from './thisWeek.ts'

export type { Track }

/** 한 주의 제출 하나. 지금 주(투표 집계 중)든 지난 주든 같은 모양으로 맞춰요. */
export type ResultEntry = {
  key: string
  title: string
  handle: string
  track: Track
  votes: number
  submittedAt: string
  stack: string[]
  retro: string | null
  /** 상세 페이지가 있으면 */
  href: string | null
  hasProfile: boolean
}

export type WeekStatus = 'upcoming' | 'break' | 'building' | 'voting' | 'waiting' | 'final'

export const STATUS_LABELS: Record<WeekStatus, string> = {
  upcoming: '공개 전',
  break: '쉬는 주',
  building: '제작 중',
  voting: '투표 중',
  waiting: '결과 발표 대기',
  final: '결과 확정',
}

export function weekStatus(week: Week, now: Date): WeekStatus {
  const t = now.getTime()
  const at = (iso: string | null) => (iso ? Date.parse(iso) : Infinity)
  if (t < Date.parse(week.schedule.opensAt)) return 'upcoming'
  if (week.type === 'break') return 'break'
  if (t < at(week.schedule.submissionClosesAt)) return 'building'
  if (t < at(week.schedule.votingClosesAt)) return 'voting'
  if (t < at(week.schedule.resultsAt)) return 'waiting'
  return 'final'
}

/** 트랙별 상위 3개, 1·2·3위 순서. 화면에선 2·1·3으로 세워요. */
export function podiumOf(entries: ResultEntry[], track: Track) {
  return entries.filter((e) => e.track === track).sort((a, b) => b.votes - a.votes).slice(0, 3)
}

/** 통계 4칸. 집계된 값이 있으면 그걸, 없으면 보이는 제출작으로 세요. */
export function weekStats(week: Week, entries: ResultEntry[]) {
  const submissions = week.submissionCount ?? entries.length
  const participants = Math.max(week.participantCount ?? submissions, submissions)
  return {
    submissions,
    participants,
    votes: week.voteCount ?? entries.reduce((sum, e) => sum + e.votes, 0),
    completion: participants ? Math.round((submissions / participants) * 100) : 0,
  }
}
