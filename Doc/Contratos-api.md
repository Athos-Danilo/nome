# Contratos da API — fase 10

**Estado:** contratos iniciais documentados na fase 10; apenas `/api/saude` está implementado. A lista abaixo não declara rotas de negócio disponíveis. Detalhes dependentes de decisões abertas estão sinalizados.

## Convenções

JSON próprio com campos em `snake_case`, mensagens em português e instantes ISO 8601 UTC. Identificadores UUID, exceto identificadores estáveis do catálogo e dos avatares. A API nunca aceita pontuação calculada pelo navegador como valor oficial.

Ações autenticadas usarão sessão opaca em cookie HttpOnly; cookie Secure e proteção contra requisições forjadas serão configurados com a hospedagem. Visitantes utilizarão outro identificador opaco, limitado à sua demonstração. Identidade de proprietário vem da sessão, não de um `jogador_id` livre na entrada.

Cada mutação de partida inclui `id_acao` e `versao_esperada`. Resposta confirmada contém a nova versão da partida. Listagens privadas são paginadas; limites e campos de filtros serão consolidados na implementação correspondente. Não expor respostas futuras, histórico alheio ou campos internos do Google.

## Operações previstas

| Método e caminho | Acesso | Entrada / efeito esperado |
| --- | --- | --- |
| GET `/api/saude` | Público | Disponibilidade do processo HTTP, sem credenciais ou dados dos bancos. Implementado. |
| GET `/api/autenticacao/google` | Público | Inicia fluxo OIDC no servidor, com proteção de estado. |
| GET `/api/autenticacao/google/retorno` | Retorno do provedor | Valida código, estado e identidade; cria/recupera conta e sessão. |
| POST `/api/autenticacao/sair` | Conta | Revoga sessão e remove cookie. |
| GET `/api/perfil` | Conta | Perfil privado e indicação de primeiro acesso incompleto. |
| PATCH `/api/perfil` | Conta | Nome de 3–20 letras, números ou sublinhado, sem espaços; unicidade ignora caixa e acentos. Avatar oficial; e-mail e identidade Google não são editáveis. |
| DELETE `/api/perfil` | Conta | Exige `confirmacao: "EXCLUIR"`; remove identidade e acessos, anonimiza resultados e nomes da galera, conserva pontos como Jogador excluído. Retorno 204 e remoção do cookie. |
| GET `/api/avatares` | Público | Coleção oficial com identificadores e recursos, sem uploads. |
| GET `/api/preferencias` | Conta | Preferências privadas. Visitante usa configuração local. |
| PUT `/api/preferencias` | Conta | Tema, música, volumes, silêncio e movimentos reduzidos validados. |
| GET `/api/catalogo/tematicas` | Público | Identificadores e nomes das temáticas, sem soluções. |
| POST `/api/visitantes` | Público | Recupera/cria identificação opaca do navegador, sem identificação civil. |
| POST `/api/demonstracoes` | Visitante | Inicia a única demonstração: três respostas fáceis, temas aleatórios. |
| POST `/api/demonstracoes/vinculo` | Conta + visitante | Transfere registro completo uma única vez; prazo e conflito com partida salva pendentes. |
| POST `/api/partidas/individual/configuracao` | Conta | Valida quantidade, temas, dificuldades e ordem; informa falta de conteúdo sem iniciar silenciosamente. |
| POST `/api/partidas/individual` | Conta | Cria partida com configuração confirmada e conteúdo reservado, sem duplicar individual ativa. |
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

Uma resposta de palpite errado válido é retorno normal do jogo, não falha HTTP. A API informa erro/acerto, posições novas quando permitido, pontos da ação, próxima dica/vez e versão. Os detalhes restantes da demonstração serão decididos antes de sua implementação.

## Identidade, exclusão e conteúdo visto

Primeiro acesso e edição aceitam `nome_usuario` e `avatar_id`; a normalização NFC preserva a exibição, enquanto a chave de unicidade remove acentos e ignora caixa. A mesma validação se aplica aos nomes locais da galera, com unicidade restrita à partida. Não utilizar essa comparação para palpites completos.

A tela apresenta os efeitos antes de enviar DELETE com `{"confirmacao":"EXCLUIR"}`. Confirmação ausente/incorreta retorna 422, código `CONFIRMACAO_INVALIDA`, sem alterar dados; usuário não autenticado recebe 401. A exclusão é autorizada exclusivamente pela sessão atual e aplicada em transação. Após sucesso, o antigo cookie deixa de autorizar acesso. Cancelar a tela não envia a operação. Uma repetição sem sessão válida recebe 401, sem executar outra exclusão.

Resultados anônimos permanecem agregados por identidade interna antiga e exibem **Jogador excluído**, nunca e-mail, nome antigo ou identificador Google. Novo acesso com o mesmo Google cria outra identidade, sem restaurar resultados, vínculo da demonstração ou palavras vistas. Detalhes da limpeza estão na modelagem; a implementação ocorre na fase 17.

Exposições dos dois modos pertencem ao proprietário da partida. A apresentação de um painel da galera registra todas as respostas exibidas para o anfitrião; não há endpoints de histórico permanente para convidados. Reservas futuras não entram nessa lista.
