# Planejamento técnico — Decifra

**Situação:** planejamento inicial aprovado; dependências ainda não instaladas e código ainda não preparado.

**Requisitos de produto:** [Detalhes.md](Detalhes.md).

**Regras de implementação:** [Agents/Regras.md](../Agents/Regras.md), com português obrigatório nos nomes controlados pelo projeto e exceções de compatibilidade para ferramentas e bibliotecas. A entrada dessas instruções para agentes fica em [AGENTS.md](../AGENTS.md).

Este plano atende aos dois modos na primeira entrega, com React, FastAPI, PostgreSQL, MongoDB, animações, áudio e publicação gratuita. As bibliotecas e a direção técnica foram aprovadas pelo responsável pelo projeto. As versões exatas serão fixadas após verificar compatibilidade no ambiente local; não se presume que a versão mais recente de cada pacote seja a combinação correta. Pontos identificados como ainda em aberto permanecem sujeitos à modelagem e às verificações descritas.

## 1. Arquitetura

Uma interface React e uma API FastAPI organizada por módulos de negócio. A API será a autoridade para palpites, pontuação, turnos, penalidades e resultados.

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

Aplicar a direção aprovada em [Guia-visual.md](Guia-visual.md): paleta oliva/bege/verde-lima, Bricolage Grotesque e DM Sans. Centralizar cores em variáveis semânticas por tema; usar pesos reais e itálico de DM Sans, preservando leitura e acentuação. Preparar fontes locais e licenças na implementação do frontend. A aprovação visual não significa que os componentes já estejam implementados.

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

Recomendação: sessão da aplicação registrada no PostgreSQL, identificada por um valor opaco em cookie HttpOnly. No ambiente publicado, usar HTTPS, validar o retorno do provedor e proteger as ações autenticadas contra requisições forjadas.

Credenciais do Google ficarão no servidor. O primeiro login conduzirá à escolha de nome e avatar. A demonstração será vinculada uma única vez, sem duplicar histórico ou pontos.

Domínios, encaminhamento de `/api`, CORS e atributos dos cookies serão definidos junto à hospedagem. Preferir uma organização de domínio que permita sessões confiáveis no navegador.

## 6. Organização proposta

```text
frontend/
  src/
    aplicacao/
    componentes/
    funcionalidades/  # autenticacao, individual, galera, perfil,
                      # classificacoes e configuracoes
    mascote/
    audio/
    servicos/
    estilos/
backend/
  aplicacao/
    nucleo/
    bancos/
    modulos/          # autenticacao, jogadores, catalogo, individual,
                      # galera, historico, classificacoes e preferencias
  migracoes/
  comandos/
  testes/
dados/
  palavras/
Doc/
```

Essa estrutura ainda não foi criada. Cada módulo do backend organizará rotas, validação, regras e acesso a dados. As regras de pontuação deverão ser testáveis sem abrir a interface.

## 7. Consistência e importação

MongoDB será o catálogo oficial. PostgreSQL manterá progresso e resultados. Cada resposta terá identificador estável referenciado pelas rodadas. Não haverá suposição de uma transação única abrangendo os dois bancos.

Pontos e mudança de turno da mesma ação serão registrados juntos no banco relacional. O resultado individual será publicado uma única vez no encerramento. A forma de preservar o conteúdo utilizado em cada partida será fechada na modelagem.

O importador será um comando Python separado da interface pública, reutilizando Pydantic e PyMongo. Deverá ler os lotes UTF-8, validar os campos, identificar duplicatas, oferecer conferência sem gravar e importar sem sobrescrita silenciosa.

Conferir a meta de 500 respostas e 2.500 dicas, com 100 respostas por temática: 40 fáceis, 35 médias e 25 difíceis. Reexecutar a importação não poderá criar cópias. Correções de conteúdo existente serão explícitas.

## 8. Verificação e ferramentas

| Ferramenta | Uso previsto |
| --- | --- |
| pytest + HTTPX | Regras do backend e integração da API |
| Vitest | Entrada de letras, acentos e preferências |
| Playwright | Fluxos completos em tamanhos de computador, celular e tablet |

Priorizar pontuação por dica, pausa sem duplicação, posições fixas, acentos, distinção entre C e Ç, limpeza após erro, conteúdo visto, turnos, desempate e vinculação da demonstração. Testes deverão verificar comportamentos relevantes, não apenas repetir a estrutura dos componentes.

Usar npm com arquivo de lock no frontend. No backend, preparar ambiente virtual e versões fixadas; o mecanismo de lock será escolhido na preparação do ambiente. Os bancos locais já estão instalados e Docker não será requisito.

## 9. Prova técnica prioritária: interrupções

O navegador não oferece uma notificação infalível para distinguir todo fechamento de uma atualização, especialmente quando o processo é encerrado ou o dispositivo suspende a execução. A documentação de `beforeunload` registra limitações, inclusive em dispositivos móveis.

Antes de depender dessa distinção para penalizar ou encerrar uma partida, testar identificação da aba, atividade, recarga e reconexão com confirmação do servidor. Conexões persistentes e notificações de saída podem ajudar, mas não eliminam toda ambiguidade.

As regras de produto continuam em Detalhes.md. Se os testes exigirem uma janela de reconexão ou outra adaptação perceptível, apresentar a proposta para decisão. Não penalizar uma simples atualização como forma de contornar a dificuldade.

## 10. Publicação

Neon e MongoDB Atlas foram escolhidos para os bancos. A interface poderá ser publicada como arquivos estáticos; a API precisará de hospedagem Python compatível com o mecanismo de interrupção validado.

Os provedores de interface e API ainda não foram escolhidos. Comparar planos gratuitos considerando suspensão por inatividade, conexões, resposta, limites de uso e organização dos domínios. Não há serviço pago previsto nesta recomendação.

## 11. Ordem sugerida de implementação

1. Validar o comportamento de atualização e fechamento.
2. Preparar estrutura, dependências e conexões locais.
3. Modelar os dados e importar um pequeno lote revisado.
4. Implementar login, primeiro acesso, perfil, exclusão de conta e demonstração. Antes de modelar a exclusão, aprovar seus efeitos sobre dados relacionados, sessões de acesso, rankings e novo login; cobrir autorização, cancelamento, falhas e conclusão nos testes.
5. Integrar a partida individual com pontuação e retomada.
6. Integrar o painel com a galera, turnos, sessões e resultado.
7. Completar histórico, rankings e preferências.
8. Finalizar identidade visual, repertório do Aurélio e áudio sobre os fluxos funcionais.
9. Verificar acessibilidade, tamanhos de tela e os dois modos; publicar e validar.

O conceito visual e os componentes podem ser preparados enquanto os contratos são desenhados. A modelagem e a lista de operações da API serão os próximos artefatos técnicos; não estão substituídas por este plano de bibliotecas.

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
