// Ciclo entre partidos (NUC-2, specs/nucleo/design.md §3).
//
// Convención de días: el día "hoy" es el día en que el usuario está gestionando y todavía
// no se procesó. Avanzar procesa hoy (todos los módulos, en orden) y pasa al día siguiente.
// El día de un partido se procesa después de jugarlo, así cada día se procesa una sola vez.
import { aplicarEfectos } from './efectos';
import { ORDEN_COMPLETO, ORDEN_DIARIO, type Contexto, type Registro, type Salida } from './modulo';
import { agregarNoticias } from './noticias';
import { Rng } from './rng';
import { compararInstantes, esUltimoDiaDeSemana, esUltimoDiaDeTemporada, siguienteDia } from './tiempo';
import type { IdModulo, Instante, Interrupcion, Noticia, Partida, Resultado } from './tipos';

export interface OpcionesCiclo {
  /** Congela la partida antes de pasarla a los módulos (para tests: detecta mutaciones). */
  estricto?: boolean;
}

export interface ResultadoAvance {
  partida: Partida;
  interrupcion?: Interrupcion;
  resultado?: Resultado;
}

type Gancho = (ctx: Contexto) => Salida | void;

function congelar<T>(obj: T): T {
  if (obj && typeof obj === 'object' && !Object.isFrozen(obj)) {
    Object.freeze(obj);
    for (const v of Object.values(obj as object)) congelar(v);
  }
  return obj;
}

/** Corre un gancho de un módulo y aplica lo que devuelve (efectos, noticias). */
function correr(
  p: Partida,
  registro: Registro,
  id: IdModulo,
  gancho: Gancho,
  opciones: OpcionesCiclo,
): { partida: Partida; interrupcion?: Interrupcion } {
  const rng = new Rng(p.rng[id]);
  const ctx: Contexto = { partida: opciones.estricto ? congelar(p) : p, rng, hoy: p.tiempo.hoy };
  const salida = gancho(ctx) ?? {};
  let nueva: Partida = { ...p, rng: { ...p.rng, [id]: rng.estado } };
  return aplicarSalida(nueva, registro, id, salida);
}

export function aplicarSalida(
  p: Partida,
  registro: Registro,
  id: IdModulo,
  salida: Salida,
): { partida: Partida; interrupcion?: Interrupcion } {
  let nueva: Partida = salida.porcion !== undefined ? { ...p, [id]: salida.porcion } : p;
  if (salida.efectos?.length) nueva = aplicarEfectos(nueva, salida.efectos, registro);
  if (salida.noticias?.length) {
    const sellos: Noticia[] = salida.noticias.map((n) => ({ ...n, modulo: id, cuando: p.tiempo.hoy }));
    nueva = { ...nueva, noticias: agregarNoticias(nueva.noticias, sellos) };
  }
  return salida.interrupcion ? { partida: nueva, interrupcion: salida.interrupcion } : { partida: nueva };
}

function correrEnOrden(
  p: Partida,
  registro: Registro,
  orden: readonly IdModulo[],
  elegir: (m: Registro['modulos'][IdModulo]) => Gancho | undefined,
  opciones: OpcionesCiclo,
): { partida: Partida; interrupcion?: Interrupcion } {
  let partida = p;
  let interrupcion: Interrupcion | undefined;
  for (const id of orden) {
    const modulo = registro.modulos[id];
    const gancho = elegir(modulo);
    if (!gancho) continue;
    const r = correr(partida, registro, id, gancho.bind(modulo), opciones);
    partida = r.partida;
    interrupcion ??= r.interrupcion; // la primera interrupción del día es la que se muestra
  }
  return interrupcion ? { partida, interrupcion } : { partida };
}

/** Procesa el día de hoy (y los cierres de semana/temporada si corresponde) y pasa al día siguiente. */
export function procesarDia(p: Partida, registro: Registro, opciones: OpcionesCiclo = {}): ResultadoAvance {
  const hoy = p.tiempo.hoy;
  let r = correrEnOrden(p, registro, ORDEN_DIARIO, (m) => m.alAvanzarDia, opciones);
  let interrupcion = r.interrupcion;
  if (esUltimoDiaDeSemana(hoy)) {
    r = correrEnOrden(r.partida, registro, ORDEN_COMPLETO, (m) => m.alCerrarSemana, opciones);
    interrupcion ??= r.interrupcion;
  }
  if (esUltimoDiaDeTemporada(hoy)) {
    r = correrEnOrden(r.partida, registro, ORDEN_COMPLETO, (m) => m.alCerrarTemporada, opciones);
    interrupcion ??= r.interrupcion;
  }
  const manana = siguienteDia(hoy);
  let partida: Partida = { ...r.partida, tiempo: { ...r.partida.tiempo, hoy: manana } };
  partida = actualizarProximo(partida, registro);
  return interrupcion ? { partida, interrupcion } : { partida };
}

