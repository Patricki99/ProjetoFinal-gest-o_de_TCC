// Servidor Principal - Gateway Node.js
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const zmqClient = require("./services/zmqClient");
const { GATEWAY_CONFIG } = require("./config/zmq");
const { requestLogger, errorHandler } = require("./middleware/logger");

// Importar rotas
const submissaoRoutes = require("./routes/submissao");
const documentosRoutes = require("./routes/documentos");
const avaliacaoRoutes = require("./routes/avaliacao");
const sistemaRoutes = require("./routes/sistema");

// Criar aplicação Express
const app = express();
const server = http.createServer(app);

// Configurar Socket.IO para notificações em tempo real
const io = socketIO(server, {
  cors: GATEWAY_CONFIG.cors
});

// ═══════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════

app.use(cors(GATEWAY_CONFIG.cors));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(requestLogger);

// ═══════════════════════════════════════════════════════════════
// ROTAS
// ═══════════════════════════════════════════════════════════════

// Rota de health check
app.get("/", (req, res) => {
  res.json({
    nome: "Gateway TCC",
    versao: "1.0.0",
    status: "online",
    timestamp: new Date().toISOString()
  });
});

// API v1
const apiPrefix = "/api/v1";

app.use(`${apiPrefix}/submissao`, submissaoRoutes);
app.use(`${apiPrefix}/documentos`, documentosRoutes);
app.use(`${apiPrefix}/avaliacao`, avaliacaoRoutes);
app.use(`${apiPrefix}/sistema`, sistemaRoutes);

// Documentação de rotas
app.get("/api/docs", (req, res) => {
  res.json({
    mensagem: "API Gateway - Sistema de Gestão de TCC",
    versao: "1.0.0",
    endpoints: {
      submissao: {
        "POST /api/v1/submissao/proposta": "Submeter proposta de TCC",
        "GET /api/v1/submissao/proposta/:aluno_id": "Listar propostas"
      },
      documentos: {
        "POST /api/v1/documentos/versao": "Submeter versão",
        "GET /api/v1/documentos/historico/:aluno_id": "Histórico de versões",
        "POST /api/v1/documentos/versao-parcial": "Submeter versão parcial",
        "POST /api/v1/documentos/versao-final": "Submeter versão final"
      },
      avaliacao: {
        "GET /api/v1/avaliacao/feedback/:aluno_id": "Obter feedbacks",
        "GET /api/v1/avaliacao/nota-parcial/:aluno_id": "Nota parcial",
        "GET /api/v1/avaliacao/nota-final/:aluno_id": "Nota final",
        "GET /api/v1/avaliacao/historico/:aluno_id": "Histórico",
        "POST /api/v1/avaliacao/feedback": "Enviar feedback"
      },
      sistema: {
        "GET /api/v1/sistema/health": "Saúde do sistema",
        "GET /api/v1/sistema/notificacoes/:aluno_id": "Notificações",
        "PUT /api/v1/sistema/notificacoes/:id/lida": "Marcar como lida",
        "GET /api/v1/sistema/status/:aluno_id": "Status do aluno"
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// WEBSOCKET - NOTIFICAÇÕES EM TEMPO REAL
// ═══════════════════════════════════════════════════════════════

io.on("connection", (socket) => {
  console.log(`[WebSocket] Cliente conectado: ${socket.id}`);

  // Aluno se inscreve em atualizações
  socket.on("subscribe", (data) => {
    const { aluno_id } = data;
    socket.join(`aluno_${aluno_id}`);
    console.log(`[WebSocket] Aluno ${aluno_id} se inscreveu`);
    socket.emit("subscribed", { aluno_id });
  });

  socket.on("disconnect", () => {
    console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
  });
});

// Quando um evento chega do ZMQ, broadcasting para clientes interessados
zmqClient.on("evento", (evento) => {
  const { aluno_id, tipo, dados } = evento;
  
  // Emitir para aluno específico
  io.to(`aluno_${aluno_id}`).emit("evento", {
    tipo,
    dados,
    timestamp: new Date().toISOString()
  });

  // Também emitir para admins/coordenação
  io.emit("evento_sistema", evento);
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

app.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    path: req.path,
    metodo: req.method
  });
});

app.use(errorHandler);

// ═══════════════════════════════════════════════════════════════
// INICIALIZAR SERVIDOR
// ═══════════════════════════════════════════════════════════════

const PORT = GATEWAY_CONFIG.port;
const HOST = GATEWAY_CONFIG.host;

async function inicializarServidor() {
  try {
    // Iniciar ZMQ Client
    console.log("\n🚀 Inicializando Gateway...\n");
    await zmqClient.start();

    // Iniciar servidor HTTP
    server.listen(PORT, HOST, () => {
      console.log(`\n✅ Gateway rodando em http://${HOST}:${PORT}`);
      console.log(`📚 Documentação: http://${HOST}:${PORT}/api/docs`);
      console.log(`🔌 WebSocket ativo em http://${HOST}:${PORT}`);
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    });

    // Graceful shutdown
    process.on("SIGTERM", async () => {
      console.log("\n⛔ SIGTERM recebido, encerrando...");
      server.close(async () => {
        await zmqClient.shutdown();
        process.exit(0);
      });
    });

    process.on("SIGINT", async () => {
      console.log("\n⛔ SIGINT recebido, encerrando...");
      server.close(async () => {
        await zmqClient.shutdown();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Erro ao inicializar Gateway:", error);
    process.exit(1);
  }
}

// Iniciar servidor
if (require.main === module) {
  inicializarServidor();
}

module.exports = { app, server, io };
