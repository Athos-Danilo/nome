"""Casos de uso independentes de HTTP, PostgreSQL e biblioteca OAuth."""

import hashlib
import hmac
import re
import secrets
from datetime import UTC, datetime, timedelta

from aplicacao.modulos.autenticacao.contratos import (
    ContaAutenticada,
    FalhaAutenticacao,
    ProvedorGoogle,
    RepositorioAutenticacao,
    TentativaLogin,
)


def resumir(segredo: str) -> str:
    return hashlib.sha256(segredo.encode()).hexdigest()


def token_csrf(segredo: str) -> str:
    return hmac.new(segredo.encode(), b"decifra-csrf", hashlib.sha256).hexdigest()


def segredo_valido(segredo: str | None) -> bool:
    return bool(segredo and re.fullmatch(r"[A-Za-z0-9_-]{40,128}", segredo))


class ServicoAutenticacao:
    def __init__(
        self, repositorio: RepositorioAutenticacao, provedor: ProvedorGoogle, sessao_dias: int
    ) -> None:
        self.repositorio = repositorio
        self.provedor = provedor
        self.sessao_dias = sessao_dias

    async def iniciar(self) -> tuple[str, str]:
        estado, navegador = secrets.token_urlsafe(32), secrets.token_urlsafe(32)
        nonce, verificador = secrets.token_urlsafe(32), secrets.token_urlsafe(48)
        endereco = await self.provedor.endereco_login(estado, nonce, verificador)
        await self.repositorio.guardar_tentativa(
            TentativaLogin(
                resumir(estado),
                resumir(navegador),
                nonce,
                verificador,
                datetime.now(UTC) + timedelta(minutes=10),
            )
        )
        return endereco, navegador

    async def concluir(
        self,
        estado: str,
        navegador: str,
        codigo: str | None,
        erro: str | None,
        anterior: str | None,
    ) -> str:
        tentativa = await self.repositorio.consumir_tentativa(
            resumir(estado), resumir(navegador), datetime.now(UTC)
        )
        if tentativa is None:
            raise FalhaAutenticacao("RETORNO_INVALIDO", "Reinicie a entrada com Google.", 400)
        if erro or not codigo:
            raise FalhaAutenticacao(
                "LOGIN_CANCELADO" if erro == "access_denied" else "RETORNO_INVALIDO",
                "A entrada não foi concluída. Você pode tentar novamente.",
                400,
            )
        identidade = await self.provedor.autenticar(codigo, tentativa.nonce, tentativa.verificador)
        segredo = secrets.token_urlsafe(32)
        agora = datetime.now(UTC)
        await self.repositorio.abrir_sessao(
            identidade,
            resumir(segredo),
            resumir(anterior) if segredo_valido(anterior) else None,
            agora,
            agora + timedelta(days=self.sessao_dias),
        )
        return segredo

    async def consultar(self, segredo: str | None) -> ContaAutenticada:
        if not segredo_valido(segredo):
            raise FalhaAutenticacao("SESSAO_NECESSARIA", "Entre com sua conta Google.", 401)
        conta = await self.repositorio.consultar_sessao(resumir(segredo), datetime.now(UTC))
        if conta is None:
            raise FalhaAutenticacao("SESSAO_EXPIRADA", "Entre novamente com sua conta Google.", 401)
        return conta

    async def sair(self, segredo: str) -> None:
        await self.repositorio.revogar_sessao(resumir(segredo), datetime.now(UTC))
