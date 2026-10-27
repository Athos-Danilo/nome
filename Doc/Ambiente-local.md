# Ambiente local — Decifra

## Estado da fase 08

Base independente de frontend/backend preparada. O frontend nesta fase é uma tela de diagnóstico, sem substituir o protótipo aprovado ou antecipar as funcionalidades. A API disponibiliza apenas `GET /api/saude` e documentação em `/docs`.

Ambiente encontrado: Python 3.13.0, Node 22.13.0, npm 10.9.2, PostgreSQL instalado 18.0 e MongoDB 8.2.5. Serviços PostgreSQL/MongoDB ativos; `pg_isready` confirmou disponibilidade em 5432 e teste TCP confirmou 27017. Isso não comprova autenticação, existência dos bancos do projeto ou permissões de usuários. Essas configurações e a modelagem ainda serão feitas; nenhum dado existente foi alterado.

## Instalação reproduzível

Executar na raiz do projeto, com Python 3.13 e Node 22.12 ou superior dentro da linha 22. Node encontrado é compatível com as exigências oficiais do Vite e Vitest escolhidos.

```powershell
python -m venv backend/.venv
backend/.venv/Scripts/python.exe -m pip install --require-hashes -r backend/requirements-dev.txt
cd frontend
npm ci
```

No Linux/macOS, usar `backend/.venv/bin/python` no lugar de `backend/.venv/Scripts/python.exe`. Não é necessário ativar o ambiente no PowerShell: os comandos usam seu executável diretamente.

## Executar

Em um terminal na raiz:

```powershell
backend/.venv/Scripts/python.exe -m uvicorn aplicacao.principal:aplicacao --app-dir backend --host 127.0.0.1 --port 8000 --reload
```

Em outro terminal:

```powershell
cd frontend
npm run dev
```

Abrir `http://127.0.0.1:5173`. O Vite encaminha `/api` para `127.0.0.1:8000`, mantendo a interface na mesma origem durante o desenvolvimento. Uma porta ocupada gera erro, sem trocar silenciosamente a URL. O protótipo visual continua acessível pelo servidor documentado em `Doc/Prototipos/LEIA-ME.md`, separado da aplicação.

## Variáveis e bancos de teste

`backend/.env.example` e `.env.teste.example` contêm apenas exemplos fictícios. Copiar para `.env` ou `.env.teste` ao configurar os bancos, substituir dados localmente e manter fora do Git. A API lê `.env` do backend; a configuração de testes pode passar valores explícitos. Os testes atuais não carregam o arquivo local nem acessam bancos.

Reservados `decifra` para desenvolvimento e `decifra_teste` para testes, no PostgreSQL e MongoDB. Não executar testes destrutivos em desenvolvimento. Nesta fase ainda não foram criados usuários, bancos, tabelas ou coleções. Variáveis de conexão são modelos para a fase 10; os drivers serão adicionados quando usados. Nenhum segredo precisa estar no frontend.

## Verificar

```powershell
cd backend
.venv/Scripts/python.exe -m ruff check .
.venv/Scripts/python.exe -m ruff format --check .
.venv/Scripts/python.exe -m pytest
cd ../frontend
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
cd backend
.venv/Scripts/python.exe -m piptools compile --generate-hashes --allow-unsafe --strip-extras --output-file requirements.txt requirements.in
.venv/Scripts/python.exe -m piptools compile --generate-hashes --allow-unsafe --strip-extras --output-file requirements-dev.txt requirements-dev.in
```

As pastas seguem o planejamento; módulos vazios são pontos de expansão, sem regras fictícias. Instalações, segredos, caches, cobertura e resultados de compilação são ignorados pelo Git. Consulte [Publicação gratuita](Publicacao-gratuita.md) para o diagnóstico de hospedagem e pendências até as fases 15 e 41.
