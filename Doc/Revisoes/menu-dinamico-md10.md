# Menu MD-10 — aceite e publicação

Revisão em 13/11/2026 sobre `60e0cd3`, após MD-08 e MD-09 concluídas. **Estado: MD-10 concluída, com publicação conferida e aceite final explícito do responsável em 13/11/2026.** Não declarar a fase 49 iniciada ou concluída. Nenhuma mudança no comportamento do produto foi necessária neste fechamento.

## Escopo entregue

| Parte | Comportamento consolidado |
| --- | --- |
| Entrada | Apresentação completa uma vez na aba e retorno curto; controles disponíveis desde o início |
| Cenário | Fundo perceptível, letras flutuantes e estrelas; balão fora dos pés no celular |
| Falas | Repertório local por contexto, sem repetição imediata ou anúncios acessíveis recorrentes |
| Cartões | Dez palavras de três letras em ordem embaralhada no Solo; cenas de avatares na Galera; resposta a mouse, foco e toque |
| Surpresas | Olhar para Solo/Galera, ajeitar a gravata e seguir a letra; visitantes recebem somente as duas últimas |
| Ativação | Botão nativo do Aurélio, um pedido manual por vez, resposta com salto/piscadela ou texto com movimentos reduzidos |
| Coordenação | Agenda compartilhada, gestos protegidos, descanso, pausa por diálogo/ausência e remoção de surpresas fora da área visível |
| Preferências | Quatro paletas, claro/escuro, áudio centralizado, silêncio e movimentos reduzidos preservados |

Os parâmetros finais, decisões e limites estão na [especificação do menu](../Menu-dinamico.md), nas [fichas das atuações](menu-dinamico-md08.md) e na [revisão integrada](menu-dinamico-md09.md). O aceite das cinco atuações em 12/11/2026 não é apresentado como aprovação automática do conjunto inteiro.

## Método da conferência publicada

Origem: https://decifra-inky.vercel.app. Leituras públicas do HTML, favicon e arquivos iniciais, comparadas à compilação local revisada. HTML, JavaScript e CSS precisam coincidir em bytes; o favicon SVG é comparado após normalizar CRLF/LF. Sua diferença de oito bytes foi confirmada como quebras de linha, sem mudança da marca. A primeira expectativa de igualdade binária do SVG falhou por essa diferença de empacotamento; não era uma falha visual do ícone.

Percursos em navegador Edge/Chromium, com computador 1440×1000, tablet 820×1180 e celular 390×844 emulados. Recursos visuais e módulos vêm da Vercel real. **Todas as chamadas sob `/api/` desses percursos são interceptadas localmente**, inclusive identificação de visitante e consulta de sessão. Há cenários de visitante e conta simulada; não houve login Google real nem uso de conta pessoal. Não iniciar demonstrações/partidas, enviar palpites ou salvar preferências reais.

Conferir título `Decifra`, favicon, decodificação das imagens SVG/PNG do Aurélio, ausência de rolagem horizontal e erros de página/recursos. Na conta simulada: observar uma surpresa automática em tempo real, ativar resposta manual, abrir as configurações iniciais de Solo/Galera e recarregar cada rota, sem iniciar partida. No visitante: convite, ausência dos cartões restritos e recarga. Capturas e resumo sem identidade pessoal ficam em `Frontend/test-results/md10`, ignorados pelo Git. O roteiro temporário também permanece ignorado.

Uma leitura separada do endpoint público `/api/saude` confere o encaminhamento à API. Não substitui testes dos bancos, login real, sessões autenticadas ou execução de partidas na publicação.

## Evidências anteriores reutilizadas

A MD-08 cobre a implementação aprovada e a MD-09 sua integração: 126 testes unitários, 269 cenários distintos de navegador na implementação; complementação com 27 regressões focadas e duas comparações compiladas. Não somar essas repetições como cenários inéditos. Observação real de cinco minutos com 16 falas e nove surpresas, sem repetição imediata, deslocamento dos controles ou áudio adicional. Compilação, tipos e formatação já aprovados sobre o mesmo código executável. Esta etapa documental não alega novo ciclo TDD nem repete suítes sem mudança ou falha que o justifique.

A comparação de desempenho registrou trabalho total adicional em relação à referência antiga. Não há promessa de 60 fps universal, consumo de bateria menor ou certificação integral de acessibilidade. Emulação e capturas não substituem aparelhos físicos nem o aceite estético do responsável.

## Resultado e aceite

Os **seis percursos publicados passaram**, visitante e conta simulada nos três tamanhos. Título correto, arte decodificada, nenhuma rolagem horizontal ou erro de página/recurso identificado. Nas três contas simuladas houve surpresa automática e resposta manual, abertura e recarga das rotas iniciais dos dois modos. Capturadas nove imagens; inspecionadas amostras do computador, tablet e interação no celular, sem novo recorte ou colisão bloqueante identificado. A preparação das capturas precisou corrigir a conversão de URL de arquivo com espaços para caminho Windows; as nove imagens foram recolhidas para o diretório ignorado correto, sem modificar recursos do jogo.

As quatro leituras de recursos passaram. HTML, JavaScript inicial e CSS são idênticos à compilação revisada, com a normalização de quebras do SVG descrita acima. O HTML publicado aponta para `index-DY3SBrer.js`, `chunk-6KYCQHYJ-DKzjN8i1.js` e `index-CoLRQtY5.css`. A API via `/api/saude` retornou HTTP 200, `situacao: disponivel`, em 43,66 segundos; o tempo registra esse acesso, não uma garantia de latência.

**Aceite final recebido em 13/11/2026:** o responsável respondeu “Experimentei e aprovo o menu completo” à revisão de entrada, falas, cenário, cartões e surpresas do Aurélio no endereço publicado. Com esse aceite e a conferência técnica acima, a MD-10 está concluída e o ciclo MD-01 a MD-10 está encerrado. O commit de fechamento altera somente documentação; o código executável publicado permanece o mesmo que foi conferido. O roteiro privado é mantido localmente até o responsável decidir apagá-lo. A fase 49 e demais melhorias do projeto continuam independentes.
