import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: Number(process.env.OPS_CHAT_UI_PORT) || 5190,
    proxy: {
      // Points at `nanite serve`. Overridable because 8090 is a popular
      // port — matches Flux's own convention for the same backend.
      "/api": {
        target: `http://localhost:${process.env.NANITE_API_PORT || 8090}`,
        changeOrigin: true,
      },
    },
  },
})
