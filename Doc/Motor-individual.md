# Motor individual — fase 20

Backend implementado em 2026-10-28: configuração, confirmação, seleção, apresentação de rodadas, palpites, dicas, acerto, desistência da palavra e abandono definitivo. **Esta fase entrega operações da API, sem acrescentar as telas finais de partida.** Teclado e montagem visual continuam nas fases próprias; a demonstração jogável será integrada na fase 26 e a pausa/retomada na fase 28.

**Atualização da fase 26:** telas do Solo e da demonstração integradas ao motor; máscara e validação aceitam sinais fixos e letras/números preenchíveis conforme D08. Estado público acrescenta limites do teclado, acertos e resumo de rodadas encerradas. Contratos, verificação e limites em [Partida individual](Partida-individual.md).

## Decisões D11 aprovadas

- Na distribuição aleatória, cada posição sorteia uma dificuldade com chances iguais entre os níveis selecionados. Não há garantia de que todos os níveis apareçam numa partida curta. Depois aplica-se a ordem sorteada ou crescente escolhida.
- Se faltar uma dificuldade, ela não é substituída automaticamente. O jogador pode autorizar outras temáticas, reduzir ou cancelar. Se as temáticas já foram ampliadas, restam redução e cancelamento; sem nenhuma resposta disponível, não é possível reduzir para uma partida vazia.
- A redução confirmada aceita qualquer quantidade disponível a partir de **uma palavra**, inclusive uma ou duas. Configurações normais continuam solicitando 3, 5 ou 7 palavras.

## Configuração e confirmação

`POST /api/partidas/individual/configuracao` exige conta ativa, origem e proteção da sessão. Aceita:

| Campo | Valores |
| --- | --- |
| `quantidade_palavras` | 3, 5 ou 7 |
| `tematica` | Identificador de uma temática ou null para todas |
| `dificuldades` | Lista sem repetições: `facil`, `medio`, `dificil` |
| `distribuicao` | `unica`, `personalizada` ou `aleatoria` |
| `quantidades` | Quantidade inteira não negativa por nível; somente na personalizada, com soma igual ao total |
| `ordem` | `sorteada`, `crescente` ou `manual` |
| `sequencia` | Ordem explícita dos níveis, somente no modo manual, respeitando as quantidades |
| `permitir_outras_tematicas` | Booleano; padrão falso |
| `aceitar_reducao` | Booleano; padrão falso |

Ordem manual exige distribuição única ou personalizada; a opção aleatória sorteia as quantidades antes da ordenação e não aceita uma sequência manual contraditória. Quantidades não aceitam booleanos, textos ou números fracionários como inteiros. Campos extras são recusados.

Se faltar conteúdo, a resposta informa `pode_iniciar: false`, `disponiveis`, `sequencia_solicitada`, `distribuicao_disponivel` e `alternativas`; não cria partida nem marca exposição. As escolhas de ampliação/redução precisam ser enviadas explicitamente numa nova conferência.

Quando viável, a resposta inclui `plano_id`, `expira_em` e a configuração efetiva, com quantidade realmente disponível e sequência dos níveis. As referências das palavras ficam somente no servidor. O plano vale dez minutos para confirmação; **essa validade técnica não limita a duração ou a retomada de uma partida iniciada**.

`POST /api/partidas/individual` recebe apenas `plano_id`. Consome o plano da própria conta e inicia exatamente a seleção conferida. Reenvios do mesmo plano recuperam a mesma partida. Um plano expirado precisa ser conferido novamente. Se uma palavra prevista como inédita tiver sido exibida desde a preparação, o plano é recusado como desatualizado; não há novo sorteio oculto.

Exemplo mínimo de configuração:

```json
{
  "quantidade_palavras": 3,
  "tematica": "animais",
  "dificuldades": ["facil"]
}
```

## Seleção e conteúdo visto

São selecionadas respostas distintas dentro da partida, respeitando os níveis solicitados. Inéditas têm prioridade sobre vistas, com sorteio entre opções equivalentes. Depois de autorizar outras temáticas, essa prioridade continua valendo no conjunto ampliado; a temática inicial desempata opções com o mesmo estado de exposição. Nunca se troca a dificuldade para preencher uma lacuna.

O histórico consulta exposições dos dois modos para o titular. Reservas de planos e rodadas ainda não apresentadas não contam como vistas. A primeira rodada é apresentada ao iniciar a partida; cada rodada seguinte é apresentada após acerto ou desistência da anterior. Abandonar não apresenta as reservas restantes.

PostgreSQL guarda identificadores e revisões do conteúdo. Respostas e dicas oficiais continuam no MongoDB; a partida usa a revisão imutável reservada. A prévia e o estado público não entregam identificadores de palavras, soluções futuras ou dicas ainda não reveladas. Desde a fase 26, a máscara mantém sinais e espaços fixos e oculta letras e números, conforme D08.

## Rodadas e pontuação

Cada rodada começa na primeira dica. Pedir uma dica avança uma posição; na quinta, a operação é recusada sem alterar o estágio. Um palpite completo incorreto avança a dica automaticamente até a quinta; nessa posição, erros continuam permitidos e o valor permanece em 20 pontos. O retorno indica a limpeza da montagem após erro.

Palpites são normalizados para Unicode NFC e maiúsculas, preservando acentos. Comprimento, posições de espaços e preenchimento das letras são verificados antes de registrar uma ação. Entrada incompleta não muda dica, pontos ou versão. `JAPAO` erra para `JAPÃO`; C e Ç são distintos. Entrada acentuada em forma Unicode decomposta é normalizada corretamente.

