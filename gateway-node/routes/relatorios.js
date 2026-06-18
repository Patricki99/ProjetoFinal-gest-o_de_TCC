const router = require("express").Router();
const c = require("../controllers/relatoriosController");
const { autenticar, autorizar } = require("../middleware/auth");

// relatorios gerenciais: coordenador (e NDE/colegiado, mapeados ao perfil coordenador)
router.post("/gerar", autenticar, autorizar("coordenador"), c.gerar);
module.exports = router;
