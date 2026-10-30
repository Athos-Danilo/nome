"""Transições imutáveis da galera; conteúdo privado nunca compõe a saída pública.

O adaptador deve carregar o estado sob bloqueio e persistir a transição inteira
na mesma transação. Este motor não abre conexões nem gerencia relógios ou HTTP.
"""

import random
import unicodedata
from collections.abc import Callable
from dataclasses import dataclass, field, replace
from typing import Literal

from aplicacao.bancos.conteudo import chave_da_resposta

type Sorteador = Callable[[tuple[str, ...]], tuple[str, ...]]
TECLAS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÇ0123456789"


class ErroGalera(ValueError):
    def __init__(self, codigo: str, mensagem: str):
        super().__init__(mensagem)
        self.codigo = codigo


@dataclass(frozen=True)
class Painel:
    tematica: str
    respostas: tuple[str, ...] = field(repr=False)


@dataclass(frozen=True)
class Jogada:
    id_acao: str
    versao_esperada: int
    participante: str
    tipo: Literal["letra", "palpite"]
    valor: str
    palavra: int = 0


@dataclass(frozen=True)
class VotoExtra:
    id_acao: str
    versao_esperada: int
    participante: str
    aceita: bool


@dataclass(frozen=True)
class AbrirExtra:
    id_acao: str
    versao_esperada: int
    painel: Painel = field(repr=False)


type Acao = Jogada | VotoExtra | AbrirExtra


@dataclass(frozen=True)
class EstadoGalera:
    participantes: tuple[str, ...]
    paineis: tuple[Painel, ...] = field(repr=False)
    pontos: tuple[int, ...]
    ordem: tuple[str, ...]
    reveladas: tuple[frozenset[int], ...]
    sessao: int = 0
    vez: int = 0
    versao: int = 0
    estado: Literal["em_andamento", "aguardando_desempate", "concluida"] = "em_andamento"
    tentadas: frozenset[str] = frozenset()
    lideres: tuple[str, ...] = ()
    acoes: tuple[Acao, ...] = field(default=(), repr=False)
    extra: bool = False
    concordantes: tuple[str, ...] = ()
    dificuldade: Literal["facil", "medio", "dificil"] = "facil"


def familia(letra: str) -> str:
    base = unicodedata.normalize("NFD", letra)[0]
    return base if base in "AEIOU" else letra


def sortear_ordem(ids: tuple[str, ...]) -> tuple[str, ...]:
    return tuple(random.SystemRandom().sample(ids, len(ids)))


def conferir_ordem(ordem: tuple[str, ...], ids: tuple[str, ...]) -> None:
    if len(ordem) != len(ids) or set(ordem) != set(ids):
        raise ErroGalera("ORDEM_INVALIDA", "A ordem deve conter cada participante uma vez.")


def iniciar(
    participantes: tuple[str, ...],
    paineis: tuple[Painel, ...],
    ordem: tuple[str, ...] | None = None,
    *,
    dificuldade: Literal["facil", "medio", "dificil"] = "facil",
) -> EstadoGalera:
    """Recebe conteúdo oficial e a primeira ordem já reservada na preparação."""
    if not 1 <= len(participantes) <= 3 or len(set(participantes)) != len(participantes):
        raise ErroGalera("CONFIGURACAO_INVALIDA", "Informe de um a três participantes distintos.")
    if not 1 <= len(paineis) <= 5:
        raise ErroGalera("CONFIGURACAO_INVALIDA", "Informe de uma a cinco sessões regulares.")
    if dificuldade not in {"facil", "medio", "dificil"}:
        raise ErroGalera("CONFIGURACAO_INVALIDA", "Escolha uma dificuldade válida.")
    respostas = [r for p in paineis for r in p.respostas]
    if (
        any(len(p.respostas) != len(participantes) or not p.tematica for p in paineis)
        or len({chave_da_resposta(r) for r in respostas}) != len(respostas)
        or any(
            r != unicodedata.normalize("NFC", r).upper() or not any(c.isalnum() for c in r)
            for r in respostas
        )
    ):
        raise ErroGalera("CONFIGURACAO_INVALIDA", "Confira os painéis e suas respostas únicas.")
    primeira = ordem if ordem is not None else sortear_ordem(participantes)
    conferir_ordem(primeira, participantes)
    return EstadoGalera(
        participantes,
        paineis,
        (0,) * len(participantes),
        primeira,
        tuple(frozenset() for _ in paineis[0].respostas),
        dificuldade=dificuldade,
    )


