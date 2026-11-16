# Roteiro de desenvolvimento — menu dinâmico do Decifra

**Criado em 11/11/2026. Versionado no GitHub por solicitação expressa do responsável em 16/11/2026. Preservar como registro de desenvolvimento.**

As referências a roteiro privado/ignorado nos registros anteriores descrevem a política histórica. A partir desta decisão, incluir as atualizações deste roteiro nos commits pertinentes; capturas, logs e configurações privadas continuam ignorados. Não apagar este arquivo sem novo pedido do responsável.

Referência permanente: [Menu dinâmico](Menu-dinamico.md). Preservar o roteiro geral de melhorias já existente; estas fases usam prefixo **MD** e não substituem as fases 01–49 da primeira entrega ou as fases do outro roteiro.

**Estado:** MD-01 concluída em 11/11/2026; MD-02 concluída; MD-03 concluída; MD-04 concluída; MD-05 concluída; MD-06 concluída; MD-07 concluída; MD-08 concluída; MD-09 concluída; MD-10 concluída em 13/11/2026, com aceite final do menu completo. Escopo: as seis ideias aprovadas em 11/11. Não presumir a fase 49 iniciada ou concluída.

## Como acompanhar

Marcar apenas entregas verificadas. Em cada fase registrar: commit de base/final, alterações, TDD quando aplicável (falha inicial → verde → refatoração), verificações, limitações, capturas e decisões do responsável. Estados possíveis: não iniciada, em andamento, em revisão e concluída. Usar mensagens `Menu MD-NN: responsabilidade da fase`, evitando confundir com a primeira entrega. Seguir commit/push recorrente das regras; o roteiro é versionado normalmente, sem necessidade de `git add -f`.

Não fixar dias ou estimativas de execução antes de observar o tamanho real das atuações. Não instalar biblioteca nova para produzir os efeitos previstos. Caso um requisito se mostre incompatível com a arte/mecanismo atual, apresentar a alternativa concreta antes de consolidar uma troca.

## Controle das fases

- [x] MD-01 — Registrar a referência e proteger os fluxos atuais.
- [x] MD-02 — Implementar a política de ritmo, prioridade e interrupção.
- [x] MD-03 — Dar movimento ao cenário.
- [x] MD-04 — Criar a apresentação de entrada e o retorno curto.
- [x] MD-05 — Criar o repertório e a alternância das falas.
- [x] MD-06 — Animar as pequenas cenas de Solo e Galera.
- [x] MD-07 — Refinar as respostas a mouse, toque e teclado.
- [x] MD-08 — Produzir as surpresas e a interação direta do Aurélio.
- [x] MD-09 — Integrar o conjunto e revisar ritmo, acesso e desempenho.
- [x] MD-10 — Fazer o aceite visual, publicar e registrar a entrega.

## MD-01 — Referência e proteção dos fluxos

**Depende de:** documentação e instruções do projeto lidas; estado atual do Git conferido.

1. Registrar commit atual e alterações locais, sem sobrescrever melhorias já feitas por outra sessão. Conferir especialmente `MenuInicial.tsx`, `CartaoModo.tsx`, `Tela.tsx`, `Aplicacao.tsx`, `menu.css`, `acabamento.css` e integração de áudio/mascote.
2. Ler `Aurelio-animado.md` e `Identidade-visual/Aurelio-saudacao-02.md`; identificar as máscaras, a montagem aprovada, relógio, eventos e testes de fidelidade que devem ser preservados.
3. Executar os testes existentes pertinentes e registrar referência visual do menu estabilizado em computador, tablet e celular: autenticado, visitante, demonstração usada e individual em aberto. Não chamar aparência existente de defeito sem compará-la ao aprovado.
4. Mapear fontes de animação atuais para não duplicar entrada, flutuação, reação sonora ou relógio. Conferir o percurso real de redução de movimentos e visibilidade.
5. Preparar uma tabela local de critérios da especificação → componente responsável → teste/inspeção. Capturas são evidência local de teste, sem dados pessoais reais.

**Verificar:** navegação, foco inicial, favicon/título Decifra, ações da demonstração, login, continuidade e controle de música do menu. Usar respostas controladas e dados de teste; não modificar contas reais.

**Entrega:** referência reproduzível e cobertura de preservação. **Concluída quando:** diferenças futuras podem ser comparadas em estados equivalentes, sem uma regressão inicial não explicada.

