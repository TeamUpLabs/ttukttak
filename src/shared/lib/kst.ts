const formatter = new Intl.DateTimeFormat('ko-KR', {
  timeZone: 'Asia/Seoul',
  month: '2-digit',
  day: '2-digit',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
})

function kstParts(date: Date) {
  return Object.fromEntries(formatter.formatToParts(date).map((p) => [p.type, p.value]))
}

/** "11.16" */
export function kstMonthDay(date: Date) {
  const p = kstParts(date)
  return `${p.month}.${p.day}`
}

/** "2026년 1월" */
export function kstYearMonth(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long' }).format(date)
}

/** "목" */
export function kstWeekday(date: Date) {
  return kstParts(date).weekday
}

const DAY = 86_400_000
const KST_OFFSET = 9 * 3_600_000

/** 한국 날짜 기준으로 b가 a보다 며칠 뒤인지. 같은 날이면 0. */
export function kstDaysBetween(a: Date, b: Date) {
  const day = (d: Date) => Math.floor((d.getTime() + KST_OFFSET) / DAY)
  return day(b) - day(a)
}

/** "목 10:00". 자정은 전날 24:00으로 보여줘요("일 24:00"). */
export function kstDayTime(date: Date) {
  const p = kstParts(date)
  if (p.hour === '00' && p.minute === '00') {
    return `${kstParts(new Date(date.getTime() - 1)).weekday} 24:00`
  }
  return `${p.weekday} ${p.hour}:${p.minute}`
}
