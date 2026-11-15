import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, FEEDBACK_TYPE_LABELS, FeedbackTypeLabel, Tabs, type FeedbackType } from '../../../shared/ui'
import { timeAgo } from '../../../shared/lib/time.ts'
import { ApiError } from '../../../api/client.ts'
import { feedbackApi, type FeedbackItem, type FeedbackListResponse } from '../../../api/feedback.ts'

const MAX = 500
const MIN = 10
const REPLY_MAX = 300
const TYPES = Object.keys(FEEDBACK_TYPE_LABELS) as FeedbackType[]
const TYPE_OPTIONS = TYPES.map((t) => ({ value: t, label: FEEDBACK_TYPE_LABELS[t] }))

type FeedbackSectionProps = {
  submissionId: string
  /** 로그인한 사람의 핸들. 없으면 작성 대신 로그인 안내. */
  viewer: string | null
  /** 내 제출작이면 작성 대신 답글을 달아요. */
  isOwner: boolean
  loginHref: string
  now: Date
}

/** 카드의 viewer는 받아 온 때 값이라, 로그아웃·세션 만료는 401로 알아요. */
function goLogin(loginHref: string, e?: unknown) {
  if (e === undefined || (e instanceof ApiError && e.status === 401)) {
    window.location.assign(loginHref)
    return true
  }
  return false
}

const messageOf = (e: unknown) => (e instanceof ApiError && e.status < 500 ? e.message : '잠시 후 다시 시도해 주세요.')

/** 피드백: 종류 필터 · 작성 폼 · 카드 2열 */
// ponytail: 도움순 50개까지만 받아요. 한 제출작에 50개를 넘기면 nextCursor로 더 보기를 붙여요.
function FeedbackSection({ submissionId, viewer, isOwner, loginHref, now }: FeedbackSectionProps) {
  const [filter, setFilter] = useState<FeedbackType | 'all'>('all')
  const [type, setType] = useState<FeedbackType>('ux')
  const [body, setBody] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { data, error, refetch, isFetching } = useQuery({
    queryKey: ['feedback', submissionId, { type: filter }],
    queryFn: () => feedbackApi.list(submissionId, { limit: 50, ...(filter === 'all' ? {} : { type: filter }) }),
  })
  // 목록·탭 숫자, 상세의 피드백 수, 내 포인트가 바뀌어요.
  const refresh = () => {
    for (const queryKey of [['feedback', submissionId], ['submission', submissionId], ['me']]) queryClient.invalidateQueries({ queryKey })
  }
  const create = useMutation({
    mutationFn: () => feedbackApi.create(submissionId, { type, body: body.trim() }),
    onSuccess: (res) => {
      setBody('')
      setFilter('all')
      setNotice(res.pointsEarned > 0 ? `남겼어요. 노출 포인트 ${res.pointsEarned}점이 쌓였어요.` : '남겼어요.')
      refresh()
    },
    onError: (e) => goLogin(loginHref, e),
  })

  const counts = data?.counts
  const filters = [
    { value: 'all' as const, label: `전체 ${counts?.all ?? ''}`.trim() },
    ...TYPE_OPTIONS.map((o) => ({ ...o, label: `${o.label} ${counts?.[o.value] ?? ''}`.trim() })),
  ]
  const items = data?.items ?? []
  const ready = body.trim().length >= MIN

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!viewer) return void goLogin(loginHref)
    if (ready && !create.isPending) create.mutate()
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-end flex-wrap gap-5">
        <h2 className="m-0 text-[clamp(32px,3.6vw,52px)] leading-[1.1] tracking-[-0.045em] font-bold">
          피드백 {counts && <span className="tt-numeral-m text-[1em]">{counts.all}</span>}
        </h2>
        <Tabs label="피드백 종류 필터" options={filters} value={filter} onChange={setFilter} />
      </div>

      {!viewer ? (
        <div className="flex justify-between items-center flex-wrap gap-4 p-6 rounded-(--tt-radius-lg) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface)">
          <p className="m-0 text-[15px]">로그인하면 피드백을 남길 수 있어요. 남긴 피드백은 내 프로필에도 쌓여요.</p>
          <Button variant="secondary" href={loginHref} label="로그인하고 남기기" hasArrow />
        </div>
      ) : isOwner ? (
        <p className="m-0 p-6 rounded-(--tt-radius-lg) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) text-[15px]">
          내 제출작이에요. 받은 피드백에 답글을 달 수 있어요.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4 p-6 rounded-(--tt-radius-lg) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface)">
          <div className="flex items-center flex-wrap gap-3">
            <span className="text-[15px] font-medium">어떤 피드백인가요?</span>
            <Tabs label="피드백 종류 선택" options={TYPE_OPTIONS} value={type} onChange={setType} />
          </div>
          <label htmlFor="fb-body" className="sr-only">
            피드백 내용
          </label>
          <textarea
            id="fb-body"
            value={body}
            maxLength={MAX}
            onChange={(e) => setBody(e.target.value)}
            placeholder="써보고 느낀 점을 구체적으로 남겨주세요. 어디서, 무엇을 했을 때인지 적으면 더 도움돼요."
            className="w-full min-h-30 resize-y rounded-(--tt-radius-md) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) px-4.5 py-4 text-base leading-[1.6] focus:outline-none focus:shadow-[0_0_0_4px_var(--tt-focus)]"
          />
          <div className="flex justify-between items-center flex-wrap gap-3">
            <span className="mono text-xs text-(--tt-muted)">
              {body.length}/{MAX} · {MIN}자 이상 · @{viewer}로 남겨요
            </span>
            <Button type="submit" variant={ready && !create.isPending ? 'secondary' : 'disabled'} label={create.isPending ? '남기는 중' : '피드백 남기기'} hasArrow />
          </div>
          {create.error && !(create.error instanceof ApiError && create.error.status === 401) && (
            <p role="alert" className="m-0 text-[15px]">{messageOf(create.error)}</p>
          )}
          {notice && !create.error && <p role="status" className="m-0 text-[15px] text-(--tt-ink-soft)">{notice}</p>}
        </form>
      )}

      {!data && error ? (
        <div role="alert" className="flex flex-col items-center gap-4 py-12 text-center">
          <p className="m-0 text-(--tt-ink-soft)">피드백을 불러오지 못했어요. {messageOf(error)}</p>
          <Button variant={isFetching ? 'disabled' : 'secondary'} label={isFetching ? '불러오는 중' : '다시 불러오기'} onClick={() => refetch()} />
        </div>
      ) : !data ? null : items.length === 0 ? (
        <p className="m-0 py-12 text-center text-(--tt-muted)">
          {filter === 'all' ? '아직 피드백이 없어요. 첫 피드백을 남겨 보세요.' : '이 종류 피드백은 아직 없어요.'}
        </p>
      ) : (
        <ul className="m-0 p-0 list-none grid grid-cols-2 max-sm:grid-cols-1 gap-5">
          {items.map((f) => (
            <FeedbackCard key={f.id} f={f} viewer={viewer} isOwner={isOwner} loginHref={loginHref} now={now} onChange={refresh} />
          ))}
        </ul>
      )}
    </div>
  )
}

