import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  consultarAvatares,
  consultarPerfil,
  consultarPreferencias,
  consultarSessao,
  ErroDaApi,
  excluirConta,
  sairDaConta,
  salvarPerfil,
  salvarPreferencias,
  type Sessao,
} from "./api";
import {
  CHAVE_PREFERENCIAS,
  gravarPreferenciasLocais,
  lerPreferenciasLocais,
  PADRAO,
  type Preferencias,
} from "./preferencias";

export function useConta() {
  const cache = useQueryClient();
  const [painel, definirPainel] = useState<"perfil" | "preferencias">("perfil");
  const [mensagem, definirMensagem] = useState("");
  const [erro, definirErro] = useState("");
  const [aberto, definirAberto] = useState(false);
  const [erroExclusao, definirErroExclusao] = useState("");
  const [locais, definirLocais] = useState<Preferencias>(() => {
    try {
      return lerPreferenciasLocais(localStorage);
    } catch {
      return { ...PADRAO };
    }
  });
  const [previa, definirPrevia] = useState<Preferencias | null>(null);
  const inicializadas = useRef(new Set<string>());
  const sessao = useQuery({ queryKey: ["sessao"], queryFn: consultarSessao });
  const conta = sessao.data;
  const perfil = useQuery({
    queryKey: ["perfil", conta?.jogador_id],
    queryFn: consultarPerfil,
    enabled: !!conta,
  });
  const avatares = useQuery({
    queryKey: ["avatares"],
    queryFn: consultarAvatares,
    enabled: !!conta,
    staleTime: Infinity,
  });
  const preferencias = useQuery({
    queryKey: ["preferencias", conta?.jogador_id],
    queryFn: consultarPreferencias,
    enabled: !!conta,
  });
  const efetivas = previa ?? preferencias.data ?? locais;
  useEffect(() => {
    document.documentElement.dataset.tema = efetivas.tema;
    document.documentElement.dataset.movimentos = efetivas.movimentos_reduzidos
      ? "reduzidos"
      : "completos";
  }, [efetivas]);
  function terminar(texto: string) {
    cache.setQueryData(["sessao"], null);
    cache.removeQueries({
      predicate: (consulta) => consulta.queryKey[0] !== "sessao",
    });
    inicializadas.current.clear();
    definirPrevia(null);
    definirPainel("perfil");
    definirAberto(false);
    definirErro("");
    definirMensagem(texto);
  }
  function falhar(falha: Error) {
    if (
      falha instanceof ErroDaApi &&
      ["SESSAO_EXPIRADA", "SESSAO_NECESSARIA"].includes(falha.codigo)
    )
      terminar("Sua sessão terminou. Entre novamente para continuar.");
    else definirErro(falha.message);
  }
  const salvarDados = useMutation({
    mutationFn: (dados: { nome_usuario: string; avatar_id: string }) =>
      salvarPerfil(dados, conta!.token_csrf),
    onSuccess: (dados) => {
      cache.setQueryData(["perfil", conta!.jogador_id], dados);
      cache.setQueryData<Sessao>(["sessao"], (anterior) =>
        anterior ? { ...anterior, ...dados } : anterior,
      );
      definirErro("");
      definirMensagem("Perfil salvo. Pronto para novas descobertas!");
    },
    onError: falhar,
  });
  const salvarAjustes = useMutation({
    mutationFn: (dados: Preferencias) =>
      salvarPreferencias(dados, conta!.token_csrf),
    onSuccess: (dados) => {
      cache.setQueryData(["preferencias", conta!.jogador_id], dados);
      definirPrevia(null);
      definirErro("");
      definirMensagem("Preferências salvas na sua conta.");
    },
    onError: falhar,
  });
  const inicializar = useMutation({
    mutationFn: () => salvarPreferencias(locais, conta!.token_csrf, true),
    onSuccess: (dados) =>
      cache.setQueryData(["preferencias", conta!.jogador_id], dados),
    onError: falhar,
  });
  useEffect(() => {
    if (
      conta &&
      preferencias.data &&
      !preferencias.data.salvas &&
      !inicializadas.current.has(conta.jogador_id)
    ) {
      inicializadas.current.add(conta.jogador_id);
      inicializar.mutate();
    }
  }, [conta, preferencias.data, inicializar]);
  const excluir = useMutation({
    mutationFn: () => excluirConta(conta!.token_csrf),
    onSuccess: () => {
      try {
        localStorage.removeItem(CHAVE_PREFERENCIAS);
      } catch {
        /* A exclusão no servidor já foi confirmada. */
      }
      definirLocais({ ...PADRAO });
      terminar("Conta excluída. Seus resultados antigos ficaram anônimos.");
    },
    onError: (falha) => definirErroExclusao(falha.message),
  });
  const sair = useMutation({
    mutationFn: () => sairDaConta(conta!.token_csrf),
    onSuccess: () => terminar("Você saiu da sua conta."),
    onError: falhar,
  });
  const ocupado =
    salvarDados.isPending ||
    salvarAjustes.isPending ||
    excluir.isPending ||
    sair.isPending ||
    inicializar.isPending;
  function navegar(destino: typeof painel) {
    definirPainel(destino);
    definirErro("");
    definirMensagem("");
    definirPrevia(null);
  }
  function salvarLocal(dados: Preferencias) {
    let salvo = false;
    try {
      salvo = gravarPreferenciasLocais(localStorage, dados);
    } catch {
      /* Há navegadores que bloqueiam até o acesso ao Storage. */
    }
    definirLocais(dados);
    definirPrevia(null);
    definirMensagem(
      salvo
        ? "Preferências salvas neste navegador."
        : "Preferências aplicadas neste acesso. O navegador não permitiu salvá-las.",
    );
  }
  const falhaCarregamento =
    sessao.error ?? perfil.error ?? preferencias.error ?? avatares.error;
  useEffect(() => {
    if (
      conta &&
      falhaCarregamento instanceof ErroDaApi &&
      ["SESSAO_EXPIRADA", "SESSAO_NECESSARIA"].includes(
        falhaCarregamento.codigo,
      )
    ) {
      terminar("Sua sessão terminou. Entre novamente para continuar.");
    }
  }, [conta, falhaCarregamento]);
  const carregando =
    sessao.isPending ||
    (!!conta &&
      (perfil.isPending || preferencias.isPending || avatares.isPending));
  const atual = avatares.data?.find(
    (item) => item.id === perfil.data?.avatar_id,
  );
  return {
    efetivas,
    falhar,
    cache,
    painel,
    mensagem,
    erro,
    aberto,
    erroExclusao,
    locais,
    conta,
    perfil,
    avatares,
    preferencias,
    ocupado,
    carregando,
    atual,
    falhaCarregamento,
    salvarDados,
    salvarAjustes,
    excluir,
    sair,
    definirMensagem,
    definirErro,
    definirAberto,
    definirErroExclusao,
    definirPrevia,
    navegar,
    salvarLocal,
  };
}
