import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

// 앱 전체에서 하나만 써요. 렌더 밖에서 만들어야 다시 그려져도 캐시가 유지돼요.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 제출작·투표 수는 1분 정도 늦어도 괜찮아요. 탭 전환마다 다시 받지 않게 해요.
      staleTime: 60_000,
    },
  },
})

/** 앱 전체를 감싸는 provider 조립. 새 provider는 여기에 추가해요. */
function Providers({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default Providers
