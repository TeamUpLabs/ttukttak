import { useState, type ReactNode } from 'react'
import { ProjectCard, Tabs, type ThumbTone } from '../../../shared/ui'
import { allSubmissions as submissions, TRACK_LABELS, type Submission, type Track } from '../data.ts'

export type { Submission }

const FILTERS: { value: Track | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'beginner', label: '입문' },
  { value: 'regular', label: '일반' },
  { value: 'expert', label: '고수' },
]
// 이웃한 카드끼리 같은 바탕이 붙지 않게 순서대로 돌려요.
const TONES: ThumbTone[] = ['sage', 'night', 'signal', 'sand', 'sky', 'butter']

type SubmissionGalleryProps = {
  weekId: string
  weekCode: string
  /** 카드의 투표 자리. 페이지가 vote feature를 꽂아줘요. */
  renderVote?: (submission: Submission) => ReactNode
}

/** 이번 주 제출작. 트랙 필터 + 카드 3열. 순위는 득표순이에요. */
function SubmissionGallery({ weekId, weekCode, renderVote }: SubmissionGalleryProps) {
  const [filter, setFilter] = useState<Track | 'all'>('all')

  // ponytail: 목 데이터 고정. Supabase 붙이면 주차별 제출작 쿼리로 바꿔요.
  const ranked = submissions
    .filter((s) => s.weekId === weekId)
    .sort((a, b) => b.voteCount - a.voteCount)
    .map((s, i) => ({ ...s, rank: i + 1 }))
  const shown = filter === 'all' ? ranked : ranked.filter((s) => s.track === filter)

  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between items-end flex-wrap gap-6">
        <div className="flex flex-col gap-3.5">
          <span className="mono text-[13px] text-(--tt-muted)">
            {weekCode} · 제출작 {shown.length}개
          </span>
          <h2 className="m-0 text-[clamp(36px,4.4vw,64px)] leading-[1.08] tracking-[-0.045em] font-bold">
            이번 주에 나온 것들
          </h2>
        </div>
        <Tabs label="트랙 필터" options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      {shown.length === 0 ? (
        <p className="m-0 py-16 text-center text-(--tt-muted)">
          {ranked.length === 0 ? '아직 제출작이 없어요. 첫 번째로 올려 보세요.' : '이 트랙엔 아직 제출작이 없어요.'}
        </p>
      ) : (
        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6">
          {shown.map((s) => (
            <ProjectCard
              key={s.id}
              href={`/p/${s.id}`}
              title={s.title}
              summary={s.summary}
              handle={s.handle}
              handleHref={`/${s.handle}`}
              trackLabel={TRACK_LABELS[s.track as Track]}
              rank={s.rank}
              thumb={{ tone: TONES[(s.rank - 1) % TONES.length], caption: s.caption }}
              vote={renderVote?.(s)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default SubmissionGallery
