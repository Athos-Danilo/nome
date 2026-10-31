# Planejamento técnico — Decifra

**Fase 37 concluída:** animais fechado com 100 respostas/500 dicas, distribuição 40/35/25. Lotes 002/004 importados após autorização e 16 revisões corretivas do 001 publicadas com histórico preservado. Novo serviço/comando separado para revisão somente de dicas: validação da base e proposta, reserva imutável e publicação com comparação integral do estado esperado. MongoDB local com 350 respostas, 1.750 dicas e 366 revisões; arquivos com 400 respostas e 2.000 dicas. Sem alterações de frontend, PostgreSQL, migração ou dependências. [Revisão editorial](Revisoes/animais-004.md) e [protocolo de revisão](Importacao-catalogo.md#correções-de-dicas-com-revisões--fase-37).

**Fase 36 concluída — repertório aprovado:** primeira saudação por partes raster em SVG aprovada em 2026-10-30. Após autorização, oito novas atuações foram implementadas sobre a mesma montagem, com poses próprias, expressões, efeitos SVG e relógio compartilhado; receberam aprovação visual do responsável em 2026-10-30 (versão `8684d54`). Preserva o PNG aprovado e a linha de tempo da saudação. A primeira interpretação vetorial continua reprovada. Motion permanece na integração/visibilidade; nenhum novo runtime instalado. Galeria em `/laboratorio/aurelio`; [decisões, guia de continuidade e ferramentas](Aurelio-animado.md).

**Fase 34:** histórico privado, estatísticas e três rankings públicos em módulo próprio, sem migração ou duplicação de resultados. PostgreSQL agrega individuais encerradas publicadas; MongoDB fornece temáticas da revisão histórica. React usa consultas validadas, cache por titular, filtros, paginação e telas responsivas. Fórmulas D14/D15 e contratos em [Histórico, estatísticas e rankings](Historico-estatisticas-rankings.md).

**Fase 29 concluída:** configuração autenticada da galera, convidados/avatares, sessões e temáticas, plano privado, reservas sem repetição e primeira ordem persistida. Migração 0009 (22 tabelas). Contratos, decisões, testes e limites em [Configuração da galera](Configuracao-galera.md). O painel jogável permanece nas fases 31/33.

**Fase 28:** pausa confirmada, retomada, rascunho persistido e reconciliação das interrupções do individual e da demonstração implementados. Migração 0006: rascunho JSONB em rodadas e conexões por aba/documento, totalizando 21 tabelas. React Router usa o roteador de dados para bloquear saídas internas até a confirmação. Contratos, verificações e limites em [Pausa e retomada](Pausa-retomada-individual.md).

**Catálogo — fase 27 concluída:** doze lotes produzidos (300 respostas e 1.500 dicas); nove aprovados e importados localmente (225 respostas e 1.125 dicas). Filmes-e-series-003 acrescentou 25 títulos sem sobrescritas, completando 75 nesta temática. Correção com TDD para títulos somente numéricos e 36 montagens de expressões reais verificadas em três tamanhos de tela. Evidências em [Revisão do lote](Revisoes/filmes-e-series-003.md).

**Fase 26 concluída:** Solo e demonstração jogáveis em React, com configuração, dicas, teclado, resultado recuperável e pontos persistidos pelo mesmo motor. API ampliada para sinais fixos/números; autorização própria do visitante. Prova integrada de tela, HTTP e banco aprovada. Contratos, TDD e limites em [Partida individual](Partida-individual.md).

**Catálogo — fase 25 concluída:** onze lotes produzidos (275 respostas e 1.375 dicas); oito aprovados pelo responsável e importados localmente (200 respostas e 1.000 dicas). Animais-003 acrescentou 25 respostas sem sobrescritas; animais-002 permanece pendente de revisão humana. Evidências em [Revisão do lote](Revisoes/animais-003.md).

**Fase 24 concluída:** entrada reutilizável de palpites e escolha de letra, com clique/toque, digitação, arraste via dnd kit 0.5.1, acentos, números e sinais fixos conforme D08. Prévia técnica separada das partidas reais; integração ao motor na fase 26. Contrato, TDD e verificações em [Entrada de respostas](Entrada-respostas.md).

**Fase 22 concluída:** menu React para visitante/conta, primeiro acesso protegido, navegação com React Router 7.18.5, configurações persistidas, resumo real de partida aberta e componentes comuns responsivos. Telas futuras têm páginas explícitas de preparação, sem dados fictícios. Implementação, TDD, verificações e limites em [Menu e navegação](Menu-navegacao.md).

**Fase 20 concluída:** motor individual com configuração confirmável, dificuldades, seleção de inéditas, cinco dicas, pontuação e encerramento. 156 testes backend aprovados. Migração 0005 acrescenta planos individuais, totalizando 20 tabelas. Telas, demonstração jogável e pausa/retomada permanecem nas fases próprias. Contratos e evidências em [Motor individual](Motor-individual.md).

**Fase 19 concluída:** identificação opaca de visitante, reserva única de três respostas fáceis, recuperação e vinculação integral em até sete dias. Conta existente com individual aberta é preservada; vínculo repetido não duplica resultados. 132 testes backend, 30 unitários frontend e 39 fluxos de navegador aprovados. A demonstração jogável continua na fase 26. Detalhes em [Visitante e demonstração](Demonstracao-visitante.md).

**Catálogo — fase 18 concluída:** oito lotes produzidos (200 respostas e 1.000 dicas); cinco revisados e aprovados pelo responsável, importados localmente (125 respostas e 625 dicas). Marcas-002 acrescentou 25 respostas sem sobrescrita. Evidências em [Revisão do lote](Revisoes/marcas-002.md).

**Atualização da fase 17:** primeiro acesso, perfil privado, 20 avatares ilustrados (WebP servido pelo frontend após revisão visual), preferências persistidas e exclusão com anonimização implementados. TanStack Query 5.105.0 instalado; fontes locais e temas aplicados às primeiras telas. Verificações: 122 testes backend, 25 unitários frontend e 24 fluxos de navegador aprovados. Detalhes e limites em [Perfil e preferências](Perfil-preferencias.md). Operações do jogo e áudio continuam nas fases próprias.

**Registro das fases anteriores:** fase 15 concluída, com autenticação implementada, configuração PostgreSQL local e login Google real confirmado pelo responsável. Verificação: 116 testes do backend aprovados, incluindo 38 novos de autenticação. Fase 16 concluída após revisão humana: catálogo com 175 respostas produzidas e 100 aprovadas importadas. Política de interrupções aprovada na fase 13 preserva casos ambíguos, recupera recargas e trata navegação como saída. Perfil completo e operações do jogo permanecem nas fases próprias. Instruções em [Ambiente local](Ambiente-local.md), [Autenticação Google](Autenticacao-google.md), [Modelagem](Modelagem-dados.md), [Contratos da API](Contratos-api.md), [Importação do catálogo](Importacao-catalogo.md) e [Prova de interrupções](Prova-interrupcoes.md).

**Requisitos de produto:** [Detalhes.md](Detalhes.md).

**Regras de implementação:** [Agents/Regras.md](../Agents/Regras.md), com português obrigatório nos nomes controlados pelo projeto e exceções de compatibilidade para ferramentas e bibliotecas. A entrada dessas instruções para agentes fica em [AGENTS.md](../AGENTS.md).

Este plano atende aos dois modos na primeira entrega, com React, FastAPI, PostgreSQL, MongoDB, animações, áudio e publicação gratuita. As bibliotecas e a direção técnica foram aprovadas pelo responsável pelo projeto. As versões exatas serão fixadas após verificar compatibilidade no ambiente local; não se presume que a versão mais recente de cada pacote seja a combinação correta. Pontos identificados como ainda em aberto permanecem sujeitos à modelagem e às verificações descritas.

## 1. Arquitetura

Uma interface React e uma API FastAPI organizada por módulos de negócio. A API será a autoridade para palpites, pontuação, turnos, penalidades e resultados.

**Decisão aprovada em 2026-10-28, válida a partir da fase 15:** aplicar SOLID obrigatoriamente ao código novo e às partes alteradas, mantendo responsabilidades claras, contratos pequenos e dependências explícitas. Regras de negócio serão isoladas dos detalhes de persistência e de serviços externos. A aplicação prática de cada princípio está em [Regras de arquitetura](../Agents/Regras.md#3-arquitetura-e-padrões-de-projeto); não se exige criar abstrações sem necessidade nem reescrever retroativamente as fases concluídas.

```text
React: menu, teclado, animações, Aurélio e áudio
                       |
                 API FastAPI
                 /         \
    PostgreSQL / Neon     MongoDB / Atlas
    contas e progresso    catálogo e dicas
```

Como o modo com a galera usa o mesmo dispositivo, suas ações podem ser enviadas por HTTP comum. Não é necessário criar salas pela internet. Uma conexão persistente poderá ser avaliada separadamente caso seja útil para detectar interrupções.

## 2. Bibliotecas do frontend

| Tecnologia | Papel | Motivo da recomendação |
| --- | --- | --- |
| React + TypeScript | Componentes e contratos de dados | React já foi escolhido; TypeScript ajuda a manter consistentes partidas, turnos e resultados |
| Vite | Desenvolvimento e preparação da publicação | Integra React e TypeScript e gera os arquivos estáticos da interface |
| React Router | Navegação | Organiza menu, configuração, partida, perfil e ranking |
| Tailwind CSS + variáveis CSS | Estilos e temas | Permite criar componentes próprios e manter cores e espaçamentos consistentes |
| Motion para React | Animações | Transições, cartões, revelações, sorteios e movimentos do mascote em HTML e SVG |
| dnd kit | Arraste de letras | Sensores para ponteiro, toque e teclado; clique e digitação também terão controles próprios |
| Howler.js | Efeitos e músicas | Reprodução, volume, repetição e transições de volume |
| Zustand | Estado local compartilhado | Preferências e controles da experiência, sem conceder pontos oficiais |
| TanStack Query | Comunicação e sincronização com a API | Consultas, alterações, cache, carregamento e atualização dos dados |
| Radix Primitives, conforme necessário | Diálogos, seletores e menus | Base de foco e navegação por teclado para componentes com aparência própria |

### Temas e tipografia

Aplicar a direção aprovada em [Guia-visual.md](Guia-visual.md): paleta oliva/bege/verde-lima, Bricolage Grotesque e DM Sans. Centralizar cores em variáveis semânticas por tema; usar pesos reais e itálico de DM Sans, preservando leitura e acentuação. Fontes locais e licenças OFL incorporadas na fase 17; ampliar seu uso nas próximas telas. A aprovação visual não significa que os componentes já estejam implementados.

### Separação do estado

- Componentes React: seleção e montagem temporária das letras.
- Zustand: tema, música, volumes, movimentos reduzidos e controles compartilhados.
- TanStack Query: dados retornados pela API, perfil, ranking e histórico.
- Backend: progresso confirmado, pontuação, palavras vistas e vez do participante.

Uma animação pode contar visualmente até a pontuação confirmada, mas não conceder pontos. Ações que alteram pontos ou turnos não serão repetidas automaticamente sem um identificador que permita ao servidor impedir duplicação.

### Componentes previstos

Botão do jogo, cartão de modo, painel de dicas, quadradinho de letra, teclado virtual, seletor de acento, placar, participante, sorteio de ordem, diálogo de confirmação, controles de áudio e Aurélio.

O arraste será controlado pelo dnd kit. Motion animará a apresentação sem disputar o posicionamento do mesmo elemento durante o gesto. A interação deverá funcionar também por clique, toque e digitação.

## 3. Aurélio e animações

Proposta: preparar o Aurélio como **ilustração SVG dividida em partes** — capa, páginas, braços, pernas, olhos, sobrancelhas e boca — e animá-las com Motion.

O repertório incluirá espera, saudação, pensamento, apresentação de dica, reação ao erro, comemoração, passagem de vez, sorteio e resultado final. Eventos confirmados pelo jogo acionarão as reações, respeitando a preferência por movimentos reduzidos.

O desenho final precisa ser aprovado antes de produzir todo o repertório. Uma imagem estática não substitui a preparação das partes animáveis. A proposta inicial utiliza Motion também no mascote; outra ferramenta só será avaliada se o resultado desejado justificar.

## 4. Áudio

Criar um gerenciador do projeto sobre Howler.js com três grupos: **música**, **interface e teclado** e **eventos da partida**.

Ele controlará volume por grupo, opção geral de silenciar, troca entre aproximadamente cinco faixas lo-fi e arcade e repetição da música selecionada. Os arquivos serão carregados de forma controlada, sem exigir toda a coleção antes de mostrar o menu.

O início do áudio dependerá de uma interação do jogador, respeitando as restrições de reprodução dos navegadores. Evitar sons duplicados por clique e toque e excesso de sobreposição na digitação rápida.

Se um áudio falhar, a partida continuará funcional. Som e animação não controlarão pontuação ou turnos.

## 5. Bibliotecas do backend

| Tecnologia | Papel |
| --- | --- |
| FastAPI | API HTTP e documentação dos contratos |
| Uvicorn | Execução da aplicação |
| Pydantic | Validação de entradas, saídas e arquivos JSON |
| pydantic-settings | Configuração por ambiente e conexões |
| SQLAlchemy | Modelos, consultas e transações do PostgreSQL |
| Psycopg 3 | Driver de comunicação com PostgreSQL |
| Alembic | Histórico de alterações da estrutura relacional |
| PyMongo com API assíncrona | Acesso ao catálogo no MongoDB |
| Authlib | Autenticação Google com OpenID Connect |
| HTTPX | Requisições HTTP do fluxo de autenticação e apoio aos testes de integração |

A proposta é usar acesso assíncrono aos bancos, com conexões e sessões gerenciadas pela aplicação. A compatibilidade entre as versões será testada antes de fixar as dependências.

O catálogo pode usar validação Pydantic e acesso direto pelo PyMongo, sem adicionar outro mapeador de documentos. A recomendação considera a API assíncrona atual do PyMongo, documentada pelo próprio MongoDB.

### Login e sessão

A API iniciará o login Google e receberá o retorno autenticado. O identificador estável da conta Google será vinculado à conta local, mantendo a unicidade de e-mail exigida pelo produto.

Implementação da fase 15: sessão da aplicação registrada no PostgreSQL, identificada por segredo aleatório em cookie HttpOnly, com resumo SHA-256 no banco. Tentativas de login persistidas por dez minutos, vinculadas ao navegador e consumidas atomicamente; Authlib valida assinatura, emissor, público, validade e nonce, com PKCE S256 na troca do código. Ações autenticadas exigem origem pública exata e token CSRF. No endereço HTTPS, cookies Secure e prefixo `__Host-`; localmente, HTTP somente em loopback. Sessão com validade absoluta padrão de sete dias e revogação na saída. Detalhes e pendências em [Autenticação Google](Autenticacao-google.md).

Credenciais do Google ficarão no servidor. O primeiro login conduzirá à escolha de nome e avatar. A demonstração será vinculada uma única vez, sem duplicar histórico ou pontos.

Decisão aprovada na fase 15: frontend na Vercel e API no Render, com rewrite externo de `/api` na Vercel. A origem pública configurada será o endereço estável da interface; ela determina callback, origem autorizada para mutações e cookies. Não derivar callback de Host recebido nem chamar o domínio Render diretamente pelo navegador. Domínios reais, encaminhamento e cookies publicados serão verificados na fase 41.

## 6. Organização proposta

```text
Frontend/
  src/
    aplicacao/
    componentes/
    funcionalidades/  # autenticacao, individual, galera, perfil,
                      # classificacoes e configuracoes
    mascote/
    audio/
    servicos/
    estilos/
Backend/
  aplicacao/
    nucleo/
    bancos/
    modulos/          # autenticacao, jogadores, catalogo, individual,
                      # galera, historico, classificacoes e preferencias
  migracoes/
  comandos/
  testes/
Data/
  palavras/
Doc/
```

Essa estrutura foi iniciada na fase 08, com módulos de configuração, entrada da API e base React. Pastas de expansão ainda vazias não representam funcionalidades implementadas. Cada módulo do backend organizará rotas, validação, regras e acesso a dados. As regras de pontuação deverão ser testáveis sem abrir a interface.

## 7. Consistência e importação

MongoDB será o catálogo oficial. PostgreSQL manterá progresso e resultados. Cada resposta terá identificador estável referenciado pelas rodadas. Não haverá suposição de uma transação única abrangendo os dois bancos.

Pontos e mudança de turno da mesma ação serão registrados juntos no banco relacional. O resultado individual será publicado uma única vez no encerramento. Rodadas referenciam identificador e revisão imutável do conteúdo no MongoDB, preservando a resposta e dicas reservadas para a partida salva.

O importador é um comando Python separado da interface pública, reutilizando Pydantic e PyMongo. Lê os lotes UTF-8, valida os campos, identifica duplicatas, oferece conferência sem gravar e importa sem sobrescrita silenciosa. A publicação inicial e a recuperação de falhas estão descritas em [Importacao-catalogo.md](Importacao-catalogo.md).

Conferir a meta de 500 respostas e 2.500 dicas, com 100 respostas por temática: 40 fáceis, 35 médias e 25 difíceis. Reexecutar a importação não poderá criar cópias. Correções de conteúdo existente serão explícitas.

## 8. Verificação e ferramentas

**TDD será obrigatório a partir da fase 15** para todo comportamento executável novo ou alterado, tanto no backend quanto no frontend. Antes da implementação, escrever e executar um teste que falhe pelo comportamento esperado; implementar até passar; refatorar mantendo os testes passando. Correções começam por um teste de regressão. Refatorações preservam comportamentos cobertos, sem exigir uma falha artificial. As fases 01 a 14 possuem testes, mas não serão apresentadas retroativamente como desenvolvidas com TDD.

O fluxo completo, o alcance sobre integrações, configurações e migrações, o registro das verificações e o tratamento de documentação, conteúdo e recursos visuais estão centralizados em [TDD e verificação](../Agents/Regras.md#9-testes-e-verificação). Cada próxima fase deve reservar trabalho para esse ciclo desde o início; testes não ficam somente para o encerramento. Validação visual, acessibilidade e áudio complementam os testes automatizados.

| Ferramenta | Uso previsto |
| --- | --- |
| pytest + HTTPX | Regras do backend e integração da API |
| Vitest | Entrada de letras, acentos e preferências |
| Playwright | Fluxos completos em tamanhos de computador, celular e tablet |

Priorizar pontuação por dica, pausa sem duplicação, posições fixas, acentos, distinção entre C e Ç, limpeza após erro, conteúdo visto, turnos, desempate e vinculação da demonstração. Testes deverão verificar comportamentos relevantes, não apenas repetir a estrutura dos componentes.

Usar npm com `package-lock.json` no frontend. No backend, ambiente virtual com Python 3.13 e dependências fixadas com hashes por pip-tools em `requirements.txt` e `requirements-dev.txt`. Ruff foi adotado para formatação e verificação Python; Prettier para formatação da interface. Os bancos locais já estão instalados e Docker não será requisito.

## 9. Prova técnica prioritária: interrupções

O navegador não oferece uma notificação infalível para distinguir todo fechamento de uma atualização, especialmente quando o processo é encerrado ou o dispositivo suspende a execução. A documentação de `beforeunload` registra limitações, inclusive em dispositivos móveis.

Antes de depender dessa distinção para penalizar ou encerrar uma partida, testar identificação da aba, atividade, recarga e reconexão com confirmação do servidor. Conexões persistentes e notificações de saída podem ajudar, mas não eliminam toda ambiguidade.

Prova local da fase 13 em [Prova-interrupcoes.md](Prova-interrupcoes.md): HTTP com identidade de aba/documento, tipo de navegação e sinais do navegador. O responsável aprovou preservar a individual sem desconto e o painel da galera nos casos ambíguos. Navegação para outra página, inclusive Voltar/Avançar, conta como saída. Recarga reconhecida permanece sem desconto. Os 10 segundos da prova apenas sinalizam ausência, sem encerrar ou penalizar automaticamente. A integração persistida do individual foi realizada na fase 28; a galera, a hospedagem pública e os aparelhos físicos continuam nas fases próprias.

## 10. Publicação

Neon e MongoDB Atlas foram escolhidos para os bancos. A interface poderá ser publicada como arquivos estáticos; a API precisará de hospedagem Python compatível com o mecanismo de interrupção validado.

O responsável escolheu Vercel para a interface e Render gratuito para a API na fase 15, mantendo Neon e Atlas. O [diagnóstico de publicação](Publicacao-gratuita.md) registra a decisão, suspensão por inatividade, limites e verificações pendentes do rewrite e dos cookies no ambiente público. Nenhum serviço foi provisionado nesta fase e não há recurso pago autorizado.

## 11. Ordem sugerida de implementação

1. Validar o comportamento de atualização e fechamento.
2. Preparar estrutura, dependências e conexões locais.
3. Modelar os dados e importar um pequeno lote revisado.
4. Implementar login, primeiro acesso, perfil, exclusão de conta e demonstração. Efeitos da exclusão aprovados na fase 10: aviso e EXCLUIR, identidade removida, resultados anônimos mantidos nos rankings e novo login começando do zero. Cobrir autorização, cancelamento, falhas e conclusão nos testes da implementação.
5. Integrar a partida individual com pontuação e retomada.
6. Integrar o painel com a galera, turnos, sessões e resultado.
7. Completar histórico, rankings e preferências.
8. Finalizar identidade visual, repertório do Aurélio e áudio sobre os fluxos funcionais.
9. Verificar acessibilidade, tamanhos de tela e os dois modos; publicar e validar.

O conceito visual e os componentes podem ser preparados em paralelo ao backend. A modelagem e a lista de operações da API estão documentadas na fase 10; contratos documentados não significam rotas de negócio já disponíveis.

O detalhamento operacional dessa sequência é mantido em um roteiro de acompanhamento apenas local, incluindo revisão visual antecipada, decisões pendentes e geração intercalada do catálogo. Os vinte lotes são acompanhados em [Controle-do-catalogo.md](Controle-do-catalogo.md). A divisão em sete dias de referência pode ser ampliada sem mudar o escopo aprovado.

## 12. Referências oficiais

- [Vite](https://vite.dev/guide/), [React Router](https://reactrouter.com/start/declarative/installation) e [Tailwind CSS](https://tailwindcss.com/docs/installation/using-vite).
- [Motion para React](https://motion.dev/docs/react) e [dnd kit — sensores](https://dndkit.com/react/guides/sensors/).
- [Howler.js](https://howlerjs.com/), [Zustand](https://github.com/pmndrs/zustand), [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview) e [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction).
- [FastAPI](https://fastapi.tiangolo.com/), [Pydantic Settings](https://docs.pydantic.dev/latest/concepts/pydantic_settings/) e [Authlib — clientes web](https://docs.authlib.org/en/stable/oauth2/client/web/index.html).
- [SQLAlchemy — asyncio](https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html), [Psycopg](https://www.psycopg.org/psycopg3/docs/advanced/async.html) e [Alembic](https://alembic.sqlalchemy.org/en/latest/).
- [MongoDB — PyMongo Async](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/reference/migration/).
- [Vitest](https://vitest.dev/guide/) e [Playwright](https://playwright.dev/docs/intro).
- [MDN — limitações de beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event).


## Complemento: medição de tempo

[Cronômetro informativo](Cronometro.md) implementado no individual e na demonstração: intervalos ativos por rodada e total, sem alterar pontos ou rankings. Migração aditiva 0007 (`rodadas.intervalos_tempo` JSONB anulável), com 21 tabelas preservadas e tempos antigos não inventados. GET/POST nos caminhos `/api/partidas/{partida_id}/tempo` e `/api/demonstracoes/jogo/tempo`; proteção de propriedade/visitante e CSRF mantida. Campos, sincronização, testes e limites estão na especificação. Na fase 29, o responsável definiu tempo por sessão e total para a galera, sem influência na pontuação; integração na fase 33.


## Complemento: paletas de aparência

Decisão de 2026-10-29: quatro paletas (Original, Azul, Roxa e Grafite), cada uma em claro/escuro e todas com destaque #D4FE62. Paleta é escolhida nas configurações e confirmada ao salvar; tema é alternado exclusivamente pelo botão lua/sol. Escolhas são independentes e persistem nas preferências locais/da conta, preservando a precedência já aprovada. Dados anteriores usam Original sem perder os demais ajustes. Especificação e valores no [Guia visual](Guia-visual.md#8-paletas-adicionais--decisão-de-2026-10-29). Implementado com campo `paleta` nas preferências, migração aditiva 0008, normalização de registros antigos e opções de rádio com prévia no formulário. Contratos e evidências no guia visual.


## Fase 29 — configuração da galera

Criação autenticada de participantes e sessões, temáticas manuais/aleatórias, reservas privadas e primeira ordem sorteada. Migração 0009 cria planos_galera (22 tabelas); reenvios não duplicam a partida. A preparação não revela palavras nem registra exposições. Contratos, decisões do cronômetro/falta de conteúdo e verificações em [Configuração da galera](Configuracao-galera.md). Motor, painel e medição por sessão continuam nas fases 31/33.

## Motor da galera — fase 31

Transições imutáveis em `galera/motor.py`, consenso e seleção da extra em `galera/desempate.py`. O motor recebe comandos com identificador e versão, valida turnos e calcula pontos sem depender de HTTP ou bancos. Projeção pública explícita impede exposição dos painéis futuros. Sorteio injetável usa `SystemRandom` na execução normal. Dificuldade da partida é preservada na extra, com escolha de tema ou sorteio viável e sem repetir respostas.

A fase 33 deve carregar o estado sob bloqueio, persistir cada transição e seu recibo atomicamente, integrar referências imutáveis do catálogo e exposições e ligar o painel e o cronômetro. A idempotência do agregado puro não substitui essa transação ou testes concorrentes de API. Decisões, contratos internos, limites e verificação em [Motor-galera.md](Motor-galera.md).

## Fase 33 — painel e persistência da galera

O modo foi integrado ao PostgreSQL e à interface React: teclado compartilhado, palpites completos, sorteio oficial, placar, progressão, consenso da extra, resultado e encerramento. Migração 0010 mantém 22 tabelas, acrescenta progresso privado sem respostas e intervalos por sessão e admite tentativas numéricas. Separados coordenação transacional, reconstrução/projeção, gravação e conexão; catálogo permanece somente leitura. O relógio compartilha a lógica de medição com transporte próprio para sessões, sem aplicar pontuação ou pausa do individual. Contratos, TDD, verificações e limites concretos em [Painel da galera](Painel-galera.md).
