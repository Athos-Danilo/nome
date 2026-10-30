# Aurélio — fase 36 em revisão

**Estado em 2026-10-30:** primeira interpretação vetorial e suas nove atuações **reprovadas pelo responsável** por diferença na aparência, rigidez e repetição. O novo escopo aprovado é acertar a arte e uma única saudação antes de produzir novamente o repertório. A fase permanece aberta.

## Direção da revisão 02

A aparência vem do PNG aprovado, `Frontend/public/mascote/aurelio.png`, preservado sem alteração. Em vez de redesenhar seus braços, livro ou pernas, a montagem usa recortes da própria imagem em SVG. Uma capa limpa auxiliar preenche o que ficava escondido por rosto, gravata e membros; não substitui o desenho original como referência.

Arquivo e prompt da capa auxiliar, origem da arte e decisões estão no [registro da saudação 02](Identidade-visual/Aurelio-saudacao-02.md). O resultado da montagem ainda precisa da avaliação visual do responsável. O teste de fidelidade não constitui aprovação artística.

## Separação das partes

- `recortes.ts`: contornos no espaço original de 1158 × 1359, compartilhados entre máscaras e camadas.
- `AurelioRecortado.tsx`: corpo/capa, miolo/páginas, pernas, braço esquerdo/luva, ombro/antebraço/punho direitos, sobrancelhas, olhos, pupilas, boca e gravata. Reutiliza a imagem original, sem gerar uma nova aparência para cada parte.
- Capa de fundo sem rosto/membros: reconstrução das áreas antes encobertas, máscara da silhueta do livro e remoção de fragmentos indevidos dos recortes.
- Os encaixes das pernas são completados atrás do livro para permitir a transferência de peso sem abrir lacunas. As pupilas usam recortes originais sobre a reconstrução das áreas claras dos olhos. Pálpebras fechadas usam um traço curvo auxiliar.
- Na pose neutra, os olhos usam o recorte integral aprovado. Boca e gravata preservam a arte original. Não há fala, sincronização labial ou novos sons nesta etapa.

É uma composição SVG **com partes raster**, e não uma vetorização integral. O raster aprovado permanece a fonte da textura e do traço. Ainda são necessários cuidados com os limites e encaixes quando ampliados ou em poses extremas; a revisão atual cobre a saudação, não todas as deformações possíveis.

## Atuação da saudação

Duração finita de **5,4 segundos**, sem repetição automática:

1. Atenção e antecipação: olhar se ajusta, sobrancelhas sobem e o corpo prepara o gesto.
2. Aceno: ombro, antebraço e punho têm movimentos diferentes, com amplitudes que diminuem. O sorriso acompanha o gesto e os olhos piscam em momentos definidos.
3. Acomodação: braço e corpo desaceleram; gravata e páginas terminam com movimentos secundários atrasados. A pose final retorna à inicial.

`saudacao.ts` define as poses, os tempos e a interpolação suave; `usar-relogio-saudacao.ts` fornece um único relógio por instância, com cancelamento de quadros ao pausar/desmontar. As partes usam a mesma linha de tempo e pivôs explícitos. Não são loops independentes aplicados igualmente a todos os membros.

## Galeria e integração

`/laboratorio/aurelio` foi substituído pelo ensaio da saudação: montagem ao lado do original, reproduzir/pausar, voltar à pose inicial, controle de tempo e visualização dos recortes/articulações. O controle manual permite examinar poses mesmo com movimentos reduzidos; reprodução automática respeita essa preferência.

No menu, a saudação usa a montagem nova. Nos demais acontecimentos, o personagem fica na pose original enquanto suas atuações aguardam a próxima revisão. Os eventos, prioridades, deduplicação e transações dos jogos continuam independentes da animação. Os nove estados anteriores não devem ser apresentados como repertório animado aprovado.

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

As verificações finais e os números constam do roteiro local. Manter a fase 36 aberta até o responsável avaliar aparência, naturalidade e ritmo. Outras atuações, dispositivos físicos e otimização das imagens ainda entram nas revisões posteriores. O aviso preexistente de tamanho do pacote Vite permanece registrado.
