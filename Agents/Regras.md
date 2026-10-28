# Regras de desenvolvimento para IAs — Decifra

## 1. Leitura e fonte das decisões

- Antes de implementar, leia este arquivo, `Doc/Detalhes.md` e `Doc/Planejamento-tecnico.md`. Releia os trechos afetados quando esses documentos forem alterados.
- As instruções explícitas do usuário prevalecem sobre convenções locais. Os detalhes do produto vêm de `Doc/Detalhes.md`; as escolhas técnicas aprovadas vêm de `Doc/Planejamento-tecnico.md`.
- Não transforme uma pendência em regra definitiva por conta própria. Progrida nas partes independentes e apresente a dúvida quando ela afetar comportamento, dados ou escopo.
- Resolva escolhas rotineiras de implementação com bom senso, sem solicitar aprovação para cada função, arquivo ou ajuste reversível.
- Não declare concluída ou testada uma funcionalidade que ainda não foi implementada ou verificada.

## 2. Português obrigatório

Todo código de autoria do projeto deve ser escrito em português do Brasil, do banco de dados à interface. Isso inclui:

- Variáveis, funções, métodos, classes, tipos, componentes, propriedades e constantes próprios.
- Arquivos, pastas e módulos de código próprios.
- Tabelas, colunas, coleções, campos de documentos, índices e restrições nomeados pelo projeto.
- Caminhos e campos próprios da API, mensagens de erro e eventos do domínio.
- Testes, comentários, documentação e mensagens de commit.

Use identificadores sem acentos, cedilhas ou espaços: `pontuacao`, `sessao`, `configuracoes`. Textos exibidos, comentários e documentação devem manter a ortografia e acentuação corretas.

### Convenções de nomes

| Elemento | Convenção | Exemplo |
| --- | --- | --- |
| Funções e variáveis Python | `snake_case` | `calcular_pontuacao` |
| Funções e variáveis TypeScript | `camelCase` | `calcularPontuacao` |
| Classes, tipos e componentes | `PascalCase` | `PartidaIndividual`, `PainelDeDicas` |
| Constantes | `UPPER_SNAKE_CASE` | `PONTOS_POR_LETRA` |
| Tabelas e coleções | `snake_case`, substantivos no plural | `partidas`, `respostas` |
| Campos persistidos e campos JSON da API | `snake_case` | `dica_atual`, `nome_usuario` |
| Arquivos de componentes | Nome do componente | `PainelDeDicas.tsx` |
| Arquivos Python | `snake_case` | `servico_de_pontuacao.py` |
| Demais módulos TypeScript | `kebab-case` | `cliente-da-api.ts` |
| Rotas próprias | Português sem acentos; hífen entre palavras | `/api/partidas`, `/api/rankings/palavras-acertadas` |

Mapeie os campos da API para os tipos internos da interface de forma explícita quando necessário. Não espalhe conversões de nomes por componentes.

### Exceções necessárias de compatibilidade

Não traduza palavras reservadas, APIs de bibliotecas, nomes de pacotes, comandos e protocolos. Por exemplo: `import`, `class`, `useState`, `useQuery`, `onClick`, `className`, `children`, métodos HTTP e parâmetros oficiais do Google permanecem como definidos pelas ferramentas.

Preserve arquivos e campos obrigatórios do ecossistema, como `package.json`, `tsconfig.json`, `pyproject.toml`, configurações oficiais e `_id` do MongoDB. Nomes de campos externos devem ser mapeados na integração quando houver um correspondente interno em português.

Não altere a sintaxe de ferramentas nem crie wrappers de tradução sem utilidade apenas para eliminar palavras em inglês. A regra se aplica aos nomes que o projeto controla. Os diretórios estruturais `Frontend/`, `Backend/` e `src/`, já usados no planejamento, podem ser mantidos; os módulos próprios dentro deles devem seguir o português.

## 3. Arquitetura e padrões de projeto

