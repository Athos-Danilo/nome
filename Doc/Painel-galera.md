# Painel da galera — fase 33

## Entrega e experiência

O modo com a galera está integrado à API e ao PostgreSQL. Uma partida preparada abre o painel pelo botão **Iniciar desafio**. A tela apresenta a ordem oficial da sessão; **Liberar painel** libera os controles. A animação apresenta a ordem salva, sem sortear outra no navegador. Recarregar recupera a mesma sessão, placar, posições e turno.

O placar mostra nomes e avatares dos participantes, pontos e destaque da vez. O painel reúne todas as palavras da sessão; escolher uma letra afeta o painel inteiro. Para um palpite completo, selecionar uma palavra e usar o mesmo editor de clique, toque, teclado, arraste e acentos já existente. Posições reveladas e sinais ficam fixos. Letras bloqueadas não consomem a vez. No modo de letra, há somente o teclado compartilhado, sem uma segunda montagem desnecessária.

Erros de domínio são exibidos sem inventar pontuação no cliente. A interface trava o envio enquanto houver ação em curso. Quando uma resposta de rede é incerta, **Reenviar mesma ação** conserva identificador, versão e conteúdo; não cria outra jogada. Versão desatualizada recupera o painel. Uma falha na conexão inicial permite **Reconciliar painel**, sem abandonar ou zerar a partida.

Após resolver todas as palavras, o servidor avança a sessão, acumula os pontos e grava a nova ordem. O painel apresenta novamente a ordem antes de liberar o teclado. Ao final, mostra placar, vencedor ou empate e tempos por sessão e total. O resultado de um único participante mostra sua pontuação e desempenho, sem propor desempate.

## Empate e sessão extra

As decisões da fase 31 foram integradas: somente líderes empatados podem concordar com a extra; todos precisam aceitar. Quem não está empatado continua no placar, sem votar ou jogar essa sessão. O anfitrião escolhe uma temática ou solicita surpresa; a dificuldade original permanece.

Falta de conteúdo retorna um aviso, preserva os votos e permite outro tema ou **Encerrar empatado**. Não são trocados temas ou níveis automaticamente e não há repetição de respostas dentro da partida. A extra tem novo sorteio e uma palavra por participante habilitado. Persistindo empate, encerra definitivamente; não há segunda extra. Cinco sessões regulares mais essa extra são permitidas.

## Contratos privados

Todos os caminhos abaixo ficam sob `/api/partidas/galera/{partida_id}`. Exigem conta ativa e propriedade; mutações exigem Origin e CSRF do fluxo existente. As entradas recusam campos extras. As respostas privadas não usam cache HTTP.

| Operação | Contrato |
| --- | --- |
| GET `/painel` | Preparação ou estado público atual: participantes, configuração pública, painel, resumo das sessões apresentadas, resultado e tempo total. |
| POST `/acoes` | `id_acao` UUID, `versao_esperada` inteira e `tipo`. Tipos: iniciar, letra, palpite, voto, extra e encerrar. |
| GET `/tempo` | Estado público e `relogio_servidor_ms` para sincronização. |
| POST `/tempo` | `sessao_id`, `inicio_ms` e `fim_ms`, inteiros; confirma somente intervalos da sessão apresentada e ativa. |
| POST `/conexoes` | `tipo` conectar/pagehide/pageshow, `aba_id`, `documento_id`, `versao_esperada`; navegação navigate/reload/back_forward/desconhecida, evento_id e persistido quando aplicáveis. |

Campos por tipo de ação:

- **iniciar / encerrar:** somente o envelope comum.
- **letra:** participante_id e valor.
- **palpite:** participante_id, valor e palavra, índice de zero a dois no painel atual.
- **voto:** participante_id e aceita booleano.
- **extra:** temática opcional; omissão solicita tema aleatório viável. Respostas, pontos e ordem nunca são aceitos do cliente.

O envelope conserva `estado` relacional preparada/em_andamento/concluida/abandonada e a primeira ordem da configuração. `painel.estado` diferencia em_andamento, aguardando_desempate e concluida. O painel inclui sessao_id, número da sessão a partir de um, temática atual, ordem atual, participante atual, máscaras de palavras, bloqueios, líderes, concordantes, indicação de extra e tempo ativo. Não inclui dicas, respostas ocultas, reservas, temas aleatórios futuros ou registros privados das ações.

