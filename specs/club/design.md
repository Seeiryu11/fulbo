# Club — Diseño

Estado: `en revisión` · Cubre: CLU-1, CLU-2, CLU-3, CLU-4, CLU-8, CLU-9, CLU-13 · Dueño: agente `club` · Contrato: `specs/nucleo/design.md` · Números de plata: `specs/economia/design.md`

> Lo que **no** cubre este documento: staff y plantel (CLU-5, CLU-6, CLU-6c, CLU-7 → agente `mercado`), liga y copas (CLU-12 → `liga`), caja, precios y pagos (CLU-10 → `economia`). Acá se define la **estructura**; cada vez que aparece un monto, es una referencia a `economia` o una **propuesta** marcada como tal para que `economia` la valide.

## 0. Principios del módulo

1. **La porción `club` guarda decisiones, no resultados.** Qué pieza hay en cada ranura, qué nivel tiene cada edificio, qué obras están en curso, qué entorno, qué identidad y qué contratos de sponsor. Capacidad, Valor, Lujo, modificadores y cupos de staff **se calculan** siempre a partir de eso (funciones puras en `selectores.ts`).
2. **Todo lo que es contenido es dato.** Piezas, estilos, categorías, edificios, entornos, marcas de sponsor, íconos de escudo, layout del mapa: JSON en `src/datos/club/`, validado con Zod al cargar.
3. **Los precios y duraciones de obra viven en `src/datos/economia/obras.json`**, indexados por id de pieza / edificio / salto. El club nunca tiene un precio propio: lo pide a economía.
4. **La escena 3D es un dibujante tonto.** `src/modulos/club/vista.ts` traduce la porción a un `VistaClub` (puro, testeable sin navegador) y `src/ui/escena3d/` lo dibuja y lo reconcilia pieza por pieza. La escena no conoce reglas de juego.
5. **Mismas reglas para la UI y para la simulación sin pantalla (NUC-7):** toda validación ("¿puedo construir esto?") es una función pura que usan los dos.

---

## 1. Estadio

### 1.1 Geometría base: la superelipse y los lados

Se toma la idea del prototype (`referencias/mockups/predio-europeo.html`): el estadio es un **rectángulo redondeado (superelipse)** alrededor de la cancha. Todo se mide en **metros** con el origen en el centro de la cancha.

- **Cancha fija de 105 × 68 m** en todas las categorías (el partido 3D reutiliza la escena, PAR-12). Lo que es "chico" al principio es el estadio, no la cancha.
- **Borde interno** de las tribunas: `A0 = 60`, `B0 = 42` (semiejes), exponente `N = 0,42`. Cualquier anillo a distancia `o` del borde interno es `curva(o, t)`.
- La cancha va a lo largo del eje X. La cámara mira desde +Z.

| Lado | Qué es | Rango de `t` (radianes) | Uso típico |
|------|--------|-------------------------|------------|
| `norte` | Lateral del fondo (el que se ve entero desde la cámara) | `(5π/4 + δ, 7π/4 − δ)` | Platea principal, palcos, vestuarios |
| `sur` | Lateral cercano a la cámara | `(π/4 + δ, 3π/4 − δ)` | Platea o popular |
| `este` | Cabecera derecha | `(−π/4 + δ, π/4 − δ)` | Popular visitante |
| `oeste` | Cabecera izquierda | `(3π/4 + δ, 5π/4 − δ)` | Popular local |

`δ` (en `categorias.json`) deja las **esquinas libres** en categorías 1–3, como en las canchas argentinas; desde la categoría 4 la ranura `esquinas` cierra el anillo.

**Huella**: cada categoría define hasta qué distancia del borde interno puede crecer el estadio (`offsetMax`). El terreno reservado (CLU-1.2) es siempre la huella de la categoría 6 más la explanada; lo que no está construido se ve como **terreno preparado** (§11.6).

### 1.2 Ranuras (dónde va cada pieza)

Una **ranura** es un lugar del estadio que admite una pieza de una **familia**. Las ranuras se habilitan por categoría.

| Ranura | Familia | Desde cat. | Notas |
|--------|---------|-----------:|-------|
| `tribuna_norte`, `tribuna_sur`, `tribuna_este`, `tribuna_oeste` | tribuna | 1 | Aportan capacidad (popular / platea) |
| `cancha` | cancha | 1 | Césped, drenaje, riego |
| `accesos` | accesos | 1 | Alambrado, molinetes, boleterías, explanada. Bajan el riesgo de incidentes por sobreventa |
| `servicios` | servicios | 1 | Vestuarios, baños, sala de prensa |
| `techo_norte`, `techo_sur`, `techo_este`, `techo_oeste` | techo | 2 | Se apoya en la tribuna de su lado (si no hay tribuna, no se puede techar) |
| `luces` | luces | 2 | Habilita partidos nocturnos |
| `pantalla` | pantalla | 3 | |
| `palcos` | palcos | 3 | Se monta sobre `tribuna_norte`; aporta capacidad de palcos |
| `fachada` | fachada | 3 | Envuelve la cara exterior; muestra el nombre del estadio |
| `esquinas` | esquinas | 4 | Cierra el anillo (una sola pieza para las cuatro esquinas) |
| `tecnologia` | tecnologia | 4 | LED perimetral, VAR, conectividad |
| `experiencia` | experiencia | 5 | Museo, tour, tienda en el estadio |
| `cubierta` | cubierta | 6 | Techo y césped retráctiles |

**Ranuras habilitadas por categoría:** cat. 1 = 7 · cat. 2 = 12 · cat. 3 = 15 · cat. 4 = 17 · cat. 5 = 18 · cat. 6 = 19.

### 1.3 Categorías

| Cat. | Nombre | `offsetMax` (m) | Lujo base | Ranuras | Nivel máx. de edificios de la villa | Rasgos visuales |
|-----:|--------|----------------:|----------:|--------:|------------------------------------:|-----------------|
| 1 | Cancha de barrio | 10 | 0 | 7 | 2 | Alambrado, tablones, vestuario de chapa, sin luces |
| 2 | Estadio de ascenso | 22 | 5 | 12 | 3 | Cemento, primera platea, torres de luz |
| 3 | Estadio de Primera | 34 | 15 | 15 | 4 | Cuatro lados, techos parciales, palcos, pantalla |
| 4 | Estadio grande | 46 | 30 | 17 | 5 | Anillo cerrado, LED, VAR, hospitality |
| 5 | Estadio de élite | 52 | 50 | 18 | 5 | Techo completo, fachada iluminada, museo |
| 6 | Estadio del futuro | 58 | 80 | 19 | 5 | Techo y césped retráctiles, fachada de pantallas |

El **nivel máximo de los edificios de la villa** atado a la categoría hace del estadio el "ayuntamiento" de Clash of Clans (pregunta U3).

### 1.4 Salto de categoría (CLU-2.3)

| Salto | Nivel de club | Piezas de la categoría actual | Precio y duración | Penalización mientras dura |
|-------|--------------:|------------------------------:|-------------------|----------------------------|
| 1 → 2 | 6 | 5 de 7 | economía §4: AU 400M · 6 fechas | capacidad × 0,75 |
| 2 → 3 | 14 | 9 de 12 | AU 1.500M · 10 fechas | capacidad × 0,75 |
| 3 → 4 | 22 | 11 de 15 | AU 4.000M · 15 fechas | capacidad × 0,75 |
| 4 → 5 | 30 | 12 de 17 | AU 10.000M · 20 fechas | capacidad × 0,75 |
| 5 → 6 | 40 | 13 de 18 | AU 25.000M · 30 fechas | capacidad × 0,75 |

- "Piezas de la categoría actual" = ranuras habilitadas con una pieza de `categoria ≥ categoría del estadio`, contadas sobre las ranuras habilitadas. Regla de economía: `ceil(0,70 × ranuras)`.
- El salto es una **obra** (§3): ocupa una cuadrilla y **bloquea cualquier otra obra del estadio** mientras dura. La villa sigue pudiendo construirse con otras cuadrillas.
- Mientras dura, la capacidad habilitada se multiplica por `penalizacionSalto` (propuesta 0,75; la calibra economía en sus simulaciones): obradores, accesos cortados.
- Al terminar: sube la categoría, se habilitan ranuras nuevas, crece la huella, se suma el Lujo base, se emite la **inauguración** (noticia de importancia 3 y marca para movidas, §9). Las piezas viejas **quedan** (una tribuna de cat. 1 en un estadio de cat. 2 se ve chica, adelante, con terreno preparado detrás) y dejan de contar para el próximo salto.

### 1.5 Estilos: kit + modificadores

Decisión técnica de los requisitos: **cada estilo es un kit sobre la misma geometría**. Una pieza define la forma (perfil de la tribuna, tipo de techo); el estilo define **materiales, paleta, adornos y nombre** de esa pieza, y además aplica **modificadores chicos** a los números para que el estilo no sea solo cosmético (pregunta U4).

| Estilo | MVP | Capacidad popular | Capacidad platea/palcos | Lujo | Factor de precio (propuesta, valida economía) | Adornos del kit | Desbloqueo (propuesta) |
|--------|:---:|------------------:|------------------------:|-----:|------------------------------------------:|-----------------|------------------------|
| `ascenso` (rioplatense) | sí | × 1,10 | × 1,00 | × 0,85 | × 1,00 | paravalanchas, trapos, alambrado alto, cemento a la vista, bombos | inicial |
| `europeo` (moderno) | sí | × 0,85 | × 1,00 | × 1,25 | × 1,10 | butacas de color en todo, costillas blancas, membrana, vidrio | inicial |
| `primera_arg` | V1 | × 1,05 | × 1,00 | × 1,00 | × 1,00 | tribunas empinadas, popular colorida, papelitos | cat. 2 |
| `ingles` | V1 | × 0,95 | × 1,00 | × 1,10 | × 1,05 | ladrillo, techos a dos aguas, tribuna pegada | cat. 2 |
| `andino` | V1 | × 1,00 | × 1,00 | × 1,00 | × 1,00 | gradas sobre la ladera, piedra | entorno montaña |
| `invierno` | V1 | × 0,95 | × 1,00 | × 1,10 | × 1,10 | techo pesado, calefactores, luces cálidas | entorno frío |
| `tropical` | V1 | × 1,05 | × 1,00 | × 0,95 | × 0,95 | techos livianos, toldos, palmeras | entorno Caribe o costa |
| `desierto` | V1 | × 0,90 | × 1,00 | × 1,35 | × 1,25 | celosías doradas, climatización | cat. 3 + Lujo 150 |
| `futurista` | V1 | × 0,90 | × 1,00 | × 1,40 | × 1,30 | formas orgánicas, neón, pantallas | cat. 5 |

**Trade-off buscado:** el ascenso llena más (más recaudación y Aguante), el europeo da más Lujo (más fama y sponsors) pero sale más caro y entra menos gente parada.

