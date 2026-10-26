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

O detalhamento atual concentra-se no modo individual. A inclusão do modo com a galera na primeira entrega ainda precisa ser confirmada.

## 2. Base técnica e restrições

| Camada | Definição |
| --- | --- |
| Interface | React |
| Backend | Python com FastAPI |
| Banco relacional | Obrigatório; produto a definir |
| Banco não relacional | Obrigatório; produto a definir |
| Autenticação | Conta Google |
| Idioma do jogo | Português |

Os dois bancos deverão fazer parte da solução. A escolha dos produtos e a divisão das responsabilidades entre eles ainda não foram definidas.

Não haverá senha própria da plataforma. A autenticação e a recuperação de acesso serão realizadas pelo Google.

## 3. Vocabulário do domínio

| Termo | Significado |
| --- | --- |
| Resposta | Palavra ou expressão que o jogador precisa descobrir |
| Rodada | Etapa da partida dedicada a uma resposta |
| Partida | Conjunto de rodadas com uma configuração inicial |
| Temática | Categoria associada à resposta, como animais ou filmes |
| Dica | Texto que aproxima o jogador da resposta |
| Palpite | Resposta montada e enviada para conferência |
| Dificuldade | Classificação fácil, média ou difícil atribuída à resposta no cadastro |
| Visitante | Pessoa que ainda não entrou com uma conta Google |
| Jogador autenticado | Pessoa identificada pela conta Google e com perfil na plataforma |

## 4. Perfis de acesso

### 4.1. Visitante

O visitante poderá experimentar uma partida com **três respostas e temáticas aleatórias**.

O sistema apresentará um convite para entrar com o Google, explicando que isso libera o controle completo das configurações e o acompanhamento do progresso. Esse convite poderá aparecer durante a experiência ou ao final; o momento exato ainda será definido.

Se o visitante entrar com o Google logo após a partida de demonstração, ela deverá ser incorporada ao seu histórico.

Ainda precisam ser definidos:

- A dificuldade das respostas da demonstração.
- Se o visitante poderá repetir a demonstração e quais limites existirão.
- O prazo de conservação dos dados da demonstração para transferência à conta.
- O comportamento se o visitante entrar com o Google antes de terminar a demonstração.
- Se a pontuação da demonstração transferida contará para o ranking público.

### 4.2. Jogador autenticado

O jogador autenticado poderá configurar partidas, acompanhar o histórico e as estatísticas, personalizar o perfil e retomar uma partida não finalizada.

Cada conta terá e-mail e nome de usuário únicos. Como a entrada ocorre pelo Google, o momento de escolha do nome de usuário ainda precisa ser definido.

## 5. Conta, perfil e privacidade

### 5.1. Identificação

- O acesso será feito exclusivamente pela conta Google.
- O e-mail será único e não poderá ser alterado pela interface da plataforma.
- O nome de usuário será único e poderá ser alterado.
- Não haverá cadastro, alteração ou recuperação de senha própria.
- O formato permitido para nomes de usuário e as regras de comparação de unicidade ainda serão definidos.

### 5.2. Avatares

O sistema disponibilizará um pacote de imagens temáticas para escolha do avatar, em uma experiência semelhante à seleção de perfis da Netflix.

A personalização prevista é selecionar uma imagem da coleção da plataforma. Envio de imagens próprias não faz parte do escopo definido.

### 5.3. Privacidade

O perfil, o histórico e as estatísticas pessoais serão privados. Haverá uma classificação pública com informações limitadas, como nome de usuário e indicadores de desempenho.

A exposição de datas no ranking foi sugerida, mas ainda não foi confirmada. E-mail e histórico detalhado não integram a proposta de informações públicas.

## 6. Conteúdo do jogo

### 6.1. Respostas e temáticas

As respostas poderão ser palavras únicas ou expressões que representem uma unidade, como o título de filme **Star Wars**.

Temáticas iniciais sugeridas:

- Animais.
- Objetos.
- Profissões.
- Tecnologia.
- Filmes.
- Outras categorias a definir durante a preparação do conteúdo.

Uma mesma resposta poderá pertencer a mais de uma temática.

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

