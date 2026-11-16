import { useState, type FormEvent, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '../../../shared/ui'
import { adminApi, type WeekStatus } from '../../../api/admin.ts'
import { weeksApi, type Difficulty, type WeekDetailResponse } from '../../../api/weeks.ts'
import { changes, initial, INPUT, messageOf, SCHEDULE, type Values } from '../admin.ts'

const STATUSES: WeekStatus[] = ['draft', 'announced', 'building', 'voting', 'closed', 'break']
const DIFFICULTIES: Difficulty[] = ['low', 'medium', 'high']

/** 주차 id로 불러와 고치고 공지해요. */
function WeekEditor() {
  // 처음엔 진행 중인 주, 없으면 다음 주를 열어요. 메인과 같은 캐시를 써요.
  const { data: current } = useQuery({ queryKey: ['weeks', 'current'], queryFn: weeksApi.current })
  const defaultId = current?.week?.id ?? current?.nextWeek?.id ?? ''
  const [input, setInput] = useState<string | null>(null)
  const [target, setTarget] = useState<string | null>(null)
  const id = target ?? defaultId
  const week = useQuery({ queryKey: ['weeks', id], queryFn: () => weeksApi.get(id), enabled: id !== '' })

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setTarget((input ?? defaultId).trim())
        }}
        className="flex flex-wrap items-end gap-3"
      >
        <label className="flex flex-col gap-2 flex-[1_1_240px]">
          <span className="text-[15px] font-bold">주차 id</span>
          <input value={input ?? defaultId} onChange={(e) => setInput(e.target.value)} placeholder="2026-w48" className={`${INPUT} mono`} />
        </label>
        <Button type="submit" variant="secondary" label="불러오기" />
      </form>

      {week.error && <p role="alert" className="m-0">{messageOf(week.error)}</p>}
      {week.data && <WeekForm key={week.data.week.id} detail={week.data} />}
    </div>
  )
}

function WeekForm({ detail }: { detail: WeekDetailResponse }) {
  const id = detail.week.id
  const [before, setBefore] = useState(() => initial(detail))
  const [v, setV] = useState(before)
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmAnnounce, setConfirmAnnounce] = useState(false)
  const queryClient = useQueryClient()
  const body = changes(before, v)
  const dirty = Object.keys(body).some((k) => k !== 'force')

  const save = useMutation({
    mutationFn: () => adminApi.updateWeek(id, body),
    onSuccess: (res) => {
      const next = initial(res)
      setBefore(next)
      setV(next)
      setNotice('고쳤어요.')
      queryClient.invalidateQueries({ queryKey: ['weeks'] })
    },
  })
  const announce = useMutation({
    mutationFn: () => adminApi.announceWeek(id),
    onSuccess: () => {
      setConfirmAnnounce(false)
      setNotice('공지했어요. 공개 시각에 구독자에게 주제 공개 메일이 나가요.')
    },
  })
  const error = save.error ?? announce.error

  function submit(e: FormEvent) {
    e.preventDefault()
    setNotice(null)
    if (dirty && !save.isPending) save.mutate()
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6" aria-label={`${id} 수정`}>
      <div className="flex justify-between items-baseline flex-wrap gap-3">
        <h3 className="m-0 text-2xl tracking-[-0.03em] font-bold">
          <span className="mono">{detail.week.code}</span> · {detail.week.title ?? '제목 없음'}
        </h3>
        <span className="mono text-[13px] text-(--tt-muted)">{detail.week.type} · 지금 단계 {detail.week.phase}</span>
      </div>

      <Field label="제목">
        <input value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} className={INPUT} />
      </Field>
      <Field label="공지 문구">
        <textarea value={v.announcement} onChange={(e) => setV({ ...v, announcement: e.target.value })} className={`${INPUT} min-h-24 py-3 resize-y`} />
      </Field>
      <Field label="출제 의도">
        <textarea value={v.intent} onChange={(e) => setV({ ...v, intent: e.target.value })} className={`${INPUT} min-h-24 py-3 resize-y`} />
      </Field>
      <Field label="제약 (한 줄에 하나)">
        <textarea value={v.constraints} onChange={(e) => setV({ ...v, constraints: e.target.value })} className={`${INPUT} min-h-24 py-3 resize-y`} />
      </Field>
      <Field label="판정 기준 (비우면 그대로)">
        <input value={v.rule} onChange={(e) => setV({ ...v, rule: e.target.value })} className={INPUT} />
      </Field>

      <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
        <Field label="난이도">
          <select value={v.difficulty} onChange={(e) => setV({ ...v, difficulty: e.target.value as Values['difficulty'] })} className={INPUT}>
            <option value="">그대로</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </Field>
        <Field label="준비 상태">
          <select value={v.status} onChange={(e) => setV({ ...v, status: e.target.value as Values['status'] })} className={INPUT}>
            <option value="">그대로</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <fieldset className="m-0 p-0 border-0 grid grid-cols-2 max-sm:grid-cols-1 gap-4">
        <legend className="mb-2 text-[15px] font-bold">일정 (한국 시간, 휴식 주는 공개만)</legend>
        {SCHEDULE.map(({ key, label }) => (
          <Field key={key} label={label}>
            <input
              type="datetime-local"
              value={v.schedule[key]}
              onChange={(e) => setV({ ...v, schedule: { ...v.schedule, [key]: e.target.value } })}
              className={`${INPUT} mono`}
            />
          </Field>
        ))}
      </fieldset>

      <Field label="운영 메모 (비우면 그대로)">
        <textarea value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} className={`${INPUT} min-h-20 py-3 resize-y`} />
      </Field>

      <label className="flex items-center gap-3 min-h-11 text-[15px]">
        <input type="checkbox" checked={v.force} onChange={(e) => setV({ ...v, force: e.target.checked })} className="size-5" />
        이미 공개된 주차의 일정도 바꿔요 (force)
      </label>

      {error && <p role="alert" className="m-0 text-[15px]">{messageOf(error)}</p>}
      {notice && !error && <p role="status" className="m-0 text-[15px] text-(--tt-ink-soft)">{notice}</p>}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant={dirty && !save.isPending ? 'secondary' : 'disabled'} label={save.isPending ? '저장하는 중' : '고친 내용 저장하기'} />
        {detail.week.type === 'theme' && (
          <Button
            variant={announce.isPending ? 'disabled' : 'primary'}
            label={confirmAnnounce ? '한 번 더 누르면 공지해요' : '공지하고 메일 예약하기'}
            onClick={() => (confirmAnnounce ? announce.mutate() : setConfirmAnnounce(true))}
          />
        )}
      </div>
    </form>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[15px] font-bold">{label}</span>
      {children}
    </label>
  )
}

export default WeekEditor
