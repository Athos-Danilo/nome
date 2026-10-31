"""Contrato do preparo local da Vercel, sem contas ou conexões externas."""

import json
import subprocess
import sys
from pathlib import Path

import pytest

PASTA_BACKEND = Path(__file__).resolve().parents[1]


def executar(saida: Path, api: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, "-m", "comandos.publicacao", "--api", api, "--saida", str(saida)],
        cwd=PASTA_BACKEND,
        capture_output=True,
        text=True,
        check=False,
    )


def teste_prepara_api_antes_do_fallback_e_impede_cache_privado(tmp_path: Path) -> None:
    saida = tmp_path / "vercel.json"
    resultado = executar(saida, "https://decifra-api-teste.onrender.com/")
    assert resultado.returncode == 0, resultado.stderr
    configuracao = json.loads(saida.read_text(encoding="utf-8"))
    assert configuracao["framework"] == "vite"
    assert configuracao["installCommand"] == "npm ci"
    assert configuracao["buildCommand"] == "npm run build"
    assert configuracao["outputDirectory"] == "dist"
    assert configuracao["rewrites"] == [
        {
            "source": "/api/:caminho*",
            "destination": "https://decifra-api-teste.onrender.com/api/:caminho*",
        },
        {"source": "/:caminho*", "destination": "/index.html"},
    ]
    cabecalhos = configuracao["headers"][0]
    assert cabecalhos["source"] == "/api/:caminho*"
    assert {item["key"]: item["value"] for item in cabecalhos["headers"]} == {
        "Cache-Control": "private, no-store",
        "Vercel-CDN-Cache-Control": "no-store",
    }


@pytest.mark.parametrize(
    "api",
    [
        "http://decifra-api.onrender.com",
        "https://localhost",
        "https://127.0.0.1",
        "https://outra.example",
        "https://onrender.com",
        "https://api.onrender.com.exemplo.com",
        "https://api.onrender.com:8443",
        "https://usuario:segredo@api.onrender.com",
        "https://api.onrender.com/api",
        "https://api.onrender.com?segredo=teste",
        "https://api.onrender.com#fragmento",
        "https://API.onrender.com\n",
    ],
)
def teste_rejeita_destino_invalido_sem_gravar_ou_revelar_argumento(
    tmp_path: Path, api: str
) -> None:
    saida = tmp_path / "vercel.json"
    resultado = executar(saida, api)
    assert resultado.returncode == 2
    assert not saida.exists()
    assert "Informe a origem HTTPS pública do Render" in resultado.stderr
    assert api not in resultado.stderr


def teste_reexecucao_preserva_arquivo_identico_e_recusa_alteracao(tmp_path: Path) -> None:
    saida = tmp_path / "vercel.json"
    assert executar(saida, "https://api.onrender.com").returncode == 0
    conteudo = saida.read_bytes()
    assert executar(saida, "https://api.onrender.com").returncode == 0
    assert saida.read_bytes() == conteudo
    assert executar(saida, "https://outra-api.onrender.com").returncode == 2
    assert saida.read_bytes() == conteudo
