import { useState, type ReactNode } from 'react'
import { ProjectCard, Tabs } from '../../../shared/ui'
import type { SubmissionCard } from '../../../api/submissions.ts'
import { TRACK_LABELS, type Track } from '../data.ts'
import { useSubmissions } from '../useSubmissions.ts'

const FILTERS: { value: Track | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'beginner', label: '입문' },
  { value: 'regular', label: '일반' },
  { value: 'expert', label: '고수' },
]

type SubmissionGalleryProps = {
  weekId: string
  weekCode: string
  /** 카드의 투표 자리. 페이지가 vote feature를 꽂아줘요. */
  renderVote?: (submission: SubmissionCard) => ReactNode
}

/** 이번 주 제출작. 트랙 필터 + 카드 3열. 제작 기간엔 무작위, 이후엔 득표순이에요(서버가 정해요). */
function SubmissionGallery({ weekId, weekCode, renderVote }: SubmissionGalleryProps) {
  const [filter, setFilter] = useState<Track | 'all'>('all')

  const { data } = useSubmissions(weekId, filter === 'all' ? {} : { track: filter })
  const shown = data?.items ?? []

  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between items-end flex-wrap gap-6">
        <div className="flex flex-col gap-3.5">
          <span className="mono text-[13px] text-(--tt-muted)">
            {weekCode} · 제출작 {data?.total ?? 0}개
          </span>
          <h2 className="m-0 text-[clamp(36px,4.4vw,64px)] leading-[1.08] tracking-[-0.045em] font-bold">
            이번 주에 나온 것들
          </h2>
        </div>
        <Tabs label="트랙 필터" options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      {!data ? null : shown.length === 0 ? (
        <p className="m-0 py-16 text-center text-(--tt-muted)">
          {filter === 'all' ? '아직 제출작이 없어요. 첫 번째로 올려 보세요.' : '이 트랙엔 아직 제출작이 없어요.'}
        </p>
      ) : (
        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6">
          {shown.map((s) => (
            <ProjectCard
              key={s.id}
              href={`/p/${s.id}`}
              title={s.title}
              summary={s.summary}
              handle={`@${s.author.handle}`}
              handleHref={`/@${s.author.handle}`}
              trackLabel={TRACK_LABELS[s.track]}
              rank={(filter === 'all' ? s.rank.overall : s.rank.track) ?? undefined}
              thumb={{ tone: s.thumbnail.tint, caption: s.thumbnail.caption }}
              vote={renderVote?.(s)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SubmissionGallery
