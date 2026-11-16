import { useSearchParams } from 'react-router'

const MESSAGES: Record<string, string> = {
  'subscribed=1': '알림 신청을 확인했어요. 새 주제가 공개되면 메일로 알려드릴게요.',
  'subscribed=0': '확인 링크가 맞지 않거나 이미 쓰였어요. 아래에서 다시 신청해 주세요.',
  'unsubscribed=1': '알림을 껐어요. 이제 메일을 보내지 않아요.',
  'unsubscribed=0': '해지 링크가 맞지 않아요. 메일의 링크를 다시 눌러 주세요.',
}

/** 메일의 확인·해지 링크를 누르면 서버가 /?subscribed=1 처럼 돌려보내요. 그 결과를 한 줄로 알려줘요. */
function SubscriptionResult() {
  const [params] = useSearchParams()
  const key = ['subscribed', 'unsubscribed'].map((k) => `${k}=${params.get(k)}`).find((k) => k in MESSAGES)
  if (!key) return null

  return (
    <p role="status" className="m-0 max-w-7xl mx-auto mt-6 px-6 py-4 rounded-(--tt-radius-md) bg-(--tt-night) text-(--tt-on-night)">
      {MESSAGES[key]}
    </p>
  )
}

export default SubscriptionResult
