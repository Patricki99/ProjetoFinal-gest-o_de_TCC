// Rotas de Sistema/Status
const express = require("express");
const router = express.Router();
const sistemaController = require("../controllers/sistemaController");

/**
 * GET /api/sistema/health
 * Verificar saúde do sistema
 */
router.get("/health", sistemaController.healthCheck);

/**
 * GET /api/sistema/notificacoes/:aluno_id
 * Obter notificações de um aluno
 */
router.get("/notificacoes/:aluno_id", sistemaController.obterNotificacoes);

/**
 * PUT /api/sistema/notificacoes/:notificacao_id/lida
 * Marcar notificação como lida
 */
router.put("/notificacoes/:notificacao_id/lida", sistemaController.marcarComoLida);

/**
 * GET /api/sistema/status/:aluno_id
 * Obter status geral do aluno
 */
router.get("/status/:aluno_id", sistemaController.obterStatus);

module.exports = router;
