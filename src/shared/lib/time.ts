const rtf = new Intl.RelativeTimeFormat('ko')

/** "방금", "5분 전", "3시간 전", "2일 전" */
export function timeAgo(at: number, now: Date) {
  const min = Math.floor((now.getTime() - at) / 60_000)
  if (min < 1) return '방금'
  if (min < 60) return rtf.format(-min, 'minute')
  if (min < 60 * 24) return rtf.format(-Math.floor(min / 60), 'hour')
  return rtf.format(-Math.floor(min / (60 * 24)), 'day')
}
