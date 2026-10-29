# Menu, navegação e componentes comuns — fase 22

## Entrega

O endereço `/` agora apresenta o menu de jogo em React, seguindo a direção aprovada em `Doc/Prototipos`: moldura, cartões inclinados Solo/Galera, letras em blocos, avatares ilustrados e Aurélio. A paleta oliva, bege, amarelo e lima foi preservada, com fontes locais Bricolage Grotesque e DM Sans. Tema claro é o padrão; preferências existentes continuam prevalecendo.

- Visitante encontra jogo rápido, entrada Google, rankings e configurações. A situação da demonstração vem da API; abrir o menu ou sua página de preparação não reserva nem consome uma partida.
- Após o uso do teste, aparece o limite e o convite para entrar, sem oferecer uma segunda demonstração.
- Conta com cadastro pendente é encaminhada a `/primeiro-acesso`, mantendo nome, avatar e exclusão da fase 17. Ao concluir, o menu é liberado.
- Conta ativa encontra Solo, Galera, perfil, histórico, rankings e configurações. O menu não mostra jogo rápido.
- A consulta `/api/partidas/em-aberto` alimenta o cartão de continuação com quantidade concluída e pontos confirmados. Falha mostra aviso e opção de conferir novamente; não é tratada como ausência de partida.
- Perfil e configurações existentes foram integrados à navegação. Rotas privadas pedem entrada ao visitante. Sessão expirada em consultas ou gravações limpa os dados privados e oferece login.

## Rotas e limites da fase

| Rota | Situação |
| --- | --- |
| `/` | Menu funcional para visitante e conta ativa |
| `/primeiro-acesso` | Cadastro inicial funcional; proteção dos atalhos antes de concluir |
| `/perfil` | Nome, avatar e exclusão funcionais |
| `/configuracoes` | Preferências funcionais, no navegador ou conta |
| `/jogar/individual/novo` | Acesso preparado; formulário de configuração será implementado na fase própria |
| `/jogar/individual` | Acesso preparado; painel de partida e retomada continuam nas fases próprias |
| `/jogar/galera/novo` e `/jogar/galera` | Acessos preparados; configuração e painel continuam nas fases próprias |
| `/jogar/demonstracao` | Página de preparação, sem consumir a demonstração; jogo na fase 26 |
| `/perfil/historico` | Página de preparação, sem apresentar estatísticas ou partidas fictícias |
| `/rankings` | Página de preparação das três categorias, sem classificação fictícia |
| Outras rotas | Página não encontrada com retorno ao menu |

As páginas de preparação informam explicitamente seu estado e permitem voltar. Não há simulação de partidas, pontuação, rankings ou autenticação. O botão Google usa o fluxo existente da API. O cartão de continuação consulta dados reais, mas não executa ações da partida nesta fase.

## Organização e dependências