Acerto concede 100, 80, 60, 40 ou 20 pontos conforme a dica atual; dificuldade não altera o valor. Desistir da palavra revela a resposta, concede zero e avança. A resposta correta da rodada encerrada pode aparecer no retorno daquela ação, sem revelar reservas futuras.

A pontuação acumulada soma os pontos novos ao saldo persistido, preservando eventuais penalidades anteriores. Abandono definitivo não acrescenta desconto. A última rodada encerrada conclui a partida; conclusão ou abandono publica uma única linha de resultado com pontos, acertos e indicador de conclusão. Partidas ativas não publicam resultados.

## API e concorrência

| Operação | Acesso e efeito |
| --- | --- |
| GET `/api/partidas/em-aberto` | Retorna `individual` com estado atual ou null; parte da galera será ampliada em sua fase própria |
| GET `/api/partidas/{partida_id}` | Somente titular com conta ativa; consulta não avança a partida |
| POST `/api/partidas/{partida_id}/palpites` | `id_acao`, `versao_esperada`, `rodada_id`, `palpite` |
| POST `/api/partidas/{partida_id}/dicas` | `id_acao`, `versao_esperada`, `rodada_id` |
| POST `/api/partidas/{partida_id}/desistencia-palavra` | Mesmos campos da operação de dica |
| POST `/api/partidas/{partida_id}/encerramento` | `id_acao` e `versao_esperada`; abandono definitivo |

O estado inclui `partida_id`, `estado`, `origem`, `versao`, `pontuacao`, `quantidade_palavras`, `rodadas_concluidas` e `rodada_atual`. A rodada atual contém identificador relacional, ordem, dificuldade, temáticas, posições de letras vazias/espaços, dica atual, dicas já reveladas e pontos disponíveis. Em partida encerrada, `rodada_atual` é null.

Cada mutação serializa titular → partida, seguindo a ordem da exclusão de conta. Repetir a mesma ação com o mesmo corpo devolve seu resultado salvo; reutilizar o identificador com outro corpo retorna conflito. Esse retorno é o retrato daquela ação, não necessariamente a versão mais recente se outras ações já ocorreram; o consumidor deve respeitar versões e recuperar o estado atual quando necessário. Uma versão antiga em ação nova é recusada. A restrição única do banco e o bloqueio do titular impedem duas individuais simultâneas.

Pontos, avanço, exposição, registro da ação e publicação do resultado ficam na mesma transação. Uma falha ao carregar a próxima rodada reverte tudo. Corpo não aceita identidade ou pontuação livres. Respostas privadas usam `no-store`; origem e token de proteção continuam obrigatórios nas mutações.

Erros incluem 404 `PARTIDA_NAO_ENCONTRADA`/`PLANO_NAO_ENCONTRADO`; 409 `PLANO_EXPIRADO`, `PLANO_DESATUALIZADO`, `INDIVIDUAL_EM_ABERTO`, `ACAO_CONFLITANTE`, `VERSAO_DESATUALIZADA`, `PARTIDA_INATIVA`, `RODADA_INVALIDA`, `ULTIMA_DICA`; 422 `PALPITE_INCOMPLETO`/`DADOS_INVALIDOS`; 503 `CATALOGO_INDISPONIVEL`/`CONTEUDO_NAO_SUPORTADO`. Identificadores de outros usuários não revelam a existência da partida ou do plano.

## Persistência e arquitetura

A migração `0005_planos_individuais` adiciona a vigésima tabela: titular, configuração, referências reservadas, prazo e partida iniciada. Planos não iniciados não são partidas nem exposições. A exclusão de conta remove seus planos, além da anonimização já implementada. A rotina operacional de limpeza de planos expirados será tratada com a publicação; a validade é sempre verificada ao tentar iniciar.

As regras de configuração/seleção e a decisão da jogada são funções sem efeitos no banco. O serviço depende de contratos pequenos para catálogo e persistência. O adaptador PostgreSQL coordena transações, e o adaptador MongoDB lê conteúdo publicado/revisões. Rotas tratam entrada e autorização. Não foi necessário acrescentar biblioteca ou alterar o frontend nesta fase.

## Evidências de TDD e verificação

Os primeiros testes de API falharam em 404 e os de seleção falharam nas funções ainda não implementadas. Também foram reproduzidas, antes das correções, a permanência de planos após exclusão, a aceitação de tipos incorretos nas quantidades, a obsolescência de uma seleção e a prioridade incorreta de conteúdo visto após ampliar temas. A refatoração da decisão da jogada preservou os cenários aprovados.

Verificação local: **156 testes backend aprovados**, incluindo testes HTTP/PostgreSQL descartável, seleção/configuração sem banco e leitura real em MongoDB isolado. Após o último ajuste das alternativas, os testes diretamente afetados foram repetidos. Ruff, formatação e comparação do esquema foram conferidos. Os testes verificam também acentos, cedilha, erros ilimitados na quinta, pontuação mínima, soma de acertos, concorrência, idempotência, reversão de falhas e histórico compartilhado com a galera.

Frontend e testes de navegador não foram alterados ou reapresentados como executados nesta fase. Não houve partida criada na conta pessoal para teste nem alteração do conteúdo do catálogo. A demonstração de visitante e a pausa/retomada continuam aguardando suas integrações próprias. O aviso conhecido HTTPX/Authlib permanece documentado na autenticação.
