// server/vite.ts
import express, { type Express, type Request, type Response } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger, type ViteDevServer } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

/** Setup Vite in dev mode */
export async function setupVite(app: Express, server: Server) {
  const vite: ViteDevServer = await createViteServer({
    configFile: path.resolve(import.meta.dirname, "../client/vite.config.ts"),
    server: { middlewareMode: true, hmr: { server }, allowedHosts: true },
    appType: "custom",
    customLogger: viteLogger,
  });

  const generatedImagesPath = path.resolve(import.meta.dirname, "../client/src/assets/generated_images");
  if (fs.existsSync(generatedImagesPath)) {
    app.use("/generated_images", express.static(generatedImagesPath));
  }

  app.use(vite.middlewares);

  // SPA fallback
  app.use("*", async (req: Request, res: Response) => {
    const url = req.originalUrl;
    const clientIndex = path.resolve(import.meta.dirname, "../client/index.html");
    let template = await fs.promises.readFile(clientIndex, "utf-8");
    template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
    const html = await vite.transformIndexHtml(url, template);
    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });
}

/** Serve static files in production */
export function serveStatic(app: Express) {
  // Use __dirname and go to server/public reliably
  const distPath = path.resolve(__dirname, "../public"); // from server/dist -> ../public = server/public

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}. Run "npm run build" first.`
    );
  }

  // Serve static files
  app.use(express.static(distPath));

  // SPA fallback
  app.use("*", (_req: Request, res: Response) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });

  console.log(`[express] Serving frontend from: ${distPath}`);
}
