# Aurélio — fase 36 em revisão

**Estado em 2026-10-30:** a primeira saudação por recortes, após a correção dos encaixes e olhos, foi **aprovada e considerada concluída pelo responsável**. Em seguida, o responsável autorizou produzir todas as demais animações. As oito novas atuações estão implementadas e disponíveis na galeria para avaliação visual; a fase 36 completa permanece aberta até essa avaliação. A primeira interpretação vetorial e suas nove atuações continuam reprovadas por diferença na aparência, rigidez e repetição.

## Direção da revisão 02

A aparência vem do PNG aprovado, `Frontend/public/mascote/aurelio.png`, preservado sem alteração. Em vez de redesenhar seus braços, livro ou pernas, a montagem usa recortes da própria imagem em SVG. Uma capa limpa auxiliar preenche o que ficava escondido por rosto, gravata e membros; não substitui o desenho original como referência.

Arquivo e prompt da capa auxiliar, origem da arte e decisões estão no [registro da saudação 02](Identidade-visual/Aurelio-saudacao-02.md). A montagem e a primeira saudação receberam aprovação visual explícita após a correção dos recortes. O teste de fidelidade complementa essa avaliação, sem substituí-la.

## Separação das partes

- `recortes.ts`: contornos no espaço original de 1158 × 1359, compartilhados entre máscaras e camadas.
- `AurelioRecortado.tsx`: corpo/capa, miolo/páginas, pernas, braço esquerdo/luva, ombro/antebraço/punho direitos, sobrancelhas, olhos, pupilas, boca e gravata. Reutiliza a imagem original, sem gerar uma nova aparência para cada parte.
- Capa de fundo sem rosto/membros: reconstrução das áreas antes encobertas, máscara da silhueta do livro e remoção de fragmentos indevidos dos recortes.
- Os encaixes das pernas são completados atrás do livro para permitir a transferência de peso sem abrir lacunas. As pupilas usam recortes originais sobre a reconstrução das áreas claras dos olhos. Pálpebras fechadas usam um traço curvo auxiliar.
- Na pose neutra, os olhos, a boca e a gravata usam os recortes aprovados. As novas atuações alternam o sorriso original com boca fechada ou surpresa, desenhadas em SVG; as sobrancelhas também podem girar separadamente. Essas expressões novas estão sujeitas à avaliação visual. Não há fala, sincronização labial ou novos sons nesta etapa.

É uma composição SVG **com partes raster**, e não uma vetorização integral. O raster aprovado permanece a fonte da textura e do traço. Ainda são necessários cuidados com os limites e encaixes quando ampliados ou em poses extremas; o repertório atual não cobre todas as deformações possíveis.

## Atuação da saudação

Duração finita de **5,4 segundos**, sem repetição automática:

1. Atenção e antecipação: olhar se ajusta, sobrancelhas sobem e o corpo prepara o gesto.
2. Aceno: ombro, antebraço e punho têm movimentos diferentes, com amplitudes que diminuem. O sorriso acompanha o gesto e os olhos piscam em momentos definidos.
3. Acomodação: braço e corpo desaceleram; gravata e páginas terminam com movimentos secundários atrasados. A pose final retorna à inicial.

`saudacao.ts` preserva as poses, os tempos e a interpolação suave da saudação aprovada. O relógio foi extraído para `usar-relogio-atuacao.ts`, compartilhado pelo repertório, com cancelamento de quadros ao pausar/desmontar. As partes usam a mesma linha de tempo e pivôs explícitos. Não são loops independentes aplicados igualmente a todos os membros.

## Repertório produzido após a saudação

O pedido posterior de produzir todas as animações permite entregar as oito novas atuações juntas para revisão. Cada uma tem uma sequência própria de preparação, gesto e acomodação em `atuacoes.ts`; não são variações do aceno. `repertorio.ts` contém seus nomes e descrições para a galeria. Nenhum PNG aprovado foi alterado ou gerado novamente.

