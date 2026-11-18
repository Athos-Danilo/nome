# Aurélio 2.0 — evolução do mascote, rigging híbrido e interações

**Decisões aprovadas pelo responsável em 18/11/2026.** Documento de especificação técnica e roteiro incremental em fases (`AU-01` a `AU-06`), padronizado conforme [Detalhes.md](Detalhes.md), [Planejamento-tecnico.md](Planejamento-tecnico.md), [Aurelio-animado.md](Aurelio-animado.md) e [Agents/Regras.md](../Agents/Regras.md).

**Decisões fechadas para esta evolução:**

1. **Arquitetura visual:** manter **100% da arte raster original** aprovada (`aurelio.png` / `aurelio.webp` e `aurelio-capa-limpa-02.webp`) nas peças texturizadas (capa oliva, cantoneiras, miolo, gravata, luvas e sapatos/meias) e substituir **apenas os tubos intermediários dos braços e pernas por curvas Bézier cinemáticas (IK 2D *rubber-hose*)** fiéis ao traço e sombreamento originais.
2. **Repertório completo:** reformular e turbinar **todas** as atuações já existentes (incluindo a saudação, as oito reações do jogo e as cinco surpresas do menu) para eliminar limitações de rigidez e incorporar novas atuações expressivas.
3. **Presença viva e estúdio documentado:** expandir as interações do Aurélio para o Solo, Demonstração, Galera e telas de configuração/conta, e consolidar/documentar o **Estúdio do Apresentador (`/laboratorio/aurelio`)** como página única de demonstração de todas as animações no projeto e no [README.md](../README.md).

---

## 1. Diagnóstico técnico da implementação anterior (Fase 36 / MD-08)

A análise de [AurelioRecortado.tsx](../Frontend/src/funcionalidades/mascote/AurelioRecortado.tsx), [DefinicoesAurelio.tsx](../Frontend/src/funcionalidades/mascote/DefinicoesAurelio.tsx), [recortes.ts](../Frontend/src/funcionalidades/mascote/recortes.ts), [atuacoes.ts](../Frontend/src/funcionalidades/mascote/atuacoes.ts), [gestos-menu.ts](../Frontend/src/funcionalidades/mascote/gestos-menu.ts) e [reacoes.ts](../Frontend/src/funcionalidades/mascote/reacoes.ts) identificou as causas concretas das limitações observadas:

### 1.1. Descolamento do braço e limitações anatômicas

1. **Corte reto da máscara `fora-livro` antes da rotação:** `braco_direito` aplica `mask="url(#fora-livro)"` no sistema estático da imagem **antes** de aplicar `rotate(pose.ombro 858 635)`. O recorte termina decepado na linha reta da borda da capa; ao girar para cima (`-18°` na saudação, `-24°` na comemoração), a base inferior do braço sai da capa, abrindo uma fenda triangular visível. No gesto `ajeitar_gravata`, ao passar à frente da capa com rotação `+125°`, o corte reto fica totalmente exposto sobre a capa oliva.
2. **Cotovelo direito duplicado ("antebraço fantasma"):** `RECORTES.braco_direito` cobre ombro e antebraço juntos (`x = 832..1000`). Quando o cotovelo dobra, apenas o traço auxiliar `encaixe_punho` e a luva se movem, deixando o toco original do antebraço rígido apontando para o lado.
3. **Braço esquerdo e joelhos rígidos:** `braco_esquerdo` termina seco na lombada (`x = 253`), sem âncora nem articulação de cotovelo/punho, e as pernas não dobram os joelhos nem articulam os sapatos separadamente.

### 1.2. Limites de fluidez e expressividade

