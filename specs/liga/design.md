# Liga — Diseño

Estado: `en revisión` · Cubre: LIG-1 a LIG-19 (y CLU-12) · Contrato: `specs/nucleo/design.md` · Todos los números van a `src/datos/liga/*.json` y se ajustan con simulaciones (NUC-7).

> **Bloqueo:** el contrato del núcleo, tal como está, no deja que un módulo actualice su propia porción desde los hooks (`alAvanzarDia` y los demás devuelven `Salida`, que solo trae efectos, noticias e interrupción). La liga tiene que guardar cientos de resultados por temporada. Ver §15, pedido N1. Este diseño supone que se resuelve con `Salida.porcion`.

---

## 1. Piezas del módulo

```
src/modulos/liga/
  index.ts            el Modulo<EstadoLiga> (iniciar, reducir, hooks)
  tipos.ts            tipos de la porción (§11)
  calendario.ts       plantilla → calendario de la temporada (§2)
  fixture.ts          Berger + clásicos + días (§3)
  tabla.ts            tabla incremental, desempates, matemáticas (§4)
  temporada.ts        cierre: ascensos, repechaje, descensos, historial (§5)
  copas/
    llaves.ts         llaves a partido único o ida y vuelta, penales
    nacional.ts       Copa Nacional (§6)
    condor.ts         Copa Cóndor: grupos, cuadro, final (§7)
    sorteo.ts         sorteos con bombos y restricciones (backtracking con rng)
  simulacion.ts       adaptador al modo rápido del partido (§9)
  personalidad.ts     arquetipos, forma, presión, salud, política de mercado (§8)
  vida.ts             rachas, batacazos, crisis, señales a mercado (§10)
  noticias.ts         plantillas, variables, tope por día, anti-repetición (§12)
  buzon.ts            pedidos de movidas sobre la competencia (§14)
  selectores.ts       consultas puras para la UI, el núcleo y los demás módulos (§11.4)
src/datos/liga/
  clubes.json         los 40 clubes (§16)
  federal.json        pool de clubes livianos del Federal
  extranjeros.json    pool de clubes livianos de la Cóndor
  arquetipos.json     parámetros por arquetipo y efectos (§8)
  calendario.json     plantilla de 52 semanas (§2)
  reglamentos/        b_nacional, primera, copa_nacional, copa_condor, repechaje, desempate
  noticias.json       plantillas (§12)
  presidentes.json    nombres, apodos y rasgos para elecciones (V1)
  balance.json        constantes de forma, presión, humor, salud, rachas y topes
  temporada0.json     la historia previa: tabla "anterior", palmarés, ranking continental
```

---

## 2. Calendario anual (LIG-1, LIG-8)

Respeta las etapas de `specs/nucleo/design.md` §2. La semana 1 es la primera de enero (el núcleo traduce semana y día a fecha visible). Copa Nacional los **martes**, Cóndor los **miércoles** y nunca en la misma semana, así ningún club juega tres partidos en siete días.

| Sem | Aprox. | Entre semana | Fin de semana | Otros (hitos en **negrita**) |
|-----|--------|--------------|---------------|------------------------------|
| 1 | ene | — | — | Pretemporada. **Abre la ventana de verano** (lun) |
| 2–3 | ene | — | (V1: amistosos del Torneo de Verano) | |
| 4 | ene | lun: **sorteo de la Copa Nacional y de los grupos de la Cóndor** | — | **Cierra la ventana de verano** (dom). Noticia "La previa: los candidatos" |
| 5 | feb | — | Fecha 1 | |
| 6 | | mié Cóndor grupos 1 | F2 | |
| 7 | | mar **Copa Nacional 32avos** | F3 | |
| 8 | | mié Cóndor grupos 2 | F4 | |
| 9 | mar | — | F5 | |
| 10 | | mié Cóndor grupos 3 | F6 | |
| 11 | | — | F7 | |
| 12 | | mié Cóndor grupos 4 | F8 | |
| 13 | abr | mar Copa Nacional 16avos | F9 | |
| 14 | | mié Cóndor grupos 5 | **F10 · fecha de clásicos** | |
| 15 | | mié: reprogramados | **libre** | Semana de reserva (postergaciones) |
| 16 | | mié Cóndor grupos 6 | F11 | Termina la fase de grupos |
| 17–20 | may | — | F12 a F15 | |
| 21 | | mar Copa Nacional octavos | F16 | |
| 22–23 | jun | — | F17, F18 | |
| 24 | | — | F19 (fin de la primera rueda) | Noticia "puntero en el receso" |
| 25 | jun | — | — | Receso. **Abre la ventana de invierno** (lun) |
| 26 | jul | lun: **sorteo de octavos de la Cóndor** | — | |
| 27 | | — | (V1: gira de invierno) | |
| 28 | | — | — | **Cierra la ventana de invierno** (dom) |
| 29 | jul | — | F20 | V1: abre la ventana **solo de ventas al exterior** |
| 30 | | mié Cóndor octavos ida | F21 | |
| 31 | ago | mié Cóndor octavos vuelta | F22 | |
| 32 | | — | F23 | |
| 33 | | mar Copa Nacional cuartos | F24 | |
| 34 | | mié Cóndor cuartos ida | F25 | |
| 35 | | mié Cóndor cuartos vuelta | F26 | V1: cierra la ventana al exterior (dom) |
| 36–37 | sep | — | F27, F28 | |
| 38 | | mar **Copa Nacional semis** (neutral) | **F29 · fecha de clásicos** | |
| 39 | oct | mié Cóndor semis ida | F30 | |
| 40 | | mié Cóndor semis vuelta | F31 | |
| 41 | | mié: reprogramados | sáb **Final de la Cóndor** (neutral) | Sin liga |
| 42–45 | nov | — | F32 a F35 | |
| 46 | | mié **Final de la Copa Nacional** (neutral) | F36 | |
| 47 | | — | F37 | |
| 48 | dic | — | **F38**: todos el domingo a la misma hora | Fin de la liga |
| 49 | | mié **desempates** (si hacen falta) | — | |
| 50 | | mié **repechaje ida** | dom **repechaje vuelta** | |
| 51 | | — | — | Gala de premios (V1), balances |
| 52 | | — | — | dom: **cierre de temporada** (`alCerrarTemporada`) |

Cuentas: primera rueda en las semanas 5–24 menos la 15 (19 fechas); segunda en las 29–48 menos la 41 (19 fechas). Un club de la B que no llega a nada juega 38 + 1 = **39 partidos**; uno que llega a todo, hasta **60** (38 + 6 + 13 + desempate + repechaje).

### 2.1 Días de liga

El reglamento reparte los 10 partidos de cada fecha: viernes 1, sábado 4, domingo 4, lunes 1. Reglas, en orden:
1. Los clásicos van el domingo.
2. Quien jugó copa esa semana no juega el viernes.
3. El club del usuario juega sábado o domingo (el lunes solo llega por movida, §14).
4. El resto, por sorteo con `rng`.

### 2.2 Plantilla en datos

```json
// calendario.json (extracto)
{ "semanas": {
  "4":  [{ "dia": "lun", "tipo": "sorteo", "competicion": "copa_nacional", "hito": true },
         { "dia": "lun", "tipo": "sorteo", "competicion": "copa_condor", "fase": "grupos", "hito": true },
         { "dia": "dom", "tipo": "ventana_cierra", "ventana": "verano", "hito": true }],
  "7":  [{ "dia": "mar", "tipo": "copa", "competicion": "copa_nacional", "ronda": 1 },
         { "dia": "finde", "tipo": "fecha_liga", "fecha": 3 }],
  "15": [{ "dia": "mie", "tipo": "reprogramados" }, { "tipo": "libre" }]
} }
```

`calendario.ts` toma la plantilla y la temporada y produce `EventoCalendario[]` ordenados por instante. Cambiar el año (por ejemplo, mover el receso) es editar el JSON.

---

## 3. Fixture (LIG-3)

