# Controle de produção do catálogo — Decifra

**Situação inicial:** nenhum lote deste planejamento foi gerado, revisado ou importado.

Este arquivo acompanha as fases de conteúdo do roteiro da primeira entrega, mantido apenas localmente. O contrato JSON e o pedido reutilizável para IA estão em [Geracao-de-conteudo.md](../Agents/Geracao-de-conteudo.md).

## 1. Meta e forma de contagem

- 500 respostas distintas, organizadas em 20 lotes de 25.
- Cinco dicas por resposta: 125 dicas por lote, 2.500 no total.
- Cinco temáticas principais com 100 respostas cada.
- Por temática: 40 fáceis, 35 médias e 25 difíceis.
- Total de dificuldades: 200 fáceis, 175 médias e 125 difíceis.

Cada resposta conta uma vez na meta global. Associações adicionais a temáticas não criam novos itens. A temática principal de planejamento pode ser controlada pelo lote, sem acrescentar campos ao contrato JSON aprovado.

## 2. Fila de lotes intercalados

Cada linha representa um arquivo futuro em `dados/palavras/`. O número acumulado é uma **meta após aprovação**, não um registro de conteúdo já produzido.

| Fase | Dia de referência | Arquivo | Fácil | Média | Difícil | Total | Meta acumulada | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 03 | 1 | `animais-001.json` | 10 | 10 | 5 | 25 | 25 | Aguardando validação automática |
| 05 | 1 | `filmes-e-series-001.json` | 10 | 10 | 5 | 25 | 50 | Não iniciado |
| 07 | 1 | `marcas-001.json` | 10 | 10 | 5 | 25 | 75 | Não iniciado |
| 09 | 2 | `paises-001.json` | 10 | 10 | 5 | 25 | 100 | Não iniciado |
| 11 | 2 | `objetos-001.json` | 10 | 10 | 5 | 25 | 125 | Não iniciado |
| 14 | 2 | `animais-002.json` | 10 | 10 | 5 | 25 | 150 | Não iniciado |
| 16 | 3 | `filmes-e-series-002.json` | 10 | 10 | 5 | 25 | 175 | Não iniciado |
| 18 | 3 | `marcas-002.json` | 10 | 10 | 5 | 25 | 200 | Não iniciado |
| 21 | 3 | `paises-002.json` | 10 | 10 | 5 | 25 | 225 | Não iniciado |
| 23 | 4 | `objetos-002.json` | 10 | 10 | 5 | 25 | 250 | Não iniciado |
| 25 | 4 | `animais-003.json` | 10 | 10 | 5 | 25 | 275 | Não iniciado |
| 27 | 4 | `filmes-e-series-003.json` | 10 | 10 | 5 | 25 | 300 | Não iniciado |
| 30 | 5 | `marcas-003.json` | 10 | 10 | 5 | 25 | 325 | Não iniciado |
| 32 | 5 | `paises-003.json` | 10 | 10 | 5 | 25 | 350 | Não iniciado |
| 35 | 5 | `objetos-003.json` | 10 | 10 | 5 | 25 | 375 | Não iniciado |
| 37 | 6 | `animais-004.json` | 10 | 5 | 10 | 25 | 400 | Não iniciado |
| 39 | 6 | `filmes-e-series-004.json` | 10 | 5 | 10 | 25 | 425 | Não iniciado |
| 42 | 6 | `marcas-004.json` | 10 | 5 | 10 | 25 | 450 | Não iniciado |
| 44 | 7 | `paises-004.json` | 10 | 5 | 10 | 25 | 475 | Não iniciado |
| 46 | 7 | `objetos-004.json` | 10 | 5 | 10 | 25 | 500 | Não iniciado |

## 3. Estados possíveis

