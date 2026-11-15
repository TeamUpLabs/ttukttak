import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { VoteButton } from '../../../shared/ui'
import { ApiError } from '../../../api/client.ts'
import { submissionsApi, type SubmissionCard } from '../../../api/submissions.ts'

type VoteToggleProps = {
  submission: SubmissionCard
  /** 제출 마감부터 투표 마감까지만 true */
  votingOpen: boolean
  size?: 'md' | 'big'
}

// ponytail: 누른 결과는 이 버튼 안에만 남아요. 목록을 다시 받으면 무작위 순서가 다시 섞여서 캐시는 건드리지 않아요.
// 다른 화면은 들어갈 때 서버에서 다시 받으니 맞춰져요.
function VoteToggle({ submission: s, votingOpen, size }: VoteToggleProps) {
  const [state, setState] = useState({ voted: s.viewer?.voted ?? false, count: s.voteCount })
  const [error, setError] = useState<string | null>(null)
  const save = useMutation({
    mutationFn: (vote: boolean) => (vote ? submissionsApi.vote(s.id) : submissionsApi.unvote(s.id)),
    // 바로 바꿔 보여주고, 서버 값으로 맞추거나 실패하면 되돌려요.
    onMutate: (vote) => {
      const before = state
      setError(null)
      setState({ voted: vote, count: state.count + (vote ? 1 : -1) })
      return before
    },
    onSuccess: (res) => setState({ voted: res.voted, count: res.voteCount }),
    onError: (e, _vote, before) => {
      if (before) setState(before)
      // 409 voting_closed 같은 건 서버 문구를, 네트워크 오류는 다시 시도를 안내해요.
      setError(e instanceof ApiError && e.status < 500 ? e.message : '다시 눌러 주세요')
    },
  })

  function toggle() {
    if (!s.viewer) {
      const here = window.location.pathname + window.location.search + window.location.hash
      window.location.assign(`/login?next=${encodeURIComponent(here)}`)
      return
    }
    if (!save.isPending) save.mutate(!state.voted)
  }

  return (
    <span className="inline-flex items-center gap-2">
      <VoteButton
        target={s.title}
        count={state.count}
        pressed={state.voted}
        onToggle={toggle}
        size={size}
        disabled={!votingOpen || !!s.viewer?.isAuthor}
      />
      {error && <span role="alert" className="text-[13px] text-(--tt-ink-soft)">{error}</span>}
    </span>
  )
}

export default VoteToggle
