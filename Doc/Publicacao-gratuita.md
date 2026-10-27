# Viabilidade da publicação gratuita

**Verificação:** 2026-10-27. Estudo da fase 08; nenhum serviço foi contratado ou provisionado. Revalidar condições antes da publicação. Neon e Atlas já foram escolhidos; hospedagens da interface e API continuam como decisão D18, até a fase 15.

| Serviço | Uso possível | Evidência e limite relevante |
| --- | --- | --- |
| Render Free | API Python/FastAPI | Suspende após 15 minutos sem tráfego; a retomada leva aproximadamente um minuto. São 750 horas gratuitas por workspace/mês, compartilhadas entre serviços. Disco é efêmero. WebSockets são suportados, mas conexões podem cair em reinícios e suspensão. |
| Cloudflare Pages Free | Interface React estática | 500 builds/mês e máximo de 25 MiB por arquivo; considerar esse limite ao produzir músicas e imagens. Não é hospedagem convencional de servidor FastAPI. |
| Vercel Hobby | Alternativa para interface estática | Plano destinado a uso pessoal e não comercial; conferir elegibilidade e limites antes de escolher. Não presumir que funções equivalem a um servidor Python persistente. |
| Neon Free | PostgreSQL | Página consultada informa 100 CU-h por projeto/mês e 1 GB por projeto, sem cartão obrigatório; monitorar uso e suspensão da computação. |
| Atlas Free | Catálogo MongoDB | Até 500 conexões; versão MongoDB 8.0 gerenciada. A instalação local 8.2.5 exige manter compatibilidade com a versão de destino. |

## Recomendação a validar

Render é candidato para a API acadêmica, com Neon e Atlas para persistência. Todo progresso deve ficar nos bancos, nunca no disco do servidor. A suspensão pode prejudicar uma apresentação se o serviço estiver frio; testar inicialização e informar carregamento, sem confundir falha de hospedagem com desistência do jogador.

Para o login, preferir interface e `/api` na mesma origem pública. Uma possibilidade a testar é servir o resultado compilado do React pelo mesmo serviço Python, evitando cookies entre sites distintos. Isso exige validar a preparação dos arquivos estáticos no processo de publicação; ainda não foi configurado. Alternativamente, interface estática em Cloudflare/Vercel exige estudar encaminhamento de `/api`, cookies e eventuais conexões persistentes. Não escolher domínios separados confiando apenas em CORS: políticas de cookies do navegador também importam.

A prova de interrupções da fase 13 precisa distinguir falha de rede, suspensão do serviço e saída do jogador. Não aprovar agora uma penalidade baseada em ausência momentânea de conexão. Suporte do provedor a WebSocket não garante o comportamento do produto.

## Antes da decisão e publicação

- Até a fase 15: escolher hospedagem, origem pública, callback Google e estratégia de cookie, com teste real em navegador. Não há criação de conta ou domínio nesta fase.
- Na fase 41: publicar ambiente de teste e conferir HTTPS, callback, cookies HttpOnly/Secure, conexão aos dois bancos, região, reinício, limites e ausência de cobrança automática.
- Manter planos gratuitos sem habilitar recursos pagos; verificar limites na conta do responsável. Uma cota excedida pode tornar o projeto indisponível.

## Fontes oficiais

- [Render — plano gratuito](https://render.com/docs/free).
- [Render — WebSockets](https://render.com/docs/websocket).
- [Cloudflare Pages — limites](https://developers.cloudflare.com/pages/platform/limits/).
- [Vercel — Hobby](https://vercel.com/docs/plans/hobby).
- [Neon — preços e Free](https://neon.com/pricing).
- [Atlas — limitações do Free](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/).
