import { API_BASE, request } from './client.ts'
import type { UserSummary } from './types.ts'

/** GET /me */
export type MeResponse = {
  user: UserSummary
  role: 'member' | 'admin'
  /** 진행 중인 주차가 없으면 null. submissionId가 있으면 제출하기를 수정 모드로 열어요. */
  currentWeek: { weekId: string; joined: boolean; submissionId: string | null; streak: number } | null
  points: number
}

export const authApi = {
  /** 로그인 안 했으면 401 ApiError */
  me: () => request<MeResponse>('/me'),
  logout: () => request<void>('/auth/logout', { method: 'POST' }),
  /** 페이지 이동용 주소. GitHub를 거쳐 next로 돌아와요. */
  githubLoginUrl: (next: string) => `${API_BASE}/auth/github?next=${encodeURIComponent(next)}`,
}
