// Banca & Defesas: injeta comandos na malha (Cenario 2).
const { v4: uuidv4 } = require("uuid");
const zmqClient = require("../services/zmqClient");

function evt(evento, operacao, aluno_id, payload) {
  return { evento, operacao, id: uuidv4(), timestamp: new Date().toISOString(), aluno_id, payload };
}

module.exports = {
  // POST /api/v1/banca/definir -> banca_definida (orientador compoe a banca)
  async definir(req, res, next) {
    try {
      const { aluno_id, avaliadores, data_defesa, orientador_id } = req.body || {};
      if (!aluno_id || !Array.isArray(avaliadores) || avaliadores.length === 0)
        return res.status(400).json({ error: "Campos obrigatorios: aluno_id, avaliadores[]" });
      const e = evt("banca_definida", "compor_banca", aluno_id,
                    { avaliadores, data_defesa: data_defesa || null, orientador_id: orientador_id || null });
      await zmqClient.publishCommand("banca_definida", e);
      res.status(202).json({ success: true, message: "Banca definida; defesa sera agendada", id: e.id });
    } catch (e) { next(e); }
  },

  // POST /api/v1/banca/nota -> nota_banca_submetida (banca registra a nota; regra >= 6)
  async nota(req, res, next) {
    try {
      const { aluno_id, nota, comentario } = req.body || {};
      if (!aluno_id || nota == null) return res.status(400).json({ error: "Campos obrigatorios: aluno_id, nota" });
      const e = evt("nota_banca_submetida", "registrar_nota", aluno_id, { nota, comentario: comentario || "" });
      await zmqClient.publishCommand("nota_banca_submetida", e);
      res.status(202).json({ success: true, message: "Nota submetida; resultado sera publicado", id: e.id });
    } catch (e) { next(e); }
  },
};
