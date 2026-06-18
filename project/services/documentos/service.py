import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
import zmq, json
from common.eventos import Evento, TipoEvento
from common.config import get_zmq_address
from common.logger import criar_logger
from common.db import Repositorio

log = criar_logger("Documentos")
ctx = zmq.Context.instance()
sub = ctx.socket(zmq.SUB)
sub.connect(get_zmq_address("gateway"))
sub.setsockopt_string(zmq.SUBSCRIBE, TipoEvento.VERSAO_RECEBIDA.value)
pub = ctx.socket(zmq.PUB)
pub.bind(get_zmq_address("documentos", "bind"))
repo = Repositorio()
log.info("no ar | SUB gateway:versao_recebida -> versiona/persiste -> PUB versao_submetida")

def handle(dados):
    if not repo.registrar_evento(dados):       # idempotencia: ignora reentrega do mesmo evento
        log.info("evento ja processado; ignorado (idempotencia)")
        return
    aluno = dados["aluno_id"]
    p = dados.get("payload", {})
    texto = p.get("texto", "")
    tipo = p.get("tipo", "desenvolvimento")
    numero = repo.salvar_versao(aluno, texto, tipo)   # Controle de Versoes + DAO/MySQL
    ev = Evento(TipoEvento.VERSAO_SUBMETIDA, aluno_id=aluno, operacao="versionar",
                payload={"versao_id": numero, "numero": numero, "tipo": tipo,
                         "texto": texto, "caracteres": len(texto)})
    pub.send_string(f"{ev.evento} {ev.to_json_str()}")
    log.info(f"versao v{numero} persistida; publicado {ev}")

if __name__ == "__main__":
    try:
        while True:
            try:
                _, c = sub.recv_string().split(" ", 1)
                handle(json.loads(c))
            except Exception as e:               # uma mensagem ruim nao derruba o servico
                log.error(f"erro ao processar evento: {e}")
    except KeyboardInterrupt:
        pass
    finally:
        sub.close(); pub.close(); repo.fechar(); ctx.term()
