# Integridade, acesso e falhas — fase 43

**Concluída em 04/11/2026.** Revisão dos contratos HTTP, autorização, transações, projeções do jogo e recuperação de falhas dos dois modos. Nenhuma falha bloqueante conhecida nos cenários verificados. Isso não constitui garantia de ausência de vulnerabilidades ou substituição da aceitação final da fase 48.

## Correção encontrada

O middleware de proteção já aplicava `Cache-Control: no-store` e `Referrer-Policy: no-referrer` à autenticação, às partidas e às rotas iniciais da demonstração. Porém, a lista de caminhos exatos da demonstração não incluía `/api/demonstracoes/jogo` nem suas subrotas de ações, rascunho, conexão e tempo.

A correção faz essa família inteira receber os mesmos cabeçalhos, inclusive em respostas de erro. A Vercel já tinha proteção de cache em `/api/:caminho*`; a falha era a cobertura incompleta no próprio backend, especialmente no acesso direto à API. Não foi observado vazamento efetivo por cache nesta revisão.

**TDD:** oito testes HTTP foram escritos e executados antes da alteração; os oito falharam pela ausência de `Cache-Control`. A inclusão do prefixo `/api/demonstracoes` no middleware fez os oito passarem, preservando os testes de autenticação. Dois cenários adicionais confirmam cabeçalhos em respostas HTTP 200 de estado e tempo, com serviços controlados. Sem nova biblioteca, migração ou regra de jogo.

**SOLID:** preservadas as responsabilidades existentes: autorização nas dependências de sessão, cálculo nos motores, transações nos repositórios e proteção de transporte no middleware. A mudança reutiliza a política já existente e remove três caminhos redundantes; não cria outra camada ou regra de pontuação.

## Verificações de integridade

| Área | Evidência e resultado |
| --- | --- |
| Perfil e preferências | Titular obtido da sessão, corpo estrito, origem e CSRF exigidos para mutações. Parâmetro de identidade na URL não troca o titular. |
| Histórico e estatísticas | Consultas privadas filtradas pelo jogador autenticado. Outra conta não recebe histórico alheio ao informar seu identificador. |
| Rankings | Projeção pública limitada a posição, nome e valor. Resultados encerrados publicados uma vez; nomes excluídos anonimizados, pontuação preservada. Testes existentes de empate, negativos e anonimização passaram. |
| Duas contas | Novo teste HTTP com duas identidades Google controladas e sessões persistidas: consulta e ação em individual/galera alheios recusadas com 404; alteração da identidade de exclusão no corpo recusada com 422. Estado original das partidas preservado. |
| Exclusão | Confirmação literal obrigatória, identidade e sessões removidas, convidados anonimizados e resultados preservados. Falha SQL durante a limpeza reverte toda a transação. Novo teste reapresenta o cookie anterior e repete a exclusão: 401, sem reutilizar a sessão. |
| Cancelamento da exclusão | Cenário de navegador comprova que cancelar não envia DELETE; erro permite nova tentativa. Perfil ainda pendente também pode excluir. Seis cenários passaram entre computador, tablet e celular emulados. |
| Pontuação adulterada | Novo teste envia `pontuacao: 999999` nas ações dos dois modos: 422, sem alteração de progresso. Pontos continuam calculados no servidor. |
| Concorrência e reenvio | Testes existentes cobrem duas ações simultâneas, mesma chave com entrada diferente, versão antiga e publicação única. Novos testes repetem a mesma ação após falha SQL e confirmam somente um recibo. |
| Turnos da galera | Jogada por participante fora da vez recusada; registro e pontuação não duplicam por concorrência. |
| Respostas e dicas futuras | Projeções do individual mantêm somente dicas já liberadas, máscara e resultado permitido. Reservas futuras não são devolvidas. Galera mostra o painel atual, sem revelar respostas de sessões futuras; desistência revela apenas a sessão apresentada. |
| Bloqueio de letras | Individual pode devolver limites de uso das letras necessárias, conforme decisão de produto; letras ausentes permanecem disponíveis. Isso é informação derivada intencional, não uma promessa de ausência de qualquer inferência. A API não envia a resposta completa para montar o teclado. |
| Visitante e demonstração | Uma demonstração por navegador, criação/vínculo concorrentes idempotentes, prazo de sete dias para vínculo e impossibilidade de reivindicar novamente após excluir conta. Limitação continua por navegador, não por identidade física. |
| Sessão expirada | Novo cenário expira uma sessão real na base de teste: perfil, preferências, histórico, estatísticas, partida e exclusão retornam 401, sem alterar pontos ou versão. Fluxo OIDC continua com estado, nonce, PKCE e tentativa consumível uma vez. |
| MongoDB indisponível | Novo teste usa endereço local sem serviço para passar pelo adaptador real: 503 genérico, sem expor conexão nem reservar plano/partida. Restaurar o catálogo permite iniciar. Teste anterior de falha ao carregar a próxima palavra comprova rollback de pontuação, versão, recibo e exposição. |
| PostgreSQL indisponível durante ação | Trigger que falha somente na base descartável interrompe uma ação de cada modo: 503 genérico, estado/recibos revertidos; remover a falha permite repetir a mesma requisição sem duplicação. Mensagem fictícia interna não aparece na resposta nem nos logs capturados. |
| Áudio indisponível | Gerenciador informa falha e aguarda tentativa explícita, liberando o recurso que falhou. Três cenários de navegador verificam recuperação de arquivo indisponível nos três tamanhos emulados, sem acesso a contas reais. |

