import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// O backend libera a origem http://localhost:5173 por CORS (application.properties).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
})
