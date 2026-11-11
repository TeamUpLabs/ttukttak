import { useSyncExternalStore } from 'react'

export type Session = { handle: string }

const KEY = 'tt-session'
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener('storage', listener) // 다른 탭에서 로그인·로그아웃해도 맞춰요
  return () => {
    listeners.delete(listener)
    window.removeEventListener('storage', listener)
  }
}

function snapshot() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

function write(value: string | null) {
  try {
    if (value === null) localStorage.removeItem(KEY)
    else localStorage.setItem(KEY, value)
  } catch {
    // 저장이 막힌 브라우저에선 로그인이 유지되지 않아요
  }
  listeners.forEach((listener) => listener())
}

/** 지금 로그인한 사람. 없으면 null. */
export function useSession(): Session | null {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Session
  } catch {
    return null
  }
}

// ponytail: 목 로그인. Supabase 붙이면 supabase.auth.signInWithOAuth({ provider: 'github' })로 바꿔요.
export async function signInWithGithub(): Promise<void> {
  write(JSON.stringify({ handle: '@guest' } satisfies Session))
}

export function signOut() {
  write(null)
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
    return url.pathname + url.search + url.hash
  } catch {
    return '/'
  }
}
