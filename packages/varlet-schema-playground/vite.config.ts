import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  return {
    base: './',

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },

    server: {
      host: '0.0.0.0',
      port: 10087
    },

    build: {
      target: ['ios12']
    },

    plugins: [
      vue(),
    ]
  }
})
