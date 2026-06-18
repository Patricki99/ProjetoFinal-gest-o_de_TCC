"""Sobe os 4 servicos do cenario submissao/revisao e dispara o fluxo pelo gateway(sim).
Ordem: consumidores primeiro (slow joiner do PUB/SUB), depois o publicador."""
import subprocess, sys, time, os
base = os.path.dirname(os.path.abspath(__file__))
def svc(rel): return subprocess.Popen([sys.executable, os.path.join(base, rel)])
procs = []
print("== iniciando consumidores: Notificacoes, IA, Feedback&Avaliacao, Documentos ==", flush=True)
for s in ["services/notificacao/service.py", "services/ia/service.py",
          "services/avaliacao/service.py", "services/documentos/service.py"]:
    procs.append(svc(s)); time.sleep(0.4)
time.sleep(2)
print("== gateway injeta versao_recebida e parecer_recebido na malha ==", flush=True)
svc("gateway_sim.py").wait()
time.sleep(2)
print("== encerrando ==", flush=True)
for p in procs: p.terminate()
for p in procs:
    try: p.wait(timeout=3)
    except Exception: p.kill()
