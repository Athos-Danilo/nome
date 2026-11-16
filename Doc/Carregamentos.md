# Indicadores de carregamento e espera — fase 49

**Situação em 16/11/2026:** concluída em código e verificações automatizadas (TDD + SOLID + revisão visual de capturas); documentação de entrega final e apresentação seguem na fase 50.

## 1. Motivação

Na hospedagem gratuita adotada (Render Free, Neon Free e MongoDB Atlas Free), consultas iniciais e ações de partida podem apresentar atraso perceptível — tanto pela latência natural entre serviços gratuitos quanto pelo despertar após inatividade. Sem retorno visual rico durante essa espera, o jogador pode achar que o aplicativo travou ou ficar entediado enquanto aguarda o servidor processar uma jogada no **Solo**, na **Demonstração** ou na **Galera**.

O objetivo desta fase é dar identidade de jogo a todos os momentos de espera, mantendo a interface legível, previsível, acessível e sem saltos de layout.

## 2. Dois momentos de espera

### 2.1. Carregamento de tela e abertura (`<Carregando />`)

Aplicado quando ainda não há painel pronto para exibir (carregamento inicial de sessão/conta, carregamento sob demanda das rotas com `Suspense`, abertura de partidas Solo/Galera/Demonstração e consultas iniciais de Histórico, Estatísticas e Rankings).

- **Composição visual:**
  - Etiqueta contextual em caixa alta (`.etiqueta`), diferenciando abertura geral, Solo, Demonstração, Galera e acompanhamento.
  - **Fileira de peças do Decifra:** quadradinhos estilizados com borda `2px solid var(--texto)`, sombra `0 4px 0 var(--tinta)`, cantos arredondados e letras em `Bricolage` peso 800, formando uma palavra curta do contexto (`DECIFRA`, `PISTA`, `DICAS`, `GALERA` ou `PLACAR`). No modo com movimentos permitidos, as peças fazem uma onda leve e alternam o destaque em `--lima` e `--amarelo`.
  - **Trilha de ritmo:** cinco segmentos inspirados na trilha de progresso do Solo, acendendo em sequência suave.
  - **Zero dependência de imagem externa ou nova mídia:** construído apenas com HTML, CSS e componentes leves já incluídos no pacote inicial, garantindo exibição imediata mesmo em rede lenta.
- **Mensagens progressivas:**
  - `0 – 3,5 s` (**estágio `inicial`**): frase acolhedora específica do contexto (ex.: *"Preparando suas próximas descobertas…"* no geral, *"Separando suas pistas e quadradinhos…"* no Solo, *"Reunindo a galera no mesmo palco…"* na Galera).
  - `3,5 – 11 s` (**estágio `processando`**): curiosidade ou dica leve sobre as regras (ex.: *"Dica do Aurélio: acertar na primeira pista vale 100 pontos."*).
  - `>= 11 s` (**estágio `despertando`**): aviso transparente para despertar do servidor gratuito (ex.: *"O servidor gratuito pode estar despertando — já vamos abrir o palco!"*).

### 2.2. Processamento durante partidas e configurações (`<IndicadorProcessamento />`)

Aplicado quando o jogador já está em tela — configurando desafio, iniciando partida, sincronizando conexão inicial ou aguardando o servidor processar uma jogada no **Solo**, na **Demonstração** ou na **Galera**:

- **Ações cobertas no Solo e na Demonstração:**
  - Envio de palpite completo (`palpite`), incluindo o preparo prévio de confirmação de cronômetro e salvamento de rascunho para evitar janela sem feedback ou cliques duplicados.
  - Pedido de próxima dica (`dica`).
  - Desistência da palavra (`desistencia_palavra`), pausa (`pausa`), retomada (`retomada`), encerramento (`encerramento`) e saída confirmada (`saida`).
  - Sincronização de conexão ao abrir ou retomar partida ativa (`sincronizacao`), exibida após breve intervalo (`180 ms`) para não piscar em conexões rápidas.
- **Ações cobertas na Galera:**
  - Escolha isolada de letra (`letra`): destaca **a própria tecla clicada** (`data-processando="true"`, preservando fundo verde-lima e sem risco sobre a letra) e exibe a letra em uma peça de busca no indicador (*"Procurando a letra A no painel…"*).
  - Envio de palpite completo (`palpite`): informa quem está tentando (*"Conferindo o palpite de Ana…"*).
  - Início do desafio na tela preparada (`inicio_partida`), votação/abertura de sessão extra (`desempate`), encerramento (`encerramento`) e sincronização inicial do painel (`sincronizacao`).
- **Ações nos configuradores e no menu:**
  - Conferência de disponibilidade e criação da partida nos configuradores Solo e Galera (`configuracao`, `inicio_partida`), além de indicação compacta em consultas iniciais do menu (`MenuInicial` e `SituacaoDemonstracao`).
