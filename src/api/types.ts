/** 서버 오류 응답: { "error": { "code", "message", "fields"?, "submissionId"? } } */
export type ApiErrorBody = {
  error: { code: string; message: string; fields?: Record<string, string>; submissionId?: string }
}

/** 작성자·목록 등에서 사용자를 짧게 보여줄 때 */
export type UserSummary = {
  id: string
  /** @ 없는 아이디 */
  handle: string
  name: string
  avatarUrl: string | null
  initials: string
}
