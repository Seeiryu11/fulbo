// N10 · Temporada completa sin pantalla (NUC-7): el núcleo corre 52 semanas de punta a punta,
// es determinista y rápido. Con los módulos reales se suman verificaciones de tabla, plata y planteles.
import { crearPartida, instante, jugarProximaFecha, serializar, type Partida, type Registro } from '../../src/nucleo';
import { contadoresVacios, registroFalso, type Contadores } from '../ayudas/modulosFalsos';

function temporadaCompleta(semilla: number, registro: Registro): Partida {
  let p = crearPartida(registro, { semilla, temporada: 2026 });
  let guardia = 0;
  // Juega fechas hasta pasar a la temporada siguiente.
  while (p.tiempo.hoy.temporada === 2026) {
    p = jugarProximaFecha(p, registro).partida;
    if (++guardia > 500) throw new Error('la temporada no termina');
  }
  return p;
}

describe('temporada completa sin pantalla (N10)', () => {
  let c: Contadores;
  let p: Partida;
  let ms: number;

  beforeAll(() => {
    c = contadoresVacios();
    const t0 = performance.now();
    p = temporadaCompleta(2026, registroFalso(c));
    ms = performance.now() - t0;
  });

  it('cierra 52 semanas y una temporada en cada módulo', () => {
    expect(c.semanas.liga).toBe(52);
    expect(c.semanas.economia).toBe(52);
    expect(c.temporadas.movidas).toBe(1);
    expect(p.tiempo.hoy.temporada).toBe(2027);
    expect(p.tiempo.hoy.semana).toBe(1);
  });

  it('los resultados cierran: un partido jugado = un resultado anotado', () => {
    const movidas = p.movidas as unknown as { puntos: number; partidos: number };
    expect(movidas.partidos).toBe(c.posts);
    expect(movidas.puntos).toBeLessThanOrEqual(movidas.partidos * 3);
    expect((p.economia as unknown as { caja: number }).caja).toBe(c.posts * 1_000_000);
  });

  it('es determinista: misma semilla, misma partida', () => {
    const otra = temporadaCompleta(2026, registroFalso());
    expect(serializar(otra)).toBe(serializar(p));
    const distinta = temporadaCompleta(7, registroFalso());
    expect(serializar(distinta)).not.toBe(serializar(p));
  });

  it('corre en menos de 10 segundos', () => {
    expect(ms).toBeLessThan(10_000);
  });

  it('arranca en la semana 1', () => {
    expect(crearPartida(registroFalso(), { semilla: 1 }).tiempo.hoy).toEqual(instante(2026, 1, 'lun'));
  });
});
