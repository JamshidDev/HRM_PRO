import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  resolve:{
    alias:{
      "@": path.resolve(__dirname, 'src')
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
  },
})