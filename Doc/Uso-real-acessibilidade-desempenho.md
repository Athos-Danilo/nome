# Uso real, acessibilidade e desempenho — fase 45

**Concluída em 04/11/2026.** Revisão dos dois modos em computador, tablet e celular emulados. O responsável experimentou o jogo publicado e confirmou que todos os botões funcionam corretamente; sua ressalva foi a aparência dos ícones. Essa solicitação foi implementada nesta fase e os novos desenhos ficam disponíveis para avaliação estética.

## Entregas e correções

- **Ícones:** substituídos os caracteres de início, perfil, histórico, ranking, configurações, claro/escuro e música por SVGs Lucide consistentes. Interrogação preservada; nomes acessíveis, estados e ações continuam os mesmos. [Origem e licença](Identidade-visual/icones-interface.md).
- **Cronômetros:** o tempo do individual estava oculto da árvore de acessibilidade; o da galera não tinha semântica de contador. Ambos agora oferecem `role="timer"`, nome com tempo decorrido e `aria-live="off"`, permitindo consultar a leitura sem gerar anúncios de cada segundo. Não altera contagem, persistência ou pontuação. [Referência ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/timer_role).
- **Diálogos:** Tab no último controle e Shift+Tab no primeiro passam a circular dentro do diálogo. Escape e devolução do foco ao botão de origem foram preservados. A revisão encontrou o foco saindo do diálogo no ciclo completo; o cenário que reproduziu isso passou após a correção no componente compartilhado.
- **Arte:** montagem do Aurélio usa derivados WebP sem perda dos dois PNGs aprovados. Todos os pixels RGBA e dimensões foram comparados e são idênticos. Os PNGs originais permanecem como fonte e referência; recortes, máscaras, poses e animações não foram redesenhados.
- **Fontes:** as três TTF aprovadas ganharam versões WOFF2 completas, sem subconjunto, remoção de caracteres ou substituição de família. As tabelas de desenhos, métricas, variações e caracteres foram comparadas integralmente; apenas checksum e sinalizador de compressão do cabeçalho diferem. Pesos variáveis, normal/itálico e `font-display: swap` preservados, assim como fontes originais e licenças OFL.

## Fluxos exercitados

| Área | Verificação |
| --- | --- |
| Entrada | Clique, digitação, composição Unicode, colagem, arraste com mouse, toque e arraste por toque, remoção e posição escolhida. Gesto rápido permite rolagem em vez de inserir letra. |
| Acentos e sinais | Aplicar/remover acento, C/Ç distintos, vogais repetidas, hífens e outros sinais fixos, números obrigatórios, expressões longas dos lotes reais. |
| Avisos | Resposta incompleta não envia; bloqueio de letra e excesso têm texto; botões desabilitados e estados selecionados têm semântica, sem depender somente da cor. |
| Individual | Configuração, palpites, dica seguinte, quinta dica, desistência, resultado, recarga, rascunho, pausa, retomada, duas abas e recuperação de falha de envio. Trocar tema mantém estado da partida. |
| Galera | Configuração, até três participantes, três expressões longas no painel, teclado compartilhado, palavra completa, aviso de turno, recarga, saída e falha de conexão. |
| Preferências | Paleta, claro/escuro, silêncio e movimento reduzido; gravação, navegação e recarga. Atalho de tema não salva ajustes de áudio ainda não confirmados. Preferências da conta continuam cobertas pelos contratos e testes anteriores. |
| Navegação e foco | Títulos recebem foco ao navegar; links mantêm nomes; ajuda prende o foco, fecha com Escape e o devolve. Falha de módulo oferece recuperação. |
| Apresentação | Computador 1440 × 1000, tablet 820 × 1180, celular 390 × 844; cenários adicionais a 320 px, janela baixa e tamanho-base do texto em 200%. Sem rolagem horizontal nos cenários verificados. |
| Paletas | Texto/painel contrastante nas oito combinações claro/escuro; letra selecionada sobre destaque verificada. Isso não representa certificação de contraste de todos os pixels e estados. |
| Aurélio e áudio | Fidelidade e encaixes nas nove atuações, pausa e movimentos reduzidos; áudio após gesto, prévias, silêncio e recuperação de arquivo indisponível. |

A ampliação de texto é uma prova CSS, não uma execução do zoom nativo de todos os navegadores. A árvore acessível e o foco foram examinados por testes de navegador; não houve nova sessão com leitor de tela físico. Interfaces de jogo usam API controlada nestas suítes: não se alegam novas verificações de login real ou bancos a partir delas.

## Peso dos recursos

| Recursos | Antes | Depois | Redução |
| --- | ---: | ---: | ---: |
| Duas imagens do Aurélio | 2.602.841 bytes | 1.632.042 bytes | 37,3% |
| Três fontes completas | 933.700 bytes | 415.796 bytes | 55,5% |
| Imagens e fontes somadas | 3.536.541 bytes | 2.047.838 bytes | 42,1% |

