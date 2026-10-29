# Pausa e retomada individual — fase 28

## Comportamento entregue

Pausa voluntária exige aviso e confirmação de menos 100 pontos. Sair pelo menu, por navegação interna ou por encerramento da sessão de login usa a mesma confirmação. Cancelar preserva o jogo. Retomar não cobra outra vez; o saldo pode ficar negativo. Abandonar definitivamente mantém o saldo, publica o resultado uma vez e libera outra individual, sem desconto adicional.

D13 foi aprovada em 2026-10-29: a montagem em edição também é recuperada, com letras, acentos, números, sinais fixos e posição selecionada. Configuração, sequência, rodada, dica e pontos permanecem no servidor. Erro de palpite limpa a montagem; pedir outra dica preserva as letras. A conta continua limitada a uma individual aberta, independentemente da galera.

Atualizar, ocultar a aba, minimizar, ficar sem conexão ou retornar de uma interrupção ambígua não desconta pontos. O vínculo pelo Google durante a demonstração também não exige pausa. Ao voltar pelo histórico depois de sair para outro documento, uma evidência reconhecida de navegação aplica a saída uma vez. A tela pausada informa o desconto e oferece retomar, menu e abandono definitivo.

## Persistência, concorrência e privacidade

Migração Alembic 0006, sem recriar dados: `rodadas.rascunho` JSONB e `conexoes_individuais` por partida/aba; 21 tabelas ao todo. A ação bloqueia a partida durante a transação. Estado, penalidade, interrupção e resposta idempotente são confirmados juntos. A identidade da ação e a versão impedem descontos duplicados; a retomada invalida conexões antigas. Sinais de documentos antigos não cobram novamente.

A montagem possui revisão própria, sem aumentar a versão do jogo. Gravações conflitantes retornam 409; repetição idêntica da gravação aceita é recuperável. A interface agrupa alterações por 350 ms, serializa envios e confirma a gravação antes de ações voluntárias. Falhas oferecem tentar novamente ou recarregar a montagem oficial. A indicação “Montagem salva” identifica o estado confirmado. Encerramento e anonimização removem rascunhos e conexões.

A recuperação usa o mesmo motor na conta e na demonstração. Autorização por proprietário ou visitante, origem e CSRF continuam obrigatórios. Nenhuma dessas operações revela resposta ou dicas futuras. Os contratos estão em [Contratos da API](Contratos-api.md#continuidade-individual--fase-28).

## Navegador e responsabilidades

A interface registra UUID de aba em sessionStorage e UUID de documento na memória. Informa tipo de navegação e eventos pagehide/pageshow, conectividade e visibilidade. Sinais de atividade são enviados a cada 15 segundos; silêncio não é prova de saída e não gera penalidade. Requisições de saída usam fetch com keepalive e os mesmos cabeçalhos de proteção. O servidor reconcilia as evidências persistidas.

React Router mantém as rotas existentes e passa a usar createBrowserRouter/RouterProvider para permitir useBlocker. A proteção de saída, a conexão e o salvamento ficam em módulos próprios, separados da apresentação de pausa. O serviço de continuidade depende de um protocolo pequeno do motor, reutilizando a transação oficial de saída em vez de duplicar a pontuação.

## Verificação e TDD

Antes da implementação, os testes do esquema e da API falharam pela ausência da persistência e das operações. O teste de navegador falhou pela ausência da confirmação da montagem. Os testes de keepalive e dos metadados de rascunho falharam antes das respectivas mudanças. Após implementar, a refatoração separou apresentação, efeitos e continuidade, preservando os cenários. Cobertura adicional de concorrência e evidências de cache foi acrescentada depois; não é apresentada como ciclo vermelho anterior à implementação.

Verificações locais: 178 testes backend aprovados na suíte geral, mais um cenário posterior de limpeza do rascunho e das conexões na exclusão da conta; a prova opcional de navegador é registrada separadamente abaixo. 51 testes unitários frontend, 42 cenários do individual, 24 do menu e 39 de perfil/demonstração aprovados. Os cenários cobrem computador, tablet e celular em Chromium/Edge: pausa, cancelamento, saldo negativo, dica preservada, letras recuperadas, recarga, reconexão, duas abas, navegação pelo menu e histórico. Ruff, Prettier, tipos e compilação também fazem parte do encerramento.

A prova opcional com React compilado, HTTP e PostgreSQL descartável também passou: uma partida autenticada e uma demonstração, cada uma com pausa, recarga, recuperação das letras e três acertos, terminaram com 200 pontos na tela, no servidor e no banco (300 menos 100). Google e catálogo são controlados nessa prova; não foi utilizada a conta pessoal. A migração 0006 foi aplicada ao banco local de desenvolvimento, e a API foi reiniciada com a implementação atualizada.

## Limites concretos

Fechamento abrupto, suspensão do sistema ou falha de rede podem impedir o envio de eventos e de letras ainda não confirmadas. Nesses casos o estado confirmado é preservado, sem deduzir uma saída por tempo de ausência. A confirmação voluntária aguarda o salvamento; keepalive é uma tentativa adicional, sem promessa de entrega infalível.

Os tamanhos de tela são simulados no navegador de computador. Aparelhos físicos, Safari, publicação Vercel/Render, rede móvel e encerramento forçado do sistema permanecem verificações das fases próprias. A integração da galera será feita na fase 33. A compilação informa um pacote JavaScript acima do limite indicativo de 500 kB; a divisão de carregamento poderá ser tratada na revisão de desempenho.

## Referências

- [React Router — useBlocker](https://reactrouter.com/api/hooks/useBlocker).
- [MDN — pagehide](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event).
- [MDN — keepalive](https://developer.mozilla.org/en-US/docs/Web/API/Request/keepalive).
