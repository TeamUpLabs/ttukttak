import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Avatar, Button, ProjectCard, StampBadge, StreakGrid, Tabs } from '../../../shared/ui'
import { useNow } from '../../../shared/hooks/useNow.ts'
import { kstMonthDay, kstYearMonth } from '../../../shared/lib/kst.ts'
import { ApiError } from '../../../api/client.ts'
import { usersApi, type UserResponse } from '../../../api/users.ts'
import type { Track } from '../../../api/weeks.ts'
import { BADGES, toCells, weekLabel } from '../profile.ts'
import { useBadges, useProfile, useProfileFeedback, useProfileSubmissions, useStreak } from '../useProfile.ts'
import FeedbackList from './FeedbackList.tsx'

const TRACK_LABELS: Record<Track, string> = { beginner: '입문', regular: '일반', expert: '고수' }
const SECTION_TITLE = 'm-0 text-[clamp(32px,3.6vw,52px)] leading-[1.1] tracking-[-0.045em] font-bold'

/** 프로필 전체: 머리 · 통계 · 52주 기록 · 배지 · 제출작/피드백 */
function ProfileView({ handle }: { handle: string }) {
  const now = useNow(60_000)
  const [tab, setTab] = useState<'works' | 'acts'>('works')
  const { data: profile, isPending } = useProfile(handle)
  const { data: streak } = useStreak(handle)
  const { data: badges } = useBadges(handle)
  const { data: works } = useProfileSubmissions(handle)
  const { data: acts } = useProfileFeedback(handle, tab === 'acts')

  if (isPending) return null
  if (!profile) {
    return (
      <section className="max-w-7xl mx-auto px-8 max-sm:px-4 py-30 flex flex-col items-start gap-6">
        <h1 className="m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold">@{handle}님을 찾을 수 없어요.</h1>
        <Button variant="secondary" href="/" label="이번 주 주제 보러 가기" hasArrow />
      </section>
    )
  }

  const { user, stats } = profile
  const joined = new Date(user.joinedAt)
  const first = streak?.weeks[0]
  const last = streak?.weeks.at(-1)

  const tiles = [
    { value: stats.currentStreak, unit: '주', label: '현재 연속 제출', hot: true },
    { value: stats.submissionsLast52, label: '최근 52주 제출' },
    { value: stats.top3Count, label: '트랙 TOP 3' },
    { value: stats.votesReceived.toLocaleString('ko-KR'), label: '받은 투표' },
  ]

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
            {!profile.viewer?.isSelf && <FollowButton key={user.id} handle={user.handle} profile={profile} />}
            {user.links.github && <Button variant="primary" href={user.links.github} target="_blank" rel="noreferrer" label="GitHub ↗" />}
            {user.links.blog && <Button variant="primary" href={user.links.blog} target="_blank" rel="noreferrer" label="블로그 ↗" />}
          </div>
        </div>

        <div className="flex justify-between items-end flex-wrap gap-5">
          <p className="m-0 max-w-155 text-xl leading-[1.65] text-(--tt-ink-soft)">{user.bio}</p>
          <span className="mono text-sm">
            팔로워 {profile.social.followers} · 팔로잉 {profile.social.following}
          </span>
        </div>

        <dl className="m-0 grid grid-cols-4 max-lg:grid-cols-2 border-y-(length:--tt-stroke-bold) border-(--tt-ink)">
          {tiles.map((s, i) => (
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
      {streak && (
        <section className="max-w-7xl mx-auto px-8 max-sm:px-4 pb-28">
          <StreakGrid
            title="52주 기록"
            cells={toCells(streak.weeks)}
            summary={`최근 52주 중 ${stats.submissionsLast52}주 제출, 트랙 TOP 3 ${stats.top3Count}회, 현재 ${streak.current.length}주 연속 제출 중`}
            note={streak.current.length > 0 ? `현재 ${streak.current.length}주 연속 제출 중 · 최고 ${stats.bestStreak}주` : '연속 기록을 새로 시작할 차례예요'}
            from={first ? weekLabel(first) : ''}
            to={last ? `${weekLabel(last)} (이번 주)` : ''}
          />
        </section>
      )}

      {/* 배지 */}
      {badges && (
        <section className="bg-(--tt-ground-sunk) border-y-(length:--tt-stroke-bold) border-(--tt-ink)">
          <div className="max-w-7xl mx-auto px-8 max-sm:px-4 pt-24 pb-26 flex flex-col gap-12">
            <h2 className={SECTION_TITLE}>모은 배지</h2>
            {badges.items.length === 0 ? (
              <p className="m-0 text-(--tt-ink-soft)">아직 받은 배지가 없어요. 3주 연속 제출하거나 피드백을 10개 남기면 첫 배지를 받아요.</p>
            ) : (
              <div className="grid grid-cols-4 max-lg:grid-cols-2 gap-6">
                {badges.items.map((b) => (
                  <StampBadge
                    key={b.id}
                    big={b.value}
                    unit={b.unit}
                    ring={BADGES[b.kind].ring}
                    name={BADGES[b.kind].name(b.value)}
                    desc={`${BADGES[b.kind].desc} · ${kstMonthDay(new Date(b.earnedAt))}`}
                    tone={BADGES[b.kind].tone}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 제출작 / 피드백 */}
      <section className="max-w-7xl mx-auto px-8 max-sm:px-4 pt-26 pb-30 flex flex-col gap-10">
        <div className="flex justify-between items-end flex-wrap gap-5">
          <h2 className={SECTION_TITLE}>{tab === 'works' ? '최근 만든 것들' : '남긴 피드백'}</h2>
          <Tabs
            label="보기 전환"
            options={[
              { value: 'works', label: '제출작' },
              { value: 'acts', label: `피드백 활동 ${stats.feedbackGiven}` },
            ]}
            value={tab}
            onChange={setTab}
          />
        </div>

        {tab === 'acts' ? (
          acts && <FeedbackList feedbacks={acts.items} now={now} />
        ) : !works ? null : works.items.length === 0 ? (
          <p className="m-0 py-16 text-center text-(--tt-muted)">아직 제출작이 없어요. 이번 주 주제로 첫 작품을 올려 보세요.</p>
        ) : (
          <div className="grid grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-6">
            {works.items.map((s) => {
              const track = TRACK_LABELS[s.track]
              return (
                <ProjectCard
                  key={s.id}
                  href={`/p/${s.id}`}
                  title={s.title}
                  summary={s.summary}
                  handle={`${s.week.code} · ${s.week.title ?? ''}`}
                  handleHref={`/w/${s.weekId}`}
                  trackLabel={track}
                  medal={s.medal ? { label: `${TRACK_LABELS[s.medal.track]} ${s.medal.rank}위`, gold: s.medal.rank === 1 } : undefined}
                  thumb={{ tone: s.thumbnail.tint, caption: s.thumbnail.caption }}
                  vote={<span className="mono text-[13px]">▲ {s.voteCount}</span>}
                />
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}

/** 비로그인이거나 세션이 끝났으면(401) 로그인으로 보내요. */
function FollowButton({ handle, profile }: { handle: string; profile: UserResponse }) {
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const goLogin = () => window.location.assign(`/login?next=${encodeURIComponent(`/@${handle}`)}`)
  const follow = useMutation({
    mutationFn: (on: boolean) => (on ? usersApi.follow(handle) : usersApi.unfollow(handle)),
    onMutate: () => setError(null),
    // 팔로워 수와 버튼 상태를 응답 값으로 맞춰요.
    onSuccess: (res) =>
      queryClient.setQueryData<UserResponse>(['users', handle], (p) => p && {
        ...p,
        social: { ...p.social, followers: res.followers },
        viewer: p.viewer && { ...p.viewer, following: res.following },
      }),
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401) return goLogin()
      setError(e instanceof ApiError && e.status < 500 ? e.message : '잠시 후 다시 시도해 주세요.')
    },
  })
  const following = !!profile.viewer?.following

  return (
    <span className="inline-flex items-center gap-3">
      <Button
        variant={follow.isPending ? 'disabled' : 'secondary'}
        label={following ? '팔로잉' : '팔로우하기'}
        aria-pressed={following}
        onClick={() => (profile.viewer ? follow.mutate(!following) : goLogin())}
      />
      {error && <span role="alert" className="text-[13px] text-(--tt-ink-soft)">{error}</span>}
    </span>
  )
}

export default ProfileView
