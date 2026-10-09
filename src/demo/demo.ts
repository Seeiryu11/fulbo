// DEMO jugable mínima sobre el núcleo real. Módulos simplificados (no son los diseños finales de los agentes):
// sirven para mostrar el loop: gestionar → JUGAR → partido simulado → tabla → movidas → plata.
import {
  crearRegistro, instante, type Contexto, type CuerpoEfecto, type Efecto, type Modulo, type Partida, type Registro, type Resultado, type Rng,
} from '../nucleo';

export const PROPIO = 'propio';
const NOMBRES = [
  'Deportivo Sur', 'Sportivo Las Toscas', 'Atlético Ferrocarril Oeste', 'Club Social Unión del Puerto', 'Juventud Unida de Pirulo',
  'Defensores de la Loma', 'Estudiantes del Norte', 'Racing de Villa Chica', 'Talleres del Riel', 'Independiente del Valle Seco',
  'Sacachispas del Bajo', 'Almagro Nuevo', 'Brown de la Costa', 'Comercio Central', 'Argentino de Quilmeña', 'Huracán del Parque',
  'Tristán Suárez del Monte', 'Villa Dálmine Sur', 'Gimnasia del Litoral',
];

export interface Equipo { id: string; nombre: string; fuerza: number; pts: number; pj: number; g: number; e: number; p: number; gf: number; gc: number }
export interface PartidoLiga { id: string; local: string; visitante: string; goles?: [number, number] }
export interface EstadoLiga { equipos: Equipo[]; fechas: PartidoLiga[][]; semanas: number[]; campeones: string[] }
export interface EstadoClub { nombre: string; fama: number; moral: number }
export interface EstadoEconomia { caja: number; movimientos: { concepto: string; valor: number }[] }
export interface MovidaDef { id: string; titulo: string; texto: string; opciones: { texto: string; efectos: CuerpoEfecto[]; desenlace: string }[] }
export interface EstadoMovidas { pendiente?: string; vistas: string[] }

declare module '../nucleo/tipos' {
  interface PorcionesRegistradas { liga: EstadoLiga; club: EstadoClub; economia: EstadoEconomia; movidas: EstadoMovidas }
}

const M = 1_000_000;
const SEMANAS = [...Array.from({ length: 20 }, (_, i) => 5 + i), ...Array.from({ length: 18 }, (_, i) => 29 + i)];

function fixture(ids: string[]): PartidoLiga[][] {
  const n = ids.length, rondas: PartidoLiga[][] = [];
  const rot = [...ids];
  for (let r = 0; r < n - 1; r++) {
    const fecha: PartidoLiga[] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = rot[i]!, b = rot[n - 1 - i]!;
      const [l, v] = (r + i) % 2 ? [a, b] : [b, a];
      fecha.push({ id: `f${r + 1}-${i}`, local: l, visitante: v });
    }
    rondas.push(fecha);
    rot.splice(1, 0, rot.pop()!);
  }
  const vuelta = rondas.map((f, r) => f.map((p, i) => ({ id: `f${r + n}-${i}`, local: p.visitante, visitante: p.local })));
  return [...rondas, ...vuelta];
}

function poisson(rng: Rng, lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0, p = 1;
  do { k++; p *= rng.siguiente(); } while (p > L);
  return k - 1;
}

export function simular(rng: Rng, fl: number, fv: number): [number, number] {
  const d = (fl - fv) / 22;
  return [poisson(rng, Math.max(0.2, 1.45 * Math.exp(d) + 0.1)), poisson(rng, Math.max(0.2, 1.05 * Math.exp(-d)))];
}

function registrar(eqs: Equipo[], p: PartidoLiga, g: [number, number]): Equipo[] {
  return eqs.map((e) => {
    if (e.id !== p.local && e.id !== p.visitante) return e;
    const [a, b] = e.id === p.local ? g : [g[1], g[0]];
    return { ...e, pj: e.pj + 1, gf: e.gf + a, gc: e.gc + b, g: e.g + (a > b ? 1 : 0), e: e.e + (a === b ? 1 : 0), p: e.p + (a < b ? 1 : 0), pts: e.pts + (a > b ? 3 : a === b ? 1 : 0) };
  });
}

