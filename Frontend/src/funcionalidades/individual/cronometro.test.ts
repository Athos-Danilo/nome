import { expect, it } from "vitest";
import { formatarTempo } from "./usar-cronometro";
it("mostra segundos, horas e ausência sem inventar duração", () => {
  expect(formatarTempo(null)).toBe("Tempo não registrado");
  expect(formatarTempo(0)).toBe("00:00");
  expect(formatarTempo(85999)).toBe("01:25");
  expect(formatarTempo(3661000)).toBe("01:01:01");
  expect(formatarTempo(100 * 3600000)).toBe("100:00:00");
});
