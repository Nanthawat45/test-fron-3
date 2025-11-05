import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),       // React Fast Refresh
    tailwindcss(), // TailwindCSS 4.x Plugin
  ],
  server: {
    port: 5173,      // Default port
    open: true,      // เปิด browser อัตโนมัติ
    cors: true,      // เปิด CORS ระหว่าง dev
    host: "0.0.0.0", // ให้เข้าผ่าน LAN ได้
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 800,
  },
});
