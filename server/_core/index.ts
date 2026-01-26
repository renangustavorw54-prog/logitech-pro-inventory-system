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

  // MODO DE EMERGÊNCIA: Rota de saúde no topo absoluto, sem nenhum middleware antes
  app.get("/health", (req, res) => {
    console.log(`[Health] Recebido pingo de: ${req.ip}`);
    res.status(200).send("OK");
  });

  // Middlewares básicos
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Rotas
  registerOAuthRoutes(app);
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Forçar porta e host padrão Railway
  const port = Number(process.env.PORT || 3000);
  const host = "0.0.0.0";

  server.listen(port, host, () => {
    console.log(`\n🚀 SERVIDOR ONLINE`);
    console.log(`📍 Porta: ${port}`);
    console.log(`📍 Host: ${host}`);
  });
}

startServer().catch(err => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
