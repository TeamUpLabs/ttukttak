import { request } from './client.ts'

/** GET /users/:handle */
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
  stats: { currentStreak: number; bestStreak: number }
}

export const usersApi = {
  /** 없는 사람이면 404 ApiError */
  get: (handle: string) => request<UserResponse>(`/users/${encodeURIComponent(handle)}`),
}
