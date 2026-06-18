const router = require("express").Router();
const c = require("../controllers/bancaController");
const { autenticar, autorizar } = require("../middleware/auth");

// orientador/coordenador compoem a banca; banca/coordenador registram a nota (RBAC)
router.post("/definir", autenticar, autorizar("orientador", "coordenador"), c.definir);
router.post("/nota", autenticar, autorizar("banca", "coordenador"), c.nota);
module.exports = router;
