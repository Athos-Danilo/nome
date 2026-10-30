"""Regras da galera independentes de HTTP, banco e animações."""

import importlib.util

import pytest


def motor():
    assert importlib.util.find_spec("aplicacao.modulos.galera.motor") is not None, (
        "Falta o motor da galera para avaliar letras, palpites, turnos e sessões."
    )
    from aplicacao.modulos.galera import motor

    return motor


def partida(respostas=("CASA", "MADEIRA"), seguintes=()):
    m = motor()
    sessoes = [m.Painel("objetos", tuple(respostas))]
    sessoes += [m.Painel("objetos", tuple(r)) for r in seguintes]
    ids = tuple(f"p{i}" for i in range(len(respostas)))
    return m.iniciar(ids, tuple(sessoes), ordem=ids)


def jogar(estado, tipo, valor, palavra=0, pessoa=None, acao=None, versao=None):
    m = motor()
    return m.jogar(
        estado,
        m.Jogada(
            acao or f"acao-{estado.versao}",
            estado.versao if versao is None else versao,
            pessoa or estado.ordem[estado.vez],
            tipo,
            valor,
            palavra,
        ),
    )


def falha(codigo, operacao):
    with pytest.raises(motor().ErroGalera) as erro:
        operacao()
    assert erro.value.codigo == codigo


def teste_a_revela_quatro_posicoes_em_casa_e_madeira_e_mantem_vez():
    e = partida()
    novo = jogar(e, "letra", "a")
    assert novo.pontos == (400, 0)
    assert novo.vez == 0
    assert motor().publicar(novo)["palavras"] == [
        [None, "A", None, "A"],
        [None, "A", None, None, None, None, "A"],
    ]
    assert e.pontos == (0, 0)  # O cálculo não altera o estado recebido.
    falha("LETRA_BLOQUEADA", lambda: jogar(novo, "letra", "Á"))


def teste_letra_ausente_bloqueia_e_passa_vez_sem_pontos():
    e = jogar(partida(), "letra", "W")
    assert e.pontos == (0, 0) and e.vez == 1
    assert "W" in motor().publicar(e)["bloqueadas"]
    assert "Z" not in motor().publicar(e)["bloqueadas"]
    falha("LETRA_BLOQUEADA", lambda: jogar(e, "letra", "W"))


def teste_cama_para_casa_fixa_tres_posicoes_so_na_palavra_selecionada():
    e = jogar(partida(), "palpite", "CAMA")
    assert e.pontos == (300, 0) and e.vez == 1
    assert motor().publicar(e)["palavras"] == [["C", "A", None, "A"], [None] * 7]
    assert "A" not in motor().publicar(e)["bloqueadas"]
    e = jogar(e, "palpite", "CASA")
    assert e.pontos == (300, 100) and e.vez == 1
    e = jogar(e, "letra", "A")
    assert e.pontos == (300, 300)


@pytest.mark.parametrize(
    "vogal,resposta", [("A", "ÁÀÂÃA"), ("E", "ÉÊE"), ("I", "ÍI"), ("O", "ÓÔÕO"), ("U", "ÚÜU")]
)
def teste_familias_preservam_acentos(vogal, resposta):
    e = jogar(partida((resposta,)), "letra", vogal)
    assert e.pontos == (100 * len(resposta),)
    assert motor().publicar(e)["palavras"] == [list(resposta)]


def teste_c_e_cedilha_sao_distintos_e_palpite_exige_acento():
    e = jogar(partida(("CORAÇÃO",)), "letra", "C")
    assert e.pontos == (100,)
    e = jogar(e, "letra", "Ç")
    assert e.pontos == (200,)
    e = jogar(partida(("PÃO",)), "palpite", "PAO")
    assert e.pontos == (200,) and e.estado == "em_andamento"
    e = jogar(e, "palpite", "pa\u0303o")
    assert e.pontos == (300,) and e.estado == "concluida"


