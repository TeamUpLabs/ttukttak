import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ApiError, request } from './client.ts'

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
