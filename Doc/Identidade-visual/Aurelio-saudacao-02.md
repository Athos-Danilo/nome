# Arte e preparação — saudação 02

## Origem e preservação

Referência: `aurelio-apresentador.png`, derivado da prancha `aurelio-conceito-01.png` aprovada pelo responsável. A cópia `Frontend/public/mascote/aurelio.png` tem o mesmo conteúdo (SHA-256 iniciado por `DBF5AD09B3577B43`), 1158 × 1359, com transparência. Nenhum desses originais foi sobrescrito nesta revisão.

A versão vetorial da primeira tentativa foi reprovada. O código dessa tentativa foi substituído; não deve ser usado como novo modelo do personagem.

## Recurso auxiliar gerado

Arquivo final: `Frontend/public/mascote/aurelio-capa-limpa-02.png`, 1158 × 1359, fundo transparente. Produzido pelo modo integrado da skill imagegen, usando o PNG aprovado como alvo da edição. Não foi usado CLI/API externo. A imagem foi copiada do resultado integrado para o projeto e conferida visualmente.

Função: reconstruir a capa escondida atrás de olhos, sobrancelhas, boca, gravata e membros. A montagem recorta as partes do original e usa essa imagem atrás delas. O recurso auxiliar não redefine o rosto, as mãos ou as proporções do Aurélio.

Prompt enviado, preservado para reprodução do processo:

> EDIT TARGET: supplied original Aurélio character, 1158 by 1359 px transparent canvas. Use case precise-object-edit. Prepare an animation clean plate, NOT a redesign. Remove ONLY facial features (eyebrows, eye whites, pupils, smiling mouth), bow tie, arms, gloved hands, legs and shoes. Inpaint their covered areas with matching uninterrupted olive textured book cover. Keep the BOOK EXACTLY as supplied: same position, same perspective, silhouette, dimensions relative to canvas, spine, cream pages, gold edge borders and lime corner ornaments, same colors, grain and lighting. Preserve the same canvas aspect ratio and do not center, enlarge, straighten, rotate or restyle the book. Do not add lettering or any face or features. Transparent outside the book. This image will sit behind moving cutouts from the original; registration and exact appearance of the book are critical. Single isolated clean book in original registration. No diagram or sheet or multiple views.

Recortes e reconstituição dos olhos/encaixes são composição nativa em SVG, não outras imagens geradas. Os limites são inspecionados no ensaio em poses de antecipação, aceno e retorno. Após a correção dos limites, o responsável aprovou a montagem e considerou esta primeira saudação concluída em 2026-10-30, na versão do commit `defa315`. Posteriormente, as oito atuações restantes também foram aprovadas em 2026-10-30, na versão `8684d54`. As decisões reutilizáveis estão no [guia para as próximas atuações](../Aurelio-animado.md#guia-para-as-próximas-atuações).

## Correção dos limites dos recortes

Após os prints do responsável, os limites das luvas, pernas e sapatos foram ampliados, mantendo a textura e o contorno do PNG. A transparência da capa auxiliar funciona como máscara para excluir fragmentos do livro desses recortes maiores. A união do punho foi reposicionada e recebeu sobreposição sob a luva para não abrir frestas no aceno.

Os contornos dos olhos foram extraídos das bordas escuras da referência e registrados em `contornos-olhos.ts`. Eles limitam o fundo creme e as pupilas durante o movimento, eliminando a elipse aproximada que aparecia fora dos olhos. Nesta correção não foram geradas imagens nem modificados os PNGs aprovados. Há regressão visual de sete poses, além da comparação da montagem parada com o original.

## Continuidade do repertório

Após a aprovação da saudação e nova autorização do responsável, oito outras atuações foram produzidas sobre esta montagem. Não houve geração ou alteração de PNGs. O repertório acrescenta expressões de boca fechada/surpresa, rotação independente das sobrancelhas e acentos gráficos em SVG, aprovados visualmente pelo responsável em 2026-10-30. As máscaras removem toda a extensão original dos olhos e bordas das expressões antes da composição móvel, evitando traços residuais nas piscadas. A linha de tempo aprovada da saudação foi preservada. Roteiros, durações e critérios de revisão estão em [Aurélio animado](../Aurelio-animado.md).
