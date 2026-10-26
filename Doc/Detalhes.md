# Detalhes do projeto

Documento de requisitos e regras de negócio do jogo de adivinhação de palavras desenvolvido para as disciplinas de **Web II e Banco de Dados II**.

**Última atualização:** 26 de outubro de 2026.

**Nome do projeto:** a definir.

**Prazo estimado informado:** aproximadamente um mês até a entrega.

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

O objetivo é publicar o jogo na web, utilizando Neon e MongoDB Atlas, com **custo zero de hospedagem**. Os serviços da interface e da API ainda serão escolhidos, verificando limites e condições dos planos gratuitos antes da publicação.

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

A limitação será **por navegador**, com identificação persistida no navegador e controle correspondente no backend. Não será exigido rastreamento rigoroso da pessoa: limpar os dados ou usar outro navegador poderá permitir uma nova demonstração, limitação aceita pelo responsável pelo projeto. O mecanismo específico de persistência ainda será escolhido na implementação.

O sistema apresentará um convite para entrar com o Google, explicando que isso libera o controle completo das configurações e o acompanhamento do progresso. Esse convite poderá aparecer durante a experiência ou ao final; o momento exato ainda será definido.

Se o visitante entrar com o Google logo após a partida de demonstração, ela deverá ser incorporada ao seu histórico.

A única partida de demonstração deverá ter seu registro completo associado ao perfil, sem descartar seu progresso e resultado na vinculação. Seus resultados contarão nas estatísticas individuais e nos rankings como uma partida normal, respeitando a publicação somente após conclusão ou abandono definitivo e sem duplicar resultados ao vincular a conta. Isso não altera o escopo de consulta do histórico: a tela detalhada de cada rodada continua prevista para uma versão futura.

Ainda precisam ser definidos:

- O prazo de conservação dos dados da demonstração para transferência à conta.
- O comportamento se o visitante entrar com o Google antes de terminar a demonstração.

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
- O formato permitido para nomes e o tratamento de acentos nessa comparação ainda serão definidos. Essa regra é independente da exigência de acentos nas respostas do jogo.

### 5.2. Avatares

O sistema disponibilizará um pacote de imagens temáticas para escolha do avatar, em uma experiência semelhante à seleção de perfis da Netflix.

A personalização prevista é selecionar uma imagem da coleção da plataforma. Envio de imagens próprias não faz parte do escopo definido.

### 5.3. Privacidade

O perfil, o histórico e as estatísticas pessoais serão privados. Haverá uma classificação pública com informações limitadas, como nome de usuário e indicadores de desempenho.

A exposição de datas no ranking foi sugerida, mas ainda não foi confirmada. E-mail e histórico detalhado não integram a proposta de informações públicas.

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

A pasta `Agents/` é ignorada pelo Git atualmente; portanto, esse guia será apenas local enquanto essa configuração for mantida. Os lotes de conteúdo deverão ficar em uma pasta versionada separada, proposta como `data/palavras/`.

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

Uma resposta não poderá aparecer duas vezes dentro da mesma partida. O sistema reutilizará respostas de partidas anteriores quando necessário e somente oferecerá as alternativas abaixo se, mesmo assim, não houver respostas distintas suficientes para atender à configuração.

Se faltar conteúdo para atender à configuração, o sistema deverá avisar e oferecer estas alternativas:

1. Autorizar a inclusão de respostas de outras temáticas.
2. Jogar com a quantidade de respostas disponível.
3. Desistir de iniciar a partida.

A mudança de temática dependerá da escolha do jogador e não deverá ocorrer silenciosamente.

Ainda precisam ser definidos:

- O que torna uma resposta “já jogada”: ter sido exibida, ter sido concluída ou outro critério.
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

A exigência de acentos vale para palpites completos. No modo com a galera, a escolha isolada de uma letra segue a equivalência entre vogais definida na seção 15.3. **C e Ç são caracteres distintos nos dois modos** e terão opções próprias no teclado virtual. O bloqueio de variantes acentuadas no modo individual e a apresentação de hífens ainda precisam ser definidos.

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

Ainda será decidido se as letras montadas permanecem nos quadradinhos ou são limpas depois de um erro.

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

No modo individual, cada jogador poderá ter **apenas uma partida não finalizada por vez**. Ela poderá ser retomada a qualquer momento, sem prazo de expiração. O jogador poderá iniciar uma partida com a galera mesmo tendo uma partida individual pausada, preservando integralmente o progresso salvo desta última. O modo com a galera não permite retomada.

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
| Fechar a aba ou janela, ou perder a conexão | Preservar o progresso; ao retomar, avisar sobre o desconto de 100 pontos pela interrupção |
| Atualizar a página | Recuperar o progresso sem desconto |
| Abandonar definitivamente uma partida | Encerrar sem desconto adicional, manter pontos e acertos e liberar uma nova partida |

