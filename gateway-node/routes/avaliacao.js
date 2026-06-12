// Rotas de Avaliação/Feedback
const express = require("express");
const router = express.Router();
const avaliacaoController = require("../controllers/avaliacaoController");

/**
 * GET /api/avaliacao/feedback/:aluno_id
 * Obter feedback de um aluno
 */
router.get("/feedback/:aluno_id", avaliacaoController.obterFeedback);

/**
 * GET /api/avaliacao/nota-parcial/:aluno_id
 * Obter nota parcial
 */
router.get("/nota-parcial/:aluno_id", avaliacaoController.obterNotaParcial);

/**
 * GET /api/avaliacao/nota-final/:aluno_id
 * Obter nota final
 */
router.get("/nota-final/:aluno_id", avaliacaoController.obterNotaFinal);

/**
 * GET /api/avaliacao/historico/:aluno_id
 * Obter histórico de avaliações
 */
router.get("/historico/:aluno_id", avaliacaoController.obterHistorico);

/**
 * POST /api/avaliacao/feedback
 * Enviar feedback do orientador
 */
router.post("/feedback", avaliacaoController.enviarFeedback);

module.exports = router;
