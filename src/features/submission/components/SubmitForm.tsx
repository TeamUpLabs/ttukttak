import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react'
import { Countdown, LiveDot, ProjectCard, Tabs, type ThumbTone } from '../../../shared/ui'
import { kstDayTime } from '../../../shared/lib/kst.ts'
import { TRACK_LABELS, type Track } from '../data.ts'
import { addStack, imageError, isDemoUrl, isRepoUrl, LIMITS, readiness, type SubmitValues } from '../submitForm.ts'

const TRACKS: { value: Track; desc: string }[] = [
  { value: 'beginner', desc: '처음 참가하거나, 하루 안에 끝낼 작고 단단한 것' },
  { value: 'regular', desc: '평소 실력으로 72시간을 꽉 채운 결과물' },
  { value: 'expert', desc: '실시간, 센서, 복잡한 구조에 도전하는 결과물' },
]
const SWATCHES: { tone: ThumbTone; name: string; className: string }[] = [
  { tone: 'sage', name: '세이지', className: 'bg-(--tt-tint-sage)' },
  { tone: 'sky', name: '스카이', className: 'bg-(--tt-tint-sky)' },
  { tone: 'sand', name: '샌드', className: 'bg-(--tt-tint-sand)' },
  { tone: 'butter', name: '버터', className: 'bg-(--tt-tint-butter)' },
  { tone: 'night', name: '나이트', className: 'bg-(--tt-night)' },
  { tone: 'signal', name: '시그널', className: 'bg-(--tt-signal)' },
]
const MODES = [
  { value: 'image' as const, label: '스크린샷 올리기' },
  { value: 'key' as const, label: '키캡 썸네일 만들기' },
]
const SUGGESTIONS = ['React', 'Svelte', 'Vue', 'Supabase', 'WebSocket', 'Canvas', 'Web Audio']
const STORY = [
  { key: 'what', label: '무엇을', placeholder: '주제를 어떻게 해석했나요?' },
  { key: 'how', label: '어떻게', placeholder: '가장 공들인 부분이나 기술적인 선택' },
  { key: 'retro', label: '회고', placeholder: '어려웠던 점, 다음에 해보고 싶은 것' },
] as const

const INPUT =
  'w-full min-h-14 px-4.5 rounded-(--tt-radius-md) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) text-base placeholder:text-(--tt-muted) transition-shadow focus:outline-none focus:shadow-[0_0_0_4px_var(--tt-focus)]'
const TEXTAREA = `${INPUT} min-h-24 py-3.5 leading-[1.6] resize-y`
const BAD = 'border-2 border-(--tt-signal)'

type SubmitFormProps = {
  week: { code: string; title: string; rule: string | null }
  deadline: Date
  now: Date
  /** 이번 주 지금까지 제출한 사람 수 */
  submittedCount: number
  viewer: string
  /** 이번 제출 전까지의 연속 제출 주 수 */
  streakBefore: number
}

