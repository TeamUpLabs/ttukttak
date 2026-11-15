import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../../api/client.ts'
import { authApi, type MeResponse } from '../../api/auth.ts'

export type Session = MeResponse['user'] & Pick<MeResponse, 'role' | 'points' | 'currentWeek'>

// 로그인 여부는 세션 쿠키로 서버가 알아요. 401이면 로그아웃 상태로 봐요.
const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: async (): Promise<Session | null> => {
    try {
      const { user, ...rest } = await authApi.me()
      return { ...user, ...rest }
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) return null
      throw e
    }
  },
  retry: false,
})

/**
 * 지금 로그인한 사람. 로그아웃 상태면 null, 아직 확인 중이면 undefined.
 * 서버에 닿지 않을 때도 로그아웃 상태로 보여 줘요.
 */
export function useSession(): Session | null | undefined {
  const { data, isError } = useQuery(meQuery)
  return isError ? null : data
}

/** GitHub를 거쳐 next로 돌아와요. 페이지를 떠나요. */
export function signInWithGithub(next: string) {
  window.location.assign(authApi.githubLoginUrl(next))
}

export function useSignOut() {
  const queryClient = useQueryClient()
  return async () => {
    await authApi.logout()
    queryClient.setQueryData(meQuery.queryKey, null)
  }
}

/**
 * 로그인 뒤 돌아갈 곳. 우리 사이트 안의 경로만 허용해요(외부 주소로 튕기는 것 방지).
 * 문자열 모양만 보면 "/\t/evil.com"처럼 브라우저가 제어 문자를 지워 "//evil.com"으로 읽는 값이 새어요.
 * 그래서 실제 URL로 해석해서 출처가 같은지 확인해요.
 */
export function safeNext(next: string | null, origin = window.location.origin) {
  const hasControlOrBackslash = [...(next ?? '')].some((c) => c < ' ' || c === '\x7f' || c === '\\')
  if (!next || !next.startsWith('/') || hasControlOrBackslash) return '/'
  try {
    const url = new URL(next, origin)
    if (url.origin !== origin) return '/'
    // "/.//evil.com"은 정규화되면 "//evil.com"이 돼요. 돌려줄 값도 다시 확인해요.
    const path = url.pathname + url.search + url.hash
    return path.startsWith('//') ? '/' : path
  } catch {
    return '/'
  }
}