| Atuação | Duração | Intenção e movimento |
| --- | --- | --- |
| Espera | 6,4 s | Respiração discreta, olhar lateral, piscada e retorno contínuo. Repete somente no jogo, quando visível e com movimentos permitidos. |
| Saudação | 5,4 s | Aceno aprovado, preservando as poses da versão aceita. |
| Pensamento | 3,8 s | Inclinação curiosa, sobrancelhas assimétricas, olhares alternados, interrogação e descoberta. |
| Apresentação de dica | 3,2 s | Antecipação e abertura da palma, olhar dirigido à apresentação e brilho breve. |
| Erro | 2,8 s | Surpresa curta, ombros erguidos e balanço encabulado, seguido de expressão acolhedora. |
| Comemoração | 3,5 s | Preparação comprimida, salto do personagem inteiro, estrelas e aterrissagem amortecida. A sombra se contrai durante o salto. |
| Passagem de vez | 2,6 s | Olhar de um lado para o outro, palma aberta e seta de convite ao próximo participante. |
| Sorteio | 4,2 s | Olhares acompanham cartões abstratos; breve suspense e gesto de revelação. Não calcula nem mostra um sorteado por conta própria. |
| Resultado | 4,8 s | Apresentação do encerramento, selo de conclusão e pequena reverência. O selo não declara vitória, preservando empates e abandonos. |

`EfeitosAurelio.tsx` compõe interrogação, brilhos, estrelas, seta, cartões e selo em SVG, com cores da identidade e sem dependências novas. Os efeitos seguem a mesma linha de tempo, desaparecem no repouso e não revelam respostas, pontos ou participantes. O salto envolve o personagem inteiro para manter os membros ligados; seus pés não ficam presos ao chão enquanto o corpo sobe.

As máscaras da capa removem também a extensão real dos olhos abertos e as bordas das sobrancelhas/boca antes de apresentar as partes móveis. Isso evita arcos antigos visíveis durante a piscada ou na troca de expressão. No fechamento completo, ficam apenas os traços das pálpebras, sem uma faixa branca achatada. O teste de fidelidade continua com o mesmo limite, sem ampliar sua tolerância.

## Guia para as próximas atuações

A referência aprovada é a saudação na versão do commit `defa315`, aceita pelo responsável em 2026-10-30. Consultar este guia e os arquivos citados antes de alterar a montagem. Esta aprovação não autoriza redesenhar o personagem ou considerar outras atuações concluídas.

### O que preservar na arte e nos encaixes

- Partir do PNG aprovado, mantendo livro, textura, espessura dos traços, braços, luvas, pernas, sapatos e proporções. O redesenho vetorial aproximado foi o principal motivo de reprovação da primeira tentativa.
- Manter as partes no mesmo espaço de coordenadas de 1158 × 1359. A capa auxiliar reconstrói somente áreas encobertas e precisa continuar alinhada ao original.
- Separar movimentos por responsabilidade: corpo, páginas, ombro, antebraço, punho, pernas, sobrancelhas, olhos/pupilas, boca e gravata. Usar a hierarquia das articulações para que a mão acompanhe o braço; não mover tudo como uma peça única.
- Posicionar pivôs nas articulações reais. No braço direito, os pivôs atuais são ombro `(858, 635)`, cotovelo `(925, 622)` e punho `(951, 600)`, em coordenadas da arte. Girar o punho no centro da palma gerava encaixes inadequados.
- Preservar margens e sobreposições nos recortes. Não aparar punhos, tornozelos, dedos ou bordas dos sapatos para esconder fragmentos da capa: excluir a capa pela máscara apropriada. As ligações auxiliares ficam sob as partes originais e sob o livro.
- Usar os contornos reais de `contornos-olhos.ts` para limitar o creme e as pupilas. A máscara externa permanece fixa em relação ao olho enquanto a pupila se desloca. Elipses aproximadas deixavam um halo claro visível fora do olho.
- Novas poses amplas podem revelar áreas ausentes na imagem original. Preparar e revisar esses recursos antes de aumentar amplitudes; os recortes atuais não garantem qualquer rotação ou expressão possível.

### O que funcionou no movimento

