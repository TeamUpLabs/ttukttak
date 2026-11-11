import assert from 'node:assert/strict'
import { test } from 'node:test'
import { addStack, imageError, isDemoUrl, isRepoUrl, readiness, type SubmitValues } from './submitForm.ts'

const ready: SubmitValues = {
  track: 'regular',
  title: '오프라인 메모장',
  summary: '비행기 모드에서도 써지는 메모장이에요.',
  demoUrl: 'https://hyuk.github.io/offline-memo/',
  repoUrl: 'https://github.com/hyuk/offline-memo',
  thumbMode: 'key',
  image: null,
  tone: 'sky',
  caption: 'OFFLINE',
  stack: [],
  story: { what: '', how: '', retro: '' },
  okRule: true,
  okOpen: false,
}
const left = (v: SubmitValues) => readiness(v).filter((c) => !c.ok).map((c) => c.label)

test('다 채우면 7개 모두 준비돼요', () => {
  assert.deepEqual(left(ready), [])
})

test('빠진 항목만 남아요', () => {
  assert.deepEqual(left({ ...ready, title: ' ', summary: '짧아요', okRule: false }), ['제목', '한 줄 소개 10자+', '주제 제약 확인'])
  assert.deepEqual(left({ ...ready, thumbMode: 'image' }), ['썸네일'])
  assert.deepEqual(left({ ...ready, thumbMode: 'image', image: { type: 'image/png', size: 1000 } }), [])
})

test('데모는 https, 레포는 github.com/계정/저장소', () => {
  for (const u of ['http://a.dev', 'javascript:alert(1)', 'a.dev', 'https://localhost']) assert.equal(isDemoUrl(u), false, u)
  for (const u of ['http://github.com/a/b', 'https://gitlab.com/a/b', 'https://github.com/a', 'javascript:alert(1)']) assert.equal(isRepoUrl(u), false, u)
  assert.ok(isRepoUrl('https://github.com/hyuk/offline-memo'))
})

test('이미지는 형식과 5MB를 지켜요', () => {
  assert.ok(imageError({ type: 'application/pdf', size: 10 }))
  assert.ok(imageError({ type: 'image/png', size: 6 * 1024 * 1024 }))
  assert.equal(imageError({ type: 'image/webp', size: 10 }), null)
})

test('스택은 중복 없이 6개까지', () => {
  assert.deepEqual(addStack(['React'], ' react '), ['React'])
  assert.deepEqual(addStack(['React'], '  '), ['React'])
  assert.equal(addStack(['a', 'b', 'c', 'd', 'e', 'f'], 'g').length, 6)
  assert.deepEqual(addStack([], 'Svelte'), ['Svelte'])
})
