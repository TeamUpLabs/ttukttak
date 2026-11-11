import type { ReactNode } from 'react'

type MarqueeProps = {
  children: ReactNode
  /** 화면 낭독기용 이름. "최근 제출 소식" */
  label: string
}

/** 주황 띠 위로 내용이 끝없이 흘러가요. hover하면 멈춰요. */
function Marquee({ children, label }: MarqueeProps) {
  return (
    <section
      aria-label={label}
      className="group overflow-hidden border-y-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-signal) text-(--tt-on-signal)"
    >
      {/* 같은 내용을 두 번 이어 붙이고 -50%까지 밀어서 이음새 없이 반복해요 */}
      <div className="flex w-max animate-[tt-slide_48s_linear_infinite] group-hover:[animation-play-state:paused]">
        <div className="flex">{children}</div>
        <div className="flex" aria-hidden="true">{children}</div>
      </div>
    </section>
  )
}

export default Marquee
