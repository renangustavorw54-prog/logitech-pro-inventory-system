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

  // --- MELHORIA 4: Rota de Health Check dedicada e pública ---
  // Responde 200 OK imediatamente sem exigir login ou redirecionar
  app.get("/health", (_req, res) => {
    res.status(200).send("OK - Server is alive");
  });

  // Configurações básicas
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Rotas de OAuth
  registerOAuthRoutes(app);

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Servir arquivos estáticos ou Vite
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // --- MELHORIA 1 & 2: Porta Dinâmica e Host Binding 0.0.0.0 ---
  // Usa a porta injetada pelo Railway e escuta em todas as interfaces de rede
  const port = Number(process.env.PORT || 3000);
  const host = "0.0.0.0";

  server.listen(port, host, () => {
    console.log(`\n--- 🚀 MELHORIAS APLICADAS ---`);
    console.log(`✅ PORTA: ${port} (via process.env.PORT)`);
    console.log(`✅ HOST: ${host} (Binding externo ativo)`);
    console.log(`✅ HEALTHCHECK: http://${host}:${port}/health (Público)`);
    console.log(`-----------------------------\n`);
  });
}

// --- MELHORIA 3: Tratamento de Erros para evitar crash no boot ---
startServer().catch((err) => {
  console.error("❌ ERRO CRÍTICO NA INICIALIZAÇÃO:", err);
  // Não encerra o processo imediatamente para permitir que os logs sejam lidos no Railway
  setTimeout(() => process.exit(1), 5000);
});
