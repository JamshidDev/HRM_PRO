import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite';
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'

export default defineConfig({
  resolve:{
    alias:{
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/store/modules', import.meta.url)),
    },
  },
  plugins: [
    tailwindcss(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['media-theme-tailwind-audio', 'media-theme-yt'].includes(tag),
        }
      }
    }),
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        {
          'pinia': [
            'defineStore',
          ],
        },
      ],
      dts: "auto-imports.d.ts",
    }),
  ],
  server:{
    port:8000,
    watch: {
      ignored: ['dist/**', 'auto-imports.d.ts']
    },
  },
})