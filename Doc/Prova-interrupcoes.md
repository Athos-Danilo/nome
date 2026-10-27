# Prova de interrupções — fase 13

**Estado em 2026-10-27:** fase 13 concluída, com prova técnica verificada e política D01 aprovada pelo responsável. Os efeitos são simulados; a implementação nas partidas reais pertence às fases 28 e 33.

## Resultado principal

Nos testes de navegador, recargas normais e forçadas mantiveram a identidade da aba e indicaram navegação `reload`; a prova recuperou o estado sem desconto fictício. Fechar a aba e abrir outra produziu uma identidade diferente. Entretanto, identidade diferente também pode significar duplicação de aba, armazenamento indisponível ou outra janela; ausência de sinais não informa a causa. Identidade restaurada e navegação `reload` também não constituem prova absoluta de que a janela nunca foi fechada.

Portanto, é possível reconhecer casos comuns e registrar evidências, mas não garantir a distinção perfeita exigida originalmente. Um prazo de reconexão não resolve sozinho: uma recarga lenta pode ultrapassá-lo, e uma aba fechada pode ser restaurada dentro dele. Por isso a prova não converte ausência em penalidade nem encerra a galera automaticamente.

## Implementação isolada

- `Backend/experimentos/interrupcoes/`: servidor FastAPI separado, com estado fictício em memória e relógio monotônico do servidor. Não é importado pela aplicação principal.
- `Frontend/provas/interrupcoes.html` e `Frontend/src/provas/interrupcoes/`: painel local em TypeScript com eventos e saldo fictício inicial de 300.
- `Frontend/testes-navegador/`: testes Playwright com Edge/Chromium e três tamanhos de tela.
- Rotas `/prova-api` existem somente no servidor experimental, porta 8770. O proxy do Vite é de desenvolvimento. A página não é incluída na compilação normal de produção.

O experimento não lê PostgreSQL, MongoDB, contas, palavras, tokens Google ou partidas reais. O armazenamento do navegador usa chaves `decifra_prova_*`, exclusivas da prova. Reiniciar seu servidor apaga as simulações e exige criar outra prova; isso não é uma proposta de persistência para o jogo. As rotas experimentais não possuem autenticação de conta e devem permanecer locais, nunca ser publicadas como API de produção.

## Sinais observados

| Sinal | Uso na prova | Limite |
| --- | --- | --- |
| UUID em `sessionStorage` | Identidade da aba entre recargas | Pode ser restaurado, copiado por uma aba com `opener` ou estar indisponível |
| UUID por documento carregado | Impedir que um aviso atrasado da página anterior interrompa a nova | Não identifica a pessoa nem substitui autenticação |
| `PerformanceNavigationTiming.type` | Distinguir `reload`, `navigate` e `back_forward` declarados pelo navegador | É informação do cliente, não uma certificação do motivo da interrupção |
| `pagehide` e `pageshow`, com `persisted` | Observar descarte ou retorno do cache de navegação | Podem não chegar, especialmente no encerramento móvel |
| `visibilitychange` | Registrar aba oculta/visível | Ocultar ou trocar de aba não significa sair do jogo |
| `offline` e `online` | Apresentar falha e tentativa de reconexão | Não distinguem todas as falhas do servidor ou da internet |
| `sendBeacon` | Tentar enviar aviso ao sair da página | Não transforma o aviso em confirmação de fechamento |
| Sinal HTTP a cada 2 segundos | Servidor observa ausência após 10 segundos | Intervalos experimentais; falta de sinais também ocorre por suspensão ou falha da hospedagem |

O identificador da interrupção é mantido enquanto a mesma ocorrência está em apuração. Repetir consulta ou aviso não cria outra interrupção. Avisos de um documento antigo são ignorados após a conexão de um documento novo. A prova usa um processo e não foi desenhada para execução com vários workers.

## Matriz de evidências

Execução local final: **32 testes de navegador aprovados** em 32,5 segundos, com Edge em modo headless no Windows. Dez cenários foram repetidos em 1440×1000, 820×1180 e 390×844; os dois cenários adicionais de processo e suspensão controlada foram executados no projeto de computador. A última execução já inclui as decisões aprovadas para saída e histórico.

