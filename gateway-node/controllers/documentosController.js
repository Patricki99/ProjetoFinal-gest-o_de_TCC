const { v4: uuidv4 } = require("uuid");
const zmqClient = require("../services/zmqClient");

module.exports = {
  // POST /api/v1/documentos/versao  -> injeta versao_recebida na malha (Documentos publica versao_submetida)
  async submeterVersao(req, res, next) {
    try {
      const { aluno_id, texto, tipo } = req.body;
      if (!aluno_id || !texto) return res.status(400).json({ error: "Campos obrigatorios: aluno_id, texto" });
      const evento = {
        evento: "versao_recebida", operacao: "submeter", id: uuidv4(),
        timestamp: new Date().toISOString(), aluno_id,
        payload: { texto, tipo: tipo || "desenvolvimento", caracteres: texto.length },
      };
      await zmqClient.publishCommand("versao_recebida", evento);
      res.status(202).json({ success: true, message: "Versao recebida; processamento assincrono iniciado", id: evento.id });
    } catch (e) { next(e); }
  },
  async obterHistorico(req, res) {
    res.json({ aluno_id: parseInt(req.params.aluno_id), info: "Consultar MySQL (tabela versoes) na implementacao final" });
  },
};