- **Amplitudes comprimidas:** para não expor cortes, as rotações de braço esquerdo, pernas e corpo ficaram restritas a `1°–4°`, distantes da expressividade da prancha conceitual ([aurelio-conceito-01.png](Identidade-visual/aurelio-conceito-01.png)).
- **Ausência de *pose blending*:** transições entre `espera` e reações (ou interrupções entre eventos) saltam diretamente para `tempo = 0` da nova atuação.
- **Curva única e falta de física secundária:** todas as chaves usam apenas `t² × (3 - 2t)` sem *overshoot* cartoon, *squash & stretch* com conservação de volume nem atraso inercial contínuo para gravata e páginas.
- **Expressões restritas:** olhos dependem de escala vertical uniforme sem pálpebras expressivas (`^ ^`, detetive, empatia), há apenas três estados simples de boca e as páginas não folheiam.

### 1.3. Interações limitadas nas telas do jogo e conta

- **Solo e Galera:** frases estáticas fixas ao lado do personagem; nenhuma reação ao toque durante a partida; pupilas estáticas em relação à montagem das letras; ausência de distinção entre acerto rápido (1ª dica) e acerto na 5ª dica.
- **Imprecisão em `reacaoGalera`:** quando um participante erra um palpite completo na Galera, mas ganha pontos por posições parciais e perde a vez, `atual.pontos > anterior.pontos` dispara `comemoracao` em vez de reconhecer a perda de turno com pontos parciais.
- **Telas estáticas de preparação e conta:** `/perfil`, `/primeiro-acesso`, `/configuracoes`, configuradores (`ConfiguradorIndividual.tsx`, `ConfiguradorGalera.tsx`) e entrada da demonstração ainda exibem `<img src="/mascote/aurelio.png">` parado em vez do personagem animado.

---

## 2. Avaliação de processo e escolha técnica

| Processo avaliado | Fidelidade ao PNG aprovado | Amplitude de movimento | Impacto no bundle JS (teto `500 KiB`) | Manutenção e TDD | Decisão |
| --- | --- | --- | --- | --- | --- |
| Cut-out raster rígido (anterior) | Alta no neutro; fendas em giros médios/altos | Baixa | `0 KiB` | Simples, porém travada | **Substituído** |
| Redesenho 100% vetorial | Baixa (perde textura granulada oliva) | Alta | `0 KiB` | Fácil | **Reprovado na Fase 36** |
| Rive / Spine / Lottie | Média/Alta (exige re-autoria externa) | Muito alta | `+180 a 250 KiB` (ultrapassa o teto de `500 KiB`, hoje em `~478 KiB`) | Binário externo opaco; Spine exige licença paga | **Descartado** |
| **Rigging Híbrido 2.5D em SVG (*Raster + Rubber-Hose IK*)** | **Máxima** (preserva capa, gravata, luvas, sapatos e olhos do PNG) | **Muito alta** (membros dobram livremente em C/S sem descolar) | **`0 KiB` de bibliotecas novas** | **100% TypeScript/SVG**, coberto por Vitest + Playwright | **Aprovado** |

Na arte original, a textura granulada e o acabamento artesanal residem na capa, cantoneiras, miolo, gravata, luvas e sapatos; os tubos dos braços e pernas são mangueiras estilo *rubber-hose* com contorno escuro uniforme (`#140e0b`), preenchimento (`#29241c`) e filete de destaque cel-shaded (`#3a342a`). Substituir apenas os tubos por curvas Bézier com cinemática inversa 2D garante fidelidade visual idêntica ao neutro (`< 2%` de diferença na regressão de pixel) e liberdade total de pose.

---

## 3. Arquitetura técnica do Aurélio 2.0

### 3.1. Rigging Híbrido 2.5D (`cinematica-membros.ts` + `AurelioRecortado.tsx`)

- **Cinemática inversa de 2 segmentos (IK 2D) / Curva Bézier controlada:**
  - Calcula cotovelo/joelho e pontos de controle cúbicos/quadráticos a partir de: ponto de ancoragem no livro, alvo da mão/pé (`maoEsquerdaX/Y`, `maoDireitaX/Y`, `peEsquerdoX/Y`, `peDireitoX/Y`), ângulo da extremidade e direção/intensidade da dobra (*bend*).
  - **Poses neutras calibradas no PNG:** em repouso (`tempo = 0`), mãos, sapatos e curvas dos membros coincidem exatamente com `aurelio.png`, mantendo o critério `< 2%` na comparação pixel a pixel em `/laboratorio/aurelio`.
