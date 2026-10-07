# Club — Requisitos

Estado: `aprobado` · Prefijo: `CLU` · Referencias: `referencias/analisis.md` (BOLA estadio/Estructura/HUD, Potrero tienda/staff/lujos)

## Resumen

El club es la base que hacés crecer, como el ayuntamiento y la aldea de Clash of Clans. En el centro está el **estadio**, que se arma por piezas como en BOLA. Alrededor está el **predio**, con edificios que se mejoran por niveles y desbloquean **staff**. A eso se suman el **plantel**, la **identidad** (escudo, camiseta, nombre) y los **sponsors**.

## Requisitos

### CLU-1 · El club en pantalla: el estadio protagonista + la villa — MVP
**Historia:** Como dueño, quiero que el estadio sea la atracción principal de mi club, para que cada mejora se note y den ganas de seguir creciendo.
1. EL SISTEMA DEBE mostrar el club como **un solo mapa isométrico continuo** (una aldea), ordenado en dos zonas:
   - **El estadio**, a un costado y bien grande: es lo primero que se ve y la pieza protagonista.
   - **La villa**: el resto del club (oficinas / Despacho, entrenamiento, prensa, ojeadores, inferiores, parrilla…), agrupada del otro lado.
   No es una pantalla partida literal: es una forma de ordenar la aldea.
2. EL SISTEMA DEBE reservar desde el principio el **terreno completo del estadio**. Al arrancar, la cancha es chica y el terreno se ve "a medio hacer" (alambrado, tierra, marcas de obra futura), pero tiene que verse **lindo y prolijo**, no vacío ni roto: césped cuidado, árboles, caminos, bancos, banderas.
3. CUANDO toco un edificio, EL SISTEMA DEBE mostrar su nivel, sus efectos y la opción de mejorarlo.
4. EL SISTEMA DEBE mostrar un HUD fijo con escudo y nombre del club, nivel y XP, Pesos, Fama y acceso a configuración.
5. EL SISTEMA DEBE tener un botón principal de JUGAR, siempre visible.

### CLU-2 · Estadio: categorías × estilos × piezas — MVP
**Historia:** Como dueño, quiero que mi estadio sea único: que crezca de una cancha de barrio a un estadio enorme y que tenga la cara del lugar donde está mi club.
1. EL SISTEMA DEBE combinar tres capas para que haya mucha variedad:
   - **Categoría** (cuánto creció). Cambia el tamaño y la silueta:

     | Cat. | Nombre | Rasgos |
     |------|--------|--------|
     | 1 | Cancha de barrio | Alambrado, tablones, vestuario de chapa, sin luces |
     | 2 | Estadio de ascenso | Tribunas de cemento, primera platea, torres de luz |
     | 3 | Estadio de Primera | Plateas en los cuatro lados, techos parciales, palcos, pantalla |
     | 4 | Estadio grande | Anillo cerrado, LED perimetral, VAR, hospitality |
     | 5 | Estadio de élite | Techo completo, fachada iluminada, museo, tienda, tour |
     | 6 | Estadio del futuro | Techo y césped retráctiles, fachada de pantallas, hologramas, drones |

   - **Estilo** (cómo se ve y dónde está). Define materiales, techos, fachadas, colores y entorno. Lista inicial:

     | Estilo | Inspiración |
     |--------|-------------|
     | Ascenso rioplatense | Cemento a la vista, paravalanchas, trapos, alambrado alto |
     | Primera argentina | Bombonera/Monumental-like: tribunas empinadas, plateas, popular colorida |
     | Europeo moderno | Techo continuo, butacas de color, fachada de vidrio y membrana |
     | Inglés clásico | Ladrillo, tribunas pegadas a la cancha, techos a dos aguas |
     | Andino de altura | Montaña de fondo, gradas sobre la ladera, cielo muy azul |
     | Invierno extremo | Nieve, cúpula o techo pesado, calefacción, luces cálidas (tipo Rusia) |
     | Tropical / costero | Palmeras, techos livianos, mar de fondo |
     | Desierto / petrodólar | Estadio-joya, climatizado, fachada dorada |
     | Futurista | Formas orgánicas, pantallas, luces de neón |

   - **Piezas** por sector (4 tribunas, cancha, techo, iluminación, pantalla, palcos, fachada, accesos), con precio, nivel requerido y duración de obra.
