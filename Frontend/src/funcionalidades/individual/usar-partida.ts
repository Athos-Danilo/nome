import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  enviarAcao,
  lerPartida,
  type Partida,
  type Acao,
  type TipoAcao,
} from "./api";
import { ErroDaApi } from "../perfil/api";
import { reacaoIndividual, type EventoReacao } from "../mascote/reacoes";
export function usePartida(base: string, token: string) {
  const cache = useQueryClient();
  const chave = ["individual", base];
  const consulta = useQuery({
    queryKey: chave,
    queryFn: () => lerPartida(base),
  });
  const trava = useRef(false);
  const montado = useRef(true);
  const [ocupado, definirOcupado] = useState(false);
  const [erro, definirErro] = useState("");
  const [pendente, definirPendente] = useState<{
    tipo: TipoAcao;
    dados: Acao;
  } | null>(null);
  const [retorno, definirRetorno] = useState<Partida["acao"]>();
  const [limpeza, definirLimpeza] = useState(0);
  const [reacaoMascote, definirReacaoMascote] = useState<EventoReacao>();
  useEffect(() => {
    const rodada = consulta.data?.rodada_atual;
    if (rodada)
      definirReacaoMascote({
        id: `apresentacao-${rodada.rodada_id}`,
        tipo: "apresentacao",
      });
  }, [consulta.data?.rodada_atual?.rodada_id]);
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);
  async function executar(tipo: TipoAcao, dados: Acao): Promise<boolean> {
    if (trava.current) return false;
    trava.current = true;
    definirOcupado(true);
    definirErro("");
    try {
      const nova = await enviarAcao(base, tipo, dados, token);
      if (!montado.current) return false;
      cache.setQueryData<Partida>(chave, (anterior) =>
        !anterior || nova.versao >= anterior.versao ? nova : anterior,
      );
      definirPendente(null);
      definirReacaoMascote(reacaoIndividual(nova));
      if (nova.acao?.limpar_montagem) definirLimpeza((v) => v + 1);
      if (
        nova.acao?.resultado === "acerto" ||
        nova.acao?.resultado === "desistencia"
      )
        definirRetorno(nova.acao);
      else if (nova.acao?.resultado === "erro")
        definirErro(
          "Ainda não! A montagem foi limpa. Veja a pista e tente novamente.",
        );
      void cache.invalidateQueries({ queryKey: ["partida-em-aberto"] });
      return true;
    } catch (e) {
      if (!montado.current) return false;
      const falha = e as Error;
      definirErro(falha.message);
      if (
        e instanceof ErroDaApi &&
        ["CONEXAO_INDISPONIVEL", "RESPOSTA_INVALIDA"].includes(e.codigo)
      )
        definirPendente({ tipo, dados });
      else {
        definirPendente(null);
        if (
          e instanceof ErroDaApi &&
          [
            "VERSAO_DESATUALIZADA",
            "RODADA_INVALIDA",
            "PARTIDA_INATIVA",
          ].includes(e.codigo)
        ) {
          await consulta.refetch();
          definirLimpeza((v) => v + 1);
        }
      }
      return false;
    } finally {
      trava.current = false;
      if (montado.current) definirOcupado(false);
    }
  }
  function agir(tipo: TipoAcao, palpite?: string) {
    const estado = consulta.data;
    if (!estado || pendente || trava.current) return Promise.resolve(false);
    const dados: Acao = {
      id_acao: crypto.randomUUID(),
      versao_esperada: estado.versao,
      ...(!["encerramento", "pausa", "retomada", "saida"].includes(tipo)
        ? { rodada_id: estado.rodada_atual?.rodada_id }
        : {}),
      ...(palpite ? { palpite } : {}),
    };
    return executar(tipo, dados);
  }
  return {
    consulta,
    ocupado,
    erro,
    pendente,
    retorno,
    limpeza,
    reacaoMascote,
    agir,
    reenviar: () => {
      return pendente
        ? executar(pendente.tipo, pendente.dados)
        : Promise.resolve(false);
    },
    continuar: () => {
      definirRetorno(undefined);
      definirErro("");
    },
  };
}
