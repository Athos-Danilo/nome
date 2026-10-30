# Cronômetro informativo — complemento à primeira entrega

**Decisões aprovadas em 2026-10-29:** medir apenas o tempo de jogo; apresentar tempo por palavra e total; não impor prazo nem alterar pontuação ou rankings. Individual e demonstração serão implementados primeiro. O formato da galera será decidido pelo responsável antes de preparar esse modo.

**Situação:** implementação do individual e da demonstração concluída no código; verificações e revisão visual por IA concluídas conforme registros abaixo; a avaliação estética do responsável pode ocorrer na interface atualizada. A galera terá medição por sessão e total, aprovada na fase 29; implementação na fase 33. Este complemento não reabre nem renumera as fases concluídas.

## 1. Finalidade e alcance

O cronômetro ajuda o jogador a conhecer seu próprio ritmo. É crescente, sem contagem regressiva, limite, derrota automática, bônus, penalidade, desempate ou ranking de velocidade. A regra existente de jogo sem limite de tempo permanece válida.

O individual autenticado e a demonstração terão o mesmo comportamento. Vincular a demonstração à conta preservará integralmente os tempos confirmados, assim como o restante do progresso. A limitação de uma demonstração por navegador permanece.

## 2. Ciclo de cada palavra

1. Começar em zero quando a nova palavra estiver apresentada e disponível para jogar, com a primeira dica e os controles prontos. Preparação, carregamento e apresentação da palavra anterior não contam.
2. Continuar durante a leitura da dica, edição das letras, consulta de dicas anteriores, erros e pedidos de novas dicas. Nenhuma dessas ações zera o tempo.
3. Ao confirmar um acerto ou a desistência da palavra, encerrar o intervalo dessa rodada e guardar sua duração. Falha ou reenvio da mesma ação não encerra nem soma a rodada duas vezes.
4. Manter o tempo final durante o retorno de acerto/desistência. A próxima palavra inicia sua própria contagem em zero quando estiver disponível; animações e espera entre palavras não entram no tempo de nenhuma delas.
5. Retomar uma palavra interrompida a partir do tempo acumulado, nunca de zero.

O tempo de uma palavra desistida representa o período de tentativa, não um acerto. No abandono definitivo, conservar o tempo já jogado na palavra atual e identificá-la como interrompida; palavras futuras não vistas não terão tempo atribuído nem respostas reveladas.

## 3. Tempo de jogo, pausa e ausência

| Situação | Contagem |
| --- | --- |
| Painel visível e disponível para jogar | Continua |
| Erro, nova dica ou consulta de dicas anteriores | Continua na mesma palavra |
| Diálogo de confirmação ainda não confirmado | Não equivale a pausa; a contagem continua enquanto o painel estiver ativo |
| Pausa confirmada | Para; retomar continua do acumulado |
| Página oculta, aba trocada ou janela minimizada | Para; voltar ao painel disponível retoma sem zerar |
| Página fechada, menu, login Google ou outra rota | Não acumula ausência |
| Atualização da página | Preserva o acumulado; carregamento não conta e não há nova penalidade |
| Falta de conexão reconhecida ou jogo aguardando recuperação | Suspende até o painel poder jogar novamente |
| Resultado, transição ou partida encerrada | Para |

Pausar a medição por visibilidade ou conectividade não muda o estado da partida e não cria desconto de pontos. A penalidade de −100 permanece exclusiva das pausas/saídas previstas nas regras existentes.

Não estimar tempo de jogo subtraindo apenas início e fim da partida: isso incluiria dias de ausência. Eventos de fechamento e suspensão podem não ser entregues; conservar o último tempo confirmado sem inventar tempo para o intervalo desconhecido. A implementação deverá documentar a precisão prática, a frequência de confirmação e a perda máxima observável em encerramentos abruptos. Não prometer precisão perfeita nesses casos.

## 4. Resultado e privacidade

Na tela final, apresentar um bloco de tempo total e uma lista das palavras efetivamente apresentadas, com ordem, resposta que já possa ser revelada, situação (acertada, desistida ou interrompida) e tempo de jogo. A soma das durações dessas palavras forma o total; pausas, ausências e transições ficam de fora. Em partida abandonada, rotular o total como tempo jogado até o encerramento.

Exemplo: uma palavra com 35 segundos e outra com 50 segundos resultam em 1 minuto e 25 segundos de jogo, mesmo que tenha existido uma pausa de uma hora entre elas.

