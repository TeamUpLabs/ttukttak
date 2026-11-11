import { Button, Countdown, LiveDot, Tag } from '../../../shared/ui'
import { kstDayTime } from '../../../shared/lib/kst.ts'
import { useThisWeek, weekLabels } from '../useThisWeek.ts'
import ThemeDemo from './ThemeDemo.tsx'

function ThisWeekCard() {
  const { now, week: current, next, phase, deadline } = useThisWeek()
  // 시즌 시작 전엔 첫 주 주제를 미리 보여줘요.
  const week = current ?? next

  return (
    <article className="bg-(--tt-night) text-(--tt-on-night) p-9 max-sm:p-6 rounded-(--tt-radius-xl) max-sm:rounded-(--tt-radius-lg) overflow-hidden tt-fade">
      <div className="grid grid-cols-[minmax(0,1fr)_200px] max-sm:grid-cols-1 gap-8 items-center">
        {week && (
          <div className="flex flex-col gap-5.5 min-w-0">
            <span className="mono flex items-center gap-2.5 text-[13px] text-(--tt-on-night-muted)">
              <LiveDot />
              {week.code} · {!current ? '공개 예정 주제' : week.type === 'break' ? '쉬는 주' : '이번 주 주제'}
            </span>
            <h2 className="m-0 text-[clamp(34px,3.6vw,52px)] leading-[1.12] tracking-[-0.04em] font-bold text-balance">
              {week.title}
            </h2>
            {week.type === 'break' ? (
              <p className="m-0 text-(--tt-on-night-muted)">{week.announcement}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {week.rule && <Tag tone="night">{week.rule}</Tag>}
                {week.difficulty && <Tag tone="night">난이도 {weekLabels.difficulty[week.difficulty]}</Tag>}
              </div>
            )}
          </div>
        )}

        <ThemeDemo week={week} now={now} />
      </div>

      <div className="mt-8 pt-7 border-t border-(--tt-night-line) flex justify-between items-end flex-wrap gap-5">
        {phase && deadline ? (
          <Countdown
            label={`${phase} · ${kstDayTime(deadline)}`}
            seconds={(deadline.getTime() - now.getTime()) / 1000}
          />
        ) : (
          <span className="mono text-[13px] text-(--tt-on-night-muted)">이번 시즌이 끝났어요</span>
        )}
        {phase === '제출 마감까지' && <Button variant="primary" href="/submit" label="결과물 제출하기" className="hover:bg-white! hover:text-black!" hasArrow />}
      </div>
    </article>
  )
}

export default ThisWeekCard
