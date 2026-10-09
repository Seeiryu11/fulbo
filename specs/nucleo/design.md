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
  partida: Readonly<Partida>          // todo el estado, solo lectura (en modo estricto, congelado)
  rng: Rng                            // flujo de azar propio del módulo; rng.derivar('etiqueta') da un hijo estable
  hoy: Instante
}
interface Salida {
  porcion?: unknown                   // nueva versión de la porción PROPIA (solo el dueño la devuelve)
  efectos?: Efecto[]                  // cambios sobre otras porciones, los aplica el núcleo
  noticias?: { titulo; texto?; importancia }[]   // el núcleo les pone módulo y fecha
  interrupcion?: Interrupcion         // frena el avance (movida con vencimiento, oferta)
}
interface Modulo<Id> {
  id: Id
  iniciar(ctx, creacion): Porcion                        // partida nueva; `creacion` = lo elegido en #/crear
  reducir?(porcion, accion, ctx): { porcion; salida? }   // acciones del jugador; puede emitir efectos (ej. cobrar una obra)
  efectosQueAplica?: TipoEfecto[]                        // tipos de efecto de los que es dueño
  aplicarEfecto?(porcion, efecto, ctx): Porcion
  alAvanzarDia?(ctx): Salida
  antesDelPartido?(ctx, partido): Salida                 // solo partidos del club del usuario
  despuesDelPartido?(ctx, resultado): Salida             // solo partidos del club del usuario
  alCerrarSemana?(ctx): Salida
  alCerrarTemporada?(ctx): Salida
}
interface Registro {
  modulos: Record<IdModulo, Modulo>
  proximoPartido(partida): { partido; cuando; local? } | undefined   // lo provee liga
  jugarPartido(ctx, partido): { resultado; salida? }                 // lo provee partido
}
```

- Todo es **puro**: misma entrada + misma semilla ⇒ misma salida. Nada de `Math.random()` ni de fechas del sistema.
- El orden fijo de ejecución por día es: `liga → mercado → club → economia → movidas`. Los ganchos de partido y de cierre usan `liga → mercado → club → partido → economia → movidas`.
- **Convención de días:** `hoy` es el día que el usuario gestiona y todavía no se procesó. Avanzar procesa hoy y pasa al siguiente. El día de un partido se procesa después de jugarlo: cada día se procesa una sola vez.
- Implementación: `src/nucleo/` (`ciclo.ts`: `avanzarHasta`, `irAlPartido`, `jugarPartidoActual`, `jugarProximaFecha`; `avanceRapido.ts`; `efectos.ts`; `guardado.ts`).

## 5. Efectos (lenguaje común)

Cada efecto lleva su **origen** para poder auditar de dónde salió cada cambio. Cada tipo tiene **un único dueño** que lo aplica (el registro lo valida); `azar` y `accion` los resuelve el núcleo.

```ts
type Efecto = { origen: string } & (
  | { tipo: 'plata'; valor: number; concepto: ConceptoEconomico }        // dueño: economia
  | { tipo: 'fama'; valor: number }                                      // dueño: club
  | { tipo: 'relacion'; con: Relacion; valor: number }                   // dueño: club
  | { tipo: 'jugador'; jugador: IdJugador | 'plantel'; campo: 'moral'|'condicion'|Atributo; valor: number }  // dueño: mercado
  | { tipo: 'temporal'; jugador: IdJugador | 'plantel'; efecto: string; partidos: number }                  // dueño: mercado
  | { tipo: 'obra'; edificio: string; fechas: number }                   // dueño: club
  | { tipo: 'marca'; clave: string; valor: number | boolean }            // dueño: movidas
  | { tipo: 'accion'; modulo: IdModulo; accion: Accion }                 // núcleo: ejecuta reducir() del módulo destino
  | { tipo: 'azar'; probabilidad: number; si: Efecto[]; sino?: Efecto[] } // núcleo
)
```

- `plata` reemplaza a `pesos` (moneda única mundial).
- `condicion` es el estado físico del día (0–100); `fisico` es el atributo.
- `accion` sirve para que una movida opere otro módulo sin romper la regla de porciones: "vender a Arabia" = `{ tipo: 'accion', modulo: 'mercado', accion: { tipo: 'vender', jugador, destino } }`; "clausurar la tribuna" = `{ modulo: 'club', accion: { tipo: 'clausurar', sector, fechas } }`.
- XP y nivel del club viven en la porción `club`.
## 6. Noticias e interrupciones

```ts
interface Noticia { cuando: Instante; modulo: IdModulo; titulo: string; texto?: string; importancia: 1|2|3 }
interface Interrupcion { tipo: 'movida'|'oferta'|'obra'|'lesion'; ref: string; motivo: string }
```

## 7. Estado completo

```ts
interface Partida {
  meta: { version: number; semilla: number; creada: Instante }
  rng: Record<IdModulo | 'nucleo', number>   // estado de cada flujo de azar
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
