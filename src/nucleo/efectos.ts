// Aplicación de efectos (NUC-3): cada tipo de efecto lo aplica el módulo dueño de esa porción.
// El núcleo resuelve el azar y anota cada efecto aplicado (para auditar de dónde salió cada cambio).
import { Rng } from './rng';
import type { Contexto, Registro } from './modulo';
import { agregarNoticias } from './noticias';
import { MODULOS, type Efecto, type IdModulo, type Noticia, type Partida, type TipoEfecto } from './tipos';

export interface EfectoAplicado {
  efecto: Efecto;
  modulo: IdModulo;
}

export function duenoDeEfecto(registro: Registro, tipo: TipoEfecto): IdModulo | undefined {
  for (const id of MODULOS) {
    if (registro.modulos[id].efectosQueAplica?.includes(tipo)) return id;
  }
  return undefined;
}

/**
 * Aplica una lista de efectos y devuelve la partida nueva.
 * Los efectos `azar` se resuelven con el flujo de azar del núcleo.
 * Un efecto sin dueño registrado es un error de programación: se lanza excepción.
 */
export function aplicarEfectos(
  partida: Partida,
  efectos: readonly Efecto[],
  registro: Registro,
  registroAplicados?: EfectoAplicado[],
): Partida {
  let p = partida;
  const rngNucleo = new Rng(p.rng.nucleo);
  const pendientes = [...efectos];
  while (pendientes.length > 0) {
    const e = pendientes.shift()!;
    if (e.tipo === 'accion') {
      // Un módulo le pide a otro que ejecute una acción propia (ej. movida que vende a un jugador).
      const destino = registro.modulos[e.modulo];
      if (!destino.reducir) throw new Error(`el módulo ${e.modulo} no acepta acciones (origen: ${e.origen})`);
      const ctx: Contexto = { partida: p, rng: new Rng(p.rng[e.modulo]), hoy: p.tiempo.hoy };
      const r = destino.reducir(p[e.modulo] as never, e.accion, ctx);
      p = { ...p, [e.modulo]: r.porcion, rng: { ...p.rng, [e.modulo]: ctx.rng.estado } };
      if (r.salida?.noticias?.length) {
        const sellos: Noticia[] = r.salida.noticias.map((n) => ({ ...n, modulo: e.modulo, cuando: p.tiempo.hoy }));
        p = { ...p, noticias: agregarNoticias(p.noticias, sellos) };
      }
      pendientes.unshift(...(r.salida?.efectos ?? []));
      registroAplicados?.push({ efecto: e, modulo: e.modulo });
      continue;
    }
    if (e.tipo === 'azar') {
      const sale = rngNucleo.chance(e.probabilidad);
      const rama = (sale ? e.si : e.sino) ?? [];
      pendientes.unshift(...rama.map((x) => ({ ...x, origen: x.origen || e.origen })));
      continue;
    }
    const id = duenoDeEfecto(registro, e.tipo);
    if (!id) throw new Error(`nadie aplica el efecto "${e.tipo}" (origen: ${e.origen})`);
    const modulo = registro.modulos[id];
    const ctx: Contexto = { partida: p, rng: new Rng(p.rng[id]), hoy: p.tiempo.hoy };
    const nueva = modulo.aplicarEfecto!(p[id] as never, e, ctx);
    p = { ...p, [id]: nueva, rng: { ...p.rng, [id]: ctx.rng.estado } };
    registroAplicados?.push({ efecto: e, modulo: id });
  }
  return { ...p, rng: { ...p.rng, nucleo: rngNucleo.estado } };
}
