type VoteButtonProps = {
  /** 무엇에 투표하는지. aria-label에 들어가요. */
  target: string
  count: number
  pressed: boolean
  onToggle: () => void
  /** big: 제출작 상세 머리용. 56px, 도장 그림자, 누르면 내려앉아요. */
  size?: 'md' | 'big'
  /** 투표 기간이 아니거나 내 제출작일 때. 수만 보여줘요. */
  disabled?: boolean
}

const SIZES = {
  md: 'gap-2 min-h-11 px-4 text-sm',
  big: 'gap-3 min-h-14 px-6 text-lg shadow-(--tt-shadow-stamp) transition-[translate,box-shadow,background-color,color] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--tt-ink)] active:translate-x-1 active:translate-y-1 active:shadow-none',
}

/** 위쪽 화살표 + 투표 수 토글. 켜지면 잉크로 채워지고 화살표가 튀어요. */
function VoteButton({ target, count, pressed, onToggle, size = 'md', disabled = false }: VoteButtonProps) {
  const icon = size === 'big' ? 18 : 14
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={`${target} 투표${pressed ? ' 취소' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      className={`mono inline-flex items-center rounded-full border-(length:--tt-stroke-bold) border-(--tt-ink) font-medium cursor-pointer transition-colors duration-(--tt-dur-quick) disabled:pointer-events-none disabled:border-transparent disabled:shadow-none ${SIZES[size]} ${
        pressed ? 'bg-(--tt-ink) text-(--tt-ground)' : size === 'big' ? 'bg-(--tt-surface)' : 'hover:bg-(--tt-fill-quiet)'
      }`}
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className={pressed ? 'animate-[tt-pop_.45s_var(--tt-ease-lift)]' : ''}
      >
        <path d="M7 12V2M2.5 6.5 7 2l4.5 4.5" />
      </svg>
      {count}
    </button>
  )
}

export default VoteButton