Persistir os tempos para recuperar o resultado e continuar partidas. Isso não amplia o escopo aprovado de uma página histórica detalhada de todas as rodadas: essa consulta continua prevista para versão futura. Tempos são privados; não acrescentar tempo às classificações públicas. Para partidas antigas sem medição confiável, mostrar “Tempo não registrado”, sem inventar zero ou reconstruir duração a partir de datas antigas. Totais parciais devem ser identificados como incompletos.

## 5. Direção visual

Criar um mostrador com aparência de instrumento de jogo: números estáveis, destaque colorido, detalhes gráficos e movimento discreto, com leitura imediata. Pode usar aro ou traços animados como decoração; nenhum preenchimento deve sugerir prazo para responder. Manter a paleta oliva/bege/lima e os temas aprovados, com variações de peso e tamanho das fontes.

Exibir minutos e segundos; para durações longas, incluir horas sem dar a volta ao contador. Indicar claramente quando a medição estiver suspensa. Não usar flashes, alarme de urgência ou som a cada segundo. Respeitar movimento reduzido, som desligado, contraste e os tamanhos de computador, tablet e celular. Não anunciar cada segundo a leitores de tela; oferecer uma identificação acessível estável e informação de estado.

A proposta visual será apresentada ao responsável durante a implementação, para revisão antes de considerar o acabamento aprovado.

## 6. Orientação técnica para a implementação

- PostgreSQL manterá duração acumulada por rodada e os dados necessários à confirmação de intervalos ativos. MongoDB permanece exclusivamente com catálogo e dicas.
- Guardar durações em unidade inteira de precisão definida, preferencialmente milissegundos; formatar para segundos na apresentação, sem arredondar cada atualização e acumular erro.
- Separar cálculo de tempo, persistência/sincronização e apresentação animada. Usar relógio monotônico para intervalos locais; relógio visual não concede pontos nem substitui o estado confirmado.
- Não contar ticks de setInterval como fonte de duração. Reconciliar intervalos e recuperações com o servidor, sem uma requisição por segundo.
- Uma partida aberta em duas abas não pode somar duas vezes o mesmo período. Identificar a origem e impedir reaplicação de confirmações, gravações atrasadas ou ações repetidas. A regra de agregação deve medir uma única linha de tempo ativa da partida.
- Preservar autorização, origem, CSRF, controle de versão, retomada, rascunho, publicação única e anonimização já existentes. O tempo informado pelo cliente não será usado para pontos ou rankings.
- Fazer migração aditiva e compatível com registros antigos; nunca editar migrações publicadas ou preencher tempos fictícios.
- Contratos implementados e descritos na seção 9. O relógio é informativo e não altera a versão de pontuação da partida.

## 7. TDD e critérios de aceitação

Começar por testes falhando pelo comportamento ausente. Cobrir relógio controlado, nova palavra, erros/dicas sem reinício, pausa/retomada, ocultação, recarga, ausência, reconexão, duas abas, reenvios e chegada tardia de dados. Verificar resultados com acertos, desistência e abandono, demonstração vinculada, partidas antigas sem tempo e total igual à soma sem períodos inativos.

Verificar persistência em banco isolado, contratos e integração com o motor existente. Testar a interface nos três tamanhos e nos dois temas, incluindo movimento reduzido. Confirmar que pontos, penalidades e rankings anteriores permanecem iguais. Uma prova integrada deve comparar durações na tela, API e banco com tolerância documentada.

## 8. Decisão da galera — fase 29

Em 2026-10-30, o responsável escolheu medição informativa por sessão e total da partida, somente tempo ativo. Não haverá tempo atribuído a palavra, turno ou participante; pontos e desempate permanecem independentes. A integração da medição ocorrerá com o painel na fase 33, conforme [Configuração da galera](Configuracao-galera.md).


## 9. Implementação e precisão prática

Migração aditiva **0007**, posterior à 0006: coluna anulável `rodadas.intervalos_tempo` em JSONB, sem criar tabelas ou preencher dados antigos. Guarda intervalos de milissegundos alinhados ao relógio do servidor. O backend ordena e une intervalos sobrepostos/adjacentes sob o bloqueio transacional da partida; reenvios e duas abas não somam duas vezes a sobreposição. Somente a rodada atual de uma partida em andamento pode receber intervalos. Não são expostos os intervalos brutos na API pública.

