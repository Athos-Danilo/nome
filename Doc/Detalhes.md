# Detalhes do projeto

Documento de requisitos e regras de negócio do jogo de adivinhação de palavras desenvolvido para as disciplinas de **Web II e Banco de Dados II**.

**Última atualização:** 26 de outubro de 2026.

**Nome do projeto:** Decifra.

**Mascote:** Aurélio, o dicionário apresentador.

**Prazo estimado informado:** até aproximadamente um mês; data exata ainda não confirmada. A apresentação será conjunta para Web II e Banco de Dados II.

Este documento reúne as decisões tomadas na concepção do projeto. Quando uma regra ainda não foi fechada, ela aparece como **a definir**. Recomendações de implementação estão identificadas como propostas e não substituem decisões de negócio.

## 1. Visão do produto

O sistema será um jogo em português no qual o jogador tenta descobrir palavras ou expressões a partir de dicas progressivas. Quanto menos dicas utilizar, maior será a pontuação pelo acerto.

O objetivo principal é o entretenimento, com aprendizado como benefício complementar. O público é geral, sem foco específico em crianças.

A experiência deve ter um visual bonito, dinâmico e animado. Na tela da rodada, as dicas terão destaque; abaixo delas, haverá quadradinhos representando as letras da resposta e um alfabeto para preenchê-los.

O projeto contempla duas ideias de jogo:

- **Individual:** adivinhar respostas com até cinco dicas, escolhendo a configuração da partida.
- **Com a galera:** inspirado no Roda a Roda, sem a roda, com até três participantes. As regras completas desse modo serão discutidas posteriormente.

Os modos individual e com a galera deverão estar presentes na primeira entrega. As regras do modo com a galera estão em detalhamento.

## 2. Base técnica e restrições

| Camada | Definição |
| --- | --- |
| Interface | React |
| Backend | Python com FastAPI |
| Banco relacional local | PostgreSQL |
| Banco não relacional local | MongoDB |
| Banco relacional na web | Neon |
| Banco não relacional na web | MongoDB Atlas |
| Autenticação | Conta Google |
| Idioma do jogo | Português |

Os dois bancos farão parte da solução. O catálogo de respostas, temáticas e dicas ficará no MongoDB. Contas, partidas, participantes, palpites, pontuação, penalidades e histórico ficarão no PostgreSQL, conforme a divisão aprovada na seção 18.

O desenvolvimento utilizará PostgreSQL e MongoDB já instalados diretamente na máquina do responsável pelo projeto. Docker não será requisito para o ambiente local.

O objetivo é publicar o jogo na web, utilizando Neon e MongoDB Atlas, com **custo zero de hospedagem**. Na fase 15, o responsável escolheu **Vercel para a interface e Render gratuito para a API**, com encaminhamento de `/api` pela Vercel. Os limites e o comportamento real da integração serão conferidos antes da publicação.

Não haverá senha própria da plataforma. A autenticação e a recuperação de acesso serão realizadas pelo Google.

O projeto e as configurações de autenticação no Google Cloud serão criados do zero. Nenhuma configuração de login Google foi realizada até o momento.

## 3. Vocabulário do domínio

| Termo | Significado |
| --- | --- |
| Resposta | Palavra ou expressão que o jogador precisa descobrir |
| Rodada | No modo individual, etapa da partida dedicada a uma resposta |
| Sessão | No modo com a galera, etapa com um painel compartilhado de uma a três respostas |
| Turno | Vez de um participante agir no modo com a galera |
| Partida | Conjunto de rodadas com uma configuração inicial |
| Temática | Categoria associada à resposta, como animais ou filmes |
| Dica | Texto que aproxima o jogador da resposta |
| Palpite | Resposta montada e enviada para conferência |
| Dificuldade | Classificação fácil, média ou difícil atribuída à resposta no cadastro |
| Visitante | Pessoa que ainda não entrou com uma conta Google |
| Jogador autenticado | Pessoa identificada pela conta Google e com perfil na plataforma |

## 4. Perfis de acesso

### 4.1. Visitante

O visitante poderá experimentar **uma única partida**, com **três respostas fáceis e temáticas aleatórias**. Não será permitido iniciar outra demonstração sem fazer login.

A limitação será **por navegador**, com identificação persistida no navegador e controle correspondente no backend. Não será exigido rastreamento rigoroso da pessoa: limpar os dados ou usar outro navegador poderá permitir uma nova demonstração, limitação aceita pelo responsável pelo projeto. Na fase 19, foi adotado cookie opaco HttpOnly com resumo do segredo e marcador de uso no PostgreSQL.

O sistema apresentará um convite para entrar com o Google, explicando que isso libera o controle completo das configurações e o acompanhamento do progresso. Esse convite poderá aparecer durante a experiência ou ao final; o momento exato ainda será definido.

Se o visitante entrar com o Google logo após a partida de demonstração, ela deverá ser incorporada ao seu histórico.

A única partida de demonstração deverá ter seu registro completo associado ao perfil, sem descartar seu progresso e resultado na vinculação. Seus resultados contarão nas estatísticas individuais e nos rankings como uma partida normal, respeitando a publicação somente após conclusão ou abandono definitivo e sem duplicar resultados ao vincular a conta. Isso não altera o escopo de consulta do histórico: a tela detalhada de cada rodada continua prevista para uma versão futura.

Decisões D10 aprovadas na fase 19:

- A demonstração pode ser vinculada até sete dias após começar; o vencimento não libera outro teste.
- Entrar com Google no meio transfere o registro integral e permite continuar sem desconto pelo login.
- Uma individual já aberta na conta é preservada. A demonstração ainda ativa deve ser concluída ou abandonada antes de vincular; se já estiver encerrada, entra diretamente no histórico.

A infraestrutura está implementada conforme [Visitante e demonstração](Demonstracao-visitante.md). A demonstração jogável será integrada na fase 26, após o motor individual. O prazo de vinculação não implica apagar automaticamente o registro nem reiniciar a oportunidade por navegador.

### 4.2. Jogador autenticado

O jogador autenticado poderá configurar partidas, acompanhar o histórico e as estatísticas, personalizar o perfil e retomar uma partida não finalizada.

Cada conta terá e-mail e nome de usuário únicos. No primeiro acesso com o Google, o jogador deverá escolher um nome de usuário disponível e um avatar antes de começar a jogar como usuário autenticado.

## 5. Conta, perfil e privacidade

### 5.1. Identificação

- O acesso será feito exclusivamente pela conta Google.
- O e-mail será único e não poderá ser alterado pela interface da plataforma.
- O nome de usuário será único e poderá ser alterado.
- Não haverá cadastro, alteração ou recuperação de senha própria.
- A comparação de nomes para unicidade ignorará diferenças entre maiúsculas e minúsculas: “Athos” e “athos” serão o mesmo nome.
- Nomes terão de 3 a 20 caracteres: letras, incluindo acentos, números e sublinhado, sem espaços. A comparação de unicidade também ignora acentos: “José” e “JOSE” são o mesmo nome. Preservar a grafia escolhida para exibição. A regra vale também para convidados e não altera a exigência de acentos nos palpites do jogo.

### 5.2. Avatares

O sistema disponibilizará um pacote de imagens temáticas para escolha do avatar, em uma experiência semelhante à seleção de perfis da Netflix. A personalização prevista é selecionar uma imagem da coleção oficial da plataforma; envio de fotos pessoais não integra a primeira entrega.

Na fase 04, foi aprovada a coleção inicial de **20 avatares** com identificadores estáveis em vetor circular e fundo nas cores da paleta:

| Grupo | Identificadores estáveis |
| :--- | :--- |
| **O Mascote Aurélio** | `aurelio_apresentador`, `aurelio_oculos`, `aurelio_detetive`, `aurelio_comemorando` |
| **Fauna & Natureza** | `coruja_sabia`, `onca_pintada`, `capivara_zen`, `tucano_tropical` |
| **Enigmas & Conhecimento** | `lampada_ideia`, `lupa_misterio`, `livro_encantado`, `pena_tinteiro` |
| **Entretenimento & Cultura** | `claquete_cinema`, `pipoca_divertida`, `trofeu_campeao`, `cartola_magica` |
| **Jogos & Universo Retrô** | `controle_arcade`, `fita_cassete`, `disco_vinil`, `dado_da_sorte` |

Esses avatares serão utilizados no perfil do usuário autenticado e na escolha rápida dos convidados do modo com a galera.

### 5.3. Privacidade