Os códigos de domínio mantêm letras bloqueadas, palavra resolvida/incompleta, posição fixa, ação fora da vez, versão antiga, reuso de identificador e consenso pendente distinguíveis pelo cliente. Falta de conteúdo na extra usa `CONTEUDO_INSUFICIENTE`; indisponibilidade do catálogo mantém seu erro próprio, sem ser apresentada como estoque esgotado. Outra conta recebe 404; CSRF inválido é recusado antes da ação.

## Persistência e privacidade

Migração aditiva **0010**, posterior à 0009, sem criar tabelas:

- `partidas.progresso_galera` JSONB anulável guarda etapa, ordem, turno, líderes, consentimentos, estado do motor e evidências por aba/documento. Não guarda respostas nem cópia do catálogo.
- `sessoes_galera.intervalos_tempo` JSONB anulável guarda intervalos confirmados de tempo ativo.
- A restrição de famílias de `letras_tentadas` passa a aceitar algarismos de 0 a 9, conforme D08. O downgrade não apaga tentativas numéricas para forçar uma reversão; sua presença pode impedir restaurar a restrição anterior.

As palavras são carregadas pelas referências e revisões imutáveis já reservadas. Posições reveladas, letras tentadas, palpites, ordens, participantes e sessões usam as tabelas existentes. O agregado do motor é reconstruído desses dados; não há variável global mantendo o jogo em memória.

O adaptador bloqueia o anfitrião e a partida em ordem consistente. A versão é validada sob esse bloqueio. Uma transação grava recibo, posições novas, pontos, palpite, turno, ordem e avanço/encerramento. O recibo contém resumo SHA-256 da entrada e resultado público. Reenvio idêntico recupera o recibo; mesmo identificador com outra entrada é conflito. A interface consulta novamente o estado após confirmar para não restaurar uma versão antiga de um recibo. As ações processadas preservam a garantia de reenvio sem serializar a história privada do motor no JSON de progresso.

Uma posição só é pontuada uma vez, inclusive em duas requisições concorrentes. A classificação do palpite no registro de jogadas usa a mesma normalização NFC/caixa alta da comparação; uma grafia Unicode equivalente não fica marcada como parcial quando o motor reconhece acerto.

`exposicoes_conteudo` é registrado quando o painel da sessão é apresentado. Reservas futuras continuam sem exposição ou data de apresentação. Ao resolver, as rodadas recebem estado acertada; ao desistir, pendências da sessão atual recebem desistida, sem pontos extras, e as futuras continuam reservadas. O histórico de conteúdo do anfitrião permanece compartilhado entre modos. Convidados não ganham contas ou histórico permanente.

Resultados da galera ficam em partidas e participantes, com motivo e vencedor/empate. Não são inseridos em `resultados_individuais`, nem aplicam penalidades do individual. A consulta e apresentação do histórico agregado e dos rankings seguem na fase 34.

## Relógio e interrupções

O cronômetro mede **sessão e total**, sem limite, pontuação ou critério de desempate. Reutiliza a lógica de intervalos e medição do individual por um transporte próprio: os identificadores enviados pela galera são de sessão. O cliente arredonda para milissegundos inteiros; o servidor une intervalos sobrepostos sob bloqueio, impedindo soma duplicada em reenvios e abas simultâneas.

Os limites de confirmação são os mesmos documentados em [Cronometro.md](Cronometro.md): janela de 10 segundos por intervalo, início até 30 segundos atrás e fim até 2 segundos no futuro. Há tentativa de confirmação a cada 5 segundos, ao ocultar/sair e antes de ações voluntárias. A contagem suspende em espera de rede/ação, painel oculto, sorteio não liberado e decisão de empate. Atualizar não zera o acumulado; tempo de ausência não é reconstruído.

Desistência ou saída confirmada pelo menu/roteador encerra sem retomada. O aviso mostra os efeitos e permite cancelar. Na saída, vence o maior total ou fica empate definitivo, sem extra; apenas respostas pendentes do painel atual são reveladas. Voltar depois mostra o resultado salvo.

`pagehide` registra apuração, sem presumir que houve fechamento. Reload reconhecido preserva tudo; retorno ambíguo também preserva. Retorno por histórico em outro documento ou pelo cache com evidência de saída encerra a partida. Não há encerramento por ausência de sinais, timeout, troca de aba ou desconexão. Fechamento abrupto pode não ser distinguível de falha: nesse caso, prevalece a decisão conservadora aprovada na fase 13. Não se promete detectar todo fechamento de janela. Keepalive é uma tentativa, não garantia de entrega.

