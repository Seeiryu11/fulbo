# Club — Requisitos

Estado: `aprobado` · Prefijo: `CLU` · Referencias: `referencias/analisis.md` (BOLA estadio/Estructura/HUD, Potrero tienda/staff/lujos)

## Resumen

El club es la base que hacés crecer, como el ayuntamiento y la aldea de Clash of Clans. En el centro está el **estadio**, que se arma por piezas como en BOLA. Alrededor está el **predio**, con edificios que se mejoran por niveles y desbloquean **staff**. A eso se suman el **plantel**, la **identidad** (escudo, camiseta, nombre) y los **sponsors**.

## Requisitos

### CLU-1 · El club en pantalla: estadio + villa — MVP
**Historia:** Como dueño, quiero que el estadio sea la atracción principal de mi club, para que cada mejora se note y den ganas de seguir creciendo.
1. EL SISTEMA DEBE mostrar el club como un solo mapa isométrico continuo con dos zonas:
   - **El estadio**: ocupa aproximadamente la **mitad de la pantalla** y es la pieza protagonista.
   - **La villa**: la otra mitad, con el resto de los edificios del club (entrenamiento, prensa, ojeadores, inferiores, sede, parrilla…).
2. EL SISTEMA DEBE reservar desde el principio el **terreno completo del estadio**, aunque al comienzo sea una cancha de barrio, para que se vea el espacio a llenar.
3. CUANDO toco un edificio, EL SISTEMA DEBE mostrar su nivel, sus efectos y la opción de mejorarlo.
4. EL SISTEMA DEBE mostrar un HUD fijo con escudo y nombre del club, nivel y XP, Pesos, Fama y acceso a configuración.
5. EL SISTEMA DEBE tener un botón principal de JUGAR, siempre visible.

### CLU-2 · Estadio por categorías y piezas — MVP
**Historia:** Como dueño, quiero llevar mi cancha de tablones hasta un estadio europeo y después a uno del futuro, mejorándolo parte por parte.
1. EL SISTEMA DEBE organizar el estadio en **categorías**; cada una cambia la silueta completa:

   | Cat. | Nombre | Cómo se ve |
   |------|--------|------------|
   | 1 | Cancha de barrio | Alambrado, tablones, vestuario de chapa, sin luces |
   | 2 | Estadio de ascenso | Tribunas de cemento, primera platea, torres de luz |
   | 3 | Estadio de Primera | Plateas en los cuatro lados, techos parciales, palcos, pantalla |
   | 4 | Estadio moderno | Anillo cerrado, LED perimetral, VAR, hospitality, estacionamiento |
   | 5 | Estadio europeo | Techo completo, fachada iluminada con los colores del club, museo, tienda, tour |
   | 6 | Estadio del futuro | Techo retráctil, césped retráctil, fachada de pantallas, hologramas, drones, acceso biométrico |

2. EL SISTEMA DEBE dividir el estadio en **sectores** (4 tribunas, cancha, techo, iluminación, pantalla, palcos, fachada, accesos) y, dentro de cada categoría, ofrecer **piezas** por sector con precio, nivel requerido y duración de obra.
3. EL SISTEMA DEBE exigir, para subir de categoría, un mínimo de piezas de la categoría actual y un nivel de club, como subir el ayuntamiento en Clash of Clans. El salto de categoría es la obra más grande y larga del juego.
4. EL SISTEMA DEBE calcular **Capacidad**, **Valor** y **Lujo** del estadio a partir de sus piezas.
5. EL SISTEMA DEBE usar la Capacidad para la recaudación y el Aguante, y el Lujo para la fama, los sponsors y los eventos especiales (recitales, finales neutrales, partidos de selección).
6. EL SISTEMA DEBE reflejar visualmente cada pieza construida y cada categoría.
7. EL SISTEMA DEBE permitir personalizar el estadio: nombre (o naming rights), colores de butacas y fachada, y trapos o banderas.

MVP: categorías 1 a 3 jugables, con el 4 al 6 mostrados como objetivo bloqueado. V1: 4 a 6.

