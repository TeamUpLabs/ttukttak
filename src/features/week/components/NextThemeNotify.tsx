import { useState } from 'react'
import { kstDayTime, kstMonthDay } from '../../../shared/lib/kst.ts'
import { useThisWeek } from '../useThisWeek.ts'

/** 푸터 CTA. 다음 주제 공개 시각을 알려주고 알림 이메일을 받아요. */
function NextThemeNotify() {
  const { next } = useThisWeek(60_000)
  const [sentTo, setSentTo] = useState<string | null>(null)
  const opensAt = next ? new Date(next.schedule.opensAt) : null
  const when = opensAt ? `${kstMonthDay(opensAt)} ${kstDayTime(opensAt)}` : null

  return (
    <div className="flex flex-col gap-8">
      <span className="mono text-[13px] text-(--tt-on-night-muted)">
        {when ? `다음 주제 · ${when} 공개` : '다음 주제 · 일정 준비 중'}
      </span>
      <p className="m-0 text-[clamp(48px,7.4vw,112px)] leading-none tracking-[-0.045em] font-bold">
        다음 주엔
        <br />
        뭘 만들까요<span className="text-(--tt-signal)">?</span>
      </p>

      {sentTo ? (
        <p role="status" className="m-0 text-lg">
          {sentTo}로 {when ? `${when}에` : '주제가 공개되면'} 알려드릴게요.
        </p>
      ) : (
        <form
          className="flex flex-wrap gap-3 max-w-160"
          onSubmit={(e) => {
            e.preventDefault()
            // ponytail: 저장소가 없어서 화면에만 반영해요. Supabase 붙이면 구독 테이블에 저장.
            setSentTo(String(new FormData(e.currentTarget).get('email')))
          }}
        >
          <label htmlFor="notify-email" className="sr-only">
            이메일 주소
          </label>
          <input
            id="notify-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="이메일 주소를 남겨주세요"
            className="flex-[1_1_280px] min-h-14 px-6 rounded-full border-(length:--tt-stroke-bold) border-(--tt-night-line) bg-transparent text-(--tt-on-night) placeholder:text-(--tt-on-night-muted) focus:outline-none focus:border-(--tt-signal)"
          />
          <button
            type="submit"
            className="min-h-14 px-6 rounded-full bg-(--tt-signal) text-(--tt-on-signal) font-medium cursor-pointer transition-transform duration-(--tt-dur-quick) ease-(--tt-ease-lift) hover:-translate-y-0.5"
          >
            주제 공개 알림 받기
          </button>
        </form>
      )}
    </div>
  )
}

export default NextThemeNotify
