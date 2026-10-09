# Núcleo — Tareas

Estado: `en curso` · Dueño: coordinador · N0 hecha (2026-10-09); N1–N10 esperan la aprobación de `design.md`

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| N0 ✅ | Esqueleto del proyecto: Vite + TypeScript + Vitest + Three.js, scripts `dev`, `build`, `test`, `typecheck` | — | `npm test` y `npm run build` corren en verde con un test vacío |
| N1 | `src/nucleo/tiempo.ts`: tipo `Instante`, `siguienteDia`, `compararInstantes`, `semanaDe`, formato "Semana 41 · martes 6 de octubre" | NUC-1 | Tests: avanzar de domingo de semana 52 pasa a lunes semana 1 de la temporada siguiente; formato correcto |
| N2 | `src/nucleo/rng.ts`: generador con semilla (mulberry32 o similar) y flujos por módulo derivados de la semilla de la partida | NUC-4 | Tests: misma semilla = misma secuencia; flujos de distintos módulos independientes |
| N3 | `src/nucleo/efectos.ts`: tipos `Efecto`, aplicación sobre la `Partida` (cada tipo de efecto delega en el reductor del módulo dueño de la porción), resolución de `azar` | NUC-3 | Tests: cada tipo de efecto modifica solo su porción; `azar` usa el rng |
| N4 | `src/nucleo/modulo.ts`: interfaz `Modulo`, `Contexto`, `Salida`, registro de módulos y orden fijo `liga → mercado → club → economia → movidas` | NUC-3 | Test con módulos falsos: el orden se respeta y la partida es de solo lectura dentro de los ganchos |
| N5 | `src/nucleo/ciclo.ts`: `avanzarHasta(partida, objetivo)` día por día, interrupciones, fases `gestion → previa → partido → resumen`, cierre de semana y de temporada | NUC-2 | Tests: una interrupción frena el avance en el día correcto; se llama `alCerrarSemana` 52 veces por temporada |
| N6 | `src/nucleo/noticias.ts`: registro con importancia y límite de historial | NUC-5 | Test: se guardan en orden y se recortan |
| N7 | `src/nucleo/guardado.ts`: serializar/deserializar con versión y migraciones; adaptador localStorage | NUC-6 | Test: ida y vuelta da un estado idéntico; una migración de v1 a v2 corre |
| N8 | `src/nucleo/avanceRapido.ts`: simular varios partidos hasta el próximo evento importante | NUC-2.5 | Test: se detiene ante una interrupción o un evento marcado como importante |
| N9 | Módulos "vacíos" de prueba para los 6 dueños, que cumplan el contrato sin lógica | NUC-3 | La partida se crea y avanza con los 6 registrados |
| N10 | `tests/integracion/temporada.test.ts`: crear partida → 52 semanas sin pantalla → verificaciones de §9 del diseño | NUC-7 | Corre en < 10 s y dos corridas con la misma semilla dan idéntico resultado |
