# Auditoria final do catálogo — fase 47

**Concluída em 04/11/2026.** Os vinte lotes aprovados correspondem integralmente ao conteúdo atual no MongoDB local e no Atlas publicado. A carga completa já havia sido realizada no fechamento das fases 44 e 46; esta auditoria não precisou inserir ou substituir nenhum registro.

## Artefatos da entrega

- [Manifesto dos vinte lotes e 500 identificadores](../../Data/manifestos/catalogo-primeira-entrega.json).
- [Convenção de hashes e conferência reproduzível](../../Data/manifestos/README.md).
- [Resultado das consultas por ambiente](catalogo-final-conferencia.json), sem conexões, credenciais ou identificadores de contas e partidas.
- [Controle de produção e aprovação dos lotes](../Controle-do-catalogo.md), com revisões editoriais próprias de cada temática.

SHA-256 global do conteúdo atual, no formato canônico descrito no manifesto:

```text
8cfee38762c4e4f231815e7e65e12cdc5a55fc70443c7a4da748f8c81113eb41
```

Os vinte hashes de arquivo também foram conferidos contra o conteúdo do commit indicado em `commit_origem_dos_lotes`, confirmando a proveniência declarada no manifesto.

## Conferência estrutural e quotas

**500 IDs distintos, 500 respostas normalizadas distintas e 2.500 dicas**, com cinco pistas diferentes e não vazias por resposta. UTF-8, Unicode NFC, caixa alta, tipos estritos, campos conhecidos, nomes de lote e dificuldades passaram no validador existente. Cada lote tem 25 respostas. Os vinte lotes possuem aprovação humana registrada; a auditoria automática não substitui essa aprovação nem certifica novamente cada fato das dicas.

| Temática principal | Fácil | Médio | Difícil | Respostas | Dicas |
| --- | ---: | ---: | ---: | ---: | ---: |
| Animais | 40 | 35 | 25 | 100 | 500 |
| Filmes e séries | 40 | 35 | 25 | 100 | 500 |
| Marcas | 40 | 35 | 25 | 100 | 500 |
| Países | 40 | 35 | 25 | 100 | 500 |
| Objetos | 40 | 35 | 25 | 100 | 500 |
| **Total** | **200** | **175** | **125** | **500** | **2.500** |

A temática principal de planejamento é obtida do nome do lote, conferindo sua presença nas temáticas cadastradas. Atualmente não há associação secundária nos 500 itens. A contagem global utiliza IDs únicos, e a prova de quotas utiliza temática principal; isso evita inflar a meta se associações secundárias forem acrescentadas futuramente.

## Bancos e revisões

| Verificação | Local | Atlas publicado |
| --- | ---: | ---: |
| Respostas atuais válidas | 500 | 500 |
| Dicas atuais | 2.500 | 2.500 |
| Revisões históricas válidas | 527 | 508 |
| Extras ou faltantes em relação aos arquivos | 0 | 0 |
| Atual sem revisão histórica idêntica | 0 | 0 |
| Revisões pendentes de publicação | 0 | 0 |
| Referências de rodada consultadas no PostgreSQL | 7 | 3 |
| Referências de conteúdo ausentes | 0 | 0 |

Os hashes do conteúdo atual nos dois ambientes são iguais ao manifesto. Datas, número de revisão e outros metadados de publicação não entram nesse hash semântico. A diferença de 527/508 revisões decorre do histórico de correções: local preserva 16 revisões de animais, três de filmes/séries e oito de marcas; o Atlas foi inicialmente carregado com animais/filmes já corrigidos e preserva as oito revisões de marcas. Não há tentativa de apagar essa diferença ou copiar todo o banco local para a nuvem.

Foram validados todos os documentos atuais e históricos, unicidade dos IDs/chaves, sequência de revisões sem lacunas, revisão atual igual à maior revisão publicada e identidade estável entre revisões. As revisões atuais têm cópia histórica integralmente idêntica, incluindo metadados. Hashes de cada histórico completo foram registrados no JSON de conferência para comparação futura; não constituem prova retroativa contra alterações anteriores à primeira captura.

