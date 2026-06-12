# Utilitário de logging compartilhado
import logging
from datetime import datetime

def criar_logger(nome_servico: str):
    """Cria um logger formatado para um serviço"""
    logger = logging.getLogger(nome_servico)
    logger.setLevel(logging.DEBUG)
    
    # Handler para console
    handler = logging.StreamHandler()
    handler.setLevel(logging.DEBUG)
    
    # Formato: [HH:MM:SS] [SERVICO] NIVEL: mensagem
    formatter = logging.Formatter(
        f'%(asctime)s [%(name)s] %(levelname)s: %(message)s',
        datefmt='%H:%M:%S'
    )
    handler.setFormatter(formatter)
    
    if not logger.handlers:
        logger.addHandler(handler)
    
    return logger
