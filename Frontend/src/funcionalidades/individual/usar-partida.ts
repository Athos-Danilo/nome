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
  useEffect(() => {
    montado.current = true;
    return () => {
      montado.current = false;
    };
  }, []);
  async function executar(tipo: TipoAcao, dados: Acao) {
    if (trava.current) return;
    trava.current = true;
    definirOcupado(true);
    definirErro("");
    try {
      const nova = await enviarAcao(base, tipo, dados, token);
      if (!montado.current) return;
      cache.setQueryData<Partida>(chave, (anterior) =>
        !anterior || nova.versao >= anterior.versao ? nova : anterior,
      );
      definirPendente(null);
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
    } catch (e) {
      if (!montado.current) return;
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
    } finally {
      trava.current = false;
      if (montado.current) definirOcupado(false);
    }
  }
  function agir(tipo: TipoAcao, palpite?: string) {
    const estado = consulta.data;
    if (!estado || pendente || trava.current) return;
    const dados: Acao = {
      id_acao: crypto.randomUUID(),
      versao_esperada: estado.versao,
      ...(tipo !== "encerramento"
        ? { rodada_id: estado.rodada_atual?.rodada_id }
        : {}),
      ...(palpite ? { palpite } : {}),
    };
    void executar(tipo, dados);
  }
  return {
    consulta,
    ocupado,
    erro,
    pendente,
    retorno,
    limpeza,
    agir,
    reenviar: () => {
      if (pendente) void executar(pendente.tipo, pendente.dados);
    },
    continuar: () => {
      definirRetorno(undefined);
      definirErro("");
    },
  };
}