| Cenário | Evidência obtida | Alcance |
| --- | --- | --- |
| Atualizar normalmente | Mesmo UUID de aba, novo documento, `reload`, saldo fictício 300 | Navegador real nos três tamanhos |
| Atualizar sem cache | `Page.reload` com `ignoreCache`, `reload`, saldo 300 | Edge/Chromium; não equivale a testar todas as combinações de atalhos em outros navegadores |
| Pausar, recarregar e reenviar | Saldo 200 e uma pausa, sem repetir desconto | Diálogo aceito e reenvio da mesma ação após recarga |
| Cancelar pausa | Saldo 300 e zero pausas | Diálogo cancelado |
| Fechar aba e abrir outra | Novo UUID de aba, retorno ambíguo, saldo preservado na prova | Mesmo contexto de navegador, sem restauração manual da aba fechada |
| Fechar o processo do navegador e abrir outro | Retorno ambíguo com estado local da origem transferido e nova sessão de aba | Fechamento normal de navegador isolado; não é encerramento forçado pelo sistema operacional |
| Offline e reconexão | Mensagem de falta de rede, nova confirmação, sem desconto automático | Falha controlada por `BrowserContext.setOffline`; não desligou a internet da máquina |
| Sair pelo link e voltar pelo histórico | Individual permanece com 200 pontos e uma pausa, sem desconto repetido; galera permanece encerrada com saldo 300 e retomada indisponível | A saída do link aguarda a confirmação do servidor antes de navegar; retorno pelo histórico não desfaz seu efeito |
| Galera após atualização | Estado recuperado, pausa indisponível e nenhum desconto | Simulação, sem partida real |
| Ausência prolongada | Servidor abre uma interrupção após 10 segundos, sem atribuir a causa | Temporizadores da página pausados pelo Playwright, relógio do servidor continua real |
| Layout | Sem rolagem horizontal e capturas inspecionadas nos três tamanhos | Tablet e celular emulados, não aparelhos físicos |

Também passaram **20 testes da prova no backend**, além de **3 testes HTTP da infraestrutura existente**: recarga declarada após 1, 11 e 1.000 segundos; interrupção única; nova pausa somente depois da retomada; sinal atrasado; visibilidade/rede; retorno ambíguo; saída pelo histórico/cache nos dois modos; restrição da galera; separação das rotas e validação HTTP. Os 3 testes Vitest existentes, tipos, compilação, Ruff e Prettier passaram.

Uma tentativa de forçar o estado `frozen` pelo protocolo do navegador não interrompeu os sinais de maneira verificável neste ambiente; não foi contada como suspensão comprovada. O teste reproduzível usa temporizadores controlados. Suspender o computador inteiro interromperia também a infraestrutura de teste e não foi realizado.

Não foram testados: celular/tablet físico, Safari, Firefox, restauração manual de sessão por atalhos do navegador, encerramento forçado do sistema ou comportamento de uma hospedagem pública. Emulação não comprova o comportamento desses ambientes. Há ainda teste de domínio mostrando que sinais de uma restauração podem ser indistinguíveis de uma recarga; ele demonstra a ambiguidade lógica, não afirma ter executado a restauração real.

## Pontuação fictícia e idempotência

O botão de pausa confirmado e a saída para outra página aplicam −100 à simulação individual. Cancelar não envia a ação. Reenviar o mesmo UUID não aplica novamente; novas tentativas enquanto a simulação já está pausada também não descontam. Uma retomada explícita permite uma nova pausa. Na galera, pausa é recusada e saída/encerramento explícito preserva o saldo e impede retomada. Consultar novamente o resultado encerrado não reabre a simulação.

Ausência, rede e retorno ambíguo ficam sem efeito automático, conforme a decisão aprovada. O botão Retomar simulação é uma ferramenta experimental; a galera não oferece pausa voluntária. Sua recuperação por dúvida ou recarga é uma exceção técnica aprovada para preservar o painel.

No jogo real, a implementação deverá usar a transação PostgreSQL, a versão de partida e as chaves únicas de interrupção/penalidade já modeladas. O estado em memória e o conjunto de UUIDs desta prova não substituem essas garantias, sessões autenticadas ou controle entre várias abas.

## Decisões aprovadas pelo responsável

