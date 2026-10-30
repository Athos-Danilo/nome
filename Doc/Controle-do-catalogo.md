# Controle de produção do catálogo — Decifra

**Situação atual:** quatorze lotes produzidos: 350 respostas e 1.750 dicas, todos aprovados na validação automática completa. Onze lotes aprovados pelo responsável e importados localmente: 275 respostas e 1.375 dicas, incluindo países-003 na fase 32. Países-001, objetos-001 e animais-002 permanecem em avaliação humana, sem carga. Nenhum lote foi conferido no Atlas.

Este arquivo acompanha as fases de conteúdo do roteiro da primeira entrega, mantido apenas localmente. O contrato JSON e o pedido reutilizável para IA estão em [Geracao-de-conteudo.md](../Agents/Geracao-de-conteudo.md).

## 1. Meta e forma de contagem

- 500 respostas distintas, organizadas em 20 lotes de 25.
- Cinco dicas por resposta: 125 dicas por lote, 2.500 no total.
- Cinco temáticas principais com 100 respostas cada.
- Por temática: 40 fáceis, 35 médias e 25 difíceis.
- Total de dificuldades: 200 fáceis, 175 médias e 125 difíceis.

Cada resposta conta uma vez na meta global. Associações adicionais a temáticas não criam novos itens. A temática principal de planejamento pode ser controlada pelo lote, sem acrescentar campos ao contrato JSON aprovado.

## 2. Fila de lotes intercalados

Cada linha representa um arquivo futuro em `Data/palavras/`. O número acumulado é uma **meta após aprovação**, não um registro de conteúdo já produzido.

