import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../../api/users.ts'

// 키는 서버 경로를 따라가요: /users/:handle, /users/:handle/streak …
// ponytail: 제출작은 최근 6개, 피드백은 최근 20개만 받아요. 더 보기가 필요하면 nextCursor를 이어요.

/** 프로필 머리·통계. 불러오는 중이면 data가 undefined, 없는 사람이면 error가 404 ApiError */
export const useProfile = (handle: string) =>
  useQuery({ queryKey: ['users', handle], queryFn: () => usersApi.get(handle), enabled: handle !== '' })

export const useStreak = (handle: string) =>
  useQuery({ queryKey: ['users', handle, 'streak'], queryFn: () => usersApi.streak(handle) })

export const useBadges = (handle: string) =>
  useQuery({ queryKey: ['users', handle, 'badges'], queryFn: () => usersApi.badges(handle) })

export const useProfileSubmissions = (handle: string) =>
  useQuery({ queryKey: ['users', handle, 'submissions'], queryFn: () => usersApi.submissions(handle, { limit: 6 }) })

/** 피드백 탭을 열었을 때만 받아요. */
export const useProfileFeedback = (handle: string, enabled: boolean) =>
  useQuery({ queryKey: ['users', handle, 'feedback'], queryFn: () => usersApi.feedback(handle), enabled })
