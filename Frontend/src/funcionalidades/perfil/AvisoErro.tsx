import { useEffect, useRef } from "react";

export function AvisoErro({ mensagem }: { mensagem: string }) {
  const elemento = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    elemento.current?.focus();
  }, [mensagem]);
  return (
    <p ref={elemento} tabIndex={-1} role="alert" className="aviso-erro">
      {mensagem}
    </p>
  );
}
