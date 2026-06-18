const { v4: uuidv4 } = require("uuid");
const zmqClient = require("../services/zmqClient");

module.exports = {
  // POST /api/v1/avaliacao/feedback -> injeta parecer_recebido (parecer PADRONIZADO / JEMS).
  // Aceita o formulario (criterios 0-10 + comentario) e/ou texto livre (compat).
  async enviarFeedback(req, res, next) {
    try {
      const { aluno_id, criterios, comentario, feedback, nota, decisao, versao_id } = req.body || {};
      const temForm = criterios && typeof criterios === "object" && Object.keys(criterios).length > 0;
      if (!aluno_id || (!temForm && !comentario && !feedback))
        return res.status(400).json({ error: "Informe aluno_id e o parecer (criterios ou comentario)" });
      const evento = {
        evento: "parecer_recebido", operacao: "registrar_parecer", id: uuidv4(),
        timestamp: new Date().toISOString(), aluno_id,
        payload: { criterios: criterios || {}, comentario: comentario || feedback || "",
                   nota, decisao, versao_id },
      };
      await zmqClient.publishCommand("parecer_recebido", evento);
      res.status(202).json({ success: true, message: "Parecer padronizado publicado na malha", id: evento.id });
    } catch (e) { next(e); }
  },
  async obterFeedback(req, res) {
    res.json({ aluno_id: parseInt(req.params.aluno_id), info: "Consultar MySQL (tabela feedbacks) na implementacao final" });
  },
};