2. EL SISTEMA DEBE permitir elegir el estilo al crear el club (sugerido por la ambientación, DES-8) y **cambiarlo o mezclarlo** más adelante (ej. una tribuna inglesa en un estadio rioplatense) con un costo.
3. EL SISTEMA DEBE exigir, para subir de categoría, un mínimo de piezas de la categoría actual y un nivel de club, como subir el ayuntamiento en Clash of Clans. El salto de categoría es la obra más grande y larga del juego.
4. EL SISTEMA DEBE calcular **Capacidad**, **Valor** y **Lujo** a partir de las piezas.
5. EL SISTEMA DEBE usar la Capacidad para la recaudación y el Aguante, y el Lujo para la fama, los sponsors y los eventos especiales (recitales, finales neutrales, partidos de selección).
6. EL SISTEMA DEBE reflejar visualmente cada pieza, categoría y estilo.
7. EL SISTEMA DEBE permitir personalizar: nombre (o naming rights), colores de butacas y fachada, trapos y banderas.

**Producción de arte (decisión técnica):** cada estilo es un **kit** (paleta + materiales + set de techos/fachadas + entorno) aplicado sobre la misma geometría de piezas, para que sumar estilos no multiplique el trabajo.

MVP: categorías 1 a 3 en 2 estilos (Ascenso rioplatense y uno más), con el resto mostrado como objetivo bloqueado. V1: categorías 4 a 6 y más estilos.
### CLU-3 · Obras por fechas — MVP
1. CUANDO inicio una mejora, EL SISTEMA DEBE asignarle una duración en **fechas jugadas** y mostrar las fechas restantes sobre el edificio.
2. EL SISTEMA DEBE avanzar las obras solo cuando se juega o se simula una fecha.
3. EL SISTEMA DEBE limitar las obras simultáneas a la cantidad de **cuadrillas** disponibles (empieza con 1).
4. MIENTRAS un edificio está en obra, EL SISTEMA DEBE dejarlo inactivo.

### CLU-4 · Edificios del predio — MVP (3 edificios), V1 (resto)
EL SISTEMA DEBE incluir edificios mejorables, cada uno con niveles y un efecto claro. Lista inicial:

| Edificio | Efecto | Staff que habilita |
|----------|--------|--------------------|
| **Oficinas (el Despacho)** | llegan las movidas; + opciones en movidas de AFA, política y economía | Abogado, contador, secretario |
| Cancha de entrenamiento | + mejora de atributos por semana | Preparador físico, ayudantes |
| Gimnasio / recuperación | + recuperación física, − lesiones | Kinesiólogo |
| Departamento médico | − tiempo de lesión | Médico |
| Comedor | + rendimiento estable | Nutricionista, cocinero |
| Oficina de ojeadores | + calidad y cantidad de jugadores en el mercado | Ojeadores (por región) |
| Pensión / inferiores | genera juveniles cada temporada | Coordinador de inferiores |
| Oficina de prensa y redes | − impacto negativo de escándalos del Despacho, + fama | Community manager, asesor de prensa |
| Consultorio | + moral, − efectos de presión | Psicólogo |
| Buffet / parrilla | + ingresos por partido de local | — |
| Tienda oficial | + ingresos por camisetas (escala con fama) | — |
| Sede social | + hinchas, desbloquea eventos de barrio | — |

MVP: Oficinas (Despacho), Cancha de entrenamiento, Oficina de ojeadores, Oficina de prensa.

### CLU-5 · Staff — V1
1. EL SISTEMA DEBE permitir contratar staff con nombre, especialidad, nivel y sueldo.
2. EL SISTEMA DEBE limitar el nivel del staff al nivel de su edificio.
3. EL SISTEMA DEBE aplicar los efectos del staff a la simulación, a los entrenamientos y a los movidas del Despacho.

### CLU-6 · Plantel — MVP
1. EL SISTEMA DEBE mantener un plantel de 18 a 25 jugadores con nombre, apodo, posición, edad, atributos, estado físico, moral y **personalidad** (rasgos que disparan movidas del Despacho: fiestero, cabulero, influencer, calentón, profesional).
2. Atributos iniciales: **Pegada, Velocidad, Gambeta, Pase, Marca, Físico, Liderazgo** (más **Atajada** para arqueros).
3. EL SISTEMA DEBE calcular una valoración general (estrellas, como BOLA).
4. EL SISTEMA DEBE generar nombres y apodos argentinos ficticios creíbles.

### CLU-6b · Vos sos el dueño — MVP
**Historia:** Como dueño, quiero manejar todo el club, incluida la parte deportiva, para que cada resultado sea mío.
1. EL SISTEMA DEBE darte todas las decisiones del club: obras, plantel, mercado, staff, sponsors y Despacho.
2. EL SISTEMA DEBE darte las funciones de DT: formación, titulares, estilo de juego, charla técnica y cábala.
3. EL SISTEMA NO DEBE incluir por ahora un jugador propio controlado por vos (ver `specs/carrera-jugador`, postergada).

