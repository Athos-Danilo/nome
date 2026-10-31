# Revisão do lote animais 002

**Data:** 2026-10-27. **Responsável:** Codex, revisão editorial por IA, pesquisa de fatos e validação completa pelo importador. Aprovação resolvida e importação concluída na fase 37, em 2026-10-30; o restante do relatório preserva o registro da preparação de 2026-10-27.

## Seleção

25 respostas inéditas em relação aos cinco lotes anteriores, incluindo os 25 animais de `animais-001.json`. Foram acrescentados animais domésticos, insetos, aracnídeos, crustáceos, cefalópodes, aves brasileiras e mamíferos marinhos. Não foram criadas variantes de animais já registrados, como outro nome para o axolote ou para a equidna.

| Dificuldade | Respostas |
| --- | --- |
| Fácil — 10 | CACHORRO, GATO, CAVALO, VACA, COELHO, PORCO, GALINHA, PATO, BORBOLETA, ABELHA |
| Médio — 10 | POLVO, ARRAIA, TUCANO, CAPIVARA, TAMANDUÁ, ESCORPIÃO, CARANGUEJO, MORCEGO, TARTARUGA, FLAMINGO |
| Difícil — 5 | NARVAL, DUGONGO, CASUAR, NÁUTILO, TARDÍGRADO |

A dificuldade considera familiaridade esperada e progressão das pistas. Animais comuns podem ser reconhecidos cedo; nos difíceis, pistas adicionais apresentam anatomia e ambiente mais distintivos. A classificação ainda pode ser refinada após avaliação humana, respeitando a distribuição planejada.

## Cuidados editoriais

- **CACHORRO e COELHO:** as últimas dicas acrescentam tamanho/inicial para distinguir nomes próximos, como cão e lebre. Não aceitar esses nomes como respostas alternativas nem cadastrar cão como outro animal em lotes futuros.
- **VACA:** identificação como fêmea bovina adulta, evitando chamá-la de fêmea de um macho castrado.
- **ABELHA:** produção de mel, favos e organização em colônias são qualificadas; não se afirma que toda espécie viva em colmeia ou produza mel armazenado dessa maneira.
- **BORBOLETA:** asas com escamas e fase de pupa descritas sem afirmar que todas são diurnas ou têm cores vivas; a última dica usa “frequentemente” e “costuma”.
- **ARRAIA:** ferrão atribuído somente a algumas espécies. Não cadastrar raia como outro animal sob nome alternativo. Tubarão é um animal distinto, embora ambos tenham esqueleto cartilaginoso.
- **TUCANO:** o grande bico alaranjado com mancha é atribuído à espécie toco, não a todas as espécies do grupo.
- **TAMANDUÁ:** focinho, ausência de dentes e alimentação especializada, sem generalizar a cauda da espécie bandeira.
- **CARANGUEJO:** dez patas incluem o par equipado com pinças. Deslocamento lateral não é descrito como universal. O tamanho da resposta ajuda a distinguir o nome solicitado de siri; não usar esses termos como duplicatas disfarçadas de um mesmo animal.
- **MORCEGO:** voo ativo diferenciado de planeio; não se afirma que todas as espécies bebam sangue, vivam em cavernas ou sejam cegas.
- **TARTARUGA:** as últimas pistas delimitam espécies marinhas. Não afirmar que todas retraem a cabeça ou que podem abandonar o casco. Jabuti e cágado não são cadastrados como simples grafias alternativas.
- **NARVAL:** a presa é um dente, não um chifre; sua ocorrência é qualificada como majoritária nos machos.
- **DUGONGO:** diferenciado do peixe-boi pela cauda bifurcada e pelo ambiente marinho; ervas marinhas não são chamadas de algas.
- **CASUAR:** carúnculas e coloração final atribuídas à espécie do sul. Nenhuma função exclusiva ou ainda debatida do capacete foi adotada como fato.
- **NÁUTILO:** referência a um animal atual de concha com câmaras, sem afirmar que a espécie permaneceu inalterada por milhões de anos. Não confundir com amonites extintos.
- **TARDÍGRADO:** resistência à dessecação qualificada para algumas espécies, sem chamar o animal de imortal ou invulnerável. O apelido urso-d'água aparece somente como dica, não como outra resposta aceita.

As dicas foram redigidas para o Decifra. Nenhuma descrição foi copiada das fontes; a progressão deve ser avaliada também durante partidas reais.

## Referências consultadas