1. **Plantilla de Berger** para 20 posiciones: 19 rondas, en la ronda `r` se enfrentan las posiciones `i` y `19 − i` y luego rotan todas menos la última. Localía con el patrón estándar de Berger, que alterna y deja el mínimo de "dobles" (n − 2 en la rueda).
2. **Clásicos en la fecha 10:** se miran los 10 cruces de posiciones de la ronda 10 de la plantilla y se asignan a ellos los pares de clásico de la división (sorteados). El resto de los clubes van a las posiciones libres por sorteo. Así los clásicos caen juntos sin romper la alternancia.
3. **Vuelta = espejo:** la fecha `f + 19` repite la `f` con la localía invertida.
4. **Validación:** ningún club con 3 seguidos de local o de visitante, incluido el paso de la fecha 19 a la 20. Si falla (no debería con Berger), se vuelve a sortear la asignación de posiciones con el siguiente valor del `rng` (como mucho 20 intentos y después error explícito).
5. **Días** según §2.1.

---

## 4. Tabla y desempates (LIG-4)

- La tabla se **actualiza de forma incremental** con cada resultado y se guarda (`FilaTabla[]`) para no recalcular 760 partidos. Un test la recalcula de cero y compara.
- Orden: Pts → DG → GF → puntos entre los empatados → DG entre ellos → fair play (amarilla 1, roja 3, menos es mejor) → sorteo (`rng` del módulo, derivado con la etiqueta `desempate:<temporada>:<competicion>`, para que sea estable).
- **Partido desempate** (semana 49, neutral, penales si empatan) solo para puestos que definen **campeón de Primera, ascenso directo (1.º de la B) y descenso directo (20.º de Primera)**. El resto de los puestos (repechaje, cupos a la Cóndor) se definen con los criterios. Si el desempate del 1.º de la B se juega, el perdedor queda 2.º y va al repechaje de la semana 50.
- **Quitas de puntos** se guardan como `Sancion` y se restan al ordenar.
- **Matemáticas:** después de cada fecha, para cada puesto clave, se compara contra el máximo alcanzable de los perseguidores (`pts + 3 × fechas restantes`). Si está asegurado, noticia ("¡{club} es campeón!", "{club} ya juega el repechaje", "{club} se fue a la B").

---

## 5. Fin de temporada (LIG-5)

| Momento | Qué hace la liga |
|---------|------------------|
| F38 (dom sem 48) | Tablas cerradas. Campeón de Primera, 1.º de la B (asciende), 2.º de la B y 19.º de Primera (repechaje), 20.º (desciende). Clasificados a la Cóndor. Hitos y noticias |
| Sem 49 | Desempates, si hacen falta |
| Sem 50 | Repechaje: ida en la cancha del de la B, vuelta en la del de Primera. Global empatado → penales (sin gol de visitante ni alargue) |
| Sem 51 | Resumen de la temporada, premios individuales (V1) |
| `alCerrarTemporada` | Mueve clubes de división, guarda `TemporadaCerrada` en el historial, recalcula salud y expectativas, elecciones (V1), elige los 24 del Federal y los extranjeros, genera calendario y fixtures nuevos |

- **La B no tiene descenso** en el MVP (ver P1). Los clubes de abajo de la B pelean "por la dignidad": el humor y la presión siguen funcionando.
- **El club que sale de la B por el usuario:** al iniciar, el club del usuario ocupa el lugar de un club **chico de la B sin clásico** (`reemplazable: true` en datos: Pozo Seco o Palmar Grande, por sorteo). El desplazado pasa al pool del Federal con su identidad y juega la Copa Nacional como liviano.

---

## 6. Copa Nacional (LIG-6)

Nombre oficial "Copa Nacional", con sponsor del título que cambia por temporada (ej. "Copa Nacional Billetera Mango"; lo provee `datos/club/sponsors` si existe, si no, `copa_nacional.json`).

| Aspecto | Regla |
|---------|-------|
| Equipos | 64: 20 de Primera, 20 de la B, 24 del Federal |
| Sorteo (sem 4) | Bombo A: 20 de Primera + los 12 mejores de la B de la temporada anterior. Bombo B: los 8 restantes de la B + los 24 del Federal. 32avos = A contra B. Después, **cuadro fijo** sorteado (así se sabe desde el principio contra quién te podés cruzar) |
| Partidos | Único. Empate → penales (sin alargue) |
| Localía | 32avos a cuartos: el de **menor categoría** (Federal < B < Primera); si son de la misma, sorteo. Semis y final: neutral |
| Rondas | 32avos (sem 7), 16avos (13), octavos (21), cuartos (33), semis (38), final (46) |
| Premio deportivo | Cupo a la Cóndor de la temporada siguiente (aunque sea de la B o haya descendido) |
| Sede neutral | El estadio de mayor capacidad que no sea de ninguno de los dos (V1: el estadio del usuario si es categoría ≥ 4, evento especial de CLU-2.5) |

El atractivo: que tu canchita de la B reciba a un grande un martes a la noche (recaudación, Aguante, movidas) y el "papelón" del grande eliminado por uno del Federal.

---

## 7. Copa Cóndor (LIG-7, V1)

Copa continental ficticia, "la Cóndor". Los premios y la TV se cobran en **Áureos (AU)**, la única moneda del juego (nombre provisional), igual que todo lo demás; los montos los define `economia`.

| Aspecto | Regla |
|---------|-------|
| Equipos | 32. Del país: 1.º a 4.º de Primera + campeón de la Copa Nacional (si repite, el 5.º) + campeón vigente de la Cóndor si es del país y no entró por otra vía (5 o 6). El resto, extranjeros del pool |
| Extranjeros | Pool de ~40 clubes livianos de 9 países del continente. Cada temporada entran los de mayor **prestigio** más un poco de azar. El prestigio sube y baja con lo que hacen en la Cóndor |
| Sorteo de grupos (sem 4) | 4 bombos de 8 por coeficiente (últimas 3 Cóndor; los del país por su puesto). Sin dos del mismo país por grupo (backtracking con `rng`) |
| Grupos | 8 de 4, ida y vuelta, 6 fechas (sem 6, 8, 10, 12, 14, 16). Pasan 1.º y 2.º. Desempate como §4 sin partido extra |
| Octavos (sorteo sem 26) | 1.º contra 2.º de otro grupo; la vuelta en la cancha del 1.º. Después, cuadro fijo; en cuartos y semis la vuelta es para el de mejor campaña |
| Ida y vuelta | Global empatado → penales (sin gol de visitante) |
| Final | Única, sábado de la sem 41, sede neutral. Empate → penales |

Para el usuario la Cóndor llega, como muy pronto, en la temporada 2 (por la Copa Nacional). Mientras no esté programada (MVP), la liga calcula y anuncia los clasificados igual.

---

## 8. Personalidad de los clubes (LIG-10)

### 8.1 Modelo

```ts
type Arquetipo = 'vendedor_de_pibes' | 'gastador' | 'ordenado' | 'caotico' | 'presidente_loco'
interface Personalidad {
  arquetipo: Arquetipo
  ambicion: number; paciencia: number; cantera: number      // 0–100
  derroche: number; orden: number; volatilidad: number      // 0–100
}
```

Valores por defecto (`arquetipos.json`); cada club los puede pisar en `clubes.json`:

| Arquetipo | Ambición | Paciencia | Cantera | Derroche | Orden | Volatilidad | En una línea |
|-----------|---------:|----------:|--------:|---------:|------:|------------:|--------------|
| Vendedor de pibes | 40 | 60 | 90 | 20 | 70 | 40 | Vende al mejor pibe cada ventana y vive de eso |
| Gastador | 90 | 30 | 30 | 85 | 30 | 50 | Compra todo lo que brilla; un día la cuenta llega |
| Ordenado | 55 | 85 | 60 | 20 | 90 | 20 | Paga al día, aguanta al DT, no enamora a nadie |
| Caótico | 50 | 25 | 45 | 60 | 15 | 85 | Nadie sabe quién manda; puede salir campeón o descender |
| Presidente loco | 75 | 10 | 40 | 70 | 35 | 95 | Echa al DT en el entretiempo y promete a una estrella retirada |