## Arquitetura, TDD e validação

O motor puro da fase 31 continua separado. `painel.py` coordena transações e comandos; `dados_painel.py` reconstrói e projeta o estado; `registro_painel.py` grava transições; `conexao.py` reconcilia navegação. Catálogo continua sendo uma dependência de leitura pelo protocolo existente. No frontend, contrato HTTP, conexão/ações/medição e apresentação ficam em módulos próprios; o editor e o relógio compartilhados preservam os comportamentos do individual.

Os testes iniciais da API falharam pela rota ausente e o teste de esquema pelas colunas ausentes, antes de implementar. O cenário de navegador falhou pela ausência de Iniciar desafio. A reconciliação teve falha inicial pela rota ausente; a recuperação manual teve teste de navegador falhando pela ausência de Reconciliar painel.

Correções demonstradas por testes antes do ajuste:

- A biblioteca de arraste marcava como desabilitadas as teclas que apenas não deveriam ser arrastáveis; o cenário de letra da galera ficou bloqueado. A ligação ao elemento arrastável foi separada da disponibilidade da tecla.
- As pendências de uma desistência estavam permanecendo apresentadas no banco; o teste exigiu desistida sem alterar as reservas futuras.
- Palpite com Unicode decomposto pontuava corretamente, mas o registro classificava como parcial; o teste reproduziu a inconsistência.
- A prova integrada encontrou tempo fracionado recusado pelo servidor e a jogada não seguia. O transporte agora confirma milissegundos inteiros, com teste específico.

A cobertura posterior de partidas completas, extra e autorização complementa esses ciclos; não é apresentada retroativamente como teste escrito antes de todo código. Refatoração da persistência em módulos foi feita com os cenários existentes passando antes e depois.

O fechamento abaixo registra os resultados efetivamente executados. Aparelhos físicos, hospedagem pública, revisão geral de acessibilidade/desempenho e repertório completo de áudio/mascote permanecem nas fases próprias.

## Fechamento verificado — 2026-10-30

- **237 testes backend aprovados**, incluindo nove de painel/persistência e a prova opcional com React compilado, HTTP real e PostgreSQL descartável. Essa prova cria o grupo, inicia o painel, confirma pontos e tempo, recarrega, confere o mesmo placar e encerra pela tela; Google e catálogo são controlados, sem usar a conta pessoal.
- **65 testes unitários frontend aprovados**; tipos, build, Prettier e Ruff aprovados.
- Navegador em computador, tablet e celular: **12 da galera**, **45 do individual**, **24 do menu**, **42 de perfil/demonstração** e **41 de entrada**, total **164 aprovados**. Quatro cenários de entrada foram ignorados conforme suas condições existentes de mouse/toque; não são falhas desta fase.
- Testes da galera cobrem configuração, letra, recarga, desistência, falha inicial de conexão com reconciliação manual e saída pelo menu com retorno ao resultado. Capturas do painel foram geradas nos três tamanhos; as de computador e celular foram examinadas visualmente por IA. Sem rolagem horizontal nos cenários verificados. Conteúdo extenso pode exigir rolagem vertical.
- API: partida de três participantes com duas sessões concluída, pontuação total conservada, exposições corretas e ausência de resultado individual; reenvios concorrentes e versão desatualizada; extra com consenso, falta de conteúdo e novas respostas; CSRF e propriedade; tempo idempotente, recarga e encerramento por histórico.
- Migração **0010** aplicada localmente; `alembic check` sem divergências. API reiniciada; OpenAPI contém as rotas novas e frontend respondeu HTTP 200 em `http://localhost:5173`. A instância PostgreSQL isolada de testes foi desligada ao final.
- Catálogo publicado preservado: **275 respostas, 1.375 dicas e 275 revisões**; nenhum lote foi importado nesta fase. Atlas não acessado.
- Avisos remanescentes: descontinuação interna da Authlib já existente e pacote JavaScript acima de 500 kB (aproximadamente 547 kB minificado no build final), para revisão de dependências/desempenho nas fases próprias. Não houve nova dependência.

O modo pode ser acessado em `/jogar/galera/novo` após entrar na conta. A aprovação visual do responsável continua sendo uma avaliação própria; testes e capturas por IA não a presumem. Histórico e rankings agregados seguem na fase 34. O roteiro de conclusão permanece somente local.