- Construir uma atuação com intenção: atenção, antecipação, gesto principal e acomodação. A saudação dura 5,4 segundos e termina na pose inicial, sem repetição automática.
- Coordenar as partes por uma única linha de tempo. Em `saudacao.ts`, os quadros principais ficam em 0, 350, 750, 1050, 1350, 1700, 2070, 2500, 2950, 3400, 3900, 4550 e 5400 ms, interpolados com a curva suave `t² × (3 − 2t)`.
- Variar os intervalos e reduzir as amplitudes do aceno. Ombro, cotovelo e punho têm movimentos distintos; evitar oscilações iguais e repetitivas em todos os membros.
- Dar apoio ao gesto com transferência discreta de peso, olhar, sobrancelhas e sorriso. Na saudação, o corpo varia aproximadamente de −17 a +10 pixels na vertical e de −1,3° a +1,6°; são referências de sutileza desta atuação, não limites universais.
- Usar movimento secundário: gravata e páginas terminam depois do gesto principal. As piscadas da saudação se concentram em 520 e 3480 ms, com fechamento breve. Não copiar obrigatoriamente esses tempos para outros acontecimentos.
- Manter início e fim estáveis; respeitar pausa, desmontagem, visibilidade e movimentos reduzidos. A animação continua separada do estado oficial do jogo e não bloqueia ações.

### Como evoluir sem perder o resultado aprovado

1. Definir a intenção, poses e duração de cada atuação separadamente, mesmo quando o responsável autorizar produzir várias na mesma entrega. Não reutilizar o repertório vetorial reprovado como base.
2. Proteger os comportamentos existentes com testes e seguir TDD para novos comportamentos executáveis. Para nova arte, fazer revisão visual própria.
3. Comparar a aparência neutra ao PNG e examinar antecipação, extremos, transições, piscadas e retorno no controle de tempo da galeria. Verificar em ampliação e no tamanho real do jogo, em computador, tablet e celular.
4. Preservar as regressões de fidelidade e de frestas/halos; incluir poses extremas novas quando elas não estiverem cobertas. Não afrouxar tolerâncias para acomodar recortes defeituosos.
5. Apresentar a atuação ao responsável e registrar sua aprovação individual. Os testes demonstram propriedades específicas; naturalidade, personalidade e qualidade visual exigem essa avaliação.

## Galeria e integração

`/laboratorio/aurelio` apresenta as nove atuações selecionáveis: montagem ao lado do original, reproduzir/pausar, voltar à pose inicial, controle de tempo adaptado à duração e visualização dos recortes/articulações. Trocar a atuação para a reprodução e volta ao início; reproduzir após pausar continua do instante atual. Na galeria cada atuação toca uma vez, inclusive a espera, para facilitar a revisão. O controle manual permite examinar poses mesmo com movimentos reduzidos; reprodução automática respeita essa preferência.

`AurelioDesenho.tsx` seleciona a atuação correspondente à reação, reutilizando os eventos já integrados: saudação no menu; dicas e erros no painel individual/demonstração; comemoração ao acertar e pensamento ao revelar uma palavra; troca de vez, pontos e sorteio na galera; resultado nos dois modos. Após a reação, a espera se repete enquanto permitida. As durações da política e do relógio usam a mesma fonte em `reacoes.ts`. Os eventos, prioridades, deduplicação e transações dos jogos continuam independentes da animação. As novas atuações estão implementadas, mas não devem ser apresentadas como visualmente aprovadas antes da revisão do responsável.

Redução de movimentos salva e do aparelho, visibilidade da página e do personagem continuam observadas. Uma reação não bloqueia controles nem concede pontos. Nenhum contrato HTTP ou banco foi alterado.

## Ferramentas avaliadas

A documentação já previa SVG em partes e Motion. A revisão mantém React/SVG e Motion para integração/visibilidade; a saudação usa uma linha de tempo explícita com `requestAnimationFrame`. O invólucro `LazyMotion` foi retirado porque a nova composição não usa seus elementos animados. Não foi necessário instalar outro runtime.