### 8.2 Cómo influye

| Sobre | Mecanismo | Con qué parámetros |
|-------|-----------|--------------------|
| **Resultados** | La **forma** del equipo (−10 a +10) entra al modo rápido como multiplicador de la fuerza: `× (1 + forma × 0,006)` → tope **±6 %**. El plantel manda | volatilidad (ruido de la forma) |
| **Localía** | Bonus por rasgos del club, sumado al del motor, con tope +5 %: altura +4 %, frío extremo +2 %, hinchada pesada +2 %, cancha chica +1 % | rasgos |
| **DT** | **Presión** acumulada vs. **umbral de despido** `30 + paciencia × 0,7`. El presidente loco tiene además una chance de echarlo en caliente después de cada derrota (`volatilidad / 400`) | paciencia, volatilidad |
| **Mercado** | `PoliticaMercado` (§8.4) que `mercado` lee para los fichajes de los rivales | ambición, derroche, cantera, orden |
| **Finanzas** | **Salud** (0–100) que sube con orden y baja con derroche; en crisis hay sueldos atrasados, ventas forzadas y, rara vez, quita de puntos | orden, derroche |
| **Noticias** | Cada arquetipo tiene sus plantillas propias (§12) | arquetipo |
| **Movidas** | `movidas` puede leer el arquetipo del próximo rival ("el presidente de {rival} te tira un palo en la radio") | arquetipo |

### 8.3 Dinámica (valores en `balance.json`)

- **Forma** después de cada partido oficial: `forma = 0,75 × forma + Δ + ruido`, con Δ = +2 si gana, 0 si empata, −2 si pierde, y ruido normal con σ = `0,5 + volatilidad / 40`. **DT nuevo:** +3 por única vez ("efecto DT nuevo"). **Crisis:** −2 por semana mientras dure.
- **Expectativa** (semana 4): ranking por valoración del plantel (`mercado`) → puesto esperado → puntos por partido esperados (tabla en datos: 1.º ≈ 2,1; 10.º ≈ 1,35; 20.º ≈ 0,85) y un objetivo con nombre (`titulo`, `copas`, `mitad`, `salvarse`, `ascenso`, `repechaje`).
- **Presión:** después de cada partido oficial, `+= (esperados − obtenidos) × 10` (con piso 0); clásico perdido +10; eliminado en copa por uno de menor categoría +15; −10 % por semana. Al llegar al 80 % del umbral sale la noticia **"el presidente lo ratificó"** (el beso de la muerte). Al pasarlo, señal `echar_dt`. Como mucho un despido por club por rueda, salvo el presidente loco.
- **Humor** (0–100, de la gente): se mueve con los resultados contra la expectativa y vuelve despacio a 50. Lo usan las noticias y las elecciones.
- **Salud financiera:** se recalcula al cerrar la temporada con `+(orden − 50)/5 − (derroche − 50)/5` más resultados (ascenso +10, título +10, Cóndor +5, descenso −20) y algo de azar. Menos de 20 = **crisis**; menos de 5 = **concurso**: quita automática de 6 puntos y cadena de noticias. En crisis, cada temporada hay un 3 % de chance de quita de 3 puntos por deudas con la AFA.
- **Elecciones (V1):** cada 3 temporadas (escalonadas por club). La chance de cambiar de presidente es `(100 − humor) %`. El nuevo sale de `presidentes.json` con un arquetipo sorteado con peso contrario al anterior (después de un loco suele venir un ordenado).

### 8.4 Política de mercado (la lee `mercado`)

```ts
interface PoliticaMercado {
  presupuestoPases: number          // en AU, por ventana
  propensionVender: number          // 0–1: qué tan fácil acepta una oferta
  edadPreferida: [number, number]
  usaJuveniles: number              // 0–1: cuánto sube pibes de inferiores
  preferenciaExterior: number       // 0–1: cuánto compra afuera
  urgencia: 'ninguna' | 'reforzar' | 'vender'
}
```

- `ingresosEstimados` = base de ingresos de la división (de `economia/base.json`, en AU; hoy la referencia es B 1.200M y Primera 6.000M, a recalibrar con la moneda nueva) × factor de tamaño (grande 1,8; grande caído en la B 1,6; mediano 1,0; chico 0,6). La relación entre el más rico y el más pobre de Primera queda en 3× (el objetivo de economía es ≤ 6×).
- `presupuestoPases = ingresosEstimados × (0,10 + ambicion/500 + derroche/400 si salud > 30) × clamp(salud/60, 0,3, 1,3)`.
- `propensionVender = 0,2 + cantera/250 + (1 − salud/100) × 0,3` (gastador −0,1).
- Edad preferida: vendedor 17–23, gastador 27–33, ordenado 22–29, caótico 19–34, presidente loco cambia cada ventana.
- La política se recalcula al abrir cada ventana; las urgencias aparecen como señales (§10).

---

## 9. Simulación de los partidos ajenos (LIG-11)

La liga **no** tiene motor propio: llama a una función pura que exporta el módulo `partido` (pedido P1). Usa su propio flujo de `rng` derivado por partido (`sim:<idPartido>`), así agregar una noticia nueva no cambia ningún resultado.

```ts
// la exporta partido (src/modulos/partido/rapido.ts); la liga solo la llama
interface EquipoRapido {
  club: IdClub
  alineacion?: { jugador: IdJugador; puesto: 'ARQ'|'DEF'|'MED'|'DEL' }[]   // clubes con plantel (de mercado)
  perfil?: PerfilFuerza                                                   // clubes livianos
  forma: number          // −10..10, de la liga
  localia: number        // 0..0,05, bonus por rasgos (el motor suma su ventaja base)
  dt?: IdDT
}
interface PerfilFuerza { arquero: number; defensa: number; medio: number; ataque: number }   // 0–100
interface EntradaRapida {
  partido: IdPartido; local: EquipoRapido; visitante: EquipoRapido
  neutral: boolean; definePorPenales: boolean
}
interface ResultadoRapido {
  goles: [number, number]; penales?: [number, number]
  eventos: { tipo: 'gol'|'amarilla'|'roja'|'lesion'; club: IdClub; jugador?: IdJugador; minuto: number }[]
  figura?: IdJugador
  probabilidades: { local: number; empate: number; visitante: number }   // antes de jugar, para detectar batacazos
}
simularRapido(entrada: EntradaRapida, rng: Rng): ResultadoRapido
```

- **Cuándo:** en `alAvanzarDia`, todos los partidos de ese día salvo el del usuario. El del usuario lo juega `partido` en la fase de partido y la liga lo registra en `despuesDelPartido`.
- **Alineación de los rivales:** `mercado.alineacionAutomatica(club)` (pedido M2).
- **Ida y vuelta:** en la vuelta, `definePorPenales` = el global está empatado; la liga calcula el global.
- **Presupuesto:** ~950 partidos por temporada (760 de liga + 63 Copa Nacional + 125 Cóndor + desempates y repechaje). Para entrar en NUC-7.2 el modo rápido tiene que andar en **≤ 2 ms** por partido.
- **Andamio provisorio:** hasta que `partido` entregue el modo rápido, `simulacion.ts` tiene un simulador de prueba (Poisson con goles esperados según la fuerza media) **solo** para los tests y la temporada sin pantalla. Se borra cuando llega el de verdad.

---

## 10. Liga viva (LIG-12)

