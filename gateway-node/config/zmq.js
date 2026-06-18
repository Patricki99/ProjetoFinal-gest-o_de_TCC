// Portas ZeroMQ do gateway.
//  - PUB (bind 5570): injeta comandos do cliente na malha (PUB/SUB).
//  - SUB (connect): ouve os eventos dos servicos e os repassa ao WebSocket.
//  - DEALER (connect 5561): login sincrono no servico de Autenticacao (DEALER/ROUTER).
//  - PUSH (connect 5567): solicita relatorios ao coordenador de Relatorios (PUSH/PULL).
require("dotenv").config();
const PORTAS = {
  gateway: 5570, documentos: 5555, ia: 5562, avaliacao: 5563, notificacao: 5566,
  autenticacao: 5561, banca: 5564, relatorio: 5565, relatorio_req: 5567,
};

// Host (IP) de cada peer. Padrao localhost. Para multi-maquina, defina
// HOST_<SERVICO> (ex.: HOST_NOTIFICACAO=192.168.0.11) ou ZMQ_HOST p/ todos.
function hostOf(nome) {
  return process.env[`HOST_${nome.toUpperCase()}`] || process.env.ZMQ_HOST || "localhost";
}
const addr = (nome) => `tcp://${hostOf(nome)}:${PORTAS[nome]}`;

const ZMQ = {
  gatewayBind: `tcp://*:${PORTAS.gateway}`,
  subscribeTo: ["documentos", "ia", "avaliacao", "notificacao", "banca", "relatorio"].map(addr),
  authDealer: addr("autenticacao"),     // DEALER -> ROUTER da Autenticacao
  relatorioReq: addr("relatorio_req"),  // PUSH  -> coordenador de Relatorios
};

const GATEWAY_CONFIG = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || "localhost",   // use 0.0.0.0 para aceitar acesso de outra maquina
  cors: {
    origin: process.env.CORS_ORIGIN || "*", // prototipo: libera a interface (inclusive de outra maquina)
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
};
module.exports = { ZMQ, PORTAS, GATEWAY_CONFIG };
