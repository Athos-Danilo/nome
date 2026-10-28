# Viabilidade da publicação gratuita

**Verificação inicial:** 2026-10-27, com decisão D18 aprovada em 2026-10-28 na fase 15: **Vercel para o frontend e Render gratuito para a API**, mantendo Neon e Atlas. Nenhum serviço foi contratado ou provisionado. Revalidar condições antes da publicação.

| Serviço | Uso possível | Evidência e limite relevante |
| --- | --- | --- |
| Render Free | API Python/FastAPI | Suspende após 15 minutos sem tráfego; a retomada leva aproximadamente um minuto. São 750 horas gratuitas por workspace/mês, compartilhadas entre serviços. Disco é efêmero. WebSockets são suportados, mas conexões podem cair em reinícios e suspensão. |
| Cloudflare Pages Free | Interface React estática | 500 builds/mês e máximo de 25 MiB por arquivo; considerar esse limite ao produzir músicas e imagens. Não é hospedagem convencional de servidor FastAPI. |
| Vercel Hobby | Alternativa para interface estática | Plano destinado a uso pessoal e não comercial; conferir elegibilidade e limites antes de escolher. Não presumir que funções equivalem a um servidor Python persistente. |
| Neon Free | PostgreSQL | Página consultada informa 100 CU-h por projeto/mês e 1 GB por projeto, sem cartão obrigatório; monitorar uso e suspensão da computação. |
| Atlas Free | Catálogo MongoDB | Até 500 conexões; versão MongoDB 8.0 gerenciada. A instalação local 8.2.5 exige manter compatibilidade com a versão de destino. |

## Organização aprovada e verificações pendentes

Render foi escolhido para a API acadêmica, com Neon e Atlas para persistência. Todo progresso deve ficar nos bancos, nunca no disco do servidor. A suspensão pode prejudicar uma apresentação se o serviço estiver frio; testar inicialização e informar carregamento, sem confundir falha de hospedagem com desistência do jogador.

O frontend ficará na Vercel por preferência expressa do responsável. A Vercel encaminhará `/api` ao Render por rewrite externo; o navegador utilizará a origem da interface para login, retorno Google e operações privadas. O servidor define callback a partir de `DECIFRA_ORIGEM_PUBLICA`, com cookies sem Domain, HttpOnly, SameSite=Lax e Secure em HTTPS. Não depender apenas de CORS nem definir callback a partir de cabeçalhos arbitrários.

A documentação oficial da Vercel confirma rewrites externos, mas isso não comprova o funcionamento do projeto publicado. Ainda faltam os endereços reais, a configuração executável do encaminhamento e testes de Cookie/Set-Cookie, Origin, query, POST, ausência de cache privado, HTTPS e retomada após suspensão. Não foi criado um `vercel.json` com destino fictício. O [guia Google](Autenticacao-google.md) detalha desenvolvimento e publicação separados.

A prova de interrupções da fase 13 precisa distinguir falha de rede, suspensão do serviço e saída do jogador. Não aprovar agora uma penalidade baseada em ausência momentânea de conexão. Suporte do provedor a WebSocket não garante o comportamento do produto.

## Antes da decisão e publicação

- Fase 15: hospedagens e estratégia de origem/cookie escolhidas. Callback local definido; teste real local depende da configuração pessoal Google/PostgreSQL. Domínio estável da Vercel e callback público serão registrados quando os serviços forem provisionados.
- Na fase 41: publicar ambiente de teste e conferir HTTPS, callback, cookies HttpOnly/Secure, conexão aos dois bancos, região, reinício, limites e ausência de cobrança automática.
- Manter planos gratuitos sem habilitar recursos pagos; verificar limites na conta do responsável. Uma cota excedida pode tornar o projeto indisponível.

## Fontes oficiais

- [Render — plano gratuito](https://render.com/docs/free).
- [Render — WebSockets](https://render.com/docs/websocket).
- [Cloudflare Pages — limites](https://developers.cloudflare.com/pages/platform/limits/).
- [Vercel — Hobby](https://vercel.com/docs/plans/hobby).
- [Vercel — rewrites externos](https://vercel.com/docs/routing/rewrites).
- [Neon — preços e Free](https://neon.com/pricing).
- [Atlas — limitações do Free](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/).
