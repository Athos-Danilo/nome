"""Identificadores oficiais estáveis; ilustrações em Frontend/public/avatares."""

AVATARES = (
    ("aurelio_apresentador", "Aurélio apresentador"),
    ("aurelio_oculos", "Aurélio de óculos"),
    ("aurelio_detetive", "Aurélio detetive"),
    ("aurelio_comemorando", "Aurélio comemorando"),
    ("coruja_sabia", "Coruja sábia"),
    ("onca_pintada", "Onça pintada"),
    ("capivara_zen", "Capivara zen"),
    ("tucano_tropical", "Tucano tropical"),
    ("lampada_ideia", "Lâmpada de ideias"),
    ("lupa_misterio", "Lupa do mistério"),
    ("livro_encantado", "Livro encantado"),
    ("pena_tinteiro", "Pena e tinteiro"),
    ("claquete_cinema", "Claquete de cinema"),
    ("pipoca_divertida", "Pipoca divertida"),
    ("trofeu_campeao", "Troféu de campeão"),
    ("cartola_magica", "Cartola mágica"),
    ("controle_arcade", "Controle arcade"),
    ("fita_cassete", "Fita cassete"),
    ("disco_vinil", "Disco de vinil"),
    ("dado_da_sorte", "Dado da sorte"),
)
IDENTIFICADORES_AVATARES = frozenset(identificador for identificador, _ in AVATARES)


def listar_avatares() -> list[dict[str, str]]:
    return [
        {
            "id": identificador,
            "nome": nome,
            "recurso": f"/avatares/{identificador}.webp",
        }
        for identificador, nome in AVATARES
    ]
