# Menu MD-06 — pequenas cenas dos modos

Implementação em 12/11/2026; base `d0e28e9`. Estado: MD-06 concluída. Escopo MD-06; respostas de ponteiro, novas atuações e integração artística geral continuam nas próximas fases.

## Cenas entregues

**Solo:** três peças preservam a composição de mistério D / I / ?. Elas se afastam levemente, alinham e revelam SOL; após uma pausa legível, voltam ao mistério. O segundo trecho repete a intenção com LUA, em outro momento do ciclo. Um pequeno brilho acompanha cada descoberta. São exemplos editoriais locais, sem consulta ao catálogo, reserva, exposição ou relação com a resposta de uma partida.

**Galera:** os três avatares aprovados alternam elevação, alinhamento e escala, com um pequeno selo de brilho junto ao canto inferior do retrato em destaque. A ênfase não depende apenas da cor. A ilustração não representa pessoas conectadas, um sorteio real, pontuação ou participante da conta. Reutilizadas as mesmas imagens; se alguma falhar, um ícone de perfil já aprovado mantém a moldura e a composição.

## Tempos e composição

| Cena | Ciclo | Trecho de destaque | Descanso |
| --- | --- | --- | --- |
| Solo | 24 s | SOL: formação até 6,24 s e leitura até 8,64 s; LUA: formação até 17,28 s e leitura até 19,68 s | Mistério antes, entre as descobertas e ao final |
| Galera | 30 s | Primeiro destaque de 3,6 a 6,6 s; demais deslocados em 10 e 20 s | Retratos em repouso entre as passagens |

Solo: antecipação de 12 px para cima e até 8 px para os lados, escala 1,04; formação com escala 0,84 e alinhamento em três posições de 50 px. As faces são sobrepostas na mesma peça, com trocas de opacidade, sem alterar seu tamanho. Galera: elevação de 9 px, escala 1,12 e rotação alinhada no destaque. As durações diferentes evitam ciclos uniformes e constantes; os trechos leves podem coexistir com o cenário ambiente e as falas, sujeitos à revisão integrada da MD-09/10.

A raiz `.arte-cartao` mantém dimensões e escala responsivas anteriores. Toda transformação da cena ocorre em descendentes; entrada e futura inclinação continuam separadas da ilustração. Nome acessível, título, descrição, rodapé e destino do link não mudam durante os quadros. A cena é decorativa (`aria-hidden`), não recebe foco e não captura ponteiros.

## Organização e pausas

`CartaoModo` mantém o link nativo e delega a ilustração a `CenaModo`. O componente encapsula visibilidade local e montagem; `CenaSolo` e `RetratoCena` mantêm conteúdos e estados próprios. O estado local acompanha falha de imagem e visibilidade; os quadros não atualizam o React. CSS executa os ciclos: nenhum novo relógio JavaScript periódico, requisição ou pacote foi adicionado.

A condição da agenda é recebida do menu. Ausência, diálogos e erros relevantes pausam as cenas; fora da área visível, cada uma pausa individualmente, conservando seu quadro. Redução de movimentos remove animações e mostra a composição de mistério/retratos estáticos; ao desativá-la, os ciclos recomeçam sem recuperar acontecimentos atrasados. Desmontar remove o componente e o observador existente de visibilidade.

Os estilos antigos de letras e imagens da arte estática foram retirados de `menu.css` e incorporados ao estilo próprio das cenas, evitando rotações, cores e posições herdadas indevidamente. Sem alterações na arte do Aurélio, músicas, áudio, paletas, bancos, API ou regras das partidas.

## TDD e verificação

Antes do componente, três testes de navegador falharam pela ausência das cenas, suas condições e do tratamento de falha dos retratos. Após implementar, nove combinações passaram nos três tamanhos. Um teste adicional demonstrou que as imagens herdavam posições da arte antiga; a retirada das regras concorrentes e a definição dos estilos locais corrigiram o problema, preservando as expectativas.

Cobertura: formação das duas palavras, nomes/destinos acessíveis estáveis, caixa dos cartões constante, acionamento por mouse/toque e teclado em quadros de destaque, pausa com diálogo/ausência/visibilidade, redução em execução, retratos indisponíveis e ausência das cenas no visitante. O vídeo da inspeção do menu foi ampliado para 12 amostras espaçadas por 3 s, cobrindo mais de um ciclo completo de cada cena e mantendo as verificações de estabilidade de título e controle.