/** 결과물 제출: 마감 띠 · 7단계 폼 · 실시간 카드 미리보기와 준비 체크 · 완료 화면 */
function SubmitForm({ week, deadline, now, submittedCount, viewer, streakBefore }: SubmitFormProps) {
  const [v, setV] = useState<SubmitValues>({
    track: 'regular', title: '', summary: '', demoUrl: '', repoUrl: '',
    thumbMode: 'key', image: null, tone: 'sky', caption: '',
    stack: [], story: { what: '', how: '', retro: '' }, okRule: false, okOpen: false,
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [imageName, setImageName] = useState('')
  const [imageProblem, setImageProblem] = useState<string | null>(null)
  const [stackDraft, setStackDraft] = useState('')
  const [done, setDone] = useState(false)

  const set = <K extends keyof SubmitValues>(key: K, value: SubmitValues[K]) => setV({ ...v, [key]: value })
  const checks = readiness(v)
  const doneCount = checks.filter((c) => c.ok).length
  const ready = doneCount === checks.length
  const deadlineLabel = kstDayTime(deadline)
  const rule = week.rule ?? '이번 주 주제 제약'

  function pickImage(file: File | undefined) {
    if (!file) return
    const problem = imageError(file)
    setImageProblem(problem)
    if (problem) return
    // 이전 미리보기 주소는 돌려줘요. (effect 정리로 하면 StrictMode에서 지금 보이는 미리보기까지 해제돼요)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(URL.createObjectURL(file))
    setImageName(file.name)
    set('image', { type: file.type, size: file.size })
  }

  function onStackKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return // 한글 조합 중 엔터는 무시
    e.preventDefault()
    set('stack', addStack(v.stack, stackDraft))
    setStackDraft('')
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!ready) return
    // ponytail: 저장소가 없어서 화면에만 반영해요. Supabase 붙이면 submissions 테이블 + Storage에 썸네일 업로드.
    setDone(true)
    window.scrollTo(0, 0)
  }

  const card = (
    <ProjectCard
      title={v.title.trim() || '제목을 입력하세요'}
      summary={v.summary.trim() || '한 줄 소개가 여기에 보여요.'}
      placeholder={{ title: !v.title.trim(), summary: !v.summary.trim() }}
      handle={`@${viewer}`}
      trackLabel={TRACK_LABELS[v.track]}
      thumb={{
        tone: v.tone,
        caption: v.caption.trim() || 'CAPTION',
        image: v.thumbMode === 'image' && preview ? preview : undefined,
      }}
      vote={v.stack.length > 0 && <span className="mono text-xs text-(--tt-muted)">{v.stack.join(' · ')}</span>}
    />
  )

  if (done) {
    const filled = Math.min(streakBefore, 7)
    return (
      <div className="grid grid-cols-[minmax(0,7fr)_minmax(0,5fr)] max-lg:grid-cols-1 gap-16 items-center pt-6">
        <div className="flex flex-col gap-7">
          <span className="mono flex items-center gap-2.5 text-[13px] text-(--tt-muted) tt-fade">
            <LiveDot />
            {week.code} · 제출 완료
          </span>
          <h1 className="m-0 text-[clamp(56px,8vw,120px)] leading-none tracking-[-0.055em] font-bold">
            <span className="tt-line"><span className="tt-line__in">제출했어요.</span></span>
          </h1>
          <p className="m-0 max-w-150 text-xl leading-[1.65] text-(--tt-ink-soft) tt-fade">
            투표는 {deadlineLabel}부터 열려요. 그 전까지는 언제든 고칠 수 있고, 다른 사람의 제출작에 피드백을 남기면 다음 주 노출 포인트가 쌓여요.
          </p>
          <div className="flex items-center flex-wrap gap-5 tt-fade">
            <div className="flex gap-2" aria-hidden="true">
              {Array.from({ length: filled }, (_, i) => (
                <span key={i} className="size-9 rounded-(--tt-radius-sm) bg-(--tt-ink) animate-[tt-cell_.45s_var(--tt-ease-lift)_both]" style={{ animationDelay: `${300 + i * 60}ms` }} />
              ))}
              <span className="size-9 rounded-(--tt-radius-sm) bg-(--tt-signal) border-(length:--tt-stroke-bold) border-(--tt-ink) animate-[tt-cell_.45s_var(--tt-ease-lift)_both]" style={{ animationDelay: `${300 + filled * 60 + 200}ms` }} />
            </div>
            <span>
              <strong className="tt-numeral-m text-[32px]">{streakBefore + 1}주</strong> 연속 제출이에요.
            </span>
          </div>
          <div className="flex flex-wrap gap-3 tt-fade">
            <a href="/#submit" className="inline-flex items-center min-h-12 px-5.5 rounded-full bg-(--tt-ink) text-(--tt-ground) font-medium no-underline transition-colors hover:bg-(--tt-signal) hover:text-(--tt-ink)">
              다른 제출작 구경하기 →
            </a>
            <button type="button" onClick={() => setDone(false)} className="min-h-12 px-5.5 rounded-full border-(length:--tt-stroke-bold) border-(--tt-ink) font-medium cursor-pointer transition-colors hover:bg-(--tt-ink) hover:text-(--tt-ground)">
              고치기
            </button>
          </div>
        </div>
        <div className="animate-[tt-drop_1s_var(--tt-ease-lift)_.25s_both]">{card}</div>
      </div>
    )
  }

  return (
    <>
      {/* 머리 + 마감 띠 */}
      <div className="flex flex-col gap-8 pb-12">
        <a href="/#theme" className="group mono inline-flex items-center gap-2 self-start text-[13px] text-(--tt-muted) no-underline hover:text-(--tt-ink)">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-1">
            <path d="M12 7H2M6 3 2 7l4 4" />
          </svg>
          이번 주 주제로
        </a>
        <div className="flex justify-between items-end flex-wrap gap-6">
          <div className="flex flex-col gap-3">
            <span className="mono text-[13px] text-(--tt-muted)">{week.code} · {week.title}</span>
            <h1 className="m-0 text-[clamp(48px,7vw,104px)] leading-none tracking-[-0.055em] font-bold">
              <span className="tt-line"><span className="tt-line__in">결과물 제출하기</span></span>
            </h1>
          </div>
          <p className="m-0 max-w-90 leading-[1.7] text-(--tt-ink-soft)">필수 항목만 채우면 바로 제출돼요. 마감 전까지는 몇 번이든 고칠 수 있어요.</p>
        </div>
        <div className="flex justify-between items-center flex-wrap gap-x-8 gap-y-4 px-7 max-sm:px-5 py-5 rounded-(--tt-radius-lg) bg-(--tt-night) text-(--tt-on-night)">
          <span className="flex items-center gap-2.5 text-[15px]">
            <LiveDot />
            제출 마감까지 · {deadlineLabel}
          </span>
          <Countdown size="compact" label={`제출 마감까지 · ${deadlineLabel}`} seconds={(deadline.getTime() - now.getTime()) / 1000} />
          <span className="mono text-[13px] text-(--tt-on-night-muted)">지금까지 {submittedCount}명 제출</span>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(0,7fr)_minmax(0,5fr)] max-lg:grid-cols-1 gap-16 items-start">
        <form id="submit-form" onSubmit={submit} aria-label="결과물 제출 양식" noValidate>
          <Block n="01">
            <fieldset className="m-0 p-0 border-0 flex flex-col gap-4.5 min-w-0">
              <legend className="mb-4.5 text-2xl tracking-[-0.035em] font-bold">어느 트랙으로 낼까요?</legend>
              <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-3">
                {TRACKS.map((t) => (
                  <label
                    key={t.value}
                    className="group relative flex flex-col gap-2.5 p-5 rounded-[20px] border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) cursor-pointer transition-[translate,box-shadow,background-color] duration-300 ease-(--tt-ease-lift) hover:-translate-y-1 hover:shadow-[4px_6px_0_var(--tt-ink)] has-checked:-translate-y-1 has-checked:bg-(--tt-ink) has-checked:text-(--tt-ground) has-checked:shadow-[4px_6px_0_var(--tt-signal)] has-focus-visible:shadow-[0_0_0_4px_var(--tt-focus)]"
                  >
                    <input type="radio" name="track" value={t.value} checked={v.track === t.value} onChange={() => set('track', t.value)} className="sr-only" />
                    <span className="flex justify-between items-center gap-2">
                      <strong className="text-lg">{TRACK_LABELS[t.value]}</strong>
                      <span aria-hidden="true" className="inline-flex items-center justify-center size-5.5 rounded-full border-(length:--tt-stroke-bold) border-current">
                        <span className="size-2.5 rounded-full bg-(--tt-signal) scale-0 transition-transform duration-300 ease-(--tt-ease-lift) group-has-checked:scale-100" />
                      </span>
                    </span>
                    <span className="text-sm leading-[1.55] text-(--tt-muted) transition-colors group-has-checked:text-(--tt-on-night-muted)">{t.desc}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Block>

          <Block n="02" title="무엇을 만들었나요?">
            <Field id="f-title" label="제목" count={`${v.title.length} / ${LIMITS.title}`}>
              <input id="f-title" value={v.title} maxLength={LIMITS.title} onChange={(e) => set('title', e.target.value)} placeholder="예: 오프라인 메모장" autoComplete="off" className={INPUT} />
            </Field>
            <Field id="f-sum" label="한 줄 소개" count={`${v.summary.length} / ${LIMITS.summary}`}>
              <textarea id="f-sum" value={v.summary} maxLength={LIMITS.summary} onChange={(e) => set('summary', e.target.value)} placeholder="처음 보는 사람이 10초 안에 이해할 수 있게 써주세요" className={TEXTAREA} />
            </Field>
          </Block>

          <Block n="03" title="어디서 볼 수 있나요?">
            <UrlField
              id="f-demo" label="데모 링크" placeholder="https://" value={v.demoUrl} onChange={(x) => set('demoUrl', x)} valid={isDemoUrl(v.demoUrl)}
              hint={{ idle: '로그인 없이 누구나 열 수 있는 https:// 주소', ok: '좋아요. 투표하는 사람들이 이 주소로 바로 들어가요.', bad: 'https://로 시작하는 주소여야 해요.' }}
            />
            <UrlField
              id="f-repo" label="GitHub 레포" placeholder="https://github.com/아이디/레포" value={v.repoUrl} onChange={(x) => set('repoUrl', x)} valid={isRepoUrl(v.repoUrl)}
              hint={{ idle: '공개 레포만 받아요.', ok: '좋아요. README가 있으면 상세 페이지에 함께 보여줘요.', bad: 'github.com/아이디/레포 형태의 주소여야 해요.' }}
            />
          </Block>

          <Block n="04" title="썸네일">
            <div className="self-start">
              <Tabs label="썸네일 방식" options={MODES} value={v.thumbMode} onChange={(m) => set('thumbMode', m)} />
            </div>
            {v.thumbMode === 'image' ? (
              <div className="flex flex-col gap-2">
                <label
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault()
                    pickImage(e.dataTransfer.files[0])
                  }}
                  className="group flex flex-col items-center justify-center gap-2.5 min-h-45 p-6 rounded-[20px] border-(length:--tt-stroke-bold) border-dashed border-(--tt-ink) bg-(--tt-surface) text-center cursor-pointer transition-colors hover:bg-(--tt-ground) has-focus-visible:shadow-[0_0_0_4px_var(--tt-focus)]"
                >
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => pickImage(e.target.files?.[0])} aria-describedby="h-image" className="sr-only" />
                  <span aria-hidden="true" className="flex items-center justify-center size-14 rounded-full bg-(--tt-signal) border-(length:--tt-stroke-bold) border-(--tt-ink) shadow-[0_6px_0_var(--tt-ink)] transition-[translate,box-shadow] duration-300 ease-(--tt-ease-lift) group-hover:translate-y-1.5 group-hover:shadow-none">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 16V5M6 10l5-5 5 5" />
                    </svg>
                  </span>
                  <strong className="text-base">{imageName ? `${imageName} · 다른 이미지로 바꾸기` : '이미지를 끌어다 놓거나 눌러서 고르기'}</strong>
                  <span className="text-[13px] text-(--tt-muted)">PNG, JPG, WEBP, GIF · 가로형 3:2 권장 · {LIMITS.imageMb}MB 이하</span>
                </label>
                <Hint id="h-image" state={imageProblem ? 'bad' : 'idle'}>{imageProblem ?? ''}</Hint>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[15px] font-bold">바탕색</span>
                  <div role="group" aria-label="키캡 바탕색" className="flex flex-wrap gap-2.5">
                    {SWATCHES.map((s) => (
                      <button
                        key={s.tone}
                        type="button"
                        aria-pressed={v.tone === s.tone}
                        aria-label={`${s.name} 바탕`}
                        onClick={() => set('tone', s.tone)}
                        className={`size-11 rounded-full border-(length:--tt-stroke-bold) border-(--tt-ink) cursor-pointer transition-[translate,box-shadow] duration-(--tt-dur-quick) ease-(--tt-ease-lift) hover:-translate-y-0.75 aria-pressed:-translate-y-0.75 aria-pressed:shadow-[0_0_0_3px_var(--tt-ground),0_0_0_5px_var(--tt-ink)] ${s.className}`}
                      />
                    ))}
                  </div>
                </div>
                <Field id="f-cap" label="캡션" count={`${v.caption.length} / ${LIMITS.caption}`} hint="썸네일 왼쪽 아래에 들어가요. 앱을 쓰는 동작 하나로 적으면 좋아요.">
                  <input id="f-cap" value={v.caption} maxLength={LIMITS.caption} onChange={(e) => set('caption', e.target.value)} placeholder="예: HOLD, TAP ×4" autoComplete="off" aria-describedby="f-cap-hint" className={`${INPUT} mono`} />
                </Field>
              </div>
            )}
          </Block>

          <Block n="05" title="무엇으로 만들었나요?" optional>
            {v.stack.length > 0 && (
              <ul aria-live="polite" className="m-0 p-0 list-none flex flex-wrap gap-2">
                {v.stack.map((s) => (
                  <li key={s} className="mono inline-flex items-center gap-1.5 min-h-9 pl-3.5 pr-1.5 rounded-full bg-(--tt-ink) text-(--tt-ground) text-[13px] animate-[tt-pop_.3s_var(--tt-ease-lift)_both]">
                    {s}
                    <button type="button" aria-label={`${s} 빼기`} onClick={() => set('stack', v.stack.filter((x) => x !== s))} className="inline-flex items-center justify-center size-6.5 rounded-full cursor-pointer hover:bg-(--tt-night-line)">
                      <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <path d="M2 2l6 6M8 2 2 8" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <label htmlFor="f-stack" className="sr-only">기술 스택 추가</label>
            <input
              id="f-stack"
              value={stackDraft}
              maxLength={LIMITS.stackItem}
              onChange={(e) => setStackDraft(e.target.value)}
              onKeyDown={onStackKey}
              disabled={v.stack.length >= LIMITS.stack}
              placeholder={v.stack.length >= LIMITS.stack ? `${LIMITS.stack}개까지 넣었어요` : `입력하고 엔터 (최대 ${LIMITS.stack}개)`}
              autoComplete="off"
              className={`${INPUT} disabled:bg-(--tt-fill-quiet)`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[13px] text-(--tt-muted) mr-1">자주 쓰는 것</span>
              {SUGGESTIONS.filter((s) => !v.stack.some((x) => x.toLowerCase() === s.toLowerCase())).slice(0, 6).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={v.stack.length >= LIMITS.stack}
                  onClick={() => set('stack', addStack(v.stack, s))}
                  className="mono min-h-9 px-3.5 rounded-full border border-dashed border-(--tt-ink) text-[13px] cursor-pointer transition-colors hover:bg-(--tt-fill-quiet) hover:border-solid disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  + {s}
                </button>
              ))}
            </div>
          </Block>

          <Block n="06" title="만든 이야기" optional>
            <details className="group">
              <summary className="list-none [&::-webkit-details-marker]:hidden flex justify-between items-center gap-3 min-h-14 px-5 rounded-(--tt-radius-md) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) font-medium cursor-pointer">
                세 줄로 남기면 상세 페이지에 실려요
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" className="transition-transform duration-300 ease-(--tt-ease-lift) group-open:rotate-45">
                  <path d="M8 3v10M3 8h10" />
                </svg>
              </summary>
              <div className="flex flex-col gap-5 pt-5 animate-[tt-fade-up_.5s_var(--tt-ease-snap)_both]">
                {STORY.map((s) => (
                  <Field key={s.key} id={`f-${s.key}`} label={s.label}>
                    <textarea
                      id={`f-${s.key}`}
                      value={v.story[s.key]}
                      maxLength={LIMITS.story}
                      onChange={(e) => set('story', { ...v.story, [s.key]: e.target.value })}
                      placeholder={s.placeholder}
                      className={TEXTAREA}
                    />
                  </Field>
                ))}
              </div>
            </details>
          </Block>

          <Block n="07" title="마지막 확인">
            <Confirm checked={v.okRule} onChange={(x) => set('okRule', x)} title={`${rule}, 지켰어요`} desc="이번 주 판정 기준이에요. 투표하는 사람들이 직접 확인해요." />
            <Confirm checked={v.okOpen} onChange={(x) => set('okOpen', x)} title="로그인 없이 데모를 써볼 수 있어요" desc="선택이지만, 바로 써볼 수 있으면 투표를 훨씬 많이 받아요." />
          </Block>
        </form>

        <aside aria-label="미리보기와 제출" className="flex flex-col gap-5 lg:sticky lg:top-24">
          <div className="mono flex justify-between text-xs text-(--tt-muted)">
            <span>미리보기 · 제출작 카드</span>
            <span>실시간 반영</span>
          </div>
          {card}

          <div className="flex flex-col gap-4 p-6 rounded-(--tt-radius-lg) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface)">
            <div className="flex justify-between items-baseline">
              <strong className="text-lg">제출 준비</strong>
              <span className="tt-numeral-m text-[32px]">
                {doneCount}<span className="text-[0.5em] text-(--tt-muted)"> / {checks.length}</span>
              </span>
            </div>
            <div role="progressbar" aria-label="제출 준비 진행률" aria-valuemin={0} aria-valuemax={checks.length} aria-valuenow={doneCount} className="h-2 rounded-full bg-(--tt-fill-quiet) overflow-hidden">
              <span className={`block h-full rounded-full transition-[width,background-color] duration-600 ease-(--tt-ease-wipe) ${ready ? 'bg-(--tt-signal)' : 'bg-(--tt-ink)'}`} style={{ width: `${(doneCount / checks.length) * 100}%` }} />
            </div>
            <ul className="m-0 p-0 list-none grid grid-cols-2 max-sm:grid-cols-1 gap-x-4 gap-y-2.5">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-3 text-[15px]">
                  <span className={`inline-flex items-center justify-center size-6 shrink-0 rounded-full border-(length:--tt-stroke-bold) transition-colors duration-300 ${c.ok ? 'bg-(--tt-ink) border-(--tt-ink)' : 'border-(--tt-muted)'}`}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="var(--tt-ground)" strokeWidth="2" aria-hidden="true" className={`transition-transform duration-400 ease-(--tt-ease-lift) ${c.ok ? 'scale-100' : 'scale-0'}`}>
                      <path d="m2.5 6 2.5 2.5 4.5-5" />
                    </svg>
                  </span>
                  <span className={c.ok ? 'text-(--tt-muted)' : ''}>{c.label}</span>
                  <span className="sr-only">{c.ok ? ' 완료' : ' 아직'}</span>
                </li>
              ))}
            </ul>
            <button
              type="submit"
              form="submit-form"
              disabled={!ready}
              className={`w-full min-h-16 rounded-full text-[17px] font-bold transition-[translate,box-shadow,background-color,color] duration-(--tt-dur-press) focus-visible:shadow-[0_0_0_4px_var(--tt-focus)] ${
                ready
                  ? 'bg-(--tt-signal) text-(--tt-ink) cursor-pointer shadow-(--tt-shadow-press) animate-[tt-breathe_2.2s_ease-in-out_infinite] active:translate-y-2.5 active:shadow-none active:animate-none'
                  : 'bg-(--tt-fill-quiet) text-(--tt-muted) cursor-not-allowed'
              }`}
            >
              {ready ? '제출하기' : `${checks.length - doneCount}개 남았어요`}
            </button>
            <span className="text-[13px] text-(--tt-muted) text-center">제출 후에도 마감({deadlineLabel}) 전까지 고칠 수 있어요.</span>
          </div>
        </aside>
      </div>
    </>
  )
}