Na retomada após interrupção, o aviso será informativo: o jogador não poderá recusar a penalidade. Uma mesma interrupção deverá gerar **um único desconto**, mesmo se o aviso for recarregado. Uma nova penalidade somente poderá ocorrer depois de o jogo ser efetivamente retomado e interrompido novamente.

O mecanismo técnico para distinguir atualização de página, fechamento e perda de conexão será definido no backend e na integração com a interface. A regra exige essa distinção e não autoriza penalizar uma simples atualização.

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

Os critérios de desempate dos rankings ainda serão escolhidos. A demonstração vinculada à conta contará normalmente, sem publicação duplicada.

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
- Os nomes dos convidados deverão ser diferentes entre si e do nome do usuário autenticado naquela partida. Não precisam ser únicos fora da partida. A comparação ignorará diferenças entre maiúsculas e minúsculas; o tratamento de acentos nos nomes ainda será definido.

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
- Esse modo não permitirá pausa com retomada e não terá ranking.
- O sistema deverá registrar a desistência, os resultados dos participantes e quais respostas foram exibidas ou não chegaram a ser exibidas.
- Respostas destinadas a sessões não iniciadas não serão consideradas vistas. Elas poderão ser selecionadas aleatoriamente em outra partida, sem garantia de aparecer novamente.
- É necessário distinguir uma resposta exibida em uma sessão, mas não resolvida, de uma resposta que nunca foi apresentada.
- Ao desistir, as respostas pendentes da sessão atual serão reveladas sem pontuação adicional. As respostas de sessões não iniciadas permanecerão escondidas.
- Fechar a aba ou a janela do jogo encerrará a partida. O sistema deverá registrar a interrupção e o resultado pelo saldo atual, seguindo a regra de encerramento antecipado, sem retomada posterior.
- Atualizar a página não encerrará a partida: o painel, a vez e as pontuações serão recuperados sem penalidade. Essa recuperação técnica não representa uma opção de pausa com retomada futura.
- O mecanismo técnico de distinção entre atualização e fechamento ainda será definido. Perda de conexão e falha do navegador também precisam ter seu tratamento detalhado, sem serem equiparadas silenciosamente à atualização.

### 15.7. Pontos ainda em aberto

Repetição de conteúdo entre sessões, tratamento de perda de conexão e normalização dos nomes dos participantes ainda precisam ser definidos. O histórico resumido desse modo foi aprovado conforme a seção 13.2.

As regras do modo individual, incluindo penalidade de pausa e pontuação por dica, não deverão ser aplicadas automaticamente a esse modo.

## 16. Requisitos funcionais consolidados