| Fenómeno | Cómo se detecta | Qué produce |
|----------|-----------------|-------------|
| Rachas | Invicto ≥ 6, sin ganar ≥ 5, sin convertir ≥ 3, victorias seguidas ≥ 4 | Noticia (umbrales en `balance.json`) |
| Batacazo | El ganador tenía < 22 % de probabilidad previa | Noticia y +humor del ganador; +presión del perdedor |
| Goleada | Diferencia ≥ 4 | Noticia |
| Papelón de copa | Eliminado por uno de menor categoría | Noticia de importancia 2, +15 de presión |
| Crisis | Salud < 20 o humor < 20 | Noticias, forma −2 por semana, señal `vender` |
| DT en la cuerda floja | Presión ≥ 80 % del umbral | Noticia "lo ratificó" |
| DT echado | Presión > umbral o el arranque del presidente loco | Señal `echar_dt` → `mercado` lo ejecuta y escribe la noticia del reemplazo |
| Locuras del presidente loco | 1 por rueda por club loco, sorteada | Noticia y efecto chico en la forma (±1) o en la política (urgencia `reforzar`) |
| Puntero, colista, matemáticas | §4 | Noticias |

### 10.1 Señales a `mercado`

La liga no toca jugadores ni DTs: deja **señales** en su porción. Como el orden diario es `liga → mercado`, mercado las ve el mismo día.

```ts
type Senal = { id: string; cuando: Instante; club: IdClub } & (
  | { tipo: 'echar_dt'; motivo: 'resultados' | 'arrebato' | 'clasico' | 'papelon' }
  | { tipo: 'reforzar'; puestos?: ('ARQ'|'DEF'|'MED'|'DEL')[] }
  | { tipo: 'vender'; motivo: 'crisis' | 'politica' }
  | { tipo: 'nuevo_presidente' }
)
```

Mercado marca la señal como atendida en **su** porción (por `id`); la liga borra las señales de más de 7 días.

---

## 11. Tipos de la porción `liga`

### 11.1 Identificadores

```ts
type IdClub = string                       // 'puerto_ceibo', 'usuario'
type IdCompeticion = 'b_nacional' | 'primera' | 'copa_nacional' | 'copa_condor' | 'repechaje' | 'desempate'
type IdPartido = string                    // `${temporada}:${competicion}:${ronda}:${n}`, ej. '2026:b_nacional:12:3'
type IdLlave = string                      // `${temporada}:${competicion}:${fase}:${n}`
type Division = 'primera' | 'b_nacional' | 'federal'
```

### 11.2 Estado

```ts
interface EstadoLiga {
  temporada: number
  calendario: EventoCalendario[]                       // ordenado por instante
  divisiones: { primera: IdClub[]; b_nacional: IdClub[] }
  competiciones: {
    b_nacional: CompeticionLiga; primera: CompeticionLiga
    copa_nacional: CompeticionCopa; copa_condor?: CompeticionCopa   // la Cóndor desde V1
    repechaje?: CompeticionCopa; desempate?: CompeticionCopa
  }
  partidos: Record<IdPartido, PartidoLiga>
  clubes: Record<IdClub, EstadoClubLiga>              // los 40 (incluido el usuario); identidad fija en datos
  livianos: Record<IdClub, ClubLiviano>               // Federal y extranjeros activos esta temporada
  senales: Senal[]
  hitos: Hito[]                                       // de la temporada en curso (§11.3)
  buzonAplicado: string[]                             // claves del buzón ya aplicadas (§14)
  noticiasRecientes: { plantilla: string; club: IdClub; cuando: Instante }[]   // anti-repetición
  historial: TemporadaCerrada[]                       // V1 completo; MVP: campeones y tablas finales
}

interface EventoCalendario {
  cuando: Instante
  tipo: 'fecha_liga' | 'copa' | 'sorteo' | 'ventana_abre' | 'ventana_cierra' | 'reprogramados'
      | 'libre' | 'desempate' | 'repechaje' | 'cierre'
  competicion?: IdCompeticion; ronda?: number
  ventana?: 'verano' | 'invierno' | 'exterior'
  etiqueta: string                                    // 'Fecha 12', 'Copa Nacional · octavos'
  hito: boolean                                       // frena el avance rápido (NUC-2.5)
}

interface PartidoLiga {
  id: IdPartido; competicion: IdCompeticion; ronda: number; etiqueta: string
  cuando: Instante
  local: IdClub; visitante: IdClub
  neutral: boolean; sede?: string
  llave?: IdLlave; vuelta?: boolean
  clasico: boolean
  estado: 'programado' | 'jugado' | 'postergado'
  resultado?: {
    goles: [number, number]; penales?: [number, number]
    goleadores: { club: IdClub; jugador: IdJugador; minuto: number }[]
    tarjetas: { amarillas: [number, number]; rojas: [number, number] }
    figura?: IdJugador
    probLocal?: number; probVisitante?: number        // para batacazos
  }
}

interface CompeticionLiga {
  tipo: 'liga'; id: 'b_nacional' | 'primera'; nombre: string
  equipos: IdClub[]
  fechas: IdPartido[][]                               // 38 × 10
  tabla: FilaTabla[]
  sanciones: Sancion[]
}
interface FilaTabla {
  club: IdClub; pts: number; pj: number; g: number; e: number; p: number
  gf: number; gc: number; dg: number; fairPlay: number; ultimos: ('G'|'E'|'P')[]
}
interface Sancion { club: IdClub; puntos: number; motivo: string; cuando: Instante }

interface CompeticionCopa {
  tipo: 'copa'; id: IdCompeticion; nombre: string
  fases: { id: string; nombre: string; formato: 'grupos'|'unico'|'ida_vuelta'; llaves: IdLlave[] }[]
  grupos?: { id: string; equipos: IdClub[]; partidos: IdPartido[]; tabla: FilaTabla[] }[]
  llaves: Record<IdLlave, Llave>
  campeon?: IdClub
}
interface Llave {
  id: IdLlave; a?: IdClub; b?: IdClub                 // vacíos hasta que se definan
  partidos: IdPartido[]; ganador?: IdClub
  alimentaA?: IdLlave                                 // cuadro fijo
}

interface EstadoClubLiga {
  id: IdClub; esUsuario: boolean; division: Division
  personalidad: Personalidad                          // la actual (cambia con elecciones)
  presidente: { nombre: string; apodo?: string; rasgo: string; desde: number }
  clasico?: IdClub
  forma: number; humor: number; presion: number; salud: number
  expectativa: { puestoEsperado: number; ptsPorPartido: number; objetivo: string }
  racha: { invicto: number; sinGanar: number; sinConvertir: number; ganados: number }
  politica: PoliticaMercado
  enCrisis: boolean
  ingresosEstimados: number
  proximasElecciones: number                          // temporada
}

interface ClubLiviano {
  id: IdClub; nombre: string; apodo: string; pais?: string; ciudad: string
  colores: [string, string]; capacidad: number
  perfil: PerfilFuerza; prestigio: number            // prestigio: solo extranjeros
}

interface TemporadaCerrada {
  temporada: number
  tablas: { primera: FilaTabla[]; b_nacional: FilaTabla[] }
  campeones: Partial<Record<IdCompeticion, IdClub>>
  ascensos: IdClub[]; descensos: IdClub[]; repechaje: { ganador: IdClub; perdedor: IdClub }
  goleadores?: { jugador: IdJugador; club: IdClub; goles: number }[]   // V1
  dtsEchados: number
}
```

### 11.3 Hitos (para `economia`, `movidas` y la UI)

Solo del club del usuario. La liga **no** paga premios ni da fama: deja el hito y `economia` lo convierte (pedido E1). Así la plata vive en un solo lugar.

```ts
type Hito = { id: string; cuando: Instante; competicion: IdCompeticion } & (
  | { tipo: 'partido'; partido: IdPartido; local: boolean; resultado: 'G'|'E'|'P'; clasico: boolean }
  | { tipo: 'ronda_superada' | 'eliminado'; fase: string; porMenorCategoria?: boolean }
  | { tipo: 'campeon' | 'clasificado_condor' }
  | { tipo: 'ascenso' | 'descenso' | 'repechaje_ganado' | 'repechaje_perdido' }
  | { tipo: 'asegurado'; que: 'titulo'|'ascenso'|'repechaje'|'descenso' }
)
```

