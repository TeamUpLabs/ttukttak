import type { ButtonHTMLAttributes } from 'react'

type PressButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string
}

/** 브랜드의 둥근 주황 키. 누르면 10px 내려앉아요. 한 화면에 하나만. */
function PressButton({ label, className = '', ...rest }: PressButtonProps) {
  return (
    <span className="relative inline-flex">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-3.5 rounded-full border border-dashed border-(--tt-night-line) animate-[tt-spin_18s_linear_infinite]"
      />
      <button
        type="button"
        className={`relative size-42 rounded-full bg-(--tt-signal) text-(--tt-on-signal) text-[17px] font-bold cursor-pointer select-none shadow-(--tt-shadow-press) animate-[tt-breathe_2.4s_ease-in-out_infinite] transition-[translate,box-shadow] duration-(--tt-dur-press) active:translate-y-2.5 active:shadow-none active:animate-none ${className}`.trim()}
        {...rest}
      >
        {label}
      </button>
    </span>
  )
}

export default PressButton
