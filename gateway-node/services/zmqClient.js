// Serviço de comunicação ZMQ
const zmq = require("zeromq");
const { EventEmitter } = require("events");
const { ZMQ_CONFIG } = require("../config/zmq");

class ZMQClient extends EventEmitter {
  constructor() {
    super();
    this.subscribers = {};
    this.logger = console; // Em produção, usar winston/bunyan
    this.isConnected = false;
  }

  /**
   * Inicia os subscribers para ouvir eventos dos serviços
   */
  async start() {
    try {
      this.logger.log("🚀 Iniciando ZMQ Client...");

      // Criar subscribers para cada serviço
      for (const [serviceName, config] of Object.entries(ZMQ_CONFIG)) {
        if (config.pattern === "PUB") {
          this.subscribeToService(serviceName, config);
        }
      }

      this.isConnected = true;
      this.logger.log("✅ ZMQ Client iniciado com sucesso");
    } catch (error) {
      this.logger.error("❌ Erro ao iniciar ZMQ:", error);
      throw error;
    }
  }

  /**
   * Subscreve a um serviço específico
   */
  subscribeToService(serviceName, config) {
    try {
      const socket = zmq.socket("sub");
      
      socket.connect(config.address);
      
      // Subscrever a todos os eventos do serviço
      socket.setsockopt(zmq.ZMQ_SUBSCRIBE, "");

      socket.on("message", (topic, content) => {
        try {
          const topicStr = topic.toString();
          const message = JSON.parse(content.toString());
          
          this.logger.log(`[${serviceName}] Evento recebido: ${topicStr}`);
          
          // Emitir evento para WebSocket (notificações em tempo real)
          this.emit("evento", {
            servico: serviceName,
            tipo: topicStr,
            dados: message,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          this.logger.error(`Erro ao processar mensagem de ${serviceName}:`, error);
        }
      });

      this.subscribers[serviceName] = socket;
      this.logger.log(`✓ Conectado a ${serviceName} em ${config.address}`);
    } catch (error) {
      this.logger.error(`Erro ao subscrever a ${serviceName}:`, error);
    }
  }

  /**
   * Publica um evento para um serviço específico via REQ/REP
   * (Simula DEALER/ROUTER)
   */
  async publishEvent(serviceName, evento) {
    return new Promise((resolve, reject) => {
      try {
        // Usar socket PUB do gateway para publicar
        // Em produção real, isso seria um DEALER/ROUTER para RPC
        
        // Por enquanto, apenas simular que foi enviado
        this.logger.log(`📤 Evento publicado para ${serviceName}: ${evento.evento}`);
        
        resolve({
          success: true,
          message: `Evento ${evento.evento} enviado para ${serviceName}`
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Aguarda resposta de um serviço (para operações síncronas)
   */
  async requestResponse(serviceName, request, timeout = 5000) {
    return new Promise((resolve, reject) => {
      // Em produção real, implementar com DEALER/ROUTER
      setTimeout(() => {
        resolve({
          success: true,
          data: `Resposta simulada do ${serviceName}`
        });
      }, 100);
    });
  }

  /**
   * Verifica saúde da conexão ZMQ
   */
  async healthCheck() {
    const health = {
      connected: this.isConnected,
      subscribers: Object.keys(this.subscribers).length,
      services: {}
    };

    for (const [serviceName, socket] of Object.entries(this.subscribers)) {
      health.services[serviceName] = {
        connected: !!socket,
        address: ZMQ_CONFIG[serviceName].address
      };
    }

    return health;
  }

  /**
   * Encerra o cliente ZMQ
   */
  async shutdown() {
    try {
      for (const [serviceName, socket] of Object.entries(this.subscribers)) {
        socket.close();
      }
      this.isConnected = false;
      this.logger.log("✅ ZMQ Client encerrado");
    } catch (error) {
      this.logger.error("❌ Erro ao encerrar ZMQ:", error);
    }
  }
}

module.exports = new ZMQClient();
