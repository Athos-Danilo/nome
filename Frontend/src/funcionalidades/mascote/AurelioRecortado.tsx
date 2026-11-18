import { useId } from "react";
import { DefinicoesAurelio } from "./DefinicoesAurelio";
import { RECORTES, type ParteRecortada } from "./recortes";
import { duracaoAtuacao, poseVisual, type TipoAtuacao } from "./atuacao-visual";
import type { DirecaoOlhar } from "./gestos-menu";
import { LetraCuriosa } from "./LetraCuriosa";
import { EfeitosAurelio } from "./EfeitosAurelio";
import { FolhasAurelio } from "./FolhasAurelio";
import { RostoAurelio } from "./RostoAurelio";
import {
  ANCORA_BRACO_ESQUERDO_ATRAS,
  ANCORAS_MEMBROS,
  PONTAS_NEUTRAS,
  calcularCaminhoMembro,
  dividirCurvaCubica,
  resolverMembro,
  transformarPontoCorpo,
} from "./cinematica-membros";
import { escalaXPorVolume, type PoseCompleta } from "./pose-base";

function TuboMembro({
  caminho,
  largura,
  luz,
}: {
  caminho: string;
  largura: number;
  luz: { x: number; y: number };
}) {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={caminho} stroke="#140e0b" strokeWidth={largura} />
      <path d={caminho} stroke="#29241c" strokeWidth={largura - 18} />
      <path
        d={caminho}
        stroke="#3a342a"
        strokeWidth="8"
        transform={`translate(${luz.x} ${luz.y})`}
      />
    </g>
  );
}

