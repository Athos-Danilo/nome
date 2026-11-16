# Arenas Solo e Galera — organização e limpeza da palavra

Ajuste solicitado pelo responsável em 16/11/2026, após a MD-10 e antes da fase 49. Objetivo: aproveitar as laterais da moldura no computador, remover a rolagem desnecessária nas partidas comuns e destacar a resposta, preservando identidade, arte, cores e regras do jogo.

## Organização entregue

- Em larguras a partir de 1100 px, moldura de até 1540 px e conteúdo em duas colunas. Não há altura fixa, corte por `overflow: hidden`, escala global ou redução do tamanho da página para fazer caber.
- Solo: cronômetro junto de pontos e palavra no cabeçalho. Trilha com até 260 px e segmentos de 5 px de altura, preservando as cinco/sete etapas configuradas. Dica e Aurélio à esquerda, montagem e teclado à direita; pausa, desistência e encerramento na coluna esquerda. Em telas menores, as ações voltam a ficar depois do editor na ordem natural do documento.
- Galera: identificação da sessão, placar e cronômetro na faixa superior; painel compartilhado e mascote à esquerda, escolha de jogada e editor à direita. O sorteio, as posições oficiais e os resultados permanecem separados da montagem em edição. O layout compacto só se aplica à sessão em andamento; empate e resultado conservam a apresentação anterior.
- Quadradinhos de edição: 58×72 px no computador/tablet, com letras de 36 px; 40×58 px no celular. O painel compartilhado da Galera também ganha casas maiores no computador. Teclas do editor mantêm área mínima de 44 px de altura. A palavra continua em maiúsculas e os acentos continuam obrigatórios no palpite completo.
- Ajustes adicionais por altura até 800 px compactam cabeçalho, rodapé e espaços; o mascote da Galera fica menor nessas janelas. Durante a Galera em andamento, a navegação lateral/inferior é recolhida, como no Solo; o link **Voltar ao menu** permanece visível e conserva a confirmação de saída. Evita sobreposição do dock ao teclado em tablet/celular.

A conferência sem rolagem abrange partidas comuns nas janelas 1920×945, 1440×900, 1366×768 e 1280×720, com cinco palavras no Solo e três participantes/três palavras comuns na Galera. Não é uma promessa para qualquer conteúdo: expressões extensas, dicas muito longas, avisos, zoom e janelas menores podem exigir rolagem natural. Nenhuma informação é escondida para cumprir a altura. Em celular/tablet a rolagem vertical é esperada, sem rolagem horizontal.

## Limpar palavra

O editor compartilhado recebe um botão **Limpar palavra**, junto de Apagar posição. Remove de uma só vez somente letras/números digitados nas posições editáveis, seleciona a primeira posição livre e devolve foco à área de montagem. Preserva sinais, espaços e letras já reveladas oficialmente na Galera. Não altera o painel oficial, bloqueios da sessão, pontos, dicas, turno ou cronômetro; não envia um palpite.

No Solo/demonstração, a mesma cadeia de salvamento de rascunho persiste a montagem vazia; recarregar não restaura letras removidas. Limites de uso de letra voltam a ficar disponíveis conforme as posições esvaziam. O botão fica desabilitado se a edição estiver ocupada ou não houver letras editáveis preenchidas. Não aparece ao escolher uma letra isolada na Galera. O clique utiliza o tratamento de botão/áudio existente, sem novo efeito, atalho global ou dependência. A mensagem de estado anuncia a limpeza; não há confirmação extra para uma edição local reversível.

## Organização e TDD

`entrada/modelo.ts` concentra a operação pura `limpar`, sem DOM ou servidor. `EditorResposta` liga botão, indisponibilidade e foco aos contratos existentes; os painéis continuam responsáveis por seus rascunhos e ações. `estilos/partidas.css` contém a composição compartilhada, restrita às arenas; configuração, resultados e menu não recebem a moldura compacta. Nenhuma alteração de backend, banco, migração, catálogo, dependência ou pontuação.

Os três testes unitários novos falharam primeiro pela ausência de `limpar`, enquanto os 14 testes existentes do modelo passavam. Os testes de navegador reproduziram a ausência do cronômetro no HUD e do botão. Após implementar, passaram limpeza integral, preservação de fixos/bloqueios, seleção, liberação de limites, imutabilidade e ausência de mudança na escolha isolada.

Os ensaios de altura identificaram excesso em janelas baixas e com três participantes; foram ajustados espaços, rodapé e proporção do mascote sem afrouxar a exigência de caber na tela. A navegação recolhida na Galera exigiu atualizar o teste de saída para o link visível Voltar ao menu, preservando confirmação e resultado. A primeira tentativa usou nome exato sem a seta do link; corrigido o seletor, sem mudança na funcionalidade. A execução simultânea de editor/Solo encontrou a porta local compartilhada ocupada; as suítes foram executadas sequencialmente. Essas ocorrências de preparação não são defeitos de persistência do jogo.

## Verificação

**129 testes unitários e 127 cenários distintos de navegador aprovados; oito ignorados previstos por tamanho/tipo de entrada.** Distribuição: editor 44, Solo/demonstração 58, Galera 19 e navegação do menu seis. Repetições focadas após ajustes de estrutura/CSS não são somadas como cenários inéditos. Tipos, formatação e compilação aprovados.

Conferência automática de altura e ações em quatro resoluções de computador, mantendo exigência de não haver rolagem horizontal/vertical nas partidas comuns. Galera verificada também com três participantes de nomes extensos e três palavras comuns. Expressões longas, acentos, sinais, números, arraste, toque, pausa/recarga, rascunho, saída confirmada e placar cobertos pelas regressões. Capturas do computador nas quatro janelas e amostras de tablet/celular foram inspecionadas, incluindo conteúdo longo e tema escuro. A ordem final do Solo em telas menores conserva ações de pausa/desistência depois do editor; no computador, elas ocupam a lateral.

Capturas e relatórios locais em `Frontend/test-results/arena`, ignorados pelo Git. Os testes de navegador usam APIs controladas, sem alterar partidas ou bancos reais. Não constitui teste em aparelhos físicos nem novo aceite estético do responsável; a revisão visual por IA foi feita sobre as capturas. Nenhum teste backend foi necessário porque seus contratos e código não mudaram. Ajuste de interface; não inicia nem conclui a fase 49.
