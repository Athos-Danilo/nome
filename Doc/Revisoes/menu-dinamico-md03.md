# Menu dinâmico — cenário MD-03

Data: 11/11/2026. Base: `aa589f3`. Escopo: [cenário ambiente](../Menu-dinamico.md). Estado: MD-03 concluída; implementação, inspeção por amostras e regressão final verificadas.

## Entrega

Parâmetros da entrega de 11/11; os ajustes de 12/11 abaixo substituem os valores do fundo e a composição móvel.

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


## Revisão solicitada em 12/11/2026 — fundo e celular

O responsável considerou o fundo imperceptível e apontou balão sob os pés e espaço excessivo antes da navegação móvel. Três testes foram criados antes da correção e reproduziram os pontos: menos de um pixel de deslocamento em 3,2 s; balão na faixa horizontal do personagem; distância maior que 80 px entre cartões e navegação no cenário exercitado.

A revisão usa:

- Fundo com ciclo de 24 s, fase inicial de −2,5 s, deslocamentos de até −48/+42 px horizontal e +32/−30 px vertical, opacidade 0,10 e sobra de recorte de 64 px. O teste exige mais de 12 px em 3,2 s, mantendo pausa e redução de movimentos existentes.
- Até 650 px de largura, balão à esquerda do personagem, abaixo do texto de apresentação: largura de 132 px, separação horizontal e inclinação menor. A verificação cobre conta e visitante em 360, 390 e 430 px, sem colisão com o personagem ou a descrição. A integração das falas longas na MD-05 deve preservar essas garantias.
- Somente no menu móvel com cartões, moldura/conteúdo usam distribuição flexível da altura disponível. O espaço útil pode aumentar os cartões; são removidas reservas duplicadas de rodapé e mantida uma área para navegação fixa e área segura do aparelho. Não se moveu o menu inferior para cima do conteúdo.
- Distância final entre cartões e navegação verificada entre 12 e 80 px, com alturas de 740, 844, 873 e 1.000 px, além de retomada disponível. Nos formatos mais altos, as ações também são verificadas antes de rolar; nas telas baixas, a rolagem mantém tudo alcançável.

Capturas de quatro dimensões de celular foram inspecionadas, incluindo cabeçalho em uma e duas linhas. Os dados são controlados, e as evidências permanecem em `Frontend/test-results/md03-ajustes/`. Nenhuma etapa da MD-04 foi iniciada.

Verificação final: 98 testes de unidade; 63 casos de menu, 15 de acabamento e seis de uso real aprovados (84 cenários de navegador). Seis casos foram ignorados conforme o dispositivo previsto. Tipos/compilação e formatação aprovados. Não houve mudança de JavaScript de produção, backend, dados, dependência ou áudio; o ajuste é CSS, acompanhado de regressões de comportamento e layout.
