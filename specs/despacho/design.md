# El Despacho y las Movidas — Diseño

Estado: `en revisión` · Cubre: DES-0 a DES-8 · Dueño: agente `movidas` · Porción: `movidas` · Contrato: `specs/nucleo/design.md` (no se cambia; lo que falta va en §14 "Pedidos")

## 0. Resumen en cinco líneas

1. Una **movida** es un dato JSON (`src/datos/movidas/<ambito>.json`) con disparo, roles, texto, 2–4 opciones visibles y una opción por defecto.
2. Después de cada partido de liga (y en algunos momentos puntuales) el módulo **elige 1–3 movidas por semana**, mezclando ámbitos, sin repetir y priorizando las **cadenas** que tienen que volver.
3. Al elegirla la **congela**: resuelve protagonistas, textos, montos de plata (relativos a la escala del club, así la división y el tamaño del club no rompen nada) y mitigaciones por staff. La UI y la decisión trabajan sobre la instancia congelada.
4. Al decidir, la opción se compila a **Efectos del núcleo** (más dos efectos que pedimos agregar: `orden` y `temporal` sobre el club), a **marcas** propias y a **seguimientos** agendados.
5. Un validador revisa el esquema, las referencias, el tono y las **opciones dominantes** (Pareto + valor esperado con una tabla de equivalencias).

---

## 1. Vocabulario

| Término | Qué es |
|---------|--------|
| **Definición** (`MovidaDef`) | La movida escrita, en JSON. No cambia durante la partida. |
| **Instancia** (`InstanciaMovida`) | Una movida que llegó al Despacho, congelada con sus protagonistas y montos. |
| **Tanda** | El lote de movidas que se elige en un momento del ciclo (después del partido, en la previa, un día cualquiera). |
| **Semana de movidas** | El presupuesto de 1–3 movidas (DES-3.3). Es la **semana de liga**: todo lo que pasa entre un partido de liga y el siguiente, incluidas las copas del medio. En pretemporada y receso, la semana calendario. |
| **Rol** | Un protagonista que la movida necesita (`jugador`, `juvenil`, `dt`, `sponsor`…). Si no se puede cubrir, la movida no sale. |
| **Lectura** | Un dato del estado que otro módulo expone con nombre (`liga.posicion`, `club.entorno`). Las condiciones solo usan lecturas. |
| **Marca** | Un flag o contador guardado en la porción `movidas` (DES-4.2). Puede vencer. |
| **Seguimiento** | Una movida agendada por una decisión anterior: la cadena (DES-4.1). |
| **Elenco** | Personajes ficticios recurrentes de la partida (el intendente, el jefe de la barra, el opositor, el periodista). Le dan continuidad a las cadenas. |
| **U** | Unidad de balance para comparar opciones: 1 U = un **ingreso promedio por fecha** del club. Solo la usa el validador. |

---

## 2. Esquema de una movida (`MovidaDef`)

Un archivo por ámbito: `{ "ambito": "plantel", "movidas": [ MovidaDef, ... ] }`.

```jsonc
{
  "id": "pla_tinta_final",              // único. Prefijo de ámbito: pla_ sta_ spo_ hin_ pol_ afa_ ciu_ pre_ eco_ obr_ mer_ inf_
  "titulo": "Tinta antes de la final",  // ≤ 40 caracteres
  "ambito": "plantel",                  // DES-0. Tiene que coincidir con el archivo
  "alcance": "jugador",                 // jugador | club (DES D1)
  "canal": "story",                     // ver §2.2
  "firma": "{jugador}",                 // quién lo manda / publica (autor de la tarjeta)
  "tono": "mixta",                      // buena | mala | mixta → dosificación de buenas y malas (§4.4)
  "etiquetas": ["tatuaje", "cabula"],   // para mitigaciones (§6), filtros y métricas. Ver catálogo §2.3
  "cadena": { "id": "tatuaje", "paso": 1 },   // opcional, solo informativo y para métricas

  "disparo": {
    "ventana": "tras_partido",          // tras_partido | previa | dia | cierre_temporada | entretiempo (V1)
    "momentos": ["previa_final"],       // vacío = cualquiera. Ver §4.2
    "si": { "todas": [ /* Condicion */ ] },     // opcional
    "peso": 10,                         // 1 (rara) … 10 (común) · 100 = forzada si cumple
    "pesoSi": [ { "si": { /* Condicion */ }, "x": 2 } ],   // multiplicadores
    "enfriamiento": 20,                 // semanas de movidas sin volver a salir (default en _config.json)
    "maxTemporada": 1,                  // default 1
    "maxPartida": null,                 // null = sin tope
    "grupo": null,                      // movidas excluyentes entre sí (comparten enfriamiento)
    "soloCadena": false                 // true = solo entra como seguimiento
  },

  "roles": {
    "jugador": {
      "tipo": "jugador",                // jugador | juvenil | dt | staff | sponsor | rival | obra
      "filtro": { /* Condicion sobre la entidad */ },
      "prefiere": [ { "si": { /* Condicion */ }, "x": 3 } ],
      "opcional": false                 // si es true y no hay candidato, la movida sale igual y las opciones con visibleSi se esconden
    }
  },

  "texto": "{jugador} subió una story…",   // ≤ 320 caracteres, admite variables §2.4
  "vence": { "tipo": "previa" },        // previa | dias {n} | semanas {n} | urgente | null (= previa)
  "porDefecto": "sin_respuesta",        // id de una opción (visible u oculta) — DES-2.5

  "opciones": [
    {
      "id": "dejar",
      "texto": "Dejalo, la fe mueve montañas",   // ≤ 70 caracteres
      "requiere": null,                 // Condicion: si no se cumple, se muestra bloqueada con "motivo"
      "motivo": null,                   // "Necesitás un abogado en la sede"
      "visibleSi": null,                // Condicion: si no se cumple, ni se muestra
      "oculta": false,                  // true = solo existe como opción por defecto ("lo dejaste pasar")
      "efectos": [ /* EfectoDato */ ],
      "desenlace": "Salió del tatuador…" // ≤ 220 caracteres. Las azar suman su propio texto
    }
  ]
}
```

Reglas del esquema (las chequea el validador, §9):
- 2 a 4 opciones **visibles**, de las cuales al menos 2 sin `requiere`. Como máximo 1 opción `oculta`.
- `porDefecto` apunta a una opción existente. Si es visible, no puede ser la mejor en valor esperado.
- Toda variable del texto es un rol declarado o una variable global (§2.4).

### 2.1 Condiciones

```jsonc
Condicion =
  { "todas": [Condicion, ...] }
| { "alguna": [Condicion, ...] }
| { "no": Condicion }
| { "dato": "liga.posicion", "op": "<=", "valor": 3 }       // op: = != < <= > >= en tiene
| { "marca": "club.pacto_barra" }                            // existe y es verdadera / > 0
| { "marca": "j.{jugador}.tatuaje_copa", "op": ">=", "valor": 1 }
| { "momento": "previa_clasico" }
```

- `dato` es el nombre de una **lectura** (§8). Dentro de `roles.*.filtro` y `prefiere`, las lecturas `jugador.*` / `juvenil.*` / `sponsor.*` se evalúan sobre el candidato.
- Las marcas con `{rol}` se resuelven después de elegir los roles; por eso el orden es: roles → condiciones.

### 2.2 Canales

`video_vertical` · `posteo` · `story` · `audio` · `llamado` · `mail` · `carta_documento` · `comunicado` · `diario` · `radio` · `stream` · `reunion`

Se dibujan con plantillas propias (DES D2), sin logos ni la cara de ninguna red real: "audio" es una burbuja de audio de un mensajero genérico, "posteo" es un post genérico.

### 2.3 Etiquetas (catálogo cerrado en `_config.json`)

`escandalo` · `joda` · `tatuaje` · `cabula` · `barra` · `violencia` · `apuestas` · `cripto` · `plata` · `deuda` · `politica` · `legal` · `lesion` · `oferta` · `viral` · `clima` · `obra` · `juvenil` · `relleno`

Las usan las mitigaciones (§6), los filtros del Despacho y las métricas de cobertura.

### 2.4 Variables de texto (DES-5.3)

| Variable | Sale de |
|----------|---------|
| `{jugador}`, `{juvenil}`, `{dt}`, `{sponsor}`, `{rival}`, `{staff}`… | Roles de la movida (nombre o apodo) |
| `{club}`, `{ciudad}` | `club` (identidad y ambientación) |
| `{clasico}` | `liga` (rival de clásico) |
| `{intendente}`, `{jefe_barra}`, `{opositor}`, `{periodista}`, `{diario}`, `{utilero}`, `{representante}`, `{ex_jugador}`, `{presidente_federacion}` | Elenco de la partida (§3.3) |
| `{federacion}` | Nombre ficticio de la asociación del fútbol (ver Pregunta P2). Reemplaza a `{presidente_afa}` del requisito |
| `{monto}`, `{monto_oferta}`, `{exceso}` | Calculadas al congelar (§5) desde las lecturas o el primer efecto de plata |

Formato de plata: siempre abreviado y redondeado a 2 cifras significativas (`AU 45M`, `AU 1.200M`). Moneda única mundial, nombre provisional Áureo (economía §8).

### 2.5 Efectos en los datos (`EfectoDato`)

Los JSON **no** llevan montos absolutos ni ids: llevan referencias que se compilan a `Efecto` del núcleo al congelar la instancia (§5).

| `tipo` | Forma en el JSON | Compila a (núcleo §5) |
|--------|------------------|-----------------------|
| `plata` | `{ "tipo":"plata", "x":-0.8, "de":"ingreso_fecha", "concepto":"multas" }` | `pesos` del núcleo con `valor = redondeo(x × referencia)` |
| `fama` | `{ "tipo":"fama", "pct":3 }` | `fama` con `valor = pct % de la fama actual` |
| `relacion` | `{ "tipo":"relacion", "con":"barra", "valor":-15 }` | `relacion` |
| `jugador` | `{ "tipo":"jugador", "quien":"jugador", "campo":"moral", "valor":8 }` — `quien`: un rol, `plantel` o `titular_al_azar` | `jugador` con el id resuelto |
| `temporal` | `{ "tipo":"temporal", "quien":"jugador", "efecto":"resaca", "partidos":1 }` | `temporal` |
| `club_temporal` | `{ "tipo":"club_temporal", "efecto":"tribuna_cerrada", "partidos":2, "datos":{"sector":"popular"} }` | **pedido N3** (`temporal` sobre el club) |
| `obra` | `{ "tipo":"obra", "fechas":3 }` (sobre el rol `obra` o la obra activa) | `obra` |
| `marca` | `{ "tipo":"marca", "clave":"j.{jugador}.tatuaje_copa", "valor":true, "dura":20, "modo":"fijar" }` | se aplica en la porción `movidas` (pedido N4) |
| `azar` | `{ "tipo":"azar", "p":0.25, "si":[…], "sino":[…], "desenlaceSi":"…", "desenlaceSino":"…" }` — `p` puede ser `{ "base":0.5, "ajustes":[{ "si":Condicion, "suma":0.2 }] }` | se resuelve en el módulo (§5.3) y emite solo la rama que salió |
| `programa` | `{ "tipo":"programa", "movida":"pla_tatuaje_infectado", "en":[0,1], "p":0.25, "hereda":["jugador"] }` | entrada en la `agenda` propia (§7) |
| `orden` | `{ "tipo":"orden", "modulo":"mercado", "accion":"vender", "datos":{ "jugador":"{jugador}", "x":2.5, "de":"valor_jugador" } }` | **pedido N2** (`orden` a otro módulo) |
| `noticia` | `{ "tipo":"noticia", "titulo":"…", "importancia":2 }` | `Salida.noticias` |
| `implicito` | `{ "tipo":"implicito", "x":-2, "de":"sueldos_mes", "nota":"el sueldo nuevo se cobra todos los meses" }` | **nada**: solo lo usan el validador y las pistas de la UI, para costos que el juego ya cobra por otro lado |

Cualquier efecto puede llevar `"oculto": true`: no aparece en las pistas de la opción (DES-2.4).

**Referencias de magnitud** (`de`), calculadas al congelar con lecturas de `economia` y `mercado` (pedido E1):

| `de` | Qué es | Club típico B / Primera (temporada 1) |
|------|--------|---------------------------------------|
| `ingreso_fecha` | ingresos del último año ÷ 38 (en la temporada 1, la referencia de la división) | AU 32M / AU 160M |
| `recaudacion` | recaudación esperada de un partido de local con precios de referencia | AU 35M / AU 300M |
| `sueldos_mes` | masa salarial mensual del plantel | AU 55M / AU 275M |
| `sueldo_jugador` | sueldo mensual del rol `jugador` | variable |
| `valor_jugador` | valor de mercado del rol | variable |
| `cuota_sponsor` | pecho anual de referencia de la división | AU 250M / AU 1.500M |
| `obra_activa` / `ultima_obra` | costo total de la obra en curso / la última terminada | variable |

Así, "una multa de 0,8 fechas de ingresos" pesa lo mismo en la B que en Primera, y una movida escrita hoy sigue teniendo sentido cuando el club crece.

**Escala de las demás magnitudes** (guía de escritura; el validador avisa si se pasa):

| | Chico | Medio | Grande | Enorme (raro) |
|---|---|---|---|---|
| Relación (0–100) | ±3 | ±8 | ±15 | ±25 |
| Moral (0–100) | ±4 | ±8 | ±15 | ±20 |
| Fama (% de la actual) | 1 | 3 | 6 | 10 |
| Plata (en `ingreso_fecha`) | 0,1 | 0,5 | 1,5 | 5+ (ventas, SAD) |

---

## 3. Estado: la porción `movidas` (tipos TypeScript)

```ts
type IdMovida = string                       // id de la definición
type IdInstancia = string                    // `${IdMovida}#${n}`
type Ambito = 'plantel'|'staff'|'sponsors'|'hinchas'|'politica'|'afa'|'ciudad'|'prensa'|'economia'|'obras'|'mercado'|'inferiores'
type Canal = 'video_vertical'|'posteo'|'story'|'audio'|'llamado'|'mail'|'carta_documento'|'comunicado'|'diario'|'radio'|'stream'|'reunion'
type Ventana = 'tras_partido'|'previa'|'dia'|'cierre_temporada'|'entretiempo'
type Tono = 'buena'|'mala'|'mixta'

interface EstadoMovidas {
  version: 1
  pendientes: InstanciaMovida[]              // esperan decisión (máx. _config.maxPendientes = 6)
  historial: RegistroMovida[]                // últimas 200 resueltas; lo viejo se resume en `vistas`
  agenda: Seguimiento[]                      // cadenas que tienen que volver (§7)
  marcas: Record<string, Marca>              // DES-4.2
  vistas: Record<IdMovida, { veces: number; ultimaSemana: number; porTemporada: Record<number, number> }>
  semana: PresupuestoSemana                  // cuántas salieron en la semana de movidas actual
  tonoReciente: Tono[]                       // últimas 12, para dosificar buenas y malas
  ambitosRecientes: Ambito[][]               // ámbitos de las últimas 4 tandas
  protagonistasRecientes: Record<string, number>   // id de entidad → semana en que fue protagonista
  elenco: Elenco
  institucional: Institucional
  contador: number                           // para armar IdInstancia
}

interface Marca { valor: number | boolean; desde: Instante; hasta?: Instante }

interface PresupuestoSemana { numero: number; salidas: number; objetivo: 1 | 2 | 3 }

interface InstanciaMovida {
  id: IdInstancia
  def: IdMovida
  ambito: Ambito; canal: Canal; tono: Tono
  creada: Instante
  vence: { tipo: 'previa'; partido: IdPartido } | { tipo: 'instante'; cuando: Instante } | { tipo: 'urgente' }
  roles: Record<string, { tipo: string; id: string; nombre: string }>
  titulo: string; firma: string; texto: string      // ya con variables resueltas
  opciones: OpcionCongelada[]
  porDefecto: string
  semilla: number                                    // sale del rng del módulo al crearla; decide los azar (§5.3)
  cadena?: { id: string; paso: number; origen?: IdInstancia }
  mitigaciones: string[]                             // "Tu psicóloga amortiguó el golpe" (para mostrar)
  estado: 'pendiente' | 'resuelta' | 'vencida' | 'anulada'
}

interface OpcionCongelada {
  id: string
  texto: string
  visible: boolean
  bloqueada?: string                                 // motivo si `requiere` no se cumple
  efectos: EfectoCompilado[]                         // montos y ids ya resueltos, mitigaciones aplicadas
  desenlace: string
  pistas: Pista[]                                    // lo que muestra la UI (§10)
}

type EfectoCompilado =
  | { destino: 'nucleo'; efecto: Efecto }            // núcleo §5 (+ pedidos N2/N3)
  | { destino: 'marca'; clave: string; valor: number | boolean; modo: 'fijar' | 'sumar'; dura?: number }
  | { destino: 'agenda'; seguimiento: Omit<Seguimiento, 'id'> }
  | { destino: 'noticia'; noticia: Omit<Noticia, 'cuando'> }
  | { destino: 'azar'; p: number; si: EfectoCompilado[]; sino: EfectoCompilado[]; desenlaceSi: string; desenlaceSino: string }

interface Pista { eje: string; direccion: -2 | -1 | 1 | 2; monto?: number; riesgo?: boolean }

interface RegistroMovida {
  instancia: IdInstancia; def: IdMovida; ambito: Ambito
  creada: Instante; resuelta: Instante
  opcion: string; porDefecto: boolean; salioAzar?: boolean[]
  desenlace: string
}

interface Seguimiento {
  id: string
  movida: IdMovida
  faltan: number                     // partidos del club que faltan (0 = en la próxima tanda que corresponda a su ventana)
  p: number                          // se tira al momento de dispararse, no al decidir (§7)
  roles: Record<string, { tipo: string; id: string; nombre: string }>
  origen: IdInstancia
  forzar: boolean                    // ignora el tope semanal (solo cadenas urgentes)
}

interface Elenco {
  intendente: Personaje; jefeBarra: Personaje; opositor: Personaje
  periodista: Personaje; diario: string; utilero: Personaje
  presidenteFederacion: Personaje; representante: Personaje; exJugador: Personaje
}
interface Personaje { nombre: string; apodo?: string; rasgo?: string }

