# Roteiro de apresentação — Decifra

Este roteiro organiza a demonstração prática e a defesa técnica do **Decifra** para as disciplinas de **Web II** e **Banco de Dados II**.

- **Endereço publicado (produção gratuita):** <https://decifra-inky.vercel.app>
- **API pública (saúde):** <https://decifra-api.onrender.com/api/saude>
- **Plano B local (caso haja instabilidade de rede na apresentação):** executar a API e o frontend localmente conforme [README.md](../README.md) e [Ambiente local](Ambiente-local.md), mantendo PostgreSQL e MongoDB locais ativos com o catálogo de 500 respostas importado.

> [!TIP]
> Como a API roda no **Render Free**, ela pode entrar em suspensão após 15 minutos sem tráfego. Antes de começar a apresentação, vale abrir `/api/saude` ou iniciar o carregamento da tela inicial para despertar o servidor — o indicador progressivo da Fase 49 também explica esse despertar diretamente na interface caso ocorra ao vivo.

---

## Parte 1 — Demonstração funcional (fluxo de ponta a ponta)

### 1. Abertura, visitante e demonstração única (~2 min)
1. Abrir <https://decifra-inky.vercel.app> em uma janela anônima limpa (visitante sem login).
2. Mostrar o **carregamento temático** na abertura (peças do `DECIFRA`, trilha rítmica e aviso transparente caso a API esteja despertando).
3. No menu dinâmico, apresentar a cena, o **Aurélio** (clicar para reagir), os botões de tema claro/escuro e música do menu, e o card de **Jogo rápido (Demonstração)**.
4. Iniciar a demonstração (3 palavras fáceis sorteadas no MongoDB):
   - Mostrar as **5 dicas progressivas** (100 → 80 → 60 → 40 → 20 pontos), o teclado clicável/arrastável/físico com aplicação de acentos e o indicador flutuante de processamento durante a conferência.
   - Concluir (ou deixar uma pontuação positiva) para mostrar que a demonstração é **única por navegador** (cookie opaco de visitante + `visitantes`).

### 2. Login com Google e vínculo único da conta (~2 min)
1. Clicar em **Entrar com Google** (ou **Guardar com Google** ao fim da demonstração).
2. Explicar brevemente o fluxo **OIDC + PKCE** no servidor: `tentativas_login` guarda o estado temporário e o código é trocado no backend; o navegador recebe apenas um cookie de sessão `HttpOnly`, `Secure`, `SameSite=Lax`, enquanto o banco armazena só o **SHA-256** do segredo.
3. Concluir o primeiro acesso escolhendo nome único (normalizado sem acentos/maiúsculas em `nome_chave`) e um dos **20 avatares ilustrados**.
4. Mostrar o **vínculo da demonstração** (`POST /api/demonstracoes/vincular`): a partida feita como visitante passa para a titularidade da conta e soma no desempenho individual (permitido apenas uma vez).
5. Abrir **Configurações** para demonstrar as **4 paletas** (`Original`, `Azul`, `Roxa`, `Grafite`), tema claro/escuro independente, controle de áudio em 3 grupos e **movimentos reduzidos**.

### 3. Modo Solo, cronômetro, rascunho e pausa (~3 min)
1. Acessar **Solo → Novo desafio**: escolher dificuldade/temática, quantidade de palavras e conferir o plano (`planos_individuais` com validade de 10 minutos e reserva anti-repetição).
2. Iniciar a partida:
   - Mostrar a arena compacta sem rolagem no computador, o **rascunho sincronizado** no servidor (`conexoes_individuais`) e o **cronômetro informativo** (suspenso enquanto uma requisição está em processamento).
   - Pedir uma nova dica e mostrar a queda de pontuação disponível (100 → 80 pontos).
3. Testar a **pausa voluntária**: clicar em **Pausar partida**, confirmar o desconto explícito de **100 pontos** (aceitando saldo negativo) e mostrar o menu informando a **partida em aberto**.
4. **Recarregar / Retomar** a partida pausada: provar que rodadas confirmadas, dicas reveladas, rascunho e saldo foram preservados no PostgreSQL sem duplicar penalidades (`interrupcoes` + `penalidades` + `acoes_processadas`).
5. Acertar ou encerrar a partida para ver a tela de **Resultado** com tempo total e resumo por palavra.

### 4. Modo Galera no mesmo dispositivo (~3 min)
1. Acessar **Galera → Reunir a galera**: adicionar 1 ou 2 convidados (até 3 participantes no total; apenas o anfitrião precisa de conta), escolher quantidade de sessões (até 5) e temáticas.
2. Iniciar e mostrar:
   - **Sorteio oficial da ordem** gravado em `ordens_participantes` para cada sessão;
   - **Escolha de letra isolada:** destaque imediato na tecla escolhida e na faixa flutuante (`Procurando a letra …`); acertos valem **100 pontos por nova posição revelada** mantendo a vez; vogais revelam equivalentes acentuadas e `C`/`Ç` são distintas;
   - **Palpite completo** de uma palavra do painel;
   - (Se ocorrer empate ao fim das sessões) demonstrar a **decisão de desempate** pelos líderes (aceitar uma única sessão extra ou encerrar empatado) e o **placar final**.