Não haverá área administrativa no site nesta versão. O processo para preparar e carregar o conteúdo nos bancos ainda será definido.

Sugestões de conteúdo por jogadores poderão ser discutidas em uma atualização futura. Denúncias de dicas ou respostas não fazem parte da versão atual.

A desativação de palavras não foi aprovada como requisito. Esse recurso poderia servir, por exemplo, para retirar temporariamente uma resposta com erro, mas sua necessidade ainda será avaliada.

Não está previsto um fluxo de edição de conteúdo durante partidas em andamento. O comportamento diante de uma eventual correção direta nos bancos ainda precisa ser definido, caso essa operação seja permitida.

## 7. Configuração da partida individual

### 7.1. Configuração básica

Antes de começar, o jogador poderá escolher:

- Uma temática ou a opção de temáticas aleatórias.
- A dificuldade.
- A quantidade de respostas da partida.

As quantidades inicialmente consideradas são **três, cinco e possivelmente sete respostas**. A opção de sete ainda deve ser confirmada.

No modo de temáticas aleatórias, as respostas poderão pertencer a categorias diferentes, respeitando a dificuldade ou a distribuição de dificuldades escolhida.

A configuração ficará fixa durante a partida.

### 7.2. Combinação de dificuldades

Além da configuração básica, o jogador poderá combinar dificuldades e determinar quantas respostas haverá de cada nível.

Exemplo: em uma partida com sete respostas, escolher três fáceis e quatro médias.

Também poderá definir a ordem das dificuldades. Por exemplo: fácil, médio, fácil, médio, médio, fácil e médio.

Haverá ainda a possibilidade de deixar o sistema sortear a quantidade de respostas de cada dificuldade. O critério desse sorteio e a possibilidade de restringi-lo a níveis selecionados ainda precisam ser definidos.

Foi sugerida uma experiência de dificuldade crescente. A existência de uma opção específica que ordene automaticamente as dificuldades ainda precisa ser confirmada; a ordenação manual já faz parte da proposta.

### 7.3. Validações da configuração

A soma das quantidades por dificuldade deverá corresponder ao total de respostas da partida. Uma ordem personalizada deverá respeitar essa mesma distribuição.

Antes de iniciar, o sistema deverá verificar se há conteúdo suficiente para atender à configuração escolhida.

## 8. Seleção e repetição de respostas

O sistema deverá priorizar respostas que o jogador ainda não jogou. Quando as opções inéditas acabarem, respostas anteriores poderão ser repetidas, com a mesma pontuação normal.

Se faltar conteúdo para atender à configuração, o sistema deverá avisar e oferecer estas alternativas:

1. Autorizar a inclusão de respostas de outras temáticas.
2. Jogar com a quantidade de respostas disponível.
3. Desistir de iniciar a partida.

A mudança de temática dependerá da escolha do jogador e não deverá ocorrer silenciosamente.

Ainda precisam ser definidos:

- O que torna uma resposta “já jogada”: ter sido exibida, ter sido concluída ou outro critério.
- Se uma resposta poderá aparecer duas vezes dentro da mesma partida.
- A prioridade entre repetir respostas já jogadas e oferecer as alternativas por falta de conteúdo.
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
- A ação de sair da partida, cujo nome e efeito final ainda serão definidos.

A pontuação disponível deverá ficar clara, especialmente quando diminuir após a revelação de uma nova dica.

### 9.2. Formas de preenchimento

O jogador poderá preencher a resposta por três formas:

1. Arrastando letras para os quadradinhos.
2. Clicando nas letras do alfabeto.
3. Digitando pelo teclado.

Será possível remover e substituir letras antes de confirmar.

Espaços de expressões aparecerão separados. Acentos e hífens serão tratados automaticamente na apresentação, permitindo o uso do alfabeto básico. Os detalhes de comparação da resposta e a apresentação de caracteres como “ç” ainda precisam ser especificados.

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

O comportamento do botão de confirmação quando houver espaços vazios ainda precisa ser definido.

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
- Sair na terceira dica, retomar e acertar sem revelar outra: 60 pontos, antes de eventual penalidade por saída.

Não foram definidos bônus por sequência de acertos, velocidade ou dificuldade.

