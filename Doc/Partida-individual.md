# Partida individual jogável — fase 26

Implementada em 2026-10-29. O modo Solo e a demonstração agora usam o motor individual real, com configuração confirmada, pistas, teclado, pontuação e resultado persistido. As telas mantêm a identidade aprovada: Aurélio ilustrado, Bricolage/DM Sans, cores do Decifra, cartões, teclas e temas claro/escuro.

## Caminhos da experiência

- `/jogar/individual/novo`: quantidade 3/5/7, temática ou todas, nível único, distribuição personalizada ou aleatória e ordem sorteada, crescente ou manual.
- A configuração passa pela conferência da API. Conteúdo insuficiente oferece somente as alternativas que o servidor autorizar: ampliar temáticas, reduzir ou cancelar/alterar. Não troca dificuldades silenciosamente.
- Confirmar inicia o plano reservado e abre `/jogar/individual/{partida_id}`. Reenvio do plano recupera a mesma partida.
- `/jogar/individual` consulta a individual em aberto e encaminha para sua tela; se não houver, abre a configuração.
- `/jogar/demonstracao` apresenta o convite sem consumir a oportunidade ao simplesmente visitar a página. O botão explícito reserva e ativa a demonstração única. Um teste existente pode ser recuperado nesse caminho, inclusive para consultar seu resultado.

Primeiro acesso continua exigindo perfil completo antes do Solo autenticado. A demonstração preserva suas três palavras fáceis, temáticas sorteadas e limite por navegador. O convite ao Google aparece durante a partida e no resultado. O menu tenta o vínculo de uma demonstração após login; em conflito com uma individual aberta, oferece resolver a demonstração. A transferência continua sendo da mesma partida, em até sete dias, sem desconto e sem cópia do progresso.

## Rodada e resultado

A tela mostra pontos confirmados, posição da palavra, dificuldade, temática e primeira dica. A pista atual fica em destaque; anteriores abrem um diálogo, mantendo os pontos disponíveis na dica mais avançada. Pedir outra pista preserva a montagem atual.

O teclado da fase 24 recebe a máscara pública do servidor. Clique, toque, digitação, acentos e arraste continuam disponíveis. Sinais e espaços são fixos; letras e algarismos ficam vazios. `WALL-E 3`, por exemplo, apresenta hífen/espaço prontos e exige preencher o 3. A API agora aceita esses palpites, normaliza NFC/caixa alta e mantém a exigência de acentos e a distinção C/Ç.

Erro confirmado limpa os quadradinhos e avança a pista até a quinta. Na quinta, erros continuam permitidos e o valor permanece em 20. Entrada incompleta permanece no editor, com aviso, sem enviar uma ação que altere dica ou pontuação. Acerto abre uma reação com resposta revelada e pontos oficiais; o jogador escolhe seguir para a próxima palavra ou ver o resultado final.

Desistir da palavra exige confirmação, revela a solução e concede zero. Encerrar a partida é uma confirmação separada: conserva o saldo e encerra definitivamente, sem desconto adicional. O resultado mostra saldo, acertos, quantidade concluída e cada palavra encerrada com sua resposta, pontos e dicas utilizadas. Reservas não apresentadas e palavras ainda em andamento não são reveladas pelo resumo.

O resultado pode ser recuperado após recarga pelo identificador da partida. Sua apresentação usa o estado do servidor, não uma soma mantida apenas no navegador.

## Contratos acrescentados

O estado público da individual agora inclui:

- `acertos`: quantidade de rodadas acertadas.
- `resumo_rodadas`: somente rodadas `acertada`/`desistida`, com `ordem`, `estado`, `resposta`, `pontos` e `dicas_utilizadas`.
- `rodada_atual.limites`: limites de repetição para o alfabeto virtual A–Z, Ç e 0–9. Vogais acentuadas compartilham a família da vogal; Ç continua distinto de C.

O limite real de uma letra existente permite bloqueá-la após usar suas ocorrências. Todas as teclas constam no mapa, sem limites zero: letras ausentes recebem um limite maior que o total de posições preenchíveis e nunca são bloqueadas pela quantidade usada. Isso evita uma lista explícita de ausências, mas os limites são dados derivados da resposta e podem permitir inferências a quem inspecionar as requisições. Essa exposição é necessária ao bloqueio por quantidade definido para a primeira entrega; não equivale a esconder todas as frequências. Solução, posições das letras e dicas futuras continuam privadas.

Novas operações da demonstração:

| Operação | Efeito |
| --- | --- |
| POST `/api/demonstracoes/jogo` com `{}` | Ativa a reserva preparada e apresenta a primeira rodada uma única vez; em teste já iniciado, recupera o estado |
| GET `/api/demonstracoes/jogo` | Consulta o estado jogável do próprio visitante, sem ativar ou avançar |
| POST `/api/demonstracoes/jogo/palpites` | Mesmo corpo de palpite da individual |
| POST `/api/demonstracoes/jogo/dicas` | Mesmo corpo de ação de rodada |
| POST `/api/demonstracoes/jogo/desistencia-palavra` | Mesmo corpo de ação de rodada |
| POST `/api/demonstracoes/jogo/encerramento` | Mesmo corpo de ação de partida |

