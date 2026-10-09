# Núcleo — Diseño

Estado: `aprobado` (2026-10-09) · Cubre: NUC-1 a NUC-7 · Este documento es el **contrato** que respetan todos los agentes.

## 1. Módulos y dueños

| Módulo | Porción del estado | Agente dueño | Specs |
|--------|--------------------|--------------|-------|
| núcleo | `tiempo`, `noticias`, `rng`, `meta` | coordinador | `specs/nucleo` |
| club | `club` (estadio, villa, obras, entorno, identidad, sponsors) | `club` | `specs/club` CLU-1..4, 8, 9, 13 |
| mercado | `mercado` (jugadores, contratos, staff, DTs, ojeadores, inferiores) | `mercado` | `specs/club` CLU-5..7 |
| liga | `liga` (competiciones, fixture, tablas, clubes rivales) | `liga` | `specs/club` CLU-12, `specs/liga` |
| partido | `partido` (motor, resultados, highlights, minijuegos) | `partido` | `specs/partido` |
| movidas | `movidas` (pendientes, historial, marcas) | `movidas` | `specs/despacho` |
| economía | `economia` (caja, movimientos, precios, inflación) | `economia` | `specs/economia` |

**Regla de oro:** un módulo **escribe solo su porción**. Lee las demás libremente. Para cambiar otra porción emite **Efectos**; el núcleo los aplica y los anota.

## 2. Tiempo

```ts
type Dia = 'lun'|'mar'|'mie'|'jue'|'vie'|'sab'|'dom'
interface Instante { temporada: number; semana: number; dia: Dia }   // ej. { 2026, 41, 'mar' }
interface Tiempo {
  hoy: Instante
  fase: 'gestion' | 'previa' | 'partido' | 'resumen' | 'receso'
  proximoPartido?: IdPartido
}
```

Calendario anual tipo (lo detalla el agente `liga`):

| Semanas | Etapa |
|---------|-------|
| 1–4 | Pretemporada · ventana de pases de verano |
| 5–24 | Liga, primera mitad (fechas 1–19) · copa entre semana |
| 25–28 | Receso de invierno · ventana de pases de invierno |
| 29–48 | Liga, segunda mitad (fechas 20–38) · copa entre semana |
| 49–50 | Repechaje y finales |
| 51–52 | Cierre de temporada · balances · renovaciones |

## 3. Ciclo

```
fase gestion ──(JUGAR)──► avanzarHasta(díaDelPartido)
                             │  por cada día:
                             │    modulo.alAvanzarDia(...)   → efectos, noticias, interrupciones
                             │    si hay interrupción → vuelve a gestión mostrando la movida/oferta
                             ▼
                        fase previa  → modulo.antesDelPartido(...)
                        fase partido → partido.jugar(...)   (simulado o jugable)
                        fase resumen → modulo.despuesDelPartido(...)
                             │  si terminó la semana → modulo.alCerrarSemana(...)
                             │  si terminó la temporada → modulo.alCerrarTemporada(...)
                             ▼
                        fase gestion (hacia el próximo partido)
```

## 4. Contrato de módulo

```ts
interface Contexto {
  partida: Readonly<Partida>          // todo el estado, solo lectura
  rng: Rng                            // flujo de azar propio del módulo
  hoy: Instante
}
interface Salida {
  efectos?: Efecto[]                  // cambios sobre cualquier porción, los aplica el núcleo
  noticias?: Noticia[]
  interrupcion?: Interrupcion         // frena el avance (movida con vencimiento, oferta)
}
interface Modulo<Porcion> {
  id: IdModulo
  iniciar(ctx: Contexto): Porcion                       // partida nueva
  reducir(porcion: Porcion, accion: Accion): Porcion    // acciones del jugador sobre su porción (puras)
  alAvanzarDia?(ctx: Contexto): Salida
  antesDelPartido?(ctx: Contexto, partido: IdPartido): Salida
  despuesDelPartido?(ctx: Contexto, resultado: Resultado): Salida
  alCerrarSemana?(ctx: Contexto): Salida
  alCerrarTemporada?(ctx: Contexto): Salida
}
```

- Todo es **puro**: misma entrada + misma semilla ⇒ misma salida. Nada de `Math.random()` ni de fechas del sistema.
- El orden fijo de ejecución por día es: `liga → mercado → club → economia → movidas`. El `partido` corre solo en las fases de partido.

## 5. Efectos (lenguaje común)

Amplía el `Efecto` de `steering/tecnica.md`. Cada efecto lleva su **origen** para poder auditar de dónde salió cada peso.

```ts
type Efecto = { origen: string } & (
  | { tipo: 'pesos'; valor: number; concepto: ConceptoEconomico }
  | { tipo: 'fama'; valor: number }
  | { tipo: 'relacion'; con: Relacion; valor: number }
  | { tipo: 'jugador'; jugador: IdJugador | 'plantel'; campo: 'moral'|'fisico'|Atributo; valor: number }
  | { tipo: 'temporal'; jugador: IdJugador | 'plantel'; efecto: string; partidos: number }
  | { tipo: 'obra'; edificio: string; fechas: number }                 // adelanta o atrasa una obra
  | { tipo: 'marca'; clave: string; valor: number | boolean }
  | { tipo: 'azar'; probabilidad: number; si: Efecto[]; sino?: Efecto[] }
)
```

## 6. Noticias e interrupciones

```ts
interface Noticia { cuando: Instante; modulo: IdModulo; titulo: string; texto?: string; importancia: 1|2|3 }
interface Interrupcion { tipo: 'movida'|'oferta'|'obra'|'lesion'; ref: string; motivo: string }
```

## 7. Estado completo

```ts
interface Partida {
  meta: { version: number; semilla: number; creada: string }
  tiempo: Tiempo
  noticias: Noticia[]
  club: EstadoClub; mercado: EstadoMercado; liga: EstadoLiga
  partido: EstadoPartido; movidas: EstadoMovidas; economia: EstadoEconomia
}
```

Los tipos de cada porción los define el `design.md` de su módulo, partiendo de `steering/tecnica.md`.

## 8. Estructura de código (cuando haya Node)

```
src/
  nucleo/        tiempo, ciclo, rng, efectos, noticias, guardado      ← coordinador
  modulos/
    club/        ← agente club
    mercado/     ← agente mercado
    liga/        ← agente liga
    partido/     ← agente partido
    movidas/     ← agente movidas
    economia/    ← agente economia
  datos/         JSON editables por módulo (movidas, piezas, nombres, DTs, sponsors…)
  ui/            interfaz y escena 3D (se reparte por pantalla)
tests/
  nucleo/  modulos/<id>/  integracion/temporada.test.ts   (temporada completa sin pantalla)
```

## 9. Criterio de "funciona"

`tests/integracion/temporada.test.ts`: crear partida → simular las 52 semanas sin interfaz → verificar que la tabla es consistente (puntos = 3·G + E), que la plata cuadra con los movimientos, que no hay jugadores duplicados, y que dos corridas con la misma semilla dan idéntico resultado.