**Mezcla de estilos (CLU-2.2):**
- El estadio tiene un `estiloPrincipal` (el que se elige al crear el club). Cada pieza colocada guarda **su** estilo.
- Construir una pieza en un estilo distinto del principal cuesta `recargoEstiloAjeno` (propuesta × 1,15, lo fija economía).
- **Reestilizar** una pieza existente es una obra de 1 fecha que cambia su kit sin tocar sus números base (costo: un porcentaje del valor de la pieza, lo fija economía).
- **Cambiar el estilo principal** encola una obra de reestilizado sobre todas las piezas: dura `max(2, ceil(piezas / 3))` fechas.
- **Bonus de coherencia:** si ≥ 80 % de las piezas está en el estilo principal, Lujo × 1,10. Mezclar no castiga, solo pierde ese bonus.

### 1.6 Piezas: modelo

Cada pieza es un registro de `src/datos/club/piezas/cN.json`:

- `id`, `familia`, `categoria`, `lados` (si se limita: las plateas solo van en laterales `norte`/`sur`), `nivelRequerido` (nivel de club).
- `capacidad: { popular, platea, palcos }` (base, antes del estilo).
- `lujo` (base).
- `requiere` opcional: otras ranuras con condición (ej. el aro de luces pide los cuatro techos de cat. ≥ 3; los palcos piden una platea en `tribuna_norte`).
- `efectos` opcionales: `riesgoIncidentes` (multiplicador para la sobreventa de economía §2b), `nocturno` (luces), `drenaje` (cancha que aguanta lluvia, gancho para movidas).
- `nombres` por estilo (`{ ascenso: 'Tablones de madera', europeo: 'Grada tubular' }`) con `nombre` por defecto.
- `visual: { componente, params }` (§11.3).
- **No tiene precio ni duración**: esos están en `economia/obras.json` con el mismo id (`costoBase` en Áureos, `fechas`).

### 1.7 Cálculos: Capacidad, Valor y Lujo (CLU-2.4)

Funciones puras en `src/modulos/club/estadio/calculos.ts`:

```
capPieza(p, estilo).popular = redondear50(p.capacidad.popular × E[estilo].capPopular)
capPieza(p, estilo).platea  = redondear50(p.capacidad.platea  × E[estilo].capPlatea)
capPieza(p, estilo).palcos  = redondear50(p.capacidad.palcos  × E[estilo].capPlatea)

Capacidad nominal   = Σ capPieza de las ranuras tribuna_* y palcos
Capacidad habilitada = Σ capPieza de esas ranuras que NO están en obra ni clausuradas
                      × penalizacionSalto (si hay un salto en curso)

Lujo  = redondear( (Σ redondear(p.lujo × E[estilo].lujo)) × (1,10 si coherencia ≥ 80 %) ) + lujoBase[categoria]

Valor = Σ costoBase(p) × factorPrecio[estilo]  (+ recargos pagados)  +  Σ costo de los saltos hechos
ValorVilla = Σ costo de cada nivel construido de cada edificio (fórmula de economía §4)
```

- `redondear50` redondea al múltiplo de 50 más cercano (mitades hacia arriba); `redondear` es `Math.round`.
- **Valor está en la moneda única del juego** (Áureo, AU, economía §8; precios estables, sin inflación ni tipo de cambio). Economía lo usa para el mantenimiento (0,1 % semanal del Valor total, economía §3).
- La capacidad se expone **por tipo de ubicación** (`popular`, `platea`, `palcos`) porque economía pone precio de entrada por sector (§2b).
- Las piezas de cancha, accesos, servicios, techos, luces, pantalla y fachada aportan Lujo y Valor, no capacidad.
- Una pieza **en obra** (se está reemplazando) no aporta capacidad; sus Lujo y Valor siguen contando hasta que se reemplaza. Techos, luces, pantalla y fachada en obra no cierran nada.

### 1.8 Catálogo MVP: categorías 1–3 × ascenso y europeo

Valores finales ya con el modificador de estilo. **Valor** = precio propuesto para `economia/obras.json` (en millones de Áureos), dentro de los rangos de economía §4 (cat. 1: AU 20–60M, 1–2 fechas · cat. 2: AU 80–200M, 2–3 fechas · cat. 3: AU 300–800M, 3–4 fechas). Una sola moneda mundial, sin inflación ni parte importada (economía §8). Capacidad: `pop` popular, `pla` platea, `pal` palcos.

> Interpretación de la tabla §4 de economía: la fila "1 → 2" son los precios de las piezas **de categoría 1** (y el salto a la 2). Si economía quiso decir otra cosa, se corrige acá (pedido E1).

#### Categoría 1 · Cancha de barrio

| Id | Familia (lados) | Ascenso rioplatense | Europeo | Fechas | Nv | Capacidad asc / eur | Lujo asc / eur | Valor asc / eur |
|----|-----------------|---------------------|---------|-------:|---:|---------------------|---------------:|----------------:|
| `c1_tablones` | tribuna (todos) | Tablones de madera | Grada tubular desmontable | 1 | 1 | pop 1.100 / 850 | 1 / 1 | 20 / 22 |
| `c1_gradita` | tribuna (todos) | Gradita de cemento | Grada prefabricada | 2 | 2 | pop 1.750 / 1.350 | 2 / 3 | 40 / 44 |
| `c1_platea_madera` | tribuna (N, S) | Platea de madera con techito | Platea modular con butacas | 2 | 3 | pla 700 / 700 | 4 / 6 | 50 / 55 |
| `c1_pasto` | cancha | Pasto natural, riego a manguera | Pasto natural cortado a rayas | 1 | 1 | — | 1 / 1 | 20 / 22 |
| `c1_drenaje` | cancha | Césped con drenaje | Césped con drenaje | 2 | 3 | — | 3 / 4 | 45 / 50 |
| `c1_alambrado` | accesos | Alambrado y boletería de chapa | Valla de madera y caseta | 1 | 1 | — (incidentes × 1,00) | 1 / 1 | 20 / 22 |
| `c1_molinetes` | accesos | Molinetes y boletería de material | Molinetes y boletería | 2 | 2 | — (incidentes × 0,85) | 2 / 3 | 40 / 44 |
| `c1_vestuario_chapa` | servicios | Vestuario de chapa y baños químicos | Contenedores vestuario | 1 | 1 | — | 0 / 0 | 20 / 22 |
| `c1_vestuario_material` | servicios | Vestuarios de material | Vestuarios de ladrillo | 2 | 2 | — | 3 / 4 | 45 / 50 |

Máximo de cat. 1: 4 × 1.750 = **7.000** (ascenso) / 5.400 (europeo). Encaja con la demanda base de la B (6.000, economía §2).

#### Categoría 2 · Estadio de ascenso

| Id | Familia (lados) | Ascenso rioplatense | Europeo | Fechas | Nv | Capacidad asc / eur | Lujo asc / eur | Valor asc / eur |
|----|-----------------|---------------------|---------|-------:|---:|---------------------|---------------:|----------------:|
| `c2_popular` | tribuna (todos) | Popular de cemento con paravalanchas | Grada general con butacas | 2 | 6 | pop 3.850 / 3.000 | 3 / 4 | 90 / 99 |
| `c2_popular_alta` | tribuna (todos) | Popular alta de dos tramos | Grada general alta | 3 | 8 | pop 5.500 / 4.250 | 3 / 5 | 150 / 165 |
| `c2_platea` | tribuna (N, S) | Platea de cemento con butacas | Tribuna de butacas | 3 | 7 | pla 2.800 / 2.800 | 8 / 11 | 130 / 143 |
| `c2_mixta` | tribuna (N, S) | Platea baja y popular arriba | Platea baja y grada general | 3 | 9 | pla 1.500 + pop 2.400 / pla 1.500 + pop 1.850 | 6 / 9 | 160 / 176 |
| `c2_techo_chapa` | techo | Techo de chapa con columnas | Techo liviano de policarbonato | 2 | 6 | — | 4 / 6 | 80 / 88 |
| `c2_techo_parabolico` | techo | Techo parabólico | Techo curvo de chapa blanca | 2 | 9 | — | 6 / 9 | 120 / 132 |
| `c2_torres` | luces | Cuatro torres de luz | Cuatro torres de luz | 3 | 7 | — (nocturno) | 5 / 8 | 150 / 165 |
| `c2_cesped` | cancha | Césped nuevo con riego automático | Césped con riego automático | 2 | 6 | — | 4 / 6 | 90 / 99 |
| `c2_accesos` | accesos | Molinetes electrónicos por sector | Accesos con molinetes electrónicos | 2 | 7 | — (incidentes × 0,75) | 3 / 5 | 100 / 110 |
| `c2_servicios` | servicios | Vestuarios con sala de prensa | Vestuarios y sala de prensa | 2 | 8 | — | 5 / 8 | 110 / 121 |

Máximo de cat. 2: 4 × 5.500 = **22.000** (ascenso). Una mezcla típica (dos plateas y dos populares altas) da 16.600.

#### Categoría 3 · Estadio de Primera

| Id | Familia (lados) | Ascenso rioplatense | Europeo | Fechas | Nv | Capacidad asc / eur | Lujo asc / eur | Valor asc / eur |
|----|-----------------|---------------------|---------|-------:|---:|---------------------|---------------:|----------------:|
| `c3_popular` | tribuna (todos) | Popular de dos bandejas | Grada general de dos anillos | 4 | 14 | pop 9.900 / 7.650 | 5 / 8 | 380 / 418 |
| `c3_platea` | tribuna (N, S) | Platea alta y baja | Tribuna de dos anillos con butacas | 4 | 15 | pla 7.500 / 7.500 | 13 / 19 | 520 / 572 |
| `c3_platea_premium` | tribuna (N, S) | Platea preferencial acolchada | Tribuna premium | 4 | 18 | pla 5.000 / 5.000 | 20 / 30 | 640 / 704 |
| `c3_techo_metalico` | techo | Techo de estructura metálica | Techo de cerchas | 3 | 14 | — | 10 / 15 | 320 / 352 |
| `c3_techo_voladizo` | techo | Techo en voladizo, sin columnas | Techo en voladizo de membrana | 4 | 17 | — | 14 / 20 | 460 / 506 |
| `c3_luces_led` | luces | Torres LED | Torres LED | 3 | 14 | — (nocturno) | 9 / 13 | 320 / 352 |
| `c3_aro_luces` | luces (requiere 4 techos cat. ≥ 3) | Aro de luces en el techo | Aro de luces en el techo | 4 | 18 | — (nocturno) | 13 / 19 | 450 / 495 |
| `c3_pantalla` | pantalla | Pantalla gigante | Pantalla gigante | 3 | 15 | — | 10 / 15 | 340 / 374 |
| `c3_pantallas_dobles` | pantalla | Dos pantallas en las esquinas | Dos pantallas en las esquinas | 4 | 19 | — | 15 / 23 | 560 / 616 |
| `c3_palcos` | palcos (requiere platea en `tribuna_norte`) | Palcos vidriados | Palcos vidriados | 4 | 16 | pal 400 / 400 | 21 / 31 | 480 / 528 |
| `c3_fachada_simple` | fachada | Fachada con mural de ídolos | Fachada de chapa perforada | 3 | 14 | — | 7 / 10 | 300 / 330 |
| `c3_fachada_estilo` | fachada | Ladrillo, hierro y el escudo gigante | Membrana y vidrio con costillas | 4 | 18 | — | 15 / 23 | 600 / 660 |
| `c3_cesped_hibrido` | cancha | Césped híbrido | Césped híbrido | 3 | 15 | — | 10 / 15 | 360 / 396 |
| `c3_accesos` | accesos | Explanada con accesos por sector | Explanada con accesos por sector | 3 | 14 | — (incidentes × 0,60) | 7 / 10 | 300 / 330 |
| `c3_servicios` | servicios | Vestuarios de Primera con sala de conferencias | Vestuarios y zona mixta | 3 | 15 | — | 9 / 13 | 320 / 352 |

