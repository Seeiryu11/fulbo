# Roadmap

Orden original (2026-10-07): primero toda la interfaz, al final el partido jugable.
**Cambio (2026-10-07):** el usuario pidió dejar lo visual y pasar al funcionamiento con agentes. Nuevo orden: **base → los agentes construyen cada módulo → interfaz y 3D con datos reales → partido jugable al final.**

| Fase | Qué | Quién | Estado |
|------|-----|-------|--------|
| 0 | Requisitos de todas las specs | coordinador | ✅ aprobados |
| 0b | Dirección de arte | coordinador | ✅ 3D con Three.js (`referencias/mockups/predio-europeo.*`) |
| 1 | **Base / núcleo**: tiempo (semanas y días), ciclo entre partidos, estado por porciones, efectos, azar con semilla, guardado | coordinador | ✅ programado (N0–N10, 34 tests) |
| 1b | **Economía**: modelo y números | coordinador | ✅ `specs/economia/design.md` aprobado |
| 2 | **Diseño por módulo** (`design.md` + `tasks.md`) | agentes `club`, `mercado`, `liga`, `partido`, `movidas` en paralelo | ✅ entregados (2026-10-09) · ⏳ revisión del usuario |
| 3 | **Esqueleto de código**: Vite + TS, núcleo programado, test de temporada sin pantalla | coordinador | ✅ hecho (34 tests en verde) |
| 4 | **Módulos programados** sobre el núcleo | agentes en paralelo | pendiente |
| 5 | **Interfaz + escena 3D** del club con datos reales | coordinador + agente `club` | pendiente |
| 6 | **Highlights 2D** y minijuegos de jugadas clave | agente `partido` | pendiente |
| 7 | **Highlights 3D** y partido jugable | agente `partido` | pendiente |
| 8 | Social, carrera de jugador, IA en vivo | — | más adelante |
