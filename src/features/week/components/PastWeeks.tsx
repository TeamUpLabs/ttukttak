import { useNow } from '../../../shared/hooks/useNow.ts'
import { kstMonthDay } from '../../../shared/lib/kst.ts'
import submissions from '../../../../mocks/submissions.json'
import { getPastWeeks, type Week } from '../thisWeek.ts'
import { weeks } from '../useThisWeek.ts'

const countOf = (w: Week) => w.submissionCount ?? submissions.filter((s) => s.weekId === w.id).length

const SUB = 'mono text-[13px] text-(--tt-muted) transition-colors duration-(--tt-dur-lift) group-hover:text-(--tt-on-night-muted) group-focus-visible:text-(--tt-on-night-muted) max-sm:hidden'

/** 결과가 나온 주제 최근 5개. 주가 끝나면 자동으로 한 줄씩 쌓여요. */
function PastWeeks() {
  const now = useNow(60_000)
  const past = getPastWeeks(weeks, now).slice(0, 5)
  if (past.length === 0) return null

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-end flex-wrap gap-6">
        <h2 className="m-0 text-[clamp(36px,4.4vw,64px)] leading-[1.08] tracking-[-0.045em] font-bold">지난 주제들</h2>
        <a href={`/w/${past[0].id}`} className="text-[15px] font-medium">
          지난주 결과 보기 →
        </a>
      </div>

      <ul className="m-0 p-0 list-none border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
        {past.map((w) => {
          const start = new Date(w.schedule.opensAt)
          const end = new Date(start.getTime() + 6 * 86_400_000)
          return (
            <li key={w.id}>
              <a
                href={`/w/${w.id}`}
                className="group relative isolate overflow-hidden grid grid-cols-[120px_minmax(0,1fr)_120px_140px_48px] max-sm:grid-cols-[56px_minmax(0,1fr)_32px] items-center gap-5 px-2 py-7 max-sm:px-1 max-sm:py-5.5 border-b-(length:--tt-stroke-bold) border-(--tt-ink) text-(--tt-ink) no-underline transition-colors duration-(--tt-dur-lift) hover:text-white focus-visible:text-white before:absolute before:inset-0 before:-z-10 before:bg-(--tt-ink) before:origin-bottom before:scale-y-0 before:transition-transform before:duration-(--tt-dur-lift) before:ease-(--tt-ease-wipe) hover:before:scale-y-100 focus-visible:before:scale-y-100"
              >
                <span className="tt-numeral-m max-sm:text-[28px]">{w.code}</span>
                <span className="text-[clamp(22px,2.4vw,34px)] font-bold tracking-[-0.04em]">{w.title}</span>
                <span className={SUB}>{countOf(w)}개 제출</span>
                <span className={SUB}>
                  {kstMonthDay(start)} — {kstMonthDay(end)}
                </span>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 28 28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                  className="transition-transform duration-(--tt-dur-lift) ease-(--tt-ease-lift) group-hover:translate-x-1.5 group-hover:-rotate-45 group-focus-visible:translate-x-1.5 group-focus-visible:-rotate-45"
                >
                  <path d="M5 14h18M16 7l7 7-7 7" />
                </svg>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default PastWeeks