Máximo de cat. 3: 4 × 9.900 = **39.600** (ascenso). Mezcla típica (dos plateas, dos populares y palcos): 35.200 ascenso / 30.700 europeo. Lujo de una cat. 3 completa y prolija: ~ 190 ascenso / ~ 270 europeo (con coherencia y base).

Categorías 4–6 (V1) siguen el mismo modelo; en el MVP se muestran como **objetivo bloqueado** en la pantalla de Estructura con su silueta y requisitos.

### 1.9 Estado inicial del estadio

Categoría 1, estilo elegido en la creación, con **4 de 7** piezas (57 %, hay que construir al menos una más antes del primer salto):

| Ranura | Pieza |
|--------|-------|
| `tribuna_norte` | `c1_tablones` |
| `tribuna_oeste` | `c1_tablones` |
| `cancha` | `c1_pasto` |
| `servicios` | `c1_vestuario_chapa` |
| resto | vacías (terreno preparado) |

Capacidad inicial: **2.200** (ascenso) / 1.700 (europeo). Con la demanda base de la B (6.000) arrancás con **sobreventa permanente**: las primeras obras obvias son tribunas baratas. Es intencional, pero economía tiene que confirmar que no rompe los ingresos del primer año (pedido E6).

### 1.10 Personalización (CLU-2.7)

Gratis o casi (cosmético, sin efecto en números):
- **Nombre del estadio** (libre mientras no haya naming rights; con naming, se muestra el del sponsor).
- **Butacas**: dos colores y un patrón (`liso`, `alternado`, `franjas`, `iniciales`: las butacas forman las iniciales del club, como en los estadios de verdad).
- **Fachada**: color principal (el kit decide el material).
- **Trapos**: texto corto + dos colores + tipo (`bandera`, `trapo_largo`, `tirantes`). Cupo por categoría: 2 / 4 / 6 / 8 / 10 / 12. Los trapos son de la hinchada: en estilo ascenso cuelgan del alambrado y los paravalanchas, en europeo van en la baranda de la bandeja.
- **Banderas** en mástiles y techo con los colores del club.

### 1.11 Clausuras y estado de la cancha

- **Clausura** de una tribuna por N partidos de local (sanción de AFA, sobreventa con incidentes, movida de obras). La tribuna no aporta capacidad; se ve vacía y con una faja. Llega como Efecto (pedido N2).
- **Estado de la cancha** (V1): 0–100. Baja con recitales, lluvia o nieve (movidas) y se recupera por día según la pieza de `cancha`. Lo lee `partido` si quiere.

---

## 2. La villa (CLU-4)

### 2.1 Edificios

Cada edificio tiene un **lote fijo** en el mapa (§11.4). Nivel 0 = lote vacío construible; nivel 1–5 = construido. Construir el nivel 1 es una obra como cualquier otra. Precios y duraciones: economía §4 (`base × 1,8^(n−1)`, `n` fechas).

| Edificio (id) | Nombre en el juego | MVP | Arranca en | Se desbloquea | Base de economía |
|---------------|--------------------|:---:|-----------:|---------------|------------------|
| `oficinas` | Sede · el Despacho | sí | nivel 1 | — | AU 40M |
| `entrenamiento` | Ciudad deportiva | sí | nivel 1 | — | AU 15M |
| `ojeadores` | Oficina de ojeadores | sí | lote | nivel de club 1 | AU 15M |
| `prensa` | Prensa y redes | sí | lote | nivel de club 1 | AU 15M |
| `parrilla` | Parrilla / buffet | propuesta MVP (U7) | lote | nivel de club 3 | AU 10M |
| `gimnasio` | Gimnasio y recuperación | V1 | — | nivel de club 4 | AU 20M |
| `tienda` | Tienda oficial | V1 | — | nivel de club 5 | AU 10M |
| `medico` | Departamento médico | V1 | — | nivel de club 7 | AU 20M |
| `comedor` | Comedor | V1 | — | nivel de club 9 | falta (pedido E3) |
| `pension` | Pensión e inferiores | V1 | — | nivel de club 10 | AU 25M |
| `consultorio` | Consultorio | V1 | — | nivel de club 12 | AU 20M |
| `sede_social` | Sede social | V1 | — | nivel de club 14 | falta (pedido E3) |

> Ojo con los nombres: economía llama "Sede (el Despacho)" a `oficinas`. La **sede social** (CLU-4, socios y eventos de barrio) es otro edificio. En el juego, `oficinas` se rotula "Sede · el Despacho", como en el prototipo.

### 2.2 Reglas

- **Nivel máximo** de cualquier edificio = `min(5, nivelMaxPorCategoria[categoría del estadio])` (tabla §1.3): cat. 1 → 2, cat. 2 → 3, cat. 3 → 4, cat. 4+ → 5.
- **Inactivo en obra (CLU-3.4):** mientras un edificio se mejora, **no aporta ningún efecto** (ni el de su nivel anterior) y su staff no rinde. Excepción: el Despacho sigue recibiendo movidas; lo que se pierde son sus bonus (plazo extra, opciones del staff).
- El staff **no vive en la porción club**: lo guarda `mercado` con una referencia al edificio. El club define **cupos** y **nivel máximo de staff = nivel del edificio** (CLU-5.2).

### 2.3 Efectos por nivel (propuesta; se calibran con simulaciones)

Los efectos son **multiplicadores o valores** que el club expone en `modificadores(club)` (§8) y que leen otros módulos. "×" multiplica la base del módulo que lo usa.

| Edificio | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 4 | Nivel 5 | Lo usa |
|----------|---------|---------|---------|---------|---------|--------|
| `oficinas` | cuadrillas 1 | + 1 día de plazo en movidas con vencimiento | cuadrillas 2 | + 2 días de plazo | cuadrillas 3 | club, movidas |
| `entrenamiento` | progreso de atributos × 1,00 | × 1,10 | × 1,20 | × 1,30 | × 1,40 | mercado |
| `ojeadores` | 8 jugadores en el mercado, hasta 2,5 ★, región local | 12, 3 ★, + nacional | 16, 3,5 ★, + Sudamérica | 20, 4 ★, + Europa | 25, 5 ★, + resto del mundo | mercado |
| `prensa` | daño de escándalos × 0,92 · fama ganada × 1,05 | × 0,84 · × 1,10 · opción extra en movidas de prensa | × 0,76 · × 1,15 | × 0,68 · × 1,20 | × 0,60 · × 1,25 | movidas, economía |
| `parrilla` | nivel 1 en la fórmula del buffet | 2 | 3 | 4 | 5 | economía (§2: asistencia × AU 800 × nivel) |
| `gimnasio` | recuperación física × 1,10 · riesgo de lesión × 0,95 | × 1,20 · × 0,90 | × 1,30 · × 0,85 | × 1,40 · × 0,80 | × 1,50 · × 0,75 | mercado, partido |
| `tienda` | nivel 1 en la fórmula de merchandising | 2 | 3 | 4 | 5 | economía (§2: fama × AU 40 × nivel) |
| `medico` | duración de lesiones × 0,92 | × 0,84 | × 0,76 | × 0,68 | × 0,60 | mercado |
| `comedor` | variación de rendimiento × 0,90 | × 0,80 | × 0,70 | × 0,60 | × 0,50 | partido |
| `pension` | 2 juveniles por temporada, potencial hasta 3 ★ | 3, 3,5 ★ | 3, 4 ★ | 4, 4,5 ★ | 5, 5 ★ | mercado |
| `consultorio` | caída de moral × 0,92 · presión en finales × 0,90 | × 0,84 · × 0,80 | × 0,76 · × 0,70 | × 0,68 · × 0,60 | × 0,60 · × 0,50 | mercado, partido, movidas |
| `sede_social` | demanda de entradas × 1,02 · rasgo `sede_social` (eventos de barrio) | × 1,04 | × 1,06 | × 1,08 | × 1,10 | economía, movidas |

### 2.4 Cupos de staff por edificio y nivel

Roles propuestos (los ids finales y el contrato de staff son de `mercado`, pedido M1). Los cupos son **acumulados** por nivel.

| Edificio | Nivel 1 | Nivel 2 | Nivel 3 | Nivel 4 | Nivel 5 |
|----------|---------|---------|---------|---------|---------|
| `oficinas` | secretario 1 | + abogado 1 | + contador 1 | + abogado o contador 1 | + 1 (abogado o contador) · total 5 |
| `entrenamiento` | preparador físico 1 | + ayudante de campo 1 | + entrenador de arqueros 1 | + ayudante de campo 1 | + analista de video 1 · total 5 |
| `ojeadores` | ojeador 1 | 2 | 3 | 4 | 5 |
| `prensa` | community manager 1 | + asesor de prensa 1 | 2 (CM o asesor) | 3 | 3 |
| `gimnasio` | kinesiólogo 1 | 1 | 2 | 2 | 3 |
| `medico` | médico 1 | 1 | 2 | 2 | 3 |
| `comedor` | nutricionista 1 | + cocinero 1 | 2 | 3 | 3 |
| `pension` | coordinador de inferiores 1 | 1 | + entrenador juvenil 1 | 2 | 3 |
| `consultorio` | psicólogo 1 | 1 | 1 | 2 | 2 |
| `parrilla`, `tienda`, `sede_social` | — | — | — | — | — |

---

## 3. Nivel y XP del club

La porción `club` guarda `nivel` y `xp` (el núcleo no le asignó dueño; pedido N4). El nivel destraba piezas, lotes de la villa y saltos de categoría.

- **XP acumulada para llegar al nivel `n`:** `50 × n × (n − 1)` (nivel 6 = 1.500 · nivel 14 = 9.100 · nivel 22 = 23.100 · nivel 30 = 43.500 · nivel 40 = 78.000). Nivel máximo 50.
- **Fuentes** (propuesta; `src/datos/club/nivel.json`):

| Fuente | XP |
|--------|---:|
| Partido oficial jugado | 10 |
| + victoria / + empate | 15 / 5 |
| Obra terminada (pieza, edificio o salto) | 1 por cada 1M de `costoBase` |
| Ascenso | 1.500 |
| Título de liga / copa nacional / copa continental | 3.000 / 1.500 / 4.000 |

- Estimación grosera: un club "razonable" llega a nivel 6 a fin de la temporada 1 y a nivel ~14 en la temporada 3–4. Las metas de economía (§9: cat. 4 en la temporada 4–6) **dependen de esta curva**: tiene que entrar en las simulaciones (pedido E8).

---

## 4. Obras y cuadrillas (CLU-3)

### 4.1 Qué es una obra

