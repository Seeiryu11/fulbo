import {
  aplicarEfectos, avanceRapido, avanzarHasta, crearPartida, crearRegistro, deserializar, guardar, cargar, almacenEnMemoria,
  instante, irAlPartido, jugarPartidoActual, jugarProximaFecha, serializar, type Partida,
} from '../../src/nucleo';
import { agendaFalsa, contadoresVacios, moduloFalso, motorFalso, registroFalso } from '../ayudas/modulosFalsos';

const nueva = (semilla = 1, registro = registroFalso()) => crearPartida(registro, { semilla, temporada: 2026 });

describe('registro de módulos (N4)', () => {
  it('exige los seis módulos', () => {
    const c = contadoresVacios();
    expect(() => crearRegistro([moduloFalso('club', c)], agendaFalsa, motorFalso)).toThrow(/falta registrar/);
  });

  it('no permite dos dueños para el mismo efecto', () => {
    const c = contadoresVacios();
    expect(() => registroFalso(c, { liga: { efectosQueAplica: ['plata'], aplicarEfecto: (p) => p } })).toThrow(/reclaman/);
  });

  it('respeta el orden diario liga → mercado → club → economia → movidas', () => {
    const c = contadoresVacios();
    const reg = registroFalso(c);
    const p = crearPartida(reg, { semilla: 1 });
    avanzarHasta(p, reg, instante(2026, 1, 'mar'));
    expect(c.orden).toEqual(['liga', 'mercado', 'club', 'economia', 'movidas']);
  });

  it('en modo estricto un módulo no puede mutar la partida', () => {
    const c = contadoresVacios();
    const reg = registroFalso(c, { club: { alAvanzarDia: (ctx) => { (ctx.partida.tiempo as { fase: string }).fase = 'receso'; } } });
    const p = crearPartida(reg, { semilla: 1 });
    expect(() => avanzarHasta(p, reg, instante(2026, 1, 'mar'), { estricto: true })).toThrow();
  });
});

describe('efectos (N3)', () => {
  it('cada efecto va a la porción de su dueño', () => {
    const reg = registroFalso();
    const p = nueva(1, reg);
    const q = aplicarEfectos(p, [
      { origen: 'test', tipo: 'plata', valor: 500, concepto: 'otros' },
      { origen: 'test', tipo: 'fama', valor: 10 },
    ], reg);
    expect((q.economia as { caja: number }).caja).toBe(500);
    expect((q.club as { fama: number }).fama).toBe(10);
    expect(q.liga).toBe(p.liga); // las demás porciones no cambian
  });

  it('el azar se resuelve con el rng del núcleo y es reproducible', () => {
    const reg = registroFalso();
    const p = nueva(5, reg);
    const efecto = { origen: 'test', tipo: 'azar' as const, probabilidad: 0.5, si: [{ origen: 'test', tipo: 'plata' as const, valor: 1, concepto: 'otros' as const }], sino: [{ origen: 'test', tipo: 'plata' as const, valor: -1, concepto: 'otros' as const }] };
    const a = aplicarEfectos(p, [efecto, efecto, efecto], reg);
    const b = aplicarEfectos(p, [efecto, efecto, efecto], reg);
    expect(a.economia).toEqual(b.economia);
    expect(a.rng.nucleo).not.toBe(p.rng.nucleo);
  });

  it('un efecto acción ejecuta el reductor del módulo destino', () => {
    const reg = registroFalso(contadoresVacios(), {
      mercado: { reducir: (porcion, accion) => ({ porcion: { ...(porcion as object), vendido: accion.jugador }, salida: { efectos: [{ origen: 'mercado:venta', tipo: 'plata', valor: 9, concepto: 'ventas' }] } }) },
    });
    const p = nueva(1, reg);
    const q = aplicarEfectos(p, [{ origen: 'movidas:arabia', tipo: 'accion', modulo: 'mercado', accion: { tipo: 'vender', jugador: 'j1' } }], reg);
    expect((q.mercado as { vendido: string }).vendido).toBe('j1');
    expect((q.economia as { caja: number }).caja).toBe(9);
  });

  it('un efecto sin dueño es un error', () => {
    const c = contadoresVacios();
    const reg = registroFalso(c, { movidas: { efectosQueAplica: [], aplicarEfecto: undefined } });
    expect(() => aplicarEfectos(nueva(1, reg), [{ origen: 'x', tipo: 'marca', clave: 'a', valor: 1 }], reg)).toThrow(/nadie aplica/);
  });
});