**Registro MD-01:** concluída em 11/11/2026; base `e44bd04`; 88 testes unitários e 112 de navegador aprovados, dois ignorados previstos; compilação/formatação e links conferidos. Doze capturas e onze fontes no manifesto local `Frontend/test-results/md01/referencia.json`, três folhas de contato inspecionadas. Sem mudança de comportamento/arte da aplicação e sem falha TDD artificial; os novos testes de preservação começaram verdes. Limites e mapa técnico em [Relatório](Revisoes/menu-dinamico-md01.md). Nenhuma pendência bloqueante nesta fase; pausa completa e prioridades são trabalho da MD-02.

## MD-02 — Política temporal e de prioridades

**Depende de:** MD-01.

1. Definir política pura para agenda ativa, contexto, última fala/surpresa e prioridades. Receber tempo e sorteio como dependências para testes determinísticos; não introduzir um gerenciador global para toda a aplicação.
2. Escrever primeiro testes de pausa ao ocultar, retorno sem acumular eventos, deduplicação e precedência da interação sobre acontecimentos decorativos. Testar nenhuma surpresa interrompendo uma atuação protegida.
3. Integrar uma única agenda ao ciclo de vida do menu. Adaptar o mecanismo existente de visibilidade/redução sem misturar preferência de acessibilidade com estado de ausência de forma que uma necessidade de pausa se perca.
4. Cobrir desmontagem, remontagem e execução de efeitos repetida pelo React: nenhum segundo relógio, ouvinte ou evento duplicado. Suspender destaques durante diálogos e substituir eventos vencidos por uma próxima oportunidade, em vez de formar uma fila infinita.
5. Expor somente os sinais que cenas e mascote precisam. Manter estado oficial do jogo e consultas separados desta política.

**Verificar:** testes com relógio/sorteio controlados, integração com preferência mudando em tempo de execução e ausência de efeitos no áudio/dados do jogo.

**Entrega:** base temporal testada, ainda sem exigir todas as cenas prontas. **Concluída quando:** agenda pausa/retoma, limpa recursos e arbitra eventos de forma previsível.

**Registro MD-02:** concluída em 11/11/2026; base `3f3909a`. Testes iniciais falharam pela ausência da agenda, ausência do registro de entrada e conclusão da saudação durante a ajuda. Política pura, relógio injetável, adaptação DOM/React e preservação do saldo de reação implementados. Dez novos testes unitários (um complementar de preservação começou verde), total 98 aprovados; 190 cenários de navegador e dois ignorados previstos; tipos/compilação/formatação aprovados. Doze capturas neutras idênticas à MD-01. Documentação permanente em [MD-02](Revisoes/menu-dinamico-md02.md). Candidatos visuais serão ligados nas fases próprias; sem dependência ou banco novo. Commit final `aa589f3`; push para main confirmado.

## MD-03 — Cenário ambiente

**Depende de:** MD-02.

1. Reutilizar letras, estrelas e círculos presentes. Separar a camada decorativa de texto/controles; aplicar `aria-hidden` e impedir interceptação de ponteiro.
2. Ensaiar trajetórias diferentes para os dois blocos; movimento lento dos círculos; brilhos curtos espaçados. Evitar todos os elementos começando ou atingindo o extremo juntos.
3. Limitar quantidade e amplitude na tela móvel; verificar bordas da moldura, áreas de leitura e rosto do Aurélio. Não acrescentar rolagem horizontal.
4. Conectar pausa por ausência, visibilidade local e redução de movimentos. Preferir CSS/transformações para ciclos, sem renderização React por quadro.
5. Capturar neutro e extremos. Avaliar uma sequência em movimento, porque uma captura parada não demonstra fluidez ou ritmo.

**Verificar:** decoração não clicável/focável, retorno ao repouso acessível, dimensões pequenas, oito combinações de cores e ausência de flashes. Teste primeiro para novos comportamentos de pausa/visibilidade.

**Entrega:** cenário com profundidade discreta. **Concluída quando:** texto e ações permanecem estáveis, a decoração respeita a política e o movimento não parece sincronizado artificialmente.

