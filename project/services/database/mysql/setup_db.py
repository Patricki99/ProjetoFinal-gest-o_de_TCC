import mysql.connector

# Conectar sem banco de dados
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="patricki"
)

cursor = db.cursor()

# Ler e executar o script SQL
with open("bd.sql", "r", encoding="utf-8") as f:
    sql_content = f.read()

# Separar as queries e executar
queries = sql_content.split(";")
for query in queries:
    query = query.strip()
    if query:
        try:
            cursor.execute(query)
            print(f" Executado: {query[:50]}...")
        except Exception as e:
            print(f" Erro: {e}")

db.commit()
cursor.close()
db.close()

print("\n Database configurado com sucesso!")
