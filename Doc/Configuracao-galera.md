# Configuração da galera — fase 29

## Entrega e limites

Configuração autenticada de um a três participantes no mesmo dispositivo, uma a cinco sessões e dificuldade única. O anfitrião usa nome/avatar da conta; convidados escolhem nome e avatar do catálogo. Nomes têm 3–20 caracteres, letras, números ou sublinhado, comparados sem caixa/acentos e distintos dentro da partida. Avatares podem se repetir.

Temáticas manuais definem a sequência completa; surpresa sorteia uma sequência viável no servidor, podendo repetir temática. Todas as palavras de uma sessão pertencem ao tema dela. Cada sessão reserva uma palavra por participante; ninguém possui uma palavra exclusiva. Não há repetição de resposta na partida inteira.

A fase entrega **partida preparada**, não o painel jogável. A tela confirma configuração e primeira ordem sorteada, recuperável ao recarregar. Letras, turnos, transição entre sessões e resultado serão implementados nas fases 31 e 33. A animação de sorteio consumirá a ordem oficial, sem sortear novamente no navegador. Somente a primeira ordem é reservada nesta fase; as próximas serão sorteadas quando suas sessões começarem.

## Decisões aprovadas em 2026-10-30

- Cronômetro informativo por sessão e total da partida, apenas tempo ativo. Não altera pontuação, turno ou desempate. Persistência e interface da medição da galera ficam na integração da fase 33.
- Falta de conteúdo exige ajustar a configuração antes de criar: não reduzir sessões nem trocar temáticas/dificuldade automaticamente. A tela mostra a insuficiência e, no manual, contagens por sessão. Conteúdo com várias temáticas pode disputar as mesmas vagas; contagens isoladas não autorizam repetir uma palavra.

## Seleção e proteção das respostas

Seleção por dificuldade e temática no catálogo publicado, com referências imutáveis id/revisão. O algoritmo faz associação entre vagas e palavras para não rejeitar uma configuração viável por escolha gulosa de uma palavra com várias temáticas. Primeiro tenta uma composição inteiramente inédita; se não existir, permite respostas vistas, priorizando candidatas inéditas. Não há garantia de otimização global da quantidade de inéditas no segundo caso.

No aleatório, a busca considera sequências viáveis e mantém a sequência futura privada. Não promete probabilidades iguais entre todas as sequências: a disponibilidade restringe o sorteio. Se não houver sequência viável, pedir ajustes. Não há troca silenciosa de uma configuração manual.

Planejar e criar não registram palavras como vistas. As rodadas permanecem reservadas e sem dicas individuais. A futura apresentação do painel será responsável por registrar as exposições. Histórico do anfitrião é compartilhado entre modos; a individual aberta não é alterada. Não se criam contas ou históricos permanentes para convidados.

## Persistência e concorrência

Migração aditiva **0009**, posterior à 0008: `planos_galera`, totalizando 22 tabelas. Campos: id, jogador_id, configuracao JSONB, reservas JSONB, criado_em, expira_em e partida_id único. O plano privado guarda nomes/avatares e referências do catálogo; só o proprietário pode consumi-lo. Validade de dez minutos para criar. Planos expirados não consumidos são removidos na próxima preparação daquela conta; a exclusão da conta remove todos os seus planos, inclusive nomes dos convidados contidos neles.

A criação bloqueia anfitrião e plano e grava partida, participantes, sessões, reservas e primeira ordem numa transação. Reenvio ou duas criações simultâneas do mesmo plano retornam a mesma partida, sem duplicação. Se nome/avatar do anfitrião mudar antes de confirmar, exigir nova conferência. Repetir o mesmo plano já consumido recupera a partida existente. Não foi criado limite novo de uma galera por conta; o limite anterior continua exclusivo da individual.

A primeira sessão permanece reservada: não há participante atual nem ação de turno enquanto o motor não iniciar o painel. Não há penalidade de pausa individual nessa preparação. MongoDB é somente leitura nesta fase, sem transação distribuída: referências são verificadas ao preparar o plano; uma futura falha de leitura deve preservar a partida.

## Contratos privados da API