**Registro MD-03:** concluída em 11/11/2026; base `aa589f3`. CenarioMenu/FundoMenu e CSS com dois blocos, até três brilhos e uma textura de círculos. Pausa e redução tiveram teste antes do código; falha inicial por cenário inexistente. Inspecionadas oito aparências nos três tamanhos e sequência de oito instantes; 24 amostras e três vídeos locais. 98 unitários e 88 cenários de navegador aprovados na rodada final, dois ignorados previstos; tipos/compilação/formatação aprovados. Um carregamento em branco isolado não voltou em três repetições focadas nem na rodada final. [Relatório](Revisoes/menu-dinamico-md03.md). Capturas/vídeos/hash-index em Frontend/test-results/md03, fora do Git. Commit `d2d9cc5`; push confirmado.

## MD-04 — Apresentação de entrada e retorno

**Depende de:** MD-02 e composição de MD-03.

1. Definir sequência curta: marca → saudação → Aurélio → modos ou convite do visitante. Evitar duas animações no mesmo `transform`; aproveitar ou substituir a entrada já existente, sem sobreposição.
2. Testar primeiro primeira entrada da aba, volta de configurações, recarga, indisponibilidade do armazenamento e redução de movimentos. Usar marcação visual separada de sessão autenticada/demonstração.
3. Implementar apresentação de aproximadamente um segundo e retorno curto de 200–350 ms. Registrar parâmetros finais após observação.
4. Garantir foco do título e ações utilizáveis desde o começo. Links não aguardam término da animação e falhas de arte/API não congelam o menu.
5. Verificar navegação rápida durante a entrada, login/deslogar e Voltar/Avançar sem animações ou callbacks remanescentes.

**Entrega:** entrada expressiva e retorno ágil. **Concluída quando:** os dois percursos são perceptíveis, sem atrasar interação e sem restaurar apresentação longa indevidamente.

**Registro MD-04:** concluída em 12/11/2026; base `123fb2f`. Entrada de 860 ms e retorno de 260 ms; registro por sessão da aba, fallback em memória, redução sem repetição e agenda por contexto. Primeiros testes falharam pela ausência do registro/atributos de entrada; implementação e regressões registradas em [Relatório](Revisoes/menu-dinamico-md04.md). Capturas locais em Frontend/test-results/md04. Preservados os ajustes MD-03 aprovados pelo responsável. 102 testes unitários e 111 cenários de navegador aprovados; seis ignorados previstos. Tipos/compilação/formatação e links conferidos. Commit `f910947`; push confirmado em main.

## MD-05 — Falas contextuais

**Depende de:** MD-02 e MD-04.

1. Criar repertório editorial local por contexto, com mensagens curtas, leitura natural e ausência de promessas falsas. Refinar os exemplos da especificação para caber no balão no menor tamanho.
2. Testar seleção válida para visitante/conta/demonstração usada/continuidade, ausência de repetição imediata, estabilidade com redução de movimentos e retorno sem rajada.
3. Implementar cadência de 10–15 segundos ativos, transição curta e espaço reservado. Não remontar a tela ou mudar o título principal para trocar uma fala.
4. Associar fala a expressão compatível disponível. Falas novas não disparam efeitos sonoros automáticos. Se a atuação adequada ainda não existir, usar pose neutra até MD-08.
5. Preservar mensagens reais de erro e continuidade. Não usar região viva recorrente; manter texto alternativo estável e foco intacto.

**Verificar:** textos em oito combinações, zoom, frases longas, estados de carregamento/erro e três tamanhos. Observar pelo menos três minutos para identificar repetição irritante.

**Entrega:** balão que conversa sem interromper. **Concluída quando:** contexto, cadência, acessibilidade e estabilidade de layout estão verificados.

**Registro MD-05 concluída, 12/11/2026:** base `f910947`. Repertório por contexto e balão com reserva de espaço; 10–15 s ativos, transição de opacidade de 180 ms, expressão neutra até MD-08. Testes novos reproduziram a ausência de contexto e a continuação de trocas fora da área visível; corrigidos também bloqueio por erro da demonstração e separação do balão em tablet/celular. 105 unitários e 137 cenários distintos de navegador aprovados; dez ignorados previstos. Compilação, tipos, formatação e links conferidos. Sessão real de três minutos com 13 trocas, intervalos de 10,67–14,76 s, sem repetição imediata ou novo áudio. Roteiro permanece ignorado. Capturas/logs locais em Frontend/test-results/md05; relatório em Revisoes/menu-dinamico-md05.md. Commit `d0e28e9`; push confirmado em main.