function actualizarProximo(p: Partida, registro: Registro): Partida {
  const agenda = registro.proximoPartido(p);
  const { proximoPartido: _anterior, ...resto } = p.tiempo;
  return { ...p, tiempo: agenda ? { ...resto, proximoPartido: agenda.partido } : resto };
}

/**
 * Avanza día por día hasta que `hoy` sea `objetivo` (sin procesarlo).
 * Si un día genera una interrupción, termina ese día y se detiene en el siguiente.
 */
export function avanzarHasta(p: Partida, registro: Registro, objetivo: Instante, opciones: OpcionesCiclo = {}): ResultadoAvance {
  let partida: Partida = { ...p, tiempo: { ...p.tiempo, fase: 'gestion' } };
  while (compararInstantes(partida.tiempo.hoy, objetivo) < 0) {
    const r = procesarDia(partida, registro, opciones);
    partida = r.partida;
    if (r.interrupcion) return { partida, interrupcion: r.interrupcion };
  }
  return { partida };
}

/**
 * Lleva el calendario hasta el día del próximo partido del usuario y abre la previa.
 * Si aparece una interrupción en el camino, se detiene antes (fase gestión).
 */
export function irAlPartido(p: Partida, registro: Registro, opciones: OpcionesCiclo = {}): ResultadoAvance {
  const agenda = registro.proximoPartido(p);
  if (!agenda) throw new Error('no hay próximo partido en la agenda');
  const r = avanzarHasta(p, registro, agenda.cuando, opciones);
  if (r.interrupcion) return r;
  let partida: Partida = { ...r.partida, tiempo: { ...r.partida.tiempo, fase: 'previa', proximoPartido: agenda.partido } };
  const previa = correrEnOrden(partida, registro, ORDEN_COMPLETO, (m) => m.antesDelPartido && ((ctx) => m.antesDelPartido!(ctx, agenda.partido)), opciones);
  partida = previa.partida;
  return previa.interrupcion ? { partida, interrupcion: previa.interrupcion } : { partida };
}

/** Juega el partido de la previa, corre el resumen, procesa el día y vuelve a gestión. */
export function jugarPartidoActual(p: Partida, registro: Registro, opciones: OpcionesCiclo = {}): ResultadoAvance {
  if (p.tiempo.fase !== 'previa' || !p.tiempo.proximoPartido) throw new Error('no hay un partido en previa');
  const id = p.tiempo.proximoPartido;
  let partida: Partida = { ...p, tiempo: { ...p.tiempo, fase: 'partido' } };

  const rng = new Rng(partida.rng.partido);
  const ctx: Contexto = { partida: opciones.estricto ? congelar(partida) : partida, rng, hoy: partida.tiempo.hoy };
  const { resultado, salida } = registro.jugarPartido(ctx, id);
  partida = { ...partida, rng: { ...partida.rng, partido: rng.estado } };
  let interrupcion: Interrupcion | undefined;
  if (salida) {
    const s = aplicarSalida(partida, registro, 'partido', salida);
    partida = s.partida;
    interrupcion = s.interrupcion;
  }

  partida = { ...partida, tiempo: { ...partida.tiempo, fase: 'resumen' } };
  const post = correrEnOrden(partida, registro, ORDEN_COMPLETO, (m) => m.despuesDelPartido && ((c) => m.despuesDelPartido!(c, resultado)), opciones);
  partida = post.partida;
  interrupcion ??= post.interrupcion;

  const dia = procesarDia({ ...partida, tiempo: { ...partida.tiempo, fase: 'gestion' } }, registro, opciones);
  interrupcion ??= dia.interrupcion;
  return interrupcion ? { partida: dia.partida, interrupcion, resultado } : { partida: dia.partida, resultado };
}

/** Atajo para jugar la fecha entera sin pantalla: ir al partido y jugarlo. */
export function jugarProximaFecha(p: Partida, registro: Registro, opciones: OpcionesCiclo = {}): ResultadoAvance {
  const ida = irAlPartido(p, registro, opciones);
  if (ida.interrupcion || ida.partida.tiempo.fase !== 'previa') return ida;
  return jugarPartidoActual(ida.partida, registro, opciones);
}
