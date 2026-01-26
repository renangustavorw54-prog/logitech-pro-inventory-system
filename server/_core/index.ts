import "dotenv/config";
import express from "express";
import { createServer } from "http";

async function startServer() {
  console.log("\n=== 🔍 DIAGNÓSTICO DE AMBIENTE RAILWAY ===");
  console.log(`PORT enviada pelo Railway: ${process.env.PORT}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`DATABASE_URL presente: ${process.env.DATABASE_URL ? "SIM" : "NÃO"}`);
  console.log("==========================================\n");

  const app = express();
  const server = createServer(app);

  // Rota de saúde absoluta - Responde em qualquer circunstância
  app.get("/health", (req, res) => {
    console.log(`[Health] Pingo recebido de ${req.ip} às ${new Date().toISOString()}`);
    res.status(200).send("OK");
  });

  // Rota raiz para teste manual
  app.get("/", (_req, res) => {
    res.status(200).send("Servidor Logitech Pro está ONLINE!");
  });

  const port = Number(process.env.PORT || 3000);
  const host = "0.0.0.0";

  try {
    server.listen(port, host, () => {
      console.log(`🚀 [Sucesso] Servidor escutando em http://${host}:${port}`);
      console.log(`📍 Teste o healthcheck em: http://${host}:${port}/health`);
    });
  } catch (err) {
    console.error("❌ [Erro] Falha ao iniciar listen:", err);
  }
}

// Início imediato
console.log("Iniciando script de boot...");
startServer().catch(err => console.error("Erro fatal no boot:", err));