## MD-06 — Cenas internas dos cartões

**Depende de:** MD-02 e MD-04.

1. Solo: definir duas ou mais palavras curtas decorativas e poses de mistério → formação → leitura → retorno. Não consumir catálogo, registrar exposição ou antecipar resposta da partida.
2. Galera: criar alternância de destaque dos três avatares aprovados, com expressão de passagem de vez. Não fingir pessoas online ou uma partida real.
3. Estabelecer durações diferentes e descansos. Compartilhar somente primitivas equivalentes; manter conteúdo e intenção de cada cena explícitos.
4. Testar primeiro início/parada, preferência reduzida e permanência do nome/destino acessível do link. Evitar que letras decorativas componham o nome acessível de modo diferente em cada quadro.
5. Tratar imagens não carregadas com composição legível. Decorativos não mudam a dimensão do cartão, área clicável ou destino.

**Verificar:** clique durante poses extremas, teclado, ausência, rolagem móvel, cartões fora da área visível e visitante sem esses cartões. Comparar cenas em um registro de vídeo/observação, não apenas capturas.

**Entrega:** identidade animada própria para Solo e Galera. **Concluída quando:** cenas são reconhecíveis, não competem constantemente e não mudam as regras de navegação.

**Registro MD-06 concluída, 12/11/2026:** base `d0e28e9`. Cenas CSS locais com Solo (SOL/LUA, ciclo de 24 s) e Galera (três destaques, ciclo de 30 s). Pausa pela agenda/visibilidade local, redução estática e avatar substituto quando falha a imagem. Testes de comportamento e conflito com estilos antigos começaram vermelhos; integração inicial verde. Gravações ampliadas para mais de um ciclo completo, sem avançar artificialmente o relógio. Corrigida a separação do selo em três picos; nove capturas finais inspecionadas. 105 unitários e 142 cenários distintos de navegador aprovados; oito ignorados previstos. Tipos, compilação, formatação e links conferidos. Capturas/vídeos locais em Frontend/test-results/md06; relatório em Revisoes/menu-dinamico-md06.md. Commit `a1e0f57`; push confirmado em main.

## MD-07 — Mouse, toque e teclado

**Depende de:** MD-06.

1. Testar primeiro link acionado uma vez por toque, foco de teclado visível, cancelamento de ponteiro, gesto de rolagem sem ativação e remoção da inclinação ao sair/desmontar.
2. Aplicar elevação e resposta da seta/ilustração no hover e no foco. No ponteiro preciso, adicionar inclinação inicial limitada a cerca de três graus, com retorno amortecido.
3. Isolar inclinação em camada própria. Não recalcular estado da aplicação toda em cada evento de ponteiro; limpar qualquer quadro pendente.
4. No toque, usar resposta de pressão, sem simular hover obrigatório ou exigir segundo toque. No teclado, manter Enter e comportamento nativo do link.
5. Desativar movimento espacial na preferência reduzida, mantendo destaque legível e foco. Não fazer o cartão seguir o cursor em dispositivo de toque.

**Verificar:** controles internos não aninhados, compatibilidade com menus/diálogos, foco ao voltar e navegação imediata no modo reduzido.

**Entrega:** cartões responsivos à intenção de jogar. **Concluída quando:** os três meios de entrada funcionam sem clique perdido, navegação dupla ou estilo preso.

**Registro MD-07 concluída, 12/11/2026:** base `a1e0f57`. Área do link fixa, superfície própria com inclinação limitada a 3°, elevação/pressão e respostas de seta/ilustração. Controlador com recursos de quadro injetáveis, limpeza de eventos e adaptação React separada. Cinco testes unitários novos e testes de navegador começaram vermelhos; 12 casos focados aprovados, nove ignorados específicos. Gravações/capturas locais em Frontend/test-results/md07; relatório em Revisoes/menu-dinamico-md07.md. Regressão concluída: 110 unitários e 154 cenários distintos de navegador aprovados; 17 ignorados previstos. Corrigida a transição que continuava ao pausar, sem relaxar o teste MD-06. Três vídeos, 24 aparências, três poses de hover e três composições reduzidas inspecionadas. Compilação, tipos, formatação e links conferidos. Commit `b7651c7`; push confirmado em main.