export const ordenarTabla = (eqs: Equipo[]) => [...eqs].sort((a, b) => b.pts - a.pts || (b.gf - b.gc) - (a.gf - a.gc) || b.gf - a.gf);

function fechaDe(liga: EstadoLiga, semana: number): PartidoLiga[] | undefined {
  const i = liga.semanas.indexOf(semana);
  return i < 0 ? undefined : liga.fechas[i];
}

const nuevaLiga = (rng: Rng, equipos?: Equipo[]): EstadoLiga => {
  const eqs = equipos?.map((e) => ({ ...e, pts: 0, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 })) ?? [
    { id: PROPIO, nombre: 'Tu club', fuerza: 60, pts: 0, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 },
    ...NOMBRES.map((n, i) => ({ id: `c${i}`, nombre: n, fuerza: rng.entero(52, 72), pts: 0, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0 })),
  ];
  return { equipos: eqs, fechas: fixture(rng.mezclar(eqs.map((e) => e.id))), semanas: SEMANAS, campeones: equipos ? [] : [] };
};

const liga: Modulo<'liga'> = {
  id: 'liga',
  iniciar: (ctx, creacion) => {
    const l = nuevaLiga(ctx.rng);
    const nombre = String(creacion.nombre ?? 'Atlético Villa Ferro');
    return { ...l, equipos: l.equipos.map((e) => (e.id === PROPIO ? { ...e, nombre } : e)) };
  },
  alAvanzarDia(ctx) {
    if (ctx.hoy.dia !== 'sab') return;
    const l = ctx.partida.liga;
    const fecha = fechaDe(l, ctx.hoy.semana);
    if (!fecha) return;
    let equipos = l.equipos;
    const fuerza = (id: string) => equipos.find((e) => e.id === id)!.fuerza;
    const jugada = fecha.map((p) => {
      if (p.goles) return p;
      const g = simular(ctx.rng, fuerza(p.local) + 3, fuerza(p.visitante));
      equipos = registrar(equipos, p, g);
      return { ...p, goles: g };
    });
    const fechas = l.fechas.map((f) => (f === fecha ? jugada : f));
    return { porcion: { ...l, equipos, fechas } };
  },
  despuesDelPartido(ctx, r) {
    const l = ctx.partida.liga;
    let equipos = l.equipos;
    const fechas = l.fechas.map((f) => f.map((p) => {
      if (p.id !== r.partido) return p;
      equipos = registrar(equipos, p, [r.goles[0], r.goles[1]]);
      return { ...p, goles: [r.goles[0], r.goles[1]] as [number, number] };
    }));
    const pos = ordenarTabla(equipos).findIndex((e) => e.id === PROPIO) + 1;
    return { porcion: { ...l, equipos, fechas }, noticias: [{ titulo: `Quedás ${pos}.º en la B Nacional`, importancia: 1 }] };
  },
  alCerrarTemporada(ctx) {
    const tabla = ordenarTabla(ctx.partida.liga.equipos);
    const pos = tabla.findIndex((e) => e.id === PROPIO) + 1;
    const campeon = tabla[0]!.nombre;
    const texto = pos === 1 ? '¡ASCENDISTE A PRIMERA! Vuelta olímpica en el barrio.' : pos === 2 ? 'Segundo: te toca el repechaje (en el juego completo).' : `Terminaste ${pos}.º. El año que viene se pelea.`;
    const l = nuevaLiga(ctx.rng, ctx.partida.liga.equipos);
    return {
      porcion: { ...l, campeones: [...ctx.partida.liga.campeones, campeon] },
      noticias: [{ titulo: `Campeón de la B Nacional: ${campeon}`, texto, importancia: 3 }],
      efectos: pos <= 2 ? [{ origen: 'liga:ascenso', tipo: 'plata', valor: 500 * M, concepto: 'premios' }] : [],
    };
  },
};