interface Institucional {
  proximasElecciones: { temporada: number; semana: number }   // cada 3 temporadas (Pregunta P6)
  asambleaBalance: { semana: number }                          // semana 51
  mandato: 'firme' | 'normal' | 'debil'                        // lo mueven las movidas de política
}
```

**Por qué `institucional` es mío:** ningún módulo es dueño de la comisión directiva, las elecciones ni las asambleas, y solo existen para las movidas. Si el usuario decide que perder elecciones tiene consecuencias mecánicas (P6), esas consecuencias se emiten como Efectos hacia los demás.

### 3.1 Acciones del jugador sobre la porción (`reducir`)

```ts
type AccionMovidas =
  | { tipo: 'movidas/elegir'; instancia: IdInstancia; opcion: string }
  | { tipo: 'movidas/dejarPasar'; instancia: IdInstancia }      // aplica la opción por defecto
  | { tipo: 'movidas/marcarLeida'; instancia: IdInstancia }     // solo UI (las que no tienen decisión)
```

`reducir` es puro y solo toca la porción `movidas` (resuelve el azar con `semilla`, mueve la instancia al historial, aplica marcas y agenda). Los efectos sobre otras porciones salen en el mismo paso por el gancho que pedimos al núcleo (**N1**). Las dos funciones llaman a la misma `resolver(instancia, opcion)`, que es pura y determinista, así que nunca se desincronizan.

### 3.2 Ganchos del ciclo que usa el módulo

| Gancho (núcleo §4) | Qué hace `movidas` |
|--------------------|--------------------|
| `iniciar` | Arma el elenco con su `rng`, la agenda institucional y la primera tanda de pretemporada (1–2 movidas suaves de bienvenida). |
| `despuesDelPartido` (partido de liga) | Abre la semana de movidas nueva, baja `faltan` de la agenda y sale la **tanda principal**. Con partido de copa: solo baja `faltan`. |
| `antesDelPartido` | Tanda de **previa** (seguimientos con ventana `previa`, sobreventa, botines del utilero). Si hay algo, devuelve `interrupcion`. Las pendientes con `vence: previa` sin decidir se resuelven por defecto. |
| `alAvanzarDia` | Vencimientos por instante, marcas vencidas, anulaciones (protagonista que ya no está), y con probabilidad baja una movida de ventana `dia` (llamado urgente) si queda presupuesto. |
| `alCerrarSemana` | En pretemporada y receso (sin partidos de liga), hace las veces de `despuesDelPartido`. |
| `alCerrarTemporada` | Tanda de `cierre_temporada` (asamblea de balance, renovaciones), borra las marcas `temporada.*` y recorta el historial. |

### 3.3 El elenco

`src/datos/movidas/_elenco.json` tiene listas de nombres, apodos y diarios ficticios por tipo de personaje. Al iniciar la partida se elige uno de cada tipo con el `rng`. Se cambian solo por movidas ("el intendente perdió las elecciones", "la barra tiene jefe nuevo"). Ejemplos de lo que hay en las listas: "Tito Barragán" (intendente), "el Gordo Cachete" (jefe de la barra), "Horacio Peralta" (opositor), "Fede Lombardi" (periodista), *El Eco de la Tarde* (diario), "Don Ruggero" (utilero).

---

## 4. Selección: qué movidas llegan y cuándo (DES-3)

### 4.1 Presupuesto semanal

- Al abrir una semana de movidas se sortea el **objetivo**: 1 (35 %), 2 (45 %), 3 (20 %) — en `_config.json`.
- Ajustes: +1 en semanas calientes (previa de clásico o final, último partido de un mercado de pases, mes de elecciones, caja en rojo); −1 si ya hay 4 o más pendientes. Siempre queda entre 1 y 3.
- La tanda principal saca `objetivo − (seguimientos que ya tocan esta semana)`. Lo que llega en la previa o en un día suelto **descuenta** del mismo presupuesto: si la tanda principal ya usó todo, en la previa solo entran seguimientos con `forzar`.
- **Mínimo garantizado:** si al cerrar la semana salió 0 (pool vacío por condiciones), se elige una movida de `relleno` (etiqueta `relleno`, sin condiciones; ej. "el kiosco pide heladera nueva").
- Tope de pendientes: 6. Si se llena, no salen nuevas no forzadas (y el Despacho lo avisa: "tenés el escritorio tapado").

### 4.2 Momentos de la temporada

Se calculan una vez por tanda con lecturas de `tiempo` y `liga`. Una movida con `momentos` pide que se cumpla **al menos uno**.

| Momento | Cuándo |
|---------|--------|
| `pretemporada` | semanas 1–4 |
| `mercado_verano` / `mercado_invierno` | ventanas de pases (1–4 / 25–28) |
| `receso` | semanas 25–28 |
| `arranque` | fechas de liga 1–5 |
| `recta_final` | fechas 31–38 |
| `definicion` | semanas 49–50 (repechaje, finales) |
| `cierre` | semanas 51–52 |
| `previa_clasico` | el próximo partido del club es contra su clásico |
| `previa_final` | el próximo partido es final, repechaje o eliminación directa de cuartos en adelante |
| `post_victoria` / `post_derrota` | resultado del último partido |
| `racha_buena` / `racha_mala` | 3+ victorias seguidas / 3+ partidos sin ganar |
| `pelea_arriba` / `pelea_abajo` | puesto de ascenso o repechaje / zona de descenso |
| `elecciones` | faltan ≤ 8 semanas para las elecciones del club |
| `crisis_caja` | caja negativa o concurso de acreedores |

### 4.3 Algoritmo de una tanda

```
tanda(ctx, ventana, cupo):
  1. SEGUIMIENTOS: de la agenda, los que tienen faltan ≤ 0 y cuya movida es de esta ventana.
     Por cada uno: tirar p con rng; si sale y sus condiciones y roles siguen valiendo → instanciar.
     Si no hay cupo y no es `forzar` → faltan = 0 y espera a la próxima tanda (máx. 2 postergaciones; después se descarta).
  2. CANDIDATAS: todas las defs de esta ventana que
       - no son soloCadena,
       - cumplen momentos y `si`,
       - no están en enfriamiento (ni su grupo), ni pasaron maxTemporada / maxPartida,
       - pueden cubrir sus roles (sin repetir protagonista de otra pendiente ni de las últimas 3 semanas).
  3. PESO efectivo = peso
       × Π pesoSi que se cumplen
       × frescura del ámbito (×0,5 si salió en la tanda anterior; ×1,4 si no sale hace 4 tandas)
       × dosis de tono (si las buenas de las últimas 12 son < 25 % → buenas ×1,6; si > 45 % → buenas ×0,6)
       × novedad (×1,3 si nunca salió en la partida; ×0,7 si ya salió 3+ veces)
     Las de peso 100 que cumplen entran directo (sobreventa, embargo, concurso).
  4. SORTEO sin reposición con rng, hasta llenar el cupo, con dos reglas:
       - no dos del mismo ámbito en la misma tanda,
       - no dos con el mismo protagonista.
  5. CONGELAR cada elegida (§5) y devolverla; si es de ventana previa/dia o vence urgente → interrupción.