type FeedbackCardProps = {
  f: FeedbackItem
  viewer: string | null
  isOwner: boolean
  loginHref: string
  now: Date
  /** 지우거나 답글이 바뀌면 목록을 다시 받아요. */
  onChange: () => void
}

function FeedbackCard({ f, viewer, isOwner, loginHref, now, onChange }: FeedbackCardProps) {
  const mine = !!f.viewer?.isAuthor
  // 도움돼요는 바로 바꿔 보여주고, 서버 값으로 맞추거나 실패하면 되돌려요.
  const [helpful, setHelpful] = useState({ on: f.viewer?.helpful ?? false, count: f.helpfulCount })
  const [confirming, setConfirming] = useState(false)
  const [replyDraft, setReplyDraft] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const fail = (e: unknown) => {
    if (!goLogin(loginHref, e)) setError(messageOf(e))
  }

  const toggleHelpful = useMutation({
    mutationFn: (on: boolean) => (on ? feedbackApi.markHelpful(f.id) : feedbackApi.unmarkHelpful(f.id)),
    onMutate: (on) => {
      const before = helpful
      setError(null)
      setHelpful({ on, count: helpful.count + (on ? 1 : -1) })
      return before
    },
    onSuccess: (res) => {
      setHelpful({ on: res.helpful, count: res.helpfulCount })
      // 다른 종류 탭의 캐시에도 같은 피드백이 있어요. 다시 받으면 도움순이 바뀌어 카드가 움직이니 값만 고쳐 넣어요.
      queryClient.setQueriesData<FeedbackListResponse>({ queryKey: ['feedback'] }, (list) => list && {
        ...list,
        items: list.items.map((x) => x.id === f.id
          ? { ...x, helpfulCount: res.helpfulCount, viewer: x.viewer && { ...x.viewer, helpful: res.helpful } }
          : x),
      })
    },
    onError: (e, _on, before) => {
      if (before) setHelpful(before)
      fail(e)
    },
  })
  const remove = useMutation({ mutationFn: () => feedbackApi.remove(f.id), onSuccess: onChange, onError: fail })
  const reply = useMutation({
    mutationFn: (body: string | null) => (body === null ? feedbackApi.deleteReply(f.id) : feedbackApi.reply(f.id, body)),
    onSuccess: () => {
      setReplyDraft(null)
      onChange()
    },
    onError: fail,
  })

  function onHelpful() {
    if (!viewer) return void goLogin(loginHref)
    if (!toggleHelpful.isPending) toggleHelpful.mutate(!helpful.on)
  }

  function onRemove() {
    // 두 번 눌러야 지워져요.
    if (!confirming) return setConfirming(true)
    remove.mutate()
  }

  function onReply(e: FormEvent) {
    e.preventDefault()
    if (replyDraft?.trim()) reply.mutate(replyDraft.trim())
  }

  return (
    <li
      className={`flex flex-col gap-3.5 p-6 rounded-[20px] border-(length:--tt-stroke-bold) bg-(--tt-surface) transition-transform duration-(--tt-dur-lift) ease-(--tt-ease-lift) hover:-translate-y-1 ${
        mine ? 'border-(--tt-signal)' : 'border-(--tt-ink)'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <FeedbackTypeLabel type={f.type} />
        <span className="mono text-xs text-(--tt-muted)">
          <a href={`/@${f.author.handle}`}>@{f.author.handle}</a> · {timeAgo(Date.parse(f.createdAt), now)}
        </span>
      </div>
      <p className="m-0 flex-1 leading-[1.7] text-(--tt-ink-soft)">{f.body}</p>

      {f.reply && replyDraft === null && (
        <div className="flex flex-col gap-1.5 px-4 py-3 rounded-(--tt-radius-md) bg-(--tt-ground-sunk)">
          <span className="mono text-xs text-(--tt-muted)">만든 사람의 답글 · {timeAgo(Date.parse(f.reply.createdAt), now)}</span>
          <p className="m-0 text-[15px] leading-[1.6]">{f.reply.body}</p>
        </div>
      )}

      {isOwner && replyDraft !== null && (
        <form onSubmit={onReply} className="flex flex-col gap-2">
          <label htmlFor={`reply-${f.id}`} className="sr-only">답글</label>
          <textarea
            id={`reply-${f.id}`}
            value={replyDraft}
            maxLength={REPLY_MAX}
            onChange={(e) => setReplyDraft(e.target.value)}
            placeholder="고친 점이나 고마운 마음을 짧게 남겨요"
            className="w-full min-h-20 resize-y rounded-(--tt-radius-md) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) px-4 py-3 text-[15px] leading-[1.6] focus:outline-none focus:shadow-[0_0_0_4px_var(--tt-focus)]"
          />
          <div className="flex justify-between items-center gap-2">
            <span className="mono text-xs text-(--tt-muted)">{replyDraft.length}/{REPLY_MAX}</span>
            <span className="flex gap-2">
              <Button variant="primary" label="그만두기" onClick={() => setReplyDraft(null)} />
              <Button type="submit" variant={replyDraft.trim() && !reply.isPending ? 'secondary' : 'disabled'} label="답글 달기" />
            </span>
          </div>
        </form>
      )}

      {error && <p role="alert" className="m-0 text-[13px] text-(--tt-ink-soft)">{error}</p>}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="flex flex-wrap gap-1">
          {mine && (
            <SmallButton onClick={onRemove} disabled={remove.isPending}>
              {confirming ? '한 번 더 누르면 지워요' : '지우기'}
            </SmallButton>
          )}
          {isOwner && replyDraft === null && (
            <SmallButton onClick={() => setReplyDraft(f.reply?.body ?? '')}>{f.reply ? '답글 고치기' : '답글 달기'}</SmallButton>
          )}
          {isOwner && f.reply && replyDraft === null && (
            <SmallButton onClick={() => reply.mutate(null)} disabled={reply.isPending}>답글 지우기</SmallButton>
          )}
        </span>
        <button
          type="button"
          aria-pressed={helpful.on}
          onClick={onHelpful}
          disabled={mine}
          className={`inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-full border text-[13px] font-medium cursor-pointer transition-colors duration-(--tt-dur-quick) disabled:pointer-events-none disabled:border-transparent ${
            helpful.on ? 'border-(--tt-ink) bg-(--tt-ink) text-(--tt-ground)' : 'border-(--tt-muted) text-(--tt-ink-soft) hover:bg-(--tt-fill-quiet)'
          }`}
        >
          도움돼요 {helpful.count}
        </button>
      </div>
    </li>
  )
}

function SmallButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="min-h-11 px-2 text-[13px] text-(--tt-muted) underline underline-offset-2 cursor-pointer hover:text-(--tt-ink) disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export default FeedbackSection
