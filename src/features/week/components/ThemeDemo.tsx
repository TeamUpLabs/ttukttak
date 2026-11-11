import { useEffect, useState, type ComponentType, type ReactNode } from 'react'
import { PressButton } from '../../../shared/ui'
import type { Week } from '../thisWeek.ts'

type DemoProps = { now: Date }

const DAY = 86_400_000
const KST_OFFSET = 9 * 3_600_000

function Caption({ children }: { children: ReactNode }) {
  return <span className="mono text-xs text-center text-(--tt-on-night-muted)">{children}</span>
}

function readStore(key: string) {
  try {
    return localStorage.getItem(key) ?? ''
  } catch {
    return ''
  }
}

function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // 저장이 막혀 있어도 데모는 그대로 돌아가요
  }
}

/** 기본: 주제와 짝이 없는 주(휴식 주 등) */
const PRESS_LABELS = ['눌러보기', '한 번 더', '좋아요', '계속?', '멈출 수 없어']
function DefaultDemo() {
  const [presses, setPresses] = useState(0)
  return (
    <>
      <PressButton label={PRESS_LABELS[Math.min(presses, PRESS_LABELS.length - 1)]} onClick={() => setPresses(presses + 1)} />
      <Caption>주제를 직접 체험해 보세요</Caption>
    </>
  )
}

/** W47 서버 없이: 브라우저에만 저장 */
function ServerlessDemo() {
  const [count, setCount] = useState(() => Number(readStore('tt-demo-serverless')) || 0)
  return (
    <>
      <PressButton
        label={`${count}번 눌림`}
        onClick={() => {
          setCount(count + 1)
          writeStore('tt-demo-serverless', String(count + 1))
        }}
      />
      <Caption>새로고침해도 숫자가 남아요</Caption>
    </>
  )
}

/** W48 한 화면에 글자 10자 이하: 버튼에 숫자만 */
function TenCharsDemo() {
  const [count, setCount] = useState(0)
  return (
    <>
      <PressButton label={String(count)} aria-label={`눌러보기, ${count}번 눌림`} onClick={() => setCount(count + 1)} />
      <Caption>글자 없이 눌러보세요</Caption>
    </>
  )
}

/** W49 쓸모없지만 정교한 것: 점점 공손하게 거절하는 버튼 */
const REFUSALS = ['누르지 마세요', '그러지 마세요', '부탁드려요', '정말 송구해요', '제발요']
function UselessDemo() {
  const [presses, setPresses] = useState(0)
  return (
    <>
      <PressButton label={REFUSALS[Math.min(presses, REFUSALS.length - 1)]} onClick={() => setPresses(presses + 1)} />
      <Caption>아무 일도 일어나지 않아요</Caption>
    </>
  )
}

/** W50 키보드만으로: 누른 키를 키캡에 */
function KeyboardDemo() {
  const [key, setKey] = useState<string | null>(null)
  return (
    <>
      <button
        type="button"
        onKeyDown={(e) => setKey(e.key === ' ' ? 'Space' : e.key)}
        className="size-42 rounded-(--tt-radius-xl) bg-(--tt-signal) text-(--tt-on-signal) text-2xl font-bold shadow-(--tt-shadow-press) focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-(--tt-on-night)"
      >
        {key ?? '아무 키나'}
      </button>
      <Caption>Tab으로 와서 키를 눌러보세요</Caption>
    </>
  )
}

/** W51 URL이 곧 데이터: 상태를 주소에 */
function UrlDemo() {
  const [count, setCount] = useState(() => Number(new URLSearchParams(location.search).get('n')) || 0)
  return (
    <>
      <PressButton
        label={`n=${count}`}
        onClick={() => {
          const url = new URL(location.href)
          url.searchParams.set('n', String(count + 1))
          history.replaceState(history.state, '', url)
          setCount(count + 1)
        }}
      />
      <Caption>주소창에 숫자가 담겨요</Caption>
    </>
  )
}

/** W52 화면 없는 앱: 소리와 진동으로 */
function beep() {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  gain.gain.value = 0.2
  osc.frequency.value = 660
  osc.connect(gain).connect(ctx.destination)
  osc.onended = () => ctx.close()
  osc.start()
  osc.stop(ctx.currentTime + 0.15)
  navigator.vibrate?.(150)
}
function SoundDemo() {
  return (
    <>
      <PressButton label="들어보기" onClick={beep} />
      <Caption>화면 대신 소리로 알려줘요</Caption>
    </>
  )
}

/** W1 오늘만 존재하는 앱: 한국 시간 자정에 초기화 */
function TodayDemo({ now }: DemoProps) {
  const today = Math.floor((now.getTime() + KST_OFFSET) / DAY)
  const [saved, setSaved] = useState(() => readStore('tt-demo-today'))
  const [savedDay, savedCount] = saved.split(':').map(Number)
  const count = savedDay === today ? savedCount : 0
  const left = DAY - ((now.getTime() + KST_OFFSET) % DAY)

  return (
    <>
      <PressButton
        label={`오늘 ${count}번`}
        onClick={() => {
          const next = `${today}:${count + 1}`
          setSaved(next)
          writeStore('tt-demo-today', next)
        }}
      />
      <Caption>
        {Math.floor(left / 3_600_000)}시간 {Math.floor(left / 60_000) % 60}분 뒤 사라져요
      </Caption>
    </>
  )
}