Um teste complementar de legibilidade reproduziu a proximidade excessiva do selo superior à descrição em computador/celular. O selo passou ao canto inferior do retrato, sem alterar as curvas ou os tempos; os três picos foram medidos e capturados nos três tamanhos, preservando distância da descrição e do botão. As três gravações de ciclo antecedem somente esse ajuste de posição do selo; as nove capturas em `capturas-finais` registram sua posição definitiva.

Resultados: **105 testes unitários aprovados**; tipos, compilação, formatação e links locais conferidos. **142 cenários distintos de navegador aprovados**: 121 de menu, 15 de acabamento e seis de uso real da versão compilada. O menu teve oito ignorados previstos, exclusivos de tamanhos específicos. Na rodada geral, 115 passaram e três casos de acionamento falharam por falta do parâmetro de informações de dispositivo no próprio teste; corrigida a assinatura, os três passaram separadamente, sem mudança de expectativa ou do código de navegação. Os três cenários adicionais de legibilidade completam os 121. Repetições focadas não estão somadas aos totais, e o ensaio longo de falas MD-05 não foi repetido nem contado nesta fase.

Inspecionadas as três gravações e suas folhas de quadros: SOL e LUA legíveis, os três retratos alternando destaque e momentos de repouso. As verificações de título, controle e ausência de transbordamento permaneceram passando durante os 33 s amostrados; o acionamento seguinte também foi verificado. Inspecionadas as nove capturas finais dos selos, sem cruzar descrição ou botão. Evidências locais em `Frontend/test-results/md06`, ignoradas pelo Git, assim como o roteiro temporário. Testes com respostas controladas, sem login Google ou gravação em dados reais. Computador/tablet/celular emulados; não certifica FPS ou desempenho em aparelho físico. Aceite artístico conjunto permanece na MD-10.


## Ampliação para dez palavras — 12/11/2026

Revisão solicitada após a MD-07, base `b7651c7`. Mantidos SOL e LUA; acrescentados MAR, CÉU, RIO, PAZ, VOZ, MEL, COR e LAR. Todas usam as mesmas três peças e tipografia, inclusive o acento de CÉU. Tempos, tamanhos, acessibilidade, comportamento da Galera e interações MD-07 permanecem preservados.

`palavras-cena-solo.ts` separa repertório, embaralhamento Fisher–Yates e avanço do par. O sorteio é injetável; o grupo é percorrido integralmente antes de um novo embaralhamento e a primeira palavra do novo grupo não repete a última anterior. Sem armazenamento ou histórico permanente. Na execução contínua, cinco ciclos de 24 s percorrem as dez palavras.

A integração usa `animationiteration` da primeira peça e apenas da animação `montar-palavra`. O evento ocorre no retorno ao mistério, quando as faces de palavra estão ocultas; só os textos são renovados, sem alterar chaves ou reiniciar quadros. Eventos de faces/irmãos e estados bloqueados são ignorados. Pausar ou ocultar conserva o par; redução mantém a composição estática e, ao ser desabilitada, o ciclo reinicia com o par atual, como na MD-06 original. Não há atualização React por quadro, temporizador JavaScript, busca no catálogo ou som novo.

TDD: a suíte nova falhou antes do módulo, e a prova de navegador falhou pela ausência das dez palavras. Cinco testes unitários verificam tamanho/repertório, ordens distintas, grupo completo, fronteira sem repetição e ausência de sorteio intermediário. A prova de sequência usa eventos nativos `AnimationEvent` e aguarda o próximo quadro de renderização; o disparo genérico do teste não fornecia `animationName` e foi corrigido, sem afrouxar o filtro da aplicação. O vídeo do ciclo também verifica renovação automática real após 24 s, sem evento sintético.

Verificação concluída: **115 testes unitários aprovados**, tipos/compilação/formatação e links locais conferidos. **18 cenários distintos de navegador aprovados**, com três ignorados específicos de mouse/toque. Cobrem formação e dimensões, sequência completa, pausa/redução, isolamento de estilos, acionamento por toque/mouse e renovação automática nos vídeos. As repetições focadas do teste de sequência não estão somadas ao total.

Inspecionadas as dez palavras nos três tamanhos, com 30 capturas, incluindo CÉU. A captura final aguarda a apresentação de entrada terminar, mantendo aparência estabilizada para comparação. As três gravações confirmaram renovação automática real do par; títulos, links e dimensões permaneceram estáveis durante os ciclos. Evidências locais em `Frontend/test-results/md06-palavras`, fora do Git. Não iniciada a MD-08.
