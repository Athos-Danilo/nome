# Menu MD-09 — revisão do conjunto

Revisão iniciada em 12/11/2026, base `fed4b1f`, a pedido do responsável para adiantar a MD-09. Abrange o menu efetivamente implementado nas MD-01 a MD-07 e as dez palavras do Solo. **Esse era o alcance da revisão antecipada. A complementação integrada sobre `2cead44`, após o aceite das cinco atuações MD-08, está registrada ao final.** Este registro não encerra a MD-10 nem a fase 49.

## Alcance e organização

A revisão protege o comportamento entregue, sem redesenhar a arte ou criar recursos do jogo. Permanecem separados a política temporal, o repertório local, as cenas CSS, a resposta ao ponteiro, o relógio do mascote e o gerenciador de áudio. Não há nova dependência, endpoint, banco, migração ou alteração de pontuação.

A primeira comparação identificou custo adicional no dispositivo limitado. A refatoração introduz `DefinicoesAurelio`: máscaras, recortes, imagens-fonte e gradiente fixos num componente memorizado pelo identificador do personagem. `AurelioRecortado` mantém montagem, poses e instantes; o relógio e a frequência dos movimentos não mudam. A separação aplica responsabilidade única e evita reconciliar a árvore fixa a cada quadro, sem abstrações genéricas ou nova biblioteca.

Os testes novos desta etapa são de preservação: devem começar passando sobre o comportamento existente, sem fabricar uma falha para alegar TDD. Se a revisão reproduzir um defeito, sua correção deverá manter o teste de regressão e registrar o vermelho/verde correspondente.

Antes da refatoração passaram os dez cenários de arte/poses no computador e a nova proteção de definições estáveis e referências SVG exclusivas. A primeira execução dessa proteção usou um seletor inexistente (`corpo`); corrigido para `corpo_inteiro` e executado novamente ainda sobre o código original. Essa falha de preparação não é um defeito do aplicativo nem um ciclo vermelho/verde de funcionalidade.

## Método de revisão

- Observação de cinco minutos reais, sem acelerar o relógio: cadência e repetição das falas, exemplos do Solo, repouso do Aurélio, foco, posição do título/cartão e ausência de novos pedidos de áudio. Dez capturas espaçadas em 30 segundos complementam os registros estruturados. Essa sessão não testa as novas surpresas da MD-08.
- Seis ciclos por tamanho de abertura/fechamento da ajuda, ausência simulada, saída para configurações, tempo fora do menu, Voltar e mudança da preferência de movimento. Relógio controlado para testar ausência longa sem esperar vários minutos a cada percurso; monitoramento de erros de página e mutações HTTP para impedir efeitos indevidos de jogo.
- Regressões do menu para visitante, demonstração usada, conta, continuidade, erro de consulta e sessão expirada; teclado, mouse, toque, cancelamento e rolagem; oito aparências, texto ampliado, janela baixa e recursos indisponíveis. Suites próprias verificam mascote, áudio, acabamento e a compilação servida por preview.
- Comparação exploratória com `e44bd04`, versão anterior às melhorias MD: cópia obtida pelo Git em diretório ignorado, sem copiar arquivos privados ou apontar para bancos. Mesmo navegador, dependências (lockfile sem diferenças), respostas HTTP controladas e Vite local. Dois percursos com ordem invertida, oito segundos de aquecimento e 12 segundos medidos por versão e repetição. Computador sem limitação e celular emulado com CPU 4× mais lenta. Sem outras suítes concorrentes durante a medição.
- A comparação registra duração de tarefas, script e layout por segundo, intervalos de `requestAnimationFrame` (p95, máximo e ocorrências acima de 50 ms), quantidade de amostras e nós DOM. Esses indicadores não medem energia, GPU, memória retida ou quadros realmente apresentados pelo monitor; não são uma promessa de FPS em aparelhos físicos. A carga fria da versão compilada é verificada separadamente na suíte de uso real.
- Depois do ensaio em desenvolvimento, repetir o método sobre as duas versões compiladas, com preview em servidores locais isolados. A variável opcional `DECIFRA_MENU_REFERENCIA_URL` habilita o ensaio; `DECIFRA_MENU_ATUAL_URL` permite apontar a versão atual compilada. Sem referência, a comparação é ignorada explicitamente, não usa o site público e não baixa outra versão por conta própria. Não executar outras suítes durante essas medições.