- Use a arquitetura modular aprovada e separe interface, regras de negócio e persistência.
- As rotas validam a entrada e encaminham a operação; os serviços aplicam regras; o acesso aos bancos fica em módulos próprios. Não concentre toda a implementação em um arquivo principal.
- Organize funções e componentes por responsabilidade. Evite funções extensas que misturem consulta, pontuação, renderização e efeitos.
- Prefira composição, nomes claros e fluxo explícito. A partir da fase 15, aplique SOLID obrigatoriamente ao criar ou alterar código, conforme as responsabilidades e os contratos envolvidos. Use padrões de projeto para necessidades concretas; não crie hierarquias, fábricas ou camadas vazias apenas para cumprir um padrão.
- Evite duplicar regras e também evite abstrações prematuras. Extraia comportamento compartilhado quando houver uma equivalência real.
- Mantenha diferenças entre individual e galera explícitas. Não reutilize uma regra de um modo no outro apenas porque os dois usam palavras.
- Use os termos de domínio definidos no documento: partida, rodada, sessão, turno, dica, palpite e resposta.

### Aplicação de SOLID nas próximas fases

- **S — responsabilidade única:** separe motivos de mudança. Rotas, regras, persistência, apresentação e efeitos devem ter responsabilidades claras.
- **O — aberto para extensão, fechado para modificação:** permita variar comportamentos pelos pontos de extensão necessários, preservando os contratos existentes. Não antecipe variações hipotéticas nem proíba mudanças legítimas de requisitos.
- **L — substituição de Liskov:** implementações do mesmo contrato devem preservar suas garantias, inclusive erros e efeitos. Substituições usadas nos testes não podem esconder diferenças relevantes da integração real.
- **I — segregação de interfaces:** defina contratos pequenos, voltados às operações de cada consumidor; não obrigue módulos a depender de métodos que não utilizam.
- **D — inversão de dependência:** regras de negócio devem depender de contratos definidos por suas necessidades, recebendo dependências explicitamente. Isole detalhes de banco, Google, rede e áudio nos adaptadores apropriados. Use funções, composição ou protocolos quando suficientes, sem exigir uma classe para cada operação.

Na revisão de cada fase, verifique esses princípios nas partes alteradas e registre decisões arquiteturais relevantes. A regra não declara conformidade retroativa das fases 01 a 14 nem exige reescrever código fora do escopo; ao alterar código existente, aplique-a à mudança e preserve os comportamentos anteriores com testes.

## 4. Contratos, tipos e validação

- Use TypeScript com verificação estrita e anotações Python nos limites e serviços. Evite `any`, supressões de erro e conversões forçadas sem justificativa concreta.
- Valide entradas no servidor com Pydantic. Validação na interface melhora a experiência, mas não substitui a validação do backend.
- Diferencie dados de entrada, dados persistidos e dados de saída quando seus campos ou níveis de exposição forem diferentes.
- Valide transições de estado: uma partida concluída não aceita novos palpites; uma ação fora do turno não pode pontuar.
- Padronize erros da API com um código estável e mensagem em português. A interface deve poder tratar erros pelo código, sem comparar frases.
- Preserve acentos e use representação Unicode consistente. Nomes de usuário, palpites completos e escolhas isoladas de letras têm regras de comparação diferentes.

## 5. Integridade dos dados e regras do jogo

- O backend calcula pontos e valida resultados, turnos, dicas, pausas e conclusão. Não confie em pontos, acertos ou identidades de participantes informados livremente pelo navegador.
- Atualizações relacionadas de uma ação devem ser atômicas no PostgreSQL. Reenvios e cliques repetidos não podem conceder pontos ou publicar resultados duas vezes.
- Controle concorrência e versão do estado quando necessário. Não compartilhe a mesma sessão de banco entre requisições concorrentes.
- PostgreSQL mantém contas e progresso; MongoDB mantém o catálogo. Não pressuponha transação distribuída entre os dois.
- Use migrações Alembic para mudanças relacionais. Não recrie tabelas nem apague dados automaticamente na inicialização.
- Crie restrições e índices a partir de consultas e invariantes reais, como nome único e identificador estável de resposta.
- Não devolva respostas corretas e dicas futuras à interface antes do momento permitido. Dados derivados necessários ao bloqueio do teclado devem ter sua exposição avaliada na implementação.
- O importador deve validar os lotes e detectar duplicatas antes da gravação. Dados gerados por IA exigem revisão factual e editorial.

