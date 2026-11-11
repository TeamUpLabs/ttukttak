import type { ThumbTone } from '../../shared/ui/ProjectCard/ProjectCard.tsx'
import type { Track } from './data.ts'

export type SubmitValues = {
  track: Track
  title: string
  summary: string
  demoUrl: string
  repoUrl: string
  thumbMode: 'image' | 'key'
  image: { type: string; size: number } | null
  tone: ThumbTone
  caption: string
  stack: string[]
  story: { what: string; how: string; retro: string }
  okRule: boolean
  okOpen: boolean
}

export const LIMITS = { title: 30, summary: 80, summaryMin: 10, caption: 12, stack: 6, stackItem: 20, story: 400, imageMb: 5 }
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

function httpsUrl(value: string) {
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

/** 로그인 없이 누구나 열 수 있는 https 주소 */
export function isDemoUrl(value: string) {
  return !!httpsUrl(value)?.hostname.includes('.')
}

/** https://github.com/계정/저장소 */
export function isRepoUrl(value: string) {
  const url = httpsUrl(value)
  return !!url && url.hostname === 'github.com' && url.pathname.split('/').filter(Boolean).length >= 2
}

/** 올릴 수 없는 이미지면 이유, 괜찮으면 null */
export function imageError(file: { type: string; size: number }) {
  if (!IMAGE_TYPES.includes(file.type)) return 'PNG, JPG, WebP, GIF 이미지만 올릴 수 있어요.'
  if (file.size > LIMITS.imageMb * 1024 * 1024) return `${LIMITS.imageMb}MB 이하로 올려 주세요.`
  return null
}

/** 스택 추가: 앞뒤 공백 제거, 20자까지, 대소문자 무시 중복 제외, 최대 6개 */
export function addStack(list: string[], value: string) {
  const item = value.trim().slice(0, LIMITS.stackItem)
  if (!item || list.length >= LIMITS.stack || list.some((x) => x.toLowerCase() === item.toLowerCase())) return list
  return [...list, item]
}

/** 제출 준비 체크 7개. 모두 ok여야 제출할 수 있어요. */
export function readiness(v: SubmitValues) {
  return [
    { label: '트랙 선택', ok: !!v.track },
    { label: '제목', ok: v.title.trim().length > 0 },
    { label: '한 줄 소개', ok: v.summary.trim().length >= LIMITS.summaryMin },
    { label: '데모 링크', ok: isDemoUrl(v.demoUrl) },
    { label: 'GitHub 레포', ok: isRepoUrl(v.repoUrl) },
    { label: '썸네일', ok: v.thumbMode === 'image' ? !!v.image && !imageError(v.image) : v.caption.trim().length > 0 },
    { label: '주제 제약 확인', ok: v.okRule },
  ]
}
