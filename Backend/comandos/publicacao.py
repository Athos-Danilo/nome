"""Prepara o encaminhamento da Vercel após conhecer o endereço real do Render."""

import argparse
import json
import re
from pathlib import Path


def configuracao_vercel(api: str) -> dict[str, object]:
    """Aceita somente a origem pública padrão do serviço aprovado para a API."""
    if not re.fullmatch(r"https://[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.onrender\.com/?", api):
        raise ValueError(
            "Informe a origem HTTPS pública do Render, sem caminho, porta ou credenciais."
        )
    return {
        "$schema": "https://openapi.vercel.sh/vercel.json",
        "framework": "vite",
        "installCommand": "npm ci",
        "buildCommand": "npm run build",
        "outputDirectory": "dist",
        "rewrites": [
            {"source": "/api/:caminho*", "destination": f"{api.rstrip('/')}/api/:caminho*"},
            {"source": "/:caminho*", "destination": "/index.html"},
        ],
        "headers": [
            {
                "source": "/api/:caminho*",
                "headers": [
                    {"key": "Cache-Control", "value": "private, no-store"},
                    {"key": "Vercel-CDN-Cache-Control", "value": "no-store"},
                ],
            }
        ],
    }


def principal() -> int:
    argumentos = argparse.ArgumentParser(
        description="Preparar vercel.json com o endereço real da API, sem acessar serviços."
    )
    argumentos.add_argument("--api", required=True, help="Origem HTTPS pública do Render.")
    argumentos.add_argument("--saida", required=True, type=Path, help="Destino do vercel.json.")
    opcoes = argumentos.parse_args()
    try:
        configuracao = configuracao_vercel(opcoes.api)
        conteudo = json.dumps(configuracao, ensure_ascii=False, indent=2) + "\n"
        if opcoes.saida.exists():
            if json.loads(opcoes.saida.read_text(encoding="utf-8")) == configuracao:
                print("Configuração idêntica já existente; arquivo preservado.")
                return 0
            raise ValueError("O destino já existe com outra configuração; revise-o manualmente.")
        with opcoes.saida.open("x", encoding="utf-8", newline="\n") as arquivo:
            arquivo.write(conteudo)
    except (ValueError, OSError) as falha:
        # Erros de sistema podem conter caminhos privados; não devolver seus detalhes.
        mensagem = (
            str(falha) if isinstance(falha, ValueError) else "Não foi possível gravar o arquivo."
        )
        argumentos.error(mensagem)
    print("Configuração preparada. Use Frontend como diretório raiz na Vercel.")
    return 0


if __name__ == "__main__":
    raise SystemExit(principal())
