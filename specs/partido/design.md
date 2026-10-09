# Partido — Diseño

Estado: `en revisión` · Cubre: PAR-1, PAR-4 a PAR-12 (PAR-2 y PAR-3 solo quedan preparados, §15) · Dueño: agente `partido` · Contrato: `specs/nucleo/design.md` (no se cambia; lo que haga falta va en §17)

Todos los números de este documento son **valores iniciales**: viven en `src/datos/partido/*.json` y se ajustan con las pruebas de calibración (§5, tareas PAR-T2x), no tocando código.

---

## 0. Resumen de decisiones

| # | Decisión | Por qué |
|---|----------|---------|
| D1 | **Motor por minutos y ocasiones** (eventos discretos), no física. | Es lo único que corre ~1.000 partidos por temporada en milisegundos (NUC-7), es fácil de calibrar contra estadísticas reales y es determinista sin pelearse con flotantes de física. La física llega recién con el partido jugable (§15). |
| D2 | **Un solo bucle para los dos modos.** El modo rápido es el mismo motor con los registradores de relato y reconstrucción apagados. | Garantiza que un partido simulado por `liga` y uno mirado por el usuario tengan la misma distribución. Con la misma semilla dan **el mismo resultado exacto**. |
| D3 | **Dos flujos de azar separados**: `juego` (decide lo que pasa) y `presentacion` (elige plantillas, frases, posiciones). | Encender o apagar el relato y los highlights no cambia el resultado. |
| D4 | **Semilla por partido** guardada en el resultado + **registro de respuestas del usuario** (estilo event sourcing). | Reproducir un partido = re-ejecutar `(entrada, semilla, respuestas)`. Sirve para highlights, para depurar y para retomar un partido cortado. |
| D5 | Los minijuegos **no deciden el resultado solos**: devuelven una *ejecución* (dónde apuntaste, con qué fuerza, qué definición elegiste) y el motor la resuelve con los atributos y el azar. | Los atributos siguen importando, el resultado es determinista y saltear el minijuego usa exactamente la misma función con una ejecución automática. |
| D6 | Highlights como **guion de fotogramas clave** en metros reales (cancha de 105 × 68) con acciones por actor. | La pizarra 2D lo dibuja directo y el estadio 3D lo usa sin traducción (x, y del césped + altura de la pelota + nombre de animación). |
| D7 | **Relator partidario** (la radio del club), banco de frases por fragmentos con condiciones y control de no repetición. | Es lo más argentino que hay y multiplica las variantes sin escribir miles de frases. Ver pregunta P3. |
| D8 | La **táctica del club** (formación, titulares, estilo, charla, cábala) vive en la porción `partido`. | PAR-8 es de este módulo y es lo que el motor consume. Ver pedido N3 al coordinador. |

---

## 1. Arquitectura

```
                   ┌─────────────── src/modulos/partido/ ───────────────┐
 Partida ──► armarEntrada() ──► EntradaPartido (foto inmutable, sin referencias a la Partida)
                                    │
                                    ▼
                         valorar()  → jugador efectivo, sectores, fuerza
                                    │
                                    ▼
             ┌──────────── bucle por minutos (motor/bucle.ts) ────────────┐
             │ control → ocasión → tipo → protagonistas → resolución      │
             │ faltas/tarjetas/lesiones · fatiga · marcador · Aguante     │
             │ IA de cambios · ¿parada? (jugada clave, entretiempo)       │
             └─────────────────────────────────────────────────────────────┘
                     │ eventos                         │ paradas
                     ▼                                 ▼
          registradores (según modo)            UI: minijuego / entretiempo
           · rápido: goles, tarjetas,                  │ RespuestaParada
             lesiones, minutos                         ▼
           · completo: + todos los eventos,      responder(sim, respuesta)
             relato, notas, reconstrucción
                     │
                     ▼
               cerrar() ──► ResultadoPartido (+ Resumen, Highlights si es completo)
```

### 1.1 API pública del módulo

```ts
// ── Librería pura (la usan liga, la previa de la UI y los tests) ──
export function armarEntrada(partida: Readonly<Partida>, partido: IdPartido, opciones?: OpcionesEntrada): EntradaPartido
export function valorarEquipo(equipo: EquipoEnCancha, contexto: ContextoValoracion): Valoracion   // barras de la previa
export function pronostico(entrada: EntradaPartido): { local: number; empate: number; visitante: number } // analítico, sin simular
export function simularRapido(entrada: EntradaPartido, semilla: number): ResultadoPartido          // modo rápido, sin paradas
export function consecuencias(resultado: ResultadoPartido, entrada: EntradaPartido): Efecto[]       // físico, moral, lesiones (§13)

// ── Flujo del partido del club (fase 'partido' del núcleo) ──
export function iniciarSimulacion(entrada: EntradaPartido, semilla: number, modo: 'completo'|'rapido'): SimulacionEnCurso
export function avanzar(sim: SimulacionEnCurso): SimulacionEnCurso        // corre hasta la próxima parada o el final
export function responder(sim: SimulacionEnCurso, r: RespuestaParada): SimulacionEnCurso
export function cerrar(sim: SimulacionEnCurso): CierrePartido           // { resultado, resumen?, highlights? }
export function reconstruir(entrada: EntradaPartido, semilla: number, respuestas: RespuestaParada[]): SimulacionEnCurso // reproducción exacta

// ── Módulo del núcleo ──
export const moduloPartido: Modulo<EstadoPartido>   // iniciar, reducir, antesDelPartido, despuesDelPartido, alCerrarTemporada
```

- `avanzar` corre **instantáneo** hasta la próxima parada; la UI reproduce la línea de tiempo de eventos a la velocidad del relato (INT-5.2). No hay temporizadores dentro del motor.
- Todo es puro: ninguna función lee la fecha del sistema ni `Math.random()`.

### 1.2 Determinismo y semillas

- **Semilla del partido**: un entero de 32 bits que decide quien llama. Para el partido del club, `partido` la saca de `ctx.rng` en `antesDelPartido` y la guarda en `EstadoPartido.enCurso`. Para los ajenos, `liga` la saca de su propio flujo. (Pedido N1: que el núcleo ofrezca `rng.derivar(clave)` para que la semilla dependa de `meta.semilla + idPartido` y no del orden en que se simulan los partidos.)
- **Generador interno**: el motor no consume `ctx.rng` partido a partido; crea sus propios generadores a partir de la semilla con una función de mezcla (tipo *splitmix32* + *sfc32*, o la que exponga el núcleo, pedido N2):
  - `juego = rng(semilla, 'juego')` — secuencial; lo consume el bucle en un orden fijo por minuto.
  - `jugada(id) = rng(semilla, 'jugada:' + id)` — uno por jugada clave; resuelve penales, mano a mano y tiros libres. Así, jugar o saltear el minijuego no corre la secuencia de `juego` (aunque el marcador nuevo cambie lo que pasa después, que es lo lógico).
  - `presentacion(n) = rng(semilla, 'pres:' + n)` — uno por evento; elige plantilla de jugada, frases y posiciones. **Nunca** se usa para decidir resultados.
- **Entradas del usuario**: cada `RespuestaParada` se agrega a `sim.respuestas` con valores **cuantizados** (enteros 0–100 o enumerados) para que la reproducción sea exacta en cualquier dispositivo.
- **Versión del motor**: `versionMotor` (string de `motor.json`) viaja en el resultado. Si cambia, la reproducción de partidos viejos se desactiva y se muestran los highlights guardados.
- **Aritmética**: el bucle usa números de punto flotante comunes, pero las decisiones se toman con `u < p` y los valores de estado que persisten (físico, Aguante) se redondean a 2 decimales al final de cada minuto, para no acumular diferencias entre motores de JS.

**Propiedades que se testean:** (a) misma entrada + semilla + respuestas ⇒ resultado idéntico; (b) `simularRapido` ⇒ mismo `ResultadoPartido` (marcador, goleadores, tarjetas, lesiones, minutos) que el modo completo con todas las paradas salteadas; (c) cambiar las frases del banco no cambia el resultado.

---

## 2. Entrada del motor

`armarEntrada` es el único lugar que lee la `Partida`. El resto del motor solo ve `EntradaPartido`, así se testea con fixtures y sin estado global.

| Dato | De dónde sale |
|------|---------------|
| Plantel, atributos, físico, moral, personalidad, efectos temporales | `mercado` (jugadores de los dos clubes) |
| DT (nivel, estilos afines, bonus de partido) | `mercado` (DT contratado; los rivales también tienen DT, pedido M4) |
| Formación, titulares, estilo, charla, cábala del club | `partido.tactica` / `partido.previa` |
| Táctica del rival | `liga` (personalidad del club rival → estilo y formación preferidos, pedido L2) + regla de IA (§4.8) |
| Competición, instancia, importancia (clásico, final), reglas de empate, resultado de ida | `liga` |
| Capacidad habilitada, estado del césped, estilo del estadio | `club` (pedido C1) |
| Asistencia y llenado del partido | `economia` (asistencia calculada con el precio de las entradas, pedido E1) |
| Relación con hinchas y barra | `club.relaciones` |
| Ambientación (altura, nieve, calor) — V1 | `club` |
| Preferencias de minijuegos | `partido.preferencias` |

Jugadores **no disponibles** (efecto `lesion`, `suspendido`, o físico < 15) no pueden estar en la entrada: si el usuario los dejó de titulares, `antesDelPartido` los reemplaza con el mejor suplente de la misma posición y avisa en la previa.

---

## 3. Cómo pesa cada factor

Escala: atributos de **1 a 99** (pedido M1). La **fuerza** de un equipo es un número en la misma escala (un plantel típico de la B anda en 55–62). Todo se expresa en *puntos de fuerza* para poder comparar factores.

