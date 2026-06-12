// Controller para Documentos/Versões
const { v4: uuidv4 } = require("uuid");
const zmqClient = require("../services/zmqClient");

const documentosController = {
  /**
   * Submeter uma nova versão do documento
   * POST /api/documentos/versao
   */
  async submeterVersao(req, res, next) {
    try {
      const { aluno_id, texto, tipo } = req.body;

      if (!aluno_id || !texto) {
        return res.status(400).json({
          error: "Campos obrigatórios: aluno_id, texto"
        });
      }

      const tipoVersao = tipo || "desenvolvimento"; // desenvolvimento|parcial|final

      const evento = {
        evento: "versao_submetida",
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        aluno_id,
        payload: {
          texto,
          tipo: tipoVersao,
          caracteres: texto.length
        }
      };

      // Publicar no ZMQ
      await zmqClient.publishEvent("documentos", evento);

      res.status(201).json({
        success: true,
        message: "Versão submetida com sucesso",
        id: evento.id,
        aluno_id,
        tipo: tipoVersao
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Obter histórico de versões de um aluno
   * GET /api/documentos/historico/:aluno_id
   */
  async obterHistorico(req, res, next) {
    try {
      const { aluno_id } = req.params;

      res.json({
        aluno_id: parseInt(aluno_id),
        versoes: [
          {
            id: uuidv4(),
            tipo: "desenvolvimento",
            data: new Date().toISOString(),
            caracteres: 5000,
            status: "em_revisao"
          },
          {
            id: uuidv4(),
            tipo: "parcial",
            data: new Date(Date.now() - 86400000).toISOString(),
            caracteres: 12000,
            status: "avaliado"
          }
        ]
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Submeter versão parcial (TCC 1)
   * POST /api/documentos/versao-parcial
   */
  async submeterVersaoParcial(req, res, next) {
    try {
      const { aluno_id, texto } = req.body;

      const evento = {
        evento: "versao_parcial_entregue",
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        aluno_id,
        payload: {
          texto,
          tipo: "parcial",
          caracteres: texto.length
        }
      };

      await zmqClient.publishEvent("documentos", evento);

      res.status(201).json({
        success: true,
        message: "Versão parcial entregue com sucesso",
        id: evento.id
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Submeter versão final (TCC 2)
   * POST /api/documentos/versao-final
   */
  async submeterVersaoFinal(req, res, next) {
    try {
      const { aluno_id, texto } = req.body;

      const evento = {
        evento: "versao_final_entregue",
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        aluno_id,
        payload: {
          texto,
          tipo: "final",
          caracteres: texto.length
        }
      };

      await zmqClient.publishEvent("documentos", evento);

      res.status(201).json({
        success: true,
        message: "Versão final entregue com sucesso",
        id: evento.id
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = documentosController;
