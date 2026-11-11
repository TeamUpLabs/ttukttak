import { useState, type FormEvent } from 'react'
import { Button, FEEDBACK_TYPE_LABELS, FeedbackTypeLabel, Tabs, type FeedbackType } from '../../../shared/ui'
import { timeAgo } from '../../../shared/lib/time.ts'
import type { SubmissionFeedback } from '../data.ts'

const MAX = 500
const TYPES = Object.keys(FEEDBACK_TYPE_LABELS) as FeedbackType[]
const TYPE_OPTIONS = TYPES.map((t) => ({ value: t, label: FEEDBACK_TYPE_LABELS[t] }))
const FILTERS = [{ value: 'all' as const, label: '전체' }, ...TYPE_OPTIONS]

type FeedbackSectionProps = {
  initial: SubmissionFeedback[]
  /** 로그인한 사람의 핸들. 없으면 작성 대신 로그인 안내. */
  viewer: string | null
  loginHref: string
  now: Date
}

/** 피드백: 종류 필터 · 작성 폼 · 카드 2열 */
function FeedbackSection({ initial, viewer, loginHref, now }: FeedbackSectionProps) {
  const [items, setItems] = useState(initial)
  const [filter, setFilter] = useState<FeedbackType | 'all'>('all')
  const [type, setType] = useState<FeedbackType>('ux')
  const [body, setBody] = useState('')
  const [helped, setHelped] = useState<string[]>([])

  const shown = filter === 'all' ? items : items.filter((f) => f.type === filter)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!viewer || !body.trim()) return
    // ponytail: 화면에만 추가돼요. Supabase 붙이면 feedback 테이블에 저장.
    setItems([
      { id: `mine-${Date.now()}`, handle: viewer, type, body: body.trim(), helpful: 0, replied: false, createdAt: new Date().toISOString(), mine: true },
      ...items,
    ])
    setBody('')
    setFilter('all')
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-end flex-wrap gap-5">
        <h2 className="m-0 text-[clamp(32px,3.6vw,52px)] leading-[1.1] tracking-[-0.045em] font-bold">
          피드백 <span className="tt-numeral-m text-[1em]">{items.length}</span>
        </h2>
        <Tabs label="피드백 종류 필터" options={FILTERS} value={filter} onChange={setFilter} />
      </div>

      {viewer ? (
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
              {body.length}/{MAX} · @{viewer}로 남겨요
            </span>
            <Button type="submit" variant={body.trim() ? 'secondary' : 'disabled'} label="피드백 남기기" hasArrow />
          </div>
        </form>
      ) : (
        <div className="flex justify-between items-center flex-wrap gap-4 p-6 rounded-(--tt-radius-lg) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface)">
          <p className="m-0 text-[15px]">로그인하면 피드백을 남길 수 있어요. 남긴 피드백은 내 프로필에도 쌓여요.</p>
          <Button variant="secondary" href={loginHref} label="로그인하고 남기기" hasArrow />
        </div>
      )}

      {shown.length === 0 ? (
        <p className="m-0 py-12 text-center text-(--tt-muted)">
          {items.length === 0 ? '아직 피드백이 없어요. 첫 피드백을 남겨 보세요.' : '이 종류 피드백은 아직 없어요.'}
        </p>
      ) : (
        <ul className="m-0 p-0 list-none grid grid-cols-2 max-sm:grid-cols-1 gap-5">
          {shown.map((f) => {
            const on = helped.includes(f.id)
            return (
              <li
                key={f.id}
                className={`flex flex-col gap-3.5 p-6 rounded-[20px] border-(length:--tt-stroke-bold) bg-(--tt-surface) transition-transform duration-(--tt-dur-lift) ease-(--tt-ease-lift) hover:-translate-y-1 ${
                  f.mine ? 'border-(--tt-signal) animate-[tt-fade-up_.6s_var(--tt-ease-snap)_both]' : 'border-(--tt-ink)'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <FeedbackTypeLabel type={f.type} />
                  <span className="mono text-xs text-(--tt-muted)">
                    <a href={`/@${f.handle}`}>@{f.handle}</a> · {timeAgo(Date.parse(f.createdAt), now)}
                  </span>
                </div>
                <p className="m-0 flex-1 leading-[1.7] text-(--tt-ink-soft)">{f.body}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="mono text-xs text-(--tt-muted)">{f.replied ? '만든 사람이 답했어요' : ''}</span>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setHelped(on ? helped.filter((id) => id !== f.id) : [...helped, f.id])}
                    className={`inline-flex items-center gap-1.5 min-h-11 px-3.5 rounded-full border text-[13px] font-medium cursor-pointer transition-colors duration-(--tt-dur-quick) ${
                      on ? 'border-(--tt-ink) bg-(--tt-ink) text-(--tt-ground)' : 'border-(--tt-muted) text-(--tt-ink-soft) hover:bg-(--tt-fill-quiet)'
                    }`}
                  >
                    도움돼요 {f.helpful + (on ? 1 : 0)}
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default FeedbackSection