- **React Router 7.18.5**, versão exata, em modo declarativo com `BrowserRouter`, `Link`, `NavLink` e `Navigate`. Compatível com Node 22.13 e React 19.3.1 locais. A versão 8.5.1 consultada exige Node >=22.22; não foi adotada para evitar uma atualização do ambiente fora do escopo.
- [Instalação declarativa do React Router](https://reactrouter.com/start/declarative/installation) e [BrowserRouter](https://reactrouter.com/api/declarative-routers/BrowserRouter) consultados; requisitos de compatibilidade conferidos no registro npm.
- `Aplicacao.tsx` integra sessão, proteção e composição das telas. Estado de conta e persistência continuam em `usar-conta.ts`.
- `MenuInicial.tsx` apresenta o convite e os modos; sua consulta de continuidade usa TanStack Query e o adaptador de API separado em `menu/api.ts`. O adaptador valida os campos consumidos e seleciona apenas o resumo necessário.
- `ConteudoConta.tsx` reutiliza os formulários existentes. `CartaoModo`, `Dialogo`, `Botao`, `Carregando`, `EstadoVazio`, `VoltarAoMenu` e `PaginaEmPreparacao` separam apresentação e responsabilidades.
- `menu.css` estende as variáveis existentes; não duplica fontes nem altera regras de pontuação. O layout possui composição para computador, tablet e celular, com atalhos na lateral ou na parte inferior.

A aplicação preserva as fronteiras existentes entre interface, consultas e persistência. Componentes recebem os dados e callbacks necessários, sem introduzir uma nova camada de negócios. Os formulários mantêm rascunhos separados das preferências confirmadas. O atalho de tema usa os valores salvos como base, sem salvar volumes ainda em edição. Trocar de página descarta a prévia e reaplica as preferências confirmadas.

## Acessibilidade e recursos futuros

- Links reais permitem recarregar uma rota e usar Voltar/Avançar. O título da página acompanha a tela e o foco vai ao título principal na navegação.
- Atalho para pular a navegação, foco visível, nomes de controles e destaque da rota atual.
- Ajuda em diálogo nativo, com foco inicial, contenção pelo navegador, fechamento por Escape e devolução de foco ao acionador. Exclusão mantém seu diálogo e suas verificações anteriores.
- Estados de carregamento, falha e notificações acessíveis; ações disponíveis por teclado, mouse e toque.
- Imagens existentes com origem documentada; Aurélio raster recebe apenas o movimento leve já disponível. Redução de movimentos do sistema e da preferência é respeitada.
- Preferências de áudio continuam salvas, mas não há reprodução nesta fase. Animações completas do mascote e sons permanecem nas fases próprias.

A verificação cobre navegador desktop com emulação de toque e tamanhos móveis; não equivale a homologação em dispositivos físicos, leitor de tela ou produção Vercel/Render. A configuração de publicação continua na fase própria.

## TDD e verificações

1. Antes de implementar, foi escrito o conjunto de cenários do menu. A execução inicial do cenário de visitante falhou pela ausência do título “Bora decifrar?” no frontend anterior.
2. Após implementar, os cenários verificaram navegação, persistência do tema, proteção de primeiro acesso, limite da demonstração, ajuda/foco/Escape, consulta e repetição de partida aberta e sessão expirada. Seletores dos testes antigos foram adaptados às rotas e aos atalhos novos, preservando suas verificações funcionais.
3. Um teste adicional reproduziu o salvamento indevido de áudio em rascunho pelo atalho de tema: esperava volume confirmado 70 e recebia 15. A implementação foi corrigida para usar preferências confirmadas como base.
4. Refatoração separou conteúdo de conta e páginas de preparação da composição principal. Validações finais e revisão visual registradas abaixo.

Comandos de verificação, executados em `Frontend/`:

```text
npm test
npm run build
npm run verificar-formatacao
npm run testar-menu
npm run testar-perfil
```

Os testes de navegador usam respostas controladas da API para reproduzir estados e falhas sem alterar contas ou partidas reais. Os recursos visuais, fontes e avatares são carregados do frontend real. A API existente continua responsável pela sessão e pelo progresso; não houve mudança no backend ou nos bancos nesta fase.

### Resultados finais

- **30 testes unitários existentes aprovados.**
- **24 cenários de menu aprovados:** oito fluxos em computador (1440 × 1000), tablet (820 × 1180) e celular (390 × 844).
- **39 cenários anteriores de perfil/demonstração aprovados** nos mesmos três tamanhos, com os acessos adaptados ao menu e às rotas novas.
- Compilação de produção, TypeScript e formatação aprovados.
- Revisão visual das capturas do menu claro em computador e celular e do menu escuro em tablet; composição legível e sem rolagem horizontal nos cenários verificados. Capturas locais em `Frontend/test-results/`, ignoradas pelo Git.
- Servidores locais existentes preservados: frontend em `http://localhost:5173/` e API na porta 8000. Menu aberto no painel do Codex para avaliação do responsável.

O roteiro local foi atualizado, sem inclusão no Git. Próxima fase do planejamento: **23 — objetos, lote 002**; os demais itens do dia 4 permanecem nas fases seguintes.

## Correção das verificações do GitHub — 2026-10-29

A execução `40864032007` confirmou 37 cenários de perfil aprovados e dois reprovados: exclusão de cadastro pendente em computador e celular. O erro era a ausência da confirmação “Conta excluída”, não uma falha de instalação, compilação ou testes unitários. Os registros originais exigiam acesso autenticado; o workflow foi ajustado para publicar detalhes como anotações do GitHub pelo reporter oficial do Playwright. Os 24 cenários do menu também passaram a integrar a verificação contínua.

A navegação da aplicação apagava a mensagem de sucesso ao mudar de rota. Ao excluir um cadastro pendente, o retorno automático de `/primeiro-acesso` para `/` podia remover o aviso antes da leitura. O teste local anterior às vezes observava o aviso transitório antes dessa navegação; por isso, passar localmente não descartava o defeito.

**Regressão antes da correção:** o cenário passou a aguardar o menu, abrir e fechar a ajuda e só então conferir a confirmação da exclusão. Com o código anterior, reproduziu localmente a mesma ausência do aviso. Não foram adicionadas esperas fixas ou tentativas extras para encobrir a falha.

**Correção:** a navegação limpa erros e prévias, preservando a confirmação da ação concluída. A mensagem continua transitória em memória, sem persistência após recarregar a página. As ações já responsáveis por substituir ou limpar notificações continuam fazendo isso. Não houve mudança nas regras de exclusão, anonimização ou autenticação.

O cenário de regressão passou nos três tamanhos com o Chromium distribuído pelo Playwright. O navegador de teste foi atualizado para a revisão compatível com o Playwright instalado; o Chrome pessoal do responsável não foi alterado. A investigação final foi feita sem controle do navegador pessoal, após a ferramenta de controle encerrar esse caminho por não conseguir identificar a página.

As execuções históricas continuam registrando seus resultados originais; a correção é avaliada em um novo commit, sem reescrever o histórico nem desabilitar verificações.

Verificação local após a correção: **39 cenários de perfil/demonstração, 24 cenários de menu e 30 testes unitários aprovados**, além de TypeScript, build de produção e formatação. A confirmação remota é acompanhada na execução automática gerada pelo push da correção.
