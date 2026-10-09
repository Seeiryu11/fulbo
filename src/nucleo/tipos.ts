// Tipos del contrato del núcleo (specs/nucleo/design.md). Todos los módulos los importan desde acá.

export type IdModulo = 'club' | 'mercado' | 'liga' | 'partido' | 'movidas' | 'economia';
export const MODULOS: readonly IdModulo[] = ['club', 'mercado', 'liga', 'partido', 'movidas', 'economia'];

export type Dia = 'lun' | 'mar' | 'mie' | 'jue' | 'vie' | 'sab' | 'dom';
export const DIAS: readonly Dia[] = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];

/** Un momento del calendario del juego: temporada (año), semana (1–52) y día. */
export interface Instante {
  temporada: number;
  semana: number;
  dia: Dia;
}

export type Fase = 'gestion' | 'previa' | 'partido' | 'resumen' | 'receso';

export type IdPartido = string;
export type IdJugador = string;

export interface Tiempo {
  hoy: Instante;
  fase: Fase;
  proximoPartido?: IdPartido;
}

// ---------- efectos (lenguaje común entre módulos, §5) ----------

export type ConceptoEconomico =
  | 'recaudacion' | 'buffet' | 'tv' | 'sponsors' | 'merchandising' | 'premios' | 'ventas'
  | 'sueldos' | 'staff' | 'obras' | 'mantenimiento' | 'impuestos' | 'compras' | 'multas' | 'intereses'
  | 'prestamo' | 'movidas' | 'otros';

export type Relacion = 'hinchas' | 'barra' | 'socios' | 'comision' | 'afa' | 'municipio' | 'prensa' | 'sponsors' | 'plantel';

export type Atributo = 'pegada' | 'velocidad' | 'gambeta' | 'pase' | 'marca' | 'fisico' | 'liderazgo' | 'atajada';

export type CuerpoEfecto =
  | { tipo: 'plata'; valor: number; concepto: ConceptoEconomico }
  | { tipo: 'fama'; valor: number }
  | { tipo: 'relacion'; con: Relacion; valor: number }
  | { tipo: 'jugador'; jugador: IdJugador | 'plantel'; campo: 'moral' | 'condicion' | Atributo; valor: number }
  | { tipo: 'temporal'; jugador: IdJugador | 'plantel'; efecto: string; partidos: number }
  | { tipo: 'obra'; edificio: string; fechas: number }
  | { tipo: 'marca'; clave: string; valor: number | boolean }
  /** Pide a un módulo que ejecute una acción propia (ej. una movida que vende a un jugador a Arabia). */
  | { tipo: 'accion'; modulo: IdModulo; accion: { tipo: string; [dato: string]: unknown } }
  | { tipo: 'azar'; probabilidad: number; si: Efecto[]; sino?: Efecto[] };

/** Un cambio pedido por un módulo. `origen` permite auditar de dónde salió (ej. "movidas:tinta-final"). */
export type Efecto = { origen: string } & CuerpoEfecto;
export type TipoEfecto = CuerpoEfecto['tipo'];

// ---------- noticias e interrupciones (§6) ----------

export interface Noticia {
  cuando: Instante;
  modulo: IdModulo | 'nucleo';
  titulo: string;
  texto?: string;
  importancia: 1 | 2 | 3;
}

export interface Interrupcion {
  tipo: 'movida' | 'oferta' | 'obra' | 'lesion' | 'evento';
  ref: string;
  motivo: string;
}

// ---------- partida (§7) ----------

/**
 * Cada módulo registra el tipo de su porción con "declaration merging":
 *   declare module '../../nucleo/tipos' { interface PorcionesRegistradas { club: EstadoClub } }
 * Mientras un módulo no la registre, su porción es `unknown`.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PorcionesRegistradas {}

export type Porciones = {
  [K in IdModulo]: K extends keyof PorcionesRegistradas ? PorcionesRegistradas[K] : unknown;
};

export interface Meta {
  version: number;
  semilla: number;
  creada: Instante;
}

/** Estado de los generadores de azar: uno por módulo más el del núcleo. */
export type EstadoRng = Record<IdModulo | 'nucleo', number>;

export interface Partida extends Porciones {
  meta: Meta;
  tiempo: Tiempo;
  noticias: Noticia[];
  rng: EstadoRng;
}

// ---------- resultado de un partido (lo mínimo que el núcleo necesita) ----------

export interface Resultado {
  partido: IdPartido;
  local: string;
  visitante: string;
  goles: readonly [number, number];
  /** Detalle propio del módulo partido (eventos, highlights, figura…). */
  detalle?: unknown;
}
