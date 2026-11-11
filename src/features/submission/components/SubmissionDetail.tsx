import type { ReactNode } from 'react'
import { Avatar, Button, ProjectCard, Tag, type ThumbTone } from '../../../shared/ui'
import { useNow } from '../../../shared/hooks/useNow.ts'
import { kstDayTime, kstMonthDay } from '../../../shared/lib/kst.ts'
import { allSubmissions, feedbackFor, findSubmission, nameOf, safeHttps, TRACK_LABELS, weekOf, type Submission, type Track } from '../data.ts'
import DemoFrame from './DemoFrame.tsx'
import FeedbackSection from './FeedbackSection.tsx'

const WRAP = 'max-w-7xl mx-auto px-8 max-sm:px-4'
const H2 = 'm-0 text-[clamp(32px,3.6vw,52px)] leading-[1.1] tracking-[-0.045em] font-bold'
const H3 = 'm-0 text-2xl tracking-[-0.03em] font-bold'
const SIDE = 'flex flex-col gap-6 p-7 rounded-(--tt-radius-lg) border-(length:--tt-stroke-bold) border-(--tt-ink)'
const TONES: ThumbTone[] = ['sage', 'night', 'signal']
const HOUR = 3_600_000

const CHECKS = [
  { key: 'onTime', label: '마감 안에 제출' },
  { key: 'demoWorks', label: '데모 링크 작동' },
  { key: 'readme', label: 'README와 실행 방법' },
  { key: 'constraint', label: '주제 제약 지킴' },
] as const

type SubmissionDetailProps = {
  id: string
  /** 투표 자리. 페이지가 vote feature를 꽂아줘요. */
  renderVote?: (s: Submission, size: 'md' | 'big') => ReactNode
  viewer: string | null
}

