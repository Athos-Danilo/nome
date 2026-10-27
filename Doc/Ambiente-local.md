# Ambiente local — Decifra

## Estado da fase 08

Base independente da interface e da API preparada nas pastas `Frontend` e `Backend`. O frontend nesta fase é uma tela de diagnóstico, sem substituir o protótipo aprovado ou antecipar as funcionalidades. A API disponibiliza apenas `GET /api/saude` e documentação em `/docs`.

Ambiente encontrado: Python 3.13.0, Node 22.13.0, npm 10.9.2, PostgreSQL instalado 18.0 e MongoDB 8.2.5. Serviços PostgreSQL/MongoDB ativos; `pg_isready` confirmou disponibilidade em 5432 e teste TCP confirmou 27017. Isso não comprova autenticação, existência dos bancos do projeto ou permissões de usuários. Essas configurações e a modelagem ainda serão feitas; nenhum dado existente foi alterado.

## Instalação reproduzível

Executar na raiz do projeto, com Python 3.13 e Node 22.12 ou superior dentro da linha 22. Node encontrado é compatível com as exigências oficiais do Vite e Vitest escolhidos.

```powershell
python -m venv Backend/.venv
Backend/.venv/Scripts/python.exe -m pip install --require-hashes -r Backend/requirements-dev.txt
cd Frontend
npm ci
```

No Linux/macOS, usar `Backend/.venv/bin/python` no lugar de `Backend/.venv/Scripts/python.exe`. Não é necessário ativar o ambiente no PowerShell: os comandos usam seu executável diretamente.

## Executar

Em um terminal na raiz:

```powershell
Backend/.venv/Scripts/python.exe -m uvicorn aplicacao.principal:aplicacao --app-dir Backend --host 127.0.0.1 --port 8000 --reload
```

Em outro terminal:

```powershell
cd Frontend
npm run dev
```

Abrir `http://127.0.0.1:5173`. O Vite encaminha `/api` para `127.0.0.1:8000`, mantendo a interface na mesma origem durante o desenvolvimento. Uma porta ocupada gera erro, sem trocar silenciosamente a URL. O protótipo visual continua acessível pelo servidor documentado em `Doc/Prototipos/LEIA-ME.md`, separado da aplicação.

## Variáveis e bancos de teste

`Backend/.env.example` e `.env.teste.example` contêm apenas exemplos fictícios. Copiar para `.env` ou `.env.teste` ao configurar os bancos, substituir dados localmente e manter fora do Git. A configuração lê `.env` do backend; `.env.teste` não é carregado automaticamente. Testes de persistência exigem a variável de processo `DECIFRA_POSTGRESQL_TESTE_URL`, para evitar usar uma conexão de desenvolvimento por engano.

Reservados `decifra` para desenvolvimento e `decifra_teste` para testes, no PostgreSQL e MongoDB. Na fase 10 foi criada uma instância PostgreSQL isolada em `Backend/.postgres-teste`, porta 55432, com base/usuário `decifra_teste`. Essa pasta é ignorada pelo Git; o servidor foi encerrado após a verificação. O PostgreSQL existente na porta 5432 e o MongoDB não foram alterados. O banco de desenvolvimento e suas credenciais ainda precisam ser configurados. Nenhum segredo deve ir para o frontend.

## Migrações relacionais

Dentro de `Backend`, com `DECIFRA_POSTGRESQL_URL` configurada em `.env` ou no ambiente, usando conta autorizada a criar tabelas na base escolhida:

```powershell
.venv/Scripts/python.exe -m alembic upgrade head
.venv/Scripts/python.exe -m alembic current
.venv/Scripts/python.exe -m alembic check
```

Aceita `postgresql://` e `postgresql+psycopg://`, usando Psycopg 3. Para Neon, preservar parâmetros de conexão segura fornecidos pelo provedor. Não gravar a URL privada em `alembic.ini`. A inicialização da API não cria tabelas nem executa migrações automaticamente.