### CLU-6c · Directores técnicos contratables — MVP
**Historia:** Como dueño, quiero elegir y comprar DTs que potencien al equipo, sin dejar de tomar yo las decisiones tácticas.
1. EL SISTEMA DEBE ofrecer DTs ficticios con nombre, estilo (ej. "el Loco", "el Profe", "el Vasco de la pizarra", "el motivador"), nivel, precio y duración de contrato en fechas o temporadas.
2. CUANDO contrato un DT, EL SISTEMA DEBE aplicar sus bonus: atributos del plantel, moral, efecto de un estilo de juego o mejora de un minijuego (ej. + tiempo en la pizarra).
3. EL SISTEMA DEBE permitir un solo DT activo a la vez; cambiarlo rescinde el contrato anterior (con costo).
4. EL SISTEMA DEBE mostrar los DTs nuevos en el diario de novedades (estilo SportNews de BOLA).
5. EL SISTEMA PUEDE disparar movidas del Despacho relacionados con el DT (el DT pide refuerzos o renuncia en público, choque de egos con un referente, el DT se pelea con la barra).

### CLU-7 · Mercado y ojeadores — V1
1. EL SISTEMA DEBE ofrecer jugadores en el mercado según el nivel de la oficina de ojeadores.
2. CUANDO envío un ojeador a una región, EL SISTEMA DEBE devolver informes después de un tiempo, con atributos parcialmente revelados.
3. EL SISTEMA DEBE permitir comprar, vender y prestar jugadores.

### CLU-8 · Identidad: escudo y camiseta — MVP
1. EL SISTEMA DEBE dejarme elegir el nombre del club, los colores y el escudo (forma + ícono + iniciales).
2. EL SISTEMA DEBE tener un editor de camiseta con patrón (lisa, bastones, franja, banda, aros, cuartos), colores, cuello y número.
3. EL SISTEMA DEBE mostrar la camiseta y los sponsors en el partido, en el estadio y en las publicaciones del club.
4. EL SISTEMA DEBE dejarme elegir la **ambientación** del club (DES-8) y el **estilo** del estadio (CLU-2); el paisaje sale de ahí. Ambientaciones absurdas como la luna se desbloquean.

### CLU-13 · Entorno de fondo cambiable — MVP
**Historia:** Como dueño, quiero elegir dónde está mi club y poder cambiarlo, para que mi estadio se vea único.
1. EL SISTEMA DEBE ofrecer **entornos** completos para el fondo y los alrededores del club, cada uno con terreno, vegetación, clima, luz y horizonte propios:

   | Entorno | Cómo se ve |
   |---------|------------|
   | Ciudad | Avenidas, edificios altos y skyline de fondo |
   | Campo | Llanura, alambrados, silos, molinos, árboles en hilera |
   | Montaña | Cordillera de fondo, pinos, terreno con desniveles |
   | Frío | Nieve, cielo gris, pinos nevados, luces cálidas |
   | Caribe | Mar turquesa, playa, palmeras, sol fuerte |
   | Costa | Puerto, rambla, médanos |
   | Desierto | Arena, rocas, cielo despejado |
   | Luna (desbloqueable) | Guiño a BOLA |

2. EL SISTEMA DEBE dejar **cambiar el entorno** en cualquier momento desde la identidad del club (con costo, como una mudanza), sin perder nada de lo construido.
3. EL SISTEMA DEBE combinar el entorno con el estilo del estadio (CLU-2): cualquier estilo funciona en cualquier entorno.
4. EL SISTEMA DEBE usar el entorno para las movidas locales del Despacho (DES-8).
5. EL SISTEMA DEBE construir cada entorno con el mismo sistema de piezas (terreno, vegetación, horizonte, cielo, luz), para que agregar uno nuevo no implique rehacer el juego.

MVP: Ciudad, Campo y Montaña. V1: el resto.

### CLU-9 · Sponsors — MVP
1. EL SISTEMA DEBE tener espacios de sponsor: pecho, espalda, manga, short, carteles del estadio y naming rights del estadio.
2. CUANDO un sponsor me ofrece contrato, EL SISTEMA DEBE mostrar plata por temporada, requisitos (fama, Lujo, resultados) y **efectos secundarios** (ej. casa de apuestas: mucha plata, movidas del Despacho de amaño y críticas; yerba del barrio: poca plata, + hinchas).
3. EL SISTEMA DEBE usar marcas ficticias por rubro: cerveza, casa de apuestas, exchange cripto, billetera virtual, yerba, telefonía, prepaga, corralón.

