import type { ApiErrorBody } from './types.ts'

// 서버가 로그인 뒤 "/submit" 같은 상대 경로로 돌려보내서 프론트와 같은 출처여야 해요.
// 개발은 vite.config.ts 프록시, 배포는 vercel.json rewrite로 /api를 서버에 넘겨요.
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

/** 화면에 띄울 오류 문구. 4xx는 서버가 준 문구, 네트워크·5xx는 다시 시도를 안내해요. */
export function errorMessage(e: unknown, fallback = '잠시 후 다시 시도해 주세요.') {
  return e instanceof ApiError && e.status >= 400 && e.status < 500 ? e.message : fallback
}

/** 서버가 그 칸에 단 검사 오류(422 fields) */
export const fieldError = (e: unknown, field: string) => (e instanceof ApiError ? e.fields[field] : undefined)

/** 로그아웃했거나 세션이 끝났을 때 */
export const isUnauthorized = (e: unknown) => e instanceof ApiError && e.status === 401

/** undefined는 빼고 쿼리 문자열로 만들어요. 비면 빈 문자열이에요. */
export function query(params: Record<string, string | number | undefined>) {
  const q = new URLSearchParams(Object.entries(params).flatMap(([k, v]) => (v === undefined ? [] : [[k, String(v)]])))
  return q.size ? `?${q}` : ''
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
