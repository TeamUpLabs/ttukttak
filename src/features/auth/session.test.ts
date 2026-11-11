import assert from 'node:assert/strict'
import { test } from 'node:test'
import { safeNext } from './session.ts'

const ORIGIN = 'https://ttukttak.dev'

test('사이트 안 경로는 그대로 돌려줘요', () => {
  assert.equal(safeNext('/submit', ORIGIN), '/submit')
  assert.equal(safeNext('/p/s-101?tab=feedback#top', ORIGIN), '/p/s-101?tab=feedback#top')
})

test('외부로 나가는 값은 모두 홈으로 바꿔요', () => {
  for (const next of [null, '', 'https://evil.com', '//evil.com', '/\\evil.com', '/\t/evil.com', '/\n/evil.com', 'javascript:alert(1)']) {
    assert.equal(safeNext(next, ORIGIN), '/', String(next))
  }
})