/** 제출작 상세: 머리 · 작성자 · 데모 · 이야기와 작업 리듬 · 피드백 · 같은 주제 다른 작품 */
function SubmissionDetail({ id, renderVote, viewer }: SubmissionDetailProps) {
  const now = useNow(60_000)
  const s = findSubmission(id)
  const week = s && weekOf(s.weekId)

  if (!s || !week) {
    return (
      <section className={`${WRAP} py-30 flex flex-col items-start gap-6`}>
        <h1 className="m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold">제출작을 찾을 수 없어요.</h1>
        <Button variant="secondary" href="/#submit" label="이번 주 제출작 보러 가기" hasArrow />
      </section>
    )
  }

  const track = TRACK_LABELS[s.track as Track]
  const sameWeek = allSubmissions.filter((x) => x.weekId === s.weekId).sort((a, b) => b.voteCount - a.voteCount)
  const sameTrack = sameWeek.filter((x) => x.track === s.track)
  const trackRank = sameTrack.indexOf(s) + 1
  const overallRank = sameWeek.indexOf(s) + 1
  const votingOpen = !week.schedule.votingClosesAt || now.getTime() < Date.parse(week.schedule.votingClosesAt)
  const others = sameWeek.filter((x) => x !== s).slice(0, 3)
  const feedback = feedbackFor(s.id)
  const handle = s.handle.replace(/^@/, '')
  const demoUrl = safeHttps(s.demoUrl)
  const repoUrl = safeHttps(s.repoUrl)
  const submittedAt = new Date(s.submittedAt)

  // 72시간 작업 리듬: 6시간 칸 12개
  const opensAt = Date.parse(week.schedule.opensAt)
  const peak = Math.max(...s.rhythm, 1)
  const peakIndex = s.rhythm.indexOf(peak)
  const totalCommits = s.rhythm.reduce((a, b) => a + b, 0)
  const slotLabel = (i: number) => kstDayTime(new Date(opensAt + i * 6 * HOUR))

  return (
    <>
      {/* 머리 */}
      <section className={`${WRAP} pt-12 pb-14 flex flex-col gap-7`}>
        <ul aria-label="제출작 분류" className="m-0 p-0 list-none flex flex-wrap gap-2">
          <li><Tag><span className="mono">{week.code}</span></Tag></li>
          <li><Tag>{week.title}</Tag></li>
          <li><Tag>{track} 트랙</Tag></li>
          {votingOpen && <li><Tag tone="hot">현재 트랙 {trackRank}위</Tag></li>}
        </ul>
        <h1 className="m-0 text-[clamp(48px,7vw,104px)] leading-none tracking-[-0.055em] font-bold">{s.title}</h1>
        <div className="flex justify-between items-end flex-wrap gap-6">
          <p className="m-0 max-w-160 text-xl leading-[1.65] text-(--tt-ink-soft)">{s.summary}</p>
          <div className="flex items-center flex-wrap gap-3">
            {renderVote?.(s, 'big')}
            {demoUrl && <Button variant="secondary" href={demoUrl} target="_blank" rel="noreferrer" label="데모 열기 ↗" />}
            {repoUrl && <Button variant="primary" href={repoUrl} target="_blank" rel="noreferrer" label="GitHub 레포" />}
          </div>
        </div>

        {/* 작성자 줄 */}
        <dl className="m-0 flex items-center flex-wrap gap-x-10 gap-y-4 pt-6 border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
          <div className="flex items-center gap-3.5">
            <Avatar handle={handle} href={`/@${handle}`} />
            <span className="flex flex-col">
              <a href={`/@${handle}`} className="font-bold no-underline">{nameOf(handle) ?? handle}</a>
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
          <div>
            <h2 className={`${H2} mb-6`}>만든 이야기</h2>
            {s.story.map((part) => (
              <div key={part.label} className="grid grid-cols-[72px_minmax(0,1fr)] max-sm:grid-cols-1 gap-4 py-7 border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
                <span className="mono text-[13px] text-(--tt-muted) pt-1">{part.label}</span>
                <div className="flex flex-col gap-2">
                  <strong className="text-[22px] tracking-[-0.03em]">{part.title}</strong>
                  <p className="m-0 leading-[1.7] text-(--tt-ink-soft)">{part.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-end flex-wrap gap-3">
              <h3 className={H3}>72시간 작업 리듬</h3>
              <span className="mono text-[13px] text-(--tt-muted)">6시간 단위 커밋 수 · 총 {totalCommits}개</span>
            </div>
            <div
              role="img"
              aria-label={`6시간 단위 커밋 수. ${slotLabel(peakIndex)}부터 6시간 동안 ${peak}개로 가장 많음`}
              className="grid grid-cols-12 gap-2 max-sm:gap-1 items-end h-50"
            >
              {s.rhythm.map((n, i) => (
                <span
                  key={i}
                  title={`${slotLabel(i)}부터 6시간 · 커밋 ${n}개`}
                  className={`min-h-1 rounded-t-(--tt-radius-xs) origin-bottom animate-[tt-bar_1s_var(--tt-ease-snap)_both] transition-colors hover:bg-(--tt-muted) ${i === peakIndex && n > 0 ? 'bg-(--tt-signal)' : 'bg-(--tt-ink)'
                    }`}
                  style={{ height: `${(n / peak) * 100}%`, animationDelay: `${i * 50}ms` }}
                />
              ))}
            </div>
            <div className="mono flex justify-between text-xs text-(--tt-muted)">
              {[0, 4, 8].map((i) => <span key={i}>{slotLabel(i)}</span>)}
              <span className="text-(--tt-ink)">{slotLabel(12)} 마감</span>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className={H3}>주요 커밋</h3>
            <ol className="m-0 p-0 list-none relative before:absolute before:left-[113px] max-sm:before:left-[89px] before:top-2 before:bottom-2 before:w-0.5 before:bg-(--tt-line)">
              {s.commits.map((c) => (
                <li key={c.at} className="grid grid-cols-[96px_20px_minmax(0,1fr)] max-sm:grid-cols-[72px_20px_minmax(0,1fr)] gap-3 items-start py-3">
                  <span className="mono text-[13px] text-(--tt-muted)">{kstDayTime(new Date(c.at))}</span>
                  <span aria-hidden="true" className="relative z-10 mt-1 size-3 rounded-full border-2 border-(--tt-ink) bg-(--tt-ground)" />
                  <span className="flex flex-col gap-1">
                    <span className="mono text-sm">{c.message}</span>
                    <span className="text-[15px] text-(--tt-ink-soft)">{c.note}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside aria-label="제출작 정보" className="flex flex-col gap-5 lg:sticky lg:top-24">
          <div className={`${SIDE} bg-(--tt-surface)`}>
            <div className="flex justify-between items-start gap-3">
              <div className="flex flex-col gap-1">
                <span className="mono text-[13px] text-(--tt-muted)">{track} 트랙 {votingOpen ? '현재' : '최종'} 순위</span>
                <span className={`tt-numeral-l ${trackRank === 1 ? 'text-(--tt-signal)' : ''}`}>
                  {trackRank}<span className="text-[0.5em] text-(--tt-ink)">위</span>
                </span>
              </div>
              <span className="mono text-xs text-(--tt-muted)">{votingOpen ? '투표 진행 중' : '투표 마감'}</span>
            </div>
            <dl className="m-0 grid grid-cols-3 gap-3 pt-5 border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
              {[
                [s.voteCount, '투표'],
                [feedback.length, '피드백'],
                [`${overallRank}위`, '전체 순위'],
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
                const done = s.checks[key]
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
        </aside>
      </section>

      {/* 피드백 */}
      <section id="feedback" className="bg-(--tt-ground-sunk) border-y-(length:--tt-stroke-bold) border-(--tt-ink) scroll-mt-16">
        <div className={`${WRAP} pt-24 pb-26`}>
          <FeedbackSection
            key={s.id}
            initial={feedback}
            viewer={viewer}
            loginHref={`/login?next=${encodeURIComponent(`/p/${s.id}#feedback`)}`}
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
            {others.map((o, i) => (
              <ProjectCard
                key={o.id}
                href={`/p/${o.id}`}
                title={o.title}
                summary={o.summary}
                handle={o.handle}
                handleHref={`/${o.handle}`}
                trackLabel={TRACK_LABELS[o.track as Track]}
                thumb={{ tone: TONES[i % TONES.length], caption: o.caption }}
                vote={renderVote?.(o, 'md')}
              />
            ))}
          </div>
        </section>
      )}
    </>
  )
}

export default SubmissionDetail
