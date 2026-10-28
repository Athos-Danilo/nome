# Perfil, avatares e preferências — fase 17

Implementação concluída em 2026-10-28. O login Google passa a abrir o primeiro acesso ou o perfil existente na aplicação React. Menu completo, partidas, histórico e ranking visual continuam nas fases próprias.

## Primeiro acesso e edição

A conta pendente precisa escolher nome válido e um dos 20 avatares oficiais. O nome tem 3–20 caracteres: letras, números ou sublinhado, sem espaços; a unicidade ignora caixa e acentos. O servidor valida novamente e retorna conflito sem perder a seleção do formulário. Salvar ativa o cadastro. Nome e avatar podem ser alterados depois; e-mail permanece somente para leitura e não existe senha própria.

Perfil e preferências são privados, inclusive durante o cadastro pendente. O titular vem da sessão; enviar identificador de outra pessoa não concede acesso. Mutações exigem a proteção de origem e token da autenticação. Respostas privadas usam `Cache-Control: no-store`.

## Preferências e decisão D17

Decisão expressamente aprovada pelo responsável: **conta nova herda o navegador; conta com preferências salvas usa as da conta**, inclusive em outro dispositivo.

O navegador guarda apenas as preferências locais, sem credenciais. A consulta ao servidor informa `salvas`; consultar valores padrão não cria uma gravação. Quando não existem preferências persistidas, a interface inicializa com os valores locais usando `somente_se_ausentes: true`. A operação é atômica e não sobrescreve uma gravação concorrente de outro dispositivo. Alterações explícitas posteriores salvam normalmente na conta. Visitantes salvam somente no navegador. Dados locais inválidos ou armazenamento indisponível recebem tratamento na interface.

Campos: `tema` (`claro` ou `escuro`), `musica_id`, `volume_musica`, `volume_interface`, `volume_eventos` (inteiros de 0 a 100), `silenciado` e `movimentos_reduzidos`. O padrão é claro, sem música selecionada, volumes 70 e opções booleanas falsas.

Os identificadores `lofi_01`, `lofi_02`, `lofi_03`, `arcade_01` e `arcade_02` são posições técnicas reservadas. Os arquivos e a seleção final das cinco músicas ainda serão preparados; a divisão final entre estilos permanece sujeita à escolha de conteúdo. **Esta fase salva controles de áudio, mas não reproduz músicas nem efeitos.** A integração pertence à fase 38.

## Exclusão da própria conta

Disponível também para cadastro incompleto. Um diálogo explica os efeitos e exige digitar exatamente **EXCLUIR**; cancelar ou pressionar Escape não exclui. Falhas permitem tentar novamente. O servidor executa a operação em uma única transação:

- Remove identidade Google, e-mail, nome, avatar, sessões, preferências e exposições de palavras.
- Desvincula a demonstração sem apagar seu marcador de uso pelo navegador.
- Anonimiza participantes, inclusive convidados, e limpa dados pessoais de configurações, palpites e registros de ações.
- Conserva resultados já publicados e pontos anônimos, associados ao identificador residual e ao nome de apresentação **Jogador excluído** nos futuros rankings.
- Torna partidas ativas inacessíveis sem publicar resultado artificial, conceder pontos ou simular conclusão.

O registro residual não conserva a identidade anterior. Entrar novamente com o mesmo Google cria outro identificador e começa do zero. Bloqueios transacionais seguem a ordem titular → partidas; os futuros motores do jogo devem manter essa ordem. Uma falha intermediária reverte a limpeza inteira. Retenção de cópias de segurança e operação em hospedagem serão tratadas na publicação; não se presume eliminação física de cópias externas nesta fase.

## Recursos visuais e arquitetura

A migração `0003_colecao_avatares` cadastra 20 identificadores estáveis, sem acrescentar tabelas às 19 existentes. Os desenhos SVG próprios ficam em `Backend/recursos/avatares`; a API lista identificador, nome e endereço. Não há upload pessoal. Os desenhos podem receber refinamento visual sem alterar seus identificadores.

A aplicação utiliza a paleta aprovada, temas claro/escuro, foco visível e composição responsiva. Bricolage Grotesque e DM Sans são servidas localmente, com arquivos de licença OFL provenientes do repositório oficial [Google Fonts](https://github.com/google/fonts). DM Sans inclui itálico real. A imagem aprovada do Aurélio foi reutilizada; sua animação em partes continua em fase própria.

O backend separa rotas, validação, serviço e repositório PostgreSQL por contrato pequeno e injeção de dependências. No frontend, `useConta` concentra sincronização e sessão; formulários, cliente HTTP e validação local permanecem separados. TanStack Query 5.105.0 administra consultas e alterações privadas. O diálogo utiliza o elemento nativo `dialog`. O menu completo e a navegação prevista com React Router continuam na fase 22.

## Verificação e limites

TDD aplicado: testes inicialmente falharam por rotas ausentes, primeiro acesso ausente e projeção incorreta de campos; as implementações passaram e foram refatoradas mantendo os resultados. Também foram reproduzidos e corrigidos o erro fora da área visível e a ausência de exclusão no cadastro pendente.

| Verificação local | Resultado |
| --- | --- |
| Backend completo com PostgreSQL e MongoDB isolados | 122 testes aprovados |
| Testes unitários do frontend | 25 aprovados |
| Fluxos de perfil no navegador, computador/tablet/celular | 24 aprovados |
| Tipagem, compilação, Ruff e formatação | Aprovados |
| Migração no PostgreSQL de desenvolvimento e comparação do esquema | Aplicada, sem alterações de esquema pendentes |
| Recursos reais pela aplicação local | 20 SVG válidos; perfil e preferências anônimos retornam 401 |

Os seis testes de integração novos usam bancos PostgreSQL descartáveis e verificam autorização, unicidade, inicialização de preferências, anonimização, reversão de falha e concorrência. Os testes de navegador usam respostas controladas da API: não excluem a conta pessoal e não substituem o login Google real confirmado na fase 15. A revisão visual usa tamanhos de 1440, 820 e 390 pixels; não equivale a teste em aparelhos físicos. A integração contínua foi configurada para esses fluxos, sem afirmar execução remota aprovada nesta entrega. Permanece o aviso conhecido de compatibilidade HTTPX/Authlib documentado na autenticação.

Para experimentar: executar o ambiente local e abrir [Decifra local](http://localhost:5173). Consulte também [contratos](Contratos-api.md), [modelagem](Modelagem-dados.md) e [autenticação](Autenticacao-google.md).