## 6. Segurança e configuração

- Nunca grave senhas de banco, chaves Google, tokens ou segredos no código, em arquivos versionados ou em logs.
- Use configuração por ambiente e forneça exemplos somente com valores fictícios. Mantenha arquivos locais de segredos fora do Git.
- Restrinja acesso aos dados privados ao dono da conta. Convidados da galera não são contas autenticadas.
- Use consultas parametrizadas e APIs seguras dos drivers. Não monte SQL ou filtros de banco com texto arbitrário do usuário.
- Preserve a validação do fluxo Google e a proteção da sessão e das ações autenticadas. Não implemente senha própria.
- Não exponha stack traces e detalhes internos ao jogador. Registre falhas úteis ao diagnóstico sem dados sensíveis.

## 7. Frontend, Aurélio e áudio

- Mantenha um sistema visual consistente de cores, espaçamentos, tipografia e componentes, com temas claro e escuro.
- Garanta uso por toque, mouse e teclado. Não dependa apenas de arrastar, ouvir um som ou identificar uma cor.
- Diálogos devem gerenciar foco; controles precisam de nomes acessíveis e foco visível. Não declare acessibilidade completa apenas por usar uma biblioteca.
- Respeite sons desabilitados e movimentos reduzidos. Animações e áudio não podem alterar a regra do jogo nem bloquear a experiência indefinidamente.
- Centralize o áudio para controlar categorias, volumes e reprodução sem duplicação. Limpe recursos e eventos ao desmontar componentes.
- Separe o estado confirmado da partida da apresentação e dos efeitos. Uma contagem animada de pontos não é o registro oficial da pontuação.
- Preserve o desempenho em celulares e tablets, com carregamento controlado de imagens e músicas. Verifique a adaptação mesmo que o desenho comece pelo computador.
- Use recursos visuais e sonoros com origem e permissão de uso conhecidas. Não apresente recursos temporários como identidade final aprovada.

## 8. Dependências e compatibilidade

- Use as bibliotecas aprovadas no planejamento e instale apenas as necessárias à etapa em execução.
- Confira a documentação oficial e a compatibilidade antes de escolher versões ou APIs. Evite pacotes abandonados quando houver opção mantida compatível com o plano.
- Mantenha arquivos de dependências e lock atualizados. Não execute atualizações gerais sem necessidade para a tarefa.
- Se uma escolha aprovada se mostrar inviável, explique o motivo e proponha a substituição antes de consolidar uma mudança de arquitetura ou de comportamento.
- Não adicione serviços pagos: o projeto tem restrição de custo zero.

## 9. Testes e verificação

### TDD obrigatório a partir da fase 15

Todo desenvolvimento de comportamento executável nas próximas fases, no backend e no frontend, deve seguir TDD, incluindo funcionalidades, correções, integrações, comandos e mudanças em regras ou contratos de dados. A obrigação também vale para alterações em código existente, sem exigir reescrita retroativa das fases concluídas.

Trabalhe em incrementos pequenos, seguindo o ciclo:

1. **Vermelho:** escreva primeiro um teste automatizado do comportamento esperado e execute-o antes de implementar. Confirme que ele falha pela ausência ou incorreção desse comportamento, e não por erro de sintaxe, configuração ou indisponibilidade acidental.
2. **Verde:** implemente o necessário para fazer o teste passar e execute as verificações pertinentes, mantendo os testes anteriores relevantes passando.
3. **Refatoração:** melhore nomes, organização e aplicação de SOLID sem alterar o comportamento aprovado; execute novamente os testes afetados.

Para correções, comece por um teste que reproduza o defeito. Para código existente sem cobertura, proteja primeiro o comportamento que deve ser preservado e depois acrescente o teste da mudança. Em refatorações sem mudança funcional, essa cobertura começa passando; não invente um requisito novo apenas para produzir uma falha.

Escolha o nível de teste pelo comportamento: unitário para regras isoladas, integração para persistência e contratos externos e navegador para interação e fluxos. Use substitutos controlados nas fronteiras quando necessário, mantendo verificações de integração reais para os riscos que eles não demonstram. Não altere expectativas somente para acomodar uma implementação incorreta.

