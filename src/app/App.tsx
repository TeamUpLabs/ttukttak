import { RouterProvider } from 'react-router'
import Providers from './providers.tsx'
import { router } from './router.tsx'

function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}

export default App
