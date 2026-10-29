# Protótipos navegáveis — fase 06

**Estado:** telas e nova direção visual aprovadas pelo responsável em 2026-10-27; fase 06 concluída. Não representam o frontend React implementado nem um motor de jogo funcional. As regras oficiais continuam em [Detalhes.md](../Detalhes.md).

## Como abrir e revisar

Abrir `index.html` no navegador ou, a partir da raiz do projeto, executar `node Doc/Prototipos/servir-prototipos.cjs` e acessar `http://127.0.0.1:8769/Prototipos/`. O servidor precisa continuar em execução enquanto a prévia é usada; Ctrl+C encerra o processo. O script aceita outra porta como argumento e serve somente a pasta de documentos, sem dependências externas.

HTML, CSS e JavaScript precisam permanecer juntos. `prototipo.css` contém a base dos componentes; `visual-jogo.css` contém a nova direção visual e sua adaptação. O Aurélio é carregado de `../Identidade-visual/aurelio-apresentador.png`, ilustração isolada derivada do conceito aprovado. Fontes externas usam Google Fonts, com alternativa de sistema quando indisponíveis. O servidor resolve diretórios para `index.html`; a rota `/Prototipos/` e os recursos locais foram verificados por HTTP com retorno 200 e carregamento dos 21 cenários no navegador.

O seletor **Abrir cenário**, acima da interface, permite revisar 21 telas e estados sem percorrer uma partida inteira. As ações visíveis conectam configurações, partidas, avisos, resultados e acompanhamento. Os botões de navegação, tema, escolhas, preferências e diálogos são interativos.

## Segunda rodada de design — linguagem de jogo

A pedido do responsável, quatro referências móveis orientaram a composição: personagem como protagonista, cartões ilustrados, volume nos botões e peças, navegação compacta, superfícies arredondadas e contraste entre área de jogo e controles. O projeto preserva a paleta e as fontes aprovadas. As referências, por si só, não adicionam moedas, vidas, compras ou regras de tempo. Posteriormente, em 2026-10-29, o responsável aprovou um cronômetro exclusivamente informativo, detalhado em [Cronometro.md](../Cronometro.md); a implementação React é posterior e não está representada pelos protótipos originais.

O menu tornou-se uma sala de jogo com Aurélio, cartões Solo/Galera e retomada em destaque. A partida usa tabuleiro, placar, pista apresentada pelo mascote, peças com profundidade e teclado agrupado. Perfil, ranking, configurações, resultados, estados vazios, avisos e diálogos compartilham a nova linguagem. A navegação fica lateral em computador/tablet e inferior no celular. Tablet reorganiza o menu em duas faixas; celular aproxima personagem e convite antes dos modos.

Há entrada curta do mascote e retorno visual de pressionamento, respeitando movimentos reduzidos. Áudio e o repertório completo de animações permanecem nas fases próprias. A aparência desta rodada foi aprovada pelo responsável em 2026-10-27.

## Telas e correspondência com as rotas planejadas

| Tela / cenário | Rota prevista | Pontos para avaliar |
| --- | --- | --- |
| Menu autenticado | `/` | Acesso aos modos, partida pausada, histórico e rankings |
| Visitante e demonstração usada | `/` | Convite para conta, limite da demonstração e acesso Google simulado |
| Primeiro acesso | `/primeiro-acesso` | Nome de usuário e escolha de avatar |
| Configuração individual | `/jogar/individual/novo` | Quantidade, temáticas, dificuldades, ordem e validação da soma |
| Configuração da galera | `/jogar/galera/novo` | Participantes, nomes distintos, avatares, sessões, dificuldade e temáticas |
| Partida individual | `/jogar/individual` | Dica atual, dicas anteriores, letras, acentos, palpite, pausa e desistência |
| Demonstração | `/jogar/demonstracao` | Partida de amostra e convite para Google no resultado |
| Painel da galera | `/jogar/galera` | Até três palavras longas, vez, letra global e palpite por palavra |
| Resultados dos dois modos e empate | A definir na implementação | Retorno ao menu, nova partida, histórico e sessão extra opcional |
| Rankings | `/rankings` | Três classificações, identidade pública restrita e empates |
| Perfil e histórico vazio | `/perfil` | Dados privados, avatares, dois históricos e início da exclusão de conta |
| Preferências | `/configuracoes` | Tema, música de exemplo, três volumes, silêncio e redução de movimentos |
| Carregamento, erro e sessão expirada | Estados das rotas afetadas | Espera, tentativa novamente e recuperação de acesso |
| Falta de palavras | Estado da configuração | Redução consentida, outras temáticas ou cancelamento |
| Aviso de retomada | Estado da partida salva | Desconto único por pausa e distinção de atualização da página |