Índices próprios conferidos por nome, campos, unicidade e filtro parcial da revisão inicial: ID e chave da resposta atuais únicos; temática/dificuldade; ID/revisão históricos únicos; chave inicial única somente na revisão 1. Nenhum índice foi criado ou alterado nesta fase.

Também foram lidas somente as referências de conteúdo de `rodadas` no PostgreSQL local e no Neon, em transações explicitamente somente de leitura. Todas as dez referências consultadas apontam para revisões existentes no respectivo MongoDB. Contas, nomes, e-mails, resultados e progresso não foram lidos para essa verificação nem modificados. Os totais refletem o instante da auditoria; novas partidas podem aumentar a contagem de rodadas sem alterar o catálogo.

## Respostas extensas, acentos e sinais

O catálogo contém **125 respostas acentuadas**, duas com algarismos (`1917` e `BEN 10`) e oito sinais distintos além do espaço: `!`, `&`, apóstrofo, vírgula, hífen, ponto, dois-pontos e interrogação. Os sinais continuam fixos; letras e números são preenchidos pelo jogador. Não foi removido acento ou criada resposta alternativa.

| Caso de revisão | Resposta |
| --- | --- |
| Maior expressão, 41 caracteres | BRILHO ETERNO DE UMA MENTE SEM LEMBRANÇAS |
| Expressão com dois-pontos e acentos, 39 caracteres | O SENHOR DOS ANÉIS: A SOCIEDADE DO ANEL |
| Maior nome de animal, 22 caracteres | DRAGÃO-MARINHO-FOLHADO |
| Maior nome de objeto, 22 caracteres | DESCASCADOR DE LEGUMES |
| Maior nome de país, 20 caracteres | REPÚBLICA DOMINICANA |
| Maior nome de marca, 14 caracteres | BANG & OLUFSEN |
| Apóstrofo fixo | MCDONALD'S |
| Acentos combinados em uma expressão | SÃO TOMÉ E PRÍNCIPE |
| Pontuação final | ADEUS, LÊNIN!; QUE HORAS ELA VOLTA? |

Dois novos testes do modelo de entrada montam **todas as 500 respostas nos dois modos: 1.000 montagens verificadas**. Eles usam somente teclas do alfabeto/números aprovados e aplicação explícita de acento quando necessário, com limites por família de vogal no individual e sinais fixos. O texto final deve corresponder exatamente à resposta cadastrada, sem avisos de excesso ou caracteres inacessíveis.

No navegador, o cenário do catálogo foi ampliado de 21 expressões de filmes para **27 casos das cinco temáticas**, incluindo os maiores nomes, apóstrofo e `&`. Executado em computador, tablet e celular emulados: **três cenários aprovados, 81 montagens e envios conferidos**, sem rolagem horizontal. A API é controlada nesses cenários; não foram jogadas 500 partidas reais ou exercitados novos acessos Google.

## Validações e preservação

- **36 testes backend de conteúdo, validação e manifesto aprovados**. Os dois testes do manifesto foram executados primeiro e falharam pela ausência do artefato; após sua geração passaram, vinculando todos os hashes, caminhos, posições, IDs e quotas aos lotes reais.
- **88 testes unitários frontend aprovados**, incluindo as duas provas do catálogo completo; tipos, formatação e compilação aprovados. A auditoria não alterou comportamento de produção, dependências ou esquema de banco.
- Nenhuma gravação foi necessária nos bancos. Não se repetiu a importação apenas para substituir datas ou revisões: o conteúdo já correspondia integralmente aos arquivos. As referências históricas das partidas permanecem válidas.
- Testes automatizados anteriores usaram bases descartáveis e não criaram registros reais nesta fase. Não há conjunto de contas/resultados reais identificado e autorizado para limpeza; nenhuma exclusão foi executada.
- Mensagens do proxy durante encerramento de páginas de teste são descritas na revisão de uso: requisições finais podem chegar sem API de desenvolvimento. As asserções dos três cenários do catálogo passaram.

O roteiro permanece apenas local. A fase 48 ainda deve executar a aceitação final, incluindo os fluxos reais publicados, e a fase 49 deve consolidar a versão entregue e a apresentação. Esta auditoria encerra o catálogo da primeira entrega; não declara essas fases concluídas.
