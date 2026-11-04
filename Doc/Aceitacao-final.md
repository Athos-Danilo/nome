# Aceitação final — fase 48

Data: 04/11/2026. Situação: **concluída**, após o aceite dos blocos publicados e a conferência da exclusão e do novo cadastro com Google. A fase 49 ainda não foi iniciada.

## Escopo e evidências

| Área | Verificação realizada | Evidência |
| --- | --- | --- |
| API, contas e regras | Suíte completa com PostgreSQL e MongoDB isolados; inclui prova React/API/PostgreSQL | 285 testes aprovados na execução inicial |
| Galera persistida | Um, dois e três participantes; cinco sessões da mesma temática; respostas inéditas na partida; exposições, ordens, placar e ausência de ranking individual | Três novos testes de integração aprovados em `Backend/testes/teste_aceitacao_final.py` |
| Interface | Entrada, configuração, individual, galera, perfil, preferências, histórico, estatísticas, ranking, mascote, áudio e acabamento | 269 casos aprovados na regressão inicial em computador, tablet e celular emulado; quatro casos condicionais de toque não aplicáveis foram ignorados |
| Interrupções | Recarga, saída, recuperação e decisões distintas dos dois modos | 32 casos aprovados |
| Unidade e compilação | Entrada de letras, preferências e componentes; TypeScript e produção | 88 testes aprovados; compilação aprovada |
| Catálogo | 500 respostas e 2.500 dicas; vinte lotes aprovados; referências históricas preservadas | [Auditoria final](Revisoes/catalogo-final.md) e manifesto da fase 47 |
| Publicação | Página principal e rotas dos dois modos; saúde da API; proteção sem sessão de perfil, preferências, histórico e estatísticas | HTTP 200 nas páginas/saúde e 401 nas quatro consultas privadas |

Os novos testes de integração complementam a suíte inicial: 288 casos de backend verificados ao todo, em duas execuções. Não houve limpeza ou carga de testes em Neon/Atlas. Os bancos usados para automação são exclusivos de teste, em loopback nas portas 55432 e 27018.

As suítes cobrem falta de conteúdo, repetição, acentos e C/Ç, saldo negativo, pausa sem cobrança duplicada, retomada de dica/rascunho, demonstração e vinculação, empates e sessão extra. A regressão do navegador usa fronteiras controladas; a prova integrada e os testes manuais publicados complementam essas simulações.

## Correção com TDD

O novo caso `exclusão mantém Tab e Shift+Tab no diálogo e Escape cancela sem apagar`, em `Frontend/testes-navegador/perfil.fluxo.ts`, reproduziu o foco saindo do diálogo de exclusão. O teste falhou pela contenção de foco, sem executar exclusão.

A correção compartilha `conterFocoNoDialogo` entre o diálogo comum e o de exclusão, preservando o ciclo de Tab/Shift+Tab e o cancelamento por Escape. O comportamento existente do diálogo comum foi extraído sem mudança de regra. Após a correção, passaram os 45 casos de perfil (incluindo o novo caso nos três tamanhos), 24 de menu e 15 de acabamento. Também passaram novamente os 88 testes de unidade, a compilação TypeScript/Vite e a formatação. Ao todo foram verificados 304 casos distintos de navegador, além das repetições das áreas afetadas. A correção foi publicada no commit `35a1724`, com HTTP 200 e recurso de produção atualizado confirmado na Vercel antes do último bloco manual.

## Aceitação no jogo publicado

O responsável informou sucesso no bloco de login Google, preferências/recarga, individual, pausa/retomada e histórico; depois aprovou o bloco da galera e relatou 60 pontos no individual e 300 no seu participante da galera.

A consulta somente leitura da conta de teste confirmou duas individuais concluídas, de 160 e 60 pontos, totalizando 220 pontos de ranking individual. Há uma partida da galera concluída com 2.200 pontos agregados; esse total não deve ser confundido com o placar de um participante. A consulta aos participantes confirmou 300 pontos do anfitrião e 1.400/500 dos convidados, somando 2.200. A galera não entrou na soma individual. A conta já continha a individual de 160 pontos antes deste teste.

No primeiro snapshot, o silêncio geral estava desligado. Por isso o último bloco pediu repetir explicitamente salvar “Silenciar tudo” e atualizar antes da exclusão, além de cancelar uma primeira tentativa de exclusão. O responsável respondeu que o bloco deu certo e confirmou excluir e recriar com o mesmo e-mail e nome, sem histórico. A preservação do silêncio e o cancelamento têm evidência manual; não houve snapshot intermediário antes da exclusão.

### Exclusão e retorno — RF-49

A conferência somente leitura posterior no Neon confirmou:

- A identidade antiga está anonimizada: identificador Google, e-mail, chaves de identidade, nome e avatar foram removidos.
- Nenhuma preferência ou sessão de autenticação permanece vinculada à identidade antiga.
- Nenhum participante das suas partidas mantém nome, chave do nome ou avatar identificável; todos estão anonimizados.
- Os dois resultados individuais antigos foram preservados, totalizando 220 pontos.
- A API pública de ranking retorna “Jogador excluído” com 220 pontos, coerente com os resultados preservados.
- O novo cadastro com o nome reutilizado possui outro identificador interno, está ativo e não possui partidas. O responsável confirmou histórico vazio após entrar novamente com o mesmo Google.

O teste real e a correção de teclado estão aceitos. Não há defeitos bloqueantes conhecidos nas verificações realizadas. A fase 48 foi concluída; a documentação de entrega, publicação final e apresentação permanecem na fase 49.

IDs internos e snapshots da conta ficam apenas em arquivos ignorados de teste. Nenhum e-mail, segredo ou identificador pessoal é incluído neste relatório.

## Limites

Os tamanhos de celular/tablet são emulados; não equivalem à certificação em aparelhos físicos ou em todos os navegadores. Login Google real depende da participação do responsável. A limitação documentada de distinguir fechamento e falha de conexão permanece; ambiguidades preservam o progresso conforme a regra aprovada. Há um aviso de depreciação já existente da Authlib, sem falha dos testes. Não foi feita atualização geral de dependências.
