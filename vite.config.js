import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed at https://doeringchristian.github.io/swisstaxmap/
// In dev (npm run dev) BASE is empty; the build sets the subpath so all
// `${import.meta.env.BASE_URL}…` fetches resolve under /swisstaxmap/.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/swisstaxmap/' : '/',
  plugins: [react()],
}))
