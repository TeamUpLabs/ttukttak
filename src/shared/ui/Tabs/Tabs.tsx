import { useLayoutEffect, useRef } from 'react'

type TabsProps<T extends string> = {
  /** 무엇을 거르는지. "트랙 필터" */
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

const ITEM = 'inline-flex items-center justify-center min-h-11 px-4.5 rounded-full text-sm font-medium'

/**
 * 한 줄로 묶인 필터 토글. 선택 표시가 다음 칸으로 미끄러져 가요.
 * 잉크 글자 줄 위에 뒤집힌 색의 같은 줄을 겹치고, 선택 칸 모양으로만 잘라 보여줘요.
 * 그래서 이동 중에도 글자와 바탕 색이 어긋나지 않아요.
 */
function Tabs<T extends string>({ label, options, value, onChange }: TabsProps<T>) {
  const groupRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

  // 선택된 버튼 모양으로 윗줄을 잘라요. 글꼴 로딩·화면 크기 변화에도 다시 맞춰요.
  useLayoutEffect(() => {
    const group = groupRef.current
    const overlay = overlayRef.current
    if (!group || !overlay) return

    const place = () => {
      const on = group.querySelector<HTMLElement>('button[aria-pressed="true"]')
      if (!on) return
      const top = on.offsetTop
      const left = on.offsetLeft
      const right = overlay.clientWidth - left - on.offsetWidth
      const bottom = overlay.clientHeight - top - on.offsetHeight
      overlay.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round 999px)`
    }
    place()
    // 처음 자리 잡을 땐 움직이지 않고, 그다음부터 미끄러져요.
    const frame = requestAnimationFrame(() => (overlay.dataset.ready = ''))

    const observer = new ResizeObserver(place)
    observer.observe(group)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [value])

  return (
    <div
      ref={groupRef}
      role="group"
      aria-label={label}
      className="relative flex flex-wrap gap-1.5 p-1.25 rounded-full border-(length:--tt-stroke-bold) border-(--tt-ink)"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className={`${ITEM} cursor-pointer transition-colors duration-(--tt-dur-quick) hover:bg-(--tt-fill-quiet)`}
        >
          {option.label}
        </button>
      ))}

      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex flex-wrap gap-1.5 p-1.25 rounded-full bg-(--tt-ink) text-(--tt-ground) [clip-path:inset(50%_50%_50%_50%)] data-ready:transition-[clip-path] data-ready:duration-(--tt-dur-quick) data-ready:ease-(--tt-ease-snap)"
      >
        {options.map((option) => (
          <span key={option.value} className={ITEM}>
            {option.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default Tabs
