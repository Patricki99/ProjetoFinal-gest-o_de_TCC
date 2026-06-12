# Configuração centralizada de portas e endereços
import os

# Configuração de portas ZMQ para cada serviço
PORTAS = {
    "submissao": 5560,
    "documentos": 5555,
    "avaliacao": 5563,
    "ia": 5562,
    "banca": 5564,
    "notificacao": 5566,
    "relatorio": 5565,
}

# Configuração de banco de dados
DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", "patricki"),
    "database": os.getenv("DB_NAME", "tcc"),
    "autocommit": True
}

# Configuração de LLM (IA)
LLM_CONFIG = {
    "api_key": os.getenv("OPENAI_API_KEY", ""),
    "url": "https://api.openai.com/v1/chat/completions",
    "model": "gpt-4-turbo",
    "timeout": 30
}

# Configuração de notificações (email)
EMAIL_CONFIG = {
    "smtp_server": os.getenv("SMTP_SERVER", "localhost"),
    "smtp_port": int(os.getenv("SMTP_PORT", "587")),
    "sender_email": os.getenv("SENDER_EMAIL", "tcc@unifei.edu.br"),
    "sender_password": os.getenv("SENDER_PASSWORD", ""),
}

def get_zmq_address(servico: str, tipo: str = "localhost") -> str:
    """Retorna o endereço ZMQ para um serviço"""
    porta = PORTAS.get(servico, 5555)
    if tipo == "bind":
        return f"tcp://*:{porta}"
    return f"tcp://localhost:{porta}"