def bloqueadas(estado: EstadoGalera) -> frozenset[str]:
    ocorrencias: dict[str, list[bool]] = {}
    for resposta, visiveis in zip(
        estado.paineis[estado.sessao].respostas, estado.reveladas, strict=True
    ):
        for posicao, letra in enumerate(resposta):
            if letra.isalnum():
                ocorrencias.setdefault(familia(letra), []).append(posicao in visiveis)
    return estado.tentadas | frozenset(c for c, posicoes in ocorrencias.items() if all(posicoes))


def publicar(estado: EstadoGalera) -> dict:
    """Projeção explícita: somente o painel atual, sem respostas ocultas ou dicas."""
    painel = estado.paineis[estado.sessao]
    return {
        "estado": estado.estado,
        "versao": estado.versao,
        "sessao": estado.sessao + 1,
        "tematica": painel.tematica,
        "ordem": list(estado.ordem),
        "participante_atual": (
            estado.ordem[estado.vez] if estado.estado == "em_andamento" else None
        ),
        "pontuacoes": dict(zip(estado.participantes, estado.pontos, strict=True)),
        "lideres": list(estado.lideres),
        "extra": estado.extra,
        "dificuldade": estado.dificuldade,
        "concordantes": list(estado.concordantes),
        "bloqueadas": sorted(bloqueadas(estado)),
        "palavras": [
            [c if not c.isalnum() or i in visiveis else None for i, c in enumerate(resposta)]
            for resposta, visiveis in zip(painel.respostas, estado.reveladas, strict=True)
        ],
    }


def conferir_reenvio(estado: EstadoGalera, jogada: Acao) -> bool:
    """Reenvio idêntico é neutro; reuso do identificador com outro conteúdo é conflito."""
    if not isinstance(jogada.id_acao, str) or not jogada.id_acao.strip():
        raise ErroGalera("ACAO_INVALIDA", "Informe o identificador da ação.")
    for anterior in estado.acoes:
        if anterior.id_acao == jogada.id_acao:
            if anterior != jogada:
                raise ErroGalera("ACAO_REUTILIZADA", "Essa ação já foi usada com outros dados.")
            return False
    if type(jogada.versao_esperada) is not int or jogada.versao_esperada != estado.versao:
        raise ErroGalera("VERSAO_DESATUALIZADA", "Atualize o painel antes de jogar.")
    return True


def conferir_jogada(estado: EstadoGalera, jogada: Jogada) -> bool:
    if not conferir_reenvio(estado, jogada):
        return False
    if estado.estado != "em_andamento":
        raise ErroGalera("PARTIDA_ENCERRADA", "O painel não está aceitando jogadas.")
    if jogada.participante != estado.ordem[estado.vez]:
        raise ErroGalera("FORA_DA_VEZ", "Aguarde a vez desse participante.")
    if not isinstance(jogada.valor, str):
        raise ErroGalera("ACAO_INVALIDA", "Informe uma letra ou um palpite.")
    return True


def avaliar_letra(
    estado: EstadoGalera, texto: str
) -> tuple[tuple[frozenset[int], ...], bool, frozenset[str]]:
    if len(texto) != 1 or familia(texto) not in TECLAS:
        raise ErroGalera("LETRA_INVALIDA", "Escolha uma letra ou algarismo do teclado.")
    tecla = familia(texto)
    if tecla in bloqueadas(estado):
        raise ErroGalera("LETRA_BLOQUEADA", "Essa letra está bloqueada. Escolha outra.")
    reveladas = tuple(
        visiveis
        | frozenset(i for i, c in enumerate(resposta) if c.isalnum() and familia(c) == tecla)
        for resposta, visiveis in zip(
            estado.paineis[estado.sessao].respostas, estado.reveladas, strict=True
        )
    )
    return reveladas, reveladas != estado.reveladas, estado.tentadas | {tecla}