## Resultados

A observação longa passou: **24 trocas em cinco minutos**, sem repetição imediata, intervalos de **10,19–14,31 segundos**, foco e geometria estáveis, sem novo pedido de áudio. As amostras da cena Solo variaram e o Aurélio permaneceu na espera aprovada depois da saudação. Dez capturas e a folha de contato foram inspecionadas, sem sobreposição nova identificada. Essa amostragem não constitui revisão de cada quadro das animações.

**115 testes unitários**, tipos, compilação e formatação aprovados. Evidências locais em `Frontend/test-results/md09`, fora do Git; o roteiro também permanece ignorado.

| Grupo | Cenários distintos aprovados |
| --- | ---: |
| Menu, incluindo navegação repetida | 139 |
| Mascote, definições e poses | 48 |
| Áudio | 9 |
| Acabamento, texto ampliado e janela baixa | 15 |
| Fluxos afetados do individual | 9 |
| Fluxos afetados da galera | 6 |
| Uso real da compilação | 6 |
| Observação real de cinco minutos | 1 |
| Comparação compilada, computador e celular limitado | 2 |
| **Total sem somar repetições** | **235** |

Houve 18 ignorados específicos: 17 do menu por tamanho/tipo de entrada e um da comparação, que usa computador e celular, não tablet. Ensaios anteriores de desempenho e de arte, assim como repetições focadas, não são somados ao total. Não foram executados testes de backend porque a etapa não altera API, persistência ou regras; respostas controladas evitam escrever em dados reais.

A primeira rodada geral do menu teve 135 aprovados, 17 ignorados e quatro falhas. Três eram do novo teste de navegação, que contava o POST legítimo de identificação de visitante como uma ação indevida. A execução já carregada ainda usava essa versão da preparação; uma nova execução com a exclusão específica de `/api/visitantes` passou nos três tamanhos, mantendo a proibição das demais mutações. O quarto caso capturou uma página em branco uma vez no carregamento inicial da continuidade, sem mensagem da consulta; passou na repetição nos três tamanhos, sem mudar expectativa ou tolerância. Três novas repetições isoladas no computador também passaram, com trace habilitado e sem afrouxar o teste. Não foi possível determinar a causa da única página em branco; manter a ocorrência registrada e investigar caso reapareça. A versão compilada passou nos seis cenários de uso real.

Inspecionadas as 24 aparências nos três tamanhos e as três gravações de ciclos após a refatoração, com 18 quadros de apoio. A captura parada antes/depois manteve dimensões e aparência: a diferença média por canal RGB ficou abaixo de 0,002 em escala 0–255, sem pixel com diferença acima de 40. As tolerâncias anteriores dos testes de PNG, encaixes, olhos e poses não foram ampliadas. Essa comparação é uma referência prática da arte parada, complementada pelas regressões das nove atuações.

### Ensaio exploratório de desenvolvimento

Em computador, todas as rodadas mantiveram p95 de aproximadamente 10,2 ms, sem intervalos acima de 50 ms. Na emulação móvel 4×, antes da refatoração o menu atual teve p95 de 60/70 ms e 273/284 amostras por janela; depois, 40,1/40,1 ms e 409/436 amostras. O script medido caiu de média 761,8 para 642,1 ms/s. As referências também variaram entre rodadas (p95 de 50,1 a 70 ms), portanto não atribuir toda diferença à mudança nem extrapolar esse custo de desenvolvimento para produção. A referência antiga continua executando a animação do mascote, não representa uma tela sem movimento.

### Comparação das versões compiladas

Mesmo método em duas repetições, na ordem referência/atual e atual/referência, sem outras suítes concorrentes. Valores de tarefas/script abaixo são médias em milissegundos por segundo observado; p95 mostra as duas repetições. Navegador Edge/Chromium local em execução automatizada; a cadência próxima de 100 Hz é uma característica deste ensaio, não uma meta universal do jogo.