| ID | Requisito | Situação |
| --- | --- | --- |
| RF-01 | Permitir uma única demonstração por navegador, com três respostas fáceis e temáticas aleatórias, exigindo login para novas partidas | Definido; persistência técnica a implementar |
| RF-02 | Autenticar pela conta Google | Definido |
| RF-03 | Transferir a demonstração ao histórico após entrada em seguida | Definido; prazo pendente |
| RF-04 | Garantir unicidade de e-mail e nome de usuário | Definido |
| RF-05 | Permitir alterar nome de usuário e avatar da coleção | Definido |
| RF-06 | Configurar temática, dificuldade e partidas de três, cinco ou sete respostas | Definido |
| RF-07 | Permitir combinar quantidades e ordem das dificuldades | Definido |
| RF-08 | Oferecer distribuição aleatória de dificuldades | Definido; sorteio pendente |
| RF-09 | Priorizar conteúdo inédito e permitir repetição ao esgotá-lo | Definido; critérios pendentes |
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
| RF-21 | Descontar 100 pontos por pausa, sem duplicar a mesma interrupção ou penalizar atualização da página | Definido; detecção técnica pendente |
| RF-22 | Apresentar resultado, histórico resumido e estatísticas privadas | Definido; cálculos pendentes |
| RF-23 | Apresentar rankings gerais individuais de acertos, partidas concluídas e pontos, excluindo o modo com a galera | Definido; desempates pendentes |
| RF-24 | Disponibilizar modo com a galera no mesmo dispositivo, com nomes de sessão e ordem sorteada | Primeira entrega confirmada; regras em detalhamento |
| RF-25 | Permitir abandono definitivo sem desconto adicional, preservando pontos e acertos e liberando nova partida | Definido |
| RF-26 | Permitir de um a três participantes e de uma a cinco sessões regulares no modo com a galera | Definido |
| RF-27 | Sortear a ordem a cada sessão e apresentar uma resposta por participante em painel compartilhado | Definido |
| RF-28 | Pontuar 100 por posição recém-revelada, sem duplicar pontos, e controlar turnos e bloqueios compartilhados | Definido |
| RF-29 | Oferecer empate ou uma única sessão extra apenas entre os líderes empatados, com concordância de todos | Definido |
| RF-30 | Encerrar a partida com a galera ao desistir, registrar o resultado e distinguir respostas exibidas das não exibidas, sem retomada | Definido; detalhes de interrupções pendentes |
| RF-31 | Configurar dificuldade única e temáticas por sessão antes da partida com a galera, com opção de sorteio oculto e repetição de temática | Definido |
| RF-32 | Encerrar o modo com a galera ao fechar a aba, mas recuperar a partida sem penalidade ao atualizar a página | Definido; distinção técnica pendente |
| RF-33 | Exibir resumo das partidas com a galera no histórico privado do usuário autenticado, separado do desempenho individual | Definido |
| RF-34 | Importar conteúdo de arquivos JSON em lotes de 25, no contrato aprovado, com validação prévia | Definido; importador ainda não implementado |
| RF-35 | Exigir escolha de nome de usuário disponível e avatar no primeiro acesso com Google | Definido |
| RF-36 | Publicar resultados individuais nos rankings apenas na conclusão ou no abandono definitivo, sem duplicação | Definido |
| RF-37 | Permitir uma partida com a galera sem descartar uma partida individual pausada | Definido |
| RF-38 | Exigir nomes distintos entre todos os participantes da mesma partida com a galera | Definido; normalização pendente |
| RF-39 | Converter letras e palpites para caixa alta preservando acentos, permitir aplicar acento após colocar a letra e exigir acentuação correta em palpites completos | Definido; detalhes de interface e bloqueio individual pendentes |
| RF-40 | Incluir a demonstração vinculada nas estatísticas e rankings individuais, sem duplicar a contabilização | Definido |
| RF-41 | No modo com a galera, escolher uma vogal base revela todas as ocorrências ainda ocultas dela e de suas variantes acentuadas | Definido |
| RF-42 | Tratar C e Ç como caracteres distintos nos dois modos, com opções próprias de entrada | Definido |
| RF-43 | Avisar sobre letra bloqueada sem pontuar ou passar a vez no modo com a galera | Definido |
| RF-44 | Impedir envio de palpites completos com posições vazias nos dois modos, sem contar erro ou aplicar efeitos de palpite incorreto | Definido |

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

Também deverão ser verificadas eventuais exigências adicionais dos professores sobre o uso dos bancos e as entregas acadêmicas.

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
4. Se houve fechamento ou perda de conexão, o sistema apresenta o aviso e registra o desconto de 100 pontos uma única vez pela interrupção. Uma pausa já confirmada e descontada pelo botão não gera novo desconto na retomada.
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
| Fechar a aba no modo com a galera | Encerrar a partida, sem permitir retomada |
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

1. **Detecção de interrupções:** como distinguir fechamento, perda de conexão e atualização, garantindo um desconto por pausa.
2. **Estatísticas privadas:** momento de atualização e cálculo de indicadores por temática; rankings já têm publicação definida no encerramento.
3. **Ranking:** critérios de desempate; demonstração vinculada já tem contabilização aprovada.
4. **Seleção de conteúdo:** quando considerar uma resposta já jogada, falta por dificuldade e tamanho mínimo de partida reduzida.
5. **Configuração:** critério do sorteio de distribuição entre as dificuldades selecionadas.
6. **Demonstração:** persistência do identificador por navegador, prazo de transferência e entrada com Google durante a partida.
7. **Entrada de respostas:** detalhes de aplicação dos acentos, bloqueio de variantes no individual e manutenção das letras após erro ou retomada.
8. **Contas:** formato e tratamento de acentos nos nomes, preservando a comparação sem distinção de maiúsculas; eventual exclusão de conta e seus dados.
9. **Dados e infraestrutura:** escolher hospedagem gratuita da API e da interface, implementar o importador no contrato aprovado e configurar o login Google.
10. **Modo com a galera:** concluir repetição de conteúdo, tratamento de perda de conexão e normalização dos nomes; verificar também exigências adicionais das disciplinas.

O núcleo do modo individual está definido. Os pontos acima devem ser resolvidos sem transformar sugestões ou interpretações em regras definitivas.

