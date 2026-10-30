# Aurélio animado — fase 36

**Estado em 2026-10-30:** implementação preparada para revisão visual do responsável. A fase permanece aberta até essa avaliação, conforme seu critério de conclusão no roteiro local. A ilustração raster e os avatares já aprovados continuam preservados.

## Desenho em camadas

A referência é `Identidade-visual/aurelio-conceito-01.png`, com o personagem isolado em `Identidade-visual/aurelio-apresentador.png`. A versão animável é uma interpretação vetorial autoral no componente `Frontend/src/funcionalidades/mascote/AurelioDesenho.tsx`; não é uma imagem raster apenas deslocada de um lado para outro. Preserva capa oliva, páginas creme, ornamentos, olhos grandes, luvas, sapatos e gravata verde-lima. Sua fidelidade e acabamento precisam da revisão visual humana antes de serem declarados aprovados.

O SVG possui `viewBox` 420 × 500 e grupos identificados por `data-parte`: corpo inteiro, miolo, capa, rosto, sobrancelhas, olhos, pupilas, boca, gravata, braço/perna de cada lado e acentos expressivos. Gradientes, recorte e textura suave são locais, com identificadores únicos por instância. Não depende de baixar imagens para formar as partes. A capa mantém sua própria cor nos quatro temas de aparência, como ilustração da identidade.

O pivô do corpo fica na base; pernas giram a partir da ligação ao corpo; braços usam a região dos ombros e gravata/olhos usam seus centros. Movimento geral, articulações e expressões são separados, permitindo refiná-los sem alterar as regras de jogo. As expressões faciais são poses vetoriais próprias; não há sincronização labial ou fala gravada nesta fase.

## Repertório

| Reação | Apresentação |
| --- | --- |
| Espera | Respiração suave e piscar espaçado |
| Saudação | Aceno e pequenos acentos de boas-vindas |
| Pensamento | Inclinação, olhar deslocado, boca pensativa e interrogação |
| Apresentação | Gesto do apresentador e acentos junto à dica |
| Erro | Balanço curto, sobrancelhas e boca preocupadas, rabisco expressivo |
| Comemoração | Pequenos saltos, olhos sorridentes, movimentos das pernas/gravata e brilhos |
| Turno | Aceno para apresentar a próxima pessoa |
| Sorteio | Gesto de apresentação com aceno e brilhos, acompanhando a ordem oficial |
| Resultado | Celebração do encerramento, sem conceder pontos ou determinar vencedor |

Reações de apresentação têm duração aproximada de 1,4 a 2,6 segundos. Espera repete um ciclo discreto de 2,8 segundos, com piscar em ciclo mais espaçado. A duração é exclusivamente visual e pode ser ajustada na revisão. Nenhum botão precisa esperar uma animação terminar; pontos, turnos, sorteio, cronômetro e navegação continuam seguindo o estado confirmado do jogo.

## Prioridades e ciclo de vida

`reacoes.ts` concentra tipos, durações, política e tradução dos eventos. Prioridades: resultado > comemoração > erro > sorteio > turno > apresentação > saudação/pensamento > espera. Uma reação mais importante substitui a atual; uma menos importante ocupa no máximo um lugar pendente, substituindo a pendência anterior por informação mais recente. Resultado descarta pendências menores.

Cada evento possui identificador estável; as 32 referências recentes da instância evitam repetição na mesma montagem do componente. Conclusão com identificador antigo não encerra uma reação nova. Temporizadores são limpos na troca/desmontagem. Isso não constitui um registro persistido de animações nem altera a idempotência dos motores.

No individual, o carregamento apresenta a palavra sem reencenar um erro armazenado. Novas reações de erro/dica vêm das ações confirmadas; acerto/desistência usam a tela de retorno e resultado usa a tela final. Na galera, a apresentação compara versões confirmadas, sessão, participante e soma de pontos; um carregamento/consulta de tempo não representa nova jogada. Quando ganho de pontos e troca de participante ocorrem juntos, comemoração tem precedência; a próxima vez continua indicada pelo placar e texto do painel.

## Preferências, acessibilidade e adaptação

`Aurelio.tsx` observa a preferência salva do jogo, `prefers-reduced-motion` do aparelho, visibilidade do documento e presença do personagem na área visível. Observadores e inscrições são removidos na desmontagem. Preferência de redução, aba oculta e personagem fora da área visível interrompem deslocamentos/repetições e mantêm uma pose. A mudança é aplicada imediatamente, inclusive durante uma reação. A expressão e os textos do jogo continuam explicando o ocorrido.

Durante o teste, a mudança dinâmica da preferência do aparelho não atualizou o hook da biblioteca na execução verificada. A assinatura explícita de `matchMedia` com `useSyncExternalStore` cobre essa mudança, junto ao atributo de preferência do jogo. Transições para a pose estática usam duração zero.

O componente não intercepta cliques e não cria controles de jogo. O SVG possui descrição acessível. No Solo em celular/tablet, a regra antiga que escondia o mascote foi substituída por uma composição compacta de 85 px com texto breve; o tabuleiro e o teclado continuam no fluxo normal. Galera usa um anfitrião compacto, com instâncias próprias no sorteio e no resultado. Na galeria, pausar/reduzir são controles de prévia e não alteram preferências salvas.

## Galeria de revisão

Rota `/laboratorio/aurelio`, acessível no ambiente local: nove botões de reação, repetir, pausar/retomar, prévia reduzida e referência aprovada para comparação. É uma tela de revisão e não um novo item do menu principal. O responsável deve avaliar proporções, rosto, gestos, ritmo e presença nas partidas antes de marcar a fase como concluída.

## Dependência e verificações

Motion 14.9.0 instalado com versão exata e lock atualizado, usando sua API React/SVG e `LazyMotion`/`m` com o conjunto `domAnimation`. Compatibilidade com React 19 verificada nos metadados publicados. Não usar recursos pagos. Referências oficiais: [instalação](https://motion.dev/docs/react-installation), [SVG](https://motion.dev/docs/react-svg-animation) e [acessibilidade](https://motion.dev/docs/react-accessibility).

TDD: testes da política de prioridade/deduplicação foram escritos e executados antes do módulo; falharam pela ausência da implementação. Testes de navegador reproduziram a preferência dinâmica do aparelho sem efeito, o mascote oculto no celular e a repetição do erro após recarga; as correções foram verificadas nos três tamanhos. Há conferência de movimento real pela variação da transformação, além da identificação da reação. Não confundir rótulo atualizado com animação executada.

Regressões cobrem acertos, dicas, erros, reenvio, pausa/retomada, demonstração, galera e navegação. Quantidades finais e comandos executados são registrados no roteiro local. Sem mudanças de backend, banco, contratos HTTP ou conteúdo editorial. O pacote de produção cresceu com Motion; o aviso de tamanho do Vite continua registrado para a revisão de desempenho da fase 40/45. Testes de tela são em navegador automatizado, com avaliação posterior em aparelhos físicos ainda prevista.
