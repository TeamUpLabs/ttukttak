import data from '../../../mocks/weeks.json'
import { useNow } from '../../shared/hooks/useNow.ts'
import { getThisWeek, type Week } from './thisWeek.ts'

// ponytail: 목 데이터 고정. Supabase 붙이면 이 import만 api.ts 쿼리로 바꿔요.
/** 모든 주차, 시간순 */
export const weeks = data.weeks as Week[]
export const weekLabels = data.labels

/** 이번 주 정보. tickMs마다 다시 계산해서 주가 바뀌면 자동으로 넘어가요. */
export function useThisWeek(tickMs = 1000) {
  const now = useNow(tickMs)
  return { now, ...getThisWeek(weeks, now) }
}
