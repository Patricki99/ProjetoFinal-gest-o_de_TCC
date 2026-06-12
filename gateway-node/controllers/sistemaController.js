// Controller para Sistema/Status
const zmqClient = require("../services/zmqClient");

const sistemaController = {
  /**
   * Verificar saúde do sistema
   * GET /api/sistema/health
   */
  async healthCheck(req, res, next) {
    try {
      const zmqHealth = await zmqClient.healthCheck();

      res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        gateway: {
          uptime: process.uptime(),
          memory: process.memoryUsage()
        },
        zmq: zmqHealth
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obter notificações de um aluno
   * GET /api/sistema/notificacoes/:aluno_id
   */
  async obterNotificacoes(req, res, next) {
    try {
      const { aluno_id } = req.params;

      res.json({
        aluno_id: parseInt(aluno_id),
        notificacoes: [
          {
            id: "1",
            tipo: "alerta",
            mensagem: "⚠️ Pendências identificadas no seu TCC",
            data: new Date().toISOString(),
            lida: false
          },
          {
            id: "2",
            tipo: "feedback",
            mensagem: "📝 Novo feedback do seu orientador",
            data: new Date(Date.now() - 86400000).toISOString(),
            lida: true
          },
          {
            id: "3",
            tipo: "sucesso",
            mensagem: "✅ Você foi aprovado na defesa!",
            data: new Date(Date.now() - 172800000).toISOString(),
            lida: true
          }
        ]
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Marcar notificação como lida
   * PUT /api/sistema/notificacoes/:notificacao_id/lida
   */
  async marcarComoLida(req, res, next) {
    try {
      const { notificacao_id } = req.params;

      res.json({
        success: true,
        message: "Notificação marcada como lida",
        notificacao_id
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obter status geral do aluno
   * GET /api/sistema/status/:aluno_id
   */
  async obterStatus(req, res, next) {
    try {
      const { aluno_id } = req.params;

      res.json({
        aluno_id: parseInt(aluno_id),
        status_geral: "em_desenvolvimento",
        fase_atual: "tcc2",
        dados: {
          proposta: {
            status: "aprovada",
            data_aprovacao: new Date(Date.now() - 2592000000).toISOString()
          },
          versoes: {
            total: 8,
            ultima_data: new Date().toISOString()
          },
          feedbacks: {
            total: 5,
            pendentes: 0
          },
          notas: {
            parcial: 7.5,
            final: null,
            banca: null
          },
          defesa: {
            agendada: true,
            data: new Date(Date.now() + 604800000).toISOString(),
            avaliadores: 3
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = sistemaController;
