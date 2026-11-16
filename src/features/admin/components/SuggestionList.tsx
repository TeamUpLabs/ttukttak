import { useInfiniteQuery } from '@tanstack/react-query'
import { Button } from '../../../shared/ui'
import { kstDayTime, kstMonthDay } from '../../../shared/lib/kst.ts'
import { adminApi } from '../../../api/admin.ts'
import { messageOf } from '../admin.ts'

/** 들어온 주제 제안, 최신순 */
function SuggestionList() {
  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ['admin', 'theme-suggestions'],
    queryFn: ({ pageParam }) => adminApi.suggestions(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  })
  const items = data?.pages.flatMap((p) => p.items) ?? []

  if (error) return <p role="alert" className="m-0">{messageOf(error)}</p>
  if (!data) return null
  if (items.length === 0) return <p className="m-0 text-(--tt-muted)">아직 들어온 제안이 없어요.</p>

  return (
    <div className="flex flex-col gap-6">
      <ul className="m-0 p-0 list-none border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
        {items.map((s) => {
          const at = new Date(s.createdAt)
          return (
            <li key={s.id} className="flex flex-col gap-1.5 py-5 border-b border-(--tt-line)">
              <div className="flex justify-between items-baseline flex-wrap gap-3">
                <strong className="text-lg">{s.title}</strong>
                <span className="mono text-xs text-(--tt-muted)">
                  {s.author ? <a href={`/@${s.author.handle}`}>@{s.author.handle}</a> : '탈퇴한 사용자'} · {kstMonthDay(at)} {kstDayTime(at)}
                </span>
              </div>
              <span className="text-[15px]">제약 · {s.constraint}</span>
              {s.why && <span className="text-[15px] leading-[1.6] text-(--tt-ink-soft)">{s.why}</span>}
            </li>
          )
        })}
      </ul>
      {hasNextPage && (
        <div>
          <Button variant={isFetchingNextPage ? 'disabled' : 'primary'} label={isFetchingNextPage ? '불러오는 중' : '더 보기'} onClick={() => fetchNextPage()} />
        </div>
      )}
    </div>
  )
}

export default SuggestionList
