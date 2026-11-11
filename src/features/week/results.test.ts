import assert from 'node:assert/strict'
import { test } from 'node:test'
import data from '../../../mocks/weeks.json' with { type: 'json' }
import type { Week } from './thisWeek.ts'
import { podiumOf, weekStats, weekStatus, type ResultEntry } from './results.ts'

const weeks = data.weeks as Week[]
const w46 = weeks.find((w) => w.id === '2026-w46')!
const at = (iso: string) => weekStatus(w46, new Date(iso))

test('일정에 따라 주차 상태가 바뀌어요', () => {
  assert.equal(at('2026-11-08T12:00:00+09:00'), 'upcoming')
  assert.equal(at('2026-11-10T12:00:00+09:00'), 'building')
  assert.equal(at('2026-11-14T12:00:00+09:00'), 'voting')
  assert.equal(at('2026-11-16T05:00:00+09:00'), 'waiting')
  assert.equal(at('2026-11-16T10:00:00+09:00'), 'final')
})

const entry = (key: string, track: ResultEntry['track'], votes: number): ResultEntry => ({
  key, title: key, handle: key, track, votes, submittedAt: '', stack: [], retro: null, href: null, hasProfile: false,
})

test('시상대는 트랙 안에서 득표순 3개예요', () => {
  const entries = [entry('a', 'expert', 10), entry('b', 'expert', 30), entry('c', 'beginner', 99), entry('d', 'expert', 20), entry('e', 'expert', 5)]
  assert.deepEqual(podiumOf(entries, 'expert').map((e) => e.key), ['b', 'd', 'a'])
})

test('완주율은 제출 ÷ 참가, 집계값이 없으면 보이는 제출작으로 세요', () => {
  assert.deepEqual(weekStats({ ...w46, submissionCount: 31, participantCount: 44, voteCount: 1000 }, []), {
    submissions: 31, participants: 44, votes: 1000, completion: 70,
  })
  const live = weekStats({ ...w46, submissionCount: undefined, participantCount: undefined, voteCount: undefined }, [entry('a', 'expert', 3), entry('b', 'expert', 4)])
  assert.deepEqual(live, { submissions: 2, participants: 2, votes: 7, completion: 100 })
})