## MD-08 — Surpresas e interação do Aurélio

**Depende de:** MD-02, MD-05 e MD-07.

1. Desenhar uma ficha por intenção: olhar para Solo/Galera, ajeitar gravata, seguir letra flutuante e reação especial ao ser ativado. Registrar pose inicial, antecipação, gesto, olhos/sobrancelhas, movimento secundário e retorno; evitar reaproveitar o aceno inteiro para intenções diferentes.
2. Proteger saudação e repertório aprovado. Escrever primeiro testes para novas regras de disparo/prioridade/deduplicação; criar regressões de poses/encaixes quando ampliar amplitude.
3. Produzir sobre a mesma montagem raster/SVG. Preservar mãos, luvas, punhos, tornozelos, sapatos e máscaras dos olhos, sem redesenho vetorial simplificado ou relaxamento de tolerâncias.
4. Integrar oportunidades automáticas de 20–35 segundos ativos, intercaladas com descanso; não enfileirar cliques. Oferecer ativação por mouse/toque/Enter/Espaço com nome acessível e foco visível.
5. Com movimento reduzido, usar texto/pose estática. Se usar efeito manual, reutilizar áudio autorizado e gerenciador existente, uma vez por ativação; nada de som periódico automático.
6. Examinar extremos na galeria/ensaio e no menu real. Apresentar novas atuações ao responsável, registrar aprovação ou ajustar antes de chamá-las concluídas. Desenvolvimento pode prosseguir nas partes independentes enquanto aguarda essa avaliação.

**Entrega:** novas atuações fiéis e integradas. **Concluída quando:** regras e regressões passam e as novas atuações receberam aceite artístico explícito.

**Registro MD-08, 12/11/2026:** base `3e1d12e`. Cinco gestos novos e ficha por intenção, com apresentação separada das reações de jogo. Agenda com registros independentes, duração própria, espera manual única e descanso. Integração nativa, redução textual, congelamento da pose e preservação de foco. Verificações concluídas: 126 unitários e 269 cenários distintos de navegador aprovados; 17 ignorados previstos. Tipos, formatação e compilação aprovados. Três gravações, 90 poses e 24 aparências inspecionadas em telas emuladas; observação real de cinco minutos com 16 falas e nove surpresas. Tolerâncias preservadas. As cinco atuações receberam aprovação expressa do responsável em 12/11/2026. Fichas e evidências no [relatório MD-08](Revisoes/menu-dinamico-md08.md). Aceite artístico registrado; caixa concluída.

## MD-09 — Integração e revisão do conjunto

**Depende de:** MD-03 a MD-08; MD-08 pode estar em revisão artística, mas não é presumida aprovada.

1. Observar o menu por pelo menos cinco minutos: identificar coincidências frequentes, fala sobreposta à surpresa, ausência de descanso e repetição. Ajustar cadências mantendo testes determinísticos por limites e invariantes, sem depender de espera real longa nos testes.
2. Exercitar conta, visitante, demonstração usada, individual em aberto, erro de consulta e sessão expirada. Conferir que prioridade de mensagem real vence os acontecimentos decorativos.
3. Percorrer rotas, abrir ajuda, mudar preferências, ocultar/retornar, rolar o mascote para fora da tela e navegar rapidamente. Verificar ausência de áudio extra, acúmulo de temporizadores e trabalho contínuo indevido.
4. Comparar consumo e fluidez antes/depois em condições equivalentes, incluindo dispositivo emulado lento. Registrar método e limitações; reduzir camadas caras se necessário, sem declarar 60 fps universal.
5. Repetir testes afetados de menu, mascote, áudio, acabamento e uso real; tipos, formatação, compilação e unidade. Ampliar para individual/galera somente se componentes compartilhados ou navegação desses fluxos forem alterados.
6. Conferir as oito combinações de tema/paleta, zoom, teclado e janela baixa em computador/tablet/celular. Solicitar observação em celular físico quando disponível, registrando se não ocorreu.

**Entrega:** conjunto coeso e relatório de regressão. **Concluída quando:** não há conflitos ou falhas bloqueantes conhecidos e os limites das verificações estão explícitos.