As reduções são por tamanho de arquivo, não uma comparação estatística de tempo de carregamento. O JavaScript inicial observado somou **449.534 bytes decodificados**, abaixo do orçamento automatizado de **500 KiB**. Painéis individual/galera e laboratório permanecem carregados sob demanda; o menu silencioso não requisita faixas de áudio.

Conversões locais usaram Pillow (WebP `lossless=True`, `exact=True`) e fontTools 4.68.0/Brotli 1.2.1, instalados somente em pasta temporária ignorada para preparar WOFF2. Compressão WOFF2 sem transformação de tabelas; sem subsetting. Nenhuma dessas ferramentas foi adicionada às dependências da aplicação. [Formato e ferramenta](https://fonttools.readthedocs.io/en/stable/ttLib/woff2.html).

## Medição da compilação

Ensaio único por tamanho, em prévia local da compilação de produção. Edge/Chromium, cache desativado e respostas da API simuladas. Celular com CPU 4× mais lenta, download 1,6 Mbps, upload 750 kbps e latência de 150 ms via CDP. Computador e tablet usam a CPU e rede locais. Não compara desempenho de aparelhos físicos.

| Ensaio | Título/menu disponível | Fontes e imagens do SVG concluídas | Intervalo de quadros P95 / máximo |
| --- | ---: | ---: | ---: |
| Computador | 189 ms | 231 ms | 10,1 / 10,1 ms |
| Tablet | 193 ms | 252 ms | 10,1 / 10,5 ms |
| Celular limitado | 1.858 ms | 11.898 ms | 10,1 / 20,1 ms |

“Disponível” mede da navegação até o título visível; não é LCP, INP ou tempo de autorização do Google. O tempo da arte considera a conclusão dos recursos usados pelo SVG, além das fontes. A amostra de quadros é uma janela de 1,5 s após esse carregamento; não é promessa de taxa de quadros no celular, nem medição durante toda animação ou sob carga de usuários.

Metas de referência para repetir este ambiente: JavaScript inicial ≤ 500 KiB; menu disponível em até 5 s e arte/fontes concluídas em até 15 s na simulação limitada. As duas metas de tempo foram atingidas nesta amostra e são observacionais; somente peso de JavaScript e ausência de carregamentos antecipados são impostos na suíte para evitar que velocidade variável da máquina seja confundida com regressão funcional. Despertar do Render, API real, rede móvel física e vários usuários simultâneos não estão representados. A arte ainda exige cerca de 12 s na rede limitada: os controles ficam disponíveis antes dela; há espaço para otimização futura caso esse tempo seja inadequado ao público.

## Testes e ajustes dos ensaios

- **212 cenários de navegador distintos aprovados:** 54 individual, 18 galera, 41 entrada, 24 menu, 15 acabamento, 45 mascote, 9 áudio e 6 uso real. Quatro casos condicionais de toque foram ignorados nos projetos em que não se aplicam.
- **86 testes unitários frontend**, tipos, Prettier e compilação aprovados.
- **TDD dos comportamentos corrigidos:** testes de contador acessível falharam inicialmente pela ausência da semântica; passaram após a alteração nos dois modos. O novo teste de ciclo completo de Tab falhou antes do ajuste do diálogo e passou depois, incluindo Shift+Tab, Escape e foco de retorno. Ícones e codificação de imagens/fontes são entregas visuais com verificações próprias, sem ciclo TDD artificial.
- Execução inicial de suítes simultâneas encontrou conflito de servidor e timeout de gesto. Execuções posteriores com saídas separadas e entrada sequencial passaram; não foram relaxados os critérios funcionais.
- O primeiro ensaio de preferências redefinia o armazenamento a cada recarga; foi corrigido para semear apenas um navegador vazio. Não foi um defeito de persistência da aplicação.
- O teste de fidelidade móvel inicialmente comparava uma montagem coberta pela barra fixa com uma referência descoberta. As duas capturas foram inspecionadas; a barra foi ocultada somente durante essa comparação, preservando o limite original de 2% e as demais verificações. A comparação corrigida passou nos três tamanhos; não houve alteração da arte para acomodar o teste.

Novo comando: `npm run build`, seguido de `npm run testar-uso-real`, em `Frontend`. O ensaio gera anexos JSON e capturas em `test-results/uso-real`, fora do Git. Também foi incluído no workflow após a compilação e as suítes existentes. Fontes/metadados originais e PNGs permanecem no repositório; as novas versões são os recursos servidos pela interface.

Os retornos de encerramento de algumas páginas de teste chegaram ao proxy sem API de desenvolvimento e geraram mensagens de conexão recusada; as asserções dos cenários aprovados passaram. Nenhuma conta, partida ou catálogo real foi alterado. O roteiro permanece somente local. Fases 47, 48 e 49 continuam abertas, incluindo a aceitação final da versão publicada; novos ícones não foram declarados aprovados esteticamente pelo responsável.
