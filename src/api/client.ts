import type { ApiErrorBody } from './types.ts'

// 서버가 로그인 뒤 "/submit" 같은 상대 경로로 돌려보내서 프론트와 같은 출처여야 해요.
// 개발은 vite.config.ts 프록시, 배포는 리버스 프록시로 /api를 서버에 넘겨요.
export const API_BASE = '/api/v1'

export class ApiError extends Error {
  status: number
  code: string
  fields: Record<string, string>

  constructor(status: number, body: ApiErrorBody | null) {
    super(body?.error.message ?? '잠시 후 다시 시도해 주세요.')
    this.status = status
    this.code = body?.error.code ?? 'internal'
    this.fields = body?.error.fields ?? {}
  }
}

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      // 서버가 쓰기 요청을 이 헤더로만 받아요(CSRF 대신).
      'X-Requested-With': 'ddukddak',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  })
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null))
  return (res.status === 204 ? undefined : await res.json()) as T
}
