import { kstDayTime, kstDaysBetween, kstWeekday } from '../../../shared/lib/kst.ts'
import { useThisWeek } from '../useThisWeek.ts'

const WEEK_MS = 7 * 86_400_000

const STEPS = [
  { key: 'opensAt', title: '주제 공개', body: '제약이 걸린 주제 하나. 입문·일반·고수 트랙 중 하나를 고르세요.' },
  { key: 'submissionClosesAt', title: '제출 마감', body: '레포, 데모 링크, 스크린샷 한 장, 한 줄 소개면 충분해요.' },
  { key: 'votingClosesAt', title: '투표 마감', body: '직접 써보고 투표해요. 피드백을 남기면 다음 주 노출 포인트가 쌓여요.' },
  { key: 'resultsAt', title: '결과 발표', body: '트랙별 상위 3개 공개, 연속 제출 기록이 프로필에 남아요.' },
] as const

/** 이번 주 7일 진행 막대 + 요일 + 4단계. 일정은 JSON에서 읽어요. */
function WeekFlow() {
  const { now, week: current, next } = useThisWeek(60_000)
  // 휴식 주나 시즌 시작 전엔 다음 주제 주의 흐름을 보여줘요.
  const week = current?.type === 'theme' ? current : next
  if (!week) return null

  const start = new Date(week.schedule.opensAt)
  const pct = (at: Date) => Math.min(100, Math.max(0, ((at.getTime() - start.getTime()) / WEEK_MS) * 100))
  const progress = pct(now)
  const todayIndex = kstDaysBetween(start, now)

  const steps = STEPS.flatMap((step) => {
    const iso = week.schedule[step.key]
    if (!iso) return []
    const at = new Date(iso)
    const nextWeek = at.getTime() - start.getTime() >= WEEK_MS
    return [{ ...step, at, label: `${nextWeek ? '다음 ' : ''}${kstDayTime(at)}` }]
  })

  return (
    <div className="flex flex-col gap-14">
      <div className="flex justify-between items-end flex-wrap gap-6">
        <h2 className="m-0 text-[clamp(36px,4.4vw,64px)] leading-[1.08] tracking-[-0.045em] font-bold">
          한 주는
          <br />
          이렇게 흘러가요
        </h2>
        <p className="m-0 max-w-95 leading-[1.7] text-(--tt-ink-soft)">
          지금 위치는 주황 점이에요. 제작 기간이 끝나면 투표와 피드백이 열리고, 다음 월요일에 결과와 새 주제가 함께 발표돼요.
        </p>
      </div>

      <div>
        <div
          role="progressbar"
          aria-label={`${week.code} 진행률`}
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="relative h-1.5 rounded-full bg-(--tt-line)"
        >
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-(--tt-ink) origin-left animate-[tt-grow_1.6s_var(--tt-ease-wipe)_.3s_both]"
            style={{ width: `${progress}%` }}
          />
          {steps.map((s) => (
            <span
              key={s.key}
              aria-hidden="true"
              className="absolute -top-1.75 w-0.5 h-5 bg-(--tt-ink)"
              // 100%에서도 막대 안에 머물도록 너비 2px만큼 비례해서 당겨요
              style={{ left: `calc(${pct(s.at)}% - ${pct(s.at) * 0.02}px)` }}
            />
          ))}
          <span
            aria-hidden="true"
            className="absolute top-1/2 size-4.5 -ml-2.25 -mt-2.25 rounded-full bg-(--tt-signal) border-3 border-(--tt-ground) shadow-[0_0_0_1.5px_var(--tt-ink)]"
            style={{ left: `${progress}%` }}
          >
            <span className="absolute -inset-0.75 -z-10 rounded-full bg-(--tt-signal) animate-[tt-ping_1.8s_ease-out_infinite]" />
          </span>
        </div>

        <ol className="m-0 p-0 list-none grid grid-cols-7">
          {Array.from({ length: 7 }, (_, i) => {
            const isToday = i === todayIndex
            return (
              <li
                key={i}
                className={`pt-3.5 text-[13px] ${isToday ? 'font-bold text-(--tt-ink)' : 'text-(--tt-muted)'}`}
                aria-current={isToday ? 'date' : undefined}
              >
                {kstWeekday(new Date(start.getTime() + i * 86_400_000))}
                {isToday && ' · 오늘'}
              </li>
            )
          })}
        </ol>
      </div>

      <ol className="m-0 p-0 list-none grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-4">
        {steps.map((s, i) => (
          <li
            key={s.key}
            className="flex flex-col gap-2 pt-4.5 border-t-(length:--tt-stroke-bold) border-(--tt-ink) transition-transform duration-(--tt-dur-quick) ease-(--tt-ease-lift) hover:-translate-y-1"
          >
            <span className="mono text-[13px] text-(--tt-muted)">
              {String(i + 1).padStart(2, '0')} · {s.label}
            </span>
            <strong className="text-[22px] tracking-[-0.03em]">{s.title}</strong>
            <span className="text-[15px] leading-[1.65] text-(--tt-ink-soft)">{s.body}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default WeekFlow