O perfil, o histórico e as estatísticas pessoais serão privados. Haverá uma classificação pública com informações limitadas, como nome de usuário e indicadores de desempenho.

A exposição de datas no ranking foi sugerida, mas ainda não foi confirmada. E-mail e histórico detalhado não integram a proposta de informações públicas.

### 5.4. Exclusão de conta

A exclusão da própria conta e de seus dados faz parte da primeira entrega, conforme decisão do responsável na consolidação do escopo.

A exclusão exige aviso dos efeitos e digitar **EXCLUIR**. Remover a identidade Google, e-mail, nome, avatar, preferências e acessos; eliminar também os nomes dos convidados das partidas criadas pela conta. Conservar resultados anônimos, sem permitir recuperar a identidade ou o histórico pelo login anterior. Os resultados e pontos antigos continuam nos rankings com o nome **Jogador excluído**, separados de qualquer conta nova.

Entrar novamente com o mesmo Google cria uma conta nova, do zero, sem recuperar histórico, estatísticas pessoais ou pontos. A execução da exclusão, inclusive cancelamento e falhas, foi implementada na fase 17, conforme [Perfil e preferências](Perfil-preferencias.md). A interface de ranking continua em sua fase própria.

## 6. Conteúdo do jogo

### 6.1. Respostas e temáticas

As respostas poderão ser palavras únicas ou expressões que representem uma unidade, como o título de filme **Star Wars**.

As cinco temáticas iniciais serão:

- Animais.
- Nomes de filmes e séries.
- Marcas em geral, incluindo carros, tecnologia e bebidas.
- Países.
- Objetos em geral.

Uma mesma resposta poderá pertencer a mais de uma temática.

### 6.1.1. Meta inicial de conteúdo

| Temática | Fácil | Média | Difícil | Total de respostas | Total de dicas |
| --- | --- | --- | --- | --- | --- |
| Animais | 40 | 35 | 25 | 100 | 500 |
| Filmes e séries | 40 | 35 | 25 | 100 | 500 |
| Marcas | 40 | 35 | 25 | 100 | 500 |
| Países | 40 | 35 | 25 | 100 | 500 |
| Objetos | 40 | 35 | 25 | 100 | 500 |
| **Total** | **200** | **175** | **125** | **500** | **2.500** |

A geração será organizada em lotes de 25 respostas. A meta é de 500 respostas distintas; uma resposta associada a várias temáticas não deverá ser contada como vários itens para atingir esse total. Para o planejamento da carga, cada resposta terá uma temática principal de contagem; associações adicionais não geram novas respostas.

### 6.2. Dados obrigatórios do conteúdo

Cada resposta deverá ter:

1. A resposta correta.
2. Uma ou mais temáticas.
3. Uma dificuldade: fácil, média ou difícil.
4. Exatamente cinco dicas textuais, com ordem definida.

A dificuldade será atribuída no cadastro do conteúdo. Ela não será calculada automaticamente a partir do desempenho do jogador.

As dicas deverão aproximar progressivamente o jogador da resposta: a primeira será mais vaga e a quinta será a mais esclarecedora.

Não haverá cadastro de respostas alternativas nesta versão. Não foram previstos sinônimos ou títulos equivalentes como formas adicionais de acerto.

### 6.3. Gestão do conteúdo

Não haverá área administrativa no site nesta versão. O conteúdo será preparado em arquivos organizados, gerado com apoio de IA e posteriormente importado em lote. A meta inicial é ter **pelo menos 500 respostas**, cada uma com cinco dicas.

O formato JSON do guia local `Agents/Geracao-de-conteudo.md` foi aprovado: cada lote terá versão de formato, identificador e lista de respostas; cada resposta terá identificador estável, texto correto, temáticas, dificuldade e cinco dicas ordenadas. Os lotes terão 25 respostas. Os dados não deverão ser importados sem validação estrutural, verificação de duplicatas e revisão do conteúdo gerado.

A pasta `Agents/` tem duas exceções explícitas no `.gitignore`: `Regras.md` e `Geracao-de-conteudo.md` serão versionados. Os lotes de conteúdo deverão ficar em uma pasta versionada separada, definida como `Data/palavras/`.

Sugestões de conteúdo por jogadores poderão ser discutidas em uma atualização futura. Denúncias de dicas ou respostas não fazem parte da versão atual.

A desativação de palavras não foi aprovada como requisito. Esse recurso poderia servir, por exemplo, para retirar temporariamente uma resposta com erro, mas sua necessidade ainda será avaliada.

Não está previsto um fluxo de edição de conteúdo durante partidas em andamento. O comportamento diante de uma eventual correção direta nos bancos ainda precisa ser definido, caso essa operação seja permitida.

## 7. Configuração da partida individual

### 7.1. Configuração básica

Antes de começar, o jogador poderá escolher:

- Uma temática ou a opção de temáticas aleatórias.
- A dificuldade.
- A quantidade de respostas da partida.

As quantidades disponíveis serão **três, cinco ou sete respostas**.

No modo de temáticas aleatórias, as respostas poderão pertencer a categorias diferentes, respeitando a dificuldade ou a distribuição de dificuldades escolhida.

A configuração ficará fixa durante a partida.

### 7.2. Combinação de dificuldades

Além da configuração básica, o jogador poderá combinar dificuldades e determinar quantas respostas haverá de cada nível.

Exemplo: em uma partida com sete respostas, escolher três fáceis e quatro médias.

Também poderá definir a ordem das dificuldades. Por exemplo: fácil, médio, fácil, médio, médio, fácil e médio.

Haverá ainda a possibilidade de deixar o sistema sortear a quantidade de respostas de cada dificuldade entre os níveis selecionados pelo jogador. O critério de distribuição desse sorteio ainda precisa ser definido.

A combinação personalizada também oferecerá uma opção de ordem crescente de dificuldade, além da ordenação manual.

### 7.3. Validações da configuração

A soma das quantidades por dificuldade deverá corresponder ao total de respostas da partida. Uma ordem personalizada deverá respeitar essa mesma distribuição.

Antes de iniciar, o sistema deverá verificar se há conteúdo suficiente para atender à configuração escolhida.

## 8. Seleção e repetição de respostas

O sistema deverá priorizar respostas que o jogador ainda não jogou. Quando as opções inéditas acabarem, respostas anteriores poderão ser repetidas, com a mesma pontuação normal.

Uma resposta será considerada vista assim que sua rodada individual ou sua sessão com a galera for apresentada. Respostas reservadas para etapas não iniciadas continuam inéditas.

O histórico de conteúdo visto é compartilhado entre os dois modos para a conta do anfitrião. Uma resposta apresentada na galera também deixa de ser inédita no individual e vice-versa. Convidados não possuem histórico permanente.

Uma resposta não poderá aparecer duas vezes dentro da mesma partida. O sistema reutilizará respostas de partidas anteriores quando necessário e somente oferecerá as alternativas abaixo se, mesmo assim, não houver respostas distintas suficientes para atender à configuração.

Se faltar conteúdo para atender à configuração, o sistema deverá avisar e oferecer estas alternativas:

1. Autorizar a inclusão de respostas de outras temáticas.
2. Jogar com a quantidade de respostas disponível.
3. Desistir de iniciar a partida.

A mudança de temática dependerá da escolha do jogador e não deverá ocorrer silenciosamente.

Ainda precisam ser definidos:

- Como lidar com falta de respostas da dificuldade escolhida, mesmo buscando outras temáticas.
- Se a partida reduzida poderá ter qualquer quantidade disponível, inclusive menos de três respostas.

## 9. Tela da rodada e montagem da resposta

### 9.1. Organização visual

A tela deverá apresentar:

- A dica atual em destaque.
- Um botão para consultar as dicas anteriores.
- Os quadradinhos da resposta, com a quantidade de letras visível desde o início.
- O alfabeto para montar a resposta.
- A ação de confirmar o palpite.
- A ação de pedir a próxima dica, enquanto houver uma disponível.
- A ação de desistir da palavra.
- A ação de pausar e sair, com confirmação do desconto de 100 pontos.
- A ação de abandonar definitivamente a partida.

A pontuação disponível deverá ficar clara, especialmente quando diminuir após a revelação de uma nova dica.

### 9.2. Formas de preenchimento

O jogador poderá preencher a resposta por três formas:

1. Arrastando letras para os quadradinhos.
2. Clicando nas letras do alfabeto.
3. Digitando pelo teclado.

Será possível remover e substituir letras antes de confirmar.

Espaços de expressões aparecerão separados. As letras das respostas e dos palpites serão exibidas em **caixa alta**, inclusive quando o jogador digitar em minúsculas.

