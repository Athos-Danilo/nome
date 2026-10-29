# Contratos da API — fase 10

**Fase 20:** implementados POST `/api/partidas/individual/configuracao`, POST `/api/partidas/individual`, GET `/api/partidas/em-aberto` (individual), GET `/api/partidas/{partida_id}` (individual), POST `/{partida_id}/palpites`, `/dicas`, `/desistencia-palavra` e `/encerramento`, todos sob `/api/partidas`. Criação recebe `plano_id`, com seleção confirmada no servidor. Campos, respostas, idempotência e limites em [Motor individual](Motor-individual.md). Rotas da galera e pausa/retomada continuam previstas.

**Fase 19:** POST `/api/visitantes`, POST `/api/demonstracoes`, GET `/api/demonstracoes/atual` e POST `/api/demonstracoes/vinculo` implementados. Contratos, campos, prazo de sete dias, cookie e erros em [Visitante e demonstração](Demonstracao-visitante.md). As rotas de palpites e a demonstração jogável continuam nas fases próprias.

**Atualização da fase 17:** GET/PATCH/DELETE `/api/perfil`, GET `/api/avatares`, GET/PUT `/api/preferencias` e recursos SVG estão implementados. Acesso privado inclui cadastro pendente. Consulte [Perfil e preferências](Perfil-preferencias.md). O estado abaixo registra os contratos iniciais; as rotas de partidas continuam previstas.

**Estado:** contratos iniciais documentados na fase 10; `/api/saude` e as quatro rotas de autenticação indicadas abaixo estão implementados. Configuração local e login Google real confirmados na fase 15. Além das operações implementadas na fase 17, as rotas restantes permanecem previstas, sem declarar operações do jogo disponíveis. Detalhes dependentes de decisões abertas estão sinalizados.

## Convenções

JSON próprio com campos em `snake_case`, mensagens em português e instantes ISO 8601 UTC. Identificadores UUID, exceto identificadores estáveis do catálogo e dos avatares. A API nunca aceita pontuação calculada pelo navegador como valor oficial.

Ações autenticadas usarão sessão opaca em cookie HttpOnly; cookie Secure e proteção contra requisições forjadas serão configurados com a hospedagem. Visitantes utilizarão outro identificador opaco, limitado à sua demonstração. Identidade de proprietário vem da sessão, não de um `jogador_id` livre na entrada.

Cada mutação de partida inclui `id_acao` e `versao_esperada`. Resposta confirmada contém a nova versão da partida. Listagens privadas são paginadas; limites e campos de filtros serão consolidados na implementação correspondente. Não expor respostas futuras, histórico alheio ou campos internos do Google.

## Operações previstas

