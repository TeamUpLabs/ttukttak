import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '../../../api/client.ts'
import { adminApi } from '../../../api/admin.ts'

const MAX = 300

/** 운영자 전용: 규칙을 어긴 제출작 숨기기. 이유는 작성자에게 메일로 가요. */
function HideSubmission({ id }: { id: string }) {
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()
  const hide = useMutation({
    mutationFn: () => adminApi.hideSubmission(id, reason.trim()),
    // 목록·주차 통계에서도 빠져요.
    onSuccess: () => {
      for (const queryKey of [['submissions'], ['weeks']]) queryClient.invalidateQueries({ queryKey })
    },
  })
  const error = hide.error instanceof ApiError && hide.error.status < 500
    ? hide.error.fields.reason ?? hide.error.message
    : hide.error && '잠시 후 다시 시도해 주세요.'

  if (hide.isSuccess) {
    return <p role="status" className="m-0 text-[15px]">숨겼어요. 작성자에게 이유를 메일로 보냈어요.</p>
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (reason.trim() && !hide.isPending) hide.mutate()
      }}
      className="flex flex-col gap-3"
    >
      <label htmlFor="hide-reason" className="text-[15px] font-bold">숨기는 이유</label>
      <textarea
        id="hide-reason"
        value={reason}
        maxLength={MAX}
        onChange={(e) => setReason(e.target.value)}
        placeholder="어떤 규칙을 어겼는지 작성자가 알 수 있게 적어요"
        className="w-full min-h-24 resize-y rounded-(--tt-radius-md) border-(length:--tt-stroke-bold) border-(--tt-ink) bg-(--tt-surface) px-4 py-3 text-[15px] leading-[1.6] focus:outline-none focus:shadow-[0_0_0_4px_var(--tt-focus)]"
      />
      {error && <span role="alert" className="text-[13px]">{error}</span>}
      <button
        type="submit"
        disabled={!reason.trim() || hide.isPending}
        className="self-start min-h-11 px-5 rounded-full bg-(--tt-ink) text-(--tt-ground) text-[15px] font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {hide.isPending ? '숨기는 중' : '제출작 숨기기'}
      </button>
    </form>
  )
}

export default HideSubmission