**Registro MD-09, 12/11/2026:** revisão antecipada sobre a base `fed4b1f`, solicitada expressamente pelo responsável antes da MD-08. Observação ampliada para cinco minutos e preservação de navegação repetida; comparação com `e44bd04` em referência isolada. Revisão do escopo atual verificada: 115 unitários e 235 cenários distintos de navegador aprovados; 18 ignorados específicos. Refatoração das definições SVG fixas com preservação de arte e melhoria no ensaio limitado. Comparações de desenvolvimento e compilação registradas. Relatório permanente [MD-09](Revisoes/menu-dinamico-md09.md). A caixa permanece aberta: falta integrar e rever as novas atuações MD-08. Teste em celular físico oferecido pelo responsável, aguardando resultado.

## MD-10 — Aceite, publicação e encerramento

**Depende de:** MD-09 e aprovação das novas atuações.

1. Apresentar menu integrado em movimento ao responsável: entrada completa, retorno curto, falas, cenas dos modos, cenário, interações e surpresas. Registrar ajustes finais e sua verificação; teste passando não substitui aprovação estética.
2. Atualizar `Menu-dinamico.md`, guia visual e planejamento com o entregue, parâmetros finais e evidências. Remover apenas pendências resolvidas; registrar limitações concretas remanescentes.
3. Revisar diff/arquivos e ausência de segredos e caches. Incluir este roteiro versionado quando pertinente e preservar os arquivos privados que continuam ignorados.
4. Commit/push da fase após verificações; conferir publicação na Vercel, título/favicon, carregamento da arte e navegação dos dois modos sem alterar dados reais. Publicação técnica não implica fase 49 concluída.
5. Registrar aceite, commit e publicação. Manter este documento até o responsável decidir apagá-lo; não apagar por conta própria o roteiro geral de melhorias.

**Entrega:** menu dinâmico aprovado, publicado e documentado. **Concluída quando:** as seis ideias estão entregues, revisadas no conjunto e verificadas no ambiente publicado.

**Registro final:** data / aceite / commit / publicação / limitações / próxima etapa.

## Preservação deste roteiro

Todas as caixas concluídas, decisões relevantes transferidas para documentação permanente, publicação conferida e evidências finais registradas sem dados pessoais. O roteiro deve ser preservado no repositório conforme a decisão de 16/11/2026; qualquer remoção depende de novo pedido do responsável e da revisão dos links necessários.


## Matriz local da referência MD-01

Base observada: `e44bd04`; relatório permanente em `Revisoes/menu-dinamico-md01.md`. Capturas/manifesto: `Frontend/test-results/md01/`.

| Critério | Responsável atual/proposto | Verificação de referência e evolução |
| --- | --- | --- |
| Permissões e convites | MenuInicial / SituacaoDemonstracao | Quatro cenários de referência; testes de demonstração usada e primeiro acesso |
| Links, foco e título | CartaoModo / Tela / Aplicacao | Navegação atual, Google, título Decifra e favicon; MD-04/07 preservam |
| Retomada | Continuidade | Partida aberta de 80 pontos, falha recuperável e sessão expirada |
| Arte e articulações | AurelioRecortado / recortes / contornos-olhos | Fidelidade, frestas e halos nas nove atuações; MD-08 amplia |
| Relógio e prioridade | Aurelio / useRelogioAtuacao / futura agenda local | Relógio atual observado; política nova e ausência sem rajada na MD-02 |
| Preferências | useMovimentosReduzidos / data-movimentos | Redução de sistema nas referências; mudanças em execução na MD-02 |
| Pausa | Visibilidade / in-view / agenda futura | Anotar limite do temporizador atual; provar nova política na MD-02 |
| Entrada | Tela / acabamento.css / entradas específicas de visitante | Preservar foco; substituir fontes de entrada concorrentes na MD-04 |
| Falas | Balão atual / repertório futuro | Contexto fixo nas referências; alternância editorial na MD-05 |
| Cenas | CartaoModo / arte-cartao | Nomes acessíveis estáveis; cenas e ritmos na MD-06 |
| Interações | CSS de cartões / ponteiro futuro | Links nativos, hover/pressão atuais; toque/rolagem/cancelamento na MD-07 |
| Áudio | ProvedorAudio / GerenciadorAudio | Uma trilha nas seções, silêncio, gesto, botão/volume; nenhuma segunda fonte na evolução |
| Layout | menu.css / base.css | Doze capturas e três folhas de contato; emulação, não aparelho físico |
| Desempenho | Camadas CSS / quadro do mascote | Nesta fase somente inventário; comparação medida fica na MD-09 |
| Aceite | Responsável / documentação permanente | Aprovação anterior como referência; novas atuações MD-08 e conjunto MD-10 |