| Método e caminho | Acesso | Entrada / efeito esperado |
| --- | --- | --- |
| GET `/api/saude` | Público | Disponibilidade do processo HTTP, sem credenciais ou dados dos bancos. Implementado. |
| GET `/api/autenticacao/google` | Público | Implementado: inicia OIDC com estado, nonce, PKCE e vínculo de navegador; retorna 303 ao Google. |
| GET `/api/autenticacao/google/retorno` | Retorno do provedor | Implementado: consome tentativa única, valida identidade, cria/recupera conta e sessão; retorna 303 à raiz configurada com `?autenticacao=concluida`. |
| GET `/api/autenticacao/sessao` | Conta ou cadastro pendente | Implementado: retorna somente a conta da própria sessão e o token de proteção das mutações. |
| POST `/api/autenticacao/sair` | Conta ou cadastro pendente | Implementado: exige origem e token de proteção, revoga sessão e remove cookie; retorna 204. |
| GET `/api/perfil` | Conta | Perfil privado e indicação de primeiro acesso incompleto. |
| PATCH `/api/perfil` | Conta | Nome de 3–20 letras, números ou sublinhado, sem espaços; unicidade ignora caixa e acentos. Avatar oficial; e-mail e identidade Google não são editáveis. |
| DELETE `/api/perfil` | Conta | Exige `confirmacao: "EXCLUIR"`; remove identidade e acessos, anonimiza resultados e nomes da galera, conserva pontos como Jogador excluído. Retorno 204 e remoção do cookie. |
| GET `/api/avatares` | Público | Coleção oficial com identificadores e recursos, sem uploads. |
| GET `/api/preferencias` | Conta | Preferências privadas. Visitante usa configuração local. |
| PUT `/api/preferencias` | Conta | Tema, música, volumes, silêncio e movimentos reduzidos validados. |
| GET `/api/catalogo/tematicas` | Público | Identificadores e nomes das temáticas, sem soluções. |
| POST `/api/visitantes` | Público | Recupera/cria identificação opaca do navegador, sem identificação civil. |
| POST `/api/demonstracoes` | Visitante | Inicia a única demonstração: três respostas fáceis, temas aleatórios. |
| POST `/api/demonstracoes/vinculo` | Conta + visitante | Implementado: transfere o mesmo registro em até sete dias; mantém individual já aberta e exige encerrar a demonstração ativa antes do vínculo em caso de conflito. |
| POST `/api/partidas/individual/configuracao` | Conta | Valida quantidade, temas, dificuldades e ordem; informa falta de conteúdo sem iniciar silenciosamente. |
| POST `/api/partidas/individual` | Conta | Implementado: recebe apenas `plano_id` da própria conta; inicia a seleção confirmada sem duplicar individual ativa. |
| POST `/api/partidas/galera/configuracao` | Conta | Valida participantes, dificuldade e temáticas de cada sessão. |
| POST `/api/partidas/galera` | Conta | Cria partida e sessão inicial com sorteio de ordem. |
| GET `/api/partidas/em-aberto` | Conta | Resumo da individual salva e estado da galera ativa pertinente, sem descartar a individual. |
| GET `/api/partidas/{partida_id}` | Proprietário | Estado público permitido, progresso e versão; não entrega reserva futura. |
| POST `/api/partidas/{partida_id}/palpites` | Proprietário | Palavra completa e rodada selecionada; somente individual ou ação de palavra da galera. |
| POST `/api/partidas/{partida_id}/letras` | Anfitrião da galera | Uma letra para o painel, com família de vogais e C/Ç distintos; participante efetivo determinado pelo turno. |
| POST `/api/partidas/{partida_id}/dicas` | Proprietário individual | Avança uma dica se houver próxima; retorno atualiza faixa de pontos. |
| POST `/api/partidas/{partida_id}/desistencia-palavra` | Proprietário individual | Revela a palavra atual, zero pontos e avança conforme estado. |
| POST `/api/partidas/{partida_id}/pausa` | Conta individual | Confirma pausa e -100; não se aplica à galera. |
| POST `/api/partidas/{partida_id}/retomada` | Conta individual | Recupera dica e estado; aviso de interrupção é informativo e não duplica penalidade. |
| POST `/api/partidas/{partida_id}/encerramento` | Proprietário | Abandono individual sem desconto extra ou desistência da galera com resultado e revelação somente da sessão atual. |
| POST `/api/partidas/{partida_id}/desempate` | Anfitrião da galera | Aceita empate ou confirma concordância de todos os líderes para uma única sessão extra. Detalhes da configuração pendentes. |
| GET `/api/historico` | Conta | Resumos privados dos dois modos, sem tela detalhada por rodada nesta entrega. |
| GET `/api/estatisticas` | Conta | Indicadores privados; fórmulas detalhadas serão fechadas na fase 34. |
| GET `/api/rankings/{categoria}` | Público | `palavras-acertadas`, `partidas-concluidas` ou `pontos`; apenas nome e indicadores públicos aprovados. |

O visitante só pode operar a própria demonstração nas rotas de jogo pertinentes; criar partida normal, galera, perfil ou preferências de conta exige autenticação Google. Convidados locais não possuem credenciais para chamar a API separadamente.

## Perfil e preferências implementados na fase 17

