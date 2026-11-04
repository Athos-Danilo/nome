# Objetos: lote 004 e revisão final — fase 46

**Data de produção:** 02/11/2026. **Conclusão da fase 46:** 04/11/2026. Lotes 001 e 004 aprovados pelo responsável e importados nos dois ambientes; pendência de acesso ao Atlas resolvida após liberação do IP atual. O relato datado de 02/11 abaixo preserva o estado anterior à retomada; a conferência final está no fechamento ao fim deste documento.

## Conteúdo

[objetos-004.json](../../Data/palavras/objetos-004.json) contém 25 respostas e 125 dicas.

| Dificuldade | Respostas |
| --- | --- |
| Fácil — 10 | TELEVISOR; CELULAR; COMPUTADOR; MESA; PORTA; JANELA; BONÉ; CHAPÉU; CINTO; BALDE |
| Médio — 5 | ESCUMADEIRA; DESCASCADOR DE LEGUMES; NÍVEL DE BOLHA; TRENA; COMPASSO |
| Difícil — 10 | TORQUÍMETRO; ODÔMETRO; TACÔMETRO; GALVANÔMETRO; OSCILOSCÓPIO; REFRATÔMETRO; DENSÍMETRO; GONIÔMETRO; PANTÓGRAFO; MORSA |

Classificação por familiaridade estimada e capacidade de identificação pelas pistas; não é resultado de pesquisa com jogadores. TORQUÍMETRO controla torque de aperto; TACÔMETRO mede rotação e ODÔMETRO acumula distância. GALVANÔMETRO detecta corrente, enquanto OSCILOSCÓPIO permite observar sua entrada elétrica como gráfico, usualmente tensão no tempo. REFRATÔMETRO usa índice de refração, não mede densidade diretamente; DENSÍMETRO tem essa outra função. As unidades e características de versões específicas foram qualificadas nas pistas.

MORSA é explicitamente a ferramenta de oficina. PANTÓGRAFO se refere à versão de desenho, não ao coletor de energia ferroviário. COMPASSO é o instrumento de desenho, distinto da bússola. BONÉ é identificado pela pala frontal e CHAPÉU pela versão com aba ao redor. TELEVISOR nomeia o aparelho; não foram cadastrados televisão, TV ou outros sinônimos como respostas alternativas. A política já aprovada continua aceitando somente a resposta cadastrada, com acentos. Dicas são redação própria e não instruções de operação de equipamentos.

## Revisão dos anteriores

Foram lidos os 75 objetos e suas 375 dicas nos lotes 001 a 003, com atenção às versões náuticas de astrolábio/sextante, bicos do paquímetro, fuso do micrômetro e instrumentos meteorológicos. Não foi identificada correção necessária nesta revisão. Isso não certifica exaustivamente toda característica de qualquer modelo comercial. Nenhuma dica, identidade ou dificuldade anterior foi modificada.

[objetos-001.json](../../Data/palavras/objetos-001.json) e o novo 004 receberam aprovação humana expressa em 02/11/2026, incluindo importação local agora e no Atlas na retomada. Ambos foram importados localmente, completando 100 objetos. Os lotes 002 e 003 já estavam importados. Nenhuma alteração editorial foi necessária no 001.

## Referências de conferência técnica

