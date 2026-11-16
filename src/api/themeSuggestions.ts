import { request } from './client.ts'
import type { UserSummary } from './types.ts'

/** 탈퇴한 사람의 제안은 author가 null */
export type ThemeSuggestion = {
  id: string
  title: string
  constraint: string
  why: string
  author: UserSummary | null
  createdAt: string
}

export const themeSuggestionsApi = {
  /** 로그인 필요. title 30자, constraint 80자, why 300자까지 */
  suggest: (body: { title: string; constraint: string; why: string }) =>
    request<ThemeSuggestion>('/theme-suggestions', { method: 'POST', body: JSON.stringify(body) }),
}
