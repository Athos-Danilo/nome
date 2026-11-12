# Menu MD-07 — resposta a mouse, toque e teclado

Implementação em 12/11/2026, base `a1e0f57`. Estado: MD-07 concluída. Escopo MD-07; novas atuações do Aurélio e aceite integrado continuam nas fases próprias.

## Comportamento entregue

- Mouse com capacidade de hover e ponteiro preciso: a superfície acompanha a posição com até 3° em cada eixo e elevação de 5 px. Seta avança 3 px para cima/direita e ilustração sobe 3 px.
- Teclado: foco visível com contorno de 3 px e afastamento de 6 px, elevação e respostas equivalentes de seta/ilustração, sem inclinação dependente do cursor. Enter mantém a navegação nativa do link.
- Toque: pressão visual curta, com deslocamento de 3 px e sombra menor. Um toque continua entrando no modo; rolagem e cancelamento não acionam navegação. Não é necessário tocar antes para revelar o botão.
- Movimentos reduzidos: sem inclinação, elevação ou deslocamento de ilustração/seta; preservado o destaque de foco e uso imediato das ações.

A inclinação só aceita eventos do tipo mouse com `(hover: hover) and (pointer: fine)`. Toque não arma o efeito mesmo no contexto com mouse disponível. Preferência salva, preferência do sistema, ausência, diálogo e pausa da agenda impedem inclinação. Saída, cancelamento, pressão, mudança de foco, perda de foco da janela, rolagem, redimensionamento e troca de capacidade do ponteiro limpam o efeito; desmontagem cancela o quadro pendente e remove ouvintes.

## Camadas e parâmetros

O `Link` mantém a área fixa e sua rotação estática aprovada. Uma `div.superficie-modo` recebe fundo, borda, sombra, espaçamentos e a transformação de resposta, sem controles aninhados. A cena MD-06 permanece em descendentes, com seus ciclos intactos. O deslocamento de resposta da ilustração usa `translate`, separado da escala responsiva e dos quadros das peças/retratos. As entradas MD-04 continuam nas camadas anteriores.

| Efeito | Parâmetro |
| --- | --- |
| Inclinação | Limite ±3°; perspectiva 900 px |
| Retorno/superfície | 320 ms, curva cúbica (0,16; 1; 0,3; 1) |
| Pressão | 90 ms; deslocamento de 3 px; sombra de 2 px |
| Seta | 180 ms; deslocamento (3 px, −3 px) |
| Ilustração | 220 ms; deslocamento vertical −3 px |
| Hover/foco | Elevação de 5 px e sombra de 10 px |

Espaçamentos e raios responsivos anteriores foram transferidos para a superfície; a raiz conserva dimensões e o destino acessível. Os antigos `hover/active` que moviam o próprio link foram retirados. As exceções antigas de redução para esse hover também foram substituídas pelas regras da nova superfície, preservando as demais ações do aplicativo.

## Organização e recursos

`inclinacao-cartao.ts` contém cálculo limitado e controlador que recebe permissões, leitura da caixa, aplicação e agendamento/cancelamento de quadro. Vários eventos compartilham no máximo um quadro pendente e usam a posição mais recente. A caixa é a do link fixo, evitando realimentar o cálculo com a superfície já inclinada. Medidas vazias e entradas não finitas produzem posição neutra.

`useInclinacaoCartao` adapta eventos, condições e referências ao navegador; condições confirmadas e limpeza são atualizadas antes do próximo quadro. O movimento escreve duas variáveis CSS diretamente, sem atualizar estado React por evento de mouse. CSS controla o retorno; não há laço contínuo de quadros ou relógio periódico novo. `CartaoModo` conserva `Link`, foco, semântica e conteúdo. A superfície não implementa click próprio, captura de ponteiro ou prevenção de gesto nativo.

Nenhuma nova biblioteca, imagem, música, efeito sonoro, API ou alteração de banco. Paletas, tipografia e arte do mascote mantidas.

## TDD e verificações

A suíte dos cinco testes unitários foi executada antes do módulo e falhou por sua ausência. Os testes de mouse e teclado também começaram falhando pela inexistência da superfície. Implementados o cálculo/controlador, adaptador, camada e estilos; cinco testes de unidade novos passaram, totalizando 110. A refatoração isolou as condições confirmadas no efeito de layout e preservou resultados.

Testes de navegador cobrem limite angular e caixa fixa, saída/cancelamento, foco visível, ausência de controles aninhados, navegação única por teclado/toque, rolagem real por protocolo de toque, redução em execução, diálogo, perda de foco, rolagem, desmontagem e ponteiro híbrido. A prova de rolagem acrescenta apenas na página de teste um espaço vertical para garantir percurso; não altera o layout do jogo. Verifica deslocamento da página, histórico intacto durante o gesto e acionamento único posterior.

A gravação usa um contexto de navegador isolado, como a inspeção MD-03, sem mudar a política de vídeo da suíte inteira. Uma tentativa de configuração de vídeo dentro do grupo foi recusada pelo runner e substituída por esse contexto, sem alteração no aplicativo. Os 12 casos focados passaram nos três tamanhos; nove foram ignorados por serem específicos de mouse ou toque.

A regressão MD-06 demonstrou que uma transição de `translate` da raiz da ilustração continuava avançando por alguns instantes ao pausar o menu. Mantidas as expectativas anteriores de relógio congelado; os estados de pausa/redução agora removem também as transições da superfície, ilustração e seta. Os três casos passaram após a correção, assim como os fluxos diretamente afetados de mouse, gesto, limpeza e inspeção.

Resultados finais: **110 testes unitários aprovados**; tipos, compilação, formatação e links locais conferidos. **154 cenários distintos de navegador aprovados**: 133 de menu, 15 de acabamento e seis de uso real compilado. Na rodada geral do menu, 130 passaram e três reproduziram a regressão de pausa; após corrigir, os três passaram na rodada focada, sem alterar tolerâncias. Houve 17 ignorados previstos, de cenários exclusivos de tamanho/tipo de entrada. Repetições focadas não estão somadas aos totais. O ensaio de três minutos das falas MD-05 não foi repetido nem contado nesta fase.

Inspecionadas as 24 aparências de foco, três poses de hover no computador e três composições com redução. Conferidos três registros de vídeo e suas folhas de quadros, com o retorno, foco e alternância de aparência legíveis; as cenas mantiveram seus ciclos. A regressão também preservou os vãos seguros móveis e a separação do balão. Evidências em `Frontend/test-results/md07` permanecem locais e ignoradas, assim como o roteiro temporário. Testes com respostas controladas, sem login real ou gravação em dados de usuários. Computador/tablet/celular emulados em navegador Chromium; não certifica acessibilidade integral, FPS universal ou gestos em aparelho físico. A aceitação artística conjunta continua na MD-10.
