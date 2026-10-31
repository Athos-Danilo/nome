# Catálogo e importação — fase 12

**Atualização da fase 39, 30/10/2026:** 425 respostas nos arquivos, 375 publicadas localmente e 394 revisões. Filmes/séries fechado com 100 títulos e 500 dicas (40/35/25), após aprovação do lote 004 e três correções do 001. Revisões antigas preservadas e conferidas; [registro da fase](Revisoes/filmes-e-series-004.md#aprovação-e-fechamento-em-30102026). Registros das fases anteriores abaixo são históricos.

**Atualização da fase 37, 2026-10-30:** 400 respostas produzidas nos arquivos, 350 publicadas localmente e 366 revisões históricas. Animais fechado com 100 respostas e 500 dicas, na distribuição 40/35/25. As 16 correções aprovadas do lote animais-001 foram publicadas por um comando separado de revisões, descrito ao final; o importador inicial mantém a recusa de sobrescritas. O registro de 2026-10-27 abaixo é histórico.

**Situação em 2026-10-27:** importador implementado com PyMongo assíncrono; 125 respostas dos cinco lotes passaram pela validação completa dos arquivos. Os três lotes com aprovação editorial registrada foram importados no MongoDB local: **75 respostas, 375 dicas e 75 revisões iniciais**. Países e objetos continuam aguardando avaliação humana e não foram carregados. Nenhum conteúdo foi enviado ao Atlas.

## Preparação

Executar os comandos dentro de `Backend`, após instalar `requirements-dev.txt` com hashes. O MongoDB deve estar disponível para as operações de banco. A validação dos arquivos funciona sem conexão com ele.

Configuração em `Backend/.env` ou variáveis do terminal:

```dotenv
DECIFRA_MONGODB_URL=mongodb://127.0.0.1:27017
DECIFRA_MONGODB_BANCO=decifra
```

Esses são também os padrões locais. Não há senha embutida. Uma URL com credenciais deve existir somente na configuração privada. Os bancos internos `admin`, `config` e `local` são recusados. O exemplo não substitui a configuração segura da publicação.

## Comandos

Conferir a estrutura de todos os lotes sem acessar o banco:

```powershell
.venv/Scripts/python.exe -m comandos.catalogo validar ../Data/palavras
```

Comparar com o banco, sem criar documentos, coleções ou índices:

```powershell
.venv/Scripts/python.exe -m comandos.catalogo conferir ../Data/palavras
```

Importar explicitamente somente os lotes aprovados. Exemplo da carga inicial realizada:

```powershell
.venv/Scripts/python.exe -m comandos.catalogo importar ../Data/palavras/animais-001.json ../Data/palavras/filmes-e-series-001.json ../Data/palavras/marcas-001.json
```

Consultar as quantidades efetivamente publicadas:

```powershell
.venv/Scripts/python.exe -m comandos.catalogo quantidades
```

Os comandos aceitam arquivos ou pastas; pastas incluem somente seus arquivos `*.json`, sem busca recursiva. Não executar `importar` para toda a pasta enquanto houver lotes sem aprovação editorial. A validação automática não concede aprovação humana, e o comando não tenta inferi-la lendo documentos Markdown.

Saídas: **0** para sucesso, **2** para erro de entrada ou conflito identificado antes da carga e **3** para falha de conexão, permissão, índice ou inconsistência persistida. Mensagens de conexão não imprimem a URL privada. Uma falha durante a escrita pode deixar progresso válido; seguir a recuperação abaixo.

## Validação e diagnóstico

Antes de gravar, todos os arquivos selecionados são lidos e validados:

- UTF-8, JSON válido e sem chaves repetidas no mesmo objeto.
- Versão inteira 1; lote válido e igual ao nome do arquivo.
- Campos obrigatórios, tipos estritos e recusa de campos desconhecidos.
- Identificadores estáveis no padrão do catálogo e respostas em maiúsculas NFC.
- Temáticas reconhecidas e sem duplicatas; dificuldade `facil`, `medio` ou `dificil`.
- Exatamente cinco dicas diferentes, não vazias, em NFC e sem espaços nas extremidades.
- Identificadores e respostas duplicadas dentro de um lote e entre arquivos.

Os erros de conteúdo informam arquivo e caminho, por exemplo `palavras.2.dicas`. A numeração dos itens começa em 1. JSON inválido é relatado no arquivo, sem tentar aproveitar parcialmente sua estrutura. Qualquer erro de validação ou conflito no planejamento impede iniciar a gravação de toda a seleção, inclusive dos outros arquivos válidos.

A chave de detecção de resposta ignora caixa, acentos e variações de espaços. É uma verificação conservadora do catálogo, separada da validação de palpites: não permite responder JAPAO para JAPÃO no jogo. Conflitos linguisticamente legítimos entre nomes parecidos devem passar por revisão antes de adicionar uma exceção; não criar identificadores diferentes para contornar o aviso.

Correção factual, adequação da dificuldade, sinônimos e progressão das dicas continuam dependendo da revisão editorial. O importador aceita listas não vazias para amostras técnicas; os lotes de produção continuam sujeitos à meta editorial de 25 respostas e à distribuição definida no controle.

## Publicação, reexecução e falhas

1. Validar todos os arquivos, sem escrita.
2. Conferir o catálogo e as revisões existentes. Um identificador com conteúdo diferente, uma resposta pertencente a outro identificador ou uma versão inconsistente é conflito.
3. Criar os índices necessários somente na operação `importar`.
4. Para cada resposta nova, registrar a revisão imutável 1 em `versoes_palavras`.
5. Publicar exatamente essa revisão na coleção atual `palavras`.

Não há transação entre as duas coleções nesta implementação: ela funciona no MongoDB local sem conjunto de réplicas. Uma resposta só fica disponível para consultas de seleção depois do passo 5. A revisão reservada isoladamente não entra nas quantidades publicadas.

Se a conexão cair, registros anteriores não são apagados. Repetir `conferir` e depois `importar` com os mesmos arquivos: registros idênticos publicados são preservados, revisões ainda sem publicação são recuperadas e itens ausentes são inseridos. A revisão recuperada conserva seu conteúdo, lote de origem e instante original. Reimportação idêntica não aumenta a revisão nem altera datas.

Índices únicos também protegem importações concorrentes. Se outro processo publicar conteúdo incompatível depois da conferência, a carga para com conflito; não substitui o documento. Isso pode deixar parte válida já carregada, como uma falha de conexão, exigindo nova conferência.

O importador inicial **não edita conteúdo existente**. Para corrigir um registro já carregado, interromper a carga e usar uma publicação explícita de nova revisão, preservando as anteriores. Não apagar documentos, editar o MongoDB diretamente ou renomear identificadores para forçar uma reimportação. A manutenção de novas revisões não faz parte deste comando inicial; o comando separado da fase 37 está descrito abaixo.

## Coleções e consultas internas

`palavras` e `versoes_palavras` armazenam `DocumentoPalavra`: os campos de conteúdo mais `revisao`, `lote_origem`, `atualizado_em` e a chave derivada `resposta_chave`. `_id` é do MongoDB e é removido antes da validação do documento lido. Datas usam UTC e precisão de milissegundos, compatível com a persistência BSON.

| Coleção | Índices próprios |
| --- | --- |
| `palavras` | `id` único; `resposta_chave` única; composto `tematicas, dificuldade` |
| `versoes_palavras` | `id, revisao` único; `resposta_chave` única somente na revisão 1, reservando a identidade inicial mesmo após interrupção |

`RepositorioCatalogo.listar` filtra temática e dificuldade e devolve documentos apenas ao backend, com limite validado. `buscar_revisao` recupera a revisão histórica exata para uma partida. `quantidades` informa total único, dicas publicadas, revisões e distribuição por associação temática/dificuldade. Uma resposta com duas temáticas conta uma vez no total global e uma vez em cada associação; não somar associações para medir a meta de 500 respostas.

Nenhuma rota pública de soluções foi criada. A rota de saúde continua sendo a única operação HTTP implementada; a integração da seleção de palavras às partidas ocorrerá nas fases próprias.

## Evidências e testes

- Os cinco lotes atuais passaram pela validação completa: 125 respostas e 625 dicas, sem correção estrutural necessária.
- Carga local dos três primeiros lotes: 75 novos; reexecução: 75 idênticos e zero novos.
- Quantidade local: 25 animais, 25 filmes/séries e 25 marcas, cada lote na distribuição 10/10/5. Países e objetos: zero importados.
- 58 testes do backend aprovados, incluindo PostgreSQL e MongoDB reais em instâncias isoladas.
- Casos de MongoDB: conferência sem gravação, reimportação, acentos e expressão composta, conflito recusando a seleção, reserva interrompida, recuperação de falha entre revisão e publicação, duas importações simultâneas e contagem multitemática.

Para executar os testes MongoDB, exportar `DECIFRA_MONGODB_TESTE_URL` apontando explicitamente para uma instância local e executar pytest dentro de `Backend`. Sem essa variável os testes de MongoDB são ignorados. Cada caso cria uma base com nome único `decifra_catalogo_<uuid>_teste` e remove somente essa base ao terminar. Nos testes desta fase foi usada a porta 27018; a base de desenvolvimento na porta 27017 não é usada como base de testes.

O GitHub Actions recebeu um serviço MongoDB para repetir a verificação; a edição do fluxo não comprova uma execução remota bem-sucedida. Os servidores isolados de teste foram encerrados após a revisão. O MongoDB de desenvolvimento e os 75 registros importados foram preservados.

Referências das APIs utilizadas: [PyMongo Async](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/reference/migration/) e [índices no PyMongo](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/indexes/).

## Correções de dicas com revisões — fase 37

O responsável aprovou o conteúdo corrigido de animais-001. Foi implementado `PublicadorRevisoes`, separado do importador, para corrigir somente dicas. Identificador, resposta, temáticas, dificuldade e lote precisam permanecer iguais. Os dois arquivos passam pelo contrato completo; devem ter o mesmo conjunto de IDs, sem novos itens, exclusões ou duplicatas. O conteúdo da revisão base é comparado com o arquivo original e com o histórico do banco antes de planejar a publicação. Nenhuma rota pública ou editor administrativo foi criado.

Conferir sem escrita, dentro de Backend:

```powershell
.venv/Scripts/python.exe -m comandos.revisar_catalogo ../Data/historico/animais-001/revisao-001/animais-001.json ../Data/palavras/animais-001.json --revisao-base 1
```

Gravar explicitamente as correções já aprovadas, usando os mesmos arquivos:

```powershell
.venv/Scripts/python.exe -m comandos.revisar_catalogo ../Data/historico/animais-001/revisao-001/animais-001.json ../Data/palavras/animais-001.json --revisao-base 1 --publicar
```

O padrão é somente conferir. Não apontar os dois argumentos para a mesma cópia atual: a base deve conter o conteúdo histórico esperado. Na primeira execução, o segundo argumento foi a proposta aprovada em Doc/Revisoes/Propostas/animais-001.json; depois do sucesso, o arquivo de produção foi sincronizado. O original foi arquivado byte a byte em Data/historico, fora da busca de lotes de produção. Esses arquivos históricos e propostas não contam como novos lotes nem entram na meta de 500 respostas.

O serviço primeiro reserva a revisão seguinte em `versoes_palavras`, sem alterar as anteriores. Em seguida publica no documento atual somente se todo o conteúdo esperado da base ainda corresponder ao banco. A comparação integral evita que um plano antigo substitua uma publicação concorrente. A identidade MongoDB `_id` é preservada. A API usada está documentada pelo [PyMongo](https://www.mongodb.com/docs/languages/python/pymongo-driver/current/crud/replace/); a checagem do estado esperado segue a [atomicidade por documento do MongoDB](https://www.mongodb.com/docs/manual/core/write-operations-atomicity/).

Não há transação envolvendo todas as palavras ou as duas coleções. Um erro depois de algumas publicações pode deixar parte válida concluída; o comando informa falha e deve ser repetido com os mesmos arquivos/base após nova conferência. Se a revisão foi reservada, mas a publicação não terminou, a reexecução reutiliza o registro e sua data. Conteúdos diferentes concorrendo pela mesma revisão são recusados. Se uma revisão posterior já avançou, não reverter: preparar a base correta e revisar a nova proposta. Uma base inconsistente ou outro conflito detectado no planejamento impede iniciar a gravação do lote inteiro.

Repetir uma correção já publicada é idempotente, sem gerar revisão 3 ou mudar a data. O importador inicial continua rejeitando conteúdo antigo conflitante; ele não aplica revisões automaticamente.

Na fase 37 foram publicadas **16 revisões 2** para **25 dicas corrigidas**, mantendo os nove itens sem alteração na revisão 1. Auditoria real comparou as 25 revisões iniciais ao arquivo histórico. O adaptador de catálogo do individual foi testado lendo a revisão 1 após a publicação, enquanto a listagem atual retorna a revisão corrigida. As partidas não foram reescritas e nenhum dado PostgreSQL foi alterado.

A importação inicial em uma base vazia cria revisão 1 do conteúdo atual dos arquivos. Isso não reconstrói o histórico de uma base anterior. Se a publicação futura migrar partidas já existentes, deve transportar também as revisões que elas referenciam; não substituir esse histórico por uma nova carga dos arquivos atuais. A conferência no Atlas permanece para a fase de publicação.

Verificações: 50 testes de conteúdo, validação e MongoDB isolado; incluem rejeição de arquivo inválido antes de abrir conexão, identidade alterada, base divergente, recuperação após reserva, concorrência, plano antigo, reexecução e leitura pelo adaptador do jogo. As falhas iniciais foram a ausência do serviço/comando antes da implementação. Ruff e formatação aprovados. Sem migração ou dependências novas.
