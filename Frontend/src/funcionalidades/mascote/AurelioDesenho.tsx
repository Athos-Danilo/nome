import { useEffect, useRef } from "react";
import { AurelioRecortado } from "./AurelioRecortado";
import { useRelogioAtuacao } from "./usar-relogio-atuacao";
import { duracaoAtuacao, poseVisual, type TipoAtuacao } from "./atuacao-visual";
import type { DirecaoOlhar } from "./gestos-menu";
import type { PoseCompleta } from "./pose-base";
import { DURACAO_BLENDING_MS, misturarPoses } from "./transicao-poses";

/** A atuação é apresentação; todas reutilizam o rigging híbrido 2.5D com pose blending. */
export function AurelioDesenho({
  reacao,
  estatico,
  descricao,
  chave,
  direcaoOlhar,
  olharVivo,
  preservarPose = false,
  velocidade = 1,
}: {
  reacao: TipoAtuacao;
  direcaoOlhar?: DirecaoOlhar;
  olharVivo?: DirecaoOlhar;
  preservarPose?: boolean;
  estatico: boolean;
  descricao: string;
  chave: string;
  velocidade?: number;
}) {
  const tempo = useRelogioAtuacao(
    !estatico,
    duracaoAtuacao(reacao),
    0,
    chave,
    undefined,
    reacao === "espera",
    velocidade,
  );

  const tempoEfetivo = estatico && !preservarPose ? 0 : tempo;
  let poseAtual = poseVisual(reacao, tempoEfetivo, direcaoOlhar);

  if (reacao === "espera" && olharVivo && !estatico) {
    poseAtual = {
      ...poseAtual,
      pupilaX: Math.max(-16, Math.min(16, poseAtual.pupilaX + olharVivo.x)),
      pupilaY: Math.max(-12, Math.min(12, poseAtual.pupilaY + olharVivo.y)),
    };
  }

  // Captura a última pose renderizada para suavizar trocas de estado (pose blending).
  const ultimaChave = useRef(chave);
  const ultimaPose = useRef<PoseCompleta>(poseAtual);
  const origemBlending = useRef<PoseCompleta | null>(null);
  const tempoInicioBlending = useRef(0);

  if (ultimaChave.current !== chave) {
    ultimaChave.current = chave;
    if (!estatico) {
      origemBlending.current = ultimaPose.current;
      tempoInicioBlending.current = performance.now();
    } else {
      origemBlending.current = null;
    }
  }

  let poseExibida = poseAtual;
  if (!estatico && origemBlending.current) {
    const decorrido = performance.now() - tempoInicioBlending.current;
    if (decorrido < DURACAO_BLENDING_MS) {
      poseExibida = misturarPoses(
        origemBlending.current,
        poseAtual,
        decorrido / DURACAO_BLENDING_MS,
      );
    } else {
      origemBlending.current = null;
    }
  }

  useEffect(() => {
    ultimaPose.current = poseExibida;
  });

  return (
    <AurelioRecortado
      tempo={tempoEfetivo}
      direcaoOlhar={direcaoOlhar}
      atuacao={reacao}
      descricao={descricao}
      poseDireta={estatico && !preservarPose ? undefined : poseExibida}
    />
  );
}
