# Áudio — fase 38

## Comportamento aprovado

- Cinco faixas lo-fi/arcade selecionáveis para individual, demonstração e galera. A opção sem música continua disponível.
- Sexta faixa exclusiva do menu principal, solicitada pelo responsável em 30/10/2026. Seu botão fica junto à lua/sol; não troca o tema nem a música da partida. Padrão ativado, condicionado ao gesto do jogador, volume e silêncio geral.
- Configurações sem trilha automática, com prévias das seis faixas, teste dos efeitos e créditos. As prévias usam as preferências em edição; só Salvar confirma a alteração.
- Música, interface/teclado e eventos têm volumes independentes; silêncio geral prevalece sobre todos. A preferência do menu também é salva na conta ou no navegador. Conta nova herda o navegador; conta existente mantém suas escolhas salvas.
- Música da partida somente com painel em andamento; pausa, resultado e saída interrompem a trilha. Ocultar a página pausa a música e interrompe os efeitos. Voltar retoma a trilha permitida, sem reproduzir eventos antigos.
- Arquivo indisponível informa o problema e permite tentar novamente. O jogo e suas regras continuam funcionando sem áudio.

## Músicas e permissão de uso

Todas as faixas abaixo foram disponibilizadas pelos respectivos autores sob **CC0**, conforme as páginas de origem consultadas em 30/10/2026. [CC0 1.0 — texto e condições](https://creativecommons.org/publicdomain/zero/1.0/). Os títulos e autores são preservados nos créditos da interface. As músicas não são composições do Decifra.

| Arquivo em `Frontend/public/audio/musicas/` | Obra / autor | Página de origem |
| --- | --- | --- |
| `lofi_01.mp3` | Chill Loopable — Alex McCulloch (Pro Sensory) | [OpenGameArt](https://opengameart.org/content/chill-loopable) |
| `lofi_02.mp3` | Lofi Again — omfgdude | [OpenGameArt](https://opengameart.org/content/lofi-again) |
| `lofi_03.mp3` | Happy Lofi Day — Tarush Singhal | [OpenGameArt](https://opengameart.org/content/happy-lofi-day) |
| `arcade_01.mp3` | Puzzling — Ruskerdax | [OpenGameArt](https://opengameart.org/content/puzzling) |
| `arcade_02.mp3` | April’s Finale v2 (Electronic) — Alex McCulloch (Pro Sensory) | [OpenGameArt](https://opengameart.org/content/aprils-finale-v2-loop-electronic) |
| `menu.mp3` | Cozy Puzzle Title — MintoDog | [OpenGameArt](https://opengameart.org/content/cozy-puzzle-title) |

Arquivos de origem: `chillloopable.mp3`, `lofiagain.ogg`, `rhodes.mp3`, `ruskerdax_-_puzzling.mp3`, `aprils_finale_electronic.mp3` e `cozy_puzzle_title_bpm95.mp3`, respectivamente, publicados em `https://opengameart.org/sites/default/files/`. A autorização registrada refere-se às obras dessas páginas, não a recursos encontrados em compilações de terceiros.

Preparação com FFmpeg: normalização `loudnorm=I=-21:TP=-2:LRA=7`, MP3 estéreo, 44.100 Hz e 128 kbps. Sem composição adicional. O manifesto [arquivos.json](arquivos.json) registra SHA-256 do original e da cópia final, duração e tamanho. As seis músicas somam aproximadamente 9 MB e são carregadas individualmente após interação, sem impedir a abertura do menu. Repetição pelo Howler; a suavidade de cada emenda ainda deve ser avaliada na escuta.

## Efeitos do projeto

13 efeitos originais sintetizados por código, sem amostras externas: botão, tecla, apagar, acento, arrastar, abrir, fechar, acerto, erro, dica, turno, sorteio e resultado. WAV mono de 16 bits a 22.050 Hz, com ataque e soltura curtos para reduzir descontinuidades. Gerador reproduzível em `Backend/comandos/gerar_efeitos.py`; executar `python -m comandos.gerar_efeitos` dentro de Backend. Os arquivos finais ficam em `Frontend/public/audio/efeitos/`.

Cliques, digitação, arraste e reações confirmadas dos painéis usam o gerenciador central. Abrir/fechar também estão disponíveis para prévia; a navegação atual usa o efeito de botão. Não se adicionam sons a cada quadro de animação. O silêncio não muda pontos, cronômetros, turnos, validação ou acessibilidade dos retornos visuais.

## Estrutura e persistência

`Frontend/src/funcionalidades/audio/` separa catálogo, política de reprodução, adaptador Howler, contexto e prévias. O gerenciador não conhece API, pontuação nem bancos. Hooks conectam os painéis e as reações do Aurélio. Somente eventos recentes e únicos podem produzir efeitos; teclado tem intervalo mínimo de 55 ms, sem atrasar a entrada de letras. Recursos com erro são descartados antes da tentativa explícita seguinte.

Migração `0011`: acrescenta `preferencias.musica_menu_ativa`, booleano não nulo com padrão verdadeiro. Preferências antigas no navegador recebem o mesmo padrão sem perder tema, paleta ou volumes. Nenhuma partida nem documento do MongoDB é alterado.

## Verificação e aprovação

TDD aplicado ao gerenciador, contrato de preferências, síntese dos efeitos e integração das prévias. O teste do adaptador revelou que `preload: false` exigia carregar explicitamente o recurso antes de tocar; a correção está protegida por regressão. Outra regressão cobre descarte e recuperação de efeitos que falharam. Testes de navegador conferem os controles, persistência local, erro de arquivo e sinal real na saída Web Audio, além do silêncio geral. Persistência de conta e equivalência da migração são verificadas no PostgreSQL isolado.

**D16 aprovada em 30/10/2026:** após experimentar a entrega, o responsável aprovou as músicas e os efeitos e autorizou a fase seguinte. Fase 38 concluída. A aprovação artística não equivale a garantir emendas perfeitas ou compatibilidade com todas as instalações de navegador.

### Registro das verificações (30/10/2026)

- Backend: 19 testes aprovados, incluindo perfil, equivalência da migração no PostgreSQL isolado e síntese dos efeitos. Ruff e formatação aprovados. Migração 0011 aplicada no desenvolvimento e `alembic check` sem operações pendentes.
- Frontend: 86 testes unitários aprovados, Prettier, tipos e compilação aprovados. A compilação mantém aviso de pacote JavaScript acima de 500 kB; otimização de carregamento segue para a fase de desempenho.
- Navegador: 9 cenários específicos de áudio (as seis faixas produzem sinal real e o silêncio zera a saída), 24 de menu, 42 de perfil/demonstração e 12 de galera aprovados, distribuídos entre computador, tablet e celular.
- Individual: 47 dos 48 cenários aprovados na execução conjunta; o de duas abas no tablet excedeu o tempo de interação e passou na repetição isolada. A regressão identificada de conexão atrasada foi corrigida para não apagar o estado sem rede depois da desconexão.
- No Edge local, requisições diretas de mídia receberam respostas 204 vazias, enquanto o servidor entregou os mesmos arquivos completos com status 200 ao cliente HTTP. Para a prova de sinal, o transporte de testes encaminha os bytes reais recebidos do servidor ao navegador, sem substituir o áudio por amostras falsas. Isso isola interferências locais de download; não equivale a garantir reprodução direta em qualquer instalação de navegador. A escuta prática continua necessária.
- Conferência adicional contra `http://localhost:5173/configuracoes`, sem simular a API ou interceptar mídia: Chromium recebeu `menu.mp3` com status 200 e iniciou reprodução, sem aviso de falha. O Vite local precisou ser reiniciado para limpar módulos antigos em memória; frontend e API ficaram disponíveis para a escuta do responsável.
