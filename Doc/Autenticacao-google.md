# Google e autenticação — fase 15

**Situação:** fase 15 concluída em 2026-10-28. Login Google real confirmado pelo responsável no Chrome, com retorno ao frontend e conferência privada de uma conta em cadastro pendente e uma sessão válida no PostgreSQL de desenvolvimento. Cliente Google e configuração privada preparados; banco/usuário próprios e migrações 0001/0002 aplicadas. Saída, expiração, rotação e recusa de acesso indevido verificadas nos testes automatizados descritos abaixo. Publicação e interface final continuam nas fases próprias.

## Implementação e verificação realizadas

- Rotas de início/retorno Google, consulta privada de sessão e saída implementadas; o primeiro login cria cadastro pendente. Primeiro acesso, exclusão da conta e demonstração permanecem nas fases 17/19.
- Casos de uso recebem os contratos `ProvedorGoogle` e `RepositorioAutenticacao`. O adaptador Authlib valida os tokens; o adaptador PostgreSQL aplica transações; as rotas cuidam de HTTP, cookies e autorização. Essa divisão aplica responsabilidade única e inversão de dependência sem exigir hierarquias para os modos de jogo.
- SOLID revisado nas partes alteradas: contratos pequenos por fronteira, substitutos controlados com os mesmos resultados e erros esperados, adaptadores substituíveis sem alterar os casos de uso. Testes reais do PostgreSQL e tokens assinados complementam os substitutos; o responsável também confirmou o login real Google no Chrome.
- Revisão 0002 adiciona `tentativas_login`; login não aplica migrações automaticamente. Sessão opaca aleatória, SHA-256 no banco, revogação na saída e rotação ao entrar novamente no mesmo navegador. Não persistimos access token, refresh token ou ID token do Google.
- A criação por sujeito Google é serializada dentro da transação, protegendo dois primeiros logins simultâneos. E-mail de outra identidade é recusado; não há associação automática de contas por e-mail.

### Evidência TDD

1. Antes de implementar as rotas, três testes falharam com 404 no lugar dos contratos esperados. O conjunto foi ampliado para doze cenários de login, retorno, sessão, proteção de saída e expiração; a ausência da composição com dependências controladas também foi observada. Após implementar rotas e serviço, os doze cenários passaram, junto aos três testes de infraestrutura existentes.
2. O teste HTTP com PostgreSQL real falhou inicialmente com 503 por ausência do adaptador/composição persistida. Foram implementados repositório, migração e gerenciamento de conexão; corrigida também a incompatibilidade do loop padrão Proactor do Windows com Psycopg assíncrono. Essa falha de ambiente é registrada separadamente da ausência funcional.
3. Dezesseis testes do adaptador OIDC, executados antes de implementar seus métodos, falharam com comportamento ainda não implementado. Depois passaram com JWTs RS256 assinados por chaves de teste e tráfego HTTP controlado: assinatura falsa, emissor/público/nonce incorretos, expiração, emissão futura, e-mail não verificado e falha de rede não autenticam.
4. A cobertura de concorrência reproduziu uma violação do índice único de e-mail em dois primeiros logins da mesma conta. O bloqueio transacional por sujeito Google corrigiu a falha sem associar identidades distintas. Também foram verificados consumo único de tentativa e perda de autorização após anonimização.
5. Após refatorar imports, formatação e dependências FastAPI anotadas, foram executados **116 testes do backend, todos aprovados**, com PostgreSQL e MongoDB locais isolados, além de Ruff e verificação de formatação aprovados. São **38 testes novos de autenticação**: 19 HTTP/configuração/autorização, 16 OIDC e 3 de persistência real. Um teste anterior foi adaptado para consultar o contrato OpenAPI, pois a inclusão de roteadores mudou a representação interna das rotas no FastAPI fixado.

Authlib 1.9.1 está fixado; sua dependência joserfc fornece a validação de assinatura. A versão emite aviso de depreciação ao utilizar o HTTPX aprovado, mantendo um adaptador de compatibilidade funcional e coberto pelos testes. Não foi substituído HTTPX por outra biblioteca nesta fase; revisar essa transição antes de futuras atualizações de dependências. SQLAlchemy utiliza o extra `asyncio`, que instala greenlet; locks de produção/desenvolvimento incluem hashes.