| Ambiente e versão | Tarefas (ms/s) | Script (ms/s) | Intervalo p95 (ms) | Intervalos > 50 ms |
| --- | ---: | ---: | --- | ---: |
| Computador, referência `e44bd04` | 181,53 | 57,44 | 10,2 / 10,2 | 0 |
| Computador, atual otimizado | 285,21 | 53,48 | 10,2 / 10,2 | 0 |
| Celular emulado CPU 4×, referência | 522,58 | 171,92 | 10,2 / 10,1 | 0 |
| Celular emulado CPU 4×, atual otimizado | 561,28 | 106,47 | 10,1 / 10,1 | 0 |

O menu atual acrescenta trabalho total: aproximadamente +57% no computador e +7,4% no celular limitado nesses percursos curtos. O script diminuiu e a cadência amostrada foi preservada; não há base para afirmar custo zero, menor consumo de bateria ou ausência de engasgos em todo dispositivo. Na emulação limitada, o maior intervalo atual foi 10,5 ms, contra 20,1 ms da referência. Esses máximos são de amostras curtas e não constituem garantia. A refatoração foi mantida pela redução de reconciliação fixa e pelos resultados, preservando as tolerâncias visuais anteriores.

Os JSON brutos e as três séries (desenvolvimento antes/depois e compilado final) estão no diretório local da etapa. A comparação final não mede separadamente o menu `fed4b1f` compilado sem refatoração; portanto não isola o ganho desta mudança das demais diferenças em relação a `e44bd04`.

## Pendências registradas na revisão antecipada

1. Produzir e obter o aceite artístico das atuações MD-08; depois repetir a observação conjunta, precedência de eventos, interação manual e medições afetadas. As falas atuais continuam com a pose de espera; não há associação nova com gestos nesta etapa.
2. O responsável informou que pode testar no celular físico, mas ainda não relatou o resultado. A conferência desse aparelho permanece aguardando retorno; emulação não a substitui.
3. Aceite visual integrado e conferência final da publicação na MD-10. A MD-09 integral permanece aberta enquanto faltar a revisão das surpresas.


## Complementação integrada — concluída em 12/11/2026

Base `2cead44`, sem alterações de comportamento do produto nesta complementação. As cinco atuações da MD-08 receberam aprovação expressa do responsável. Reutilizadas as verificações da mesma implementação registradas no [relatório MD-08](menu-dinamico-md08.md): 126 unitários e 269 cenários distintos de navegador, tipos, formatação e compilação. Não se somam novamente as repetições nem se apresentam verificações anteriores como novas execuções.

A observação real do conjunto, já incluindo as novas surpresas, durou cinco minutos: 16 trocas de fala, nove surpresas, os quatro gestos automáticos disponíveis à conta, sem repetição imediata, deslocamento dos controles ou nova requisição sonora. Intervalos de fala de 10,12 a 31,48 segundos refletem os gestos protegidos e o descanso, em vez de impor fala nova a cada 15 segundos. A resposta manual tem prioridade como próximo evento, conservando um único pedido; as regressões cobrem saudação, surpresa, toque, Enter/Espaço, foco, redução, pausa e saída da área visível.

As 24 aparências, as capturas intermediárias e as amostras das três gravações foram revistas. Preservados os desenhos, as tolerâncias de encaixes/olhos, a geometria dos controles e as regras dos dois modos. Nenhuma alteração de backend, dependência, pontuação, autenticação ou banco foi necessária.

### Comparação incluindo as surpresas

A janela medida passou de 12 para 40 segundos após oito segundos de aquecimento. Um observador local do teste registra o atributo de gesto; cada amostra atual deve conter ao menos uma surpresa. Ambas as versões usam a mesma janela maior e instrumentação, em duas repetições de ordem invertida. Mantidos computador sem limitação e celular emulado com CPU 4×. Nenhuma outra suíte é executada durante a medição. A versão antiga continua sendo a referência compilada `e44bd04`; não representa ausência de animação.