> Regla práctica que sale del prototipo de calibración (§5.3): **1 punto de diferencia de fuerza ≈ 2,3 puntos porcentuales de probabilidad de ganar** cerca de la paridad.

### 3.1 El jugador efectivo

Para cada atributo `a` del jugador en un minuto dado:

```
a_ef = a × F(físico) × M(moral) × E(efectos) × P(posición) × T(tarjeta)
```

| Factor | Fórmula / tabla inicial | Rango |
|--------|-------------------------|-------|
| **F(físico)** | interpolación lineal sobre la tabla `físico → factor`: 100→1,00 · 85→0,99 · 70→0,96 · 50→0,90 · 30→0,80 · 15→0,70 | 0,70–1,00 |
| **M(moral)** | `0,96 + 0,08 × moral/100` | 0,96–1,04 |
| **E(efectos)** | producto de los modificadores de cada efecto temporal activo (§11) | típico 0,85–1,05 |
| **P(posición)** | misma posición 1,00 · adyacente (DEF↔MED, MED↔DEL) 0,88 · lejana (DEF↔DEL) 0,75 · jugador de campo al arco 0,30 · arquero de campo 0,50 | |
| **T(tarjeta)** | amonestado: `marca × 0,95` (va con cuidado) | |

El **físico baja durante el partido** (§4.6), así que el jugador efectivo cambia minuto a minuto. Esto es lo que hace que los cambios importen.

### 3.2 Del once a los sectores

Cada formación (`formaciones.json`) define 11 **puestos** con rol, coordenadas en la cancha (también las usan los highlights) y pesos de aporte a cuatro sectores:

| Puesto | Ataque (ATA) | Creación (CRE) | Defensa (DEF) | Arco (ARQ) |
|--------|--------------|----------------|---------------|------------|
| ARQ | – | – | 0,1 | 1,0 |
| Central (DFC) | – | 0,1 | 1,0 | – |
| Lateral (LAT) | 0,1 | 0,3 | 0,7 | – |
| Volante central (MCD) | – | 0,5 | 0,6 | – |
| Volante (MC / MI / MD) | 0,2 | 0,7 | 0,3 | – |
| Enganche (ENG) | 0,5 | 0,7 | – | – |
| Extremo (EXT) | 0,8 | 0,3 | 0,1 | – |
| Delantero (DC) | 1,0 | 0,1 | – | – |

Cada sector usa una mezcla de atributos (`sectores.json`):

| Sector | Mezcla de atributos |
|--------|---------------------|
| ATA | pegada 0,40 · gambeta 0,25 · velocidad 0,25 · físico 0,10 |
| CRE | pase 0,40 · gambeta 0,20 · marca 0,20 · físico 0,20 |
| DEF | marca 0,45 · físico 0,25 · velocidad 0,20 · pase 0,10 |
| ARQ | atajada 0,80 · liderazgo 0,10 · físico 0,10 |

```
calidad(sector) = Σ (peso_puesto × mezcla(a_ef)) / Σ peso_puesto
volumen(sector) = (Σ peso_puesto / peso_referencia_442) ^ 0,30
SECTOR = calidad × volumen
```

El exponente 0,30 hace que poner un quinto defensor sume ~+4 % de DEF (y reste ataque), no +25 %.

Indicadores que usa el bucle:

```
ATQ(A) = 0,55·ATA(A) + 0,45·CRE(A)          // capacidad de generar
CON(B) = 0,65·DEF(B) + 0,35·CRE(B)          // capacidad de contener
FUERZA = promedio(ATA, CRE, DEF) ponderado 0,3/0,35/0,35, con ARQ aparte  // la que se muestra en la previa
```

**Liderazgo** no entra a un sector: el promedio de los 3 liderazgos más altos en cancha (`LID`) modula la reacción ante el marcador (§4.5) y la caída de moral después de un gol en contra.

### 3.3 Estilo de juego

`estilos.json`. El estilo modifica las tasas del bucle y tiene un piedra-papel-tijera **suave** (±3–5 %), para que el estilo importe sin que haya uno ganador.

| Estilo | Tasa de ocasiones | Calidad de ocasión | Posesión | Fatiga | Faltas | Te contragolpean | Nota |
|--------|------------------|--------------------|----------|--------|--------|------------------|------|
| Equilibrado | 1,00 | 1,00 | 0 | 1,00 | 1,00 | 1,00 | sin riesgos |
| Toque | 0,95 | 1,08 | +0,30 | 0,95 | 0,90 | 1,05 | premia pase; sufre con césped malo |
| Contragolpe | 0,90 | 1,10 (más mano a mano) | −0,30 | 1,00 | 1,00 | 0,85 | premia velocidad |
| Presión alta | 1,08 | 1,00 | +0,15 | 1,20 | 1,25 | 1,10 | premia físico; se cae en el 2.º tiempo |
| Pelotazo | 1,05 | 0,90 (más cabezazos) | −0,20 | 0,95 | 1,00 | 1,00 | premia físico de los de arriba |
| Todos atrás ("colgarse del travesaño") | 0,70 | 0,95 | −0,40 | 0,90 | 1,10 | 0,75 | baja goles de los dos lados |
| Todo al ataque | 1,20 | 1,00 | +0,10 | 1,10 | 1,00 | 1,30 | para remontar |

Choques (multiplicador sobre la tasa de ocasiones del que **ataca**, en `estilos.json/choques`): presión vs toque 1,05 si el físico medio del que presiona ≥ 65, si no 0,97 · contragolpe vs todo al ataque 1,08 · pelotazo vs presión 1,04 · toque vs todos atrás 0,96. Lista corta a propósito.

### 3.4 El DT

Del DT contratado (de `mercado`) el motor usa tres cosas:

| Qué | Efecto |
|-----|--------|
| **Nivel** (0 = sin DT, el dueño dirige; 1–5) | `+0,5 × nivel` puntos a todos los sectores → nivel 5 ≈ +2,5 puntos ≈ +6 pp de victoria |
| **Estilos afines** (lista) | si el estilo elegido está en la lista, sus modificadores de §3.3 se amplifican ×1,5 (el plantel lo entiende); si es el opuesto declarado, ×0,7 |
| **Bonus de partido** (`BonusDT[]`, vocabulario cerrado §12) | `atributo` (+N a un atributo, para un puesto o todos, solo en partido) · `moral_inicial` · `remontada` (multiplicador extra cuando va perdiendo) · `minijuego` (+segundos, mira más estable, pista del arquero) · `lectura` (mejores cambios automáticos y ajuste de estilo en el entretiempo) |

Los bonus de DT **no se escriben en los atributos del jugador**: se aplican solo dentro del partido mientras el DT está contratado. Así, si lo echás, el efecto se va solo.

### 3.5 Localía y Aguante (PAR-7)

La ventaja de local real ronda +0,3 goles por partido. Acá se parte en dos: una **localía base** (viaje, cancha conocida) y la **hinchada**, que depende del estadio y de cómo está la gente.

```
Mloc(local)      = 1,09 × (1 + 0,06 × peso × aguanteRel)
Mloc(visitante)  = 0,92 × (1 − 0,04 × peso × aguanteRel)
peso             = clamp( (asistencia / 40.000)^0,5 , 0,15 , 1 ) × (0,6 + 0,4 × relaciónHinchas/100)
aguanteRel       = max(0, (Aguante − 50) / 50)                 // 0 a 1
```

- Cancha neutral: los dos con 1,00. A puertas cerradas: `peso = 0`.
- **Aguante "lleno"** (≥ 90) y local: además, durante 5 minutos el rival pierde 3 % de CRE ("la cancha tiembla") y el relato lo dice. Se puede disparar una vez cada 15 minutos.
- Valores de referencia: estadio de la B con 6.000 personas y Aguante 60 → local ×1,10 (casi solo la base). Estadio de 60.000 lleno con Aguante al tope → ×1,16 / ×0,88 → entre equipos parejos el local pasa de ~42 % a ~48 % de victorias. Es un bonus "chico" como pide PAR-7.2, pero se siente.

**Barra de Aguante** (0–100), una sola: la de **tu** hinchada. Si sos visitante representa a los que viajaron y no da bonus.

| Inicial | Valor |
|---------|-------|
| Base | 50 |
| Llenado del estadio (asistencia / capacidad) | +20 × (llenado − 0,5) |
| Sobreventa (de `economia`) | +5 |
| Relación con hinchas | +0,15 × (relación − 50) |
| Relación con la barra | +0,10 × (relación − 50) |
| Clásico / final | +10 |
| Racha (últimos 5: +2 por victoria, −2 por derrota) | ±10 |
| Charla "para la hinchada" | +10 |

| Durante el partido | Δ Aguante |
|--------------------|-----------|
| Gol a favor | +20 |
| Gol en contra | −15 (−10 si `LID` ≥ 70) |
| Ocasión clara propia / atajada del arquero propio | +4 / +5 |
| Rival expulsado | +8 |
| 10 minutos sin llegar al arco | −3 |
| Cada minuto | se acerca 0,5 hacia el valor inicial |

### 3.6 Charla técnica y cábala (PAR-8)

**Charla** (`charlas.json`), se elige en la previa y otra vez en el entretiempo:

| Charla | Efecto | Le gusta a | No le gusta a |
|--------|--------|-----------|---------------|
| Tranquila | moral +2 a todos | profesional | — |
| Motivadora | moral +5 (+2 si la moral ya está > 80) | — | — |
| "Hay que dejar la vida" | ATQ +3 %, faltas +30 %, fatiga +15 %; calentones: riesgo de roja ×2 | calentón | profesional |
| "Si perdemos se van todos" | moral ±8 según personalidad: profesional +, fiestero −; alta varianza | profesional | fiestero, influencer |
| "Jueguen para la gente" | Aguante inicial +10 (solo de local) | — | — |

