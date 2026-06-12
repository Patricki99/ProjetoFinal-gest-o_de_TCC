# services/documentos/service.py
import zmq
import json
import mysql.connector
import time
from common.eventos import Evento, TipoEvento
from common.config import get_zmq_address, DB_CONFIG
from common.logger import criar_logger

logger = criar_logger("Documentos")

context = zmq.Context()

# Socket PUB para publicar eventos
publisher = context.socket(zmq.PUB)
publisher.bind(get_zmq_address("documentos", "bind"))

# Conexão MySQL
db = mysql.connector.connect(**DB_CONFIG)
cursor = db.cursor()

logger.info("🚀 Serviço de Documentos iniciado na porta 5555")

def salvar_versao(aluno_id: int, texto: str, tipo: str = "desenvolvimento"):
    """Salva uma versão do documento no banco"""
    try:
        cursor.execute(
            "INSERT INTO versoes (aluno_id, texto, tipo) VALUES (%s, %s, %s)",
            (aluno_id, texto, tipo)
        )
        db.commit()
        logger.info(f"✓ Versão salva para aluno {aluno_id}")
        return True
    except Exception as e:
        logger.error(f"✗ Erro ao salvar versão: {e}")
        return False

def publicar_versao(aluno_id: int, texto: str, tipo: str = "desenvolvimento"):
    """Publica um evento de versão submetida"""
    evento = Evento(
        TipoEvento.VERSAO_SUBMETIDA,
        aluno_id=aluno_id,
        payload={
            "texto": texto,
            "tipo": tipo,
            "caracteres": len(texto)
        }
    )
    
    publisher.send_string(f"{evento.evento} {evento.to_json_str()}")
    logger.info(f"✓ Evento publicado: {evento}")

# Simular submissões de versões
if __name__ == "__main__":
    try:
        # Simular alguns alunos enviando versões
        versoes = [
            (1, "Introdução: Este trabalho analisa sistemas distribuídos...", "desenvolvimento"),
            (2, "Metodologia: Utilizamos abordagem experimental...", "desenvolvimento"),
            (3, "Resultados: Os dados demonstram...", "desenvolvimento"),
        ]
        
        for aluno_id, texto, tipo in versoes:
            salvar_versao(aluno_id, texto, tipo)
            publicar_versao(aluno_id, texto, tipo)
            time.sleep(2)
        
        logger.info("Aguardando novas submissões...")
        while True:
            time.sleep(60)
            
    except KeyboardInterrupt:
        logger.info("Serviço finalizado")
    finally:
        cursor.close()
        db.close()
        publisher.close()
        context.term()