**Acentos são obrigatórios na validação:** “JAPAO” não será aceito como “JAPÃO”. A conversão para maiúsculas deverá preservar os acentos; não haverá remoção de acentos para considerar um palpite correto. Essa decisão substitui a proposta inicial de completar acentos automaticamente a partir de um alfabeto básico.

Na montagem de uma resposta completa, o jogador colocará a letra e poderá aplicar o acento depois, em vez de depender de um botão separado para cada vogal acentuada. A interface também deverá aceitar entrada acentuada pelo teclado físico. A aplicação de acento manterá a letra em caixa alta.

A exigência de acentos vale para palpites completos. No modo com a galera, a escolha isolada de uma letra segue a equivalência entre vogais definida na seção 15.3. **C e Ç são caracteres distintos nos dois modos** e terão opções próprias no teclado virtual. A apresentação de hífens ainda precisa ser definida.

### 9.3. Disponibilidade das letras

Uma letra que pertença à resposta ficará bloqueada quando a quantidade colocada nos quadradinhos atingir o número de ocorrências dessa letra na resposta correta.

Letras que não pertençam à resposta continuarão disponíveis. O sistema não deverá desativá-las antecipadamente.

Exemplo para **ARARA**:

| Letra | Quantidade na resposta | Comportamento |
| --- | --- | --- |
| A | 3 | Disponível até três usos simultâneos; depois, bloqueada |
| R | 2 | Disponível até dois usos simultâneos; depois, bloqueada |
| W | 0 | Continua disponível |

O bloqueio considera a quantidade de letras utilizadas, independentemente de estarem nas posições corretas. Remover uma ocorrência deverá liberar novamente a letra quando ela estiver abaixo do limite.

No modo individual, vogais base e suas variantes acentuadas serão contadas juntas para esse limite. Em **MAÇÃ**, o botão A permitirá dois usos, correspondentes ao A e ao Ã; o jogador aplicará o til na posição adequada. Aplicar ou remover o acento não cria um novo uso da vogal. Essa contagem não elimina a exigência de acentuação correta ao confirmar o palpite. C e Ç continuam separados.

Essa regra oferece uma pista indireta sobre a quantidade de ocorrências de uma letra e faz parte do comportamento desejado.

O limite de letras ausentes será o espaço disponível nos quadradinhos. Todas as formas de preenchimento deverão respeitar as mesmas regras.

### 9.4. Envio do palpite

A resposta só será conferida quando o jogador confirmar o envio. Preencher todos os espaços não provocará conferência automática.

Nos dois modos, o sistema impedirá o envio de palpites completos enquanto houver quadradinhos de letras vazios. Essa ação não contará como erro, não revelará outra dica, não alterará pontos e não passará a vez. Espaços e separadores já apresentados pelo sistema não contam como letras faltantes.

## 10. Dicas e tentativas

### 10.1. Revelação das dicas

- Toda rodada começa com a primeira dica visível.
- Cada resposta tem cinco dicas textuais em ordem fixa.
- O jogador pode enviar um palpite ou pedir outra dica.
- Pedir outra dica avança uma posição e reduz o valor possível do acerto.
- A interface destaca apenas a dica atual.
- Um botão permite consultar todas as dicas já reveladas.
- Consultar dicas anteriores não altera a dica atual nem recupera uma pontuação maior.

### 10.2. Resposta errada

Se houver uma próxima dica, um palpite incorreto deverá:

1. Mostrar um aviso de erro.
2. Revelar automaticamente a próxima dica.
3. Atualizar a pontuação disponível para o valor correspondente à nova dica.

Na quinta dica, o jogador poderá tentar quantas vezes quiser. Os erros não reduzirão o valor abaixo dos 20 pontos previstos para essa dica.

Não foi definida uma penalidade adicional por palpite errado além da mudança de faixa de pontuação ao avançar a dica.

No modo individual, as letras montadas serão **limpas após cada palpite incorreto**, inclusive na quinta dica, preservando o estágio das dicas. Essa limpeza não se aplica ao modo com a galera, em que posições corretas são fixadas.

### 10.3. Acerto e desistência

Ao acertar, o jogador recebe os pontos correspondentes à dica atual e conclui a rodada.

Ao desistir da palavra:

- A resposta correta é revelada.
- A rodada vale zero ponto.
- A partida pode seguir para a próxima resposta.

Não haverá limite de tempo por rodada ou partida, nem ajudas extras além das dicas previstas.

## 11. Pontuação

| Dica atual no momento do acerto | Pontos |
| --- | --- |
| Primeira | 100 |
| Segunda | 80 |
| Terceira | 60 |
| Quarta | 40 |
| Quinta | 20 |
| Desistência da palavra | 0 |

A pontuação será igual nas dificuldades fácil, média e difícil. A pontuação base da partida será a soma dos pontos das rodadas.

Exemplos:

- Acertar na primeira dica: 100 pontos.
- Errar na primeira dica e acertar na segunda: 80 pontos.
- Pedir dicas até a quarta e acertar: 40 pontos.
- Errar várias vezes na quinta e depois acertar: 20 pontos.
- Sair na terceira dica, retomar e acertar sem revelar outra: 60 pontos pela rodada, com desconto separado de 100 pontos pela pausa.

Não foram definidos bônus por sequência de acertos, velocidade ou dificuldade.

Cada pausa descontará **100 pontos da partida**, refletindo também no total acumulado do jogador e no ranking de pontos. A pontuação poderá ficar negativa.

**Pontuação da partida = soma dos pontos das rodadas − 100 × quantidade de pausas penalizadas.**

Abandonar definitivamente não gera um desconto adicional. Penalidades de pausas anteriores permanecem no saldo da partida abandonada.

## 12. Salvamento e retomada

### 12.1. Partida em andamento

No modo individual, cada jogador poderá ter **apenas uma partida não finalizada por vez**. Ela poderá ser retomada a qualquer momento, sem prazo de expiração. O jogador poderá iniciar uma partida com a galera mesmo tendo uma partida individual pausada, preservando integralmente o progresso salvo desta última. O modo com a galera não permite pausa voluntária com retomada; recargas e interrupções ambíguas têm a recuperação técnica da seção 15.6.

O sistema deverá permitir visualizar essa partida e continuar de onde o jogador parou.

Ao pausar, o progresso será preservado e a pontuação receberá o desconto previsto. A pausa não encerra definitivamente a partida, pois o jogador poderá continuar depois. Abandonar definitivamente encerra a partida e libera a criação de outra.

### 12.2. Estado a preservar

O salvamento deverá preservar, no mínimo:

- A configuração e a sequência de respostas da partida.
- As rodadas já concluídas e seus resultados.
- A rodada atual.
- A dica atual e quais dicas já foram reveladas.
- A pontuação já conquistada.
- Os dados necessários para manter consistentes as estatísticas.

Ao retomar, a pontuação possível da rodada continuará vinculada à dica em que o jogador estava. O sistema não deverá reiniciar a rodada na primeira dica.

A conservação das letras parcialmente preenchidas e dos palpites anteriores ainda não foi confirmada.

### 12.3. Saída, pausa e abandono

Os comportamentos serão distintos:

| Situação | Definição atual |
| --- | --- |
| Desistir de uma palavra | Revela a resposta, registra zero e permite seguir |
| Pausar pelo botão | Avisar sobre o desconto, solicitar confirmação e descontar 100 pontos se confirmado |
| Sair por ação confirmada ou navegar para outra página, inclusive Voltar/Avançar | Preservar o progresso como pausa e descontar 100 pontos uma única vez |
| Fechamento, perda de conexão ou suspensão cuja causa permaneça ambígua | Preservar o progresso sem desconto; ausência de sinais não basta para penalizar |
| Atualizar a página | Recuperar o progresso sem desconto |
| Abandonar definitivamente uma partida | Encerrar sem desconto adicional, manter pontos e acertos e liberar uma nova partida |

Na retomada após uma pausa penalizável, o aviso será informativo: o jogador não poderá recusar uma penalidade já devida. Uma mesma interrupção deverá gerar **um único desconto**, mesmo se o aviso for recarregado. Uma nova penalidade somente poderá ocorrer depois de o jogo ser efetivamente retomado e interrompido novamente. Quando não for possível distinguir fechamento de falha, preservar a partida sem desconto, conforme decisão da fase 13.

