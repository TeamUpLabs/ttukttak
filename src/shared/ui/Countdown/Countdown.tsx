type CountdownProps = {
  /** "제출 마감까지 · 목 10:00" */
  label: string
  /** 남은 초 */
  seconds: number
  /** compact: 마감 띠용. 48px, 단위가 숫자 옆에 붙고 label은 밖에서 보여줘요(낭독용으로만 써요). */
  size?: 'xl' | 'compact'
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/** 마감까지 남은 시간을 굴러가는 큰 숫자로. night 블록 위에서만 써요. */
function Countdown({ label, seconds, size = 'xl' }: CountdownProps) {
  const total = Math.max(0, Math.floor(seconds))
  const units: [string, number][] = [
    ['일', Math.floor(total / 86400)],
    ['시간', Math.floor(total / 3600) % 24],
    ['분', Math.floor(total / 60) % 60],
    ['초', total % 60],
  ]
  const shown = units.filter(([unit, value]) => unit !== '일' || value > 0)
  const spoken = shown.map(([unit, value]) => `${value}${unit}`).join(' ')

  if (size === 'compact') {
    return (
      <div role="timer" aria-label={`${label} ${spoken}`} className="flex gap-2.5 items-end text-(--tt-signal)">
        {shown.map(([unit, value]) => (
          <div key={unit} className="flex items-end gap-1" aria-hidden="true">
            <div className="flex font-(family-name:--tt-font-display) [font-stretch:var(--tt-display-stretch)] font-extrabold text-[48px] max-sm:text-[36px] leading-none">
              {String(value).padStart(2, '0').split('').map((d, i) => (
                <Digit key={i} n={Number(d)} />
              ))}
            </div>
            <span className="mono text-xs pb-1.5 text-(--tt-on-night-muted)">{unit}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="mono text-[13px] text-(--tt-on-night-muted)">{label}</span>
      <div role="timer" aria-label={`${label} ${spoken}`} className="flex gap-4.5 items-end">
        {shown.map(([unit, value]) => (
          <div key={unit} className="flex flex-col gap-1.5" aria-hidden="true">
            <div className="flex tt-numeral-xl max-sm:text-[60px] text-(--tt-signal)">
              {String(value).padStart(2, '0').split('').map((d, i) => (
                <Digit key={i} n={Number(d)} />
              ))}
            </div>
            <span className="mono text-xs text-(--tt-on-night-muted)">{unit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** 0–9 세로 띠를 1em 창 안에서 굴려요. */
function Digit({ n }: { n: number }) {
  return (
    <span className="block h-[1em] overflow-hidden">
      <span
        className="flex flex-col transition-transform duration-(--tt-dur-tick) ease-(--tt-ease-snap)"
        style={{ transform: `translateY(-${n}em)` }}
      >
        {DIGITS.map((d) => (
          <span key={d} className="block h-[1em]">{d}</span>
        ))}
      </span>
    </span>
  )
}

export default Countdown