const club: Modulo<'club'> = {
  id: 'club',
  iniciar: (_c, creacion) => ({ nombre: String(creacion.nombre ?? 'Atlético Villa Ferro'), fama: 5000, moral: 60 }),
  efectosQueAplica: ['fama', 'relacion', 'obra', 'jugador', 'temporal'],
  aplicarEfecto(p, e) {
    if (e.tipo === 'fama') return { ...p, fama: Math.max(0, Math.round(p.fama + e.valor)) };
    if (e.tipo === 'jugador' && e.campo === 'moral') return { ...p, moral: Math.min(100, Math.max(0, p.moral + e.valor)) };
    return p;
  },
  despuesDelPartido(ctx, r) {
    const esLocal = r.local === ctx.partida.club.nombre;
    const [a, b] = esLocal ? r.goles : [r.goles[1], r.goles[0]];
    const d = a > b ? 4 : a === b ? 0 : -4;
    return { porcion: { ...ctx.partida.club, moral: Math.min(100, Math.max(0, ctx.partida.club.moral + d)), fama: Math.round(ctx.partida.club.fama * (a > b ? 1.02 : a < b ? 0.995 : 1)) } };
  },
};

const economia: Modulo<'economia'> = {
  id: 'economia',
  iniciar: () => ({ caja: 150 * M, movimientos: [] }),
  efectosQueAplica: ['plata'],
  aplicarEfecto: (p, e) => (e.tipo === 'plata' ? { caja: p.caja + e.valor, movimientos: [...p.movimientos.slice(-30), { concepto: e.concepto, valor: e.valor }] } : p),
  alCerrarSemana: () => ({ efectos: [{ origen: 'economia:sueldos', tipo: 'plata', valor: -12.5 * M, concepto: 'sueldos' }] }),
};

