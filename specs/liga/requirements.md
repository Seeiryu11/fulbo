# Liga — Requisitos

Estado: `en revisión` · Prefijo: `LIG` · Dueño: agente `liga` · Amplía: `specs/club` CLU-12 (D4, D8) · Se apoya en: `specs/nucleo` (NUC-1, NUC-2, NUC-3, NUC-4, NUC-5, NUC-7)

## Resumen

La liga es el **mundo** alrededor de tu club: el calendario del año, las dos divisiones de 20 equipos, las copas entre semana, el repechaje, y 39 clubes rivales con nombre, cancha, presidente y personalidad que hacen cosas por su cuenta. Tu club arranca en la B Nacional. Todo lo que pasa en las otras canchas se simula con el mismo motor del partido (modo rápido), así que los resultados son coherentes con la fuerza de cada plantel. La personalidad de cada club no inventa resultados: los empuja un poco y, sobre todo, explica lo que pasa (por qué vendió al pibe, por qué echó al DT, por qué no paga sueldos).

## Mapa con CLU-12

| CLU-12 | Se amplía en |
|--------|--------------|
| 12.1 Arrancás en la B Nacional | LIG-2.1 |
| 12.2 20 + 20, ida y vuelta, tabla | LIG-2, LIG-3, LIG-4 |
| 12.2b Copas entre semana | LIG-1, LIG-6, LIG-7 |
| 12.2c Personalidad de los rivales | LIG-9, LIG-10, LIG-12 |
| 12.3 a 12.6 Ascenso, repechaje, descenso, penales | LIG-5 |
| 12.7 Primera simulada en segundo plano | LIG-2.3, LIG-11 |

## Requisitos

### LIG-1 · Calendario anual — MVP
**Historia:** Como dueño, quiero ver el año entero (liga, copas, mercado, receso), para planificar obras, compras y descanso del plantel.
1. EL SISTEMA DEBE organizar cada temporada en **52 semanas** con una plantilla de calendario cargada desde datos (`src/datos/liga/calendario.json`).
2. EL SISTEMA DEBE jugar la **liga los fines de semana** (viernes a lunes, casi todo sábado y domingo) y las **copas entre semana** (martes o miércoles).
3. EL SISTEMA DEBE incluir pretemporada (semanas 1–4), receso de invierno (25–28), **una semana libre por rueda** para reprogramar partidos, desempates y repechaje (49–50) y cierre de temporada (51–52).
4. EL SISTEMA NO DEBE programar a un mismo club dos partidos oficiales con menos de **2 días** de diferencia.
5. EL SISTEMA DEBE exponer el **próximo partido** de cualquier club (para NUC-1.2) y la lista de **hitos** del calendario (cierres de mercado, sorteos, clásicos, finales, última fecha, repechaje) para que el avance rápido sepa dónde frenar (NUC-2.5).

### LIG-2 · Divisiones y formato — MVP
1. EL SISTEMA DEBE empezar la partida con el club del usuario en la **B Nacional**, ocupando el lugar de un club chico sin clásico, que pasa al pool del Federal.
2. EL SISTEMA DEBE tener **20 equipos en la B Nacional y 20 en Primera**, todos contra todos **ida y vuelta (38 fechas)**, una temporada por año.
3. EL SISTEMA DEBE simular la división donde no está el usuario con la misma regla que la suya (CLU-12.7): fixture, resultados, tabla y noticias.
4. EL SISTEMA DEBE guardar el reglamento de cada competición en datos (puntos, criterios de desempate, cupos, días), no en el código.

### LIG-3 · Fixture — MVP
1. CUANDO arranca una temporada, EL SISTEMA DEBE generar el fixture de cada división con el método de rotación (tablas de Berger): 19 fechas de ida y las mismas 19 de vuelta con la localía invertida.
2. EL SISTEMA NO DEBE hacer jugar a un club **3 partidos seguidos** de local ni de visitante en la liga.
3. EL SISTEMA DEBE poner todos los clásicos de la división en la **fecha de clásicos** (fecha 10 y su vuelta, fecha 29).
4. EL SISTEMA DEBE jugar la **última fecha** completa el mismo día y a la misma hora.
5. EL SISTEMA DEBE generar el mismo fixture para la misma semilla (NUC-4).