### 11.4 Selectores (funciones puras en `selectores.ts`)

`tabla(liga, comp)`, `fixtureDeFecha(liga, comp, fecha)`, `partidosDelDia(liga, instante)`, `proximoPartido(liga, club, desde)`, `proximoRival(liga, club, desde)`, `proximoHito(liga, desde)`, `posicion(liga, club)`, `zona(liga, club)` → `'titulo'|'copas'|'media'|'repechaje'|'descenso'|'ascenso'`, `racha(liga, club)`, `esClasico(liga, partido)`, `ventanaAbierta(liga, hoy)` → `'completa'|'solo_ventas_exterior'|null`, `cuadro(liga, copa)`, `identidad(clubId)` (datos + la del usuario desde la porción `club`).

---

## 12. Noticias (LIG-13)

- Plantillas en `noticias.json` agrupadas por clave, con variantes, condiciones (arquetipo, tamaño, importancia) y variables `{club}`, `{apodo}`, `{rival}`, `{dt}`, `{presidente}`, `{estadio}`, `{ciudad}`, `{n}`, `{goles}`.
- El texto se sortea con el `rng` derivado `noticias:<fecha>`, sin repetir la misma plantilla para el mismo club en 8 semanas.
- Importancia: 3 = tu club, títulos, ascensos, descensos; 2 = tu división, tu clásico, DTs echados, batacazos de copa; 1 = el resto. **Tope:** 4 noticias de liga por día de importancia 1–2 (las de 3 siempre salen); las de importancia 1 de otras fechas se resumen en una ("Así terminó la fecha 12 de Primera").
- Lo deportivo e institucional lo escribe la liga; los pases y las contrataciones, `mercado`.

Ejemplos (el banco completo es una tarea):

| Clave | Ejemplo |
|-------|---------|
| `racha.sin_ganar` | "{club} lleva {n} partidos sin ganar y en {ciudad} ya prenden velas." |
| `dt.ratificado` | "{presidente}: «{dt} tiene todo nuestro respaldo». Los utileros ya le están armando las valijas." |
| `batacazo.copa` | "¡Papelón! {rival}, del Federal, eliminó a {club}. En el pueblo cortaron la ruta para festejar." |
| `loco.promesa` (presidente loco) | "{presidente} prometió que {club} va a jugar la Cóndor «aunque tenga que comprar la Cóndor»." |
| `loco.escudo` | "{club} presentó su tercer escudo del año. Los hinchas piden volver al segundo." |
| `vendedor.cantera` | "En {club} ya hay cola de ojeadores europeos para ver a la Sub-15." |
| `ordenado.balance` | "{club} aprobó el balance por unanimidad por trigésima vez. Nadie fue a la asamblea." |
| `gastador.deuda` | "Los jugadores de {club} no cobran hace dos meses y entrenan con un cartel: «Queremos cobrar»." |
| `caotico.presidencia` | "No está claro quién preside {club}: hay dos comisiones directivas y una sola llave del vestuario." |
| `clasico.previa` | "Se viene {club}–{rival}: en {ciudad} no se habla de otra cosa." |
| `matematica.descenso` | "{club} se fue a la B. En {estadio} la gente se quedó cantando una hora después del final." |
| `ascenso` | "¡{club} es de Primera! Caravana por toda {ciudad}." |

---

## 13. Balance (LIG-17)

Se corren 200 temporadas sin pantalla (NUC-7) y se mide:

| Métrica | Objetivo | Quién la mueve |
|---------|----------|----------------|
| Campeones distintos de Primera en 20 temporadas | ≥ 8 | mercado (paridad) + liga (forma) |
| Títulos del club más ganador en 50 temporadas | ≤ 25 % | idem |
| Puntos del campeón (38 fechas) | mediana 72–84 | partido |
| Puntos del último | mediana 25–35 | partido |
| Empates | 25–32 % (fútbol argentino: muchos empates) | partido |
| Goles por partido | 2,1–2,6 | partido |
| Victorias del local | 42–48 % | partido + localía de la liga |
| Ascendido directo que se salva el año siguiente | ≥ 40 % | mercado |
| Repechaje ganado por el de la B | 30–45 % | mercado + partido |
| DTs echados por temporada (por división) | 5–10 | liga (umbral de presión) |
| Clubes en crisis por temporada | 2–5 de 40 | liga (salud) |
| Tiempo de la liga en una temporada | ≤ 3 s | liga + partido |

Si una métrica se va de rango, se tocan los JSON. Las de goles, empates y localía se calibran en el modo rápido del partido, no en la liga.

---

## 14. Movidas sobre la competencia (LIG-15, V1)

El `Efecto` del núcleo no tiene un tipo para tocar la liga. Mientras no exista (pedido N3), las movidas escriben **marcas con prefijo `liga.`**, que la liga lee cada día y aplica **una sola vez** (guarda la clave en `buzonAplicado`):

| Marca | Valor | Qué hace la liga |
|-------|-------|------------------|
| `liga.postergar:<IdPartido>` | `true` | Lo pasa al próximo miércoles de reprogramados o miércoles libre para ambos |
| `liga.dia:<IdPartido>` | `'lun'` (u otro día) | Cambia el día (el lunes a las 13) |
| `liga.sede:<IdPartido>` | `'neutral'` o `IdClub` | Cambia la sede (cancha inundada, clausura) |
| `liga.quita:<IdClub>:<motivo>` | número de puntos | Agrega una `Sancion` |

---

## 15. Pedidos a otros módulos

No escribí en las carpetas de otros; el coordinador los pasa a cada `pedidos.md`.

**Núcleo (`specs/nucleo/pedidos.md`)**
- **N1 (bloqueante, afecta a todos los módulos):** los hooks devuelven `Salida` sin la porción propia, así que ningún módulo puede guardar nada fuera de `reducir` (acciones del jugador). Propuesta: `Salida<P> { porcion?: P; efectos?; noticias?; interrupcion? }`, y el núcleo reemplaza la porción si viene. Alternativa: `acciones?: Accion[]` propias que el núcleo pasa por `reducir`.
- **N2:** que el `Rng` permita **derivar** subflujos por etiqueta (`rng.derivar('sim:2026:primera:12:3')`). Sin eso, agregar una plantilla de noticia cambia todos los resultados que siguen y los tests de balance se vuelven inestables.
- **N3:** un efecto genérico `{ tipo: 'accion'; modulo: IdModulo; accion: Accion }` para que las movidas toquen otras porciones por su `reducir`. Mientras tanto, el buzón de marcas de §14.
- **N4:** que el núcleo use `selectores.proximoPartido` para `tiempo.proximoPartido` y `selectores.proximoHito` para el avance rápido; y que `IdPartido` sea el de la liga.
- **N5:** confirmar que `alCerrarTemporada` corre el domingo de la semana 52, antes del lunes de la semana 1 siguiente, y cómo se trata un año de 53 semanas en la fecha visible (propuesta: la liga usa siempre 52).

**Partido**
- **P1:** exportar `simularRapido(entrada, rng)` (§9), puro, ≤ 2 ms, aceptando plantel **o** perfil de fuerza, `forma`, `localia`, `neutral` y `definePorPenales`, y devolviendo probabilidades previas.
- **P2:** que el `Resultado` del partido del usuario incluya `IdPartido`, goles, penales, goleadores, tarjetas y figura en el formato de §11.2.
- **P3:** calibrar el modo rápido con las métricas de §13 (empates, goles, localía). Recomiendo que sea estadístico (goles esperados con la misma fórmula de fuerza del motor), no minuto a minuto, para entrar en tiempo.
- **P4 (V1):** "resultados de otras canchas" durante tu partido, leyendo `partidosDelDia`.

