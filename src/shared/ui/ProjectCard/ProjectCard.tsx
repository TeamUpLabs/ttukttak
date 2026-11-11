import type { ReactNode } from 'react'

export type ThumbTone = 'sage' | 'sky' | 'sand' | 'butter' | 'night' | 'signal'

type ProjectCardProps = {
  /** 없으면 링크 없는 카드(제출 미리보기 등) */
  href?: string
  title: string
  summary: string
  handle: string
  handleHref?: string
  trackLabel: string
  /** 썸네일 오른쪽 위 순위 */
  rank?: number
  /** 썸네일 왼쪽 위 표시. "고수 1위". gold면 주황 */
  medal?: { label: string; gold?: boolean }
  /** image가 있으면 스크린샷, 없으면 색 바탕 + 키캡 + 캡션 */
  thumb: { tone: ThumbTone; caption: string; image?: string }
  /** 제목·소개가 아직 비어 있을 때 흐리게 */
  placeholder?: { title?: boolean; summary?: boolean }
  /** 카드 아래쪽 자리. 페이지가 VoteButton 등을 꽂아줘요. */
  vote?: ReactNode
}

const TONES: Record<ThumbTone, { bg: string; key: string; text: string }> = {
  sage: { bg: 'bg-(--tt-tint-sage)', key: 'bg-(--tt-ground)', text: 'text-(--tt-ink)' },
  sky: { bg: 'bg-(--tt-tint-sky)', key: 'bg-(--tt-signal)', text: 'text-(--tt-ink)' },
  sand: { bg: 'bg-(--tt-tint-sand)', key: 'bg-(--tt-ink)', text: 'text-(--tt-ink)' },
  butter: { bg: 'bg-(--tt-tint-butter)', key: 'bg-(--tt-ground)', text: 'text-(--tt-ink)' },
  night: { bg: 'bg-(--tt-night)', key: 'bg-(--tt-signal)', text: 'text-(--tt-on-night)' },
  signal: { bg: 'bg-(--tt-signal)', key: 'bg-(--tt-ink)', text: 'text-(--tt-ink)' },
}

/** 제출작 하나. 위엔 키캡 썸네일, 아래엔 작성자·제목·소개·투표. */
function ProjectCard({ href, title, summary, handle, handleHref, trackLabel, rank, medal, thumb, placeholder, vote }: ProjectCardProps) {
  const tone = TONES[thumb.tone]

  return (
    <article className="group flex flex-col bg-(--tt-surface) border-(length:--tt-stroke-bold) border-(--tt-ink) rounded-(--tt-radius-lg) overflow-hidden transition-[translate,rotate,box-shadow] duration-(--tt-dur-lift) ease-(--tt-ease-lift) hover:-translate-y-2 hover:-rotate-[.4deg] hover:shadow-(--tt-shadow-lift)">
      <div className={`relative h-55 flex items-center justify-center border-b-(length:--tt-stroke-bold) border-(--tt-ink) overflow-hidden transition-colors duration-(--tt-dur-lift) ${thumb.image ? 'bg-(--tt-night)' : tone.bg}`}>
        {thumb.image ? (
          <img src={thumb.image} alt="" className="size-full object-cover animate-[tt-fade-up_.5s_var(--tt-ease-snap)_both]" />
        ) : (
          <>
            <span
              aria-hidden="true"
              className={`size-22 rounded-full border-(length:--tt-stroke-bold) border-(--tt-ink) shadow-(--tt-shadow-key) transition-[translate,box-shadow,background-color] duration-(--tt-dur-quick) ease-(--tt-ease-lift) group-hover:translate-y-2 group-hover:shadow-none ${tone.key}`}
            />
            <span className={`mono absolute left-4.5 bottom-4 text-xs uppercase transition-[letter-spacing,color] duration-(--tt-dur-lift) group-hover:tracking-[.18em] ${tone.text}`}>
              {thumb.caption}
            </span>
          </>
        )}
        {medal && (
          <span
            className={`mono absolute left-4 top-3.5 text-xs px-2.5 py-1.25 rounded-(--tt-radius-xs) border-(length:--tt-stroke-bold) border-(--tt-ink) ${
              medal.gold ? 'bg-(--tt-signal) text-(--tt-ink)' : 'bg-(--tt-ink) text-(--tt-ground)'
            }`}
          >
            {medal.label}
          </span>
        )}
        {rank !== undefined && (
          <span className={`mono absolute right-4.5 top-4 text-xs ${tone.text}`}>#{String(rank).padStart(2, '0')}</span>
        )}
      </div>

      <div className="flex flex-col flex-1 gap-3 px-5.5 pt-5.5 pb-5">
        <div className="flex justify-between items-center gap-3">
          {handleHref ? (
            <a href={handleHref} className="mono text-[13px] text-(--tt-muted) no-underline hover:underline">{handle}</a>
          ) : (
            <span className="mono text-[13px] text-(--tt-muted)">{handle}</span>
          )}
          <span className="text-xs px-2.5 py-1 rounded-full bg-(--tt-fill-quiet)">{trackLabel}</span>
        </div>
        <h3 className={`m-0 text-[23px] tracking-[-0.035em] font-bold break-words ${placeholder?.title ? 'text-(--tt-muted)' : ''}`}>
          {href ? <a href={href} className="text-(--tt-ink) no-underline">{title}</a> : title}
        </h3>
        <p className={`m-0 flex-1 text-[15px] leading-[1.65] break-words ${placeholder?.summary ? 'text-(--tt-muted)' : 'text-(--tt-ink-soft)'}`}>{summary}</p>
        {(href || vote) && (
          <div className="flex justify-between items-center gap-3 pt-1.5">
            {href ? <a href={href} className="text-sm font-medium">자세히 보기 →</a> : <span />}
            {vote}
          </div>
        )}
      </div>
    </article>
  )
}

export default ProjectCard