| Tipo | Objetivo | Duración | Cierra algo |
|------|----------|----------|-------------|
| `pieza` | colocar una pieza en una ranura (nueva o reemplazo) | economía, por id de pieza | tribunas y palcos: la ranura no aporta capacidad. El resto no cierra nada |
| `salto` | subir de categoría | economía §4 | todo el estadio: capacidad × `penalizacionSalto`, sin otras obras de estadio |
| `edificio` | subir un nivel (o construir el 1) | `n` fechas (economía §4) | el edificio queda inactivo |
| `reestilo` | cambiar el kit de una o varias piezas | 1 fecha por pieza (agrupado: `max(2, ceil(piezas/3))`) | no |

### 4.2 Avance (CLU-3.2)

- Una obra avanza **una fecha por cada partido oficial del club** (liga, copa, repechaje) — gancho `despuesDelPartido`.
- **Semanas sin partido oficial** (pretemporada, receso de invierno, cierre): avanzan **una fecha por semana** — gancho `alCerrarSemana`. Así el receso sirve para hacer la tribuna, como en la vida real (pregunta U1).
- Los amistosos no cuentan.

### 4.3 Cuadrillas y cola

- **Cuadrillas** = las que da `oficinas` (1 / 1 / 2 / 2 / 3) + **cuadrillas temporales** contratadas por N fechas (costo: economía, pedido E2).
- Cada obra en curso ocupa una cuadrilla. Una obra **frenada** (por movida) sigue ocupando su cuadrilla.
- **Cola:** hasta 5 obras en espera. Cuando se libera una cuadrilla, arranca la primera de la cola **si la caja alcanza el anticipo**; si no, sigue esperando y se emite una noticia ("La tribuna sur espera plata").
- **Reglas de conflicto:** no puede haber dos obras sobre la misma ranura o el mismo edificio; un `salto` exige que no haya obras de estadio en curso y bloquea las nuevas.
- **Pagos** (economía §3): 50 % al arrancar, 50 % al terminar. El monto sale de `economia/obras.json` (moneda única, precios estables; pedido E4).
- **Cancelar:** en cola, gratis. En curso, se pierde el anticipo y la pieza anterior vuelve a funcionar.
- **Reemplazo:** la pieza vieja se va al terminar la obra; no hay reintegro.

### 4.4 Validación al encolar (`puedeEncolar`)

Una obra de pieza se puede encolar si: la ranura está habilitada en la categoría; la pieza es de `categoria ≤ categoría del estadio`; `nivelRequerido ≤ nivel`; el lado está permitido; se cumplen sus `requiere`; el estilo está desbloqueado; no hay salto en curso; la cola no está llena. Devuelve `{ ok: true }` o `{ ok: false, motivo }` con un texto para la UI (candado con el motivo).

---

## 5. Entornos y ambientación (CLU-13, CLU-8.4, DES-8)

### 5.1 Unificación

Hoy hay tres listas que no coinciden (paisaje de `tecnica.md`, entornos de CLU-13, paisaje y clima de DES-8). Propuesta: la ambientación del club es **`{ lugar, entorno }`**.

- **`entorno`** = la lista de CLU-13: `ciudad`, `campo`, `montana`, `frio`, `caribe`, `costa`, `desierto`, `luna`. (Equivalencias: conurbano → ciudad, llanura → campo, nieve → frío, trópico → Caribe.)
- **`lugar`** = tamaño del lugar de DES-8: `barrio` (de gran ciudad), `ciudad` (mediana), `pueblo`, `puerto`. Cambia la decoración cercana (densidad de torres, calles) y aporta rasgos para movidas.

### 5.2 Entornos por capas (CLU-13.5)

Cada entorno es una combinación de **capas** reutilizables, definidas en `src/datos/club/entornos.json`. Agregar un entorno nuevo = un JSON nuevo combinando capas existentes (y, si hace falta, un componente de capa nuevo).

| Entorno | MVP | Terreno | Vegetación | Horizonte | Cielo y niebla | Luz | Clima |
|---------|:---:|---------|------------|-----------|----------------|-----|-------|
| `ciudad` | sí | pasto urbano, manzanas, avenidas con veredas | árboles de copa redonda en veredas y plazas | skyline de torres con ventanas (350–800 m) | celeste, niebla clara | mediodía cálido | — |
| `campo` | sí | llanura con parcelas de cultivo en franjas, caminos de tierra | álamos y eucaliptos en hilera, montes | silos, molinos, galpones, tanque australiano, horizonte plano | cielo enorme con nubes | tarde dorada | — |
| `montana` | sí | lomas con desnivel, lago | pinos | cordillera nevada en tres planos | azul intenso, niebla suave | sol fuerte y frío | — |
| `frio` | V1 | nieve, lagos congelados | pinos nevados | colinas blancas, chimeneas | gris | baja y fría, ventanas cálidas | nieve cayendo |
| `caribe` | V1 | arena blanca, mar turquesa | palmeras | mar con islas | saturado | sol fuerte | — |
| `costa` | V1 | rambla, médanos, puerto | pinos marítimos, tamariscos | mar, grúas del puerto, faro | nubes | tarde | viento (banderas) |
| `desierto` | V1 | arena, rocas, dunas | arbustos secos, oasis de palmeras | mesetas rojizas | despejado, calima | luz dura | — |
| `luna` | desbloqueable | regolito gris, cráteres | ninguna (cúpulas con plantas) | la Tierra en el cielo | negro estrellado | dura, sin atmósfera | — |

### 5.3 Rasgos para movidas (CLU-13.4, DES-8.3)

El club **no escribe marcas** por el entorno: expone `rasgosClub(club)` (lista de strings) que `movidas` lee en sus condiciones. Son la unión de los rasgos del entorno, del lugar, de los sponsors activos y de algunos estados del estadio.

| Fuente | Rasgos |
|--------|--------|
| `ciudad` | `urbano`, `transito`, `vecinos_quejosos`, `skyline` |
| `campo` | `rural`, `cosecha`, `sequia`, `inundacion_campo`, `caminos_de_tierra` |
| `montana` | `altura`, `frio_nocturno`, `nevada_ocasional`, `turismo_invierno`, `ruta_cortada` |
| `frio` | `nieve`, `helada`, `cancha_congelada`, `calefaccion` |
| `caribe` | `turismo`, `huracan`, `calor`, `humedad`, `temporada_alta` |
| `costa` | `puerto`, `temporada_turistica`, `sudestada`, `pesca` |
| `desierto` | `calor_extremo`, `tormenta_de_arena`, `petrodolares`, `agua_escasa` |
| `luna` | `gravedad_baja`, `sin_atmosfera`, `viaje_largo`, `absurdo` |
| lugar `barrio` | `clasico_de_barrio`, `vecinos` |
| lugar `ciudad` | `ciudad_mediana`, `diario_local` |
| lugar `pueblo` | `pueblo`, `todos_se_conocen`, `fabrica_del_pueblo`, `intendente_cercano` |
| lugar `puerto` | `puerto`, `estibadores` |
| estadio | `sin_luces` (no hay pieza de luces), `cancha_con_drenaje`, `categoria_N`, `estadio_en_obra` |
| villa | `sede_social` (nivel ≥ 1), `pension` (nivel ≥ 1) |
| sponsors activos | los `rasgos` de cada marca (§7): `apuestas`, `cripto`, `volatil`, `alcohol`, `local`, … |

### 5.4 Mudanza (CLU-13.2)

- Se cambia entorno y/o lugar desde Identidad, cuando quieras, **sin perder nada**: el estadio y la villa son los mismos; cambia el fondo y los rasgos.
- Costo: economía (pedido E2). Enfriamiento: una mudanza por temporada.
- Efectos al mudarse (propuesta): relación con hinchas −10 y con socios −10, marca `club.mudanza` = temporada (para la movida "los hinchas no te lo perdonan").
- **Estilos sugeridos** por entorno (DES-8.4): ciudad → primera_arg, europeo, ascenso · campo → ascenso, inglés · montaña → andino, europeo · frío → invierno · Caribe → tropical · costa → tropical, ascenso, inglés · desierto → desierto, futurista · luna → futurista. Cualquier estilo funciona en cualquier entorno (CLU-13.3).
- **Luna**: desbloqueo propuesto = ganar la copa continental **o** llegar a categoría 6 (pregunta U5).

---

## 6. Identidad (CLU-8)

```
Identidad
├── nombre, apodo, iniciales (2–4 letras), año de fundación (ficticio)
├── colores: primario, secundario, terciario opcional
├── escudo: forma · partición · ícono · iniciales · estrellas (títulos)
├── camisetas: titular, suplente (y arquero, V1)
└── estadio: nombre elegido (el visible depende de naming rights)
```

- **Escudo paramétrico** (SVG generado): `forma` ∈ { clásico, redondo, francés, triangular, rombo, banderín }, `particion` ∈ { lisa, franja, banda, bastones, cuartelado, chevron }, `icono` de un catálogo neutro (~20: estrella, pelota, ancla, montaña, sol, rayo, león, toro, águila, castillo, llave, engranaje, espiga, copo, palmera, ola, cactus, cohete…), `iniciales` y `estrellas`. Función pura `escudoSVG(escudo, colores): string`, la usan el HUD, la UI y la escena (como textura en banderas y fachada).
- **Camiseta paramétrica:** `patron` ∈ { lisa, bastones, franja, banda, aros, cuartos }, hasta 3 colores, `cuello` ∈ { redondo, en_v, polo, mao }, `numero` { color, borde, tipografía: clásica, moderna, retro }, `detalle` ∈ { ninguno, ribete }. Función `pintarCamiseta(lienzo2D, camiseta, sponsorsVisibles, cara: 'frente'|'espalda')`, compartida por la UI (canvas → imagen) y la escena 3D / partido (textura). Los sponsors de pecho, espalda, manga y short se pintan en zonas fijas (§7.5).
- **Al azar (INT-6.2):** `identidadAlAzar(rng, datos)` con combinaciones de colores que contrastan (regla de contraste mínimo entre primario y secundario).
- **Cambios después de creado:** camiseta, gratis una vez por temporada (en pretemporada). Nombre y colores del club: permitidos con costo (economía) y marca `club.cambio_identidad` para que movidas arme la reacción de los hinchas (pregunta U8).
- **Nada real:** el catálogo de íconos y formas es genérico; la validación no permite cargar imágenes externas.

---

## 7. Sponsors (CLU-9)

### 7.1 Espacios

| Espacio | Cupo | Desde | Dónde se ve |
|---------|-----:|-------|-------------|
| `pecho` | 1 | siempre | camiseta (frente) |
| `espalda` | 1 | siempre | camiseta (espalda, arriba del número) |
| `manga` | 1 | siempre | camiseta (manga izquierda) |
| `short` | 1 | siempre | short |
| `cartel` | 2 / 4 / 6 / 8 / 10 / 12 según categoría | siempre | cat. 1 chapa pintada en el alambrado · cat. 2 carteles de chapa · cat. 3+ LED perimetral |
| `naming` | 1 | categoría 4 (economía §2) | nombre del estadio en la fachada, etiquetas y noticias |

Montos: economía (pecho B AU 150–400M, Primera AU 800M–2.500M; resto 10–30 % del pecho). El club no fija montos: cada marca tiene un **perfil de pago** (`bajo`, `medio`, `alto`, `muy_alto`) que economía traduce a Áureos (pedido E5).