export function AurelioRecortado({
  tempo = 0,
  partes = false,
  descricao = "Aurélio, o dicionário apresentador",
  atuacao = "saudacao",
  direcaoOlhar,
  poseDireta,
}: {
  tempo?: number;
  partes?: boolean;
  descricao?: string;
  atuacao?: TipoAtuacao;
  direcaoOlhar?: DirecaoOlhar;
  poseDireta?: PoseCompleta;
}) {
  const id = useId().replaceAll(":", "");
  const pose = poseDireta ?? poseVisual(atuacao, tempo, direcaoOlhar);
  const referencia = (nome: string) => `url(#${id}-${nome})`;
  const imagem = (parte: ParteRecortada) => (
    <use href={`#${id}-original`} clipPath={referencia(parte)} />
  );

  const escalaX = escalaXPorVolume(pose.corpoEscalaY);
  const corpoTransform = {
    y: pose.corpoY,
    rotacao: pose.corpoRotacao,
    escalaX,
    escalaY: pose.corpoEscalaY,
    inclinacaoX: pose.perspectivaX,
  };

  // Pernas ancoradas matematicamente nos quadris transformados do livro.
  const ancoraPE = transformarPontoCorpo(
    ANCORAS_MEMBROS.perna_esquerda,
    corpoTransform,
  );
  const ancoraPD = transformarPontoCorpo(
    ANCORAS_MEMBROS.perna_direita,
    corpoTransform,
  );
  const curvaPE = resolverMembro(
    "perna_esquerda",
    { x: pose.peEsquerdoX, y: pose.peEsquerdoY },
    pose.joelhoEsquerdoDobra,
    ancoraPE,
  );
  const curvaPD = resolverMembro(
    "perna_direita",
    { x: pose.peDireitoX, y: pose.peDireitoY },
    pose.joelhoDireitoDobra,
    ancoraPD,
  );

  // Braços no sistema local de `corpo_inteiro`.
  const bracoDirFrontal = pose.bracoDireitoFrente > 0.25;
  const curvaBD = resolverMembro(
    "braco_direito",
    { x: pose.maoDireitaX, y: pose.maoDireitaY },
    pose.cotoveloDireitoDobra,
    ANCORAS_MEMBROS.braco_direito,
    bracoDirFrontal,
  );
  const [bdAtras, bdFrente] = bracoDirFrontal
    ? [
        dividirCurvaCubica(curvaBD, 0.46)[0],
        dividirCurvaCubica(curvaBD, 0.44)[1],
      ]
    : [curvaBD, null];

  const bracoEsqAtras = pose.bracoEsquerdoAtras > 0.5;
  const curvaBE = resolverMembro(
    "braco_esquerdo",
    { x: pose.maoEsquerdaX, y: pose.maoEsquerdaY },
    pose.cotoveloEsquerdoDobra,
    bracoEsqAtras
      ? ANCORA_BRACO_ESQUERDO_ATRAS
      : ANCORAS_MEMBROS.braco_esquerdo,
  );

  const dxLuvaDir = curvaBD.ponta.x - PONTAS_NEUTRAS.braco_direito.x;
  const dyLuvaDir = curvaBD.ponta.y - PONTAS_NEUTRAS.braco_direito.y;
  const dxLuvaEsq = curvaBE.ponta.x - PONTAS_NEUTRAS.braco_esquerdo.x;
  const dyLuvaEsq = curvaBE.ponta.y - PONTAS_NEUTRAS.braco_esquerdo.y;
  const dxSapEsq = curvaPE.ponta.x - PONTAS_NEUTRAS.perna_esquerda.x;
  const dySapEsq = curvaPE.ponta.y - PONTAS_NEUTRAS.perna_esquerda.y;
  const dxSapDir = curvaPD.ponta.x - PONTAS_NEUTRAS.perna_direita.x;
  const dySapDir = curvaPD.ponta.y - PONTAS_NEUTRAS.perna_direita.y;

  const luvaDireita = (
    <g
      data-parte="punho_direito"
      transform={`translate(${dxLuvaDir} ${dyLuvaDir}) rotate(${pose.punho} ${PONTAS_NEUTRAS.braco_direito.x} ${PONTAS_NEUTRAS.braco_direito.y})`}
    >
      {imagem("luva_direita")}
    </g>
  );

  const bracoEsquerdoGrupo = (
    <g data-parte="braco_esquerdo">
      <TuboMembro
        caminho={calcularCaminhoMembro(curvaBE)}
        largura={60}
        luz={{ x: 6, y: -8 }}
      />
      <g
        data-parte="punho_esquerdo"
        transform={`translate(${dxLuvaEsq} ${dyLuvaEsq}) rotate(${pose.bracoEsquerdo} ${PONTAS_NEUTRAS.braco_esquerdo.x} ${PONTAS_NEUTRAS.braco_esquerdo.y})`}
      >
        {imagem("luva_esquerda")}
      </g>
    </g>
  );

  const larguraCorpoTransform = `translate(0 ${pose.corpoY}) rotate(${pose.corpoRotacao} 554 940) translate(554 940) skewX(${pose.perspectivaX}) scale(${escalaX} ${pose.corpoEscalaY}) translate(-554 -940)`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1158 1359"
      className="desenho-aurelio recorte-aurelio"
      role="img"
      aria-label={descricao}
      data-arte="png-aprovado"
      data-rig="hibrido-rubber-hose"
      data-tempo={Math.round(tempo)}
      data-atuacao={atuacao}
    >
      <DefinicoesAurelio id={id} />
      {pose.saltoY < -1 && (
        <ellipse
          data-parte="sombra_salto"
          cx={500 + pose.deslocamentoX * 0.5}
          cy="1270"
          rx={Math.max(120, 290 + pose.saltoY * 1.1)}
          ry="23"
          fill="#444439"
          opacity={Math.max(0.04, 0.14 + pose.saltoY / 900)}
        />
      )}
      <g
        data-parte="personagem"
        transform={`translate(${pose.deslocamentoX} ${pose.saltoY}) rotate(${pose.inclinacao} 550 1250)`}
      >
        <g data-parte="perna_esquerda">
          <TuboMembro
            caminho={calcularCaminhoMembro(curvaPE)}
            largura={59}
            luz={{ x: 10, y: -3 }}
          />
          <g
            data-parte="sapato_esquerdo"
            transform={`translate(${dxSapEsq} ${dySapEsq}) rotate(${pose.pernaEsquerda} ${PONTAS_NEUTRAS.perna_esquerda.x} ${PONTAS_NEUTRAS.perna_esquerda.y})`}
          >
            {imagem("sapato_esquerdo")}
          </g>
        </g>

        <g data-parte="perna_direita">
          <TuboMembro
            caminho={calcularCaminhoMembro(curvaPD)}
            largura={59}
            luz={{ x: 10, y: -3 }}
          />
          <g
            data-parte="sapato_direito"
            transform={`translate(${dxSapDir} ${dySapDir}) rotate(${pose.pernaDireita} ${PONTAS_NEUTRAS.perna_direita.x} ${PONTAS_NEUTRAS.perna_direita.y})`}
          >
            {imagem("sapato_direito")}
          </g>
        </g>

        <g data-parte="corpo_inteiro" transform={larguraCorpoTransform}>
          {bracoEsqAtras && bracoEsquerdoGrupo}

          <g data-parte="braco_direito">
            <TuboMembro
              caminho={calcularCaminhoMembro(bdAtras)}
              largura={59}
              luz={{ x: 0, y: -9 }}
            />
            {!bracoDirFrontal && luvaDireita}
          </g>

          <use href={`#${id}-capa-limpa`} data-parte="capa_reconstruida" />
          <g data-parte="corpo_capa" mask={referencia("silhueta-livro")}>
            <use href={`#${id}-original`} mask={referencia("corpo")} />
          </g>
          <g
            data-parte="corpo_miolo"
            transform={`translate(0 ${pose.paginasY})`}
          >
            {imagem("paginas")}
            <FolhasAurelio folheada={pose.folheada} />
          </g>

          <RostoAurelio id={id} pose={pose} imagem={imagem} />

          <g
            data-parte="acessorio_gravata"
            transform={`translate(612 780) rotate(${pose.gravata}) scale(${pose.gravataEscala}) translate(-612 -780)`}
          >
            {imagem("gravata")}
          </g>

          {bdFrente && (
            <g data-parte="braco_direito_frontal">
              <TuboMembro
                caminho={calcularCaminhoMembro(bdFrente)}
                largura={59}
                luz={{ x: 0, y: -9 }}
              />
              {luvaDireita}
            </g>
          )}

          {!bracoEsqAtras && bracoEsquerdoGrupo}
        </g>

        {partes && (
          <g
            data-parte="esqueleto_ik"
            fill="none"
            stroke="#e87b54"
            strokeWidth="3.5"
            strokeDasharray="8 8"
            pointerEvents="none"
          >
            {Object.entries(RECORTES).map(([nome, caminho]) => (
              <path key={nome} d={caminho} opacity="0.55" />
            ))}
            {[curvaPE, curvaPD].map((c, idx) => (
              <g key={`p-${idx}`}>
                <path
                  d={`M${c.ancora.x} ${c.ancora.y} L${c.junta.x} ${c.junta.y} L${c.ponta.x} ${c.ponta.y}`}
                  stroke="#d4fe62"
                  strokeWidth="4"
                  strokeDasharray="none"
                />
                <circle cx={c.ancora.x} cy={c.ancora.y} r="9" fill="#e87b54" />
                <circle cx={c.junta.x} cy={c.junta.y} r="8" fill="#d4fe62" />
                <circle cx={c.ponta.x} cy={c.ponta.y} r="9" fill="#d4fe62" />
              </g>
            ))}
            <g transform={larguraCorpoTransform}>
              {[curvaBE, curvaBD].map((c, idx) => (
                <g key={`b-${idx}`}>
                  <path
                    d={`M${c.ancora.x} ${c.ancora.y} L${c.junta.x} ${c.junta.y} L${c.ponta.x} ${c.ponta.y}`}
                    stroke="#d4fe62"
                    strokeWidth="4"
                    strokeDasharray="none"
                  />
                  <circle
                    cx={c.ancora.x}
                    cy={c.ancora.y}
                    r="9"
                    fill="#e87b54"
                  />
                  <circle cx={c.junta.x} cy={c.junta.y} r="8" fill="#d4fe62" />
                  <circle cx={c.ponta.x} cy={c.ponta.y} r="9" fill="#d4fe62" />
                </g>
              ))}
            </g>
          </g>
        )}
      </g>
      <EfeitosAurelio pose={pose} progresso={tempo / duracaoAtuacao(atuacao)} />
      <LetraCuriosa pose={pose} />
    </svg>
  );
}
