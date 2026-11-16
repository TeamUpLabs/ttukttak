import { request } from './client.ts'
import type { FeedbackType } from './feedback.ts'
import type { SubmissionCard } from './submissions.ts'
import type { UserSummary } from './types.ts'
import type { Track } from './weeks.ts'

/** GET /users/:handle. 비로그인이면 viewer가 null */
export type UserResponse = {
  user: {
    id: string
    handle: string
    name: string
    avatarUrl: string | null
    initials: string
    bio: string | null
    links: { github: string | null; blog: string | null }
    joinedAt: string
  }
  /** submissionsLast52: 52주 격자 안의 제출 수, top3Count: 결과 발표 뒤 트랙 3위 안에 든 횟수 */
  stats: {
    currentStreak: number
    bestStreak: number
    submissionsLast52: number
    top3Count: number
    votesReceived: number
    feedbackGiven: number
  }
  social: { followers: number; following: number }
  viewer: { following: boolean; isSelf: boolean } | null
}

export type WeekState = 'none' | 'submitted' | 'top3' | 'break' | 'ongoing'

/** 오래된 주부터 이번 주까지. 주차가 52개보다 적으면 있는 만큼만 */
export type StreakResponse = {
  weeks: { weekId: string; code: string; state: WeekState }[]
  /** fromWeekId: 지금 이어지는 기록의 첫 주 */
  current: { length: number; fromWeekId: string | null }
}

export type BadgeKind = 'streak' | 'podium' | 'feedback'

/** 받은 순서대로. 이름·설명·색은 프론트가 kind와 value로 정해요 */
export type BadgeListResponse = {
  items: { id: string; kind: BadgeKind; value: number; unit: string; earnedAt: string }[]
}

/** 최신순. medal은 결과 발표 뒤 트랙 3위 안에 들었을 때만 */
export type ProfileSubmissionListResponse = {
  items: (SubmissionCard & { week: { code: string; title: string | null }; medal: { track: Track; rank: number } | null })[]
  nextCursor: string | null
}

/** 최신순 */
export type ProfileFeedbackListResponse = {
  items: {
    id: string
    type: FeedbackType
    body: string
    helpfulCount: number
    createdAt: string
    submission: { id: string; title: string; author: UserSummary }
  }[]
  nextCursor: string | null
}

export type FollowResponse = { following: boolean; followers: number }

const at = (handle: string) => `/users/${encodeURIComponent(handle)}`
const page = (cursor?: string, limit?: number) =>
  new URLSearchParams({ ...(cursor ? { cursor } : {}), ...(limit ? { limit: String(limit) } : {}) })

export const usersApi = {
  /** 없는 사람이면 404 ApiError */
  get: (handle: string) => request<UserResponse>(at(handle)),
  streak: (handle: string) => request<StreakResponse>(`${at(handle)}/streak`),
  badges: (handle: string) => request<BadgeListResponse>(`${at(handle)}/badges`),
  /** limit 기본 12 */
  submissions: (handle: string, { cursor, limit }: { cursor?: string; limit?: number } = {}) =>
    request<ProfileSubmissionListResponse>(`${at(handle)}/submissions?${page(cursor, limit)}`),
  /** limit 기본 20 */
  feedback: (handle: string, { cursor, limit }: { cursor?: string; limit?: number } = {}) =>
    request<ProfileFeedbackListResponse>(`${at(handle)}/feedback?${page(cursor, limit)}`),
  /** 로그인 필요. 나 자신은 403 */
  follow: (handle: string) => request<FollowResponse>(`${at(handle)}/follow`, { method: 'PUT' }),
  unfollow: (handle: string) => request<FollowResponse>(`${at(handle)}/follow`, { method: 'DELETE' }),
}
