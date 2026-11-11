export type FeedbackType = 'bug' | 'ux' | 'code' | 'kudo'

export const FEEDBACK_TYPE_LABELS: Record<FeedbackType, string> = {
  bug: '버그',
  ux: 'UX',
  code: '코드',
  kudo: '칭찬',
}
