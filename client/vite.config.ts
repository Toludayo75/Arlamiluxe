// client/vite.config.ts
import { defineConfig, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

const API_PORT = process.env.PORT || "5000";

// Dev proxy only, production ignores this
const proxy: Record<string, string | ProxyOptions> = {
  "/api": {
    target: `http://localhost:${API_PORT}`,
    changeOrigin: true,
    secure: false,
  },
  "/uploads": {
    target: `http://localhost:${API_PORT}`,
    changeOrigin: true,
    secure: false,
  },
  "/generated_images": {
    target: `http://localhost:${API_PORT}`,
    changeOrigin: true,
    secure: false,
  },
};

export default defineConfig({
  // Use project root for env files
  envDir: path.resolve(__dirname, ".."),

  // ✅ Key fix: relative paths so assets load in Render
  base: "./",

  plugins: [
    react(),
    tsconfigPaths(), // allows @ path aliases
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },

  server: {
    port: 5173,
    proxy,
  },

  build: {
    outDir: "dist", // Vite builds here
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "@tanstack/react-query"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-toast",
          ],
          utils: ["clsx", "class-variance-authority", "lucide-react"],
        },
      },
    },
  },
});