### 5. Histórico, estatísticas e rankings (~1,5 min)
1. Abrir **Histórico**: mostrar filtro por modo (`Solo` e `Galera`) e paginação.
2. Abrir **Estatísticas**: destacar que agregam **apenas partidas individuais/demonstrações encerradas** (`resultados_individuais`), sem misturar pontos da Galera e sem contar partida ainda pausada/em aberto.
3. Abrir **Rankings públicos** (`Pontos`, `Palavras acertadas`, `Partidas concluídas`): mostrar suporte a empates, saldos negativos e a anonimização de contas excluídas (`Jogador excluído`).

---

## Parte 2 — Defesa técnica: divisão real entre SQL (PostgreSQL) e NoSQL (MongoDB)

Ponto central para **Banco de Dados II**: o Decifra não duplica dados nem cria joins artificiais entre os bancos; cada mecanismo cuida do que resolve melhor.

### O que fica no SQL — PostgreSQL (22 tabelas de aplicação + `alembic_version`)
Responsável por **estado transacional, identidade, integridade referencial, concorrência e agregações**:
- **Identidade, acesso e preferências:** `jogadores`, `avatares`, `preferencias`, `sessoes_autenticacao`, `tentativas_login`, `visitantes`.
- **Configuração e partidas:** `planos_individuais`, `planos_galera`, `partidas`, `participantes`, `sessoes_galera`, `ordens_participantes`, `rodadas`, `conexoes_individuais`.
- **Eventos, integridade e placares:** `palpites`, `posicoes_reveladas`, `letras_tentadas`, `interrupcoes`, `penalidades`, `exposicoes_conteudo`, `acoes_processadas`, `resultados_individuais`.
- **Por que SQL aqui:**
  - **Restrições e unicidade no próprio banco:** índice único parcial garantindo no máximo **1 partida individual não finalizada** por jogador; chave única de nome (`nome_chave`) e e-mail (`email_chave`); unicidade de `(rodada_id, posicao)` em `posicoes_reveladas` impedindo pontuar duas vezes a mesma letra; `acoes_processadas` garantindo idempotência contra cliques duplicados e reenvios após falha de rede.
  - **Transações ACID:** pausa cobra `-100` pontos exatamente uma vez junto ao registro de interrupção; exclusão de conta remove identidades/sessões/preferências/rascunhos e anonimiza o titular para `"Jogador excluído"` preservando estatísticas e rankings.

### O que fica no NoSQL — MongoDB (2 coleções)
Responsável pelo **catálogo editorial versionado de palavras e dicas**:
- **`palavras`:** documento atual publicado por palavra (`id`, `resposta`, `resposta_chave`, `tematicas`, `dificuldade`, 5 `dicas`, `revisao`, `lote_origem`, `atualizado_em`).
- **`versoes_palavras`:** histórico imutável de cada revisão (`id` + `revisao`).
- **Catálogo atual validado em manifesto:** **500 respostas** e **2.500 dicas** divididas em **5 temáticas** (Animais, Países, Objetos, Marcas, Filmes e séries; 100 palavras cada, 40 fáceis / 35 médias / 25 difíceis por temática), conferidas no Atlas e no banco local.
- **Por que NoSQL aqui:**
  - Estrutura naturalmente orientada a documento (lista ordenada das 5 dicas + múltiplas temáticas + metadados editoriais de lote e revisão).
  - Consultas de seleção por temática/dificuldade indexadas sem alterar esquema relacional quando lotes ou correções editoriais são publicados.

### Como os dois bancos conversam sem transação distribuída (2PC)
- As tabelas relacionais **nunca copiam** o texto da resposta oficial ou as dicas: `rodadas` armazena apenas `(palavra_id, revisao)`.
- Mesmo que uma palavra seja corrigida posteriormente no MongoDB (criando `revisao = 2`), partidas em andamento ou já jogadas continuam consultando a `revisao` exata vinculada à rodada em `versoes_palavras`, garantindo consistência histórica sem acoplamento nem chaves estrangeiras entre bancos.
- A seleção de conteúdo exclui palavras já vistas pelo jogador/anfitrião consultando `exposicoes_conteudo` no PostgreSQL (apenas quando a rodada foi efetivamente apresentada, nunca em reservas canceladas).

---

## Parte 3 — Web II: arquitetura, testes e entrega

- **Backend:** Python 3.13, FastAPI assíncrono, SQLAlchemy Async + Psycopg 3, Alembic (11 migrações), PyMongo Async, Authlib (OIDC/Google). Segurança com cookies `HttpOnly`, validação de origem, cabeçalho `X-Decifra-CSRF` em mutações e `Cache-Control: no-store` em rotas autenticadas/de partida.
- **Frontend:** React 19, TypeScript, Vite (code-splitting por rota mantendo pacote inicial em ~`478 KB`, abaixo de `500 KiB`), TanStack React Query, React Router, `@dnd-kit/react`, Motion e Howler.js sob demanda.
- **Qualidade e CI ([verificacoes.yml](../.github/workflows/verificacoes.yml)):**
  - Desenvolvimento orientado a testes (**TDD**) e **SOLID**.
  - Lint/formatação automática (Ruff no Python; Prettier + `tsc --noEmit` no Frontend), **287+ testes Pytest** contra PostgreSQL 18 e MongoDB 8.2, **133 testes Vitest** e **12 suítes Playwright** cobrindo computador, tablet e celular.
  - Hospedagem 100% gratuita em produção: **Vercel Hobby** + **Render Free** + **Neon Free** + **MongoDB Atlas Free**.