**Cábala** (`cabalas.json`): una activa por vez. Ejemplos: no lavar la ropa del último triunfo, entrar con el pie derecho, la abuela en la misma butaca, el mismo micro, sal en las esquinas del área.

| Nivel de la cábala | Efecto |
|--------------------|--------|
| 1 (nueva) | +0,5 puntos de fuerza, moral +2 |
| 2 (ganaste con ella) | +1,0 puntos, moral +3 |
| 3 (dos seguidas) | +1,5 puntos, moral +4 (tope) |

- Ganás: sube un nivel. Empatás: queda igual. Perdés: **se quema** (nivel 0, no se puede usar por 3 partidos, moral −2 al plantel).
- Si hay jugadores `cabulero` en el once, el efecto de moral se duplica para ellos.

### 3.7 El día (la sorpresa)

Cada equipo saca al empezar un **factor del día**: `día = exp(0,15 × N(0,1))`, que multiplica su tasa de ocasiones todo el partido. Es la palanca explícita de la sorpresa: con él, el favorito claro pierde 1 de cada 8 partidos. El relato lo puede nombrar ("tarde inspirada", "no le sale una") cuando |N| > 1,5.

### 3.8 Condiciones del partido — V1

`condiciones.json`, según la ambientación del club local (DES-8) y un clima sorteado con la semilla: **altura** (visitante: fatiga ×1,25), **nieve o lluvia fuerte** (toque ×0,95, pelotazo ×1,05, errores del arquero +), **calor** (fatiga ×1,15 los dos), **césped arruinado** (de `club`, después de un recital: toque ×0,93).

### 3.9 Cuánto mueve cada cosa (resumen)

| Factor | Tamaño típico | Equivale a… |
|--------|---------------|-------------|
| Diferencia de plantel entre el 1.º y el 10.º de la B | ~7 puntos | ~65 % / 35 % |
| Localía + hinchada (normal / estadio grande lleno) | +4 / +6 puntos | |
| DT nivel 5 vs sin DT | +2,5 puntos | +6 pp de victoria |
| Moral del plantel 80 vs 30 | ~+2,4 puntos | |
| Físico medio del once 95 vs 70 | ~+3,5 puntos | por eso rotar entre martes y sábado importa |
| Estilo bien elegido (choque + afinidad del DT) | +1 a +2 puntos | |
| Cábala nivel 3 | +1,5 puntos | |
| Un titular con resaca | −0,5 a −1 punto | más si es el 9 |
| El día (1 desvío) | ±5 puntos en la tasa de un equipo | la sorpresa |

---

## 4. El bucle por minutos

90 minutos + descuento (1–3 en el 1.º tiempo, 2–7 en el 2.º, según faltas, cambios y lesiones). Si las reglas lo piden: alargue de 2 × 15 y tanda de penales (§7.6). Por minuto, en este orden fijo (el orden importa para el determinismo):

### 4.1 Control
`pControlA = σ(0,5 × (CRE_A − CRE_B)/10 + posesión_estilo_A − posesión_estilo_B)`. Se usa para la posesión que se muestra, para quién comete las faltas y para la textura del relato. No decide las ocasiones (las ocasiones salen de 4.2), así un equipo de contragolpe puede tener 35 % de pelota y ganar.

### 4.2 Ocasiones
Para cada equipo, en orden local → visitante:

```
tasa_A(m) = R0 × exp(β × (ATQ_A − CON_B) / 10) × Mestilo × Mchoque × Mloc × Mmarcador(m) × Mexpulsados × día_A
R0 = 0,128 · β = 0,28
si u_juego < tasa_A(m) → hay ocasión
```

### 4.3 Tipo de ocasión y protagonistas

| Tipo | Peso base | xG base | Modificado por |
|------|-----------|---------|----------------|
| Remate de afuera | 0,30 | 0,035 | pegada del equipo (+), estilo pelotazo |
| Remate en el área | 0,35 | 0,12 | gambeta, pase |
| Cabezazo (centro o córner) | 0,20 | 0,09 | físico de los de arriba, pelotazo |
| Mano a mano | 0,08 | 0,38 | velocidad, contragolpe ×1,6 |
| Jugada colectiva ("la pared") | 0,07 | 0,20 | pase, toque ×1,5 |

Penales y tiros libres directos no salen de acá: salen de las faltas (4.4). El xG medio por remate queda en ~0,105, que da ~1,25 goles por equipo con ~12 remates.

- **Rematador**: sorteo ponderado por puesto (DC 0,45 · EXT/ENG 0,25 · volantes 0,20 · defensores 0,10; en cabezazo de córner los defensores pasan a 0,30) × el atributo que usa ese tipo.
- **Asistidor**: ponderado por pase (puede no haber, ~25 %).
- **Defensor** involucrado (para el relato y el highlight): ponderado por marca.

### 4.4 Resolución del remate, faltas, tarjetas y lesiones

```
remate = pegada (cabezazo: 0,6 físico + 0,4 pegada; mano a mano: 0,5 pegada + 0,5 gambeta)
pGol   = xG_tipo × exp(0,10 × (remate_ef − atajada_ef) / 10) × Mcalidad_estilo
```
Si no es gol: al arco y atajado (~45 % de los no-goles), **palo** (3 % de los remates), bloqueado (20 %), afuera (el resto). Córner tras atajada o bloqueo: 35 %.

| Evento | Frecuencia objetivo | Cómo |
|--------|---------------------|------|
| Faltas | ~26 por partido | por minuto, del equipo sin la pelota, × estilo × charla |
| Amarilla | ~4,5 por partido | 17 % de las faltas × (calentón 1,8) × (ya amonestado 0,6) |
| Roja directa | ~0,15 por partido | 0,6 % de las faltas × calentón |
| Tiro libre peligroso | ~1,2 por partido | 12 % de las faltas cerca del área → candidato a jugada clave |
| Penal | ~0,30 por partido | 1,2 % de las faltas, más si el rival tiene gambeta alta |
| Lesión | ~0,25 por partido (los dos equipos) | por jugador y minuto, × físico bajo × efectos (`lesion_oculta` ×3) |

Expulsado: el equipo pierde el jugador y desde ahí `Mexpulsados = 0,88` sobre su tasa y `1,10` sobre la del rival (≈ lo que se ve en el fútbol real).

### 4.5 El marcador manda (Mmarcador)
Desde el minuto 55: el que gana por 1 ×0,88 (se mete atrás), el que pierde ×1,12 (se tira arriba) y el que pierde además le deja ×1,05 al rival (contra). Por 2 o más, ×0,92 / ×1,06 (se relaja el partido). Con `LID` ≥ 70, el que pierde suma ×1,05 ("garra"). Bonus de DT `remontada` se suma acá.

### 4.6 Fatiga
`físico −= 0,30 × (1,3 − atributo_físico/100) × fatiga_estilo × fatiga_charla × condiciones` por minuto jugado. Un titular medio termina los 90' con −25 a −35 de físico. El físico efectivo arranca con el físico real del jugador (que viene de `mercado`, después de los días de recuperación).

### 4.7 Cambios automáticos
Hasta 5 cambios en 3 ventanas (más el entretiempo). Reglas de la IA (para el rival siempre; para el usuario si tiene "cambios automáticos"): sacar al que tenga físico < 45, al amonestado con riesgo, al lesionado (obligatorio); minuto 60–75 si va perdiendo, entrar delanteros. DT con bonus `lectura` cambia 5 minutos antes y elige mejor.

### 4.8 IA táctica del rival
Arranca con el estilo y la formación que define `liga` según su personalidad. En el entretiempo y en el minuto 70 revisa: si pierde, pasa a "todo al ataque"; si gana por 1 en el 80, a "todos atrás" (salvo personalidad "caótico", que hace lo contrario).

### 4.9 ¿Hay parada?
Ver §7. Las paradas solo existen en modo completo y solo para el lado del usuario.

---

## 5. Calibración

### 5.1 Referencias del fútbol real

> Valores aproximados de temporadas recientes, de memoria; antes de cerrar la calibración se verifican contra datos públicos (tarea PAR-T20).

| Métrica | Ligas top de Europa | Liga argentina (Primera) | Ascenso argentino |
|---------|---------------------|--------------------------|-------------------|
| Goles por partido | 2,7–2,9 (Premier 2023-24: ~3,3, excepcional) | 2,1–2,3 | ~2,0 |
| Local / empate / visitante | 43–46 / 24–26 / 29–31 % | 40–43 / 28–32 / 27–30 % | similar, más empates |
| Remates por equipo | 12–13 (4–4,5 al arco) | 11–12 | — |
| Conversión de penales | 75–78 % | ~75 % | — |
| Tiro libre directo que termina en gol | 5–7 % | — | — |
| "Ocasión clarísima" (mano a mano) convertida | 35–40 % | — | — |
| Amarillas por partido | ~4 | ~5 | ~5 |
| Penales por partido | 0,25–0,35 | ~0,3 | — |
| Favorito claro de las casas de apuestas (cuota < 1,40) gana | ~72–75 % | — | — |
| Puntos del campeón en 38 fechas | 85–95 | (formato distinto, ~2,0 por partido) | — |

### 5.2 Objetivos de FULBO

Un poco más de goles que el fútbol argentino real (es un juego, el 0-0 aburre) y la paridad del ascenso. Ver pregunta P1.

