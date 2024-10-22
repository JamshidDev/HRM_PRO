import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
  resolve:{
    alias:{
      '@' : path.resolve(__dirname, './src')
    },
  },
  plugins: [
      vue(),
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
      dts: false,
    }),
  ],
  server:{
    port:8000
  }
})