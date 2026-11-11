type VoteButtonProps = {
  /** 무엇에 투표하는지. aria-label에 들어가요. */
  target: string
  count: number
  pressed: boolean
  onToggle: () => void
}

/** 위쪽 화살표 + 투표 수 토글. 켜지면 잉크로 채워지고 화살표가 튀어요. */
function VoteButton({ target, count, pressed, onToggle }: VoteButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={`${target} 투표${pressed ? ' 취소' : ''}`}
      onClick={onToggle}
      className={`mono inline-flex items-center gap-2 min-h-11 px-4 rounded-full border-(length:--tt-stroke-bold) border-(--tt-ink) text-sm font-medium cursor-pointer transition-colors duration-(--tt-dur-quick) ${
        pressed ? 'bg-(--tt-ink) text-(--tt-ground)' : 'hover:bg-(--tt-fill-quiet)'
      }`}
    >
      <svg
        width="14"
        height="14"
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
