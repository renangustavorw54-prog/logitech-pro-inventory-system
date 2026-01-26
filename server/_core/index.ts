import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import * as db from "../db";

async function startServer() {
  const app = express();
  const server = createServer(app);

  // ✅ MANTIDO: Rota de saúde que garantiu o "Active" verde
  app.get("/health", (req, res) => {
    res.status(200).send("OK");
  });

  // Restaurando Middlewares
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Restaurando Rotas de Negócio
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Servir Frontend
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || 3000);
  const host = "0.0.0.0";

  server.listen(port, host, () => {
    console.log(`🚀 SISTEMA LOGITECH PRO ONLINE`);
    console.log(`📍 Porta: ${port} | Host: ${host}`);
    
    // Conexão com banco em background para não travar o healthcheck
    db.getDb().then(() => {
      console.log("✅ Banco de dados conectado com sucesso!");
    }).catch(err => {
      console.error("⚠️ Aviso: Banco de dados ainda não conectou, mas o servidor continua online.");
    });
  });
}

startServer().catch(err => {
  console.error("Erro fatal:", err);
  process.exit(1);
});
