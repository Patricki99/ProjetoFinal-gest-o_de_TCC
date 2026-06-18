// Backend Gateway (BFF) - traduz HTTP <-> ZeroMQ e repassa eventos via WebSocket
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const zmqClient = require("./services/zmqClient");
const { GATEWAY_CONFIG } = require("./config/zmq");
const { requestLogger, errorHandler } = require("./middleware/logger");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: GATEWAY_CONFIG.cors });

app.use(cors(GATEWAY_CONFIG.cors));
app.use(express.json({ limit: "10mb" }));
app.use(requestLogger);

app.get("/", (req, res) => res.json({ nome: "Gateway TCC", status: "online" }));
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/documentos", require("./routes/documentos"));
app.use("/api/v1/avaliacao", require("./routes/avaliacao"));
app.use("/api/v1/banca", require("./routes/banca"));
app.use("/api/v1/relatorios", require("./routes/relatorios"));
app.use("/api/v1/sistema", require("./routes/sistema"));

// WebSocket: repassa eventos da malha para o frontend
io.on("connection", (socket) => {
  socket.on("subscribe", ({ aluno_id }) => socket.join(`aluno_${aluno_id}`));
});
zmqClient.on("evento", (ev) => {
  if (ev.dados && ev.dados.aluno_id) io.to(`aluno_${ev.dados.aluno_id}`).emit("evento", ev);
  io.emit("evento_sistema", ev);
});

app.use((req, res) => res.status(404).json({ error: "Rota nao encontrada" }));
app.use(errorHandler);

async function inicializar() {
  await zmqClient.start();
  server.listen(GATEWAY_CONFIG.port, GATEWAY_CONFIG.host, () =>
    console.log(`✅ Gateway em http://${GATEWAY_CONFIG.host}:${GATEWAY_CONFIG.port}`));
  const fim = async () => { await zmqClient.shutdown(); process.exit(0); };
  process.on("SIGINT", fim); process.on("SIGTERM", fim);
}
if (require.main === module) inicializar().catch((e) => { console.error(e); process.exit(1); });
module.exports = { app, server, io };
