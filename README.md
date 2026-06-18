# Sistema de Gestão de TCC — Sistemas Distribuídos (XRSC09)

Protótipo de um sistema distribuído para gestão de Trabalhos de Conclusão de Curso,
sob **coreografia *brokerless*** com **ZeroMQ**: cada serviço publica eventos e os
interessados reagem diretamente, **sem broker nem orquestrador central**.

- **Interface web** (`interface/`): HTML/JS — login por perfil, ações e painel "Coreografia ao vivo".
- **Gateway / BFF** (`gateway-node/`): Node.js + Express + Socket.IO + ZeroMQ; REST + JWT/RBAC; traduz HTTP ⇄ ZeroMQ.
- **Peers de domínio** (`project/`): serviços Python (PyZMQ) que formam a malha.
- **MySQL**: fonte da verdade (opcional — há *fallback* em memória para demonstração offline).
- **Ollama**: provedor de LLM **plugável** (padrão: simulado/offline).

## Os três padrões ZeroMQ (núcleo da disciplina)

| Padrão | Onde | Serviço |
|---|---|---|
| **PUB/SUB** | coreografia (submissão/revisão, banca) | Documentos, IA, Avaliação, Notificações, Bancas |
| **DEALER/ROUTER** | login síncrono | Autenticação |
| **PUSH/PULL** | geração distribuída de relatórios (workers) | Relatórios |

## Requisitos

- Node.js 18+ (testado no 22) e npm
- Python 3.10+ com `pyzmq` (`pip install pyzmq`)
- MySQL **opcional** (sem ele, os serviços usam *fallback* em memória)

## Como executar (uma máquina) — 3 terminais

**Pré-requisito (uma vez):** `cd gateway-node && npm install`

```bash
# Terminal 1 — todos os peers Python de uma vez (consumidores primeiro)
cd project
# opcional (fiel ao diagrama): usa o provedor de LLM por HTTP
#   PowerShell:  $env:LLM_PROVIDER="http"
python run_stack.py

# Terminal 2 — gateway
cd gateway-node
npm start

# Terminal 3 — interface web
cd interface
python -m http.server 8080
```

Acesse **http://localhost:8080** e faça login.

### Usuários de demonstração

| Perfil | E-mail | Senha |
|---|---|---|
| Aluno | `aluno@unifei.edu.br` | `aluno123` |
| Orientador | `orientador@unifei.edu.br` | `orient123` |
| Coordenador | `coord@unifei.edu.br` | `coord123` |
| Banca | `banca@unifei.edu.br` | `banca123` |

Fluxo sugerido: **Aluno** submete uma versão → a **IA** analisa (consulta o provedor de LLM) →
**Notificações** avisa o **Orientador** → orientador dá um **parecer padronizado** e **compõe a banca** →
**Banca** lança a nota (regra ≥ 6,0) → **Coordenador** gera um **relatório** (PUSH/PULL).
Tudo aparece em tempo real no painel "Coreografia ao vivo".

## Demonstração rápida (sem Node/navegador)

Sobe os serviços do cenário de submissão/revisão e dispara o fluxo nos logs:

```bash
cd project
python run_demo.py
```

## Execução em múltiplas máquinas (apresentação)

O código já suporta distribuição: os serviços fazem *bind* em `tcp://*` e o *connect*
usa o host configurável por variável de ambiente.

- Em cada máquina, defina o IP dos peers que ela acessa, ex.: `HOST_GATEWAY=192.168.0.10`,
  `HOST_NOTIFICACAO=192.168.0.11` (ou `ZMQ_HOST_DEFAULT` para todos). Veja `project/.env.example`.
- O gateway deve ouvir em todas as interfaces: `HOST=0.0.0.0` (veja `gateway-node/.env.example`).
- A interface aponta para o gateway de outra máquina pela URL:
  `http://IP_DO_GATEWAY:8080/?api=http://IP_DO_GATEWAY:3000`

## Banco de dados (opcional)

Sem MySQL, tudo roda em memória. Para persistência real:

```bash
# configure as credenciais (PowerShell: $env:DB_PASSWORD="sua_senha")
pip install mysql-connector-python
cd project/services/database/mysql
python setup_db.py        # cria o banco tcc_db e as tabelas (+ usuarios de demo)
```

## Portas

| Porta | Uso |
|---|---|
| 3000 | Gateway (API REST + WebSocket) |
| 8080 | Interface web |
| 5561 | Autenticação (ROUTER) |
| 5555 / 5562 / 5563 / 5566 | Documentos / IA / Avaliação / Notificações (PUB) |
| 5564 | Bancas & Defesas (PUB) |
| 5565 / 5567 / 5568 / 5569 | Relatórios: PUB / req (PULL) / ventilador (PUSH) / sink (PULL) |
| 5570 | Gateway (PUB na malha) |
| 5571 | Provedor de LLM (stub HTTP) |

## Observações

- A regra de aprovação é **nota ≥ 6,0** em todas as etapas.
- O provedor de LLM é plugável (`LLM_PROVIDER`: `simulado` | `http` | `ollama`); o modelo do Ollama é configurável (`OLLAMA_MODEL`).
- `node_modules/`, caches Python e `.env` estão no `.gitignore`.
