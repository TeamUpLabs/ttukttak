import { FEEDBACK_TYPE_LABELS, type FeedbackType } from './types.ts'

// 색만이 아니라 명도로도 구분돼요: 버그 night, UX sky, 코드 sage, 칭찬 signal
const TONES: Record<FeedbackType, string> = {
  bug: 'bg-(--tt-night) text-(--tt-on-night)',
  ux: 'bg-(--tt-tint-sky) text-(--tt-ink)',
  code: 'bg-(--tt-tint-sage) text-(--tt-ink)',
  kudo: 'bg-(--tt-signal) text-(--tt-ink)',
}

/** 피드백 종류 라벨. 태그와 구분되게 각진 모서리예요. */
function FeedbackTypeLabel({ type }: { type: FeedbackType }) {
  return (
    <span className={`inline-flex items-center min-h-6.5 px-2.5 rounded-(--tt-radius-xs) text-xs font-bold ${TONES[type]}`}>
      {FEEDBACK_TYPE_LABELS[type]}
    </span>
  )
}

export default FeedbackTypeLabel
