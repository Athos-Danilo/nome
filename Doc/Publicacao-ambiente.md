# Publicação do ambiente — fase 41

**Fase 41 concluída em 31/10/2026.** Frontend e API publicados; Neon migrado, Atlas carregado com os quinze lotes aprovados e conexão final atualizada no Render. O responsável confirmou login real, individual, galera, recuperação ao atualizar, acesso pelo celular e preservação da partida no roteiro de reinício/despertar. O mesmo ambiente será promovido para a entrega; o catálogo ainda não atingiu a meta final de 500 respostas.

## Decisões e recursos

- Frontend na Vercel Hobby, API no Render Free, PostgreSQL no Neon Free e catálogo no Atlas Free. Sem contratação de recursos pagos.
- O responsável aprovou bancos novos, preservando todo o ambiente local. O mesmo ambiente público será promovido para a entrega; não haverá transferência automática do histórico local.
- Render: serviço `decifra-api`, branch `main`, região Virginia, raiz `Backend`, Python 3.13.0. URL pública: <https://decifra-api.onrender.com>.
- Neon: projeto `Decifra-SQL`, branch `production`, PostgreSQL 18, AWS North Virginia. Conexão direta para as migrações, mantendo os parâmetros TLS fornecidos pelo Neon.
- Atlas: projeto `Decifra`, cluster `decifra`, Free, MongoDB 8.0.36 no print do responsável. Duas faixas de saída adicionadas à lista de acesso estão ativas; conexão administrativa, importação e uso público confirmados. Em caso de mudança das faixas do Render, atualizar a lista de acesso.
- Vercel: endereço estável <https://decifra-inky.vercel.app>, informado pelo responsável e acessado externamente. Configuração pública e cliente Google preenchidos pelo responsável; início do redirecionamento conferido. Não usar o domínio temporário de cada build como origem de login.
- Origem pública definida para configurar no Render: `https://decifra-inky.vercel.app`. Retorno autorizado no cliente Google público: `https://decifra-inky.vercel.app/api/autenticacao/google/retorno`.

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

Neon conferido inicialmente vazio, com zero tabelas públicas. Migrações aplicadas por conexão direta privada em 31/10/2026: revisão **0011**, **23 tabelas públicas**; `alembic check` sem operações pendentes. A criação posterior de tentativa temporária de login pela API também passou. Não executar testes, limpeza de fixtures ou migração de downgrade nos bancos da publicação. O ambiente local não foi reconfigurado para apontar aos bancos públicos: operações administrativas usam `Backend/.env.publicacao`, ignorado pelo Git e carregado somente no processo de administração.

O catálogo aprovado possui **375 respostas e 1.875 dicas** em quinze lotes, agora importados e conferidos no Atlas. `paises-001.json` e `objetos-001.json` permanecem pendentes; não importar a pasta inteira. A carga usou somente os lotes explícitos: `animais-001` a `animais-004`, `filmes-e-series-001` a `filmes-e-series-004`, `marcas-001` a `marcas-003`, `paises-002`, `paises-003`, `objetos-002` e `objetos-003`. O [controle do catálogo](Controle-do-catalogo.md) mantém a aprovação de cada lote.

A recusa inicial do Atlas (código 8000) foi resolvida após corrigir o usuário da conexão e atualizar a senha privada. Banco `decifra` conferido vazio antes da carga. Validação e plano sem gravação aprovaram 375 novos registros; importação publicou os 375 sem sobrescritas. Conferência posterior encontrou **375 registros idênticos, zero novos e zero recuperáveis**. Atlas tem **375 revisões iniciais**, animais 100 (40/35/25), filmes/séries 100 (40/35/25), marcas 75 (30/30/15), países 50 (20/20/10) e objetos 50 (20/20/10). O responsável foi orientado a copiar a URL final correta para o Render e publicar novamente; não registrar usuário, senha ou URI privada na documentação.

Os arquivos atuais contêm as dicas corrigidas. Em um MongoDB vazio, a primeira carga cria a revisão inicial desse ambiente. Isso é compatível com PostgreSQL também novo, sem partidas migradas; não permite transferir posteriormente partidas locais referindo revisões antigas sem migrar o histórico correspondente. Se essa transferência for solicitada, planejar os dois bancos juntos antes de executar.