O trabalho por partes, poses e ajustes de tempo é consistente com o fluxo de [cut-out descrito pela Toon Boom](https://docs.toonboom.com/help/harmony-24/advanced/getting-started/cut-out.html). A qualidade depende da preparação da arte e da atuação, não de instalar uma biblioteca por si só.

[Rive](https://rive.app/use-cases/character-animation) é uma alternativa a avaliar para autoria com ossos, malhas e máquinas de estados; exigiria produzir e revisar um arquivo real de animação e verificar as condições de exportação/publicação antes de mudar a integração. [Spine](https://esotericsoftware.com/spine-runtimes-license) tem condições de licença ligadas ao editor; não foi adotado e não há contratação de ferramenta paga. Esta revisão não declara uma classificação objetiva da melhor ferramenta do mercado.

## Verificação e limites

### Correção de encaixes e olhos após a revisão 02

O responsável identificou cortes nas luvas, tornozelos e sapatos, além de uma borda creme fora dos olhos durante o movimento. Os recortes dos membros foram ampliados para preservar os contornos originais; uma máscara baseada na transparência da capa auxiliar remove os fragmentos do livro que esses recortes maiores poderiam carregar. O punho direito gira na união com o braço, com uma ligação sobreposta por baixo da luva.

`contornos-olhos.ts` registra os contornos extraídos das bordas escuras do PNG aprovado. O preenchimento creme e o deslocamento das pupilas ficam limitados a esses contornos, sem a antiga elipse aproximada. Nenhuma imagem original foi alterada nesta correção.

Uma regressão visual examina sete instantes do aceno, em resolução nativa e isolada de outros elementos da página: procura perdas nas áreas claras das luvas e tornozelos e vazamento creme fora dos olhos. O teste reproduziu inicialmente 45 pixels ausentes no tornozelo esquerdo parado, antes da correção. Essa verificação complementa a comparação da pose neutra e a inspeção visual; não substitui a avaliação artística do responsável.

TDD: o teste da linha de tempo falhou pela ausência do módulo; o teste da galeria falhou pelo título/fluxo antigo. Foram verificados início/fim na mesma pose, antecipação, articulações independentes, piscada, controles, encerramento sem loop e redução de movimentos. A galeria anterior e seus testes de nove reações foram substituídos pelo novo escopo aprovado.

Comparação visual automatizada: capturas da montagem parada e do PNG com as mesmas dimensões/fundo; com a referência na mesma posição física, pixels com diferença superior a 40 em algum canal, mesmo procurando correspondência a até um pixel de distância para acomodar a suavização de bordas, devem ocupar menos de 2% da imagem. Esse limite detecta alterações de aparência importantes, mas não afirma igualdade pixel a pixel. Há inspeção dos recortes e das poses durante o aceno, além dos testes funcionais.

As verificações finais e os números constam do roteiro local. A primeira saudação teve aparência e movimento aprovados pelo responsável; manter a fase 36 aberta pelas demais atuações ainda pendentes. Dispositivos físicos e otimização das imagens entram nas revisões posteriores. O aviso preexistente de tamanho do pacote Vite permanece registrado.

### Verificação do repertório restante

TDD: o teste das novas poses falhou inicialmente pela ausência de `atuacoes.ts`; o cenário da galeria falhou pela ausência do seletor de atuações. Na inspeção da comemoração, a regressão de piscada reproduziu traços dos olhos abertos fora da pálpebra fechada; após a limpeza da máscara, passou mantendo o limite original de fidelidade. A medição desse defeito considera o contorno real dos olhos para não confundir a boca próxima com um resíduo do olho.

Foram aprovados 77 testes unitários do frontend e 129 cenários de navegador: 45 do mascote, 48 do individual/demonstração, 12 da galera e 24 do menu, em computador, tablet e celular. Depois do ajuste de espaçamento dos botões, o cenário da galeria foi repetido nos três tamanhos. As verificações incluem poses finitas, números válidos e limites das expressões, preservação das poses da saudação, repetição apenas da espera no jogo, preferência por movimentos reduzidos, seleção/pausa e encaixes em 31 instantes distribuídos entre as nove atuações. Tipos, compilação e formatação também verificados.

Os fluxos de navegador usam respostas HTTP controladas para verificar a interface; não representam nova prova dos bancos ou do login Google. Nenhum backend, migração, contrato HTTP ou dependência foi alterado. As capturas foram inspecionadas, mas a avaliação artística das oito atuações cabe ao responsável. A presença dos efeitos não substitui essa aprovação.
