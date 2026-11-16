import type { BadgeKind, StreakResponse } from '../../api/users.ts'

export type Cell = { kind: 0 | 1 | 2; label: string; isNow: boolean }

const STATE: Record<StreakResponse['weeks'][number]['state'], { kind: Cell['kind']; what: string }> = {
  none: { kind: 0, what: '쉼' },
  ongoing: { kind: 0, what: '진행 중' },
  break: { kind: 0, what: '휴식 주' },
  submitted: { kind: 1, what: '제출' },
  top3: { kind: 2, what: '제출 · 트랙 TOP 3' },
}

/** "2026 W45" */
export const weekLabel = (w: { weekId: string; code: string }) => `${w.weekId.slice(0, 4)} ${w.code}`

/** 서버 격자를 52칸으로 맞춰요. 주차가 모자라면 앞을 빈칸으로 채우고, 마지막 칸이 이번 주예요. */
export function toCells(weeks: StreakResponse['weeks']): Cell[] {
  const recent = weeks.slice(-52)
  return [
    ...Array.from({ length: 52 - recent.length }, () => ({ kind: 0 as const, label: '기록 없음', isNow: false })),
    ...recent.map((w, i) => ({
      kind: STATE[w.state].kind,
      label: `${weekLabel(w)} · ${STATE[w.state].what}`,
      isNow: i === recent.length - 1,
    })),
  ]
}

/** 배지 이름·설명·색은 서버가 주는 kind와 value로 정해요. */
export const BADGES: Record<BadgeKind, { ring: string; tone: 'signal' | 'night' | 'sage'; name: (n: number) => string; desc: string }> = {
  streak: { ring: 'WEEK STREAK · 연속 제출 · ', tone: 'signal', name: (n) => `연속 ${n}주`, desc: '쉬지 않고 제출했어요' },
  podium: { ring: 'TOP THREE FINISH · 트랙 시상대 · ', tone: 'night', name: (n) => `시상대 ${n}회`, desc: '트랙 TOP 3에 올랐어요' },
  feedback: { ring: 'FEEDBACK GIVER · 피드백 장인 · ', tone: 'sage', name: (n) => `피드백 ${n}개`, desc: '다른 사람 작업에 피드백을 남겼어요' },
}