describe('ciclo (N5)', () => {
  it('una interrupción frena el avance al terminar ese día', () => {
    const reg = registroFalso(contadoresVacios(), {
      movidas: { alAvanzarDia: (ctx) => (ctx.hoy.semana === 1 && ctx.hoy.dia === 'mie' ? { interrupcion: { tipo: 'movida', ref: 'tinta', motivo: 'se tatuó la copa' } } : {}) },
    });
    const r = avanzarHasta(nueva(1, reg), reg, instante(2026, 2, 'lun'));
    expect(r.interrupcion?.ref).toBe('tinta');
    expect(r.partida.tiempo.hoy).toEqual(instante(2026, 1, 'jue'));
  });

  it('la porción propia se actualiza con Salida.porcion', () => {
    const reg = registroFalso(contadoresVacios(), {
      club: { alAvanzarDia: (ctx) => ({ porcion: { ...(ctx.partida.club as object), diasVistos: ((ctx.partida.club as { diasVistos?: number }).diasVistos ?? 0) + 1 } }) },
    });
    const r = avanzarHasta(nueva(1, reg), reg, instante(2026, 2, 'lun'));
    expect((r.partida.club as unknown as { diasVistos: number }).diasVistos).toBe(7);
  });

  it('juega el partido del sábado: previa, partido, resumen y vuelve a gestión el domingo', () => {
    const c = contadoresVacios();
    const reg = registroFalso(c);
    const ida = irAlPartido(nueva(1, reg), reg);
    expect(ida.partida.tiempo.fase).toBe('previa');
    expect(ida.partida.tiempo.hoy).toEqual(instante(2026, 1, 'sab'));
    expect(c.previas).toBe(1);
    const r = jugarPartidoActual(ida.partida, reg);
    expect(r.resultado).toBeDefined();
    expect(r.partida.tiempo.fase).toBe('gestion');
    expect(r.partida.tiempo.hoy).toEqual(instante(2026, 1, 'dom'));
    expect(c.posts).toBe(1);
    expect((r.partida.economia as { caja: number }).caja).toBe(1_000_000);
    expect(r.partida.noticias.at(-1)?.titulo).toMatch(/^Final/);
  });

  it('cada día se procesa una sola vez, también el del partido', () => {
    const c = contadoresVacios();
    const reg = registroFalso(c);
    let p = nueva(1, reg);
    for (let i = 0; i < 3; i++) p = jugarProximaFecha(p, reg).partida;
    const diasCorridos = c.dias.liga;
    const transcurridos = (p.tiempo.hoy.semana - 1) * 7 + ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'].indexOf(p.tiempo.hoy.dia);
    expect(diasCorridos).toBe(transcurridos);
  });

  it('jugar sin previa es un error', () => {
    const reg = registroFalso();
    expect(() => jugarPartidoActual(nueva(1, reg), reg)).toThrow(/previa/);
  });
});

describe('avance rápido (N8)', () => {
  it('juega hasta el límite si no pasa nada', () => {
    const reg = registroFalso();
    const r = avanceRapido(nueva(1, reg), reg, { maxPartidos: 5 });
    expect(r.motivo).toBe('limite');
    expect(r.resultados).toHaveLength(5);
  });

  it('se detiene ante una noticia importante', () => {
    const reg = registroFalso(contadoresVacios(), {
      liga: { despuesDelPartido: () => ({ noticias: [{ titulo: '¡Echaron al DT!', importancia: 3 }] }) },
    });
    const r = avanceRapido(nueva(1, reg), reg, { maxPartidos: 5 });
    expect(r.motivo).toBe('noticia-importante');
    expect(r.resultados).toHaveLength(1);
  });

  it('se detiene ante una interrupción', () => {
    const reg = registroFalso(contadoresVacios(), {
      mercado: { alAvanzarDia: (ctx) => (ctx.hoy.semana === 2 && ctx.hoy.dia === 'jue' ? { interrupcion: { tipo: 'oferta', ref: 'arabia', motivo: 'ofrecen fortuna' } } : {}) },
    });
    const r = avanceRapido(nueva(1, reg), reg, { maxPartidos: 10 });
    expect(r.motivo).toBe('interrupcion');
    expect(r.interrupcion?.ref).toBe('arabia');
  });
});

describe('guardado (N7)', () => {
  it('ida y vuelta da un estado idéntico', () => {
    const reg = registroFalso();
    const p = jugarProximaFecha(nueva(3, reg), reg).partida;
    expect(deserializar(serializar(p))).toEqual(p);
    const almacen = almacenEnMemoria();
    guardar(p, almacen);
    expect(cargar(almacen)).toEqual(p);
  });

  it('migra partidas viejas', () => {
    const reg = registroFalso();
    const p = nueva(3, reg);
    const vieja = JSON.stringify({ ...p, meta: { ...p.meta, version: 1 } });
    const migrada = deserializar(vieja, { 1: (d) => ({ ...d, extra: true }) }, 2) as Partida & { extra?: boolean };
    expect(migrada.meta.version).toBe(2);
    expect(migrada.extra).toBe(true);
    expect(() => deserializar(vieja, {}, 2)).toThrow(/migración/);
  });
});