def teste_sinais_sao_fixos_e_numeros_pontuam():
    e = partida(("WALL-E 3",))
    assert motor().publicar(e)["palavras"] == [[None, None, None, None, "-", None, " ", None]]
    e = jogar(e, "letra", "3")
    e = jogar(e, "palpite", "WALL-E 3")
    assert e.pontos == (600,) and e.estado == "concluida"


@pytest.mark.parametrize(
    "tipo,valor,palavra,codigo",
    [
        ("letra", "AA", 0, "LETRA_INVALIDA"),
        ("letra", "-", 0, "LETRA_INVALIDA"),
        ("palpite", "CA", 0, "PALPITE_INCOMPLETO"),
        ("palpite", "C SA", 0, "PALPITE_INCOMPLETO"),
        ("palpite", "CASA", -1, "PALAVRA_INVALIDA"),
        ("palpite", "CASA", 2, "PALAVRA_INVALIDA"),
        ("outro", "A", 0, "ACAO_INVALIDA"),
    ],
)
def teste_acao_invalida_nao_consume_turno(tipo, valor, palavra, codigo):
    e = partida()
    falha(codigo, lambda: jogar(e, tipo, valor, palavra))
    assert e.versao == 0 and e.vez == 0 and e.pontos == (0, 0)


def teste_letras_fixas_nao_podem_ser_trocadas():
    e = jogar(partida(), "letra", "A")
    falha("POSICAO_FIXA", lambda: jogar(e, "palpite", "COCO"))


def teste_reenvio_nao_pontua_novamente_e_conflitos_sao_recusados():
    e = partida()
    novo = jogar(e, "letra", "A", acao="unica")
    assert jogar(novo, "letra", "A", pessoa="p0", acao="unica", versao=0) == novo
    falha("ACAO_REUTILIZADA", lambda: jogar(novo, "letra", "C", acao="unica", versao=0))
    falha("VERSAO_DESATUALIZADA", lambda: jogar(novo, "letra", "C", versao=0))
    falha("FORA_DA_VEZ", lambda: jogar(novo, "letra", "C", pessoa="p1"))


def teste_sorteia_proxima_sessao_uma_vez_e_acumula_placar():
    m = motor()
    e = partida(("A", "B"), seguintes=(("C", "D"),))
    e = jogar(e, "letra", "A")
    chamadas = []

    def sortear(ids):
        chamadas.append(ids)
        return tuple(reversed(ids))

    acao = m.Jogada("fim", e.versao, "p0", "letra", "B")
    e = m.jogar(e, acao, sortear=sortear)
    assert chamadas == [("p0", "p1")]
    assert e.sessao == 1 and e.ordem == ("p1", "p0") and e.vez == 0
    assert e.pontos == (200, 0)
    assert m.jogar(e, acao, sortear=sortear) == e and len(chamadas) == 1
    assert m.publicar(e)["palavras"] == [[None], [None]]
    e = jogar(e, "letra", "C")
    e = jogar(e, "letra", "D")
    assert e.estado == "aguardando_desempate" and e.pontos == (200, 200)


def teste_publicacao_nao_expoe_futuras_respostas_ou_tematicas():
    m = motor()
    e = m.iniciar(("p0",), (m.Painel("animais", ("GATO",)), m.Painel("paises", ("CHILE",))))
    texto = str(m.publicar(e))
    assert "GATO" not in texto and "CHILE" not in texto and "paises" not in texto


def teste_sorteio_invalido_nao_altera_partida():
    m = motor()
    e = jogar(partida(("A", "B"), seguintes=(("C", "D"),)), "letra", "A")
    falha(
        "ORDEM_INVALIDA",
        lambda: m.jogar(
            e, m.Jogada("fim", e.versao, "p0", "letra", "B"), sortear=lambda ids: ("p0", "p0")
        ),
    )
    assert e.sessao == 0 and e.pontos == (100, 0)