export const MOVIDAS: MovidaDef[] = [
  { id: 'tinta', titulo: 'Tinta antes de la final', texto: 'Tu 9 quiere tatuarse la copa en el gemelo. Faltan tres días para el partido.', opciones: [
    { texto: 'Que se tatúe, es cábala', efectos: [{ tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: 6 }, { tipo: 'azar', probabilidad: 0.25, si: [{ origen: 'movidas:tinta', tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: -12 }] }], desenlace: 'Quedó hermoso. Ojalá no se infecte…' },
    { texto: 'Prohibido', efectos: [{ tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: -5 }], desenlace: 'El vestuario murmura: "este no entiende nada".' },
    { texto: 'Que se tatúe el escudo', efectos: [{ tipo: 'fama', valor: 400 }], desenlace: 'La foto se hace viral. Los hinchas, chochos.' }] },
  { id: 'tiktok', titulo: 'El TikTok de anoche', texto: 'Circula un video de tu arquero a las 4 de la mañana en un boliche. Ya tiene 2 millones de vistas.', opciones: [
    { texto: 'Multa ejemplar', efectos: [{ tipo: 'plata', valor: 3 * M, concepto: 'multas' }, { tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: -4 }], desenlace: 'Pagó y no habló más con nadie.' },
    { texto: 'Bancarlo en público', efectos: [{ tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: 5 }, { tipo: 'fama', valor: -200 }], desenlace: 'El plantel te banca. La prensa te mata.' },
    { texto: 'TikTok del club riéndose', efectos: [{ tipo: 'fama', valor: 900 }], desenlace: '3 millones de vistas. El community manager pide aumento.' }] },
  { id: 'perro', titulo: 'Un perro en la cancha', texto: 'En el último partido un perro se metió y no hubo forma de sacarlo por 10 minutos. Ahora es ídolo.', opciones: [
    { texto: 'Adoptarlo como mascota oficial', efectos: [{ tipo: 'fama', valor: 1200 }, { tipo: 'plata', valor: -1 * M, concepto: 'otros' }], desenlace: '"Gambeta" ya tiene su propia camiseta.' },
    { texto: 'Multar al de seguridad', efectos: [{ tipo: 'fama', valor: -300 }], desenlace: 'Nadie entiende por qué.' }] },
  { id: 'arabia', titulo: 'Arabia llama', texto: 'Un club de Arabia ofrece AU 80 millones por tu goleador.', opciones: [
    { texto: 'Vender', efectos: [{ tipo: 'plata', valor: 80 * M, concepto: 'ventas' }, { tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: -8 }], desenlace: 'Caja llena, área vacía.' },
    { texto: 'Retenerlo', efectos: [{ tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: 3 }, { tipo: 'fama', valor: 300 }], desenlace: '"No se vende", dijiste. La hinchada te aplaude.' }] },
  { id: 'apostar', titulo: 'ApostAR quiere el pecho', texto: 'La casa de apuestas ApostAR ofrece AU 40 millones por la camiseta. "Cada gol paga doble".', opciones: [
    { texto: 'Aceptar', efectos: [{ tipo: 'plata', valor: 40 * M, concepto: 'sponsors' }, { tipo: 'fama', valor: -250 }], desenlace: 'Plata hay. Las críticas también.' },
    { texto: 'Rechazar: seguimos con la yerba del barrio', efectos: [{ tipo: 'fama', valor: 500 }, { tipo: 'plata', valor: 6 * M, concepto: 'sponsors' }], desenlace: 'Yerba La Patrona renueva feliz.' }] },
  { id: 'barra', titulo: 'La barra pide', texto: 'La barra quiere 500 entradas y dos micros para la próxima.', opciones: [
    { texto: 'Dar', efectos: [{ tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: 4 }, { tipo: 'azar', probabilidad: 0.3, si: [{ origen: 'movidas:barra', tipo: 'plata', valor: -15 * M, concepto: 'multas' }] }], desenlace: 'El aliento fue infernal. Ojalá la FAF no mire.' },
    { texto: 'Negar', efectos: [{ tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: -3 }], desenlace: 'Aparecieron pintadas en la sede.' }] },
  { id: 'tormenta', titulo: 'Se viene la tormenta', texto: 'El pronóstico anuncia diluvio para el sábado. La cancha se puede inundar.', opciones: [
    { texto: 'Pagar drenaje de urgencia', efectos: [{ tipo: 'plata', valor: -8 * M, concepto: 'obras' }], desenlace: 'La cancha aguantó como una mesa de billar.' },
    { texto: 'Rezar', efectos: [{ tipo: 'azar', probabilidad: 0.5, si: [{ origen: 'movidas:tormenta', tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: -6 }], sino: [{ origen: 'movidas:tormenta', tipo: 'fama', valor: 100 }] }], desenlace: 'Que sea lo que Dios quiera.' }] },
  { id: 'bomba', titulo: 'Amenaza de bomba', texto: 'Llamaron a la comisaría diciendo que hay una bomba en la platea. Seguro es mentira, pero…', opciones: [
    { texto: 'Evacuar y revisar todo', efectos: [{ tipo: 'plata', valor: -5 * M, concepto: 'otros' }, { tipo: 'fama', valor: 200 }], desenlace: 'Era falsa. Quedaste como un dirigente serio.' },
    { texto: 'Seguir como si nada', efectos: [{ tipo: 'azar', probabilidad: 0.4, si: [{ origen: 'movidas:bomba', tipo: 'plata', valor: -20 * M, concepto: 'multas' }, { origen: 'movidas:bomba', tipo: 'fama', valor: -800 }] }], desenlace: 'Era falsa… esta vez.' }] },
  { id: 'desmayo', titulo: 'Susto en el entrenamiento', texto: 'Un jugador se descompensó en la práctica. Está estable, pero el plantel quedó golpeado.', opciones: [
    { texto: 'Chequeos cardiológicos para todos', efectos: [{ tipo: 'plata', valor: -6 * M, concepto: 'staff' }, { tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: 5 }], desenlace: 'Todos en orden. El plantel valora el gesto.' },
    { texto: 'Darle una semana libre al plantel', efectos: [{ tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: 3 }], desenlace: 'Vuelven con otra cabeza.' }] },
  { id: 'streamer', titulo: 'El streamer', texto: 'Un streamer con 300 mil seguidores quiere transmitir desde el vestuario.', opciones: [
    { texto: 'Dale', efectos: [{ tipo: 'fama', valor: 1500 }, { tipo: 'jugador', jugador: 'plantel', campo: 'moral', valor: -4 }], desenlace: 'Récord de viewers. El DT casi lo saca a patadas.' },
    { texto: 'Solo la previa', efectos: [{ tipo: 'fama', valor: 600 }], desenlace: 'Buen equilibrio.' },
    { texto: 'Ni loco', efectos: [], desenlace: 'Te dicen "dinosaurio" en el chat.' }] },
];

