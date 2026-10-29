"""Prova opcional com React compilado, HTTP real e PostgreSQL descartável."""

import asyncio
import os
import shutil
import socket
import subprocess
import threading
import time
from pathlib import Path

import pytest
import uvicorn
from fastapi.responses import FileResponse
from sqlalchemy import select

from aplicacao.bancos.acoes import resultados_individuais
from aplicacao.nucleo.configuracoes import Configuracoes
from aplicacao.principal import criar_aplicacao
from testes.teste_autenticacao_http import GoogleControlado
from testes.teste_individual import CatalogoControlado
from testes.teste_perfil import base_perfil  # noqa: F401
from testes.teste_persistencia import banco  # noqa: F401


@pytest.mark.skipif(
    os.environ.get("DECIFRA_EXECUTAR_JOGO_COMPLETO") != "1",
    reason="Prova opcional: compilar Frontend e definir DECIFRA_EXECUTAR_JOGO_COMPLETO=1.",
)
def teste_react_http_e_banco_confirmam_mesmos_pontos(base_perfil):  # noqa: F811
    frente = Path(__file__).resolve().parents[2] / "Frontend"
    distribuicao = (frente / "dist").resolve()
    assert (distribuicao / "index.html").is_file(), "Execute npm run build antes desta prova."
    assert shutil.which("node"), "Node é necessário para o navegador."
    with socket.socket() as escuta:
        escuta.bind(("127.0.0.1", 0))
        origem = f"http://127.0.0.1:{escuta.getsockname()[1]}"
        api = criar_aplicacao(
            Configuracoes(
                _env_file=None,
                ambiente="teste",
                origem_publica=origem,
                postgresql_url=base_perfil.url.render_as_string(hide_password=False),
            ),
            provedor_google=GoogleControlado(),
        )
        catalogo = CatalogoControlado()
        api.state.individual.catalogo = catalogo

        async def sortear():
            return [
                {"id": p.id, "revisao": 1, "dificuldade": "facil", "tematica": "paises"}
                for p in catalogo.itens[:3]
            ]

        api.state.demonstracoes.sortear = sortear

        @api.get("/{rota:path}")
        async def interface(rota: str):
            arquivo = (distribuicao / rota).resolve()
            if not arquivo.is_relative_to(distribuicao) or not arquivo.is_file():
                arquivo = distribuicao / "index.html"
            return FileResponse(arquivo)

        servidor = uvicorn.Server(uvicorn.Config(api, log_level="error"))

        def executar():
            asyncio.run(servidor.serve(sockets=[escuta]), loop_factory=asyncio.SelectorEventLoop)

        processo = threading.Thread(target=executar, daemon=True)
        processo.start()
        try:
            limite = time.monotonic() + 15
            while not servidor.started and time.monotonic() < limite:
                time.sleep(0.05)
            assert servidor.started

            ambiente = {**os.environ, "DECIFRA_ORIGEM_PROVA": origem}
            resultado = subprocess.run(
                [shutil.which("node"), "testes-navegador/integracao-http.mjs"],
                text=True,
                cwd=frente,
                env=ambiente,
                capture_output=True,
                timeout=60,
            )
            assert resultado.returncode == 0, resultado.stdout + resultado.stderr
            with base_perfil.connect() as conexao:
                assert list(conexao.execute(select(resultados_individuais.c.pontos)).scalars()) == [
                    300,
                    300,
                ]
        finally:
            servidor.should_exit = True
            processo.join(timeout=10)
            assert not processo.is_alive()
