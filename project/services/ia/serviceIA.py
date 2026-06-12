import zmq
import json
import time
import requests
from common.eventos import Evento, TipoEvento
from common.config import get_zmq_address, LLM_CONFIG
from common.logger import criar_logger

logger = criar_logger("IA")

context = zmq.Context()

# Socket SUB para escutar múltiplas fontes
subscriber_versions = context.socket(zmq.SUB)
subscriber_versions.connect(get_zmq_address("documentos"))
subscriber_versions.setsockopt_string(zmq.SUBSCRIBE, "versao_submetida")

subscriber_feedback = context.socket(zmq.SUB)
subscriber_feedback.connect(get_zmq_address("avaliacao"))
subscriber_feedback.setsockopt_string(zmq.SUBSCRIBE, "feedback_enviado")

subscriber_banca = context.socket(zmq.SUB)
subscriber_banca.connect(get_zmq_address("banca"))
subscriber_banca.setsockopt_string(zmq.SUBSCRIBE, "comentarios_banca_enviados")

# Socket PUB para publicar análises
publisher = context.socket(zmq.PUB)
publisher.bind(get_zmq_address("ia", "bind"))

logger.info("🚀 Serviço de IA iniciado na porta 5562")

def simular_analise_ia(texto: str, tipo_analise: str = "geral") -> dict:
    """
    Simula uma análise de IA (sem API real por enquanto)
    Em produção, chamaria OpenAI ou outro LLM
    """
    # Simulação simplificada
    comprimento = len(texto)
    
    if tipo_analise == "geral":
        return {
            "status": "pendente" if comprimento < 500 else "ok",
            "recomendacoes": [
                "Expandir a seção de metodologia",
                "Adicionar mais exemplos práticos",
                "Melhorar referências"
            ] if comprimento < 500 else [],
            "score": min(100, (comprimento / 1000) * 100),
            "observacoes": "Texto incompleto" if comprimento < 500 else "Atende aos requisitos básicos"
        }
    
    elif tipo_analise == "feedback_atendimento":
        return {
            "feedback_atendido": True,
            "percentual_atendimento": 85,
            "observacoes": "Aluno implementou a maioria das sugestões"
        }
    
    elif tipo_analise == "banca":
        return {
            "analise_geral": "TCC bem estruturado",
            "pontos_fuertes": ["Metodologia rigorosa", "Resultados claros"],
            "pontos_fracos": ["Discussão poderia ser mais profunda"],
            "recomendacao_final": "Aprovado com ressalvas"
        }
    
    return {}

def processar_versao_submetida(dados: dict):
    """Analisa uma versão submetida"""
    aluno_id = dados["aluno_id"]
    texto = dados["payload"].get("texto", "")
    
    logger.info(f"Analisando versão do aluno {aluno_id}...")
    
    analise = simular_analise_ia(texto, "geral")
    
    if analise.get("status") == "pendente":
        evento = Evento(
            TipoEvento.PENDENCIAS_IDENTIFICADAS,
            aluno_id=aluno_id,
            payload={
                "recomendacoes": analise.get("recomendacoes", []),
                "score": analise.get("score", 0),
                "prazo": "7 dias"
            }
        )
        publisher.send_string(f"{evento.evento} {evento.to_json_str()}")
        logger.info(f"✓ Pendências identificadas para aluno {aluno_id}")
    else:
        evento = Evento(
            TipoEvento.FEEDBACK_ATENDIDO,
            aluno_id=aluno_id,
            payload={
                "status": "apto",
                "score": analise.get("score", 100),
                "observacoes": analise.get("observacoes", "")
            }
        )
        publisher.send_string(f"{evento.evento} {evento.to_json_str()}")
        logger.info(f"✓ Feedback atendido para aluno {aluno_id}")

def processar_feedback_enviado(dados: dict):
    """Monitora se o aluno atendeu ao feedback"""
    aluno_id = dados["aluno_id"]
    logger.info(f"Monitorando atendimento de feedback para aluno {aluno_id}...")
    
    analise = simular_analise_ia("", "feedback_atendimento")
    
    evento = Evento(
        TipoEvento.FEEDBACK_ATENDIDO,
        aluno_id=aluno_id,
        payload={
            "percentual_atendimento": analise.get("percentual_atendimento", 0),
            "status": "atendido" if analise.get("feedback_atendido") else "pendente"
        }
    )
    publisher.send_string(f"{evento.evento} {evento.to_json_str()}")
    logger.info(f"✓ Feedback monitorado para aluno {aluno_id}")

def processar_comentarios_banca(dados: dict):
    """Analisa os comentários da banca"""
    aluno_id = dados["aluno_id"]
    logger.info(f"Analisando comentários da banca para aluno {aluno_id}...")
    
    analise = simular_analise_ia("", "banca")
    
    evento = Evento(
        TipoEvento.ANALISE_BANCA_CONSOLIDADA,
        aluno_id=aluno_id,
        payload={
            "analise": analise.get("analise_geral", ""),
            "pontos_fuertes": analise.get("pontos_fuertes", []),
            "pontos_fracos": analise.get("pontos_fracos", []),
            "recomendacao": analise.get("recomendacao_final", "")
        }
    )
    publisher.send_string(f"{evento.evento} {evento.to_json_str()}")
    logger.info(f"✓ Análise da banca consolidada para aluno {aluno_id}")

# Loop principal usando poller
if __name__ == "__main__":
    try:
        poller = zmq.Poller()
        poller.register(subscriber_versions, zmq.POLLIN)
        poller.register(subscriber_feedback, zmq.POLLIN)
        poller.register(subscriber_banca, zmq.POLLIN)
        
        logger.info("Aguardando eventos para análise...")
        
        while True:
            sockets = dict(poller.poll(1000))
            
            if subscriber_versions in sockets:
                msg = subscriber_versions.recv_string()
                topico, conteudo = msg.split(" ", 1)
                dados = json.loads(conteudo)
                processar_versao_submetida(dados)
            
            if subscriber_feedback in sockets:
                msg = subscriber_feedback.recv_string()
                topico, conteudo = msg.split(" ", 1)
                dados = json.loads(conteudo)
                processar_feedback_enviado(dados)
            
            if subscriber_banca in sockets:
                msg = subscriber_banca.recv_string()
                topico, conteudo = msg.split(" ", 1)
                dados = json.loads(conteudo)
                processar_comentarios_banca(dados)
    
    except KeyboardInterrupt:
        logger.info("Serviço finalizado")
    finally:
        subscriber_versions.close()
        subscriber_feedback.close()
        subscriber_banca.close()
        publisher.close()
        context.term()
