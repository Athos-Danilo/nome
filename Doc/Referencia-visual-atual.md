# Referência visual do Decifra — fase 01 de melhorias

**Situação:** coleta concluída em 06/11/2026. A galeria abaixo é a referência anterior ao redesign.

## Objetivo

Registrar como se joga a versão atual para que, ao avaliar uma proposta de redesign, seja possível repetir a mesma tarefa e comparar legibilidade, hierarquia e resposta da interface. A fase pode acontecer junto da preparação documental da fase 49 da primeira entrega.

## Telas e tarefas

| Estado a registrar | Tarefa do jogador | O que observar |
| --- | --- | --- |
| Menu autenticado, após terminar a animação inicial | Encontrar as entradas Solo e Galera | As duas parecem disponíveis? Se um cartão aparece apagado, repetir a captura em repouso e comparar com o instante de entrada. |
| Configuração individual, antes de iniciar | Escolher temática e dificuldade e conferir as escolhas | O jogador identifica o que selecionou e a ação para começar? |
| Primeira dica individual, antes de digitar | Ler a pista, identificar o valor e começar a montar a palavra | Pista, quadradinhos e teclado cabem na área visível? Registrar o que exige rolagem. |
| Resultado individual, após encerrar | Conferir os pontos e encontrar a próxima ação | Pontuação e tempo são distinguíveis? É possível entender o resultado sem depender da animação? |
| Galera, logo após uma troca de vez confirmada | Identificar o próximo participante e localizar as palavras no painel | Nome, placar e palavras continuam legíveis juntos? Fixar os nomes e a ordem do cenário para repetir a comparação. |

## Como coletar

1. Usar as dimensões do [ensaio anterior](Uso-real-acessibilidade-desempenho.md): celular 390 × 844, tablet 820 × 1180 e computador 1440 × 1000. Registrar se o dispositivo é emulado ou físico.
2. Registrar revisão do Git, navegador, origem dos dados (API local ou cenário simulado), estado da conta, paleta, tema e preferência de movimento. Usar conta de teste e nomes fictícios. Manter essas condições iguais ao comparar versões.
3. Para cada linha da tabela, anotar o ponto de partida, as ações e o instante da captura. Guardar uma imagem por tamanho. Se uma transição causar dúvida, acrescentar uma gravação curta ou par de imagens mostrando a transição e o repouso.
4. Para cada achado, registrar tela, tarefa, evidência e impacto. Classificar como **defeito reproduzido**, **hipótese a verificar** ou **sugestão de design**. Para defeitos, acrescentar os passos, o resultado esperado e o observado.

## Critério de conclusão

- [x] Cinco estados documentados nas três dimensões, com 15 capturas de referência identificadas.
- [x] Cada captura tem uma tarefa e condições suficientes para outra pessoa conseguir repeti-la.
- [x] Defeitos listados foram reproduzidos. Hipóteses e preferências estéticas estão identificadas separadamente.
- [x] Galeria e achados vinculados neste documento e prontos para receber, nas fases seguintes, o quadro equivalente do redesign.

## Histórico de decisões

| Momento | Decisão | Motivo |
| --- | --- | --- |
| Preparação da fase | Repetir as três dimensões do ensaio de uso real | Permite comparar a nova coleta com verificações já documentadas. |
| Preparação da fase | Capturar o menu em repouso | Um quadro intermediário da animação pode alterar a percepção de contraste da opção Galera. |


## Galeria da versão f80b672

Compilação local com Vite. Chrome 156.0.8078.80 controlado por Playwright, conta de teste autenticada e respostas da API simuladas. Cada imagem mostra somente a janela visível, no topo da página, após carregar as fontes e aguardar mais 1,5 segundo. Os três tamanhos são emulados. Claro e paleta Original no menu e no individual, com movimento habilitado. Na galera, claro, paleta Roxa e movimento reduzido conforme o cenário existente.

