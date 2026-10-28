# Guia visual do Decifra

**Implementação da fase 17:** primeiro acesso, perfil e preferências utilizam a direção aprovada, fontes locais com pesos reais e itálico, 20 avatares ilustrados seguindo `Identidade-visual/aurelio-conceito-01.png`, temas claro/escuro e adaptação a computador, tablet e celular. As demais telas do jogo e a animação completa do Aurélio continuam nas fases próprias. Consulte [Perfil e preferências](Perfil-preferencias.md).

**Estado:** direção aprovada na fase 02 para iniciar o frontend. Poderá ser ajustada pelo responsável ao avaliar as primeiras páginas reais. A aprovação abrange paleta e tipografia, não a implementação do jogo nem a marca e o mascote finais.

## 1. Paleta e temas

Paleta enviada pelo responsável: **#444439, #8B8669, #DECD9C, #E5E37D e #D4FE62**. O tema claro é o padrão. Creme #F5EFD9 e oliva profundo #292921 complementam a paleta para leitura e separação de superfícies.

| Variável proposta | Função | Claro | Escuro |
| --- | --- | --- | --- |
| `--cor-fundo` | Fundo da página | #DECD9C | #292921 |
| `--cor-superficie` | Cartões e painéis | #F5EFD9 | #444439 |
| `--cor-texto` | Texto principal e secundário | #444439 | #F5EFD9 |
| `--cor-acao` | Botões principais | #D4FE62 | #D4FE62 |
| `--cor-texto-acao` | Texto sobre ação | #444439 | #444439 |
| `--cor-apoio` | Placar e destaques | #E5E37D | #E5E37D |
| `--cor-texto-apoio` | Texto sobre destaque | #444439 | #444439 |
| `--cor-borda` | Separadores decorativos | #8B8669 | #8B8669 |
| `--cor-foco` | Contorno de foco | #444439 | #D4FE62 |

Centralizar esses valores na camada de temas. Componentes devem consumir nomes semânticos, sem repetir códigos de cor em cada tela. Trocar a paleta não deverá exigir reescrever componentes ou regras do jogo.

Não usar verde-lima ou oliva médio como texto pequeno sobre bege. Bordas decorativas não devem ser a única indicação de controle ou estado; para limites essenciais, usar a cor de texto ou foco com contraste adequado ao entorno.

## 2. Tipografia

**Bricolage Grotesque** para títulos e chamadas; **DM Sans** para leitura, controles, placares e letras. As outras combinações estudadas não integram a direção escolhida.

| Uso | Família | Tamanho de referência | Peso / estilo |
| --- | --- | --- | --- |
| Chamada principal | Bricolage Grotesque | 42–66 px, responsivo | 800 |
| Título de painel | Bricolage Grotesque | 30 px | 600 |
| Título de opção de jogo | Bricolage Grotesque | 23 px | 700 |
| Texto e chamadas curtas | DM Sans | 16–18 px | 400; 600/700 para ênfase |
| Dicas | DM Sans | 17 px, entrelinha 1,55 | 400; negrito pontual |
| Botões | DM Sans | 14 px | 600/700 |
| Letras nos quadradinhos | DM Sans | 27 px | 700, sem itálico |
| Metadados e notas | DM Sans | 12–13 px; rótulos curtos podem usar 11 px | 400/600/700 |
| Placar | DM Sans | 22 px no valor; 12 px no rótulo | 700 no valor, algarismos tabulares |

Usar itálico real de DM Sans em frases curtas e notas. Não simular itálico em Bricolage Grotesque. Variar estilos com hierarquia consistente, sem alterná-los arbitrariamente em cada palavra. Não aplicar itálico às letras que o jogador precisa identificar nem a dicas inteiras.

Preservar Á, Ã, Ê e Ç e reservar altura para acentos. Desativar síntese artificial de fontes, carregar os pesos utilizados e manter alternativa sans-serif. Os tamanhos são referências iniciais, a validar novamente nas páginas reais, principalmente metadados em celulares.

## 3. Estados e interação

- **Normal:** texto contrastante sobre fundo ou superfície; ação principal em verde-lima com texto oliva.
- **Foco por teclado:** contorno de 3 px, afastamento de 4 px, usando a cor de foco do tema. Não remover foco nativo sem substituição visível.
- **Acerto:** símbolo de confirmação e mensagem explícita, na cor de texto. A pontuação, quando houver, deve aparecer em texto.
- **Erro:** símbolo distinto e mensagem explícita, na cor de texto. Não depender de vermelho, som ou animação para comunicar erro.
- **Desabilitado:** atributo nativo, aparência atenuada e motivo legível quando necessário. Não processar ações desabilitadas. A amostra usa opacidade 0,5.
- **Carregando:** preservar legibilidade, indicar processamento por texto e impedir envio duplicado na implementação.

Cores semânticas adicionais não foram escolhidas. Se forem introduzidas depois, verificar ambos os temas e manter símbolos e mensagens.

## 4. Adaptação

Menu e painel podem ficar lado a lado em telas largas e devem empilhar quando faltar espaço. Controles terão altura mínima de 44 px; textos longos e grupos de botões devem quebrar linha sem sobreposição. Não reduzir indiscriminadamente fontes para encaixar a interface.

O protótipo é uma amostra de identidade, sem teclado completo, regras de jogo, dados reais, navegação final ou Aurélio. Validação da aplicação em celulares e tablets físicos permanece nas fases de integração e acabamento.

## 5. Origem e distribuição das fontes

- [Bricolage Grotesque — repositório oficial Google Fonts](https://github.com/google/fonts/tree/main/ofl/bricolagegrotesque).
- [DM Sans — repositório oficial Google Fonts](https://github.com/google/fonts/tree/main/ofl/dmsans).

Na preparação do frontend, baixar os arquivos necessários dos fornecedores oficiais e incluir as respectivas licenças OFL junto aos recursos distribuídos. A prévia usa Google Fonts externamente; a aplicação deverá preferir fontes locais e alternativa de sistema, sem bloquear o jogo se o carregamento falhar.

## 6. Verificações da fase 02

| Texto / fundo | Contraste calculado |
| --- | --- |
| #444439 / #DECD9C | 6,25:1 |
| #444439 / #F5EFD9 | 8,55:1 |
| #444439 / #D4FE62 | 8,52:1 |
| #444439 / #E5E37D | 7,33:1 |
| #F5EFD9 / #292921 | 12,72:1 |

A prévia foi executada no Microsoft Edge com larguras de 320, 390, 768 e 1024 px nos temas claro e escuro. Em todos os oito cenários, nenhum elemento ultrapassou horizontalmente a janela; a menor altura de botão foi aproximadamente 44 px. Foram confirmados carregamento das fontes normal e itálica, alternância dos temas, botão desabilitado, retorno da ação de amostra e foco por teclado com contorno de 3 px, sem erros JavaScript registrados. Capturas de 320 px nos dois temas e de 1024 px no claro foram inspecionadas visualmente: textos, acentos, botões e painéis permaneceram legíveis e sem sobreposição aparente.

A verificação cobre o protótipo em navegador, não dispositivos físicos nem a aplicação completa. Não constitui certificação integral de acessibilidade. Revalidar novas combinações, foco, zoom, textos e componentes nas páginas implementadas.

## 7. Limites da aprovação

A fase 02 define uma base visual consistente e alterável. Marca e Aurélio serão desenvolvidos na fase 04; navegação completa, na fase 06. Se o responsável solicitar outra paleta ao avaliar o frontend, atualizar este guia e as variáveis de tema, repetindo as verificações afetadas.
