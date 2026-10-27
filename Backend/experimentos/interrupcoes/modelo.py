"""Simulação em memória; ausência de sinal é evidência, não prova de fechamento."""

from dataclasses import dataclass, field
from typing import Literal
from uuid import UUID, uuid4


@dataclass
class ProvaInterrupcoes:
    modo: Literal["individual", "galera"]
    limiar: float = 10
    aba_id: UUID | None = None
    documento_id: UUID | None = None
    ultimo_sinal: float | None = None
    interrupcao_id: UUID | None = None
    classificacao: str = "aguardando"
    estado: str = "ativa"
    saldo_simulado: int = 300
    pausas_simuladas: int = 0
    historico_pendente: bool = False
    acoes: set[UUID] = field(default_factory=set)
    eventos: list[dict] = field(default_factory=list)

    def registrar(self, tipo: str, **detalhes: object) -> None:
        self.eventos.append({"sequencia": len(self.eventos) + 1, "tipo": tipo, **detalhes})

    def apurar(self, agora: float) -> None:
        if (
            self.estado == "ativa"
            and self.ultimo_sinal is not None
            and agora - self.ultimo_sinal >= self.limiar
        ):
            self.abrir_interrupcao("ausencia_de_sinais")

    def abrir_interrupcao(self, origem: str) -> None:
        if self.interrupcao_id is None and self.estado == "ativa":
            self.interrupcao_id = uuid4()
            self.classificacao = "em_apuracao"
            self.registrar(
                "interrupcao_aberta", origem=origem, interrupcao_id=str(self.interrupcao_id)
            )

    def conectar(self, aba_id: UUID, documento_id: UUID, navegacao: str, agora: float) -> None:
        if self.estado == "encerrada":
            self.registrar("consulta_de_resultado_encerrado")
            return
        if documento_id == self.documento_id:
            return
        self.apurar(agora)
        if self.documento_id is None:
            tipo = "primeira_abertura"
        elif self.estado == "pausada":
            tipo = "retorno_com_pausa_confirmada"
        elif self.aba_id == aba_id and navegacao == "reload":
            tipo = "recarga_declarada"
            self.interrupcao_id = None
        elif self.aba_id == aba_id and navegacao == "back_forward":
            self.agir(uuid4(), "sair", agora)
            tipo = "saida_pelo_historico"
        else:
            tipo = "retorno_ambiguo"
            self.abrir_interrupcao("novo_documento_ou_aba")
        self.classificacao = tipo
        self.aba_id, self.documento_id, self.ultimo_sinal = aba_id, documento_id, agora
        self.registrar(
            tipo, navegacao=navegacao, aba_id=str(aba_id), documento_id=str(documento_id)
        )

    def sinal(self, documento_id: UUID, tipo: str, agora: float, persistido: bool = False) -> None:
        if documento_id != self.documento_id:
            self.registrar("sinal_atrasado_ignorado", sinal=tipo)
            return
        if self.estado != "ativa":
            return
        self.apurar(agora)
        if tipo == "pagehide":
            if persistido:
                self.historico_pendente = True
                self.registrar("entrada_em_cache_de_navegacao")
            else:
                self.abrir_interrupcao("pagehide_sem_cache")
        elif tipo == "pageshow" and persistido:
            if self.historico_pendente:
                self.historico_pendente = False
                self.agir(uuid4(), "sair", agora)
                self.classificacao = "saida_pelo_historico"
            self.registrar("retorno_bfcache")
        elif tipo != "atividade":
            self.registrar("sinal_do_navegador", sinal=tipo)
        self.ultimo_sinal = agora

    def agir(self, id_acao: UUID, tipo: str, agora: float) -> None:
        if id_acao in self.acoes:
            return
        if tipo == "pausar" and self.modo != "individual":
            raise ValueError("A galera não possui pausa retomável.")
        if self.estado == "encerrada":
            raise ValueError("A simulação já foi encerrada.")
        if tipo in {"pausar", "sair"} and self.modo == "individual" and self.estado == "ativa":
            self.saldo_simulado -= 100
            self.pausas_simuladas += 1
            self.estado = "pausada"
            self.classificacao = "pausa_confirmada"
            self.interrupcao_id = self.interrupcao_id or uuid4()
        elif tipo == "retomar":
            self.estado = "ativa"
            self.interrupcao_id = None
            self.classificacao = "retomada_experimental"
            self.ultimo_sinal = agora
        elif tipo == "encerrar" or (tipo == "sair" and self.modo == "galera"):
            self.estado = "encerrada"
            self.classificacao = "encerramento_confirmado"
        self.acoes.add(id_acao)
        self.registrar("acao_experimental", acao=tipo, saldo_simulado=self.saldo_simulado)

    def consultar(self, agora: float) -> dict:
        self.apurar(agora)
        return {
            "modo": self.modo,
            "estado": self.estado,
            "classificacao": self.classificacao,
            "interrupcao_id": str(self.interrupcao_id) if self.interrupcao_id else None,
            "saldo_simulado": self.saldo_simulado,
            "pausas_simuladas": self.pausas_simuladas,
            "limiar_segundos": self.limiar,
            "eventos": self.eventos[-100:],
        }