`GET /api/perfil` e `PATCH /api/perfil` retornam `jogador_id`, `email`, `estado`, `nome_usuario` e `avatar_id`. A alteração aceita somente `nome_usuario` e `avatar_id`, obrigatórios; salvar dados válidos conclui o cadastro pendente. E-mail e identidade Google não são editáveis. `GET /api/avatares` retorna uma lista de 20 objetos com `id`, `nome` e `recurso`; os recursos atuais são arquivos do frontend em `/avatares/{id}.webp`. Os endereços SVG anteriores continuam disponíveis por compatibilidade, mas não são retornados na coleção atual.

`GET /api/preferencias` retorna `tema`, `musica_id`, `volume_musica`, `volume_interface`, `volume_eventos`, `silenciado`, `movimentos_reduzidos` e `salvas`. A consulta sem registro retorna padrões e `salvas: false`, sem inserir uma linha. `PUT` aceita os sete campos de configuração e, opcionalmente, `somente_se_ausentes` (padrão falso). Com essa opção verdadeira, um registro já existente prevalece e é retornado sem alteração; assim, a conta nova herda o navegador sem sobrescrever preferências de outra sessão. `salvas` é exclusivo da resposta.

Temas permitidos: `claro` e `escuro`. Volumes são inteiros entre 0 e 100; opções de silêncio e movimentos são booleanas. Música aceita `null` ou os identificadores reservados `lofi_01`, `lofi_02`, `lofi_03`, `arcade_01`, `arcade_02`; esses identificadores ainda não representam arquivos de áudio entregues. Entradas extras ou tipos inválidos retornam 422 `DADOS_INVALIDOS`; avatar não oficial retorna 422 `AVATAR_INVALIDO`; nome em uso retorna 409 `NOME_INDISPONIVEL`. A exclusão exige corpo `{"confirmacao":"EXCLUIR"}` e confirmação inválida retorna 422 `CONFIRMACAO_INVALIDA`.

As rotas privadas aceitam sessão de cadastro pendente ou ativo e usam `Cache-Control: no-store`. Mutações exigem origem e token de proteção válidos; o titular vem da sessão. Exclusão retorna 204 após a transação, revoga sessões e remove o cookie. Não publica resultados artificiais de partidas ativas. A apresentação dos resultados anônimos no ranking será implementada junto ao ranking. Consulte [efeitos e verificações](Perfil-preferencias.md).

## Formato de ação de jogo

```json
{
  "id_acao": "8d460a49-4b0c-47cd-9250-fc9ef412e841",
  "versao_esperada": 3,
  "rodada_id": "2873abb8-8bfb-4169-b5f8-5bbe3c5b92a1",
  "palpite": "GIRAFA"
}
```

`rodada_id` deve pertencer à partida e ser alvo permitido. Na letra global da galera, enviar `letra`, sem selecionar uma resposta para limitar a revelação. Campos de participante, pontos, soluções ou dificuldade real não são aceitos como autoridade do cliente.

## Estado público permitido

- **Individual:** dica atual e anteriores já reveladas, quantidade de posições, separadores visíveis, progresso, pontos confirmados, faixa atual e ações permitidas. Após encerramento da rodada, pode incluir solução revelada.
- **Galera:** temática atual, participantes locais, ordem da sessão, vez, palavras mascaradas com posições públicas, letras tentadas/bloqueadas e pontos confirmados. Não entregar dicas textuais ou temas futuros sorteados.
- **Antes da apresentação:** não retornar conteúdo reservado, identificadores de respostas ou versões que permitam consultar soluções por outra rota. O catálogo completo não é um endpoint público.
- **Bloqueio do teclado individual:** o backend precisará fornecer apenas o retorno necessário para a regra aprovada de limite de letras. O limite por letra existente já fornece uma pista intencional do jogo; não enviar um mapa completo da palavra antecipadamente. Avaliar exposição na implementação da fase 24.
- **Resultados:** resumo público para o proprietário; galera pode revelar palavras da sessão inacabada quando houver desistência, nunca das sessões futuras não apresentadas.

## Erros propostos

Formato final será aplicado junto aos módulos, sem substituir silenciosamente o comportamento do endpoint de saúde já existente:

