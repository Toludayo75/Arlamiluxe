import { defineConfig, type ProxyOptions } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

const API_PORT = process.env.PORT || "5000";

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
  envDir: path.resolve(__dirname, ".."),
  base: "./", // ✅ relative paths for production
  plugins: [react(), tsconfigPaths()],
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
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', '@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
          utils: ['clsx', 'class-variance-authority', 'lucide-react'],
        },
      },
    },
  },
});