- **Renderização em 3 traços fiéis ao PNG:** contorno externo escuro (`#140e0b`, `strokeWidth ~60`), núcleo (`#29241c`, `strokeWidth ~42`) e filete de luz lateral deslocado/clipado (`#3a342a`) com `strokeLinecap="round"`.
- **Camadas 2.5D sem fenda:**
  - Atrás da capa: raízes dos ombros e quadris ficam ancoradas **atrás** de `aurelio-capa-limpa-02.webp`, eliminando qualquer abertura de junta.
  - À frente da capa (ex.: mão no queixo, ajeitar gravata, braços encabulados na frente do livro, mão esquerda na cintura): quando uma mão vai para a frente do livro, o trecho entre a ancoragem na lateral da capa e a borda contorna o livro por trás antes de cruzar à frente — evitando ponta cortada sobre a capa.
  - **Luvas e sapatos raster separados:** `luva_direita`, `luva_esquerda`, `sapato_esquerdo` (com meia) e `sapato_direito` (com meia) recebem recortes próprios sem restos de tubo, articulando punhos e tornozelos no centro exato de encaixe.
- **Volume 2.5D e páginas folheando:**
  - *Squash & stretch* com conservação de volume (`escalaX ≈ 1 / √escalaY`) + inclinação sutil de perspectiva (`perspectivaX`/`skew`).
  - Três folhas vetoriais dinâmicas (`FolhasAurelio.tsx`) no mesmo tom creme e contorno das páginas do PNG para animar o ato real de folhear o dicionário.

### 3.2. Motor cinemático fluido (`transicao-poses.ts`, `curvas.ts`, `usar-relogio-atuacao.ts`)

- **Curvas de animação por trecho:** interpolação configurável entre *smoothstep*, *ease-out-back* (overshoot cartoon), *ease-in* (antecipação) e amortecimento elástico (*spring*), mantendo função pura determinística para testes.
- ***Pose blending* contínuo (`140–180 ms`):** ao iniciar uma reação ou retornar ao repouso, a pose atual renderizada é capturada e interpolada suavemente para a nova atuação — sem saltos visuais mesmo interrompendo a `espera` ou outro gesto no meio.
- **Física secundária automática (*follow-through*):** derivação suave da velocidade de `corpoY`, `saltoY` e `corpoRotacao` adiciona balanço atrasado realista à gravata, páginas e sobrancelhas em qualquer movimento.

### 3.3. Expressividade facial de estúdio (`RostoAurelio.tsx` / `AurelioRecortado.tsx`)

- **Pálpebras expressivas independentes** limitadas rigorosamente por `CONTORNOS_OLHOS`:
  - `arco_feliz` (`^ ^` arqueado para cima, inspirado na prancha conceitual de comemoração);
  - `semicerrado` (olhar curioso/detetive com pálpebra superior inclinada ou baixa);
  - `empatico` (sobrancelha e pálpebra superior caídas nos cantos externos para susto/erro);
  - piscada natural completa ou unilateral (piscadela).
  - Micro-brilho (*catchlight*) nas pupilas e olhar direcional contínuo (`pupilaX`, `pupilaY`).
- **Novo repertório de bocas:** além do sorriso aberto original raster (`boca`), incluir expressões SVG no mesmo traço (`#241e17`) e língua/preenchimento fiéis:
  - `neutra` (sorriso raster original), `fechada` (sorriso confiante), `surpresa` (`"O"`), `pensativa` (boca curta lateral `"hmm"`), `gargalhada` (vitória ampla) e `encabulada` (ondulada `"ops!"`).

### 3.4. Repertório turbinado de atuações e novos eventos

