import {defineConfig} from "vite"
import vue from "@vitejs/plugin-vue"
import {resolve} from "path"

import AutoImport from "unplugin-auto-import/vite"
import Components from "unplugin-vue-components/vite"
import {ElementPlusResolver} from "unplugin-vue-components/resolvers"

export default defineConfig(({command, mode}) => {
  if (mode === "development") {
    return {
      plugins: [
        vue(),
        AutoImport({
          resolvers: [ElementPlusResolver()],
        }),
        Components({
          resolvers: [ElementPlusResolver()],
        }),
      ],
      resolve: {
        alias: {
          "@": resolve(__dirname, "src"),
          "/image": "src/assets/image",
        },
        extensions: [".js"],
      },
      server: {
        proxy: {
          "/api": {
            target: "http://101.33.218.141:15656/",
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, ""),
          },
          "/ws": {
            target: "ws://101.33.218.141:15656/",
            // 创建时的URL：new WebSocket("ws://localhost:3000/ws/ws-connect")
            changeOrigin: true,
            ws: true,
            rewrite: (path) => path.replace(/^\/ws/, ""),
          },
        },
      },
    }
  } else if (mode === "production") {
    return {
      plugins: [
        vue(),
        AutoImport({
          resolvers: [ElementPlusResolver()],
        }),
        Components({
          resolvers: [ElementPlusResolver()],
        }),
      ],
      resolve: {
        alias: {
          "@": resolve(__dirname, "src"),
          "/image": "src/assets/image",
        },
        extensions: [".js"],
      },
    }
  }
})