Na fase 13 foi aprovada a combinação de identidade de aba/documento, tipo de navegação, sinais do navegador e confirmação do servidor, com os limites registrados em Prova-interrupcoes.md. Uma recarga reconhecida não desconta pontos, mesmo quando lenta. Trocar de aba, ocultar ou minimizar a janela não conta como pausa. Voltar/Avançar após sair para outra página conta como saída; restaurar uma página pelo cache do navegador não elimina esse efeito. Ausências ambíguas não serão usadas para presumir saída ou penalizar falha da hospedagem.

Uma partida abandonada contará nas estatísticas de abandono, mas não no ranking de partidas concluídas. Pontos e acertos já registrados continuarão nas estatísticas e nos rankings correspondentes.

## 13. Resultados, histórico e estatísticas

### 13.1. Resultado da partida

Ao concluir a partida, o sistema deverá apresentar:

- Pontuação total.
- Quantidade de respostas acertadas.
- Quantidade de dicas utilizadas.
- Respostas das palavras das quais o jogador desistiu.

O detalhamento de como resumir as dicas utilizadas será definido juntamente com as estatísticas.

### 13.2. Histórico pessoal

O jogador terá uma tabela com suas partidas e seus resultados, permitindo comparar o próprio desempenho.

Abrir uma partida antiga para consultar cada palavra, todos os palpites e as dicas utilizadas **fica para uma versão futura**.

Os campos finais da tabela, os filtros e a ordenação ainda serão definidos.

O histórico privado do usuário autenticado também mostrará um resumo das partidas com a galera: participantes, pontuações, vencedor ou empate e indicação de desistência ou encerramento antecipado. Esses resultados ficarão separados das estatísticas e dos rankings individuais. Os convidados não terão histórico próprio, pois seus nomes existem apenas naquela partida.

### 13.3. Estatísticas pessoais

O perfil deverá reunir:

- Partidas concluídas e abandonadas.
- Palavras acertadas e palavras das quais desistiu.
- Total de pontos.
- Melhor pontuação.
- Média de dicas utilizadas para acertar.
- Desempenho por temática.
- Desempenho por dificuldade.
- Quantidade de tentativas erradas.

As fórmulas ainda deverão esclarecer como contabilizar respostas pertencentes a várias temáticas e o momento de atualização de cada estatística privada. Abandono definitivo será registrado pela ação de abandonar, sem confundi-lo com pausa. O momento de publicação no ranking está definido na seção 14.

## 14. Ranking público

Haverá comparação pessoal pelo histórico e **três rankings públicos gerais do modo individual**, sem divisão semanal ou mensal. O modo com a galera não terá ranking e seus resultados não alimentarão essas classificações:

1. Mais palavras acertadas.
2. Mais partidas concluídas.
3. Mais pontos acumulados.

Os dados públicos previstos são nome de usuário e indicadores usados na classificação. A inclusão de datas ainda será avaliada.

Jogadores com o mesmo resultado ocuparão a mesma posição no respectivo ranking, sem desempate por outra métrica. A sequência numérica após empates ainda poderá ser padronizada na apresentação. A demonstração vinculada à conta contará normalmente, sem publicação duplicada.

Resultados serão publicados nos rankings somente quando a partida individual for concluída ou abandonada definitivamente. Partidas em andamento ou pausadas não terão seus pontos, acertos ou penalidades contabilizados nos rankings até o encerramento. A publicação deverá ocorrer uma única vez por partida, sem duplicação por reenvio ou consulta do resultado.

Os rankings serão acumulativos, incluindo partidas de diferentes tamanhos e dificuldades. Partidas abandonadas manterão seus pontos e acertos, mas não contarão como concluídas. Os descontos por pausa afetarão o ranking de pontos, inclusive quando produzirem saldo negativo.

## 15. Modo com a galera

### 15.1. Participantes, partida e sessões

- Estará disponível na primeira entrega.
- Será inspirado no Roda a Roda, sem a roda.
- Terá de um a três participantes, utilizando o mesmo dispositivo.
- Um participante será o usuário autenticado; os demais escolherão nomes para aquela sessão, sem necessidade de contas próprias.
- O criador escolherá a quantidade de sessões, de uma até cinco por partida, ressalvada a sessão extra opcional de desempate.
- Cada sessão terá uma resposta por participante: uma pessoa joga com uma resposta, duas com duas respostas e três com três respostas.
- Todas as respostas da sessão aparecerão juntas em um painel compartilhado. Nenhuma resposta será exclusiva de um participante.
- O sistema sorteará a ordem de todos os participantes no início de cada sessão, incluindo quem começa.
- A dificuldade será única para toda a partida, escolhida na configuração inicial.
- As temáticas de todas as sessões serão configuradas antes do início, manualmente ou pelo modo aleatório descrito abaixo.
- Os nomes dos convidados deverão ser diferentes entre si e do nome do usuário autenticado naquela partida. Não precisam ser únicos fora da partida. Aplicar o formato de 3 a 20 caracteres e a comparação sem distinção de maiúsculas e acentos definidos na seção 5.1.

#### Configuração das temáticas

Na configuração manual, o criador escolherá a temática de cada sessão e a ordem em que elas serão jogadas. Todas as respostas de uma sessão pertencerão à temática daquela sessão.

Na configuração aleatória, o sistema sorteará uma temática para cada sessão, sem revelar antecipadamente a sequência aos participantes. A mesma temática poderá ser sorteada em mais de uma sessão. O momento técnico do sorteio poderá ser definido na implementação, preservando esse comportamento.

A temática da sessão atual será exibida como a única pista geral, sem dicas textuais adicionais.

### 15.2. Respostas e turnos

- Não haverá a sequência de cinco dicas do modo individual.
- A temática da sessão atual será exibida como pista geral.
- O participante poderá escolher uma letra para o painel inteiro ou selecionar uma resposta específica e tentar resolvê-la por completo.
- Acertar uma letra ou uma resposta completa mantém a vez do participante.
- Uma letra inexistente ou um palpite completo incorreto passa a vez ao próximo, seguindo a ordem sorteada.
- Um palpite completo incorreto passa a vez mesmo quando rende pontos por posições corretas.
- O ciclo se repete até todas as respostas da sessão serem descobertas. Depois, começa a próxima sessão com um novo sorteio de ordem, se houver sessões restantes.

### 15.3. Escolha de letras e bloqueio compartilhado

Escolher uma letra existente revela todas as ocorrências ainda ocultas dessa letra em todas as respostas do painel. Cada ocorrência recém-revelada vale **100 pontos**, creditados ao participante que fez a escolha.

Na escolha de uma letra isolada, a vogal base representa também suas variantes acentuadas: **A** corresponde a **A, Á, À, Â e Ã**; o mesmo princípio vale para as variantes de E, I, O e U. A letra revelada no painel mantém a grafia correta, com o acento original. Por exemplo, escolher **A** revela o **Ã** de **PÃO** e pontua essa posição normalmente.

Após revelar todas as ocorrências da família de uma vogal, a opção correspondente fica bloqueada para todos. Essa equivalência se aplica somente à ação de escolher uma letra: um palpite completo como **PAO** continua incorreto para a resposta **PÃO**. **C e Ç não são equivalentes**: escolher C não revela Ç e vice-versa.

Exemplo: no painel **CASA + MADEIRA**, escolher **A** revela quatro ocorrências e rende **400 pontos**, caso nenhuma delas estivesse revelada.

Após essa escolha, a letra ficará bloqueada para todos os participantes naquela sessão, pois todas as suas ocorrências já foram resolvidas. Uma letra tentada que não exista em nenhuma resposta também ficará bloqueada, valerá zero e passará a vez.

As posições reveladas ficam fixas e não poderão ser alteradas. O teclado virtual deverá refletir o bloqueio das letras. Tentativas de usar uma letra bloqueada pelo teclado físico deverão apresentar um aviso, sem gerar pontuação ou consumir o turno. O participante continuará com a vez para escolher uma ação válida.

### 15.4. Palpite completo e pontuação por posições

Um palpite completo será aplicado somente à resposta selecionada pelo participante.

- Se estiver correto, renderá **100 pontos por posição ainda oculta**, sem repetir a pontuação das letras já reveladas. O participante mantém a vez.
- Se estiver incorreto, somente as letras nas posições corretas ainda ocultas serão fixadas e renderão **100 pontos por posição**. O turno será passado ao próximo participante.
- O palpite incorreto não revelará automaticamente letras correspondentes nas outras respostas do painel.
- Letras reveladas parcialmente por um palpite continuarão disponíveis se ainda houver ocorrências ocultas no painel.
- Uma mesma posição não poderá render pontos mais de uma vez, mesmo para participantes diferentes.