```

### 4.4 Dosis de tono

Objetivo: **30–40 % de movidas buenas** (oportunidades, ofertas, golpes de suerte) a lo largo de la temporada. Las `mixta` (tentaciones) no cuentan como buenas. Las métricas de la simulación (§9.4) lo controlan.

### 4.5 Selección de protagonistas

Para cada rol: candidatos que pasan `filtro` → peso 1 × `prefiere` → ×0,2 si fue protagonista hace ≤ 3 semanas → sorteo con rng. Así el fiestero protagoniza más joda, pero no todas.

---

## 5. Congelar y resolver

### 5.1 Congelar (al crear la instancia)

1. Resolver roles y variables de texto.
2. Compilar cada `EfectoDato` a `EfectoCompilado`: montos con las referencias del momento (redondeados a 2 cifras significativas), ids de jugadores, claves de marca con ids.
3. Aplicar mitigaciones (§6) y anotar cuáles actuaron.
4. Evaluar `requiere` y `visibleSi` de cada opción. Si quedan menos de 2 opciones visibles y desbloqueadas, la movida se descarta (error de escritura: el validador lo detecta antes).
5. Calcular las pistas (§10) y la `semilla` (un entero del rng del módulo).

Se congela porque `reducir` no recibe la partida ni el rng, y porque lo que el jugador vio tiene que ser lo que paga.

### 5.2 Instancias que quedan viejas

En `alAvanzarDia`, si un rol ya no existe (vendiste a `{jugador}`, se fue el DT, rescindiste el sponsor), la instancia pasa a `anulada` con una noticia corta ("La movida de {jugador} se resolvió sola: ya juega en otro club"). No se aplica nada.

### 5.3 Resolver (decisión o vencimiento)

```
resolver(instancia, idOpcion) → { porcion', salida }
  opcion = instancia.opciones[idOpcion]
  rng = Rng(instancia.semilla ⊕ hash(idOpcion))
  por cada efecto: si es azar → tirar con rng, quedarse con la rama, sumar su desenlace
  separar: núcleo → salida.efectos (con origen "movida:<instancia>:<opcion>")
           marca → porción.marcas · agenda → porción.agenda · noticia → salida.noticias
  registrar en historial, actualizar vistas, tonoReciente y protagonistasRecientes
```

El azar se resuelve en el módulo (no con el `azar` del núcleo) para poder mostrar el desenlace que corresponde a lo que salió. El `azar` del núcleo queda disponible para otros módulos.

### 5.4 Vencimiento (DES-2.5)

| `vence` | Cuándo se aplica la opción por defecto |
|---------|----------------------------------------|
| `previa` (default) | Al entrar a la previa del próximo partido del club |
| `dias {n}` / `semanas {n}` | Al llegar el instante |
| `urgente` | Llega como **interrupción** (NUC-2.3). Si el jugador cierra sin decidir, se aplica el defecto |

Antes de tocar JUGAR, la UI avisa si hay pendientes que vencen en el camino ("Tenés 2 movidas sin decidir. Si jugás, se aplica *lo dejaste pasar*"). La opción por defecto se escribe como **lo que pasa si no hacés nada**, casi siempre una opción `oculta` y peor que decidir.

---

## 6. Staff y edificios mitigan (DES-6)

Dos mecanismos, ambos en datos:

**a) Opciones con requisito** (`requiere`): la opción aparece **bloqueada con motivo** si no tenés el staff o el edificio ("Necesitás un abogado en la sede"). Enseña para qué sirve contratar, y cuando la tenés, es la recompensa. A estas opciones el validador les permite ser mejores que las otras (§9.2).

**b) Atenuantes globales** (`_mitigaciones.json`), aplicados al congelar:

| Quién | A qué | Cuánto |
|-------|-------|--------|
| Psicólogo/a (nivel n) | efectos `jugador.moral` negativos | × (1 − 0,08·n), mínimo × 0,6 |
| Community manager / asesor de prensa (oficina de prensa nivel n) | `fama` y `relacion prensa` negativos en movidas con etiqueta `escandalo` o `viral` | × (1 − 0,1·n), mínimo × 0,5 |
| Abogado (nivel n) | `plata` negativa con concepto `multas` | × (1 − 0,07·n) |
| Abogado (nivel n) | `p` de los azar con etiqueta `legal` a favor del club | + 0,05·n |
| Contador (nivel n) | `plata` negativa en movidas con etiqueta `deuda` o `plata` | × (1 − 0,05·n) |
| Médico / kinesiólogo (dpto. médico nivel n) | `p` de seguimientos con etiqueta `lesion` | × (1 − 0,1·n) |

Las mitigaciones se anotan en la instancia y la UI las muestra en el desenlace ("Tu psicóloga amortiguó el golpe").

---

## 7. Cadenas y consecuencias diferidas (DES-4)

Hay dos maneras de encadenar, y se usan las dos:

1. **Seguimiento agendado** (`programa`): una opción agenda una movida concreta para dentro de `en: [mín, máx]` **partidos del club** (como las obras, se cuenta en fechas jugadas). El rango se sortea al decidir; la **probabilidad se tira al dispararse**, no al decidir, así contratar un médico entre medio todavía sirve, y si la condición ya no vale (el jugador se fue) se descarta. Hereda roles (`hereda: ["jugador"]`).
2. **Marca + condición** (cadena blanda): una opción deja una marca (`club.pacto_barra`) y otras movidas del pool la piden o la usan en `pesoSi`. No garantiza cuándo vuelve, pero vuelve.

Convenciones de marcas (catálogo en `_marcas.json`, con descripción, alcance, quién la lee y su valor estimado en U para el validador):

| Prefijo | Alcance | Se borra |
|---------|---------|----------|
| `club.*` | el club, toda la partida | con `dura` o por otra movida |
| `temporada.*` | la temporada | al cerrar la temporada |
| `j.<idJugador>.*` | un jugador | cuando deja el club |

Las marcas que ponen otros módulos (ej. `partido` → `j.<id>.erro_penal_clasico`) entran por el efecto `marca` del núcleo y viven acá (N4).

---

## 8. Lecturas que necesito (condiciones y magnitudes)

Las condiciones solo usan **lecturas con nombre**: funciones puras `(partida, args) → número | booleano | texto | lista` que publica cada módulo dueño del dato. Es la forma de leer sin acoplarse a la forma interna de cada porción (pedido N5). Detalle por módulo en §14.

Lecturas propias de `movidas`: `marca.*`, `momento`, `institucional.semanas_a_elecciones`, `institucional.mandato`, `movidas.pendientes`.

---

## 9. Validación (DES-5.2)

### 9.1 Al cargar (Zod + chequeos cruzados) — error = la movida no se carga y se avisa

- Esquema completo (§2), enums cerrados (ámbito, canal, etiquetas, ventana, momentos, conceptos, relaciones).
- `id` único global, prefijo coherente con el ámbito, ámbito igual al del archivo.
- 2–4 opciones visibles, ≥ 2 sin `requiere`, ≤ 1 oculta, `porDefecto` existente.
- Variables del texto: todas declaradas. Lecturas: todas existen en el registro (N5). `orden`: acción existente en el catálogo del módulo.
- `programa` apunta a una movida existente y los roles heredados existen en el destino. Las `soloCadena` tienen al menos un `programa` que las llame.
- Largos de texto (§2), y **lista de palabras prohibidas** (`_prohibidas.json`: clubes, marcas, redes, políticos y periodistas reales; insultos y odio).

### 9.2 Opciones dominantes (test que recorre todas)

1. Para cada opción visible se calcula un **vector de valor esperado** por eje: plata, fama, cada relación, moral (jugador y plantel), físico, temporales, marcas (valor del catálogo) y seguimientos (`p ×` el valor esperado medio de la movida destino, hasta 2 niveles). Los azar se ponderan por `p`. Los `implicito` cuentan.
2. **Error:** una opción visible sin `requiere` está **dominada en Pareto** por otra (igual o peor en todos los ejes y peor en alguno). Las opciones con `requiere` pueden dominar a las demás (son la recompensa del staff), pero no pueden estar dominadas (serían inútiles).
3. **Aviso:** con la tabla de equivalencias (`_balance.json`, todo pasado a U), la mejor opción supera a la segunda por más de 1,5 U y por más del doble. O todas las opciones tienen el mismo signo en todos los ejes (no hay dilema). O la opción por defecto visible es la mejor.
4. **Aviso de escala:** algún efecto pasa la columna "Enorme" de §2.5 sin etiqueta `oferta`.

Equivalencias iniciales (se calibran con la simulación): 1 U = 1 `ingreso_fecha` · 1 % de fama = 0,4 U · 1 punto de relación = 0,08 U (barra 0,05; afa y comisión 0,1) · 1 de moral del plantel = 0,12 U · 1 de moral de un jugador = 0,02 U · un partido de lesión de un titular = 0,8 U · un partido de tribuna cerrada = 0,3 U.

### 9.3 Cobertura (test)

- Cada ámbito tiene su mínimo de movidas (tasks.md, meta de escritura).
- Cada momento de §4.2 tiene ≥ 6 candidatas; cada entorno del MVP (ciudad, campo, montaña) ≥ 4 propias.
- ≥ 30 % de las defs con tono `buena`; ≥ 10 cadenas de 2+ pasos.

### 9.4 Simulación (con NUC-7)

10 temporadas × 200 partidas con tres políticas (siempre por defecto, siempre la de mayor U, al azar). Se mide: movidas por semana (media 1,8–2,2), % de buenas, ámbitos por temporada (ninguno < 4 %), cadenas completadas, repeticiones por temporada, e **impacto neto en plata** de las movidas: entre −8 % y +8 % de los ingresos de la temporada con la política al azar (si no, las movidas rompen la economía). Dos corridas con la misma semilla dan idéntico historial.

---

## 10. Lo que ve la UI

La instancia congelada trae todo lo que la pantalla necesita (canal, firma, título, texto, opciones, pistas, vencimiento). Propuesta de **pistas** por opción (Pregunta P1):
- Plata: **monto exacto** cuando es seguro (`−AU 45M`), porque la plata tiene que ser legible para decidir.
- Lo demás: **ícono del eje + flechas** (↑, ↑↑, ↓, ↓↓), sin números.
- Azar: ícono de **riesgo** sin porcentaje. Efectos `oculto` y seguimientos: no se muestran.
- Opción bloqueada: candado + motivo.

---

## 11. Datos

```
src/datos/movidas/
  plantel.json  staff.json  sponsors.json  hinchas.json  politica.json  afa.json
  ciudad.json  prensa.json  economia.json  obras.json  mercado.json  inferiores.json
  _config.json        presupuesto semanal, enfriamientos por defecto, tope de pendientes, dosis de tono, etiquetas, momentos
  _elenco.json        nombres de personajes recurrentes y diarios ficticios
  _marcas.json        catálogo de marcas (descripción, alcance, valor estimado en U)
  _mitigaciones.json  atenuantes por staff y edificio
  _balance.json       equivalencias en U para el validador
  _prohibidas.json    palabras y nombres reales que no pueden aparecer
```

## 12. Guía de tono (la usa quien escriba movidas)

- Voseo, frases cortas, un remate por movida. Humor con cariño: el chiste es la situación, no una persona.
- Todo ficticio: clubes, marcas (Jugadón.bet, PampaCoin, Yerba La Tranquera), dirigentes, periodistas, bandas. Se pueden nombrar países y regiones.
- Joda, alcohol y apuestas: mencionados, con elipsis y con consecuencias. Nunca gráficos ni glorificados.
- Barra y violencia: fuera de cuadro ("charlaron", "apretaron"). Sin armas, sin heridos descriptos.
- Juveniles (16–18): solo situaciones deportivas y contractuales. Nunca joda, alcohol, apuestas ni riesgo.
- Cada opción tiene que tentar: si al escribirla sabés cuál elegirías siempre, sumale un costo o un riesgo.
- La opción por defecto describe lo que pasa si no hacés nada, y casi siempre es peor que decidir.

---

## 13. Lote de muestra: 30 movidas

Reparto: plantel 4 · staff 2 · sponsors 3 · hinchas 2 · afa 2 · política 3 · ciudad 3 · prensa 2 · economía 3 · obras 2 · mercado 2 · inferiores 2.

**Cadenas:** tatuaje (`pla_tinta_final` → `pla_tatuaje_infectado`) · barra (`hin_barra_micros` → `hin_barra_aprieta_dt` → `afa_tribunal_disciplina`) · oposición (`pol_oposicion_lista` → `pol_firmas_asamblea`) · napa (`obr_napa` → `obr_clausura`, que puede volver a sí misma) · sobreventa (`eco_sobreventa` → `afa_tribunal_disciplina`) · embargo (`eco_embargo` → `eco_sentencia`).
**Buenas:** `pla_abuela_viral`, `spo_yerba_manga`, `ciu_recital`, `pre_streamer`, `inf_pibe_reserva` (más las tentaciones `spo_apuestas_pecho`, `pol_fondo_sad`, `mer_arabia`).
**Economía:** `eco_embargo`, `eco_sentencia`, `eco_sobreventa` (sin inflación ni tipo de cambio: moneda única, economía §8).

### plantel.json

```json
{
  "ambito": "plantel",
  "movidas": [
    {
      "id": "pla_tinta_final",
      "titulo": "Tinta antes de la final",
      "ambito": "plantel", "alcance": "jugador", "canal": "story", "firma": "{jugador}",
      "tono": "mixta", "etiquetas": ["tatuaje", "cabula"],
      "cadena": { "id": "tatuaje", "paso": 1 },
      "disparo": {
        "ventana": "tras_partido", "momentos": ["previa_final", "previa_clasico"],
        "peso": 8, "pesoSi": [ { "si": { "momento": "previa_final" }, "x": 2 } ],
        "enfriamiento": 20, "maxTemporada": 1
      },
      "roles": {
        "jugador": { "tipo": "jugador",
          "filtro": { "dato": "jugador.titular", "op": "=", "valor": true },
          "prefiere": [ { "si": { "dato": "jugador.rasgo", "op": "tiene", "valor": "cabulero" }, "x": 3 } ] }
      },
      "texto": "{jugador} subió una story desde el tatuador: \"Mañana me hago la copa en el gemelo. Si la tengo en la piel, la tengo en la mano\". El kinesiólogo ya se agarra la cabeza.",
      "vence": { "tipo": "dias", "n": 2 },
      "porDefecto": "sin_respuesta",
      "opciones": [
        { "id": "dejar", "texto": "Dejalo, la fe mueve montañas",
          "efectos": [
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": 12 },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": 3 },
            { "tipo": "marca", "clave": "j.{jugador}.tatuaje_copa", "valor": true, "dura": 30 },
            { "tipo": "programa", "movida": "pla_tatuaje_infectado", "en": [0, 0], "p": 0.25, "hereda": ["jugador"] }
          ],
          "desenlace": "Salió del tatuador con la copa en el gemelo y una sonrisa de oreja a oreja. El kinesiólogo pidió que conste en actas que avisó." },
        { "id": "prohibir", "texto": "Ni loco: la tinta, después de la vuelta olímpica",
          "efectos": [
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": -12 },
            { "tipo": "relacion", "con": "plantel", "valor": -3 }
          ],
          "desenlace": "Te dijo \"está bien, presi\" con la misma cara que pone cuando lo cambian a los 60." },
        { "id": "escudo", "texto": "Que se tatúe el escudo, no la copa",
          "efectos": [
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": 4 },
            { "tipo": "relacion", "con": "hinchas", "valor": 6 },
            { "tipo": "fama", "pct": 1 },
            { "tipo": "programa", "movida": "pla_tatuaje_infectado", "en": [0, 0], "p": 0.12, "hereda": ["jugador"] }
          ],
          "desenlace": "El escudo quedó enorme y medio torcido. La hinchada lo ama igual. Ya hay tres pibes de la Sexta pidiendo el mismo." },
        { "id": "sin_respuesta", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": 5 },
            { "tipo": "relacion", "con": "plantel", "valor": -2 },
            { "tipo": "marca", "clave": "j.{jugador}.tatuaje_copa", "valor": true, "dura": 30 },
            { "tipo": "programa", "movida": "pla_tatuaje_infectado", "en": [0, 0], "p": 0.25, "hereda": ["jugador"] }
          ],
          "desenlace": "Como nadie le contestó, se tatuó igual. Y le puso tu cara de sorpresa en un costado." }
      ]
    },
    {
      "id": "pla_tatuaje_infectado",
      "titulo": "El gemelo de la discordia",
      "ambito": "plantel", "alcance": "jugador", "canal": "audio", "firma": "El médico del club",
      "tono": "mala", "etiquetas": ["tatuaje", "lesion"],
      "cadena": { "id": "tatuaje", "paso": 2 },
      "disparo": { "ventana": "previa", "momentos": [], "peso": 100, "enfriamiento": 20, "soloCadena": true },
      "roles": { "jugador": { "tipo": "jugador" } },
      "texto": "Audio de 1:47, resumido: el gemelo de {jugador} está hinchado como un choripán. \"Se le infectó el tatuaje. Puede jugar infiltrado, pero no te firmo nada\".",
      "vence": { "tipo": "urgente" },
      "porDefecto": "banco",
      "opciones": [
        { "id": "infiltrar", "texto": "Que juegue infiltrado: es la final",
          "efectos": [
            { "tipo": "relacion", "con": "plantel", "valor": 3 },
            { "tipo": "azar", "p": 0.35,
              "si": [
                { "tipo": "temporal", "quien": "jugador", "efecto": "lesion_media", "partidos": 4 },
                { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": -10 }
              ],
              "sino": [ { "tipo": "temporal", "quien": "jugador", "efecto": "motivado", "partidos": 1 } ],
              "desenlaceSi": "Aguantó 50 minutos y salió rengo. Lo que era un tatuaje ahora es un parte médico de tres hojas.",
              "desenlaceSino": "Jugó como si el gemelo fuera de otro. La copa del tatuaje ya no parece tan mala idea." }
          ],
          "desenlace": "Infiltración, vendaje y a la cancha." },
        { "id": "banco", "texto": "Al banco: que la mire de afuera",
          "efectos": [
            { "tipo": "temporal", "quien": "jugador", "efecto": "ausente", "partidos": 1 },
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": -8 }
          ],
          "desenlace": "La vio desde el banco con el gemelo en hielo y la cara de quien se tatuó algo que no estuvo." },
        { "id": "curandera", "texto": "Llevalo a la curandera del barrio",
          "efectos": [
            { "tipo": "azar", "p": 0.5,
              "si": [
                { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": 6 },
                { "tipo": "fama", "pct": 1 }
              ],
              "sino": [
                { "tipo": "temporal", "quien": "jugador", "efecto": "ausente", "partidos": 1 },
                { "tipo": "relacion", "con": "prensa", "valor": -4 }
              ],
              "desenlaceSi": "Cinta roja, ruda y un rezo. El gemelo bajó. Nadie entiende nada y nadie pregunta.",
              "desenlaceSino": "El gemelo siguió igual y la foto de {jugador} con la cinta roja ya está en todos los portales." }
          ],
          "desenlace": "Fueron en el auto del utilero, que conoce a la señora." },
        { "id": "medico", "texto": "Que lo vea el departamento médico a fondo",
          "requiere": { "dato": "club.edificio.medico", "op": ">=", "valor": 2 },
          "motivo": "Necesitás el departamento médico en nivel 2",
          "efectos": [ { "tipo": "jugador", "quien": "jugador", "campo": "fisico", "valor": -12 } ],
          "desenlace": "Antibiótico, drenaje y un sermón. Juega, pero con el tanque a media carga." }
      ]
    },
    {
      "id": "pla_tiktok_4am",
      "titulo": "El video de las 4:12",
      "ambito": "plantel", "alcance": "jugador", "canal": "video_vertical", "firma": "una cuenta de joda de {ciudad}",
      "tono": "mala", "etiquetas": ["joda", "escandalo", "viral"],
      "disparo": {
        "ventana": "tras_partido", "momentos": [], "peso": 8,
        "pesoSi": [ { "si": { "momento": "post_derrota" }, "x": 2 } ],
        "enfriamiento": 6, "maxTemporada": 3
      },
      "roles": {
        "jugador": { "tipo": "jugador",
          "filtro": { "dato": "jugador.edad", "op": ">=", "valor": 18 },
          "prefiere": [
            { "si": { "dato": "jugador.rasgo", "op": "tiene", "valor": "fiestero" }, "x": 4 },
            { "si": { "dato": "jugador.rasgo", "op": "tiene", "valor": "influencer" }, "x": 2 }
          ] }
      },
      "texto": "Un video de {jugador} bailando arriba de una mesa a las 4:12 ya tiene 2 millones de vistas. Detalle: era la noche antes del partido. Detalle 2: tenía puesta la camiseta del club.",
      "vence": { "tipo": "previa" },
      "porDefecto": "silencio",
      "opciones": [
        { "id": "multa", "texto": "Multa del 20 % del sueldo y disculpas públicas",
          "efectos": [
            { "tipo": "plata", "x": 0.2, "de": "sueldo_jugador", "concepto": "multas" },
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": -10 },
            { "tipo": "relacion", "con": "socios", "valor": 4 },
            { "tipo": "relacion", "con": "plantel", "valor": -3 }
          ],
          "desenlace": "Leyó un comunicado con voz de rehén. Los socios aplauden, el vestuario anota." },
        { "id": "bancar", "texto": "Bancarlo: \"Es un pibe, tiene derecho a divertirse\"",
          "efectos": [
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": 8 },
            { "tipo": "relacion", "con": "plantel", "valor": 5 },
            { "tipo": "relacion", "con": "socios", "valor": -6 },
            { "tipo": "relacion", "con": "prensa", "valor": -4 },
            { "tipo": "marca", "clave": "j.{jugador}.joda_bancada", "valor": 1, "modo": "sumar", "oculto": true }
          ],
          "desenlace": "El vestuario te banca a muerte. En la radio dicen que el club \"no tiene conducción\"." },
        { "id": "video_club", "texto": "Que el club suba el mismo baile con la mascota",
          "efectos": [
            { "tipo": "fama", "pct": 4 },
            { "tipo": "relacion", "con": "comision", "valor": -8 },
            { "tipo": "relacion", "con": "socios", "valor": -3 },
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": 4 }
          ],
          "desenlace": "La mascota bailando arriba de la mesa del buffet superó al original. La comisión directiva no se ríe." },
        { "id": "campania", "texto": "Que el community manager lo convierta en campaña",
          "requiere": { "dato": "mercado.staff.community_manager", "op": ">=", "valor": 1 },
          "motivo": "Necesitás un community manager en la oficina de prensa",
          "efectos": [
            { "tipo": "fama", "pct": 3 },
            { "tipo": "plata", "x": 0.3, "de": "ingreso_fecha", "concepto": "sponsors" },
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": -3 }
          ],
          "desenlace": "\"Bailá en la cancha, no en la mesa\": una marca de gaseosas pagó por el remate. {jugador} no está tan contento de ser el chiste." },
        { "id": "silencio", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "relacion", "con": "prensa", "valor": -6 },
            { "tipo": "relacion", "con": "socios", "valor": -4 }
          ],
          "desenlace": "El club no dijo nada y el video siguió girando. Ya hay remix con cumbia." }
      ]
    },
    {
      "id": "pla_abuela_viral",
      "titulo": "La abuela de la platea",
      "ambito": "plantel", "alcance": "jugador", "canal": "video_vertical", "firma": "un hincha desde la platea",
      "tono": "buena", "etiquetas": ["viral"],
      "disparo": {
        "ventana": "tras_partido", "momentos": [], "peso": 4,
        "pesoSi": [ { "si": { "momento": "post_victoria" }, "x": 2 } ],
        "enfriamiento": 30, "maxPartida": 1
      },
      "roles": { "jugador": { "tipo": "jugador", "filtro": { "dato": "jugador.titular", "op": "=", "valor": true } } },
      "texto": "La abuela de {jugador}, 81 años, fue filmada gritándole al línea \"¡ponete los anteojos, nene!\" durante 90 minutos. El video tiene más vistas que el partido.",
      "vence": { "tipo": "semanas", "n": 1 },
      "porDefecto": "nada",
      "opciones": [
        { "id": "palco", "texto": "Invitarla al palco, con catering y todo",
          "efectos": [
            { "tipo": "plata", "x": -0.1, "de": "ingreso_fecha", "concepto": "eventos" },
            { "tipo": "fama", "pct": 3 },
            { "tipo": "relacion", "con": "hinchas", "valor": 5 },
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": 6 }
          ],
          "desenlace": "Se comió todos los sándwiches de miga y le explicó el offside al intendente. Un éxito." },
        { "id": "campania", "texto": "Hacerla cara de la campaña de socios",
          "efectos": [
            { "tipo": "fama", "pct": 5 },
            { "tipo": "relacion", "con": "socios", "valor": 6 },
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": 3 },
            { "tipo": "azar", "p": 0.3,
              "si": [ { "tipo": "plata", "x": -0.4, "de": "ingreso_fecha", "concepto": "eventos" } ],
              "sino": [],
              "desenlaceSi": "Sorpresa: la abuela tiene representante. Es el primo de {jugador} y cobra caro.",
              "desenlaceSino": "\"Asociate, nene\" se volvió el lema del club." }
          ],
          "desenlace": "Grabaron el spot en una toma. Ella pidió una segunda \"para el perfil bueno\"." },
        { "id": "nada", "texto": "Que la abuela disfrute tranquila",
          "efectos": [
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": 2 },
            { "tipo": "relacion", "con": "hinchas", "valor": 1 }
          ],
          "desenlace": "La abuela siguió gritando desde su butaca de siempre. Así le gusta." }
      ]
    }
  ]
}
```

### staff.json

```json
{
  "ambito": "staff",
  "movidas": [
    {
      "id": "sta_dt_radio",
      "titulo": "El DT habló en la radio",
      "ambito": "staff", "alcance": "club", "canal": "radio", "firma": "{dt}",
      "tono": "mala", "etiquetas": ["escandalo"],
      "disparo": {
        "ventana": "tras_partido", "momentos": ["mercado_verano", "mercado_invierno", "arranque", "racha_mala"],
        "si": { "dato": "mercado.dt.existe", "op": "=", "valor": true },
        "peso": 6, "pesoSi": [ { "si": { "momento": "racha_mala" }, "x": 2 } ],
        "enfriamiento": 15
      },
      "roles": { "dt": { "tipo": "dt" } },
      "texto": "{dt} en la radio, a las 8 de la mañana: \"Con este plantel no me alcanza. Necesito un 9 o me voy a tener que poner los cortos yo\". El conductor se ríe. Vos no.",
      "vence": { "tipo": "previa" },
      "porDefecto": "silencio",
      "opciones": [
        { "id": "refuerzo", "texto": "Darle plata para un 9",
          "efectos": [
            { "tipo": "plata", "x": -1.0, "de": "sueldos_mes", "concepto": "compras" },
            { "tipo": "orden", "modulo": "mercado", "accion": "ofrecer_refuerzo", "datos": { "posicion": "DEL", "calidad": "titular" } },
            { "tipo": "relacion", "con": "dt", "valor": 12 },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": -2 }
          ],
          "desenlace": "{dt} sonríe en conferencia. Los delanteros que ya tenías, no tanto." },
        { "id": "callar", "texto": "Llamarlo: \"Las quejas, en el vestuario\"",
          "efectos": [
            { "tipo": "relacion", "con": "dt", "valor": -8 },
            { "tipo": "relacion", "con": "prensa", "valor": 2 },
            { "tipo": "relacion", "con": "comision", "valor": 4 }
          ],
          "desenlace": "Te atendió seco. En la próxima nota habló solo de \"intensidad\" y \"transiciones\"." },
        { "id": "contestar", "texto": "Contestarle en la misma radio, en vivo",
          "efectos": [
            { "tipo": "fama", "pct": 2 },
            { "tipo": "relacion", "con": "dt", "valor": -15 },
            { "tipo": "relacion", "con": "hinchas", "valor": 4 },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": 3 }
          ],
          "desenlace": "\"El 9 lo tiene en el plantel, que lo haga jugar\". Récord de audiencia. El vestuario se agrandó; {dt}, no." },
        { "id": "silencio", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "relacion", "con": "dt", "valor": -4 },
            { "tipo": "relacion", "con": "hinchas", "valor": -3 }
          ],
          "desenlace": "El presidente no dijo nada. En la radio ya preguntan quién manda en el club." }
      ]
    },
    {
      "id": "sta_utilero_botines",
      "titulo": "Los botines del utilero",
      "ambito": "staff", "alcance": "club", "canal": "reunion", "firma": "{utilero}",
      "tono": "mixta", "etiquetas": ["cabula"],
      "disparo": {
        "ventana": "previa", "momentos": ["previa_final", "previa_clasico"],
        "peso": 6, "enfriamiento": 20, "maxTemporada": 1
      },
      "roles": {},
      "texto": "{utilero}, 34 años en el club, entra con una bolsa de consorcio: \"Los botines nuevos que mandó el sponsor están mufados. Yo guardé los viejos, los de la última vez que ganamos algo\".",
      "vence": { "tipo": "urgente" },
      "porDefecto": "decide_el",
      "opciones": [
        { "id": "corazonada", "texto": "Le hacés caso: se juega con los viejos",
          "efectos": [
            { "tipo": "temporal", "quien": "plantel", "efecto": "cabala_activa", "partidos": 1 },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": 5 },
            { "tipo": "relacion", "con": "sponsors", "valor": -6 }
          ],
          "desenlace": "Olor a guardado en el vestuario y una fe que no se ve hace años. El sponsor mandó un mail con tres signos de pregunta." },
        { "id": "sponsor", "texto": "Con los nuevos: el sponsor paga",
          "efectos": [
            { "tipo": "relacion", "con": "sponsors", "valor": 5 },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": -3 }
          ],
          "desenlace": "{utilero} acomodó los botines nuevos uno por uno, en silencio, como en un velorio." },
        { "id": "libre", "texto": "Que cada uno elija los suyos",
          "efectos": [
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": 2 },
            { "tipo": "relacion", "con": "sponsors", "valor": -2 }
          ],
          "desenlace": "Medio equipo con los viejos, medio con los nuevos. En la foto parece un rejunte, pero todos contentos." },
        { "id": "decide_el", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [ { "tipo": "relacion", "con": "sponsors", "valor": -6 } ],
          "desenlace": "Nadie le contestó a {utilero}, así que cambió los botines él solo. El sponsor se enteró por la tele." }
      ]
    }
  ]
}
```

### sponsors.json

```json
{
  "ambito": "sponsors",
  "movidas": [
    {
      "id": "spo_apuestas_pecho",
      "titulo": "Jugadón.bet quiere el pecho",
      "ambito": "sponsors", "alcance": "club", "canal": "mail", "firma": "Jugadón.bet · Departamento de Expansión",
      "tono": "mixta", "etiquetas": ["apuestas", "oferta", "plata"],
      "disparo": {
        "ventana": "tras_partido", "momentos": ["pretemporada", "mercado_invierno", "arranque"],
        "si": { "no": { "dato": "club.sponsor.rubro", "op": "tiene", "valor": "apuestas" } },
        "peso": 5, "enfriamiento": 26, "maxTemporada": 1
      },
      "roles": {},
      "texto": "Jugadón.bet quiere el pecho de la camiseta y paga el triple que tu sponsor actual. El mail trae un GIF de un billete bailando. \"Somos una empresa familiar\", aclaran.",
      "vence": { "tipo": "semanas", "n": 2 },
      "porDefecto": "se_fueron",
      "opciones": [
        { "id": "aceptar", "texto": "Firmar: la plata no tiene camiseta",
          "efectos": [
            { "tipo": "orden", "modulo": "club", "accion": "firmar_sponsor", "datos": { "plantilla": "jugadon_bet", "espacio": "pecho", "x": 3, "de": "cuota_sponsor" } },
            { "tipo": "relacion", "con": "socios", "valor": -8 },
            { "tipo": "relacion", "con": "hinchas", "valor": -3 },
            { "tipo": "marca", "clave": "club.sponsor_apuestas", "valor": true }
          ],
          "desenlace": "La camiseta nueva tiene un logo que titila. Literal: le pusieron LEDs." },
        { "id": "manga", "texto": "Que vayan a la manga: el pecho no se toca",
          "efectos": [
            { "tipo": "orden", "modulo": "club", "accion": "firmar_sponsor", "datos": { "plantilla": "jugadon_bet", "espacio": "manga", "x": 0.6, "de": "cuota_sponsor" } },
            { "tipo": "relacion", "con": "socios", "valor": -2 },
            { "tipo": "marca", "clave": "club.sponsor_apuestas", "valor": true }
          ],
          "desenlace": "Aceptaron la manga \"como primer paso de una gran familia\". Da un poco de miedo cómo lo dicen." },
        { "id": "rechazar", "texto": "Rechazar: acá no se timbea",
          "efectos": [
            { "tipo": "relacion", "con": "socios", "valor": 5 },
            { "tipo": "relacion", "con": "hinchas", "valor": 3 },
            { "tipo": "fama", "pct": 1 }
          ],
          "desenlace": "Los socios hicieron un trapo: \"Acá no se timbea\". Una semana después Jugadón.bet firmó con {rival}." },
        { "id": "se_fueron", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [ { "tipo": "noticia", "titulo": "Jugadón.bet ya tiene club: {rival}", "importancia": 1 } ],
          "desenlace": "No contestaste el mail. Jugadón.bet se fue con {rival}." }
      ]
    },
    {
      "id": "spo_cripto_retiros",
      "titulo": "PampaCoin pausó los retiros",
      "ambito": "sponsors", "alcance": "club", "canal": "posteo", "firma": "CEO de PampaCoin",
      "tono": "mala", "etiquetas": ["cripto", "plata", "escandalo"],
      "disparo": {
        "ventana": "tras_partido", "momentos": [],
        "si": { "dato": "club.sponsor.rubro", "op": "tiene", "valor": "cripto" },
        "peso": 5, "enfriamiento": 40, "maxPartida": 2
      },
      "roles": { "sponsor": { "tipo": "sponsor", "filtro": { "dato": "sponsor.rubro", "op": "=", "valor": "cripto" } } },
      "texto": "{sponsor}, el exchange que va en tu camiseta, \"pausó temporalmente los retiros por mantenimiento\". El CEO subió un posteo desde un yate: \"Aguanten, familia\".",
      "vence": { "tipo": "semanas", "n": 1 },
      "porDefecto": "esperar",
      "opciones": [
        { "id": "rescindir", "texto": "Rescindir ya y sacar el logo",
          "efectos": [
            { "tipo": "orden", "modulo": "club", "accion": "rescindir_sponsor", "datos": { "sponsor": "{sponsor}", "motivo": "incumplimiento" } },
            { "tipo": "relacion", "con": "socios", "valor": 4 },
            { "tipo": "relacion", "con": "prensa", "valor": 2 },
            { "tipo": "implicito", "x": -0.5, "de": "cuota_sponsor", "nota": "perdés las cuotas que faltaban" }
          ],
          "desenlace": "El utilero tapó el logo con cinta de embalar. Queda horrible, pero queda digno." },
        { "id": "esperar", "texto": "Esperar: \"son problemas técnicos\"",
          "efectos": [
            { "tipo": "azar", "p": 0.5,
              "si": [
                { "tipo": "plata", "x": 0.2, "de": "cuota_sponsor", "concepto": "sponsors" },
                { "tipo": "fama", "pct": 1 }
              ],
              "sino": [
                { "tipo": "orden", "modulo": "club", "accion": "rescindir_sponsor", "datos": { "sponsor": "{sponsor}", "motivo": "quiebra" } },
                { "tipo": "relacion", "con": "socios", "valor": -8 },
                { "tipo": "fama", "pct": -2 },
                { "tipo": "relacion", "con": "prensa", "valor": -5 }
              ],
              "desenlaceSi": "Volvieron los retiros y, para que no hables, pagaron un bonus. El CEO bajó del yate.",
              "desenlaceSino": "El yate era alquilado. {sponsor} desapareció y tu camiseta sale en todos los informes sobre la estafa." }
          ],
          "desenlace": "Esperaste." },
        { "id": "en_monedas", "texto": "Que te paguen lo que deben en su moneda",
          "efectos": [
            { "tipo": "relacion", "con": "comision", "valor": -6 },
            { "tipo": "azar", "p": 0.3,
              "si": [ { "tipo": "plata", "x": 0.8, "de": "cuota_sponsor", "concepto": "sponsors" } ],
              "sino": [ { "tipo": "orden", "modulo": "club", "accion": "rescindir_sponsor", "datos": { "sponsor": "{sponsor}", "motivo": "quiebra" } } ],
              "desenlaceSi": "La moneda subió un 400 % en una tarde. El tesorero vendió todo temblando. Nadie entiende cómo, pero ganaste.",
              "desenlaceSino": "Te pagaron en monedas que hoy valen lo mismo que una figurita repetida." }
          ],
          "desenlace": "El tesorero tuvo que abrir una billetera virtual y anotó la clave en un post-it." }
      ]
    },
    {
      "id": "spo_yerba_manga",
      "titulo": "La yerba del pueblo",
      "ambito": "sponsors", "alcance": "club", "canal": "llamado", "firma": "Don Aníbal, de Yerba La Tranquera",
      "tono": "buena", "etiquetas": ["oferta"],
      "disparo": {
        "ventana": "tras_partido", "momentos": [], "peso": 5,
        "pesoSi": [ { "si": { "dato": "club.lugar", "op": "en", "valor": ["pueblo", "ciudad"] }, "x": 2 },
                    { "si": { "dato": "club.entorno", "op": "=", "valor": "campo" }, "x": 2 } ],
        "si": { "no": { "dato": "club.sponsor.espacio", "op": "tiene", "valor": "manga" } },
        "enfriamiento": 30, "maxPartida": 1
      },
      "roles": {},
      "texto": "Yerba La Tranquera, la del molino de la ruta, quiere su logo en la manga. No es mucha plata, pero Don Aníbal dice que su abuelo fundó la platea y que \"el club es de los que toman mate en la tribuna\".",
      "vence": { "tipo": "semanas", "n": 2 },
      "porDefecto": "se_enfrio",
      "opciones": [
        { "id": "aceptar", "texto": "Aceptar, con un abrazo",
          "efectos": [
            { "tipo": "orden", "modulo": "club", "accion": "firmar_sponsor", "datos": { "plantilla": "yerba_la_tranquera", "espacio": "manga", "x": 0.15, "de": "cuota_sponsor" } },
            { "tipo": "relacion", "con": "hinchas", "valor": 6 },
            { "tipo": "relacion", "con": "socios", "valor": 4 }
          ],
          "desenlace": "Don Aníbal lloró en la firma y regaló un paquete por cabeza. El vestuario huele a mate cocido." },
        { "id": "el_doble", "texto": "Pedirle el doble: la manga vale",
          "efectos": [
            { "tipo": "azar", "p": 0.4,
              "si": [
                { "tipo": "orden", "modulo": "club", "accion": "firmar_sponsor", "datos": { "plantilla": "yerba_la_tranquera", "espacio": "manga", "x": 0.3, "de": "cuota_sponsor" } },
                { "tipo": "relacion", "con": "hinchas", "valor": 3 }
              ],
              "sino": [ { "tipo": "relacion", "con": "hinchas", "valor": -3 } ],
              "desenlaceSi": "Don Aníbal se rascó la cabeza y dijo \"por el abuelo\". Trato hecho.",
              "desenlaceSino": "Don Aníbal colgó ofendido. Ahora La Tranquera patrocina la liga de bochas." }
          ],
          "desenlace": "Le pediste el doble." },
        { "id": "canje", "texto": "Canje: que pague en yerba para todo el año",
          "efectos": [
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": 4 },
            { "tipo": "relacion", "con": "hinchas", "valor": 8 },
            { "tipo": "plata", "x": 0.05, "de": "ingreso_fecha", "concepto": "sponsors" }
          ],
          "desenlace": "Llegó un camión con 900 kilos de yerba. El depósito de conos ahora es la yerbera oficial." },
        { "id": "se_enfrio", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [ { "tipo": "relacion", "con": "hinchas", "valor": -1 } ],
          "desenlace": "Don Aníbal llamó tres veces y después dejó de llamar." }
      ]
    }
  ]
}
```

### hinchas.json

```json
{
  "ambito": "hinchas",
  "movidas": [
    {
      "id": "hin_barra_micros",
      "titulo": "La barra pide lo suyo",
      "ambito": "hinchas", "alcance": "club", "canal": "audio", "firma": "{jefe_barra}",
      "tono": "mala", "etiquetas": ["barra"],
      "cadena": { "id": "barra", "paso": 1 },
      "disparo": {
        "ventana": "tras_partido", "momentos": ["previa_final", "previa_clasico"],
        "peso": 7, "enfriamiento": 12, "maxTemporada": 2
      },
      "roles": {},
      "texto": "Audio de {jefe_barra}, con bombos de fondo: \"Presi, para el partido necesitamos 4 micros y 300 entradas. Nosotros ponemos el aliento, ustedes el resto. Es lo que corresponde, ¿no?\"",
      "vence": { "tipo": "previa" },
      "porDefecto": "visto",
      "opciones": [
        { "id": "dar", "texto": "Dárselo todo: es el clásico",
          "efectos": [
            { "tipo": "plata", "x": -0.6, "de": "ingreso_fecha", "concepto": "eventos" },
            { "tipo": "relacion", "con": "barra", "valor": 15 },
            { "tipo": "club_temporal", "efecto": "aguante_extra", "partidos": 1 },
            { "tipo": "marca", "clave": "club.favores_barra", "valor": 1, "modo": "sumar" },
            { "tipo": "programa", "movida": "afa_tribunal_disciplina", "en": [1, 2], "p": 0.3 }
          ],
          "desenlace": "Cuatro micros pintados con tu cara. El aliento fue impresionante. Lo que pasó en la autopista, mejor no preguntar." },
        { "id": "negar", "texto": "Ni un peso: que paguen como todos",
          "efectos": [
            { "tipo": "relacion", "con": "barra", "valor": -20 },
            { "tipo": "relacion", "con": "socios", "valor": 5 },
            { "tipo": "relacion", "con": "prensa", "valor": 3 },
            { "tipo": "programa", "movida": "hin_barra_aprieta_dt", "en": [1, 2], "p": 0.6 }
          ],
          "desenlace": "Del otro lado del audio, un silencio largo. Después, un \"está bien, presi\" que no suena nada bien." },
        { "id": "mitad", "texto": "Micros sí, entradas no",
          "efectos": [
            { "tipo": "plata", "x": -0.25, "de": "ingreso_fecha", "concepto": "eventos" },
            { "tipo": "relacion", "con": "barra", "valor": -5 },
            { "tipo": "programa", "movida": "hin_barra_aprieta_dt", "en": [1, 2], "p": 0.25 },
            { "tipo": "programa", "movida": "afa_tribunal_disciplina", "en": [1, 2], "p": 0.1 }
          ],
          "desenlace": "Aceptaron los micros \"por ahora\". Te mandaron un sticker de un pulgar que no se sabe si es ironía." },
        { "id": "fiscalia", "texto": "Mandar el audio a la fiscalía",
          "requiere": { "dato": "mercado.staff.abogado", "op": ">=", "valor": 1 },
          "motivo": "Necesitás un abogado en la sede",
          "efectos": [
            { "tipo": "relacion", "con": "barra", "valor": -30 },
            { "tipo": "relacion", "con": "socios", "valor": 8 },
            { "tipo": "relacion", "con": "municipio", "valor": 5 },
            { "tipo": "fama", "pct": 2 },
            { "tipo": "programa", "movida": "hin_barra_aprieta_dt", "en": [1, 3], "p": 0.8 }
          ],
          "desenlace": "Saliste en todos lados como \"el presidente que se plantó\". La barra también lo vio." },
        { "id": "visto", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "relacion", "con": "barra", "valor": -12 },
            { "tipo": "programa", "movida": "hin_barra_aprieta_dt", "en": [1, 2], "p": 0.5 }
          ],
          "desenlace": "Le clavaste el visto a {jefe_barra}. Él te lo anotó." }
      ]
    },
    {
      "id": "hin_barra_aprieta_dt",
      "titulo": "Visita en el entrenamiento",
      "ambito": "hinchas", "alcance": "club", "canal": "diario", "firma": "{diario}",
      "tono": "mala", "etiquetas": ["barra", "violencia", "escandalo"],
      "cadena": { "id": "barra", "paso": 2 },
      "disparo": {
        "ventana": "tras_partido", "momentos": [], "peso": 100, "enfriamiento": 12, "soloCadena": true,
        "si": { "dato": "mercado.dt.existe", "op": "=", "valor": true }
      },
      "roles": {
        "dt": { "tipo": "dt" },
        "jugador": { "tipo": "jugador", "prefiere": [ { "si": { "dato": "jugador.capitan", "op": "=", "valor": true }, "x": 5 } ] }
      },
      "texto": "Según {diario}, un grupo de la barra entró al entrenamiento y \"charló\" con {dt} y con {jugador}. No pasó a mayores, pero el preparador físico se escondió en el depósito de conos y todavía no salió.",
      "vence": { "tipo": "previa" },
      "porDefecto": "silencio",
      "opciones": [
        { "id": "denuncia", "texto": "Denuncia y seguridad privada en los entrenamientos",
          "efectos": [
            { "tipo": "plata", "x": -0.5, "de": "ingreso_fecha", "concepto": "seguridad" },
            { "tipo": "relacion", "con": "barra", "valor": -15 },
            { "tipo": "relacion", "con": "socios", "valor": 6 },
            { "tipo": "relacion", "con": "dt", "valor": 6 },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": 4 }
          ],
          "desenlace": "Ahora hay dos patovicas en la puerta del predio. Uno pidió probarse de 5." },
        { "id": "arreglar", "texto": "Juntarte con {jefe_barra} y \"arreglar\"",
          "efectos": [
            { "tipo": "relacion", "con": "barra", "valor": 15 },
            { "tipo": "relacion", "con": "dt", "valor": -10 },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": -6 },
            { "tipo": "marca", "clave": "club.pacto_barra", "valor": true, "dura": 40 },
            { "tipo": "programa", "movida": "afa_tribunal_disciplina", "en": [2, 4], "p": 0.35 }
          ],
          "desenlace": "Asado en un quincho sin ventanas. Quedaron \"en buenos términos\". {dt} no te saluda." },
        { "id": "puertas_cerradas", "texto": "Entrenar a puertas cerradas en otro predio",
          "efectos": [
            { "tipo": "plata", "x": -0.3, "de": "ingreso_fecha", "concepto": "alquileres" },
            { "tipo": "temporal", "quien": "plantel", "efecto": "entrenamiento_reducido", "partidos": 2 },
            { "tipo": "relacion", "con": "barra", "valor": -5 },
            { "tipo": "relacion", "con": "dt", "valor": 2 }
          ],
          "desenlace": "Alquilaste la cancha de un colegio. Entrenan entre el arco y el mástil de la bandera." },
        { "id": "silencio", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": -8 },
            { "tipo": "relacion", "con": "dt", "valor": -8 },
            { "tipo": "relacion", "con": "barra", "valor": 3 }
          ],
          "desenlace": "El club no dijo nada. En el vestuario lo entendieron perfecto." }
      ]
    }
  ]
}
```

### afa.json

```json
{
  "ambito": "afa",
  "movidas": [
    {
      "id": "afa_tribunal_disciplina",
      "titulo": "Expediente en el Tribunal",
      "ambito": "afa", "alcance": "club", "canal": "comunicado", "firma": "Tribunal de Disciplina de {federacion}",
      "tono": "mala", "etiquetas": ["legal", "barra"],
      "cadena": { "id": "barra", "paso": 3 },
      "disparo": { "ventana": "tras_partido", "momentos": [], "peso": 100, "enfriamiento": 6, "soloCadena": true },
      "roles": {},
      "texto": "El Tribunal de Disciplina abrió un expediente por \"incidentes vinculados a la parcialidad de {club}\". Piden clausurar la popular por 2 partidos y una multa que preferimos no escribir.",
      "vence": { "tipo": "semanas", "n": 1 },
      "porDefecto": "aceptar",
      "opciones": [
        { "id": "aceptar", "texto": "Aceptar la sanción y dar vuelta la página",
          "efectos": [
            { "tipo": "club_temporal", "efecto": "tribuna_cerrada", "partidos": 2, "datos": { "sector": "popular" } },
            { "tipo": "plata", "x": -1.0, "de": "ingreso_fecha", "concepto": "multas" },
            { "tipo": "relacion", "con": "afa", "valor": 4 }
          ],
          "desenlace": "Dos partidos con la popular vacía. Se escucha a los suplentes hablar entre ellos." },
        { "id": "apelar", "texto": "Apelar con el abogado del club",
          "requiere": { "dato": "mercado.staff.abogado", "op": ">=", "valor": 1 },
          "motivo": "Necesitás un abogado en la sede",
          "efectos": [
            { "tipo": "plata", "x": -0.3, "de": "ingreso_fecha", "concepto": "honorarios" },
            { "tipo": "azar", "p": 0.6,
              "si": [
                { "tipo": "club_temporal", "efecto": "tribuna_cerrada", "partidos": 1, "datos": { "sector": "popular" } },
                { "tipo": "plata", "x": -0.5, "de": "ingreso_fecha", "concepto": "multas" }
              ],
              "sino": [
                { "tipo": "club_temporal", "efecto": "tribuna_cerrada", "partidos": 2, "datos": { "sector": "popular" } },
                { "tipo": "plata", "x": -1.0, "de": "ingreso_fecha", "concepto": "multas" },
                { "tipo": "relacion", "con": "afa", "valor": -3 }
              ],
              "desenlaceSi": "El abogado encontró un error de tipeo en el expediente. Te bajaron la mitad.",
              "desenlaceSino": "El Tribunal confirmó todo y agregó una frase sobre \"la insistencia\" del club." }
          ],
          "desenlace": "Presentaron 40 fojas." },
        { "id": "hablar", "texto": "Hablar \"con quien corresponde\"",
          "efectos": [
            { "tipo": "azar", "p": 0.65,
              "si": [
                { "tipo": "plata", "x": -0.2, "de": "ingreso_fecha", "concepto": "multas" },
                { "tipo": "relacion", "con": "afa", "valor": 2 },
                { "tipo": "marca", "clave": "club.favor_federacion", "valor": 1, "modo": "sumar" }
              ],
              "sino": [
                { "tipo": "club_temporal", "efecto": "tribuna_cerrada", "partidos": 3, "datos": { "sector": "popular" } },
                { "tipo": "plata", "x": -1.0, "de": "ingreso_fecha", "concepto": "multas" },
                { "tipo": "relacion", "con": "prensa", "valor": -10 },
                { "tipo": "fama", "pct": -3 }
              ],
              "desenlaceSi": "Quedó en una multa simbólica. {presidente_federacion} te palmeó la espalda y dijo \"después hablamos\". Eso se paga.",
              "desenlaceSino": "Se filtró el audio. Tres partidos de clausura y tu foto en el noticiero de la noche." }
          ],
          "desenlace": "Un café en un bar sin cartel." }
      ]
    },
    {
      "id": "afa_lunes_13hs",
      "titulo": "Lunes a las 13",
      "ambito": "afa", "alcance": "club", "canal": "comunicado", "firma": "{federacion}",
      "tono": "mala", "etiquetas": [],
      "disparo": {
        "ventana": "tras_partido", "momentos": [],
        "si": { "dato": "liga.proximo.local", "op": "=", "valor": true },
        "peso": 5, "enfriamiento": 10, "maxTemporada": 2
      },
      "roles": { "rival": { "tipo": "rival", "filtro": { "dato": "rival.es_proximo", "op": "=", "valor": true } } },
      "texto": "{federacion} publicó la programación: {club} vs. {rival}, lunes a las 13 h, \"por pedido de la TV\". Tu jefe de prensa pregunta si es joda. No es joda.",
      "vence": { "tipo": "previa" },
      "porDefecto": "aceptar",
      "opciones": [
        { "id": "protestar", "texto": "Protestar por todos los medios",
          "efectos": [
            { "tipo": "relacion", "con": "afa", "valor": -8 },
            { "tipo": "relacion", "con": "hinchas", "valor": 4 },
            { "tipo": "azar", "p": 0.3,
              "si": [],
              "sino": [ { "tipo": "orden", "modulo": "economia", "accion": "modificar_demanda", "datos": { "factor": 0.65, "partidos": 1 } } ],
              "desenlaceSi": "Milagro: lo pasaron al domingo a las 17. Nadie sabe bien por qué.",
              "desenlaceSino": "Te contestaron con un comunicado de dos líneas. Lunes a las 13, igual." }
          ],
          "desenlace": "Saliste en tres radios." },
        { "id": "aceptar", "texto": "Aceptar y no hacer olas",
          "efectos": [
            { "tipo": "orden", "modulo": "economia", "accion": "modificar_demanda", "datos": { "factor": 0.65, "partidos": 1 } },
            { "tipo": "relacion", "con": "afa", "valor": 5 }
          ],
          "desenlace": "Media cancha vacía y un vendedor de garrapiñada que vendió más que el buffet." },
        { "id": "asueto", "texto": "Pedirle a {intendente} que decrete asueto",
          "requiere": { "dato": "club.relacion.municipio", "op": ">=", "valor": 50 },
          "motivo": "Necesitás buena relación con el municipio",
          "efectos": [
            { "tipo": "relacion", "con": "municipio", "valor": -6 },
            { "tipo": "relacion", "con": "hinchas", "valor": 6 },
            { "tipo": "fama", "pct": 2 }
          ],
          "desenlace": "\"Asueto deportivo municipal\". Los bancos cerraron, el estadio se llenó y {intendente} ya habla de reelección." }
      ]
    }
  ]
}
```

### politica.json

```json
{
  "ambito": "politica",
  "movidas": [
    {
      "id": "pol_oposicion_lista",
      "titulo": "La oposición arma lista",
      "ambito": "politica", "alcance": "club", "canal": "diario", "firma": "{diario}",
      "tono": "mala", "etiquetas": ["politica"],
      "cadena": { "id": "oposicion", "paso": 1 },
      "disparo": {
        "ventana": "tras_partido", "momentos": ["elecciones", "racha_mala", "crisis_caja"],
        "peso": 6, "pesoSi": [ { "si": { "dato": "club.relacion.socios", "op": "<", "valor": 40 }, "x": 2 } ],
        "enfriamiento": 26, "maxTemporada": 1
      },
      "roles": {},
      "texto": "{opositor} lanzó la lista \"Volver a Ser {club}\" en el buffet, con choripán gratis y una presentación titulada \"El vaciamiento\". Dice que usás la caja del club \"como si fuera la de tu casa\".",
      "vence": { "tipo": "semanas", "n": 2 },
      "porDefecto": "ignorar",
      "opciones": [
        { "id": "debate", "texto": "Desafiarlo a un debate en la sede",
          "efectos": [
            { "tipo": "fama", "pct": 1 },
            { "tipo": "azar", "p": { "base": 0.5, "ajustes": [ { "si": { "dato": "club.relacion.socios", "op": ">=", "valor": 60 }, "suma": 0.2 } ] },
              "si": [
                { "tipo": "relacion", "con": "socios", "valor": 10 },
                { "tipo": "marca", "clave": "temporada.oposicion_debil", "valor": true }
              ],
              "sino": [
                { "tipo": "relacion", "con": "socios", "valor": -10 },
                { "tipo": "programa", "movida": "pol_firmas_asamblea", "en": [2, 4], "p": 0.8 }
              ],
              "desenlaceSi": "Le preguntaste cuántas veces vino a la cancha este año. Dijo \"muchas\". Le mostraste el registro de molinetes: cero.",
              "desenlaceSino": "Llevó gráficos de torta. Vos llevaste fe. Ganó el de los gráficos." }
          ],
          "desenlace": "El salón de la sede, repleto." },
        { "id": "mostrar_obra", "texto": "Apurar la obra para mostrar gestión",
          "requiere": { "dato": "club.obra.activa", "op": "=", "valor": true },
          "motivo": "No hay ninguna obra en curso",
          "efectos": [
            { "tipo": "obra", "fechas": -2 },
            { "tipo": "plata", "x": -0.8, "de": "ingreso_fecha", "concepto": "obras" },
            { "tipo": "relacion", "con": "socios", "valor": 8 },
            { "tipo": "programa", "movida": "pol_firmas_asamblea", "en": [2, 4], "p": 0.3 }
          ],
          "desenlace": "Turnos dobles, horas extra y un cartel gigante: \"ESTO ES GESTIÓN\"." },
        { "id": "ignorar", "texto": "Ignorarlo: el que labura no tiene tiempo para chori",
          "efectos": [
            { "tipo": "relacion", "con": "socios", "valor": -3 },
            { "tipo": "relacion", "con": "comision", "valor": 3 },
            { "tipo": "programa", "movida": "pol_firmas_asamblea", "en": [2, 4], "p": 0.6 }
          ],
          "desenlace": "No dijiste nada. {opositor} dijo que tu silencio \"lo dice todo\"." },
        { "id": "balance", "texto": "Publicar el balance auditado",
          "requiere": { "dato": "mercado.staff.contador", "op": ">=", "valor": 1 },
          "motivo": "Necesitás un contador en la sede",
          "efectos": [
            { "tipo": "plata", "x": -0.2, "de": "ingreso_fecha", "concepto": "honorarios" },
            { "tipo": "relacion", "con": "socios", "valor": 6 },
            { "tipo": "relacion", "con": "prensa", "valor": 4 },
            { "tipo": "programa", "movida": "pol_firmas_asamblea", "en": [2, 4], "p": 0.2 }
          ],
          "desenlace": "Ochenta páginas con sello. Nadie las leyó, pero que existen, existen." }
      ]
    },
    {
      "id": "pol_firmas_asamblea",
      "titulo": "Juntaron las firmas",
      "ambito": "politica", "alcance": "club", "canal": "carta_documento", "firma": "{opositor} y 1.312 socios",
      "tono": "mala", "etiquetas": ["politica", "legal"],
      "cadena": { "id": "oposicion", "paso": 2 },
      "disparo": { "ventana": "tras_partido", "momentos": [], "peso": 100, "enfriamiento": 26, "soloCadena": true },
      "roles": {},
      "texto": "Carta documento con 1.312 firmas pidiendo una asamblea extraordinaria para \"revisar la gestión\". Algunas firmas son de socios que fallecieron en 1998, pero el entusiasmo está.",
      "vence": { "tipo": "semanas", "n": 2 },
      "porDefecto": "autoconvocada",
      "opciones": [
        { "id": "convocar", "texto": "Convocar la asamblea y dar la cara",
          "efectos": [
            { "tipo": "azar", "p": { "base": 0.5, "ajustes": [ { "si": { "dato": "club.relacion.socios", "op": ">=", "valor": 55 }, "suma": 0.2 } ] },
              "si": [
                { "tipo": "relacion", "con": "socios", "valor": 12 },
                { "tipo": "relacion", "con": "comision", "valor": 8 },
                { "tipo": "marca", "clave": "club.mandato", "valor": "firme" }
              ],
              "sino": [
                { "tipo": "relacion", "con": "socios", "valor": -8 },
                { "tipo": "relacion", "con": "comision", "valor": -10 },
                { "tipo": "fama", "pct": -2 },
                { "tipo": "marca", "clave": "club.mandato", "valor": "debil" }
              ],
              "desenlaceSi": "Hablaste 40 minutos sin papel. Terminó con aplausos y un socio de 90 años gritando \"¡presidente!\".",
              "desenlaceSino": "Te abuchearon desde el \"buenas noches\". Seguís, pero con la comisión mirándote de reojo." }
          ],
          "desenlace": "Asamblea en el gimnasio, con sillas plásticas y micrófono que acopla." },
        { "id": "impugnar", "texto": "Impugnar las firmas truchas",
          "requiere": { "dato": "mercado.staff.abogado", "op": ">=", "valor": 1 },
          "motivo": "Necesitás un abogado en la sede",
          "efectos": [
            { "tipo": "relacion", "con": "socios", "valor": -4 },
            { "tipo": "relacion", "con": "prensa", "valor": -3 },
            { "tipo": "azar", "p": 0.7,
              "si": [ { "tipo": "marca", "clave": "temporada.oposicion_debil", "valor": true } ],
              "sino": [ { "tipo": "relacion", "con": "socios", "valor": -12 } ],
              "desenlaceSi": "La Justicia anuló 700 firmas. {opositor} dice que es \"proscripción\".",
              "desenlaceSino": "Las firmas eran válidas. Ahora además quedaste como el que no quiere votar." }
          ],
          "desenlace": "Presentaste el escrito." },
        { "id": "sumarlo", "texto": "Sumar a {opositor} a la comisión directiva",
          "efectos": [
            { "tipo": "relacion", "con": "socios", "valor": 6 },
            { "tipo": "relacion", "con": "comision", "valor": -8 },
            { "tipo": "marca", "clave": "club.opositor_adentro", "valor": true, "dura": 52 }
          ],
          "desenlace": "{opositor} ahora es vocal tercero. Llegó a la primera reunión con una carpeta que dice \"pruebas\"." },
        { "id": "autoconvocada", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "azar", "p": 0.35,
              "si": [ { "tipo": "relacion", "con": "socios", "valor": 4 } ],
              "sino": [
                { "tipo": "relacion", "con": "socios", "valor": -12 },
                { "tipo": "marca", "clave": "club.mandato", "valor": "debil" }
              ],
              "desenlaceSi": "La asamblea se autoconvocó, no hubo quórum y se terminó comiendo pizza.",
              "desenlaceSino": "La asamblea se hizo sin vos. Votaron una \"moción de desconfianza\" que no sabés bien qué hace, pero suena mal." }
          ],
          "desenlace": "No contestaste la carta." }
      ]
    },
    {
      "id": "pol_fondo_sad",
      "titulo": "Los del chaleco de plumas",
      "ambito": "politica", "alcance": "club", "canal": "reunion", "firma": "Horizonte Dorado Capital",
      "tono": "mixta", "etiquetas": ["oferta", "plata", "politica"],
      "disparo": {
        "ventana": "tras_partido", "momentos": [],
        "si": { "no": { "marca": "club.sad" } },
        "peso": 2, "pesoSi": [ { "si": { "momento": "crisis_caja" }, "x": 4 } ],
        "enfriamiento": 52, "maxPartida": 2
      },
      "roles": {},
      "texto": "Tres señores de traje, uno con chaleco de plumas, quieren comprar el 49 % del club. \"Queremos profesionalizar la pasión\". Traen un cheque, un render del estadio con techo y cero idea de quién es el ídolo del club.",
      "vence": { "tipo": "semanas", "n": 3 },
      "porDefecto": "se_van",
      "opciones": [
        { "id": "vender", "texto": "Vender el 49 % y agarrar la plata",
          "efectos": [
            { "tipo": "plata", "x": 20, "de": "ingreso_fecha", "concepto": "inversiones" },
            { "tipo": "relacion", "con": "socios", "valor": -25 },
            { "tipo": "relacion", "con": "hinchas", "valor": -15 },
            { "tipo": "relacion", "con": "comision", "valor": 10 },
            { "tipo": "marca", "clave": "club.sad", "valor": true }
          ],
          "desenlace": "La plata entró. El chaleco de plumas ahora tiene oficina en la sede y pidió cambiar el himno \"por algo más global\"." },
        { "id": "asamblea", "texto": "Que decidan los socios en asamblea",
          "efectos": [
            { "tipo": "relacion", "con": "socios", "valor": 5 },
            { "tipo": "azar", "p": 0.4,
              "si": [
                { "tipo": "plata", "x": 16, "de": "ingreso_fecha", "concepto": "inversiones" },
                { "tipo": "relacion", "con": "hinchas", "valor": -6 },
                { "tipo": "marca", "clave": "club.sad", "valor": true }
              ],
              "sino": [ { "tipo": "fama", "pct": 1 } ],
              "desenlaceSi": "Los socios votaron que sí, por poco. El fondo bajó un poco la oferta \"por la demora\".",
              "desenlaceSino": "Los socios votaron que no, con bombos. El fondo se fue a buscar otro club." }
          ],
          "desenlace": "Asamblea histórica." },
        { "id": "rechazar", "texto": "\"El club es de los socios\"",
          "efectos": [
            { "tipo": "relacion", "con": "socios", "valor": 10 },
            { "tipo": "relacion", "con": "hinchas", "valor": 8 },
            { "tipo": "fama", "pct": 1 }
          ],
          "desenlace": "Les devolviste el render. Afuera, alguien ya pintó la frase en una pared." },
        { "id": "se_van", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [],
          "desenlace": "Esperaron tres semanas y se fueron a comprar un club de básquet." }
      ]
    }
  ]
}
```

### ciudad.json

```json
{
  "ambito": "ciudad",
  "movidas": [
    {
      "id": "ciu_intendente_foto",
      "titulo": "El intendente quiere la foto",
      "ambito": "ciudad", "alcance": "club", "canal": "llamado", "firma": "{intendente}",
      "tono": "mixta", "etiquetas": ["politica"],
      "disparo": {
        "ventana": "tras_partido", "momentos": [],
        "si": { "dato": "club.obra.terminada_hace", "op": "<=", "valor": 2 },
        "peso": 7, "enfriamiento": 15
      },
      "roles": {},
      "texto": "{intendente} quiere cortar la cinta de la obra nueva \"en representación de todos los vecinos\". Ya mandó al fotógrafo, a la banda municipal y a un primo que tiene drones.",
      "vence": { "tipo": "previa" },
      "porDefecto": "se_colo",
      "opciones": [
        { "id": "dejar", "texto": "Que corte la cinta, total no cuesta nada",
          "efectos": [
            { "tipo": "relacion", "con": "municipio", "valor": 12 },
            { "tipo": "relacion", "con": "socios", "valor": -5 },
            { "tipo": "fama", "pct": 2 }
          ],
          "desenlace": "Salió en la foto más que el presidente. La banda municipal tocó la marcha peronista y el himno del club, en ese orden." },
        { "id": "no", "texto": "No: la obra la pagaron los socios",
          "efectos": [
            { "tipo": "relacion", "con": "municipio", "valor": -12 },
            { "tipo": "relacion", "con": "socios", "valor": 4 },
            { "tipo": "marca", "clave": "club.municipio_traba", "valor": true, "dura": 10 }
          ],
          "desenlace": "Cortó la cinta un socio de 1962. {intendente} anotó tu nombre en una libretita." },
        { "id": "a_cambio", "texto": "Que corte la cinta si asfalta la calle del club",
          "efectos": [
            { "tipo": "azar", "p": 0.5,
              "si": [
                { "tipo": "relacion", "con": "municipio", "valor": 4 },
                { "tipo": "relacion", "con": "hinchas", "valor": 5 },
                { "tipo": "relacion", "con": "socios", "valor": 3 }
              ],
              "sino": [ { "tipo": "relacion", "con": "municipio", "valor": -6 } ],
              "desenlaceSi": "Asfaltaron la cuadra en dos días. Justo la cuadra, ni un metro más.",
              "desenlaceSino": "{intendente} dijo que \"no negocia con la foto\" y no vino. Ofendido, pero ofendido de verdad." }
          ],
          "desenlace": "Le planteaste el trato." },
        { "id": "se_colo", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "relacion", "con": "municipio", "valor": 6 },
            { "tipo": "relacion", "con": "socios", "valor": -8 }
          ],
          "desenlace": "No contestaste y {intendente} vino igual. Cortó la cinta, dio un discurso y se fue antes de que llegaras." }
      ]
    },
    {
      "id": "ciu_nevada",
      "titulo": "Sesenta centímetros de nieve",
      "ambito": "ciudad", "alcance": "club", "canal": "audio", "firma": "el canchero",
      "tono": "mala", "etiquetas": ["clima"],
      "disparo": {
        "ventana": "previa", "momentos": [],
        "si": { "alguna": [
          { "dato": "club.entorno", "op": "=", "valor": "frio" },
          { "todas": [ { "dato": "club.entorno", "op": "=", "valor": "montana" }, { "dato": "tiempo.estacion", "op": "=", "valor": "invierno" } ] }
        ] },
        "peso": 6, "pesoSi": [ { "si": { "dato": "liga.proximo.local", "op": "=", "valor": true }, "x": 3 } ],
        "enfriamiento": 6, "maxTemporada": 3
      },
      "roles": {},
      "texto": "Cayeron 60 centímetros de nieve sobre la cancha. El canchero mide con una regla de escuela: \"Jugable, si son pingüinos\". El partido es en 20 horas.",
      "vence": { "tipo": "urgente" },
      "porDefecto": "jugar",
      "opciones": [
        { "id": "postergar", "texto": "Pedirle a {federacion} que lo postergue",
          "efectos": [
            { "tipo": "orden", "modulo": "liga", "accion": "postergar_partido", "datos": { "partido": "proximo" } },
            { "tipo": "relacion", "con": "afa", "valor": -3 },
            { "tipo": "relacion", "con": "hinchas", "valor": -2 }
          ],
          "desenlace": "Postergado. Ahora se juega un miércoles en el medio de la copa, que es otro problema." },
        { "id": "palear", "texto": "Convocar a los hinchas a palear: chori para el que traiga pala",
          "efectos": [
            { "tipo": "plata", "x": -0.1, "de": "ingreso_fecha", "concepto": "eventos" },
            { "tipo": "relacion", "con": "hinchas", "valor": 10 },
            { "tipo": "fama", "pct": 2 },
            { "tipo": "azar", "p": 0.3,
              "si": [ { "tipo": "club_temporal", "efecto": "cancha_pesada", "partidos": 1 } ],
              "sino": [],
              "desenlaceSi": "La cancha quedó despejada pero hecha un barrial.",
              "desenlaceSino": "Quedó impecable. Dos hinchas pidieron ser canchero honorario." }
          ],
          "desenlace": "Llegaron 400 personas con palas, baldes y una barredora que nadie sabe de dónde salió." },
        { "id": "jugar", "texto": "Se juega igual: la nieve es nuestra",
          "efectos": [
            { "tipo": "club_temporal", "efecto": "cancha_nevada", "partidos": 1 },
            { "tipo": "relacion", "con": "afa", "valor": 2 },
            { "tipo": "azar", "p": 0.25,
              "si": [ { "tipo": "temporal", "quien": "titular_al_azar", "efecto": "lesion_leve", "partidos": 2 } ],
              "sino": [],
              "desenlaceSi": "Un patinazo en el córner y un titular afuera dos partidos.",
              "desenlaceSino": "Pelota naranja, visitantes en guantes y vos tomando café en el palco." }
          ],
          "desenlace": "Se jugó." }
      ]
    },
    {
      "id": "ciu_recital",
      "titulo": "Cuarteto en el estadio",
      "ambito": "ciudad", "alcance": "club", "canal": "mail", "firma": "Producciones La Previa",
      "tono": "buena", "etiquetas": ["oferta", "plata"],
      "disparo": {
        "ventana": "tras_partido", "momentos": [],
        "si": { "dato": "club.estadio.categoria", "op": ">=", "valor": 2 },
        "peso": 4, "pesoSi": [ { "si": { "momento": "receso" }, "x": 3 } ],
        "enfriamiento": 15, "maxTemporada": 2
      },
      "roles": {},
      "texto": "La banda de cuarteto La Previa quiere hacer dos shows en tu estadio. Prometen \"respeto absoluto por el césped\" y piden 400 toallas blancas, 30 cajas de fernet y un camarín \"con onda\".",
      "vence": { "tipo": "semanas", "n": 2 },
      "porDefecto": "se_fueron",
      "opciones": [
        { "id": "aceptar", "texto": "Aceptar: que bailen en la cancha",
          "efectos": [
            { "tipo": "plata", "x": 2.5, "de": "recaudacion", "concepto": "eventos" },
            { "tipo": "fama", "pct": 3 },
            { "tipo": "club_temporal", "efecto": "cesped_danado", "partidos": 2 },
            { "tipo": "relacion", "con": "municipio", "valor": -4 }
          ],
          "desenlace": "Dos noches llenas. El césped quedó como pista de baile, porque fue una pista de baile." },
        { "id": "popular", "texto": "Aceptar, pero con el escenario sobre la popular",
          "efectos": [
            { "tipo": "plata", "x": 1.6, "de": "recaudacion", "concepto": "eventos" },
            { "tipo": "fama", "pct": 2 },
            { "tipo": "club_temporal", "efecto": "tribuna_cerrada", "partidos": 1, "datos": { "sector": "popular" } },
            { "tipo": "relacion", "con": "municipio", "valor": -4 }
          ],
          "desenlace": "Menos gente, césped intacto. El desarme de la popular tardó más de lo prometido." },
        { "id": "rechazar", "texto": "Rechazar: la cancha es sagrada",
          "efectos": [ { "tipo": "relacion", "con": "hinchas", "valor": 3 } ],
          "desenlace": "La Previa tocó en el estadio de {rival}. Se escuchaba desde tu sede." },
        { "id": "se_fueron", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [ { "tipo": "noticia", "titulo": "La Previa llenó dos veces la cancha de {rival}", "importancia": 1 } ],
          "desenlace": "No contestaste el mail. La Previa tocó en otro lado." }
      ]
    }
  ]
}
```

### prensa.json

```json
{
  "ambito": "prensa",
  "movidas": [
    {
      "id": "pre_deepfake",
      "titulo": "El video que no es",
      "ambito": "prensa", "alcance": "jugador", "canal": "video_vertical", "firma": "cuenta anónima",
      "tono": "mala", "etiquetas": ["escandalo", "viral", "legal"],
      "disparo": {
        "ventana": "tras_partido", "momentos": [],
        "si": { "dato": "mercado.dt.existe", "op": "=", "valor": true },
        "peso": 4, "enfriamiento": 20, "maxTemporada": 1
      },
      "roles": {
        "jugador": { "tipo": "jugador", "prefiere": [ { "si": { "dato": "jugador.estrellas", "op": ">=", "valor": 4 }, "x": 3 } ] },
        "dt": { "tipo": "dt" }
      },
      "texto": "Circula un video de {jugador} diciendo que {dt} \"no sabe armar ni un rondo\". Es falso: parpadea con un solo ojo y tiene seis dedos. Igual ya lo vieron 800 mil personas.",
      "vence": { "tipo": "previa" },
      "porDefecto": "ignorar",
      "opciones": [
        { "id": "desmentir", "texto": "Video del club: {jugador} y {dt} tomando mate",
          "efectos": [
            { "tipo": "plata", "x": -0.1, "de": "ingreso_fecha", "concepto": "prensa" },
            { "tipo": "relacion", "con": "prensa", "valor": 3 },
            { "tipo": "azar", "p": 0.3,
              "si": [ { "tipo": "fama", "pct": -2 }, { "tipo": "relacion", "con": "dt", "valor": -4 } ],
              "sino": [ { "tipo": "fama", "pct": 1 } ],
              "desenlaceSi": "El video del mate salió tan forzado que la gente cree que el falso es este.",
              "desenlaceSino": "Mate, risas y un \"fake\" en letras gigantes. Asunto cerrado." }
          ],
          "desenlace": "Grabaron en el banco de suplentes." },
        { "id": "contraataque", "texto": "Subir un deepfake propio: {dt} bailando cuarteto",
          "efectos": [
            { "tipo": "fama", "pct": 5 },
            { "tipo": "relacion", "con": "comision", "valor": -6 },
            { "tipo": "relacion", "con": "dt", "valor": -5 },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": 3 }
          ],
          "desenlace": "Nadie se acuerda del video falso. Todos se acuerdan de {dt} haciendo el pasito. {dt}, también." },
        { "id": "demandar", "texto": "Demandar a la cuenta y pedir que la bajen",
          "requiere": { "dato": "mercado.staff.abogado", "op": ">=", "valor": 1 },
          "motivo": "Necesitás un abogado en la sede",
          "efectos": [
            { "tipo": "plata", "x": -0.3, "de": "ingreso_fecha", "concepto": "honorarios" },
            { "tipo": "relacion", "con": "prensa", "valor": 2 },
            { "tipo": "relacion", "con": "dt", "valor": 4 },
            { "tipo": "azar", "p": 0.3,
              "si": [ { "tipo": "fama", "pct": 3 } ], "sino": [],
              "desenlaceSi": "La cuenta era de un hincha de {rival}. La noticia hizo más ruido que el video.",
              "desenlaceSino": "Bajaron el video. Del autor, ni noticias." }
          ],
          "desenlace": "Carta documento digital, que es como una carta documento pero con más vergüenza ajena." },
        { "id": "ignorar", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "azar", "p": 0.5,
              "si": [ { "tipo": "relacion", "con": "dt", "valor": -8 }, { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": -4 } ],
              "sino": [],
              "desenlaceSi": "{dt} vio el video. Creyó un 30 % del video, que es suficiente.",
              "desenlaceSino": "Al tercer día apareció un video de un gato y nadie se acordó más." }
          ],
          "desenlace": "No dijiste nada." }
      ]
    },
    {
      "id": "pre_streamer",
      "titulo": "Ocho horas en el vestuario",
      "ambito": "prensa", "alcance": "club", "canal": "stream", "firma": "Luchi Rebote",
      "tono": "buena", "etiquetas": ["oferta", "viral"],
      "disparo": {
        "ventana": "tras_partido", "momentos": [], "peso": 5,
        "pesoSi": [ { "si": { "momento": "racha_buena" }, "x": 2 } ],
        "enfriamiento": 20, "maxTemporada": 1
      },
      "roles": { "influencer": { "tipo": "jugador", "opcional": true, "filtro": { "dato": "jugador.rasgo", "op": "tiene", "valor": "influencer" } } },
      "texto": "Luchi Rebote, 1,2 millones de seguidores, quiere hacer un stream de 8 horas en el vestuario \"para mostrar la intimidad del club\". Promete no tocar nada. En el último club tocó todo.",
      "vence": { "tipo": "semanas", "n": 1 },
      "porDefecto": "no_contestar",
      "opciones": [
        { "id": "aceptar", "texto": "Todo el día, vestuario incluido",
          "efectos": [
            { "tipo": "fama", "pct": 8 },
            { "tipo": "plata", "x": 0.3, "de": "ingreso_fecha", "concepto": "sponsors" },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": -4 },
            { "tipo": "azar", "p": 0.3,
              "si": [ { "tipo": "relacion", "con": "prensa", "valor": -6 }, { "tipo": "relacion", "con": "plantel", "valor": -5 } ],
              "sino": [],
              "desenlaceSi": "En la hora seis se escuchó la charla técnica completa. {rival} ya la tiene.",
              "desenlaceSino": "Récord de espectadores y el utilero se volvió tendencia." }
          ],
          "desenlace": "Luchi entró gritando y salió con la camiseta firmada." },
        { "id": "entrenamiento", "texto": "Solo el entrenamiento, el vestuario no",
          "efectos": [
            { "tipo": "fama", "pct": 4 },
            { "tipo": "plata", "x": 0.1, "de": "ingreso_fecha", "concepto": "sponsors" },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": -1 }
          ],
          "desenlace": "Luchi hizo jueguitos con el arquero suplente durante una hora. Funcionó igual." },
        { "id": "conductor", "texto": "Que lo conduzca {influencer}",
          "visibleSi": { "dato": "rol.influencer", "op": "=", "valor": true },
          "efectos": [
            { "tipo": "fama", "pct": 6 },
            { "tipo": "jugador", "quien": "influencer", "campo": "moral", "valor": 10 },
            { "tipo": "relacion", "con": "plantel", "valor": -5 }
          ],
          "desenlace": "{influencer} y Luchi, juntos, fueron demasiado. El resto del plantel pidió ser consultado la próxima." },
        { "id": "rechazar", "texto": "No: el vestuario es sagrado",
          "efectos": [
            { "tipo": "relacion", "con": "plantel", "valor": 4 },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": 2 }
          ],
          "desenlace": "Luchi hizo un stream de dos horas quejándose de vos. También rindió." },
        { "id": "no_contestar", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [],
          "desenlace": "Luchi se fue a streamear a {rival}." }
      ]
    }
  ]
}
```

### economia.json

```json
{
  "ambito": "economia",
  "movidas": [
    {
      "id": "eco_embargo",
      "titulo": "El gol en contra que cobra",
      "ambito": "economia", "alcance": "club", "canal": "carta_documento", "firma": "Estudio Bianchi & Asociados",
      "tono": "mala", "etiquetas": ["deuda", "legal", "plata"],
      "cadena": { "id": "embargo", "paso": 1 },
      "disparo": {
        "ventana": "tras_partido", "momentos": [],
        "si": { "dato": "liga.proximo.local", "op": "=", "valor": true },
        "peso": 4, "pesoSi": [ { "si": { "momento": "crisis_caja" }, "x": 2 } ],
        "enfriamiento": 30, "maxTemporada": 1
      },
      "roles": {},
      "texto": "{ex_jugador}, que jugó once partidos en el club hace quince años e hizo un gol en contra, reclama premios que nunca cobró. El juez le dio la razón y embargó la recaudación del próximo partido de local.",
      "vence": { "tipo": "previa" },
      "porDefecto": "embargan",
      "opciones": [
        { "id": "pagar", "texto": "Pagar todo y cerrar el tema",
          "efectos": [
            { "tipo": "plata", "x": -1.2, "de": "ingreso_fecha", "concepto": "deudas" },
            { "tipo": "relacion", "con": "prensa", "valor": 2 }
          ],
          "desenlace": "Pagaste. {ex_jugador} posteó una foto con el cheque y la frase \"la justicia tarda pero llega\"." },
        { "id": "cuotas", "texto": "Arreglar en cuotas",
          "efectos": [
            { "tipo": "orden", "modulo": "economia", "accion": "plan_cuotas", "datos": { "x": 1.6, "de": "ingreso_fecha", "cuotas": 8, "concepto": "deudas" } },
            { "tipo": "implicito", "x": -1.6, "de": "ingreso_fecha", "nota": "ocho cuotas con intereses" },
            { "tipo": "relacion", "con": "socios", "valor": -2 }
          ],
          "desenlace": "Ocho cuotas. Más caro, pero la recaudación del sábado queda en casa." },
        { "id": "juicio", "texto": "Ir a juicio: ese gol en contra no se premia",
          "efectos": [
            { "tipo": "plata", "x": -0.2, "de": "ingreso_fecha", "concepto": "honorarios" },
            { "tipo": "relacion", "con": "prensa", "valor": -2 },
            { "tipo": "programa", "movida": "eco_sentencia", "en": [3, 5], "p": 1.0 }
          ],
          "desenlace": "Se levantó el embargo mientras dure el juicio. El expediente ya pesa más que el arquero suplente." },
        { "id": "homenaje", "texto": "Ofrecerle un homenaje en la cancha si retira la demanda",
          "efectos": [
            { "tipo": "azar", "p": { "base": 0.4, "ajustes": [ { "si": { "dato": "club.relacion.hinchas", "op": ">=", "valor": 60 }, "suma": 0.2 } ] },
              "si": [
                { "tipo": "plata", "x": -0.1, "de": "ingreso_fecha", "concepto": "eventos" },
                { "tipo": "relacion", "con": "hinchas", "valor": 4 },
                { "tipo": "fama", "pct": 1 }
              ],
              "sino": [
                { "tipo": "plata", "x": -1.2, "de": "ingreso_fecha", "concepto": "deudas" },
                { "tipo": "relacion", "con": "prensa", "valor": -3 }
              ],
              "desenlaceSi": "Vuelta a la cancha, placa y ovación. Lloró, retiró la demanda y pidió una camiseta.",
              "desenlaceSino": "Vino al homenaje, saludó, se llevó la placa y el lunes cobró igual." }
          ],
          "desenlace": "Le ofreciste el homenaje." },
        { "id": "embargan", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "orden", "modulo": "economia", "accion": "embargo_recaudacion", "datos": { "porcentaje": 100, "partidos": 1 } },
            { "tipo": "implicito", "x": -1.3, "de": "ingreso_fecha", "nota": "se pierde toda la recaudación del partido" },
            { "tipo": "relacion", "con": "socios", "valor": -4 }
          ],
          "desenlace": "El oficial de justicia se llevó la recaudación en una mochila. Se quedó a ver el segundo tiempo." }
      ]
    },
    {
      "id": "eco_sentencia",
      "titulo": "Sale la sentencia",
      "ambito": "economia", "alcance": "club", "canal": "comunicado", "firma": "Juzgado Civil N.º 4 de {ciudad}",
      "tono": "mala", "etiquetas": ["deuda", "legal"],
      "cadena": { "id": "embargo", "paso": 2 },
      "disparo": { "ventana": "tras_partido", "momentos": [], "peso": 100, "enfriamiento": 10, "soloCadena": true },
      "roles": {},
      "texto": "El juez del caso {ex_jugador} propone un acuerdo antes de sentenciar: pagás el 70 % y se termina. Si seguís, puede salir a favor tuyo o con intereses. El tesorero ya prendió una vela.",
      "vence": { "tipo": "semanas", "n": 1 },
      "porDefecto": "nadie_fue",
      "opciones": [
        { "id": "acuerdo", "texto": "Aceptar el acuerdo",
          "efectos": [ { "tipo": "plata", "x": -0.85, "de": "ingreso_fecha", "concepto": "deudas" } ],
          "desenlace": "Firmado. {ex_jugador} y vos se dieron la mano sin mirarse." },
        { "id": "seguir", "texto": "Seguir hasta la sentencia",
          "efectos": [
            { "tipo": "azar", "p": 0.45,
              "si": [ { "tipo": "relacion", "con": "prensa", "valor": 3 }, { "tipo": "fama", "pct": 1 } ],
              "sino": [ { "tipo": "plata", "x": -1.8, "de": "ingreso_fecha", "concepto": "deudas" }, { "tipo": "relacion", "con": "prensa", "valor": -3 } ],
              "desenlaceSi": "Ganaste. El juez escribió que \"el gol en contra no constituye mérito deportivo\". Ya es jurisprudencia.",
              "desenlaceSino": "Perdiste, con intereses y costas. El tesorero apagó la vela." }
          ],
          "desenlace": "Fuiste a sentencia." },
        { "id": "nulidad", "texto": "Que el abogado del club pida la nulidad",
          "requiere": { "dato": "mercado.staff.abogado", "op": ">=", "valor": 1 },
          "motivo": "Necesitás un abogado en la sede",
          "efectos": [
            { "tipo": "plata", "x": -0.2, "de": "ingreso_fecha", "concepto": "honorarios" },
            { "tipo": "azar", "p": 0.6,
              "si": [ { "tipo": "relacion", "con": "prensa", "valor": 2 } ],
              "sino": [ { "tipo": "plata", "x": -1.2, "de": "ingreso_fecha", "concepto": "deudas" } ],
              "desenlaceSi": "La demanda estaba mal notificada. Nulidad y a casa.",
              "desenlaceSino": "El juez rechazó la nulidad y volvió a la oferta original, sin descuento." }
          ],
          "desenlace": "El abogado presentó el escrito." },
        { "id": "nadie_fue", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "azar", "p": 0.3,
              "si": [], "sino": [ { "tipo": "plata", "x": -1.8, "de": "ingreso_fecha", "concepto": "deudas" } ],
              "desenlaceSi": "Nadie fue a la audiencia, pero el juez falló a favor igual. Suerte de campeón.",
              "desenlaceSino": "Nadie fue a la audiencia. Sentencia en contra, con intereses." }
          ],
          "desenlace": "No contestaste." }
      ]
    },
    {
      "id": "eco_sobreventa",
      "titulo": "Vendimos de más",
      "ambito": "economia", "alcance": "club", "canal": "llamado", "firma": "el jefe de boletería",
      "tono": "mala", "etiquetas": ["plata", "violencia"],
      "cadena": { "id": "sobreventa", "paso": 1 },
      "disparo": {
        "ventana": "previa", "momentos": [],
        "si": { "todas": [
          { "dato": "liga.proximo.local", "op": "=", "valor": true },
          { "dato": "economia.sobreventa_prevista", "op": ">=", "valor": 1.15 }
        ] },
        "peso": 100, "enfriamiento": 3
      },
      "roles": {},
      "texto": "Boletería, a las 10 de la noche: \"Vendimos {exceso} entradas más de las que entran. Pusimos el precio tan barato que vino gente de pueblos que no están en el mapa\". Mañana hay partido.",
      "vence": { "tipo": "urgente" },
      "porDefecto": "que_entren",
      "opciones": [
        { "id": "que_entren", "texto": "Que entren todos: apretados, pero adentro",
          "efectos": [
            { "tipo": "club_temporal", "efecto": "aguante_extra", "partidos": 1 },
            { "tipo": "relacion", "con": "hinchas", "valor": 6 },
            { "tipo": "azar", "p": { "base": 0.3, "ajustes": [ { "si": { "dato": "economia.sobreventa_prevista", "op": ">=", "valor": 1.3 }, "suma": 0.2 } ] },
              "si": [
                { "tipo": "plata", "x": -0.5, "de": "ingreso_fecha", "concepto": "multas" },
                { "tipo": "relacion", "con": "afa", "valor": -6 },
                { "tipo": "programa", "movida": "afa_tribunal_disciplina", "en": [1, 1], "p": 1.0 }
              ],
              "sino": [],
              "desenlaceSi": "Avalancha en la popular y gente colgada del alambrado. No pasó nada grave, pero el veedor anotó todo.",
              "desenlaceSino": "Estadio a reventar, una fiesta. El alambrado aguantó de milagro." }
          ],
          "desenlace": "Se abrieron los molinetes." },
        { "id": "devolver", "texto": "Devolver la plata de las que sobran",
          "efectos": [
            { "tipo": "plata", "x": -0.25, "de": "recaudacion", "concepto": "recaudacion" },
            { "tipo": "relacion", "con": "hinchas", "valor": -8 },
            { "tipo": "relacion", "con": "socios", "valor": -4 }
          ],
          "desenlace": "Cola de tres cuadras para el reembolso. Alguien vendía choripán en la cola." },
        { "id": "pantalla", "texto": "Pantalla gigante en la plaza para los que sobran",
          "requiere": { "dato": "club.relacion.municipio", "op": ">=", "valor": 40 },
          "motivo": "El municipio no te va a dar el permiso",
          "efectos": [
            { "tipo": "plata", "x": -0.3, "de": "ingreso_fecha", "concepto": "eventos" },
            { "tipo": "relacion", "con": "hinchas", "valor": 4 },
            { "tipo": "relacion", "con": "municipio", "valor": 3 },
            { "tipo": "azar", "p": 0.15,
              "si": [ { "tipo": "plata", "x": -0.3, "de": "ingreso_fecha", "concepto": "multas" } ], "sino": [],
              "desenlaceSi": "En la plaza rompieron un banco festejando el gol. Lo pagás vos.",
              "desenlaceSino": "Tres mil personas en la plaza y {intendente} saludando desde un balcón." }
          ],
          "desenlace": "Pantalla, parlantes y un locutor municipal." }
      ]
    }
  ]
}
```

### obras.json

```json
{
  "ambito": "obras",
  "movidas": [
    {
      "id": "obr_napa",
      "titulo": "Apareció agua",
      "ambito": "obras", "alcance": "club", "canal": "llamado", "firma": "el capataz",
      "tono": "mala", "etiquetas": ["obra"],
      "cadena": { "id": "napa", "paso": 1 },
      "disparo": {
        "ventana": "dia", "momentos": [],
        "si": { "dato": "club.obra.activa_estadio", "op": "=", "valor": true },
        "peso": 5, "enfriamiento": 20, "maxTemporada": 1
      },
      "roles": { "obra": { "tipo": "obra" } },
      "texto": "El capataz: \"Jefe, cavamos para la base de la tribuna y apareció agua. Mucha. Uno de los muchachos dice que es una napa; otro, que es un manantial y que habría que cobrar entrada\".",
      "vence": { "tipo": "dias", "n": 3 },
      "porDefecto": "frenan_solos",
      "opciones": [
        { "id": "pagar", "texto": "Pagar el extra y hacerlo bien",
          "efectos": [ { "tipo": "plata", "x": -0.25, "de": "obra_activa", "concepto": "obras" } ],
          "desenlace": "Bombas, membrana y un ingeniero que repite \"esto no estaba en los planos\"." },
        { "id": "frenar", "texto": "Frenar la obra hasta que baje",
          "efectos": [
            { "tipo": "obra", "fechas": 3 },
            { "tipo": "plata", "x": -0.03, "de": "obra_activa", "concepto": "obras" }
          ],
          "desenlace": "La obra quedó parada con un charco enorme. Los patos ya se instalaron." },
        { "id": "tapar", "texto": "\"Tapalo y seguí, que nadie se entera\"",
          "efectos": [
            { "tipo": "marca", "clave": "club.napa_tapada", "valor": true, "oculto": true },
            { "tipo": "programa", "movida": "obr_clausura", "en": [3, 6], "p": 0.5 }
          ],
          "desenlace": "Dos camiones de tierra, un rezo y a seguir. La tribuna va a quedar divina. Por ahora." },
        { "id": "frenan_solos", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [ { "tipo": "obra", "fechas": 4 } ],
          "desenlace": "Nadie decidió nada y los obreros pararon por su cuenta. Cuatro fechas de demora." }
      ]
    },
    {
      "id": "obr_clausura",
      "titulo": "La tribuna tiene humedad",
      "ambito": "obras", "alcance": "club", "canal": "comunicado", "firma": "Dirección de Obras de {ciudad}",
      "tono": "mala", "etiquetas": ["obra", "legal"],
      "cadena": { "id": "napa", "paso": 2 },
      "disparo": {
        "ventana": "tras_partido", "momentos": [], "peso": 100, "enfriamiento": 6, "soloCadena": true,
        "si": { "marca": "club.napa_tapada" }
      },
      "roles": {},
      "texto": "Inspección municipal: la tribuna nueva \"presenta humedad estructural, fisuras y un sapo\". Clausura preventiva hasta que se repare. El sapo fue adoptado por la utilería.",
      "vence": { "tipo": "previa" },
      "porDefecto": "aceptar",
      "opciones": [
        { "id": "reparar", "texto": "Reparar de verdad, cueste lo que cueste",
          "efectos": [
            { "tipo": "plata", "x": -0.35, "de": "ultima_obra", "concepto": "obras" },
            { "tipo": "club_temporal", "efecto": "tribuna_cerrada", "partidos": 2, "datos": { "sector": "nueva" } },
            { "tipo": "marca", "clave": "club.napa_tapada", "valor": false }
          ],
          "desenlace": "Se rompió todo lo que se había tapado y se hizo de nuevo. El sapo se quedó." },
        { "id": "intendente", "texto": "Llamar a {intendente} para que la levante",
          "requiere": { "dato": "club.relacion.municipio", "op": ">=", "valor": 60 },
          "motivo": "Necesitás muy buena relación con el municipio",
          "efectos": [
            { "tipo": "relacion", "con": "municipio", "valor": -10 },
            { "tipo": "programa", "movida": "obr_clausura", "en": [8, 12], "p": 0.4 }
          ],
          "desenlace": "La clausura se levantó en una hora. La humedad, no." },
        { "id": "aceptar", "texto": "Aceptar la clausura y arreglar despacio",
          "efectos": [
            { "tipo": "club_temporal", "efecto": "tribuna_cerrada", "partidos": 4, "datos": { "sector": "nueva" } },
            { "tipo": "plata", "x": -0.15, "de": "ultima_obra", "concepto": "obras" },
            { "tipo": "marca", "clave": "club.napa_tapada", "valor": false }
          ],
          "desenlace": "Cuatro partidos mirando la tribuna nueva vacía, con cinta de peligro y el sapo." }
      ]
    }
  ]
}
```

### mercado.json

```json
{
  "ambito": "mercado",
  "movidas": [
    {
      "id": "mer_arabia",
      "titulo": "Llaman de Arabia",
      "ambito": "mercado", "alcance": "jugador", "canal": "llamado", "firma": "{representante}",
      "tono": "mixta", "etiquetas": ["oferta", "plata"],
      "disparo": {
        "ventana": "tras_partido", "momentos": ["mercado_verano", "mercado_invierno"],
        "peso": 6, "enfriamiento": 8, "maxTemporada": 2
      },
      "roles": { "jugador": { "tipo": "jugador",
        "filtro": { "todas": [ { "dato": "jugador.valor_rank", "op": "<=", "valor": 3 }, { "dato": "jugador.edad", "op": ">=", "valor": 26 } ] } } },
      "texto": "Un club de Arabia ofrece {monto_oferta} por {jugador}. El representante manda fotos del estadio, del departamento y de un camello con la camiseta. {jugador} ya puso una palmerita en su bio.",
      "vence": { "tipo": "semanas", "n": 1 },
      "porDefecto": "caduca",
      "opciones": [
        { "id": "vender", "texto": "Vender: esa plata no vuelve",
          "efectos": [
            { "tipo": "orden", "modulo": "mercado", "accion": "vender", "datos": { "jugador": "{jugador}", "destino": "exterior", "x": 2.5, "de": "valor_jugador" } },
            { "tipo": "relacion", "con": "hinchas", "valor": -8 },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": -4 }
          ],
          "desenlace": "{jugador} se despidió con un video llorando. Lo grabó en el aeropuerto, con anteojos de sol." },
        { "id": "retener", "texto": "Retenerlo: no se vende",
          "efectos": [
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": -15 },
            { "tipo": "relacion", "con": "hinchas", "valor": 6 },
            { "tipo": "azar", "p": 0.3,
              "si": [ { "tipo": "marca", "clave": "j.{jugador}.quiere_irse", "valor": true, "dura": 26 } ], "sino": [],
              "desenlaceSi": "{jugador} sacó la palmerita de la bio, pero no la cara de palmera.",
              "desenlaceSino": "Lo charlaron. Se queda convencido. Más o menos." }
          ],
          "desenlace": "\"No está en venta\"." },
        { "id": "subir_sueldo", "texto": "Subirle el sueldo para que se quede",
          "efectos": [
            { "tipo": "orden", "modulo": "mercado", "accion": "ajustar_sueldo", "datos": { "jugador": "{jugador}", "pct": 60 } },
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": 10 },
            { "tipo": "relacion", "con": "plantel", "valor": -6 },
            { "tipo": "implicito", "x": -7, "de": "sueldo_jugador", "nota": "60 % más de sueldo por un año" }
          ],
          "desenlace": "Se queda contento. En el vestuario ya hay tres que preguntan si tienen que conseguir una oferta de Arabia." },
        { "id": "el_doble", "texto": "Pedirles el doble",
          "efectos": [
            { "tipo": "azar", "p": 0.35,
              "si": [ { "tipo": "orden", "modulo": "mercado", "accion": "vender", "datos": { "jugador": "{jugador}", "destino": "exterior", "x": 4.0, "de": "valor_jugador" } },
                      { "tipo": "relacion", "con": "hinchas", "valor": -8 } ],
              "sino": [ { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": -20 },
                        { "tipo": "marca", "clave": "j.{jugador}.quiere_irse", "valor": true, "dura": 26 } ],
              "desenlaceSi": "Aceptaron sin pestañear. Te quedó la duda de si podías pedir el triple.",
              "desenlaceSino": "Cortaron. {jugador} se enteró de que la oferta se cayó por vos." }
          ],
          "desenlace": "Pediste el doble." },
        { "id": "caduca", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [ { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": -10 } ],
          "desenlace": "La oferta caducó. {jugador} sacó la palmerita de la bio y no te saluda." }
      ]
    },
    {
      "id": "mer_traicion",
      "titulo": "El clásico va por él",
      "ambito": "mercado", "alcance": "jugador", "canal": "posteo", "firma": "{periodista}",
      "tono": "mala", "etiquetas": ["oferta"],
      "disparo": {
        "ventana": "tras_partido", "momentos": ["mercado_verano", "mercado_invierno", "recta_final"],
        "si": { "dato": "liga.clasico.existe", "op": "=", "valor": true },
        "peso": 4, "enfriamiento": 26, "maxTemporada": 1
      },
      "roles": { "jugador": { "tipo": "jugador",
        "filtro": { "dato": "jugador.valor_rank", "op": "<=", "valor": 5 },
        "prefiere": [ { "si": { "dato": "jugador.idolo", "op": "=", "valor": true }, "x": 3 } ] } },
      "texto": "{periodista} tira: \"{clasico} va por {jugador}. Hay contacto, hay números y hay foto de su representante comiendo con el presidente de ellos\". En la tribuna ya están pintando un trapo que no se puede reproducir.",
      "vence": { "tipo": "semanas", "n": 1 },
      "porDefecto": "rumor",
      "opciones": [
        { "id": "vender", "texto": "Vendérselo: que paguen caro",
          "efectos": [
            { "tipo": "orden", "modulo": "mercado", "accion": "vender", "datos": { "jugador": "{jugador}", "destino": "clasico", "x": 1.6, "de": "valor_jugador" } },
            { "tipo": "relacion", "con": "hinchas", "valor": -25 },
            { "tipo": "relacion", "con": "socios", "valor": -10 },
            { "tipo": "jugador", "quien": "plantel", "campo": "moral", "valor": -6 },
            { "tipo": "marca", "clave": "club.vendio_al_clasico", "valor": true }
          ],
          "desenlace": "Cobraste una fortuna. Te pintaron la vereda de tu casa. Las dos cosas son para siempre." },
        { "id": "renovar", "texto": "Renovarle por tres años y sacarle una foto con la camiseta",
          "efectos": [
            { "tipo": "orden", "modulo": "mercado", "accion": "renovar", "datos": { "jugador": "{jugador}", "pct": 35, "temporadas": 3 } },
            { "tipo": "relacion", "con": "hinchas", "valor": 8 },
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": 8 },
            { "tipo": "implicito", "x": -4, "de": "sueldo_jugador", "nota": "35 % más de sueldo por tres temporadas" }
          ],
          "desenlace": "Foto besando el escudo. El trapo que estaban pintando ahora dice otra cosa." },
        { "id": "clausula", "texto": "Clausula anticlásico en el contrato",
          "requiere": { "dato": "mercado.staff.abogado", "op": ">=", "valor": 1 },
          "motivo": "Necesitás un abogado en la sede",
          "efectos": [
            { "tipo": "plata", "x": -0.1, "de": "ingreso_fecha", "concepto": "honorarios" },
            { "tipo": "jugador", "quien": "jugador", "campo": "moral", "valor": -4 },
            { "tipo": "relacion", "con": "hinchas", "valor": 10 },
            { "tipo": "marca", "clave": "j.{jugador}.blindado", "valor": true }
          ],
          "desenlace": "Cláusula de rescisión de AU 999M solo para {clasico}. Es legal, es ridícula y la hinchada la ama." },
        { "id": "rumor", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "relacion", "con": "hinchas", "valor": -5 },
            { "tipo": "azar", "p": 0.4,
              "si": [ { "tipo": "marca", "clave": "j.{jugador}.quiere_irse", "valor": true, "dura": 26 } ], "sino": [],
              "desenlaceSi": "{jugador} dejó de seguir al club en las redes. Mala señal.",
              "desenlaceSino": "El rumor se apagó solo. Por ahora." }
          ],
          "desenlace": "No dijiste nada." }
      ]
    }
  ]
}
```

### inferiores.json

```json
{
  "ambito": "inferiores",
  "movidas": [
    {
      "id": "inf_pibe_grande",
      "titulo": "Un grande quiere al pibe",
      "ambito": "inferiores", "alcance": "jugador", "canal": "llamado", "firma": "el papá de {juvenil}",
      "tono": "mala", "etiquetas": ["juvenil", "oferta"],
      "disparo": { "ventana": "tras_partido", "momentos": [], "peso": 5, "enfriamiento": 15, "maxTemporada": 2 },
      "roles": { "juvenil": { "tipo": "juvenil",
        "filtro": { "dato": "juvenil.edad", "op": ">=", "valor": 16 },
        "prefiere": [ { "si": { "dato": "juvenil.potencial", "op": ">=", "valor": 4 }, "x": 4 } ] } },
      "texto": "El papá de {juvenil}, el 10 de la Cuarta, te avisa que un club grande les ofreció pensión, colegio bilingüe y contrato. \"Nosotros queremos que se quede, presi, pero entienda que es mucha plata\".",
      "vence": { "tipo": "semanas", "n": 2 },
      "porDefecto": "se_va",
      "opciones": [
        { "id": "firmar", "texto": "Firmarle su primer contrato profesional",
          "efectos": [
            { "tipo": "orden", "modulo": "mercado", "accion": "contrato_juvenil", "datos": { "juvenil": "{juvenil}", "temporadas": 3 } },
            { "tipo": "plata", "x": -0.4, "de": "ingreso_fecha", "concepto": "sueldos" },
            { "tipo": "jugador", "quien": "juvenil", "campo": "moral", "valor": 10 },
            { "tipo": "relacion", "con": "socios", "valor": 3 }
          ],
          "desenlace": "Firmó con la birome que le prestó la abuela. Foto con el escudo y la familia entera." },
        { "id": "dejar_ir", "texto": "Dejarlo ir y cobrar los derechos de formación",
          "efectos": [
            { "tipo": "orden", "modulo": "mercado", "accion": "transferir_juvenil", "datos": { "juvenil": "{juvenil}", "x": 0.6, "de": "ingreso_fecha", "porcentaje_futuro": 15 } },
            { "tipo": "relacion", "con": "hinchas", "valor": -3 }
          ],
          "desenlace": "Te quedaste con el 15 % de una futura venta. Si la rompe, algún día llega un cheque." },
        { "id": "promesa", "texto": "Prometerle el debut en Primera este año",
          "efectos": [
            { "tipo": "jugador", "quien": "juvenil", "campo": "moral", "valor": 15 },
            { "tipo": "relacion", "con": "plantel", "valor": -2 },
            { "tipo": "marca", "clave": "j.{juvenil}.promesa_debut", "valor": true, "dura": 30 }
          ],
          "desenlace": "El papá se fue convencido. Ahora hay que cumplirle." },
        { "id": "se_va", "oculta": true, "texto": "Lo dejaste pasar",
          "efectos": [
            { "tipo": "orden", "modulo": "mercado", "accion": "transferir_juvenil", "datos": { "juvenil": "{juvenil}", "x": 0.3, "de": "ingreso_fecha", "porcentaje_futuro": 0 } }
          ],
          "desenlace": "Nadie llamó al papá. {juvenil} se fue al grande y te quedaron los derechos mínimos." }
      ]
    },
    {
      "id": "inf_pibe_reserva",
      "titulo": "Siete goles en Reserva",
      "ambito": "inferiores", "alcance": "jugador", "canal": "posteo", "firma": "el coordinador de inferiores",
      "tono": "buena", "etiquetas": ["juvenil", "viral"],
      "disparo": {
        "ventana": "tras_partido", "momentos": [], "peso": 5,
        "pesoSi": [ { "si": { "momento": "racha_mala" }, "x": 2 } ],
        "enfriamiento": 15, "maxTemporada": 2
      },
      "roles": { "juvenil": { "tipo": "juvenil", "filtro": { "dato": "juvenil.edad", "op": ">=", "valor": 17 } } },
      "texto": "{juvenil} hizo siete goles en Reserva y uno fue de rabona desde mitad de cancha. El video lo compartió hasta un streamer de otro país. La gente pide que lo subas ya.",
      "vence": { "tipo": "previa" },
      "porDefecto": "cuidarlo",
      "opciones": [
        { "id": "subirlo", "texto": "Subirlo a Primera ya",
          "efectos": [
            { "tipo": "orden", "modulo": "mercado", "accion": "subir_a_primera", "datos": { "juvenil": "{juvenil}" } },
            { "tipo": "jugador", "quien": "juvenil", "campo": "moral", "valor": 12 },
            { "tipo": "relacion", "con": "hinchas", "valor": 6 },
            { "tipo": "fama", "pct": 2 },
            { "tipo": "azar", "p": 0.3,
              "si": [ { "tipo": "temporal", "quien": "juvenil", "efecto": "agrandado", "partidos": 3 } ], "sino": [],
              "desenlaceSi": "Llegó al primer entrenamiento con auto nuevo y anteojos de sol. Ojo.",
              "desenlaceSino": "Primer entrenamiento: le tiró un caño al capitán y le pidió perdón tres veces." }
          ],
          "desenlace": "Ya tiene número en la camiseta de Primera." },
        { "id": "cuidarlo", "texto": "Que siga en Reserva, sin apuro",
          "efectos": [
            { "tipo": "relacion", "con": "hinchas", "valor": -3 },
            { "tipo": "jugador", "quien": "juvenil", "campo": "moral", "valor": -3 },
            { "tipo": "jugador", "quien": "juvenil", "campo": "gambeta", "valor": 2 }
          ],
          "desenlace": "\"Tiene que madurar\". La gente no está de acuerdo, el pibe sigue entrenando como loco." },
        { "id": "vender", "texto": "Venderlo ahora que está caliente",
          "efectos": [
            { "tipo": "orden", "modulo": "mercado", "accion": "vender", "datos": { "jugador": "{juvenil}", "destino": "mejor_oferta", "x": 1.5, "de": "valor_jugador" } },
            { "tipo": "relacion", "con": "hinchas", "valor": -10 },
            { "tipo": "relacion", "con": "socios", "valor": -4 }
          ],
          "desenlace": "Se fue sin debutar. En diez años vas a ver sus goles por la tele y te vas a acordar." }
      ]
    }
  ]
}
```

---

## 14. Pedidos a otros módulos

> No escribo en carpetas de otros: el coordinador los pasa a `specs/<modulo>/pedidos.md`.

### Núcleo (contrato; algunos bloquean la implementación, no este diseño)

- **N1 (bloqueante) · Efectos al decidir.** `reducir(porcion, accion)` devuelve solo la porción, así que elegir una opción no puede cobrar una multa ni bajar la moral. Propuesta mínima: gancho opcional `trasAccion?(ctx, accion): Salida` que el núcleo llama después de `reducir`. Le sirve igual a `mercado` (comprar cuesta plata) y a `club` (empezar una obra).
- **N2 (bloqueante) · Efecto `orden`.** `{ tipo: 'orden'; modulo: IdModulo; accion: string; datos: Record<string, unknown> }`, que el núcleo enruta al `reducir` del módulo dueño. Sin esto no se puede vender un jugador, firmar un sponsor, postergar un partido ni cambiar la demanda desde una movida. Cada módulo publica su catálogo de órdenes.
- **N3 · Temporal sobre el club.** `temporal` hoy es solo de jugadores. Pido `{ tipo: 'temporal'; sobre: 'club'; efecto: string; partidos: number; datos? }` (tribuna cerrada, césped dañado, cancha nevada, aguante extra), con catálogo de efectos que mantiene el módulo que los interpreta.
- **N4 · Marcas.** Confirmar que el efecto `marca` se aplica sobre `movidas.marcas`, y agregar `modo: 'fijar' | 'sumar'` y `dura?: number` (semanas).
- **N5 · Registro de lecturas.** Un registro en el núcleo donde cada módulo publica lecturas con nombre (`liga.posicion`) como funciones puras. Las condiciones de las movidas y el validador dependen de él.
- **N6 · `Relacion`.** El núcleo usa `Relacion` sin definir. Propongo: `hinchas | barra | socios | comision | afa | municipio | prensa | sponsors | plantel | dt`, de 0 a 100, en la porción `club`.
- **N8 · Nombre del efecto de plata.** Con moneda única (economía §8), el efecto `pesos` del núcleo debería llamarse `plata`. Mientras tanto, los JSON de movidas usan `plata` y el módulo lo compila a `pesos`.
- **N7 · Fechas del club.** Exponer un contador de partidos jugados por el club en la temporada (para `faltan` de la agenda), o confirmar que lo lea de `liga`.

### Club
- Dueño de las **relaciones** (N6), con consumidores reales (si no, son números decorativos): municipio → velocidad y permisos de obras; sponsors → calidad de ofertas; socios → `institucional.mandato`.
- Lecturas: `club.entorno`, `club.lugar`, `club.estadio.categoria`/`capacidad`/`lujo`, `club.edificio.<tipo>` (nivel), `club.obra.activa`, `club.obra.activa_estadio`, `club.obra.terminada_hace`, `club.sponsor.rubro` y `club.sponsor.espacio` (listas), `club.relacion.<con>`, `tiempo.estacion` (según hemisferio del entorno, o decidir que no hay estaciones).
- Órdenes: `firmar_sponsor` (plantillas ficticias Jugadón.bet, PampaCoin, Yerba La Tranquera), `rescindir_sponsor`.
- Temporales del club: `tribuna_cerrada {sector}`, `cesped_danado`, `cancha_nevada`, `cancha_pesada`.
- **Unificar taxonomías**: DES-8 habla de paisaje (llanura, conurbano, costa, montaña, nieve, trópico, desierto) y CLU-13 de entorno (ciudad, campo, montaña, frío, Caribe, costa, desierto). Las movidas usan `club.entorno` (CLU-13) + `club.lugar` (tamaño, DES-8).

### Mercado
- Lecturas de jugador: `rasgo` (fiestero, cabulero, influencer, calentón, profesional), `titular`, `capitan`, `idolo`, `edad`, `estrellas`, `valor_rank`, `moral`. De juvenil: `edad`, `potencial`. Generales: `mercado.dt.existe`, `mercado.staff.<tipo>` (nivel; 0 si no hay: psicologo, abogado, contador, community_manager, asesor_prensa, medico, kinesiologo).
- Referencias: `sueldo_jugador`, `valor_jugador`, `sueldos_mes`.
- Órdenes: `vender {jugador, destino, x, de}`, `ajustar_sueldo`, `renovar`, `postergar_sueldos`, `ofrecer_refuerzo`, `contrato_juvenil`, `transferir_juvenil`, `subir_a_primera`, `rescindir_dt`.
- Temporales de jugador (con `partido`): `resaca`, `lesion_leve`, `lesion_media`, `ausente`, `motivado`, `cabala_activa`, `agrandado`, `entrenamiento_reducido`.
- Relación `dt` (o humor del DT) si no vive en `club`.

### Liga
- Lecturas: `liga.division`, `liga.posicion`, `liga.fecha`, `liga.racha`, `liga.ultimo_resultado`, `liga.proximo.local`/`clasico`/`final`/`competicion`, `liga.clasico.existe` + nombre del clásico, `rival.es_proximo`, zonas de ascenso, repechaje y descenso.
- Órdenes: `postergar_partido`, `quita_puntos` (concurso de acreedores), `cambiar_estadio`.

### Economía
- **E1** Referencias de magnitud de §2.5 (`ingreso_fecha`, `recaudacion`, `cuota_sponsor`, `obra_activa`, `ultima_obra`) y validar los multiplicadores del lote.
- Lecturas: `economia.sobreventa_prevista` (demanda/capacidad del próximo local) y `economia.sobreventa_exceso`, `economia.caja`, `economia.caja_semanas` (cuántas semanas de gastos cubre), `economia.deuda`, `economia.en_descubierto`, `economia.en_concurso`, `economia.cuotas_sponsor_atrasadas`, `economia.precio_vs_referencia`.
- Conceptos económicos que usan las movidas: `multas`, `deudas`, `eventos`, `honorarios`, `seguridad`, `alquileres`, `prensa`, `inversiones`, además de los de ECO-1.
- Órdenes: `modificar_demanda {factor, partidos}`, `plan_cuotas {x, de, cuotas, concepto}`, `embargo_recaudacion {porcentaje, partidos}`, `prestamo_especial {x, de, tasa, cuotas}` (crisis de caja y concurso).

### Partido
- Interpretar los temporales de jugador y de club (aguante extra, cancha nevada, cábala activa) en la simulación.
- Poner marcas sobre hechos del partido para movidas reactivas: `j.<id>.erro_penal`, `j.<id>.expulsado`, `temporada.var_polemico`, `j.<id>.gol_clasico`.
- V1: gancho de entretiempo para movidas `entretiempo` (PAR-10).

### Interfaz
- Tarjetas por canal (§2.2) y pistas (§10). Aviso antes de JUGAR si hay pendientes que vencen. Badge de mitigación en el desenlace.

---

## 15. Preguntas para el usuario

- **P1 · ¿Cuánto se ve antes de elegir?** Propuesta: monto exacto de la plata segura, flechas sin números para el resto, ícono de riesgo sin porcentaje. La alternativa estilo Potrero (no mostrar nada) es más sorpresa pero hace que decidir sea adivinar.
- **P2 · La AFA es real.** Las reglas del proyecto prohíben instituciones reales. Propuesta: una federación ficticia con nombre configurable (`{federacion}`), por ejemplo "la Asociación" a secas o "la Federación del Fútbol". ¿Cómo la llamamos?
- **P3 · "1–3 por fecha" con copas en el medio.** Lo definí como 1–3 **por semana de liga**, compartido con los partidos de copa. Si fuera por partido, con copa serían hasta 6 por semana. ¿Te parece bien?
- **P4 · Nombre de la moneda.** Las movidas escriben `AU` (Áureo, provisional). Cuando elijas el nombre definitivo, se cambia solo en el formato de plata; los JSON no llevan montos escritos.
- **P5 · Relación con el plantel y moral.** Hoy existen las dos: relación = confianza del vestuario en vos (lenta), moral = ánimo de cada jugador (rápida). ¿Las dejamos o fusionamos? Y el "Aguante" que menciona economía, ¿es la relación con los hinchas o algo aparte?
- **P6 · Dueño y elecciones (importante).** Sos el dueño, pero las movidas de política tienen elecciones, oposición y asambleas, que son de club con socios. Propuesta: sos el dueño "de hecho" y presidente; perder una elección **no termina la partida**, deja un `mandato: debil` (comisión hostil, opciones de política más caras, menos crédito con los socios) durante una temporada. Elecciones cada 3 temporadas. ¿De acuerdo?

## 16. Críticas a la spec (honestas)

- **El contrato del núcleo no alcanza para las movidas** (N1, N2, N3): sin efectos al decidir y sin `orden`, la mitad del lote no se puede aplicar. No bloquea este diseño, pero sí la fase 4.
- **DES-4 (cadenas) está en V1, y debería ser MVP.** Las cadenas son lo que hace que una movida se sienta movida y no un menú de opciones; el mecanismo (`programa` + agenda) es chico. Propongo pasarlo a MVP.
- **Las relaciones no tienen dueño ni consumidores.** Si nadie más las lee, son números decorativos y las decisiones pierden peso.
- **`steering/tecnica.md` tiene un `MovidaDef` y un `Efecto` viejos** (montos absolutos, `jugador: 'objetivo'`). Hay que actualizarlo a este diseño o marcarlo como obsoleto.
- **La meta de "cientos" choca con la cantidad por temporada:** ~45 semanas × 2 = ~90 movidas por temporada. Con las 190 del MVP, en la segunda temporada ya se repite mucho. Las movidas con `{jugador}` se reciclan bien; las de club no. V1 necesita 400+.
- **El lote de muestra sale pesimista:** 5 buenas de 30 (17 %), porque pedía cubrir cadenas de quilombos. El objetivo de 30–40 % de buenas (§4.4) obliga a escribir muchas más oportunidades en la tanda MVP; si no, el Despacho se siente un castigo.
- **Montos absolutos imposibles:** cualquier movida con "AU 50M" escritos es una fortuna en la B y una propina en Primera. Por eso todo es relativo (§2.5); conviene que las demás specs adopten la misma idea.
