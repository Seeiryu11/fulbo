# FULBO (nombre de laburo)

Juego de fútbol para navegador / app. Inspirado en **BOLA Social Soccer** (Playdom, Facebook, 2011) y **Potrero** (juego de carrera por decisiones de la comunidad argentina de Twitter).
Sos el dueño del club. El estilo visual es nostalgia de los juegos sociales de 2011; el contenido es el fútbol de hoy: cerveza, apuestas, cripto, TikTok, streamers, Arabia, VAR.

> Estado: **Fase 1 – diseño** (spec driven development; requisitos aprobados). Todavía no hay código.

## Seguir desde otra compu

Ver [GUIA-OTRA-COMPU.md](GUIA-OTRA-COMPU.md). Importante: GitHub no guarda solo; antes de dejar una compu hay que hacer commit + push.

## Cómo se trabaja

Ver [steering/proceso.md](steering/proceso.md): requisitos → diseño → tareas → código. No se programa sin spec aprobada.

## Mapa

| Doc | Qué es | Estado |
|-----|--------|--------|
| [steering/producto.md](steering/producto.md) | Visión, tono, estética, reglas de contenido | aprobado |
| [steering/proceso.md](steering/proceso.md) | Cómo usamos SDD | aprobado |
| [steering/tecnica.md](steering/tecnica.md) | Stack recomendado (opción, no cerrado) y modelo de datos | propuesta |
| [specs/interfaz/design.md](specs/interfaz/design.md) | Layout, estilo visual, rutas y pantallas de la interfaz | en revisión |
| [steering/roadmap.md](steering/roadmap.md) | Orden de construcción: interfaz primero, partido jugable al final | aprobado |
| [specs/interfaz/requirements.md](specs/interfaz/requirements.md) | HUD, predio, pantallas, flujo de fecha | aprobado |
| [specs/partido/requirements.md](specs/partido/requirements.md) | Partido: jugar / mirar / simular, minijuegos, relato | aprobado |
| [specs/club/requirements.md](specs/club/requirements.md) | Estadio por piezas, predio, staff, plantel, camiseta, sponsors, economía | aprobado |
| [specs/despacho/requirements.md](specs/despacho/requirements.md) | Situaciones y decisiones de todo el club, estilo Potrero | aprobado |
| [specs/carrera-jugador/requirements.md](specs/carrera-jugador/requirements.md) | Jugador propio estilo Potrero (separado para después) | postergado |
| [referencias/analisis.md](referencias/analisis.md) | Qué vimos en los videos de BOLA y Potrero | — |

## Referencias

- `referencias/videos/` — gameplays originales.
- `referencias/frames/` — hojas de fotogramas sacadas con ffmpeg.
- `referencias/_tools/` — `serve.ps1` (servidor estático local).