- **Apresentação sem saltos de layout (`CLS = 0`):**
  - Cartão flutuante ancorado na base central da janela (`position: fixed`, `pointer-events: none`), mantendo exatamente inalterados `scrollHeight`, `scrollWidth` e as dimensões da arena compacta no computador (`1920×945`, `1440×900`, `1366×768` e `1280×720`), além de celular e tablet.
  - Mostra peças animadas (ou a letra em busca na Galera), etiqueta do modo, título da ação, subtítulo que evolui após `3,5 s` e `11 s`, e uma faixa de progresso contínua na base do cartão.
  - Os botões acionados também recebem feedback imediato (`0 ms`) com rótulo específico (ex.: `"Conferindo palpite…"`, `"Buscando dica…"`, `"Iniciando desafio…"`), inclusive dentro de diálogos modais abertos (`<dialog>`).

## 3. Regras preservadas e acessibilidade

- **Sem impacto em pontuação, tempo ou reações do Aurélio:** o carregamento é exclusivamente visual e não altera regras de negócio, cronômetro (que continua suspenso durante ações em curso), reações confirmadas do mascote (`data-reacao`) ou efeitos sonoros existentes.
- **Acessibilidade:** contêineres de carregamento usam `role="status"` (sem roubar foco e sem regiões intrusivas); trocas de texto progressivo ocorrem apenas em intervalos espaçados (`3,5 s` e `11 s`).
- **Movimentos reduzidos:** respeita `data-movimentos="reduzidos"` e `@media (prefers-reduced-motion: reduce)`, mantendo peças, barra e layout estáticos e legíveis com zero animações em execução.
- **Paletas e temas:** utiliza apenas as variáveis semânticas de tema (`--fundo`, `--painel`, `--texto`, `--tinta`, `--lima`, `--amarelo`, `--decoracao`, `--sombra-suave`), preservando contraste nas oito combinações (Original, Azul, Roxa e Grafite, claro e escuro).
- **Orçamento de pacote:** não instala novas bibliotecas e preserva o limite automatizado de JavaScript inicial (`<= 500 KiB`).

## 4. Arquitetura (SOLID e TDD)

- `Frontend/src/componentes/carregamento.ts`: módulo puro com definição de contextos, cálculo de estágio por tempo decorrido (`estagioEspera`), mapeamento de rotas (`contextoDaRota`) e seleção tabular de mensagens (`descreverCarregamento`, `descreverProcessamento`), sem dependência de React ou DOM.
- `Frontend/src/componentes/usar-tempo-espera.ts`: hook pequeno para acompanhar o tempo decorrido somente enquanto a espera está ativa, com intervalo espaçado pelos limites dos estágios e limpeza ao desmontar.
- `Frontend/src/componentes/Carregando.tsx`: apresentação do carregamento de tela cheia, reexportado em `Comuns.tsx` para preservar compatibilidade de imports existentes.
- `Frontend/src/componentes/IndicadorProcessamento.tsx`: apresentação da faixa flutuante de ação/sincronização em partidas e configuradores, com atraso opcional configurável.
- `Frontend/src/estilos/carregamento.css`: estilos dedicados aos indicadores de carregamento, peças animadas, botão em processamento e tecla destacada, respeitando redução de movimento e responsividade.

## 5. Verificação realizada

- **Ciclo TDD unitário (`carregamento.test.ts`):** transições de estágio (`inicial`, `processando`, `despertando`), mapeamento das rotas e geração de mensagens para todos os contextos de tela e ações de jogo (incluindo letra destacada e nome do participante na Galera) — erro antes da criação de `carregamento.ts` e 4/4 aprovados depois.
- **Ciclo TDD de navegador (`carregamento.fluxo.ts` / `npm run testar-carregamento`):**
  - Simulação de respostas lentas na abertura (com evolução aos `4 s` e `12 s`), no Solo (sincronização inicial após `180 ms`, dica, preparo síncrono/assíncrono pré-palpite e envio de palpite sem alterar `scrollHeight`/`scrollWidth`), na Galera (início da partida, letra com tecla `data-processando="true"` e palpite de participante) e em movimento reduzido (zero animações ativas), nos perfis `computador`, `tablet` e `celular` — 12/12 aprovados, adicionados ao workflow [.github/workflows/verificacoes.yml](../.github/workflows/verificacoes.yml).
  - Inspeção visual das capturas de tela em `Frontend/test-results/carregamento/` nas paletas Original clara, Azul clara e Roxa escura, em computador, tablet e celular, confirmando legibilidade, contraste e integridade do layout.
- **Verificações estáticas, compilação e regressão do Frontend:** `npm run formatar`, `npm run tipos`, `npm test` (23 arquivos, 133 testes aprovados), `npm run build` (`index-CtWwHLNy.js` com `378,24 kB`; `use-real` mediu `478.440 bytes` de JS inicial total, dentro do limite de `500 KiB`) e aprovação em `testar-uso-real` (6), `testar-individual` (58), `testar-galera` (19), `testar-menu` (152), `testar-entrada` (44), `testar-acabamento` (15), `testar-mascote` (69), `testar-audio` (12), `testar-perfil` (45) e `testar-interrupcoes` (32). Na suíte `testar-acompanhamento`, 12 passaram e 3 falharam exclusivamente na asserção pré-existente de título da aba (`"Cada descoberta conta — Decifra"` vs `"Decifra"`, título fixo adotado no commit `f80b672`). Nenhum código Python/backend foi alterado nesta fase.