| Métrica (entre equipos de igual fuerza, salvo aclaración) | Objetivo |
|-----------------------------------------------------------|----------|
| Goles por partido | **2,5 ± 0,15** (promedio de toda una liga: 2,5–2,8) |
| Local / empate / visitante | **42–46 / 25–29 / 27–31 %** |
| Remates por equipo / al arco | 11–13 / 4–5 |
| Penales convertidos (automático) | 74–78 % |
| Tiro libre directo (automático) | 5–8 % |
| Mano a mano (automático) | 34–40 % |
| Amarillas / rojas por partido | 4–5 / 0,15–0,25 |
| Favorito de local por +10 puntos: gana / empata / pierde | **63–69 / 19–23 / 10–15 %** |
| Favorito de local por +20 puntos: gana / pierde | 82–88 / 3–6 % |
| Favorito de visitante por +10: gana | 50–56 % |
| Liga de 20 con planteles separados por 15 puntos: puntos del campeón / del último | 74–82 / 24–32 |
| Liga de 20 (misma dispersión): el mejor plantel sale campeón | 25–40 % (el fútbol tiene sorpresas; top 2: ~55 %) |
| Diferencia entre partido completo y rápido (misma semilla) | **0** (idénticos) |
| Tiempo por partido rápido / completo con highlights | < 0,5 ms / < 30 ms en una PC; < 1 s en celular medio (PAR-1.3) |

### 5.3 Prototipo

Se corrió un prototipo descartable del bucle simplificado (§4.2 + §4.5 + §3.7, sin estilos ni faltas) con 200.000 partidos por punto y los valores de este documento (`R0 = 0,128`, `β = 0,28`, local ×1,12 / visitante ×0,90, día σ = 0,15):

| Diferencia de fuerza (local − visitante) | Local | Empate | Visitante | Goles |
|------------------------------------------|-------|--------|-----------|-------|
| −10 | 21 % | 26 % | 53 % | 2,63 |
| 0 | 42 % | 28 % | 30 % | 2,55 |
| +5 | 55 % | 25 % | 20 % | 2,64 |
| +10 | 66 % | 21 % | 12 % | 2,82 |
| +20 | 86 % | 11 % | 4 % | 3,47 |

Temporadas de 20 equipos con fuerzas repartidas en 15 puntos: campeón ~78 pts, último ~27, el mejor plantel campeón 31 % (top 2: 55 %).

**Consecuencia para otros módulos:** la paridad de la liga la define la **dispersión de los planteles** (`mercado` y `liga`), no el motor. Con 15 puntos entre el mejor y el peor de la B, un club que llega al top 3 de fuerza tiene ~40–55 % de terminar 1.º o 2.º: compatible con "pelear el ascenso en la 1.ª o 2.ª temporada" (ECO-2). Ver pedidos L3 y M2.

### 5.4 Método
`tests/modulos/partido/calibracion.test.ts` corre 20.000 partidos por punto de la grilla (diferencias −20…+20, estilos, expulsiones) y falla si algo sale de banda. `herramientas/calibrar-partido.ts` imprime la tabla para ajustar `motor.json`. Se corre también la temporada completa del núcleo (NUC-7) para mirar goleadores y puntos.

---

## 6. Modo completo y modo rápido

| | Rápido | Completo |
|--|--------|----------|
| Quién lo usa | `liga` (partidos ajenos), avance rápido del usuario (NUC-2.5), pronósticos | Partido del club |
| Bucle | el mismo | el mismo |
| Paradas (minijuegos, entretiempo) | no; todo se resuelve en automático | sí, para el lado del usuario |
| Registra | goles (con asistidor y tipo), tarjetas, lesiones, cambios, minutos, estadísticas básicas | todos los eventos, relato, notas 1–10, figura, highlights, resumen |
| Salida | `ResultadoPartido` | `ResultadoPartido` + `Resumen` + `Highlight[]` |
| Costo | ~0,1–0,5 ms | ~10–30 ms (el grueso es armar highlights y relato al cerrar) |

`simularRapido` acepta equipos sin táctica cargada: `armarEntrada` arma el once automático (mejor 11 disponible para la formación preferida). Si un club de la copa continental no tiene plantel en `mercado`, ver pedido M3.

---

## 7. Jugadas clave y minijuegos (PAR-5)

### 7.1 Paradas

```ts
type Parada =
  | { id: string; tipo: 'entretiempo'; minuto: 45; movidas: IdMovidaInstancia[] }
  | { id: string; tipo: 'jugada'; jugada: JugadaClave }
  | { id: string; tipo: 'tanda'; tanda: EstadoTanda }
```

**Candidatas** (solo jugadas del usuario o contra el usuario): penal a favor, penal en contra (atajar), mano a mano propio, tiro libre directo peligroso propio, última jugada.

**Presupuesto**: máximo **3 jugadas por partido** (`preferencias.maxJugadas`, 0–5) + entretiempo + tanda. Con `minijuegos: 'importantes'` solo penales y última jugada; con `'ninguno'`, nada (se ve el relato igual).

**Prioridad**: penal a favor > última jugada > penal en contra > mano a mano > tiro libre. Hasta el minuto 85 se reserva 1 lugar para penal o última jugada. Una candidata que no entra en el presupuesto se resuelve en automático.

Frecuencia esperada: ~0,8 mano a mano + ~0,6 tiro libre + ~0,15 penal por equipo por partido ⇒ **1 a 2 minijuegos** por partido en promedio. Suficiente para sentirlo, sin cortar el ritmo.

### 7.2 Resolución común

```
resolverJugada(jugada, ejecucion, rngJugada) → { desenlace: 'gol'|'atajada'|'palo'|'afuera'|'bloqueo'|'perdida', detalle }
ejecucionAutomatica(jugada, rngJugada) → ejecución que haría la IA según los atributos
```

- Saltear, no responder en el tiempo límite (PAR-5.2, ≤ 20 s) o modo rápido ⇒ `ejecucionAutomatica`.
- **Balance jugar vs saltear**: jugar bien tiene que valer la pena pero no romper el juego. Objetivo: jugador hábil +10–15 pp sobre el automático; jugador torpe −15 pp. Si el minijuego es mucho mejor que saltear, todos se ven obligados a jugarlos siempre; si es peor, nadie los juega.
- El DT y el staff mejoran el minijuego (`BonusDT.minijuego`): +2 s de tiempo, mira 15 % más estable, **pista** del arquero (el analista o el DT "lo estudió").
- **El arquero te estudia**: `EstadoPartido.tendencias` guarda la zona de tus últimos 8 penales y tiros libres; si repetís zona 3 veces en los últimos 5, los arqueros rivales se inclinan hacia ahí (+20 % de adivinar). Evita la "jugada infalible".

### 7.3 Penal (patear) — MVP
- **UI**: arco con mira que el usuario arrastra (`x` −100…100, `y` 0…100) + barra de fuerza que oscila; se toca para fijar (`fuerza` 0…100).
- **Motor**: el punto final = objetivo + desvío normal con `σ = σ0 × (1,6 − pegada/100) × presión` (presión sube con la importancia, el minuto, el Aguante del rival y si es para empatar). Fuerza ideal 55–85: menos, el arquero llega más; más de 90, el desvío vertical se dispara (se va a la tribuna). El arquero elige zona (6 zonas) con tendencias + `atajada` + estudio (7.2); si adivina y llega (distancia, altura, fuerza), ataja con probabilidad según atajada. Cerca del palo (franja de 6 cm del poste) ⇒ palo.
- **Objetivos**: automático 76 %; buen penal al ángulo 88–90 %; al medio y fuerte 70 %.

### 7.4 Atajar penal — MVP (cuesta casi nada: es el mismo minijuego al revés)
- **UI**: elegís una de 6 zonas antes de que patee (≤ 5 s). Si hay pista, se muestra ("patea siempre cruzado").
- **Motor**: el pateador IA elige zona según tendencia propia (sorteada por jugador con la semilla del jugador) y pegada. Si coincidís, atajás con 55–70 % según atajada y la fuerza del remate; si no, 2 %. Automático: ~24 % atajados.

### 7.5 Tiro libre — MVP
- **UI**: vista de la barrera; mira + **efecto** (−100…100, comba) + fuerza. Opción alternativa: **"tirar el centro"** (cabezazo resuelto por el motor con xG 0,10 según el físico de los de arriba).
- **Motor**: trayectoria parabólica simplificada: tiene que pasar la barrera (altura a 9,15 m) y bajar antes del travesaño; el efecto permite rodearla. Desvío según pegada. Automático 6 %, hábil hasta ~18 %.

### 7.6 Mano a mano — MVP
- **UI**: cámara lenta de 6 s con la **postura del arquero** visible (sale rápido / se queda parado / se tira a los pies) y 4–5 botones: **cruzado abajo**, **picada**, **gambeta al arquero**, **fuerte al medio**, **pasarla** (si hay compañero).
- **Motor**: piedra-papel-tijera contra la postura real del arquero (sorteada); la postura que se muestra es correcta con probabilidad `0,6 + 0,3 × gambeta/100` (lectura). Tabla base en `minijuegos.json`, ejemplo:

| Definición \ arquero | Sale rápido | Se queda | Se tira |
|-----------------------|-------------|----------|---------|
| Cruzado abajo | 35 % | 55 % | 25 % |
| Picada | 65 % | 15 % | 50 % |
| Gambeta | 40 % | 30 % | 70 % |
| Fuerte al medio | 30 % | 25 % | 45 % |

  × atributo de la definición (pegada, gambeta…). Automático ~38 %; leyendo bien ~55 %.

### 7.7 Última jugada — MVP (selector, no habilidad)
Minuto 88+ con el usuario perdiendo por 1, o empatando en un partido que hay que ganar: **elegí la jugada** (centro al área, pelotazo al 9, pared por el medio, remate de lejos). Cada una tiene probabilidad de ocasión, tipo de ocasión resultante y riesgo de contra (el rival tiene una chance si sale mal). Si la jugada termina en mano a mano o tiro libre y queda presupuesto, encadena ese minijuego.

