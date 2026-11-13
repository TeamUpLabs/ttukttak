import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    // 서버(ttukttak-server)를 같은 출처로 붙여요. Host 헤더를 그대로 넘겨서
    // GitHub 콜백 주소와 로그인 뒤 이동이 localhost:5173 기준으로 만들어져요.
    // 문자열로 쓰면 Vite가 changeOrigin: true를 켜서 Host가 8080으로 바뀌어요. 객체로 써야 해요.
    proxy: { '/api': { target: 'http://localhost:8080' } },
  },
  build: {
    rolldownOptions: {
      output: {
        // 잘 안 바뀌는 라이브러리는 따로 묶어요. 앱만 고쳐 배포하면 이 파일은 브라우저 캐시를 그대로 써요.
        codeSplitting: {
          groups: [{ name: 'vendor', test: /node_modules/ }],
        },
      },
    },
  },
})