### 7.2 Marcas (ficticias, por rubro)

`src/datos/club/marcas.json`. Cada marca: nombre, rubro, alcance (`barrio`, `nacional`, `internacional`), colores y logo-texto, espacios que le interesan, perfil de pago, requisitos, efectos y rasgos.

| Marca (ejemplo) | Rubro | Perfil | Requisitos (propuesta) | Efectos secundarios | Rasgos para movidas |
|-----------------|-------|--------|------------------------|---------------------|---------------------|
| ApostAR | casa de apuestas | muy alto | fama ≥ 20.000 | al firmar: hinchas −3, prensa −2 | `apuestas` (amaño, críticas, la AFA mira) |
| CriptoGol | exchange cripto | alto | fama ≥ 15.000 | ninguno al firmar | `cripto`, `volatil` (pausa de retiros, desaparece la plata) |
| Billetera Ya | billetera virtual | medio | fama ≥ 10.000 | fama × 1,02 mientras dure | `fintech` |
| Cerveza del Sur | cerveza | alto | Lujo ≥ 20 | al firmar: hinchas +2 | `alcohol` (joda patrocinada, controles) |
| Yerba La Patrona | yerba | bajo | ninguno | al firmar: hinchas +5, socios +3 | `local`, `barrio` |
| Telco+ | telefonía | medio | fama ≥ 30.000, sin descenso en la temporada | ninguno | `corporativo` |
| Salud Plena | prepaga | medio | Lujo ≥ 40 | duración de lesiones × 0,95 | `salud` |
| Corralón El Tano | corralón | bajo | ninguno | costo de obras × 0,95 mientras dure | `local`, `obras` |

### 7.3 Ofertas

- Se generan en `alCerrarSemana` con el `rng` del módulo: por cada espacio libre, probabilidad base del espacio × factor de fama (`ofertas.json`). En pretemporada (semanas 1–4) y receso (25–28) la probabilidad se duplica. Al ascender, una oferta de pecho garantizada.
- Solo se ofrecen marcas cuyos requisitos se cumplen hoy y que no choquen por **exclusividad de rubro** con un contrato vigente.
- Máximo 3 ofertas abiertas. Cada una **vence a los 14 días**. Una oferta de `pecho` o `naming` dispara una **interrupción** de tipo `oferta` (NUC-2.3).
- Una oferta tiene: marca, espacio, temporadas (1–3), pago por temporada (calculados por economía al generarla), cláusulas.
- Las movidas también pueden traer ofertas (DES-7, ej. "ApostAR ofrece el pecho por el triple") con el efecto `club` de tipo `ofrecerSponsor` (pedido N2).

### 7.4 Contratos y cláusulas

- Aceptar = contrato vigente desde hoy. Economía cobra las cuotas trimestrales leyendo `club.sponsors.contratos` (pedido E5).
- **Cláusulas** (datos): `rescinde_si` (ej. si descendés), `bonus_si` (ej. si ascendés, perfil `chico`/`grande`), `exclusividad_rubro`, `renovacion_preferente`.
- **Rescindir** vos: multa (economía) y relación con sponsors −5. **Rescinde la marca**: por cláusula (al cerrar temporada) o por movida (efecto `club` / `rescindirSponsor`).
- Al vencer: noticia y, si tenía `renovacion_preferente`, una oferta de renovación automática.

### 7.5 Cómo se ven

- Pecho, espalda, manga y short se pintan en la textura de la camiseta (logo-texto con los colores de la marca, nunca logos reales).
- Carteles: textura del perímetro (alambrado, chapa o LED animado) con las marcas de los contratos de `cartel`; si hay espacios libres, carteles del club ("Socios", "Escuelita").
- Naming: reemplaza el nombre del estadio con la plantilla de la marca ("ApostAR Arena").

---

## 8. Lo que el club expone (selectores)

`src/modulos/club/selectores.ts`. Funciones puras sobre la `Partida` (o la porción + datos). **Es la API de lectura** para los demás módulos y la UI.

| Selector | Devuelve | Lo usan |
|----------|----------|---------|
| `capacidad(club)` | `{ nominal, habilitada }` cada una `{ popular, platea, palcos, total }` | economía (recaudación, §2b), partido (Aguante) |
| `lujo(club)` | número | economía (fama, sponsors), movidas |
| `valor(club)` | `{ estadio, villa, total }` en Áureos | economía (mantenimiento) |
| `modificadores(club)` | `ModificadoresClub` (§9.4) | mercado, partido, economía, movidas |
| `cuposStaff(club, edificio)` | `{ rol, cupos, nivelMax }[]` | mercado |
| `edificioActivo(club, edificio)` | boolean | mercado, movidas |
| `nivelEdificio(club, edificio)` | 0–5 | economía (parrilla, tienda), movidas |
| `tieneLuces(club)` | boolean | liga (horarios nocturnos) |
| `rasgosClub(club)` | `string[]` | movidas |
| `obrasEnCurso(club)` | `Obra[]` | movidas (imprevistos), UI |
| `sponsorsActivos(club)` | contratos con su marca resuelta | economía, movidas, UI |
| `puedeEncolar(club, objetivo, partida)` | `{ ok } \| { ok: false, motivo }` | UI, simulación automática |
| `requisitosSalto(club)` | progreso hacia el próximo salto | UI |
| `vistaClub(partida)` | `VistaClub` (§11.2) | escena 3D |

---

## 9. Tipos TypeScript de la porción `club`

Sobre el contrato del núcleo (`Instante`, `Efecto`, `Noticia`, `Interrupcion`, `Contexto`, `Salida`, `Modulo`). Archivo: `src/modulos/club/tipos.ts`.

### 9.1 Identificadores

```ts
type Categoria = 1 | 2 | 3 | 4 | 5 | 6
type Lado = 'norte' | 'sur' | 'este' | 'oeste'
type IdEstilo = 'ascenso' | 'primera_arg' | 'europeo' | 'ingles' | 'andino'
              | 'invierno' | 'tropical' | 'desierto' | 'futurista'
type FamiliaPieza = 'tribuna' | 'techo' | 'cancha' | 'accesos' | 'servicios' | 'luces'
                  | 'pantalla' | 'palcos' | 'fachada' | 'esquinas' | 'tecnologia'
                  | 'experiencia' | 'cubierta'
type Ranura = `tribuna_${Lado}` | `techo_${Lado}`
            | 'cancha' | 'accesos' | 'servicios' | 'luces' | 'pantalla' | 'palcos'
            | 'fachada' | 'esquinas' | 'tecnologia' | 'experiencia' | 'cubierta'
type IdPieza = string                       // 'c2_popular'
type TipoEdificio = 'oficinas' | 'entrenamiento' | 'ojeadores' | 'prensa' | 'parrilla'
                  | 'gimnasio' | 'tienda' | 'medico' | 'comedor' | 'pension'
                  | 'consultorio' | 'sede_social'
type IdEntorno = 'ciudad' | 'campo' | 'montana' | 'frio' | 'caribe' | 'costa' | 'desierto' | 'luna'
type Lugar = 'barrio' | 'ciudad' | 'pueblo' | 'puerto'
type EspacioSponsor = 'pecho' | 'espalda' | 'manga' | 'short' | 'cartel' | 'naming'
type Rubro = 'cerveza' | 'apuestas' | 'cripto' | 'billetera' | 'yerba' | 'telefonia' | 'prepaga' | 'corralon'
type IdObra = string                        // 'obra-0007'
type Color = string                         // '#C8202F'
```

### 9.2 Estado (la porción)

```ts
interface EstadoClub {
  version: 1
  nivel: number
  xp: number
  identidad: Identidad
  ambientacion: { lugar: Lugar; entorno: IdEntorno; ultimaMudanza?: Instante }
  estadio: EstadoEstadio
  villa: Partial<Record<TipoEdificio, { nivel: 0 | 1 | 2 | 3 | 4 | 5 }>>   // sin entrada = bloqueado
  obras: {
    lista: Obra[]                           // en curso + en cola, en orden de cola
    temporales: { fechasRestantes: number }[]   // cuadrillas temporales contratadas
    proximoId: number
  }
  sponsors: {
    contratos: ContratoSponsor[]
    ofertas: OfertaSponsor[]
    proximoId: number
  }
  desbloqueos: { estilos: IdEstilo[]; entornos: IdEntorno[] }
  registro: {
    semanaConPartido?: { temporada: number; semana: number }   // para el avance en receso
    fechasDeObraAvanzadas: number
  }
}

interface EstadoEstadio {
  categoria: Categoria
  estiloPrincipal: IdEstilo
  nombre: string                            // el elegido; el visible lo resuelve un selector
  ranuras: Partial<Record<Ranura, PiezaColocada>>
  personalizacion: {
    butacas: { colores: [Color, Color]; patron: 'liso' | 'alternado' | 'franjas' | 'iniciales' }
    fachada: Color
    trapos: { texto: string; colores: [Color, Color]; tipo: 'bandera' | 'trapo_largo' | 'tirantes'; lado: Lado }[]
  }
  clausuras: { ranura: Ranura; partidos: number; motivo: string }[]
  cancha: { estado: number }                // 0–100, V1
}

interface PiezaColocada { pieza: IdPieza; estilo: IdEstilo; desde: Instante }

type ObjetivoObra =
  | { tipo: 'pieza'; ranura: Ranura; pieza: IdPieza; estilo: IdEstilo }
  | { tipo: 'salto'; categoria: Categoria }
  | { tipo: 'edificio'; edificio: TipoEdificio; nivel: 1 | 2 | 3 | 4 | 5 }
  | { tipo: 'reestilo'; ranuras: Ranura[]; estilo: IdEstilo; principal: boolean }

interface Obra {
  id: IdObra
  objetivo: ObjetivoObra
  estado: 'en_cola' | 'en_curso' | 'frenada'
  fechasTotales: number
  fechasRestantes: number
  frenadaPor?: number                       // fechas que le quedan frenada
  encoladaEn: Instante
  iniciadaEn?: Instante
}

interface Identidad {
  nombre: string; apodo: string; iniciales: string; fundacion: number
  colores: { primario: Color; secundario: Color; terciario?: Color }
  escudo: { forma: FormaEscudo; particion: ParticionEscudo; icono: string; iniciales: string; estrellas: number }
  camisetas: { titular: Camiseta; suplente: Camiseta }
  cambiosEstaTemporada: { camiseta: boolean }
}
type FormaEscudo = 'clasico' | 'redondo' | 'frances' | 'triangular' | 'rombo' | 'banderin'
type ParticionEscudo = 'lisa' | 'franja' | 'banda' | 'bastones' | 'cuartelado' | 'chevron'
interface Camiseta {
  patron: 'lisa' | 'bastones' | 'franja' | 'banda' | 'aros' | 'cuartos'
  colores: [Color, Color, Color?]
  cuello: 'redondo' | 'en_v' | 'polo' | 'mao'
  numero: { color: Color; borde: Color; tipografia: 'clasica' | 'moderna' | 'retro' }
  detalle: 'ninguno' | 'ribete'
}

interface OfertaSponsor {
  id: string; marca: string; espacio: EspacioSponsor
  temporadas: 1 | 2 | 3
  pagoPorTemporada: number   // los calcula economía al generar la oferta
  clausulas: Clausula[]
  vence: Instante
  origen: 'mercado' | 'movida'
}
interface ContratoSponsor {
  id: string; marca: string; espacio: EspacioSponsor
  desde: Instante; hastaTemporada: number
  pagoPorTemporada: number
  clausulas: Clausula[]
}
type Clausula =
  | { tipo: 'rescinde_si'; condicion: CondicionClub }
  | { tipo: 'bonus_si'; condicion: CondicionClub; perfil: 'chico' | 'grande' }
  | { tipo: 'exclusividad_rubro' }
  | { tipo: 'renovacion_preferente' }

// Mínima, hasta alinear con la Condicion de movidas (pedido Mv4)
type CondicionClub =
  | { tipo: 'fama_min'; valor: number }
  | { tipo: 'lujo_min'; valor: number }
  | { tipo: 'categoria_min'; valor: Categoria }
  | { tipo: 'division'; valor: 'b_nacional' | 'primera' }
  | { tipo: 'desciende' } | { tipo: 'asciende' }
  | { tipo: 'rasgo'; valor: string }
```