### CLU-10 · Economía — MVP
1. EL SISTEMA DEBE manejar **Pesos** (moneda blanda: partidos, sponsors, recaudación) y **Fama** (seguidores: desbloqueos y ofertas).
2. EL SISTEMA DEBE pagar sueldos y mantenimiento por temporada.
3. EL SISTEMA DEBE aplicar **inflación** a los precios cada temporada, con ingresos que acompañan para que no sea castigo puro. *Chiste + mecánica.*
4. EL SISTEMA DEBE dar "algo para hacer al volver" (obras terminadas, informes de ojeadores, movidas del Despacho pendientes).

### CLU-12 · Competencia: arrancás en la B Nacional — MVP
**Historia:** Como dueño, quiero arrancar desde abajo y pelear el ascenso, para que llegar a Primera se sienta ganado.
1. EL SISTEMA DEBE empezar la partida con el club en la **B Nacional** (liga ficticia de segunda división, equipos ficticios).
2. EL SISTEMA DEBE tener **20 equipos en la B Nacional y 20 en Primera División**, todos contra todos **ida y vuelta (38 fechas)**, una temporada por año calendario, como la Premier League pero con el fútbol argentino. Tabla con puntos, PJ, G, E, P, GF, GC y DG.
2b. EL SISTEMA DEBE sumar **copas entre semana** (martes/miércoles): una **copa nacional** por eliminación directa (tipo Copa Argentina) con equipos de las dos divisiones, y una **copa continental** ficticia (tipo Libertadores) para los mejores de Primera.
2c. EL SISTEMA DEBE dar a cada club rival una **personalidad** (vendedor de pibes, gastador, ordenado, caótico, de presidente loco) que guíe sus fichajes, su rendimiento y sus noticias, para que la liga se sienta viva y coherente.
3. CUANDO termina la temporada, EL SISTEMA DEBE ascender directo al **1.º** de la B Nacional.
4. CUANDO termina la temporada, EL SISTEMA DEBE hacer jugar al **2.º** de la B un **repechaje** a ida y vuelta contra el **anteúltimo de Primera**; el ganador juega la temporada siguiente en Primera.
5. CUANDO termina la temporada, EL SISTEMA DEBE descender directo al **último** de Primera.
6. SI el repechaje termina empatado en el global, ENTONCES EL SISTEMA DEBE definirlo por penales (minijuego de penales).
7. EL SISTEMA DEBE mantener también la **Primera** simulada en segundo plano (tabla y resultados), aunque no estés ahí.

### CLU-11 · Social — Después
1. EL SISTEMA PUEDE dejarme visitar estadios de amigos, desafiarlos y competir en una liga semanal con ranking.

## Decisiones tomadas
- **D1 (2026-10-07, corregida)** Sos **el dueño del club**: hacés todo lo del DT y además podés contratar DTs que suben estadísticas → CLU-6b, CLU-6c. El jugador propio queda postergado en `specs/carrera-jugador`.
- **D2 (2026-10-07)** Las obras duran fechas jugadas, no tiempo real → CLU-3.
- **D3 (2026-10-07)** Solo **Pesos y Fama**, sin moneda premium. La monetización se agrega cuando el juego esté aceitado → CLU-10.
- **D5 (2026-10-07)** El estadio es la atracción principal de la aldea, a un costado y bien grande; el resto del club ("la villa") se agrupa del otro lado. No es pantalla partida literal → CLU-1.
- **D7 (2026-10-07)** El fondo del club es un **entorno cambiable** (ciudad, campo, montaña, frío, Caribe, costa, desierto…) → CLU-13.
- **D6 (2026-10-07)** Mucha variedad de estadios: categorías × estilos (ascenso, Primera, europeo, andino, invierno extremo, tropical…) × piezas. La ambientación no está atada a Argentina como país → CLU-2, DES-8.
- **D8 (2026-10-07)** 20 equipos por división, ida y vuelta (38 fechas), una temporada por año; copa entre semana; clubes rivales con personalidad → CLU-12. Lo desarrolla el agente `liga`.
- **D4 (2026-10-07)** Se arranca en la **B Nacional**: el 1.º asciende directo y el 2.º juega repechaje contra un equipo de Primera → CLU-12.

## Preguntas abiertas
Ninguna bloqueante.
