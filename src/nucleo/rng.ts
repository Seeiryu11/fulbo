// Azar con semilla (NUC-4). Generador mulberry32: rápido, de 32 bits y reproducible.
// Cada módulo tiene su propio flujo, derivado de la semilla de la partida, para que
// agregar una tirada en un módulo no cambie los resultados de los demás.
import { MODULOS, type EstadoRng, type IdModulo } from './tipos';

export class Rng {
  private s: number;

  constructor(estado: number) {
    this.s = estado >>> 0;
  }

  /** Estado actual, para guardarlo en la partida. */
  get estado(): number {
    return this.s;
  }

  /** Número en [0, 1). */
  siguiente(): number {
    this.s = (this.s + 0x6d2b79f5) >>> 0;
    let t = this.s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Entero en [min, max], ambos incluidos. */
  entero(min: number, max: number): number {
    return min + Math.floor(this.siguiente() * (max - min + 1));
  }

  /** Real en [min, max). */
  real(min: number, max: number): number {
    return min + this.siguiente() * (max - min);
  }

  /** true con probabilidad p (0–1). */
  chance(p: number): boolean {
    return this.siguiente() < p;
  }

  elegir<T>(opciones: readonly T[]): T {
    if (opciones.length === 0) throw new Error('elegir: lista vacía');
    return opciones[Math.floor(this.siguiente() * opciones.length)]!;
  }

  /** Elige según pesos (no hace falta que sumen 1). */
  ponderado<T>(opciones: readonly { valor: T; peso: number }[]): T {
    const total = opciones.reduce((a, o) => a + Math.max(0, o.peso), 0);
    if (total <= 0) throw new Error('ponderado: pesos inválidos');
    let r = this.siguiente() * total;
    for (const o of opciones) {
      r -= Math.max(0, o.peso);
      if (r < 0) return o.valor;
    }
    return opciones[opciones.length - 1]!.valor;
  }

  /** Normal aproximada (Box-Muller), media 0 y desvío 1. */
  normal(): number {
    const u = Math.max(this.siguiente(), 1e-12);
    const v = this.siguiente();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  /**
   * Flujo hijo independiente, derivado por etiqueta (ej. el id de un partido).
   * No consume azar de este flujo: el mismo estado + la misma etiqueta dan siempre el mismo hijo.
   */
  derivar(etiqueta: string): Rng {
    return new Rng(derivarSemilla(this.s, etiqueta));
  }

  /** Mezcla una copia de la lista (Fisher-Yates). */
  mezclar<T>(lista: readonly T[]): T[] {
    const a = [...lista];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.siguiente() * (i + 1));
      [a[i], a[j]] = [a[j]!, a[i]!];
    }
    return a;
  }
}

/** Hash de 32 bits (FNV-1a) para derivar semillas por nombre. */
export function hash32(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function derivarSemilla(semilla: number, flujo: string): number {
  return (hash32(`${semilla >>> 0}:${flujo}`) ^ Math.imul(semilla >>> 0, 0x9e3779b1)) >>> 0;
}

export function estadoRngInicial(semilla: number): EstadoRng {
  const estado = { nucleo: derivarSemilla(semilla, 'nucleo') } as EstadoRng;
  for (const m of MODULOS) estado[m] = derivarSemilla(semilla, m);
  return estado;
}

export type FlujoRng = IdModulo | 'nucleo';
