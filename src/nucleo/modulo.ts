// Contrato de módulo (specs/nucleo/design.md §4) y registro de los seis módulos.
import type { Rng } from './rng';
import type {
  Efecto, IdModulo, IdPartido, Instante, Interrupcion, Noticia, Partida, Porciones, Resultado, TipoEfecto,
} from './tipos';

export interface Contexto {
  /** Todo el estado, solo lectura. En modo estricto está congelado. */
  partida: Readonly<Partida>;
  /** Flujo de azar propio del módulo. */
  rng: Rng;
  hoy: Instante;
}

export interface Salida {
  /** Nueva versión de la porción propia del módulo (si cambió). Solo la puede devolver el dueño. */
  porcion?: unknown;
  efectos?: Efecto[];
  noticias?: Omit<Noticia, 'modulo' | 'cuando'>[];
  interrupcion?: Interrupcion;
}

/** Acción del jugador dirigida a un módulo (construir, fichar, decidir una movida…). */
export interface Accion {
  tipo: string;
  [dato: string]: unknown;
}

export interface Modulo<Id extends IdModulo = IdModulo> {
  id: Id;
  /**
   * Partida nueva: devuelve la porción inicial.
   * `creacion` trae lo que eligió el usuario al crear el club (nombre, colores, ambientación, estilo…);
   * cada módulo lee lo suyo.
   */
  iniciar(ctx: Contexto, creacion: Readonly<Record<string, unknown>>): Porciones[Id];
  /** Acciones del jugador sobre su porción. Pura. Puede devolver efectos para otras porciones. */
  reducir?(porcion: Porciones[Id], accion: Accion, ctx: Contexto): { porcion: Porciones[Id]; salida?: Salida };
  /** Tipos de efecto que este módulo sabe aplicar sobre su porción. */
  efectosQueAplica?: readonly TipoEfecto[];
  aplicarEfecto?(porcion: Porciones[Id], efecto: Efecto, ctx: Contexto): Porciones[Id];
  alAvanzarDia?(ctx: Contexto): Salida | void;
  antesDelPartido?(ctx: Contexto, partido: IdPartido): Salida | void;
  despuesDelPartido?(ctx: Contexto, resultado: Resultado): Salida | void;
  alCerrarSemana?(ctx: Contexto): Salida | void;
  alCerrarTemporada?(ctx: Contexto): Salida | void;
}

/** Próximo partido del club del usuario, según la liga. */
export interface Agenda {
  partido: IdPartido;
  cuando: Instante;
  /** true si para ese partido el usuario juega de local (habilita precio de entradas, etc.). */
  local?: boolean;
}

export interface Registro {
  modulos: Readonly<Record<IdModulo, Modulo>>;
  /** Lo provee el módulo liga. */
  proximoPartido(partida: Readonly<Partida>): Agenda | undefined;
  /** Lo provee el módulo partido: juega (o simula) el partido del usuario. */
  jugarPartido(ctx: Contexto, partido: IdPartido): { resultado: Resultado; salida?: Salida };
}

/** Orden fijo de ejecución diaria (§4). El módulo partido corre solo en las fases de partido. */
export const ORDEN_DIARIO: readonly IdModulo[] = ['liga', 'mercado', 'club', 'economia', 'movidas'];
/** Orden para los ganchos alrededor del partido y de cierre. */
export const ORDEN_COMPLETO: readonly IdModulo[] = ['liga', 'mercado', 'club', 'partido', 'economia', 'movidas'];

export function crearRegistro(
  modulos: Modulo[],
  proximoPartido: Registro['proximoPartido'],
  jugarPartido: Registro['jugarPartido'],
): Registro {
  const mapa = {} as Record<IdModulo, Modulo>;
  for (const m of modulos) {
    if (mapa[m.id]) throw new Error(`módulo duplicado: ${m.id}`);
    mapa[m.id] = m;
  }
  for (const id of ORDEN_COMPLETO) if (!mapa[id]) throw new Error(`falta registrar el módulo: ${id}`);
  // Cada tipo de efecto tiene un único dueño.
  const duenos = new Map<TipoEfecto, IdModulo>();
  for (const m of modulos) {
    for (const t of m.efectosQueAplica ?? []) {
      if (t === 'azar' || t === 'accion') throw new Error(`el efecto "${t}" lo resuelve el núcleo, no ${m.id}`);
      const otro = duenos.get(t);
      if (otro) throw new Error(`el efecto "${t}" lo reclaman ${otro} y ${m.id}`);
      if (!m.aplicarEfecto) throw new Error(`${m.id} declara efectos pero no implementa aplicarEfecto`);
      duenos.set(t, m.id);
    }
  }
  return { modulos: mapa, proximoPartido, jugarPartido };
}