### LIG-4 · Tabla y desempates — MVP
1. EL SISTEMA DEBE llevar la tabla con Pts, PJ, G, E, P, GF, GC, DG y los últimos 5 resultados; 3 puntos por victoria y 1 por empate.
2. EL SISTEMA DEBE ordenar por: puntos, diferencia de gol, goles a favor, puntos entre los empatados, diferencia de gol entre los empatados, fair play (amarilla 1, roja 3) y, por último, sorteo con semilla.
3. SI dos clubes terminan **igualados en puntos** en un puesto que define **título de Primera, ascenso directo o descenso directo**, ENTONCES EL SISTEMA DEBE jugar un **partido desempate** en cancha neutral la semana 49 (penales si empatan). Si son más de dos, juegan los dos mejores por los criterios del punto 2.
4. EL SISTEMA DEBE aplicar **quitas de puntos** (sanciones) y mostrarlas en la tabla con su motivo.
5. EL SISTEMA DEBE avisar cuando un club se asegura matemáticamente el título, el ascenso, el repechaje o el descenso.

### LIG-5 · Fin de temporada: ascenso, repechaje y descenso — MVP
1. CUANDO termina la liga, EL SISTEMA DEBE ascender directo al **1.º de la B Nacional**.
2. CUANDO termina la liga, EL SISTEMA DEBE descender directo al **último (20.º) de Primera**.
3. EL SISTEMA DEBE jugar el **repechaje** a ida y vuelta (semana 50) entre el **2.º de la B** y el **anteúltimo (19.º) de Primera**; la ida en la cancha del de la B y la vuelta en la del de Primera. El ganador juega en Primera la temporada siguiente.
4. SI el repechaje termina empatado en el global, ENTONCES EL SISTEMA DEBE definirlo por **penales**, sin gol de visitante ni alargue. Si juega el usuario, con el minijuego de penales (PAR-5).
5. CUANDO cierra la temporada, EL SISTEMA DEBE mover a los clubes de división, guardar el historial y generar el calendario y el fixture de la temporada siguiente.
6. EL SISTEMA DEBE dejar la B Nacional **sin descenso** en el MVP (ver pregunta P1 del diseño).

### LIG-6 · Copa Nacional — MVP
**Historia:** Como dueño de un club de la B, quiero cruzarme con un grande entre semana y soñar con ganarle, y si salgo campeón, jugar la copa continental aunque esté en la B.
1. EL SISTEMA DEBE jugar una copa nacional por **eliminación directa a partido único** con **64 equipos**: los 20 de Primera, los 20 de la B y 24 clubes del Federal (livianos, LIG-9.4).
2. EL SISTEMA DEBE sortear el cuadro completo antes de la primera ronda (semana 4), con cabezas de serie para que los de Primera no se crucen en la primera ronda.
3. EL SISTEMA DEBE dar la **localía al club de menor categoría** hasta cuartos (sorteo si son de la misma); semifinales y final en **cancha neutral**.
4. SI un partido termina empatado, ENTONCES EL SISTEMA DEBE definirlo por penales.
5. EL SISTEMA DEBE dar al campeón un **cupo en la copa continental** de la temporada siguiente, aunque sea de la B.

### LIG-7 · Copa continental (Copa Cóndor) — V1
1. EL SISTEMA DEBE jugar una copa continental ficticia con **32 equipos**: los mejores de Primera (cupos en LIG-7.2) y clubes extranjeros livianos (LIG-9.4).
2. EL SISTEMA DEBE dar cupo a los **4 primeros de Primera**, al **campeón de la Copa Nacional** (si ya clasificó, al 5.º de Primera) y al **campeón vigente** de la Cóndor si es del país y no clasificó por otra vía.
3. EL SISTEMA DEBE jugar **8 grupos de 4** a ida y vuelta (pasan los 2 primeros), octavos, cuartos y semifinales a ida y vuelta, y **final única** en cancha neutral.
4. EL SISTEMA NO DEBE poner dos clubes del mismo país en el mismo grupo.
5. EL SISTEMA DEBE jugar la Cóndor en semanas distintas de la Copa Nacional, para que ningún club juegue tres partidos en una semana.
6. MIENTRAS el MVP no tenga la Cóndor, EL SISTEMA DEBE igual calcular y guardar los clasificados (para noticias y para que el cupo exista desde la temporada 1).

