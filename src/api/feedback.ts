import { query, request } from './client.ts'
import type { UserSummary } from './types.ts'

export type FeedbackType = 'bug' | 'ux' | 'code' | 'kudo'
export type FeedbackSort = 'helpful' | 'recent'

/** 답글이 없으면 reply가, 비로그인이면 viewer가 null */
export type FeedbackItem = {
  id: string
  type: FeedbackType
  body: string
  author: UserSummary
  createdAt: string
  helpfulCount: number
  reply: { body: string; createdAt: string } | null
  viewer: { helpful: boolean; isAuthor: boolean } | null
}

/** counts로 필터 탭의 숫자를 그려요 */
export type FeedbackListResponse = {
  items: FeedbackItem[]
  counts: Record<FeedbackType | 'all', number>
  nextCursor: string | null
}

/** pointsEarned: 이번 피드백으로 쌓인 포인트, points: 쌓인 합계 */
export type CreateFeedbackResponse = { feedback: FeedbackItem; pointsEarned: number; points: number }
export type FeedbackResponse = { feedback: FeedbackItem }
export type HelpfulResponse = { helpful: boolean; helpfulCount: number }

export type FeedbackListParams = { type?: FeedbackType; sort?: FeedbackSort; cursor?: string; limit?: number }

const at = (id: string) => `/feedback/${encodeURIComponent(id)}`

export const feedbackApi = {
  /** sort 기본 helpful, limit 기본 20, 최대 50 */
  list: (submissionId: string, params: FeedbackListParams = {}) =>
    request<FeedbackListResponse>(`/submissions/${encodeURIComponent(submissionId)}/feedback${query(params)}`),
  /** body 10–500자. 내 제출작이면 403 own_submission */
  create: (submissionId: string, body: { type: FeedbackType; body: string }) =>
    request<CreateFeedbackResponse>(`/submissions/${encodeURIComponent(submissionId)}/feedback`, { method: 'POST', body: JSON.stringify(body) }),
  /** 본인만, 작성 후 24시간 안에만 */
  edit: (id: string, body: { type?: FeedbackType; body?: string }) =>
    request<FeedbackResponse>(at(id), { method: 'PATCH', body: JSON.stringify(body) }),
  /** 본인만, 받은 포인트도 사라져요 */
  remove: (id: string) => request<void>(at(id), { method: 'DELETE' }),
  /** 내 피드백에는 못 눌러요 */
  markHelpful: (id: string) => request<HelpfulResponse>(`${at(id)}/helpful`, { method: 'PUT' }),
  unmarkHelpful: (id: string) => request<HelpfulResponse>(`${at(id)}/helpful`, { method: 'DELETE' }),
  /** 제출작을 만든 사람만. 하나만 있어서 덮어써요. 300자까지 */
  reply: (id: string, body: string) =>
    request<FeedbackResponse>(`${at(id)}/reply`, { method: 'PUT', body: JSON.stringify({ body }) }),
  deleteReply: (id: string) => request<FeedbackResponse>(`${at(id)}/reply`, { method: 'DELETE' }),
}
