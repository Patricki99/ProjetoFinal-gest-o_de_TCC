const router = require("express").Router();
const c = require("../controllers/sistemaController");
router.get("/health", c.healthCheck);
module.exports = router;
