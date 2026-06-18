const router = require("express").Router();
const c = require("../controllers/authController");
router.post("/login", c.login);   // publico (porta de entrada)
module.exports = router;
