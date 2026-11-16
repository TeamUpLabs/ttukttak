import { query, request } from './client.ts'
import type { ThemeSuggestion } from './themeSuggestions.ts'
import type { Difficulty, Track, WeekDetailResponse, WeekSchedule } from './weeks.ts'

// 모두 role: admin만 돼요. 아니면 403 forbidden.

/** 운영자가 관리하는 준비 상태. 지금 단계(phase)와 달라도 괜찮아요 */
export type WeekStatus = 'draft' | 'announced' | 'building' | 'voting' | 'closed' | 'break'

/** 보낸 필드만 바뀌어요. schedule은 네 칸을 통째로. 공개된 주차의 일정을 바꾸려면 force: true */
export type UpdateWeekBody = Partial<{
  title: string
  announcement: string
  intent: string
  rule: string
  constraints: string[]
  difficulty: Difficulty
  status: WeekStatus
  examples: Record<Track, string>
  schedule: WeekSchedule
  notes: string
  force: boolean
}>

export type ThemeSuggestionListResponse = { items: ThemeSuggestion[]; nextCursor: string | null }

const enc = encodeURIComponent

export const adminApi = {
  /** weeks.json 형식 그대로. id가 같으면 덮어쓰고, 하나라도 틀리면 모두 취소돼요 (409 회차 겹침, 422) */
  importWeeks: (json: { weeks: unknown[] }) =>
    request<void>('/admin/weeks/import', { method: 'POST', body: JSON.stringify(json) }),
  /** force 없이 공개된 주차의 일정을 바꾸면 409 conflict */
  updateWeek: (weekId: string, body: UpdateWeekBody) =>
    request<WeekDetailResponse>(`/admin/weeks/${enc(weekId)}`, { method: 'PATCH', body: JSON.stringify(body) }),
  /** 상태를 announced로 바꾸고 공개 시각에 구독자에게 주제 공개 메일을 보내요. 휴식 주면 409 break_week */
  announceWeek: (weekId: string) => request<void>(`/admin/weeks/${enc(weekId)}/announce`, { method: 'POST' }),
  /** 규칙 위반 제출작 숨김. 이유(300자까지)는 작성자에게 메일로 가요 */
  hideSubmission: (id: string, reason: string) =>
    request<void>(`/admin/submissions/${enc(id)}`, { method: 'DELETE', body: JSON.stringify({ reason }) }),
  hideFeedback: (id: string) => request<void>(`/admin/feedback/${enc(id)}`, { method: 'DELETE' }),
  /** 최신순, limit 기본 20 */
  suggestions: (cursor?: string) =>
    request<ThemeSuggestionListResponse>(`/admin/theme-suggestions${query({ cursor })}`),
}
