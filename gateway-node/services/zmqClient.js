// Cliente ZeroMQ do gateway (zeromq v6) — demonstra os 3 padroes:
//   PUB (bind)      : publica comandos do cliente (versao_recebida, parecer_recebido, banca_definida...) na malha.
//   SUB (connect)   : ouve eventos dos servicos e os repassa ao WebSocket.
//   DEALER (connect): login sincrono no servico de Autenticacao (request-reply).
//   PUSH (connect)  : solicita relatorios ao coordenador (pipeline PUSH/PULL).
const zmq = require("zeromq");
const { EventEmitter } = require("events");
const { ZMQ } = require("../config/zmq");

class ZMQClient extends EventEmitter {
  constructor() {
    super();
    this.pub = null;
    this.subs = [];
    this.authDealer = null;
    this.relatorioPush = null;
    this.running = false;
    this._authLock = Promise.resolve();   // serializa logins no DEALER
  }

  async start() {
    this.pub = new zmq.Publisher();
    await this.pub.bind(ZMQ.gatewayBind);
    console.log(`✓ PUB do gateway em ${ZMQ.gatewayBind}`);

    for (const addr of ZMQ.subscribeTo) {
      const sub = new zmq.Subscriber();
      sub.connect(addr);
      sub.subscribe("");
      this.subs.push(sub);
      this._consume(sub, addr).catch((e) => console.error("SUB loop:", e.message));
      console.log(`✓ SUB conectado a ${addr}`);
    }

    this.authDealer = new zmq.Dealer({ receiveTimeout: 4000 });
    this.authDealer.connect(ZMQ.authDealer);
    console.log(`✓ DEALER (login) -> ${ZMQ.authDealer}`);

    this.relatorioPush = new zmq.Push();
    this.relatorioPush.connect(ZMQ.relatorioReq);
    console.log(`✓ PUSH (relatorios) -> ${ZMQ.relatorioReq}`);

    this.running = true;
  }

  async _consume(sub, addr) {
    for await (const [frame] of sub) {
      try {
        const s = frame.toString();
        const i = s.indexOf(" ");
        const topic = i >= 0 ? s.slice(0, i) : s;
        const dados = i >= 0 ? JSON.parse(s.slice(i + 1)) : {};
        this.emit("evento", { tipo: topic, dados, address: addr, timestamp: new Date().toISOString() });
      } catch (e) {
        console.error(`Parse de evento (${addr}):`, e.message);
      }
    }
  }

  // PUB/SUB: injeta um comando do cliente na malha ("topico {json}")
  async publishCommand(topic, evento) {
    if (!this.pub) throw new Error("ZMQ PUB nao iniciado");
    await this.pub.send(`${topic} ${JSON.stringify(evento)}`);
    console.log(`📤 comando publicado: ${topic} (aluno ${evento.aluno_id})`);
    return { success: true };
  }

  // DEALER/ROUTER: login sincrono (serializado para casar requisicao<->resposta)
  async login(credenciais) {
    const anterior = this._authLock;
    let liberar;
    this._authLock = new Promise((r) => (liberar = r));
    await anterior;
    try {
      await this.authDealer.send(JSON.stringify(credenciais));
      const frames = await this.authDealer.receive();
      return JSON.parse(frames[frames.length - 1].toString());
    } finally {
      liberar();
    }
  }

  // PUSH/PULL: solicita a geracao distribuida de um relatorio
  async solicitarRelatorio(payload) {
    if (!this.relatorioPush) throw new Error("PUSH de relatorios nao iniciado");
    await this.relatorioPush.send(JSON.stringify(payload));
    console.log(`📤 relatorio solicitado: ${payload.tipo} (${payload.solicitante})`);
    return { success: true };
  }

  healthCheck() {
    return {
      connected: this.running, publisher: !!this.pub, subscribers: this.subs.length,
      auth: !!this.authDealer, relatorios: !!this.relatorioPush,
    };
  }

  async shutdown() {
    try {
      if (this.pub) this.pub.close();
      this.subs.forEach((s) => s.close());
      if (this.authDealer) this.authDealer.close();
      if (this.relatorioPush) this.relatorioPush.close();
    } catch (e) {}
    this.running = false;
    console.log("✓ ZMQ client encerrado");
  }
}
module.exports = new ZMQClient();
