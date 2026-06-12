# Definição de tipos de eventos do sistema
from enum import Enum
from datetime import datetime
import uuid

class TipoEvento(Enum):
    # Submissão de Proposta
    PROPOSTA_SUBMETIDA = "proposta_submetida"
    SOLICITACAO_ORIENTADOR_ENVIADA = "solicitacao_orientador_enviada"
    PROPOSTA_APROVADA = "proposta_aprovada"
    PROPOSTA_REJEITADA = "proposta_rejeitada"
    PROPOSTA_REENVIADA = "proposta_reenviada"
    PROPOSTA_REGISTRADA = "proposta_registrada"
    CRONOGRAMA_REGISTRADO = "cronograma_registrado"
    
    # Desenvolvimento do TCC
    VERSAO_SUBMETIDA = "versao_submetida"
    FEEDBACK_ENVIADO = "feedback_enviado"
    FEEDBACK_ATENDIDO = "feedback_atendido"
    PENDENCIAS_IDENTIFICADAS = "pendencias_identificadas"
    
    # Versão Parcial (TCC 1)
    VERSAO_PARCIAL_ENTREGUE = "versao_parcial_entregue"
    NOTA_PARCIAL_ATRIBUIDA = "nota_parcial_atribuida"
    TCC1_APROVADO = "tcc1_aprovado"
    TCC1_REPROVADO = "tcc1_reprovado"
    
    # Versão Final e Banca (TCC 2)
    TCC_ENCAMINHADO_AVALIACAO = "tcc_encaminhado_ia_avaliacao"
    PARECER_IA_APTIDAO_GERADO = "parecer_ia_aptidao_gerado"
    CORRECOES_IA_ENCAMINHADAS = "correcoes_ia_encaminhadas"
    VERSAO_FINAL_ENTREGUE = "versao_final_entregue"
    BANCA_DEFINIDA = "banca_definida"
    BANCA_REGISTRADA = "banca_registrada"
    DEFESA_AGENDADA = "defesa_agendada"
    CONVOCACAO_BANCA_ENVIADA = "convocacao_banca_enviada"
    PARTICIPACAO_CONFIRMADA = "participacao_confirmada"
    
    # Avaliação da Banca
    COMENTARIOS_BANCA_ENVIADOS = "comentarios_banca_enviados"
    NOTA_BANCA_SUBMETIDA = "nota_banca_submetida"
    DEFESA_APROVADA = "defesa_aprovada"
    DEFESA_REPROVADA = "defesa_reprovada"
    ANALISE_BANCA_CONSOLIDADA = "analise_banca_consolidada"
    
    # Ajustes Finais
    PRAZO_CORRECAO_INICIADO = "prazo_correcao_iniciado"
    VERSAO_FINAL_CORRIGIDA_ENTREGUE = "versao_final_corrigida_entregue"
    TCC_VALIDADO = "tcc_validado"
    NOTA_FINAL_REGISTRADA = "nota_final_registrada"
    ALERTA_PRAZO_CORRECAO_EXPIRADO = "alerta_prazo_correcao_expirado"
    
    # Notificações e Alertas
    ALERTA_REPROVACAO_DISPARADO = "alerta_reprovacao_disparado"
    ALERTA_PENDENCIA_DISPARADO = "alerta_pendencia_disparado"
    EMAIL_ALUNO_ENVIADO = "email_aluno_enviado"
    COORDENACAO_NOTIFICADA = "coordenacao_notificada"
    
    # Relatórios
    RELATORIO_GERADO = "relatorio_gerado"
    RELATORIO_NDE_GERADO = "relatorio_nde_gerado"
    RELATORIO_COLEGIADO_GERADO = "relatorio_colegiado_gerado"

class Evento:
    def __init__(self, tipo: TipoEvento, aluno_id: int, payload: dict, **kwargs):
        self.evento = tipo.value
        self.id = str(uuid.uuid4())
        self.timestamp = datetime.now().isoformat()
        self.aluno_id = aluno_id
        self.payload = payload
        self.__dict__.update(kwargs)
    
    def to_dict(self):
        return self.__dict__
    
    def to_json_str(self):
        import json
        return json.dumps(self.to_dict())
    
    def __str__(self):
        return f"[{self.evento}] Aluno {self.aluno_id}: {self.payload}"
