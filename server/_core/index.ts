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

  // --- PRIORIDADE MÁXIMA: Healthcheck ---
  // Esta rota deve estar acima de qualquer middleware para responder instantaneamente
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

  const port = Number(process.env.PORT || 3000);
  const host = "0.0.0.0";

  // --- O PULO DO GATO: Listen primeiro, Banco depois ---
  server.listen(port, host, () => {
    console.log(`\n🚀 [Network] Servidor ONLINE em ${host}:${port}`);
    console.log(`✅ [Health] Rota /health pronta para o exame de saúde.`);
    
    // Inicia a conexão com o banco em paralelo, sem bloquear o Healthcheck
    console.log(`⏳ [Database] Iniciando conexão com o banco em background...`);
    db.getDb().then(() => {
      console.log(`✅ [Database] Banco de dados conectado com sucesso!`);
    }).catch(err => {
      console.error(`❌ [Database] Erro na conexão de background:`, err.message);
    });
  });
}

startServer().catch((err) => {
  console.error("❌ [Fatal] Erro ao iniciar servidor:", err);
  process.exit(1);
});
