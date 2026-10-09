// Calendario del juego: temporada (año), semana 1–52 y día (NUC-1).
// Todo se calcula a partir del Instante; nunca se usa la fecha del sistema.
import { DIAS, type Dia, type Instante } from './tipos';

export const SEMANAS_POR_TEMPORADA = 52;

const NOMBRE_DIA: Record<Dia, string> = {
  lun: 'lunes', mar: 'martes', mie: 'miércoles', jue: 'jueves', vie: 'viernes', sab: 'sábado', dom: 'domingo',
};
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function instante(temporada: number, semana: number, dia: Dia = 'lun'): Instante {
  if (!Number.isInteger(semana) || semana < 1 || semana > SEMANAS_POR_TEMPORADA) throw new RangeError(`semana fuera de rango: ${semana}`);
  return { temporada, semana, dia };
}

export const indiceDia = (d: Dia): number => DIAS.indexOf(d);

/** Cantidad de días desde el inicio de la temporada 0 (sirve para comparar y restar). */
export function ordinal(i: Instante): number {
  return (i.temporada * SEMANAS_POR_TEMPORADA + (i.semana - 1)) * 7 + indiceDia(i.dia);
}

export function desdeOrdinal(n: number): Instante {
  const dia = DIAS[((n % 7) + 7) % 7]!;
  const semanas = Math.floor(n / 7);
  const temporada = Math.floor(semanas / SEMANAS_POR_TEMPORADA);
  const semana = semanas - temporada * SEMANAS_POR_TEMPORADA + 1;
  return { temporada, semana, dia };
}

export const compararInstantes = (a: Instante, b: Instante): number => ordinal(a) - ordinal(b);
export const mismoDia = (a: Instante, b: Instante): boolean => ordinal(a) === ordinal(b);
export const siguienteDia = (i: Instante): Instante => desdeOrdinal(ordinal(i) + 1);
export const sumarDias = (i: Instante, dias: number): Instante => desdeOrdinal(ordinal(i) + dias);
export const diasEntre = (desde: Instante, hasta: Instante): number => ordinal(hasta) - ordinal(desde);

export const esUltimoDiaDeSemana = (i: Instante): boolean => i.dia === 'dom';
export const esUltimoDiaDeTemporada = (i: Instante): boolean => i.dia === 'dom' && i.semana === SEMANAS_POR_TEMPORADA;

/**
 * Fecha "de calendario" equivalente, para mostrar ("martes 6 de octubre").
 * La semana 1 empieza el primer lunes de enero del año de la temporada.
 */
export function fechaCalendario(i: Instante): { dia: number; mes: number; anio: number } {
  const primeroDeEnero = Date.UTC(i.temporada, 0, 1);
  const diaSemanaEnero = new Date(primeroDeEnero).getUTCDay(); // 0 = domingo
  const hastaLunes = (8 - diaSemanaEnero) % 7; // días hasta el primer lunes (0 si el 1/1 es lunes)
  const ms = primeroDeEnero + (hastaLunes + (i.semana - 1) * 7 + indiceDia(i.dia)) * 86_400_000;
  const d = new Date(ms);
  return { dia: d.getUTCDate(), mes: d.getUTCMonth(), anio: d.getUTCFullYear() };
}

/** "Semana 41 · martes 6 de octubre" */
export function formatear(i: Instante): string {
  const f = fechaCalendario(i);
  return `Semana ${i.semana} · ${NOMBRE_DIA[i.dia]} ${f.dia} de ${MESES[f.mes]}`;
}

export const nombreDia = (d: Dia): string => NOMBRE_DIA[d];
