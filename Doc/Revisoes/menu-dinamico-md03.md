# Menu dinâmico — cenário MD-03

Data: 11/11/2026. Base: `aa589f3`. Escopo: [cenário ambiente](../Menu-dinamico.md). Estado: MD-03 concluída; implementação, inspeção por amostras e regressão final verificadas.

## Entrega

`CenarioMenu.tsx` reutiliza A, Ç e a estrela do palco e acrescenta dois brilhos pequenos. Todos ficam em camada `aria-hidden`, sem foco, sem controles e com `pointer-events: none`. A visibilidade local usa o `useInView` já aprovado, com o estado de pausa/redução recebido da agenda. React muda somente nas transições de estado/visibilidade; os ciclos são CSS.

| Elemento | Movimento e limite |
| --- | --- |
| Letra A | Ciclo de 7,6 s; até 4 px horizontal/8 px vertical; rotação secundária de −3° a +2° sobre a inclinação existente |
| Letra Ç | Ciclo de 10,4 s, deslocado em 2,1 s; até 6 px horizontal/8 px vertical; rotação secundária de −2° a +4° |
| Estrela principal | Ciclo de 11,8 s, com descanso até 68%; escala entre 0,94 e 1,15 e giro curto, sem alternar cores ou produzir flashes |
| Brilhos pequenos | Ciclos de 16,6/14,2 s, com fases diferentes; dimensões 17/13 px e opacidade constante de 0,65 |
| Círculos | Ciclo de 48 s, até 10 px horizontal/8 px vertical; opacidade 0,065, padrão original preservado |

Até 650 px de largura, a amplitude das letras cai pela metade; Ç já era oculto na composição existente, e os dois brilhos novos também ficam ocultos. Mantêm-se A e a estrela principal, sem aumentar o orçamento visual móvel.

O fundo original de dois círculos radiais, repetido em 520 × 490 px, foi extraído para `--padrao-circulos`/`--tamanho-circulos` em `base.css`. As demais telas continuam usando a mesma expressão. A inspeção visual identificou que uma regra antiga de círculos concêntricos não era o padrão efetivamente exibido; a implementação final reutiliza o padrão visível aprovado.

`FundoMenu` aparece somente na rota principal. Seu recorte contém apenas a textura, com sobra de 20 px; círculos se movem por transformação atrás do conteúdo. O recorte da decoração não é aplicado à moldura inteira e não deve cortar foco, controles ou sombras. O pseudo-elemento antigo deixa de desenhar uma segunda cópia do fundo somente enquanto essa camada existe.

## Pausa e acesso

- Cenário ativo: letras e brilhos têm ciclos independentes, e o fundo acompanha sua atividade.
- Ausência da aba, ajuda/diálogo, alerta do menu ou cenário fora da área visível: animações CSS pausam, mantendo o instante. A pausa do fundo quando o palco está fora da tela é conservadora, evitando trabalho ambiente desnecessário.
- Redução salva ou do sistema: animações são removidas e as posições estáticas são mantidas. Voltar à aba não remove essa preferência.
- A saída da rota remove as camadas; o observador de visibilidade é limpo pelo mecanismo existente. Nenhum novo temporizador, quadro JavaScript, áudio, dependência ou acesso a bancos foi introduzido.
- Títulos, links, balão, estrutura dos cartões e arte/curvas do Aurélio foram preservados. A cena do Solo/Galera, as falas e as novas surpresas continuam em fases próprias.

## TDD e inspeção

Os testes novos foram executados antes do código e falharam pela ausência de `.cenario-menu`. Após implementação passaram os seis casos de pausa/visibilidade e aparências nos três tamanhos. Eles verificam progressão do tempo da animação, congelamento durante a ajuda, retomada, ausência, deslocamento para fora da área visível, redução em execução, navegação e disponibilidade de controles.

A inspeção complementar gera oito amostras ao longo de uma sequência real, com esperas de 1,5 s entre elas, e grava vídeo por contexto. As capturas também levam tempo, portanto esses intervalos não são uma medição exata de amostragem/FPS. O teste verifica que as letras mudam de posição, têm ciclos distintos e que título/link Solo mantêm coordenadas durante o movimento; Enter continua navegando.

Foram inspecionadas as folhas dos oito temas em computador, tablet e celular e a sequência ampliada do palco. As oito amostras por tamanho e as 24 capturas de aparência ficam somente em `Frontend/test-results/md03/`, junto às gravações e aos resultados locais. Não são anexadas ao GitHub.

Uma tentativa inicial de configurar vídeo dentro do grupo de testes foi rejeitada pelo Playwright; foi corrigida criando um contexto próprio de gravação com encerramento garantido. Não houve instalação adicional: o gravador já estava disponível. Na primeira regressão completa, um teste anterior de título/favicon encontrou página em branco ao aguardar Configurações. Sem mudar o código ou afrouxar o teste, o fluxo passou em três repetições focadas; a rodada final ampliada passou e está consolidada abaixo. Não foi estabelecida a causa do carregamento isolado.

## Limites

Amostragem, gravação e inspeção por IA não substituem o aceite artístico conjunto previsto na MD-10. Não foi realizado ensaio em aparelho físico nem medição de taxa de quadros/GPU. Os dados e respostas HTTP dos testes são controlados. Esta fase não altera requisitos do jogo, autenticação, pontuação ou persistência. A comparação de desempenho completa continua na MD-09.


## Resultado final

| Verificação | Resultado |
| --- | --- |
| Unidade | 98 aprovados |
| Menu | 58 aprovados, dois ignorados previstos por serem exclusivos de computador |
| Áudio | Nove aprovados |
| Acabamento | 15 aprovados |
| Uso real da compilação de produção | Seis aprovados |
| Tipos/compilação e formatação | Aprovados |

Total: 88 cenários de navegador distintos aprovados na rodada final, sem contar execuções de diagnóstico/repetições. A ocorrência de página em branco não se repetiu nas três execuções focadas nem na rodada final completa; nenhuma expectativa foi relaxada. Permanecem 24 capturas de aparências, 24 amostras de sequência e três vídeos na pasta final, indexados com hashes em `Frontend/test-results/md03/evidencias.json`. O roteiro local foi marcado; MD-04 não foi iniciada.
