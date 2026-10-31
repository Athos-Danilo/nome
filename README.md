# Decifra

Projeto desenvolvido para as disciplinas de Web II e Banco de Dados II.

Jogo de palavras com dicas progressivas e modo com a galera no mesmo dispositivo. Backend Python/FastAPI, interface React/TypeScript e dados divididos entre PostgreSQL e MongoDB.

## Desenvolvimento

Individual, galera no mesmo dispositivo, demonstração, login Google, perfil, 20 avatares, preferências, histórico, estatísticas, rankings, animações do Aurélio e áudio estão implementados. Ambiente público publicado e validado na fase 41: [jogar Decifra](https://decifra-inky.vercel.app). O catálogo público contém 375 respostas aprovadas; a meta final permanece 500. A API gratuita pode levar algum tempo para despertar após inatividade. O protótipo visual aprovado é um estudo separado da aplicação.

- [Preparar e executar o ambiente local](Doc/Ambiente-local.md).
- [Revisar o protótipo aprovado](Doc/Prototipos/LEIA-ME.md).
- [Requisitos e regras do jogo](Doc/Detalhes.md).
- [Arquitetura e bibliotecas](Doc/Planejamento-tecnico.md).
- [Modelagem e política de anonimização](Doc/Modelagem-dados.md).
- [Contratos previstos da API](Doc/Contratos-api.md).
- [Validar e importar o catálogo](Doc/Importacao-catalogo.md).
- [Prova e decisões sobre interrupções](Doc/Prova-interrupcoes.md).
- [Configurar login Google e sessão](Doc/Autenticacao-google.md).
- [Perfil, avatares, preferências e exclusão](Doc/Perfil-preferencias.md).
- [Visitante e vinculação da demonstração](Doc/Demonstracao-visitante.md).
- [Motor individual e configuração](Doc/Motor-individual.md).
- [Direção visual](Doc/Guia-visual.md).
- [Viabilidade da publicação gratuita](Doc/Publicacao-gratuita.md).
- [Publicação: configuração, evidências e pendências](Doc/Publicacao-ambiente.md).

Leia [AGENTS.md](AGENTS.md) antes de modificar o projeto. Arquivos de configuração privada, dependências instaladas e o roteiro pessoal de acompanhamento permanecem fora do Git.
