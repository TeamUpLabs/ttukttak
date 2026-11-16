import assert from 'node:assert/strict'
import { test } from 'node:test'
import { toCells } from './profile.ts'

test('격자는 항상 52칸이고 마지막 칸이 이번 주예요', () => {
  const cells = toCells([
    { weekId: '2026-w44', code: 'W44', state: 'top3' },
    { weekId: '2026-w45', code: 'W45', state: 'break' },
    { weekId: '2026-w46', code: 'W46', state: 'submitted' },
    { weekId: '2026-w47', code: 'W47', state: 'ongoing' },
  ])
  assert.equal(cells.length, 52)
  assert.deepEqual(cells.slice(48).map((c) => c.kind), [2, 0, 1, 0])
  assert.equal(cells[48].label, '2026 W44 · 제출 · 트랙 TOP 3')
  assert.ok(cells[51].isNow && !cells[50].isNow)
  assert.equal(cells[0].label, '기록 없음')
})

test('52주를 넘기면 최근 52주만 남겨요', () => {
  const weeks = Array.from({ length: 60 }, (_, i) => ({ weekId: `2026-w${i}`, code: `W${i}`, state: 'none' as const }))
  const cells = toCells(weeks)
  assert.equal(cells.length, 52)
  assert.equal(cells[0].label, '2026 W8 · 쉼')
})
