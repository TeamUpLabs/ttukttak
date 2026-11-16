import assert from 'node:assert/strict'
import { test } from 'node:test'
import { changes, fromKstInput, toKstInput, type Values } from './admin.ts'

const base: Values = {
  title: '서버 없이', announcement: '', intent: '', constraints: 'A\nB', rule: '', notes: '',
  difficulty: '', status: '', force: false,
  schedule: { opensAt: '2026-11-23T10:00', submissionClosesAt: '2026-11-26T10:00', votingClosesAt: '2026-11-30T00:00', resultsAt: '2026-11-30T10:00' },
}

test('한국 시간 칸과 서버 시각을 오가요', () => {
  assert.equal(toKstInput('2026-11-23T10:00:00+09:00'), '2026-11-23T10:00')
  assert.equal(toKstInput(null), '')
  assert.equal(fromKstInput('2026-11-23T10:00'), '2026-11-23T10:00:00+09:00')
  assert.equal(fromKstInput(''), null)
})

test('안 바꾼 칸은 보내지 않아요', () => {
  assert.deepEqual(changes(base, base), {})
})

test('바뀐 칸만, 일정은 네 칸을 같이 보내요', () => {
  const body = changes(base, { ...base, title: ' 새 제목 ', constraints: 'A\n\n C ', schedule: { ...base.schedule, resultsAt: '' }, force: true })
  assert.deepEqual(body, {
    title: '새 제목',
    constraints: ['A', 'C'],
    schedule: {
      opensAt: '2026-11-23T10:00:00+09:00',
      submissionClosesAt: '2026-11-26T10:00:00+09:00',
      votingClosesAt: '2026-11-30T00:00:00+09:00',
      resultsAt: null,
    },
    force: true,
  })
})
