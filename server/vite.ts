// server/vite.ts
import express, { type Express, type Request, type Response, type NextFunction } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger, type ViteDevServer } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

/** Simple logging function */
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

/**
 * Setup Vite middleware in development mode
 */
export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite: ViteDevServer = await createViteServer({
    configFile: path.resolve(import.meta.dirname, "../client/vite.config.ts"),
    server: serverOptions,
    appType: "custom",
    customLogger: {
      ...viteLogger,
      error: (msg: string, options?: any) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
  });

  // Serve generated images in development
  const generatedImagesPath = path.resolve(import.meta.dirname, "..", "client", "src", "assets", "generated_images");
  if (fs.existsSync(generatedImagesPath)) {
    app.use("/generated_images", express.static(generatedImagesPath));
  }

  // Apply Vite dev middlewares
  app.use(vite.middlewares);

  // Catch-all to serve index.html for SPA routing
  app.use("*", async (req: Request, res: Response, next: NextFunction) => {
    const url = req.originalUrl;
    try {
      const clientIndex = path.resolve(import.meta.dirname, "..", "client", "index.html");
      let template = await fs.promises.readFile(clientIndex, "utf-8");

      // Cache-busting for main.tsx
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (err) {
      vite.ssrFixStacktrace(err as Error);
      next(err);
    }
  });
}

/**
 * Serve static files in production
 */
export function serveStatic(app: Express) {
  // FIX: Point to server/public, where Vite build outputs
  const publicPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(publicPath)) {
    throw new Error(
      `Could not find the build directory: ${publicPath}. Run "npm run build" first.`
    );
  }

  // Serve generated images if they exist
  const generatedImagesPath = path.resolve(publicPath, "generated_images");
  if (fs.existsSync(generatedImagesPath)) {
    app.use("/generated_images", express.static(generatedImagesPath));
  }

  app.use(express.static(publicPath));

  // SPA fallback for React Router
  app.use("*", (_req: Request, res: Response) => {
    res.sendFile(path.resolve(publicPath, "index.html"));
  });

  log(`Serving frontend from: ${publicPath}`);
}