Exemplo: se a resposta for **CASA** e o palpite for **CAMA**, com todas as posições inicialmente ocultas, serão fixados **C**, o primeiro **A** e o último **A**. O participante receberá 300 pontos e passará a vez. Resolver o **S** restante renderá somente 100 pontos a quem o fizer.

A interação entre letras fixas, entrada de palpites completos e teclado compartilhado deverá ser especificada na interface, preservando a possibilidade de preencher ocorrências ainda ocultas.

### 15.5. Resultado e desempate

Os pontos individuais serão acumulados ao longo das sessões. Ao final da partida, vence quem tiver a maior pontuação.

Em caso de empate na maior pontuação ao concluir normalmente as sessões regulares, o sistema oferecerá duas opções:

1. Aceitar o empate como resultado final.
2. Jogar uma única sessão extra para tentar desempatar.

Se a sessão extra for aceita e o empate persistir, o resultado final será empate, sem novas sessões extras. Essa sessão é uma exceção ao limite de cinco sessões regulares.

A sessão extra terá apenas os participantes empatados em primeiro lugar, uma resposta por participante e novo sorteio da ordem. Ela somente ocorrerá com a concordância de todos os empatados.

### 15.6. Desistência, interrupção e registro

- Haverá um botão de desistência que encerra a partida inteira, sem possibilidade de continuar depois.
- Ao desistir, vence quem tiver a maior pontuação acumulada naquele momento. Se houver empate na liderança, o resultado será empate definitivo, sem oferecer sessão extra.
- Esse modo não permitirá pausa voluntária com retomada e não terá ranking. A recuperação técnica de uma interrupção ambígua, aprovada na fase 13, é uma exceção para preservar o painel, não uma opção de pausar a partida.
- O sistema deverá registrar a desistência, os resultados dos participantes e quais respostas foram exibidas ou não chegaram a ser exibidas.
- Respostas destinadas a sessões não iniciadas não serão consideradas vistas. Elas poderão ser selecionadas aleatoriamente em outra partida, sem garantia de aparecer novamente.
- É necessário distinguir uma resposta exibida em uma sessão, mas não resolvida, de uma resposta que nunca foi apresentada.
- Ao desistir, as respostas pendentes da sessão atual serão reveladas sem pontuação adicional. As respostas de sessões não iniciadas permanecerão escondidas.
- Saída confirmada ou navegação para outra página, inclusive saída seguida de Voltar/Avançar, encerrará a partida pelo saldo atual, seguindo a regra de encerramento antecipado, sem retomada posterior. Quando não for possível distinguir fechamento de falha de conexão ou suspensão, o painel será preservado, conforme decisão da fase 13; não encerrar somente por ausência de sinais.
- Atualizar a página não encerrará a partida: o painel, a vez e as pontuações serão recuperados sem penalidade. Essa recuperação técnica não representa uma opção de pausa com retomada futura.
- A distinção técnica usa os sinais e limites documentados em Prova-interrupcoes.md. Recarga reconhecida recupera o painel; retorno ambíguo preserva o estado sem presumir encerramento. Sair para outra página é uma saída, mesmo que a página seja restaurada pelo cache do navegador. Falha da hospedagem não equivale a desistência do jogador.

### 15.7. Pontos ainda em aberto

Não haverá repetição de respostas entre sessões da mesma partida com a galera. Temáticas poderão se repetir. Normalização dos nomes e preservação em interrupções ambíguas já foram aprovadas; a integração técnica será realizada nas fases próprias. O histórico resumido desse modo foi aprovado conforme a seção 13.2.

As regras do modo individual, incluindo penalidade de pausa e pontuação por dica, não deverão ser aplicadas automaticamente a esse modo.

## 16. Requisitos funcionais consolidados

| ID | Requisito | Situação |
| --- | --- | --- |
| RF-01 | Permitir uma única demonstração por navegador, com três respostas fáceis e temáticas aleatórias, exigindo login para novas partidas | Infraestrutura implementada na fase 19; fluxo jogável na fase 26 |
| RF-02 | Autenticar pela conta Google | Definido |
| RF-03 | Transferir a demonstração ao histórico após entrada em seguida | Prazo de 7 dias e infraestrutura implementados na fase 19; fluxo jogável na fase 26 |
| RF-04 | Garantir unicidade de e-mail e nome de usuário | Definido |
| RF-05 | Permitir alterar nome de usuário e avatar da coleção | Definido |
| RF-06 | Configurar temática, dificuldade e partidas de três, cinco ou sete respostas | Definido |
| RF-07 | Permitir combinar quantidades e ordem das dificuldades | Definido |
| RF-08 | Oferecer distribuição aleatória de dificuldades | Definido; sorteio pendente |
| RF-09 | Priorizar conteúdo inédito e considerar visto ao apresentar a etapa, permitindo repetição de partidas anteriores ao esgotar inéditas | Definido; falta por dificuldade pendente |
| RF-10 | Oferecer alternativas quando faltar conteúdo mesmo após permitir respostas de partidas anteriores | Definido |
| RF-11 | Exibir quadradinhos e permitir arrastar, clicar ou digitar letras | Definido |
| RF-12 | Aplicar o bloqueio de letras pela quantidade de ocorrências | Definido |
| RF-13 | Conferir o palpite somente após confirmação | Definido |
| RF-14 | Revelar a primeira dica e permitir solicitar as seguintes | Definido |
| RF-15 | Mostrar a próxima dica após erro, até a quinta | Definido |
| RF-16 | Permitir tentativas ilimitadas na quinta dica | Definido |
| RF-17 | Permitir consultar dicas anteriores | Definido |
| RF-18 | Calcular a pontuação conforme a dica atual | Definido |
| RF-19 | Permitir desistir da palavra, revelar a resposta e registrar zero | Definido |
| RF-20 | Salvar e retomar uma única partida individual em andamento por jogador | Definido |
| RF-21 | Descontar 100 pontos por pausa/saída confirmada, sem duplicação; recarga e casos ambíguos não descontam | Política e prova técnica definidas; integração pendente |
| RF-22 | Apresentar resultado, histórico resumido e estatísticas privadas | Definido; cálculos pendentes |
| RF-23 | Apresentar rankings gerais individuais de acertos, partidas concluídas e pontos, com posição compartilhada nos empates e sem incluir o modo com a galera | Definido |
| RF-24 | Disponibilizar modo com a galera no mesmo dispositivo, com nomes de sessão e ordem sorteada | Primeira entrega confirmada; regras em detalhamento |
| RF-25 | Permitir abandono definitivo sem desconto adicional, preservando pontos e acertos e liberando nova partida | Definido |
| RF-26 | Permitir de um a três participantes e de uma a cinco sessões regulares no modo com a galera | Definido |
| RF-27 | Sortear a ordem a cada sessão e apresentar uma resposta por participante em painel compartilhado | Definido |
| RF-28 | Pontuar 100 por posição recém-revelada, sem duplicar pontos, e controlar turnos e bloqueios compartilhados | Definido |
| RF-29 | Oferecer empate ou uma única sessão extra apenas entre os líderes empatados, com concordância de todos | Definido |
| RF-30 | Encerrar a galera em saída confirmada, registrar resultado e distinguir respostas exibidas das não exibidas; preservar ambiguidades | Política definida; integração pendente |
| RF-31 | Configurar dificuldade única e temáticas por sessão antes da partida com a galera, com opção de sorteio oculto e repetição de temática | Definido |
| RF-32 | Encerrar a galera na saída confirmada; recuperar recarga e preservar painel em interrupções ambíguas | Política e prova técnica definidas; integração pendente |
| RF-33 | Exibir resumo das partidas com a galera no histórico privado do usuário autenticado, separado do desempenho individual | Definido |
| RF-34 | Importar conteúdo de arquivos JSON em lotes de 25, no contrato aprovado, com validação prévia | Definido; importador ainda não implementado |
| RF-35 | Exigir escolha de nome de usuário disponível e avatar no primeiro acesso com Google | Definido |
| RF-36 | Publicar resultados individuais nos rankings apenas na conclusão ou no abandono definitivo, sem duplicação | Definido |
| RF-37 | Permitir uma partida com a galera sem descartar uma partida individual pausada | Definido |
| RF-38 | Exigir nomes distintos entre todos os participantes da mesma partida com a galera | Definido; mesma normalização das contas |
| RF-39 | Converter letras e palpites para caixa alta preservando acentos, permitir aplicar acento após colocar a letra e exigir acentuação correta em palpites completos | Definido; detalhes de interface pendentes |
| RF-40 | Incluir a demonstração vinculada nas estatísticas e rankings individuais, sem duplicar a contabilização | Definido |
| RF-41 | No modo com a galera, escolher uma vogal base revela todas as ocorrências ainda ocultas dela e de suas variantes acentuadas | Definido |
| RF-42 | Tratar C e Ç como caracteres distintos nos dois modos, com opções próprias de entrada | Definido |
| RF-43 | Avisar sobre letra bloqueada sem pontuar ou passar a vez no modo com a galera | Definido |
| RF-44 | Impedir envio de palpites completos com posições vazias nos dois modos, sem contar erro ou aplicar efeitos de palpite incorreto | Definido |
| RF-45 | Limpar letras após palpite incorreto no modo individual, inclusive na quinta dica | Definido |
| RF-46 | Não repetir respostas entre sessões da mesma partida com a galera | Definido |
| RF-47 | Persistir preferências de tema, áudio e movimentos na conta de usuários autenticados e no navegador de visitantes | Definido |
| RF-48 | No individual, contar cada vogal base junto das variantes acentuadas para bloquear excesso de usos, preservando a validação exata dos acentos | Definido |
| RF-49 | Excluir identidade após aviso e EXCLUIR, conservar resultados anônimos no ranking e permitir recadastro do zero | Implementado na fase 17; interface do ranking em fase própria |

