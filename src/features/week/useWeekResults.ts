import { useQuery } from '@tanstack/react-query'
import { weeksApi } from '../../api/weeks.ts'
import { useNow } from '../../shared/hooks/useNow.ts'
import users from '../../../mocks/users.json'
import submissions from '../../../mocks/submissions.json'
import results from '../../../mocks/results.json'
import { weekStatus, type ResultEntry, type Track } from './results.ts'
import type { Week } from './thisWeek.ts'
import { fromSummary } from './useThisWeek.ts'

// 주차 정보와 참가자 수는 서버(GET /weeks/:weekId)에서 받아요.
// ponytail: 제출작은 아직 서버에 없어서 목 데이터 세 곳(이번 주 제출작 · 사용자 기록 · 나머지 상위권)을 합쳐요.
// 제출작 API가 생기면 GET /weeks/:weekId/submissions 하나로 바꾸고, 제출·투표 수도 서버 stats를 써요.
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

/** 주차 id("2026-w45")로 결과 화면에 필요한 걸 모아요. 불러오는 중이면 undefined, 없는 주면 null. */
export function useWeekResults(id: string) {
  const now = useNow(60_000)
  const { data, isPending } = useQuery({ queryKey: ['weeks', id], queryFn: () => weeksApi.get(id) })
  if (isPending) return undefined
  if (!data) return null

  const week: Week = {
    ...fromSummary(data.week),
    announcement: data.week.announcement ?? '',
    constraints: data.week.constraints ?? [],
    participantCount: data.stats.participants,
    // 서버는 아직 0을 줘요. 비워 두면 weekStats가 보이는 제출작으로 세요.
    submissionCount: undefined,
  }
  return { week, prev: data.prev, next: data.next, status: weekStatus(week, now), entries: byWeek.get(id) ?? [] }
}
