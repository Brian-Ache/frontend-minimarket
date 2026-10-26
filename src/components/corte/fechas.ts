/** Fecha local en formato YYYY-MM-DD (para parámetros ISO.DATE). Sin Z, convención del repo. */
export function aFechaISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Rango completo de un día en ISO.DATE_TIME naive local (sin Z).
 * El backend consulta rangos semiabiertos [desde, hasta), por eso `hasta` es el día
 * siguiente a las 00:00 y no las 23:59:59 del propio día.
 */
export function rangoDelDia(date: Date): { desde: string; hasta: string } {
  const siguiente = new Date(date);
  siguiente.setDate(siguiente.getDate() + 1);
  return {
    desde: `${aFechaISO(date)}T00:00:00`,
    hasta: `${aFechaISO(siguiente)}T00:00:00`,
  };
}

/** true si el Date pasado cae en el día de hoy. */
export function esHoy(date: Date): boolean {
  const hoy = new Date();
  return (
    date.getDate() === hoy.getDate() &&
    date.getMonth() === hoy.getMonth() &&
    date.getFullYear() === hoy.getFullYear()
  );
}