### CLU-3 · Obras por fechas — MVP
1. CUANDO inicio una mejora, EL SISTEMA DEBE asignarle una duración en **fechas jugadas** y mostrar las fechas restantes sobre el edificio.
2. EL SISTEMA DEBE avanzar las obras solo cuando se juega o se simula una fecha.
3. EL SISTEMA DEBE limitar las obras simultáneas a la cantidad de **cuadrillas** disponibles (empieza con 1).
4. MIENTRAS un edificio está en obra, EL SISTEMA DEBE dejarlo inactivo.

### CLU-4 · Edificios del predio — MVP (3 edificios), V1 (resto)
EL SISTEMA DEBE incluir edificios mejorables, cada uno con niveles y un efecto claro. Lista inicial:

| Edificio | Efecto | Staff que habilita |
|----------|--------|--------------------|
| Cancha de entrenamiento | + mejora de atributos por semana | Preparador físico, ayudantes |
| Gimnasio / recuperación | + recuperación física, − lesiones | Kinesiólogo |
| Departamento médico | − tiempo de lesión | Médico |
| Comedor | + rendimiento estable | Nutricionista, cocinero |
| Oficina de ojeadores | + calidad y cantidad de jugadores en el mercado | Ojeadores (por región) |
| Pensión / inferiores | genera juveniles cada temporada | Coordinador de inferiores |
| Oficina de prensa y redes | − impacto negativo de escándalos del Muro, + fama | Community manager, asesor de prensa |
| Consultorio | + moral, − efectos de presión | Psicólogo |
| Buffet / parrilla | + ingresos por partido de local | — |
| Tienda oficial | + ingresos por camisetas (escala con fama) | — |
| Sede social | + hinchas, desbloquea eventos de barrio | — |

MVP: Cancha de entrenamiento, Oficina de ojeadores, Oficina de prensa.

### CLU-5 · Staff — V1
1. EL SISTEMA DEBE permitir contratar staff con nombre, especialidad, nivel y sueldo.
2. EL SISTEMA DEBE limitar el nivel del staff al nivel de su edificio.
3. EL SISTEMA DEBE aplicar los efectos del staff a la simulación, a los entrenamientos y a los eventos del Muro.

### CLU-6 · Plantel — MVP
1. EL SISTEMA DEBE mantener un plantel de 18 a 25 jugadores con nombre, apodo, posición, edad, atributos, estado físico, moral y **personalidad** (rasgos que disparan eventos del Muro: fiestero, cabulero, influencer, calentón, profesional).
2. Atributos iniciales: **Pegada, Velocidad, Gambeta, Pase, Marca, Físico, Liderazgo** (más **Atajada** para arqueros).
3. EL SISTEMA DEBE calcular una valoración general (estrellas, como BOLA).
4. EL SISTEMA DEBE generar nombres y apodos argentinos ficticios creíbles.

### CLU-6b · Vos sos el dueño — MVP
**Historia:** Como dueño, quiero manejar todo el club, incluida la parte deportiva, para que cada resultado sea mío.
1. EL SISTEMA DEBE darte todas las decisiones del club: obras, plantel, mercado, staff, sponsors y Muro.
2. EL SISTEMA DEBE darte las funciones de DT: formación, titulares, estilo de juego, charla técnica y cábala.
3. EL SISTEMA NO DEBE incluir por ahora un jugador propio controlado por vos (ver `specs/carrera-jugador`, postergada).

