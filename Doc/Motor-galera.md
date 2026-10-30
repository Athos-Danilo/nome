# Motor da galera — fase 31

## Entrega

Motor Python independente de interface, relógio, HTTP e bancos. Recebe estado oficial e comando; retorna uma nova versão completa ou um erro de domínio, sem alterar o estado recebido. Implementação em `Backend/aplicacao/modulos/galera/motor.py`; consentimento e seleção da sessão extra em `desempate.py`.

A configuração persistida da fase 29 continua disponível. Esta fase não acrescenta rotas jogáveis ou migrações: ligar as transições à persistência e ao painel, registrar exposições, recuperar recargas, medir o tempo e tratar desistências são entregas da fase 33. O motor não deve ser colocado em uma variável global para substituir a persistência.

## Regras implementadas

- Letra isolada revela todas as ocorrências ainda ocultas no painel, valendo 100 pontos por posição. Variantes de vogais pertencem à mesma família; a exibição mantém a grafia oficial. C e Ç são distintos.
- Uma letra inexistente vale zero, fica bloqueada e passa a vez. Não há publicação antecipada de todas as letras ausentes.
- Famílias de letras com todas as posições já reveladas também ficam bloqueadas. Um palpite que revela apenas parte das ocorrências não bloqueia a família enquanto houver posições ocultas em outra palavra.
- Acerto de letra ou palpite completo mantém a vez. Palpite incorreto fixa e pontua apenas posições novas e exatas da palavra selecionada e passa a vez, mesmo rendendo pontos.
- Palpite completo normaliza caixa e Unicode NFC, preservando a exigência de acentos. PAO não resolve PÃO. Letras já fixadas não podem ser trocadas.
- Sinais são visíveis e fixos, sem pontuação; algarismos são preenchíveis e valem 100 por posição. Palpite incompleto, sinal alterado, palavra resolvida ou inexistente e letra bloqueada são recusados sem consumir turno.
- Pontos são acumulados e nunca derivados de um placar enviado pelo cliente. Uma posição revelada não rende pontos novamente.
- A sessão acaba quando todas as posições preenchíveis do painel forem reveladas. A próxima começa com novo sorteio, teclado reiniciado e placar preservado. A ordem inicial já sorteada na fase 29 pode ser fornecida sem novo sorteio. Se não fornecida, o motor sorteia uma ordem.
- No fim regular, um único líder encerra a partida; dois ou três líderes levam à decisão de empate. Com um participante, encerra diretamente com seu resultado, sem sessão extra.

## Desempate — decisões D21 e D22

Decisões aprovadas pelo responsável em 2026-10-30:

1. A sessão extra mantém a dificuldade da partida; anfitrião escolhe uma temática ou solicita temática aleatória viável.
2. Faltando conteúdo novo dentro da partida, oferecer outra temática ou encerrar empatado. Não repetir respostas nem mudar dificuldade automaticamente.
3. Com apenas um participante, mostrar pontuação e desempenho, sem oferecer desempate.

Cada líder registra sua concordância. A recusa de qualquer um encerra empatado. Só abrir a extra depois da concordância de todos; alguém que já concordou ainda pode aceitar o empate enquanto a extra não começou, inclusive após uma oferta sem conteúdo suficiente.

A extra tem uma resposta por líder empatado, novo sorteio apenas entre eles e mantém os pontos já conquistados. Os demais participantes continuam no placar final, sem votar ou jogar a extra. Há no máximo uma extra, inclusive após cinco sessões regulares. O resultado da extra encerra definitivamente, com vencedor ou empate entre os novos líderes.

`selecionar_extra` recebe documentos oficiais do catálogo e histórico do anfitrião. Filtra pela dificuldade guardada no estado, exclui respostas da partida usando a chave conservadora do catálogo e tenta conteúdo não visto antes de reaproveitar o histórico. No aleatório, considera somente temas com quantidade suficiente. Retorna referências dos documentos escolhidos ou nenhuma oferta, sem alterar estado, pontos ou consentimentos. Na integração, a leitura do catálogo deve preservar seus erros de indisponibilidade; erro de conexão não é falta de conteúdo.

## Estado e comandos internos

`EstadoGalera` guarda participantes estáveis, painéis privados, dificuldade, pontos, ordem, posição do turno, posições reveladas, letras tentadas, versão, líderes, concordantes, indicação de extra e ações processadas. O índice de palavra do comando começa em zero; a projeção pública numera sessões a partir de um.

| Operação | Contrato interno |
| --- | --- |
| `iniciar` | Participantes, painéis oficiais e dificuldade da configuração; primeira ordem reservada quando existir. Valida limites, respostas únicas e ordem completa. |
| `jogar` | `Jogada(id_acao, versao_esperada, participante, tipo, valor, palavra)`. Tipos: letra ou palpite. |
| `votar` | `VotoExtra(id_acao, versao_esperada, participante, aceita)`. Só líderes do empate regular. |
| `abrir_extra` | `AbrirExtra(id_acao, versao_esperada, painel)`. Painel obtido pelo servidor, após seleção e consenso. |
| `publicar` | Projeção explícita com máscara do painel atual, tema atual, ordem, participante atual, pontos, bloqueios, líderes e consentimentos. |

