import zmq
import json
import time
from common.config import get_zmq_address, DB_CONFIG
from common.logger import criar_logger
import mysql.connector

logger = criar_logger("Relatórios")

context = zmq.Context()

# Socket PULL para receber dados de relatórios
pull_socket = context.socket(zmq.PULL)
pull_socket.bind(get_zmq_address("relatorio", "bind"))

# Subscribers para eventos importantes
subscribers = {}
portas = [5555, 5560, 5563, 5562, 5564]
for porta in portas:
    subscriber = context.socket(zmq.SUB)
    subscriber.connect(f"tcp://localhost:{porta}")
    subscriber.setsockopt_string(zmq.SUBSCRIBE, "")
    subscribers[porta] = subscriber

# Conexão MySQL
db = mysql.connector.connect(**DB_CONFIG)
cursor = db.cursor()

logger.info("🚀 Serviço de Relatórios iniciado na porta 5565")

def salvar_evento(evento_tipo: str, aluno_id: int, dados: dict):
    """Salva evento em banco para relatórios"""
    try:
        cursor.execute("""
            INSERT INTO historico_eventos (tipo_evento, aluno_id, dados, data_evento)
            VALUES (%s, %s, %s, NOW())
        """, (evento_tipo, aluno_id, json.dumps(dados)))
        db.commit()
    except Exception as e:
        logger.warning(f"Erro ao salvar evento: {e}")

def gerar_relatorio_aluno(aluno_id: int) -> dict:
    """Gera relatório consolidado para um aluno"""
    try:
        cursor.execute("""
            SELECT 
                COUNT(*) as total_eventos,
                COUNT(CASE WHEN tipo_evento LIKE '%aprovado%' THEN 1 END) as eventos_sucesso,
                COUNT(CASE WHEN tipo_evento LIKE '%reprovado%' THEN 1 END) as eventos_falha
            FROM historico_eventos
            WHERE aluno_id = %s
        """, (aluno_id,))
        
        resultado = cursor.fetchone()
        
        return {
            "aluno_id": aluno_id,
            "total_eventos": resultado[0] or 0,
            "eventos_sucesso": resultado[1] or 0,
            "eventos_falha": resultado[2] or 0,
            "taxa_sucesso": (resultado[1] or 0) / max((resultado[0] or 1), 1) * 100
        }
    except Exception as e:
        logger.error(f"Erro ao gerar relatório: {e}")
        return {}

def gerar_relatorio_geral() -> dict:
    """Gera relatório geral do sistema"""
    try:
        cursor.execute("""
            SELECT 
                COUNT(DISTINCT aluno_id) as total_alunos,
                COUNT(*) as total_eventos,
                COUNT(CASE WHEN tipo_evento LIKE '%aprovado%' THEN 1 END) as tccs_aprovados,
                COUNT(CASE WHEN tipo_evento LIKE '%reprovado%' THEN 1 END) as tccs_reprovados
            FROM historico_eventos
        """)
        
        resultado = cursor.fetchone()
        
        return {
            "total_alunos": resultado[0] or 0,
            "total_eventos": resultado[1] or 0,
            "tccs_aprovados": resultado[2] or 0,
            "tccs_reprovados": resultado[3] or 0,
            "taxa_aprovacao": (resultado[2] or 0) / max((resultado[0] or 1), 1) * 100,
            "data_relatorio": time.strftime("%Y-%m-%d %H:%M:%S")
        }
    except Exception as e:
        logger.error(f"Erro ao gerar relatório geral: {e}")
        return {}

# Loop principal
if __name__ == "__main__":
    try:
        poller = zmq.Poller()
        poller.register(pull_socket, zmq.POLLIN)
        
        for subscriber in subscribers.values():
            poller.register(subscriber, zmq.POLLIN)
        
        logger.info("Aguardando eventos para consolidação de relatórios...")
        
        contador = 0
        while True:
            sockets = dict(poller.poll(1000))
            
            # Processar eventos de notificação
            for subscriber in subscribers.values():
                if subscriber in sockets:
                    try:
                        msg = subscriber.recv_string(zmq.NOBLOCK)
                        topico, conteudo = msg.split(" ", 1)
                        dados = json.loads(conteudo)
                        
                        aluno_id = dados.get("aluno_id")
                        if aluno_id:
                            salvar_evento(topico, aluno_id, dados.get("payload", {}))
                            contador += 1
                            
                            # Gerar relatório a cada 10 eventos
                            if contador % 10 == 0:
                                relatorio = gerar_relatorio_geral()
                                logger.info(f"📊 Relatório Geral: {relatorio}")
                    
                    except zmq.Again:
                        pass
                    except Exception as e:
                        logger.error(f"Erro: {e}")
            
            # Processar requisições de relatório
            if pull_socket in sockets:
                try:
                    requisicao = pull_socket.recv_json(zmq.NOBLOCK)
                    aluno_id = requisicao.get("aluno_id")
                    
                    if aluno_id:
                        relatorio = gerar_relatorio_aluno(aluno_id)
                        logger.info(f"📄 Relatório do Aluno {aluno_id}: {relatorio}")
                except zmq.Again:
                    pass
    
    except KeyboardInterrupt:
        logger.info("Serviço finalizado")
    finally:
        cursor.close()
        db.close()
        pull_socket.close()
        for subscriber in subscribers.values():
            subscriber.close()
        context.term()
