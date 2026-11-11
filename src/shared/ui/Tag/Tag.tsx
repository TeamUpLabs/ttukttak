import type { ReactNode } from 'react'

type TagProps = {
  children: ReactNode
  tone?: 'ground' | 'night'
}

const TONE_CLASSES: Record<NonNullable<TagProps['tone']>, string> = {
  ground: 'border-(--tt-ink) text-(--tt-ink)',
  night: 'border-(--tt-night-line) text-(--tt-on-night)',
}

/** 제약 조건, 스택처럼 덧붙이는 정보. 누를 수 없어요. */
function Tag({ children, tone = 'ground' }: TagProps) {
  return (
    <span className={`inline-flex items-center min-h-8 px-3.5 rounded-full border text-[13px] ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  )
}

export default Tag
