import { useState } from 'react'
import { Avatar, Button, ProjectCard, StampBadge, StreakGrid, Tabs, type StampTone, type ThumbTone } from '../../../shared/ui'
import { kstDaysBetween, kstYearMonth } from '../../../shared/lib/kst.ts'
import { trackLabels, useProfile } from '../useProfile.ts'
import FeedbackList from './FeedbackList.tsx'

const TONES: ThumbTone[] = ['night', 'sand', 'sky', 'sage', 'signal', 'butter']
const SECTION_TITLE = 'm-0 text-[clamp(32px,3.6vw,52px)] leading-[1.1] tracking-[-0.045em] font-bold'

/** 프로필 전체: 머리 · 통계 · 52주 기록 · 배지 · 제출작/피드백 */
function ProfileView({ handle }: { handle: string }) {
  const profile = useProfile(handle)
  const [following, setFollowing] = useState(false)
  const [tab, setTab] = useState<'works' | 'acts'>('works')

  if (!profile) {
    return (
      <section className="max-w-7xl mx-auto px-8 max-sm:px-4 py-30 flex flex-col items-start gap-6">
        <h1 className="m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold">@{handle}님을 찾을 수 없어요.</h1>
        <Button variant="secondary" href="/" label="이번 주 주제 보러 가기" hasArrow />
      </section>
    )
  }

  const { user, entries, now, weekOf, cells, streak, recentCount, top3, votes } = profile
  const joined = new Date(user.joinedAt)
  const weeksTogether = Math.max(1, Math.floor(kstDaysBetween(joined, now) / 7) + 1)

  const stats = [
    { value: streak, unit: '주', label: '현재 연속 제출', hot: true },
    { value: recentCount, label: '최근 52주 제출' },
    { value: top3, label: '트랙 TOP 3' },
    { value: votes.toLocaleString('ko-KR'), label: '받은 투표' },
  ]

  const badges: { big: number; unit: string; ring: string; name: string; desc: string; tone: StampTone }[] = [
    { big: streak, unit: 'WEEKS', ring: 'WEEK STREAK · 연속 제출 · ', name: `연속 ${streak}주`, desc: streak ? '쉬지 않고 제출 중' : '이번 주부터 다시 시작해요', tone: 'signal' },
    { big: top3, unit: 'TIMES', ring: 'TOP THREE FINISH · 트랙 시상대 · ', name: `시상대 ${top3}회`, desc: '트랙 TOP 3에 오른 횟수', tone: 'night' },
    { big: user.feedbacks.length, unit: 'NOTES', ring: 'FEEDBACK GIVER · 피드백 장인 · ', name: `피드백 ${user.feedbacks.length}개`, desc: '다른 사람 작업에 남긴 피드백', tone: 'sage' },
    { big: weeksTogether, unit: 'WEEKS', ring: 'BUILDING TOGETHER · 함께 만든 시간 · ', name: `함께한 ${weeksTogether}주`, desc: `${kstYearMonth(joined)}부터 참여`, tone: 'sky' },
  ]

  const works = entries.slice(0, 6)

  return (
    <>
      {/* 머리 + 통계 */}
      <section className="max-w-7xl mx-auto px-8 max-sm:px-4 pt-14 pb-18 flex flex-col gap-12">
        <div className="flex justify-between items-end flex-wrap gap-8">
          <div className="flex items-end flex-wrap gap-9">
            <Avatar handle={user.handle} size="xl" />
            <div className="flex flex-col gap-2.5">
              <span className="mono text-sm text-(--tt-muted)">
                @{user.handle} · {kstYearMonth(joined)}부터 참여
              </span>
              <h1 className="m-0 text-[clamp(56px,7.6vw,120px)] leading-none tracking-[-0.055em] font-bold">{user.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              label={following ? '팔로잉' : '팔로우하기'}
              aria-pressed={following}
              onClick={() => setFollowing(!following)}
            />
            {user.links.github && <Button variant="primary" href={user.links.github} target="_blank" rel="noreferrer" label="GitHub ↗" />}
            {user.links.blog && <Button variant="primary" href={user.links.blog} target="_blank" rel="noreferrer" label="블로그 ↗" />}
          </div>
        </div>

        <div className="flex justify-between items-end flex-wrap gap-5">
          <p className="m-0 max-w-155 text-xl leading-[1.65] text-(--tt-ink-soft)">{user.bio}</p>
          <span className="mono text-sm">
            팔로워 {user.followers + (following ? 1 : 0)} · 팔로잉 {user.following}
          </span>
        </div>

        <dl className="m-0 grid grid-cols-4 max-lg:grid-cols-2 border-y-(length:--tt-stroke-bold) border-(--tt-ink)">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col-reverse gap-1.5 py-7 px-6 border-(--tt-ink) ${i === 0 ? 'pl-0' : ''} ${
                i < 3 ? 'border-r-(length:--tt-stroke-bold)' : ''
              } max-lg:[&:nth-child(2)]:border-r-0 max-lg:[&:nth-child(3)]:pl-0 max-lg:[&:nth-child(-n+2)]:border-b-(length:--tt-stroke-bold)`}
            >
              <dt className="text-sm text-(--tt-muted)">{s.label}</dt>
              <dd className={`m-0 tt-numeral-l max-sm:text-[52px] ${s.hot ? 'text-(--tt-signal)' : ''}`}>
                {s.value}
                {s.unit && <span className="text-[0.5em] text-(--tt-ink)">{s.unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 52주 기록 */}
      <section className="max-w-7xl mx-auto px-8 max-sm:px-4 pb-28">
        <StreakGrid
          title="52주 기록"
          cells={cells}
          summary={`최근 52주 중 ${recentCount}주 제출, 트랙 TOP 3 ${top3}회, 현재 ${streak}주 연속 제출 중`}
          note={streak > 0 ? `현재 ${streak}주 연속 제출 중` : '연속 기록을 새로 시작할 차례예요'}
          from={cells[0].label.split(' · ')[0]}
          to={`${cells[51].label.split(' · ')[0]} (이번 주)`}
        />
      </section>

      {/* 배지 */}
      <section className="bg-(--tt-ground-sunk) border-y-(length:--tt-stroke-bold) border-(--tt-ink)">
        <div className="max-w-7xl mx-auto px-8 max-sm:px-4 pt-24 pb-26 flex flex-col gap-12">
          <h2 className={SECTION_TITLE}>모은 배지</h2>
          <div className="grid grid-cols-4 max-lg:grid-cols-2 gap-6">
            {badges.map((b) => (
              <StampBadge key={b.name} {...b} />
            ))}
          </div>
        </div>
      </section>

      {/* 제출작 / 피드백 */}
      <section className="max-w-7xl mx-auto px-8 max-sm:px-4 pt-26 pb-30 flex flex-col gap-10">
        <div className="flex justify-between items-end flex-wrap gap-5">
          <h2 className={SECTION_TITLE}>{tab === 'works' ? '최근 만든 것들' : '남긴 피드백'}</h2>
          <Tabs
            label="보기 전환"
            options={[
              { value: 'works', label: `제출작 ${entries.length}` },
              { value: 'acts', label: '피드백 활동' },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        {tab === 'acts' ? (
          <FeedbackList feedbacks={user.feedbacks} now={now} />
        ) : works.length === 0 ? (
          <p className="m-0 py-16 text-center text-(--tt-muted)">아직 제출작이 없어요. 이번 주 주제로 첫 작품을 올려 보세요.</p>
        ) : (
          <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6">
            {works.map((e, i) => {
              const week = weekOf(e.weekId)
              const track = trackLabels[e.track]
              return (
                <ProjectCard
                  key={e.weekId}
                  href={e.submissionId ? `/p/${e.submissionId}` : `/w/${e.weekId}`}
                  title={e.title}
                  summary={`${week?.title ?? ''} 주제에 ${track} 트랙으로 냈어요.`}
                  handle={`${week?.code ?? ''} · ${week?.title ?? ''}`}
                  handleHref={`/w/${e.weekId}`}
                  trackLabel={track}
                  medal={
                    e.rank === null
                      ? { label: '이번 주' }
                      : e.rank <= 3
                        ? { label: `${track} ${e.rank}위`, gold: e.rank === 1 }
                        : undefined
                  }
                  thumb={{ tone: TONES[i % TONES.length], caption: week?.code ?? '' }}
                  vote={<span className="mono text-[13px]">▲ {e.votes}</span>}
                />
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}

export default ProfileView