```json
{
  "erro": {
    "codigo": "VERSAO_DESATUALIZADA",
    "mensagem": "A partida foi atualizada. Recarregue o estado antes de tentar novamente."
  }
}
```

| HTTP | Códigos e efeito |
| --- | --- |
| 401 | `SESSAO_NECESSARIA`, `SESSAO_EXPIRADA`: recuperar autenticação. |
| 403 | `ACAO_NAO_PERMITIDA`: operação incompatível com o perfil de acesso. |
| 404 | `PARTIDA_NAO_ENCONTRADA`: também usado para partida privada alheia. |
| 409 | `VERSAO_DESATUALIZADA`, `ACAO_REUTILIZADA`, `PARTIDA_INDIVIDUAL_EM_ABERTO`, `DEMONSTRACAO_UTILIZADA`, `NOME_INDISPONIVEL`. |
| 422 | `CONFIGURACAO_INVALIDA`, `PALPITE_INCOMPLETO`, `LETRA_BLOQUEADA`, `ESTADO_INCOMPATIVEL`; não gerar pontos, penalidade ou perda de turno por letra bloqueada. |
| 503 | `CONTEUDO_INDISPONIVEL`: não conceder pontos ou penalizar falha de infraestrutura. |

Uma resposta de palpite errado válido é retorno normal do jogo, não falha HTTP. A API informa erro/acerto, posições novas quando permitido, pontos da ação, próxima dica/vez e versão. Prazo e conflito da demonstração foram definidos na fase 19; o fluxo jogável completo será integrado na fase 26.

## Identidade, exclusão e conteúdo visto

### Sessão implementada na fase 15

`GET /api/autenticacao/sessao` devolve `jogador_id`, `email`, `estado`, `nome_usuario`, `avatar_id`, `expira_em` e `token_csrf`. Nome/avatar podem ser nulos no cadastro pendente. Não recebe identificador de conta para escolher o proprietário, nem expõe sujeito Google, tokens Google, resumo ou segredo de sessão. As respostas da autenticação usam `Cache-Control: no-store` e `Referrer-Policy: no-referrer`.

Cookies sem Domain e com Path `/`, HttpOnly e SameSite=Lax. Na origem HTTPS são Secure e usam nomes `__Host-decifra_sessao` e `__Host-decifra_login`; localmente usam `decifra_sessao` e `decifra_login`. Login temporário válido por dez minutos; sessão padrão válida por sete dias. Estado, nonce, PKCE e segredo de navegador são distintos. Retorno sem vínculo, duplicado, expirado ou com parâmetros conflitantes não autentica. Uma nova entrada bem-sucedida substitui a sessão anterior desse navegador; não encerra automaticamente outros dispositivos.

Mutações protegidas devem utilizar a dependência `exigir_conta` (ou `exigir_conta_ativa` para recursos de jogador com perfil concluído), enviar `Origin` exatamente igual a `DECIFRA_ORIGEM_PUBLICA` e o cabeçalho `X-Decifra-CSRF` obtido da consulta privada da sessão. O token é derivado do segredo aleatório e comparado de forma constante. Cadastro pendente pode consultar a sessão e sair, mas não libera operações do jogo. A autorização de cada recurso futuro ainda deve conferir seu proprietário; não basta apenas anexar a dependência de login.

Erros implementados: 400 `RETORNO_INVALIDO`, `LOGIN_CANCELADO` e `IDENTIDADE_INVALIDA`; 401 `SESSAO_NECESSARIA`/`SESSAO_EXPIRADA`; 403 `ACAO_NAO_PERMITIDA`/`PERFIL_INCOMPLETO`; 409 `EMAIL_INDISPONIVEL`; 503 `AUTENTICACAO_INDISPONIVEL`, `PROVEDOR_INDISPONIVEL` e `DADOS_INDISPONIVEIS`. Mensagens externas do provedor e detalhes SQL não são devolvidos. O retorno OAuth cria a sessão; desde a fase 19, a interface solicita a vinculação pela rota própria após carregar a conta. Concluir o perfil continua sendo uma operação separada.

