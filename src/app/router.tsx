import { createBrowserRouter } from 'react-router'
import HomePage from '../pages/HomePage.tsx'

// 메인은 바로, 나머지 페이지는 들어갈 때 불러와요(첫 번들을 가볍게).
export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', lazy: () => import('../pages/LoginPage.tsx').then((m) => ({ Component: m.default })) },
  { path: '/p/:id', lazy: () => import('../pages/SubmissionPage.tsx').then((m) => ({ Component: m.default })) },
  { path: '/w/:id', lazy: () => import('../pages/WeekPage.tsx').then((m) => ({ Component: m.default })) },
  // "/@jh.park". 정적 라우트(/login)가 먼저 매칭돼요.
  { path: '/:handle', lazy: () => import('../pages/ProfilePage.tsx').then((m) => ({ Component: m.default })) },
])
