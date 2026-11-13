import { useState } from 'react'
import { Avatar, Button, Tabs, Tag } from '../../../shared/ui'
import { useCountUp } from '../../../shared/hooks/useCountUp.ts'
import { kstDate, kstDayTime, kstMonthDay } from '../../../shared/lib/kst.ts'
import { STATUS_LABELS, weekStats, type ResultEntry } from '../results.ts'
import type { WeekNeighbor } from '../../../api/weeks.ts'
import { useWeekResults } from '../useWeekResults.ts'
import { weekLabels } from '../useThisWeek.ts'
import Podium from './Podium.tsx'

const WRAP = 'max-w-7xl mx-auto px-8 max-sm:px-4'
const H2 = 'm-0 text-[clamp(32px,3.6vw,52px)] leading-[1.1] tracking-[-0.045em] font-bold'
const DAY = 86_400_000
const SORTS = [
  { value: 'votes' as const, label: '투표순' },
  { value: 'recent' as const, label: '최근 제출순' },
]

/** 주차 결과: 주차 코드 · 통계 · 출제 의도 · 시상대 · 전체 제출작 · 한 줄 회고 · 이전/다음 주 */
function WeekResults({ id }: { id: string }) {
  const data = useWeekResults(id)
  const [sort, setSort] = useState<'votes' | 'recent'>('votes')

  if (data === undefined) return null
  if (!data) {
    return (
      <section className={`${WRAP} py-30 flex flex-col items-start gap-6`}>
        <h1 className="m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold">그런 주차는 없어요.</h1>
        <Button variant="secondary" href="/#archive" label="지난 주제 보러 가기" hasArrow />
      </section>
    )
  }

  const { week, prev, next, status, entries } = data
  const opensAt = new Date(week.schedule.opensAt)
  const hidden = status === 'upcoming'
  const showResults = week.type === 'theme' && !hidden
  const stats = weekStats(week, entries)
  const max = Math.max(...entries.map((e) => e.votes), 1)
  const sorted = [...entries].sort((a, b) => (sort === 'votes' ? b.votes - a.votes : Date.parse(b.submittedAt) - Date.parse(a.submittedAt)))
  const retros = entries.filter((e) => e.retro)
  const tags = week.constraints ?? []

  return (
    <>
      {/* 머리 */}
      <section className={`${WRAP} pt-12 pb-18 flex flex-col gap-12`}>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <span className="mono text-[13px] text-(--tt-muted)">
            {kstDate(opensAt)} — {kstMonthDay(new Date(opensAt.getTime() + 6 * DAY))} · {STATUS_LABELS[status]}
          </span>
        </div>

        <div className="flex items-end flex-wrap gap-x-10 gap-y-6">
          <span
            aria-label={`${week.code.slice(1)}주차`}
            className="font-(family-name:--tt-font-display) [font-stretch:var(--tt-display-stretch)] font-extrabold text-[clamp(160px,26vw,400px)] leading-[.8] tracking-[-0.04em] animate-[tt-stretch_1.4s_var(--tt-ease-snap)_both]"
          >
            {week.code}
          </span>
          <div className="flex flex-col gap-3 max-w-140 pb-4">
            <span className="mono text-[13px] text-(--tt-muted)">{week.type === 'break' ? '이 주는' : '이 주의 주제'}</span>
            <h1 className="m-0 text-[clamp(40px,5.2vw,80px)] leading-[1.05] tracking-[-0.05em] font-bold text-balance">
              {hidden ? `${kstMonthDay(opensAt)} ${kstDayTime(opensAt)}에 공개돼요` : week.title}
            </h1>
          </div>
        </div>

        {showResults && (
          <>
            <dl className="m-0 grid grid-cols-4 max-lg:grid-cols-2 border-y-(length:--tt-stroke-bold) border-(--tt-ink)">
              <Stat value={stats.submissions} label="제출작" index={0} />
              <Stat value={stats.participants} label="참가자" index={1} />
              <Stat value={stats.votes} label="투표" index={2} />
              <Stat value={stats.completion} unit="%" label="완주율 (참가 대비 제출)" index={3} />
            </dl>
            <div className="flex flex-col gap-6 max-w-200">
              <p className="m-0 text-xl leading-[1.65] text-(--tt-ink-soft)">{week.announcement}</p>
              <ul aria-label="제약" className="m-0 p-0 list-none flex flex-wrap gap-2">
                {tags.map((t) => <li key={t}><Tag>{t}</Tag></li>)}
                {week.difficulty && <li><Tag>난이도 {weekLabels.difficulty[week.difficulty]}</Tag></li>}
              </ul>
            </div>
          </>
        )}
        {week.type === 'break' && !hidden && <p className="m-0 max-w-200 text-xl leading-[1.65] text-(--tt-ink-soft)">{week.announcement}</p>}
      </section>

      {showResults && entries.length > 0 && (
        <>
          {/* 시상대 */}
          <section className="bg-(--tt-night) text-(--tt-on-night)">
            <div className={`${WRAP} pt-24 pb-0`}>
              <Podium entries={entries} title={status === 'final' ? '이번 주의 시상대' : '지금 순위'} />
            </div>
          </section>

          {/* 전체 제출작 */}
          <section className={`${WRAP} pt-26 pb-28 flex flex-col gap-10`}>
            <div className="flex justify-between items-end flex-wrap gap-5">
              <h2 className={H2}>
                전체 제출작 <span className="tt-numeral-m text-[1em] text-(--tt-muted)">{entries.length}</span>
              </h2>
              <Tabs label="정렬" options={SORTS} value={sort} onChange={setSort} />
            </div>
            <ol className="m-0 p-0 list-none grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 border-t-(length:--tt-stroke-bold) border-l-(length:--tt-stroke-bold) border-(--tt-ink)">
              {sorted.map((e, i) => <Tile key={e.key} entry={e} no={i + 1} max={max} />)}
            </ol>
          </section>

          {/* 한 줄 회고 */}
          {retros.length > 0 && (
            <section className="bg-(--tt-ground-sunk) border-y-(length:--tt-stroke-bold) border-(--tt-ink)">
              <div className={`${WRAP} pt-24 pb-26 flex flex-col gap-10`}>
                <div className="flex justify-between items-end flex-wrap gap-4">
                  <h2 className={H2}>한 줄 회고</h2>
                  <span className="mono text-[13px] text-(--tt-muted)">옆으로 넘겨보세요 →</span>
                </div>
                <ul
                  tabIndex={0}
                  aria-label="참가자 회고 목록"
                  // 가로 스크롤 영역은 세로로도 잘라요. hover 때 떠오름(6px)·그림자(6·8px)가 들어갈 안쪽 여백을 두고, 바깥 여백으로 상쇄해요.
                  className="-mx-3 -mt-3 px-3 pt-3 pb-5 list-none flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-px-3 [scrollbar-width:thin]"
                >
                  {retros.map((e) => (
                    <li key={e.key} className="snap-start shrink-0 basis-[min(420px,85%)]">
                      <figure className="m-0 h-full min-h-60 flex flex-col justify-between gap-7 p-7.5 rounded-(--tt-radius-lg) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) transition-[translate,rotate,box-shadow] duration-(--tt-dur-lift) ease-(--tt-ease-lift) hover:-translate-y-1.5 hover:rotate-[.4deg] hover:shadow-[6px_8px_0_var(--tt-ink)]">
                        <blockquote className="m-0 text-[22px] leading-[1.45] tracking-[-0.03em] font-bold">{e.retro}</blockquote>
                        <figcaption className="flex items-center gap-3">
                          <Avatar handle={e.handle} href={e.hasProfile ? `/@${e.handle}` : undefined} />
                          <span className="mono text-[13px] text-(--tt-ink-soft)">@{e.handle} · {e.title}</span>
                        </figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}
        </>
      )}

      {/* 이전 / 다음 주 */}
      <nav aria-label="주차 이동" className="grid grid-cols-2 max-sm:grid-cols-1 border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
        {prev ? <WeekLink week={prev} dir="prev" /> : <span />}
        {next ? <WeekLink week={next} dir="next" /> : <span />}
      </nav>
    </>
  )
}

/** 통계 한 칸. 0에서 카운트업해요. */
function Stat({ value, unit, label, index }: { value: number; unit?: string; label: string; index: number }) {
  const shown = useCountUp(value, 1200)
  return (
    <div
      className={`flex flex-col-reverse gap-1.5 py-7 px-6 border-(--tt-ink) ${index === 0 ? 'pl-0' : ''} ${index < 3 ? 'border-r-(length:--tt-stroke-bold)' : ''
        } max-lg:[&:nth-child(2)]:border-r-0 max-lg:[&:nth-child(3)]:pl-0 max-lg:[&:nth-child(-n+2)]:border-b-(length:--tt-stroke-bold)`}
    >
      <dt className="text-sm text-(--tt-muted)">{label}</dt>
      <dd className="m-0 tt-numeral-l max-sm:text-[52px] tabular-nums" aria-label={`${value.toLocaleString('ko-KR')}${unit ?? ''}`}>
        {shown.toLocaleString('ko-KR')}
        {unit && <span className="text-[0.5em]">{unit}</span>}
      </dd>
    </div>
  )
}

/** 결과 타일: 번호 · 시각, 트랙, 제목, 기술, 핸들, 투표 수와 상대 막대 */
function Tile({ entry: e, no, max }: { entry: ResultEntry; no: number; max: number }) {
  return (
    <li className="group flex flex-col gap-3.5 p-6.5 bg-(--tt-ground) border-r-(length:--tt-stroke-bold) border-b-(length:--tt-stroke-bold) border-(--tt-ink) transition-colors duration-300 hover:bg-(--tt-surface)">
      <div className="flex justify-between items-center gap-3">
        <span className="mono text-xs text-(--tt-muted)">
          {String(no).padStart(2, '0')} · {kstDayTime(new Date(e.submittedAt))}
        </span>
        <span className="text-xs px-2.5 py-1 rounded-full bg-(--tt-fill-quiet)">{weekLabels.track[e.track]}</span>
      </div>
      {e.href ? (
        <a href={e.href} className="text-[22px] font-bold tracking-[-0.035em] no-underline">{e.title}</a>
      ) : (
        <span className="text-[22px] font-bold tracking-[-0.035em]">{e.title}</span>
      )}
      <span className="text-sm text-(--tt-ink-soft)">{e.stack.join(' · ')}</span>
      <div className="mt-auto flex flex-col gap-2.5">
        <div className="mono flex justify-between text-[13px]">
          {e.hasProfile ? <a href={`/@${e.handle}`}>@{e.handle}</a> : <span>@{e.handle}</span>}
          <span>▲ {e.votes}</span>
        </div>
        <div className="h-1.5 rounded-full bg-(--tt-line) overflow-hidden">
          <span
            className="block h-full rounded-full bg-(--tt-ink) transition-[width,background-color] duration-800 ease-(--tt-ease-wipe) group-hover:bg-(--tt-signal)"
            style={{ width: `${Math.round((e.votes / max) * 100)}%` }}
          />
        </div>
      </div>
    </li>
  )
}

/** 이전·다음 주 링크. hover하면 주황 면이 바깥쪽부터 차올라요. */
function WeekLink({ week, dir }: { week: WeekNeighbor; dir: 'prev' | 'next' }) {
  const upcoming = week.phase === 'upcoming'
  const current = week.phase === 'building' || week.phase === 'voting' || week.phase === 'tallying'
  const caption = dir === 'prev' ? '← 이전 주' : `다음 주${current ? ' · 진행 중' : upcoming ? ' · 공개 전' : ''} →`

  return (
    <a
      href={`/w/${week.id}`}
      className={`relative isolate overflow-hidden flex flex-col gap-3 px-10 max-sm:px-4 py-14 max-sm:py-9 text-(--tt-ink) no-underline before:absolute before:inset-0 before:-z-10 before:bg-(--tt-signal) before:scale-x-0 before:transition-transform before:duration-500 before:ease-(--tt-ease-wipe) hover:before:scale-x-100 focus-visible:before:scale-x-100 ${dir === 'prev'
          ? 'before:origin-left'
          : 'items-end text-right before:origin-right border-l-(length:--tt-stroke-bold) max-sm:border-l-0 max-sm:border-t-(length:--tt-stroke-bold) border-(--tt-ink)'
        }`}
    >
      <span className="mono text-[13px]">{caption}</span>
      <span className="tt-numeral-xl max-sm:text-[60px]">{week.code}</span>
      <span className="text-lg">{week.title ?? '주제 공개 전'}</span>
    </a>
  )
}

export default WeekResults
