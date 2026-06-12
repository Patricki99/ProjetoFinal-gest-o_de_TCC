import zmq
import json
import time
from common.eventos import TipoEvento
from common.config import get_zmq_address
from common.logger import criar_logger

logger = criar_logger("Notificações")

context = zmq.Context()

# Subscrever em todas as fontes de eventos
subscribers = {}

# Eventos críticos que geram notificações
EVENTOS_NOTIFICACAO = {
    "pendencias_identificadas": "⚠️  ALERTA: Pendências identificadas",
    "nota_parcial_atribuida": "📊 Sua nota parcial foi registrada",
    "feedback_enviado": "📝 Novo feedback do orientador",
    "defesa_aprovada": "✅ Parabéns! Você foi aprovado na defesa",
    "defesa_reprovada": "❌ Você não foi aprovado na defesa",
    "alerta_prazo_correcao_expirado": "⏰ URGENTE: Prazo de correção expirado",
}

# Criar subscribers para cada fonte
portas = [5555, 5560, 5563, 5562, 5564]
for porta in portas:
    subscriber = context.socket(zmq.SUB)
    subscriber.connect(f"tcp://localhost:{porta}")
    subscriber.setsockopt_string(zmq.SUBSCRIBE, "")
    subscribers[porta] = subscriber

logger.info("🚀 Serviço de Notificações iniciado na porta 5566")

def enviar_notificacao(aluno_id: int, tipo_evento: str, dados: dict):
    """
    Envia uma notificação ao aluno
    Em produção, seria um email real
    """
    titulo = EVENTOS_NOTIFICACAO.get(tipo_evento, tipo_evento)
    
    logger.info(f"📧 Notificação para Aluno {aluno_id}: {titulo}")
    logger.info(f"   Detalhes: {dados}")

def processar_evento(topico: str, dados: dict):
    """Processa um evento recebido"""
    try:
        aluno_id = dados.get("aluno_id")
        
        if topico in EVENTOS_NOTIFICACAO:
            payload = dados.get("payload", {})
            enviar_notificacao(aluno_id, topico, payload)
            
    except Exception as e:
        logger.error(f"Erro ao processar evento: {e}")

# Loop principal usando poller
if __name__ == "__main__":
    try:
        poller = zmq.Poller()
        for subscriber in subscribers.values():
            poller.register(subscriber, zmq.POLLIN)
        
        logger.info("Aguardando eventos para notificação...")
        
        while True:
            sockets = dict(poller.poll(1000))
            
            for subscriber in subscribers.values():
                if subscriber in sockets:
                    try:
                        msg = subscriber.recv_string(zmq.NOBLOCK)
                        topico, conteudo = msg.split(" ", 1)
                        dados = json.loads(conteudo)
                        processar_evento(topico, dados)
                    except zmq.Again:
                        pass
                    except Exception as e:
                        logger.error(f"Erro: {e}")
    
    except KeyboardInterrupt:
        logger.info("Serviço finalizado")
    finally:
        for subscriber in subscribers.values():
            subscriber.close()
        context.term()
