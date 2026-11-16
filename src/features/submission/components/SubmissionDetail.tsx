import type { ReactNode } from 'react'
import { Avatar, Button, ProjectCard, Tag } from '../../../shared/ui'
import { useNow } from '../../../shared/hooks/useNow.ts'
import { kstDayTime, kstMonthDay } from '../../../shared/lib/kst.ts'
import type { SubmissionCard } from '../../../api/submissions.ts'
import { TRACK_LABELS } from '../../../api/weeks.ts'
import { safeHttps } from '../data.ts'
import { useSubmission, useSubmissions } from '../useSubmissions.ts'
import DemoFrame from './DemoFrame.tsx'
import FeedbackSection from './FeedbackSection.tsx'
import HideSubmission from './HideSubmission.tsx'

const WRAP = 'max-w-7xl mx-auto px-8 max-sm:px-4'
const H2 = 'm-0 text-[clamp(32px,3.6vw,52px)] leading-[1.1] tracking-[-0.045em] font-bold'
const SIDE = 'flex flex-col gap-6 p-7 rounded-(--tt-radius-lg) border-(length:--tt-stroke-bold) border-(--tt-ink)'

// null이면 서버가 아직 확인 전이라 안 된 것처럼 보여요.
const CHECKS = [
  { key: 'onTime', label: '마감 안에 제출' },
  { key: 'demoReachable', label: '데모 링크 작동' },
  { key: 'hasReadme', label: 'README와 실행 방법' },
  { key: 'confirmsRule', label: '주제 제약 지킴' },
] as const
const STORY = [
  { key: 'what', label: '무엇을' },
  { key: 'how', label: '어떻게' },
  { key: 'retro', label: '회고' },
] as const

type SubmissionDetailProps = {
  id: string
  /** 투표 자리. 페이지가 vote feature를 꽂아줘요. */
  renderVote?: (s: SubmissionCard, size: 'md' | 'big', votingOpen: boolean) => ReactNode
  viewer: string | null
  /** 운영자면 숨기기 도구를 보여줘요. */
  isAdmin: boolean
}

