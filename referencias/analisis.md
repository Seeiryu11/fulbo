# Análisis de referencias

Fotogramas en `frames/` (generados con ffmpeg desde `videos/`).

| Archivo | Contenido | Hoja de fotogramas |
|---------|-----------|--------------------|
| `12-24-55_1.mov` (37 s) | BOLA – partido | `frames/v1_partido.jpg` |
| `12-30-32_1 1.mov` (18 s) | BOLA – recopilación de estadios ("Estadios de BOLA en Facebook") | `frames/v2.jpg` |
| `12-31-56_1 2.mov` (49 s) | BOLA – SportNews, estadio San Siro, desafíos, World Battle (selecciones) | `frames/v3.jpg` |
| `12-34-24_1.mov` (17 s) | BOLA – construcción del estadio por piezas ("Estructura") | `frames/v4.jpg` |
| `12-35-34_1 1.mov` (147 s) | Potrero – carrera, minijuegos, pretemporada | `frames/v5_potrero.jpg` |
| `12-38-57_1 1.mov` (189 s) | Potrero – tienda, staff, lujos, ofertas, finales | `frames/v6_potrero.jpg` |
| `IMG_5308.jpeg` | BOLA – estadio en la luna, HUD completo y Facebook alrededor | — |

## BOLA (Playdom, Facebook, ~2011)

**Partido**
- Cámara 3/4 en perspectiva, con jugadores sprite 3D pre-renderizados y césped a cuadros.
- Controlás a un solo jugador a la vez, marcado con su número y una flecha amarilla arriba.
- HUD: el marcador arriba a la izquierda con el nombre del rival, un reloj de partido acelerado (03:22 → 27:52 en ~35 s reales) y el minimapa abajo al centro.
- Textos grandes de evento ("Saque De Arco") y carteles de sponsor alrededor de la cancha.
- Estela de color al pasar o rematar.

**Estadio / meta**
- El estadio es la pieza central de un predio isométrico. Alrededor hay cancha de entrenamiento, estatua o trofeo en una plaza, banderas, edificios chicos y un barrio o ciudad de fondo.
- Hay temas de mapa: ciudad, luna, nieve y playa.
- Se puede elegir un estadio "famoso" premium (San Siro: capacidad 100.000, Lujo ★★★★★, valor 5.433.000).
- El estadio también se construye por piezas: un menú "Estructura" con tribunas de madera, cemento y techadas. Cada pieza tiene precio en monedas (100 → 130.000) y algunas se bloquean por nivel (11, 13, 15).
- Stats del estadio: **Capacidad, Valor, Lujo**.
- Herramientas abajo: estadio, cancha, pintura ("próximamente"), carteles y estatuas.
- HUD: escudo + nombre del club, monedas blandas, moneda premium (MelonCash), barra de XP con nivel, estrellas, trofeos por tipo y llave de configuración.
- Botón PLAY gigante, regalo y "Únete ahora".
- Menú Jugar: Partidos Sociales (con amigos), Torneos y Entrenamiento.
- "Desafía a un amigo" con pestañas Mi Liga / Amigos / World Battle. World Battle es un partido por país (México vs España) con comparación de equipos DEF/FRZ/CND/VEL/HAB/ATQ y estrellas.
- **SportNews**: diario de novedades con estadios, DTs (Mou), ítems (Capocannoniere, Francotirador) y un personaje DT viejito que te habla.
- Liga semanal con ranking, barra de amigos abajo ("Hacé click en tus amigos para visitar sus estadios"), pantalla de carga con cartel de madera.
- Facebook alrededor: barra de acciones (Jugar / Obtener MelonCash / Invitar amigos), avisos patrocinados absurdos al costado y chat abajo.

## Potrero (comunidad argentina, 2026)

**Estructura**
- Modos: "Jugá la del día" (desafío diario), Carrera libre (nacionalidad, país de liga, liga, equipo, nombre, posición: 9 delantero / 10 enganche / 1 arquero, opción "Pibe maravilla") y Modo historia (Messi, Maradona, Cristiano).
- La carrera avanza por temporadas con pretemporada → partidos clave → resumen.

**Minijuegos de partido** (cada partido importante es un minijuego corto)
- Rondo: tocás al compañero libre, 8 pases seguidos = gol, con 2 intentos.
- Memoria de señas: recordar una secuencia de números ("¡La cantaste!").
- Pizarra del DT: memotest de jugadas ensayadas.
- Tiro libre: apuntar esquivando la barrera.
- Área llena de piernas: encontrar el hueco.
- Ruleta "Finalissima": cargás fuerza y gira entre Gol / Atajó / Palo / Afuera.
- Elegir jugada (centro al área, contragolpe, pared, tiro libre, córner, pelotazo, por la banda).

**Progresión**
- Atributos: Pegada, Velocidad, Gambeta, Liderazgo, Resistencia.
- Economía: Valor, Ganado, **Gloria** y **Fama**.
- Estado en la selección: Sin chance → Uno más → Querido → Referente.
- Pretemporada con cartas que suben atributos (comunes y raras), más "mirá un anuncio y cambialas por mejores".
- Tienda de staff (cocinero, kinesiólogo, psicólogo, suplementación, analista de video, la cábala, asesor de prensa), con duración por temporadas.
- Lujo: auto, casa, mansión con cancha, yate, jet, isla, "el potrero de tu barrio" e "accionista de un club". Dan fama y estabilidad.
- Eventos con decisión y sabor: "Los botines del utilero" (¿te quedás con la corazonada o cambiás?), oferta del clásico rival ("Traición"), "Te sacaste al equipo de la cancha" y "El mundial, por TV".
- Feed de noticias por temporada ("Última hora") y títulos ganados.

**Estética**: oscura, verde neón, tipografía condensada en mayúsculas, cortes diagonales, cards. Abajo hay avisos reales de exchanges cripto, que ya son parte del chiste del fútbol actual.

## Qué nos llevamos

- De BOLA: el **predio isométrico + estadio por piezas + HUD con monedas**, el **partido 3/4 controlando un jugador**, la **capa social** (amigos, ligas, visitar estadios) y el **marco Facebook**.
- De Potrero: **partidos clave como minijuegos cortos**, **decisiones con sabor**, **staff/lujos** y **fama y gloria**.
- Diferencia nuestra: unir las dos cosas (club + historias) con la estética nostálgica de BOLA y el contenido del fútbol de hoy.
