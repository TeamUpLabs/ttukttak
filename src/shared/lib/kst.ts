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

/** "목 10:00". 자정은 전날 24:00으로 보여줘요("일 24:00"). */
export function kstDayTime(date: Date) {
  const p = kstParts(date)
  if (p.hour === '00' && p.minute === '00') {
    return `${kstParts(new Date(date.getTime() - 1)).weekday} 24:00`
  }
  return `${p.weekday} ${p.hour}:${p.minute}`
}
