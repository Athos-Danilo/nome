# Ícones da interface — revisão da fase 45

**04/11/2026:** o responsável confirmou o funcionamento dos botões, mas pediu substituir os símbolos de navegação, tema e música por ícones mais refinados. A interrogação foi preservada por preferência expressa. Não se presume aprovação estética posterior dos novos desenhos.

Foi incorporada geometria SVG da família [Lucide](https://github.com/lucide-icons/lucide/tree/1980e3d59b0fa1a2aeb566d5902b25ee98204001/icons), revisão `1980e3d59b0fa1a2aeb566d5902b25ee98204001`, com traço de 1,8 unidades, pontas e junções arredondadas e área de 24 × 24. Os contornos usam `currentColor`, acompanhando paletas, modo escuro, foco e seleção da navegação.

| Controle | Geometria oficial |
| --- | --- |
| Início | `house` |
| Perfil | `user-round` |
| Histórico | `clock-arrow-left` |
| Rankings | `trophy` |
| Configurações | `settings-2` |
| Ativar tema claro | `sun` |
| Ativar tema escuro | `moon-star` |
| Música do menu ligada | `volume-2` |
| Música do menu desligada | `volume-x` |

Os SVGs são decorativos e não recebem foco; botões e links mantêm nomes acessíveis, texto e comportamento anteriores. A música continua com estado `aria-pressed`; a interrogação mantém o desenho existente. Não há fonte de ícones, pacote React novo, dependência de CDN ou serviço pago.

Implementação centralizada em [Icone.tsx](../../Frontend/src/componentes/Icone.tsx). A [licença integral](../../Frontend/public/icones/LICENCA-Lucide.txt) foi preservada, incluindo o aviso ISC do Lucide e o aviso MIT dos ícones derivados do Feather. A licença permite o uso dos recursos; “premium” descreve a direção estética solicitada, não uma compra ou coleção proprietária.