**GET** `/api/partidas/{partida_id}/tempo` ou `/api/demonstracoes/jogo/tempo`: sincroniza o estado com `relogio_servidor_ms`. Esse instante não é incluído nas consultas normais nem nas respostas idempotentes das ações, preservando sua estabilidade. **POST** nos mesmos caminhos recebe `rodada_id`, `inicio_ms` e `fim_ms`; conserva sessão, propriedade, origem e CSRF. Duração negativa, intervalo maior que 10 segundos, início anterior a 30 segundos ou fim mais de 2 segundos no futuro retornam 422 `TEMPO_INVALIDO`; partida/rodada incompatível retorna 409. Não há alteração de pontos ou versão da partida por confirmação de tempo.

Campos de saída: `rodada_atual.tempo_ativo_ms`, `resumo_rodadas[].tempo_ativo_ms`, `tempo_total_ms` e `tempo_completo`. Duração nula identifica ausência de registro; medição parcial por palavras antigas é explicitamente identificada. O resumo final inclui a palavra apresentada que foi interrompida pelo abandono, sem expor reservas futuras. A demonstração vinculada mantém as mesmas linhas de rodada, incluindo seus tempos.

O frontend sincroniza a origem temporal antes de iniciar a contagem, mede diferenças com performance.now e atualiza a apresentação a cada 100 ms. Confirma intervalos aproximadamente a cada **5 segundos**, antes das ações voluntárias e ao ocultar/sair, com keepalive como tentativa adicional. Requisições simultâneas são serializadas. Durante envio de ação, carregamento e retorno de acerto/desistência, a medição fica suspensa; nova dica e erro retomam o mesmo acumulado.

O valor persistido é o último intervalo confirmado. Em fechamento abrupto sob execução normal e rede saudável, pode faltar aproximadamente o período de confirmação de 5 segundos mais a latência da requisição; isso não é uma garantia absoluta do navegador. Com rede indisponível não existe prazo universal para confirmar. Saltos de execução acima de 10 segundos são descartados como ambíguos, e intervalos locais sem confirmação com mais de 25 segundos não são reconstruídos após a ausência. O relógio não acumula automaticamente o tempo entre duas visitas. A precisão exibida é de segundos e inclui a latência e as limitações dos sinais de visibilidade; não se trata de cronometragem esportiva ou de base para competição.

## 10. Verificações deste complemento

TDD: teste da API inicialmente falhou pela ausência de `tempo_ativo_ms`; teste de navegador falhou pela ausência do mostrador; teste de contrato recusando duração negativa falhou antes da validação correspondente. Cobertura posterior complementou união pura, ausência e formatação, sem alegação de que esses testes adicionais precederam o código.

A suíte backend e a prova opcional integrada com React compilado, HTTP e PostgreSQL descartável passaram com 182 testes. A prova percorre conta e demonstração, pausa/recarga, confirma tempo positivo nas seis rodadas e verifica soma de durações e total exibido. Google e catálogo são controlados nessa prova; não usa a conta pessoal. Frontend: 53 testes unitários, 45 cenários do individual, 24 de menu e 39 de perfil/demonstração aprovados. Tipos, compilação, Prettier e Ruff aprovados. Mostrador revisado por IA em computador, tablet e celular, com estados dos dois temas e movimento reduzido cobertos pelos testes. Migração 0007 aplicada ao banco local e API reiniciada. A avaliação estética do responsável permanece disponível na interface; não se presume aprovação visual por ele. Aparelhos físicos e hospedagem pública permanecem nas fases próprias. A compilação mantém o aviso anterior de pacote JavaScript acima de 500 kB, tratado como pendência da revisão de desempenho.


## Decisões da galera — fase 29, 2026-10-30

O responsável definiu cronômetro informativo **por sessão e total da partida**, contando apenas tempo ativo, sem alterar pontos, turnos ou desempate. Não haverá atribuição de tempo por palavra ou participante. A persistência e a interface da contagem serão integradas ao painel na fase 33.

Se faltar conteúdo, manter dificuldade e temáticas solicitadas e apresentar a insuficiência para ajuste antes de criar a partida. Não reduzir sessões nem substituir temáticas automaticamente. O sorteio aleatório deve considerar configurações viáveis, preservando a sequência oculta e permitindo repetir temáticas, sem repetir palavras na partida.
