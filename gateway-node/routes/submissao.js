// Rotas de Submissão
const express = require("express");
const router = express.Router();
const submissaoController = require("../controllers/submissaoController");

/**
 * POST /api/submissao/proposta
 * Submeter uma nova proposta de TCC
 */
router.post("/proposta", submissaoController.submeterProposta);

/**
 * GET /api/submissao/proposta/:aluno_id
 * Listar propostas de um aluno
 */
router.get("/proposta/:aluno_id", submissaoController.listarPropostas);

module.exports = router;
