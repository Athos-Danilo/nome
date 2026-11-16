# Roteiro de desenvolvimento — primeira entrega do Decifra

**Registro de situação em 16/11/2026:** fases 01 a 49 concluídas (incluindo o catálogo auditado de 500 respostas/2.500 dicas na fase 47, a aceitação final na fase 48 e os indicadores de carregamento e espera na fase 49); menu dinâmico MD-01 a MD-10 concluído e arenas compactas entregues em 16/11/2026. Por solicitação do responsável, a antiga fase 49 tornou-se a **fase 50 — documentar, publicar a versão final e preparar a apresentação**. Próxima fase: **50**, pendente.

**Escopo:** entregar na web os modos individual e com a galera, com login Google, histórico, rankings individuais, personalização, Aurélio animado, áudio configurável, indicadores de carregamento e catálogo revisado de 500 respostas com 2.500 dicas.

Este roteiro complementa [Detalhes.md](Detalhes.md), [Planejamento-tecnico.md](Planejamento-tecnico.md), [Regras.md](../Agents/Regras.md) e [Geracao-de-conteudo.md](../Agents/Geracao-de-conteudo.md). Não substitui regras aprovadas nem resolve silenciosamente decisões pendentes.

## 1. Como executar o roteiro

O trabalho foi dividido em **50 fases: 30 de desenvolvimento e 20 de conteúdo**. Cada fase de conteúdo produz um lote de 25 respostas, evitando gerar as 500 de uma vez.

Os sete dias são uma **referência ajustável de organização**, baseada no exemplo apresentado pelo responsável pelo projeto, e não um prazo garantido. O prazo anteriormente informado era de aproximadamente um mês. A quantidade de trabalho inclui desenho, revisão humana de 2.500 dicas, desenvolvimento, testes e publicação; um dia deste roteiro pode precisar de mais de um dia real. Ao fim do segundo ciclo, reavaliar o ritmo com o que tiver sido efetivamente concluído.

Se precisar ampliar o calendário, preservar a ordem de dependências e a alternância com conteúdo. Não retirar um modo, animações, música ou outra parte aprovada para caber no prazo sem discutir a mudança de escopo.

### Responsabilidades

- **IA de desenvolvimento:** preparar alternativas concretas quando necessário, implementar, verificar, documentar e informar limitações. Seguir as instruções em português do repositório.
- **Responsável pelo projeto:** escolher a direção visual, avaliar a experiência, revisar conteúdo e realizar acessos pessoais aos serviços quando necessários.
- **Produção de conteúdo:** pode ser solicitada pelo responsável a outra IA, utilizando o guia e a lista de exclusão. A revisão humana continua necessária.
- **Decisão conjunta:** mudanças nas regras, limitações de navegador, dúvidas de conteúdo e aceitação da entrega.

Nenhuma decisão visual precisa bloquear modelagem ou importação. As tarefas que dependem da decisão devem aguardar; as independentes continuam. Fazer perguntas em grupos de até cinco, respeitando a preferência de avançar aos poucos.

### Regra para concluir uma fase

**Da fase 15 em diante:** seguir TDD para cada comportamento executável novo ou alterado e revisar o código quanto a SOLID, conforme [Agents/Regras.md](../Agents/Regras.md). Planejar e executar o ciclo teste com falha esperada, implementação e refatoração durante cada incremento, registrando os resultados no resumo da fase. Refatorações sem mudança funcional começam por cobertura do comportamento preservado. Fases editoriais e recursos visuais mantêm suas validações próprias; o código que os manipula segue a regra de TDD. Não atribuir essa metodologia retroativamente às fases 01 a 14.

Marcar uma fase como concluída somente depois de produzir sua entrega, verificar seu critério de conclusão e registrar eventuais limitações. Manter separadas as situações **não iniciada**, **em andamento**, **aguardando decisão**, **em revisão** e **concluída**.

Planejar commits pequenos e coerentes. Ao concluir cada fase, fazer commit e push conforme a autorização recorrente registrada em [Agents/Regras.md](../Agents/Regras.md). Isso não autoriza criar contas ou contratar serviços.

### Controle de conclusão das fases

Marcar cada caixa somente após cumprir a entrega e o critério de conclusão da fase correspondente. A IA responsável pelo trabalho deve atualizar este checklist ao concluir uma fase. Fases parcialmente feitas ou aguardando decisão permanecem desmarcadas.

Este roteiro é um arquivo de acompanhamento **versionado no GitHub**, por solicitação expressa do responsável em 16/11/2026. As menções a acompanhamento somente local nos registros anteriores descrevem a política histórica; não se aplicam às próximas atualizações. Capturas, logs e configurações privadas continuam fora do Git. A publicação deste arquivo não conclui a fase 50.

- [x] Fase 01 — consolidar o escopo e organizar as decisões
- [x] Fase 02 — escolher paleta e tipografia
- [x] Fase 03 — conteúdo: animais, lote 001
- [x] Fase 04 — definir marca, Aurélio e avatares
- [x] Fase 05 — conteúdo: filmes e séries, lote 001
- [x] Fase 06 — prototipar navegação e telas principais
- [x] Fase 07 — conteúdo: marcas, lote 001
- [x] Fase 08 — preparar o ambiente e verificar publicação gratuita
- [x] Fase 09 — conteúdo: países, lote 001
- [x] Fase 10 — modelar dados e contratos dos dois modos
- [x] Fase 11 — conteúdo: objetos, lote 001
- [x] Fase 12 — implementar catálogo, validação e importador
- [x] Fase 13 — provar o comportamento de interrupções
- [x] Fase 14 — conteúdo: animais, lote 002
- [x] Fase 15 — configurar Google e autenticação da aplicação
- [x] Fase 16 — conteúdo: filmes e séries, lote 002
- [x] Fase 17 — primeiro acesso, perfil, avatares e preferências
- [x] Fase 18 — conteúdo: marcas, lote 002
- [x] Fase 19 — visitante, demonstração única e vinculação
- [x] Fase 20 — motor e configuração do modo individual
- [x] Fase 21 — conteúdo: países, lote 002
- [x] Fase 22 — construir menu, temas e componentes comuns
- [x] Fase 23 — conteúdo: objetos, lote 002
- [x] Fase 24 — construir teclado, quadradinhos e acentos
- [x] Fase 25 — conteúdo: animais, lote 003
- [x] Fase 26 — integrar partida individual e resultados
- [x] Fase 27 — conteúdo: filmes e séries, lote 003
- [x] Fase 28 — pausa individual, retomada e penalidades
- [x] Fase 29 — configurar participantes e sessões da galera
- [x] Fase 30 — conteúdo: marcas, lote 003
- [x] Fase 31 — motor da galera, turnos e desempate
- [x] Fase 32 — conteúdo: países, lote 003
- [x] Fase 33 — integrar painel da galera e encerramentos
- [x] Fase 34 — histórico, estatísticas e rankings
- [x] Fase 35 — conteúdo: objetos, lote 003
- [x] Fase 36 — produzir e integrar as animações do Aurélio
- [x] Fase 37 — conteúdo: animais, lote 004 e fechamento da temática
- [x] Fase 38 — finalizar músicas, efeitos e controles de áudio
- [x] Fase 39 — conteúdo: filmes e séries, lote 004 e fechamento
- [x] Fase 40 — acabamento de movimento e responsividade
- [x] Fase 41 — provisionar e publicar um ambiente de teste gratuito
- [x] Fase 42 — conteúdo: marcas, lote 004 e fechamento
- [x] Fase 43 — revisão de integridade, acesso e falhas
- [x] Fase 44 — conteúdo: países, lote 004 e fechamento
- [x] Fase 45 — revisão de uso real, acessibilidade e desempenho
- [x] Fase 46 — conteúdo: objetos, lote 004 e fechamento das 500 respostas
- [x] Fase 47 — auditar e carregar o catálogo completo da entrega
- [x] Fase 48 — executar aceitação final e corrigir regressões
- [x] Fase 49 — projetar e integrar indicadores de carregamento para ações e espera do servidor
- [ ] Fase 50 — documentar, publicar a versão final e preparar a apresentação

## 2. Distribuição dos sete ciclos

| Referência | Fases | Objetivo principal | Novas respostas | Total acumulado | Dicas acumuladas |
| --- | --- | --- | --- | --- | --- |
| Dia 1 | 01–07 | Fechar decisões iniciais, identidade e experiência | 75 | 75 | 375 |
| Dia 2 | 08–14 | Ambiente, modelagem, importação e prova de interrupções | 75 | 150 | 750 |
| Dia 3 | 15–21 | Google, perfil, demonstração e motor individual | 75 | 225 | 1.125 |
| Dia 4 | 22–28 | Menu, teclado e individual integrado com salvamento | 75 | 300 | 1.500 |
| Dia 5 | 29–35 | Modo com a galera, histórico e rankings | 75 | 375 | 1.875 |
| Dia 6 | 36–42 | Aurélio, áudio, acabamento e ambiente na web | 75 | 450 | 2.250 |
| Dia 7 | 43–50 | Revisão, últimos lotes, carga completa, carregamentos e entrega | 50 | 500 | 2.500 |

Os totais são **metas**, não conteúdo já existente. Um lote só entra no total revisado quando passar pela conferência estrutural e editorial. Os 500 registros estarão completos na fase 46 e auditados na 47, antes dos testes finais e da entrega.

## 3. Decisões que precisam do responsável pelo projeto

As opções abaixo indicam o que precisa ser decidido e quando. Recomendações não são aprovações automáticas.

| ID | Decisão | Preparação esperada da IA | Momento limite e impacto |
| --- | --- | --- | --- |
| D01 | Pausa, fechamento, atualização, perda de conexão e falhas do navegador | Aprovado: individual sem desconto e galera preservada nas dúvidas; recarga gratuita; navegação/Voltar/Avançar conta como saída | Resolvido na fase 13; integrar nas fases 28 e 33 e conferir em aparelhos físicos/hospedagem |
| D02 | Paleta clara e escura | Paleta enviada pelo responsável e tons de apoio aprovados no guia visual | Resolvida na fase 02; ajustes futuros permitidos ao avaliar páginas reais |
| D03 | Fontes | Bricolage Grotesque + DM Sans, pesos e itálico conforme guia visual | Resolvida na fase 02; distribuir licenças com as fontes no frontend |
| D04 | Marca e apresentação do nome Decifra | Variações de logotipo, ícone e uso no menu | Fase 04; nome do jogo já está fechado |
| D05 | Aparência final do Aurélio | Conceitos 2D e folha com corpo, rosto e expressões | Fase 04; bloqueia produção final das animações na 36 |
| D06 | Coleção de avatares | Proposta visual, quantidade e imagens da primeira coleção | Fase 04; necessária para perfil e convidados |
| D07 | Navegação e organização das telas | Protótipos de computador, celular e tablet com todos os estados principais | Fase 06; ajustes finos continuam durante uso real |
| D08 | Resolvida em 2026-10-29: sinais fixos e preenchidos; letras e números para o jogador | Exemplos aprovados: WALL-E com hífen pronto; TOY STORY 3 com número para preencher. Componente na fase 24; integração da API na 26 | Aprovada para a interface; integração antes de publicar conteúdo afetado |
| D09 | Formato de nomes de usuário e convidados | Aprovado: 3–20 letras, números ou sublinhado; sem espaços; unicidade ignora caixa e acentos | Resolvido na fase 10; aplicar nas fases 17 e 29 |
| D10 | Transferência da demonstração | Aprovado: sete dias após o início; login preserva progresso sem desconto; individual existente mantida e demonstração ativa encerrada antes de vincular em caso de conflito | Infraestrutura implementada na fase 19; fluxo jogável integrado na fase 26 |
| D11 | Sorteio de dificuldades e falta de conteúdo | Aprovado: sorteio independente e equiprovável por palavra; preservar níveis; redução confirmada a partir de uma palavra | Implementado na fase 20; sem troca automática de dificuldade |
| D12 | Conteúdo visto entre modos | Aprovado: compartilhar entre modos para o anfitrião; convidados sem histórico permanente | Resolvido na fase 10; implementar na fase 20 |
| D13 | Preservar letras em edição | Aprovado pelo responsável em 2026-10-29: recuperar letras e posição selecionada | Fase 28 implementada |
| D14 | Estatísticas privadas | Aprovado: individuais encerradas, progresso separado, média nos acertos e todas as temáticas associadas | Resolvido e implementado na fase 34; galera excluída |
| D15 | Apresentação do ranking e do histórico | Aprovado: posições 1, 1, 3; somente nome e valor públicos; histórico resumido, filtros e páginas de dez | Resolvido e implementado na fase 34 |
| D16 | Áudio | Cinco faixas de partida + trilha exclusiva do menu, botão junto ao tema; músicas e efeitos aprovados em 30/10/2026 | Fase 38; não precisa decidir faixas antes da infraestrutura de áudio |
| D17 | Preferências no primeiro login | Aprovado: conta nova herda o navegador; preferências já salvas na conta prevalecem | Implementado na fase 17; inicialização atômica sem sobrescrever outra gravação |
| D18 | Hospedagem gratuita e acesso às contas | Aprovados Vercel para frontend e Render para API, com rewrite /api, Neon e Atlas | Escolha resolvida na 15; endereços e teste público na 41 |
| D19 | Requisitos acadêmicos adicionais | Responsável confirmou que não há exigências além das documentadas; apresentação conjunta das duas disciplinas | Conferência concluída na fase 01; rever se surgirem novas orientações |
| D20 | Exclusão de conta e dados | Aprovado: aviso + EXCLUIR; remover identidade, manter resultados e pontos como Jogador excluído; novo Google começa do zero | Resolvido na fase 10; implementar na 17 e integrar na 34 |
| D21 | Desempate especial e conteúdo insuficiente | Decidido em 2026-10-30: manter dificuldade, escolher tema ou aleatório viável; falta de conteúdo oferece outro tema ou empate, sem repetir palavras | Resolvida na 31 |
| D22 | Comportamento do resultado com um único participante | Aprovado em 2026-10-30: pontuação e desempenho, sem desempate sem adversário | Resolvida na 31 |

## 4. Protocolo obrigatório de cada lote

As fases de conteúdo abaixo não significam somente pedir um JSON à IA. Cada uma exige:

1. Consultar o guia e a lista consolidada de respostas existentes, incluindo as em revisão.
2. Pedir **25 respostas novas**, com a temática e distribuição indicadas, em caixa alta, cada uma com cinco dicas textuais progressivas.
3. Salvar o JSON em `Data/palavras/`, com o identificador indicado. Enquanto o importador não existir, revisar o arquivo e mantê-lo aguardando validação automática.
4. Conferir duplicatas, grafia, acentos, fatos, progressão das pistas, ambiguidade e dificuldade. Não aceitar uma dica só porque o JSON é válido.
5. Depois da fase 12, executar a conferência do importador sem gravar. Corrigir todos os erros antes de carregar o lote local.
6. Atualizar o controle de conteúdo. Preservar o identificador após a aprovação; não sobrescrever respostas existentes silenciosamente.
7. Se um item for reprovado, substituí-lo ou corrigi-lo antes de contar o lote como concluído.

Cada lote contém **125 dicas**. A divisão proposta é de 10 fáceis, 10 médias e 5 difíceis nos lotes 001, 002 e 003; no lote 004, são 10 fáceis, 5 médias e 10 difíceis. Isso fecha 40/35/25 por temática.

O acompanhamento está em [Controle-do-catalogo.md](Controle-do-catalogo.md). Nenhuma fase deste roteiro gera as 500 palavras automaticamente; ela reserva o momento e especifica a tarefa a ser executada.

## 5. Dia 1 — decisões e experiência

### Fase 01 — consolidar o escopo e organizar as decisões

**Depende de:** documentos atuais; não depende de código.

