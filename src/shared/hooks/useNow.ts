import { useEffect, useState } from 'react'

/** 현재 시각. tickMs마다 다시 렌더해요. */
export function useNow(tickMs = 1000) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), tickMs)
    return () => clearInterval(id)
  }, [tickMs])

  return now
}