/** W2 두 사람이 있어야 작동: 둘 다 들어와야 열려요 */
function TwoPeopleDemo() {
  const [joined, setJoined] = useState([false, false])
  const both = joined[0] && joined[1]
  return (
    <>
      <div className="flex gap-4 py-10">
        {['A', 'B'].map((who, i) => (
          <button
            key={who}
            type="button"
            aria-pressed={joined[i]}
            aria-label={`${who} 들어오기`}
            onClick={() => setJoined(joined.map((v, j) => (j === i ? !v : v)))}
            className={`size-22 rounded-full text-2xl font-bold border-2 border-(--tt-signal) transition-colors duration-(--tt-dur-quick) ${
              joined[i] ? 'bg-(--tt-signal) text-(--tt-on-signal)' : 'text-(--tt-on-night)'
            }`}
          >
            {who}
          </button>
        ))}
      </div>
      <Caption>{both ? '둘이 모여서 작동해요' : '혼자서는 아무 일도 없어요'}</Caption>
    </>
  )
}

/** W3 이미 있는 앱을 1%만 다르게: 칭찬하는 할 일 */
function OnePercentDemo() {
  const [done, setDone] = useState(false)
  return (
    <>
      <label className="flex items-center gap-3 min-h-11 px-5 my-14 rounded-full border border-(--tt-night-line) cursor-pointer">
        <input type="checkbox" checked={done} onChange={(e) => setDone(e.target.checked)} className="size-5 accent-(--tt-signal)" />
        <span className={done ? 'line-through text-(--tt-on-night-muted)' : ''}>물 마시기</span>
      </label>
      <Caption>{done ? '잘했어요. 정말 대단해요' : '체크해 보세요'}</Caption>
    </>
  )
}

/** W4 바깥 세상을 입력으로: 기울기로 점 움직이기 */
function SensorDemo() {
  const [listening, setListening] = useState(false)
  const [tilt, setTilt] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!listening) return
    const onTilt = (e: DeviceOrientationEvent) => setTilt({ x: e.gamma ?? 0, y: (e.beta ?? 0) - 45 })
    window.addEventListener('deviceorientation', onTilt)
    return () => window.removeEventListener('deviceorientation', onTilt)
  }, [listening])

  async function start() {
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined
    if (D?.requestPermission && (await D.requestPermission()) !== 'granted') return
    setListening(true)
  }

  const shift = (v: number) => (Math.max(-45, Math.min(45, v)) / 45) * 60

  if (!listening) {
    return (
      <>
        <PressButton label="기울여 보기" onClick={start} />
        <Caption>휴대폰에서 눌러보세요</Caption>
      </>
    )
  }
  return (
    <>
      <div className="relative size-42 rounded-full border border-dashed border-(--tt-night-line)">
        <span
          className="absolute left-1/2 top-1/2 -ml-4 -mt-4 size-8 rounded-full bg-(--tt-signal) transition-transform duration-(--tt-dur-press)"
          style={{ transform: `translate(${shift(tilt?.x ?? 0)}px, ${shift(tilt?.y ?? 0)}px)` }}
        />
      </div>
      <Caption>{tilt ? '기울이는 대로 굴러가요' : '센서가 없는 기기예요'}</Caption>
    </>
  )
}

/** W5 되돌리기 없음: 칠한 칸은 그대로 */
function NoUndoDemo() {
  const [filled, setFilled] = useState<boolean[]>(() => Array(16).fill(false))
  return (
    <>
      <div className="grid grid-cols-4 gap-1">
        {filled.map((on, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}번 칸 칠하기`}
            aria-pressed={on}
            disabled={on}
            onClick={() => setFilled(filled.map((v, j) => v || j === i))}
            className={`size-11 rounded-(--tt-radius-xs) border border-(--tt-night-line) ${on ? 'bg-(--tt-signal)' : 'cursor-pointer'}`}
          />
        ))}
      </div>
      <Caption>칠한 칸은 되돌릴 수 없어요 · {filled.filter(Boolean).length}/16</Caption>
    </>
  )
}

/** W7 딱 한 사람을 위한 앱: 이름을 넣으면 그 사람 전용 */
function OnePersonDemo() {
  const [name, setName] = useState('')
  const [presses, setPresses] = useState(0)
  return (
    <>
      <PressButton label={`${name || '누구'}님 전용`} onClick={() => setPresses(presses + 1)} />
      <label className="flex flex-col items-center gap-2">
        <Caption>{presses > 0 ? `${presses}번 마음을 보냈어요` : '누구를 위해 만들까요?'}</Caption>
        <input
          value={name}
          maxLength={6}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          className="w-32 min-h-11 px-4 rounded-full border border-(--tt-night-line) bg-transparent text-center text-(--tt-on-night)"
        />
      </label>
    </>
  )
}

const DEMOS: Record<string, ComponentType<DemoProps>> = {
  '2026-w46': ServerlessDemo,
  '2026-w47': TenCharsDemo,
  '2026-w48': UselessDemo,
  '2026-w49': KeyboardDemo,
  '2026-w50': UrlDemo,
  '2026-w51': SoundDemo,
  '2027-w01': TodayDemo,
  '2027-w02': TwoPeopleDemo,
  '2027-w03': OnePercentDemo,
  '2027-w04': SensorDemo,
  '2027-w05': NoUndoDemo,
  '2027-w07': OnePersonDemo,
}

/** 주차 id에 맞는 체험 데모. 짝이 없으면 기본 누르기 버튼. */
function ThemeDemo({ week, now }: { week: Week | undefined; now: Date }) {
  const Demo = (week && DEMOS[week.id]) || DefaultDemo
  return (
    <div className="flex flex-col items-center gap-5.5 py-3.5">
      <Demo key={week?.id} now={now} />
    </div>
  )
}

export default ThemeDemo