Para revisar o SQL sem conexão ou credenciais:

```powershell
.venv/Scripts/python.exe -m alembic upgrade head --sql
```

Uma alteração futura cria outra revisão: `python -m alembic revision --autogenerate -m "descrição em português"`, seguida de revisão manual e testes. `upgrade`/`downgrade`, `env.py` e campos oficiais do Alembic mantêm os nomes exigidos pela ferramenta. Não usar reversão em dados reais como procedimento de teste.

Para executar os testes de persistência, primeiro iniciar um PostgreSQL de teste e criar uma base exclusiva. Exportar a conexão em `DECIFRA_POSTGRESQL_TESTE_URL` na sessão do terminal e executar pytest. São aceitos apenas `localhost`/`127.0.0.1` e nome de base terminado em `_teste`. O teste aplica a migração nessa base e reverte seus registros ao fim de cada caso. Sem a variável explícita, os testes de banco aparecem como ignorados; os demais continuam. O GitHub Actions fornece PostgreSQL 18 temporário para executá-los.

Na instância isolada preparada localmente, iniciar com `pg_ctl` usando o diretório `Backend/.postgres-teste`, porta 55432 e endereço 127.0.0.1. Ela usa autenticação de confiança apenas para testes locais; não serve como configuração de desenvolvimento ou publicação. Seu log fica nessa mesma pasta. Ao terminar, parar somente essa instância. O diretório é descartável e nunca deve armazenar dados reais.

## Verificar

```powershell
cd Backend
.venv/Scripts/python.exe -m ruff check .
.venv/Scripts/python.exe -m ruff format --check .
.venv/Scripts/python.exe -m pytest
cd ../Frontend
npm run verificar-formatacao
npm run tipos
npm test
npm run build
```

Ruff formata e verifica Python; Prettier formata o frontend e TypeScript verifica seus tipos. GitHub Actions repete as verificações existentes a cada push/PR. O arquivo configurado não comprova por si só execução bem-sucedida no GitHub; consultar o resultado da execução.

## Dependências e organização

Versões verificadas nesta etapa: React 19.3.1, Vite 8.3.5, TypeScript 7.0.2, Vitest 5.0.5, FastAPI 0.162.0 e Uvicorn 0.54.0. Os arquivos de lock registram as demais versões. Dependências de regras de negócio e interação avançada serão instaladas somente nas fases em que forem utilizadas.

Verificações locais concluídas: três testes HTTP do backend, três testes do cliente da interface, Ruff, Prettier, tipos, compilação Vite, consistência de dependências Python e resolução dos hashes ignorando pacotes já instalados. Em teste integrado temporário, um navegador executou a interface React e exibiu “API disponível” após consultar FastAPI pelo proxy do Vite. Os processos de teste foram encerrados. PostgreSQL e MongoDB não foram alterados por esses testes.

Frontend: versões diretas exatas em `package.json` e resolução completa em `package-lock.json`; reinstalar com `npm ci`. Backend: entradas em `requirements.in`/`requirements-dev.in`, resolvidas e fixadas com hashes nos respectivos `.txt`; instalar os `.txt`, sem atualizar versões indiscriminadamente.

Para atualização deliberada, usar o ambiente Python 3.13 e `pip-tools` fixado no lock de desenvolvimento:

```powershell
cd Backend
.venv/Scripts/python.exe -m piptools compile --generate-hashes --allow-unsafe --strip-extras --output-file requirements.txt requirements.in
.venv/Scripts/python.exe -m piptools compile --generate-hashes --allow-unsafe --strip-extras --output-file requirements-dev.txt requirements-dev.in
```

As pastas seguem o planejamento; módulos vazios são pontos de expansão, sem regras fictícias. Instalações, segredos, caches, cobertura e resultados de compilação são ignorados pelo Git. Consulte [Publicação gratuita](Publicacao-gratuita.md) para o diagnóstico de hospedagem e pendências até as fases 15 e 41.