1. **Todas as atuações existentes reescritas** com cinemática *rubber-hose*, dois braços ativos, joelhos, páginas folheando e novas expressões:
   - **Espera (`espera`):** ciclo longo e orgânico com respiração 2.5D, olhar vivo, piscadas e leve batida rítmica do pé direito / conferida sutil no laço.
   - **Saudação (`saudacao`):** antecipação abaixando o corpo, salto leve de entusiasmo abrindo o braço esquerdo na cintura e aceno amplo com antebraço/punho direitos, páginas folheando e sorriso brilhante.
   - **Pensamento (`pensamento`):** dobra o braço direito levando a luva ao queixo, mão esquerda firme na cintura, pálpebras de detetive, páginas folheiam e lâmpada/brilho acende na descoberta.
   - **Apresentação de dica (`apresentacao`):** folheada rápida no dicionário + gesto amplo de apresentador abrindo a palma e apontando com o corpo inclinado.
   - **Erro (`erro`):** susto curto com páginas arrepiando, traz as duas luvas encabuladas à frente do peito com ombros encolhidos e boca ondulada, recuperando para um sorriso encorajador.
   - **Comemoração (`comemoracao`):** compressão forte no chão (`squash`), salto alto com os **dois braços erguidos** e joelhos dobrados (fiel à prancha conceitual!), olhos `^ ^`, gargalhada e pouso amortecido.
   - **Passagem de vez (`turno`):** giro expressivo convidando com a palma aberta e seta dinâmica.
   - **Sorteio (`sorteio`):** expectativa tensa, mãos vibrando próximas aos cartões abstratos e revelação de showman.
   - **Resultado (`resultado`):** apresentação de selo/troféu, reverência elegante com mão no peito e braço aberto.
   - **Surpresas do menu (`olhar_solo`, `olhar_galera`, `ajeitar_gravata`, `seguir_letra`, `reagir_toque`):** movimento real com os dois braços (em `ajeitar_gravata`, usa as duas mãos ou mão direita contornando o livro sem corte reto; em `seguir_letra`, tenta até alcançar/apontar a letra flutuante; em `reagir_toque`, salto completo com giro/piscadela e braços abertos).
2. **Quatro novas atuações de jogo (`reacoes.ts` + `atuacoes.ts`):**
   - **`comemoracao_epica`:** acerto na 1ª dica (100 pontos no Solo/Demonstração) ou revelação de `>= 300` pontos numa única jogada da Galera.
   - **`folhear_dica`:** acionada ao pedir uma nova dica no Solo/Demonstração (folheia páginas ativamente e apresenta a nova pista).
   - **`tensao_decisiva`:** entrada na 5ª dica no Solo ou empate aguardando votação de sessão extra na Galera.
   - **`troca_amigavel`:** erro de palpite completo na Galera que ainda conquista pontos por posições certas antes de passar a vez.

### 3.5. Integração nas telas e Estúdio (`/laboratorio/aurelio`)

- **Solo e Demonstração (`PainelIndividual.tsx`, `usar-partida.ts`, `falas-partida.ts`):**
  - Balão contextual do apresentador ao lado do Aurélio reagindo ao contexto real da rodada (abertura, pedido de dica, erro, 5ª dica de tensão, acerto épico de 100 pts vs. acerto na última dica), respeitando altura estável, temas e sem região viva intrusiva.
  - Olhar acompanhando o foco da montagem de letras (`EditorResposta` comunica posição relativa da letra selecionada/digitada via callback opcional sem re-renderizar a árvore da partida).
  - Interação ao clique/toque no mascote durante a partida (sem roubar o foco do teclado da montagem, com descanso curto).
- **Galera (`PainelGalera.tsx`, `reacoes.ts`):**
  - Correção de `reacaoGalera` para diferenciar acerto mantendo a vez, acerto múltiplo (`>= 300` pts → `comemoracao_epica`), erro parcial com mudança de turno (`troca_amigavel`) e suspense de desempate (`tensao_decisiva`).
  - Comentários curtos de auditório ao lado do Aurélio e toque interativo.
