// Módulos "vacíos" que cumplen el contrato del núcleo (tarea N9). Sirven para probar el núcleo
// sin depender de los módulos reales, que programan los agentes.
import {
  crearRegistro, desdeOrdinal, ordinal, type Contexto, type Efecto, type IdModulo, type Modulo, type Partida,
  type Registro, type Resultado, type Salida,
} from '../../src/nucleo';

export interface Contadores {
  dias: Record<IdModulo, number>;
  semanas: Record<IdModulo, number>;
  temporadas: Record<IdModulo, number>;
  previas: number;
  posts: number;
  orden: IdModulo[];
}

export function contadoresVacios(): Contadores {
  const cero = () => ({ club: 0, mercado: 0, liga: 0, partido: 0, movidas: 0, economia: 0 });
  return { dias: cero(), semanas: cero(), temporadas: cero(), previas: 0, posts: 0, orden: [] };
}

interface PorcionFalsa { caja: number; fama: number; marcas: Record<string, number | boolean>; ultimoAzar: number; puntos: number; partidos: number }

const porcionInicial = (): PorcionFalsa => ({ caja: 0, fama: 0, marcas: {}, ultimoAzar: 0, puntos: 0, partidos: 0 });

/** Arma un módulo falso; `extra` permite sobreescribir ganchos en un test. */
export function moduloFalso(id: IdModulo, c: Contadores, extra: Partial<Modulo> = {}): Modulo {
  const base: Modulo = {
    id,
    iniciar: () => porcionInicial(),
    alAvanzarDia(ctx: Contexto): Salida {
      c.dias[id]++;
      c.orden.push(id);
      const p = ctx.partida[id] as PorcionFalsa;
      // Consume azar para comprobar que cada flujo es independiente y reproducible.
      ctx.rng.siguiente();
      void p;
      return {};
    },
    alCerrarSemana: () => { c.semanas[id]++; },
    alCerrarTemporada: () => { c.temporadas[id]++; },
    antesDelPartido: () => { if (id === 'liga') c.previas++; },
    despuesDelPartido: (_ctx, r: Resultado) => {
      if (id !== 'liga') return;
      c.posts++;
      const [gl, gv] = r.goles;
      const pts = gl > gv ? 3 : gl === gv ? 1 : 0;
      return { efectos: [{ origen: 'liga:resultado', tipo: 'marca', clave: 'puntos', valor: pts }] };
    },
  };
  if (id === 'economia') {
    base.efectosQueAplica = ['plata'];
    base.aplicarEfecto = (p, e: Efecto) => (e.tipo === 'plata' ? { ...(p as PorcionFalsa), caja: (p as PorcionFalsa).caja + e.valor } : p);
  }
  if (id === 'club') {
    base.efectosQueAplica = ['fama', 'relacion', 'obra'];
    base.aplicarEfecto = (p, e: Efecto) => (e.tipo === 'fama' ? { ...(p as PorcionFalsa), fama: (p as PorcionFalsa).fama + e.valor } : p);
  }
  if (id === 'mercado') {
    base.efectosQueAplica = ['jugador', 'temporal'];
    base.aplicarEfecto = (p) => p;
  }
  if (id === 'movidas') {
    base.efectosQueAplica = ['marca'];
    base.aplicarEfecto = (p, e: Efecto) => {
      if (e.tipo !== 'marca') return p;
      const q = p as PorcionFalsa;
      if (e.clave === 'puntos') return { ...q, puntos: q.puntos + Number(e.valor), partidos: q.partidos + 1 };
      return { ...q, marcas: { ...q.marcas, [e.clave]: e.valor } };
    };
  }
  return { ...base, ...extra };
}

/** Agenda falsa: el club juega todos los sábados; partido de copa los martes de semanas pares. */
export function agendaFalsa(p: Readonly<Partida>) {
  const hoy = ordinal(p.tiempo.hoy);
  for (let d = hoy; d < hoy + 14; d++) {
    const i = desdeOrdinal(d);
    if (i.dia === 'sab' || (i.dia === 'mar' && i.semana % 2 === 0)) {
      return { partido: `p-${i.temporada}-${i.semana}-${i.dia}`, cuando: i };
    }
  }
  return undefined;
}

/** Motor falso: resultado al azar con el flujo del módulo partido. */
export function motorFalso(ctx: Contexto, partido: string): { resultado: Resultado; salida: Salida } {
  const goles = [ctx.rng.entero(0, 3), ctx.rng.entero(0, 3)] as const;
  return {
    resultado: { partido, local: 'Villa Ferro', visitante: 'Rival', goles },
    salida: { efectos: [{ origen: 'partido:taquilla', tipo: 'plata', valor: 1_000_000, concepto: 'recaudacion' }], noticias: [{ titulo: `Final: ${goles[0]}-${goles[1]}`, importancia: 1 }] },
  };
}

export function registroFalso(c: Contadores = contadoresVacios(), extras: Partial<Record<IdModulo, Partial<Modulo>>> = {}): Registro {
  const ids: IdModulo[] = ['club', 'mercado', 'liga', 'partido', 'movidas', 'economia'];
  return crearRegistro(ids.map((id) => moduloFalso(id, c, extras[id])), agendaFalsa, motorFalso);
}
