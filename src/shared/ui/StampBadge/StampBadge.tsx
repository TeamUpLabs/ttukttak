import { useId } from 'react'

export type StampTone = 'signal' | 'night' | 'sage' | 'sky'

type StampBadgeProps = {
  /** 가운데 큰 값. "7" */
  big: string | number
  /** 큰 값 아래 mono 단위. "WEEKS" */
  unit: string
  /** 테두리를 도는 문구 */
  ring: string
  name: string
  desc: string
  tone: StampTone
}

const TONES: Record<StampTone, { bg: string; fg: string; core: string }> = {
  signal: { bg: 'fill-(--tt-signal)', fg: 'fill-(--tt-ink)', core: 'bg-(--tt-ground) text-(--tt-ink)' },
  night: { bg: 'fill-(--tt-night)', fg: 'fill-(--tt-on-night)', core: 'bg-(--tt-signal) text-(--tt-ink)' },
  sage: { bg: 'fill-(--tt-tint-sage)', fg: 'fill-(--tt-ink)', core: 'bg-(--tt-night) text-(--tt-on-night)' },
  sky: { bg: 'fill-(--tt-tint-sky)', fg: 'fill-(--tt-ink)', core: 'bg-(--tt-ground) text-(--tt-ink)' },
}

/** 테두리 글자가 천천히 도는 도장 배지. hover하면 빨라지고 가운데가 기울어요. */
function StampBadge({ big, unit, ring, name, desc, tone }: StampBadgeProps) {
  const pathId = `stamp-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const t = TONES[tone]

  return (
    <div className="group flex flex-col items-center gap-4 text-center">
      <div className="relative size-45 max-sm:size-35">
        <svg viewBox="0 0 180 180" aria-hidden="true" className="absolute inset-0 size-full">
          <circle cx="90" cy="90" r="88" strokeWidth="1.5" className={`stroke-(--tt-ink) ${t.bg}`} />
          <g className="origin-[90px_90px] animate-[tt-spin_22s_linear_infinite] group-hover:[animation-duration:6s]">
            <path id={pathId} d="M90,90 m-66,0 a66,66 0 1,1 132,0 a66,66 0 1,1 -132,0" fill="none" />
            <text className={`mono text-[11px] tracking-[2px] ${t.fg}`}>
              <textPath href={`#${pathId}`} textLength="410" lengthAdjust="spacing">
                {ring}
              </textPath>
            </text>
          </g>
        </svg>
        <div
          aria-hidden="true"
          className={`absolute inset-[38px] max-sm:inset-[30px] rounded-full border-(length:--tt-stroke-bold) border-(--tt-ink) flex flex-col items-center justify-center transition-transform duration-(--tt-dur-lift) ease-(--tt-ease-lift) group-hover:scale-108 group-hover:-rotate-6 ${t.core}`}
        >
          <span className="font-(family-name:--tt-font-display) [font-stretch:var(--tt-display-stretch)] font-extrabold text-[44px] leading-none">
            {big}
          </span>
          <span className="mono text-[11px]">{unit}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <strong className="text-lg tracking-[-0.02em]">{name}</strong>
        <span className="text-sm text-(--tt-muted)">{desc}</span>
      </div>
    </div>
  )
}

export default StampBadge
