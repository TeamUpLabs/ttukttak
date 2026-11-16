import { useState, type FormEvent, type ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button } from '../../../shared/ui'
import { ApiError } from '../../../api/client.ts'
import { themeSuggestionsApi } from '../../../api/themeSuggestions.ts'

const LIMITS = { title: 30, constraint: 80, why: 300 }
const INPUT =
  'w-full min-h-14 px-4.5 rounded-(--tt-radius-md) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) text-base placeholder:text-(--tt-muted) transition-shadow focus:outline-none focus:shadow-[0_0_0_4px_var(--tt-focus)]'
const EMPTY = { title: '', constraint: '', why: '' }

/** 주제 제안: 주제 · 제약 · 이유. 시즌 후반 주제 투표 후보가 돼요. */
function SuggestForm({ loginHref }: { loginHref: string }) {
  const [v, setV] = useState(EMPTY)
  const [done, setDone] = useState<string | null>(null)
  const save = useMutation({
    mutationFn: () => themeSuggestionsApi.suggest({ title: v.title.trim(), constraint: v.constraint.trim(), why: v.why.trim() }),
    onSuccess: (res) => {
      setDone(res.title)
      setV(EMPTY)
      window.scrollTo(0, 0)
    },
    // 세션이 끝났으면 로그인으로 보내요.
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401) window.location.assign(loginHref)
    },
  })
  const error = save.error instanceof ApiError ? save.error : save.error && new ApiError(0, null)
  const ready = v.title.trim() !== '' && v.constraint.trim() !== ''

  function submit(e: FormEvent) {
    e.preventDefault()
    if (ready && !save.isPending) save.mutate()
  }

  if (done) {
    return (
      <div className="flex flex-col items-start gap-6 max-w-200">
        <span className="mono text-[13px] text-(--tt-muted)">주제 제안 · 받았어요</span>
        <h1 className="m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold">「{done}」 제안했어요.</h1>
        <p className="m-0 text-xl leading-[1.65] text-(--tt-ink-soft)">시즌 후반 주제 투표 후보로 올라가요. 떠오르는 게 더 있으면 얼마든지 남겨 주세요.</p>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" label="하나 더 제안하기" onClick={() => setDone(null)} />
          <Button variant="primary" href="/" label="이번 주 주제 보러 가기" />
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate aria-label="주제 제안 양식" className="flex flex-col gap-8 max-w-200">
      <div className="flex flex-col gap-4">
        <span className="mono text-[13px] text-(--tt-muted)">주제 제안하기</span>
        <h1 className="m-0 text-[clamp(40px,6vw,88px)] leading-[1.05] tracking-[-0.045em] font-bold">다음엔 뭘 만들어 볼까요?</h1>
        <p className="m-0 text-xl leading-[1.65] text-(--tt-ink-soft)">주제 하나와 제약 하나면 돼요. 72시간 안에 끝낼 수 있을 만큼 작게요.</p>
      </div>

      <Field id="s-title" label="주제" count={`${v.title.length} / ${LIMITS.title}`} error={error?.fields.title}>
        <input id="s-title" value={v.title} maxLength={LIMITS.title} onChange={(e) => setV({ ...v, title: e.target.value })} placeholder="예: 버튼이 딱 하나뿐인 앱" autoComplete="off" className={INPUT} />
      </Field>
      <Field id="s-constraint" label="제약" count={`${v.constraint.length} / ${LIMITS.constraint}`} error={error?.fields.constraint}>
        <input id="s-constraint" value={v.constraint} maxLength={LIMITS.constraint} onChange={(e) => setV({ ...v, constraint: e.target.value })} placeholder="예: 화면에 버튼은 하나만, 다른 입력은 없음" autoComplete="off" className={INPUT} />
      </Field>
      <Field id="s-why" label="왜 이 주제인가요? (선택)" count={`${v.why.length} / ${LIMITS.why}`} error={error?.fields.why}>
        <textarea id="s-why" value={v.why} maxLength={LIMITS.why} onChange={(e) => setV({ ...v, why: e.target.value })} placeholder="이 제약이 어떤 고민을 하게 만드는지" className={`${INPUT} min-h-30 py-3.5 leading-[1.6] resize-y`} />
      </Field>

      {error && error.status !== 401 && Object.keys(error.fields).length === 0 && (
        <p role="alert" className="m-0 text-[15px]">{error.status < 500 && error.status > 0 ? error.message : '잠시 후 다시 시도해 주세요.'}</p>
      )}
      <div>
        <Button type="submit" variant={ready && !save.isPending ? 'secondary' : 'disabled'} label={save.isPending ? '보내는 중' : '제안하기'} hasArrow />
      </div>
    </form>
  )
}

function Field({ id, label, count, error, children }: { id: string; label: string; count: string; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline gap-3">
        <label htmlFor={id} className="text-[15px] font-bold">{label}</label>
        <span className="mono text-xs text-(--tt-muted)">{count}</span>
      </div>
      {children}
      {error && <span role="alert" className="text-[13px]">{error}</span>}
    </div>
  )
}

export default SuggestForm
