import assert from 'node:assert/strict'
import { test } from 'node:test'
import season from '../../../mocks/season-2.json' with { type: 'json' }
import { getThisWeek, type Week } from './thisWeek.ts'

const weeks = season.weeks as Week[]
const at = (iso: string) => getThisWeek(weeks, new Date(iso))

test('시즌 시작 전엔 첫 주 공개까지 세요', () => {
  const r = at('2026-11-08T00:00:00+09:00')
  assert.equal(r.week, undefined)
  assert.equal(r.next?.code, 'W46')
  assert.equal(r.phase, '다음 주제 공개까지')
})

test('공개 순간부터 제작 → 투표 → 발표 대기 순서로 넘어가요', () => {
  assert.equal(at('2026-11-09T10:00:00+09:00').phase, '제출 마감까지')
  assert.equal(at('2026-11-12T10:00:00+09:00').phase, '투표 마감까지')
  assert.equal(at('2026-11-16T05:00:00+09:00').phase, '결과 발표까지')
  assert.equal(at('2026-11-16T10:00:00+09:00').week?.code, 'W47')
})

test('휴식 주가 이어져도 다음 주제 공개까지 세요', () => {
  for (const iso of ['2026-12-23T12:00:00+09:00', '2026-12-30T12:00:00+09:00']) {
    const r = at(iso)
    assert.equal(r.week?.type, 'break')
    assert.equal(r.phase, '다음 주제 공개까지')
    assert.equal(r.deadline?.toISOString(), '2027-01-04T01:00:00.000Z')
  }
})

test('시즌이 끝나면 phase가 없어요', () => {
  const r = at('2027-03-01T00:00:00+09:00')
  assert.equal(r.week?.code, 'W7')
  assert.equal(r.phase, undefined)
})