1. **Individual ambíguo:** “Preservar sem desconto nas dúvidas”. Pausa e saída confirmadas continuam −100; recarga permanece gratuita.
2. **Galera ambígua:** “Preservar o painel nas dúvidas”. Ausência de sinais não autoriza encerrar a partida. Continua sem existir uma opção de pausa voluntária.
3. **Voltar/Avançar:** “Contar como saída da partida”. Sair para outra página pausa a individual com −100 ou encerra a galera pelo placar; voltar por histórico/cache não desfaz a saída. Trocar de aba continua sem contar como pausa.

As três respostas foram recebidas em 2026-10-27 e incorporadas a Detalhes.md. Elas substituem a aplicação automática da regra original de fechamento quando a causa for ambígua. Não há prazo aprovado de encerramento por falta de sinais; os 10 segundos apenas abrem apuração. Se a saída for inequívoca, aplicar o efeito correspondente; se não houver evidência suficiente, preservar o estado e reconciliar a conexão.

Na integração real, navegação pelo menu/links/roteador deve comunicar a saída e confirmar seu efeito no servidor. O retorno `back_forward` ou pelo cache permite reconhecer uma navegação que não foi registrada antes; a mesma interrupção não pode cobrar novamente. Os rótulos detalhados da prova são diagnósticos, não novos valores diretos do enum SQL: usar `em_apuracao`, `pausa`, `recarga`, `encerramento` ou `ignorada` conforme a reconciliação, sem penalidade para a ambiguidade resolvida como preservação.

## Execução local e repetição

No terminal, dentro de `Frontend`:

```powershell
npm ci
npm run testar-interrupcoes
```

No Windows, a configuração usa o Edge instalado e `../Backend/.venv/Scripts/python.exe`. Os dois servidores da prova são iniciados e encerrados pelo Playwright; as portas 8770 e 5175 devem estar livres. Relatório JSON, capturas e traces ficam em `Frontend/test-results/`, ignorado pelo Git.

Para usar Chromium instalado pelo Playwright em outro ambiente, executar `npx playwright install chromium` e definir `DECIFRA_CANAL_NAVEGADOR=chromium`. `DECIFRA_PYTHON` permite escolher outro executável Python com as dependências do backend. O GitHub Actions recebeu um job para repetir a prova no Linux com Chromium; ainda não foi verificada uma execução remota desse job.

Para testar manualmente, iniciar em terminais separados:

```powershell
# Dentro de Backend
.venv/Scripts/python.exe -m uvicorn experimentos.interrupcoes.api:aplicacao --host 127.0.0.1 --port 8770
```

```powershell
# Dentro de Frontend
npm run dev -- --port 5175
```

Abrir `http://127.0.0.1:5175/provas/interrupcoes.html`. Criar uma prova individual ou galera; experimentar recarregar, cancelar/confirmar pausa, reenviar, sair pelo link e voltar. Para testar fechamento, abrir depois outra aba no mesmo navegador. Não usar esta página para simular resultados oficiais.

## Hospedagem futura

O método usa HTTP comum; não exige WebSocket ou serviço pago. A aplicação real poderá usar a topologia de mesma origem considerada em [Publicacao-gratuita.md](Publicacao-gratuita.md), com o progresso persistido nos bancos. O servidor experimental não deve ser hospedado como está.

Suspensão e reinício do provedor gratuito não podem ser tratados como saída comprovada do jogador. Falha inicial, nova instância do servidor e recarga lenta exigem reconciliação com o estado salvo, sem penalização por simples falta de resposta. O intervalo definitivo dos sinais, a configuração do provedor e o teste de inicialização fria serão fechados antes da integração/publicação. A prova local não aprova um provedor nem garante latência pública.

## Referências consultadas

- [MDN — pagehide e suas limitações](https://developer.mozilla.org/en-US/docs/Web/API/Window/pagehide_event).
- [MDN — beforeunload](https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event).
- [MDN — tipos de navegação](https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming/type).
- [MDN — sessionStorage e restauração](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).
- [MDN — sendBeacon](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon).
- [Playwright — servidores de teste](https://playwright.dev/docs/test-webserver) e [relógio controlado](https://playwright.dev/docs/clock).
