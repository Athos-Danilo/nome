# Menu dinâmico — referência MD-01

Data: 11/11/2026. Base: `e44bd04`, com aparência dos menus refinada em `114660b` e `1e9f934`. A árvore de trabalho estava limpa no início. Escopo: proteger fluxos e registrar o estado anterior às novas animações, conforme [especificação](../Menu-dinamico.md).

## Referência reproduzível

Foram acrescentados quatro cenários de preservação a `Frontend/testes-navegador/menu.fluxo.ts`: conta ativa, visitante com demonstração disponível, demonstração usada e individual em aberto. Cada cenário roda em computador 1440 × 1000, tablet 820 × 1180 e celular 390 × 844: doze capturas completas.

As capturas usam preferência de movimento reduzido do sistema para obter pose inicial determinística. Esperam fontes, imagens HTML e as imagens usadas no SVG do personagem serem decodificadas. O screenshot finaliza animações CSS. Essa referência demonstra aparência estável e composição, não qualidade de movimentos futuros nem desempenho.

Os cenários também verificam título/foco inicial, favicon, destinos dos modos e Google, disponibilidade de demonstração/continuidade, personagem estático e ausência de rolagem horizontal. São testes de preservação que começam verdes; nenhuma falha artificial de TDD foi criada, pois não há mudança funcional da aplicação nesta fase.

Capturas e manifesto com dimensões, hashes dos arquivos e fontes observadas ficam em `Frontend/test-results/md01/`, ignorado pelo Git. As folhas de contato dos três tamanhos foram inspecionadas: mantidas as diferenças entre visitante/conta, cartões, convite, balão e continuidade. A imagem de página inteira contém a navegação fixa no ponto original da captura; em celular com continuidade há rolagem vertical, e as ações podem ser alcançadas rolando. A referência não exige encaixar todos os estados em uma única altura de tela.

Para reproduzir os quatro cenários, na pasta Frontend:

```powershell
node node_modules/@playwright/test/cli.js test --config playwright.menu.config.ts --grep 'referência estabilizada' --output test-results/md01/menu
```

A reprodução captura a versão atual do checkout; preservar a cópia do manifesto/capturas desta base antes de reexecutar sobre uma versão futura. As respostas HTTP são controladas, com perfil fictício e sem sessões ou dados reais. Não foi feito login Google nem alteração em bancos nesta fase.

## Mapa do comportamento atual

| Área | Implementação observada | Consequência para as próximas fases |
| --- | --- | --- |
| Menu/contexto | `MenuInicial.tsx`: conta/visitante, demonstração usada, consulta de individual aberta, balão fixo | Falas devem respeitar esses contextos e as mensagens reais |
| Cartões | `CartaoModo.tsx`: link com nome acessível estável e decoração `aria-hidden` | Preservar um toque/Enter e isolar as cenas internas |
| Entrada geral | `Tela.tsx` mantém foco no h1; `acabamento.css` anima `.entrada-tela` em 280 ms e cartões em 420 ms, segundo com 70 ms de atraso | Coordenar ou substituir entrada sem empilhar transformações |
| Visitante | `menu.css` já tem entradas específicas de convite/balão, 380/320 ms e atrasos de 100/450 ms | Evitar duplicar a nova encenação sobre essas regras |
| Hover/pressão | Cartões já levantam/endireitam no hover e cedem na pressão; visitante tem reação do balão ao hover da área de escolhas | Usar camadas próprias para inclinação, cena e entrada |
| Cenário | Letras e estrela existem; há regras antigas de flutuação para `.palco-menu > img` e indicador de carregamento | Regra antiga para imagem não é o relógio do Aurélio SVG; não duplicar animação pelo nome do seletor |
| Personagem | `Aurelio.tsx` decide reação; `AurelioDesenho.tsx` usa relógio comum por atuação; somente espera repete | A agenda do menu coordena acontecimentos, sem substituir o relógio de poses |
| Pausa/redução | `useMovimentosReduzidos` combina preferência salva, sistema e `document.hidden`; `useInView` também torna o personagem estático | Separar motivo de pausa de redução onde necessário à nova agenda |
| Limite da pausa atual | O temporizador que conclui a reação observa `pausado`, não a visibilidade; a apresentação estática usa tempo zero | Não afirmar que toda a atuação preserva hoje o instante ao ocultar; testar a política nova na MD-02 |
| Arte | Recortes/máscaras, contornos dos olhos, capa auxiliar e WebP aprovados mantidos | Proteger fidelidade, frestas e halos; ampliar poses extremas na MD-08 |
| Áudio | `ProvedorAudio` centraliza gesto, clique, visibilidade e efeitos de reação; música acompanha as seções já consideradas área de menu | Não criar segundo gerenciador nem fazer falas repetidas dispararem `apresentacao`, que pode tocar efeito de dica |
| Preferências | Redução salva usa `data-movimentos`; CSS global cobre elementos/pseudoelementos; sistema também observado | Validar mudança em execução, sem novo campo de banco |

As diferenças entre a pausa atual e a proposta são trabalho planejado, não uma nova falha bloqueante do jogo existente. Nenhuma regra de pontuação, turno ou persistência foi alterada.

## Verificação

Verificações aprovadas:

| Verificação | Resultado |
| --- | --- |
| Unidade do frontend | 88 aprovados |
| Menu | 43 aprovados, incluindo 12 novos cenários; dois ignorados por serem exclusivos de computador |
| Aurélio | 45 aprovados, incluindo fidelidade e encaixes das nove atuações |
| Áudio | Nove aprovados, incluindo sinal real, silêncio e controles |
| Acabamento | 15 aprovados, incluindo cores, ampliação e diálogos |
| Tipos/compilação e formatação | Aprovados |

Total: 112 cenários de navegador aprovados e dois ignorados de forma prevista. Links do relatório, doze capturas e onze hashes de fontes também conferidos. Não houve mudança de código da aplicação, arte, dependência, banco ou contrato de API. Nenhuma regressão não explicada foi encontrada nas áreas executadas. MD-01 concluída; MD-02 continua não iniciada.

 A aprovação visual anterior do responsável foi preservada como referência; estas capturas não representam aceite antecipado das novas animações. Os tamanhos móveis são emulados no Edge; não houve ensaio físico ou medição de CPU/FPS nesta etapa.