| Estado | Significado |
| --- | --- |
| Não iniciado | Nenhum arquivo foi produzido |
| Em geração | A lista e as dicas estão sendo preparadas |
| Em revisão | Arquivo gerado; conteúdo e estrutura ainda não aprovados |
| Aguardando validação automática | Revisão editorial pronta; importador ainda não executado ou não disponível |
| Aprovado | Conteúdo e estrutura revisados, pronto para importar |
| Correção necessária | Há item ou arquivo reprovado; não conta como lote concluído |
| Importado localmente | Aprovado e carregado no MongoDB de desenvolvimento |
| Conferido no Atlas | Aprovado, carregado e conferido no ambiente de destino |

Não confundir estado de produção com exposição ao jogador: um registro pode estar importado e ainda não ter sido exibido em nenhuma partida.

## 4. Conferência de cada lote

Modelo da ficha para registro ou acompanhamento próprio:

```text
Lote:
Fase:
Arquivo:
Estado:
Data da revisão:
Responsável pela revisão:
Quantidade gerada:
Quantidade aprovada:
Fáceis / médias / difíceis:
Resultado da conferência sem gravar:
Duplicatas e substituições:
Fatos e grafias conferidos:
Importação local:
Conferência no Atlas:
Pendências:
```

### Registros de conferência

#### Lote animais-001 (Fase 03)
```text
Lote: animais-001
Fase: 03
Arquivo: dados/palavras/animais-001.json
Estado: Aguardando validação automática
Data da revisão: 2026-10-26
Responsável pela revisão: Antigravity (IA) com aprovação do responsável
Quantidade gerada: 25
Quantidade aprovada: 25
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: Estrutura JSON válida; 125 dicas conferidas
Duplicatas e substituições: Nenhuma (primeiro lote do catálogo)
Fatos e grafias conferidos: Sim (todas em caixa alta, acentos preservados, fatos biológicos verificados)
Importação local: Pendente (importador será desenvolvido na fase 12)
Conferência no Atlas: Pendente
Pendências: Nenhuma
```

Checklist de aprovação:

- [ ] Exatamente 25 respostas inéditas em relação ao restante do catálogo.
- [ ] Distribuição de dificuldade corresponde à linha da tabela.
- [ ] Cinco dicas textuais por resposta, totalizando 125 dicas.
- [ ] Respostas em caixa alta, com acentos e cedilhas corretos.
- [ ] Identificadores estáveis, temáticas válidas e JSON compatível com o guia.
- [ ] Sem títulos alternativos ou grafias usadas para disfarçar duplicatas.
- [ ] Pistas corretas, originais e progressivas, sem revelar a resposta explicitamente.
- [ ] Casos especiais de sinais e nomes resolvidos antes de aprovar.
- [ ] Validação automática executada, quando o importador estiver disponível.
- [ ] Lista consolidada de exclusão atualizada para o próximo lote.

## 5. Resumo real de produção

Atualizar esta tabela a partir de evidências. Não preencher com os totais previstos no cronograma.

| Temática | Meta de respostas | Geradas | Aprovadas | Importadas localmente | Conferidas no Atlas |
| --- | --- | --- | --- | --- | --- |
| Animais | 100 | 25 | 25 | 0 | 0 |
| Filmes e séries | 100 | 0 | 0 | 0 | 0 |
| Marcas | 100 | 0 | 0 | 0 | 0 |
| Países | 100 | 0 | 0 | 0 | 0 |
| Objetos | 100 | 0 | 0 | 0 | 0 |
| **Total** | **500** | **25** | **25** | **0** | **0** |

## 6. Fechamento global

A fase 47 do roteiro só termina com 500 respostas únicas aprovadas, 2.500 dicas e distribuição correta nos arquivos e no banco de destino. Validar duplicatas globalmente, não apenas dentro de cada temática.

Se houver reprovação, substituir o conteúdo e repetir as conferências afetadas. Não mudar a distribuição, aceitar uma resposta repetida ou reduzir a meta sem decisão do responsável pelo projeto.