| Estado e passos para repetir | Computador | Tablet | Celular |
| --- | --- | --- | --- |
| Entrar com a conta ativa simulada em menu.fluxo.ts, abrir o menu e aguardar a entrada dos cartões. | [Menu](Historico-visual/001-referencia-inicial/menu-computador.png) | [Menu](Historico-visual/001-referencia-inicial/menu-tablet.png) | [Menu](Historico-visual/001-referencia-inicial/menu-celular.png) |
| Em individual.fluxo.ts, abrir /jogar/individual/novo, manter as opções iniciais e escolher **Conferir desafio**. Capturar o resumo anterior ao início. | [Configuração](Historico-visual/001-referencia-inicial/configuracao-computador.png) | [Configuração](Historico-visual/001-referencia-inicial/configuracao-tablet.png) | [Configuração](Historico-visual/001-referencia-inicial/configuracao-celular.png) |
| Escolher **Começar partida** e capturar a primeira pista sobre animal doméstico antes de digitar. | [Pista](Historico-visual/001-referencia-inicial/pista-computador.png) | [Pista](Historico-visual/001-referencia-inicial/pista-tablet.png) | [Pista](Historico-visual/001-referencia-inicial/pista-celular.png) |
| No mesmo cenário, enviar GATO nas três rodadas, avançar entre elas e escolher **Ver resultado**. Conferir 300 pontos. | [Resultado](Historico-visual/001-referencia-inicial/resultado-computador.png) | [Resultado](Historico-visual/001-referencia-inicial/resultado-tablet.png) | [Resultado](Historico-visual/001-referencia-inicial/resultado-celular.png) |
| Em galera-painel.fluxo.ts, usar Ana e Beto, iniciar o desafio e liberar o painel. Para reproduzir a troca, simular a resposta à letra Z com participante_atual igual a p2 e Z em bloqueadas, mantendo as palavras ocultas e ambos com zero. Capturar após o título **É a vez de Beto**. | [Turno](Historico-visual/001-referencia-inicial/turno-computador.png) | [Turno](Historico-visual/001-referencia-inicial/turno-tablet.png) | [Turno](Historico-visual/001-referencia-inicial/turno-celular.png) |

## Achados para o redesign

| Observação | Evidência e interpretação | Destino |
| --- | --- | --- |
| O cartão Galera recupera a intensidade em repouso. | Na referência de computador, o cartão verde tem título, ilustração e ação legíveis. O aspecto esmaecido da captura anterior não se repetiu com a espera. | Fase 04: avaliar se a animação comunica disponibilidade durante a entrada. |
| No celular, o botão para começar o desafio fica parcialmente sob a navegação fixa no topo da rolagem. | Reproduzido em duas coletas a 390 × 844. Na confirmação, espera-se ler o rótulo da ação principal; a barra cobre parte do botão. O percurso automatizado consegue prosseguir. | Fase 05: ajustar a disposição e repetir o ensaio no mesmo estado. |
| A primeira pista e seu valor aparecem no celular; a montagem e o teclado exigem rolagem. | Na primeira dobra, contador, progresso e Aurélio vêm antes da pista. O jogador precisa sair do enquadramento inicial para responder. Sugestão de hierarquia. | Fase 06: prototipar pista e montagem mais próximas e comparar com esta captura. |
| O resultado dá destaque aos 300 pontos, mas a próxima ação fica fora da primeira dobra no celular. | O título e o personagem ocupam boa parte da janela. Sugestão de hierarquia para a tela de encerramento. | Fase 07: testar uma composição que aproxime resumo e ação seguinte. |
| No celular, o placar já destaca Beto; as palavras ficam abaixo da primeira dobra. | No computador, a indicação de vez e as linhas de palavras aparecem juntas. A leitura à distância precisa de ensaio presencial. | Fase 08: aproximar indicação de vez e painel em telas compartilhadas. |

**Verificação:** nove percursos aprovados na coleta final (menu, individual e galera em três tamanhos), produzindo 15 PNGs. O ensaio exercitou a interface compilada com operações simuladas, incluindo a troca Ana → Beto. A referência não mede latência de produção, conforto em aparelho físico nem compreensão por jogadores reais.
