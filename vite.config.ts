import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Для GitHub Pages замените plant-care-assistant на точное имя репозитория.
  base: '/plant-care-assistant/',
})
