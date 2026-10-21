import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// El alias @ apunta a src/ para importar sin rutas relativas largas (../../..)
export default defineConfig({
  plugins: [react()],
  esbuild: { jsx: 'automatic' },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // Pruebas con Vitest: entorno de navegador simulado (jsdom)
  test: {
    environment: 'jsdom',
    setupFiles: './src/pruebas/configuracion.js',
    css: false,
  },
});