- Conferir o enunciado das duas disciplinas, critérios de avaliação, documentação exigida e prazo real.
- Confirmar que os dois modos, 500 respostas, cinco músicas, mascote animado e publicação gratuita pertencem à primeira entrega.
- Organizar D01–D22 por urgência. Resolver primeiro os pontos que afetam o formato do conteúdo, identidade de usuários e modelagem.
- Criar uma matriz de cenários: visitante, primeiro login, conta existente, partida individual salva, galera ativa, resultado e falha de conexão.
- Registrar perguntas em blocos pequenos; decisões ainda não respondidas ficam marcadas, sem virar regras por interpretação.
- Definir como registrar o andamento das fases e como o responsável apresentará sua revisão.

**Entrega:** escopo conferido e lista de decisões com responsáveis e dependências.

**Concluída quando:** sabemos o que a entrega precisa demonstrar e quais tarefas aguardam respostas. Pendências que só afetam acabamento não impedem avançar no backend.

#### Registro de execução da fase 01

**Estado:** concluída — escopo revisado, respostas incorporadas e pendências encaminhadas às fases correspondentes.

Foram conferidos os documentos de requisitos, planejamento técnico, regras de desenvolvimento e o roteiro local. O responsável confirmou que as exigências acadêmicas existentes já estão documentadas e não há outras a acrescentar neste momento.

##### Escopo consolidado a partir das decisões já aprovadas

| Frente | O que a primeira entrega deve demonstrar |
| --- | --- |
| Acesso | Uma demonstração por navegador com três respostas fáceis; login Google; escolha inicial de nome único e avatar; vínculo da demonstração ao perfil sem duplicar pontos; exclusão da própria conta e dados |
| Individual | Partidas de 3, 5 ou 7 respostas; temáticas e dificuldades configuráveis; cinco dicas; pontuação por dica; limpeza após erro; desistência de palavra; pausa, retomada e abandono conforme regras aprovadas |
| Galera | Um a três participantes no mesmo dispositivo; até cinco sessões regulares; painel com uma resposta por participante; ordem sorteada; pontos por posições novas; empate e uma sessão extra opcional; sem ranking próprio ou pausa futura |
| Conteúdo | 500 respostas únicas e 2.500 dicas em vinte lotes; cinco temáticas com 100 respostas, distribuídas em 40 fáceis, 35 médias e 25 difíceis |
| Acompanhamento | Histórico privado dos dois modos; estatísticas individuais; três rankings gerais individuais, publicados somente no encerramento das partidas |
| Experiência visual | Menu com cartões e botões; temas claro e escuro; computador, celular e tablet; mascote Aurélio 2D, avatares e animações |
| Experiência sonora | Aproximadamente cinco músicas lo-fi/arcade, efeitos por categoria, volumes independentes, silêncio geral e preferências persistidas |
| Implementação | React e FastAPI; PostgreSQL para contas/progresso e MongoDB para conteúdo; código próprio em português; bibliotecas e arquitetura aprovadas |
| Publicação | Interface e API na web com custo zero; Neon e Atlas; Google configurado para o endereço publicado; execução local documentada |
| Verificação | Testes das regras e dos fluxos essenciais, conferência do catálogo, acesso privado e validação visual e de interação |

Não entram automaticamente nesta entrega: participantes da galera em dispositivos diferentes, área administrativa, upload de avatar pessoal, senha própria, dicas multimídia, respostas alternativas ou histórico detalhado por rodada. A exclusão de conta foi incluída expressamente; seus efeitos foram aprovados na fase 10 e serão implementados na fase 17.

##### Informações solicitadas ao responsável

| Informação | Situação atual | Por que é necessária |
| --- | --- | --- |
| Data real de entrega e apresentações parciais | Estimativa de até um mês, sem data exata; apresentação conjunta das duas disciplinas; nenhuma apresentação parcial informada | Athos confirmará a data quando souber; sete ciclos continuam como referência, sem promessa de sete dias |
| Exigências de Web II e Banco de Dados II | Nenhuma adicional às já documentadas, conforme o responsável | Revisitar somente se surgirem novas orientações |
| Equipe e disponibilidade aproximada por dia | Athos com auxílio da IA; horas diárias não informadas | Ajustar ritmo conforme execução, sem presumir disponibilidade ou outros integrantes |
| Exclusão de conta na primeira entrega — D20 | Inclusão aprovada | Definir efeitos na fase 10, implementar na 17, integrar acompanhamento na 34 e verificar nas fases 43 e 48 |

Essas respostas podem registrar uma informação ainda desconhecida como tal. Não inventar datas, critérios acadêmicos ou integrantes. Se uma exigência ainda não foi divulgada, registrar quem acompanhará essa pendência e quando revisitá-la.

##### Matriz inicial de cenários

| Cenário | Caminho esperado | Verificação principal | Dependência pendente |
| --- | --- | --- | --- |
| Visitante sem demonstração | Menu → jogo rápido → três respostas fáceis → resultado ou login | Uma única demonstração por navegador | D10: transferência e login no meio da partida |
| Visitante com demonstração utilizada | Menu informa o limite e permite entrar com Google | Não criar uma segunda demonstração | Prazo de vínculo da demonstração em D10 |
| Primeiro login | Google → nome disponível → avatar → menu autenticado | Identidade vinculada, sem senha própria | D09 e D17: validação de nomes e conciliação de preferências |
| Conta existente | Google → perfil e preferências recuperados → menu | Dados privados e configuração preservados | D10: possível conflito entre demonstração e partida salva |
| Exclusão de conta | Perfil → confirmação → processamento → retorno informado | Somente o titular pode excluir; efeitos coerentes nos dados e acessos | D20: confirmação, destino dos dados e novo login, antes da implementação |
| Individual nova | Configuração → seleção → dicas e palpites → resultado | Pontos corretos e nenhuma resposta duplicada na partida | D08, D11 e D12: sinais, seleção e conteúdo visto entre modos |
| Individual pausada | Menu oferece continuar → mesma rodada e dica | Desconto único por pausa, saldo preservado e atualização sem desconto | D01 e D13: interrupções e rascunho de letras |
| Individual salva e galera iniciada | Configurar galera preservando a individual pausada | Independência dos estados dos dois modos | Sem mudança de regra necessária |
| Galera ativa | Participantes → sorteio → letras/palavras → próxima sessão | Vez, bloqueios, pontuação parcial e exposição somente do painel atual | D01 e D09: conexão e validação dos nomes |
| Galera com empate normal | Aceitar empate ou propor uma sessão extra só entre líderes | No máximo uma sessão extra; concordância de todos os empatados | D21 e D22: configuração da sessão extra e caso com um participante |
| Desistência | Individual encerra ou pula palavra conforme ação; galera encerra a partida | Não confundir pausa, abandono e desistência de palavra | Tratamento técnico das saídas em D01 |
| Resultado e acompanhamento | Resultado → histórico privado; individual → atualização do ranking | Contabilização única; galera fora do ranking | D14 e D15: fórmulas e apresentação |
| Falha de conexão ou atualização | Recuperar o estado confirmado ou aplicar encerramento conforme regra e decisão técnica | Não duplicar pontos, turnos ou penalidades; não punir recarga simples | Prova técnica D01 na fase 13 |

##### Ordem das decisões e responsáveis

| Prioridade | Decisões | Quem prepara / quem decide | Limite de resolução |
| --- | --- | --- | --- |
| Consolidado | D19, inclusão de D20 e informações de prazo/equipe | Respostas de Athos registradas pela IA | Fase 01 concluída; Athos informa a data exata quando conhecida |
| Exclusão de conta | Efeitos de D20 | IA apresenta alternativas e impactos; responsável decide | Fase 10, antes da implementação na 17 e integração na 34 |
| Antes dos primeiros lotes afetados | D08: sinais, números e separadores | IA apresenta exemplos; responsável decide o comportamento | Antes de aprovar conteúdo que dependa da regra; integração até fase 24 |
| Próxima fase visual | D02 e D03: paleta e fontes | IA prepara alternativas aplicadas; responsável escolhe | Fase 02 |
| Identidade e navegação | D04, D05, D06 e D07 | IA apresenta marca, Aurélio, avatares e fluxos; responsável revisa | Fases 04 e 06, antes do acabamento dependente |
| Viabilidade da publicação | D18 | IA verifica limites atuais; responsável escolhe e realiza acessos pessoais | Iniciar na fase 08 e resolver até a 15 |
| Modelagem e acesso | D09, D10 e D12 | IA propõe contratos e cenários de conflito; responsável decide regras | Mapear na fase 10; resolver antes das operações afetadas nas fases 17–20 |
| Interrupções | D01 | IA produz e testa a prova; responsável decide adaptações visíveis se necessárias | Fase 13, antes de concluir 28 e 33 |
| Preferências | D17 | IA mostra conflito de preferências locais/conta; responsável escolhe | Fase 17 |
| Seleção de partidas | D11 | IA propõe distribuição e alternativas por falta de conteúdo; responsável decide | Fase 20 |
| Retomada individual | D13 | IA mostra opções de recuperação do rascunho; responsável decide | Fase 28 |
| Resultado da galera | D21 e D22 | IA demonstra casos de borda; responsável decide o comportamento | Fase 31 |
| Estatísticas e classificação | D14 e D15 | IA prepara fórmulas e amostras; responsável confirma indicadores e apresentação | Fase 34 |
| Experiência sonora | D16 | IA prepara prévias e procedência; responsável escolhe faixas e efeitos | Fase 38 |

A ordem acima agenda as decisões sem transformar todas elas em bloqueios da fase 01. Paleta, fontes e aparência do Aurélio serão avaliadas com alternativas visuais nas fases próprias, e não por perguntas abstratas nesta etapa.

##### Forma de acompanhamento adotada

- O check geral da fase permanece desmarcado até cumprir seu critério de conclusão.
- O estado e as pendências desta fase são registrados nesta seção local. Decisões de produto efetivamente aprovadas serão refletidas em `Doc/Detalhes.md`.
- O responsável pode responder pelos números das perguntas. A IA registra a decisão, o impacto e a fase dependente sem exigir confirmações repetidas.
- A revisão de alternativas visuais ocorrerá sobre propostas concretas; decisões técnicas rotineiras serão resolvidas pela implementação dentro do plano aprovado.
- O roteiro continua excluído do Git. Não criar cópias versionadas do acompanhamento pessoal sem pedido do responsável.

##### Checklist interno da fase 01

- [x] Conferir as fontes de requisitos e instruções do repositório.
- [x] Consolidar o escopo já aprovado, sem pedir nova autorização para os mesmos recursos.
- [x] Preparar matriz de cenários dos dois modos, acesso, resultado e falhas.
- [x] Priorizar D01–D22 e indicar responsáveis e fases dependentes.
- [x] Definir como acompanhar decisões, revisão e conclusão localmente.
- [x] Registrar a resposta sobre prazo e equipe; disponibilidade diária permanece não informada.
- [x] Conferir as exigências acadêmicas: nenhuma adicional às já documentadas.
- [x] Registrar a inclusão da exclusão de conta nesta entrega.
- [x] Incorporar os impactos das respostas e verificar o critério de conclusão da fase.

O critério da fase foi atendido: escopo consolidado e decisões restantes organizadas. Data exata e horas diárias não foram presumidas e não impedem a próxima fase. Nenhuma funcionalidade foi implementada nesta etapa documental.

### Fase 02 — escolher paleta e tipografia

**Depende de:** direção visual já discutida; decisões D02 e D03.

- Preparar duas ou três direções visuais do Decifra, aplicadas a uma tela de menu e a uma pequena amostra da partida.
- Mostrar cada alternativa nos temas claro e escuro, com fundo, superfície, texto, cor principal e estados de sucesso, erro, foco e desabilitado.
- Comparar fontes em títulos, dicas longas, botões, placares e palavras com Á, Ã, Ê e Ç. A leitura dos quadradinhos precisa ser confortável.
- Verificar contraste e leitura em tela pequena. Cor não será a única indicação de acerto, erro ou turno.
- Apresentar alternativas concretas para o responsável escolher ou pedir ajustes.
- Registrar cores, pesos, tamanhos e origem das fontes em um guia visual, sem tratar testes preliminares como decisão final.

**Entrega:** paleta e combinação de fontes aprovadas, ou ajustes claros para uma segunda rodada.

**Concluída quando:** há uma direção aprovada que pode virar variáveis de tema e componentes. Evitar redesenhar cada tela com uma linguagem diferente.

#### Registro de execução da fase 02