Atualizações futuras devem preservar bancos, identidades e revisões publicadas do catálogo. Antes de alterações de esquema ou conteúdo, preparar exportação privada e verificar sua recuperação em destino isolado. Retornar ao commit funcional anterior não desfaz migrações: avaliar compatibilidade antes de trocar a versão da API. Não fazer downgrade destrutivo para tentar restaurar a aplicação.

## Evidências e limites da verificação

- Print do responsável confirma deploy bem-sucedido no Render com o commit `d6ec539` e o comando de inicialização acima.
- Consulta externa real a `GET https://decifra-api.onrender.com/api/saude` retornou `{"nome":"Decifra","situacao":"disponivel"}`.
- Pela origem da Vercel, a raiz retornou HTML com HTTP 200; `/api/saude` retornou JSON com HTTP 200; `/api/autenticacao/sessao`, sem cookie, retornou o JSON esperado `SESSAO_NECESSARIA`, HTTP 401. As duas respostas da API trouxeram `Cache-Control: no-store, private`. Isso confirma encaminhamento básico GET e ausência declarada de cache, sem demonstrar ainda login, cookies, mutações ou persistência.
- Após migrar o Neon, `/api/autenticacao/google` pela Vercel retornou HTTP 303 para `accounts.google.com`, callback público correto e cookie temporário Secure, HttpOnly, sem Domain, com cache privado desabilitado. Essa conferência inicial não entrou na conta Google nem consumiu o callback; o fluxo completo foi confirmado pelo responsável em seguida.
- Em seguida, o responsável confirmou a atualização da conexão final no Render e o login Google real no endereço público. Após receber o roteiro de conferência de individual, galera, atualização com recuperação de progresso e acesso pelo celular, respondeu “tudo perfeito”. Evidência de uso manual pelo responsável; não equivale a uma nova suíte automatizada de navegador ou inspeção dos atributos do cookie da sessão final.
- TDD do comando de preparo: o teste de geração falhou inicialmente porque o comando não existia. Após implementar, passaram 14 casos de geração, destino inválido, proteção contra exposição do argumento e preservação de arquivo. Três testes HTTP existentes também passaram: **17 testes aprovados**. Houve uma restrição inicial de diretório temporário e uma execução HTTP local interrompida por travamento; a conferência foi repetida com sucesso fora dessa restrição. Sem testes em dados reais.
- Sem nova dependência ou alteração de regra do jogo. O preparo do arquivo é separado da aplicação e não manipula configuração privada.

Conferência pública adicional: acesso direto a `/configuracoes` retornou HTML com HTTP 200; POST `/api/demonstracoes` com origem desconhecida retornou 403 (`ACAO_NAO_PERMITIDA`); com a origem pública e sem visitante retornou 401 (`VISITANTE_NECESSARIO`), com cache privado desabilitado. Essas requisições recusadas não criaram demonstrações ou contas e não substituem a verificação de ações válidas e persistência nos modos.

Após receber o procedimento abaixo, o responsável confirmou sucesso (“de bom”). O reinício/despertar e a preservação de estado ficam registrados como verificação manual relatada, sem medição independente do tempo de suspensão ou da latência de inicialização. Não foi realizada inspeção automatizada detalhada do cookie da sessão final nem uma nova suíte de navegador na hospedagem; login e uso público foram confirmados manualmente. Para apresentação sem rede, preservar [execução local](Ambiente-local.md), bancos locais e recursos estáticos.

Conferência de reinício: deixar uma individual aberta, anotar rodada/dica/pontos e montar algumas letras; no Render, usar **Deploys → Manual Deploy → Restart service** e aguardar retorno a Live. Atualizar a página do jogo e conferir o mesmo estado sem desconto. Para despertar, voltar após mais de quinze minutos sem tráfego na API, incluindo fechar as abas do jogo que enviam sinais; aguardar eventual inicialização e conferir novamente o progresso. Não registrar esses cenários como aprovados antes do relato ou da observação correspondente.

## Referências operacionais

- [Render: FastAPI](https://render.com/docs/deploy-fastapi), [IPs de saída](https://render.com/docs/outbound-ip-addresses) e [limites gratuitos](https://render.com/docs/free).
- [Vercel: rewrites](https://vercel.com/docs/routing/rewrites) e [Hobby](https://vercel.com/docs/plans/hobby).
- [Neon: conexões](https://neon.com/docs/get-started/connect-neon) e [preços](https://neon.com/pricing).
- [Atlas: limites Free](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/).