### CLU-6c · Directores técnicos contratables — MVP
**Historia:** Como dueño, quiero elegir y comprar DTs que potencien al equipo, sin dejar de tomar yo las decisiones tácticas.
1. EL SISTEMA DEBE ofrecer DTs ficticios con nombre, estilo (ej. "el Loco", "el Profe", "el Vasco de la pizarra", "el motivador"), nivel, precio y duración de contrato en fechas o temporadas.
2. CUANDO contrato un DT, EL SISTEMA DEBE aplicar sus bonus: atributos del plantel, moral, efecto de un estilo de juego o mejora de un minijuego (ej. + tiempo en la pizarra).
3. EL SISTEMA DEBE permitir un solo DT activo a la vez; cambiarlo rescinde el contrato anterior (con costo).
4. EL SISTEMA DEBE mostrar los DTs nuevos en el diario de novedades (estilo SportNews de BOLA).
5. EL SISTEMA PUEDE disparar eventos del Muro relacionados con el DT (el DT pide refuerzos o renuncia en público, choque de egos con un referente, el DT se pelea con la barra).

### CLU-7 · Mercado y ojeadores — V1
1. EL SISTEMA DEBE ofrecer jugadores en el mercado según el nivel de la oficina de ojeadores.
2. CUANDO envío un ojeador a una región, EL SISTEMA DEBE devolver informes después de un tiempo, con atributos parcialmente revelados.
3. EL SISTEMA DEBE permitir comprar, vender y prestar jugadores.

### CLU-8 · Identidad: escudo y camiseta — MVP
1. EL SISTEMA DEBE dejarme elegir el nombre del club, los colores y el escudo (forma + ícono + iniciales).
2. EL SISTEMA DEBE tener un editor de camiseta con patrón (lisa, bastones, franja, banda, aros, cuartos), colores, cuello y número.
3. EL SISTEMA DEBE mostrar la camiseta y los sponsors en el partido, en el estadio y en las publicaciones del club.
4. EL SISTEMA DEBE dejarme elegir la **ciudad** del club (ver MUR-8); el paisaje de fondo sale de ahí (conurbano, ciudad, costa, montaña, pueblo). Temas absurdos como la luna se desbloquean.

### CLU-9 · Sponsors — MVP
1. EL SISTEMA DEBE tener espacios de sponsor: pecho, espalda, manga, short, carteles del estadio y naming rights del estadio.
2. CUANDO un sponsor me ofrece contrato, EL SISTEMA DEBE mostrar plata por temporada, requisitos (fama, Lujo, resultados) y **efectos secundarios** (ej. casa de apuestas: mucha plata, eventos del Muro de amaño y críticas; yerba del barrio: poca plata, + hinchas).
3. EL SISTEMA DEBE usar marcas ficticias por rubro: cerveza, casa de apuestas, exchange cripto, billetera virtual, yerba, telefonía, prepaga, corralón.

### CLU-10 · Economía — MVP
1. EL SISTEMA DEBE manejar **Pesos** (moneda blanda: partidos, sponsors, recaudación) y **Fama** (seguidores: desbloqueos y ofertas).
2. EL SISTEMA DEBE pagar sueldos y mantenimiento por temporada.
3. EL SISTEMA DEBE aplicar **inflación** a los precios cada temporada, con ingresos que acompañan para que no sea castigo puro. *Chiste + mecánica.*
4. EL SISTEMA DEBE dar "algo para hacer al volver" (obras terminadas, informes de ojeadores, eventos del Muro pendientes).

### CLU-12 · Competencia: arrancás en la B Nacional — MVP
**Historia:** Como dueño, quiero arrancar desde abajo y pelear el ascenso, para que llegar a Primera se sienta ganado.
1. EL SISTEMA DEBE empezar la partida con el club en la **B Nacional** (liga ficticia de segunda división, equipos ficticios).
2. EL SISTEMA DEBE organizar cada temporada en fechas de todos contra todos, con tabla de posiciones (puntos, PJ, G, E, P, GF, GC, DG).
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
- **D5 (2026-10-07)** El estadio es la atracción principal: ocupa ~la mitad de la pantalla y crece por categorías hasta un estadio europeo y uno del futuro; el resto del club ("la villa") ocupa la otra mitad → CLU-1, CLU-2.
- **D4 (2026-10-07)** Se arranca en la **B Nacional**: el 1.º asciende directo y el 2.º juega repechaje contra un equipo de Primera → CLU-12.

## Preguntas abiertas
Ninguna bloqueante.
