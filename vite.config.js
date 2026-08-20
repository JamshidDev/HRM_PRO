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
  build: {
    // `es2022` — tahrirlash v2 (docx-editor.dev) matn shaping uchun `harfbuzzjs`
    // ishlatadi, u esa **top-level await** bilan yozilgan. Vite'ning standart
    // baseline'i (chrome87/safari14) TLA'ni qo'llab-quvvatlamaydi → build yiqiladi.
    // Talab qilinadigan minimal brauzerlar: Chrome 89+, Safari 15+, Firefox 89+.
    target: 'es2022'
  },
  optimizeDeps: {
    // ⚠️ `build.target` FAQAT production build'ga tegishli. Dev serverda paketlar
    // esbuild bilan alohida pre-bundle qilinadi va u o'z (standart) target'ini
    // oladi → `harfbuzzjs` TLA'si tufayli dev'da muharrir moduli yuklanmaydi.
    // Shuning uchun target bu yerda ham qo'yiladi.
    esbuildOptions: { target: 'es2022' }
  },
  server: {
    port: 8000,
    host: '0.0.0.0',
    watch: {
      ignored: ['dist/**', 'auto-imports.d.ts']
    },
    allowedHosts: ['jamcoder-mac.local', 'calculate-aloof-slot.ngrok-free.dev']
  }
})