### 7.8 Tanda de penales — MVP (la pide CLU-12.6)
- La disparan las reglas de la entrada (`empate: 'penales' | 'alargue_y_penales'`, con el global si es ida y vuelta).
- 5 por lado + muerte súbita. Orden automático: los 5 con mejor `pegada + liderazgo/2`, el arquero último. La presión sube con cada tiro y si es "para seguir vivo".
- Cada tiro propio = penal (7.3), cada tiro rival = atajar (7.4), o botón **"simular la tanda"**. No cuenta para el presupuesto de jugadas.

### 7.9 Retomar y anti-trampa
Si se cierra el juego en medio del partido, se reconstruye con `reconstruir(entrada, semilla, respuestas)`. Si había una jugada abierta, **se resuelve en automático** (si no, recargar sería una forma de repetir el penal). Ver P5.

---

## 8. Entretiempo y movidas (PAR-10)

- En modo completo el partido siempre para en el 45'. La UI muestra: resultado, estadísticas, físico de cada uno, y permite cambios, estilo y charla de entretiempo.
- **Movidas "en partido"**: `antesDelPartido` de `movidas` las deja marcadas (pedido V1). En el entretiempo la UI las muestra como notificación con decisión rápida. La respuesta del usuario viaja en la `RespuestaParada` del entretiempo como `{ movida, opcion }`.
- Los efectos de esa opción son los efectos comunes del núcleo. El motor **aplica dentro del partido** los que entiende (moral, físico, `temporal` sobre un jugador en cancha, Aguante vía `efectoPartido`, pedido V2) para el segundo tiempo; los persistentes los aplica el núcleo después, como siempre.
- Ejemplos: "el 9 se peleó con el DT en el vestuario" (sacarlo / bancarlo y que juegue caliente: `temporal: calentado`); "la barra baja al vestuario" (Aguante +15, moral −5 a los profesionales).

---

## 9. Highlights (PAR-12)

### 9.1 Selección
Al cerrar en modo completo se eligen **3 a 6** highlights por puntaje: gol que define (20) > gol (15) > penal errado o atajado (12) > palo (9) > atajada clave (8) > mano a mano errado (7) > expulsión (5). Desempate por minuto (más tarde, más drama). En un 0-0 sin nada, igual se llega a 3 con las mejores ocasiones. Estos mismos son los **momentos clave** del resumen (PAR-4.1).

### 9.2 Formato de reconstrucción (2D hoy, 3D después)

```ts
interface Reconstruccion {
  version: 1
  evento: number                 // n del EventoPartido que reconstruye
  plantilla: IdPlantilla         // 'pared_y_remate', 'contra_por_derecha', 'penal'...
  duracion: number               // segundos de animación (4–9)
  parte: 1 | 2 | 3 | 4           // para saber hacia dónde ataca cada uno
  ataca: Lado                    // quién protagoniza
  pelota: ClavePelota[]
  actores: Actor[]               // los involucrados (3–8), con trayectoria propia
  resto: { lado: Lado; formacion: IdFormacion }[]   // los demás se ubican con la forma del equipo desplazada por la pelota
  marcas: MarcaTiempo[]          // pase, remate, atajada, gol, festejo → relato, sonido y cámara
  relato: string[]               // frases ya elegidas para esta jugada
  camara?: SugerenciaCamara[]    // solo la usa el 3D (V1)
}

// Coordenadas en METROS. Origen: centro de la cancha. x ∈ [−52,5; 52,5] (largo), y ∈ [−34; 34] (ancho), z = altura.
// El local ataca hacia +x en el primer tiempo y hacia −x en el segundo (como en una cancha de verdad).
interface ClavePelota { t: number; x: number; y: number; z: number; curva?: number }   // curva: comba lateral (tiros libres)
interface Actor {
  jugador: IdJugador; lado: Lado; dorsal: number
  rol: 'rematador' | 'asistidor' | 'defensor' | 'arquero' | 'apoyo'
  claves: { t: number; x: number; y: number; accion?: AccionActor; mira?: number }[]   // mira: radianes
}
type AccionActor = 'parado'|'trota'|'corre'|'conduce'|'pasa'|'centra'|'remata'|'cabecea'|'ataja'|'se_tira'|'barre'|'festeja'|'lamenta'|'protesta'
interface MarcaTiempo { t: number; tipo: 'pase'|'centro'|'remate'|'atajada'|'palo'|'gol'|'afuera'|'falta'|'tarjeta'|'festejo' }
interface SugerenciaCamara { t: number; tipo: 'seguir_pelota'|'detras_del_rematador'|'arco'|'aerea'|'festejo'; jugador?: IdJugador }
```

- **Interpolación**: lineal entre claves para actores; la pelota usa parábola entre claves cuando `z` cambia (centros, globos) y `curva` para la comba.
- **El resto de los 22**: no se guardan. `posicionesDeBloque(formacion, pelota, lado, t)` (función pura exportada por `partido`) desplaza las coordenadas de la formación hacia la pelota con un factor de compresión. La pizarra 2D y la escena 3D llaman a la misma función, así se ven iguales.
- **Peso**: ~2–4 KB por highlight. Se guardan los highlights de los últimos 5 partidos del club; más viejos, solo el resultado (y se pueden regenerar si `versionMotor` coincide).
- **Para el 3D** (V1): las `accion` mapean a clips de animación; `camara` sugiere tomas; el festejo depende de la personalidad (influencer: baile de video corto; cabulero: besa el escudo; calentón: se saca la camiseta y ve la amarilla).

### 9.3 Plantillas de jugada

`plantillas.json`: cada plantilla es una secuencia de **tiempos** con los roles ubicados en un marco normalizado de ataque (`u` 0→1 desde el arco propio al rival, `v` −1…1 de banda a banda) y con variables (lado de la jugada, profundidad, ruido). El generador:
1. elige la plantilla compatible con el tipo de ocasión y el estilo (con `presentacion(n)`);
2. asigna roles a los protagonistas reales del evento;
3. espeja si la jugada es por la izquierda;
4. convierte a metros según la parte y el lado;
5. arma la pelota uniendo las posiciones de los actores en cada pase y cierra con el **desenlace** real (gol: entra en un punto del arco; atajada: el arquero llega; palo: `y = ±3,66`; afuera).

En minijuegos, el desenlace usa la **ejecución del usuario**: el penal se ve entrando donde apuntaste.

Plantillas MVP (12): remate de afuera, pared y remate, contra por derecha con centro atrás, centro y cabezazo, córner y cabezazo, mano a mano tras pelotazo, gambeta en el área, error del defensor, rebote en el área, penal, tiro libre directo, tiro libre con centro. Ejemplo:

```json
{
  "id": "pared_y_remate",
  "tipos": ["jugada_colectiva", "remate_area"],
  "estilos": { "toque": 2, "equilibrado": 1 },
  "duracion": 6,
  "roles": ["asistidor", "rematador", "defensor", "arquero"],
  "tiempos": [
    { "t": 0.0, "pos": { "asistidor": [0.62, 0.10], "rematador": [0.70, -0.15], "defensor": [0.74, -0.10] }, "pelota": "asistidor" },
    { "t": 1.2, "pase": ["asistidor", "rematador"] },
    { "t": 2.0, "pase": ["rematador", "asistidor"], "pos": { "rematador": [0.80, -0.05] } },
    { "t": 2.8, "pase": ["asistidor", "rematador"], "pos": { "rematador": [0.86, 0.00], "defensor": [0.83, 0.05] } },
    { "t": 3.4, "remate": "rematador" },
    { "t": 4.0, "desenlace": true }
  ]
}
```

### 9.4 Pizarra 2D (MVP, fase 6)
Cancha cenital con el césped a franjas del estilo BOLA, puntitos con los colores de la camiseta y el dorsal, estela en pases y remates, relato abajo, botón **Saltear** y **Saltear todos** (PAR-12.4). Canvas 2D, sin Three.js.

---

## 10. Relato (PAR-9)

### 10.1 Quién relata
**La radio del club**: partidaria, apasionada, sufre los goles en contra y putea (PG-13) al árbitro. Es más argentino que un relato neutro y le da personalidad al juego. Ver P3.

### 10.2 Estructura del banco (`relato/*.json`)

Cada **clave** de evento tiene uno o más **fragmentos** (apertura, descripción, cierre) y cada fragmento una lista de variantes con condiciones y peso. Una línea de relato = concatenación de fragmentos. Así 15 aperturas × 30 descripciones × 15 cierres dan miles de goles distintos.

```json
{
  "clave": "gol_propio",
  "fragmentos": {
    "apertura": [
      { "id": "gp.a.01", "texto": "¡GOOOOOOL! ¡Gol de {club}, gol, gol, gol!", "peso": 3 },
      { "id": "gp.a.02", "texto": "¡Adentro, adentro, adentroooo!" },
      { "id": "gp.a.03", "texto": "¡Tomá, tomá, tomaaaá!", "si": { "marcador": ["iguala", "pasa_al_frente"] } }
    ],
    "descripcion": [
      { "id": "gp.d.01", "texto": "{jugador} le pegó de afuera y la colgó del ángulo.", "si": { "plantilla": ["remate_afuera"] } },
      { "id": "gp.d.02", "texto": "La tiró {asistidor} con la mano y {jugador} solo tuvo que empujarla.", "si": { "asistidor": true } },
      { "id": "gp.d.03", "texto": "Cabezazo de {jugador} entre los dos centrales, como en el potrero.", "si": { "plantilla": ["centro_cabezazo", "corner_cabezazo"] } },
      { "id": "gp.d.04", "texto": "{jugador} se la picó al arquero como quien no quiere la cosa.", "si": { "definicion": ["picada"] } }
    ],
    "cierre": [
      { "id": "gp.c.01", "texto": "¡Que lo vean en el barrio, que lo vean en {ciudad}!" },
      { "id": "gp.c.02", "texto": "¡Y la tribuna se viene abajo!", "si": { "local": true, "aguanteMin": 70 } },
      { "id": "gp.c.03", "texto": "¡En el último minuto! ¡Esto no es para cardíacos!", "si": { "minuto": [88, 130] } }
    ]
  }
}
```

