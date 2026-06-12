import zmq
import json
import time
from common.eventos import Evento, TipoEvento
from common.config import get_zmq_address
from common.logger import criar_logger

logger = criar_logger("Avaliação")

context = zmq.Context()

# Socket SUB para escutar versões submetidas
subscriber = context.socket(zmq.SUB)
subscriber.connect(get_zmq_address("documentos"))
subscriber.setsockopt_string(zmq.SUBSCRIBE, "versao_submetida")

# Socket PUB para publicar feedbacks
publisher = context.socket(zmq.PUB)
publisher.bind(get_zmq_address("avaliacao", "bind"))

logger.info("🚀 Serviço de Avaliação iniciado na porta 5563")

def processar_versao_submetida(dados: dict):
    """Processa uma versão submetida e envia feedback"""
    aluno_id = dados["aluno_id"]
    
    # Enviar feedback
    evento_feedback = Evento(
        TipoEvento.FEEDBACK_ENVIADO,
        aluno_id=aluno_id,
        payload={
            "feedback": "Revisar introdução e metodologia. Adicionar mais referências.",
            "secoes_criticas": ["introdução", "metodologia"],
            "prazo": "5 dias"
        }
    )
    
    publisher.send_string(f"{evento_feedback.evento} {evento_feedback.to_json_str()}")
    logger.info(f"✓ Feedback enviado para aluno {aluno_id}")
    
    # Enviar nota parcial (simulado)
    time.sleep(3)
    evento_nota = Evento(
        TipoEvento.NOTA_PARCIAL_ATRIBUIDA,
        aluno_id=aluno_id,
        payload={
            "nota": 7.5,
            "status": "tcc1_aprovado" if 7.5 >= 6.0 else "tcc1_reprovado",
            "criterios": {
                "estrutura": 8.0,
                "conteudo": 7.5,
                "originalidade": 7.0
            }
        }
    )
    
    publisher.send_string(f"{evento_nota.evento} {evento_nota.to_json_str()}")
    logger.info(f"✓ Nota parcial atribuída: {evento_nota.payload['nota']}")

# Loop principal
if __name__ == "__main__":
    try:
        logger.info("Aguardando versões submetidas...")
        while True:
            try:
                msg = subscriber.recv_string(zmq.NOBLOCK)
                topico, conteudo = msg.split(" ", 1)
                dados = json.loads(conteudo)
                
                logger.debug(f"Recebido: {topico}")
                processar_versao_submetida(dados)
                
            except zmq.Again:
                time.sleep(0.5)
                continue
            except Exception as e:
                logger.error(f"Erro ao processar: {e}")
                
    except KeyboardInterrupt:
        logger.info("Serviço finalizado")
    finally:
        subscriber.close()
        publisher.close()
        context.term()
