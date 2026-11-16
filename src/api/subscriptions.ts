import { request } from './client.ts'

export const subscriptionsApi = {
  /**
   * 주제 공개 알림 신청. 확인 메일의 링크를 눌러야 켜져요.
   * 이미 신청한 주소여도 같은 응답이에요. 확인·해지 링크는 /?subscribed=1|0, /?unsubscribed=1|0으로 돌아와요.
   */
  subscribe: (email: string) =>
    request<{ status: 'pending' }>('/subscriptions', { method: 'POST', body: JSON.stringify({ email }) }),
}