const movidas: Modulo<'movidas'> = {
  id: 'movidas',
  iniciar: () => ({ vistas: [] }),
  efectosQueAplica: ['marca'],
  aplicarEfecto: (p) => p,
  alAvanzarDia(ctx) {
    const m = ctx.partida.movidas;
    if (m.pendiente || ctx.hoy.dia !== 'mie' || !ctx.rng.chance(0.7)) return;
    const recientes = m.vistas.slice(-6);
    const posibles = MOVIDAS.filter((x) => !recientes.includes(x.id));
    const elegida = ctx.rng.elegir(posibles.length ? posibles : MOVIDAS);
    return { porcion: { pendiente: elegida.id, vistas: [...m.vistas, elegida.id] }, interrupcion: { tipo: 'movida', ref: elegida.id, motivo: elegida.titulo } };
  },
  reducir(p, accion) {
    const def = MOVIDAS.find((x) => x.id === p.pendiente);
    if (accion.tipo !== 'decidir' || !def) return { porcion: p };
    const op = def.opciones[Number(accion.opcion)] ?? def.opciones[0]!;
    return {
      porcion: { ...p, pendiente: undefined },
      salida: { efectos: op.efectos.map((e) => ({ ...e, origen: `movidas:${def.id}` }) as Efecto), noticias: [{ titulo: def.titulo, texto: op.desenlace, importancia: 2 }] },
    };
  },
};

const vacio = <Id extends 'mercado' | 'partido'>(id: Id): Modulo<Id> => ({ id, iniciar: () => ({}) as never });

export function proximo(p: Readonly<Partida>) {
  const l = p.liga;
  for (let i = 0; i < l.semanas.length; i++) {
    const semana = l.semanas[i]!;
    const partido = l.fechas[i]!.find((x) => x.local === PROPIO || x.visitante === PROPIO);
    const cuando = instante(p.tiempo.hoy.temporada, semana, 'sab');
    if (partido && !partido.goles && semana >= p.tiempo.hoy.semana) return { partido: partido.id, cuando, local: partido.local === PROPIO };
  }
  return undefined;
}

function jugar(ctx: Contexto, id: string): { resultado: Resultado; salida: { efectos: Efecto[]; noticias: { titulo: string; importancia: 1 | 2 | 3 }[] } } {
  const l = ctx.partida.liga;
  const p = l.fechas.flat().find((x) => x.id === id)!;
  const eq = (i: string) => l.equipos.find((e) => e.id === i)!;
  const f = (i: string) => (i === PROPIO ? eq(i).fuerza + (ctx.partida.club.moral - 50) / 5 : eq(i).fuerza);
  const goles = simular(ctx.rng, f(p.local) + 3, f(p.visitante));
  const esLocal = p.local === PROPIO;
  const [a, b] = esLocal ? goles : [goles[1], goles[0]];
  const rival = eq(esLocal ? p.visitante : p.local).nombre;
  const titulo = a > b ? `¡Ganamos ${a}-${b} a ${rival}!` : a === b ? `Empate ${a}-${b} con ${rival}` : `Derrota ${a}-${b} con ${rival}`;
  const efectos: Efecto[] = [{ origen: 'partido:tv', tipo: 'plata', valor: 15 * M, concepto: 'tv' }];
  if (esLocal) efectos.push({ origen: 'partido:taquilla', tipo: 'plata', valor: Math.round((4000 + ctx.partida.club.fama / 3) * 5000), concepto: 'recaudacion' });
  if (a > b) efectos.push({ origen: 'partido:premio', tipo: 'plata', valor: 4 * M, concepto: 'premios' });
  return { resultado: { partido: id, local: eq(p.local).nombre, visitante: eq(p.visitante).nombre, goles }, salida: { efectos, noticias: [{ titulo, importancia: 1 }] } };
}

export function registroDemo(): Registro {
  return crearRegistro([liga, club, economia, movidas, vacio('mercado'), vacio('partido')], proximo, jugar);
}