## 17. Qualidade e critérios técnicos a detalhar

A interface deverá manter consistência entre as formas de entrada e apresentar claramente erros, dicas reveladas, pontuação disponível e progresso salvo.

Como propostas técnicas para sustentar as regras de negócio:

- O backend deve validar os palpites e calcular os pontos, sem depender de valores enviados pela interface.
- Reenvios da mesma ação não devem duplicar pontos ou avançar dicas indevidamente.
- Dados privados devem ser acessíveis apenas ao dono da conta.
- A retomada deve recuperar o último estado confirmado da partida.

Computadores, celulares e tablets terão igual importância na experiência final. O desenvolvimento visual começará pelo computador, seguido da adaptação para celulares e tablets. Ainda precisam ser acordados: detalhes de acessibilidade, hospedagem, quantidade esperada de acessos simultâneos, metas de desempenho e tratamento de sessões em várias abas ou dispositivos.

A regra de bloqueio de letras exige atenção técnica: ela utiliza informação sobre a resposta correta. A implementação deverá conciliar esse comportamento com o grau desejado de proteção contra descoberta da resposta por inspeção do navegador, ainda a definir.

## 18. Dados e uso dos dois bancos

Os conceitos de dados identificados são:

| Conceito | Informações necessárias |
| --- | --- |
| Jogador | Identificação Google, e-mail, nome de usuário e avatar |
| Avatar | Imagem da coleção disponível para seleção |
| Temática | Identificação e nome da categoria |
| Resposta | Texto correto, dificuldade, temáticas e cinco dicas ordenadas |
| Partida | Dono, configuração, estado, progresso e pontuação |
| Rodada | Resposta selecionada, dica atual, resultado e pontos |
| Desempenho | Acertos, erros, desistências e indicadores para histórico e ranking |
| Demonstração | Dados temporários necessários à experiência e à transferência para a conta |

Essa relação é conceitual: não representa tabelas ou coleções já implementadas.

### 18.1. Divisão aprovada dos dados

| Banco | Responsabilidade | Situação |
| --- | --- | --- |
| MongoDB / Atlas | Catálogo de respostas, cinco dicas ordenadas, dificuldades e temáticas | Confirmado pelo responsável pelo projeto |
| PostgreSQL / Neon | Contas, perfis, referência ao avatar, partidas, participantes, rodadas, palpites, pontuação e penalidades | Confirmado |
| PostgreSQL / Neon | Histórico de respostas já jogadas e dados de origem das estatísticas e rankings | Confirmado |

A recomendação concentra os registros de progresso e pontuação no PostgreSQL para permitir que uma ação de jogo atualize seus registros relacionados de forma consistente. O MongoDB mantém os documentos de conteúdo, agrupando cada resposta com suas dicas.

As rodadas no PostgreSQL referenciarão o identificador estável da resposta no MongoDB. Não haverá chave estrangeira entre bancos: a API deverá verificar as referências. Não se recomenda manter pontuações oficiais duplicadas nos dois bancos.

Uma eventual cópia do conteúdo apresentado durante a rodada será tratada como registro daquela partida, caso seja necessária, e não como um segundo catálogo. A necessidade dessa cópia ainda será decidida.

Ainda será necessário estabelecer como iniciar uma partida com conteúdo válido e como preservar sua execução se o catálogo for alterado ou ficar indisponível. O modelo do modo com a galera dependerá das regras desse modo.

