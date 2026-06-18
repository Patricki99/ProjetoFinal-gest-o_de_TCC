"""Sobe TODOS os peers Python do sistema (sem o gateway_sim), na ordem certa
(consumidores primeiro, por causa do slow joiner do PUB/SUB).

Use em conjunto com:
  - o Gateway Node:  cd gateway-node && npm start
  - a interface:     cd interface && python -m http.server 8080
  - o navegador:     http://localhost:8080

Provedor de LLM: por padrao 'simulado' (em processo). Para usar o stub HTTP
(fiel ao diagrama), defina antes de rodar:  $env:LLM_PROVIDER="http"
"""
import subprocess, sys, os, time

base = os.path.dirname(os.path.abspath(__file__))

def svc(rel):
    return subprocess.Popen([sys.executable, os.path.join(base, *rel.split("/"))])

# Ordem: consumidores/serviços primeiro; workers do relatorio por ultimo.
SERVICOS = [
    "common/llm/stub_server.py",        # Provedor de LLM (HTTP) — usado se LLM_PROVIDER=http
    "services/notificacao/service.py",
    "services/ia/service.py",
    "services/avaliacao/service.py",
    "services/documentos/service.py",
    "services/banca/service.py",
    "services/autenticacao/service.py",
    "services/relatorios/service.py",
    "services/relatorios/worker.py",
    "services/relatorios/worker.py",    # 2 workers (paralelismo do PUSH/PULL)
]

procs = []
print("== subindo os peers (consumidores primeiro) ==", flush=True)
for s in SERVICOS:
    procs.append(svc(s))
    time.sleep(0.4)
print("== todos no ar. Suba o gateway (npm start) e a interface (http.server 8080). "
      "Ctrl+C aqui encerra os peers. ==", flush=True)

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    pass
finally:
    for p in procs:
        p.terminate()
    for p in procs:
        try:
            p.wait(timeout=3)
        except Exception:
            p.kill()
