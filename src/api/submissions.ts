import { request } from './client.ts'
import type { UserSummary } from './types.ts'
import type { Track, WeekSummary } from './weeks.ts'

export type KeycapTint = 'sage' | 'sky' | 'sand' | 'butter' | 'night' | 'signal'
export type SubmissionSort = 'votes' | 'recent' | 'random'

/** 목록 카드. 비로그인이면 viewer가 null, 투표 전이면 rank가 모두 null */
export type SubmissionCard = {
  id: string
  weekId: string
  author: UserSummary
  track: Track
  title: string
  summary: string
  thumbnail: { kind: 'keycap'; tint: KeycapTint; caption: string }
  stack: string[]
  voteCount: number
  rank: { track: number | null; overall: number | null }
  submittedAt: string
  viewer: { voted: boolean; isAuthor: boolean } | null
}

/** 빈 칸은 null */
export type Story = { what: string | null; how: string | null; retro: string | null }

export type SubmissionDetail = SubmissionCard & {
  demoUrl: string
  repoUrl: string
  story: Story | null
  demoWithoutLogin: boolean
  updatedAt: string
  /** 주제 공개부터 제출까지 걸린 시간 */
  workHours: number
  feedbackCount: number
}

/** GET /submissions/:id. 아직 확인 안 한 checks는 null */
export type SubmissionDetailResponse = {
  submission: SubmissionDetail
  week: WeekSummary
  author: UserSummary & { streak: number }
  checks: { onTime: boolean; demoReachable: boolean | null; hasReadme: boolean | null; confirmsRule: boolean }
}

export type SubmissionListResponse = { items: SubmissionCard[]; nextCursor: string | null; total: number }

export type SubmitBody = {
  track: Track
  title: string
  summary: string
  demoUrl: string
  repoUrl: string
  thumbnail: { kind: 'keycap'; tint: KeycapTint; caption: string }
  stack: string[]
  story: { what: string; how: string; retro: string }
  confirmsRule: boolean
  demoWithoutLogin: boolean
}

export type SubmitResponse = {
  submission: SubmissionDetail
  streak: { current: number; best: number; isNewBest: boolean }
}

export type ListParams = { track?: Track; sort?: SubmissionSort; exclude?: string; cursor?: string; limit?: number }

export const submissionsApi = {
  /** sort가 없으면 제작 기간엔 random, 이후엔 votes. limit 기본 12, 최대 50 */
  list: (weekId: string, params: ListParams = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    return request<SubmissionListResponse>(`/weeks/${encodeURIComponent(weekId)}/submissions?${query}`)
  },
  get: (id: string) => request<SubmissionDetailResponse>(`/submissions/${encodeURIComponent(id)}`),
  /** 제작 기간에만, 한 주 한 번. 이미 냈으면 409 already_submitted, 검사에 걸리면 422 validation_failed */
  submit: (weekId: string, body: SubmitBody) =>
    request<SubmitResponse>(`/weeks/${encodeURIComponent(weekId)}/submissions`, { method: 'POST', body: JSON.stringify(body) }),
  /** 본인만, 제출 마감 전까지만 */
  update: (id: string, body: Partial<SubmitBody>) =>
    request<SubmissionDetailResponse>(`/submissions/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  withdraw: (id: string) => request<void>(`/submissions/${encodeURIComponent(id)}`, { method: 'DELETE' }),
}