## Percursos sugeridos

1. **Visitante:** escolher o cenário → jogo rápido → montar GIRAFA → resultado → Google simulado → primeiro acesso → menu.
2. **Individual:** configurar → iniciar → pedir dica ou enviar erro → consultar dicas → acertar GIRAFA ou abrir o resultado ilustrativo. Testar pausa, desistência da palavra e abandono definitivo.
3. **Galera:** configurar nomes distintos → ordem ilustrativa → painel → escolher uma letra e observar as ocorrências em todas as palavras → tentar palavra completa → encerramento e revelação somente da sessão atual. Abrir empate e sessão extra pelo seletor.
4. **Acompanhamento:** perfil → alternar histórico → editar nome/avatar → configurações → tema e volumes → rankings.

O teclado físico também preenche letras quando o foco está na área de jogo. Clique/toque nos quadradinhos e no teclado é a alternativa principal. O arraste será implementado com dnd kit na fase própria.

## Simulações e decisões preservadas

- Google, demonstração única por navegador, vínculo ao histórico, rankings, pontuação, progresso e preferências não são reais nem persistidos. Recarregar restaura o estado inicial.
- O envio individual usa GIRAFA para mostrar retorno de erro/acerto. O resultado contém valores fictícios e representa o final da partida; não existe progressão completa entre todas as rodadas.
- O painel da galera usa LIQUIDIFICADOR, MICROCOMPUTADOR e CONDICIONADOR para avaliar palavras longas. Letras reveladas, bloqueios e passagem de vez são demonstrativos; a ordem do sorteio e os resultados são exemplos, sem motor oficial de pontos ou sessões.
- As escolhas dos formulários demonstram a configuração. As palavras de amostra não são selecionadas conforme essas escolhas. Quantidades, distribuição aleatória e editor de ordem personalizada ainda serão implementados com as regras aprovadas nas fases próprias.
- A retomada mostra a terceira dica de amostra; o progresso e o saldo exibidos no menu são exemplos. Detecção de fechamento/recarga e aplicação de penalidade dependem da prova técnica da fase 13.
- Os avatares de seleção são ícones provisórios identificados. A coleção ilustrada aprovada será produzida depois. A ilustração isolada do Aurélio está integrada ao menu e à apresentação das dicas; ainda não há partes animáveis separadas.
- A exclusão de conta abre somente uma explicação, sem presumir confirmação, retenção, anonimização ou destino dos rankings. Esses efeitos continuam pendentes.
- A sessão extra demonstra o acesso dos empatados; temática, tratamento com um participante e detalhes de encerramento ainda dependem das decisões previstas no roteiro.
- As cores, estados e hierarquia seguem o guia visual, com nova composição de jogo em avaliação. Existe uma animação curta de entrada e retorno de pressionamento; áudio não faz parte deste protótipo. Os nomes das cinco músicas são provisórios.

## Verificações executadas

- Sintaxe JavaScript conferida com Node.js.
- 21 cenários × 3 larguras (320, 768 e 1280 px) × 2 temas = **126 combinações** no Microsoft Edge, sem transbordamento horizontal detectado ou erros JavaScript.
- Percorridos login simulado, primeiro acesso, acerto individual, abertura/cancelamento de pausa, letra global na galera, encerramento com revelação e silenciamento dos volumes.
- Após o redesenho, repetidas as 126 combinações e os percursos interativos, sem transbordamento horizontal ou erros JavaScript. Inspecionadas capturas do menu em computador/celular, partida em celular e perfil/ranking escuros. Confirmado carregamento da nova arte e acesso HTTP à prévia.
- Diálogos usam o elemento nativo `dialog`, com foco contido, Escape e retorno de foco. Foco visível e controles com rótulos foram previstos; isso não constitui auditoria completa de acessibilidade.

Validação em dispositivos físicos, interface React, serviços de dados, áudio, animações e regras completas ocorrerá nas etapas de implementação. A aceitação visual foi registrada pelo responsável em 2026-10-27, encerrando a fase 06.