- **Telas de Conta e Preparação (`Aplicacao.tsx`, `ConfiguradorIndividual.tsx`, `ConfiguradorGalera.tsx`, `RotaIndividual.tsx`):**
  - Substituir o `<img>` estático pelo `<Aurelio />` vivo em `/perfil`, `/primeiro-acesso`, `/configuracoes`, `/jogar/individual/novo`, `/jogar/galera/novo` e na tela inicial de `/jogar/demonstracao`, reagindo discretamente a eventos de interação (como salvar perfil/preferências ou alternar paleta).
- **Estúdio do Apresentador (`/laboratorio/aurelio` — `GaleriaAurelio.tsx`):**
  - Página única preservada e documentada oficialmente no projeto e no [README.md](../README.md) para revisão técnica e apresentação acadêmica em sala.
  - Exibe **todas** as atuações do jogo e surpresas do menu em um só lugar, com:
    - Seletor de velocidade (`0.25x`, `0.5x`, `1x`);
    - Opção **Reproduzir tudo em sequência** (modo apresentação para mostrar o repertório completo automaticamente à turma!);
    - Visualização do esqueleto *rubber-hose* (âncoras, alvos IK, pontos de dobra e recortes);
    - Botão de **Transição ao vivo** para testar o *pose blending* trocando de atuação durante a reprodução;
    - Comparação lado a lado com o `aurelio.png` aprovado.
  - Acesso fácil sem poluir o `dock-jogo` nem alterar a altura das arenas: link direto discreto no diálogo **Como jogar (`?`)** e rota `/laboratorio/aurelio`.

---

## 4. Regras de qualidade, TDD, SOLID e orçamento

- **Português obrigatório:** todos os módulos, tipos, funções, variáveis e testes novos usam português do Brasil sem acentos nos identificadores (`cinematica-membros.ts`, `transicao-poses.ts`, `falas-partida.ts`, `FolhasAurelio.tsx`, etc.), conforme [Agents/Regras.md](../Agents/Regras.md).
- **TDD obrigatório:** cada módulo de comportamento executável (`cinematica-membros`, `transicao-poses`, novas regras de `reacoes.ts`, `falas-partida.ts`, `usar-relogio-atuacao` e regras do estúdio) começa com teste automatizado falhando antes da implementação.
- **Preservação visual e regressão:** manter a comparação automática da pose neutra `< 2%` em relação a `aurelio.png` e ampliar `mascote.fluxo.ts` para checar ausência de frestas nos **quatro membros** (inclusive ombro/cotovelo direito e esquerdo) e contornos dos olhos em todas as atuações e surpresas.
- **Orçamento e acessibilidade:** `0 KiB` de bibliotecas externas; pacote inicial JS permanece abaixo de `500 KiB` (o estúdio continua com carregamento `lazy`); `movimentos_reduzidos` e `prefers-reduced-motion` congelam movimentos espaciais preservando mensagens e foco.

---

## 5. Roteiro de fases (`AU-01` a `AU-06`)

- [x] **AU-01 — Rigging Híbrido 2.5D (*Rubber-Hose* IK), separação de luvas/sapatos e anatomia sem fendas**
- [x] **AU-02 — Motor cinemático fluido (*pose blending*, curvas elásticas e física secundária)**
- [x] **AU-03 — Expressividade facial de estúdio (pálpebras expressivas e novas bocas) e folhas animáveis**
- [x] **AU-04 — Reconstrução completa do repertório e criação das 4 novas atuações**
- [x] **AU-05 — Integração interativa no Solo, Demonstração, Galera e telas de Conta/Configuração**
- [x] **AU-06 — Estúdio `/laboratorio/aurelio` turbinado, atalho acessível, regressão total e atualização documental**

