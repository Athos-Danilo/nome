# Coleção ilustrada de avatares

Revisão solicitada pelo responsável em 2026-10-28 para aproximar as vinte imagens do acabamento de `../aurelio-conceito-01.png`. Substitui a apresentação simplificada dos SVG da fase 17 por retratos ilustrados com contornos orgânicos, textura suave, sombras pintadas e expressões do mesmo universo do Aurélio. Não representa uma nova aprovação humana da coleção final.

## Arquivos e integração

As vinte imagens de uso ficam em `Frontend/public/avatares/{identificador}.webp`. Cada personagem foi gerado individualmente pela ferramenta integrada `image_gen`, usando a prancha aprovada como referência de estilo e identidade. Os prompts completos estão em [prompts.json](prompts.json).

Os originais PNG de geração permanecem no armazenamento local da ferramenta. O frontend contém versões de 512 × 512 pixels, codificadas em WebP com qualidade 92 e canal alfa preservado. A preparação técnica reduz tamanho e resolução, sem redesenhar as imagens nem alterar seu conteúdo. O desenho circular é parte da imagem; o componente mantém o recorte circular e o carregamento sob demanda.

`GET /api/avatares` continua fornecendo os mesmos vinte identificadores e nomes, com `recurso` apontando para `/avatares/{identificador}.webp`. A Vercel servirá esses arquivos junto ao frontend; não encaminhar esse caminho ao Render. Não há migração ou alteração dos avatares já escolhidos nas contas. Os recursos SVG antigos do backend são mantidos por compatibilidade, mas a coleção atual não os referencia.

## Direção artística

- Mesmo Aurélio: dicionário oliva com cantoneiras douradas, páginas creme, olhos expressivos, gravata verde-lima e luvas claras.
- Retratos em primeiro plano, um personagem por arquivo, sem textos ou marcas.
- Contornos desenhados, sombreamento com volume e textura de papel; evitar ícones geométricos simplificados.
- Variações do Aurélio, animais e objetos preservam a personalidade definida nos nomes da coleção.
- Paleta oliva, creme, ocre e verde-lima; composição legível também na seleção pequena.

## Verificação

Testes de contrato foram escritos antes da mudança de caminhos e falharam apontando o endereço SVG anterior; passaram após integrar os novos recursos. A verificação de navegador usa as imagens reais do frontend e percorre as vinte opções, conferindo carregamento e caminho por identificador em computador, tablet e celular. As verificações de perfil preservam seleção, troca e privacidade. A avaliação artística é feita por inspeção visual; testes automatizados não certificam semelhança de estilo.

Resultado local desta revisão: 7 testes de backend (perfil e coleção), 27 testes unitários do frontend e 27 fluxos de navegador aprovados; compilação, Ruff e formatação aprovados. Os 20 recursos também responderam com sucesso na aplicação real local. Todos os arquivos foram conferidos como WebP de 512 × 512 com canal alfa; tamanho conjunto de aproximadamente 1,38 MiB. Capturas dos três tamanhos de tela foram inspecionadas. Não houve teste em aparelhos físicos nem nova validação de login Google nesta revisão. Uma porta bloqueada pelo Windows exigiu trocar a porta do PostgreSQL isolado de testes; nenhuma alteração foi feita no banco pessoal para essa verificação.