### LIG-8 · Ventanas de pases — MVP
1. EL SISTEMA DEBE abrir la **ventana de verano** (semanas 1–4) y la **de invierno** (25–28), y exponer si hoy se puede comprar y vender.
2. EL SISTEMA DEBE marcar el **cierre de cada ventana** como hito (el avance rápido frena el día anterior).
3. V1: EL SISTEMA DEBE abrir una **ventana solo de ventas al exterior** (semanas 29–35): te pueden comprar jugadores de afuera, pero vos no podés comprar.

### LIG-9 · Clubes ficticios con identidad — MVP
1. EL SISTEMA DEBE incluir **40 clubes ficticios** (20 de la B, 20 de Primera) con nombre, nombre corto, apodo, colores, patrón de camiseta, ciudad, entorno (CLU-13), estilo y categoría de estadio (CLU-2), nombre y capacidad del estadio, tamaño (grande, mediano, chico), presidente, rasgos y clásico.
2. Los clubes DEBEN ser **creíbles y graciosos con cariño**, con sabor argentino, sin nombres, apodos ni escudos de clubes reales.
3. Los clubes DEBEN cubrir **todos los entornos** (ciudad, campo, montaña, frío, Caribe, costa, desierto) y **todos los estilos** de estadio, para mostrar variedad cuando el usuario visita.
4. EL SISTEMA DEBE tener clubes **livianos** (sin plantel completo, con un perfil de fuerza): un pool del **Federal** para la Copa Nacional y un pool de **extranjeros** para la Cóndor.
5. EL SISTEMA DEBE cargar todos los clubes desde datos editables (`src/datos/liga/`).

### LIG-10 · Personalidad de los clubes — MVP (básica), V1 (elecciones)
**Historia:** Como dueño, quiero que cada rival se comporte como lo que es, para que la liga tenga lógica y me pueda reír de los vecinos.
1. EL SISTEMA DEBE dar a cada club un **arquetipo** (vendedor de pibes, gastador, ordenado, caótico, presidente loco) y **parámetros** de 0 a 100 (ambición, paciencia, cantera, derroche, orden, volatilidad) que el arquetipo pre-carga y cada club ajusta.
2. EL SISTEMA DEBE usar la personalidad para: la **política de mercado** (cuánto gasta, qué edades busca, cuánto vende), la **paciencia con el DT**, la **salud financiera** y la **variación de la forma** del equipo.
3. EL SISTEMA NO DEBE dejar que la personalidad pese más que el plantel: el efecto de la forma sobre la fuerza tiene un tope de **±6 %**.
4. V1: CUANDO un club tiene **elecciones** (cada 3 temporadas), EL SISTEMA PUEDE cambiarle el presidente y el arquetipo, más probable cuanto peor le fue.

### LIG-11 · Simulación de los partidos ajenos — MVP
1. EL SISTEMA DEBE simular todos los partidos donde no juega el usuario con el **modo rápido del motor del partido** (PAR-1), usando el plantel real de cada club (o el perfil de fuerza si es liviano), su forma y su localía.
2. EL SISTEMA DEBE simular cada partido **el día que está programado**, para que la tabla y las noticias sigan el calendario.
3. EL SISTEMA DEBE guardar de cada partido ajeno: resultado, penales si hubo, goleadores, tarjetas y figura.
4. EL SISTEMA DEBE ser determinista: misma semilla y mismas decisiones ⇒ mismos resultados (NUC-4).

### LIG-12 · Una liga viva — MVP (rachas, sorpresas, crisis), V1 (resto)
1. EL SISTEMA DEBE llevar por club: **forma**, **racha**, **humor** (de la gente), **presión sobre el DT** y **salud financiera**.
2. CUANDO un club supera umbrales de racha (invicto, sin ganar, sin convertir), EL SISTEMA DEBE generar noticias.
3. CUANDO un club gana un partido con baja probabilidad previa, EL SISTEMA DEBE marcarlo como **batacazo**.
4. CUANDO la presión supera la paciencia de su presidente, EL SISTEMA DEBE pedir al módulo `mercado` que **eche al DT**, con su previa ("el presidente lo ratificó").
5. CUANDO la salud financiera de un club cae por debajo de un umbral, EL SISTEMA DEBE ponerlo **en crisis** (sueldos atrasados, baja de forma, ventas forzadas) y, rara vez, aplicarle una quita de puntos.
6. EL SISTEMA DEBE poner a cada club una **expectativa** al empezar la temporada (pelear el título, copas, mitad de tabla, salvarse, ascenso) y medir la presión contra esa expectativa.

