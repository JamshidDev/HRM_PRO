import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import tailwindcss from '@tailwindcss/vite'
import svgLoader from 'vite-svg-loader'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@stores': path.resolve(__dirname, './src/store/modules'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),

      // page modules
      '@turnstile': path.resolve(__dirname, './src/pages/turnstile')
    }
  },
  plugins: [
    tailwindcss(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['media-theme-tailwind-audio', 'media-theme-yt'].includes(tag)
        }
      }
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        {
          pinia: ['defineStore']
        }
      ],
      dts: 'auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true
      }
    }),
    svgLoader({ svgo: false })
  ],
  server: {
    port: 8000,
    host: '0.0.0.0',
    watch: {
      ignored: ['dist/**', 'auto-imports.d.ts']
    },
    allowedHosts: ['jamcoder-mac.local', 'calculate-aloof-slot.ngrok-free.dev']
  }
})
