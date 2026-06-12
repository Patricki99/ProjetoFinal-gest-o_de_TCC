// Controller para Avaliação/Feedback
const { v4: uuidv4 } = require("uuid");
const zmqClient = require("../services/zmqClient");

const avaliacaoController = {
  /**
   * Obter feedback de um aluno
   * GET /api/avaliacao/feedback/:aluno_id
   */
  async obterFeedback(req, res, next) {
    try {
      const { aluno_id } = req.params;

      res.json({
        aluno_id: parseInt(aluno_id),
        feedbacks: [
          {
            id: uuidv4(),
            data: new Date().toISOString(),
            feedback: "Revisar introdução e metodologia. Adicionar mais referências.",
            secoes_criticas: ["introdução", "metodologia"],
            prazo: "5 dias",
            status: "pendente"
          }
        ]
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obter nota parcial
   * GET /api/avaliacao/nota-parcial/:aluno_id
   */
  async obterNotaParcial(req, res, next) {
    try {
      const { aluno_id } = req.params;

      res.json({
        aluno_id: parseInt(aluno_id),
        nota: 7.5,
        status: "tcc1_aprovado",
        criterios: {
          estrutura: 8.0,
          conteudo: 7.5,
          originalidade: 7.0
        },
        data_atribuicao: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obter nota final
   * GET /api/avaliacao/nota-final/:aluno_id
   */
  async obterNotaFinal(req, res, next) {
    try {
      const { aluno_id } = req.params;

      res.json({
        aluno_id: parseInt(aluno_id),
        nota: 8.5,
        status: "defesa_aprovada",
        criterios: {
          conteudo: 8.5,
          apresentacao: 8.0,
          defesa: 8.5,
          originalidade: 8.0
        },
        data_atribuicao: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obter histórico de avaliações
   * GET /api/avaliacao/historico/:aluno_id
   */
  async obterHistorico(req, res, next) {
    try {
      const { aluno_id } = req.params;

      res.json({
        aluno_id: parseInt(aluno_id),
        avaliacoes: [
          {
            fase: "desenvolvimento",
            feedback_count: 3,
            ultima_feedback: new Date(Date.now() - 86400000).toISOString()
          },
          {
            fase: "parcial",
            nota: 7.5,
            data: new Date(Date.now() - 172800000).toISOString(),
            status: "aprovado"
          },
          {
            fase: "final",
            nota: 8.5,
            data: new Date().toISOString(),
            status: "aprovado"
          }
        ]
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Enviar feedback do orientador
   * POST /api/avaliacao/feedback
   */
  async enviarFeedback(req, res, next) {
    try {
      const { aluno_id, feedback, secoes_criticas } = req.body;

      const evento = {
        evento: "feedback_enviado",
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        aluno_id,
        payload: {
          feedback,
          secoes_criticas: secoes_criticas || [],
          prazo: "7 dias"
        }
      };

      await zmqClient.publishEvent("avaliacao", evento);

      res.status(201).json({
        success: true,
        message: "Feedback enviado com sucesso",
        id: evento.id
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = avaliacaoController;
