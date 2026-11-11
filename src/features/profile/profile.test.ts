import assert from 'node:assert/strict'
import { test } from 'node:test'
import { profileStats, type Entry, type WeekLite } from './profile.ts'

const week = (n: number, type = 'theme'): WeekLite => ({
  id: `w${n}`,
  type,
  code: `W${n}`,
  title: '',
  schedule: { opensAt: new Date(Date.UTC(2026, 0, 5 + 7 * (n - 1), 1)).toISOString() },
})
// w1 w2 (휴식) w3 w4(이번 주)
const weeks = [week(1), week(2, 'break'), week(3), week(4)]
const now = new Date(Date.parse(weeks[3].schedule.opensAt) + 3_600_000)
const entry = (weekId: string, rank: number | null = 7): Entry => ({ weekId, title: '', track: 'regular', votes: 10, rank })

test('휴식 주와 진행 중인 이번 주는 연속 기록을 끊지 않아요', () => {
  assert.equal(profileStats(weeks, [entry('w1'), entry('w3')], now).streak, 2)
  assert.equal(profileStats(weeks, [entry('w1'), entry('w3'), entry('w4', null)], now).streak, 3)
})

test('지난 주제를 빠뜨리면 연속 기록이 끊겨요', () => {
  assert.equal(profileStats(weeks, [entry('w1')], now).streak, 0)
})

test('격자는 항상 52칸이고 마지막 칸이 이번 주예요', () => {
  const { cells, top3, votes, recentCount } = profileStats(weeks, [entry('w1', 2), entry('w3')], now)
  assert.equal(cells.length, 52)
  assert.ok(cells[51].isNow)
  assert.equal(cells[48].kind, 2) // w1 · TOP 3
  assert.equal(cells[50].kind, 1) // w3 · 제출
  assert.deepEqual([top3, votes, recentCount], [1, 20, 2])
})
