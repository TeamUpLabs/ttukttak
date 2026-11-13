import { request } from './client.ts'

export type Track = 'beginner' | 'regular' | 'expert'
export type WeekType = 'theme' | 'break'
export type Difficulty = 'low' | 'medium' | 'high'
/** 서버가 지금 시각으로 계산한 단계 */
export type Phase = 'upcoming' | 'building' | 'voting' | 'tallying' | 'closed' | 'break'

/** 휴식 주는 마감 일정이 모두 null */
export type WeekSchedule = {
  opensAt: string
  submissionClosesAt: string | null
  votingClosesAt: string | null
  resultsAt: string | null
}

/** 공개 전 주차는 title이 null */
export type WeekSummary = {
  id: string
  code: string
  type: WeekType
  round: number | null
  title: string | null
  schedule: WeekSchedule
  phase: Phase
  submissionCount: number
}

/** GET /weeks/current. 진행 중인 주차가 없으면 week, stats가 null */
export type CurrentWeekResponse = {
  week: {
    id: string
    code: string
    type: WeekType
    round: number | null
    title: string
    announcement: string
    rule: string | null
    constraints: string[]
    difficulty: Difficulty | null
    examples: Record<Track, string> | null
    schedule: WeekSchedule
    phase: Phase
  } | null
  stats: { participants: number; submissions: number; presses: number } | null
  nextWeek: { id: string; opensAt: string } | null
  serverTime: string
}

/** GET /weeks. 다음 페이지가 없으면 nextCursor가 null */
export type WeekListResponse = { items: WeekSummary[]; nextCursor: string | null }

export type WeekNeighbor = { id: string; code: string; title: string | null; phase: Phase }

/** GET /weeks/:weekId. 공개 전 주차는 announcement, intent, constraints가 null */
export type WeekDetailResponse = {
  week: WeekSummary & { announcement: string | null; intent: string | null; constraints: string[] | null }
  stats: { submissions: number; participants: number; votes: number; completionRate: number }
  /** 제출작 도메인이 생기면 채워져요 */
  podium: unknown
  prev: WeekNeighbor | null
  next: WeekNeighbor | null
}

export const weeksApi = {
  current: () => request<CurrentWeekResponse>('/weeks/current'),
  /** 결과가 나온 주제 주, 최신순 */
  archive: ({ limit = 12, cursor }: { limit?: number; cursor?: string } = {}) =>
    request<WeekListResponse>(`/weeks?${new URLSearchParams({ limit: String(limit), ...(cursor ? { cursor } : {}) })}`),
  /** 없는 주차면 404 ApiError */
  get: (weekId: string) => request<WeekDetailResponse>(`/weeks/${encodeURIComponent(weekId)}`),
  /** 1초 동안 모은 횟수(1–20)를 한 번에 보내요 */
  press: (count: number) =>
    request<{ presses: number }>('/weeks/current/presses', { method: 'POST', body: JSON.stringify({ count }) }),
  /** 제작 기간에만 돼요. 아니면 409 break_week / submission_closed */
  join: () => request<{ joined: boolean; participants: number }>('/weeks/current/participation', { method: 'POST' }),
  leave: () => request<{ joined: boolean; participants: number }>('/weeks/current/participation', { method: 'DELETE' }),
}