| Fase | Dia de referência | Arquivo | Fácil | Média | Difícil | Total | Meta acumulada | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 03 | 1 | `animais-001.json` | 10 | 10 | 5 | 25 | 25 | Importado localmente |
| 05 | 1 | `filmes-e-series-001.json` | 10 | 10 | 5 | 25 | 50 | Importado localmente |
| 07 | 1 | `marcas-001.json` | 10 | 10 | 5 | 25 | 75 | Importado localmente |
| 09 | 2 | `paises-001.json` | 10 | 10 | 5 | 25 | 100 | Em revisão (avaliação humana pendente) |
| 11 | 2 | `objetos-001.json` | 10 | 10 | 5 | 25 | 125 | Em revisão (avaliação humana pendente) |
| 14 | 2 | `animais-002.json` | 10 | 10 | 5 | 25 | 150 | Em revisão (avaliação humana pendente) |
| 16 | 3 | `filmes-e-series-002.json` | 10 | 10 | 5 | 25 | 175 | Importado localmente |
| 18 | 3 | `marcas-002.json` | 10 | 10 | 5 | 25 | 200 | Importado localmente |
| 21 | 3 | `paises-002.json` | 10 | 10 | 5 | 25 | 225 | Importado localmente |
| 23 | 4 | `objetos-002.json` | 10 | 10 | 5 | 25 | 250 | Importado localmente |
| 25 | 4 | `animais-003.json` | 10 | 10 | 5 | 25 | 275 | Importado localmente |
| 27 | 4 | `filmes-e-series-003.json` | 10 | 10 | 5 | 25 | 300 | Importado localmente |
| 30 | 5 | `marcas-003.json` | 10 | 10 | 5 | 25 | 325 | Importado localmente |
| 32 | 5 | `paises-003.json` | 10 | 10 | 5 | 25 | 350 | Importado localmente |
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
Arquivo: Data/palavras/animais-001.json
Estado: Importado localmente
Data da revisão: 2026-10-26
Responsável pela revisão: Antigravity (IA) com aprovação do responsável
Quantidade gerada: 25
Quantidade aprovada: 25
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: Estrutura JSON válida; 125 dicas conferidas
Duplicatas e substituições: Nenhuma (primeiro lote do catálogo)
Fatos e grafias conferidos: Sim (todas em caixa alta, acentos preservados, fatos biológicos verificados)
Importação local: Concluída em 2026-10-27 no MongoDB decifra; 25 respostas e 125 dicas; reexecução idêntica sem duplicação
Conferência no Atlas: Pendente
Pendências: Conferência no Atlas na fase de publicação
```

Validação completa da fase 12: aprovada por Codex em 2026-10-27; campos, versão, dicas, Unicode, temáticas e duplicatas locais/no banco conferidos. A aprovação editorial anterior foi preservada.

#### Lote filmes-e-series-001 (Fase 05)
```text
Lote: filmes-e-series-001
Fase: 05
Arquivo: Data/palavras/filmes-e-series-001.json
Estado: Importado localmente
Data da revisão: 2026-10-26
Responsável pela revisão: Antigravity (IA) com aprovação do responsável
Quantidade gerada: 25
Quantidade aprovada: 25
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: Estrutura JSON válida; 125 dicas conferidas
Duplicatas e substituições: Nenhuma (conferido contra lote anterior)
Fatos e grafias conferidos: Sim (todas em caixa alta, acentuação e grafias oficiais mantidas, sem pontuações ambíguas)
Importação local: Concluída em 2026-10-27 no MongoDB decifra; 25 respostas e 125 dicas; reexecução idêntica sem duplicação
Conferência no Atlas: Pendente
Pendências: Conferência no Atlas na fase de publicação
```

Validação completa da fase 12: aprovada por Codex em 2026-10-27; campos, versão, dicas, Unicode, temáticas e duplicatas locais/no banco conferidos. A aprovação editorial anterior foi preservada.

#### Lote marcas-001 (Fase 07)
```text
Lote: marcas-001
Fase: 07
Arquivo: Data/palavras/marcas-001.json
Estado: Importado localmente
Data da revisão: 2026-10-26
Responsável pela revisão: Antigravity (IA) com aprovação do responsável
Quantidade gerada: 25
Quantidade aprovada: 25
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: Estrutura JSON válida; 125 dicas conferidas
Duplicatas e substituições: Nenhuma (conferido contra lotes anteriores de animais e filmes/séries)
Fatos e grafias conferidos: Sim (todas em caixa alta, acentos preservados, sem slogans temporários ou pontuações ambíguas)
Importação local: Concluída em 2026-10-27 no MongoDB decifra; 25 respostas e 125 dicas; reexecução idêntica sem duplicação
Conferência no Atlas: Pendente
Pendências: Conferência no Atlas na fase de publicação
```

Validação completa da fase 12: aprovada por Codex em 2026-10-27; campos, versão, dicas, Unicode, temáticas e duplicatas locais/no banco conferidos. A aprovação editorial anterior foi preservada.

#### Lote paises-001 (Fase 09)

```text
Lote: paises-001
Fase: 09
Arquivo: Data/palavras/paises-001.json
Estado: Em revisão (avaliação humana pendente)
Data da revisão: 2026-10-27
Responsável pela revisão: Codex (revisão editorial por IA)
Quantidade gerada: 25
Quantidade aprovada: 0 (sem presumir aprovação humana)
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: JSON válido; campos, Unicode e 125 dicas conferidos
Duplicatas e substituições: Nenhuma entre as 100 respostas do catálogo
Fatos e grafias conferidos: Revisão e fontes em Doc/Revisoes/paises-001.md
Importação local: Não realizada; aguarda aprovação editorial humana
Conferência no Atlas: Pendente
Pendências: Avaliação humana; validação completa do importador aprovada na fase 12
```

#### Lote objetos-001 (Fase 11)

```text
Lote: objetos-001
Fase: 11
Arquivo: Data/palavras/objetos-001.json
Estado: Em revisão (avaliação humana pendente)
Data da revisão: 2026-10-27
Responsável pela revisão: Codex (revisão editorial por IA)
Quantidade gerada: 25
Quantidade aprovada: 0 (sem presumir aprovação humana)
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: JSON, modelo Pydantic, Unicode, campos e 125 dicas conferidos; cinco testes de conteúdo aprovados
Duplicatas e substituições: Nenhuma entre as 125 respostas do catálogo
Fatos e grafias conferidos: Revisão, ambiguidades e fontes em Doc/Revisoes/objetos-001.md
Importação local: Não realizada; aguarda aprovação editorial humana
Conferência no Atlas: Pendente
Pendências: Avaliação humana; validação completa do importador aprovada na fase 12
```

#### Lote animais-002 (Fase 14)

```text
Lote: animais-002
Fase: 14
Arquivo: Data/palavras/animais-002.json
Estado: Em revisão (avaliação humana pendente)
Data da revisão: 2026-10-27
Responsável pela revisão: Codex (revisão editorial por IA)
Quantidade gerada: 25
Quantidade aprovada: 0 (sem presumir aprovação humana)
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: Validador completo aprovado; seis lotes conferidos com o banco sem conflitos ou escrita; 26 testes de conteúdo/validação aprovados
Duplicatas e substituições: Nenhuma entre as 150 respostas; 50 animais distintos na distribuição 20/20/10
Fatos e grafias conferidos: Revisão, fontes e cuidados editoriais em Doc/Revisoes/animais-002.md
Importação local: Não realizada; aguarda aprovação editorial humana
Conferência no Atlas: Pendente
Pendências: Avaliação humana
```

#### Lote filmes-e-series-002 (Fase 16)

```text
Lote: filmes-e-series-002
Fase: 16
Arquivo: Data/palavras/filmes-e-series-002.json
Estado: Importado localmente
Data da revisão: 2026-10-28
Responsável pela revisão: Codex (revisão editorial por IA), com revisão e aprovação expressa do responsável pelo projeto
Quantidade gerada: 25
Quantidade aprovada: 25
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: Validador completo aprovado; sete lotes conferidos com o banco sem conflitos ou escrita; 100 novos, 75 idênticos e zero recuperáveis; 26 testes de conteúdo/validação aprovados
Duplicatas e substituições: Nenhuma entre as 175 respostas; 50 filmes/séries distintos na distribuição 20/20/10
Fatos e grafias conferidos: Fontes, títulos brasileiros e cuidados editoriais em Doc/Revisoes/filmes-e-series-002.md
Importação local: Concluída em 2026-10-28 após aprovação humana; 25 respostas publicadas sem sobrescrita. Conferência posterior reconheceu as 25 como idênticas. Banco com 100 respostas, 500 dicas e 100 revisões.
Conferência no Atlas: Pendente
Pendências: Conferência no Atlas na fase de publicação
```

#### Lote marcas-002 (Fase 18)

```text
Lote: marcas-002
Fase: 18
Arquivo: Data/palavras/marcas-002.json
Estado: Importado localmente
Data da revisão: 2026-10-28
Responsável pela revisão: Codex (produção e revisão editorial por IA), com revisão e aprovação expressa do responsável pelo projeto
Quantidade gerada: 25
Quantidade aprovada: 25
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: Oito lotes validados (200 respostas e 1.000 dicas); conferência com banco sem escrita: 100 novos, 100 idênticos, zero recuperáveis; 26 testes de conteúdo/validação aprovados
Duplicatas e substituições: Nenhuma entre as 200 respostas; 50 marcas distintas, distribuição 20/20/10
Fatos e grafias conferidos: Fontes e cuidados editoriais em Doc/Revisoes/marcas-002.md
Importação local: Concluída em 2026-10-28 após aprovação humana; 25 respostas publicadas sem sobrescrita. Conferência posterior: zero novos, 25 idênticos, zero recuperáveis. Banco com 125 respostas, 625 dicas e 125 revisões.
Conferência no Atlas: Pendente
Pendências: Conferência no Atlas na fase de publicação
```

#### Lote paises-002 (Fase 21)

```text
Lote: paises-002
Fase: 21
Arquivo: Data/palavras/paises-002.json
Estado: Importado localmente
Data da revisão: 2026-10-28
Responsável pela revisão: Codex (produção e revisão editorial por IA), com revisão e aprovação expressa do responsável pelo projeto
Quantidade gerada: 25
Quantidade aprovada: 25
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: Nove lotes validados (225 respostas e 1.125 dicas); conferência com banco sem escrita: 100 novos, 125 idênticos, zero recuperáveis; 26 testes de conteúdo/validação aprovados
Duplicatas e substituições: Nenhuma entre as 225 respostas; 50 países distintos, distribuição 20/20/10 nos arquivos
Fatos e grafias conferidos: Fontes e cuidados editoriais em Doc/Revisoes/paises-002.md
Importação local: Concluída em 2026-10-28 após aprovação humana; 25 respostas publicadas sem sobrescritas. Conferência posterior: zero novos, 25 idênticos, zero recuperáveis. Banco com 150 respostas, 750 dicas e 150 revisões
Conferência no Atlas: Pendente
Pendências: Conferência no Atlas na publicação; paises-001 permanece em revisão humana, independentemente deste lote
```

#### Lote objetos-002 (Fase 23)

```text
Lote: objetos-002
Fase: 23
Arquivo: Data/palavras/objetos-002.json
Estado: Importado localmente
Data da revisão: 2026-10-29
Responsável pela revisão: Codex (produção e revisão editorial por IA), com revisão e aprovação expressa do responsável pelo projeto
Quantidade gerada: 25
Quantidade aprovada: 25
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: Dez lotes validados (250 respostas e 1.250 dicas); conferência com banco sem escrita: 100 novos, 150 idênticos, zero recuperáveis; 26 testes de conteúdo/validação aprovados
Duplicatas e substituições: Nenhuma entre as 250 respostas; 50 objetos distintos, distribuição 20/20/10 nos arquivos
Fatos e grafias conferidos: Fontes, sinônimos e cuidados editoriais em Doc/Revisoes/objetos-002.md
Importação local: Concluída em 2026-10-29 após aprovação humana; 25 respostas publicadas sem sobrescritas. Conferência posterior: zero novos, 25 idênticos, zero recuperáveis. Banco com 175 respostas, 875 dicas e 175 revisões
Conferência no Atlas: Pendente
Pendências: Conferência no Atlas na publicação; objetos-001 continua pendente de aprovação separada
```

#### Lote animais-003 (Fase 25)
```text
Lote: animais-003
Fase: 25
Arquivo: Data/palavras/animais-003.json
Estado: Importado localmente
Data da revisão: 2026-10-29
Responsável pela revisão: Codex (revisão editorial por IA), com revisão e aprovação expressa do responsável pelo projeto
Quantidade gerada: 25 respostas e 125 dicas
Quantidade aprovada: 25
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: catálogo completo válido, 275 respostas e 1.375 dicas; 100 novos, 175 idênticos, zero recuperáveis
Duplicatas e substituições: nenhuma duplicata; lista consolidada atualizada
Fatos e grafias conferidos: fontes e ressalvas em Doc/Revisoes/animais-003.md
Importação local: concluída em 2026-10-29 após aprovação humana; 25 respostas publicadas sem sobrescritas. Conferência posterior: zero novos, 25 idênticos e zero recuperáveis. Banco com 200 respostas, 1.000 dicas e 200 versões
Conferência no Atlas: não realizada
Pendências: conferência no Atlas na publicação; animais-002 continua pendente separadamente
```

#### Lote filmes-e-series-003 (Fase 27)

```text
Lote: filmes-e-series-003
Fase: 27
Arquivo: Data/palavras/filmes-e-series-003.json
Estado: Importado localmente
Data da revisão: 2026-10-29
Responsável pela revisão: Codex (produção e revisão editorial por IA), com revisão e aprovação expressa do responsável pelo projeto
Quantidade gerada: 25 respostas e 125 dicas
Quantidade aprovada: 25
Fáceis / médias / difíceis: 10 / 10 / 5
Resultado da conferência sem gravar: doze lotes válidos, 300 respostas e 1.500 dicas; 100 novos, 200 idênticos, zero recuperáveis
Duplicatas e substituições: nenhuma duplicata entre os doze lotes; MADAGASCAR não foi usado como filme porque já existe como país
Fatos e grafias conferidos: fontes, subtítulos e distinção de versões em Doc/Revisoes/filmes-e-series-003.md
Importação local: concluída em 2026-10-29 após aprovação humana; 25 respostas publicadas sem sobrescritas. Conferência posterior: zero novos, 25 idênticos e zero recuperáveis. Banco com 225 respostas, 1.125 dicas e 225 versões
Conferência no Atlas: não realizada
Pendências: conferência no Atlas na publicação; países-001, objetos-001 e animais-002 continuam pendentes separadamente
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
| Animais | 100 | 75 | 50 | 50 | 0 |
| Filmes e séries | 100 | 75 | 75 | 75 | 0 |
| Marcas | 100 | 75 | 75 | 75 | 0 |
| Países | 100 | 75 | 50 | 50 | 0 |
| Objetos | 100 | 50 | 25 | 25 | 0 |
| **Total** | **500** | **350** | **275** | **275** | **0** |

