import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import zmq, time
from common.eventos import Evento, TipoEvento
from common.config import get_zmq_address
from common.logger import criar_logger

log = criar_logger("Gateway(sim)")
ctx = zmq.Context.instance()
pub = ctx.socket(zmq.PUB)
pub.bind(get_zmq_address("gateway", "bind"))
time.sleep(1.5)  # slow joiner: esperar os assinantes conectarem

ev = Evento(TipoEvento.VERSAO_RECEBIDA, aluno_id=1, operacao="submeter",
            payload={"texto": "Introducao breve do trabalho.", "tipo": "desenvolvimento"})
pub.send_string(f"{ev.evento} {ev.to_json_str()}"); log.info(f"discente submete -> {ev}")
time.sleep(2)

ev2 = Evento(TipoEvento.PARECER_RECEBIDO, aluno_id=1, operacao="registrar_parecer",
             payload={"feedback": "Expandir metodologia e adicionar referencias.", "secoes": ["metodologia"]})
pub.send_string(f"{ev2.evento} {ev2.to_json_str()}"); log.info(f"orientador registra parecer -> {ev2}")
time.sleep(2)
pub.close(); ctx.term()
