# Entrada de respostas — fase 24

Implementação em 2026-10-29. Esta fase entrega componentes reutilizáveis de montagem e teclado, com uma prévia técnica local. Não acrescenta partidas jogáveis ou pontuação: a integração ao motor individual está prevista na fase 26, e o painel compartilhado da galera continua em suas fases próprias.

## Decisão D08 aprovada

O responsável aprovou **sinais fixos e letras/números preenchíveis**. Espaços, hífens, apóstrofos e demais sinais aparecem prontos e não contam como posições faltantes. Em `WALL-E`, o hífen é fixo; em `TOY STORY 3`, o jogador precisa preencher também o 3. A resposta oficial mantém a grafia do catálogo, sem eliminar sinais ou substituir números por extenso.

Esta decisão foi registrada em `Detalhes.md`, no guia de geração e no roteiro local. Não autoriza automaticamente novos lotes ou grafias alternativas. Na fase 26, a máscara e a validação da API foram ampliadas e o editor foi integrado ao Solo e à demonstração. Contratos e limites estão em [Partida individual](Partida-individual.md).

## Controles disponíveis

- Clique/toque em um quadradinho para selecionar a posição. Inserção avança para a próxima posição editável, saltando sinais e posições reveladas.
- Clique/toque no teclado virtual ou digitação física. As letras ficam em maiúsculas, com normalização Unicode NFC e preservação de acentos. O teclado inclui C, Ç e algarismos de 0 a 9.
- Arraste de uma tecla para uma posição editável, inclusive para substituir o conteúdo dela. O alvo recebe a letra uma única vez, sem um clique extra após soltar. Arrastar posições entre si não faz parte desta entrega; a substituição usa a tecla desejada.
- Setas de navegação, Home/End, Backspace/Delete e botão de remoção. Elementos já fixos nunca são apagados ou substituídos.
- Agudo, grave, circunflexo, til, trema e remoção de acento na vogal selecionada. O til é oferecido para A/O. C não é convertido em Ç pelo seletor de acentos: são teclas distintas. Grave em E permite montar, por exemplo, HERMÈS, já presente no catálogo.
- Campo explícito para usar o teclado nativo/IME, além da digitação na área de montagem. A composição não confirma letras parciais nem duplica a entrada final; a próxima letra legítima continua disponível.
- Colar texto distribui letras/números pelas posições editáveis e conserva sinais fixos. Excesso além da última posição é avisado e ignorado, sem sobrescrever a última letra inserida. O envio só ocorre por confirmação explícita, nunca ao completar automaticamente os quadradinhos.
- Envio incompleto produz aviso acessível e não chama a operação de palpite. Não avança dicas, altera pontos ou consome turno. Com `ocupado`, teclado, edição e envio ficam bloqueados.

## Diferenças entre os modos

**Individual:** limites fornecidos pelo consumidor são contados por família de vogal, independentemente da posição correta. Em MAÇÃ, A e Ã compartilham dois usos. Aplicar ou remover um acento não cria outro uso. C e Ç permanecem distintos. Letras ausentes não são bloqueadas antecipadamente; limite ausente ou zero não as desabilita. Remover ou substituir uma ocorrência libera novamente a tecla quando aplicável. Substituir uma vogal pela variante acentuada na mesma posição não consome outra ocorrência.

**Galera, palpite completo:** usa os bloqueios compartilhados fornecidos pelo painel e preserva as posições reveladas. Não herda os limites do individual. Letras parcialmente reveladas podem continuar disponíveis se o painel não as tiver bloqueado. A confirmação mantém a grafia exata dos acentos.

**Galera, escolha isolada:** chama `aoEscolherLetra` com a família da vogal, sem montar uma palavra, revelar posições ou atribuir pontos localmente. Uma tecla bloqueada pelo painel apresenta aviso na entrada física e não dispara o callback. A integração futura decide o resultado da ação no servidor e fornece as novas posições/bloqueios. O teclado inclui números conforme D08; pontuação e regras do painel continuam no domínio do backend, sem cálculo local nesta fase.

## Contrato e responsabilidades

`EditorResposta` é controlado pelo consumidor:

```text
estado: EstadoEntrada
aoAlterar: atualização do rascunho
aoEnviar(palpite): confirmação de um palpite completo
aoEscolherLetra?(letra): escolha isolada da galera
ocupado?: bloqueio durante uma operação
```

`criarEntrada` recebe `posicoes`, `modo`, `acao`, `limites` e `bloqueadas`. Uma posição null é preenchível; uma string representa conteúdo já fixo (separador ou letra revelada). O rascunho contém letras e seleção; o consumidor deve criar o próximo estado ao trocar de rodada ou receber um painel confirmado. Não há restauração automática de rascunhos nesta fase; a política de persistência será integrada na fase 28.

O componente **não recebe a resposta secreta** e não acessa a API ou os bancos. Os limites do individual são dados derivados; ainda oferecem a pista indireta prevista nas regras. A origem e a exposição desses dados precisam ser tratadas pelo adaptador da partida na fase 26. A ausência de uma propriedade de solução não é uma promessa de proteção contra inspeção dos dados públicos de contagem.

