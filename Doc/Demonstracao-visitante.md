# Visitante e vinculação da demonstração — fase 19

Infraestrutura implementada em 2026-10-28. Inclui identificação do navegador, reserva única de três respostas fáceis, recuperação do registro e transferência integral à conta. **Atualização da fase 26:** demonstração jogável integrada ao mesmo motor do Solo. Visitar a página não consome a oportunidade; o início é explícito. Contratos, validação e evidências em [Partida individual](Partida-individual.md).

## Decisões aprovadas — D10

O responsável aprovou nesta fase:

1. Vincular a demonstração em até **sete dias após seu início**. No instante exato do vencimento, o vínculo já não é permitido. Esse prazo não reinicia a oportunidade de jogar sem login.
2. Se a pessoa entrar com Google durante a demonstração, transferir a mesma partida, preservando rodada, dica, ações, pontos e estado, **sem penalidade pelo login**. A continuação jogável será conectada na fase 26; o cadastro de nome/avatar continua necessário antes de jogar como conta autenticada.
3. Se a conta já tiver uma individual aberta, **manter a partida existente**. Uma demonstração ainda aberta deve ser concluída ou abandonada antes de vincular. Demonstrações encerradas entram no histórico sem disputar a vaga de partida ativa.

Vinculações já concluídas podem ser consultadas novamente pela mesma conta sem duplicação, inclusive depois do prazo. A mesma demonstração não pode ser reivindicada por outra conta. Excluir a conta preserva o marcador de utilização e o instante de vínculo, impedindo recuperar a partida antiga ou ganhar outra demonstração ao recriar o cadastro.

## Identificação e proteção

O navegador recebe um segredo aleatório em cookie `decifra_visitante`, HttpOnly, SameSite=Lax e Path=/. Em HTTPS, utiliza Secure e o prefixo `__Host-`. O PostgreSQL guarda somente seu resumo SHA-256. Não são coletados identificadores civis, impressão digital do dispositivo ou rastreamento entre navegadores.

O cookie tem validade técnica de 365 dias, renovada nos acessos; não representa o prazo de vinculação. A duração real depende das políticas e da conservação dos dados pelo navegador. Limpar esses dados ou usar outro navegador pode liberar uma nova demonstração, limitação já aceita no escopo.

O cadastro de visitante exige origem pública exata. Criar/recuperar a demonstração exige cookie válido, origem e token de proteção do visitante. A vinculação exige sessão Google, cookie de visitante e proteção da sessão da conta. Nenhuma dessas operações aceita jogador, partida, pontuação, dificuldade ou quantidade escolhidos livremente no corpo.

Respostas de visitante e demonstração usam `Cache-Control: no-store` e `Referrer-Policy: no-referrer`. Os segredos não são enviados em JSON nem guardados no armazenamento local da interface.

## Reserva e persistência

O primeiro início reserva três respostas fáceis distintas do catálogo publicado no MongoDB. O sorteio é sobre as respostas elegíveis; as temáticas resultam desse sorteio e podem repetir. Não há promessa de distribuição uniforme entre temáticas nem de usar as cinco temáticas quando alguma ainda não tem conteúdo aprovado. Cada reserva aponta para uma revisão imutável existente, conferida antes da gravação.

O PostgreSQL armazena as referências das rodadas, não as soluções e dicas oficiais. A reserva começa em estado `preparada`, sem marcar palavras como vistas ou publicar pontos. A primeira apresentação efetiva e as ações do jogo pertencem à integração do motor. O resumo desta fase não revela referências de palavras, respostas, dicas ou reservas futuras.

Uma transação bloqueia o visitante antes de criar a partida, as três rodadas e o marcador de uso. Pedidos repetidos recuperam o mesmo registro; pedidos concorrentes não criam partidas adicionais. Falta de conteúdo ou falha no sorteio reverte a reserva sem consumir a oportunidade. Não existe transação distribuída com MongoDB: a consulta de conteúdo não modifica o catálogo.

A migração aditiva `0004_demonstracao_vinculo` acrescenta `visitantes.demonstracao_id`, único e com chave estrangeira para `partidas`. Registros antigos que ainda tenham proprietário visitante recebem a referência correspondente. O novo campo permite recuperar o vínculo após trocar o proprietário da partida. As 19 tabelas existentes são mantidas.

## Transferência sem cópias

O vínculo bloqueia primeiro o titular, depois o visitante e a demonstração. Essa ordem preserva a serialização com a exclusão de conta; os próximos motores devem continuar bloqueando o titular antes das partidas. A restrição de uma individual aberta permanece ativa no banco.

