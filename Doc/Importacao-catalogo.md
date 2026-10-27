# Catálogo e importação — fase 12

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

O importador inicial **não edita conteúdo existente**. Para corrigir um registro já carregado, interromper a carga e planejar uma publicação explícita de nova revisão, preservando as anteriores. Não apagar documentos, editar o MongoDB diretamente ou renomear identificadores para forçar uma reimportação. A manutenção de novas revisões não faz parte deste comando inicial.

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
