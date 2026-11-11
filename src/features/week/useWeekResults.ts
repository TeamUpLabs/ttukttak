import { useNow } from '../../shared/hooks/useNow.ts'
import users from '../../../mocks/users.json'
import submissions from '../../../mocks/submissions.json'
import results from '../../../mocks/results.json'
import { weekStatus, type ResultEntry, type Track } from './results.ts'
import { weeks } from './useThisWeek.ts'

// ponytail: 목 데이터 세 곳(이번 주 제출작 · 사용자 기록 · 나머지 상위권)을 합쳐요. Supabase 붙이면 주차별 제출작 쿼리 하나로.
const byWeek = new Map<string, ResultEntry[]>()
const add = (weekId: string, e: ResultEntry) => byWeek.set(weekId, [...(byWeek.get(weekId) ?? []), e])

for (const s of submissions) {
  add(s.weekId, {
    key: s.id, title: s.title, handle: s.handle.replace(/^@/, ''), track: s.track as Track, votes: s.voteCount,
    submittedAt: s.submittedAt, stack: s.stack, retro: s.story.find((p) => p.label === '회고')?.title ?? null,
    href: `/p/${s.id}`, hasProfile: true,
  })
}
for (const u of users) {
  for (const h of u.history) {
    if (byWeek.get(h.weekId)?.some((e) => e.handle === u.handle)) continue
    add(h.weekId, {
      key: `${u.handle}-${h.weekId}`, title: h.title, handle: u.handle, track: h.track as Track, votes: h.votes,
      submittedAt: h.submittedAt, stack: h.stack, retro: h.retro, href: null, hasProfile: true,
    })
  }
}
for (const r of results) {
  add(r.weekId, {
    key: `${r.handle}-${r.weekId}-${r.track}`, title: r.title, handle: r.handle, track: r.track as Track, votes: r.votes,
    submittedAt: r.submittedAt, stack: r.stack, retro: r.retro, href: null, hasProfile: false,
  })
}

/** 주차 id("2026-w45")로 결과 화면에 필요한 걸 모아요. 없는 주면 null. */
export function useWeekResults(id: string) {
  const now = useNow(60_000)
  const i = weeks.findIndex((w) => w.id === id)
  if (i < 0) return null
  const week = weeks[i]
  return { week, prev: weeks[i - 1], next: weeks[i + 1], now, status: weekStatus(week, now), entries: byWeek.get(id) ?? [] }
}
