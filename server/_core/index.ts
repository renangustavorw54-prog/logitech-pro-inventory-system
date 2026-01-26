import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // 1. Rota de Healthcheck IMEDIATA (antes de qualquer outra lógica)
  // Isso garante que o Railway receba 200 OK mesmo se o resto demorar
  app.get("/health", (_req, res) => {
    res.status(200).send("OK");
  });

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  registerOAuthRoutes(app);

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // 2. Forçar o uso da porta do Railway sem frescuras
  const port = Number(process.env.PORT || 3000);
  const host = "0.0.0.0";

  server.listen(port, host, () => {
    console.log(`🚀 SERVER_READY: Escutando em ${host}:${port}`);
  });
}

// Iniciar sem travar o processo principal
startServer().catch((err) => {
  console.error("❌ Erro fatal no servidor:", err);
  process.exit(1);
});
