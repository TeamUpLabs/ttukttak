import { useState } from 'react'
import { VoteButton } from '../../../shared/ui'

type VoteToggleProps = {
  /** 무엇에 투표하는지 */
  target: string
  /** 내 투표를 빼고 센 수 */
  count: number
}

// ponytail: 투표는 화면 안에서만 유지돼요. 로그인·Supabase 붙이면 votes 테이블에 저장.
function VoteToggle({ target, count }: VoteToggleProps) {
  const [voted, setVoted] = useState(false)
  return <VoteButton target={target} count={count + (voted ? 1 : 0)} pressed={voted} onToggle={() => setVoted(!voted)} />
}

export default VoteToggle
