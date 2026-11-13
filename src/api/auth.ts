import { API_BASE, request } from './client.ts'
import type { UserSummary } from './types.ts'

/** GET /me */
export type MeResponse = {
  user: UserSummary
  role: 'member' | 'admin'
  /** 주차 도메인이 생기면 채워져요 */
  currentWeek: unknown
  points: number
}

export const authApi = {
  /** 로그인 안 했으면 401 ApiError */
  me: () => request<MeResponse>('/me'),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  /** 페이지 이동용 주소. GitHub를 거쳐 next로 돌아와요. */
  githubLoginUrl: (next: string) => `${API_BASE}/auth/github?next=${encodeURIComponent(next)}`,
}