Registre no resumo da fase os cenários cobertos, a falha inicial observada, o resultado após a implementação e as verificações após refatorar, quando houver. Não alegue TDD se o teste foi criado somente depois do código. Se não puder executar a etapa necessária, informe a limitação e mantenha o comportamento afetado pendente de verificação.

Documentação, produção editorial de palavras e dicas, ilustrações e ajustes puramente visuais não possuem, por si só, um ciclo TDD; continuam sujeitos às validações e revisões próprias. Código que valida, importa, apresenta ou manipula esses recursos segue TDD quando criar ou alterar comportamento. Configurações e migrações que alterem comportamento executável devem ter o resultado esperado verificado por teste apropriado antes e depois da mudança. Revisão visual, acessibilidade e escuta prática continuam necessárias quando aplicáveis.

### Verificações complementares

- Teste regras e riscos reais: pontos, turnos, acentos, repetição, pausas, demonstração e publicação única no ranking.
- Corrija bugs seguindo o ciclo TDD descrito acima, com teste de regressão que demonstre a falha e a correção.
- Use bancos de teste separados. Não execute limpeza, migração destrutiva ou carga de testes em dados reais.
- Para alterações de código, execute os verificadores e testes apropriados disponíveis, além da compilação ou verificação de tipos quando afetada.
- Teste interação e layout em computador, celular e tablet para mudanças de interface. Efeitos sonoros precisam de verificação prática quando alterados.
- Se um teste não puder ser executado, diga o que ficou sem verificação e por quê. Não invente resultados nem crie comandos de teste fictícios para uma estrutura ainda inexistente.

## 10. Colaboração, documentação e Git

- Leia o código existente antes de modificar e preserve alterações do usuário. Faça mudanças focadas no pedido.
- Não sobrescreva, descarte ou reverta trabalho não relacionado. Evite comandos destrutivos e alterações de histórico sem autorização.
- Atualize a documentação quando uma decisão aprovada alterar contratos, configuração, arquitetura ou comportamento.
- Documente motivos e decisões relevantes; comentários não devem apenas narrar o código.
- Antes de um commit, confira os arquivos e o diff, inclusive segredos e arquivos gerados. Não inclua dependências instaladas, caches ou dados locais por acidente.
- Ao concluir cada fase do desenvolvimento, revisar as alterações, executar as verificações pertinentes e fazer commit e push para o GitHub. O responsável autorizou expressamente esse procedimento recorrente; não pedir nova confirmação a cada fase. Fora desse fluxo, fazer commit e push somente quando solicitados ou autorizados no contexto.
- A mensagem do commit deve informar o número da fase e sua responsabilidade, no formato `Fase NN: objetivo da fase`. No corpo da mensagem, resumir as entregas e verificações relevantes. Não declarar uma fase concluída enquanto seus critérios não forem atendidos.
- Incluir somente arquivos pertinentes à fase e às decisões aprovadas. Manter `Doc/Roteiro-primeira-entrega.md` apenas local, respeitando o `.gitignore`; nunca forçar sua inclusão. Se a fase alterar apenas arquivos ignorados, informar que não há alterações versionáveis, sem criar commit vazio.
- Confirmar o resultado do push antes de informar que a fase foi publicada. Se houver falha, registrar a pendência e preservar o trabalho; não forçar o push nem sobrescrever alterações remotas.
- Ao concluir, resuma o que mudou, como verificou e quais limitações concretas restam.

## 11. Critério de conclusão

Uma entrega está pronta quando atende ao pedido e às regras aprovadas, mantém os contratos coerentes, passa nas verificações pertinentes e tem documentação atualizada quando necessária. A partir da fase 15, as mudanças de comportamento executável devem seguir o ciclo TDD, e o código alterado deve ser revisado quanto a SOLID, conforme as seções 3 e 9. Demonstrações visuais, dados simulados e implementações parciais devem ser identificados como tais.

Essas regras não exigem desenvolver tudo de uma vez: prefira etapas completas e verificáveis, sem inventar requisitos ou complexidade para funcionalidades futuras.