**Condiciones** (`si`): `plantilla`, `definicion`, `marcador` (empate, ganando, perdiendo, iguala, pasa_al_frente, amplía, descuento, goleada), `minuto` [desde, hasta], `importancia` (clásico, final, decisivo), `local`, `aguanteMin`, `personalidad` del protagonista, `asistidor`, `ambientacion` (nieve, altura, costa…).

**Variables**: `{jugador}`, `{apodo}` (si tiene, se prefiere 50 %), `{asistidor}`, `{arquero}`, `{rival}`, `{club}`, `{dt}`, `{minuto}`, `{marcador}`, `{estadio}`, `{ciudad}`, `{sponsor}`.

### 10.3 Claves y mínimo de variantes para el MVP

| Clave | Ejemplo de tono | Mínimo |
|-------|-----------------|--------|
| `inicio` | "Rueda la pelota en {estadio}. Que sea lo que Dios quiera." | 8 |
| `gol_propio` | (arriba) | 15 / 30 / 15 por fragmento |
| `gol_rival` | "Gol de {rival}. Y bueno... a remarla, muchachos." · "Lo veníamos avisando: la tuvo {jugador} y no perdonó." | 15 |
| `atajada_propia` / `atajada_rival` | "¡Qué manos, {arquero}! ¡Qué manos!" · "Le sacó un gol que era gol en cualquier cancha." | 12 / 8 |
| `palo` | "¡Uuuh! ¡El palo! ¡El palo dijo que no!" | 8 |
| `errada` | "La tiró a la tribuna. Que alguien le avise que el arco está ahí." | 12 |
| `falta`, `amarilla`, `roja` | "Amarilla para {jugador}, que fue con todo y llegó tarde." · "¡Roja! {jugador} se va a las duchas antes de hora." | 6 / 10 / 6 |
| `lesion` | "Se quedó en el piso {jugador}... mala señal." | 6 |
| `penal`, `tiro_libre`, `mano_a_mano`, `ultima` (intro del minijuego) | "¡Penal! ¡Penal para {club}! Agarra la pelota {jugador}... ¿adónde la pone?" | 6 c/u |
| `aguante_lleno` | "¡Escuchen a la gente! ¡Esto es una caldera!" | 8 |
| `ambiente` (relleno) | "Se juega en la mitad de la cancha, mucha fricción y poco fútbol." · "Este córner llega gracias a {sponsor}... apuesten con responsabilidad, o mejor no apuesten." | 40 |
| `entretiempo`, `final_gana`, `final_empata`, `final_pierde` | "¡Terminó! ¡Ganó {club}! ¡A festejar, que mañana se labura!" | 8 c/u |
| `efecto` (resaca, motivado, lesión oculta) | "A {jugador} se lo ve pesado, como si hubiera dormido poco." | 3 por efecto |

Reglas de contenido: frases **originales**, sin calcar latiguillos famosos de relatores reales ni nombrar personas reales; insultos solo genéricos y en tono de cancha (PG-13); sin discriminación.

### 10.4 No repetición (PAR-9.1)
- La simulación guarda `usadas: Set<idFragmento>` del partido. Se sortea solo entre los **no usados** que cumplen las condiciones (con `presentacion(n)`).
- Si para un fragmento no queda ninguno, se omite ese fragmento (una línea puede ser solo apertura + descripción). Si no queda ninguna apertura, se usa una genérica y se loguea un aviso de banco corto (esto es una alerta de contenido, no un error).
- Test: 1.000 partidos con 8 goles por lado nunca repiten un id.

### 10.5 Densidad
~30–45 líneas por partido: todos los eventos importantes + 1 de ambiente cada ~5 minutos si no pasó nada. En modo rápido no se genera relato.

### 10.6 Resumen como publicación (PAR-4)
```ts
interface Resumen {
  titular: string                     // "¡Lo dio vuelta {club} en el final!"
  texto: string                       // 2–3 oraciones armadas con fragmentos del banco 'cronica'
  figura: IdJugador
  momentos: { evento: number; minuto: number; texto: string }[]   // 3–5, los mismos highlights
  reacciones: { emoji: 'fuego'|'corazon'|'risa'|'enojo'|'llanto'; cantidad: number }[]   // según resultado, fama y Aguante
  comentarios: { autor: string; texto: string; tono: TonoHincha }[]                        // 3–6, banco 'comentarios'
}
type TonoHincha = 'fanatico' | 'pesimista' | 'chicanero_rival' | 'pide_dt' | 'abuela' | 'analista'
```
Ejemplos de comentarios: "Con este 9 vamos a la Libertadores, papá" · "Ni con la cábala de mi tío salimos de abajo" · "Que se vaya {dt} YA" · "Mi nieto dice que {jugador} es el mejor del mundo y yo le creo". La forma visual es genérica "redes del club", sin copiar la interfaz de ninguna red real.

---

## 11. Efectos temporales de movidas (PAR-6.2)

El núcleo define `Efecto.temporal = { jugador, efecto: string, partidos }`. `movidas` lo emite, `mercado` lo guarda en el jugador y descuenta los partidos, y **`partido` lo interpreta** con `efectos.json`. Un id que el motor no conoce se ignora con un aviso en desarrollo (así movidas puede inventar efectos sin romper nada; validado por la tarea PAR-T42).

| Id | Efecto en el partido | Relato |
|----|----------------------|--------|
| `resaca` | velocidad −15 %, físico inicial −20, +50 % de chance de ser el defensor del error | "se lo ve pesado" |
| `lesion_oculta` | todo −8 %, riesgo de lesión ×3; si se lesiona, la lesión es grado 2+ | "se toca el muslo" |
| `infiltrado` | sin penalidad hasta el 60'; después todo −10 % y riesgo de lesión ×4 | |
| `motivado` | todo +5 %, moral +10 en el partido | |
| `cabeza_en_otro_lado` | pase y marca −8 %, nota −0,5 (oferta de Arabia, video viral) | "anda con la cabeza en otro lado" |
| `tatuaje_fresco` | físico inicial −10 | |
| `concentrado` | todo +3 % (doble turno, concentración) | |
| `calentado` | faltas ×1,5, riesgo de roja ×2, ATA +3 % | |
| `peleado_con_dt` | moral tope 40; si lo sacan, el relato lo muestra protestando | |
| `botines_mufados` / `corazonada` | pegada −5 % / +5 % | |
| `presion_barra` (plantel) | Aguante inicial +10; moral −5 a todos si va perdiendo en el 60' | |
| `lesion`, `suspendido` | **no puede jugar** (se filtra en `armarEntrada`) | |

Efectos de **club** que pesan en el partido (no son de jugador): césped arruinado, tribuna clausurada, puertas cerradas, partido en otro estadio. Llegan por `club` y `liga` como datos de la sede (pedidos C1 y L1), no como efectos temporales.

---

## 12. Tipos TypeScript de la porción `partido`

