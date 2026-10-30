"""Fórmulas independentes da persistência e revisões históricas do conteúdo."""

from uuid import uuid4

from aplicacao.modulos.acompanhamento.contratos import DadosEstatisticas, GrupoRodadas
from aplicacao.modulos.acompanhamento.esquemas import Resumo
from aplicacao.modulos.acompanhamento.servico import ServicoEstatisticas, desempenho
from testes.teste_individual import CatalogoControlado
from testes.teste_perfil import executar


def teste_sem_acertos_nao_inventa_media_e_conta_erros_sem_multiplicar_palavras():
    resultado = desempenho([GrupoRodadas("palavra-0", 1, "facil", "desistida", 5, 2, 0, 8)])
    assert resultado.media_dicas is None
    assert resultado.palavras_apresentadas == resultado.palavras_desistidas == 2
    assert resultado.erros == 8 and resultado.palavras_acertadas == 0


def teste_revisao_historica_consultada_uma_vez_por_referencia():
    class RepositorioControlado:
        async def estatisticas(self, jogador_id):
            return DadosEstatisticas(
                Resumo(),
                None,
                [
                    GrupoRodadas("palavra-0", 1, "facil", "acertada", 1, 1, 100, 0),
                    GrupoRodadas("palavra-0", 1, "facil", "acertada", 3, 1, 60, 2),
                    GrupoRodadas("palavra-0", 2, "medio", "desistida", 5, 1, 0, 4),
                ],
            )

    class RevisoesControladas:
        consultas = []

        async def buscar(self, identificador, revisao):
            self.consultas.append((identificador, revisao))
            documento = CatalogoControlado().itens[0]
            return documento.model_copy(
                update={
                    "revisao": revisao,
                    "tematicas": ["paises"] if revisao == 1 else ["objetos"],
                }
            )

    async def verificar():
        catalogo = RevisoesControladas()
        resultado = await ServicoEstatisticas(RepositorioControlado(), catalogo).consultar(uuid4())
        assert catalogo.consultas == [("palavra-0", 1), ("palavra-0", 2)]
        assert resultado.por_tematica["paises"].media_dicas == 2
        assert resultado.por_tematica["objetos"].palavras_desistidas == 1
        assert resultado.resumo.erros == 6

    executar(verificar())