### Revisão da MD-03 em 12/11/2026

Solicitação: fundo mais perceptível, fala fora dos pés e menor vão antes da navegação móvel. Três testes reproduziram os problemas antes da alteração; corrigidos por CSS. Fundo: 24 s, fase −2,5 s, amplitude até 48/32 px, contraste 0,10 e recorte 64 px. Balão à esquerda, separado da descrição em conta/visitante; distribuição flexível dos cartões e rodapé compacto com reserva segura. Quatro alturas e três larguras verificadas, incluindo retomada disponível. 98 testes de unidade e 84 de navegador aprovados; seis ignorados previstos; tipos/compilação/formatação aprovados. Capturas locais em Frontend/test-results/md03-ajustes, relatório permanente em Revisoes/menu-dinamico-md03.md. MD-04 não iniciada. Commit `123fb2f`; push confirmado.


### Revisão da MD-06 — dez palavras, 12/11/2026

Base `b7651c7`. Pedido: acrescentar oito palavras de três letras e embaralhar a ordem. Repertório local ampliado para dez, em grupos completos sem repetição imediata na fronteira. Renovação por evento CSS no mistério, sem relógio paralelo. Cinco testes unitários e prova de navegador escritos antes da implementação; verificação concluída: 115 unitários e 18 cenários distintos de navegador aprovados; três ignorados específicos. Tipos, compilação, formatação e links conferidos. Trinta capturas das palavras e três gravações inspecionadas. Evidências ignoradas em Frontend/test-results/md06-palavras. MD-08 não iniciada.

Registro final: commit `fed4b1f`, com push confirmado para `origin/main`. Roteiro mantido apenas localmente.

Registro da revisão antecipada MD-09: commit 3e1d12e, push confirmado em origin/main. Verificações do escopo atual concluídas; caixa MD-09 permanece aberta para integrar/rever MD-08 e registrar o retorno do aparelho físico. Ocorrência isolada de página em branco documentada, sem recorrência em novas repetições.


Fechamento MD-08: aprovação expressa das cinco atuações em 12/11/2026. Commit `2cead44`; push confirmado em `origin/main`. Roteiro mantido somente local. Próximo passo: complementar a revisão integrada MD-09 antes do aceite MD-10.


Fechamento MD-09, 12/11/2026, base `2cead44`: complementação integrada após aceite MD-08. Observação real de cinco minutos e regressões da mesma implementação reaproveitadas; comparação compilada ampliada para 40 segundos com surpresa comprovada em cada amostra atual. Dois cenários de comparação e 27 de integração aprovados, sem ignorados/falhas; 126 unitários, formatação, tipos e compilação aprovados novamente. Sem mudança do produto. Custo adicional e limites registrados no relatório permanente. MD-09 concluída; MD-10 pendente. Este roteiro continua somente local.

Commit de fechamento MD-09: `60e0cd3`; push confirmado em `origin/main`. Próximo marco: MD-10.


Registro MD-10 em 13/11/2026, base `60e0cd3`: seis percursos publicados nos três tamanhos e quatro leituras de recursos aprovados; API pública via saúde respondeu 200. Chamadas API dos percursos interceptadas, sem visitantes, preferências ou partidas reais criados. Nove capturas locais; amostras inspecionadas. Relatório em Revisoes/menu-dinamico-md10.md. Aceite final do menu completo solicitado e ainda pendente; manter MD-10 aberta, sem commit/push de fechamento antes dessa resposta. Não apagar este roteiro nem iniciar fase 49 automaticamente.


Fechamento MD-10 em 13/11/2026: responsável respondeu “Experimentei e aprovo o menu completo”. Conferência técnica publicada aprovada; nenhuma alteração de código necessária. Todas as fases MD-01 a MD-10 concluídas. Roteiro mantido somente local por decisão do fluxo; não apagar automaticamente. Fase 49 continua independente.

Commit de fechamento MD-10: `962fdd2`; push confirmado em `origin/main`. Ciclo encerrado; roteiro privado preservado.
