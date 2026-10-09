import { Rng, compararInstantes, derivarSemilla, desdeOrdinal, estadoRngInicial, formatear, instante, ordinal, siguienteDia, sumarDias } from '../../src/nucleo';

describe('tiempo (N1)', () => {
  it('pasa de domingo de la semana 52 al lunes de la semana 1 de la temporada siguiente', () => {
    expect(siguienteDia(instante(2026, 52, 'dom'))).toEqual(instante(2027, 1, 'lun'));
  });

  it('ordinal y desdeOrdinal son inversos', () => {
    for (const i of [instante(2026, 1, 'lun'), instante(2026, 41, 'mar'), instante(2030, 52, 'dom')]) {
      expect(desdeOrdinal(ordinal(i))).toEqual(i);
    }
  });

  it('compara y suma días', () => {
    const a = instante(2026, 41, 'mar');
    expect(compararInstantes(a, sumarDias(a, 4))).toBeLessThan(0);
    expect(sumarDias(a, 4)).toEqual(instante(2026, 41, 'sab'));
    expect(sumarDias(a, 7)).toEqual(instante(2026, 42, 'mar'));
  });

  it('formatea como en el HUD', () => {
    // 2026: el 1/1 es jueves, el primer lunes es el 5 de enero → semana 41 empieza el lunes 12 de octubre.
    expect(formatear(instante(2026, 1, 'lun'))).toBe('Semana 1 · lunes 5 de enero');
    expect(formatear(instante(2026, 41, 'mar'))).toBe('Semana 41 · martes 13 de octubre');
  });

  it('rechaza semanas fuera de rango', () => {
    expect(() => instante(2026, 53)).toThrow();
    expect(() => instante(2026, 0)).toThrow();
  });
});

describe('rng (N2)', () => {
  it('misma semilla, misma secuencia', () => {
    const a = new Rng(42), b = new Rng(42);
    const sa = Array.from({ length: 50 }, () => a.siguiente());
    const sb = Array.from({ length: 50 }, () => b.siguiente());
    expect(sa).toEqual(sb);
    expect(sa.every((x) => x >= 0 && x < 1)).toBe(true);
  });

  it('semillas distintas dan secuencias distintas', () => {
    expect(new Rng(1).siguiente()).not.toBe(new Rng(2).siguiente());
  });

  it('cada módulo tiene un flujo propio derivado de la semilla', () => {
    const e = estadoRngInicial(123);
    const valores = new Set(Object.values(e));
    expect(valores.size).toBe(7);
    expect(estadoRngInicial(123)).toEqual(e);
    expect(derivarSemilla(123, 'liga')).toBe(e.liga);
  });

  it('entero, elegir, ponderado y mezclar se comportan', () => {
    const r = new Rng(7);
    for (let i = 0; i < 200; i++) {
      const n = r.entero(1, 6);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(6);
    }
    expect(['a', 'b']).toContain(r.elegir(['a', 'b']));
    const conteo = { a: 0, b: 0 };
    for (let i = 0; i < 2000; i++) conteo[r.ponderado([{ valor: 'a' as const, peso: 9 }, { valor: 'b' as const, peso: 1 }])]++;
    expect(conteo.a).toBeGreaterThan(conteo.b * 5);
    expect(r.mezclar([1, 2, 3, 4, 5]).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('derivar no consume azar del flujo padre', () => {
    const a = new Rng(99), b = new Rng(99);
    a.derivar('partido-1').siguiente();
    expect(a.siguiente()).toBe(b.siguiente());
    expect(new Rng(99).derivar('x').siguiente()).toBe(new Rng(99).derivar('x').siguiente());
  });
});
