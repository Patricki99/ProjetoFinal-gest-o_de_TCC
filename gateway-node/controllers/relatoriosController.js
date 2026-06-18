// Relatorios: solicita a geracao distribuida (PUSH/PULL). O panorama volta
// como evento 'relatorio_gerado' (PUB/SUB) e e repassado ao frontend via WebSocket.
const zmqClient = require("../services/zmqClient");

module.exports = {
  // POST /api/v1/relatorios/gerar
  async gerar(req, res, next) {
    try {
      const tipo = (req.body && req.body.tipo) || "geral";
      const solicitante = req.user ? req.user.role : "coordenador";
      await zmqClient.solicitarRelatorio({ tipo, solicitante });
      res.status(202).json({
        success: true,
        message: "Relatorio solicitado; o panorama chegara via WebSocket (evento relatorio_gerado)",
      });
    } catch (e) { next(e); }
  },
};
