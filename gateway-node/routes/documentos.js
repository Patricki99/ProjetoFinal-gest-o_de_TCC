const router = require("express").Router();
const c = require("../controllers/documentosController");
const { autenticar, autorizar } = require("../middleware/auth");

// aluno submete versao; aluno/orientador consultam o historico (RBAC)
router.post("/versao", autenticar, autorizar("aluno"), c.submeterVersao);
router.get("/historico/:aluno_id", autenticar, c.obterHistorico);
module.exports = router;
