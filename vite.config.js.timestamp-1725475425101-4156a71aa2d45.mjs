// vite.config.js
import { defineConfig } from "file:///C:/Users/Jama/Desktop/PROJECTS/BotNexus/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/Jama/Desktop/PROJECTS/BotNexus/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import path from "path";
import AutoImport from "file:///C:/Users/Jama/Desktop/PROJECTS/BotNexus/node_modules/unplugin-auto-import/dist/vite.js";
var __vite_injected_original_dirname = "C:\\Users\\Jama\\Desktop\\PROJECTS\\BotNexus";
var vite_config_default = defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  plugins: [
    vue(),
    AutoImport({
      imports: [
        "vue",
        "vue-router",
        {
          "pinia": [
            "defineStore"
          ]
        }
      ],
      dts: false
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKYW1hXFxcXERlc2t0b3BcXFxcUFJPSkVDVFNcXFxcQm90TmV4dXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEphbWFcXFxcRGVza3RvcFxcXFxQUk9KRUNUU1xcXFxCb3ROZXh1c1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvSmFtYS9EZXNrdG9wL1BST0pFQ1RTL0JvdE5leHVzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICByZXNvbHZlOntcclxuICAgIGFsaWFzOntcclxuICAgICAgJ0AnIDogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjJylcclxuICAgIH0sXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICAgIHZ1ZSgpLFxyXG4gICAgQXV0b0ltcG9ydCh7XHJcbiAgICAgIGltcG9ydHM6IFtcclxuICAgICAgICAndnVlJyxcclxuICAgICAgICAndnVlLXJvdXRlcicsXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgJ3BpbmlhJzogW1xyXG4gICAgICAgICAgICAnZGVmaW5lU3RvcmUnLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICB9LFxyXG4gICAgICBdLFxyXG4gICAgICBkdHM6IGZhbHNlLFxyXG4gICAgfSksXHJcbiAgXSxcclxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQW1ULFNBQVMsb0JBQW9CO0FBQ2hWLE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFDakIsT0FBTyxnQkFBZ0I7QUFIdkIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUTtBQUFBLElBQ04sT0FBTTtBQUFBLE1BQ0osS0FBTSxLQUFLLFFBQVEsa0NBQVcsT0FBTztBQUFBLElBQ3ZDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ0wsSUFBSTtBQUFBLElBQ04sV0FBVztBQUFBLE1BQ1QsU0FBUztBQUFBLFFBQ1A7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFVBQ0UsU0FBUztBQUFBLFlBQ1A7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLEtBQUs7QUFBQSxJQUNQLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
