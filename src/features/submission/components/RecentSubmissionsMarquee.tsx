import { Marquee } from '../../../shared/ui'
import { useNow } from '../../../shared/hooks/useNow.ts'
import { timeAgo } from '../../../shared/lib/time.ts'
import { useSubmissions } from '../useSubmissions.ts'

/** 받침이 있으면 "을", 없으면 "를". 한글이 아니면 "을". */
function objectParticle(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code < 11172 && code % 28 === 0 ? '를' : '을'
}

// ponytail: 이번 주 최근 제출 8개를 들어올 때 한 번 받아요. 서버에 activity 스트림이 생기면 그걸로 바꿔요.
function RecentSubmissionsMarquee({ weekId }: { weekId: string }) {
  const now = useNow(60_000)
  const { data } = useSubmissions(weekId, { sort: 'recent', limit: 8 })
  const shown = data?.items ?? []
  if (shown.length === 0) return null

  return (
    <Marquee label="최근 제출 소식">
      {shown.map((s) => (
        <span key={s.id} className="flex items-center gap-3.5 px-7 py-4.5 whitespace-nowrap">
          <span className="mono text-[13px]">{timeAgo(Date.parse(s.submittedAt), now)}</span>
          <span>
            <b className="font-bold">@{s.author.handle}</b>님이 「{s.title}」{objectParticle(s.title)} 제출했어요
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
