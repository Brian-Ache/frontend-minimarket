// Secuencia monótona por dispositivo para ordenar eventos de la cola.
// El backend ordena por ocurridoEn y desempata por secuencia; si dos eventos
// caen en el mismo segundo, esta secuencia conserva el orden real.
const STORAGE_KEY = "sync:last_sequence";

let last = 0;

function leerUltima(): number {
  if (typeof window === "undefined") return 0;
  try {
    const guardada = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(guardada) ? guardada : 0;
  } catch {
    return 0;
  }
}

export function nextSecuencia(): number {
  const ahora = Date.now();
  last = Math.max(ahora, last, leerUltima()) + 1;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(last));
    } catch {
      // localStorage puede fallar (modo privado/cuota). La secuencia sigue
      // siendo monótona dentro de esta sesión.
    }
  }

  return last;
}
