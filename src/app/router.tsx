import { createBrowserRouter } from 'react-router'
import HomePage from '../pages/HomePage.tsx'
import LoginPage from '../pages/LoginPage.tsx'
import ProfilePage from '../pages/ProfilePage.tsx'
import SubmissionPage from '../pages/SubmissionPage.tsx'
import WeekPage from '../pages/WeekPage.tsx'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/p/:id', element: <SubmissionPage /> },
  { path: '/w/:id', element: <WeekPage /> },
  // "/@jh.park". 정적 라우트(/login)가 먼저 매칭돼요.
  { path: '/:handle', element: <ProfilePage /> },
])