Os testes automatizados não usaram credenciais Google reais nem dados reais dos jogadores. Após configurar o cliente local, uma conferência operacional de `/api/saude` e `/api/autenticacao/google` pelo endereço localhost:5173 confirmou comunicação com a API, consulta aos metadados Google e início do redirecionamento com cookie temporário. Em seguida, o responsável realizou a entrada pessoal no Chrome e confirmou o retorno a `/?autenticacao=concluida`; a consulta privada ao banco confirmou uma conta em cadastro pendente e uma sessão válida, sem expor identidade, credenciais ou tokens. Esse fluxo passou pela troca real do código e validação do ID token Google antes de criar a sessão.

O encerramento da sessão foi verificado por testes HTTP com dependências controladas e pela revogação no PostgreSQL isolado, sem executar logout manual da sessão pessoal do responsável. Aparelhos físicos adicionais, Safari/Firefox e publicação Vercel/Render permanecem sem verificação; os cookies pelo rewrite público serão conferidos na fase 41. A lista de usuários permitidos no console continua sob administração do responsável; não foi inspecionada por automação nem documentada com e-mails pessoais.

## Configuração pessoal no Google

1. Entre no [Google Cloud Console](https://console.cloud.google.com/) com sua conta e crie ou selecione o projeto **Decifra**. Não habilite cobrança para configurar este login.
2. Abra **Google Auth Platform**. Na configuração inicial/Branding, informe o nome Decifra, seu e-mail de suporte e seu contato. Escolha público **Externo**, pois os jogadores não pertencem necessariamente à mesma organização Google.
3. Em Audience/Público, mantenha o ambiente de desenvolvimento em teste e cadastre as contas de teste quando o console oferecer essa opção. Solicite somente os escopos **openid** e **email** em Data Access/Acesso a dados. O jogo não precisa de Drive, Gmail, contatos ou acesso offline.
4. Em Clients/Clientes, crie um cliente **Aplicativo da Web**, chamado por exemplo **Decifra local**. Cadastre exatamente esta URI de redirecionamento autorizado, sem barra no final:

   ```text
   http://localhost:5173/api/autenticacao/google/retorno
   ```

5. O fluxo é iniciado no servidor; não utiliza o SDK JavaScript do Google. A lista de origens JavaScript não substitui a URI de redirecionamento. Se preencher uma origem local, use `http://localhost:5173`.
6. Copie o ID do cliente e o segredo para `Backend/.env`, nos campos `DECIFRA_GOOGLE_CLIENTE_ID` e `DECIFRA_GOOGLE_CLIENTE_SEGREDO`. Não envie esses valores no chat, em capturas ou em commits. O segredo pode ser mostrado apenas no momento da criação; guarde-o de forma privada.
7. No mesmo arquivo, preencha `DECIFRA_POSTGRESQL_URL` com o banco de desenvolvimento e mantenha `DECIFRA_ORIGEM_PUBLICA=http://localhost:5173`. O banco usado pelos testes é separado e não deve receber contas reais.

Se `.env` não existir, copie `.env.example`; não sobrescreva um arquivo privado já configurado. Campos de exemplo são fictícios. Não colocar segredos em variáveis `VITE_*`, pois elas podem entrar no código distribuído ao navegador.

## Execução e conferência local

Depois de instalar as dependências e aplicar `alembic upgrade head` no banco de desenvolvimento, execute a API e o Vite conforme [Ambiente local](Ambiente-local.md). No Windows, mantenha `--reload` no Uvicorn: o Psycopg assíncrono precisa de um loop Selector; a execução sem recarga exige `--loop asyncio:SelectorEventLoop`. Não confundir essa incompatibilidade de execução com uma falha de credenciais.

### Correção operacional confirmada em 30/10/2026

Após reiniciar a API sem recarga e sem a opção de loop, o início do login retornou `DADOS_INDISPONIVEIS`. O diagnóstico confirmou `InterfaceError` com o loop Proactor padrão do Windows; a mesma conexão funcionou com Selector. A API foi reiniciada, a partir da raiz do projeto, com:

```powershell
Backend/.venv/Scripts/python.exe -m uvicorn aplicacao.principal:aplicacao --app-dir Backend --host 127.0.0.1 --port 8000 --loop asyncio:SelectorEventLoop --no-access-log
```

A conferência operacional pelo proxy do frontend confirmou HTTP 303 para `accounts.google.com`, com cookie temporário, e HTTP 401 esperado na consulta de sessão ainda não autenticada, sem falha de banco. Em seguida, o responsável confirmou que a entrada real pelo Google funcionou. Não houve alteração de credenciais, regras de autenticação, migrações ou código executável; a correção foi na inicialização do processo local. Ao reiniciar sem `--reload`, preservar a opção de loop acima.

### Conferência do fluxo

Abra `http://localhost:5173/api/autenticacao/google`. O Vite encaminha `/api` à API local; o retorno registrado também passa por esse endereço. Não alterne entre localhost e 127.0.0.1 no mesmo fluxo, pois os cookies pertencem ao endereço utilizado.

Após consentir, a API retorna à raiz do frontend com `?autenticacao=concluida`. A página React oferece primeiro acesso, perfil e preferências desde a fase 17; o menu completo permanece na fase 22. Consulte [Perfil e preferências](Perfil-preferencias.md). Consulte `GET /api/autenticacao/sessao` no mesmo navegador para verificar o cadastro pendente e a validade. O resultado é privado e também fornece o token de proteção das ações. Um cancelamento ou retorno inválido mostra um erro com código estável, sem criar sessão.

Para sair, use `POST /api/autenticacao/sair` com `Origin` da origem pública e `X-Decifra-CSRF` recebido da consulta de sessão. A futura interface fará isso pelo botão próprio. Sair do Decifra revoga sua sessão local, sem sair de toda a conta Google do navegador.

## Organização aprovada para publicação

O responsável escolheu **Vercel para o frontend**, **Render gratuito para a API**, **Neon para PostgreSQL** e **Atlas para MongoDB**. Nenhum serviço foi provisionado nesta fase.

Na Vercel, encaminhar `/api/:caminho*` para `https://ENDERECO-REAL-DA-API.onrender.com/api/:caminho*` por rewrite externo, antes do fallback da aplicação React. O exemplo é somente um modelo; nenhum domínio foi inventado ou reservado. A configuração executável será preenchida e testada quando os endereços reais existirem.

No backend, `DECIFRA_ORIGEM_PUBLICA` será o endereço HTTPS estável da Vercel, e o retorno Google será esse endereço seguido de `/api/autenticacao/google/retorno`. Criar um cliente Google separado para publicação e registrar essa URI exata. O navegador deverá chamar `/api` na Vercel, evitando autenticação diretamente no domínio Render. Não configurar Domain nos cookies nem usar `SameSite=None` para contornar uma organização incorreta.

Testar no ambiente publicado o encaminhamento de Cookie, Set-Cookie, Origin, query e POST, ausência de cache nas respostas privadas e retorno ao domínio correto. Cabeçalhos Host/X-Forwarded-Host enviados pelo cliente não determinam o callback: ele vem da configuração explícita. HTTPS, limites de proxy e despertar do Render ainda precisam de verificação real na fase 41; aprovação da organização não comprova cookies publicados funcionando.

Antes de liberar para terceiros, revisar Audience/estado de publicação no Google, usuários permitidos, domínios, informações de marca e exigências indicadas pelo console para os escopos utilizados. Somente login básico não autoriza afirmar que todas as exigências de publicação já foram atendidas.

## Referências oficiais consultadas

- [Google — OpenID Connect](https://developers.google.com/identity/openid-connect/openid-connect).
- [Google — aplicativos web e URIs de retorno](https://developers.google.com/identity/protocols/oauth2/web-server).
- [Authlib — integração Starlette](https://docs.authlib.org/en/latest/oauth2/client/web/starlette.html).
- [Vercel — rewrites para origens externas](https://vercel.com/docs/routing/rewrites).
- [Render — limitações do plano gratuito](https://render.com/docs/free).