| Conferência | Fonte |
| --- | --- |
| NARVAL: presa como dente e contexto ártico | [WWF — Narwhal](https://www.worldwildlife.org/species/whale/narwhal/) e [NOAA — recursos da espécie](https://www.fisheries.noaa.gov/species/narwhal/resources) |
| DUGONGO: morfologia, cauda, focinho e ambiente | [Australian Museum — Dugong](https://australian.museum/learn/animals/mammals/dugong/) e [Reef Authority — Dugong](https://www.gbrmpa.gov.au/learn/animals/dugong) |
| CASUAR: capacete, plumagem e pescoço da espécie do sul | [Australian Museum — Southern Cassowary](https://australian.museum/learn/animals/birds/southern-cassowary/) |
| NÁUTILO: concha externa e câmaras | [Monterey Bay Aquarium — Chambered nautilus](https://www.montereybayaquarium.org/animals-the-ocean/animals-a-to-z/chambered-nautilus) |
| TARDÍGRADO: corpo, oito pernas e resistência à dessecação | [Bohart Museum / UC Davis](https://bohart.ucdavis.edu/tardigradewater-bear) e [Arizona State University — anatomia](https://askabiologist.asu.edu/tardigrade-anatomy) |
| CAPIVARA: maior roedor vivente e contexto brasileiro | [Prefeitura de São Paulo — fauna da cidade](https://prefeitura.sp.gov.br/web/meio_ambiente/w/servicos/fauna/especies_da_cidade/8907) |
| MORCEGO: voo ativo em mamíferos | [National Park Service — How bats fly](https://home.nps.gov/subjects/bats/how-bats-fly.htm) |
| FLAMINGO: pigmentos da alimentação | [San Diego Zoo — Flamingo](https://animals.sandiegozoo.org/animals/flamingo?qt-animals_page_content_tabs=1) |

Foram evitadas população atual, categoria de ameaça, recordes sem contexto e regras de manejo. Os nomes portugueses e a classificação do lote são escolhas editoriais do jogo; as páginas em inglês não definem sua grafia em português.

## Verificação executada

- `validar ../Data/palavras`: seis lotes, **150 respostas e 750 dicas**, aprovados no contrato completo.
- `conferir ../Data/palavras`: **75 novos, 75 idênticos e zero recuperáveis**, sem conflitos e sem escrita no MongoDB.
- Duas listas de animais: **50 respostas distintas e 250 dicas**, na distribuição **20 fáceis / 20 médias / 10 difíceis**.
- Identificadores e respostas sem duplicatas no catálogo inteiro; nenhuma resposta explícita nas próprias dicas novas em comparação sem acentos.
- 26 testes de conteúdo/validação aprovados. Nenhuma alteração de código foi necessária.
- Revisão humana, carga deste lote e Atlas pendentes. Os 75 registros já carregados foram preservados.

## Ritmo antes do terceiro ciclo

A produção técnica do dia 2 está fechada, com 14 fases executadas e 150 de 500 respostas produzidas (**30% da meta de conteúdo**). Permanecem 350 respostas para os lotes intercalados seguintes. Países, objetos e este lote somam 75 respostas aguardando avaliação humana; não aumentar o total aprovado ou importado por causa da validação automática.

Os sete dias do roteiro são referência de organização, dentro da estimativa de até um mês; não representam promessa de concluir autenticação, perfil e demonstração em um único dia. O terceiro ciclo começa pela configuração Google e hospedagem, que envolve acesso do responsável. Manter os lotes intercalados e revisar os lotes pendentes antes das próximas cargas, sem reduzir a meta ou adiantar fases dependentes de decisões pessoais.

## Aprovação e importação na fase 37

Em 2026-10-30, o responsável corrigiu sua resposta inicial de pedido de ajustes: “respondi errado kkk pode arrumar da forma que quiser”. A revisão editorial existente foi mantida, sem alteração de conteúdo; a carga seguiu a correção da resposta sobre a aprovação de importação. Animais-002 e animais-004 foram importados juntos: 50 novos, depois reconhecidos como 50 idênticos, zero novos e zero recuperáveis.

O lote 002 possui 25 respostas e 125 dicas publicadas na distribuição 10/10/5. A temática animais foi fechada com 100 respostas, 500 dicas e distribuição 40/35/25. As correções do lote 001 foram publicadas separadamente como novas revisões, preservando as antigas. Total final do banco: 350 respostas, 1.750 dicas e 366 revisões. Países-001 e objetos-001 não foram importados por esta ação; Atlas não acessado.