### AU-01 — Rigging Híbrido 2.5D e correção anatômica
- **Depende de:** documentação aprovada em 18/11/2026 e baseline `testar-mascote` verde (`69/69`).
- **Entrega:**
  - `cinematica-membros.ts` + `cinematica-membros.test.ts` (TDD): solucionador IK 2D e geração de curva Bézier contínua para os 4 membros, garantindo ancoragem no livro e comprimento preservado.
  - Ajuste de `recortes.ts` e `DefinicoesAurelio.tsx`: separar limpo `luva_direita`, `luva_esquerda`, `sapato_esquerdo` e `sapato_direito` sem restos de tubos rígidos nem máscara `fora-livro` cortando o ombro antes do giro.
  - Atualização de `AurelioRecortado.tsx`: tubos *rubber-hose* em 3 traços fiéis ao PNG (`#140e0b`, `#29241c`, `#3a342a`), camadas 2.5D para braços atrás/à frente da capa e visualização de esqueleto IK no modo `partes`.
- **Critério de conclusão:** `pose = neutra` preserva `< 2%` de diferença para `aurelio.png` e testes de regressão de frestas aprovados nos 4 membros.

### AU-02 — Motor cinemático fluido (*Pose Blending*, curvas e *Follow-through*)
- **Depende de:** AU-01.
- **Entrega:**
  - `curvas-atuacao.ts` + testes: interpolações *smoothstep*, *ease-out-back*, *ease-in-quad* e *spring* suave.
  - `transicao-poses.ts` + testes: mistura suave (`160 ms`) entre pose de origem (capturada no instante de interrupção) e destino, evitando cortes secos entre `espera` e reações.
  - Física secundária derivada da variação temporal do corpo/salto para gravata, páginas e sobrancelhas, além de *squash & stretch* com conservação de volume e perspectiva leve 2.5D.
- **Critério de conclusão:** testes unitários determinísticos aprovam continuidade sem salto na troca de reação e limites numéricos finitos.

### AU-03 — Expressividade facial de estúdio e folhas do livro
- **Depende de:** AU-01 e AU-02.
- **Entrega:**
  - Pálpebras expressivas independentes em `RostoAurelio.tsx` (`palpebraFeliz`, `palpebraSemicerrada`, `palpebraEmpatica`) integradas em `AurelioRecortado.tsx` e respeitando `CONTORNOS_OLHOS`, com brilho sutil na pupila.
  - Conjunto ampliado de bocas SVG no traço original (`bocaFechada`, `bocaSurpresa`, `bocaPensativa`, `bocaGargalhada`, `bocaEncabulada`) com transição limpa.
  - `FolhasAurelio.tsx`: 3 páginas vetoriais integradas ao miolo do livro para simular folheada real de dicionário.
- **Critério de conclusão:** zero vazamento de creme/contorno fora dos olhos nos testes de pixel e inspeção visual nos três tamanhos.

### AU-04 — Repertório turbinado e novas atuações
- **Depende de:** AU-01 a AU-03.
- **Entrega:**
  - Reescrita de todas as atuações existentes (`saudacao`, `espera`, `pensamento`, `apresentacao`, `erro`, `comemoracao`, `turno`, `sorteio`, `resultado` e as 5 surpresas do menu) usando os dois braços livres, joelhos, páginas folheando e novas expressões.
  - Adição das 4 novas atuações (`comemoracao_epica`, `folhear_dica`, `tensao_decisiva`, `troca_amigavel`) em `reacoes.ts`, `atuacoes.ts`, `repertorio.ts`, `EfeitosAurelio.tsx` e `ProvedorAudio.tsx`.
- **Critério de conclusão:** todas as atuações começam/terminam no neutro sem valores `NaN`, passam nos testes de frestas/olhos do Playwright e são inspecionadas no `/laboratorio/aurelio`.