O jogador manifestou interesse em descontar pontos ao sair de uma partida não concluída. **O valor, a incidência e os limites dessa penalidade ainda não estão definidos.** Portanto, os exemplos acima descrevem a pontuação base e não fixam o cálculo final após saídas.

## 12. Salvamento e retomada

### 12.1. Partida em andamento

Cada jogador poderá ter **apenas uma partida não finalizada por vez**. Ela poderá ser retomada a qualquer momento, sem prazo de expiração.

O sistema deverá permitir visualizar essa partida e continuar de onde o jogador parou.

Ao sair, a pontuação conquistada será preservada. A saída não deverá ser tratada automaticamente como encerramento definitivo, pois o jogador poderá continuar depois.

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

É necessário distinguir os seguintes comportamentos antes da implementação:

| Situação | Definição atual |
| --- | --- |
| Desistir de uma palavra | Revela a resposta, registra zero e permite seguir |
| Sair de uma partida | Preserva o progresso e permite retomar |
| Desconto por saída | Desejado, com regra a definir |
| Abandonar definitivamente uma partida | Comportamento a definir |

O nome “Encerrar partida” poderá gerar confusão se a ação permitir retomada. A nomenclatura final deverá refletir a regra escolhida.

Também falta definir se fechar a aba, perder a conexão e sair por um botão terão o mesmo efeito sobre a penalidade.

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

As fórmulas ainda deverão esclarecer, por exemplo, se partidas em andamento entram no total de pontos, como identificar abandono e como contabilizar respostas pertencentes a várias temáticas.

## 14. Ranking público

Haverá comparação pessoal pelo histórico e uma classificação entre jogadores da plataforma.

O ranking deverá destacar desempenho e participação, considerando a intenção de classificar quem mais acertou e mais jogou.

Os dados públicos previstos são nome de usuário e indicadores usados na classificação. A inclusão de datas ainda será avaliada.

Ainda não foram escolhidos:

- A métrica principal e sua ordem de prioridade.
- A existência de rankings separados por acertos, partidas ou pontos.
- O período considerado: geral, semanal, mensal ou outro.
- Os critérios de desempate.
- O tratamento de partidas incompletas e demonstrações transferidas.
- A comparação entre partidas com quantidades e dificuldades diferentes.

Partidas maiores permitem somar mais pontos, e tentativas ilimitadas na quinta dica permitem concluir uma palavra após muitos erros. Esses comportamentos deverão ser considerados ao escolher o que o ranking pretende medir.

## 15. Modo com a galera

Ideia registrada para detalhamento posterior:

- Inspiração no Roda a Roda, sem a roda.
- Até três participantes.
- Duas ou três palavras para descobrir.
- Sem a sequência de cinco dicas do modo individual.
- Um palpite errado passa a vez ao próximo participante.

A existência de uma indicação geral de temática ainda precisa ser confirmada, pois a descrição inicial não deixou esse ponto fechado.

Também estão a definir: quantidade mínima de participantes, jogo no mesmo dispositivo ou pela internet, uso de contas, formação da sessão, ordem de turnos, palpite de letra ou resposta completa, permanência das letras reveladas, pontuação, vitória, desistência e retomada.

As regras do modo individual não deverão ser aplicadas automaticamente a esse modo.

## 16. Requisitos funcionais consolidados

