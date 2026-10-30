# Histórico, estatísticas e rankings — fase 34

Decisões D14/D15 confirmadas pelo responsável em 2026-10-30. A resposta sobre alterar o ranking foi esclarecida: nenhuma mudança na proposta.

## Telas e acesso

- `/perfil/historico`: álbum privado dos dois modos, filtros de modo/situação e dez itens por página, mais recentes primeiro. Data de criação exibida no horário local do navegador.
- Solo: origem (inclusive demonstração vinculada), situação, palavras, acertos e saldo. Partida aberta oferece continuar pelo fluxo de retomada existente. Sem consulta detalhada de palavras antigas.
- Galera: nomes e placares dos participantes daquela partida, líderes finais, empate/vencedor e motivo do encerramento. Sem perfis permanentes de convidados ou retomada voluntária no histórico.
- `/perfil/estatisticas`: consolidados privados do Solo, grupos por temática/dificuldade e progresso aberto separado. Acesso pelo perfil e pelo histórico.
- `/rankings`: público, três categorias, somente posição/nome/valor. Sem avatar, e-mail, datas, identificadores ou histórico privado.
- Carregamento, erro com recuperação, lista vazia e filtros sem resultado têm estados próprios. Sem números simulados no produto. Layout adaptado a computador/tablet/celular e às quatro paletas claras/escuras.

## Fórmulas aprovadas

Consolidados usam `resultados_individuais`, unido à partida individual do titular em estado concluída/abandonada. A chave primária por partida preserva a publicação única feita pelo motor. Consultas não publicam resultados nem alteram o progresso. Sem nova migração nesta fase.

| Indicador | Cálculo |
| --- | --- |
| Encerradas | Quantidade de resultados publicados elegíveis |
| Concluídas / abandonadas | Contagem pelo indicador `concluida` do resultado |
| Pontos | Soma do saldo final publicado, incluindo penalidades e negativos |
| Melhor pontuação | Maior saldo encerrado, mesmo negativo; nulo sem partidas |
| Acertos gerais | Soma dos acertos publicados uma vez por partida |
| Desistências de palavras | Rodadas apresentadas no estado `desistida`, sem contar reservas |
| Erros | Palpites registrados com resultado `erro` nas rodadas apresentadas dessas partidas |
| Média de dicas | Soma da dica dos acertos / número de rodadas acertadas, duas casas decimais; nula sem acertos |
| Progresso aberto | Individual preparada/em andamento/pausada, mostrada separadamente |

No histórico, a quantidade de palavras inclui todas as rodadas configuradas; nos grupos de desempenho, somente as apresentadas. Erros repetidos na quinta dica contam separadamente. Pedir dicas, entrada incompleta recusada e reenvio idempotente não geram erro novo.

Grupos apresentam palavras vistas, acertos, desistências, erros, pontos das palavras e média de dicas nos acertos. Uma palavra pertence a todas as suas temáticas históricas, mas entra uma vez no total geral. **Não somar os grupos por temática.** Penalidades não são distribuídas por grupo; os pontos das palavras podem diferir do saldo geral.

Temáticas vêm da revisão imutável `(palavra_id, revisao)` no MongoDB, não da configuração solicitada ou da revisão atual. Cada referência distinta é lida uma vez por consulta. Respostas/dicas não integram a projeção pública ou privada desses endpoints. Falha do catálogo devolve erro controlado, sem inventar grupos vazios. Histórico e rankings dependem somente do PostgreSQL.

## Rankings

Todos são acumulados, sem recorte por período, dificuldade ou tamanho. Cronômetro não influencia a classificação. Participam perfis ativos com ao menos uma individual encerrada publicada e contas anonimizadas com resultados preservados. Primeiro acesso precisa ser concluído para haver nome público.

Contas elegíveis entram nas três categorias mesmo com zero partidas concluídas ou pontos negativos. Excluir galera, visitante sem vínculo e individual aberta. Vincular demonstração não cria outro resultado. Consultar repetidamente não concede pontos.

Empates usam `rank()` sobre somente o valor da categoria: **1, 1, 3**. A ordem técnica por UUID entre empatados estabiliza as páginas sem desempatar ou expor o identificador. Páginas podem separar empatados, preservando sua posição global. O histórico usa criação/UUID decrescentes para estabilizar sua própria paginação.

Renomear reflete o nome atual; excluir mantém o agregado de cada conta como Jogador excluído, sem reunir contas anônimas diferentes em um jogador artificial. Recadastro não herda a identidade nem os pontos anteriores.

## HTTP

| Endpoint | Entrada e resposta |
| --- | --- |
| `GET /api/historico` | Sessão ativa; `pagina=1`, filtros opcionais `modo` e `estado`; retorna `itens`, `total`, `pagina`, `por_pagina=10` |
| `GET /api/estatisticas` | Sessão ativa; retorna `resumo`, `em_aberto` (item ou nulo), `por_tematica` e `por_dificuldade` |
| `GET /api/rankings/{categoria}` | Público; categorias `pontos`, `palavras-acertadas`, `partidas-concluidas`; `pagina=1`; retorna categoria, itens, total, página e tamanho |

Item do histórico: `partida_id`, `modo`, `origem`, `estado`, `criado_em`, `encerrada_em`, `pontuacao`, `palavras`, `acertos`, `participantes` (nome/pontos), `vencedores`, `resultado_galera`, `motivo_encerramento`. Campos exclusivos da galera ficam vazios/nulos no individual. Item de ranking: apenas `posicao`, `nome`, `valor`.

Página inteira de 1 a 100.000. Filtro/categoria inválidos: 422 padrão. Página posterior à última: itens vazios e total preservado. Consultas privadas obtêm titular da sessão; não existe parâmetro para escolher outra conta. Sem sessão: 401; perfil incompleto: 403. Privadas usam `Cache-Control: no-store` e `Referrer-Policy: no-referrer`. Indisponibilidade: 503 controlado. Frontend valida formatos antes de exibir números e separa o cache por titular/filtros/página/categoria.

## Arquitetura e evidências

Módulo `acompanhamento`: esquemas de saída, contratos internos de leitura, repositório SQL, serviço de fórmulas/revisões e rotas. Cada consulta relacional usa transação `REPEATABLE READ` para manter contagem e linhas consistentes. Serviços recebem protocolos pequenos, sem alterar os motores.

TDD: teste HTTP inicial falhou com 404 no histórico; testes da interface falharam pela ausência do módulo de consulta e da tela de ranking. Após implementar, testes de fórmulas e integração protegem os comportamentos aprovados. Um teste adicional reproduziu o título genérico da aba de estatísticas; a correção mantém o cabeçalho durante carregamento/erro.

Verificações cobrem vazio, abandono, negativos, média sem acertos, erros reais, múltiplas temáticas/revisões, progresso separado, galera fora dos totais, consultas repetidas, renomeação, anonimização, posições globais paginadas, filtros e tentativa de consultar outra conta. Navegador cobre teclado, categorias, erro/recuperação, visitante e layout nos três tamanhos, com quatro paletas claras/escuras. Prova React + HTTP + PostgreSQL confere os números reais de uma individual após jogar a galera.

Resultados finais são registrados no roteiro local da fase. Testes usam bases exclusivas, sem semear rankings fictícios no desenvolvimento. Capturas e testes automatizados não substituem avaliação posterior em aparelhos físicos. O aviso preexistente do tamanho do pacote Vite permanece para a fase de desempenho.
