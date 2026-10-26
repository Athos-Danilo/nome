# Guia para geração de palavras e dicas com IA

## Objetivo e situação

Preparar um catálogo em português com pelo menos 500 respostas para o jogo descrito em `Doc/Detalhes.md`. Cada resposta terá exatamente cinco dicas e será armazenada no MongoDB.

O contrato JSON e os lotes de 25 respostas deste guia foram aprovados pelo responsável pelo projeto. O importador ainda será implementado. Recomendações editoriais e de implementação são identificadas separadamente e não adicionam novas regras ao jogo.

A pasta `Agents/` tem exceções no `.gitignore` para versionar este guia e `Regras.md`. A pasta adotada para os arquivos de conteúdo é `Data/palavras/`.

## Regras do conteúdo

- Escrever em português do Brasil, com ortografia e acentuação corretas.
- Escrever o campo `resposta` em CAIXA ALTA, preservando acentos e cedilhas. Dicas continuam com capitalização normal de frases.
- Usar palavras ou expressões que representem uma unidade reconhecível, como um título de filme.
- Associar cada resposta a uma ou mais temáticas.
- Classificar a resposta como `facil`, `medio` ou `dificil`.
- Criar exatamente cinco dicas textuais em ordem fixa.
- Não cadastrar sinônimos ou títulos alternativos como respostas aceitas.
- Não presumir regras para o modo com a galera: seu conteúdo depende das definições futuras desse modo.

## Qualidade das dicas

1. Primeira dica: contexto amplo, correto e útil, sem entregar imediatamente a resposta.
2. Segunda dica: característica que começa a reduzir as possibilidades.
3. Terceira dica: característica mais específica.
4. Quarta dica: informação bastante distintiva.
5. Quinta dica: informação muito esclarecedora, mantendo a tarefa de descobrir a resposta.

As dicas devem ser coerentes entre si e ajudar a identificar a mesma resposta. Evitar:

- Incluir a resposta, tradução direta ou um derivado que a revele explicitamente.
- Repetir a mesma informação com outras palavras.
- Afirmações falsas, absolutas sem fundamento ou características compartilhadas por tantas respostas que a última dica permaneça ambígua.
- Fatos muito sujeitos a mudança, como “atual campeão”, “mais recente” ou “maior do mundo”, sem contexto verificável.
- Dependência de outra rodada ou de uma ordem de jogo específica.
- Copiar descrições ou dicas de outros jogos e fontes.

Uma palavra fácil não deve se tornar difícil apenas por ter dicas artificialmente obscuras. A dificuldade deve considerar a familiaridade da resposta e o conjunto das pistas. A avaliação humana continuará necessária.

## Formato aprovado: JSON em UTF-8

Cada arquivo conterá um objeto com versão de formato, identificação do lote e uma lista de respostas. Não adicionar comentários dentro do JSON, vírgulas finais ou texto explicativo fora dele nos arquivos de dados.

```json
{
  "versao_formato": 1,
  "lote": "animais-001",
  "palavras": [
    {
      "id": "girafa",
      "resposta": "GIRAFA",
      "tematicas": ["animais"],
      "dificuldade": "facil",
      "dicas": [
        "Sou um mamífero herbívoro.",
        "Vivo em regiões da África.",
        "Minha pelagem tem manchas.",
        "Minha altura me ajuda a alcançar folhas em árvores.",
        "Sou conhecida pelo pescoço muito comprido."
      ]
    }
  ]
}
```

### Campos

| Campo | Regra |
| --- | --- |
| `versao_formato` | Inteiro; inicialmente 1 |
| `lote` | Identificador único do lote |
| `palavras` | Lista não vazia de objetos de resposta |
| `id` | Identificador estável e único no catálogo; não é o `_id` gerado pelo MongoDB |
| `resposta` | Texto de exibição em caixa alta, preservando espaços, acentos e cedilhas |
| `tematicas` | Lista não vazia de identificadores de temáticas, sem duplicatas |
| `dificuldade` | Somente `facil`, `medio` ou `dificil` |
| `dicas` | Lista com exatamente cinco textos não vazios, na ordem de revelação |

Proposta para identificadores: letras minúsculas sem acentos, números quando necessários e hífen entre palavras, como `star-wars`. Não inventar outra grafia da mesma resposta para contornar uma duplicata. Em casos de homônimos, sinalizar a ambiguidade para revisão antes de definir identificadores diferentes.

A normalização para detectar duplicatas na importação é uma decisão separada da comparação dos palpites. No jogo, os palpites serão convertidos para caixa alta, preservando acentos, e a acentuação correta será obrigatória: `JAPAO` não corresponde a `JAPÃO`. Não criar versões sem acentos da mesma resposta como itens adicionais.

