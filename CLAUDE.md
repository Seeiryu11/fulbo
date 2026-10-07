# FULBO — contexto para Claude

Juego de fútbol para navegador inspirado en BOLA Social Soccer (Facebook, 2011) y Potrero (comunidad argentina de Twitter). Leé primero [README.md](README.md) y `steering/`.

## Cómo trabajamos
- **No ser complaciente**: si una idea del usuario está mal, es floja o va a quedar fea, decírselo claro con el motivo y una alternativa antes de hacerla.
- **Spec driven development** (ver `steering/proceso.md`): requisitos → diseño → tareas → código. No se programa sin `requirements.md` y `design.md` aprobados. Si algo cambia, se actualiza la spec primero.
- Se habla en español rioplatense.
- Se va de a poco: el usuario prefiere proyectar y decidir antes de construir.

## Decisiones del usuario (no re-discutir)
- Sos **el dueño del club**: hacés lo del DT y contratás DTs que suben estadísticas. El jugador propio (primera persona, estilo Potrero) está **postergado** en `specs/carrera-jugador`.
- **No se imita Facebook** ni ninguna red. Que BOLA fuera de Facebook es solo contexto. La nostalgia es el **estilo visual de BOLA**.
- **Sin "Eras"**: el contenido es el fútbol de hoy (cerveza, apuestas, cripto, TikTok, streamers).
- Navegador primero (celular después). Arte intermedio lindo en SVG, como `referencias/mockups/predio.png`.
- Economía: solo **Pesos y Fama**, sin moneda premium hasta que el juego esté aceitado.
- Obras por **fechas jugadas**, no tiempo real.
- Se arranca en la **B Nacional**: el 1.º asciende directo, el 2.º juega repechaje contra el anteúltimo de Primera.
- Orden: **toda la interfaz primero** (con datos mock), el partido jugable **al final**.
- **El estadio es la atracción principal**: ocupa ~la mitad de la pantalla y crece por categorías (cancha de barrio → ascenso → Primera → moderno → europeo → del futuro). La otra mitad es "la villa" (entrenamiento, prensa, ojeadores, etc.).
- **Situaciones estilo Potrero para TODO el club**, no solo jugadores: sponsors, política institucional, AFA, la ciudad del club, economía, obras, prensa (`specs/muro`, MUR-0).
- Stack: TypeScript + Vite + Preact + SVG es solo una **opción recomendada**, no cerrada.

## Estado (2026-10-07)
- Requisitos aprobados: interfaz, club, muro, partido.
- `specs/interfaz/design.md` en revisión: el mockup `referencias/mockups/predio.png` tiene el estadio al centro y hay que rehacerlo con el layout estadio + villa.
- Próximo paso: aprobar el diseño de la interfaz → `specs/interfaz/tasks.md` → instalar Node (`winget install OpenJS.NodeJS.LTS`) → programar.

## Herramientas
- `referencias/_tools/serve.ps1`: servidor estático local (configurado en `.claude/launch.json` como `bola-static`, puerto 8765).
- Los videos de referencia son HEVC: para sacar fotogramas hace falta ffmpeg (`winget install Gyan.FFmpeg`). Ya están extraídos en `referencias/frames/` y analizados en `referencias/analisis.md`.
- Mockup a PNG: Edge headless con `--screenshot` sobre la página servida por `serve.ps1`.
- Repo: https://github.com/Seeiryu11/fulbo (público). Los videos `.mov` no se suben (pasan los 100 MB); están en la compu original.