### AU-05 — Interação viva nas partidas e telas de conta
- **Depende de:** AU-02 a AU-04.
- **Entrega:**
  - `falas-partida.ts` + testes (TDD), `usar-toque-mascote.ts` e balão reativo discreto no Solo/Demonstração e Galera, com interação ao toque (sem desviar foco da digitação).
  - Olhar do Aurélio acompanhando a posição ativa em `EditorResposta` (`PainelIndividual` e `PainelGalera`).
  - Atualização de `reacaoIndividual` (aceitando `"dica_revelada"` e `"dica"`) e `reacaoGalera` para usar `comemoracao_epica`, `folhear_dica`, `tensao_decisiva` e `troca_amigavel` (corrigindo erro com pontos parciais na Galera).
  - Substituição do `<img>` estático pelo `<Aurelio />` animado nas telas `/perfil`, `/primeiro-acesso`, `/configuracoes`, `ConfiguradorIndividual`, `ConfiguradorGalera` e `DemonstracaoJogavel`.
- **Critério de conclusão:** suítes `vitest`, `testar-individual`, `testar-galera`, `testar-menu`, `testar-perfil`, `testar-audio`, `testar-acabamento` e `testar-uso-real` aprovadas (JS inicial `<= 500 KiB` e layout compacto sem rolagem no desktop 1280×720).

### AU-06 — Estúdio `/laboratorio/aurelio` turbinado, atalho acessível e validação final
- **Depende de:** AU-01 a AU-05.
- **Entrega:**
  - `GaleriaAurelio.tsx`: seletor de velocidade (`0,25×`, `0,5×`, `1×`), **Apresentar tudo em sequência** (roteiro contínuo para apresentação), visualização do esqueleto *rubber-hose* e botão **Transição suave (próxima)**.
  - Atalho discreto para `/laboratorio/aurelio` no diálogo **Como jogar** (`Aplicacao.tsx`), preservando lazy loading e zero impacto na altura das arenas.
  - Regressão completa (Vitest + Playwright em computador, tablet e celular + `tsc --noEmit` + Prettier + build + inspeção visual de capturas) e registro final em `Doc/`.
- **Critério de conclusão:** todas as caixas concluídas, verificações executadas após a edição final e documentação sincronizada.

---

## 6. Verificações executadas após a edição final (18/11/2026)

- **Qualidade estática e build:**
  - `npm run verificar-formatacao` (Prettier): aprovado em todos os arquivos.
  - `npm run build` (`tsc --noEmit && vite build`): aprovado (`dist/assets/index-*.js` com `399.59 kB` / `123.14 kB` gzip; `GaleriaAurelio-*.js` isolado em `11.21 kB` sob demanda).
  - `npm test` (Vitest): **28 arquivos, 148 testes aprovados** (incluindo os novos testes TDD de `cinematica-membros`, `curvas-atuacao`, `transicao-poses`, `pose-base`, `falas-partida` e novas regras de `reacoes`, `saudacao`, `gestos-menu` e `atuacoes`).
- **Suítes de navegador Playwright (`computador`, `tablet` e `celular`):**
  - `npm run testar-mascote`: **84 aprovados** (fidelidade visual neutra `< 2%`, ausência de frestas nas 18 atuações, contornos de olhos, modo reduzido e controles `AU-06`).
  - `npm run testar-individual`: **58 aprovados** (`2` testes exclusivos de desktop compacto ignorados automaticamente em tablet/celular), cobrindo `comemoracao_epica`, `folhear_dica`, toque durante a rodada e zero rolagem vertical em `1280×720`.
  - `npm run testar-galera`: **22 aprovados** (`2` testes exclusivos de desktop compacto ignorados automaticamente em tablet/celular), cobrindo `comemoracao_epica`, `troca_amigavel`, falas adaptativas e `1280×720`.
  - `npm run testar-menu`: **152 aprovados** (`22` condicionais próprios da suíte de ponteiro/redução/comparação sem referência externa), validando saudação, pausa, surpresas, agenda e atalho no diálogo de ajuda.
  - `npm run testar-perfil`: **45 aprovados**.
  - `npm run testar-audio`: **12 aprovados**.
  - `npm run testar-acabamento`: **15 aprovados**.
  - `npm run testar-uso-real`: **6 aprovados** (`499.764 bytes` de JS inicial medidos no preview compilado, mantendo o orçamento `<= 500 KiB`).