### 9.3 Definiciones (datos, solo lectura)

```ts
interface DefPieza {
  id: IdPieza; familia: FamiliaPieza; categoria: Categoria
  lados?: Lado[]; nivelRequerido: number
  nombre: string; nombres?: Partial<Record<IdEstilo, string>>; descripcion?: string
  capacidad: { popular: number; platea: number; palcos: number }
  lujo: number
  requiere?: { ranura: Ranura | `techo_*`; familia?: FamiliaPieza; categoriaMin?: Categoria; idEn?: IdPieza[] }[]
  efectos?: { riesgoIncidentes?: number; nocturno?: boolean; drenaje?: boolean }
  soloEstilos?: IdEstilo[]                  // piezas exclusivas de un estilo (V1)
  visual: { componente: string; params: Record<string, unknown> }
}
interface DefEstilo {
  id: IdEstilo; nombre: string; mvp: boolean
  modificadores: { capPopular: number; capPlatea: number; lujo: number }   // el factor de precio está en economía
  kit: KitEstilo
  desbloqueo: { inicial?: true; categoriaMin?: Categoria; lujoMin?: number; entorno?: IdEntorno[] }
}
interface KitEstilo {
  materiales: Record<'estructura' | 'grada' | 'techo' | 'fachada' | 'baranda' | 'piso', DefMaterial>
  adornos: { componente: string; familias: FamiliaPieza[]; params?: Record<string, unknown> }[]
  usaColoresDelClub: ('butacas' | 'fachada' | 'techo' | 'franjas')[]
}
interface DefMaterial { color?: Color; textura?: string; rugosidad: number; metalico: number; emisivo?: Color }
interface DefCategoria {
  categoria: Categoria; nombre: string; offsetMax: number; lujoBase: number
  ranuras: Ranura[]; nivelMaxEdificios: number; delta: number
  salto?: { nivelClub: number; fraccionPiezas: number; penalizacionCapacidad: number }
  cuposCarteles: number; cuposTrapos: number
}
interface DefEdificio {
  tipo: TipoEdificio; nombre: string; mvp: boolean; desbloqueoNivelClub: number
  niveles: { nivel: 1 | 2 | 3 | 4 | 5; efectos: Partial<ModificadoresClub>; staff: { rol: string; cupos: number }[]; visual: { componente: string; params: Record<string, unknown> } }[]
}
interface DefEntorno {
  id: IdEntorno; nombre: string; mvp: boolean
  capas: { terreno: string; vegetacion: string; horizonte: string; cielo: string; luz: string; clima?: string }
  params?: Record<string, unknown>
  rasgos: string[]; estilosSugeridos: IdEstilo[]
  desbloqueo?: { condicion: CondicionClub[] }
}
interface DefMarca {
  id: string; nombre: string; rubro: Rubro; alcance: 'barrio' | 'nacional' | 'internacional'
  perfilPago: 'bajo' | 'medio' | 'alto' | 'muy_alto'
  colores: [Color, Color]; logo: { texto: string; tipografia: string; forma: 'texto' | 'pastilla' | 'escudo' }
  espacios: EspacioSponsor[]; requisitos: CondicionClub[]
  efectosAlFirmar: Efecto[]; modificadores?: Partial<ModificadoresClub>
  clausulas: Clausula[]; rasgos: string[]
}
```

### 9.4 Modificadores

```ts
interface ModificadoresClub {
  'entrenamiento.progreso': number         // × (mercado)
  'fisico.recuperacion': number            // ×
  'lesiones.riesgo': number                // ×
  'lesiones.duracion': number              // ×
  'rendimiento.varianza': number           // × (partido)
  'moral.caida': number                    // ×
  'presion.finales': number                // ×
  'mercado.cantidad': number               // jugadores visibles
  'mercado.estrellasMax': number
  'ojeadores.regiones': number             // 1..5, mercado mapea a regiones
  'inferiores.juveniles': number           // por temporada
  'inferiores.estrellasMax': number
  'prensa.danioEscandalo': number          // ×
  'fama.ganancia': number                  // ×
  'movidas.diasExtra': number              // + días de plazo
  'estadio.riesgoIncidentes': number       // × (economía, sobreventa)
  'entradas.demanda': number               // × (economía, sede social)
  'obras.costo': number                    // × (sponsor corralón)
  'obras.cuadrillas': number
}
```

Se arman como: valor neutro (1 para multiplicadores, 0 para sumas) → se aplica cada edificio **activo** según su nivel → cada sponsor activo con `modificadores` → la pieza de accesos (`riesgoIncidentes`).

### 9.5 Acciones (para `reducir`)

```ts
type AccionClub =
  | { tipo: 'club/crear'; identidad: Identidad; ambientacion: { lugar: Lugar; entorno: IdEntorno }; estilo: IdEstilo }
  | { tipo: 'obra/encolar'; objetivo: ObjetivoObra }
  | { tipo: 'obra/cancelar'; id: IdObra }
  | { tipo: 'obra/reordenar'; id: IdObra; posicion: number }
  | { tipo: 'obra/cuadrillaTemporal'; fechas: number }
  | { tipo: 'estadio/personalizar'; cambios: Partial<EstadoEstadio['personalizacion']> }
  | { tipo: 'estadio/renombrar'; nombre: string }
  | { tipo: 'identidad/editar'; cambios: Partial<Identidad> }
  | { tipo: 'ambientacion/mudar'; lugar: Lugar; entorno: IdEntorno }
  | { tipo: 'sponsor/aceptar'; oferta: string }
  | { tipo: 'sponsor/rechazar'; oferta: string }
  | { tipo: 'sponsor/rescindir'; contrato: string }
```

**Problema de contrato:** `reducir(porcion, accion)` no puede cobrar (no emite efectos) ni leer la caja. Encolar una obra que arranca ya, contratar una cuadrilla, mudarse o firmar un sponsor **necesitan** emitir efectos de plata y relaciones en el mismo momento. Ver pedido N1. Mientras tanto, la creación se resuelve con la acción `club/crear` porque `iniciar(ctx)` no recibe parámetros (pedido N5).

---

## 10. El club en el ciclo (ganchos del núcleo)

Orden diario del núcleo: `liga → mercado → club → economia → movidas`.

| Gancho | Qué hace el club |
|--------|------------------|
| `iniciar(ctx)` | Estado por defecto: cat. 1 con las piezas de §1.9, `oficinas` y `entrenamiento` en nivel 1, lotes de `ojeadores` y `prensa` en 0, entorno `ciudad` y lugar `barrio`, identidad provisoria. La creación real llega con `club/crear`. |
| `alAvanzarDia` | Vencen ofertas (`vence ≤ hoy`) → noticia. Arranca obras de la cola si hay cuadrilla libre y la caja alcanza el anticipo (lee la caja de economía) → efecto `pesos` (anticipo, concepto `obras`) + noticia. |
| `antesDelPartido` | Nada en el MVP. |
| `despuesDelPartido` | Si es partido oficial del club: XP del partido; **avanza obras una fecha** (y descuenta `frenadaPor`); termina las que llegan a 0 (§10.1); si fue de local, descuenta clausuras; anota `semanaConPartido`. |
| `alCerrarSemana` | Si la semana no tuvo partido oficial del club: avanza obras una fecha. Genera ofertas de sponsors. Revisa desbloqueos (estilos, entornos, lotes por nivel). Descuenta cuadrillas temporales. |
| `alCerrarTemporada` | Contratos vencidos y cláusulas (`rescinde_si`, `bonus_si`) → noticias y efectos. XP por logros (lee la tabla de `liga`: ascenso, títulos). Resetea `cambiosEstaTemporada`. |

### 10.1 Al terminar una obra

1. Aplica el objetivo: coloca la pieza / sube la categoría / sube el nivel del edificio / cambia el kit.
2. Emite efecto `pesos` (segundo 50 %, concepto `obras`; monto calculado con la función de economía, pedido E4).
3. Suma XP (1 por cada 1M de `costoBase`).
4. Noticia (importancia 2; 3 si es salto o pieza de cat. ≥ 3).
5. Marca para movidas (§11.1 abajo, `club.inauguracion` en saltos y piezas grandes).
6. Libera la cuadrilla y arranca la siguiente de la cola si se puede.

---

## 11. Efectos, noticias y marcas

### 11.1 Lo que el club emite

| Situación | Efectos | Noticia (importancia) | Marca para movidas |
|-----------|---------|-----------------------|--------------------|
| Arranca una obra | `pesos` −anticipo (`obras`) | "Arrancó la obra de la popular sur" (1) | `club.obra_en_curso` = cantidad |
| Termina una obra | `pesos` −saldo (`obras`) | "Se inauguró la platea norte" (2) | `club.obra_terminada` = id de pieza o edificio |
| Termina un salto | `pesos` −saldo, `fama` + (propuesta, economía) | "¡Estadio nuevo! El club ya juega en un estadio de categoría 3" (3) | `club.inauguracion` = categoría |
| Obra esperando plata | — | "La obra X espera plata" (2) | — |
| Sube el nivel del club | — | "El club llegó al nivel 6" (2) | — |
| Oferta de sponsor | — | "Cerveza del Sur quiere la manga" (2; 3 si pecho o naming) | — |
| Firma de sponsor | `efectosAlFirmar` de la marca | "Yerba La Patrona, nuevo sponsor de la camiseta" (2) | — |
| Rescisión (vos) | `pesos` −multa, `relacion` sponsors −5 | (2) | `club.rescision` = rubro |
| Rescisión (la marca) | — | (3) | `club.rescision` = rubro |
| Mudanza | `pesos` −costo, `relacion` hinchas −10, socios −10 | "El club se muda a la montaña" (3) | `club.mudanza` = temporada |
| Cambio de nombre o colores | `pesos` −costo | (3) | `club.cambio_identidad` = temporada |
| Desbloqueo de estilo o entorno | — | (2) | — |

Las marcas se emiten con el efecto `marca` del núcleo (escriben en la porción de `movidas`, que es su dueña).

