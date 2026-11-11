type AvatarProps = {
  /** "jh.park" 또는 "@jh.park" */
  handle: string
  /** sm: 헤더(44px), xl: 프로필 머리(168px, 천천히 흔들림) */
  size?: 'sm' | 'xl'
  /** 있으면 링크로 감싸요 */
  href?: string
}

const SIZES = {
  sm: 'size-11 rounded-(--tt-radius-sm) text-[22px] shadow-(--tt-shadow-stamp) -rotate-6 group-hover:rotate-0 group-hover:shadow-[2px_2px_0_var(--tt-ink)] group-focus-visible:rotate-0',
  xl: 'size-42 rounded-[40px] text-[84px] max-sm:size-28 max-sm:rounded-(--tt-radius-xl) max-sm:text-[56px] shadow-[8px_8px_0_var(--tt-ink)] animate-[tt-wobble_6s_ease-in-out_infinite] hover:[animation-play-state:paused] hover:shadow-[2px_2px_0_var(--tt-ink)]',
}

/** 핸들 앞 두 글자(영문·숫자)를 대문자로. "jh.park" → "JH" */
function initials(handle: string) {
  return (handle.match(/[a-z0-9]/gi) ?? ['?']).slice(0, 2).join('').toUpperCase()
}

/** 주황 키캡 모양 아바타. 이니셜을 좁고 굵은 숫자 서체로 써요. */
function Avatar({ handle, size = 'sm', href }: AvatarProps) {
  const face = (
    <span
      aria-hidden="true"
      className={`inline-flex items-center justify-center shrink-0 bg-(--tt-signal) text-(--tt-on-signal) border-(length:--tt-stroke-bold) border-(--tt-ink) font-(family-name:--tt-font-display) [font-stretch:var(--tt-display-stretch)] font-extrabold leading-none select-none transition-[rotate,box-shadow] duration-(--tt-dur-quick) ease-(--tt-ease-lift) ${SIZES[size]}`}
    >
      {initials(handle)}
    </span>
  )

  if (!href) return face
  const name = handle.startsWith('@') ? handle : `@${handle}`
  return (
    <a href={href} aria-label={`${name} 프로필`} className="group inline-flex rounded-(--tt-radius-sm)">
      {face}
    </a>
  )
}

export default Avatar
