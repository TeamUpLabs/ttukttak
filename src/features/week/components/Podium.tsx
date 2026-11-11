import { useState } from 'react'
import { Tabs } from '../../../shared/ui'
import { podiumOf, type ResultEntry, type Track } from '../results.ts'

const TRACKS: { value: Track; label: string }[] = [
  { value: 'beginner', label: '입문 트랙' },
  { value: 'regular', label: '일반 트랙' },
  { value: 'expert', label: '고수 트랙' },
]
// 화면 순서는 2 · 1 · 3. 위치마다 색이 고정이라 트랙을 바꾸면 높이만 바뀌어요.
const ORDER = [1, 0, 2]
const LOOKS = [
  'bg-(--tt-signal) text-(--tt-ink)',
  'bg-(--tt-on-night) text-(--tt-ink)',
  'bg-(--tt-night-line) text-(--tt-on-night)',
]
const DELAYS = [0, 250, 450]

type PodiumProps = { entries: ResultEntry[]; title: string }

/** 트랙별 시상대. 막대 높이는 득표에 비례해요. */
function Podium({ entries, title }: PodiumProps) {
  const [track, setTrack] = useState<Track>('expert')
  const top = podiumOf(entries, track)
  const max = Math.max(...entries.map((e) => e.votes), 1)

  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between items-end flex-wrap gap-5">
        <div className="flex flex-col gap-3">
          <span className="mono text-[13px] text-(--tt-on-night-muted)">트랙별 상위 3개</span>
          <h2 className="m-0 text-[clamp(32px,3.6vw,52px)] leading-[1.1] tracking-[-0.045em] font-bold">{title}</h2>
        </div>
        <Tabs tone="night" label="트랙 선택" options={TRACKS} value={track} onChange={setTrack} />
      </div>

      {top.length === 0 ? (
        <p className="m-0 py-20 text-center text-(--tt-on-night-muted)">이 트랙은 제출작이 없어요.</p>
      ) : (
        <ol aria-live="polite" className="m-0 p-0 list-none grid grid-cols-3 gap-5 max-sm:gap-2 items-end min-h-140 max-sm:min-h-110">
          {ORDER.map((i) => {
            const e = top[i]
            if (!e) return <li key={i} />
            const height = Math.round(150 + (e.votes / max) * 230) - i * 24
            return (
              <li key={i} className="flex flex-col gap-4.5 min-w-0" style={{ order: ORDER.indexOf(i) }}>
                <div className="flex flex-col gap-1.5 min-w-0">
                  <span className="mono text-xs text-(--tt-on-night-muted) truncate">
                    {e.hasProfile ? <a href={`/@${e.handle}`} className="text-inherit">@{e.handle}</a> : `@${e.handle}`} · ▲ {e.votes}
                  </span>
                  {e.href ? (
                    <a href={e.href} className="text-[22px] max-sm:text-[15px] font-bold tracking-[-0.03em] leading-[1.25] text-(--tt-on-night) no-underline hover:text-(--tt-signal)">
                      {e.title}
                    </a>
                  ) : (
                    <span className="text-[22px] max-sm:text-[15px] font-bold tracking-[-0.03em] leading-[1.25]">{e.title}</span>
                  )}
                </div>
                <div
                  className={`flex justify-center pt-5 overflow-hidden rounded-t-[18px] border-(length:--tt-stroke-bold) border-b-0 border-(--tt-on-night) origin-bottom animate-[tt-bar_1.1s_var(--tt-ease-snap)_both] transition-[height] duration-800 ease-(--tt-ease-wipe) ${LOOKS[i]}`}
                  style={{ height, animationDelay: `${DELAYS[i]}ms` }}
                >
                  <span className="font-(family-name:--tt-font-display) [font-stretch:var(--tt-display-stretch)] font-extrabold text-[120px] max-sm:text-[80px] leading-none">
                    {i + 1}
                    <span className="sr-only">위</span>
                  </span>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

export default Podium
