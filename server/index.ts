import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./db";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve the Bovinet HTML file as the main page
app.get('/', (req, res) => {
  res.sendFile(path.resolve('bovinet-direto.html'));
});

app.get('/bovinet-direto.html', (req, res) => {
  res.sendFile(path.resolve('bovinet-direto.html'));
});

// Configure session once in the main server file
const PgSession = connectPgSimple(session);
app.use(
  session({
    store: new PgSession({
      pool: pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "development-secret-key-bovinet-2025",
    resave: false,
    saveUninitialized: false,
    name: "bovinet.sid",
    cookie: {
      secure: false, // Always false for development 
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    },
    rolling: true, // Reset expiration on each request
  })
);

// Serve uploaded files with proper headers for video playback
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, path) => {
    if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (path.endsWith('.mov')) {
      res.setHeader('Content-Type', 'video/quicktime');
    } else if (path.endsWith('.avi')) {
      res.setHeader('Content-Type', 'video/x-msvideo');
    }
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  
  // Teste direto para debug
  app.get('/test-direct', (_req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>BOVINET - Teste Direto</title>
          <meta charset="UTF-8">
      </head>
      <body style="background-color: #1E2A38; color: white; padding: 20px; font-family: Arial;">
          <h1 style="color: #4CAF50; font-size: 48px;">BOVINET</h1>
          <h2>Sistema de Frete - Funcionando!</h2>
          <div style="background: #4CAF50; padding: 15px; border-radius: 8px; margin: 20px 0;">
              ✓ Servidor respondendo corretamente
          </div>
          <div style="background: #4CAF50; padding: 15px; border-radius: 8px; margin: 20px 0;">
              ✓ Cálculo de frete: R$ 3,50 por km implementado
          </div>
          <button onclick="alert('Funcionando!')" style="background: #4CAF50; color: white; padding: 15px 30px; border: none; border-radius: 8px; font-size: 18px; cursor: pointer;">
              Testar Interação
          </button>
          <p>Timestamp: ${new Date().toLocaleString()}</p>
          <script>
              console.log('BOVINET: Página carregada com sucesso');
          </script>
      </body>
      </html>
    `);
  });
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
