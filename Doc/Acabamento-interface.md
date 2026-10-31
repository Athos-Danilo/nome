# Movimento, responsividade e carregamento — fase 40

**Data:** 31/10/2026. **Situação:** implementação preparada para revisão visual do responsável; verificações registradas abaixo. A aparência aprovada, as quatro paletas e o repertório do Aurélio foram preservados.

## Entrega visual

Movimentos curtos compartilham uma curva de desaceleração e tempos de referência: 140 ms para controles, 180 ms para diálogos, 220 ms para preenchimento/placar e 280–420 ms para entradas de telas e cartões. O menu apresenta seus cartões com um pequeno intervalo entre eles. Dicas, resultados e respostas concluídas mantêm transições de entrada; a animação das dicas continua ligada à dica confirmada.

As letras animam somente o conteúdo do quadradinho, preservando o botão, o foco e o alvo de arraste. Os pontos animam o texto do valor já confirmado: não há contagem intermediária apresentada como pontuação oficial nem espera pela animação para liberar ações. O teste de interrupção cancela as animações em andamento, envia duas vezes o mesmo botão e confirma um único palpite e avanço normal para a próxima palavra.

As escolhas de movimento são CSS, sem temporizadores que alterem ações ou estados de partida. A montagem, poses, expressões e linhas de tempo aprovadas do Aurélio continuam nas implementações anteriores; esta fase não redesenha o personagem.

## Foco e falhas de carregamento

Os módulos de individual/demonstração, galera, perfil/configurações, acompanhamento e laboratório são carregados quando a rota precisa deles, usando React `lazy` e `Suspense`, declarados fora da renderização. O menu permanece disponível sem carregar os painéis de jogo ou o laboratório. Durante o carregamento, a interface apresenta o estado de preparação existente.

`Tela` reúne a entrada visual, o indicador de carregamento e a proteção contra falha de renderização/carregamento. O primeiro título de cada rota recebe `tabIndex=-1`, foco programático e título da aba, inclusive quando chega depois da consulta à API ou do módulo. O observador é desligado ao encontrar o título ou ao desmontar, evitando refocar o jogador a cada alteração de dados ou letra digitada. Diálogos mantêm seu controle nativo de foco e devolução ao botão de origem.

Se um módulo não carregar, a página mantém a navegação e mostra “Não foi possível preparar esta tela”, com foco no título e botão de recarregar. Não se exibem detalhes internos do erro ao jogador. Recarregar utiliza a recuperação de partida existente; a mensagem se refere ao progresso **confirmado**, sem prometer recuperar uma edição ainda não gravada.

## Adaptação e alternativas

- Quebra de linha para metadados, nomes extensos, resultados e controles; limites de tamanho e rolagem interna nos diálogos, incluindo janelas baixas.
- Margem de rolagem nos elementos com foco para ajudar sua visibilidade perto da navegação fixa. Não foi implementado outro sistema de teclado nem alterado o modelo de entrada.
- Três participantes com nomes de 20 caracteres e três expressões extensas verificados no painel escuro; seleção, montagem, teclado e botão de enviar continuam alcançáveis. No celular, esse caso exige rolagem vertical; não se reduz a resposta ou omite quadradinhos para escondê-la.
- Contraste calculado de texto/painel nas oito combinações de paleta e tema, além do contraste real da letra selecionada sobre o destaque verde no painel escuro. Isso não é certificação de acessibilidade de todos os elementos/estados.
- Opção do jogo e preferência de movimento reduzido do sistema desativam animações/transições CSS, incluindo pseudoelementos e fundo do diálogo. O Aurélio mantém seu tratamento próprio já aprovado. Os estados selecionado, desabilitado e de foco continuam visíveis sem depender da animação.
- Fluxo do menu e configurações testado com fontes bloqueadas, som silenciado e movimento reduzido. As fontes locais continuam com `font-display: swap` e alternativas de sistema; avatares já possuem carregamento preguiçoso. Não há pré-carregamento de todas as músicas.
- Ajuda atualizada para explicar que existe cronômetro informativo, sem limite de tempo.

## Carregamento medido na compilação

