import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/CookQuizApp/', // 務必確保與你的 Repository 名稱大小寫完全一致
})