import type { FeedbackType } from '../../shared/ui/FeedbackType/types.ts'
import submissions from '../../../mocks/submissions.json'
import weekData from '../../../mocks/weeks.json'
import users from '../../../mocks/users.json'
import feedback from '../../../mocks/feedback.json'

// ponytail: 목 데이터 고정. Supabase 붙이면 이 파일을 api.ts 쿼리로 바꿔요.

export type Track = 'beginner' | 'regular' | 'expert'
export type Submission = (typeof submissions)[number]
export type SubmissionFeedback = {
  id: string
  handle: string
  type: FeedbackType
  body: string
  helpful: number
  replied: boolean
  createdAt: string
  mine?: boolean
}

export const TRACK_LABELS = weekData.labels.track as Record<Track, string>
export const allSubmissions = submissions

const weekById = new Map(weekData.weeks.map((w) => [w.id, w]))
const nameByHandle = new Map(users.map((u) => [u.handle, u.name]))

export const findSubmission = (id: string) => submissions.find((s) => s.id === id)
export const weekOf = (id: string) => weekById.get(id)
export const nameOf = (handle: string) => nameByHandle.get(handle.replace(/^@/, ''))
export const feedbackFor = (submissionId: string) =>
  feedback.filter((f) => f.submissionId === submissionId) as (SubmissionFeedback & { submissionId: string })[]

/** 참가자가 올린 링크는 https만 써요(javascript: 같은 주소 차단). */
export function safeHttps(url: string) {
  try {
    return new URL(url).protocol === 'https:' ? url : null
  } catch {
    return null
  }
}
