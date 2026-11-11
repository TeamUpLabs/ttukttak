import assert from 'node:assert/strict'
import { test } from 'node:test'
import data from '../../../mocks/weeks.json' with { type: 'json' }
import { getPastWeeks, getThisWeek, type Week } from './thisWeek.ts'

const weeks = data.weeks as Week[]
const at = (iso: string) => getThisWeek(weeks, new Date(iso))

test('데이터 시작 전엔 첫 주제 공개까지 세요', () => {
  const r = at('2025-12-20T00:00:00+09:00')
  assert.equal(r.week, undefined)
  assert.equal(r.next?.id, '2026-w02')
  assert.equal(r.phase, '다음 주제 공개까지')
})

test('결과 발표가 휴식 주로 미뤄져도 다음 주제 공개까지 세요', () => {
  // W7 결과는 설 연휴 때문에 2/19(목). 2/16부터는 W8 휴식 주예요.
  const r = at('2026-02-17T12:00:00+09:00')
  assert.equal(r.week?.id, '2026-w08')
  assert.equal(r.next?.id, '2026-w09')
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

test('데이터가 끝나면 phase가 없어요', () => {
  const r = at('2027-03-01T00:00:00+09:00')
  assert.equal(r.week?.id, '2027-w07')
  assert.equal(r.phase, undefined)
})

test('지난 주제는 결과가 나온 주만, 최근 순으로 모여요', () => {
  const before = getPastWeeks(weeks, new Date('2026-11-12T03:00:00+09:00'))
  assert.equal(before[0].id, '2026-w45')
  assert.ok(before.every((w) => w.type === 'theme'))
  assert.ok(before.every((w, i) => i === 0 || w.schedule.opensAt < before[i - 1].schedule.opensAt))

  const after = getPastWeeks(weeks, new Date('2026-11-16T10:00:00+09:00'))
  assert.equal(after[0].code, 'W46')
})
