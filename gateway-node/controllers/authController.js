// POST /api/v1/auth/login -> valida via DEALER/ROUTER (Autenticacao) e emite token de sessao.
const zmqClient = require("../services/zmqClient");
const { emitirToken } = require("../middleware/auth");

module.exports = {
  async login(req, res) {
    try {
      const { email, senha } = req.body || {};
      if (!email || !senha) return res.status(400).json({ error: "Campos obrigatorios: email, senha" });
      const r = await zmqClient.login({ email, senha });   // DEALER -> ROUTER
      if (!r || !r.ok) return res.status(401).json({ error: (r && r.erro) || "Credenciais invalidas" });
      const token = emitirToken(r.usuario);
      res.json({ token, usuario: r.usuario });
    } catch (e) {
      res.status(503).json({ error: "Servico de autenticacao indisponivel" });
    }
  },
};
