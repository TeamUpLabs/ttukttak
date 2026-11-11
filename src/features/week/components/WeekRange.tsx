import { kstMonthDay } from '../../../shared/lib/kst.ts'
import { useThisWeek } from '../useThisWeek.ts'

/** "W46 — 11.09 — 11.15". 시즌 시작 전엔 첫 주를 보여줘요. */
function WeekRange() {
  const { week: current, next } = useThisWeek(60_000)
  const week = current ?? next
  if (!week) return null

  const start = new Date(week.schedule.opensAt)
  const end = new Date(start.getTime() + 6 * 86_400_000)
  return <span>{week.code} — {kstMonthDay(start)} — {kstMonthDay(end)}</span>
}

export default WeekRange