**Mercado**
- **M1:** generar los planteles de los 39 rivales según `nivelObjetivo` (§16) y un perfil derivado de la personalidad (edad media, juveniles, extranjeros).
- **M2:** exportar `alineacionAutomatica(club)` y `valoracionPlantel(club)` (puras).
- **M3:** leer `politica` y `senales` de cada club, ejecutar los fichajes, ventas y despidos de los rivales, marcar las señales atendidas y escribir las noticias de pases y DTs. Los DTs de los rivales viven en `mercado`.
- **M4:** respetar `ventanaAbierta` (incluida la ventana solo de ventas al exterior, V1).
- **M5:** decidir qué pasa con el plantel del club de la B que desplaza el usuario (propuesta: se disuelve en el mercado de libres).

**Economía**
- **E1:** convertir los **hitos** (§11.3) en premios y fama, usando `premios.json`: victoria, ronda superada de cada copa, campeón, ascenso, paracaídas por descenso. La liga no emite efectos de dinero ni de `fama`. Ojo: el `Efecto` del núcleo todavía se llama `pesos`; con la moneda única (Áureo) hay que renombrarlo.
- **E2:** TV por fecha jugada (`competiciones.*.fechas`) y TV de copas, todo en AU. La liga no depende de inflación ni de tipo de cambio.
- **E3:** factor de demanda para "visita de un grande" en la Copa Nacional (el chico es local), y regla de recaudación en sede neutral.
- **E4:** validar los factores de `ingresosEstimados` de los rivales (§8.4) contra el objetivo ≤ 6×.

**Movidas**
- **V1:** usar los selectores (`zona`, `racha`, `proximoRival`, `esClasico`, arquetipo del rival) como condiciones y como variables (`{rival}`).
- **V2:** movidas de AFA y ciudad que usen el buzón de §14 (lunes a las 13, inundación, quita de puntos).
- **V3:** movidas para los hitos grandes: sorteo de copa ("te tocó el grande"), previa de clásico, repechaje, papelón, ascenso.

**Club**
- **C1:** exponer el `entorno` y la identidad del club del usuario (para asignarle clásico y para las tablas).
- **C2 (V1):** capacidad, categoría y Lujo del estadio del usuario, para elegirlo sede de finales (CLU-2.5).
- **C3 (V1):** poder dibujar el estadio de un rival con su `categoria`, `estilo`, `entorno` y colores (previa de visitante).

---

## 16. Los 40 clubes

Tamaño: G grande, G* grande caído (en la B), M mediano, C chico. **Nivel** = valoración objetivo del plantel (0–100) que `mercado` usa para generarlo. Entornos de CLU-13; estilos de CLU-2. `clubes.json` lleva además los colores en hex, rasgos y el presidente completo.

### 16.1 Primera División

| # | Club | Apodo | Colores · patrón | Ciudad · entorno | Estadio · estilo · cat. | Tam. | Arquetipo · presidente | Nivel | Clásico |
|---|------|-------|------------------|------------------|-------------------------|------|------------------------|------:|---------|
| 1 | Club Atlético Puerto Ceibo | los Estibadores | azul marino `#1B2A4A` y oro `#D4A017` · bastones | Puerto Ceibo, gran puerto del litoral · costa | Muelle Uno, "la Grúa", 62.000 · Primera arg. · 4 | G | **Gastador** · Rolando "Rolo" Benavídez, naviero: habla de "proyecto" y compra nueves de 33 años | 78 | Unión Obrera (del Puerto) |
| 2 | Unión Obrera de Puerto Ceibo | la Fábrica, los Overoles | bordó `#6D1A2B` y gris `#9AA0A6` · franja | Puerto Ceibo · ciudad | El Galpón, 48.000 · ascenso · 3 | G | **Vendedor de pibes** · Mirta "la Doctora" Achával, abogada laboralista: vende un 9 a Europa cada verano y sale tercera igual | 74 | Puerto Ceibo |
| 3 | Club Social y Deportivo Santa Brígida | las Campanas | amarillo `#F2C230` y negro · banda | Santa Brígida, la Capital · ciudad | El Campanario, 55.000 · europeo · 4 | G | **Ordenado** · Ing. Horacio Lanusse, "el Ingeniero": balance aprobado desde 1994; la gente se queja de que es aburrido | 77 | Barrio Fundición (de la Capital) |
| 4 | Sportivo Barrio Fundición | los Herreros, el Yunque | naranja `#E8701A` y negro · lisa con vivos | Santa Brígida, zona sur · ciudad | La Caldera, 58.000 · Primera arg. · 4 | G | **Presidente loco** · Héctor "Tito" Galarza, rey de las empanaderías: se sienta en el banco y le puso su cara a la platea | 76 | Santa Brígida |
| 5 | Club Atlético Cordillera | los Arrieros | celeste `#6EC1E4` y blanco · lisa | Villa Alta, 2.800 m · montaña | El Mirador, 35.000 · andino · 3 | G | **Caótico** · Don Aniceto Quispe: debe catorce sueldos y sale campeón; nadie entiende cómo | 74 | Altamira (de la Altura) |
| 6 | Deportivo Las Toscas | los Dorados | amarillo y verde `#1E7B3A` · aros | Las Toscas, a orillas del río · costa | La Barranca, 30.000 · Primera arg. · 3 | M | **Vendedor de pibes** · Néstor "el Pescador" Rolón: los pesca chicos y los vende grandes | 68 | Yacaré Porá (del Litoral) |
| 7 | Atlético Villa Carbonilla | los Fogoneros | gris carbón `#3A3A3A` y rojo `#C8102E` · bastones finos | Villa Carbonilla, barrio ferroviario · ciudad | La Rotonda (un ex taller de locomotoras), 26.000 · ascenso · 2 | M | **Caótico** · el interventor de turno: nadie sabe quién preside esta semana | 66 | Puente Viejo (del Oeste) |
| 8 | Club Juventud de Laguna Brava | los Patos | verde `#2E8B3A` y blanco · cuartos | Laguna Brava, pampa húmeda · campo | El Humedal, 22.000 · inglés · 3 | M | **Ordenado** · Elba Mendiondo, de la cooperativa agrícola: compra en cuotas y paga en la cosecha | 68 | Cuatro Molinos (de la Llanura) |
| 9 | Club Atlético Glaciar del Sur | los Pingüinos | blanco y azul hielo `#7FB8E0` · banda | Puerto Glaciar, Patagonia · frío | La Heladera, 24.000 · invierno extremo · 3 | M | **Presidente loco** · Ulises Brandt: quiere techar con una cúpula que vale tres presupuestos; ya pagó la maqueta | 66 | Viento Blanco (del Fin del Mundo) |
| 10 | Deportivo Salinas Grandes | el Salitre | blanco y naranja tierra `#C1652F` · franja | Salinas Grandes, en la puna · desierto | La Salina, 28.000 · desierto · 3 | M | **Gastador** · Fabián "el Litio" Ocampo: compra todo lo que brilla y algunas cosas que no | 69 | Minero de Socavón (del Socavón) |
| 11 | Sportivo Bahía Serena | las Gaviotas | turquesa `#22B5B0` y blanco · franja | Bahía Serena, costa atlántica · costa | El Balneario, 27.000 · tropical · 3 | M | **Gastador** · Gustavo "el Bronceado" Ferrán: lo bancan el casino y una casa de apuestas; en enero llena, en julio no va nadie | 67 | Médanos de Oro (de la Costa) |
| 12 | Club Atlético Empalme Norte | los Cambistas | verde `#0F6B3F` y amarillo `#F5C518` · bastones | Empalme Norte, cruce de vías · campo | El Cruce, 25.000 · ascenso · 3 | M | **Vendedor de pibes** · Raúl "el Tasador" Iturbe: tasa a los pibes de 15 por WhatsApp | 67 | General Arrieta (del Ferrocarril) |
| 13 | Deportivo San Fermín de los Montes | los Toros | rojo `#B22222` y blanco · faja | San Fermín, en las sierras · montaña | El Encierro, 23.000 · inglés · 3 | M | **Ordenado** · Graciela Peralta, ex hockista: turismo serrano y 2.000 chicos en la escuelita | 67 | Cerro Pelado (Serrano) |
| 14 | Defensores de Villa Lumbrera | los Faroleros | verde oscuro `#14532D` y blanco · banda | Villa Lumbrera, conurbano · ciudad | El Farol, 18.000 · ascenso · 2 | C | **Ordenado** · Don Amadeo Ferraro, almacenero, 30 años presidente: subió con presupuesto de la B y paga al día | 62 | Palomar (de la Vía) |
| 15 | Club Atlético Cuatro Molinos | los Molineros | azul francia `#2F5BD3` y blanco · bastones | Cuatro Molinos, pueblo de 30.000 · campo | Las Aspas, 16.000 · ascenso · 2 | C | **Vendedor de pibes** · Silvio Gauna: pueblo chico, dos jugadores en la Selección | 61 | Laguna Brava |
| 16 | Deportivo Yacaré Porá | los Yacarés | verde `#2D7D32` y naranja `#F28C28` · lisa con mangas | Yacaré Porá, litoral norte, 42 °C · Caribe | El Estero, 21.000 · tropical · 2 | C | **Caótico** · "Pocho" Benítez, que también corta el pasto: juegan a las 21:30 por el calor, si hay luz | 61 | Las Toscas |
| 17 | Sportivo Puente Viejo | el Puente | violeta `#5B2C83` y blanco · franja | Puente Viejo, conurbano · ciudad | Bajo el Puente, 19.000 · ascenso · 2 | C | **Presidente loco** · el concejal Walter "el Puntero" Sosa: el club es su búnker de campaña y regala camisetas con su cara | 60 | Villa Carbonilla |
| 18 | Club Atlético Nueva Esperanza SAD | la Empresa, los Tokens | negro y dorado `#C9A227` · lisa | Nueva Esperanza, ciudad nueva de vidrio · ciudad | BilleCoin Arena, 20.000 · futurista · 4 | C | **Gastador** · Thiago Valdivieso, 29 años, CEO de una app de memes: tiene más seguidores en TikTok que socios | 65 | — ("busca clásico; acepta propuestas") |
| 19 | Club Atlético General Arrieta | los Gauchos | blanco y bordó `#7A1F2B` · cuartos | General Arrieta, pueblo ganadero · campo | La Tapera, 15.000 · ascenso · 2 | C | **Ordenado** · Don Ramón Etcheverry, ganadero: no gasta ni la saliva | 60 | Empalme Norte |
| 20 | Deportivo Altamira | las Llamas | rojo ladrillo `#A23B2A` y verde `#3E7B4F` · franja | Altamira, 3.400 m · montaña | La Apacheta, 14.000 · andino · 2 | C | **Caótico** · los hermanos Mamaní, copresidentes que se pelean por radio: de local no pierden nunca, de visitante no ganan nunca | 60 | Cordillera |