| Recurso | Antes, fase 38 | Depois, fase 40 |
| --- | --- | --- |
| JavaScript inicial, incluindo arquivos compartilhados referenciados pelo HTML | 637,34 kB | 446,62 kB |
| JavaScript inicial compactado com gzip | 197,74 kB | 141,31 kB |
| CSS inicial | 63,46 kB | 34,48 kB |

O arquivo principal passou a aproximadamente 319,76 kB, acompanhado de arquivos compartilhados de 100,19 e 26,67 kB; esses compartilhados estão incluídos no total acima. Os demais arquivos são carregados por rota. A compilação deixou de emitir o aviso de pacote JavaScript acima de 500 kB. Os números são tamanhos de build, não medições de tempo de carregamento em aparelhos físicos ou rede móvel. Fontes, imagens e músicas não estão incluídas no total de JavaScript.

Nenhuma biblioteca nova, migração ou mudança de regras foi necessária. PostgreSQL, MongoDB, autenticação e catálogo não foram alterados. A API local deve continuar usando Selector no Windows conforme [Autenticação Google](Autenticacao-google.md#correção-operacional-confirmada-em-30102026).

## TDD e verificações

Antes da implementação, o teste do menu identificou o carregamento indevido dos dois painéis e do laboratório. A navegação para configurações também falhou no foco: o título não era programaticamente focável. A simulação de módulo indisponível resultou em tela sem recuperação; após introduzir a proteção, um segundo teste mostrou falta de foco no aviso. Esses testes passaram após a implementação e a correção do foco do aviso.

Alterações puramente visuais foram verificadas no navegador. O comportamento das partidas permanece protegido pelas suítes existentes; a nova prova de cancelamento de animações valida que a apresentação não governa envio nem progresso. Não se declara novo ciclo TDD para criação editorial de CSS sem mudança de regras.

Verificação específica: `npm run testar-acabamento`, também adicionada à integração contínua. Inclui menu sem módulos de jogo, foco após navegação e recuperação de módulo, ausência de fontes, silêncio, redução de movimento, oito paletas/temas a 320 px, janela baixa e ampliação do tamanho-base do texto para 200%. A ampliação de texto é uma prova CSS; não substitui testar o zoom nativo de todos os navegadores.

### Resultado das verificações

- **86 testes unitários aprovados**; tipos, Prettier e compilação aprovados.
- **171 cenários de navegador aprovados:** 15 de acabamento, 24 de menu, 42 de perfil/demonstração, 51 de individual, 15 de galera, 15 de acompanhamento e nove de áudio. Cada suíte percorre computador, tablet e celular.
- O teste extremo da galera foi repetido nos três tamanhos após ajustar os exemplos para nomes de exatamente 20 caracteres, respeitando o limite de cadastro; os três passaram.
- Prévia da **compilação final**, com API controlada: menu abriu com três arquivos JavaScript iniciais, sem módulos de jogo/laboratório; configurações carregadas sob demanda, foco no título e retorno ao menu sem erros JavaScript.
- Capturas de galera com três participantes e expressões longas inspecionadas em computador e celular; as demais capturas de responsividade/texto ampliado complementam a prova automatizada. No celular, o painel completo e a montagem extensa exigem rolagem vertical; teclado e envio permanecem disponíveis.
- Os testes de navegador usam respostas HTTP controladas. Alguns sinais de saída durante o encerramento dos contextos de teste chegaram ao proxy sem API na porta 8000 e produziram mensagens de conexão recusada; não invalidaram os cenários aprovados e não representam um teste integrado de persistência real. Não foram alterados dados pessoais ou bancos nesta fase.

**Revisão visual final pendente:** experimentar as telas reais em `http://localhost:5173/`, individual e galera. Correções solicitadas pelo responsável serão registradas antes de encerrar o checklist da fase. Dispositivos físicos, Safari/Firefox e desempenho real em rede móvel continuam para a revisão de uso da fase 45.

Referências técnicas consultadas: [React — lazy](https://react.dev/reference/react/lazy), [React — Suspense](https://react.dev/reference/react/Suspense) e [MDN — prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
