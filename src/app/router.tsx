import { createBrowserRouter } from 'react-router'
import HomePage from '../pages/HomePage.tsx'
import LoginPage from '../pages/LoginPage.tsx'
import ProfilePage from '../pages/ProfilePage.tsx'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  // "/@jh.park". 정적 라우트(/login)가 먼저 매칭돼요.
  { path: '/:handle', element: <ProfilePage /> },
])
