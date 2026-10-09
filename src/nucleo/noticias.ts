// Registro de noticias (NUC-5): resultados, fichajes, obras, movidas. Alimenta el diario y las notificaciones.
import type { Instante, Noticia } from './tipos';

export const MAX_NOTICIAS = 400;

export function agregarNoticias(actuales: readonly Noticia[], nuevas: readonly Noticia[], max = MAX_NOTICIAS): Noticia[] {
  if (nuevas.length === 0) return actuales as Noticia[];
  const todas = [...actuales, ...nuevas];
  return todas.length > max ? todas.slice(todas.length - max) : todas;
}

export function noticiasDesde(noticias: readonly Noticia[], desde: Instante, ordinal: (i: Instante) => number): Noticia[] {
  const d = ordinal(desde);
  return noticias.filter((n) => ordinal(n.cuando) >= d);
}