Reparto: 5 G, 8 M, 7 C · vendedor 4, gastador 4, ordenado 5, caótico 4, presidente loco 3.

### 16.2 B Nacional

| # | Club | Apodo | Colores · patrón | Ciudad · entorno | Estadio · estilo · cat. | Tam. | Arquetipo · presidente | Nivel | Clásico |
|---|------|-------|------------------|------------------|-------------------------|------|------------------------|------:|---------|
| 1 | Club Atlético Palomar de Santa Brígida | las Palomas | blanco y azul petróleo `#1F4E5F` · bastones | Santa Brígida, barrio Palomar · ciudad | El Palomar, 40.000 · Primera arg. · 3 | G* | **Caótico** · Jorge "Coco" Mastrángelo, eterno candidato que por fin ganó: nueve DTs en tres años, 40.000 socios que todavía no lo creen | 62 | Villa Lumbrera (P) |
| 2 | Club Atlético Ríos Unidos | los Canoeros | azul `#1D3E8A` y rojo `#C62828` · mitades | Confluencia, donde se juntan dos ríos · costa | La Confluencia, 34.000 · Primera arg. · 3 | G* | **Gastador** · Marcelo "el Billete" Quintana: se gastó todo para volver y no volvió; ahora gasta lo que no tiene | 61 | Isla Mayor (del Delta) |
| 3 | Club Atlético Viento Blanco | el Viento | blanco y negro · rayas | Viento Blanco, Patagonia · frío | La Ventisca, 15.000 · invierno extremo · 2 | M | **Vendedor de pibes** · Ingrid Jones: pibes criados con viento de 90 km/h que se venden solos | 57 | Glaciar del Sur (P) |
| 4 | Club Atlético Minero de Socavón | los Topos | negro y verde `#2F6B3B` · lisa | Socavón, pueblo minero · desierto | La Galería, 12.000 · desierto · 2 | M | **Caótico** · el delegado de la mina, Ramón Vilca: pagan con lo que da la mina, y la mina a veces da | 56 | Salinas Grandes (P) |
| 5 | Deportivo Médanos de Oro | el Médano | arena `#E9C46A` y azul marino · franja | Médanos de Oro, balneario · costa | La Duna, 14.000 · tropical · 2 | M | **Presidente loco** · Bruno "el Italiano" Caruso: contrató un DT que dirige por videollamada desde Nápoles | 56 | Bahía Serena (P) |
| 6 | Club Atlético Cerro Pelado | los Pelados | verde musgo `#5B6B2F` y blanco · lisa | Cerro Pelado, sierras · montaña | La Ladera, 13.000 · inglés · 2 | M | **Ordenado** · Roberto Gaitán, contador jubilado: firma cada recibo con lapicera fuente | 56 | San Fermín (P) |
| 7 | Club Social y Deportivo La Ladrillera | los Ladrilleros | terracota `#B5562C` y blanco · bastones | La Ladrillera, conurbano · ciudad | El Horno, 11.000 · ascenso · 1 | C | **Caótico** · Liliana "la Tana" Russo: tres asambleas suspendidas por "falta de sillas" | 51 | Defensores del Arroyo (del Barro) |
| 8 | Club Atlético Pampa Honda | los Teros | azul `#234E9B` y blanco · franja | Pampa Honda, pueblo sojero · campo | El Silo, 12.000 · inglés · 2 | M | **Gastador** · Federico "el Sojero" Larrañaga: paga primas según el precio de la soja | 57 | Unión Agraria (del Pueblo) |
| 9 | Club Náutico y Deportivo Isla Mayor | los Isleños | verde agua `#5FB7A6` y negro · banda | Isla Mayor, en el delta · costa | El Muelle, 8.000 · tropical · 1 | C | **Caótico** · "el Capitán" Omar Rivarola, dueño de la lancha colectiva: se inunda cada vez que llueve y el visitante llega en lancha | 50 | Ríos Unidos |
| 10 | Defensores del Arroyo | las Ranas | verde manzana `#7CB342` y negro · bastones | Barrio del Arroyo, conurbano · ciudad | El Charco, 9.000 · ascenso · 1 | C | **Ordenado** · Norma "Normita" Ibarra: cuota al día y la mejor milanesa de la categoría | 50 | La Ladrillera |
| 11 | Sportivo Unión Agraria | los Chacareros | amarillo trigo `#E3B23C` y rojo `#B71C1C` · cuartos | Pampa Honda (el mismo pueblo) · campo | El Galpón de Acopio, 7.000 · ascenso · 1 | C | **Vendedor de pibes** · "el Gringo" Bertolotti: los pibes se van a la Capital en el mismo camión que el trigo | 50 | Pampa Honda |
| 12 | Club Atlético Tranqueras | los Tranqueros | marrón `#6D4C41` y blanco · lisa | Tranqueras, pueblo de ruta · campo | El Potrero, 8.000 · ascenso · 1 | C | **Caótico** · comisión "provisoria" desde 2019 | 49 | Kilómetro 40 (de la Banquina) |
| 13 | Deportivo Kilómetro 40 | los Fleteros | rojo `#D32F2F` y gris asfalto `#546E7A` · franja | Kilómetro 40, sobre la ruta · campo | El Parador, 9.000 · ascenso · 1 | C | **Presidente loco** · Ezequiel "el Tano" Cuccia, dueño de la transportadora: lleva al plantel en el acoplado y prometió un estadio con autocine | 50 | Tranqueras |
| 14 | Club Atlético Pozo Seco | los Quirquinchos | ocre `#C9A66B` y marrón · lisa | Pozo Seco, norte árido · desierto | La Represa (sin agua), 7.000 · desierto · 1 | C | **Ordenado** · Doña Irma Salvatierra: no tiene un peso pero no debe un peso | 48 | — ("su clásico es la sequía") · *reemplazable* |
| 15 | Club Atlético Astillero | los Soldadores | azul acero `#37474F` y rojo óxido `#A0522D` · bastones | Puerto Ceibo, barrio del astillero · costa | La Grada (un dique seco), 13.000 · inglés · 2 | M | **Vendedor de pibes** · Juan Carlos "el Capataz" Ledesma: los dos grandes del puerto le compran los pibes por monedas | 55 | — ("el eterno tercero del puerto") |
| 16 | Club Deportivo Termas de Ojo Caliente | los de la Toalla | blanco y lila `#9575CD` · lisa | Ojo Caliente, valle termal de Cuyo · montaña | El Vapor, 10.000 · andino · 2 | C | **Presidente loco** · Aldo Pietrobelli, dueño del hotel termal: concentran en el spa y cree que el barro cura los desgarros | 50 | Bodega Vieja (Cuyano) |
| 17 | Club Atlético Palmar Grande | los Yaguaretés | rojo tierra colorada `#B23A2A` y verde selva `#1B5E20` · mitades | Palmar Grande, en la selva · Caribe | La Picada, 9.000 · tropical · 1 | C | **Ordenado** · Rosa "la Profe" Ayala: hasta el último tornillo en una planilla | 49 | — ("su clásico son los mosquitos") · *reemplazable* |
| 18 | Club Atlético Villa Pirincho | los Pirinchos | negro y celeste `#81D4FA` · bastones | Villa Pirincho, conurbano · ciudad | El Nido, 10.000 · ascenso · 1 | C | **Vendedor de pibes** · Rubén "Pirincho" Acosta: los grandes se llevan un pibe por semana y le pagan con pelotas | 51 | Ciudad Satélite (de la Autopista) |
| 19 | Club Atlético Bodega Vieja | los Toneleros | vino tinto `#5E1224` y blanco · banda | Bodega Vieja, viñedos al pie de la cordillera · montaña | La Barrica, 16.000 · andino · 2 | M | **Gastador** · Cristóbal Aranda Zunino, bodeguero: paga las primas en cajas de tinto | 58 | Termas de Ojo Caliente |
| 20 | Club Deportivo Ciudad Satélite | los Satélites | plateado `#B0BEC5` y azul eléctrico `#2962FF` · lisa | Ciudad Satélite, polo tecnológico · ciudad | El Hangar, 12.000 · futurista · 2 | C | **Presidente loco** · Iván "el CEO" Kowalski: la formación la pone un algoritmo, y el algoritmo puso tres arqueros | 51 | Villa Pirincho |

