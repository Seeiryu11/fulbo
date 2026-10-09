# FULBO — contexto para Claude

Juego de fútbol para navegador inspirado en BOLA Social Soccer (Facebook, 2011) y Potrero (comunidad argentina de Twitter). Leé primero [README.md](README.md) y `steering/`.

## Cómo trabajamos
- **El juego final no usa IA ni gasta tokens**: es código que corre en el navegador. Los tokens se gastan solo construyéndolo.
- **No ser complaciente**: si una idea del usuario está mal, es floja o va a quedar fea, decírselo claro con el motivo y una alternativa antes de hacerla.
- **Spec driven development** (ver `steering/proceso.md`): requisitos → diseño → tareas → código. No se programa sin `requirements.md` y `design.md` aprobados. Si algo cambia, se actualiza la spec primero.
- Se habla en español rioplatense.
- Se va de a poco: el usuario prefiere proyectar y decidir antes de construir.

## Decisiones del usuario (no re-discutir)
- Sos **el dueño del club**: hacés lo del DT y contratás DTs que suben estadísticas. El jugador propio (primera persona, estilo Potrero) está **postergado** en `specs/carrera-jugador`.
- **No se imita Facebook** ni ninguna red. Que BOLA fuera de Facebook es solo contexto. La nostalgia es el **estilo visual de BOLA**.
- **Sin "Eras"**: el contenido es el fútbol de hoy (cerveza, apuestas, cripto, TikTok, streamers).
- Navegador primero (celular después). Look profesional, no de juguete: escala real, mucho espacio, ciudad de fondo, sin casitas genéricas (ver `referencias/estadios-bola/`).
- Economía: **una sola moneda mundial** para todo (nombre provisional "Áureo", AU; el usuario elige el definitivo) + **Fama**. Sin moneda premium, **sin inflación ni tipo de cambio** (se sacaron por complicar). Precio de entradas por sector manejable por el usuario.
- Obras por **fechas jugadas**, no tiempo real.
- Se arranca en la **B Nacional**: el 1.º asciende directo, el 2.º juega repechaje contra el anteúltimo de Primera.
- Orden (cambiado 2026-10-07): **base → agentes construyen cada módulo → interfaz y 3D con datos reales → partido jugable al final** (ver `steering/roadmap.md`).
- **El estadio es la atracción principal** de la aldea, a un costado y grande (no es pantalla partida literal); la villa (oficinas, entrenamiento, prensa…) se agrupa del otro lado. Al principio la cancha es chica pero el terreno está preparado y se ve lindo.
- **Variedad de estadios**: categoría (barrio → del futuro) × estilo (ascenso, Primera, europeo, inglés, andino, invierno extremo, tropical, desierto, futurista) × piezas. La ambientación NO está atada a Argentina como país.
- **El Despacho** (antes "Muro") son las oficinas del club: ahí llegan las movidas.
- **"Movidas"** es el nombre oficial de las decisiones estilo Potrero (quilombos y oportunidades). Usarlo siempre.
- **Movidas estilo Potrero para TODO el club**, no solo jugadores: sponsors, política institucional, AFA, la ciudad del club, economía, obras, prensa (`specs/despacho`, DES-0).
- Stack: **Three.js** para el 3D (decidido). TypeScript + Vite + Preact para la UI es opción recomendada, no cerrada.

