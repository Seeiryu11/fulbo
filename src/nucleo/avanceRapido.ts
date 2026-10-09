// Avance rápido (NUC-2.5): simula varios partidos seguidos hasta el próximo evento importante,
// para que una temporada de 38 fechas no se haga eterna.
import { irAlPartido, jugarPartidoActual, type OpcionesCiclo, type ResultadoAvance } from './ciclo';
import type { Registro } from './modulo';
import type { Noticia, Partida, Resultado } from './tipos';

export interface OpcionesAvanceRapido extends OpcionesCiclo {
  /** Máximo de partidos a simular de corrido. */
  maxPartidos?: number;
  /** Se detiene si aparece una noticia de esta importancia o más (por defecto 3). */
  importanciaQueFrena?: 1 | 2 | 3;
}

export interface ResultadoAvanceRapido {
  partida: Partida;
  resultados: Resultado[];
  motivo: 'interrupcion' | 'noticia-importante' | 'limite' | 'sin-partidos';
  interrupcion?: ResultadoAvance['interrupcion'];
}

/** Noticias agregadas después de `ultimaVista` (las noticias son inmutables: se compara por referencia). */
function noticiasNuevas(noticias: readonly Noticia[], ultimaVista: Noticia | undefined): readonly Noticia[] {
  if (!ultimaVista) return noticias;
  const i = noticias.lastIndexOf(ultimaVista);
  return i < 0 ? noticias : noticias.slice(i + 1);
}

export function avanceRapido(p: Partida, registro: Registro, opciones: OpcionesAvanceRapido = {}): ResultadoAvanceRapido {
  const max = opciones.maxPartidos ?? 10;
  const umbral = opciones.importanciaQueFrena ?? 3;
  let partida = p;
  const resultados: Resultado[] = [];
  for (let i = 0; i < max; i++) {
    if (!registro.proximoPartido(partida)) return { partida, resultados, motivo: 'sin-partidos' };
    const ultimaVista = partida.noticias.at(-1);
    const ida = irAlPartido(partida, registro, opciones);
    partida = ida.partida;
    if (ida.interrupcion) return { partida, resultados, motivo: 'interrupcion', interrupcion: ida.interrupcion };
    const r = jugarPartidoActual(partida, registro, opciones);
    partida = r.partida;
    if (r.resultado) resultados.push(r.resultado);
    if (r.interrupcion) return { partida, resultados, motivo: 'interrupcion', interrupcion: r.interrupcion };
    if (noticiasNuevas(partida.noticias, ultimaVista).some((n) => n.importancia >= umbral)) {
      return { partida, resultados, motivo: 'noticia-importante' };
    }
  }
  return { partida, resultados, motivo: 'limite' };
}
