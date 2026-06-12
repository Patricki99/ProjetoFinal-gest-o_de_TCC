// Controller para Submissão de Propostas
const { v4: uuidv4 } = require("uuid");
const zmqClient = require("../services/zmqClient");

const submissaoController = {
  /**
   * Submeter uma proposta de TCC
   * POST /api/submissao/proposta
   */
  async submeterProposta(req, res, next) {
    try {
      const { aluno_id, titulo, descricao } = req.body;

      // Validação
      if (!aluno_id || !titulo || !descricao) {
        return res.status(400).json({
          error: "Campos obrigatórios: aluno_id, titulo, descricao"
        });
      }

      // Criar evento
      const evento = {
        evento: "proposta_submetida",
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        aluno_id,
        payload: {
          titulo,
          descricao,
          status: "pendente_avaliacao"
        }
      };

      // Publicar no ZMQ
      await zmqClient.publishEvent("submissao", evento);

      res.status(201).json({
        success: true,
        message: "Proposta submetida com sucesso",
        id: evento.id,
        aluno_id
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Listar propostas de um aluno
   * GET /api/submissao/proposta/:aluno_id
   */
  async listarPropostas(req, res, next) {
    try {
      const { aluno_id } = req.params;

      // Em produção, buscar do MySQL
      // Por enquanto, retornar exemplo
      res.json({
        aluno_id: parseInt(aluno_id),
        propostas: [
          {
            id: uuidv4(),
            titulo: "Análise de Desempenho em Sistemas Distribuídos",
            descricao: "Um estudo comparativo...",
            status: "aprovada",
            data_submissao: new Date().toISOString()
          }
        ]
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = submissaoController;