def teste_estado_concluido_nao_aceita_jogadas():
    e = jogar(partida(("CASA",)), "palpite", "CASA")
    assert e.estado == "concluida" and e.lideres == ("p0",)
    falha("PARTIDA_ENCERRADA", lambda: jogar(e, "letra", "A"))


def empate():
    e = partida(("A", "B"))
    e = jogar(e, "letra", "A")
    e = jogar(e, "letra", "W")
    return jogar(e, "letra", "B")


def teste_desempate_exige_concordancia_e_recusa_encerra():
    m = motor()
    assert hasattr(m, "VotoExtra"), "Falta registrar a concordância individual dos líderes."
    from aplicacao.modulos.galera.desempate import votar

    e = empate()
    voto = m.VotoExtra("voto1", e.versao, "p0", True)
    e = votar(e, voto)
    assert e.concordantes == ("p0",) and e.estado == "aguardando_desempate"
    assert votar(e, voto) == e
    falha("VOTO_REGISTRADO", lambda: votar(e, m.VotoExtra("outro", e.versao, "p0", True)))
    e = votar(e, m.VotoExtra("voto2", e.versao, "p1", False))
    assert e.estado == "concluida" and e.lideres == ("p0", "p1")


def teste_extra_unica_preserva_pontos_e_persistindo_empate_encerra():
    m = motor()
    assert hasattr(m, "AbrirExtra"), "Falta iniciar a única sessão extra autorizada."
    from aplicacao.modulos.galera.desempate import abrir_extra, votar

    e = empate()
    painel = m.Painel("paises", ("D", "E"))
    falha("CONSENSO_PENDENTE", lambda: abrir_extra(e, m.AbrirExtra("extra", e.versao, painel)))
    for pessoa in e.lideres:
        e = votar(e, m.VotoExtra(pessoa, e.versao, pessoa, True))
    falha(
        "CONTEUDO_REPETIDO",
        lambda: abrir_extra(e, m.AbrirExtra("extra", e.versao, m.Painel("objetos", ("A", "C")))),
    )
    acao = m.AbrirExtra("extra", e.versao, painel)
    e = abrir_extra(e, acao, sortear=lambda ids: tuple(reversed(ids)))
    assert e.extra and e.ordem == ("p1", "p0") and e.pontos == (100, 100)
    assert abrir_extra(e, acao) == e
    e = jogar(e, "letra", "D")
    e = jogar(e, "letra", "X")
    e = jogar(e, "letra", "E")
    assert e.estado == "concluida" and e.pontos == (200, 200)
    falha("DESEMPATE_INDISPONIVEL", lambda: abrir_extra(e, m.AbrirExtra("outra", e.versao, painel)))


def teste_extra_so_com_lideres_e_resultado_nao_inclui_terceiro():
    m = motor()
    assert hasattr(m, "VotoExtra"), "Falta a concordância dos líderes."
    from aplicacao.modulos.galera.desempate import abrir_extra, votar

    # Dois líderes chegam a 200 pontos cada; o terceiro termina com zero.
    e = partida(("A", "B", "CD"))
    e = jogar(e, "palpite", "A")
    e = jogar(e, "palpite", "B", palavra=1)
    e = jogar(e, "letra", "Z")
    e = jogar(e, "palpite", "CD", palavra=2)
    assert e.pontos == (200, 200, 0) and e.lideres == ("p0", "p1")
    falha("PARTICIPANTE_INVALIDO", lambda: votar(e, m.VotoExtra("p2", e.versao, "p2", True)))
    for pessoa in e.lideres:
        e = votar(e, m.VotoExtra(pessoa, e.versao, pessoa, True))
    e = abrir_extra(
        e, m.AbrirExtra("extra", e.versao, m.Painel("objetos", ("E", "F"))), sortear=lambda ids: ids
    )
    assert e.ordem == ("p0", "p1")
    falha("FORA_DA_VEZ", lambda: jogar(e, "letra", "E", pessoa="p2"))
    e = jogar(e, "letra", "E")
    e = jogar(e, "letra", "F")
    assert e.pontos == (400, 200, 0) and e.lideres == ("p0",)