| ID | Requisito | Situação |
| --- | --- | --- |
| RF-01 | Permitir demonstração para visitante com três respostas e temáticas aleatórias | Definido; limites pendentes |
| RF-02 | Autenticar pela conta Google | Definido |
| RF-03 | Transferir a demonstração ao histórico após entrada em seguida | Definido; prazo pendente |
| RF-04 | Garantir unicidade de e-mail e nome de usuário | Definido |
| RF-05 | Permitir alterar nome de usuário e avatar da coleção | Definido |
| RF-06 | Configurar temática, dificuldade e quantidade de respostas | Definido; sete respostas a confirmar |
| RF-07 | Permitir combinar quantidades e ordem das dificuldades | Definido |
| RF-08 | Oferecer distribuição aleatória de dificuldades | Definido; sorteio pendente |
| RF-09 | Priorizar conteúdo inédito e permitir repetição ao esgotá-lo | Definido; critérios pendentes |
| RF-10 | Oferecer alternativas quando faltar conteúdo | Definido; prioridade pendente |
| RF-11 | Exibir quadradinhos e permitir arrastar, clicar ou digitar letras | Definido |
| RF-12 | Aplicar o bloqueio de letras pela quantidade de ocorrências | Definido |
| RF-13 | Conferir o palpite somente após confirmação | Definido |
| RF-14 | Revelar a primeira dica e permitir solicitar as seguintes | Definido |
| RF-15 | Mostrar a próxima dica após erro, até a quinta | Definido |
| RF-16 | Permitir tentativas ilimitadas na quinta dica | Definido |
| RF-17 | Permitir consultar dicas anteriores | Definido |
| RF-18 | Calcular a pontuação conforme a dica atual | Definido |
| RF-19 | Permitir desistir da palavra, revelar a resposta e registrar zero | Definido |
| RF-20 | Salvar e retomar uma única partida em andamento por jogador | Definido |
| RF-21 | Aplicar desconto por saída de partida | Regra pendente |
| RF-22 | Apresentar resultado, histórico resumido e estatísticas privadas | Definido; cálculos pendentes |
| RF-23 | Apresentar ranking público com dados limitados | Definido; classificação pendente |
| RF-24 | Disponibilizar modo com a galera | Detalhamento e entrega pendentes |

## 17. Qualidade e critérios técnicos a detalhar

A interface deverá manter consistência entre as formas de entrada e apresentar claramente erros, dicas reveladas, pontuação disponível e progresso salvo.

Como propostas técnicas para sustentar as regras de negócio:

- O backend deve validar os palpites e calcular os pontos, sem depender de valores enviados pela interface.
- Reenvios da mesma ação não devem duplicar pontos ou avançar dicas indevidamente.
- Dados privados devem ser acessíveis apenas ao dono da conta.
- A retomada deve recuperar o último estado confirmado da partida.

Ainda precisam ser acordados: prioridade entre celular e computador, acessibilidade, hospedagem, quantidade esperada de acessos simultâneos, metas de desempenho e tratamento de sessões em várias abas ou dispositivos.

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

Essa relação é conceitual: não representa tabelas, coleções ou uma arquitetura de armazenamento já aprovadas.

Antes de modelar os bancos, será necessário escolher os produtos SQL e NoSQL, definir quais dados cada um armazenará e estabelecer como manter a consistência entre progresso, pontuação e estatísticas.

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
4. Um acerto recebe os pontos da dica atual, considerando a futura regra de penalidade por saída, quando definida.

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

Sugestões de conteúdo por jogadores poderão ser discutidas em atualização futura. O modo com a galera permanece como parte da visão do produto, com escopo e momento de entrega pendentes.

## 22. Decisões prioritárias em aberto

Antes de fechar a modelagem e implementar as regras, as principais decisões são:

1. **Saída e penalidade:** valor do desconto, quando ocorre, se pode repetir e se a pontuação pode ficar negativa.
2. **Abandono definitivo:** como liberar a criação de outra partida quando já existe uma em andamento.
3. **Ranking:** métricas, períodos, desempates e tratamento de partidas de tamanhos diferentes.
4. **Seleção de conteúdo:** relação entre repetição e insuficiência de palavras; repetição dentro da mesma partida.
5. **Configuração:** confirmação de sete respostas, sorteio de dificuldades e opção automática de dificuldade crescente.
6. **Demonstração:** dificuldade, repetição, prazo de transferência e efeito no ranking.
7. **Entrada de respostas:** normalização de caracteres, envio incompleto e manutenção das letras após erro ou retomada.
8. **Contas:** escolha inicial e validação do nome de usuário; eventual exclusão de conta e seus dados.
9. **Dados e infraestrutura:** bancos SQL e NoSQL, divisão de responsabilidades, carga inicial de conteúdo e hospedagem.
10. **Entrega:** confirmação do escopo inicial, participação do modo com a galera e exigências adicionais das disciplinas.

O núcleo do modo individual está definido. Os pontos acima devem ser resolvidos sem transformar sugestões ou interpretações em regras definitivas.