def avaliar_palpite(
    estado: EstadoGalera, texto: str, palavra: int
) -> tuple[tuple[frozenset[int], ...], bool, frozenset[str]]:
    respostas = estado.paineis[estado.sessao].respostas
    if type(palavra) is not int or not 0 <= palavra < len(respostas):
        raise ErroGalera("PALAVRA_INVALIDA", "Escolha uma palavra deste painel.")
    resposta = respostas[palavra]
    visiveis = estado.reveladas[palavra]
    if all(not c.isalnum() or i in visiveis for i, c in enumerate(resposta)):
        raise ErroGalera("PALAVRA_RESOLVIDA", "Essa palavra já foi resolvida.")
    if len(texto) != len(resposta) or any(
        (c.isalnum() and not t.isalnum()) or (not c.isalnum() and c != t)
        for c, t in zip(resposta, texto, strict=False)
    ):
        raise ErroGalera("PALPITE_INCOMPLETO", "Preencha as posições e preserve os sinais fixos.")
    if any(texto[i] != resposta[i] for i in visiveis):
        raise ErroGalera("POSICAO_FIXA", "As posições já reveladas não podem ser alteradas.")
    novas = visiveis | frozenset(
        i for i, (c, t) in enumerate(zip(resposta, texto, strict=True)) if c.isalnum() and c == t
    )
    reveladas = tuple(novas if i == palavra else p for i, p in enumerate(estado.reveladas))
    return reveladas, texto == resposta, estado.tentadas


def concluir_sessao(estado: EstadoGalera, sortear: Sorteador) -> EstadoGalera:
    if estado.sessao + 1 < len(estado.paineis):
        ordem = sortear(estado.participantes)
        conferir_ordem(ordem, estado.participantes)
        return replace(
            estado,
            sessao=estado.sessao + 1,
            ordem=ordem,
            vez=0,
            tentadas=frozenset(),
            reveladas=tuple(frozenset() for _ in estado.paineis[estado.sessao + 1].respostas),
        )
    maior = max(estado.pontos)
    lideres = tuple(
        p for p, pontos in zip(estado.participantes, estado.pontos, strict=True) if pontos == maior
    )
    return replace(
        estado,
        lideres=lideres,
        estado="aguardando_desempate" if len(lideres) > 1 and not estado.extra else "concluida",
    )


def jogar(
    estado: EstadoGalera, jogada: Jogada, *, sortear: Sorteador = sortear_ordem
) -> EstadoGalera:
    if not conferir_jogada(estado, jogada):
        return estado
    texto = unicodedata.normalize("NFC", jogada.valor).upper()
    if jogada.tipo == "letra":
        reveladas, acertou, tentadas = avaliar_letra(estado, texto)
    elif jogada.tipo == "palpite":
        reveladas, acertou, tentadas = avaliar_palpite(estado, texto, jogada.palavra)
    else:
        raise ErroGalera("ACAO_INVALIDA", "Escolha letra ou palpite completo.")
    ganho = 100 * sum(len(n) - len(a) for n, a in zip(reveladas, estado.reveladas, strict=True))
    indice = estado.participantes.index(jogada.participante)
    pontos = tuple(p + ganho if i == indice else p for i, p in enumerate(estado.pontos))
    novo = replace(
        estado,
        pontos=pontos,
        reveladas=reveladas,
        tentadas=tentadas,
        vez=estado.vez if acertou else (estado.vez + 1) % len(estado.ordem),
        versao=estado.versao + 1,
        acoes=(*estado.acoes, jogada),
    )
    if all(
        not c.isalnum() or i in visiveis
        for resposta, visiveis in zip(
            estado.paineis[estado.sessao].respostas, reveladas, strict=True
        )
        for i, c in enumerate(resposta)
    ):
        return concluir_sessao(novo, sortear)
    return novo
