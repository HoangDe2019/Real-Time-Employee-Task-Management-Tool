import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration to proxy API and Socket.IO to backend
export default defineConfig({
  base: '/Real-Time-Employee-Task-Management-Tool/',
  plugins: [
    react()
  ],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false
      },
      '/socket.io': {
        target: 'http://localhost:4000',
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    sourcemap: true
  }
});


