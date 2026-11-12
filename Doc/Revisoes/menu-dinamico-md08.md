# Menu MD-08 — surpresas e interação do Aurélio

Base `3e1d12e`, desenvolvimento em 12/11/2026. **Estado: MD-08 concluída, com as cinco atuações aprovadas expressamente pelo responsável.** O responsável autorizou esta etapa após a revisão antecipada MD-09. A aprovação do repertório anterior não é usada como aprovação automática destes gestos.

## Cinco intenções sobre a arte aprovada

Preservados o PNG original, a capa auxiliar, os recortes, os contornos dos olhos, as proporções e a textura. Sem imagem nova, redesenho do personagem ou biblioteca adicional. A letra temporária é um elemento SVG local. As nove reações do jogo continuam em `reacoes.ts`, com os mesmos tempos e políticas; os cinco gestos do menu têm um catálogo de apresentação separado.

| Atuação | Duração | Preparação e gesto | Acomodação |
| --- | --- | --- | --- |
| Olhar para o Solo | 3,2 s | Atenção com os olhos, inclinação pequena, palma e sobrancelhas apresentam o cartão | Olhar retorna; gravata e páginas terminam depois |
| Olhar para a Galera | 3,6 s | Convite mais aberto, ombro/punho e sobrancelha direita acompanham o olhar | Corpo, mão e expressão descansam em momentos distintos |
| Ajeitar a gravata | 4,2 s | Olha para baixo; ombro, cotovelo e punho levam a luva ao laço; dois pequenos ajustes | Braço recua; laço e páginas se acomodam por último |
| Seguir a letra | 4,6 s | Letra A percorre um arco; pupilas e sobrancelhas acompanham a mesma linha de tempo | Letra desaparece com brilho discreto; piscada e retorno |
| Reagir ao toque | 3,4 s | Reconhecimento, pequena antecipação e salto de 20 px do personagem inteiro | Apoio, piscadela de um olho e sorriso original |

Todos começam e terminam na pose neutra, com interpolação suave e sem repetir o aceno. A piscadela independente usa o contorno original de cada olho; a outra abertura permanece preservada. Na gravata, a mesma montagem do braço passa à frente da capa apenas durante essa atuação; não é um braço ou uma luva redesenhados. Na perseguição, a letra ambiente A fica oculta temporariamente, enquanto a letra junto ao rosto ocupa seu papel; ao terminar, o cenário original volta.

No menu, a direção dos olhos para Solo/Galera é medida na posição real dos cartões ao iniciar o gesto. Assim, o olhar se dirige para baixo quando os cartões ficam abaixo do personagem no celular. Não há leitura de geometria nem atualização do menu inteiro a cada quadro. A galeria usa uma direção de referência para inspecionar a atuação isoladamente. Um redimensionamento no meio de um gesto não recalcula seu alvo até a próxima atuação.

## Agenda, prioridades e pausa

- Quatro surpresas automáticas para a conta; visitantes recebem somente gravata e letra, sem apresentar modos que não estão disponíveis. A resposta ao toque nunca entra no sorteio automático.
- Oportunidades de 20–35 segundos ativos, com duração própria de cada gesto, sem repetição imediata. Oportunidades que colidem com uma atuação protegida são descartadas, não enfileiradas.
- Após surpresa ou reação manual, reprogramar as oportunidades: descanso de 10–15 segundos antes de uma nova fala e 20–35 antes de outra surpresa. A cadência de fala deixa de significar troca obrigatória a cada 15 segundos enquanto o personagem atua.
- A ativação manual tem prioridade como próximo acontecimento: se houver saudação ou surpresa em andamento, guardar um único pedido e terminar o gesto antes de respondê-lo. A mudança evita recolher instantaneamente a mão de dentro da gravata. Pedidos adicionais são ignorados; não existe fila ilimitada. Fala decorativa não corta uma surpresa.
- Diálogo, ausência e erro relevante pausam a agenda. Os novos gestos congelam sua pose e conservam o saldo; movimentos reduzidos cancelam a atuação e oferecem resposta textual, sem deixar o botão ocupado indefinidamente.
- Fora da área visível, retirar as surpresas automáticas e descartar a que estava sendo exibida. O relógio visual do personagem para; ao reaparecer, aguardar nova oportunidade, sem recuperar surpresas vencidas. A interação manual tem janela finita na agenda, mesmo se o personagem sair da área visível; não há trabalho visual por quadro fora da tela.

`configurar` passou a atualizar as categorias fornecidas, preservando as demais e seus prazos. Registrar falas não apaga surpresas; retirar falas não corta um gesto. Limpeza explícita usa `falas: []` ou `surpresas: []`; um objeto vazio não apaga outro registro. Durações opcionais por identificador têm retorno seguro para entradas inválidas. A agenda continua única e recebe tempo/sorteio/agendamento por contratos injetáveis.

## Ativação e acessibilidade

Um botão nativo transparente acompanha a área do mascote, com nome **Conversar com Aurélio**, foco visível e suporte a mouse, toque, Enter e Espaço. A decoração continua sem capturar interação; somente esse controle recebe ponteiro. Não há arraste obrigatório, bloqueio de rolagem ou clique em cada movimento do mouse.

