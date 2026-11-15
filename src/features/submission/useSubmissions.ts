import { useQuery } from '@tanstack/react-query'
import { submissionsApi, type ListParams } from '../../api/submissions.ts'

// 키는 서버 경로를 따라가요. 제출·수정 뒤엔 ['submissions'], ['submission', id]를 무효화해요.
// ponytail: 한 번에 최대 50개만 받아요. 한 주에 50개를 넘기면 nextCursor로 더 보기를 붙여요.

/** 주차의 제출작. 불러오는 중이면 data가 undefined */
export function useSubmissions(weekId: string, params: ListParams = {}) {
  return useQuery({
    queryKey: ['submissions', weekId, params],
    queryFn: () => submissionsApi.list(weekId, { limit: 50, ...params }),
    enabled: weekId !== '',
  })
}

/** 제출작 상세. 없는 id면 error가 404 ApiError */
export function useSubmission(id: string) {
  return useQuery({
    queryKey: ['submission', id],
    queryFn: () => submissionsApi.get(id),
    enabled: id !== '',
  })
}