```ts
// ═══ Porción ═══
interface EstadoPartido {
  version: 1
  tactica: TacticaClub                       // la del club del usuario, se recuerda entre partidos
  previa?: Previa                            // borrador mientras se está en fase 'previa'
  cabalas: Record<IdCabala, { nivel: 0 | 1 | 2 | 3; quemadaPor: number }>   // quemadaPor: partidos que faltan
  cabalaActiva?: IdCabala
  preferencias: {
    minijuegos: 'todos' | 'importantes' | 'ninguno'
    maxJugadas: number                       // 0–5, por defecto 3
    velocidadRelato: 1 | 2 | 4
    highlights: 'siempre' | 'solo_goles' | 'nunca'
    cambiosAutomaticos: boolean
  }
  tendencias: { zona: ZonaArco; cuando: Instante }[]   // últimos 8 penales y tiros libres del usuario (§7.2)
  enCurso?: { partido: IdPartido; entrada: EntradaPartido; semilla: number; respuestas: RespuestaParada[]; modo: 'completo' | 'rapido' }
  ultimos: CierrePartido[]                   // los últimos N partidos del club (N = 5) con highlights
}

interface TacticaClub {
  formacion: IdFormacion                     // '4-3-1-2', '4-4-2', '4-3-3', '4-2-3-1', '3-5-2', '5-3-2'
  titulares: Partial<Record<IdPuesto, IdJugador>>
  suplentes: IdJugador[]                     // hasta 9
  estilo: IdEstilo
  pateadores: { penal?: IdJugador; tiroLibre?: IdJugador; corner?: IdJugador }
  capitan?: IdJugador
}
interface Previa { partido: IdPartido; tactica: TacticaClub; charla: IdCharla; cabala?: IdCabala }

// ═══ Entrada del motor ═══
interface EntradaPartido {
  partido: IdPartido
  competicion: IdCompeticion; instancia: string          // "Fecha 12", "Cuartos de final (vuelta)"
  importancia: 'normal' | 'clasico' | 'decisivo' | 'final'
  reglas: { empate: 'vale' | 'penales' | 'alargue_y_penales'; global?: [number, number]; cambios: number }
  local: EquipoEnCancha; visitante: EquipoEnCancha
  sede: { neutral: boolean; estadio: string; ciudad: string; capacidad: number; asistencia: number; sobreventa: boolean
          cesped: number /*0–100*/; ambientacion?: { paisaje: string; clima?: string } }
  hinchada: { relacionHinchas: number; relacionBarra: number; racha: ('G'|'E'|'P')[] }  // del club del usuario
  usuario?: Lado                                          // undefined en partidos ajenos
  config: { minijuegos: 'todos' | 'importantes' | 'ninguno'; maxJugadas: number }
}
interface EquipoEnCancha {
  club: IdClub; nombre: string; colores: [string, string]
  formacion: IdFormacion; estilo: IdEstilo; charla?: IdCharla
  cabala?: { id: IdCabala; nivel: 1 | 2 | 3 }
  titulares: (JugadorEnCancha & { puesto: IdPuesto })[]   // 11
  suplentes: JugadorEnCancha[]                            // hasta 9
  pateadores: { penal: IdJugador; tiroLibre: IdJugador; corner: IdJugador }
  dt?: { id: IdDT; nombre: string; nivel: 0 | 1 | 2 | 3 | 4 | 5; afines: IdEstilo[]; opuesto?: IdEstilo; bonus: BonusDT[] }
  ia: { personalidad?: string; cambiosAutomaticos: boolean }
}
interface JugadorEnCancha {
  id: IdJugador; nombre: string; apodo?: string; dorsal: number
  posicion: 'ARQ' | 'DEF' | 'MED' | 'DEL'
  atributos: { pegada: number; velocidad: number; gambeta: number; pase: number; marca: number; fisico: number; liderazgo: number; atajada?: number }
  fisico: number; moral: number                           // 0–100 al momento del partido
  personalidad: ('fiestero' | 'cabulero' | 'influencer' | 'calenton' | 'profesional')[]
  efectos: { id: string; partidos: number }[]
}
type BonusDT =
  | { tipo: 'atributo'; atributo: keyof JugadorEnCancha['atributos']; valor: number; posicion?: 'ARQ' | 'DEF' | 'MED' | 'DEL' }
  | { tipo: 'moral_inicial'; valor: number }
  | { tipo: 'remontada'; multiplicador: number }
  | { tipo: 'minijuego'; segundosExtra?: number; estabilidad?: number; pista?: boolean }
  | { tipo: 'lectura' }

// ═══ Simulación ═══
interface SimulacionEnCurso {
  entrada: EntradaPartido; semilla: number; versionMotor: string; modo: 'completo' | 'rapido'
  respuestas: RespuestaParada[]
  minuto: number; parte: 1 | 2 | 3 | 4 | 'penales' | 'final'
  marcador: [number, number]
  aguante: number
  eventos: EventoPartido[]
  parada?: Parada
  interno: unknown                        // estado del bucle (físicos, tarjetas, rng); serializable
}
interface JugadaClave {
  id: string; minuto: number
  tipo: 'penal' | 'atajar_penal' | 'tiro_libre' | 'mano_a_mano' | 'ultima_jugada'
  protagonista: IdJugador; rival: IdJugador            // pateador/definidor y arquero
  contexto: { marcador: [number, number]; presion: number; distancia?: number; barrera?: number; posturaVisible?: PosturaArquero; pista?: string }
  limiteSegundos: number                               // ≤ 20
}
type ZonaArco = 'izq_abajo' | 'izq_arriba' | 'centro_abajo' | 'centro_arriba' | 'der_abajo' | 'der_arriba'
type PosturaArquero = 'sale_rapido' | 'se_queda' | 'se_tira'
type RespuestaParada = { parada: string } & (
  | { tipo: 'saltar' }
  | { tipo: 'penal'; x: number; y: number; fuerza: number }                    // enteros −100…100 / 0…100
  | { tipo: 'atajar_penal'; zona: ZonaArco }
  | { tipo: 'tiro_libre'; x: number; y: number; fuerza: number; efecto: number } // o { centro: true }
  | { tipo: 'tiro_libre_centro' }
  | { tipo: 'mano_a_mano'; definicion: 'cruzado' | 'picada' | 'gambeta' | 'al_medio' | 'pase' }
  | { tipo: 'ultima_jugada'; jugada: 'centro' | 'pelotazo' | 'pared' | 'de_lejos' }
  | { tipo: 'entretiempo'; cambios: [IdJugador, IdJugador][]; estilo?: IdEstilo; charla?: IdCharla; movidas: { movida: string; opcion: number }[] }
  | { tipo: 'tanda_simular' }
)

interface EventoPartido {
  n: number; minuto: number; parte: 1 | 2 | 3 | 4; lado: Lado
  tipo: 'inicio' | 'ocasion' | 'gol' | 'atajada' | 'palo' | 'afuera' | 'bloqueo' | 'falta' | 'amarilla' | 'roja'
      | 'penal' | 'tiro_libre' | 'corner' | 'lesion' | 'cambio' | 'aguante_lleno' | 'entretiempo' | 'final' | 'penal_tanda' | 'var'
  protagonista?: IdJugador; secundario?: IdJugador; arquero?: IdJugador
  xg?: number; tipoOcasion?: TipoOcasion; jugada?: string   // id de JugadaClave si la hubo
  marcador: [number, number]
}

// ═══ Salida ═══
type TipoGol = 'jugada' | 'cabeza' | 'de_afuera' | 'penal' | 'tiro_libre' | 'en_contra'
interface ResultadoPartido {                 // ← tipo compartido: lo recibe todo el mundo en despuesDelPartido (pedido N4)
  partido: IdPartido; competicion: IdCompeticion
  local: IdClub; visitante: IdClub
  goles: [number, number]
  penales?: [number, number]
  ganador?: IdClub                            // con alargue y penales incluidos; undefined = empate
  goleadores: { jugador: IdJugador; club: IdClub; minuto: number; tipo: TipoGol; asistidor?: IdJugador }[]
  tarjetas: { jugador: IdJugador; club: IdClub; minuto: number; color: 'amarilla' | 'roja'; dobleAmarilla?: boolean }[]
  lesiones: { jugador: IdJugador; club: IdClub; minuto: number; gravedad: 1 | 2 | 3; partidosAfuera: number }[]
  minutos: Record<IdJugador, number>
  fisicoFinal: Record<IdJugador, number>
  notas?: Record<IdJugador, number>          // 1–10, solo completo
  figura?: IdJugador
  estadisticas: { posesion: [number, number]; remates: [number, number]; alArco: [number, number]; corners: [number, number]; faltas: [number, number] }
  asistencia: number; aguanteFinal?: number
  semilla: number; versionMotor: string; modo: 'completo' | 'rapido'
}
interface CierrePartido { resultado: ResultadoPartido; eventos: EventoPartido[]; relato: LineaRelato[]; resumen: Resumen; highlights: Highlight[]; respuestas: RespuestaParada[] }
interface LineaRelato { minuto: number; texto: string; evento?: number; tono: 'normal' | 'grito' | 'lamento' | 'ambiente' }
interface Highlight { evento: number; puntaje: number; reconstruccion: Reconstruccion }
```

---

## 13. Ganchos del módulo, efectos y noticias

| Gancho | Qué hace |
|--------|----------|
| `iniciar` | Porción vacía: táctica sin titulares (se completa sola en la primera previa), preferencias por defecto, sin cábalas. |
| `reducir` | Acciones del usuario: `tactica/*` (formación, titular, suplentes, estilo, pateadores), `previa/*` (charla, cábala), `preferencias/*`, `sim/guardar` (escribe `enCurso`), `sim/cerrar` (pasa a `ultimos`). |
| `antesDelPartido` | Valida el once (lesionados, suspendidos, físico < 15 → reemplazo automático y aviso), saca la semilla de `ctx.rng`, deja la previa lista. No emite efectos. |
| `despuesDelPartido` | Con el `ResultadoPartido` del club emite los efectos de la tabla de abajo y las noticias; actualiza cábala y tendencias. |
| `alCerrarTemporada` | Recorta `ultimos`, resetea cábalas quemadas. |

**Efectos que emite** (`origen: 'partido:<idPartido>'`). La misma función `consecuencias()` la usa `liga` para los partidos ajenos (sin relaciones), así los rivales también se cansan y se lesionan:

| Efecto | Cuánto |
|--------|--------|
| `jugador.fisico` | `fisicoFinal − fisicoInicial` de cada uno que jugó |
| `jugador.moral` | ganó +4 / empató 0 / perdió −4; + (nota − 6) × 1,5; titular que no jugó −2; goleador +3; expulsado −5; cábala y charla según §3.6 |
| `temporal: lesion` | `partidos = partidosAfuera` (1–6, grado 3 hasta 12) |
| `temporal: motivado` | 1 partido para la figura si la nota ≥ 8,5 |
| `relacion: hinchas` | ganó +1, perdió −1, clásico ×3, goleada ×2 (solo club del usuario) |
| `relacion: plantel` | −2 si la charla "si perdemos se van todos" terminó en derrota |

**No emite** (para no duplicar): plata (Áureos, AU: moneda única del juego), premios, recaudación y fama por resultados (`economia`); puntos, tabla, goleadores del torneo y **suspensiones por tarjetas** (`liga`, pedido L4).

**Noticias** (`modulo: 'partido'`): crónica del partido del club (importancia 2; 3 si es clásico, final, goleada de 4+ o remontada), golazo o hat-trick (2), lesión de un titular con 3+ partidos afuera (2), expulsión (1), "la cábala se quemó" (1).

---

## 14. Datos editables

```
src/datos/partido/
  motor.json          versionMotor, R0, β, γ, tabla de físico, moral, xG por tipo, frecuencias de faltas/tarjetas/lesiones, descuento
  sectores.json       mezcla de atributos por sector y pesos por puesto
  formaciones.json    puestos con rol, coordenadas (u, v) y pesos; peso de referencia del 4-4-2
  estilos.json        modificadores por estilo y tabla de choques
  localia.json        localía base, aporte de la hinchada, Aguante inicial y deltas
  charlas.json        charlas con efectos y reacción por personalidad
  cabalas.json        catálogo de cábalas y efecto por nivel
  efectos.json        efectos temporales que entiende el motor (§11)
  condiciones.json    altura, nieve, calor, césped (V1)
  minijuegos.json     tiempos, dispersión, tablas del mano a mano, arquero IA, presupuesto y prioridades
  plantillas.json     plantillas de jugada para highlights
  relato/*.json       banco de frases por clave (inicio, gol_propio, gol_rival, ... ambiente, cronica)
  comentarios.json    comentarios de hinchas por tono y condición
```
Todo validado con esquemas (Zod) al cargar. Los ids de fragmentos del relato son únicos y se valida que cada clave tenga el mínimo de §10.3.

