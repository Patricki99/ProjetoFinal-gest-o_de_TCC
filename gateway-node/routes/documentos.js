// Rotas de Documentos/Versões
const express = require("express");
const router = express.Router();
const documentosController = require("../controllers/documentosController");

/**
 * POST /api/documentos/versao
 * Submeter uma nova versão do documento
 */
router.post("/versao", documentosController.submeterVersao);

/**
 * GET /api/documentos/historico/:aluno_id
 * Obter histórico de versões de um aluno
 */
router.get("/historico/:aluno_id", documentosController.obterHistorico);

/**
 * POST /api/documentos/versao-parcial
 * Submeter versão parcial (TCC 1)
 */
router.post("/versao-parcial", documentosController.submeterVersaoParcial);

/**
 * POST /api/documentos/versao-final
 * Submeter versão final (TCC 2)
 */
router.post("/versao-final", documentosController.submeterVersaoFinal);

module.exports = router;