### 11.2 Lo que el club recibe

- **Efecto `obra`** (`{ edificio, fechas }`): el club interpreta `edificio` como: id de obra (`obra-0007`), una ranura (`tribuna_sur`), un tipo de edificio (`entrenamiento`), `estadio` (todas las obras de estadio en curso) o `*` (todas). `fechas > 0` atrasa (se suma a `fechasRestantes`), `fechas < 0` adelanta (sin bajar de 1). Para **frenar** una obra (que ocupe cuadrilla sin avanzar) hace falta el efecto `club` (pedido N2); con `obra` solo se puede atrasar.
- **Efecto `club`** (pedido N2): clausurar una tribuna, dañar la cancha, frenar una obra, rescindir un sponsor, ofrecer un sponsor, regalar una pieza (el intendente), sumar XP, dar una cuadrilla temporal, desbloquear un estilo o entorno.

---

## 12. Escena 3D modular

Código en `src/ui/escena3d/`, en coordinación con el coordinador (fase 5). Toma del prototipo la superelipse, el `anillo(o1, y1, o2, y2)`, las texturas de grada pintadas en canvas, el sol con sombras, la niebla, los árboles instanciados y el render a pedido.

### 12.1 Capas

```
src/modulos/club/vista.ts          ← puro: Partida → VistaClub (sin Three.js)
src/ui/escena3d/
  motor/        renderer, escena, render a pedido, calidad, liberación de recursos
  camara/       cámara del club (pan + zoom + 3/4), encuadre inicial, volarA, toma héroe
  geometria/    curva superelipse, anillo, extrusión de perfil por tramo de la curva
  materiales/   kits de estilo → materiales; texturas de grada, LED, butacas con iniciales
  estadio/      EstadioVista (reconciliador) + componentes por familia
  villa/        VillaVista + componentes por edificio y nivel + lote vacío
  entorno/      EntornoVista + componentes de capa (terreno, vegetación, horizonte, cielo, luz, clima)
  obras/        vallas, andamios, grúas, huella marcada
  etiquetas/    carteles HTML proyectados (nombre, nivel, fechas de obra, "vacante")
  seleccion/    raycast contra cajas de selección → evento { tipo: 'ranura'|'edificio'|'lote', id }
  previa/       fantasma de una pieza antes de confirmarla
```

### 12.2 `VistaClub`: lo único que la escena lee

```ts
interface VistaClub {
  estadio: {
    categoria: Categoria; huella: number; huellaReservada: number
    piezas: { ranura: Ranura; componente: string; params: Record<string, unknown>; kit: IdEstilo
              estado: 'normal' | 'en_obra' | 'clausurada'; fechasRestantes?: number }[]
    ranurasVacias: Ranura[]                 // se dibuja terreno preparado
    saltoEnCurso?: { fechasRestantes: number }
    colores: { butacas: [Color, Color]; patronButacas: string; fachada: Color; club: Identidad['colores'] }
    nombreVisible: string; carteles: { marca: string; colores: [Color, Color]; texto: string }[]
    trapos: EstadoEstadio['personalizacion']['trapos']
    ocupacion: { popular: number; platea: number; palcos: number }   // 0–1, último partido de local
  }
  villa: { edificio: TipoEdificio; nivel: number; estado: 'bloqueado' | 'lote' | 'activo' | 'en_obra'
           fechasRestantes?: number; vacantes: number; desbloqueaEn?: number }[]
  entorno: { def: DefEntorno; lugar: Lugar }
  identidad: { escudoSVG: string; colores: Identidad['colores']; nombre: string }
}
```

### 12.3 Componentes: cada pieza es un objeto reemplazable

```ts
interface CtxVisual {
  ranura: Ranura; lado?: Lado; categoria: Categoria
  kit: KitMateriales                        // materiales ya construidos del estilo + colores del club
  calidad: 'alta' | 'media' | 'baja'
  anclajes: Anclajes                        // lo que dejaron otras piezas (altura de la tribuna, borde exterior)
}
interface ComponenteVisual<P = Record<string, unknown>> {
  id: string                                // 'tribuna.perfil', 'techo.voladizo', 'luces.torres', 'edificio.oficinas'
  construir(params: P, ctx: CtxVisual): THREE.Object3D
  anclajes?(params: P, ctx: CtxVisual): Partial<Anclajes>
  liberar(obj: THREE.Object3D): void        // dispose de geometrías y texturas propias
}
```

- **Las tribunas son datos:** la mayoría usa el componente genérico `tribuna.perfil`, que extruye un **perfil transversal** (lista de puntos `[offset, altura]` + qué tramo es grada, muro, pasillo o palco) a lo largo del tramo de superelipse de su lado. Una pieza nueva de tribuna = un perfil nuevo en JSON. Ejemplos de `params`:
  - `c1_tablones`: `{ perfil: [[0,0.6],[6,3]], grada: 'tablon', filas: 8 }`
  - `c2_popular_alta`: `{ perfil: [[0,0.8],[0,2.2],[10,8],[11,8],[20,15]], grada: 'cemento', filas: 40 }`
  - `c3_platea`: `{ perfil: [[0,0.8],[0,2.2],[14,10],[15,10.5],[15,12],[30,24]], grada: 'butaca', filas: 50, vomitorios: 6 }`
- **Techos, fachadas y palcos** leen los `anclajes` de la tribuna de su lado (altura máxima, borde exterior) para apoyarse sin superponerse. Por eso el reconciliador construye en orden: cancha → tribunas → palcos → techos → fachada → luces → pantalla → accesos → servicios.
- **El kit de estilo** aporta materiales y **adornos** (componentes chicos por familia): `adorno.paravalanchas`, `adorno.trapos`, `adorno.alambrado_alto` (ascenso); `adorno.costillas`, `adorno.membrana`, `adorno.vidrio_planta_baja` (europeo). Un estilo nuevo = un kit JSON + sus adornos.
- **Hinchas:** la textura de grada pinta personas según `ocupacion` (como el prototipo con 62 %). Si el precio de la entrada es caro, se ven las tribunas vacías (economía §2b).

### 12.4 Reconciliación

`EstadioVista.actualizar(vista)` compara cada ranura con la anterior por una **clave** `componente + hash(params) + kit + hash(colores) + estado`. Solo se destruye y reconstruye lo que cambió (`liberar` + `construir`). Cambiar el color de las butacas reconstruye solo las texturas de grada; terminar una obra reemplaza una sola ranura. Lo mismo para la villa (clave: edificio + nivel + estado) y el entorno (clave: id + lugar; un cambio de entorno reconstruye solo la capa de entorno).

### 12.5 Mapa: estadio a un costado, villa del otro

`src/datos/club/mapa.json` (metros, origen en el centro de la cancha):

```
          z −
   ┌──────────────────────────────────┬──────────────────────────────────┐
   │  ENTORNO (horizonte, 350–1200 m hacia −z)                          │
   │                                                                      │
   │  ┌───── terreno del estadio ─────┐   calle   ┌──── la villa ────┐  │
   │  │  explanada (huella cat. 6     │           │ oficinas  prensa  │  │
   │  │  + plaza): x −150..150,       │           │ ojeadores parrilla│  │
   │  │  z −130..130                  │           │ ── vereda ──      │  │
   │  │       [ estadio ]             │           │ ciudad deportiva  │  │
   │  │  estacionamiento, monumento   │           │ gimnasio pensión  │  │
   │  └───────────────────────────────┘           │ x 200..460        │  │
   │                                               └───────────────────┘  │
   └──────────────────────────────────────────────────────────────────────┘
          z +  (cámara)
```

- **Lotes de la villa** con posición, tamaño y rotación fijos por edificio. Los bloqueados se ven como "terreno baldío prolijo — se desbloquea en nivel X" (césped cortado, cartel, cinta), nunca como hueco.
- La villa ocupa ~ 260 × 320 m frente a los ~ 300 × 260 m del estadio: **el estadio domina en altura** (hasta 45 m en cat. 5) y la villa compensa con **superficie** y detalle, para que tenga peso (nota de CLAUDE.md sobre la cámara).
- Edificios de la villa: volúmenes paramétricos (bloques + vidrio + franja con el color del club + techo) que crecen por nivel (más pisos, anexos, carteles, terraza). La **ciudad deportiva** crece en canchas: nivel 1 una cancha, 2 + vestuario, 3 dos canchas, 4 + tribunita, 5 + cancha techada.

### 12.6 Terreno preparado (CLU-1.2)

Entre la huella actual y la reservada se dibuja el componente `terreno.preparado`: césped cortado a franjas, caminos de ladrillo molido, bancos, árboles en hilera, banderines con los colores del club, un obrador **prolijo** (contenedor pintado con el escudo), estacas con cinta marcando la huella de la próxima categoría y un cartel "Futuro estadio · categoría N". A medida que el estadio crece, esa franja se achica; en cat. 6 es todo plaza.

### 12.7 Cámara

- Perspectiva, FOV 32°, **ángulo fijo de 3/4** (dirección del prototipo `(0,1; 0,47; 0,88)`), un punto de **mira** que se desplaza (arrastrar) y una **distancia** (rueda o pellizco) entre 250 y 1.500 m.
- **Encuadre inicial (INT-3.2):** se calcula la caja que contiene la huella reservada del estadio + todos los lotes de la villa y se ajusta la distancia para que entre completa con el aspecto de la ventana. Se recalcula al redimensionar.
- **Límites:** la mira no sale de la caja del mapa + 100 m.
- **Tocar** un edificio o una tribuna: `volarA(objetivo)` (400 ms, con suavizado) y abre el modal.
- **Modo Estructura:** toma héroe sobre el estadio (como `?hero` del prototipo) con órbita limitada (± 60°) para mirar la pieza en vista previa desde varios lados.

### 12.8 Rendimiento

- **Render a pedido:** solo se dibuja si se movió la cámara o cambió la vista. Un bucle de animación a 30 fps se prende solo si hay algo animado a la vista (banderas, grúas, nieve, pantallas) y se apaga con la pestaña oculta.
- Instancias para árboles, autos, costillas, cerchas, butacas de la villa.
- **Calidad** `alta | media | baja`: tamaño de sombra (4096 / 2048 / 1024), segmentos de la superelipse (320 / 160 / 96), densidad de vegetación (100 / 60 / 30 %).
- Meta: < 300 llamadas de dibujo y 60 fps en una notebook común con calidad alta; 30 fps en celular con calidad baja (V1).

### 12.9 Obras a la vista

- Pieza en obra: vallas alrededor del tramo, andamios, piso de tierra, cartel con las fechas restantes (etiqueta HTML) y una grúa torre si es tribuna o techo.
- Salto de categoría: varias grúas, huella nueva marcada, movimiento de suelo, camiones.
- Edificio en obra: andamio envolvente y grúa chica.

---

## 13. Datos (`src/datos/club/`)