Após três propostas iniciais, o responsável aprovou a aplicação da paleta enviada (#444439, #8B8669, #DECD9C, #E5E37D, #D4FE62) com Bricolage Grotesque + DM Sans, incluindo variações de tamanho, peso e itálico. A aprovação permite ajustes quando surgirem as páginas reais. Valores, tons de apoio, estados e evidências estão em `Doc/Guia-visual.md`.

A prévia foi conferida no Edge em 320, 390, 768 e 1024 px, nos dois temas, sem transbordamento horizontal ou erros JavaScript. Fontes carregadas, alternância de tema, retorno de amostra, foco de 3 px e botão desabilitado conferidos. Capturas em 320 px nos dois temas e 1024 px no claro foram inspecionadas. Validação da aplicação real e em dispositivos físicos permanece nas fases próprias.

- [x] Preparar três direções e seus dois temas.
- [x] Documentar cores, fontes, dimensões iniciais e origens.
- [x] Receber escolha ou ajustes de Athos para D02 e D03.
- [x] Validar visualmente a direção escolhida em largura pequena e conferir fontes e estados.
- [x] Consolidar o guia aprovado e concluir a fase.
- [x] Fazer commit e push da fase concluída, conforme a regra do projeto — `69e07c5`, publicado em `origin/main`.

### Fase 03 — conteúdo: animais, lote 001

**Depende de:** guia e protocolo da seção 4; não precisa do importador pronto.

- Produzir `animais-001.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Priorizar espécies reconhecíveis e características verificáveis. Não usar afirmações falsas de habitat, dieta ou comportamento para tornar uma pista mais fácil.
- Conferir se nomes populares não criam respostas alternativas ambíguas que o jogo não aceita.
- Revisar as 125 dicas e registrar o lote para validação automática na fase 12.

**Entrega:** 25 respostas revisadas; meta acumulada de **25 respostas e 125 dicas**.

**Concluída quando:** arquivo e revisão editorial estão prontos; aprovação de carga aguarda o importador quando necessário.

#### Registro de execução da fase 03

**Estado:** concluída — lote `Data/palavras/animais-001.json` gerado, conferido editorialmente e registrado no controle de catálogo.

- [x] Produzir `animais-001.json` com 25 respostas (10 fáceis, 10 médias e 5 difíceis) e 125 dicas progressivas.
- [x] Respostas em caixa alta com acentos preservados e identificadores estáveis sem acentos.
- [x] Espécies reconhecíveis verificadas sem ambiguidades ou afirmações biológicas falsas.
- [x] Atualizar `Doc/Controle-do-catalogo.md` com status "Aguardando validação automática" e ficha de conferência.
- [x] Executar verificações de formato JSON e consistência dos dados.


### Fase 04 — definir marca, Aurélio e avatares

**Depende de:** paleta em definição; decisões D04, D05 e D06.

- Preparar variações da marca Decifra para menu, cabeçalho pequeno, ícone de aba e telas de resultado.
- Apresentar conceitos do Aurélio como dicionário 2D com braços, pernas e rosto, expressivo e com desenho próprio.
- Mostrar expressões de recepção, curiosidade, erro, comemoração e empate, além da silhueta em tamanho pequeno.
- Planejar a separação de capa, páginas, olhos, boca e membros para permitir animação; não aprovar somente uma imagem impossível de reutilizar em movimento.
- Apresentar uma coleção inicial de avatares e decidir sua quantidade, estilo e disponibilidade para conta e convidados.
- Identificar origem e permissões de uso dos recursos, mantendo desenhos provisórios claramente indicados.

**Entrega:** conceito de marca, modelo de Aurélio e direção dos avatares avaliáveis pelo responsável.

**Concluída quando:** o responsável aprovou o modelo visual ou informou ajustes. A produção das animações completas só começa na fase 36 sobre a versão aprovada.

#### Registro de execução da fase 04

**Estado:** concluída após revisão em 2026-10-27 — estudo vetorial da marca e prancha do Aurélio com amostra de avatares apresentados e aprovados. Solicitado e aplicado somente reduzir pela metade o espaço entre D e ECIFRA nas versões da marca. Materiais salvos em `Doc/Identidade-visual/`. Ilustração raster não equivale a personagem SVG separado em partes e pronto para animação; a produção das partes e dos avatares individuais permanece nas fases próprias.

- [x] **D04 (Marca):** Aprovado o conceito "O Bloco Decifrado" (`[ D ]` em verde-lima `#D4FE62` com contorno oliva `#444439` + `ECIFRA` em Bricolage Grotesque 800), com variações para menu, cabeçalho compactado e favicon/ícone.
- [x] **D05 (Aurélio):** Aprovado o estilo "O Apresentador Showman", com gravata-borboleta verde-lima, luvas e sapatos cartoon, separação anatômica em camadas SVG (`corpo_capa`, `corpo_miolo`, `acessorio_gravata`, `rosto`, `membros`) e definição das 5 expressões base.
- [x] **D06 (Avatares):** Aprovada a coleção inicial de 20 avatares temáticos divididos em 5 grupos (Aurélio, Fauna, Enigmas, Entretenimento e Retrô/Arcade) com identificadores estáveis em vetor circular.
- [x] Consolidação das decisões em `Doc/Detalhes.md` e checklist atualizado.


### Fase 05 — conteúdo: filmes e séries, lote 001

**Depende de:** protocolo; D08 quando o título exigir sinal, número ou separador ainda não definido.

- Produzir `filmes-e-series-001.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Escolher uma grafia oficial ou consagrada de cada título, coerente com o público em português. Não cadastrar traduções como duplicatas.
- Escrever pistas originais e factualmente corretas, evitando copiar sinopses e entregar o título explicitamente.
- Revisar espaços, acentos e extensão das expressões, incluindo títulos longos que testarão o layout.

**Entrega:** 25 respostas e 125 dicas; meta acumulada de **50 respostas e 250 dicas**.

**Concluída quando:** lote revisado e sem títulos duplicados; dúvidas de grafia foram resolvidas antes da aprovação.

#### Registro de execução da fase 05

**Estado:** concluída — lote `Data/palavras/filmes-e-series-001.json` gerado, conferido editorialmente e registrado no controle de catálogo.

- [x] Produzir `filmes-e-series-001.json` com 25 títulos consagrados (10 fáceis, 10 médios e 5 difíceis) e 125 dicas progressivas.
- [x] Respostas em caixa alta com acentos preservados e identificadores estáveis sem acentos.
- [x] Títulos compostos apenas por letras e espaços (sem pontuações ambíguas de D08).
- [x] Atualizar `Doc/Controle-do-catalogo.md` com status "Aguardando validação automática", ficha de conferência e meta acumulada de 50 respostas.
- [x] Executar verificações de formato JSON e ausência de duplicatas em relação ao catálogo global.


### Fase 06 — prototipar navegação e telas principais

**Depende de:** decisões D07 e direção visual; pode usar Aurélio provisório identificado.

- Desenhar menu de visitante, demonstração já usada, menu autenticado e primeiro acesso.
- Desenhar configuração individual simples, combinação de dificuldades, ordem e falta de conteúdo.
- Desenhar configuração da galera com nomes, avatares, sessões, dificuldade e escolha manual ou aleatória de temáticas.
- Desenhar partida individual, painel da galera, resultados, histórico, perfil, configurações e três rankings.
- Incluir carregamento, dados vazios, erro, confirmação de pausa, aviso de desconto, desistência e autenticação expirada.
- Mostrar a adaptação para celular e tablet, especialmente teclado com acentos e painel com três respostas longas.

**Entrega:** mapa de navegação e protótipos que permitam percorrer os dois modos.

**Concluída quando:** as ações necessárias estão acessíveis e o responsável consegue avaliar o fluxo sem precisar imaginar telas ausentes.

#### Registro de execução da fase 06

**Estado:** concluída e aprovada pelo responsável em 2026-10-27 — após a reabertura, foi produzido `Doc/Prototipos/index.html`, com CSS e JavaScript próprios e 21 cenários navegáveis. O responsável pediu uma aparência mais próxima de jogo e forneceu quatro referências móveis. Todas as telas receberam nova linguagem: Aurélio isolado no menu e nas dicas, cartões ilustrados, peças e botões com volume, navegação lateral/inferior e adaptação para computador/tablet/celular. Os testes foram repetidos após o redesenho. São simulações locais, sem backend ou motor completo de jogo. Cobertura e limites em `Doc/Prototipos/LEIA-ME.md`; nova direção visual e protótipos aprovados pelo responsável.

Verificadas 126 combinações (21 cenários, larguras 320/768/1280 px, claro/escuro), sem transbordamento horizontal detectado ou erros JavaScript. Fluxos principais e diálogos percorridos e capturas inspecionadas. As telas foram apresentadas e aprovadas pelo responsável após o redesenho. A fase está marcada como concluída. Commit `84d7858` publicado em `origin/main`.

- [x] **Mapa de rotas e transições:** Mapeamento completo dos fluxos de visitante (jogo rápido e convite) e autenticado (menu, primeiro acesso, individual, galera, rankings, perfil e configurações).
- [x] **Experiência do modo individual:** Wireframe da tela da rodada (dica atual, histórico de dicas, quadradinhos, teclado virtual com Ç dedicado e barra de acentos rápidos, bloqueio por ocorrência e modal de pausa com aviso de -100 pts).
- [x] **Experiência do modo com a galera:** Wireframe do painel compartilhado de 1 a 3 palavras, destaque visual da vez, opções de escolher letra geral ou palpite completo, sorteio de ordem e fluxo de desempate.
- [x] **Acompanhamento e modais:** Desenho das telas de perfil (com histórico duplo e exclusão de conta), três rankings públicos, configurações de áudio em 3 grupos e os 5 modais críticos do sistema.
- [x] **Adaptação responsiva:** Especificação de comportamento para computador (lado a lado) e celular/tablet (empilhamento vertical com teclado acessível).


### Fase 07 — conteúdo: marcas, lote 001

**Depende de:** protocolo e definição de escrita dos casos especiais de D08.

- Produzir `marcas-001.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Variar segmentos como automóveis, tecnologia e bebidas. Não tornar marcas sinônimas de um único produto se isso gerar uma dica falsa.
- Adotar nomes corretos e pistas estáveis, evitando slogans copiados, preços e posições de mercado sujeitas a mudança.
- Verificar colisões com respostas de outras temáticas e nomes que exigem números ou pontuação.

**Entrega:** 25 respostas e 125 dicas; meta do dia de **75 respostas e 375 dicas**.

**Concluída quando:** lote revisado e registrado; o progresso visual e técnico está atualizado para o próximo ciclo.

#### Registro de execução da fase 07

**Estado:** concluída — lote `Data/palavras/marcas-001.json` gerado, conferido editorialmente e registrado no controle de catálogo. Meta de conteúdo do Dia 1 atingida (75 respostas e 375 dicas).

- [x] Produzir `marcas-001.json` com 25 marcas consagradas (10 fáceis, 10 médias e 5 difíceis) e 125 dicas progressivas.
- [x] Respostas em caixa alta com acentuação correta e identificadores estáveis sem acentos.
- [x] Nomes compostos apenas por palavras únicas (sem hífens, números ou sinais ambíguos de D08).
- [x] Variedade de segmentos contemplada (tecnologia, automotivo, esportes, entretenimento, alimentos, bebidas, moda, brinquedos).
- [x] Atualizar `Doc/Controle-do-catalogo.md` com status "Aguardando validação automática", ficha de conferência e meta acumulada de 75 respostas.
- [x] Executar verificações de formato JSON e conferência cruzada com os lotes anteriores.


## 6. Dia 2 — fundação técnica e importação

### Fase 08 — preparar o ambiente e verificar publicação gratuita

**Depende de:** regras de desenvolvimento e planejamento aprovado; decisão D18 em investigação.

- Verificar versões e funcionamento do Python, Node, PostgreSQL e MongoDB já disponíveis, sem reinstalar serviços desnecessariamente.
- Criar a estrutura aprovada de frontend e backend, módulos próprios em português e ambientes separados de desenvolvimento e teste.
- Fixar versões compatíveis e arquivos de lock. Instalar somente o necessário à etapa, usando a documentação oficial vigente.
- Configurar exemplos de variáveis sem segredos e exclusões de Git para ambientes, caches, arquivos gerados e credenciais.
- Preparar execução local da API e interface, verificação de tipos, formatação e testes básicos de infraestrutura.
- Investigar cedo se hospedagens gratuitas suportam a API, os bancos, cookies e eventual conexão persistente; levantar limitações antes de depender delas.
- Preparar verificações automáticas do repositório para os testes e a compilação que já existirem, sem inventar cobertura ou resultados.

**Entrega:** ambiente reproduzível e diagnóstico de viabilidade da publicação.

**Concluída quando:** outra execução local consegue iniciar os serviços do projeto com instruções claras e sem credenciais no código.

#### Registro de execução da fase 08

**Estado:** concluída em 2026-10-27. Base modular de React/TypeScript/Vite e FastAPI criada, com ambientes locais, dependências fixadas, arquivos de exemplo e verificação automática do repositório. Instruções em `Doc/Ambiente-local.md` e diagnóstico em `Doc/Publicacao-gratuita.md`.

- [x] Verificar Python 3.13.0, Node 22.13.0, PostgreSQL 18.0 e MongoDB 8.2.5. Serviços ativos e portas disponíveis; autenticação e bancos próprios ainda dependem da modelagem.
- [x] Criar estrutura e pontos de expansão aprovados, mantendo o protótipo visual separado.
- [x] Instalar dependências necessárias e gerar `package-lock.json` e locks Python com hashes por pip-tools.
- [x] Configurar exemplos fictícios de desenvolvimento/teste e ignorar segredos, ambientes e arquivos gerados.
- [x] Verificar comunicação real React → proxy Vite → FastAPI em navegador.
- [x] Executar três testes do backend, três da interface, tipos, formatação, compilação e verificação de dependências.
- [x] Preparar GitHub Actions para as verificações existentes; sucesso remoto deve ser conferido na execução do GitHub, não presumido.
- [x] Investigar Render, Cloudflare Pages, Vercel, Neon e Atlas em documentação oficial atual. D18 continua em escolha até fase 15; suspensão, mesma origem/cookies e reconexão documentados.

Commit `bcfaeb8` publicado em `origin/main`.

Nenhum usuário, tabela ou coleção foi criado; não há credenciais de banco no código. O endpoint `/api/saude` comprova processo HTTP, não saúde dos bancos. Criação de contas externas, login Google e publicação não foram antecipados. A estrutura permite iniciar API/interface sem credenciais nesta etapa.

### Fase 09 — conteúdo: países, lote 001

**Depende de:** protocolo; critérios de nomes em português.

- Produzir `paises-001.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Verificar grafia, localização e fatos usados nas pistas em fontes confiáveis; não confundir país com cidade ou território sem critério definido.
- Preferir informações geográficas e culturais estáveis. Se a seleção exigir casos de reconhecimento controverso, apresentar a dúvida antes de incluí-los.
- Preservar acentos e revisar variantes de nome para que uma resposta tenha grafia consistente.

**Entrega:** 25 respostas e 125 dicas; meta acumulada de **100 respostas e 500 dicas**.

**Concluída quando:** lote revisado e critério de inclusão documentado nos casos necessários.

#### Registro de execução da fase 09

**Estado:** fase de produção concluída em 2026-10-27, com geração e revisão por IA. Produzido `Data/palavras/paises-001.json` com 25 países e 125 dicas, na distribuição 10/10/5. Fontes e critérios registrados em `Doc/Revisoes/paises-001.md`; lista de exclusão consolidada em `Doc/Respostas-do-catalogo.md`.

A conferência local validou contrato, caixa alta, acentos, identificadores, cinco dicas e ausência de duplicatas ou resposta nas próprias pistas. Catálogo com 100 respostas e 500 dicas produzidas. Nenhuma importação executada; importador previsto na fase 12.

A entrega de produção e revisão técnica da fase foi atendida. A avaliação humana do conteúdo permanece necessária antes da aprovação para carga; por isso as 25 respostas ainda não entram na coluna de aprovação humana do controle. O check da fase registra entrega dos arquivos e revisão técnica, não aprovação humana presumida ou importação. Commit `50faee2` publicado em `origin/main`.

### Fase 10 — modelar dados e contratos dos dois modos

**Depende de:** decisões que afetam identidade e estados; pode manter campos visuais independentes.

- Criar o modelo relacional de usuários, avatares, preferências, visitantes, partidas, rodadas, sessões da galera, participantes, palpites, exposições de conteúdo e penalidades.
- Distinguir sessão de autenticação de sessão do jogo nos nomes e no modelo.
- Resolver D20 com o responsável e modelar exclusão de conta: confirmação, destino dos dados relacionados, referências da galera, efeitos no ranking, sessões de acesso e futuro login com o mesmo Google.
- Definir estados e transições, pontuação individual e por participante, motivo de encerramento e identificação de ações já processadas.
- Definir unicidade do nome, identidade Google, uma partida individual não finalizada por conta e convivência com uma partida da galera.
- Modelar o documento MongoDB com identificador estável, resposta, dificuldade, temáticas e cinco dicas; definir como preservar o conteúdo usado numa partida salva.
- Especificar operações da API em português: autenticação, primeiro acesso, demonstração, configuração, palpites, dicas, pausas, turnos, histórico, ranking e preferências.
- Definir respostas públicas que não revelem soluções futuras e códigos de erro estáveis; registrar acesso permitido em cada operação.
- Criar migrações iniciais e índices necessários; não implementar todos os módulos de uma só vez.

**Entrega:** diagrama/modelagem, contratos documentados e base relacional migrável.

**Concluída quando:** cada regra relevante possui um lugar claro nos dados e uma operação responsável, sem duplicar pontuação oficial entre bancos.

#### Registro de execução da fase 10

**Estado:** concluída em 2026-10-27.

- [x] Modelagem com diagrama, 18 entidades relacionais e divisão entre PostgreSQL e MongoDB.
- [x] Decisões D09, D12 e D20 aprovadas e incorporadas a Detalhes.md.
- [x] Migração Alembic 0001 com restrições de unicidade, referências compostas e índices parciais.
- [x] Documento de conteúdo Pydantic com revisão imutável; catálogo e importador reservados à fase 12.
- [x] Contratos documentados, acesso por operação e limites de exposição de soluções.
- [x] 28 testes aprovados, incluindo PostgreSQL real isolado, nomes e conteúdo dos lotes; Ruff e dependências consistentes.
- [x] Reversão, reaplicação e comparação da migração verificadas em decifra_teste na porta 55432. A instância foi encerrada após a revisão.
- [x] Roteiro mantido local e ignorado pelo Git.

Entregas: Doc/Modelagem-dados.md, Doc/Contratos-api.md, Backend/aplicacao/bancos e Backend/migracoes. Só a rota de saúde está disponível; autenticação, exclusão, serviços do jogo, configuração do banco de desenvolvimento e importação permanecem nas fases próprias. Detalhes de demonstração, distribuição, interrupções e desempate seguem nas decisões previstas, sem impedir esta base inicial.

### Fase 11 — conteúdo: objetos, lote 001

**Depende de:** protocolo.

- Produzir `objetos-001.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Escolher objetos identificáveis, evitando pistas que aceitem muitos sinônimos comuns sem distinguir a resposta exigida.
- Conferir se as dicas descrevem função, material ou contexto de maneira correta, sem generalizações frágeis.
- Identificar duplicatas com nomes de marcas ou expressões já registradas e revisar as 125 dicas.

**Entrega:** 25 respostas e 125 dicas; meta acumulada de **125 respostas e 625 dicas**.

**Concluída quando:** o lote está pronto para servir de amostra multitemática ao importador.

#### Registro de execução da fase 11

**Estado:** produção concluída em 2026-10-27. Avaliação humana pendente, sem presumir aprovação para carga.

- [x] Produzir Data/palavras/objetos-001.json com 25 respostas e 125 dicas, na distribuição 10/10/5.
- [x] Revisar progressão, possíveis sinônimos, funções e variantes dos objetos; registrar fontes em Doc/Revisoes/objetos-001.md.
- [x] Validar campos, Unicode, dicas, nomes e duplicatas globais: 125 respostas únicas e 625 dicas.
- [x] Executar os cinco testes de conteúdo, cobrindo todos os lotes existentes.
- [x] Atualizar Controle-do-catalogo.md e a lista consolidada de exclusão.

Nenhum dado importado no MongoDB. A conferência pelo importador completo será feita na fase 12, respeitando os lotes ainda em revisão humana.


### Fase 12 — implementar catálogo, validação e importador

**Depende de:** fases 08 e 10; lotes já produzidos.

- Implementar a validação JSON de versão, lote, identificador, caixa alta, cinco dicas, temática e dificuldade.
- Detectar duplicatas internas, entre arquivos e no banco, sem tratar associações adicionais como respostas novas.
- Oferecer conferência sem gravar, relatório de erros por arquivo/item e carga explícita sem sobrescrita silenciosa.
- Definir o comportamento ao encontrar erro no meio de um arquivo e testar reexecução depois de carga parcial, preservando consistência e identificadores.
- Validar os lotes das fases anteriores, corrigir os reprovados e importar os aprovados no MongoDB local.
- Criar consultas para conteúdo por temática/dificuldade e relatórios de quantidade, sem expor catálogo de respostas pela API pública.
- Testar acentos, expressões, campos ausentes, dicas em número incorreto, conflito de identificadores e reimportação.

**Entrega:** importador utilizável e primeiros lotes disponíveis localmente.

**Concluída quando:** uma importação inválida é explicada e uma reexecução válida não duplica conteúdo. Lotes anteriores só passam a aprovados após essa validação.

#### Registro de execução da fase 12

**Estado:** concluída em 2026-10-27.

- [x] Implementar validador completo com erros por arquivo/item e detecção de duplicatas locais e no banco.
- [x] Implementar comandos validar, conferir sem escrita, importar explicitamente e quantidades.
- [x] Publicar revisão imutável antes do catálogo atual; recuperar interrupções sem substituir ou duplicar documentos.
- [x] Criar índices e consultas internas por temática/dificuldade e revisão histórica, sem endpoint público de soluções.
- [x] Validar os cinco lotes: 125 respostas e 625 dicas; nenhuma correção estrutural necessária.
- [x] Importar os três lotes com aprovação editorial registrada: 75 respostas/375 dicas; reexecução reconheceu os 75 idênticos e publicou zero novos.
- [x] Verificar 58 testes do backend, com PostgreSQL e MongoDB isolados, além de Ruff e dependências.
- [x] Documentar operação e limites em Doc/Importacao-catalogo.md; manter o roteiro fora do GitHub.

Países e objetos passaram na validação automática, mas aguardam revisão humana e não foram carregados. Atlas e regras de atualização de conteúdo já publicado permanecem nas etapas próprias. A importação usa o MongoDB existente na porta 27017; os servidores isolados de teste foram encerrados ao final.


### Fase 13 — provar o comportamento de interrupções

**Depende de:** ambiente básico; decisão D01.

- Montar um fluxo pequeno que registre identidade da aba, atividade, atualização e retorno ao servidor, antes de implementar penalidades definitivas.
- Experimentar atualização normal e forçada, fechamento de aba, fechamento de janela, reabertura, perda de conexão, suspensão e navegação de voltar.
- Testar em computador e em navegador móvel real quando disponível. Registrar os casos que o navegador não consegue distinguir com certeza.
- Demonstrar como recuperar uma recarga sem penalidade e impedir dois descontos pela mesma interrupção.
- Avaliar a necessidade de confirmação no retorno ou janela de reconexão; qualquer adaptação visível às regras precisa de decisão do responsável.
- Registrar o método aceito e seus limites, além de como será hospedado gratuitamente. Não apresentar heurística como garantia perfeita.

**Entrega:** evidência prática e decisão sobre o tratamento de interrupções nos dois modos.

**Concluída quando:** existe um método testado e aceito para os casos suportados e uma decisão explícita para os ambíguos. As fases 28 e 33 dependem desse resultado.

#### Registro de execução da fase 13

**Estado:** concluída em 2026-10-27; política aprovada pelo responsável após a prova e registrada em Detalhes.md.

- [x] Preparar prova FastAPI/TypeScript isolada, sem bancos, contas ou partidas reais.
- [x] Observar identidade de aba/documento, recarga, histórico/cache, visibilidade, sinais de rede e ausência no servidor.
- [x] Verificar 32 testes Edge/Chromium, com computador e tablet/celular emulados, incluindo fechamento do processo e temporizadores suspensos.
- [x] Verificar 23 testes backend, tipos, compilação, 3 testes Vitest, Ruff e Prettier.
- [x] Demonstrar recarga sem desconto, aviso atrasado ignorado e uma única penalidade fictícia por pausa/saída.
- [x] Aprovar D01: preservar individual sem desconto e painel da galera nos casos ambíguos; navegação para outra página conta como saída.
- [x] Documentar método HTTP sem exigência de serviço pago, limites de hospedagem e integração persistida futura em Doc/Prova-interrupcoes.md.

Sem garantia universal de distinguir fechamento e falha; essa limitação agora tem política explícita. Aparelhos físicos, Safari/Firefox, restauração manual e hospedagem pública não foram testados. A suspensão usada no teste é controlada nos temporizadores, não suspensão real do sistema. Os servidores de teste foram encerrados pelo Playwright. A página da prova não entra no build normal de produção.


### Fase 14 — conteúdo: animais, lote 002

**Depende de:** protocolo e relatório consolidado da fase 12.

- Produzir `animais-002.json`: **10 fáceis, 10 médias e 5 difíceis**, excluindo as 25 respostas do primeiro lote.
- Ampliar a variedade sem repetir o mesmo animal sob nome alternativo.
- Revisar, validar sem gravar e importar somente após aprovação.
- Conferir 50 respostas únicas de animais, com distribuição parcial 20/20/10.

**Entrega:** meta acumulada de **150 respostas e 750 dicas**.

**Concluída quando:** o lote passou por revisão e validação, e o ritmo do roteiro foi reavaliado antes do terceiro ciclo.

#### Registro de execução da fase 14

**Estado:** produção concluída em 2026-10-27, com avaliação humana pendente antes da carga.

- [x] Criar Data/palavras/animais-002.json com 25 respostas, 125 dicas e distribuição 10/10/5.
- [x] Revisar variedade, nomes alternativos, fatos e progressão; registrar fontes em Doc/Revisoes/animais-002.md.
- [x] Validar os seis lotes e conferir com o MongoDB sem gravar: 150 respostas/750 dicas, zero conflitos, 75 novos e 75 idênticos.
- [x] Conferir 50 animais distintos, 250 dicas e distribuição parcial 20/20/10.
- [x] Verificar 26 testes de conteúdo/validação e atualizar o controle e a lista de exclusão.
- [x] Reavaliar ritmo: dia 2 fechado, 30% da meta de conteúdo produzida; manter lotes intercalados e revisar os 75 registros pendentes antes de novas cargas. Os sete dias são referência, dentro da estimativa de até um mês.

Próximo ciclo: fase 15, com configuração Google e definições de publicação que exigem acesso do responsável. Nenhuma importação deste novo lote; os 75 registros de desenvolvimento existentes foram preservados. O roteiro permanece apenas local.


## 7. Dia 3 — autenticação e regras individuais

### Fase 15 — configurar Google e autenticação da aplicação

**Depende de:** ambiente, modelo de usuário e escolha inicial da topologia de publicação; acesso pessoal do responsável.

- Orientar a criação do projeto Google, tela de consentimento e cliente, distinguindo configurações de desenvolvimento e publicação.
- Definir endereços de retorno locais e o domínio pretendido, evitando refazer o fluxo somente no fim.
- Implementar início, retorno, validação e encerramento do login com Authlib, sem senha própria.
- Vincular a identidade estável Google à conta local e manter e-mail único, sem expor credenciais ao navegador.
- Implementar sessão da aplicação, cookies adequados e proteção das operações autenticadas; configurar origens permitidas de forma explícita.
- Tratar cancelamento do login, falha do provedor, sessão expirada e tentativa de acessar dados alheios.
- Verificar o que é necessário para que usuários além do desenvolvedor possam entrar na versão publicada; registrar pendências reais da configuração.

**Entrega:** login Google funcional localmente e configuração de publicação planejada.

**Concluída quando:** entrar, sair, retornar e negar acesso indevido funcionam sem segredos versionados.

**Concluída em 2026-10-28:** código implementado com testes antes da implementação e revisão SOLID; 38 testes novos de autenticação, 116 testes totais do backend aprovados nos dois bancos isolados, Ruff e formatação aprovados. Guia em `Doc/Autenticacao-google.md` registra falhas iniciais, correção de concorrência e limites. Credenciais Google locais salvas pelo responsável e carregadas sem exposição. Banco/usuário próprios criados no PostgreSQL local e migrações 0001/0002 aplicadas sem divergências. Responsável confirmou entrada real no Chrome e retorno à interface; conferência privada encontrou uma conta pendente e uma sessão válida. Saída, revogação e acesso indevido cobertos por testes; não foi feito logout manual da sessão pessoal. Escolha D18 aprovada: Vercel, Render, Neon e Atlas, com rewrite `/api`; verificação pública na fase 41. Roteiro e credenciais permanecem fora do Git.

### Fase 16 — conteúdo: filmes e séries, lote 002

**Depende de:** protocolo; exclusão do primeiro lote dessa temática.

- Produzir `filmes-e-series-002.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Variar os títulos, evitando versões alternativas da mesma resposta e pistas que dependam de tradução não aceita.
- Conferir grafia, fatos e expressões longas no formato aprovado.
- Revisar, validar e importar; meta parcial da temática: 50 respostas, distribuição 20/20/10.

**Entrega:** meta acumulada de **175 respostas e 875 dicas**.

**Concluída quando:** lote aprovado e lista de exclusão atualizada.

**Concluída em 2026-10-28:** 25 respostas inéditas e 125 dicas, distribuição 10/10/5, com 17 filmes e 8 séries. Revisão editorial por IA e fontes registradas em `Doc/Revisoes/filmes-e-series-002.md`. Validador aprovou os sete lotes; 26 testes existentes de conteúdo/validação aprovados. Lista de exclusão atualizada; temática com 50 respostas e 250 dicas, distribuição 20/20/10. Sem alteração de código executável nesta fase editorial. Responsável declarou ter revisado e aprovou expressamente a importação; carga do novo arquivo publicou 25 respostas sem sobrescrita e conferência posterior reconheceu 25 idênticas. Banco com 100 respostas, 500 dicas e 100 revisões; demais lotes pendentes preservados sem carga. Atlas permanece para publicação. Roteiro continua somente local.

### Fase 17 — primeiro acesso, perfil, avatares e preferências

**Depende de:** fase 15; decisões D06, D09 e D17.

- Exigir nome disponível e avatar antes de liberar a experiência completa de uma conta nova.
- Validar nomes no backend e na interface, ignorando maiúsculas na unicidade e aplicando os demais critérios aprovados.
- Carregar a coleção aprovada de avatares por identificadores estáveis; permitir troca de nome e avatar.
- Preservar e-mail e autenticação Google sem campos de alteração de senha ou e-mail próprios.
- Implementar exclusão da própria conta conforme D20: confirmação, cancelamento, processamento, falha e conclusão; autorizar a operação no servidor e aplicar os efeitos aprovados aos dados e acessos.
- Implementar leitura e gravação de tema, música, volumes e movimentos reduzidos na conta; visitante mantém preferências locais.
- Resolver a conciliação no login e testar retorno em outro navegador/dispositivo com a mesma conta.
- Apresentar estados de salvamento, erro, nome indisponível e falha de carregamento dos avatares.

**Entrega:** conta pronta para jogar e personalização persistente.

**Revisão visual em 2026-10-28:** 20 avatares ilustrados recriados com referência ao conceito aprovado, integrados como WebP no frontend sem mudar identificadores. Verificação focada: 7 testes backend, 27 unitários frontend e 27 fluxos de navegador aprovados.

**Conclusão em 2026-10-28:** implementado e verificado; relatório em [Perfil e preferências](Perfil-preferencias.md). Exclusão testada em contas e bancos descartáveis, sem apagar a conta pessoal. Controles de áudio persistidos; reprodução na fase 38. Navegação completa na fase 22. Roteiro mantido fora do Git.

**Concluída quando:** perfil e preferências são privados e persistem sem permitir alterações em outra conta.

### Fase 18 — conteúdo: marcas, lote 002

**Preparação em 2026-10-28:** 25 respostas/125 dicas (10/10/5) produzidas, revisadas com fontes e aprovadas na validação automática. Conferência dos oito lotes com MongoDB sem escrita: 100 novos, 100 idênticos e zero recuperáveis. 26 testes existentes aprovados. Após revisão e aprovação expressa do responsável, importadas 25 respostas sem sobrescrita. Conferência: zero novos e 25 idênticos. Banco com 125 respostas, 625 dicas e 125 revisões. Fase concluída.

**Depende de:** protocolo e exclusão do lote anterior.

- Produzir `marcas-002.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Ampliar segmentos e conferir que as pistas identificam a marca, sem depender de logotipos ou slogans copiados.
- Revisar particularidades de grafia e respostas com sinais conforme D08.
- Validar e importar; meta parcial: 50 marcas, distribuição 20/20/10.

**Entrega:** meta acumulada de **200 respostas e 1.000 dicas**.

**Concluída quando:** revisão e relatório não apontam conflitos com o catálogo.

### Fase 19 — visitante, demonstração única e vinculação

**Concluída em 2026-10-28:** D10 aprovada; identificação por cookie, reserva única, recuperação e vínculo integral implementados e verificados. 132 testes backend, 30 unitários frontend e 39 fluxos de navegador aprovados. Migração 0004 aplicada ao desenvolvimento; jogabilidade final na fase 26. Relatório em [Visitante e demonstração](Demonstracao-visitante.md).

**Depende de:** autenticação, catálogo e decisão D10.

- Criar identificação persistente por navegador e controle no servidor para uma única demonstração.
- Fixar três respostas fáceis de temáticas aleatórias, sem expor opções exclusivas da conta autenticada.
- Registrar a partida inteira, progresso e resultados, inclusive para permitir sua futura vinculação.
- Exibir convite ao Google e estado de demonstração já utilizada, sem bloquear o acesso ao login.
- Implementar transferência segura à conta segundo o prazo e os conflitos decididos, preservando pontos e histórico.
- Garantir que nova tentativa de vincular a mesma demonstração não duplique acertos, pontos ou partidas no ranking.
- Testar atualização durante a demonstração, login antes e depois do fim, conta existente e o limite por navegador. Não adicionar rastreamento rigoroso que o responsável dispensou.

**Entrega:** infraestrutura de visitante, bloqueio e vinculação. O fluxo jogável completo da demonstração será integrado na fase 26, após o motor individual da fase 20.

**Concluída quando:** os testes de vinculação com resultados controlados preservam o registro e contabilizam uma única vez. A demonstração jogável só será considerada completa após o teste real da fase 26.

### Fase 20 — motor e configuração do modo individual

**Concluída em 2026-10-28:** D11 aprovada e motor implementado na API. Configuração confirmável, seleção compartilhada de inéditas, dicas, acentos, pontuação, idempotência, desistência e abandono verificados. 156 testes backend aprovados; migração 0005 adiciona a vigésima tabela. Telas, demonstração jogável e pausa/retomada permanecem nas fases próprias. Relatório em [Motor individual](Motor-individual.md).

**Depende de:** catálogo, modelo de estados e decisões D11 e D12.

- Implementar partidas de 3, 5 ou 7 respostas, temática fixa ou aleatória e dificuldade única ou combinada.
- Validar quantidades por dificuldade, ordem manual, ordem crescente e distribuição aleatória segundo a regra aprovada.
- Selecionar respostas inéditas, depois repetir de partidas anteriores quando necessário, sem duplicar dentro da mesma partida.
- Avisar sobre falta de conteúdo e aguardar a escolha de outra temática, partida menor ou cancelamento; nunca alterar a configuração silenciosamente.
- Controlar cinco dicas, avanço manual e automático por erro, tentativas ilimitadas na quinta e pontos 100/80/60/40/20.
- Validar resposta completa em caixa alta com acentos exatos, C diferente de Ç e impedimento de palpite incompleto.
- Implementar acerto, desistência da palavra com zero e abandono definitivo sem desconto adicional.
- Registrar exposição quando a rodada é apresentada e testar ações repetidas, estado concluído e criação concorrente de duas partidas individuais.

**Entrega:** operações individuais testadas, ainda que a tela final não esteja integrada.

**Concluída quando:** a mesma sequência de ações produz resultado correto e consistente no servidor, sem depender da interface para conceder pontos.

### Fase 21 — conteúdo: países, lote 002

**Concluída em 2026-10-28:** lote revisado e aprovado expressamente pelo responsável; 25 respostas e 125 dicas importadas sem sobrescritas, conferência posterior com 25 idênticos. Nove lotes validados, 26 testes aprovados. Catálogo com 225 respostas produzidas; banco com 150 respostas, 750 dicas e 150 revisões. Países-001 continua pendente separadamente.

**Depende de:** protocolo e critérios adotados para países.

- Produzir `paises-002.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Excluir o lote anterior, conferir acentos e revisar localização e informações culturais.
- Evitar pistas fundamentadas somente em governos atuais, moedas alteradas ou fatos não verificados.
- Validar e importar; meta parcial: 50 países, distribuição 20/20/10.

**Entrega:** meta acumulada de **225 respostas e 1.125 dicas**.

**Concluída quando:** lote revisado e disponível para exercícios reais de acentuação e seleção.

## 8. Dia 4 — experiência individual completa

### Fase 22 — construir menu, temas e componentes comuns

**Concluída em 2026-10-28 (adiantada a pedido do responsável):** menu React responsivo, primeiro acesso protegido, rotas, preferências persistidas, resumo real de partida em aberto e componentes comuns. Páginas posteriores explicitamente em preparação. TDD com falha inicial do menu e regressão do atalho de tema; 30 testes unitários, 24 fluxos de menu e 39 de perfil/demonstração aprovados; build, tipos, formatação e revisão visual concluídos. Evidências em `Doc/Menu-navegacao.md`.

**Depende de:** protótipos, identidade e conta disponíveis.

- Implementar o menu misto de cartões e botões, distinguindo visitante, primeiro acesso e usuário autenticado.
- Mostrar jogo rápido somente ao visitante; após uso, informar o limite e oferecer login.
- Disponibilizar os dois modos, perfil, configurações, histórico e rankings nos acessos aprovados.
- Aplicar cores e fontes por variáveis compartilhadas, com tema claro padrão e alternância persistida.
- Criar botões, cartões, diálogos, avisos, estados de carregamento e páginas vazias com foco e teclado adequados.
- Integrar comunicação com a API e retorno de sessão expirada; manter rascunhos e dados confirmados separados.
- Preparar espaços para Aurélio e áudio, sem fazer o funcionamento depender dos recursos finais.

**Entrega:** navegação e identidade implementadas sobre componentes reutilizáveis.

**Concluída quando:** é possível entrar, escolher um caminho, voltar e acessar configurações em telas grandes e pequenas.

### Fase 23 — conteúdo: objetos, lote 002

**Lote concluído em 2026-10-29:** objetos-002 revisado e aprovado expressamente pelo responsável; 25 respostas e 125 dicas importadas sem sobrescritas (10/10/5), com conferência posterior dos 25 itens idênticos. Dez lotes validados e 26 testes aprovados. Arquivos com 250 respostas e 1.250 dicas; banco com 175 respostas, 875 dicas e 175 revisões. **Limite do fechamento:** a meta global de metade do catálogo aprovado ainda está pendente; países-001, objetos-001 e animais-002 continuam exigindo revisão própria. Esta marca registra a conclusão do novo lote, sem aprovar os anteriores.

**Depende de:** protocolo e exclusão do primeiro lote.

- Produzir `objetos-002.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Ampliar contextos de uso e revisar palavras com sinônimos comuns, evitando pistas ambíguas.
- Conferir que os objetos não são apenas marcas já cadastradas sob outro nome.
- Validar e importar; meta parcial: 50 objetos, distribuição 20/20/10.

**Entrega:** meta acumulada de **250 respostas e 1.250 dicas**.

**Concluída quando:** o catálogo atingiu metade da meta com revisão, não apenas com arquivos gerados.

### Fase 24 — construir teclado, quadradinhos e acentos

**Concluída em 2026-10-29:** editor controlado, operações puras e componentes reutilizáveis nos dois modos; números preenchíveis e sinais fixos (D08 aprovada pelo responsável), composição Unicode, remoção, navegação, limites de família e bloqueios compartilhados. TDD com 14 testes iniciais do modelo e cenários de navegador antes da interface; regressões de composição e texto excedente reproduzidas e corrigidas. 44 testes unitários e 41 cenários de entrada aprovados; quatro cenários inaplicáveis ao dispositivo pulados. Build, tipos, formatação e revisão visual nos temas claro/escuro concluídos. Prévia em `/provas/entrada.html`, sem partidas reais. Contratos, limites de integração e verificação em `Doc/Entrada-respostas.md`.

**Depende de:** componentes comuns e D08; regra de acentos já aprovada.

- Implementar clique/toque, arraste e digitação, com remoção, substituição e navegação entre posições.
- Converter para caixa alta preservando acentos e tratar composição do teclado físico sem enviar duas letras acidentalmente.
- Permitir aplicar e remover acento depois de colocar a vogal; manter C e Ç separados.
- Contar famílias de vogais no limite individual: MAÇÃ permite dois usos da base A; o acerto continua exigindo Ã.
- Bloquear letras presentes ao atingir sua quantidade, reabrir ao remover e manter disponíveis as ausentes conforme a regra do individual.
- Tratar espaços e separadores sem contar como posições vazias; impedir envio incompleto sem pontuar ou avançar dica.
- Testar palavras longas, expressões, acentos, repetição, foco, toque e arraste sem conflito com rolagem.

**Entrega:** entrada de resposta confiável e reutilizável pelos dois modos, com comportamento próprio por modo.

**Concluída quando:** as três formas de entrada produzem o mesmo rascunho e respeitam limites e acentos.

### Fase 25 — conteúdo: animais, lote 003

**Situação em 2026-10-29:** lote preparado e validado: 25 respostas, 125 dicas, distribuição 10/10/5. Catálogo produzido: 275 respostas e 1.375 dicas. 26 testes aprovados; conferência no MongoDB sem escrita e sem conflitos. Revisado e aprovado expressamente pelo responsável, importado sem sobrescritas. Conferência posterior: 25 idênticos, zero novos e zero recuperáveis. Banco com 200 respostas, 1.000 dicas e 200 versões; animais-002 não foi aprovado por esta fase.

**Depende de:** protocolo e lista consolidada.

- Produzir `animais-003.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Revisar diversidade de espécies e coerência da dificuldade em relação aos dois primeiros lotes.
- Substituir itens cuja última dica ainda permita várias respostas indistinguíveis.
- Validar e importar; meta parcial: 75 animais, distribuição 30/30/15.

**Entrega:** meta acumulada de **275 respostas e 1.375 dicas**.

**Concluída quando:** lote aprovado e as informações editoriais problemáticas foram corrigidas.

### Fase 26 — integrar partida individual e resultados

**Concluída em 2026-10-29:** Solo e demonstração com configuração, dicas, entrada real, reação, desistência, encerramento e resultado recuperável. 163 testes backend, 47 unitários frontend e 24 cenários novos de navegador aprovados; regressões de menu/perfil aprovadas. Prova React + HTTP + PostgreSQL descartável confirmou duas partidas de 300 pontos na tela, servidor e banco. Evidências em Partida-individual.md. Pausa/interrupções permanecem na fase 28.

**Depende de:** fases 20, 22 e 24.

- Integrar configuração, seleção e painel individual à API, mostrando progresso e pontos disponíveis.
- Revelar a primeira dica, permitir pedir outra e consultar anteriores sem recuperar pontuação maior.
- Ao errar, mostrar o retorno, limpar os quadradinhos e avançar a dica quando houver; na quinta, limpar e manter tentativas ilimitadas.
- Ao acertar, exibir os pontos confirmados e seguir para a próxima rodada sem duplicação por duplo clique.
- Integrar desistência de palavra, revelação da resposta e zero, com abandono definitivo em ação distinta.
- Construir resultado com total, acertos, dicas e respostas das palavras abandonadas.
- Percorrer a demonstração e uma partida autenticada completa com o mesmo motor, preservando as limitações de cada acesso.

**Entrega:** primeiro modo jogável de ponta a ponta.

**Concluída quando:** uma partida real termina com os mesmos pontos na tela, no servidor e no registro persistido.

### Fase 27 — conteúdo: filmes e séries, lote 003

**Situação em 2026-10-29:** lote preparado: 25 respostas e 125 dicas, distribuição 10/10/5. Catálogo com 300 respostas e 1.500 dicas validadas, sem conflitos no MongoDB (somente conferência). Correção com TDD para aceitar títulos somente numéricos, preservando recusa de sinais sem posições jogáveis. 42 testes de conteúdo/validação/MongoDB aprovados; 12 expressões reais verificadas em três tamanhos, 36 preenchimentos. Revisado e aprovado expressamente pelo responsável; importado sem sobrescritas. Conferência posterior: 25 idênticos, zero novos e zero recuperáveis. Banco com 225 respostas, 1.125 dicas e 225 versões.

**Depende de:** protocolo e lista de títulos existentes.

- Produzir `filmes-e-series-003.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Revisar títulos longos, acentos e diferenças entre obra, sequência e franquia.
- Testar exemplos extremos no teclado e no layout já implementados; registrar defeitos encontrados sem alterar o conteúdo para esconder limitações da tela.
- Validar e importar; meta parcial: 75 títulos, distribuição 30/30/15.

**Entrega:** meta acumulada de **300 respostas e 1.500 dicas**.

**Concluída quando:** lote aprovado e o catálogo já serve de teste real de expressões.

### Fase 28 — pausa individual, retomada e penalidades

**Concluída em 2026-10-29:** decisão D13 aprovada; montagem persistida com revisão, pausa de −100 confirmada, retomada e saídas sem duplicação. 178 testes backend e prova adicional React/HTTP/PostgreSQL aprovados; 51 unitários frontend e 105 cenários de navegador aprovados (42 individual, 24 menu, 39 perfil/demonstração). Prova completa: conta e demonstração com 200 pontos após uma pausa. Migração 0006 aplicada localmente. Documentação: Pausa-retomada-individual.md. Roteiro continua fora do Git.

**Depende de:** prova técnica da fase 13, decisão D13 e modo individual integrado.

- Salvar configuração, sequência, rodada atual, dica atual e pontuação, mais o rascunho se isso tiver sido aprovado.
- Implementar pausa voluntária com aviso e confirmação do desconto de 100 pontos.
- Retomar após interrupção com aviso informativo e um único desconto por interrupção efetiva; permitir saldo negativo.
- Garantir que recarregar o aviso não gere desconto novo e que atualizar a página não seja penalizado.
- Distinguir pausa de abandono definitivo: abandono preserva saldo, encerra e libera nova partida, sem desconto adicional.
- Mostrar a partida salva no menu e impedir segunda individual ativa, preservando a possibilidade de iniciar a galera.
- Testar navegador real, interrupções aceitas na fase 13, duas abas e cliques repetidos, com expectativa clara nos casos ambíguos.

**Entrega:** individual completo com persistência e tratamento de saída aceito.

**Concluída quando:** é possível retomar na mesma dica com saldo correto, sem duplicar penalidades ou perder progresso confirmado.

## 9. Dia 5 — galera, resultados e acompanhamento

### Fase 29 — configurar participantes e sessões da galera

**Concluída em 2026-10-30:** configuração de participantes/avatares, dificuldade e sessões, seleção sem repetição e ordem inicial persistida. Migração 0009 aplicada. 189 testes backend, 61 unitários frontend e 114 cenários de navegador aprovados. Prova React/HTTP/PostgreSQL criou e recuperou preparação real em banco de teste. Cronômetro por sessão e total aprovado; integração na fase 33. Detalhes em Configuracao-galera.md.

**Decisões aprovadas em 2026-10-30:** cronômetro por sessão e total, informativo, somente tempo ativo (integração na fase 33). Falta de conteúdo exige ajustar a configuração, sem redução ou troca automática.

**Depende de:** modelo da galera, conta, avatares e D09.

- Aceitar de um a três participantes no mesmo dispositivo, incluindo o usuário autenticado e convidados com nomes locais.
- Validar nomes distintos sem distinguir maiúsculas e permitir seleção de avatar para cada convidado.
- Configurar de uma a cinco sessões, com uma resposta por participante por sessão e uma única dificuldade na partida.
- Permitir definir temáticas e ordem antes de começar ou escolher o modo aleatório, com repetição de temática e sequência futura oculta.
- Selecionar respostas sem repetição na partida inteira, preservando o histórico da individual pausada.
- Sortear a ordem de todos no início de cada sessão e expor a ordem atual para a animação de sorteio.
- Tratar falta de conteúdo segundo decisão explícita e impedir iniciar uma configuração impossível.

**Entrega:** criação válida de uma partida com a galera.

**Concluída quando:** participantes, sessões e respostas ficam persistidos sem expor soluções futuras à interface.

### Fase 30 — conteúdo: marcas, lote 003

**Depende de:** protocolo e exclusão das 50 marcas anteriores.

- Produzir `marcas-003.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Revisar consistência da dificuldade e equilíbrio de segmentos.
- Conferir fatos e nomes sem transformar slogans ou preços em pistas frágeis.
- Validar e importar; meta parcial: 75 marcas, distribuição 30/30/15.

**Entrega:** meta acumulada de **325 respostas e 1.625 dicas**.

**Concluída quando:** lote aprovado e contagem de identificadores únicos confere.

### Fase 31 — motor da galera, turnos e desempate

**Depende de:** fase 29 e decisões D21 e D22.

- Escolher uma letra para revelar todas as ocorrências ocultas no painel, somando 100 por posição.
- Agrupar variantes de vogais na escolha isolada e preservar os acentos ao revelar; C e Ç permanecem separados.
- Manter a vez após acerto; letra inexistente vale zero, fica bloqueada e passa a vez.
- Em palpite completo, avaliar só a palavra selecionada: erro fixa apenas posições corretas novas, pontua essas posições e passa a vez.
- Acerto completo concede apenas o valor restante; posições previamente pontuadas não rendem de novo.
- Não consumir turno por letra bloqueada ou palpite incompleto. Validar ações fora da vez e repetidas no servidor.
- Concluir sessão ao revelar todas as respostas e sortear nova ordem na próxima, acumulando pontos.
- Concluir a partida pelo maior total; permitir empate ou uma única sessão extra só entre líderes com concordância de todos. Persistindo empate, encerrar empatado.

**Entrega:** motor da galera testável sem depender das animações.

**Concluída quando:** casos como CASA + MADEIRA, vogais acentuadas e palpite CAMA para CASA produzem pontos e turnos corretos.

### Fase 32 — conteúdo: países, lote 003

**Depende de:** protocolo e critérios dos lotes anteriores.

- Produzir `paises-003.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Garantir que o lote não apenas repete países com nomes oficiais mais longos ou abreviações.
- Revisar fatos e a distinção entre níveis antes de validar e importar.
- Conferir meta parcial de 75 países, distribuição 30/30/15.

**Entrega:** meta acumulada de **350 respostas e 1.750 dicas**.

**Concluída quando:** lote aprovado e lista dos países restantes está preparada para o fechamento da temática.

### Fase 33 — integrar painel da galera e encerramentos

**Depende de:** fases 24, 29 e 31, além da prova de interrupção.

- Mostrar participantes, avatares, pontos, vez destacada, temática e todas as respostas da sessão.
- Integrar escolha isolada de letra e seleção de palavra para palpite completo; manter posições fixas e teclado compartilhado.
- Animar o sorteio sem mudar a ordem confirmada pelo servidor ou permitir ações antes de liberar o turno.
- Exibir avanço de sessão, resultado final, opção de empate e proposta de sessão extra.
- Implementar desistência que encerra a partida, revela só pendências da sessão atual, mantém futuras ocultas e declara líder ou empate definitivo.
- Registrar palavras apresentadas e as não apresentadas; manter as não vistas elegíveis a seleção futura.
- Aplicar o método aceito para fechar a aba encerrar e atualizar recuperar sem penalidade. Tratar perda de conexão conforme a decisão registrada.
- Verificar que não existe botão de pausa com retomada futura e que nenhuma penalidade individual é aplicada nesse modo.

**Entrega:** segundo modo jogável de ponta a ponta.

**Concluída quando:** uma partida de três participantes percorre várias sessões e termina corretamente, inclusive por desistência.

### Fase 34 — histórico, estatísticas e rankings

**Depende de:** resultados persistidos dos dois modos e decisões D14 e D15.

- Construir histórico privado resumido, separando individual e galera; não criar consulta detalhada por rodada prevista para versão futura.
- Mostrar na galera nomes, pontos, vencedor/empate e motivo de encerramento, sem criar perfis permanentes para convidados.
- Calcular partidas concluídas/abandonadas, acertos, desistências de palavra, pontos, melhor resultado, média de dicas, erros e desempenho por temática/dificuldade.
- Implementar os três rankings gerais individuais: acertos, partidas concluídas e pontos; excluir galera.
- Contabilizar somente ao concluir ou abandonar definitivamente, incluindo demonstração vinculada e saldos negativos, sem dupla publicação.
- Compartilhar posições nos empates e limitar informações públicas ao que foi aprovado; e-mail e histórico permanecem privados.
- Integrar os efeitos aprovados da exclusão de conta ao histórico, às estatísticas e aos rankings, sem presumir retenção ou remoção de resultados antes de resolver D20.
- Testar casos sem partidas, apenas abandonos, saldo negativo, empate, mudança de nome e tentativa de consultar outra conta.

**Entrega:** acompanhamento coerente dos resultados e classificações públicas.

**Concluída quando:** os números da tela podem ser reconciliados com partidas de teste conhecidas e nenhuma partida ativa pontua no ranking.

### Fase 35 — conteúdo: objetos, lote 003

**Depende de:** protocolo e exclusão dos lotes anteriores.

- Produzir `objetos-003.json`: **10 fáceis, 10 médias e 5 difíceis**.
- Comparar pistas com as 50 respostas anteriores para evitar diferenças apenas cosméticas.
- Revisar nomes compostos, acentos e funções; validar e importar.
- Conferir meta parcial de 75 objetos, distribuição 30/30/15.

**Entrega:** meta acumulada de **375 respostas e 1.875 dicas**.

**Concluída quando:** lote aprovado e todos os modos já podem ser exercitados com variedade suficiente para testes de desenvolvimento.

## 10. Dia 6 — identidade em movimento e publicação de teste

### Fase 36 — produzir e integrar as animações do Aurélio

**Andamento em 2026-10-30:** concluída. Saudação aprovada primeiro; as oito atuações restantes da versão `8684d54` também receberam aprovação visual do responsável em `/laboratorio/aurelio`.

**Depende de:** desenho aprovado na 04 e eventos reais dos dois modos.

- Preparar o SVG final com partes e pontos de movimento coerentes, preservando o desenho aprovado.
- Produzir espera, saudação, pensamento/apresentação, erro, comemoração, mudança de turno, sorteio e resultado, com variações compatíveis com sua personalidade.
- Definir prioridade de reações para não sobrepor movimentos incompatíveis ao receber eventos rápidos.
- Integrar ao menu e às partidas sem esconder texto, quadradinhos ou controles em telas pequenas.
- Implementar a versão de movimentos reduzidos, mantendo informações e personalidade com menos deslocamento.
- Apresentar uma galeria de reações para revisão do responsável e ajustar expressões antes de dar a produção como finalizada.

**Entrega:** Aurélio animado e integrado, não somente um desenho de referência.

**Concluída quando:** as reações respondem a eventos reais, respeitam preferências e foram avaliadas visualmente pelo responsável.

### Fase 37 — conteúdo: animais, lote 004 e fechamento da temática

**Andamento em 2026-10-30:** concluída. Lotes 002/004 autorizados e importados; 16 novas revisões do lote 001 publicadas após aprovação, preservando a revisão 1. Auditoria real: 100 animais, 500 dicas, 40/35/25. Total local: 350 respostas, 1.750 dicas e 366 revisões. Arquivos: 400 respostas e 2.000 dicas. Cinquenta testes de conteúdo/validação/MongoDB e Ruff/formatação aprovados. Relatórios em Doc/Revisoes/animais-004.md e animais-auditoria.md.

**Depende de:** protocolo e relatórios dos três primeiros lotes.

- Produzir `animais-004.json`: **10 fáceis, 5 médias e 10 difíceis**.
- Conferir especialmente as pistas das respostas difíceis, sem usar obscuridade artificial ou fatos duvidosos.
- Validar e importar; auditar a temática inteira, corrigindo duplicatas ou itens reprovados antes de contabilizar.
- Confirmar **100 animais: 40 fáceis, 35 médios e 25 difíceis; 500 dicas**.

**Entrega:** primeira temática fechada; meta acumulada de **400 respostas e 2.000 dicas**.

**Concluída quando:** o relatório e a revisão editorial confirmam a distribuição final da temática.

### Fase 38 — finalizar músicas, efeitos e controles de áudio

**Depende de:** preferências persistidas e decisão D16.

- Selecionar e apresentar cinco faixas lo-fi/arcade com permissão de uso conhecida; registrar origem e atribuição quando necessária.
- Produzir ou selecionar sons de botões, teclado, acerto, erro, dica, mudança de turno, sorteio e resultado.
- Integrar o gerenciador Howler.js, volumes por categoria, silêncio geral e troca/desativação da música escolhida.
- Iniciar áudio após interação permitida pelo navegador, sem prometer reprodução automática ao abrir o site.
- Controlar carregamento, repetição, troca de faixa e sobreposição para evitar estalos, múltiplas músicas e excesso de sons ao digitar.
- Persistir escolhas e testar menu, partida, mudança de rota, retorno à página e falha no carregamento de um áudio.
- Confirmar que a experiência continua compreensível sem som e que não depende de uma música terminar para liberar uma ação.

**Entrega:** experiência sonora completa e configurável.

**Concluída quando:** o responsável consegue experimentar e escolher as faixas e cada categoria pode ser regulada e silenciada independentemente.

### Fase 39 — conteúdo: filmes e séries, lote 004 e fechamento

**Depende de:** protocolo e lista completa dos 75 títulos.

- Produzir `filmes-e-series-004.json`: **10 fáceis, 5 médias e 10 difíceis**.
- Revisar cuidadosamente grafias oficiais, títulos longos e pistas das obras difíceis.
- Validar, importar e auditar os quatro lotes, corrigindo colisões de título ou associação antes de fechar.
- Confirmar **100 títulos: 40 fáceis, 35 médios e 25 difíceis; 500 dicas**.

**Entrega:** segunda temática fechada; meta acumulada de **425 respostas e 2.125 dicas**.

**Concluída quando:** o relatório e a revisão confirmam os totais finais e o layout comporta as maiores respostas aprovadas.

### Fase 40 — acabamento de movimento e responsividade

**Depende de:** componentes, dois modos, Aurélio e infraestrutura sonora.

- Aplicar transições de tela, cartões, botões, letras, dicas, placares e resultados com linguagem consistente.
- Preservar foco, impedir clique duplicado e garantir que uma animação interrompida não trave o jogo.
- Refinar computador, celular e tablet com palavras longas e três participantes, sem cortar teclado ou exigir rolagem impossível.
- Verificar contraste e estados em ambos os temas, zoom, foco por teclado e controles com rótulos claros.
- Testar movimentos reduzidos e áudio desligado em todos os fluxos principais.
- Ajustar carregamento de fontes, ilustrações e áudio para que o menu apareça sem aguardar todos os recursos.
- Fazer uma revisão visual com o responsável sobre telas reais, registrando correções concretas para o ciclo final.

**Entrega:** interface consistente e utilizável nos três tipos de dispositivo.

**Concluída quando:** os fluxos não dependem de tamanho de tela, som ou movimento intenso para funcionar.

### Fase 41 — provisionar e publicar um ambiente de teste gratuito

**Concluída em 31/10/2026:** frontend em `https://decifra-inky.vercel.app`, API Render Free com proxy de mesma origem, Neon na revisão 0011 (23 tabelas) e Atlas com os quinze lotes aprovados (375 respostas/1.875 dicas, conferidos integralmente). Bancos públicos novos, ambiente local preservado; mesmo ambiente será promovido para entrega. Responsável confirmou login Google, individual, galera, celular, recuperação ao atualizar e retomada no roteiro de reinício/despertar. Verificação manual relatada; sem medição independente de suspensão nem inspeção automatizada do cookie da sessão final. Comando de preparo seguiu TDD; 17 testes, Ruff e build aprovados. Procedimento, limites gratuitos e preservação documentados em `Doc/Publicacao-ambiente.md`. Credenciais e este roteiro permanecem fora do Git.

**Depende de:** decisão D18 e aplicação integrada; os últimos lotes ainda podem estar em produção.

- Configurar Neon, Atlas e os serviços gratuitos de interface e API escolhidos, com acesso do responsável e sem contratar recursos pagos.
- Configurar conexões, migrações, origem permitida, HTTPS, cookies e retorno Google do endereço publicado.
- Publicar uma versão de teste e carregar somente lotes aprovados, sem confundir esse estado com catálogo final de 500.
- Separar dados de teste dos dados da entrega; definir se o mesmo ambiente será promovido ou se haverá destino separado, sem exigir um segundo serviço pago.
- Testar login real, reinício da API, conexões e retomada, especialmente se o plano suspende por inatividade.
- Preparar procedimento de atualização, preservação dos dados e retorno à última versão funcional, com credenciais fora do repositório.
- Registrar endereços, limites conhecidos e instruções para executar localmente caso seja necessário demonstrar sem rede.

**Entrega:** endereço de teste funcional e procedimento de publicação reproduzível.

**Concluída quando:** alguém fora da máquina do desenvolvedor consegue entrar e jogar os dois modos no ambiente publicado.

### Fase 42 — conteúdo: marcas, lote 004 e fechamento

**Concluída em 31/10/2026:** lote 004 e dez correções de dicas de oito marcas do lote 001 aprovados expressamente para MongoDB local e Atlas. Marcas fechado com 100 respostas/500 dicas, distribuição 40/35/25. Base original arquivada; oito revisões 2 publicadas em cada banco, com revisão 1 e referências das partidas preservadas. Conferência posterior: 100 idênticas/zero novas, correções sem pendências e auditoria integral de histórico/atuais aprovada nos dois ambientes. Bancos com 400 respostas/2.000 dicas: 427 revisões locais e 408 Atlas. Arquivos com 450 respostas/2.250 dicas; países-001 e objetos-001 continuam com revisão humana pendente e não foram importados. Validação global e 34 testes passaram após sincronização. Sem código novo, dependência ou alteração no PostgreSQL. Evidências em `Doc/Revisoes/marcas-004.md` e `Doc/Revisoes/marcas-auditoria.md`. Este roteiro e as credenciais permanecem fora do Git.

**Depende de:** protocolo e revisão dos três lotes anteriores.

- Produzir `marcas-004.json`: **10 fáceis, 5 médias e 10 difíceis**.
- Revisar nomes, segmentos e pistas sem depender de liderança de mercado ou outros fatos voláteis.
- Validar, importar e fechar **100 marcas: 40 fáceis, 35 médias e 25 difíceis; 500 dicas**.
- Conferir que os dados aprovados permanecem nos arquivos versionáveis, e não somente no banco local.

**Entrega:** terceira temática fechada; meta acumulada de **450 respostas e 2.250 dicas**.

**Concluída quando:** somente os lotes finais de países e objetos faltam para completar a meta.

## 11. Dia 7 — catálogo completo e entrega verificável

### Fase 43 — revisão de integridade, acesso e falhas

**Concluída em 04/11/2026:** corrigida proteção de cache nas subrotas da demonstração; 282 testes backend aprovados e prova integrada opcional executada separadamente com sucesso. 86 unitários frontend e nove cenários de navegador aprovados. Tentativas entre contas, adulteração de pontos, exclusão, sessão expirada, reenvios e rollback de banco verificados com dados isolados. Relatório em `Doc/Integridade-acesso-falhas.md`; limites documentados, sem nova dependência, migração ou regra de negócio.

**Depende de:** dois modos integrados e ambiente publicado; não exige as últimas 50 respostas.

- Revisar acesso privado a perfil, preferências e histórico, e a superfície pública dos rankings.
- Testar exclusão de conta em dados de teste: titular, tentativa por outra conta, cancelamento, repetição da solicitação, falha e consistência dos efeitos aprovados sobre dados e acessos.
- Tentar duplo envio, ação fora do turno, alteração de pontuação pelo navegador, consulta de partida alheia e publicação repetida de resultado.
- Conferir que soluções e dicas futuras não aparecem antes do permitido nas respostas da API; revisar a exposição necessária ao bloqueio das letras.
- Exercitar demonstração única, vinculação única, sessão Google expirada e dados do visitante sem identificação rigorosa adicional.
- Verificar logs e configuração por exposição de segredos e falhas internas; usar dados fictícios nos exemplos.
- Testar falha de MongoDB, PostgreSQL e recurso de áudio de forma controlada, sem apagar dados reais.
- Resolver defeitos bloqueantes e repetir somente as verificações afetadas pelas correções.

**Entrega:** relatório de problemas e correções de integridade.

**Concluída quando:** nenhuma falha conhecida permite conceder pontos indevidos, acessar dados privados ou corromper o progresso.

### Fase 44 — conteúdo: países, lote 004 e fechamento

**Estado em 04/11/2026: concluída.** Países-001/004 carregados no Atlas após liberação do IP atual; 100 países/500 dicas e quotas 40/35/25 conferidos. Carga global sem sobrescritas; catálogo remoto com 500 respostas idênticas aos arquivos e 508 revisões históricas. Evidências em `Doc/Revisoes/paises-004.md`.

**Depende de:** protocolo e lista dos países restantes.

- Produzir `paises-004.json`: **10 fáceis, 5 médias e 10 difíceis**.
- Conferir especialmente classificação, nomes em português e fatos das respostas difíceis; não preencher a quota com casos mal definidos.
- Validar e importar; auditar os quatro lotes para fechar **100 países: 40 fáceis, 35 médios e 25 difíceis; 500 dicas**.
- Corrigir qualquer item reprovado antes de declarar a temática concluída.

**Entrega:** quarta temática fechada; meta acumulada de **475 respostas e 2.375 dicas**.

**Concluída quando:** há 100 respostas distintas e revisadas nessa temática.

### Fase 45 — revisão de uso real, acessibilidade e desempenho

**Concluída em 04/11/2026:** responsável confirmou que os botões funcionam e pediu novos ícones, incorporados sem presumir aprovação estética posterior. Corrigidos contadores acessíveis e Tab circular em diálogos. Arte e fontes otimizadas sem perda de pixels ou de caracteres. 212 cenários de navegador distintos e 86 unitários aprovados; limites de emulação, zoom e desempenho registrados em `Doc/Uso-real-acessibilidade-desempenho.md`. Próxima fase: 47.

**Depende de:** acabamento e aplicação publicada; pode usar o catálogo parcial já revisado.

- Percorrer os dois modos com mouse, teclado e toque; verificar arraste e alternativa por clique.
- Conferir diálogo de acentos, foco, avisos de letra bloqueada, respostas incompletas e leitura de texto sem depender de cor.
- Testar telas pequenas, tablet, computador, zoom e expressões longas com painel cheio.
- Medir carregamento e observar travamentos de animação ou áudio; ajustar o que prejudicar a jogabilidade em aparelhos menos potentes.
- Verificar persistência de preferências e troca entre temas durante navegação, sem perder a partida ou ativar sons desabilitados.
- Jogar com o responsável para descobrir confusões de linguagem, ações escondidas e dificuldade de localizar controles.
- Registrar metas mensuráveis de desempenho adequadas ao ambiente observado, sem inventar garantia de usuários simultâneos que não foi testada.

**Entrega:** correções de uso e revisão visual final encaminhada.

**Concluída quando:** os fluxos essenciais funcionam nos dispositivos verificados e limitações concretas estão documentadas.

### Fase 46 — conteúdo: objetos, lote 004 e fechamento das 500 respostas

**Estado em 04/11/2026: concluída.** Objetos-001/004 carregados no Atlas; 100 objetos/500 dicas e quotas 40/35/25 conferidos. Catálogo remoto completo com 500 respostas/2.500 dicas e 508 revisões, 500 idênticos aos arquivos, zero novos e zero recuperáveis. Evidências em `Doc/Revisoes/objetos-004.md`. Auditoria final da fase 47 permanece separada.

**Depende de:** protocolo e revisão dos 75 objetos existentes.

- Produzir `objetos-004.json`: **10 fáceis, 5 médias e 10 difíceis**.
- Revisar sinônimos, funções, grafia e ambiguidade das pistas, especialmente nas respostas difíceis.
- Validar, importar e fechar **100 objetos: 40 fáceis, 35 médios e 25 difíceis; 500 dicas**.
- Conferir o total planejado dos vinte lotes e listar qualquer item ainda em revisão, sem contá-lo como aprovado.

**Entrega:** meta de **500 respostas únicas e 2.500 dicas**, distribuídas em 200 fáceis, 175 médias e 125 difíceis.

**Concluída quando:** todos os vinte lotes estão revisados e nenhuma temática depende de correção para atingir sua quota.

### Fase 47 — auditar e carregar o catálogo completo da entrega

**Concluída em 04/11/2026:** manifesto dos vinte lotes/500 IDs e relatório por ambiente em `Data/manifestos/` e `Doc/Revisoes/catalogo-final.md`. Arquivos, local e Atlas correspondem em 500 respostas/2.500 dicas; históricos e dez referências de rodada consultadas válidos. Sem escrita, recarga ou limpeza necessária. 36 testes backend, 88 unitários frontend e três cenários com 81 montagens de interface aprovados. Próxima fase: 48, aceitação final.

**Depende de:** vinte lotes aprovados; fase 46 obrigatoriamente concluída.

- Executar a validação global: 500 identificadores distintos, 500 respostas distintas, cinco dicas por resposta e quotas por temática/dificuldade.
- Conferir a temática principal usada na contagem; associações adicionais não podem inflar o total de respostas.
- Revisar a lista de respostas mais longas, acentuadas e com sinais especiais para verificar compatibilidade com a interface.
- Gerar um manifesto dos arquivos/identificadores aprovados e um relatório de importação que permita comparar os ambientes.
- Carregar o catálogo final no Atlas de destino, sem duplicar os registros de teste já existentes ou sobrescrever partidas salvas silenciosamente.
- Se os testes criaram dados de usuários e resultados, preparar a limpeza apenas dos dados de teste explicitamente identificados e autorizados; preservar dados reais.
- Confirmar as contagens no banco publicado e nos arquivos do repositório, não somente na máquina local.

**Entrega:** catálogo integral e conferido no ambiente da entrega.

**Concluída quando:** arquivos e banco publicado correspondem e os testes finais podem depender das 500 respostas reais.

### Fase 48 — executar aceitação final e corrigir regressões

**Concluída em 04/11/2026.** Relatório: [Aceitação final](Aceitacao-final.md). Blocos publicados aceitos; exclusão, anonimização e nova identidade sem partidas conferidas no Neon. Correção publicada em `35a1724`.

**Depende de:** catálogo integral, aplicação publicada e revisões anteriores.

- Executar a matriz de aceitação da seção 13 e os testes automatizados pertinentes.
- Repetir os dois modos no endereço publicado, com Google real, preferências salvas e dados de resultado conferidos.
- Validar RF-49 com conta de teste: confirmação e cancelamento, exclusão concluída, efeitos aprovados em histórico/ranking e comportamento de novo login.
- Testar falta de conteúdo e repetição usando bases/cenários controlados, sem precisar jogar manualmente todas as 500 respostas.
- Verificar individual com saldo negativo, retomada na mesma dica, abandono, demonstração vinculada e ranking sem dupla contagem.
- Verificar galera com um, dois e três participantes, cinco sessões, tema repetido, empate, sessão extra e desistência.
- Confirmar teclado com acentos, C/Ç, sons desligados, movimentos reduzidos e a experiência em celular/tablet.
- Corrigir defeitos, repetir a área afetada e registrar o que foi efetivamente verificado. Qualquer desvio de regra exige decisão, não ocultação no relatório.

**Entrega:** relatório de aceitação e versão candidata final.

**Concluída quando:** não há defeitos bloqueantes conhecidos e o responsável consegue aceitar a entrega pelas evidências apresentadas.

### Fase 49 — projetar e integrar indicadores de carregamento para ações e espera do servidor

**Depende de:** fases 26, 33, 40 e 48; especificação em [Carregamentos.md](Carregamentos.md).

- Substituir o indicador genérico de tela por composição temática do Decifra (peças animadas de palavra contextual, trilha rítmica e frases que evoluem conforme a duração da espera, incluindo aviso de despertar do servidor gratuito).
- Criar faixa de processamento flutuante sem deslocamento de layout (`CLS = 0`) para ações durante partidas no Solo, na Demonstração e na Galera (palpites, dicas, desistência, pausa, retomada, encerramento, início, desempate e sincronização inicial), além dos configuradores.
- Destacar a tecla escolhida na Galera durante o envio de letra e atualizar rótulos dos botões acionados com retorno imediato (`0 ms`), cobrindo também o preparo síncrono/assíncrono pré-jogada no Solo.
- Preservar foco, acessibilidade (`role="status"`), redução de movimentos (`prefers-reduced-motion` e `data-movimentos="reduzidos"`), oito combinações de tema/paleta e a compacidade sem rolagem das arenas no computador.
- Seguir TDD (testes unitários das mensagens/estágios e testes Playwright simulando servidor lento nos modos Solo e Galera) e SOLID, mantendo o pacote JavaScript inicial dentro do limite de 500 KiB.

**Entrega:** experiência completa e temática de carregamento para aberturas, rotas e jogadas sob latência do servidor.

**Concluída quando:** abertura, rotas, configuradores e ações de Solo/Demonstração/Galera exibem retorno visual claro e fiel ao jogo durante a espera, passam nos novos testes TDD e nas regressões existentes, com revisão visual das capturas e documentação sincronizada.

### Fase 50 — documentar, publicar a versão final e preparar a apresentação

**Depende de:** fases 48 e 49 e concordância com as decisões pendentes da entrega.

- Atualizar README com propósito, tecnologias, execução local, configuração de bancos e autenticação, importação e verificações disponíveis.
- Consolidar modelagem, contratos, decisões aprovadas, limites conhecidos e fontes dos recursos visuais/sonoros.
- Preparar exemplos de configuração sem credenciais e confirmar que o projeto pode ser instalado a partir do repositório.
- Preparar um roteiro de apresentação: demonstração, login, individual, pausa, galera, histórico, ranking e divisão real entre SQL e NoSQL.
- Promover ou publicar a versão final aprovada, conferir novamente domínio, login, catálogo e persistência depois da atualização.
- Registrar a versão entregue e criar commit/push ou outra publicação final com autorização no contexto.
- Entregar endereço do jogo, instruções de demonstração e relatório das verificações e limitações restantes.

**Entrega:** primeira versão completa do Decifra, reproduzível e demonstrável.

**Concluída quando:** os dois modos e os recursos aprovados estão disponíveis, o catálogo final foi conferido, os documentos correspondem à implementação e o responsável validou o resultado.

## 12. Pontos de revisão que não devem ser pulados

| Marco | Evidência necessária | Pode avançar sem isso? |
| --- | --- | --- |
| Antes de aprovar lotes com sinais especiais | Regra de D08 e exemplo preenchido | Produção de itens não afetados pode continuar |
| Antes das penalidades e encerramentos automáticos | Prova técnica da fase 13 e decisão sobre ambiguidades | Outras regras do jogo podem continuar |
| Antes de animar o mascote completo | Aparência de Aurélio aprovada | Backend e telas com recurso provisório identificado podem continuar |
| Antes da implementação final do ranking | Fórmulas e publicação reconciliadas com os resultados | Jogabilidade pode continuar |
| Antes da aceitação final | 500 respostas e 2.500 dicas revisadas, fase 47 concluída | Testes parciais podem continuar; entrega completa não |
| Antes de declarar entrega concluída | Dois modos publicados, aceitação e documentação | Não declarar funcionalidades incompletas como entregues |

Se um lote ficar atrasado, continuar a tarefa técnica independente e manter a pendência visível. Atraso de conteúdo não autoriza inventar palavras, reduzir a meta ou misturar registros sem revisão para completar a contagem.

## 13. Matriz de cobertura da primeira entrega

| Área e requisitos em Detalhes.md | Fases principais | Evidência de aceitação |
| --- | --- | --- |
| Demonstração, Google e vínculo: RF-01 a RF-04, RF-35 e RF-40 | 15, 17, 19, 48 | Uma demonstração por navegador; login; registro e pontos vinculados uma vez |
| Perfil, nome e avatar: RF-04 e RF-05 | 04, 17, 29 | Nome único sem distinguir maiúsculas; avatar alterável; e-mail preservado |
| Configuração e seleção individual: RF-06 a RF-10 | 10, 12, 20, 26 | 3/5/7, combinações, ordem, aleatório, inéditas e falta de conteúdo |
| Letras, dicas e pontuação: RF-11 a RF-19, RF-39, RF-42, RF-44, RF-45 e RF-48 | 20, 24, 26 | Três formas de entrada, acentos corretos, cinco dicas, limpeza após erro e pontos exatos |
| Progresso, pausas e abandono individual: RF-20, RF-21, RF-25 e RF-37 | 13, 28, 48 | Uma individual salva, desconto de 100 sem duplicação, negativo e independência da galera |
| Histórico, estatísticas e ranking: RF-22, RF-23, RF-33 e RF-36 | 17, 34, 48 | Dados privados, três rankings individuais, empate e publicação só ao encerrar |
| Galera e participantes: RF-24 e RF-26 a RF-32, RF-38, RF-41 e RF-43 | 29, 31, 33, 48 | Painel compartilhado, ordem por sessão, turnos, bloqueios, desistência e um desempate opcional |
| Catálogo e repetição: RF-09, RF-34 e RF-46 | 03–46 nas fases de conteúdo, 12, 20, 29 e 47 | 20 lotes, 500 respostas distintas, 2.500 dicas, quotas e nenhuma repetição na mesma partida |
| Preferências: RF-47 | 17, 22, 38, 40 e 45 | Tema, volumes, música e movimento persistidos na conta ou navegador |
| Identidade, Aurélio e áudio: seção 23 | 02, 04, 06, 22, 36, 38, 40 e 49 | Visual aprovado, mascote reagindo, cinco músicas selecionáveis e carregamentos temáticos |
| Responsividade, acesso e qualidade | 08, 13, 40, 43, 45, 48 e 49 | Computador, celular e tablet; teclado/toque; acesso privado, esperas em servidor lento e falhas verificadas |
| Publicação e documentação | 08, 15, 41, 47 e 50 | URL funcional, Google configurado, Neon/Atlas em uso e execução local documentada |

Esta matriz acompanha os requisitos atuais. Se uma decisão aprovada acrescentar comportamento, atualizar o roteiro e os critérios afetados antes de considerá-lo coberto.


## Complemento solicitado após a fase 28 — cronômetro

- [x] Conferir documentação e registrar decisões aprovadas: informativo, somente tempo de jogo e formato da galera a decidir antes de prepará-la.
- [x] Especificar ciclo por palavra, pausas/ausências, resultado, visual, persistência, dados antigos e testes em Cronometro.md.
- [x] Apresentar a especificação e confirmar com o responsável o início da implementação, conforme pedido de avançar uma etapa de cada vez.
- [x] Implementar com TDD e revisar o mostrador por IA: 182 testes backend incluindo prova integrada, 53 unitários frontend e 108 cenários de navegador aprovados. Migração 0007 aplicada localmente. Avaliação estética do responsável ainda não presumida.

Não renumera fases anteriores. A segunda alteração mencionada pelo responsável ainda não foi descrita.


## Complemento após a fase 28 — paletas

- [x] Aprovar Original, Azul, Roxa e Grafite; todas com verde-lima e versões clara/escura.
- [x] Documentar paleta nas configurações e alternância de tema exclusivamente pelo botão lua/sol.
- [x] Implementar persistência, migração 0008, compatibilidade e seletor com prévia seguindo TDD.
- [x] Verificações de perfil/menu e das 24 combinações aprovadas, revisão visual por IA concluída; migração 0008 aplicada localmente. Publicação acompanha o commit deste complemento.

Não altera a numeração das fases e mantém este roteiro apenas local.

### Registro de conclusão — fase 31

Motor puro da galera entregue com letras, palpites completos, pontos por posições novas, turnos, ordem por sessão, bloqueios e desempate único. Decisões D21/D22 aprovadas pelo responsável; conteúdo da extra mantém dificuldade, não repete respostas e admite outra temática ou empate quando insuficiente. Contratos e testes em Doc/Motor-galera.md. Integração transacional, painel, cronômetro e encerramentos seguem na fase 33.

### Registro de conclusão — fase 33

Painel jogável com motor persistido, teclado compartilhado, sorteio oficial, turnos, pontos, consenso da extra, resultado, tempo por sessão/total e encerramento. Migração local 0010 aplicada. Verificações: 237 backend incluindo React/HTTP/PostgreSQL reais, 65 unitários frontend e 164 cenários de navegador aprovados; quatro condições de mouse/toque ignoradas no editor. Ruff, Prettier, tipos, build e alembic check aprovados. Evidências, limites e próximos passos em Doc/Painel-galera.md.

### Registro de conclusão — fase 35

Adiantada por decisão do responsável, mantendo a fase 34 pendente. Objetos-003 aprovado expressamente e importado sozinho: 25 respostas e 125 dicas, distribuição 10/10/5; conferência posterior com 25 idênticos e zero novos/recuperáveis. Catálogo local com 300 respostas, 1.500 dicas e 300 revisões. Validação global dos quinze lotes: 375 respostas e 1.875 dicas. Quarenta e três testes aprovados; detalhes em Doc/Revisoes/objetos-003.md.


### Registro de conclusão — fase 34, 2026-10-30

D14/D15 confirmadas pelo responsável. Histórico privado dos dois modos, estatísticas do Solo encerrado com progresso separado e três rankings públicos implementados; sem migração. Contas excluídas permanecem anônimas, negativos e empates preservados, galera fora dos totais individuais. Documentação em Doc/Historico-estatisticas-rankings.md. TDD: 404 inicial no histórico, ausência do cliente/tela no frontend e teste de regressão do título da aba antes da correção. Verificações finais: 244 testes Python aprovados, incluindo a prova React/HTTP/PostgreSQL; 67 testes Vitest; 15 fluxos novos, 24 de menu e 42 de perfil/demonstração no navegador (81 no total), em computador/tablet/celular; quatro paletas claras/escuras. Ruff, formatação, tipos, build e revisão visual aprovados. Avisos existentes: depreciação Authlib e pacote Vite acima de 500 kB; avaliação em aparelhos físicos continua na revisão final. API local reiniciada com novas rotas. A fase 35 já foi concluída antecipadamente; próxima fase pendente: 36.


### Registro de implementação — fase 36, aguardando revisão visual

SVG autoral em partes, nove reações, Motion 14.9.0, prioridades e deduplicação, preferência salva/aparelho, suspensão fora da área visível/aba oculta e galeria de revisão. Integrado a menu, Solo, demonstração, galera, sorteio e resultados. Imagens aprovadas preservadas. Testes primeiro da política; regressões reproduziram preferência dinâmica, mascote oculto no celular e erro antigo reapresentado na recarga antes das correções. Verificações: 71 testes Vitest; 48 fluxos individuais, 12 da galera, 24 do menu e 12 do mascote, total 96 em três tamanhos; tipos, build e formatação. Revisão visual das capturas e página local disponível. Sem alterações de backend/banco. Crescimento do pacote Vite registrado para fase 40/45. Não marcar a fase concluída até a avaliação visual prevista no próprio critério; documentação em Doc/Aurelio-animado.md.


### Fase 36 — revisão 02 solicitada pelo responsável, 2026-10-30

A primeira interpretação e as nove atuações foram reprovadas por aparência diferente, movimentos rígidos e repetitivos. Escopo solicitado: primeiro a aparência fiel ao PNG e uma saudação trabalhada, antes de refazer o repertório. Novo rig com recortes do PNG aprovado, capa auxiliar gerada pelo imagegen integrado, olhos/pupilas, sobrancelhas, boca, gravata e membros separados; aceno coordenado de 5,4 segundos, com antecipação, articulações e acomodação. Nova galeria compara original e montagem e permite examinar poses e recortes. Outras atuações retornam à pose aprovada e permanecem pendentes. Documentação em Doc/Aurelio-animado.md e Doc/Identidade-visual/Aurelio-saudacao-02.md; manter checkbox da fase aberto até avaliação visual. Testes unitários e de navegador foram atualizados ao novo escopo; fidelidade visual tem tolerância explícita para antialiasing, sem afirmar igualdade pixel a pixel.

Verificações finais da revisão 02: 73 testes Vitest; 9 fluxos do ensaio, 24 de menu, 48 do individual/demonstração e 12 da galera (93 no navegador). Tipos, build, formatação e diff aprovados. Comparação da montagem parada com referência no mesmo espaço físico, tolerando suavização de borda de um pixel. Inspeção visual de referência, aceno e encaixes. Arte auxiliar via imagegen integrado, prompt documentado. Aguardando avaliação do responsável; fase 36 não concluída.

### Fase 36 — correção de recortes após os prints

Preservados os contornos das luvas, tornozelos e sapatos com recortes ampliados e exclusão da capa; corrigidos pivô e encaixe do punho. Contornos originais dos olhos limitam fundo creme e pupilas. PNGs preservados. Regressão visual primeiro reproduziu 45 pixels ausentes no tornozelo esquerdo, depois passou em sete poses. Verificações: 73 testes Vitest, 12 cenários de navegador em computador/tablet/celular, tipos, build, Prettier e diff. Inspeção visual do aceno concluída pela IA; aprovação final do responsável continua pendente, fase 36 permanece aberta. Aviso preexistente do tamanho do pacote Vite permanece.


### Fase 36 — primeira saudação aprovada, 2026-10-30

O responsável aprovou expressamente a primeira saudação após as correções do commit defa315 e a considerou concluída. Demais atuações adiadas a seu pedido; manter o checkbox geral da fase aberto. Guia de continuidade registrado em Doc/Aurelio-animado.md: fidelidade ao PNG, hierarquia e pivôs, sobreposição dos recortes, contornos reais dos olhos, atuação coordenada, tempos de referência, revisão e aprovação por atuação. Atualizados detalhes, planejamento e registro da arte. Alteração somente documental; sem novos testes executáveis necessários.


### Fase 36 — repertório restante implementado para revisão, 2026-10-30

Após aprovar a primeira saudação, o responsável autorizou produzir todas as próximas animações. Entregues espera, pensamento, apresentação, erro, comemoração, turno, sorteio e resultado sobre o rig aprovado, com linha de tempo própria, expressões, efeitos SVG e galeria selecionável. Saudação mantém suas poses; PNGs e dependências preservados. Relógio compartilhado substitui o exclusivo da saudação, com repetição apenas da espera no jogo. Máscara remove resíduos dos olhos abertos e bordas das expressões. TDD: módulo de poses ausente e seletor ausente reproduzidos antes da implementação; nova regressão mostrou resíduos na piscada antes da limpeza. Verificações: 77 testes Vitest, 45 cenários do mascote, 48 do individual/demonstração, 12 da galera e 24 do menu (129 no navegador), três tamanhos, mais reconferência da galeria após ajuste de CSS. Tipos, build, Prettier e diff aprovados; capturas inspecionadas. Aviso Vite acima de 500 kB permanece. Sem backend/migração ou nova prova real de bancos. Relatórios locais em Frontend/test-results. Não marcar a fase 36 completa antes da avaliação visual do responsável sobre as oito atuações novas.


### Fase 36 — aprovação final do responsável, 2026-10-30

O responsável avaliou o repertório da versão 8684d54 e aprovou as oito atuações restantes com a mensagem “ficou ótimo”. Saudação já aprovada anteriormente. Fase 36 marcada como concluída; documentação sincronizada, sem alteração de código ou novos testes executáveis. As verificações da implementação permanecem registradas: 77 testes unitários e 129 cenários de navegador. Próxima fase pendente: 37.

### Fase 37 — preparação editorial para revisão, 2026-10-30

Criado animais-004 com 25 respostas e 125 dicas (10/5/10). Catálogo de arquivos: 400 respostas e 2.000 dicas; animais: 100 e 500, distribuição 40/35/25. Animais-002 permanece sem aprovação. Auditoria dos quatro lotes preparou proposta separada para 25 dicas de 16 animais do lote 001; arquivo original e MongoDB intactos. Importador inicial não sobrescreve conteúdo, portanto correções publicadas exigirão nova revisão e histórico preservado. Validação global, proposta isolada e conferência sem escrita aprovadas; 33 testes de conteúdo/validação passaram. Banco confirmado em 300 respostas, 1.500 dicas e 300 revisões; somente 50 animais carregados. Aprovações editoriais pendentes antes das cargas. Manter fase aberta; países-001/objetos-001 sem carga e Atlas não acessado.

### Fase 37 — conclusão, 2026-10-30

Responsável aprovou animais-004 e correções do 001, depois corrigiu a resposta sobre animais-002; revisão existente do 002 mantida e carga autorizada no contexto. Importados somente 002/004: 50 novos e conferência posterior com 50 idênticos. Publicadas 16 revisões 2 do 001, preservando e auditando as 25 revisões 1. Fonte original arquivada fora da pasta de produção; arquivo atual sincronizado. Auditoria real: 100 animais únicos e 500 dicas, distribuição 40/35/25. Banco com 350 respostas, 1.750 dicas e 366 revisões; arquivos com 400 respostas e 2.000 dicas. Comando de revisão com TDD, validação completa, somente dicas, base esperada, reserva imutável, comparação integral na publicação, recuperação e idempotência; 50 testes passaram incluindo MongoDB isolado e adaptador do jogo. Ruff e formatação aprovados. Sem frontend, migração, dependência nova ou alteração de partidas/PostgreSQL. Países-001/objetos-001 e Atlas seguem pendentes. Fase 37 marcada como concluída; próxima: 38, áudio.


### Fase 38 — implementação entregue para escuta (2026-10-30)

Decisão do responsável: cinco músicas apenas nas partidas e prévias nas configurações; menu principal com sexta música própria e botão independente junto ao tema. Preferência persistida `musica_menu_ativa` (migração 0011, padrão verdadeiro). Howler 2.2.4, carregamento sob demanda após gesto, três grupos, silêncio, controle de sobreposição, pausa ao ocultar, falhas recuperáveis. Seis faixas CC0 com créditos e manifesto; 13 efeitos sintetizados reproduzíveis. Detalhes e validações em Doc/Audio/README.md. Checklist permanece aberto: falta ouvir e aprovar a seleção artística (D16). Roteiro continua fora do Git.


### Aprovação da fase 38 e início da 39 — 30/10/2026

Responsável aprovou o resultado sonoro e autorizou a próxima fase. Fase 38 marcada concluída, D16 resolvida. Fase 39: lote filmes-e-series-004 produzido (10/5/10), validação global de 425 respostas e 2.125 dicas; quatro lotes da temática somam 100 títulos e 500 dicas. Três correções de dicas do 001 propostas separadamente; importação/publicação dependem da revisão do responsável. Não marcar a fase 39 concluída antes disso.


### Fase 39 concluída — 30/10/2026

Responsável aprovou lote 004 e três correções do 001. Publicados 25 novos e três revisões 2; 25 revisões 1 auditadas e preservadas. Quatro lotes conferidos: 100 idênticos. Filmes/séries: 100 títulos/500 dicas (40/35/25). Banco: 375 respostas/1.875 dicas/394 revisões. Arquivos: 425 respostas/2.125 dicas. Testes: 34 backend, três provas de navegador com 63 montagens/envios, tipos e formatação aprovados. Sem código novo do jogo ou novo ciclo TDD; somente conteúdo, documentação e ampliação de exemplos de teste. Próxima fase: 40, acabamento de movimento e responsividade. Roteiro permanece ignorado pelo Git.


### Fase 40 — implementação para revisão visual, 31/10/2026

Acabamento de tela, cartões, letras, placares, diálogos e resultados; foco após consultas e módulos, falha recuperável de carregamento, oito combinações de temas/paletas, fontes bloqueadas, silêncio, movimento reduzido, ampliação de texto e três participantes/expressões extensas. Código de partidas, perfil, acompanhamento e laboratório carregado por rota. JavaScript inicial total caiu de 637,34 para 446,62 kB; CSS inicial 34,48 kB. Sem dependências ou alterações de banco/regras. Evidências em Doc/Acabamento-interface.md. Manter checkbox aberto até a revisão das telas reais pelo responsável.


Verificação final da implementação da fase 40: 86 unitários e 171 cenários de navegador aprovados (15 acabamento, 24 menu, 42 perfil/demonstração, 51 individual, 15 galera, 15 acompanhamento, 9 áudio). Tipos, Prettier, build e prévia da compilação aprovados. Novos testes foram adicionados à integração contínua. Avaliação das telas reais pelo responsável continua pendente; não iniciar a fase 41 automaticamente.


### Fase 40 concluída — 31/10/2026

Responsável experimentou e aprovou expressamente o acabamento, sem solicitar ajustes. Revisão visual conjunta concluída; checkbox marcado. Permanecem as verificações da implementação: 86 unitários, 171 cenários de navegador, tipos, Prettier, build e prévia da compilação aprovados. Nenhum código executável alterado neste fechamento documental. Próxima fase: 41, ambiente de teste gratuito; não iniciada neste registro. Roteiro preservado somente local.

## Retomada combinada — quarta-feira, 04/11/2026

Por solicitação expressa do responsável em 02/11/2026, adiar o diagnóstico e as cargas no Atlas até quarta-feira. Antes de começar as demais fases: resolver o acesso administrativo ao Atlas; conferir os lotes pendentes de países/objetos; importar somente conteúdo aprovado; conferir os totais remotos. A fase 44 já tem criação, aprovação e importação local concluídas (100 países, 500 dicas); carga Atlas ainda pendente. A fase 46 também tem criação, aprovação e importação local concluídas (100 objetos, 500 dicas), fechando 500 respostas/2.500 dicas locais. Não houve nova tentativa no Atlas; países-001/004 e objetos-001/004 aguardam carga remota já aprovada. Não marcar as fases como integralmente concluídas antes de resolver suas pendências.

### Retomada concluída — 04/11/2026

IP atual autorizado pelo responsável; acesso ao Atlas restabelecido. Quatro lotes de países/objetos importados: 100 novos sem sobrescritas. Catálogo remoto com 500 respostas, 2.500 dicas e 508 revisões; conferência integral com 500 idênticos e quotas corretas por temática. Pendências das fases 44 e 46 resolvidas antes das outras atividades. Não iniciar automaticamente outras fases nem marcar a auditoria 47 como concluída.

### Fase 49 concluída — 16/11/2026

Implementados os indicadores de carregamento e processamento em jogo para reduzir a percepção de espera no servidor gratuito, seguindo [Carregamentos.md](Carregamentos.md), TDD e SOLID: peças temáticas de palavra por contexto (`Carregando` e `CarregandoInline`), trilha rítmica, estágios progressivos com aviso transparente ao despertar (`>= 11 s`), faixa flutuante sem salto de layout (`IndicadorProcessamento`, `CLS = 0`) nos modos Solo, Demonstração, Galera e configuradores, destaque imediato da letra escolhida na Galera (`data-processando`), rótulos imediatos em botões/diálogos e feedback antecipado desde o preparo de cronômetro e rascunho no Solo. Respeita movimento reduzido, as oito combinações de tema/paleta e a compacidade sem rolagem das arenas.

Verificações após a implementação final: `npm run formatar`, `npm run tipos` (`tsc --noEmit`), `npm test` (23 arquivos, 133 testes aprovados), `npm run build` (JS inicial total medido no `uso-real` em `478.440 bytes`, dentro de `500 KiB`), `npm run testar-carregamento` (12/12 aprovados em computador, tablet e celular, incluído no CI), inspeção visual das capturas em `Frontend/test-results/carregamento/`, e aprovação integral em `testar-uso-real` (6), `testar-individual` (58), `testar-galera` (19), `testar-menu` (152), `testar-entrada` (44), `testar-acabamento` (15), `testar-mascote` (69), `testar-audio` (12), `testar-perfil` (45) e `testar-interrupcoes` (32). Na suíte `testar-acompanhamento`, 12 passaram e 3 falharam exclusivamente em uma asserção pré-existente de título de aba (`"Cada descoberta conta — Decifra"` vs `"Decifra"` alterado no commit `f80b672`), sem relação com a fase 49 e mantida visível para revisão na fase 50. Nenhum código backend ou regra do jogo foi alterado. Próxima fase: **fase 50 — documentar, publicar a versão final e preparar a apresentação** (não iniciada).