## 6. Fechamento global

A fase 47 do roteiro só termina com 500 respostas únicas aprovadas, 2.500 dicas e distribuição correta nos arquivos e no banco de destino. Validar duplicatas globalmente, não apenas dentro de cada temática.

Se houver reprovação, substituir o conteúdo e repetir as conferências afetadas. Não mudar a distribuição, aceitar uma resposta repetida ou reduzir a meta sem decisão do responsável pelo projeto.

## 7. Verificação da fase 12

Em 2026-10-27, os cinco lotes passaram pelo importador completo na operação validar, sem correções estruturais necessárias. Os três primeiros foram conferidos e importados; a segunda importação reconheceu os 75 documentos como idênticos e publicou zero novos. Há 75 documentos atuais e 75 revisões iniciais. Países e objetos passaram na validação automática, mas ainda exigem avaliação humana para alcançar o estado Aprovado. Evidências e comandos em [Importacao-catalogo.md](Importacao-catalogo.md).

## 8. Conclusão da fase 30

Lote [marcas-003](../Data/palavras/marcas-003.json): 25 respostas novas e 125 dicas, distribuição 10/10/5. Validação completa de treze lotes: 325 respostas e 1.625 dicas; conferência sem escrita do novo lote: 25 novos, zero idênticos e zero recuperáveis. Banco preservado em 225 respostas, 1.125 dicas e 225 revisões. A lista de exclusão contém também estes itens em revisão. Fontes, grafias e critérios editoriais em [Revisoes/marcas-003.md](Revisoes/marcas-003.md). Após aprovação expressa do responsável em 2026-10-30, importado somente marcas-003: 25 respostas publicadas sem sobrescritas. Conferência posterior: zero novos, 25 idênticos e zero recuperáveis. Banco final: 250 respostas, 1.250 dicas e 250 revisões; marcas tem 75 respostas, distribuição 30/30/15. Os outros três lotes pendentes continuam sem carga; Atlas não acessado.

## 9. Conclusão da fase 32

Lote [paises-003](../Data/palavras/paises-003.json): 25 países novos e 125 dicas, distribuição 10/10/5. Quatorze lotes passaram na validação automática: 350 respostas e 1.750 dicas. A conferência sem escrita do novo lote reconheceu 25 novos, zero idênticos e zero recuperáveis. Banco preservado em 250 respostas, 1.250 dicas e 250 revisões. Fontes, cuidados de grafia, critérios editoriais e 25 candidatos para o último lote de países em [Revisoes/paises-003.md](Revisoes/paises-003.md). Após aprovação expressa do responsável em 2026-10-30, importado somente países-003: 25 respostas publicadas sem sobrescritas. Conferência posterior: zero novos, 25 idênticos e zero recuperáveis. Banco final: 275 respostas, 1.375 dicas e 275 revisões. Países possui 50 respostas importadas, distribuição 20/20/10; o lote 001 continua pendente de revisão. Os candidatos futuros não contam como conteúdo produzido. Atlas não acessado.
