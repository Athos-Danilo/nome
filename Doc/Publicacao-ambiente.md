# Publicação do ambiente — fase 41

**Estado em 31/10/2026: em andamento.** O processo da API iniciou; isso não certifica conexão com os bancos, autenticação ou partidas públicas.

## Decisões e recursos

- Frontend na Vercel Hobby, API no Render Free, PostgreSQL no Neon Free e catálogo no Atlas Free. Sem contratação de recursos pagos.
- O responsável aprovou bancos novos, preservando todo o ambiente local. O mesmo ambiente público será promovido para a entrega; não haverá transferência automática do histórico local.
- Render: serviço `decifra-api`, branch `main`, região Virginia, raiz `Backend`, Python 3.13.0. URL pública: <https://decifra-api.onrender.com>.
- Neon: projeto `Decifra-SQL`, branch `production`, PostgreSQL 18, AWS North Virginia. Conexão direta para as migrações, mantendo os parâmetros TLS fornecidos pelo Neon.
- Atlas: projeto `Decifra`, cluster `decifra`, Free, MongoDB 8.0.36 no print do responsável. Duas faixas de saída adicionadas à lista de acesso estão ativas; conferir correspondência com a lista completa de Connect → Outbound do Render. Uma conexão real ainda precisa ser executada.
- Endereço estável da Vercel e cliente Google público: pendentes. Não usar o domínio temporário de cada build como origem de login.

## API no Render

Build, a partir de `Backend`:

```sh
python -m pip install --require-hashes -r requirements.txt
```

Inicialização no Linux do Render:

```sh
python -m uvicorn aplicacao.principal:aplicacao --host 0.0.0.0 --port $PORT --no-access-log
```

Health Check Path: `/api/saude`. Esse endpoint verifica somente o processo HTTP; não consulta PostgreSQL, MongoDB nem Google. Não usar sua resposta como prova de que o jogo está pronto. Não há migração nem carga de catálogo automática no start ou build. O comando Windows local continua seguindo [Ambiente local](Ambiente-local.md).

Configuração privada no Render: `DECIFRA_POSTGRESQL_URL`, `DECIFRA_MONGODB_URL` e `DECIFRA_MONGODB_BANCO=decifra`. Quando o domínio Vercel estiver definido, completar `DECIFRA_AMBIENTE=producao`, `DECIFRA_ORIGEM_PUBLICA`, `DECIFRA_ORIGENS_PERMITIDAS` (lista JSON com a origem HTTPS estável), `DECIFRA_GOOGLE_CLIENTE_ID` e `DECIFRA_GOOGLE_CLIENTE_SEGREDO`. Sessões mantêm sete dias. Não liberar o ambiente aos jogadores antes dessa configuração e das verificações finais.

As faixas gratuitas de saída do Render são compartilhadas por região; usar todas as faixas exibidas em Connect → Outbound, sem contratar IP dedicado. A API não precisa de acesso irrestrito `0.0.0.0/0` no Atlas. Credenciais e permissões do usuário do banco continuam necessárias.

## Frontend na Vercel

Importar `Athos-Danilo/nome`, branch `main`, com **Root Directory `Frontend`** e preset **Vite**. `Frontend/vercel.json` define `npm ci`, `npm run build`, saída `dist`, rewrite externo da API e fallback das páginas React. Usar Node 22.x, compatível com o intervalo de `package.json` e o CI.

O encaminhamento `/api/:caminho*` tem prioridade e aponta para `https://decifra-api.onrender.com/api/:caminho*`. O navegador chama a origem da Vercel; não recebe segredos nem uma URL de banco. Nenhum segredo deve ser colocado em variáveis `VITE_*`.

Para preparar o arquivo em outro destino vazio, executar em `Backend`, substituindo a origem pelo serviço real:

```sh
python -m comandos.publicacao --api https://decifra-api.onrender.com --saida ../Frontend/vercel.json
```

O comando exige origem HTTPS do Render, sem credenciais, porta ou caminho; preserva arquivo idêntico e recusa sobrescrever configuração diferente. Não cria serviços nem testa o proxy remoto. Alterações deliberadas em um arquivo existente devem ser revisadas manualmente.

## Dados e preservação

Aplicar `alembic upgrade head` no Neon novo somente após conferir o destino privado; verificar `alembic current` e `alembic check`. Não executar testes, limpeza de fixtures ou migração de downgrade nos bancos da publicação. O ambiente local não será reconfigurado para apontar aos bancos públicos.

O catálogo aprovado possui **375 respostas e 1.875 dicas** em quinze lotes. `paises-001.json` e `objetos-001.json` permanecem pendentes; não importar a pasta inteira. Usar a lista explícita de lotes aprovados do [controle do catálogo](Controle-do-catalogo.md), executar conferência sem gravar, importar e conferir quantidades. Essa carga ainda está pendente no Atlas.

Os arquivos atuais contêm as dicas corrigidas. Em um MongoDB vazio, a primeira carga cria a revisão inicial desse ambiente. Isso é compatível com PostgreSQL também vazio; não permite transferir posteriormente partidas locais referindo revisões antigas sem migrar o histórico correspondente. Se essa transferência for solicitada, planejar os dois bancos juntos antes de executar.

Atualizações futuras devem preservar bancos, identidades e revisões publicadas do catálogo. Antes de alterações de esquema ou conteúdo, preparar exportação privada e verificar sua recuperação em destino isolado. Retornar ao commit funcional anterior não desfaz migrações: avaliar compatibilidade antes de trocar a versão da API. Não fazer downgrade destrutivo para tentar restaurar a aplicação.

## Evidências e conclusão pendente

- Print do responsável confirma deploy bem-sucedido no Render com o commit `d6ec539` e o comando de inicialização acima.
- Consulta externa real a `GET https://decifra-api.onrender.com/api/saude` retornou `{"nome":"Decifra","situacao":"disponivel"}`.
- TDD do comando de preparo: o teste de geração falhou inicialmente porque o comando não existia. Após implementar, passaram 14 casos de geração, destino inválido, proteção contra exposição do argumento e preservação de arquivo. Três testes HTTP existentes também passaram: **17 testes aprovados**. Houve uma restrição inicial de diretório temporário e uma execução HTTP local interrompida por travamento; a conferência foi repetida com sucesso fora dessa restrição. Sem testes em dados reais.
- Sem nova dependência ou alteração de regra do jogo. O preparo do arquivo é separado da aplicação e não manipula configuração privada.

Ainda verificar: build Vercel e acesso direto às páginas; migrações Neon; carga Atlas; configuração de produção; cliente e callback Google públicos; cookies Secure/HttpOnly/SameSite e ausência de Domain; query, POST, Origin e ausência de cache privado pelo rewrite; login real; os dois modos; reinício e despertar sem perda de progresso ou penalidade indevida. Confirmar acesso por outro dispositivo antes de concluir a fase. Para apresentação sem rede, preservar [execução local](Ambiente-local.md), bancos locais e recursos estáticos.

## Referências operacionais

- [Render: FastAPI](https://render.com/docs/deploy-fastapi), [IPs de saída](https://render.com/docs/outbound-ip-addresses) e [limites gratuitos](https://render.com/docs/free).
- [Vercel: rewrites](https://vercel.com/docs/routing/rewrites) e [Hobby](https://vercel.com/docs/plans/hobby).
- [Neon: conexões](https://neon.com/docs/get-started/connect-neon) e [preços](https://neon.com/pricing).
- [Atlas: limites Free](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/).
