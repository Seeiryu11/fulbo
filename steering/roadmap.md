# Roadmap

Orden acordado (2026-10-07): **primero toda la interfaz, al final el partido jugable.**

| Fase | Qué | Specs | Resultado |
|------|-----|-------|-----------|
| 0 | Especificación | todas (`requirements.md`) | Requisitos aprobados |
| 1 | Diseño técnico y de UI | `steering/tecnica.md`, `design.md` de interfaz, club y muro | Stack elegido, modelo de datos, wireframes |
| 2 | Interfaz con datos mock | `specs/interfaz` | Se navega todo el juego: predio, muro, plantel, modales, flujo de fecha con resultados inventados |
| 3 | Lógica del club y del Muro | `specs/club`, `specs/muro` | Economía, obras por fechas, DTs, sponsors, eventos con consecuencias reales |
| 4 | Simulación + minijuegos | `specs/partido` PAR-1, 4, 5, 6, 8, 9 | Temporada completa jugable simulando y definiendo jugadas clave |
| 5 | Partido jugable | `specs/partido` PAR-2, 3, 7, 10 | El partido 3/4 estilo BOLA |
| 6 | Social y extras | CLU-11, PAR-11, selecciones | Amigos, ligas, VAR, World Battle |
