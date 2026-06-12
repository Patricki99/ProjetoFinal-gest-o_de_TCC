import zmq
import json
import time
from common.eventos import Evento, TipoEvento
from common.config import get_zmq_address
from common.logger import criar_logger

logger = criar_logger("Banca")

context = zmq.Context()

# Socket SUB para escutar análises da IA
subscriber = context.socket(zmq.SUB)
subscriber.connect(get_zmq_address("ia"))
subscriber.setsockopt_string(zmq.SUBSCRIBE, "feedback_atendido")

# Socket PUB para publicar comentários e notas da banca
publisher = context.socket(zmq.PUB)
publisher.bind(get_zmq_address("banca", "bind"))

logger.info("Serviço de Banca iniciado na porta 5564")

def processar_apto_para_banca(dados: dict):
    """Quando a IA aprova, a banca processa e avalia"""
    aluno_id = dados["aluno_id"]
    
    logger.info(f"TCC do aluno {aluno_id} apto para banca. Iniciando avaliação...")
    
    # Simular agendamento da defesa
    time.sleep(2)
    
    # Publicar comentários da banca
    evento_comentarios = Evento(
        TipoEvento.COMENTARIOS_BANCA_ENVIADOS,
        aluno_id=aluno_id,
        payload={
            "comentarios": [
                "Excelente estrutura geral",
                "Metodologia bem descrita",
                "Ajustar conclusões"
            ],
            "avaliadores": ["Prof. José", "Prof. Maria", "Prof. Pedro"]
        }
    )
    
    publisher.send_string(f"{evento_comentarios.evento} {evento_comentarios.to_json_str()}")
    logger.info(f"✓ Comentários da banca enviados para aluno {aluno_id}")
    
    # Publicar nota da banca
    time.sleep(3)
    evento_nota = Evento(
        TipoEvento.NOTA_BANCA_SUBMETIDA,
        aluno_id=aluno_id,
        payload={
            "nota": 8.5,
            "status": "defesa_aprovada" if 8.5 >= 6.0 else "defesa_reprovada",
            "criterios": {
                "conteudo": 8.5,
                "apresentacao": 8.0,
                "defesa": 8.5,
                "originalidade": 8.0
            }
        }
    )
    
    publisher.send_string(f"{evento_nota.evento} {evento_nota.to_json_str()}")
    logger.info(f"✓ Nota da banca submetida: {evento_nota.payload['nota']}")

# Loop principal
if __name__ == "__main__":
    try:
        logger.info("Aguardando TCCs aptos para avaliação...")
        while True:
            try:
                msg = subscriber.recv_string(zmq.NOBLOCK)
                topico, conteudo = msg.split(" ", 1)
                dados = json.loads(conteudo)
                
                # Se foi aprovado na IA, processa para banca
                if dados.get("payload", {}).get("status") == "apto":
                    processar_apto_para_banca(dados)
                
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