A operação troca `partidas.visitante_id` por `partidas.jogador_id` e registra a conta e o instante no visitante. Identificador da partida, rodadas, exposições, ações, versão e pontos são preservados. Não recalcula nem copia resultados. Os resultados individuais já publicados continuam ligados ao mesmo identificador e passam a ser atribuíveis à conta; partidas em andamento não ganham publicação artificial. As telas e consultas finais de histórico, estatísticas e ranking serão implementadas em suas fases próprias.

O frontend confere a demonstração ao carregar a conta e solicita o vínculo quando há um registro pendente. Falhas e conflitos são informados sem impedir o uso do perfil; não há repetição automática indefinida. Uma nova tentativa depende da ação explícita da pessoa. A conclusão/abandono da demonstração em conflito será conectada ao fluxo jogável na fase 26.

O vencimento do prazo impede a transferência, mas não apaga silenciosamente o registro nem libera outro teste. Uma rotina operacional de retenção/limpeza não foi criada nesta fase; precisa preservar o marcador de utilização quando for definida na publicação.

## API disponível

| Operação | Efeito |
| --- | --- |
| POST `/api/visitantes` | Recupera/cria a identificação e renova o cookie; retorna uso, disponibilidade, vínculo, resumo pendente e token de proteção do visitante |
| POST `/api/demonstracoes` | Reserva a única demonstração ou devolve a mesma já iniciada; contas autenticadas não podem consumir um teste novo |
| GET `/api/demonstracoes/atual` | Recupera o resumo da demonstração ainda pertencente ao visitante; após vincular, o acesso segue pelas futuras rotas autenticadas de partidas |
| POST `/api/demonstracoes/vinculo` | Transfere a demonstração do cookie para a conta da sessão, preservando todo o registro |

As operações POST aceitam corpo vazio ou `{}`; campos extras são recusados. Resumo: `partida_id`, `estado`, `pontuacao`, `versao`, `quantidade_palavras: 3`, `dificuldade: "facil"`, `vinculo_expira_em`. O cadastro de visitante retorna ainda `demonstracao_utilizada`, `pode_iniciar`, `vinculada`, `demonstracao` (resumo ou null) e `token_csrf`. Vínculo confirmado retorna `partida_id` e `vinculada: true`.

Erros principais: 401 `VISITANTE_NECESSARIO`; 403 `ACAO_NAO_PERMITIDA`, `ENTRADA_JA_REALIZADA` e `DEMONSTRACAO_VINCULADA`; 404 `DEMONSTRACAO_AUSENTE`; 409 `DEMONSTRACAO_UTILIZADA`, `DEMONSTRACAO_JA_VINCULADA`, `PRAZO_VINCULO_ENCERRADO`, `INDIVIDUAL_EM_ABERTO` e `CONTEUDO_INSUFICIENTE`; 503 `CATALOGO_INDISPONIVEL`/`DADOS_INDISPONIVEIS`. Mantidos os erros da autenticação para sessões inválidas.

## TDD, arquitetura e verificação

Os testes foram escritos antes das rotas e falharam inicialmente em 404; os testes do cliente falharam antes de implementar as chamadas; o teste do navegador demonstrou a ausência do estado de visitante. Depois da implementação, os cenários passaram e a refatoração removeu o acesso direto ao repositório nas rotas. A separação utiliza contratos pequenos para persistência/sorteio, serviço de casos de uso, adaptadores PostgreSQL/MongoDB e apresentação React independente do motor de pontuação.

Verificações locais desta fase:

- **132 testes backend aprovados**, incluindo oito cenários novos com PostgreSQL descartável e um sorteio real em MongoDB isolado. Esquema comparado com os modelos sem diferenças.
- **30 testes unitários frontend e 39 fluxos de navegador aprovados**, em computador, tablet e celular.
- Cobertura de recarga, repetição, prazo, sessão nova/conta existente, conflito, resultados controlados, concorrência, falta de conteúdo, privacidade e bloqueio após exclusão da conta.
- Compilação, Ruff e formatação aprovados. Migração aplicada ao desenvolvimento e conferida por Alembic; não foram utilizados palpites reais nem excluída a conta pessoal.
- Capturas dos três tamanhos de tela para revisão visual. Navegador usa fronteiras controladas da API; a persistência real e o sorteio têm verificações separadas. Não houve teste em aparelhos físicos ou nova autenticação real no Google nesta fase.

Permanece o aviso conhecido de compatibilidade HTTPX/Authlib. A aprovação local não equivale a execução da integração contínua remota. A demonstração completa ainda exige o teste jogável real da fase 26, incluindo retorno do Google e comportamento de interrupções durante a partida.
