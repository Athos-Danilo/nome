# Menu MD-05 — falas contextuais do Aurélio

Implementação em 12/11/2026, base `f910947`. Estado: MD-05 concluída. Escopo somente MD-05; cenas dos cartões, respostas de ponteiro e novas surpresas permanecem nas fases próprias.

## Repertório e apresentação

Vinte falas distintas, com identificadores por contexto: geral, visitante, demonstração já usada, conta e individual em aberto. Geral tem cinco alternativas; os demais combinam essas cinco com três específicas. Cada contexto possui uma frase inicial fora do sorteio. A agenda existente escolhe uma alternativa diferente da anterior a cada 10–15 segundos de tempo ativo, sem histórico permanente. A frase escolhida permanece durante o descanso: o evento de fala da agenda dura 600 ms, não o tempo de leitura do texto.

A frase inicial aparece sem aguardar a imagem. Enquanto a situação da demonstração é desconhecida, usar contexto geral, sem prometer nova tentativa. Conta com individual confirmada em aberto recebe convite de continuidade; falha de consulta não é evidência de partida disponível. Demonstração usada recebe convite para login, nunca oferta de outra demonstração. Os textos não prometem recompensa, desafio diário ou pessoas conectadas.

O balão realiza uma transição de opacidade de 180 ms entre frase anterior e atual. Uma camada invisível e inacessível mede todas as falas do contexto e reserva sua altura; a frase anterior também fica fora da árvore acessível. A frase atual continua disponível para leitura manual, sem região viva recorrente. O título, foco, cartões e demais controles não são remontados a cada troca. Mantidos balão à esquerda no celular, paletas e tipografia aprovadas.

As falas usam a espera/expressão neutra existente do Aurélio, como permitido pelo roteiro até MD-08. Nenhuma alteração na montagem, imagem, máscaras ou linhas de tempo aprovadas; nenhuma reação ou som novo é disparado pela troca. A música continua no gerenciador existente.

## Coordenação e responsabilidades

`falas-menu.ts` contém somente repertório e classificação de contexto. `BalaoMenu` liga candidatos à agenda, conserva a última fala e apresenta a transição. CSS mantém reserva e troca visual. A agenda continua responsável por tempo ativo, prioridades e seleção sem repetição; não foi criado outro relógio periódico.

A consulta de continuidade antes interna ao bloco de retomada passou ao menu, compartilhada com esse bloco e com a decisão editorial. Permanecem consulta/cache existentes, tratamento de erro, expiração de sessão e ações originais. Não acrescentados endpoint, banco, dependência ou chamada ao catálogo.

Redução de movimentos congela a frase visível, sem iniciar troca ao ser desligada; a agenda reabre uma oportunidade futura. Aba oculta e diálogo/erro relevante pausam o relógio, sem acumular falas vencidas. A falha da consulta de visitante é passada como bloqueio explícito ao adaptador da agenda, preservando o aviso existente com `role="status"`, sem transformá-lo artificialmente em alerta. Quando o balão fica totalmente fora da área visível, `useInView` existente retira seus candidatos; ao reaparecer, aguarda um novo intervalo de 10–15 segundos. Desmontar limpa a configuração e a agenda existente encerra o relógio. Alterar contexto remonta apenas o balão, descartando a frase incompatível.

## TDD e verificações

Os testes de repertório foram escritos e executados antes do módulo, falhando por sua ausência. O teste de navegador da conta falhou antes da integração porque não existia contexto nem alternância. Depois da implementação, um novo teste reproduziu a continuação de falas fora da área visível; a integração de visibilidade corrigiu esse comportamento. As 18 combinações iniciais de contexto/pausa/visibilidade passaram nos três tamanhos.

A primeira simulação longa executava milhares de quadros desnecessários do mascote e excedeu o prazo de teste; passou a avançar o relógio em passos curtos, com a agenda preservada. A medição de geometria agora aguarda a apresentação finita da MD-04 terminar: não se compara a posição deslocada durante entrada com a posição estabilizada. Mantida igualdade da caixa do balão durante as falas e ausência de repetição nas trocas efetivamente observadas, sem exigir que duas amostras separadas por várias oportunidades sejam diferentes.

Na regressão, a reserva de altura trouxe o balão para perto da descrição em uma largura móvel e a inspeção detectou sobreposição às pernas no tablet. O teste de separação móvel existente reproduziu o problema sem alterar suas tolerâncias; acrescentado teste de tablet, inicialmente vermelho. Corrigidos o posicionamento móvel para `bottom: 0` e a composição de 651–960 px para reservar uma linha abaixo do personagem, com margem de 16 px. A especificidade do CSS preserva essas posições diante das regras anteriores do visitante. Verificadas conta/visitante em 360/390/430 px e 700/820/960 px, além da proximidade segura dos cartões.

O ensaio de erro inicialmente procurava um alerta, mas o componente existente usa `status`; corrigido o teste para o contrato real. A expectativa de pausa então falhou de fato, demonstrando a falta do bloqueio explícito, implementado no adaptador. Mensagem original e possibilidade de tentar novamente foram preservadas.

A sessão de três minutos em tempo real registrou **13 trocas**, sem repetição imediata, intervalos de **10,67 a 14,76 segundos**, título com foco e nenhuma requisição nova de áudio. Capturas aos 60, 120 e 180 segundos e transcrição/timestamps locais permitem revisar ritmo e conteúdo. Após ajustes de posição/bloqueio, a cadência/seleção não foi alterada; a regressão final não repete esse ensaio longo desnecessariamente.

Resultados finais: **105 testes unitários aprovados**, tipos/compilação/formatação e links locais conferidos. **137 cenários distintos de navegador aprovados**, com dez ignorados previstos: menu 106 aprovados/oito ignorados na rodada final, observação longa um aprovado/dois ignorados na rodada anterior, áudio nove, acabamento 15 e uso real da versão compilada seis. Os ignorados são provas específicas de celular, tablet ou da sessão longa de computador nos outros tamanhos. Repetições focadas não estão somadas a esses totais.

Inspecionadas as oito combinações de paleta/tema nos três tamanhos, com novas folhas de contato da rodada final. Tablet com linha própria abaixo do personagem e celular com balão à esquerda, separado da descrição e dos pés; espaço seguro dos cartões preservado. Além das 24 aparências, foram capturadas as três verificações de raiz tipográfica ampliada e os quadros da apresentação MD-04. Capturas da primeira rodada permanecem como comparação, não como evidência da posição final. Capturas e logs em `Frontend/test-results/md05` permanecem locais e ignorados, assim como o roteiro temporário. Navegadores com computador/tablet/celular emulados; não constitui certificação em aparelho físico ou aceite artístico antecipado do conjunto MD-10. Sem login real ou gravação em dados reais nesta fase.


A prova de texto ampliado altera a raiz tipográfica para 200%, conforme a verificação existente do projeto; não certifica todos os comportamentos de zoom nativo ou ampliação exclusiva de fontes em aparelhos físicos. A reserva inclui todas as frases do repertório, inclusive as mais longas.