---

## 15. El partido jugable (fase 7) — solo preparado

No se diseña ahora (D1 de requisitos). Lo que este diseño deja listo:

1. **Misma entrada y misma salida**: el partido jugable consume `EntradaPartido` y produce `ResultadoPartido` + `CierrePartido`. Para el resto del juego no hay diferencia.
2. **Misma valoración**: `jugador efectivo` (§3.1), DT, Aguante, estilo y efectos se calculan con las mismas funciones (`valoracion/`).
3. **Capa de resolución compartida**: las probabilidades de cada acción (pase que llega, quite, remate que entra, atajada) se escriben desde el principio como funciones puras en `resolucion/` (las usan el bucle por minutos y los minijuegos). El motor en tiempo real las va a reusar para resolver cada acción, así un 9 con pegada 85 define igual de bien en los dos.
4. **Mismo formato de posiciones**: las coordenadas de §9.2 son las de la cancha real; el motor en tiempo real emite el mismo tipo de claves y la escena 3D de los highlights se convierte en la escena del partido.
5. **Determinismo**: paso fijo (20 Hz) + registro de entradas por tick, igual que las respuestas de las paradas.
6. **Coherencia (PAR-1.1)**: un test de fase 7 hace jugar IA contra IA en tiempo real y exige que goles, local/empate/visitante y efecto de la diferencia de fuerza estén dentro de ±10 % de las tablas de §5.

Ver crítica C1: "el mismo motor" para Jugar, en sentido literal, no es posible ni deseable.

---

## 16. Criterio de "funciona" (MVP del módulo)

- `tests/modulos/partido/determinismo.test.ts`: propiedades (a), (b), (c) de §1.2 sobre 1.000 semillas.
- `tests/modulos/partido/calibracion.test.ts`: todas las bandas de §5.2.
- `tests/modulos/partido/relato.test.ts`: sin repetición, variables resueltas, bancos con el mínimo.
- `tests/modulos/partido/highlights.test.ts`: toda reconstrucción tiene pelota dentro de la cancha (salvo en el arco/afuera), desenlace coherente con el evento, 3–6 por partido.
- Temporada del núcleo (NUC-7) con ~900 partidos rápidos en < 1 s del total de 10 s.

---

## 17. Pedidos a otros módulos

> No se escribió en carpetas ajenas: el coordinador los reparte.

**Núcleo / coordinador**
- **N1** `rng.derivar(clave): Rng` (o `semillaPara(clave): number`) a partir de `meta.semilla`, para que la semilla de un partido dependa de su id y no del orden de simulación. No bloquea: sin esto, cada módulo saca la semilla de su flujo y la guarda.
- **N2** Exponer en `src/nucleo/rng` la función de generador por semilla (`crearRng(semilla: number, flujo: string)`) para no tener dos implementaciones de PRNG.
- **N3** Confirmar que la **táctica del club** (formación, titulares, estilo, pateadores, charla, cábala) vive en la porción `partido` y no en `mercado`.
- **N4** Sumar `ResultadoPartido` (§12) al contrato como el tipo `Resultado` que recibe `despuesDelPartido`, y aclarar que ese gancho corre solo para el partido del club (los ajenos los procesa `liga`).
- **N5** Documentar que `partido` exporta funciones puras que otros módulos importan (`simularRapido`, `armarEntrada`, `pronostico`, `consecuencias`). Es una dependencia de librería, no de estado; conviene que el contrato lo permita explícitamente.

**mercado**
- **M1** Atributos en escala **1–99**, con la mezcla actual (pegada, velocidad, gambeta, pase, marca, físico, liderazgo, atajada). B Nacional típica: medias de 55–62.
- **M2** **Plantel completo para cada club** de la B y de Primera (mínimo 18 jugadores con posiciones razonables) y una dispersión de ~15 puntos de fuerza entre el mejor y el peor de cada división (§5.3).
- **M3** Plantel **sintético y determinista** para rivales de la copa continental que no vivan en el mercado (`plantelDe(idClub)` generado con la semilla del club).
- **M4** DT con `nivel` (0–5), `afines: IdEstilo[]`, `opuesto?` y `bonusPartido: BonusDT[]` (vocabulario de §12). Los rivales también tienen DT (aunque sea genérico).
- **M5** Recuperación de físico diaria de ~7 puntos (+ gimnasio y kinesiólogo), para que jugar martes y sábado obligue a rotar sin castigar de más (un titular pierde 25–35 por partido).
- **M6** Descontar `partidos` de los efectos temporales de los jugadores de **ambos** clubes después de cada partido (también los ajenos) y no emitir moral por resultado de partido (lo hace `partido`, para no duplicar).

**liga**
- **L1** Por partido: `competicion`, `instancia`, `importancia` (clásicos definidos por rivalidad), `reglas` de empate (Copa nacional: penales directos; continental y repechaje: global + penales; final única: alargue y penales) y sede (neutral, otro estadio, puertas cerradas).
- **L2** Estilo y formación preferidos de cada rival según su **personalidad**, y DT.
- **L3** Usar `simularRapido` + `consecuencias` para todos los partidos ajenos, con semilla por partido guardada en el resultado.
- **L4** Llevar la **disciplina**: acumulación de amarillas (p. ej. 5 = 1 fecha), rojas (1–3 fechas) y emitir `temporal: suspendido`.

**club**
- **C1** Exponer `capacidadHabilitada` (descontando tribunas clausuradas u obras), `estadoCesped` (0–100, baja con recitales e inundaciones) y nombre del estadio.

**economia**
- **E1** Calcular la **asistencia** del partido en `antesDelPartido` (con el precio de las entradas en AU, §2b de su diseño) y dejarla legible en su porción junto con `sobreventa`, para que el Aguante la use. El motor no recalcula la demanda.
- **E2** Fama y premios por resultado los calcula `economia` leyendo `ResultadoPartido`; `partido` no los emite.

**movidas**
- **V1** Marcar movidas con `momento: 'entretiempo'` y entregarlas para la parada del 45'; resolver su opción con la `RespuestaParada` del entretiempo.
- **V2** Opcional en la opción de una movida: `efectoPartido?: { aguante?: number; moral?: number; sacar?: 'objetivo' }`, para lo que solo tiene sentido dentro del partido en curso.
- **V3** Usar los ids de efectos temporales de §11 (o pedir nuevos acá); un id desconocido no rompe, pero no hace nada en la cancha.

---

## 18. Preguntas para el usuario

- **P1 · Goles.** ¿Realismo argentino (~2,2 por partido), lo propuesto (~2,5) o festival (~3)? Afecta cuánto pesa la suerte: con menos goles hay más empates y sorpresas.
- **P2 · Minijuegos por partido.** Propuesta: hasta 3 jugadas + entretiempo + tanda. ¿Más, menos o configurable y listo? ¿Sumamos **atajar penales** (no estaba pedido, pero es el mismo minijuego al revés y casi no cuesta)?
- **P3 · Relator.** ¿La radio del club (partidario, sufre los goles en contra) o un relator neutral de TV? Propuesta: partidario.
- **P4 · Sorpresa.** Con lo propuesto, el favorito claro de local (+10) gana 2 de cada 3 y pierde 1 de cada 8. ¿Te parece bien o lo querés más predecible?
- **P5 · Recargar en medio de un penal.** Propuesta: si cerrás el juego con un minijuego abierto, se resuelve solo (para que no se pueda repetir). ¿OK?
- **P6 · Cuotas en la previa (opcional).** Mostrar en la previa el pronóstico como cuotas satíricas de la casa de apuestas sponsor ("ApostAR te paga 4,50 si ganás"). Es sátira y ambiente, sin apostar nada. ¿Va o no?

---

## 19. Críticas a la spec (no complaciente)

- **C1 · PAR-1.1 "el mismo motor para Jugar, Mirar y Simular" no se puede cumplir al pie de la letra.** Un partido jugable necesita posiciones, tiempo real y física; un simulador por minutos no tiene nada de eso. Forzar un solo motor haría lento el modo rápido o falso el jugable. Propuesta: reescribirlo como "mismo **modelo de valoración y resolución**, mismas entradas y salidas, y un test de coherencia estadística" (§15).
- **C2 · PAR-7.2 con umbral "lleno" binario** se siente de videojuego viejo (la barra está en 89 y no pasa nada). Lo hice continuo + un pico cuando se llena. Sugiero ajustar el texto.
- **C3 · Faltan definiciones por penales y alargue en los requisitos**, aunque CLU-12.6 y las copas los exigen. Lo cubro en §7.8; conviene sumar un PAR-13 "Definiciones (alargue y penales)".
- **C4 · PAR-12.1 incluye la expulsión como highlight**: animar una falta es lo más aburrido del partido. La dejé con prioridad baja; se puede reemplazar por "la atajada del partido".
- **C5 · PAR-4.2 "publicación de las redes del club"** roza la regla de no imitar redes reales. Se resuelve con una forma visual propia (§10.6), pero que lo tenga presente quien diseñe la pantalla.
- **C6 · Nadie es dueño de las suspensiones ni de la táctica.** Las asigné (L4 y N3), pero tiene que quedar escrito en el contrato.
- **C7 · Riesgo de balance de los minijuegos**: si jugar el penal da mucho más que saltearlo, "saltear" deja de ser opción real (PAR-5.3 queda de adorno). Lo acoté a +10–15 pp para un jugador hábil y lo mide la tarea PAR-T35.
