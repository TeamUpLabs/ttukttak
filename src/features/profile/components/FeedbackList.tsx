import { timeAgo } from '../../../shared/lib/time.ts'
import type { Feedback, FeedbackType } from '../profile.ts'

// 색만이 아니라 명도로도 구분돼요: 버그 night, UX sky, 코드 sage, 칭찬 signal
const TYPES: Record<FeedbackType, { label: string; className: string }> = {
  bug: { label: '버그', className: 'bg-(--tt-night) text-(--tt-on-night)' },
  ux: { label: 'UX', className: 'bg-(--tt-tint-sky)' },
  code: { label: '코드', className: 'bg-(--tt-tint-sage)' },
  kudo: { label: '칭찬', className: 'bg-(--tt-signal)' },
}

/** 남긴 피드백 목록. 굵은 선으로 나눈 행. */
function FeedbackList({ feedbacks, now }: { feedbacks: Feedback[]; now: Date }) {
  if (feedbacks.length === 0) {
    return <p className="m-0 py-16 text-center text-(--tt-muted)">아직 남긴 피드백이 없어요.</p>
  }

  return (
    <ul className="m-0 p-0 list-none border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
      {feedbacks.map((f) => (
        <li
          key={f.id}
          className="grid grid-cols-[120px_minmax(0,1fr)_auto] max-sm:grid-cols-1 gap-6 max-sm:gap-3 items-start py-6.5 border-b-(length:--tt-stroke-bold) border-(--tt-ink)"
        >
          <span className="flex flex-col items-start gap-2 max-sm:flex-row max-sm:items-center">
            <span className={`inline-flex items-center min-h-6.5 px-2.5 rounded-(--tt-radius-xs) text-xs font-bold ${TYPES[f.type].className}`}>
              {TYPES[f.type].label}
            </span>
            <span className="mono text-xs text-(--tt-muted)">{timeAgo(Date.parse(f.createdAt), now)}</span>
          </span>
          <span className="flex flex-col gap-2">
            <a href={`/p/${f.targetId}`} className="text-lg font-bold tracking-[-0.03em] no-underline">
              {f.targetTitle} · @{f.targetHandle}
            </a>
            <span className="leading-[1.7] text-(--tt-ink-soft)">{f.body}</span>
          </span>
          <span className="mono text-[13px] whitespace-nowrap">도움돼요 {f.helpful}</span>
        </li>
      ))}
    </ul>
  )
}

export default FeedbackList
