// Configuração de portas ZMQ e endereços
const ZMQ_CONFIG = {
  submissao: {
    address: "tcp://localhost:5560",
    pattern: "PUB",
    events: ["proposta_submetida"]
  },
  documentos: {
    address: "tcp://localhost:5555",
    pattern: "PUB",
    events: ["versao_submetida", "versao_parcial_entregue", "versao_final_entregue"]
  },
  avaliacao: {
    address: "tcp://localhost:5563",
    pattern: "PUB",
    events: ["feedback_enviado", "nota_parcial_atribuida"]
  },
  ia: {
    address: "tcp://localhost:5562",
    pattern: "PUB",
    events: ["pendencias_identificadas", "feedback_atendido", "analise_banca_consolidada"]
  },
  banca: {
    address: "tcp://localhost:5564",
    pattern: "PUB",
    events: ["comentarios_banca_enviados", "nota_banca_submetida"]
  },
  notificacao: {
    address: "tcp://localhost:5566",
    pattern: "PUB",
    events: ["*"]
  },
  relatorio: {
    address: "tcp://localhost:5565",
    pattern: "PULL",
    events: ["relatorio_gerado"]
  }
};

// Configuração do Gateway
const GATEWAY_CONFIG = {
  port: process.env.PORT || 3000,
  host: process.env.HOST || "localhost",
  wsPort: process.env.WS_PORT || 3001,
  
  // Timeout para requisições ZMQ (ms)
  zmqTimeout: 5000,
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }
};

module.exports = {
  ZMQ_CONFIG,
  GATEWAY_CONFIG
};
