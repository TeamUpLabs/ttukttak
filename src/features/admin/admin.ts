import { ApiError } from '../../api/client.ts'
import type { UpdateWeekBody, WeekStatus } from '../../api/admin.ts'
import type { Difficulty, WeekDetailResponse, WeekSchedule } from '../../api/weeks.ts'

export const INPUT =
  'w-full min-h-12 px-4 rounded-(--tt-radius-md) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) text-base placeholder:text-(--tt-muted) focus:outline-none focus:shadow-[0_0_0_4px_var(--tt-focus)]'

/** 4xx는 서버 문구와 칸별 오류를 붙여서, 나머지는 다시 시도를 안내해요. */
export function messageOf(e: unknown) {
  if (!(e instanceof ApiError) || e.status >= 500) return '잠시 후 다시 시도해 주세요.'
  const fields = Object.entries(e.fields).map(([k, m]) => `${k}: ${m}`)
  return [e.message, ...fields].join(' · ')
}

/** 서버는 "+09:00" 시각을 줘요. datetime-local 칸은 "2026-11-23T10:00" 모양이에요. */
export const toKstInput = (iso: string | null) =>
  iso ? new Date(new Date(iso).getTime() + 9 * 3_600_000).toISOString().slice(0, 16) : ''
export const fromKstInput = (value: string) => (value ? `${value}:00+09:00` : null)

export const SCHEDULE: { key: keyof WeekSchedule; label: string }[] = [
  { key: 'opensAt', label: '주제 공개' },
  { key: 'submissionClosesAt', label: '제출 마감' },
  { key: 'votingClosesAt', label: '투표 마감' },
  { key: 'resultsAt', label: '결과 발표' },
]

export type Values = {
  title: string
  announcement: string
  intent: string
  constraints: string
  rule: string
  notes: string
  difficulty: Difficulty | ''
  status: WeekStatus | ''
  schedule: Record<keyof WeekSchedule, string>
  force: boolean
}

/** GET /weeks/:id에 없는 rule, difficulty, status, notes는 비워 두고, 채운 것만 보내요. */
export function initial({ week }: WeekDetailResponse): Values {
  return {
    title: week.title ?? '',
    announcement: week.announcement ?? '',
    intent: week.intent ?? '',
    constraints: (week.constraints ?? []).join('\n'),
    rule: '',
    notes: '',
    difficulty: '',
    status: '',
    schedule: {
      opensAt: toKstInput(week.schedule.opensAt),
      submissionClosesAt: toKstInput(week.schedule.submissionClosesAt),
      votingClosesAt: toKstInput(week.schedule.votingClosesAt),
      resultsAt: toKstInput(week.schedule.resultsAt),
    },
    force: false,
  }
}

/** 처음 값과 달라진 칸만 보내요. 일정은 한 칸이라도 바뀌면 네 칸을 같이 보내요. */
export function changes(before: Values, v: Values): UpdateWeekBody {
  const body: UpdateWeekBody = {}
  if (v.title !== before.title) body.title = v.title.trim()
  if (v.announcement !== before.announcement) body.announcement = v.announcement.trim()
  if (v.intent !== before.intent) body.intent = v.intent.trim()
  if (v.constraints !== before.constraints) body.constraints = v.constraints.split('\n').map((c) => c.trim()).filter(Boolean)
  if (v.rule.trim()) body.rule = v.rule.trim()
  if (v.notes.trim()) body.notes = v.notes.trim()
  if (v.difficulty) body.difficulty = v.difficulty
  if (v.status) body.status = v.status
  if (SCHEDULE.some(({ key }) => v.schedule[key] !== before.schedule[key])) {
    body.schedule = {
      opensAt: fromKstInput(v.schedule.opensAt) ?? '',
      submissionClosesAt: fromKstInput(v.schedule.submissionClosesAt),
      votingClosesAt: fromKstInput(v.schedule.votingClosesAt),
      resultsAt: fromKstInput(v.schedule.resultsAt),
    }
  }
  if (v.force) body.force = true
  return body
}