## 23. Frontend e direção da experiência visual

### 23.1. Identidade

A interface deverá transmitir a experiência de um **jogo moderno e descontraído**, com cartões, ilustrações e uso intenso de animações. O menu inicial deverá ter acabamento visual de alto nível e funcionar como um menu de jogo.

A paleta ainda será criada. A intenção é usar uma combinação marcante, diferenciada e coerente entre os modos claro e escuro, em vez de adotar uma aparência genérica. O **modo claro será o padrão**; o usuário poderá alternar para o modo escuro.

O nome, a marca, a tipografia, o estilo das ilustrações e os valores finais das cores ainda serão definidos. O estilo de programa de auditório não foi escolhido como direção principal.

### 23.2. Menu para visitantes

O menu inicial do visitante deverá conter:

- **Jogo rápido:** entrada para a única partida de demonstração permitida por navegador. Esse botão aparece apenas para quem não está autenticado.
- **Entrar com Google:** acesso à conta e ao conjunto completo de funcionalidades.
- Uma apresentação breve dos benefícios de criar conta, sem substituir o menu por uma longa página de apresentação.

Após consumir a demonstração, o menu deverá refletir o bloqueio de novas demonstrações e direcionar para o login. A apresentação exata desse estado ainda será desenhada.

### 23.3. Menu do jogador autenticado

Depois do login, o menu oferecerá acesso a:

- Modo individual.
- Modo com a galera.
- Configurações.
- Alternância entre tema claro e escuro.
- Perfil e personalização.
- Rankings individuais.

Histórico, estatísticas e retomada da partida individual também precisarão de acesso na navegação; sua posição final ainda será definida. O botão de demonstração não será exibido após a autenticação.

A composição combinará cartões grandes para destacar as opções principais com botões de menu para os demais acessos. A hierarquia e o posicionamento exatos serão definidos no desenho das telas.

### 23.4. Animações e transições

O projeto deverá usar muitas animações, tanto na navegação quanto nas interações do jogo. Bibliotecas de animação poderão ser utilizadas para alcançar a experiência pretendida; nenhuma biblioteca específica foi escolhida.

Momentos a contemplar no desenho da experiência incluem botões, seleção de cartões, teclado virtual, preenchimento de letras, revelação de dicas, acertos, erros, mudanças de turno, sorteios e resultados.

Haverá uma opção para reduzir os movimentos. A duração das animações não deverá alterar regras de pontuação nem permitir ações duplicadas. A sequência de animações e o comportamento de bloqueio temporário dos controles ainda serão projetados.

### 23.5. Sons e preferências

A experiência terá muitos efeitos sonoros, incluindo botões, teclado e retornos de ações, além de acertos, erros, mudança de turno e vitória.

Haverá música de fundo durante a partida, com uma seleção de aproximadamente cinco faixas para o usuário escolher ou desativar. A seleção final de músicas e a existência de música também no menu ainda serão definidas.

O usuário poderá desabilitar todos os sons ou apenas determinados grupos de efeitos. Os controles serão separados em **música**, **interface e teclado** e **eventos da partida**, com volume independente por grupo e uma opção geral para silenciar.

A origem das faixas e a permissão de uso e distribuição dos áudios precisarão ser verificadas ao preparar os recursos do projeto. Nenhuma música específica foi escolhida.

Animações e sons deverão acompanhar o retorno visual: informações necessárias para jogar não deverão depender exclusivamente da audição. A experiência também deverá funcionar com sons desativados e movimentos reduzidos.

A persistência das preferências entre visitas e dispositivos ainda será definida.

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

A espécie ou forma do personagem, aparência, personalidade, nome e técnica de animação ainda serão definidos. Sua presença no menu e nas telas de partida também será planejada.

Possíveis reações para o estudo de animação incluem espera, recepção, comemoração de acerto, reação ao erro, mudança de turno e resultado final. Essa lista é uma proposta de repertório, não um conjunto de animações já produzido ou aprovado individualmente.

O mascote seguirá a preferência de movimentos reduzidos e deverá ter presença compatível com o espaço disponível em celulares e tablets, preservando a leitura das dicas e o uso do teclado.

### 23.8. Próximas decisões de interface

1. Hierarquia e acabamento do menu com cartões e botões.
2. Detalhes de adaptação das telas de jogo e aplicação de acentos.
3. Estilo dos avatares e identidade do mascote animado.
4. Seleção das músicas e persistência das preferências de áudio e tema.
5. Paleta, tipografia, ilustrações e linguagem das animações.