Referências dos serviços de destino: [Neon — plataforma PostgreSQL](https://github.com/neondatabase/neon) e [MongoDB — início com implantação local ou Atlas](https://www.mongodb.com/docs/get-started/).

O responsável confirmou que não há exigências adicionais dos professores além das já registradas nesta documentação. A apresentação será conjunta para Web II e Banco de Dados II. Eventuais novas orientações deverão ser incorporadas quando comunicadas.

## 19. Fluxos principais

### 19.1. Experimentar e criar conta

1. O visitante inicia a demonstração.
2. Joga três rodadas com temáticas aleatórias.
3. Recebe um convite para entrar com o Google.
4. Ao entrar em seguida, a demonstração passa a compor seu histórico.
5. Passa a ter acesso às configurações completas e ao acompanhamento pessoal.

### 19.2. Jogar uma partida individual

1. O jogador escolhe temática, dificuldade ou combinação e quantidade de respostas.
2. O sistema verifica a disponibilidade do conteúdo.
3. Se faltar conteúdo, apresenta as alternativas e aguarda a escolha.
4. A rodada começa com os quadradinhos e a primeira dica.
5. O jogador monta e confirma um palpite, solicita outra dica ou desiste da palavra.
6. O sistema aplica as regras de erro, acerto ou desistência.
7. O processo continua até todas as rodadas serem concluídas.
8. O sistema apresenta o resultado e atualiza histórico e estatísticas.

### 19.3. Retomar uma partida

1. O jogador acessa sua partida não finalizada.
2. O sistema recupera o progresso e a dica atual.
3. O jogador pode consultar as dicas anteriores e continuar.
4. Se houve pausa ou saída confirmada, o sistema apresenta o aviso e registra o desconto de 100 pontos uma única vez. Uma pausa já descontada não gera novo desconto na retomada. Recarga reconhecida e interrupção cuja causa permaneça ambígua preservam o progresso sem desconto.
5. Um acerto recebe os pontos da dica atual; a penalidade é contabilizada separadamente na pontuação da partida.

## 20. Exemplos para validação das regras

| Cenário | Resultado esperado |
| --- | --- |
| Iniciar uma rodada | Primeira dica visível; acerto vale 100 pontos |
| Errar na segunda dica | Mostrar terceira dica e atualizar o valor para 60 pontos |
| Pedir a quinta dica | Atualizar o valor para 20 pontos |
| Errar na quinta dica | Permitir nova tentativa sem avançar dica ou reduzir abaixo de 20 |
| Consultar a primeira dica após chegar à quarta | Manter quarta dica como estágio atual e valor de 40 pontos |
| Usar três letras A em ARARA | Bloquear novos usos de A |
| Retirar um dos três A de ARARA | Liberar o A novamente |
| Usar W em uma tentativa para ARARA | Não bloquear W por ausência na resposta |
| Desistir da palavra | Revelar resposta e registrar zero na rodada |
| Retomar na terceira dica e acertar | Registrar 60 pontos base para a rodada |
| Jogar novamente uma resposta após esgotar inéditas | Usar a tabela normal de pontos |
| Faltar conteúdo da temática | Pedir escolha antes de misturar temáticas ou reduzir a partida |
| Pausar pelo botão e confirmar com saldo de 60 pontos | Saldo passa a −40 pontos; progresso permanece salvo |
| Retomar a mesma interrupção e recarregar o aviso | Aplicar apenas um desconto pela interrupção |
| Atualizar a página durante a partida | Recuperar progresso sem desconto |
| Abandonar com saldo de −40 pontos | Encerrar com −40, preservar acertos e liberar nova partida |
| Desistir no modo com a galera | Encerrar, revelar somente respostas pendentes da sessão atual e declarar o líder ou empate definitivo |
| Sortear temáticas no modo com a galera | Ocultar sequência futura e permitir a mesma temática em sessões diferentes |
| Atualizar a página no modo com a galera | Recuperar painel, turno e pontos sem penalidade |
| Sair de forma confirmada no modo com a galera | Encerrar pelo saldo atual, sem permitir retomada |
| Interrupção ambígua nos dois modos | Preservar individual sem desconto e painel da galera |
| Tentar iniciar uma segunda demonstração como visitante | Bloquear a criação e solicitar login |
| Vincular uma demonstração concluída ao perfil | Preservar o registro e contabilizar seus resultados uma única vez |
| Enviar JAPAO quando a resposta é JAPÃO | Rejeitar o palpite por ausência de acento |
| Digitar japão | Converter para JAPÃO, preservando o acento |
| Cadastrar athos quando Athos já existe | Rejeitar por nome de usuário indisponível |
| Escolher A no modo com a galera com PÃO no painel | Revelar Ã, creditar 100 pontos pela posição e preservar o acento na exibição |
| Limpar os dados do navegador e iniciar outra demonstração | Possibilidade aceita; não exigir identificação rigorosa da pessoa |
| Escolher C quando a única ocorrência correspondente é Ç | Não revelar Ç; se não houver C, registrar letra inexistente e passar a vez |
| Tentar letra já bloqueada no modo com a galera | Mostrar aviso e manter a vez, sem pontos adicionais |
| Tentar enviar palpite com quadradinho vazio | Impedir envio sem erro, perda de pontos, avanço de dica ou passagem de vez |

## 21. Limites atuais e versões futuras

Ficam fora da versão atualmente definida:

- Cadastro de senha e recuperação de senha próprios.
- Alteração de e-mail pelo sistema.
- Upload de fotos pessoais para avatar.
- Dicas em imagem ou áudio.
- Limite de tempo e bônus por velocidade.
- Ajudas extras além das dicas.
- Área administrativa no site.
- Cadastro de respostas alternativas.
- Denúncias de conteúdo.
- Consulta detalhada de cada rodada de partidas antigas.

Sugestões de conteúdo por jogadores poderão ser discutidas em atualização futura. O modo com a galera está confirmado para a primeira entrega, com regras ainda em detalhamento. Participantes jogando em dispositivos separados não fazem parte da primeira entrega.

## 22. Decisões prioritárias em aberto

Antes de fechar a modelagem e implementar as regras, as principais decisões são:

1. **Interrupções:** política e prova aprovadas na fase 13: preservação nas dúvidas, recarga sem desconto e navegação para outra página como saída. Integrar às partidas e verificar em aparelhos físicos e hospedagem.
2. **Estatísticas privadas:** momento de atualização e cálculo de indicadores por temática; rankings já têm publicação definida no encerramento.
3. **Ranking:** apresentação da numeração após posições compartilhadas; empates já aprovados sem critério adicional.
4. **Seleção de conteúdo:** falta por dificuldade e tamanho mínimo de partida reduzida. Histórico visto já é compartilhado entre os modos para o anfitrião.
5. **Configuração:** critério do sorteio de distribuição entre as dificuldades selecionadas.
6. **Demonstração:** persistência do identificador por navegador, prazo de transferência e entrada com Google durante a partida.
7. **Entrada de respostas:** detalhes visuais de aplicação dos acentos e conservação das letras parcialmente preenchidas ao retomar.
8. **Contas:** decisões de nomes e exclusão resolvidas na fase 10, conforme seção 5. Implementar a exclusão com resultados anônimos e recadastro independente nas fases previstas.
9. **Dados e infraestrutura:** escolher hospedagem gratuita da API e da interface, implementar o importador no contrato aprovado e configurar o login Google.
10. **Modo com a galera:** concluir configuração do desempate e integrar interrupções conforme a fase 13; política de casos ambíguos e normalização dos nomes já aprovadas. Rever exigências acadêmicas se surgirem novas orientações.

O núcleo do modo individual está definido. Os pontos acima devem ser resolvidos sem transformar sugestões ou interpretações em regras definitivas.

## 23. Frontend e direção da experiência visual

### 23.1. Identidade

A interface deverá transmitir a experiência de um **jogo moderno e descontraído**, com cartões, ilustrações e uso intenso de animações. O menu inicial deverá ter acabamento visual de alto nível e funcionar como um menu de jogo.

A paleta aprovada para iniciar o frontend combina oliva, bege, amarelo e verde-lima: **#444439, #8B8669, #DECD9C, #E5E37D e #D4FE62**, com tons de apoio para leitura. O **modo claro será o padrão**; o usuário poderá alternar para o modo escuro. Os papéis de cada cor estão no [Guia visual](Guia-visual.md).

O nome escolhido para o jogo é **Decifra**. A tipografia escolhida usa **Bricolage Grotesque** nos títulos e **DM Sans** nos textos, controles e letras, com variações de tamanho, peso e itálico conforme o guia.

A marca visual aprovada na fase 04 segue o conceito **"O Bloco Decifrado"**:
- **Símbolo:** Um bloco quadrado de cantos arredondados contendo a letra `D`, com fundo verde-lima `#D4FE62` e contorno/letra oliva `#444439`, remetendo aos quadradinhos do jogo.
- **Tipografia do nome:** `ECIFRA` em caixa alta com Bricolage Grotesque (peso 800).
- **Versão Principal (Menu):** Símbolo `[ D ]` + `ECIFRA` com o subtítulo em DM Sans: *"O jogo de palavras e dicas"*.
- **Versão Compacta (Cabeçalho):** Ícone e texto em disposição horizontal com altura reduzida (32–36 px) para telas internas.
- **Favicon / Ícone de App:** O bloco `[ D ]` isolado, garantindo nitidez e contraste em pequenas dimensões.

### 23.2. Menu para visitantes

O menu inicial do visitante deverá conter:

- **Jogo rápido:** entrada para a única partida de demonstração permitida por navegador. Esse botão aparece apenas para quem não está autenticado.
- **Entrar com Google:** acesso à conta e ao conjunto completo de funcionalidades.
- Uma apresentação breve dos benefícios de criar conta, sem substituir o menu por uma longa página de apresentação.

Após consumir a demonstração, o menu deverá refletir o bloqueio de novas demonstrações e direcionar para o login. A apresentação exata desse estado ainda será desenhada.

### 23.3. Menu do jogador autenticado e arquitetura de rotas

Depois do login, o menu oferece acesso em cartões destacados aos dois modos de jogo e atalhos rápidos para perfil, rankings e configurações. Se houver uma partida individual pausada, um cartão de destaque "Continuar Partida" é exibido com o progresso salvo. O botão de demonstração não é exibido após a autenticação.

O mapa de navegação e as rotas abaixo foram definidos na fase 06. Os [protótipos navegáveis](Prototipos/LEIA-ME.md) foram produzidos e aprovados visualmente pelo responsável na revisão de 2026-10-27, após redesenho com aparência de jogo. A aprovação cobre a direção e os fluxos do protótipo; a implementação React, as integrações e as regras completas continuam nas fases próprias.

| Rota | Tela e Função |
| :--- | :--- |
| `/` | **Menu Inicial:** cartões de modos, demonstração (visitante) ou continuação de partida salva |
| `/primeiro-acesso` | **Boas-vindas:** escolha de nome de usuário único disponível e avatar da coleção oficial |
| `/jogar/demonstracao` | **Partida de Demonstração:** 3 palavras fáceis com temáticas sorteadas (1 vez por navegador) |
| `/jogar/individual/novo` | **Configuração Individual:** temáticas, 3/5/7 respostas e distribuição de dificuldades |
| `/jogar/individual` | **Rodada Individual:** cartão de dica, histórico, quadradinhos de letras e teclado virtual |
| `/jogar/galera/novo` | **Configuração da Galera:** 1 a 3 participantes, 1 a 5 sessões e escolha de temáticas |
| `/jogar/galera` | **Painel da Galera:** avatares com destaque da vez, 1 a 3 respostas e teclado compartilhado |
| `/rankings` | **Classificações Públicas:** abas de Palavras Acertadas, Partidas Concluídas e Pontos |
| `/perfil` | **Painel Pessoal:** histórico dos dois modos, estatísticas privadas e exclusão de conta |
| `/configuracoes` | **Preferências:** alternância de tema, 3 volumes de som, silenciar e redução de movimentos |

### 23.4. Animações e transições

O projeto deverá usar muitas animações, tanto na navegação quanto nas interações do jogo. Bibliotecas de animação poderão ser utilizadas para alcançar a experiência pretendida; nenhuma biblioteca específica foi escolhida.

Momentos a contemplar no desenho da experiência incluem botões, seleção de cartões, teclado virtual, preenchimento de letras, revelação de dicas, acertos, erros, mudanças de turno, sorteios e resultados.

Haverá uma opção para reduzir os movimentos. A duração das animações não deverá alterar regras de pontuação nem permitir ações duplicadas. A sequência de animações e o comportamento de bloqueio temporário dos controles ainda serão projetados.

### 23.5. Sons e preferências

A experiência terá muitos efeitos sonoros, incluindo botões, teclado e retornos de ações, além de acertos, erros, mudança de turno e vitória.

Haverá música de fundo durante a partida, com uma seleção de aproximadamente cinco faixas para o usuário escolher ou desativar. A seleção final de músicas e a existência de música também no menu ainda serão definidas.

Os estilos musicais escolhidos são **lo-fi e arcade**. A seleção poderá contemplar os dois estilos, sem definir neste momento a quantidade de faixas de cada um.

O usuário poderá desabilitar todos os sons ou apenas determinados grupos de efeitos. Os controles serão separados em **música**, **interface e teclado** e **eventos da partida**, com volume independente por grupo e uma opção geral para silenciar.

A origem das faixas e a permissão de uso e distribuição dos áudios precisarão ser verificadas ao preparar os recursos do projeto. Nenhuma música específica foi escolhida.

Animações e sons deverão acompanhar o retorno visual: informações necessárias para jogar não deverão depender exclusivamente da audição. A experiência também deverá funcionar com sons desativados e movimentos reduzidos.

As preferências de tema, música, volumes e redução de movimentos serão lembradas entre acessos. Para usuários autenticados, serão salvas na conta, permitindo recuperação em outros dispositivos. Para visitantes, serão salvas no navegador. Decisão D17 aprovada: conta nova herda as preferências do navegador; conta com preferências já salvas usa as da conta, inclusive em outro dispositivo. A inicialização não sobrescreve gravações concorrentes. Implementado na fase 17.

### 23.6. Dispositivos e adaptação

- Computador, celular e tablet terão igual importância na versão final.
- O código e o primeiro desenho da interface serão preparados para computador e depois adaptados aos demais tamanhos.
- Dicas, painel de respostas e teclado virtual precisarão continuar utilizáveis nas telas menores, inclusive com três respostas no modo com a galera.
- As alternativas de clicar e tocar serão essenciais para não depender exclusivamente de arrastar letras.
- O posicionamento dos controles, rolagem e organização do painel em cada tamanho ainda serão definidos.

#### Composição aprovada das telas de jogo

No modo individual, a dica ficará no alto, a resposta no centro e o teclado abaixo. No computador, pontuação e progresso poderão ocupar as laterais; no celular, a composição será organizada verticalmente.

No modo com a galera, os participantes aparecerão com avatar e placar no alto, com destaque claro para quem está na vez. As respostas ocuparão o centro do painel. Os convidados também poderão escolher um avatar da coleção para a partida, sem necessidade de perfil próprio.

### 23.7. Mascote

O jogo terá um mascote próprio como parte de sua identidade. A intenção é criar um personagem marcante, com muitas interações, movimentos e reações aos acontecimentos, e não apenas uma imagem estática.

A direção discutida é um **dicionário com braços, pernas e rosto**, atuando como apresentador do jogo. Um apresentador humano também foi cogitado, mas o dicionário é a proposta em desenvolvimento; o desenho final ainda será aprovado.

O mascote se chamará **Aurélio**. A escolha tem uma referência afetiva: o responsável pelo projeto se lembra do dicionário Aurélio que utilizava na infância. Essa inspiração no nome não define a reprodução da capa, do logotipo ou da identidade visual daquela publicação; o personagem terá desenho próprio.

O personagem será **2D**, expressivo, brincalhão, curioso, competitivo e um pouco atrapalhado. Ele participará do menu e das partidas, reagindo aos acontecimentos.

Na fase 04, foi aprovado o estilo **"O Apresentador Showman"**:
- **Design do personagem:** Dicionário clássico e carismático vestindo uma **gravata-borboleta verde-lima** (`#D4FE62`) com nozinho oliva, braços e pernas flexíveis estilo cartoon retrô-moderno, luvas e sapatos arredondados.
- **Referência visual aprovada:** a prancha [Aurélio — conceito 01](Identidade-visual/aurelio-conceito-01.png) foi apresentada e aprovada em 2026-10-27, junto ao [estudo da marca](Identidade-visual/marca-estudo.svg) e ao estilo dos avatares. O espaço entre o bloco D e ECIFRA foi reduzido pela metade conforme solicitado.
- **Estrutura SVG em camadas para animação:** Planejada em partes separadas (`corpo_capa`, `corpo_miolo`, `acessorio_gravata`, `rosto`, `membros`) para receber movimentos com Motion na fase 36. A prancha aprovada é uma imagem raster; as partes animáveis e os vinte arquivos individuais de avatar ainda serão produzidos nas fases próprias.
- **Repertório de expressões base:** Espera/neutro no menu, apresentação de dica com ar de mistério, comemoração de acerto com pulinho de vitória, reação ao erro com ombros encolhidos, e passagem de vez/sorteio de participante na galera.

O mascote seguirá a preferência de movimentos reduzidos e deverá ter presença compatível com o espaço disponível em celulares e tablets, preservando a leitura das dicas e o uso do teclado.

Ideias visuais para avaliação: abrir e fechar a capa como gesto, movimentar páginas, usar sobrancelhas expressivas, comemorar com pequenos saltos e apresentar os sorteios. Essas ideias não representam recursos já produzidos.

### 23.8. Próximas decisões de interface

1. Hierarquia e acabamento do menu com cartões e botões.
2. Detalhes de adaptação das telas de jogo e aplicação de acentos.
3. Estilo dos avatares e identidade do mascote animado.
4. Seleção final das músicas; conciliação de preferências definida e implementada na fase 17.
5. Ilustrações e linguagem das animações; aplicar a paleta e a tipografia aprovadas no guia visual, ajustando-as se necessário após avaliação das páginas reais.

## 24. Planejamento técnico

As bibliotecas, a arquitetura inicial e a sequência de implementação estão em [Planejamento-tecnico.md](Planejamento-tecnico.md). O planejamento foi aprovado pelo responsável pelo projeto. Sua aprovação não representa bibliotecas instaladas ou funcionalidades implementadas; versões e compatibilidade ainda serão verificadas na preparação do ambiente.

## 25. Regras para implementação por IA

O arquivo [AGENTS.md](../AGENTS.md), na raiz, aponta para [Agents/Regras.md](../Agents/Regras.md) como fonte das recomendações de desenvolvimento. Agentes que reconhecem esse arquivo deverão ler as regras antes de implementar.

Todo código controlado pelo projeto deverá usar português, incluindo banco, API, interface, testes e documentação, respeitando palavras reservadas e contratos externos. O guia detalha convenções de nomes, arquitetura, integridade dos dados, segurança, acessibilidade, dependências, testes e colaboração.

Por decisão aprovada em 2026-10-28, **a partir da fase 15 o desenvolvimento seguirá TDD e aplicação obrigatória de SOLID**. Comportamentos executáveis novos ou alterados serão desenvolvidos com teste primeiro, falha esperada, implementação e refatoração; o código será organizado por responsabilidades e contratos, conforme [Agents/Regras.md](../Agents/Regras.md). Essa decisão vale para as próximas fases e não declara que as fases anteriores seguiram TDD. Conteúdo editorial e recursos visuais mantêm suas revisões específicas, além dos testes do código que os manipula.

O planejamento de pastas foi ajustado para essas convenções. Ferramentas que não carreguem `AGENTS.md` automaticamente deverão receber a orientação de ler os arquivos; a presença do arquivo não garante, por si só, que qualquer ferramenta externa siga as instruções.

## 26. Roteiro da primeira entrega

O roteiro de acompanhamento da primeira entrega é mantido apenas localmente, fora do versionamento. Ele detalha 49 fases, com dependências, tarefas, critérios de conclusão e momentos para decisões do responsável pelo projeto. Inclui os dois modos e intercala vinte lotes de 25 respostas durante o desenvolvimento.

O calendário de sete dias é uma referência ajustável de organização, não um novo prazo de entrega aprovado. A fase final de validação depende de completar e revisar as 500 respostas e suas 2.500 dicas. O andamento real dos lotes será registrado em [Controle-do-catalogo.md](Controle-do-catalogo.md).
