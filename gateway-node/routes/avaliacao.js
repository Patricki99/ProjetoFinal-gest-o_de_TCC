const router = require("express").Router();
const c = require("../controllers/avaliacaoController");
const { autenticar, autorizar } = require("../middleware/auth");

// orientador (e coordenador) emitem o parecer padronizado (RBAC)
router.post("/feedback", autenticar, autorizar("orientador", "coordenador"), c.enviarFeedback);
router.get("/feedback/:aluno_id", autenticar, c.obterFeedback);
module.exports = router;
