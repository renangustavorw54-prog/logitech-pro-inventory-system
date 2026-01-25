import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  console.log("[Server] Iniciando processo de startup...");
  
  // Diagnóstico de Variáveis de Ambiente
  console.log("[Config] Verificando variáveis de ambiente críticas:");
  const criticalVars = [
    { name: "DATABASE_URL", value: process.env.DATABASE_URL },
    { name: "JWT_SECRET", value: process.env.JWT_SECRET },
    { name: "VITE_APP_ID", value: process.env.VITE_APP_ID },
    { name: "OAUTH_SERVER_URL", value: process.env.OAUTH_SERVER_URL },
    { name: "NODE_ENV", value: process.env.NODE_ENV }
  ];
  
  criticalVars.forEach(v => {
    const status = v.value ? "✅ Definida" : "❌ FALTANDO";
    console.log(`[Config] ${v.name.padEnd(20)}: ${status}`);
  });
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // Healthcheck route for Railway (must be simple HTTP, not tRPC)
  app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true, timestamp: Date.now() });
  });

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // O Railway precisa que o host seja exatamente 0.0.0.0 e use a porta da variável de ambiente PORT
  const port = parseInt(process.env.PORT || "3000");
  console.log(`[Server] Tentando escutar na porta: ${port}`);

  // IMPORTANTE: O Railway exige 0.0.0.0 para tráfego externo
  const host = "0.0.0.0";
  
  server.listen(port, host, () => {
    console.log(`🚀 SERVER_READY: Servidor escutando em ${host}:${port}`);
    console.log(`🔗 HEALTHCHECK_ENDPOINT: http://${host}:${port}/health`);
  }).on('error', (err) => {
    console.error("[Server] Erro ao iniciar o servidor HTTP:", err);
    process.exit(1);
  });
}

console.log("[Server] Chamando startServer()...");
startServer().catch((err) => {
  console.error("[Server] Erro fatal no startServer:", err);
  process.exit(1);
});