- [Tramontina — torquímetro, grandezas e unidades](https://assets.tramontina.com.br/upload/tramon/imagens/GAR/44502301MIP002.pdf).
- [Ford — painel, distância acumulada e rotação](https://www.fordservicecontent.com/Ford_Content/Catalog/owner_information/2015-B562-Brazil-ptBRA.pdf).
- [Minipa — tacômetro foto/contato](https://www.minipa.com.br/images/Manual/MDT-2238B-1100-BR-EN-ES.pdf).
- [UFRGS — instrumentos elétricos e práticas de laboratório](https://www.if.ufrgs.br/fis182/Livro_AGOSTO2014.pdf).
- [Anton Paar — refratometria e índice de refração](https://www.anton-paar.com/br-pt/sobre-nos/noticias/noticias/detalhe/consumertec-apresenta-o-smartref/) e [densímetro flutuante](https://www.anton-paar.com/br-pt/densimetros-para-oleo-diesel-medicao-precisa-da-densidade-do-combustivel/).
- [Starrett — instrumentos para ângulos](https://starrett.com.br/instrumentos-de-medicao/transferidores-e-medidores-de-angulos/goniometro).
- [USP — pantógrafo e conceitos geométricos](https://teses.usp.br/teses/disponiveis/45/45135/tde-19062020-171924/pt-br.html).

Fontes utilizadas para função e distinções dos instrumentos; não há recomendação de compra, reprodução de anúncio, prescrição clínica ou instrução de uso perigoso. Funções dos objetos cotidianos foram revisadas editorialmente; não se afirma inspeção de cada modelo ou embalagem.

## Verificações realizadas

- Importador aprovou **20 lotes, 500 respostas e 2.500 dicas** nos arquivos de produção.
- Conferência global: **500 IDs e 500 respostas normalizadas distintos**; distribuição **200 fáceis, 175 médias e 125 difíceis**.
- Cada temática tem **100 respostas, 500 dicas e distribuição 40/35/25**.
- Novo lote com cinco pistas diferentes por item e nenhuma resposta completa nas próprias dicas, ignorando caixa e acentos.
- **34 testes existentes de conteúdo e validação aprovados.** Produção editorial não adiciona comportamento executável e não exige um novo ciclo TDD artificial.
- Antes da carga, conferência local de objetos-001 e objetos-004: **50 novos, zero idênticos, zero recuperáveis**, sem gravar. Após aprovação, os 50 registros foram importados.
- Conferência integral após a carga: **500 idênticos, zero novos e zero recuperáveis**. Banco local com **500 respostas, 2.500 dicas e 527 revisões**; cada temática com 100 respostas e quotas 40/35/25.
- Não houve nova tentativa no Atlas, conforme adiamento solicitado. Sem nova prova de navegador, código de jogo, dependência, alteração de regra ou migração PostgreSQL.

## Pendências e números reais

Após a aprovação expressa e a carga dos dois lotes de objetos, o banco local atingiu **500 respostas/2.500 dicas e 527 revisões**. Todos os vinte lotes estão aprovados pelo responsável. Atlas mantém a última conferência de **400 respostas/2.000 dicas e 408 revisões**; países-001/004 e objetos-001/004 estão aprovados e aguardam apenas a carga remota. Não houve nova tentativa de conexão ao Atlas durante o adiamento. A meta local foi atingida; a publicação integral ainda está pendente.

Na quarta-feira, antes das demais fases: resolver a conexão Atlas; conferir o estado remoto; importar somente os países e objetos aprovados ainda ausentes; comparar todos os arquivos e revisões; então fechar as pendências das fases 44 e 46 e prosseguir para a auditoria final da fase 47.

## Fechamento no Atlas — 04/11/2026

Conferência anterior à carga global: 400 registros idênticos e 100 novos, sem conflitos ou recuperáveis. Os quatro lotes aprovados de países e objetos foram importados juntos: **100 publicados sem sobrescritas**. Conferência integral posterior: **500 idênticos, zero novos e zero recuperáveis**, com revisões imutáveis consistentes. Atlas com **500 respostas, 2.500 dicas e 508 revisões**; cada temática tem **100 respostas/500 dicas, com 40 fáceis, 35 médias e 25 difíceis**. As 508 revisões remotas e 527 locais refletem históricos distintos de correções; não houve cópia ou substituição desse histórico. Nenhuma credencial foi alterada e a verificação TLS permaneceu habilitada. Fases 44 e 46 concluídas; a auditoria final da fase 47 não foi antecipada.

Verificação da retomada: **34 testes existentes de conteúdo e validação aprovados em 04/11/2026** (0,59 s). A primeira execução com restrições de processos foi interrompida sem resultado; execução com processos auxiliares permitidos passou integralmente. Saúde pública pela Vercel em `/api/saude`: HTTP 200, situação `disponivel`. Sem novo teste de login ou partida nesta carga editorial, nem alteração de comportamento executável.
