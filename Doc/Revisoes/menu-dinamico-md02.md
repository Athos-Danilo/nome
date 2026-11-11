# Menu dinâmico — coordenação MD-02

Data: 11/11/2026. Base: `3f3909a`. Escopo: [política temporal e de prioridades do menu](../Menu-dinamico.md). Estado: MD-02 concluída, com regressão ampliada aprovada.

## Responsabilidades

| Arquivo | Papel |
| --- | --- |
| `Frontend/src/funcionalidades/menu/politica-agenda.ts` | Tipos de acontecimento, prioridade e escolha entre candidatos válidos sem repetição imediata |
| `Frontend/src/funcionalidades/menu/agenda-menu.ts` | Tempo ativo, uma espera agendada por instância, oportunidades, deduplicação limitada e ciclo de vida; recebe relógio, agendamento e sorteio |
| `Frontend/src/funcionalidades/menu/usar-agenda-menu.ts` | Adaptação React/navegador, condições de suspensão e limpeza de ouvintes/observadores |
| `Frontend/src/funcionalidades/menu/MenuInicial.tsx` | Registra a saudação/apresentação existente como entrada protegida e encaminha pausa ao mascote |
| `Frontend/src/funcionalidades/mascote/Aurelio.tsx` | Preserva o tempo restante da conclusão de reação ao receber `pausado`, sem reiniciar sua duração |

A agenda fica local à instância do menu. Não há estado global adicional, dependência, banco, migração, mudança de pontuação ou contrato HTTP. A política não acessa DOM nem áudio; o adaptador observa o navegador; o desenho mantém seu relógio por quadros e montagem aprovados. A agenda coordena acontecimentos, sem renderizar o React a cada quadro.

## Comportamento entregue

- Prioridade de entrada/interação sobre fala e surpresa. Entrada protegida admite uma interação pendente; uma segunda não cria fila. Interação em andamento não é interrompida por novos cliques. Fala pode substituir surpresa; surpresa não corta fala ou entrada.
- IDs de solicitações aceitas são deduplicados numa janela limitada a 64, sem histórico permanente. O registro das entradas do menu é preservado por instância para que retornos de uma pausa não repitam a saudação.
- Tempo ativo exclui ausência, redução de movimento e bloqueio. O temporizador pendente é cancelado na suspensão e retomado pelo saldo, com apenas uma espera da agenda instalada. Eventos automáticos vencidos durante uma atuação protegida são descartados/reprogramados, sem reprodução acumulada.
- Ausência da aba e preferência reduzida são sinais separados. O retorno à aba mantém a redução salva/do sistema. Diálogo aberto e alerta real dentro do menu suspendem destaques e a reação do personagem.
- Alterações de `data-movimentos`, preferência do sistema, visibilidade e abertura/remoção de diálogo são observadas. A desmontagem remove os ouvintes, desconecta o observador e cancela a agenda; iniciar/parar novamente é seguro para o ciclo de efeitos do React.
- A saudação permanece protegida pelo tempo definido no repertório existente. A conclusão do Aurélio desconta somente o tempo reproduzido quando a pausa é solicitada. A atuação visual continua usando seu relógio atual; durante a pausa, a apresentação estática permanece na pose neutra já usada pelo componente, e a reprodução retoma seu relógio ao voltar.

A infraestrutura oferece candidatos contextuais reconfiguráveis e janelas de 10–15 s para falas e 20–35 s para surpresas, com escolha injetável e sem repetição imediata quando há mais de uma opção. Os candidatos ainda não são cadastrados pela interface: a alternância editorial será ligada na MD-05 e as novas atuações na MD-08. A reserva temporal automática inicial é de 600 ms para transição de fala e 3 s para surpresa; a integração artística futura deve adequar essa duração à atuação efetiva. Não há novos sons ou falas visuais nesta entrega.

## TDD e verificações

1. Testes unitários escritos antes dos módulos falharam pela ausência de `agenda-menu`. Cobrem escolha, prioridades, pausa/tempo restante, deduplicação, fila limitada, oportunidades vencidas, redução, bloqueios, remontagem e mudança de contexto.
2. O teste de navegador da agenda falhou pela ausência dos atributos/sinais de coordenação. O teste da saudação reproduziu sua conclusão enquanto a ajuda estava aberta: esperava saudação e recebeu espera.
3. Após implementação, os nove novos testes unitários passaram, junto aos 88 anteriores: 97 aprovados. Uma cobertura complementar de ausência longa com oportunidades cadastradas também começou verde, elevando o total final a 98; não se inventou falha inicial para essa proteção adicional. Os dois fluxos novos passaram em computador, tablet e celular: seis casos.
4. Um incremento de integração testou antes o registro da entrada real: falhou pela ausência de `data-acontecimento="entrada"`. Após conectá-lo, os seis casos de navegador passaram novamente. Atributos são indicadores internos de teste, sem conteúdo técnico apresentado ao jogador.
5. Tipos, compilação e formatação aprovados. A regressão ampliada foi aprovada e está consolidada abaixo.

Não se afirma TDD retroativo para a arte ou código anterior. A revisão de responsabilidades manteve decisões puras separadas do relógio e do DOM, com dependências injetáveis e um contrato pequeno para os consumidores da agenda.

## Limites e continuidade

A captura neutra de MD-01 continua sendo a referência visual. Esta etapa não redesenha o Aurélio e não implementa as cenas ou falas das fases seguintes. Não há novo aceite artístico a presumir. Ensaios de navegador usam HTTP controlado e tamanhos emulados; nenhum dado real ou conta foi alterado. A pausa por ausência foi simulada pelo sinal de visibilidade e relógio controlado, não por encerramento físico do navegador. Revisão de fluidez/desempenho do conjunto continua na MD-09.

Comparação adicional: as doze referências neutras do menu obtidas nesta fase são idênticas pixel a pixel às capturas de MD-01, nas mesmas dimensões, imagens/fontes decodificadas e movimento reduzido. O comparativo fica no arquivo local ignorado `Frontend/test-results/md02/comparacao-md01.json`. Isso protege a aparência estável; não mede fluidez.


## Resultado final

| Verificação | Resultado |
| --- | --- |
| Unidade | 98 aprovados, dez novos da agenda |
| Menu | 49 aprovados; dois ignorados previstos, exclusivos de computador |
| Aurélio | 45 aprovados, incluindo fidelidade e encaixes |
| Áudio | Nove aprovados |
| Acabamento | 15 aprovados |
| Individual/demonstração | 54 aprovados |
| Galera | 18 aprovados |
| Tipos, compilação e formatação | Aprovados |

São 190 cenários de navegador distintos aprovados na regressão ampliada, além das execuções focadas do ciclo TDD. A cobertura complementar de ausência longa passou em execução final de unidade e tipos; não mudou o código da aplicação após a compilação/regressão. Capturas, logs e comparativo permanecem locais e ignorados. Roteiro local atualizado; MD-03 não iniciada.