- `modelo.ts`: operações puras de montagem, limites, navegação, acentos e serialização; sem React ou persistência.
- `usar-digitacao.ts`: teclado físico, composição, colagem e confirmação, sem calcular resultados do jogo.
- `EditorResposta.tsx`: composição visual e ligação entre as formas de entrada.
- `Quadradinho.tsx` / `TeclaArrastavel.tsx`: destinos e fontes de arraste com nomes acessíveis e estado visual.
- O consumidor continua responsável por pontuação, vez, repetição de ações, resultado de erros, limpeza após palpite e substituição pelo estado confirmado do servidor.

A separação permite reutilizar apresentação e operações sem misturar os limites dos dois modos nem transferir regras de pontuação para a interface. A refatoração do controle de digitação foi protegida pelos cenários de navegador já existentes.

## Arraste e dependências

Adotados `@dnd-kit/react` e `@dnd-kit/dom` **0.5.1**, com versões exatas e compatibilidade com React 19 conferida. A API moderna foi usada; `@dnd-kit/core` está na documentação legada e não foi acrescentado. Não houve atualização geral das outras dependências.

O `PointerSensor` inicia arraste com mouse após deslocamento de 7 px. Para toque, exige 250 ms com tolerância de 6 px, permitindo gesto rápido de rolagem. A digitação e a ativação por teclado usam controles próprios; não há um segundo sensor de arraste por teclado disputando as mesmas teclas. O conteúdo arrastado usa `DragOverlay`, sem animação de queda, e os controles respeitam os estilos globais de movimentos reduzidos.

Referências oficiais consultadas:

- [dnd kit — quickstart React](https://dndkit.com/react/quickstart/): hooks, destinos e evento de término.
- [dnd kit — sensores](https://dndkit.com/react/guides/sensors/): ativação por tipo de ponteiro, distância, espera e tolerância.
- [React — input controlado](https://react.dev/reference/react-dom/components/input): valor e atualização do campo de texto.

## Prévia técnica local

Com o frontend em execução, abrir **http://localhost:5173/provas/entrada.html**. A página mostra exemplos públicos: ARARA, MAÇÃ, WALL-E 3, expressão longa, posições fixas da galera e escolha isolada de letra. A combinação WALL-E 3 é uma amostra técnica de caracteres, não o cadastro de um título oficial ou um novo item do catálogo.

A prévia informa que não confere acertos, não concede pontos e não altera contas ou partidas. O resultado mostrado é apenas o texto entregue ao callback. O teste de estado ocupado e a alternância de tema pertencem ao laboratório; não modificam preferências da conta. Não há chamadas de rede à API do jogo.

A página fica separada das rotas e do menu de produção. O build padrão continua tendo a entrada de produção anterior; a página de prova é servida pelo Vite no desenvolvimento. Os componentes entram no fluxo real quando forem importados pela tela da partida na fase 26.

## TDD e verificação

- Quatorze testes do modelo foram escritos e executados com operações ainda não implementadas: as 14 falhas iniciais confirmaram a ausência da montagem. Após implementar, os 14 passaram.
- Cenários de interação foram escritos antes do editor visual; a execução inicial confirmou que a montagem ainda não existia na prévia.
- Regressões de composição e colagem reproduziram, antes da correção, perda da próxima letra legítima e substituição indevida da última posição por texto excedente. As correções preservam as mesmas expectativas, sem esperas fixas para esconder falhas.
- Refatoração separou a digitação da composição visual. Validação de tipos e cenários foram repetidos após a separação.
- **44 testes unitários aprovados**, incluindo os 14 novos do modelo.
- **41 cenários de navegador aprovados** em computador (1440 × 1000), tablet (820 × 1180) e celular (390 × 844); quatro combinações inaplicáveis ao dispositivo foram puladas explicitamente. Incluem composição Unicode, uso seguinte da mesma vogal, sinais/números, limites, posição fixa, ação em andamento, clique, digitação, arraste de mouse, toque, arraste por toque e rolagem.
- O cenário de toque aguarda somente o tempo de ativação do gesto projetado (320 ms para superar 250 ms). As verificações usam estados observáveis, não atraso arbitrário para esperar resultados.
- Tipos, build de produção e formatação aprovados. Capturas da expressão longa nos temas claro/escuro foram produzidas para revisão visual, sem arquivos gerados no Git.

Comandos em `Frontend/`:

```text
npm test
npm run tipos
npm run build
npm run verificar-formatacao
npm run testar-entrada
```

No GitHub, o novo comando é executado com Chromium e anotações de erros, depois dos fluxos de perfil e menu. Os testes usam exemplos públicos e não acessam bancos reais.

**Limites da verificação:** os gestos de toque usam emulação e eventos de entrada do Chromium; a composição é reproduzida por eventos de navegador. Homologação em aparelhos físicos e diferentes teclados/IMEs continua necessária na integração. O backend, a API de limites, o painel completo, pontuação e persistência de rascunho não foram implementados por esta fase.