def teste_primeiro_sorteio_e_ordem_reservada(monkeypatch):
    m = motor()
    chamadas = []

    def sortear(ids):
        chamadas.append(ids)
        return tuple(reversed(ids))

    monkeypatch.setattr(m, "sortear_ordem", sortear)
    e = m.iniciar(("p0", "p1"), (m.Painel("objetos", ("A", "B")),))
    assert e.ordem == ("p1", "p0") and len(chamadas) == 1
    e = m.iniciar(("p0", "p1"), (m.Painel("objetos", ("A", "B")),), ordem=("p0", "p1"))
    assert e.ordem == ("p0", "p1") and len(chamadas) == 1


def teste_selecao_extra_mantem_dificuldade_exclui_usadas_e_prefere_ineditas():
    from aplicacao.modulos.galera import desempate

    assert hasattr(desempate, "selecionar_extra"), "Falta selecionar conteúdo do desempate."
    import random
    from datetime import UTC, datetime

    from aplicacao.bancos.conteudo import DocumentoPalavra, chave_da_resposta

    itens = [
        DocumentoPalavra(
            id=f"palavra-{i}",
            resposta=r,
            tematicas=["paises"],
            dificuldade="facil",
            dicas=[f"Dica {n}." for n in range(5)],
            resposta_chave=chave_da_resposta(r),
            revisao=1,
            lote_origem="teste-001",
            atualizado_em=datetime.now(UTC),
        )
        for i, r in enumerate(["JAPÃO", "MAÇÃ", "CASA", "ÁGUA", "CÉU", "ARARA", "PÃO"])
    ]
    e = partida(("CASA", "ÁGUA"))
    e = jogar(e, "palpite", "CASA")
    e = jogar(e, "letra", "W")
    e = jogar(e, "palpite", "ÁGUA", palavra=1)
    assert e.estado == "aguardando_desempate"
    # Conteúdo de outro nível não pode completar a oferta.
    dificeis = [p.model_copy(update={"dificuldade": "dificil"}) for p in itens]
    assert desempate.selecionar_extra(e, dificeis, set(), random.Random(1), "paises") is None
    vistas = {p.id for p in itens[:5]}
    oferta = desempate.selecionar_extra(e, itens, vistas, random.Random(1), "paises")
    tema, escolhidas = oferta
    assert tema == "paises"
    assert {p.resposta for p in escolhidas} == {"ARARA", "PÃO"}
    assert all(p.dificuldade == "facil" for p in escolhidas)
    assert desempate.selecionar_extra(e, itens[2:4], set(), random.Random(1), "paises") is None
    oferta = desempate.selecionar_extra(e, itens, set(), random.Random(1))
    assert oferta[0] == "paises" and len(oferta[1]) == 2
    falha(
        "TEMATICA_INVALIDA",
        lambda: desempate.selecionar_extra(e, itens, set(), random.Random(1), "inventada"),
    )


def teste_cinco_sessoes_permite_a_sexta_extra_sem_nova_prorrogacao():
    m = motor()
    from aplicacao.modulos.galera.desempate import abrir_extra, votar

    e = m.iniciar(
        ("p0", "p1"),
        tuple(
            m.Painel("objetos", (a, b))
            for a, b in [("A", "B"), ("C", "D"), ("E", "F"), ("G", "H"), ("I", "J")]
        ),
        ordem=("p0", "p1"),
    )
    for a, b in [("A", "B"), ("C", "D"), ("E", "F"), ("G", "H"), ("I", "J")]:
        # Um ponto por pessoa, independentemente da ordem sorteada.
        e = jogar(e, "letra", a)
        e = jogar(e, "letra", "Z")
        e = jogar(e, "letra", b)
    assert e.estado == "aguardando_desempate" and e.pontos == (500, 500)
    for pessoa in e.lideres:
        e = votar(e, m.VotoExtra(pessoa, e.versao, pessoa, True))
    e = abrir_extra(e, m.AbrirExtra("sexta", e.versao, m.Painel("objetos", ("K", "L"))))
    assert e.sessao == 5 and len(e.paineis) == 6