A criação/reserva continua em POST `/api/demonstracoes`; a consulta de metadados da fase 19 continua em GET `/api/demonstracoes/atual`. Os contratos anteriores foram preservados.

Cookie opaco identifica o visitante. Mutações exigem origem pública exata e token CSRF do visitante. Nenhuma rota aceita visitante, titular ou pontuação livre no corpo. Após vínculo, o cookie de visitante perde acesso ao jogo, que passa a exigir a conta titular. Exclusão, expiração e primeiro acesso mantêm suas regras anteriores.

## Consistência e organização

`IndividualPostgresql.agir_na_transacao` concentra a jogada compartilhada: os caminhos autenticado e visitante fazem sua própria autorização e bloqueio antes de entrar nesse motor. Pontuação, avanço, exposição, ação idempotente e resultado permanecem na mesma transação. A ativação do teste serializa visitante → partida e é idempotente; seu bloqueio é compatível com o caminho do vínculo. Não houve migração nem mudança no esquema SQL ou no catálogo.

O frontend separa contrato/validação da API, controlador de requisições, configuração, arena/editor e resultado. Funções puras continuam calculando o resultado da jogada no servidor. O navegador recusa estados malformados, impede envios simultâneos e preserva identificador e corpo da ação para reenvio explícito após uma falha de conexão ou resposta inválida. Conflitos de versão provocam nova consulta. O cache não substitui estado de versão maior por um retrato antigo.

Aplicação de SOLID: regras isoladas da renderização e do transporte; serviços dependentes de contratos pequenos; demonstração e conta compartilham o comportamento do motor, com autorização própria. Não se introduziu nova biblioteca. Os nomes de temas e níveis ficam em um módulo de apresentação compartilhado.

O diálogo comum passou a gerar identificadores únicos com `useId`, evitando que três diálogos na mesma página anunciassem o título de outro. Foco contido, Escape e devolução de foco permanecem no elemento nativo. Movimento reduzido do sistema e da conta é respeitado. A navegação fixa fica oculta durante a arena para não cobrir o teclado no celular.

## TDD e verificações

Falhas reproduzidas antes da implementação: rejeição de `WALL-E 3`, ausência de resumo recuperável, máscara incompatível e rotas jogáveis da demonstração em 404. A validação do frontend inicialmente aceitava estado incompleto; o teste passou após validar o contrato. O fluxo de navegador inicialmente não encontrava a configuração jogável. Depois foram reproduzidos o título incorreto do diálogo de desistência e o limite indevido de letra ausente quando toda a montagem estava ocupada; ambos corrigidos com regressão.

Evidências locais:

- **163 testes backend aprovados**, PostgreSQL descartável e MongoDB isolado; uma prova opcional de navegador é ignorada na execução padrão.
- **47 testes unitários frontend aprovados**, compilação TypeScript/Vite e formatação verificadas.
- **24 cenários da nova interface aprovados**, distribuídos por computador, tablet e celular: partida completa, recarga do resultado, erros/quinta dica, anteriores, desistência, encerramento, reenvio, demonstração, tema e cliques repetidos.
- Regressão de **24 cenários de menu e 39 de perfil/demonstração aprovados**. Capturas finais dos três tamanhos revisadas após compactar o layout e remover a sobreposição da navegação.
- **Prova integrada adicional aprovada:** React compilado, FastAPI via HTTP e PostgreSQL descartável, sem interceptar as chamadas da partida. Uma individual autenticada e uma demonstração terminaram com 300 pontos e três acertos na tela, na API e no banco. Google e catálogo foram substituídos por implementações controladas de teste; não houve login externo ou uso da conta pessoal.
- Ruff aprovado. O aviso de compatibilidade HTTPX/Authlib já conhecido continua presente.

Para repetir a prova integrada: compilar o frontend com `npm run build`; instalar o navegador Playwright e as dependências dos dois projetos; apontar `DECIFRA_POSTGRESQL_TESTE_URL` para uma base local terminada em `_teste`, com permissão de criar as bases descartáveis da suíte; definir `DECIFRA_EXECUTAR_JOGO_COMPLETO=1` e executar `python -m pytest testes/teste_jogo_navegador.py -q` dentro de Backend. O canal padrão é Edge; `DECIFRA_CANAL_NAVEGADOR=chromium` permite usar o Chromium instalado pelo Playwright. A prova cria seu servidor HTTP em uma porta local disponível e o encerra ao terminar.

O comando `npm run testar-individual` executa a interface com respostas HTTP controladas e passou a integrar o GitHub Actions. A prova integrada opcional permanece local; não é anunciada como executada automaticamente no GitHub.

## Limites desta fase

Pausa, penalidade por saída e protocolo persistido de interrupções pertencem à fase 28. Nesta fase, consultar ou recarregar não desconta pontos; não foi acrescentada detecção de fechamento. Áudio final e repertório completo de movimentos do mascote permanecem nas fases próprias. O catálogo de desenvolvimento não foi alterado e nenhuma partida foi criada na conta pessoal para os testes. Hospedagem pública, cookies via Vercel/Render e aparelhos físicos continuam aguardando suas verificações planejadas.
