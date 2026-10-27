import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Aplicacao } from "./aplicacao/Aplicacao";
import "./estilos/base.css";

const elemento = document.getElementById("raiz");
if (!elemento) throw new Error("Elemento raiz não encontrado.");
createRoot(elemento).render(
  <StrictMode>
    <Aplicacao />
  </StrictMode>,
);
