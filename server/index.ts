// server/index.ts
import "dotenv/config"; 
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

import { db } from "./db";

log(`PAYSTACK_SECRET_KEY loaded: ${Boolean(process.env.PAYSTACK_SECRET_KEY)}`);
log(`PAYSTACK_BASE_URL = ${process.env.PAYSTACK_BASE_URL ?? "https://api.paystack.co"}`);

const app = express();
const MemStoreSession = MemoryStore(session);

// ----- SESSION -----
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
    resave: false,
    saveUninitialized: true,
    store: new MemStoreSession({ checkPeriod: 86400000 }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    },
  })
);

// Extend types
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}
declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

// ----- BODY PARSING -----
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

// Note: No static mount for '/attached_assets' to avoid exposing local static paths.
// Public asset URLs should be provided via the DB (images.path) and hosted on a CDN or storage service.
// ----- LOGGING -----
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

// ----- MAIN -----
(async () => {
  const server = await registerRoutes(app);

  // ----- ERROR HANDLING -----
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // ----- DYNAMIC PORT -----
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000; // fixed port 5000

  // ----- DEV VS PROD -----
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server); // dev HMR + cache-busting
  } else {
    serveStatic(app); // serve built client
  }

server.listen(port, "0.0.0.0", () => {
  log(`Server running on port ${port}`);
});
})();