Primeiro acesso e edição aceitam `nome_usuario` e `avatar_id`; a normalização NFC preserva a exibição, enquanto a chave de unicidade remove acentos e ignora caixa. A mesma validação se aplica aos nomes locais da galera, com unicidade restrita à partida. Não utilizar essa comparação para palpites completos.

A tela apresenta os efeitos antes de enviar DELETE com `{"confirmacao":"EXCLUIR"}`. Confirmação ausente/incorreta retorna 422, código `CONFIRMACAO_INVALIDA`, sem alterar dados; usuário não autenticado recebe 401. A exclusão é autorizada exclusivamente pela sessão atual e aplicada em transação. Após sucesso, o antigo cookie deixa de autorizar acesso. Cancelar a tela não envia a operação. Uma repetição sem sessão válida recebe 401, sem executar outra exclusão.

Resultados anônimos permanecem agregados por identidade interna antiga e exibem **Jogador excluído**, nunca e-mail, nome antigo ou identificador Google. Novo acesso com o mesmo Google cria outra identidade, sem restaurar resultados, vínculo da demonstração ou palavras vistas. Detalhes da limpeza estão na modelagem; a implementação ocorre na fase 17.

Exposições dos dois modos pertencem ao proprietário da partida. A apresentação de um painel da galera registra todas as respostas exibidas para o anfitrião; não há endpoints de histórico permanente para convidados. Reservas futuras não entram nessa lista.

## Interrupções — decisão da fase 13

Identidade de aba/documento, navegação e sinais de atividade deverão ser reconciliados no servidor, com sessão autenticada e estado persistido. Recarga reconhecida não desconta nem encerra; ausência ou retorno ambíguo preserva a individual sem desconto e o painel da galera. Navegação para outra página, inclusive saída seguida de Voltar/Avançar, conta como pausa de −100 no individual e encerramento na galera, uma vez por ocorrência. Troca de aba isolada não é pausa. Falha de hospedagem não é saída confirmada.

As operações persistidas do individual e da demonstração foram integradas na fase 28; as da galera permanecem na fase 33. As rotas `/prova-api` da demonstração técnica são isoladas, locais e sem autenticação de conta; não fazem parte deste contrato público nem substituem controles de acesso. Método, evidências e limites em [Prova-interrupcoes.md](Prova-interrupcoes.md).


## Continuidade individual — fase 28

Todas as operações abaixo são POST. Para a conta: `/api/partidas/{partida_id}`; para a demonstração: `/api/demonstracoes/jogo`. São mantidas a autorização do proprietário/visitante e a proteção de origem e CSRF.

| Sufixo | Entrada | Efeito |
| --- | --- | --- |
| `/pausa` | `id_acao`, `versao_esperada` | Pausa confirmada, menos 100 pontos |
| `/saida` | Mesmos campos | Saída confirmada com a mesma regra de pausa |
| `/retomada` | Mesmos campos | Retoma sem novo desconto |
| `/rascunho` | `versao_esperada`, `rodada_id`, `revisao_esperada`, `letras`, `selecionada` | Persiste montagem validada com revisão própria |
| `/conexoes` | `aba_id`, `documento_id`, `navegacao` | Reconcilia recarga, histórico e retorno ambíguo |
| `/sinais` | `aba_id`, `documento_id`, `evento_id`, `versao_esperada`, `tipo`, `persistido` | Registra evidências; ausência não cobra penalidade |

As respostas devolvem o estado público da partida, agora com `quantidade_pausas` e `rodada_atual.rascunho` (nulo ou objeto com `letras`, `selecionada`, `revisao`). Não revelam respostas ou dicas futuras. Salvar rascunho não incrementa a versão oficial da partida. Conflitos retornam 409 (`RASCUNHO_DESATUALIZADO`, `VERSAO_DESATUALIZADA` ou `RODADA_INVALIDA`); montagem inválida retorna 422 `RASCUNHO_INVALIDO`. Campos adicionais são recusados. Reenvios da mesma ação preservam a resposta original. Detalhes em [Pausa e retomada](Pausa-retomada-individual.md).
