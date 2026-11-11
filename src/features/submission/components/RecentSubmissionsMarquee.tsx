import { Marquee } from '../../../shared/ui'
import { useNow } from '../../../shared/hooks/useNow.ts'
import submissions from '../../../../mocks/submissions.json'

const rtf = new Intl.RelativeTimeFormat('ko')

/** "방금", "5분 전", "3시간 전", "2일 전" */
function timeAgo(at: number, now: Date) {
  const min = Math.floor((now.getTime() - at) / 60_000)
  if (min < 1) return '방금'
  if (min < 60) return rtf.format(-min, 'minute')
  if (min < 60 * 24) return rtf.format(-Math.floor(min / 60), 'hour')
  return rtf.format(-Math.floor(min / (60 * 24)), 'day')
}

/** 받침이 있으면 "을", 없으면 "를". 한글이 아니면 "을". */
function objectParticle(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code < 11172 && code % 28 === 0 ? '를' : '을'
}

// ponytail: 목 데이터 고정. Supabase 붙이면 최근 제출 쿼리로 바꿔요.
const recent = submissions
  .map((s) => ({ ...s, at: Date.parse(s.submittedAt) }))
  .sort((a, b) => b.at - a.at)

function RecentSubmissionsMarquee() {
  const now = useNow(60_000)
  // 아직 오지 않은 시각의 목 데이터는 숨겨요.
  const shown = recent.filter((s) => s.at <= now.getTime()).slice(0, 8)
  if (shown.length === 0) return null

  return (
    <Marquee label="최근 제출 소식">
      {shown.map((s) => (
        <span key={s.id} className="flex items-center gap-3.5 px-7 py-4.5 whitespace-nowrap">
          <span className="mono text-[13px]">{timeAgo(s.at, now)}</span>
          <span>
            <b className="font-bold">{s.handle}</b>님이 「{s.title}」{objectParticle(s.title)} 제출했어요
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
            <circle cx="7" cy="7" r="3.5" fill="currentColor" />
          </svg>
        </span>
      ))}
    </Marquee>
  )
}

export default RecentSubmissionsMarquee