/** 제출작 상세: 머리 · 작성자 · 데모 · 만든 이야기 · 피드백 · 같은 주제 다른 작품 */
// ponytail: 작업 리듬과 주요 커밋은 서버에 커밋 API(GET /submissions/:id/commits)가 생기면 다시 붙여요.
function SubmissionDetail({ id, renderVote, viewer, isAdmin }: SubmissionDetailProps) {
  const now = useNow(60_000)
  const { data, isPending } = useSubmission(id)
  const { data: rest } = useSubmissions(data?.submission.weekId ?? '', { exclude: id, sort: 'votes', limit: 3 })

  if (isPending) return null
  if (!data) {
    return (
      <section className={`${WRAP} py-30 flex flex-col items-start gap-6`}>
        <h1 className="m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold">제출작을 찾을 수 없어요.</h1>
        <Button variant="secondary" href="/#submit" label="이번 주 제출작 보러 가기" hasArrow />
      </section>
    )
  }

  const { submission: s, week, author, checks } = data
  const track = TRACK_LABELS[s.track]
  // 투표가 끝나기 전엔 순위가 null이에요.
  const trackRank = s.rank.track
  const votingOpen = !week.schedule.votingClosesAt || now.getTime() < Date.parse(week.schedule.votingClosesAt)
  const canVote = week.phase === 'voting'
  const others = rest?.items ?? []
  const handle = author.handle
  const demoUrl = safeHttps(s.demoUrl)
  const repoUrl = safeHttps(s.repoUrl)
  const submittedAt = new Date(s.submittedAt)
  const story = STORY.flatMap(({ key, label }) => (s.story?.[key] ? [{ label, body: s.story[key] }] : []))

  return (
    <>
      {/* 머리 */}
      <section className={`${WRAP} pt-12 pb-14 flex flex-col gap-7`}>
        <ul aria-label="제출작 분류" className="m-0 p-0 list-none flex flex-wrap gap-2">
          <li><Tag><span className="mono">{week.code}</span></Tag></li>
          <li><Tag>{week.title}</Tag></li>
          <li><Tag>{track} 트랙</Tag></li>
          {trackRank && <li><Tag tone="hot">{track} 트랙 {trackRank}위</Tag></li>}
        </ul>
        <h1 className="m-0 text-[clamp(48px,7vw,104px)] leading-none tracking-[-0.055em] font-bold">{s.title}</h1>
        <div className="flex justify-between items-end flex-wrap gap-6">
          <p className="m-0 max-w-160 text-xl leading-[1.65] text-(--tt-ink-soft)">{s.summary}</p>
          <div className="flex items-center flex-wrap gap-3">
            {renderVote?.(s, 'big', canVote)}
            {demoUrl && <Button variant="secondary" href={demoUrl} target="_blank" rel="noreferrer" label="데모 열기 ↗" />}
            {repoUrl && <Button variant="primary" href={repoUrl} target="_blank" rel="noreferrer" label="GitHub 레포" />}
          </div>
        </div>

        {/* 작성자 줄 */}
        <dl className="m-0 flex items-center flex-wrap gap-x-10 gap-y-4 pt-6 border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
          <div className="flex items-center gap-3.5">
            <Avatar handle={handle} href={`/@${handle}`} />
            <span className="flex flex-col">
              <a href={`/@${handle}`} className="font-bold no-underline">{author.name}</a>
              <span className="mono text-[13px] text-(--tt-muted)">@{handle}</span>
            </span>
          </div>
          <div className="flex flex-col">
            <dt className="mono text-xs text-(--tt-muted)">제출</dt>
            <dd className="m-0">{kstMonthDay(submittedAt)} {kstDayTime(submittedAt)}</dd>
          </div>
          <div className="flex flex-col">
            <dt className="mono text-xs text-(--tt-muted)">작업 시간</dt>
            <dd className="m-0">약 {s.workHours}시간</dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <dt className="sr-only">사용한 기술</dt>
            <dd className="m-0 flex flex-wrap gap-2">
              {s.stack.map((t) => <Tag key={t}><span className="mono">{t}</span></Tag>)}
            </dd>
          </div>
        </dl>
      </section>

      {/* 라이브 데모 */}
      {demoUrl && (
        <section className={`${WRAP} pb-24`}>
          <DemoFrame url={demoUrl} title={s.title} />
        </section>
      )}

      {/* 본문 2단 */}
      <section className={`${WRAP} pb-28 grid grid-cols-[minmax(0,8fr)_minmax(0,4fr)] max-lg:grid-cols-1 gap-16 items-start`}>
        <div className="flex flex-col gap-20">
          {story.length > 0 && (
            <div>
              <h2 className={`${H2} mb-6`}>만든 이야기</h2>
              {story.map((part) => (
                <div key={part.label} className="grid grid-cols-[72px_minmax(0,1fr)] max-sm:grid-cols-1 gap-4 py-7 border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
                  <span className="mono text-[13px] text-(--tt-muted) pt-1">{part.label}</span>
                  <p className="m-0 leading-[1.7] text-(--tt-ink-soft)">{part.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside aria-label="제출작 정보" className="flex flex-col gap-5 lg:sticky lg:top-24">
          <div className={`${SIDE} bg-(--tt-surface)`}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex flex-col gap-1">
                <span className="mono text-[13px] text-(--tt-muted)">{track} 트랙 {votingOpen ? '' : '최종 '}순위</span>
                <span className={`tt-numeral-l ${trackRank === 1 ? 'text-(--tt-signal)' : ''}`}>
                  {trackRank ?? '–'}<span className="text-[0.5em] text-(--tt-ink)">{trackRank ? '위' : ''}</span>
                </span>
              </div>
              <span className="mono text-xs text-(--tt-muted)">{canVote ? '투표 진행 중' : votingOpen ? '투표 전' : '투표 마감'}</span>
            </div>
            <dl className="m-0 grid grid-cols-3 gap-3 pt-5 border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
              {[
                [s.voteCount, '투표'],
                [s.feedbackCount, '피드백'],
                [s.rank.overall ? `${s.rank.overall}위` : '–', '전체 순위'],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col-reverse gap-1">
                  <dt className="text-[13px] text-(--tt-muted)">{label}</dt>
                  <dd className="m-0 tt-numeral-m text-[32px]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className={`${SIDE} bg-(--tt-surface)`}>
            <strong className="text-lg">완주 체크</strong>
            <ul className="m-0 p-0 list-none flex flex-col gap-3.5">
              {CHECKS.map(({ key, label }) => {
                const done = checks[key] === true
                return (
                  <li key={key} className={`flex items-center gap-3 text-[15px] ${done ? '' : 'text-(--tt-muted)'}`}>
                    <span className={`inline-flex items-center justify-center size-6 shrink-0 rounded-full border-(length:--tt-stroke-bold) ${done ? 'bg-(--tt-ink) border-(--tt-ink)' : 'border-(--tt-muted)'}`}>
                      {done && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--tt-ground)" strokeWidth="2" aria-hidden="true">
                          <path d="m2.5 6 2.5 2.5 4.5-5" />
                        </svg>
                      )}
                    </span>
                    {label}
                    <span className="sr-only">{done ? ' 완료' : ' 아직'}</span>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className={`${SIDE} bg-(--tt-night) text-(--tt-on-night)`}>
            <span className="mono text-[13px] text-(--tt-on-night-muted)">만든 사람에게</span>
            <p className="m-0 text-lg leading-[1.6]">써보고 느낀 점을 남겨주세요. 피드백을 남기면 다음 주 내 제출작 노출 포인트가 쌓여요.</p>
            <Button variant="primary" href="#feedback" label="피드백 남기기" hasArrow className="self-start" />
          </div>

          {isAdmin && (
            <div className={`${SIDE} bg-(--tt-surface)`}>
              <span className="mono text-[13px] text-(--tt-muted)">운영자</span>
              <HideSubmission id={s.id} />
            </div>
          )}
        </aside>
      </section>

      {/* 피드백 */}
      <section id="feedback" className="bg-(--tt-ground-sunk) border-y-(length:--tt-stroke-bold) border-(--tt-ink) scroll-mt-16">
        <div className={`${WRAP} pt-24 pb-26`}>
          <FeedbackSection
            key={s.id}
            submissionId={s.id}
            isOwner={!!s.viewer?.isAuthor}
            isAdmin={isAdmin}
            viewer={viewer}
            loginNext={`/p/${s.id}#feedback`}
            now={now}
          />
        </div>
      </section>

      {/* 같은 주제 다른 작품 */}
      {others.length > 0 && (
        <section className={`${WRAP} pt-24 pb-30 flex flex-col gap-10`}>
          <div className="flex justify-between items-end flex-wrap gap-5">
            <h2 className={H2}>같은 주제, 다른 작품</h2>
            <a href="/#submit" className="text-[15px] font-medium">{week.code} 전체 보기 →</a>
          </div>
          <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6">
            {others.map((o) => (
              <ProjectCard
                key={o.id}
                href={`/p/${o.id}`}
                title={o.title}
                summary={o.summary}
                handle={`@${o.author.handle}`}
                handleHref={`/@${o.author.handle}`}
                trackLabel={TRACK_LABELS[o.track]}
                thumb={{ tone: o.thumbnail.tint, caption: o.thumbnail.caption }}
                vote={renderVote?.(o, 'md', canVote)}
              />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export default SubmissionDetail
