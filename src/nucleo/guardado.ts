// Guardado (NUC-6): partida serializable a JSON con versión y migraciones.
import { VERSION_PARTIDA } from './partida';
import type { Partida } from './tipos';

/** Migración de la versión N a la N+1. */
export type Migracion = (datos: Record<string, unknown>) => Record<string, unknown>;

/** Migraciones registradas: clave = versión de origen. */
export const MIGRACIONES: Record<number, Migracion> = {};

export function serializar(p: Partida): string {
  return JSON.stringify(p);
}

export function deserializar(texto: string, migraciones: Record<number, Migracion> = MIGRACIONES, versionActual = VERSION_PARTIDA): Partida {
  let datos = JSON.parse(texto) as Record<string, unknown>;
  const meta = datos.meta as { version?: number } | undefined;
  let version = meta?.version;
  if (typeof version !== 'number') throw new Error('partida guardada sin versión');
  if (version > versionActual) throw new Error(`partida de una versión más nueva (${version}) que el juego (${versionActual})`);
  while (version < versionActual) {
    const migrar = migraciones[version];
    if (!migrar) throw new Error(`falta la migración de la versión ${version} a la ${version + 1}`);
    datos = migrar(datos);
    version += 1;
    datos = { ...datos, meta: { ...(datos.meta as object), version } };
  }
  return datos as unknown as Partida;
}

/** Dónde se guarda (localStorage en el navegador, memoria en tests). */
export interface Almacen {
  leer(clave: string): string | null;
  escribir(clave: string, valor: string): void;
  borrar(clave: string): void;
}

export function almacenEnMemoria(): Almacen {
  const m = new Map<string, string>();
  return {
    leer: (c) => m.get(c) ?? null,
    escribir: (c, v) => void m.set(c, v),
    borrar: (c) => void m.delete(c),
  };
}

export function almacenLocal(): Almacen {
  return {
    leer: (c) => {
      try { return globalThis.localStorage?.getItem(c) ?? null; } catch { return null; }
    },
    escribir: (c, v) => {
      try { globalThis.localStorage?.setItem(c, v); } catch { /* sin espacio o bloqueado: no se guarda */ }
    },
    borrar: (c) => {
      try { globalThis.localStorage?.removeItem(c); } catch { /* nada */ }
    },
  };
}

export const CLAVE_PARTIDA = 'fulbo:partida';

export function guardar(p: Partida, almacen: Almacen, clave = CLAVE_PARTIDA): void {
  almacen.escribir(clave, serializar(p));
}

export function cargar(almacen: Almacen, clave = CLAVE_PARTIDA): Partida | null {
  const texto = almacen.leer(clave);
  return texto ? deserializar(texto) : null;
}
