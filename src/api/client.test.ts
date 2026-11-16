import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError, errorMessage, query, request } from './client.ts'

const respond = (status: number, body?: unknown) => {
  globalThis.fetch = async () => new Response(body === undefined ? null : JSON.stringify(body), { status })
}

test('서버 오류 형식을 ApiError로 바꿔요', async () => {
  respond(422, { error: { code: 'validation_failed', message: '다시 확인해 주세요.', fields: { name: '이름을 입력해 주세요.' } } })
  await assert.rejects(request('/me'), (e) => {
    assert.ok(e instanceof ApiError)
    assert.equal(e.status, 422)
    assert.equal(e.code, 'validation_failed')
    assert.equal(e.fields.name, '이름을 입력해 주세요.')
    return true
  })
})

test('본문이 JSON이 아니어도 상태 코드는 남아요', async () => {
  respond(502)
  await assert.rejects(request('/me'), (e) => e instanceof ApiError && e.status === 502 && e.code === 'internal')
})

test('204는 undefined, 200은 JSON', async () => {
  respond(204)
  assert.equal(await request('/auth/logout', { method: 'POST' }), undefined)
  respond(200, { points: 3 })
  assert.deepEqual(await request('/me'), { points: 3 })
})

test('쿼리 문자열은 undefined를 빼요', () => {
  assert.equal(query({ limit: 12, cursor: undefined, sort: 'votes' }), '?limit=12&sort=votes')
  assert.equal(query({ cursor: undefined }), '')
})

test('4xx만 서버 문구를 보여줘요', () => {
  assert.equal(errorMessage(new ApiError(409, { error: { code: 'voting_closed', message: '투표 기간이 아니에요.' } })), '투표 기간이 아니에요.')
  assert.equal(errorMessage(new ApiError(502, null)), '잠시 후 다시 시도해 주세요.')
  assert.equal(errorMessage(new ApiError(0, null)), '잠시 후 다시 시도해 주세요.')
  assert.equal(errorMessage(new TypeError('Failed to fetch'), '다시 눌러 주세요'), '다시 눌러 주세요')
})