### LIG-13 · Noticias — MVP
1. EL SISTEMA DEBE escribir noticias en el registro del núcleo (NUC-5) sobre resultados, rachas, batacazos, crisis, DTs en la cuerda floja, clásicos, sorteos, clasificaciones, campeones, ascensos y descensos.
2. EL SISTEMA DEBE tomar los textos de plantillas editables con variables (`{club}`, `{apodo}`, `{rival}`, `{dt}`, `{presidente}`, `{estadio}`, `{n}`), sin repetir la misma plantilla para el mismo club en una ventana configurable.
3. EL SISTEMA DEBE graduar la importancia: 3 = tu club o títulos, ascensos y descensos; 2 = tu división, tu clásico, DTs echados; 1 = el resto.
4. EL SISTEMA DEBE poner un **tope de noticias por día** para que el diario no se vuelva ruido.

### LIG-14 · Clásicos y rivalidades — MVP (clásicos fijos), V1 (rivalidades que nacen)
1. EL SISTEMA DEBE dar a cada club como mucho **un clásico principal**; algunos clásicos cruzan divisiones y solo se juegan cuando ambos coinciden.
2. EL SISTEMA DEBE asignar al club del usuario un clásico por cercanía de entorno si hay un club disponible.
3. EL SISTEMA DEBE marcar los partidos de clásico para que la economía (demanda × 1,5), el partido y las movidas los traten distinto.
4. V1: EL SISTEMA DEBE hacer crecer una **rivalidad** entre dos clubes por hechos (repechaje, eliminación en copa, goleada, pase "traidor") hasta convertirla en clásico.

### LIG-15 · Movidas que tocan la competencia — V1
1. EL SISTEMA DEBE aceptar desde las movidas: **postergar** un partido, **cambiar el día** (el famoso lunes a las 13), **cambiar la sede**, y **quitar puntos**.
2. EL SISTEMA DEBE reprogramar los partidos postergados en la próxima semana libre o miércoles sin copa para ambos clubes.

### LIG-16 · Historial y palmarés — V1
1. EL SISTEMA DEBE guardar por temporada: tablas finales, campeones de cada competición, ascensos, descensos, goleadores y DTs echados.
2. EL SISTEMA DEBE mostrar el palmarés de cada club (con historia previa ficticia cargada desde datos).

### LIG-17 · Balance y pruebas — MVP
1. EL SISTEMA DEBE poder simular una temporada completa de la liga sin interfaz dentro del presupuesto de NUC-7.2 (meta: liga ≤ 3 s de los 10 s).
2. EL SISTEMA DEBE cumplir en 200 temporadas simuladas los objetivos de paridad del diseño (§13): ningún club acapara títulos, puntos del campeón y del último en rango, empates y goles en rango.
3. EL SISTEMA DEBE verificar que cada tabla es consistente (Pts = 3·G + E − quitas, PJ = G + E + P, ΣGF = ΣGC).

### LIG-18 · Amistosos — Después
1. EL SISTEMA PUEDE jugar amistosos de pretemporada (Torneo de Verano) y una gira de invierno, sin puntos, con recaudación y riesgo de lesiones.

### LIG-19 · Consultas para la interfaz y los otros módulos — MVP
1. EL SISTEMA DEBE exponer funciones puras de consulta: tabla, fixture por fecha, partidos del día, próximo partido y próximo rival, cuadro de copa, posición y zona de un club, racha, si un partido es clásico, ventana abierta e hitos.

## Fuera de alcance
- Ligas extranjeras completas (los extranjeros solo existen en la Cóndor).
- Divisiones por debajo de la B como liga jugable (el Federal es un pool abstracto).
- Promedios para el descenso (decisión D4 del club: desciende el último).

## Decisiones tomadas
- **D1 (2026-10-07, del usuario)** 20 + 20 ida y vuelta, temporada anual, copa nacional y continental entre semana, 1.º de la B asciende, 2.º de la B contra el anteúltimo de Primera en repechaje con penales, último de Primera desciende.
- **D2 (2026-10-09, propuesta de liga)** El campeón de la Copa Nacional juega la Cóndor aunque sea de la B: es el sueño posible desde la temporada 1.

## Preguntas abiertas
Ver `design.md`, "Preguntas para el usuario". Ninguna bloquea los requisitos; la P1 (descenso en la B) cambia LIG-5.6.