| Operação | Entrada e resultado |
| --- | --- |
| POST `/api/partidas/galera/configuracao` | Recebe convidados, dificuldade, quantidade_sessoes, modo_tematicas e tematicas apenas no manual. Retorna pode_criar, plano_id, contagens e configuração pública; sem reservas ou respostas. |
| POST `/api/partidas/galera` | Recebe somente plano_id. Cria/recupera a preparação idempotentemente. |
| GET `/api/partidas/galera/{partida_id}` | Recupera somente preparação do proprietário: estado, versão, configuração pública, participantes e ordem_primeira_sessao. |

`convidados` contém até dois objetos `{nome, avatar_id}`; anfitrião não é aceito no payload. Dificuldades: facil/medio/dificil; sessões inteiras 1–5; modos manual/aleatorio. Manual exige exatamente uma temática válida por sessão; aleatório recusa lista explícita. Entradas adicionais são recusadas. Pontos e ordem não podem ser enviados pelo cliente.

Autorização de conta ativa, propriedade, Origin e CSRF reutilizam o fluxo aprovado. Consultas e respostas não são armazenadas em cache. Códigos: 422 DADOS_INVALIDOS/NOMES_REPETIDOS/AVATAR_INVALIDO; 404 PLANO_NAO_ENCONTRADO/PARTIDA_NAO_ENCONTRADA; 409 PLANO_EXPIRADO/CONFIGURACAO_DESATUALIZADA; indisponibilidade mantém os erros padronizados do catálogo e dos bancos. Falta de conteúdo é resposta normal com pode_criar=false, plano_id=null e mensagem para ajuste.

## Interface e arquitetura

Rota `/jogar/galera/novo` abre o configurador; `/jogar/galera/{id}` mostra a preparação persistida. As telas usam as quatro paletas e os modos claro/escuro existentes. Há prévia do avatar, inclusão/remoção de convidados, seletores de sessões/temas e conferência antes da criação. Alterar uma escolha invalida a conferência anterior. Trava de envio evita cliques repetidos e o servidor garante idempotência independentemente dela.

Rotas, serviço, repositório e seleção foram separados; o catálogo é injetado por protocolo pequeno de leitura. O adaptador de catálogo existente é compartilhado, sem copiar regras de pontuação do individual. Frontend separa contrato HTTP, configuração e consulta da preparação. O estado oficial fica no servidor; campos sensíveis das reservas não chegam à interface.

## TDD e verificação

Os testes iniciais do backend falharam pela ausência do módulo de galera registrado na API; o teste de navegador falhou pela ausência da tela de configuração. Testes do contrato frontend falharam ao aceitar preparação sem anfitrião, sessões fora do limite e pontos negativos antes da validação correspondente. Cobertura complementar de matching, concorrência, expiração e privacidade foi adicionada na integração; não é descrita retroativamente como teste escrito antes do primeiro código.

Cenários: criação e reenvio, duas requisições concorrentes, nomes normalizados, avatares inválidos, limites de sessões/convidados, campos extras, CSRF, acesso de outra conta, plano expirado, anonimização, temáticas repetidas e ocultação do aleatório, ausência de exposições prematuras e preservação da individual. A associação de palavras com várias temáticas tem teste próprio.

Navegador: configuração, convidado/avatar, sequência manual, confirmação, criação e recarga nos tamanhos de computador, tablet e celular. A prova opcional integrada usa React compilado, HTTP real e PostgreSQL descartável, com Google e catálogo controlados: cria a galera pela tela, recupera a preparação e confere dois participantes, uma sessão e duas palavras reservadas no banco. Não usa a conta pessoal.

Verificações finais: 189 testes backend aprovados (incluindo a prova integrada), 61 unitários frontend, 3 cenários de configuração da galera e regressões de 24 cenários de menu, 42 de perfil/demonstração e 45 do individual. Ruff, Prettier, tipos e build aprovados. Capturas da configuração revisadas por IA em computador, tablet e celular. Migração 0009 aplicada localmente; API e frontend disponíveis no ambiente de desenvolvimento. O workflow do GitHub inclui testar-galera. Aparelhos físicos, hospedagem pública, regras completas do painel e animações continuam nas fases próprias. O aviso de pacote JavaScript acima de 500 kB permanece para a revisão de desempenho.