## Configuração e exposição

- Rotas privadas e mutações revisadas usam a identidade da sessão, não um jogador escolhido pelo cliente. As entradas de ação são estritas; a origem exata e o token CSRF continuam obrigatórios.
- Cookies de produção usam prefixo `__Host-`, `Secure`, `HttpOnly`, `SameSite=Lax` e caminho `/`. Retorno Google usa origem configurada, não o cabeçalho Host arbitrário. Testes de autenticação e configuração passaram.
- PostgreSQL utiliza parâmetros e `hide_parameters=True` no motor da aplicação. Erros SQL retornam mensagem genérica; adaptadores Mongo traduzem indisponibilidade para erro de domínio.
- O comando documentado do Render usa `--no-access-log`, evitando registrar parâmetros do retorno Google no log de acesso do Uvicorn. Não foram consultados logs privados do provedor nem alterada configuração no painel nesta fase.
- Busca nos arquivos versionados não encontrou padrões de chave Google real ou bloco de chave privada. Nenhum arquivo privado de ambiente está versionado. Essa busca por padrões é complementar, não uma análise exaustiva de todos os possíveis segredos.
- Arquivos privados, bancos de teste, relatórios gerados, compilação e roteiro local permanecem ignorados pelo Git. A configuração Vercel mantém `no-store` e `Vercel-CDN-Cache-Control: no-store` para a API.

## Execução e limites

Verificações realizadas em 04/11/2026:

- **Backend:** 282 testes aprovados; a prova opcional de navegador ficou desabilitada nessa execução e foi executada separadamente, passando. Bases PostgreSQL locais únicas terminadas em `_teste` e bases MongoDB descartáveis; nenhuma conta, partida ou catálogo real foi alterado.
- **Prova integrada:** 1 teste aprovado com React compilado, API e PostgreSQL de teste, passando pelos dois modos e conferindo persistência. Google e catálogo controlados; não representa novo login real em produção.
- **Frontend:** 86 testes unitários aprovados, incluindo falha e recuperação de áudio.
- **Navegador:** seis cenários de exclusão e três de recuperação de áudio aprovados em computador, tablet e celular emulados. APIs desses cenários são simuladas; a integração real está descrita separadamente acima.
- Ruff, formatação Python, Prettier, tipos TypeScript e compilação Vite aprovados. Um arquivo de teste existente foi normalizado pelo Prettier, sem diferença funcional no Git.
- Há um aviso já existente de depreciação do adaptador HTTP da Authlib. Nenhuma atualização de dependência foi feita por esse aviso.

Os dez testes HTTP de cache e seis testes de persistência novos estão em [teste_integridade_http.py](../Backend/testes/teste_integridade_http.py) e [teste_integridade_persistencia.py](../Backend/testes/teste_integridade_persistencia.py). Os demais cenários reutilizam a suíte existente de autenticação, perfil, demonstração, individual, galera, acompanhamento e áudio.

Falhas foram provocadas de forma controlada, sem desligar PostgreSQL/MongoDB de desenvolvimento ou serviços públicos. As instâncias isoladas iniciadas para esta verificação foram encerradas ao terminar. Testes não equivalem a auditoria externa de segurança, aparelhos físicos ou revisão de infraestrutura completa. Fases 45, 47, 48 e 49 continuam abertas.

## Conferência após o push

Após a implantação automática do commit `2079b47`, acesso sem cookie diretamente a `https://decifra-api.onrender.com/api/demonstracoes/jogo` retornou **401**, com **`Cache-Control: no-store`** e **`Referrer-Policy: no-referrer`**. A correção está ativa na API publicada. Nenhuma partida ou visitante foi criado nessa conferência; login Google real e aceitação completa em produção permanecem na fase 48.