Reparto: 2 G*, 7 M, 11 C · vendedor 4, gastador 3, ordenado 4, caótico 5, presidente loco 4.

**Cobertura:** entornos ciudad, campo, montaña, frío (Glaciar, Viento Blanco), Caribe (Yacaré Porá, Palmar Grande), costa y desierto; los 9 estilos de estadio aparecen al menos una vez. Los clásicos que cruzan divisiones (Glaciar–Viento Blanco, Salinas–Socavón, Bahía Serena–Médanos, San Fermín–Cerro Pelado, Lumbrera–Palomar) son una zanahoria: si subís con uno de esos rivales, "vuelve el clásico".

**Livianos (ejemplos, el pool completo es una tarea):**
- Federal: Atlético Laguna Seca ("los Sapos"), Sportivo Colonia Esperanza ("los Colonos"), Juventud de Paso Hondo ("los Balseros"), Atlético Villa Sauce ("los Mimbreros"), Deportivo Estación Ortiz ("los Andenes").
- Extranjeros (clubes ficticios, países reales del continente como origen): Sport Clube Cachoeira Alegre (Brasil), Club Atlético Rambla Vieja (Uruguay), Deportivo Puerto Quillay (Chile), Corporación Deportiva Río Magdalena Alto (Colombia), Club Deportivo Illimani Andino (Bolivia).

---

## 17. Ganchos del ciclo (contrato del núcleo)

| Gancho | Qué hace la liga |
|--------|------------------|
| `iniciar` | Carga los datos, reemplaza al club desplazado por el usuario, le asigna clásico por entorno, estados iniciales (salud y humor por arquetipo y tamaño), calendario, fixtures, clasificados de la Cóndor desde `temporada0.json` |
| `reducir` | MVP: sin acciones del jugador (la liga no se edita a mano). V1: `aceptarHorario`, `pedirPostergacion` si una movida lo habilita |
| `alAvanzarDia` | 1) aplica el buzón; 2) sorteos y eventos del día; 3) simula los partidos ajenos; 4) actualiza tablas, llaves, forma, rachas y presión; 5) señales; 6) noticias con tope |
| `antesDelPartido` | Noticia de la previa (clásico, final, rival en crisis) |
| `despuesDelPartido` | Registra el resultado del usuario, actualiza todo, hitos y efectos de contexto (abajo) |
| `alCerrarSemana` | Decaimiento de presión y humor, chequeo de crisis, matemáticas, resumen de la fecha |
| `alCerrarTemporada` | §5 |

**Efectos que emite** (solo de contexto de competición; valores en `balance.json`; la moral por resultado es del `partido`):

| Situación | Efectos |
|-----------|---------|
| Ganar el clásico | `relacion hinchas +5`, `jugador plantel moral +5` |
| Perder el clásico | `relacion hinchas −5`, `jugador plantel moral −5` |
| Ascenso | `relacion hinchas +15`, `relacion socios +10`, `jugador plantel moral +10` |
| Ganar el repechaje | igual que ascenso |
| Descenso | `relacion hinchas −15`, `relacion socios −10`, `jugador plantel moral −10` |
| Papelón (te elimina uno de menor categoría) | `relacion hinchas −5`, `relacion prensa −5` |
| Título | `relacion hinchas +20`, `relacion socios +15` |

**Interrupciones:** ninguna en el MVP (lo que necesita decisión llega como movida).

---

## 18. Preguntas para el usuario

1. **P1 · ¿Hay descenso en la B?** Hoy no: la mitad de abajo de la B no se juega nada. Opción (a) sin descenso (MVP, más simple). Opción (b) desde V1 el último de la B baja al Federal y sube uno del Federal; **vos también podrías bajar**, y eso exige un Federal jugable (más trabajo). Recomiendo (a) para el MVP y decidir (b) después de probar.
2. **P2 · ¿Club propio o hacerte cargo de uno de la B?** Propuesta: creás el tuyo y desplaza a un chico sin clásico (Pozo Seco o Palmar Grande). Alternativa linda para V1: "agarrar un club en ruinas" de la lista.
3. **P3 · Copa Nacional: ¿el chico es local o sede neutral?** La Copa Argentina real usa sede neutral. Recomiendo que el de menor categoría sea local hasta cuartos: más plata y más épica para tu club de la B.
4. **P4 · Partido desempate** para título, ascenso directo y descenso directo (muy argentino) en vez de solo diferencia de gol. Recomiendo sí.
5. **P5 · Extranjeros de la Cóndor con países reales** como origen (Brasil, Uruguay, Chile…) y clubes 100 % inventados. ¿Va, o preferís países inventados?
6. **P6 · La Cóndor en V1 y no en el MVP.** El usuario arranca en la B y la puede jugar recién en la temporada 2; en el MVP se calculan y anuncian los clasificados. ¿De acuerdo?
