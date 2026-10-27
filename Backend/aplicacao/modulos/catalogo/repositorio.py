"""Catálogo interno com publicação recuperável, inclusive em MongoDB sem réplicas."""

from collections import Counter
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Literal

from pydantic import ValidationError
from pymongo.asynchronous.database import AsyncDatabase
from pymongo.errors import DuplicateKeyError

from aplicacao.bancos.conteudo import TEMATICAS, DocumentoPalavra, chave_da_resposta
from aplicacao.modulos.catalogo.validacao import ItemCatalogo


class ErroCatalogo(Exception):
    """Conflito ou inconsistência que não autoriza sobrescrever conteúdo."""


@dataclass
class PlanoImportacao:
    novos: list[ItemCatalogo] = field(default_factory=list)
    recuperaveis: list[ItemCatalogo] = field(default_factory=list)
    repetidos: list[ItemCatalogo] = field(default_factory=list)
    erros: list[str] = field(default_factory=list)


def ler_documento(dados: dict) -> DocumentoPalavra:
    try:
        return DocumentoPalavra.model_validate(
            {chave: valor for chave, valor in dados.items() if chave != "_id"}
        )
    except ValidationError as falha:
        raise ErroCatalogo(
            "Há documento persistido inválido; corrija-o antes de importar."
        ) from falha


def mesmo_conteudo(documento: DocumentoPalavra, item: ItemCatalogo) -> bool:
    campos = set(type(item.conteudo).model_fields)
    return documento.model_dump(include=campos) == item.conteudo.model_dump()


class RepositorioCatalogo:
    def __init__(self, banco: AsyncDatabase) -> None:
        self.banco = banco
        self.palavras = banco["palavras"]
        self.versoes = banco["versoes_palavras"]

    async def criar_indices(self) -> None:
        await self.palavras.create_index("id", unique=True, name="uq_palavras_id")
        await self.palavras.create_index("resposta_chave", unique=True, name="uq_palavras_resposta")
        await self.palavras.create_index(
            [("tematicas", 1), ("dificuldade", 1)], name="ix_palavras_tematica_dificuldade"
        )
        await self.versoes.create_index(
            [("id", 1), ("revisao", 1)], unique=True, name="uq_versoes_identificador_revisao"
        )
        # A primeira revisão reserva a identidade da resposta mesmo se a publicação cair.
        await self.versoes.create_index(
            "resposta_chave",
            unique=True,
            partialFilterExpression={"revisao": 1},
            name="uq_versoes_resposta_inicial",
        )

    async def planejar(self, itens: list[ItemCatalogo]) -> PlanoImportacao:
        plano = PlanoImportacao()
        atuais: dict[str, DocumentoPalavra] = {}
        versoes: dict[tuple[str, int], DocumentoPalavra] = {}
        respostas: dict[str, str] = {}
        for colecao, destino in ((self.palavras, atuais), (self.versoes, versoes)):
            async for dados in colecao.find({}):
                documento = ler_documento(dados)
                chave = (
                    documento.id if colecao is self.palavras else (documento.id, documento.revisao)
                )
                if chave in destino:
                    raise ErroCatalogo("Há identificadores duplicados no banco; carga recusada.")
                destino[chave] = documento
                anterior = respostas.setdefault(documento.resposta_chave, documento.id)
                if anterior != documento.id:
                    raise ErroCatalogo("Há respostas duplicadas no banco; carga recusada.")
        for item in itens:
            atual = atuais.get(item.conteudo.id)
            reservada = versoes.get((item.conteudo.id, 1))
            existente = atual or reservada
            outro_id = respostas.get(chave_da_resposta(item.conteudo.resposta))
            erro = None
            if outro_id is not None and outro_id != item.conteudo.id:
                erro = f"resposta já reservada pelo identificador {outro_id}"
            elif existente is not None and not mesmo_conteudo(existente, item):
                erro = "identificador existente com conteúdo diferente; não será sobrescrito"
            elif atual is not None:
                historica = versoes.get((atual.id, atual.revisao))
                if historica is None or historica != atual:
                    erro = "catálogo atual diverge da revisão imutável"
            if erro:
                plano.erros.append(f"{item.arquivo}: palavras.{item.posicao}: {erro}.")
            elif atual is not None:
                plano.repetidos.append(item)
            elif reservada is not None:
                plano.recuperaveis.append(item)
            else:
                plano.novos.append(item)
        return plano

    async def registrar_versao(self, item: ItemCatalogo) -> DocumentoPalavra:
        agora = datetime.now(UTC)
        agora = agora.replace(microsecond=agora.microsecond // 1000 * 1000)
        documento = DocumentoPalavra(
            **item.conteudo.model_dump(),
            revisao=1,
            resposta_chave=chave_da_resposta(item.conteudo.resposta),
            lote_origem=item.lote,
            atualizado_em=agora,
        )
        try:
            await self.versoes.insert_one(documento.model_dump())
            return documento
        except DuplicateKeyError as falha:
            dados = await self.versoes.find_one({"id": documento.id, "revisao": 1})
            if dados is not None:
                existente = ler_documento(dados)
                if mesmo_conteudo(existente, item):
                    return existente
            raise ErroCatalogo(
                "Conflito ao reservar revisão; conteúdo existente preservado."
            ) from falha

    async def publicar(self, documento: DocumentoPalavra) -> bool:
        try:
            await self.palavras.insert_one(documento.model_dump())
            return True
        except DuplicateKeyError as falha:
            dados = await self.palavras.find_one({"id": documento.id})
            if dados is not None and ler_documento(dados) == documento:
                return False
            raise ErroCatalogo("Conflito ao publicar; conteúdo existente preservado.") from falha

    async def importar(self, plano: PlanoImportacao) -> int:
        if plano.erros:
            raise ErroCatalogo("Plano contém conflitos; nenhuma gravação foi iniciada.")
        await self.criar_indices()
        publicados = 0
        for item in plano.novos + plano.recuperaveis:
            documento = await self.registrar_versao(item)
            publicados += int(await self.publicar(documento))
        return publicados

    async def listar(
        self, tematica: str, dificuldade: Literal["facil", "medio", "dificil"], limite: int = 50
    ) -> list[DocumentoPalavra]:
        if tematica not in TEMATICAS or dificuldade not in {"facil", "medio", "dificil"}:
            raise ValueError("Temática ou dificuldade desconhecida.")
        if not 1 <= limite <= 500:
            raise ValueError("O limite deve estar entre 1 e 500.")
        cursor = self.palavras.find({"tematicas": tematica, "dificuldade": dificuldade})
        return [ler_documento(dados) async for dados in cursor.sort("id", 1).limit(limite)]

    async def buscar_revisao(self, palavra_id: str, revisao: int) -> DocumentoPalavra | None:
        dados = await self.versoes.find_one({"id": palavra_id, "revisao": revisao})
        return ler_documento(dados) if dados is not None else None

    async def quantidades(self) -> dict:
        tematicas: dict[str, Counter] = {tematica: Counter() for tematica in sorted(TEMATICAS)}
        total = 0
        async for dados in self.palavras.find({}):
            documento = ler_documento(dados)
            total += 1
            for tematica in documento.tematicas:
                tematicas[tematica][documento.dificuldade] += 1
        return {
            "total_respostas": total,
            "total_dicas": total * 5,
            "por_tematica": {nome: dict(contagens) for nome, contagens in tematicas.items()},
            "total_versoes": await self.versoes.count_documents({}),
        }