As respostas completas, painéis futuros, temas futuros, dicas e registros privados de comandos não são publicados. Não serializar a dataclass inteira como resposta HTTP. O painel recebido por `abrir_extra` é uma dependência interna confiável, não um campo que o jogador possa fornecer; o adaptador deve usar a seleção do catálogo e suas revisões imutáveis.

Comandos válidos incrementam a versão uma vez. Reenvio com mesmo identificador e conteúdo é neutro e retorna o estado atual, inclusive depois de avanço de sessão. Reuso do identificador com outros dados é conflito. Versão desatualizada, participante fora da vez e ações após encerramento são recusados. A história de comandos precisa ser preservada pelo adaptador; reconstruí-la vazia eliminaria a garantia de reenvio.

O sorteador é uma função injetável: a execução normal usa `SystemRandom`; os testes controlam a ordem. Toda ordem é conferida como permutação exata dos participantes habilitados. Uma falha no sorteador não altera o estado original.

## Integração exigida na fase 33

- Autorizar o anfitrião autenticado e a propriedade da partida, com Origin/CSRF e entradas estritas. Os participantes do mesmo dispositivo não possuem sessões de autenticação próprias.
- Carregar a partida e ações processadas sob bloqueio transacional ou comparação atômica de versão. Persistir pontos, posições, turno, ordem e recibo do comando juntos. As garantias do motor não demonstram, sozinhas, concorrência entre requisições ou durabilidade após reinício.
- Carregar as respostas a partir das referências e revisões reservadas; não expor o conteúdo privado nem depender da versão atual do catálogo.
- Registrar como vistas apenas as respostas efetivamente apresentadas; distinguir reservadas, apresentadas e resolvidas. Na passagem entre sessões, persistir a nova ordem uma vez.
- Preparar e validar a oferta de extra antes de gravar sua abertura; manter tema futuro oculto e evitar sortear novamente em reenvios.
- Integrar o teclado compartilhado, o aviso de ação inválida, a animação da ordem oficial, o fluxo de consenso e o resultado. Convidados permanecem visíveis no placar final mesmo quando não participam da extra.
- Acrescentar tempo ativo por sessão/total, recuperação técnica e encerramento antecipado conforme as regras já aprovadas, sem penalidade ou ranking individual.

## TDD e verificações

Primeiro foram escritos os testes de letras, palpites, turnos, reenvios e sessões; a execução falhou pela ausência do motor. Depois da implementação, os 23 cenários iniciais passaram. Os testes de consentimento, abertura da extra e sorteio inicial falharam antes dos respectivos comportamentos; a seleção de conteúdo da extra também teve falha inicial pela operação ausente.

Uma regressão mostrou que um líder que já havia concordado não conseguia encerrar empatado depois de faltar conteúdo. O teste reproduziu o bloqueio antes da correção. O fluxo agora permite essa decisão antes de começar a extra.

As transições são separadas da apresentação e dos adaptadores; o desempate tem módulo próprio, com contrato pequeno de sorteio. A validação da chave de conteúdo e a seleção sem repetição reutilizam as funções existentes. Nenhuma regra de pontuação do individual foi importada para a galera.

O resultado final das verificações desta fase está registrado no fechamento abaixo.

### Fechamento verificado

- **39 testes do motor aprovados**, incluindo CASA + MADEIRA, CAMA para CASA, vogais acentuadas, Ç distinto, dígitos e sinais, posições fixas, reenvio após troca de turno/sessão, conflitos de versão e ações fora da vez.
- Empates entre dois e três líderes, exclusão do terceiro não empatado, recusa, consenso, conteúdo insuficiente, decisão de encerrar após consenso, cinco sessões mais uma extra e resultado definitivo após a extra.
- As **325 respostas dos treze arquivos** foram resolvidas pelo teclado da galera no teste de compatibilidade, preservando a grafia completa e creditando exatamente 100 por posição preenchível. Os arquivos em revisão foram somente lidos, sem importação.
- Suíte backend completa com PostgreSQL isolado na porta 55432 e MongoDB de testes: **227 aprovados e um ignorado**. O único ignorado é a prova opcional de navegador integrado, que exige habilitação explícita. Nenhuma tela foi alterada nesta fase.
- Ruff e verificação de formatação aprovados. Há um aviso de descontinuação interno da Authlib já existente; não foi alterada dependência de autenticação nesta fase.
- A instância PostgreSQL de teste, inicialmente desligada, foi iniciada para a verificação e desligada ao final. O banco de desenvolvimento, o catálogo publicado e a migração local não foram alterados. O roteiro permanece somente local, conforme o `.gitignore`.

## Integração posterior

A fase 33 conectou o motor à persistência e ao painel. O agregado é reconstruído com revisões do catálogo e posições/ordens relacionais; recibos de comandos garantem reenvios na transação. Contratos e verificações em [Painel-galera.md](Painel-galera.md).
