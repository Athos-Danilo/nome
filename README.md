# Decifra

Jogo de palavras com dicas progressivas e modo compartilhado para jogar com a galera no mesmo dispositivo, desenvolvido para as disciplinas de **Web II** e **Banco de Dados II**.

- **Jogar na publicação gratuita:** <https://decifra-inky.vercel.app>
- **API pública (verificação de disponibilidade):** <https://decifra-api.onrender.com/api/saude>
- **Roteiro para apresentação das disciplinas:** [Doc/Apresentacao.md](Doc/Apresentacao.md)

> [!NOTE]
> A aplicação publicada utiliza planos gratuitos (Vercel Hobby, Render Free, Neon Free e MongoDB Atlas Free). Após ~15 minutos sem tráfego, a API no Render entra em hibernação e pode levar alguns segundos para responder na primeira requisição; a interface exibe indicadores progressivos de carregamento e despertar do servidor durante essas esperas.

---

## Sumário

- [Modos de jogo e recursos](#modos-de-jogo-e-recursos)
- [Arquitetura e tecnologias](#arquitetura-e-tecnologias)
- [Divisão entre SQL (PostgreSQL) e NoSQL (MongoDB)](#divisão-entre-sql-postgresql-e-nosql-mongodb)
- [Pré-requisitos e instalação limpa](#pré-requisitos-e-instalação-limpa)
- [Configuração de ambiente, bancos e login Google](#configuração-de-ambiente-bancos-e-login-google)
- [Importação e validação do catálogo (MongoDB)](#importação-e-validação-do-catálogo-mongodb)
- [Execução local](#execução-local)
- [Verificações automatizadas disponíveis](#verificações-automatizadas-disponíveis)
- [Documentação técnica, créditos e limites conhecidos](#documentação-técnica-créditos-e-limites-conhecidos)

---

## Modos de jogo e recursos

- **Demonstração para visitantes:** 3 palavras fáceis (1 vez por navegador), sem login, com vínculo único à conta ao entrar com Google.
- **Modo Solo:** configuração de 3, 5 ou 7 palavras por temáticas (Animais, Países, Objetos, Marcas, Filmes e séries ou surpresa) e dificuldades; até 5 dicas progressivas por palavra (100 → 80 → 60 → 40 → 20 pontos); entrada por clique, arraste ou teclado físico com suporte a acentos e `Ç`; rascunho sincronizado; cronômetro por palavra/partida; pausa voluntária com desconto explícito de `-100` pontos e retomada segura.
- **Modo Galera (mesmo dispositivo):** anfitrião autenticado + 1 ou 2 convidados; de 1 a 5 sessões regulares; sorteio da ordem por sessão; escolha de letra isolada (100 pontos por posição nova revelada, vogais equivalentes, `C` e `Ç` distintas) ou tentativa de palavra completa; desempate opcional entre líderes.
- **Conta, personalização e acompanhamento:** login Google OIDC com PKCE, nome único, 20 avatares ilustrados, 4 paletas (`Original`, `Azul`, `Roxa`, `Grafite`) em tema claro e escuro independentes, controle de áudio (música do menu, 5 trilhas de partida e 13 efeitos), redução de movimentos, histórico privado (Solo e Galera), estatísticas privadas do Solo e 3 rankings públicos com suporte a empates, saldos negativos e anonimização de contas excluídas (`Jogador excluído`).
- **Mascote Aurélio e Estúdio (`/laboratorio/aurelio`):** o jogo conta com uma rota dedicada em `/laboratorio/aurelio` (`GaleriaAurelio.tsx`, acessível diretamente pela URL ou pelo atalho no diálogo **Como jogar (`?`)**) que reúne todas as atuações, expressões faciais e surpresas do Aurélio lado a lado com a arte original aprovada, com controle de tempo, pausa e visualização das articulações — útil para revisão visual e demonstração em apresentação.
- **Indicadores de carregamento e acessibilidade:** carregamento temático com peças do jogo, estágios progressivos de espera (incluindo aviso de despertar do servidor gratuito após 11 s), faixa flutuante de processamento sem salto de layout (`CLS = 0`), destaque de tecla na Galera e respeito integral a `prefers-reduced-motion` e navegação por teclado.

---

## Arquitetura e tecnologias

| Camada | Stack principal |
| --- | --- |
| **Backend (`Backend/`)** | Python 3.13, FastAPI, Uvicorn, Pydantic Settings, SQLAlchemy Async + Psycopg 3, Alembic (11 migrações), PyMongo Async, Authlib (`==1.9.1`), HTTPX |
| **Frontend (`Frontend/`)** | Node 22 (`>=22.12.0 <23`), React 19.3, TypeScript 7.0, Vite 8.3, React Router 7.18, TanStack React Query 5, `@dnd-kit/react`, Motion 14.9, Howler.js 2.2.4 |
| **Bancos** | PostgreSQL 18 (Neon Free na publicação) e MongoDB 8.2 (Atlas Free na publicação) |
| **Qualidade e CI** | Ruff, Pytest, Prettier, `tsc --noEmit`, Vitest 5, Playwright 1.64 e GitHub Actions ([`.github/workflows/verificacoes.yml`](.github/workflows/verificacoes.yml)) |
| **Publicação** | Vercel Hobby (proxy `/api/*` + SPA React) + Render Free (API FastAPI) |

---

## Divisão entre SQL (PostgreSQL) e NoSQL (MongoDB)

Não há chaves estrangeiras entre bancos nem transações distribuídas (2PC); a integridade entre ambos ocorre por **identificador e revisão imutável** (`palavra_id`, `revisao`):

- **PostgreSQL (22 tabelas de aplicação + `alembic_version`):** identidade, sessões autenticadas (hash SHA-256 em banco; segredo opaco somente em cookie `HttpOnly`), tentativas PKCE temporárias, visitantes, preferências, avatares, planos expiráveis de configuração, partidas, participantes, sessões/ordens da Galera, rodadas (com `(palavra_id, revisao)` sem copiar respostas ou dicas), palpites, posições reveladas, letras tentadas, rascunhos/conexões, interrupções, penalidades, idempotência de ações (`acoes_processadas`), histórico de exposição de conteúdo (`exposicoes_conteudo`) e resultados individuais agregáveis para estatísticas e rankings.
- **MongoDB (2 coleções: `palavras` e `versoes_palavras`):** catálogo editorial oficial e histórico imutável de revisões das palavras e suas 5 dicas progressivas. O catálogo publicado conta com **500 respostas distintas e 2.500 dicas** em 20 lotes JSON ([`Data/palavras/`](Data/palavras)) e manifesto verificável ([`Data/manifestos/README.md`](Data/manifestos/README.md)).

Mais detalhes em [Doc/Modelagem-dados.md](Doc/Modelagem-dados.md) e [Doc/Contratos-api.md](Doc/Contratos-api.md).

---

## Pré-requisitos e instalação limpa

- **Python 3.13**
- **Node.js 22.x** (`>=22.12.0 <23`) e `npm`
- **PostgreSQL 18** e **MongoDB 8.x** em execução para desenvolvimento e testes integrados

A partir de um clone do repositório:

**Linux / macOS:**

```bash
python3 -m venv Backend/.venv
Backend/.venv/bin/python -m pip install --require-hashes -r Backend/requirements-dev.txt
cd Frontend && npm ci
```

**Windows (PowerShell):**

```powershell
python -m venv Backend/.venv
Backend/.venv/Scripts/python.exe -m pip install --require-hashes -r Backend/requirements-dev.txt
cd Frontend; npm ci
```

> [!TIP]
> Para instalar apenas as dependências de execução da API em produção, utilize `Backend/requirements.txt` com `--require-hashes`.

---

## Configuração de ambiente, bancos e login Google

O repositório versiona apenas exemplos sem credenciais reais:

- [`Backend/.env.example`](Backend/.env.example) — modelo para desenvolvimento local.
- [`Backend/.env.teste.example`](Backend/.env.teste.example) — referência de variáveis para execução isolada dos testes de banco.
- [`Frontend/vercel.json`](Frontend/vercel.json) — regras de compilação da interface e proxy `/api/:caminho*` para publicação na Vercel (não armazenar segredos em variáveis `VITE_*`).

1. Copie `Backend/.env.example` para `Backend/.env` (arquivo ignorado pelo Git) e ajuste as conexões locais:
   - `DECIFRA_POSTGRESQL_URL`: ex. `postgresql://decifra:sua_senha@127.0.0.1:5432/decifra`
   - `DECIFRA_MONGODB_URL` e `DECIFRA_MONGODB_BANCO`: ex. `mongodb://127.0.0.1:27017` e `decifra`
   - `DECIFRA_ORIGEM_PUBLICA` e `DECIFRA_ORIGENS_PERMITIDAS`: mantenha `http://localhost:5173` para desenvolvimento local (não misture `localhost` e `127.0.0.1` no fluxo OAuth)
2. **Autenticação Google (OAuth 2.0 / OIDC):** configure um cliente Web no Google Cloud Console com o URI de redirecionamento `http://localhost:5173/api/autenticacao/google/retorno` (ou o domínio HTTPS público em produção) e preencha `DECIFRA_GOOGLE_CLIENTE_ID` e `DECIFRA_GOOGLE_CLIENTE_SEGREDO` em `Backend/.env`. Sem essas credenciais, o servidor sobe normalmente para saúde/leitura, e o login Google pode ser exercitado nos testes automatizados ou com demonstrações locais. Veja [Doc/Autenticacao-google.md](Doc/Autenticacao-google.md).
3. **Aplicar migrações PostgreSQL (a partir de `Backend/`):**

```powershell
# Linux/macOS: substitua .venv/Scripts/python.exe por .venv/bin/python
.venv/Scripts/python.exe -m alembic upgrade head
.venv/Scripts/python.exe -m alembic check
```

---

## Importação e validação do catálogo (MongoDB)

Os 20 lotes JSON ficam em [`Data/palavras/`](Data/palavras). Dentro de `Backend/`:

```powershell
# 1. Validar estrutura, NFC, duplicidades e regras dos arquivos (sem banco)
.venv/Scripts/python.exe -m comandos.catalogo validar ../Data/palavras

# 2. Conferir situação contra o MongoDB sem gravar
.venv/Scripts/python.exe -m comandos.catalogo conferir ../Data/palavras

# 3. Importar os lotes aprovados para o banco configurado no .env
.venv/Scripts/python.exe -m comandos.catalogo importar ../Data/palavras

# 4. Consultar totais publicados e distribuição por temática/dificuldade
.venv/Scripts/python.exe -m comandos.catalogo quantidades
```

Mais detalhes sobre reimportação segura, manifesto SHA-256 e publicação de revisões em [Doc/Importacao-catalogo.md](Doc/Importacao-catalogo.md) e [Doc/Revisoes/catalogo-final.md](Doc/Revisoes/catalogo-final.md).

---

## Execução local

Abra dois terminais na raiz do projeto:

**Terminal 1 — API FastAPI (porta `8000`):**

```powershell
# Linux/macOS: Backend/.venv/bin/python ...
Backend/.venv/Scripts/python.exe -m uvicorn aplicacao.principal:aplicacao --app-dir Backend --host 127.0.0.1 --port 8000 --reload --no-access-log
```

**Terminal 2 — Frontend Vite (porta `5173`, com proxy `/api` → `127.0.0.1:8000`):**

```powershell
cd Frontend
npm run dev
```

Acesse `http://localhost:5173`. (No Windows, `--reload` no Uvicorn seleciona o `SelectorEventLoop` compatível com o Psycopg assíncrono; sem `--reload`, informe `--loop asyncio:SelectorEventLoop`.)

---

## Verificações automatizadas disponíveis

### Backend (`Backend/`)

```powershell
.venv/Scripts/python.exe -m ruff check .
.venv/Scripts/python.exe -m ruff format --check .
.venv/Scripts/python.exe -m pytest
```

Para executar também os testes integrados reais de persistência e catálogo (caso contrário ignorados por segurança), exporte explicitamente apontando para instâncias **locais e descartáveis de teste** (PostgreSQL terminado em `_teste`):

```powershell
$env:DECIFRA_POSTGRESQL_TESTE_URL = "postgresql+psycopg://decifra_teste@127.0.0.1:55432/decifra_teste"
$env:DECIFRA_MONGODB_TESTE_URL = "mongodb://127.0.0.1:27018"
.venv/Scripts/python.exe -m pytest
```

O teste opcional `teste_jogo_navegador.py` (`DECIFRA_EXECUTAR_JOGO_COMPLETO=1`) valida o pacote compilado `Frontend/dist` integrado à API Python e ao PostgreSQL.

### Frontend (`Frontend/`)

```bash
npm run verificar-formatacao   # Prettier (--check)
npm run tipos                  # tsc --noEmit
npm test                       # Vitest (testes unitários)
npm run build                  # Build de produção (dist/)
```

Suítes Playwright em `Frontend/testes-navegador/` (computador, tablet e celular; defina `DECIFRA_CANAL_NAVEGADOR=chromium` no Linux/CI — no Windows o padrão local é `msedge`):

- `npm run testar-interrupcoes` — prova integrada com API Python real (pausa, recarga, offline e saída na Galera)
- `npm run testar-carregamento` — carregamentos temáticos, estágios progressivos de servidor lento/despertando e zero salto de layout
- `npm run testar-menu` — menu dinâmico, entrada, falas, surpresas do Aurélio e responsividade
- `npm run testar-entrada` — entrada por clique, arraste, teclado físico e acentuação NFC
- `npm run testar-individual` — fluxo completo do Modo Solo, demonstração, dicas, cronômetro e rascunho
- `npm run testar-galera` — configuração e painel compartilhado do Modo Galera
- `npm run testar-perfil` — cadastro, avatares, paletas, exclusão de conta e sessões
- `npm run testar-acompanhamento` — histórico privado, estatísticas e rankings públicos
- `npm run testar-mascote` — poses, recortes e animações do Aurélio
- `npm run testar-audio` — músicas, efeitos, volumes, silêncio e saída real Web Audio
- `npm run testar-acabamento` — foco, falhas recuperáveis, redução de movimentos e 8 aparências
- `npm run testar-uso-real` — orçamento inicial de JavaScript (`<= 500 KiB`), fontes bloqueadas e teclado

---

## Documentação técnica, créditos e limites conhecidos

### Documentação detalhada em `Doc/`

- **Visão de produto e regras:** [Detalhes.md](Doc/Detalhes.md), [Planejamento-tecnico.md](Doc/Planejamento-tecnico.md), [Guia-visual.md](Doc/Guia-visual.md) e [Apresentacao.md](Doc/Apresentacao.md)
- **Especificações por módulo:** [Autenticacao-google.md](Doc/Autenticacao-google.md), [Perfil-preferencias.md](Doc/Perfil-preferencias.md), [Demonstracao-visitante.md](Doc/Demonstracao-visitante.md), [Configuracao-galera.md](Doc/Configuracao-galera.md), [Motor-individual.md](Doc/Motor-individual.md), [Partida-individual.md](Doc/Partida-individual.md), [Pausa-retomada-individual.md](Doc/Pausa-retomada-individual.md), [Cronometro.md](Doc/Cronometro.md), [Motor-galera.md](Doc/Motor-galera.md), [Painel-galera.md](Doc/Painel-galera.md), [Historico-estatisticas-rankings.md](Doc/Historico-estatisticas-rankings.md), [Entrada-respostas.md](Doc/Entrada-respostas.md), [Menu-dinamico.md](Doc/Menu-dinamico.md), [Aurelio-animado.md](Doc/Aurelio-animado.md), [Aurelio-evolucao.md](Doc/Aurelio-evolucao.md) e [Carregamentos.md](Doc/Carregamentos.md)
- **Publicação, auditoria e aceite:** [Publicacao-ambiente.md](Doc/Publicacao-ambiente.md), [Publicacao-gratuita.md](Doc/Publicacao-gratuita.md), [Aceitacao-final.md](Doc/Aceitacao-final.md), [Uso-real-acessibilidade-desempenho.md](Doc/Uso-real-acessibilidade-desempenho.md), [Integridade-acesso-falhas.md](Doc/Integridade-acesso-falhas.md) e [Roteiro-primeira-entrega.md](Doc/Roteiro-primeira-entrega.md)

### Procedência dos recursos visuais e sonoros

- **Tipografia:** `Bricolage Grotesque` e `DM Sans` hospedadas localmente em `Frontend/public/fontes/` sob licença **SIL Open Font License** (`bricolagegrotesque-OFL.txt` e `dmsans-OFL.txt`).
- **Ícones da interface:** geometria SVG da família [Lucide](https://github.com/lucide-icons/lucide/tree/1980e3d59b0fa1a2aeb566d5902b25ee98204001/icons) em [Icone.tsx](Frontend/src/componentes/Icone.tsx) com avisos **ISC / MIT** preservados em [`Frontend/public/icones/LICENCA-Lucide.txt`](Frontend/public/icones/LICENCA-Lucide.txt); favicon vetorial em [`Frontend/public/favicon.svg`](Frontend/public/favicon.svg).
- **Mascote Aurélio e 20 avatares:** arte original conceitual do projeto com apoio da ferramenta integrada de geração de imagens e recortes autorais; prompts e registros em [Doc/Identidade-visual/LEIA-ME.md](Doc/Identidade-visual/LEIA-ME.md), [Doc/Identidade-visual/Avatares/LEIA-ME.md](Doc/Identidade-visual/Avatares/LEIA-ME.md) e [Doc/Identidade-visual/Aurelio-saudacao-02.md](Doc/Identidade-visual/Aurelio-saudacao-02.md).
- **Trilhas musicais (6 faixas CC0) e efeitos (13 WAV):** faixas `CC0 1.0` do OpenGameArt (créditos completos em [Doc/Audio/README.md](Doc/Audio/README.md), [`Doc/Audio/arquivos.json`](Doc/Audio/arquivos.json) e na tela de Configurações da interface); os 13 efeitos sonoros são sintetizados pelo gerador do projeto [`Backend/comandos/gerar_efeitos.py`](Backend/comandos/gerar_efeitos.py).

### Limites conhecidos da versão atual

- **Hospedagem gratuita:** Render Free entra em suspensão após ~15 min sem requisições; as faixas de saída do Render precisam permanecer liberadas no MongoDB Atlas caso mudem no provedor.
- **Modo Galera no mesmo dispositivo:** todos os participantes compartilham a sessão autenticada do anfitrião (não há salas remotas por rede nesta primeira entrega).
- **Confiabilidade temporal e dispositivos:** o cronômetro registra o tempo ativo apenas como dado informativo (sem corte punitivo); validação automatizada em navegador cobre desktop, tablet e celular emulados (sem suíte automatizada em aparelhos físicos).
- **Biblioteca Authlib:** emite aviso de depreciação interna (`httpx` -> `httpx2` no `assertion_client.py`), sem afetar o fluxo OIDC utilizado pelo projeto.

Leia [AGENTS.md](AGENTS.md) antes de modificar o projeto. Arquivos privados de configuração (`.env`, `.env.publicacao`), bancos isolados de teste, capturas locais e dependências instaladas permanecem fora do Git.
