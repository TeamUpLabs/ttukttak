import { useEffect, useState } from 'react'
import { useReducedMotion } from './useReducedMotion.ts'

/** 0에서 target까지 숫자를 굴려 올려요(ease-out). 움직임 줄이기면 바로 target. */
export function useCountUp(target: number, durationMs = 1000) {
  const reduced = useReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (reduced) return
    let frame = 0
    const start = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / durationMs)
      setValue(Math.round(target * (1 - (1 - p) ** 3)))
      if (p < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, durationMs, reduced])

  return reduced ? target : value
}
