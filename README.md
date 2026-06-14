# Sistema de Gestao de TCC

Projeto para gestao de TCC com uma interface web, um gateway Node.js/Express e servicos Python que se comunicam por ZeroMQ.

## Estrutura

- `interface/`: pagina web estatica usada para testar a API.
- `gateway-node/`: API Gateway em Node.js, Express, Socket.IO e ZeroMQ.
- `project/`: servicos Python, configuracoes comuns e scripts de banco MySQL.

## Requisitos

- Node.js 18 ou superior
- npm
- Python 3.10 ou superior
- MySQL, apenas se for executar os servicos que gravam no banco

Dependencias Python usadas pelos servicos:

```bash
pip install pyzmq mysql-connector-python requests
```

## Executar a aplicacao

Abra dois terminais na raiz do projeto.

### 1. Subir o gateway

```bash
cd gateway-node
npm install
npm start
```

O gateway ficara disponivel em:

- API: `http://localhost:3000`
- Documentacao dos endpoints: `http://localhost:3000/api/docs`
- Health check: `http://localhost:3000/api/v1/sistema/health`

### 2. Subir a interface

Com Python:

```bash
cd interface
python -m http.server 8080
```

Ou com o script npm:

```bash
cd interface
npm install
npm run serve
```

Acesse:

```text
http://localhost:8080
```

## Execucao opcional dos servicos Python

Os servicos Python publicam eventos ZeroMQ consumidos pelo gateway. Para importa-los corretamente, execute os comandos a partir da pasta `project`.

Exemplos:

```bash
cd project
python services/submissao/servicesub.py
python services/avaliacao/serviceavaliacao.py
python services/banca/servicebanca.py
python services/ia/serviceIA.py
python services/notificacao/servicenotification.py
python services/relatorios/servicerelatorio.py
```

Alguns servicos usam MySQL. Antes de executa-los, configure as variaveis de ambiente ou ajuste `project/common/config.py`.

```bash
set DB_HOST=localhost
set DB_USER=root
set DB_PASSWORD=sua_senha
set DB_NAME=tcc_db
```

Para criar o banco usando o script existente:

```bash
cd project/services/database/mysql
python setup_db.py
```

## Portas usadas

- `3000`: API Gateway
- `8080`: interface web
- `5555`: servico de documentos
- `5560`: servico de submissao
- `5562`: servico de IA
- `5563`: servico de avaliacao
- `5564`: servico de banca
- `5565`: servico de relatorio
- `5566`: servico de notificacao

## Observacoes

- A interface chama a API em `http://localhost:3000/api/v1`.
- O gateway atual possui respostas simuladas em varios endpoints, entao a interface pode ser testada mesmo sem todos os servicos Python ativos.
- A pasta `node_modules/`, caches Python, arquivos `.env` e logs foram incluidos no `.gitignore`.
