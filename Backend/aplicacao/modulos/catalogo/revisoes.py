"""Publicação explícita de correções de dicas, preservando revisões históricas."""

from dataclasses import dataclass, field
from datetime import UTC, datetime

from pymongo.errors import DuplicateKeyError

from aplicacao.bancos.conteudo import DocumentoPalavra
from aplicacao.modulos.catalogo.repositorio import (
    ErroCatalogo,
    RepositorioCatalogo,
    ler_documento,
    mesmo_conteudo,
)
from aplicacao.modulos.catalogo.validacao import ItemCatalogo


@dataclass(frozen=True)
class AlteracaoRevisao:
    base: DocumentoPalavra
    nova: DocumentoPalavra


@dataclass
class PlanoRevisoes:
    alteradas: list[AlteracaoRevisao] = field(default_factory=list)
    identicas: list[str] = field(default_factory=list)
    erros: list[str] = field(default_factory=list)


class PublicadorRevisoes:
    def __init__(self, catalogo: RepositorioCatalogo) -> None:
        self.catalogo = catalogo

    async def planejar(
        self,
        originais: list[ItemCatalogo],
        propostas: list[ItemCatalogo],
        revisao_base: int,
    ) -> PlanoRevisoes:
        """Compara duas versões editoriais e o banco, sem escrita nem índices."""
        plano = PlanoRevisoes()
        anteriores = {item.conteudo.id: item for item in originais}
        posteriores = {item.conteudo.id: item for item in propostas}
        if (
            type(revisao_base) is not int
            or revisao_base < 1
            or not anteriores
            or anteriores.keys() != posteriores.keys()
            or len(anteriores) != len(originais)
            or len(posteriores) != len(propostas)
        ):
            plano.erros.append(
                "Informe uma revisão base positiva e os mesmos IDs únicos nos lotes."
            )
            return plano
        for identificador, original in anteriores.items():
            proposta = posteriores[identificador]
            if original.lote != proposta.lote or original.conteudo.model_dump(
                exclude={"dicas"}
            ) != proposta.conteudo.model_dump(exclude={"dicas"}):
                plano.erros.append(f"{identificador}: somente as dicas podem ser corrigidas.")
                continue
            base = await self.catalogo.buscar_revisao(identificador, revisao_base)
            dados = await self.catalogo.palavras.find_one({"id": identificador})
            if (
                base is None
                or dados is None
                or base.lote_origem != original.lote
                or not mesmo_conteudo(base, original)
            ):
                plano.erros.append(
                    f"{identificador}: revisão base ausente ou diferente do arquivo."
                )
                continue
            atual = ler_documento(dados)
            historica = await self.catalogo.buscar_revisao(identificador, atual.revisao)
            if historica != atual:
                plano.erros.append(f"{identificador}: catálogo atual diverge da revisão imutável.")
                continue
            if original.conteudo == proposta.conteudo:
                if atual != base:
                    plano.erros.append(f"{identificador}: conteúdo sem alteração divergiu da base.")
                else:
                    plano.identicas.append(identificador)
                continue
            reservada = await self.catalogo.buscar_revisao(identificador, revisao_base + 1)
            if reservada is not None and (
                not mesmo_conteudo(reservada, proposta) or reservada.lote_origem != base.lote_origem
            ):
                plano.erros.append(f"{identificador}: a próxima revisão já tem outro conteúdo.")
                continue
            if reservada is not None and atual == reservada:
                plano.identicas.append(identificador)
                continue
            if atual != base:
                plano.erros.append(f"{identificador}: catálogo avançou; use a base correta.")
                continue
            agora = datetime.now(UTC)
            nova = reservada or DocumentoPalavra(
                **proposta.conteudo.model_dump(),
                resposta_chave=base.resposta_chave,
                revisao=revisao_base + 1,
                lote_origem=base.lote_origem,
                atualizado_em=agora.replace(microsecond=agora.microsecond // 1000 * 1000),
            )
            plano.alteradas.append(AlteracaoRevisao(base, nova))
        return plano

    async def reservar(self, nova: DocumentoPalavra) -> DocumentoPalavra:
        try:
            await self.catalogo.versoes.insert_one(nova.model_dump())
            return nova
        except DuplicateKeyError as falha:
            existente = await self.catalogo.buscar_revisao(nova.id, nova.revisao)
            if existente is not None and existente.model_dump(exclude={"atualizado_em"}) == (
                nova.model_dump(exclude={"atualizado_em"})
            ):
                return existente
            raise ErroCatalogo(
                "Revisão reservada por outra correção; conteúdo preservado."
            ) from falha

    async def publicar_atual(self, base: DocumentoPalavra, nova: DocumentoPalavra) -> int:
        # Comparação integral, não só do número: um plano antigo não ganha de outra gravação.
        resultado = await self.catalogo.palavras.replace_one(base.model_dump(), nova.model_dump())
        if resultado.matched_count:
            return 1
        dados = await self.catalogo.palavras.find_one({"id": nova.id})
        if dados is not None and ler_documento(dados) == nova:
            return 0
        raise ErroCatalogo("Catálogo mudou após a conferência; revisão histórica preservada.")

    async def publicar(self, plano: PlanoRevisoes) -> int:
        if plano.erros:
            raise ErroCatalogo("Plano de revisões contém conflitos; nenhuma gravação iniciada.")
        if not plano.alteradas:
            return 0
        await self.catalogo.criar_indices()
        publicadas = 0
        for alteracao in plano.alteradas:
            nova = await self.reservar(alteracao.nova)
            publicadas += await self.publicar_atual(alteracao.base, nova)
        return publicadas