O teste acrescenta somente observação e critérios de preservação, sem alterar o produto ou alegar um ciclo vermelho/verde de funcionalidade nova. A primeira tentativa não alcançou o servidor de referência por isolamento entre os processos; os dois servidores e o navegador foram reiniciados no mesmo ambiente. Falha de preparação, não regressão do jogo. A execução no ambiente comum passou nos dois cenários, sem repetição por falha. O conjunto tem oito amostras de cerca de 40 segundos: quatro por ambiente, duas por versão. As quatro amostras atuais registraram surpresas (gravata no computador, olhar para Galera/Solo no celular). Não foi medida uma amostra isolada de cada uma das cinco atuações.

| Ambiente e versão | Tarefas (ms/s), média | Script (ms/s), média | Intervalo p95 nas duas repetições (ms) | Maior intervalo (ms) | Intervalos > 50 ms |
| --- | ---: | ---: | --- | ---: | ---: |
| Computador, referência | 127,94 | 41,45 | 10,1 / 10,1 | 11,1 | 0 |
| Computador, atual com surpresas | 235,11 | 45,36 | 10,1 / 11,4 | 49,9 | 0 |
| Celular emulado CPU 4×, referência | 519,03 | 157,31 | 10,1 / 10,1 | 15,8 | 0 |
| Celular emulado CPU 4×, atual com surpresas | 707,65 | 133,96 | 10,1 / 10,1 | 20,1 | 0 |

O trabalho total aumentou aproximadamente 83,8% no computador e 36,3% no celular emulado em relação à referência antiga; o script aumentou cerca de 9,4% no computador e caiu 14,8% no celular. Há variação entre repetições, especialmente na referência de computador. Os intervalos observados não identificaram bloqueio sustentado, mas o custo adicional existe e o máximo de 49,9 ms mostra que não cabe prometer ausência de engasgos. Não foi necessário alterar camadas ou cadências aprovadas nesta complementação. Os números não demonstram gasto de bateria, memória retida ou quadros efetivamente apresentados. Dados brutos em `Frontend/test-results/md09-integrado/desempenho.json`, ignorados pelo Git.

As medições antigas de 12 segundos permanecem históricas e não são comparadas numericamente como se tivessem a mesma janela. O ensaio novo observa custo agregado do menu e não isola o custo de cada gesto nem promete desempenho em aparelhos físicos.

### Conferência humana e próximo marco

Antes da MD-08, o responsável respondeu “TUDO CERTO!” ao pedido de conferência do menu no celular. Não informou modelo ou medidas do aparelho; não atribuir a esse retorno dados de desempenho ou teste físico das cinco atuações novas. Estas tiveram aceite artístico separado e explícito. A apresentação final do conjunto e a conferência da publicação pertencem à MD-10; a fase 49 permanece independente.


### Resultado da complementação

**MD-09 concluída.** A rodada complementar passou em 29 cenários de navegador: dois de comparação compilada e 27 de integração nos três tamanhos, sem ignorados, falhas ou repetições por instabilidade. Os 27 incluem os cinco contextos afetados por gestos/ativação/navegação, sessão expirada, prioridade de erro e aparência/foco. Foram executados novamente 126 testes unitários, verificação de tipos incluída na compilação, compilação e formatação, todos aprovados. Nenhum comportamento executável do produto foi alterado; somente o ensaio de preservação foi ampliado.

As regressões de mascote, áudio, acabamento e uso real da compilação são as da mesma implementação `2cead44`, já registradas na MD-08; não foram repetidas sem mudança que justificasse nova execução. Os 29 desta rodada não são somados aos 269 anteriores como se fossem todos inéditos: os 27 de integração são repetições focadas. Links locais e diff conferidos. Capturas, dados de medição, relatórios de testes e roteiro continuam ignorados.

As pendências 1–3 do registro antecipado acima são históricas: a MD-08 foi implementada e aprovada, sua observação conjunta foi realizada e a medição foi complementada; o retorno geral do responsável foi registrado. Não há falha bloqueante conhecida no escopo revisado. Permanecem os limites de amostragem/emulação descritos acima e o aceite integrado com conferência da publicação na MD-10. A ocorrência isolada de página em branco da revisão antiga permanece registrada, sem recorrência identificada na complementação.