## Estado (2026-10-07)
- Requisitos aprobados: interfaz, club, despacho, partido.
- **Arte: 3D con Three.js (decidido)**. Look profesional como `referencias/estadios-bola/`. Prototipo del estadio europeo: `referencias/mockups/predio-europeo.html` (vista del club) y `?hero` (toma cercana). Las secciones SVG de `specs/interfaz/design.md` están obsoletas y hay que reescribirlas.
- **Entorno de fondo cambiable** (ciudad, campo, montaña, frío, Caribe, costa, desierto) → CLU-13.
- Ojo con la cámara: el usuario quiere el estadio protagonista pero sin que tape todo; la villa tiene que tener peso.
- **Base armada (2026-10-07):** `specs/nucleo` (tiempo en semanas y días, ciclo entre partidos, estado por porciones, contrato de módulos, efectos), `specs/economia` (principios, sin pay-to-win), liga de 20 equipos ida y vuelta + copas entre semana (nacional y continental tipo Libertadores), highlights 2D y 3D (PAR-12).
- **Agentes del proyecto** en `.claude/agents/`: club, mercado, liga, partido, movidas, economia. Reglas comunes en `steering/agentes.md`. El coordinador (sesión principal) los lanza, revisa y commitea.
- **Estado 2026-10-09:** núcleo programado (src/nucleo, 34 tests). Los 5 agentes entregaron `design.md` + `tasks.md` (club, liga, mercado, partido, despacho), en revisión del usuario; cada uno tiene "Preguntas para el usuario" y "Pedidos a otros módulos".
- **Próximo paso:** el usuario YA contestó las preguntas (ver "Respuestas del usuario" abajo). Falta: volcar esas respuestas en los `design.md` de cada módulo, reconciliar los "Pedidos a otros módulos", ajustar la cancha inicial, aprobar los diseños y lanzar los agentes a programar sus módulos sobre el núcleo (fase 4), reemplazando de a poco los módulos de `src/demo/`.

## Herramientas
- `referencias/_tools/serve.ps1`: servidor estático local (configurado en `.claude/launch.json` como `bola-static`, puerto 8765).
- Los videos de referencia son HEVC: para sacar fotogramas hace falta ffmpeg (`winget install Gyan.FFmpeg`). Ya están extraídos en `referencias/frames/` y analizados en `referencias/analisis.md`.
- Mockup a PNG: Edge headless con `--screenshot` sobre la página servida por `serve.ps1`.
- Repo: https://github.com/Seeiryu11/fulbo (público). Guía para otra compu: `GUIA-OTRA-COMPU.md`. Al terminar una sesión, siempre commit + push. Los videos `.mov` no se suben (pasan los 100 MB).

## Respuestas del usuario a los diseños (2026-10-09)
1. Moneda: nombre provisional "Áureo" OK (sigue abierto si quiere otro). 2. Federación ficticia **FAF** (Federación Argentina de Fútbol) en vez de AFA.
3. **Ascensos y descensos de a 2** en cada división de 20: en Primera desciende el último directo y el anteúltimo juega repechaje contra el 2.º de la B; de la B asciende el 1.º directo y el 2.º vía repechaje; de la B descienden 2 a un Federal simulado.
4. **Club propio** (reemplaza a uno de la B). 5. Jugadores: **siempre estrellas** (números 1–99 a medida que los ojeadores los conocen).
6. Extranjeros: países reales, clubes y jugadores inventados, cupo 6. 7. Partidos: 2,5 goles promedio, relator partidario, **que pase de todo**: perros en la cancha, clima, incidentes, desmayos y emergencias médicas (con respeto, tipo Eriksen/Agüero), suspensiones. Límite propuesto por Claude: amenaza de bomba con evacuación sí, **ataques terroristas no**.
8. **Cadenas de movidas en el MVP.** 9. Las obras **avanzan en el receso**.
- Pendiente de Claude: la cancha inicial (2.200) no alcanza para la demanda base de la B (6.000); ajustar.
- **Demo publicada (2026-10-09):** https://seeiryu11.github.io/fulbo/ — escena 3D del club siempre de fondo (estadio europeo + villa, prototipo portado en `src/escena3d/escena.ts`), HUD, tabla, diario y movidas encima; liga de 20 sobre el núcleo real (`src/demo/`). Se republica sola con cada push a `main` (`.github/workflows/pages.yml`). El usuario remarcó: **la cancha y la villa tienen que verse siempre, como en BOLA** — nunca sacarlas.
