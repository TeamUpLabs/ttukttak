import type { FeedbackType } from '../../shared/ui/FeedbackType/types.ts'
import weekData from '../../../mocks/weeks.json'
import feedback from '../../../mocks/feedback.json'

// ponytail: 피드백은 아직 서버에 없어서 목 데이터예요. 피드백 API가 생기면 api/로 옮겨요.

export type Track = 'beginner' | 'regular' | 'expert'
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