@pytest.mark.parametrize(
    "participantes,paineis",
    [
        ((), (("A",),)),
        (("p0", "p0"), (("A", "B"),)),
        (("p0",), ()),
        (("p0",), (("A",),) * 6),
        (("p0", "p1"), (("A",),)),
        (("p0",), (("PÃO",), ("PAO",))),
    ],
)
def teste_configuracoes_invalidas(participantes, paineis):
    m = motor()
    falha(
        "CONFIGURACAO_INVALIDA",
        lambda: m.iniciar(participantes, tuple(m.Painel("objetos", p) for p in paineis)),
    )


def teste_pode_encerrar_empatado_depois_de_concordar_se_faltar_conteudo():
    m = motor()
    from aplicacao.modulos.galera.desempate import abrir_extra, votar

    e = empate()
    for pessoa in e.lideres:
        e = votar(e, m.VotoExtra(pessoa, e.versao, pessoa, True))
    falha(
        "CONTEUDO_INSUFICIENTE",
        lambda: abrir_extra(e, m.AbrirExtra("falta", e.versao, m.Painel("objetos", ("C",)))),
    )
    e = votar(e, m.VotoExtra("aceitar-empate", e.versao, "p0", False))
    assert e.estado == "concluida" and e.pontos == (100, 100)


def teste_palavra_resolvida_e_reenvio_antigo_nao_repetem_pontos():
    e = jogar(partida(), "palpite", "CASA", acao="primeira")
    falha("PALAVRA_RESOLVIDA", lambda: jogar(e, "palpite", "CASA"))
    e = jogar(e, "letra", "W")
    assert jogar(e, "palpite", "CASA", pessoa="p0", acao="primeira", versao=0) == e
    assert e.pontos == (400, 0) and e.vez == 1


def teste_tres_lideres_podem_jogar_a_extra_juntos():
    m = motor()
    from aplicacao.modulos.galera.desempate import abrir_extra, votar

    e = partida(("ABC", "DEF", "GHI"))
    e = jogar(e, "palpite", "ABC")
    e = jogar(e, "letra", "Z")
    e = jogar(e, "palpite", "DEF", palavra=1)
    e = jogar(e, "letra", "Y")
    e = jogar(e, "palpite", "GHI", palavra=2)
    assert e.pontos == (300, 300, 300) and e.lideres == ("p0", "p1", "p2")
    for pessoa in e.lideres:
        e = votar(e, m.VotoExtra(pessoa, e.versao, pessoa, True))
    e = abrir_extra(
        e,
        m.AbrirExtra("extra", e.versao, m.Painel("objetos", ("J", "K", "L"))),
        sortear=lambda ids: ("p2", "p1", "p0"),
    )
    for letra in "JKL":
        e = jogar(e, "letra", letra)
    assert e.pontos == (300, 300, 600) and e.lideres == ("p2",)


def teste_catalogo_completo_pode_ser_resolvido_pelo_teclado_da_galera():
    import json
    from pathlib import Path

    pasta = Path(__file__).resolve().parents[2] / "Data" / "palavras"
    for arquivo in sorted(pasta.glob("*.json")):
        for item in json.loads(arquivo.read_text(encoding="utf-8"))["palavras"]:
            resposta = item["resposta"]
            e = partida((resposta,))
            for letra in "ABCDEFGHIJKLMNOPQRSTUVWXYZÇ0123456789":
                if e.estado == "concluida":
                    break
                if letra not in motor().publicar(e)["bloqueadas"]:
                    e = jogar(e, "letra", letra)
            assert e.estado == "concluida", resposta
            assert e.pontos == (100 * sum(c.isalnum() for c in resposta),), resposta
            assert motor().publicar(e)["palavras"] == [list(resposta)]
