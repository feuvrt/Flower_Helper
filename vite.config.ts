import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Локально сайт открывается на /. Для GitHub Pages можно указать base при сборке:
  // VITE_PUBLIC_BASE=/plant-care-assistant/ npm run build
  base: process.env.VITE_PUBLIC_BASE ?? '/',
});
