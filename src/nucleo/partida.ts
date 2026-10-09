// Creación de una partida nueva.
import { Rng, estadoRngInicial } from './rng';
import { instante } from './tiempo';
import { ORDEN_COMPLETO, type Contexto, type Registro } from './modulo';
import type { Instante, Partida } from './tipos';

export const VERSION_PARTIDA = 1;

export interface OpcionesPartida {
  semilla: number;
  /** Temporada (año) en la que arranca. Por defecto 2026. */
  temporada?: number;
  /** Instante inicial; por defecto lunes de la semana 1. */
  inicio?: Instante;
  /** Lo que eligió el usuario al crear el club (pantalla #/crear). */
  creacion?: Record<string, unknown>;
}

export function crearPartida(registro: Registro, opciones: OpcionesPartida): Partida {
  const hoy = opciones.inicio ?? instante(opciones.temporada ?? 2026, 1, 'lun');
  const base = {
    meta: { version: VERSION_PARTIDA, semilla: opciones.semilla >>> 0, creada: hoy },
    tiempo: { hoy, fase: 'gestion' as const },
    noticias: [],
    rng: estadoRngInicial(opciones.semilla),
  };
  // Los módulos se inician en orden; cada uno ve las porciones de los anteriores.
  let p = base as unknown as Partida;
  for (const id of ORDEN_COMPLETO) {
    const rng = new Rng(p.rng[id]);
    const ctx: Contexto = { partida: p, rng, hoy };
    const porcion = registro.modulos[id].iniciar(ctx, opciones.creacion ?? {});
    p = { ...p, [id]: porcion, rng: { ...p.rng, [id]: rng.estado } };
  }
  const agenda = registro.proximoPartido(p);
  return agenda ? { ...p, tiempo: { ...p.tiempo, proximoPartido: agenda.partido } } : p;
}
