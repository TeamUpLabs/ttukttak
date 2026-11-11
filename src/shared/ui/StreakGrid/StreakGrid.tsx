export type StreakCell = {
  /** 0 쉰 주, 1 제출, 2 트랙 TOP 3 */
  kind: 0 | 1 | 2
  /** 칸에 올리면 보이는 설명. "2026 W45 · 제출" */
  label: string
  isNow?: boolean
}

type StreakGridProps = {
  title: string
  cells: StreakCell[]
  /** 격자 전체를 한 문장으로. "최근 52주 중 34주 제출, 현재 7주 연속" */
  summary: string
  /** 격자 아래 왼쪽·오른쪽 끝 라벨 */
  from: string
  to: string
  /** 격자 바로 아래 한 줄 */
  note?: string
}

const KINDS = [
  'bg-(--tt-fill-quiet)',
  'bg-(--tt-ink)',
  'bg-(--tt-signal) border-(length:--tt-stroke-bold) border-(--tt-ink)',
]
const LEGEND = ['쉰 주', '제출', '트랙 TOP 3']

/** 한 칸에 한 주. 52주 제출 기록을 26열 × 2줄로 보여줘요. */
function StreakGrid({ title, cells, summary, from, to, note }: StreakGridProps) {
  return (
    <div className="flex flex-col gap-7">
      <div className="flex justify-between items-end flex-wrap gap-4">
        <h2 className="m-0 text-[clamp(32px,3.6vw,52px)] leading-[1.1] tracking-[-0.045em] font-bold">{title}</h2>
        <ul className="mono m-0 p-0 list-none flex flex-wrap gap-5 text-[13px] text-(--tt-ink-soft)">
          {LEGEND.map((label, kind) => (
            <li key={label} className="inline-flex items-center gap-2">
              <span aria-hidden="true" className={`size-3.5 rounded-[4px] ${KINDS[kind]}`} />
              {label}
            </li>
          ))}
        </ul>
      </div>

      <div role="img" aria-label={summary} className="grid grid-cols-26 max-lg:grid-cols-13 gap-1.5 max-sm:gap-1">
        {cells.map((cell, i) => (
          <span
            key={i}
            title={cell.label}
            className={`aspect-square rounded-(--tt-radius-xs) animate-[tt-cell_.5s_var(--tt-ease-lift)_both] transition-transform duration-200 hover:scale-125 ${KINDS[cell.kind]} ${
              cell.isNow ? 'outline-2 outline-offset-2 outline-(--tt-signal)' : ''
            }`}
            style={{ animationDelay: `${300 + i * 22}ms` }}
          />
        ))}
      </div>

      {note && <p className="mono m-0 text-[13px]">{note}</p>}
      <div className="mono flex justify-between text-xs text-(--tt-muted)">
        <span>{from}</span>
        <span>{to}</span>
      </div>
    </div>
  )
}

export default StreakGrid