No modo com a galera, escolher uma vogal isolada revela também as variantes acentuadas dela. Isso não altera o conteúdo: armazenar e exibir sempre a grafia correta. A equivalência para escolha de letras não autoriza remover acentos dos palpites completos.

## Temáticas

Identificadores iniciais propostos:

- `animais`
- `filmes-e-series`
- `marcas`
- `paises`
- `objetos`

A temática `marcas` abrange, por exemplo, carros, tecnologia e bebidas. A temática `filmes-e-series` abrange títulos dos dois tipos de produção.

Novas temáticas devem ser combinadas antes de gerar o lote, evitando categorias equivalentes com nomes diferentes. Uma resposta com várias temáticas deve existir uma única vez no catálogo, com todas as associações na mesma lista.

## Organização dos lotes

- Trabalhar com lotes de 25 respostas para facilitar revisão.
- Nomear os arquivos por temática e sequência, como `animais-001.json`.
- Usar lotes mistos quando fizer sentido, com prefixo `misto`.
- Manter uma lista consolidada de respostas e identificadores já produzidos.
- Fornecer essa lista à IA antes de pedir um novo lote. Não depender da memória de conversas anteriores.
- Revisar cada lote antes de gerar ou aprovar o próximo.
- Contar respostas únicas, não a soma de associações a temáticas.

Vinte lotes de 25 respostas atingem 500 respostas únicas. A distribuição aprovada é de 100 respostas por temática: **40 fáceis, 35 médias e 25 difíceis**. No total, serão 200 fáceis, 175 médias, 125 difíceis e 2.500 dicas.

A ordem intercalada de produção, as fases correspondentes e os totais reais estão em [Controle-do-catalogo.md](../Doc/Controle-do-catalogo.md). O roteiro detalhado de acompanhamento é mantido apenas localmente e reserva momentos para produzir cada lote antes da validação final.

Para cada temática, uma proposta de divisão em quatro lotes é:

| Lote | Fácil | Médio | Difícil | Total |
| --- | --- | --- | --- | --- |
| 001 | 10 | 10 | 5 | 25 |
| 002 | 10 | 10 | 5 | 25 |
| 003 | 10 | 10 | 5 | 25 |
| 004 | 10 | 5 | 10 | 25 |
| Total | 40 | 35 | 25 | 100 |

Cada resposta contará para uma temática principal de planejamento. Associações adicionais não substituem a necessidade de gerar 500 respostas distintas. Em especial, a seleção de 25 países difíceis deverá ser revisada para garantir respostas reconhecidas e pistas factualmente corretas, sem forçar classificações duvidosas.

## Validação antes da importação

O futuro processo de importação deverá verificar:

1. JSON válido e versão de formato reconhecida.
2. Campos obrigatórios e tipos corretos.
3. Exatamente cinco dicas não vazias por resposta.
4. Dificuldade pertencente aos três valores previstos.
5. Temáticas reconhecidas, sem duplicatas no mesmo item.
6. Ausência de identificadores e respostas duplicados no lote e no catálogo existente.
7. Textos sem espaços indevidos nas extremidades.
8. Relatório de erros com arquivo e item para correção antes da carga.

A revisão humana deverá verificar a correção dos fatos, a clareza, a progressão das dicas e a adequação da dificuldade. Validação automática sozinha não comprova esses critérios.

Proposta de segurança da importação: oferecer conferência sem gravar, recusar conflitos e não sobrescrever silenciosamente respostas existentes. A política final de carga ainda será definida na implementação.

## Pedido reutilizável para uma IA

Adapte a quantidade, as temáticas, as dificuldades e o identificador do lote antes de usar:

> Leia este guia e gere um lote de 25 respostas inéditas em português do Brasil para o nosso jogo. Use a temática e a distribuição de dificuldades que eu informar. Cada resposta deve ter cinco dicas progressivas, corretas e originais. Entregue somente JSON válido no formato do guia. Escreva o campo resposta em CAIXA ALTA, preservando acentos e cedilhas; use capitalização normal nas dicas e identificadores estáveis sem acentos. Não repita respostas da lista de exclusão fornecida, mesmo que estejam associadas a outra temática. Não use nomes alternativos para disfarçar duplicatas. Se não conseguir gerar a quantidade solicitada com qualidade, informe a limitação antes de produzir o arquivo. Não presuma fatos sem segurança; sinalize dúvidas para revisão antes de gerar a versão final.

Junto ao pedido, informar:

- Identificador do lote.
- Quantidade de respostas.
- Temáticas permitidas.
- Quantidade por dificuldade.
- Lista consolidada de respostas e identificadores existentes.

## Pontos a confirmar

- Critérios mais objetivos para classificar dificuldade.
- Necessidades de conteúdo específicas do modo com a galera.
