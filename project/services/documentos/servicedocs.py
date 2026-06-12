import zmq, json, time
import mysql.connector

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="patricki",
    database="tcc_db"
)
cursor = db.cursor()

context = zmq.Context()
subscriber = context.socket(zmq.SUB)
subscriber.connect("tcp://localhost:5560")
subscriber.setsockopt_string(zmq.SUBSCRIBE, "proposta_submetida")
subscriber.setsockopt_string(zmq.SUBSCRIBE, "nota_parcial_atribuida")

if topico == "nota_parcial_atribuida":
    cursor.execute(
        "INSERT INTO notas (aluno_id, tipo, nota, origem) VALUES (%s,%s,%s,%s)",
        (dados["aluno_id"], "parcial", dados["nota"], "orientador")
    )
    db.commit()

publisher = context.socket(zmq.PUB)
publisher.bind("tcp://*:5561")  # Publica eventos de documento salvo

while True:
    msg = subscriber.recv_string()
    topico, conteudo = msg.split(" ", 1)
    dados = json.loads(conteudo)

    cursor.execute(
        "INSERT INTO propostas (aluno_id, titulo, descricao) VALUES (%s,%s,%s)",
        (dados["aluno_id"], dados["titulo"], dados["descricao"])
    )
    db.commit()
    print(f"[Documentos] Proposta salva: {dados['titulo']}")

    evento = {"evento": "documento_salvo", "aluno_id": dados["aluno_id"]}
    publisher.send_string(f"documento_salvo {json.dumps(evento)}")