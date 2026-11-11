import season from '../../../mocks/season-2.json'
import { useNow } from '../../shared/hooks/useNow.ts'
import { getThisWeek, type Week } from './thisWeek.ts'

// ponytail: 목 데이터 고정. Supabase 붙이면 이 import만 api.ts 쿼리로 바꿔요.
const weeks = season.weeks as Week[]
export const weekLabels = season.labels

/** 이번 주 정보. tickMs마다 다시 계산해서 주가 바뀌면 자동으로 넘어가요. */
export function useThisWeek(tickMs = 1000) {
  const now = useNow(tickMs)
  return { now, ...getThisWeek(weeks, now) }
}