O balão responde com “Já te vi! Só um instantinho.” quando aguarda um gesto, e “Opa, você me achou! Bora decifrar?” na resposta. O espaço é reservado junto com as falas editoriais. A resposta manual tem uma região de estado própria; as trocas automáticas continuam sem anúncios recorrentes. O mesmo botão é preservado ao mudar a preferência de movimentos, mantendo foco e navegação por teclado.

Sem novo áudio: o clique nativo reutiliza o efeito de botão do gerenciador existente. `aria-disabled` comunica pedido/atuação ocupados e impede o efeito de cliques recusados. As atuações automáticas não enviam eventos sonoros; silêncio e categorias existentes permanecem respeitados. A música mantém sua política anterior.

## Organização

- `gestos-menu.ts`: catálogo, durações, poses e seleção válida por contexto, sem DOM, API ou relógio próprio.
- `atuacao-visual.ts`: composição das nove reações existentes com os cinco gestos de apresentação; regras dos jogos não recebem novas reações.
- `AnfitriaoMenu.tsx`: integração entre agenda, visibilidade, direção do olhar, intenção manual e balão. Não calcula pontos nem consulta palavras.
- `Aurelio`/`AurelioDesenho`/`AurelioRecortado`: adaptações opcionais de apresentação, mantendo os contratos dos modos de jogo e o componente memorizado das definições SVG fixas.
- `/laboratorio/aurelio`: grupo **Surpresas do menu**, com cinco opções, controle de instante, reprodução/pausa, poses e referência lado a lado.

## Testes e revisão

Testes escritos antes da integração reproduziram a ausência do catálogo/controle, a substituição indevida entre categorias da agenda e o corte de eventos. A regressão da pausa demonstrou o salto visual para o instante zero; a correção preserva a pose dos novos gestos. A regressão de preferência durante a ativação demonstrou perda de foco; a integração foi ajustada para conservar a identidade do botão, cancelando a entrada sem remontá-lo.

Na preparação dos ensaios, corrigidos a interceptação herdada de ponteiro no personagem decorativo, o avanço artificial de relógio que coalescia eventos diferentes e a espera da consulta inicial do visitante. A medição de pausa foi posicionada depois da abertura efetiva do diálogo: os quadros que avançam durante o clique são válidos; depois da pausa o instante precisa permanecer exatamente igual. Essas correções não ampliam tolerâncias de fidelidade, encaixes ou olhos.

Verificação concluída: **126 testes unitários e 269 cenários distintos de navegador aprovados; 17 ignorados previstos**. A contagem de navegador inclui 151 de menu, 69 do mascote, 12 de áudio, 15 de acabamento, nove do individual, seis da galera, seis da aplicação compilada e uma observação real de cinco minutos. Reexecuções de um mesmo cenário não são somadas. Tipos, formatação e compilação aprovados; entrada JavaScript de 372,69 kB (115,84 kB com gzip), sem nova dependência.

A primeira execução integral do menu revelou dez expectativas antigas de fala obrigatória em até 15 segundos, incompatíveis com a proteção dos gestos e seu descanso. Os 12 cenários de contexto foram reexecutados após a atualização da espera limitada para observar três trocas reais, mantendo contagem, ausência de repetição, geometria e foco. As dez falhas foram resolvidas; as duas repetições bem-sucedidas não aumentam o total distinto. Os limites da agenda também têm cobertura unitária.

Na observação real de cinco minutos: **16 trocas de fala e nove surpresas automáticas**, com os quatro gestos permitidos à conta e sem repetição imediata. Intervalos entre falas de 10,12 a 31,48 segundos, incluindo a proteção e o descanso das atuações. Título, cartões e foco permaneceram estáveis; nenhuma requisição sonora adicional. Não se trata de promessa de cadência fixa durante os gestos.

Revisão visual em computador, tablet e celular emulados: 90 capturas intermediárias das cinco atuações, três gravações em tempo real, 15 capturas de destaque e 24 combinações de aparência. Foram inspecionadas folhas de contato das poses, amostras das gravações e aparências, incluindo ampliações da gravata e da letra. Os testes de encaixes, olhos e fidelidade foram ampliados para os cinco gestos, preservando as tolerâncias anteriores; limites horizontais conferidos nas poses. Isso não substitui o aceite artístico nem declara teste dos novos gestos em aparelho físico.

Evidências em `Frontend/test-results/md08` e roteiro temporário permanecem locais e ignorados. Sem testes ou gravações nos bancos reais, mudança de backend, contrato HTTP, catálogo, pontuação ou autenticação.

## Aceite artístico

Em 12/11/2026, o responsável respondeu **“Aprovo as cinco atuações”** à revisão no laboratório e no menu. A aprovação abrange olhar para Solo, olhar para Galera, ajeitar a gravata, seguir a letra e reagir ao toque. Com as verificações registradas acima e esse aceite, a MD-08 está concluída. A revisão integrada MD-09 e o aceite final MD-10 permanecem separados; a fase 49 não é declarada concluída.