```
categorias.json      categorías 1–6: huella, ranuras, lujo base, nivel máx. de edificios, salto, cupos
ranuras.json         familia, lado, orden de construcción visual
piezas/c1.json … c6.json   definiciones de piezas (sin precios)
estilos.json         modificadores, desbloqueo y kit de cada estilo
edificios.json       niveles, efectos, cupos de staff, visual, desbloqueo
nivel.json           curva de XP y fuentes
entornos.json        capas, parámetros, rasgos y estilos sugeridos
lugares.json         rasgos y decoración cercana por lugar
marcas.json          marcas ficticias de sponsors
ofertas.json         probabilidades por espacio, factor de fama, vencimiento, máximos
identidad.json       formas, particiones, íconos, patrones, cuellos, paletas sugeridas
mapa.json            layout del estadio, lotes de la villa, calles, límites de cámara
textos.json          plantillas de noticias del club
```

Los **precios y duraciones** de piezas, saltos, edificios, cuadrillas temporales, reestilos, mudanza y multas viven en `src/datos/economia/obras.json` (y afines) con los mismos ids.

---

## 14. Cómo se verifica

- **Cálculos:** con el estado inicial, capacidad = 2.200 (ascenso); con una cat. 3 armada a mano, los números de §1.8 coinciden con la tabla.
- **Consistencia de catálogo (test):** cada ranura habilitada en las categorías 1–3 tiene al menos 2 piezas válidas en cada estilo MVP; cada id de pieza tiene precio en `economia/obras.json` y ese precio cae en el rango de su categoría.
- **Obras:** con 1 cuadrilla, dos obras encoladas arrancan en serie; un salto bloquea las obras de estadio; el receso avanza una fecha por semana; cancelar en curso no devuelve el anticipo.
- **Determinismo:** dos temporadas sin pantalla con la misma semilla generan las mismas ofertas de sponsor.
- **Porción:** ningún gancho del club modifica otra porción si no es por efectos (test con partida congelada).
- **Vista:** `vistaClub` del estado inicial produce 4 piezas, 3 ranuras vacías y los lotes esperados; dos estados iguales dan vistas iguales.

---

## 15. Pedidos a otros módulos

> Escritos acá a pedido del coordinador; no se tocaron carpetas de otros. El coordinador los pasa a `specs/<modulo>/pedidos.md`.

### Núcleo (coordinador)

- **N1 (bloqueante) · Acciones que cobran.** `reducir(porcion, accion)` no puede emitir efectos ni leer la caja. Propuesta mínima y compatible: agregar a `Modulo` un opcional `efectosDeAccion?(ctx, accion): Salida` (y `validarAccion?(ctx, accion): { ok } | { ok: false, motivo }`) que el núcleo llama junto con `reducir`. Lo necesitan: encolar obra que arranca ya, cuadrilla temporal, mudanza, firmar y rescindir sponsors, cambio de identidad.
- **N2 (bloqueante para movidas de obras y sponsors) · Efecto `club`.** `{ tipo: 'club'; cambio: CambioClub }` con: `clausurar { ranura | 'popular_mas_grande', partidos }`, `dañarCancha { puntos }`, `frenarObra { objetivo, fechas }`, `rescindirSponsor { espacio | rubro }`, `ofrecerSponsor { marca, espacio, perfil }`, `regalarPieza { ranura, pieza }`, `xp { valor }`, `cuadrillaTemporal { fechas }`, `desbloquear { estilo | entorno }`. Lo aplica el reductor del club.
- **N3 · Efecto `obra`.** Confirmar que `edificio` admite: id de obra, ranura, tipo de edificio, `estadio` o `*` (§11.2).
- **N4 · Dueños sin asignar.** Nivel y XP del club (propongo porción `club`), Fama (¿`economia`?), relaciones (¿`movidas`?). Los necesito para requisitos y efectos.
- **N5 · Creación.** `iniciar(ctx)` no recibe la configuración del club nuevo. Resuelvo con la acción `club/crear`; si se prefiere, que `iniciar` reciba `ConfigPartida`.
- **N6 · `despuesDelPartido`.** Confirmar que se llama solo para partidos del club y que `Resultado` dice si fue oficial y si fue de local.
- **N8 · Moneda única.** El efecto `{ tipo: 'pesos' }` del núcleo quedó con nombre viejo: con una sola moneda mundial (Áureo) conviene renombrarlo (`plata` o `caja`). Mientras tanto, en este documento "efecto `pesos`" = movimiento de caja en Áureos. No es bloqueante.
- **N7 · `steering/tecnica.md`.** Su "Modelo de dominio" (club con pesos, plantel, relaciones, `Edificio.staff`, `Estadio.sectores`) quedó viejo y contradice las porciones del núcleo. Marcarlo obsoleto o remitir a los `design.md`.

### Economía

- **E1 · Tabla §4.** Confirmar que la fila "1 → 2" son las piezas **de categoría 1**. Cargar en `obras.json` los precios y fechas por id de pieza propuestos en §1.8 (o corregirlos).
- **E2 · Montos que faltan:** factor de precio por estilo (§1.5) y recargo por estilo ajeno, reestilizado, cuadrilla temporal, mudanza, cambio de nombre/colores, multa por rescindir sponsor.
- **E3 · Edificios sin precio:** `comedor` y `sede_social` (y aclarar que "Sede (el Despacho)" = `oficinas`).
- **E4 · `precioObra(objetivo)`** pura (lee `obras.json`, aplica factor de estilo, recargos y el modificador `obras.costo`), para que el club calcule anticipo y saldo, y `puedePagar(partida, monto)`.
- **E5 · Sponsors:** `pagoSponsor(espacio, perfilPago, división, fama)` al generar ofertas; cobro de cuotas leyendo `club.sponsors.contratos`; cupos de carteles por categoría (§7.1) y sus montos.
- **E6 · Capacidad inicial 2.200** contra demanda B 6.000: confirmar que no rompe los ingresos de la temporada 1. Usar la capacidad **por tipo** (popular/platea/palcos) en §2b.
- **E7 · Lujo:** incorporarlo a la fama (CLU-2.5) y, si va, a la demanda de platea y palcos. Usar `estadio.riesgoIncidentes` en el riesgo de sobreventa y `entradas.demanda` de la sede social.
- **E8 · Simulaciones:** incluir la curva de XP (§3), la penalización del salto (× 0,75) y el avance de obras en receso; las metas de categoría 4–5 dependen de eso.
- **E9 · Asistencia** por sector del último partido de local, para pintar la ocupación de las tribunas.

### Mercado

- **M1 · Staff:** roles y cupos por edificio y nivel (§2.4); nivel máximo del staff = nivel del edificio; el staff se guarda en `mercado` con `edificio: TipoEdificio`; si `edificioActivo` es falso, el staff no rinde.
- **M2 · Modificadores** que tiene que leer: `entrenamiento.progreso`, `fisico.recuperacion`, `lesiones.*`, `moral.caida`, `mercado.cantidad`, `mercado.estrellasMax`, `ojeadores.regiones` (1–5: local, nacional, Sudamérica, Europa, resto; alinear ids), `inferiores.*`.

### Movidas

- **Mv1 · Rasgos** (§5.3): leer `rasgosClub(club)` en las condiciones (entorno, lugar, estadio, villa, sponsors).
- **Mv2 · Marcas** que emite el club (§11.1): `club.obra_en_curso`, `club.obra_terminada`, `club.inauguracion`, `club.rescision`, `club.mudanza`, `club.cambio_identidad`.
- **Mv3 · Ganchos de obras y sponsors:** imprevistos sobre `obrasEnCurso` (efecto `obra` o `club/frenarObra`), el intendente en la inauguración, el corralón que regala materiales (`regalarPieza`), ofertas tentadoras (`ofrecerSponsor`), la cripto que pausa retiros (`rescindirSponsor` + efecto de plata), clausura por incidentes (`clausurar`).
- **Mv4 · Condición compartida:** usar un solo tipo `Condicion` para movidas y requisitos de sponsors; hasta que exista, uso `CondicionClub` (§9.2).
- **Mv5 · Plazo extra:** sumar `movidas.diasExtra` al vencimiento de las movidas.

### Liga

- **L1 · Luces:** `tieneLuces(club)` para horarios nocturnos (y, si el usuario lo aprueba, exigencia de luces para ser local en Primera, U6).
- **L2 · Logros:** al cerrar la temporada, poder leer si el club ascendió o salió campeón (XP).

### Partido

- **P1 · Aguante:** usar `capacidad(club).habilitada` y la relación con hinchas (PAR-7.3).
- **P2 · Escena:** `EstadioVista` se puede instanciar sola (sin villa ni etiquetas) para los highlights 3D (PAR-12) y el partido jugable.

---

## 16. Preguntas para el usuario

- **U1 · Obras en el receso.** ¿Avanzan una fecha por semana sin partido (pretemporada, receso de invierno)? Propuesta: **sí**, el receso es para hacer la tribuna.
- **U2 · Tribuna en obra cerrada.** ¿Reemplazar una tribuna la deja sin público mientras dura? Propuesta: **sí** (es la gracia del trade-off); techos, luces y pantalla no cierran nada.
- **U3 · El estadio como ayuntamiento.** ¿El nivel máximo de los edificios de la villa depende de la categoría del estadio (cat. 1 → nivel 2 … cat. 4 → nivel 5)? Propuesta: **sí**.
- **U4 · Estilo con números.** ¿El estilo cambia un poco los números (ascenso más capacidad, europeo más Lujo y más caro) o es solo estética? Propuesta: **cambia poco**, para que elegir estilo sea una decisión.
- **U5 · La luna.** ¿Cómo se desbloquea? Propuesta: ganar la copa continental **o** llegar a categoría 6.
- **U6 · Luces para Primera.** ¿La AFA exige luces para ser local en Primera? Propuesta: sí, y si no tenés, jugás de local en otro estadio (movida y recaudación menor). Es un objetivo claro para la temporada del ascenso.
- **U7 · Parrilla en el MVP.** Está en el prototipo, es barata, muy argentina y economía ya cuenta con su ingreso. Propuesta: sumarla como 5.º edificio del MVP.
- **U8 · Cambiar nombre y colores** después de crear el club: ¿se permite (con costo y bronca de los hinchas) o es para siempre?

---

## 17. Notas honestas sobre la spec

- **El contrato tiene dos agujeros** (N1 y N2): sin acciones que cobren y sin un efecto para tocar el club, la mitad de las movidas de obras y sponsors no se pueden escribir. Conviene resolverlos antes de que los agentes arranquen el código.
- **Arrancar en una "cancha de barrio" jugando la B Nacional** es raro (los equipos reales de esa categoría tienen estadios de 10–20 mil). Funciona como fantasía de crecimiento, pero los números de economía (demanda base 6.000) asumen un estadio más grande. O se acepta la sobreventa del arranque (mi propuesta) o se arranca en cat. 2 incompleta.
- **Volumen de arte:** 9 estilos × 6 categorías × 19 ranuras es inmanejable si cada pieza es un modelo. Por eso las tribunas son perfiles en JSON y los estilos son kits; aun así, hay que limitar a 2–3 piezas por ranura y categoría.
- **Europeo en cat. 1** es medio forzado ("grada tubular"): el estilo recién luce desde la cat. 2. Alternativa si molesta: la cat. 1 es universal y el estilo aparece con el primer salto.
- **12 edificios × 5 niveles** con modelos propios también es mucho: edificios paramétricos y solo 3 "héroes" con modelo propio (sede, ciudad deportiva, prensa).
