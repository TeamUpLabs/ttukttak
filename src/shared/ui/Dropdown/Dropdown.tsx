import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

type DropdownProps = {
  /** 여는 버튼 안에 들어갈 것(아바타 등) */
  trigger: ReactNode
  /** 버튼 이름. 화면 낭독기가 읽어요. "@guest 계정 메뉴" */
  label: string
  /** 패널을 버튼의 어느 쪽 끝에 맞출지 */
  align?: 'left' | 'right'
  children: ReactNode
}

/**
 * 버튼 아래로 펼쳐지는 드롭다운.
 * 안의 링크·버튼을 누르거나, Esc·바깥 클릭·Tab으로 벗어나면 닫혀요. Esc로 닫으면 포커스가 버튼으로 돌아가요.
 */
function Dropdown({ trigger, label, align = 'right', children }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      buttonRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div
      ref={rootRef}
      className="relative"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="group inline-flex rounded-(--tt-radius-sm) cursor-pointer"
      >
        {trigger}
      </button>

      {open && (
        <div
          id={panelId}
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a, button')) setOpen(false)
          }}
          className={`absolute top-full mt-3 z-10 min-w-56 p-2 rounded-(--tt-radius-md) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) shadow-[4px_6px_0_var(--tt-ink)] animate-[tt-fade-up_.25s_var(--tt-ease-snap)_both] ${
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          }`}
        >
          {children}
        </div>
      )}
    </div>
  )
}

/** 드롭다운 안의 한 줄(링크 또는 버튼). 44px 높이. */
export const DROPDOWN_ITEM =
  'flex w-full items-center min-h-11 px-3 rounded-(--tt-radius-sm) text-[15px] text-left text-(--tt-ink) no-underline cursor-pointer transition-colors duration-(--tt-dur-quick) hover:bg-(--tt-fill-quiet) focus-visible:bg-(--tt-fill-quiet)'

export default Dropdown
