import { Link } from "react-router";
import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  identificarVisitante,
  vincularDemonstracao,
  type Visitante,
} from "./api";

export function SituacaoDemonstracao({ tokenConta }: { tokenConta?: string }) {
  const cache = useQueryClient();
  const chave = ["visitante", !!tokenConta];
  const visitante = useQuery({
    queryKey: chave,
    queryFn: identificarVisitante,
  });
  const tentadas = useRef(new Set<string>());
  const vinculo = useMutation({
    mutationFn: () => vincularDemonstracao(tokenConta!),
    onSuccess: () =>
      cache.setQueryData<Visitante>(chave, (anterior) =>
        anterior
          ? {
              ...anterior,
              vinculada: true,
              demonstracao: null,
            }
          : anterior,
      ),
  });
  const dados = visitante.data;
  useEffect(() => {
    const partida = dados?.demonstracao?.partida_id;
    if (
      tokenConta &&
      partida &&
      !dados.vinculada &&
      !tentadas.current.has(partida)
    ) {
      tentadas.current.add(partida);
      vinculo.mutate();
    }
  }, [tokenConta, dados, vinculo]);
  if (tokenConta) {
    if (vinculo.isSuccess)
      return (
        <p className="aviso-sucesso" role="status">
          Demonstração vinculada à sua conta.
        </p>
      );
    if (vinculo.isPending)
      return <p role="status">Guardando sua demonstração na conta…</p>;
    if (vinculo.error)
      return (
        <div className="cartao-demonstracao" role="status">
          <p>{vinculo.error.message}</p>
          <button onClick={() => vinculo.mutate()}>
            Tentar vincular novamente
          </button>
        </div>
      );
    if (visitante.error)
      return (
        <div className="cartao-demonstracao" role="status">
          <p>Não foi possível conferir uma demonstração deste navegador.</p>
          <button onClick={() => void visitante.refetch()}>
            Conferir novamente
          </button>
        </div>
      );
    return null;
  }
  return (
    <div className="cartao-demonstracao">
      <span className="etiqueta">UMA PRIMEIRA DESCOBERTA</span>
      {visitante.isPending ? (
        <p role="status">Conferindo seu jogo rápido…</p>
      ) : visitante.error ? (
        <>
          <p role="status">{visitante.error.message}</p>
          <button onClick={() => void visitante.refetch()}>
            Conferir novamente
          </button>
        </>
      ) : dados?.demonstracao_utilizada ? (
        <>
          <h2>Demonstração já utilizada</h2>
          <p>
            Entre com Google para liberar novas partidas e guardar suas
            descobertas.
          </p>
          {dados.demonstracao && !dados.vinculada && (
            <p className="nota">
              O prazo para vincular seu teste à conta é de sete dias após o
              início.
            </p>
          )}
        </>
      ) : (
        <>
          <h2>Uma amostra de curiosidade</h2>
          <p>Três palavras fáceis, temas surpresa.</p>
          <Link className="acao botao-grande" to="/jogar/demonstracao">
            Jogo rápido
          </Link>
          <p className="nota">
            Essa experiência está em preparação. Enquanto isso, você já pode
            entrar com Google e personalizar seu perfil.
          </p>
        </>
      )}
    </div>
  );
}
