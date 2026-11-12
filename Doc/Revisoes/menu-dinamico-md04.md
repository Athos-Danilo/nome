# Menu MD-04 — apresentação de entrada e retorno

Implementação em 12/11/2026, base `123fb2f`. Escopo: apresentação visual do menu; MD-05 e seguintes continuam pendentes. Preservados os ajustes de fundo e composição móvel da MD-03 aprovados pelo responsável nesta data.

## Comportamento entregue

- Primeira entrada da sessão da aba: marca → boas-vindas → palco do Aurélio → modos ou convite. Duração total de 860 ms; ações e foco disponíveis desde o primeiro quadro.
- Retorno de outras telas e recarga na mesma sessão: 260 ms, sem repetir a animação da marca nem a saudação longa. O personagem usa a espera aprovada.
- Preferência de movimentos reduzidos: composição estática. Desabilitá-la no menu atual não reproduz a apresentação que foi suprimida.
- Saída da conta durante a apresentação: visitante recebe retorno curto, sem conservar a atuação nem a agenda da conta anterior.
- Falhas simuladas de imagens e consulta de continuidade não impedem usar os modos. Nenhuma espera obrigatória por música, imagem ou resposta de rede.

## Composição e parâmetros

| Camada | Duração | Atraso |
| --- | --- | --- |
| Marca | 240 ms | 0 ms |
| Boas-vindas | 340 ms | 90 ms |
| Palco | 440 ms | 190 ms |
| Escolhas/convite | 500 ms | 360 ms |
| Retorno: boas-vindas e escolhas | 260 ms | 0 ms |

Primeira entrada: opacidade de 0,68 a 1 e `translate` de 8 px a zero. Retorno: opacidade de 0,85 a 1 e deslocamento de 4 px. A propriedade independente `translate` evita disputar o `transform` das rotações e das poses. Removidas as entradas concorrentes da tela genérica e do visitante. As camadas acompanham a pausa da agenda.

A apresentação de 860 ms não encurta o aceno aprovado: a saudação conserva seus 5.400 ms; a apresentação do convite mantém sua duração original. Arte, recortes, máscaras, contornos, articulações e curvas do Aurélio não foram alterados. Sem novo som, música, biblioteca ou serviço.

## Organização e persistência visual

`entrada-menu.ts` recebe apenas o contrato de leitura/gravação que utiliza. Consultar não consome a apresentação; confirmar é idempotente e ocorre após montagem pelo adaptador `useEntradaMenu`. O marcador `decifra_menu_apresentado` fica no `sessionStorage`, separado de autenticação, demonstração e progresso. Falha de acesso ou escrita usa memória do documento, preservando retornos enquanto ele estiver aberto; sem armazenamento, recarregar pode apresentar novamente a entrada. Nova sessão independente de aba começa pela apresentação. Duplicações seguem a semântica de cópia de sessão do navegador.

`useAgendaMenu` recria a coordenação por contexto de conta/visitante e encerra o relógio anterior na limpeza do efeito. A apresentação não controla navegação nem foco. Registro, adaptação React, coordenação temporal e estilos permanecem separados, aplicando responsabilidade única e dependência de contratos pequenos. Sem alterações na API, bancos, pontuação ou regras dos modos.

## TDD e verificação

Os quatro testes unitários do registro foram executados antes da implementação e falharam pela ausência do módulo. Os testes de fluxo reproduziram a ausência da distinção primeira/retorno pelos atributos esperados. Implementados o registro, adaptação, integração e estilos; após refatoração, unidade e fluxos passaram.

Cobertura nova: confirmação idempotente, recarga, sessão independente, falhas de acesso/escrita, retorno por navegação, foco, prazos da sequência, redução em execução, ação imediata com falha de arte/consulta e saída da conta durante a entrada. Um teste complementar registra cinco instantes por dispositivo sem exigir uma falha artificial para inspeção artística.

Durante os testes, uma interceptação de imagens abrangente demais também bloqueava o módulo de código do mascote: corrigido o substituto para interceptar somente PNG/WebP. No teste de Voltar, foi necessário esperar a rota de configurações realmente aparecer antes de acionar o histórico; mantida a expectativa de retorno curto. A inspeção do cenário MD-03 agora aguarda as entradas finitas terminarem antes de medir estabilidade durante os ciclos, preservando suas tolerâncias.

Resultados finais: **102 testes unitários aprovados**. **111 cenários de navegador aprovados**, com seis ignorados previstos: menu 81 aprovados/seis ignorados, áudio nove, acabamento 15 e uso real da versão compilada seis. Os seis ignorados são verificações exclusivas do celular nos projetos de computador/tablet. Tipos, compilação, formatação e links locais dos documentos alterados aprovados. As repetições focadas não estão somadas a esses totais.

O teste de uso real usa rede e CPU limitadas por emulação. No celular, nesta rodada, os controles ficaram prontos em cerca de 1,7 s e a arte em cerca de 11,9 s; o menu segue utilizável sem aguardar as imagens. Esses números dependem da máquina/rede emuladas e não constituem certificação de desempenho nem medição em aparelho físico. A revisão ampla de desempenho continua na MD-09.

## Inspeção visual e limites

Inspecionados os instantes 0, 150, 350, 650 e 900 ms nos três tamanhos emulados, com imagens/fontes prontas. A composição continua legível desde o início; o celular mantém balão à esquerda, cartões próximos da navegação e controles sem transbordamento horizontal. Evidências locais em `Frontend/test-results/md04/integracao-final`, incluindo três folhas de contato. A regressão completa registra novamente os quadros e a sequência ambiente; imagens, vídeos e logs permanecem ignorados pelo Git.

Verificação em navegador automatizado com computador/tablet/celular emulados, sem certificação em aparelho físico ou medição de FPS. Não realizados login Google real, carga editorial ou acesso aos bancos nesta fase. A aceitação artística conjunta continua prevista na MD-10; não pressupor aprovação das futuras falas, cenas ou surpresas.