function Block({ n, title, optional, children }: { n: string; title?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[72px_minmax(0,1fr)] max-sm:grid-cols-1 gap-4 max-sm:gap-3 py-9 max-sm:py-7 border-t-(length:--tt-stroke-bold) border-(--tt-ink)">
      <span className="mono text-[13px] text-(--tt-muted) pt-1.5">{n}</span>
      <div className="flex flex-col gap-4.5 min-w-0">
        {title && (
          <h2 className="m-0 text-2xl tracking-[-0.035em] font-bold">
            {title}
            {optional && <span className="ml-2 align-middle text-[13px] font-medium text-(--tt-muted)">선택</span>}
          </h2>
        )}
        {children}
      </div>
    </div>
  )
}

function Field({ id, label, count, hint, children }: { id: string; label: string; count?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="flex justify-between items-baseline gap-3 text-[15px] font-bold">
        {label}
        {count && <span className="mono text-xs font-normal text-(--tt-muted)">{count}</span>}
      </label>
      {children}
      {hint && <Hint id={`${id}-hint`} state="idle">{hint}</Hint>}
    </div>
  )
}

function Hint({ id, state, children }: { id: string; state: 'idle' | 'ok' | 'bad'; children: ReactNode }) {
  const tone = { idle: 'text-(--tt-muted)', ok: 'text-(--tt-ink)', bad: 'font-medium text-(--tt-signal-deep)' }[state]
  return <span id={id} aria-live="polite" className={`text-[13px] transition-colors ${tone}`}>{children}</span>
}

type UrlFieldProps = {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
  valid: boolean
  hint: { idle: string; ok: string; bad: string }
}

/** 주소 입력. 비어 있으면 안내, 맞으면 확인, 틀리면 이유를 보여줘요. */
function UrlField({ id, label, placeholder, value, onChange, valid, hint }: UrlFieldProps) {
  const state = !value ? 'idle' : valid ? 'ok' : 'bad'
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[15px] font-bold">{label}</label>
      <input
        id={id}
        type="url"
        inputMode="url"
        value={value}
        maxLength={300}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        aria-invalid={state === 'bad'}
        aria-describedby={`${id}-hint`}
        className={`${INPUT} ${state === 'bad' ? BAD : ''}`}
      />
      <Hint id={`${id}-hint`} state={state}>{hint[state]}</Hint>
    </div>
  )
}

function Confirm({ checked, onChange, title, desc }: { checked: boolean; onChange: (checked: boolean) => void; title: string; desc: string }) {
  return (
    <label className="flex items-start gap-3.5 px-5 py-4.5 rounded-(--tt-radius-md) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) cursor-pointer transition-colors hover:bg-(--tt-ground) has-focus-visible:shadow-[0_0_0_4px_var(--tt-focus)]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5.5 mt-0.5 shrink-0 accent-(--tt-ink) cursor-pointer" />
      <span className="flex flex-col gap-1">
        <strong>{title}</strong>
        <span className="text-sm text-(--tt-muted)">{desc}</span>
      </span>
    </label>
  )
}

export default SubmitForm
