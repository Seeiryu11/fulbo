# Liga — Tareas

Estado: `en revisión` · Depende de: `requirements.md` y `design.md` aprobados, núcleo programado (fase 3) y el pedido N1 resuelto.

Cada tarea es chica y se cierra cuando su verificación pasa. Tests en `tests/modulos/liga/`. Ninguna usa `Math.random()` ni la fecha del sistema.

## A. Datos

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| A1 | Esquemas Zod de `clubes.json`, `federal.json`, `extranjeros.json`, `arquetipos.json`, `calendario.json`, `reglamentos/*.json`, `noticias.json`, `balance.json`, `temporada0.json` | LIG-2.4, LIG-9.5 | Test: cada JSON valida; un JSON roto da un error legible |
| A2 | `clubes.json` con los 40 clubes de design §16 (hex, patrón, rasgos, presidente, nivel, clásico, `reemplazable`) | LIG-9.1–9.3, LIG-14.1 | Test: 20 + 20; ids únicos; clásicos simétricos; cada entorno y cada estilo aparecen ≥ 1 vez; ningún nombre de la lista negra de clubes reales |
| A3 | Lista negra de nombres y apodos de clubes reales (`tests/modulos/liga/lista-negra.json`) | LIG-9.2 | Usada por A2, A4 y A5 |
| A4 | `federal.json`: pool de ~36 clubes livianos con perfil 30–50 | LIG-9.4, LIG-6.1 | Test: ≥ 30 clubes, perfiles en rango |
| A5 | `extranjeros.json`: ~40 clubes livianos de 9 países, perfil 50–85, prestigio | LIG-9.4, LIG-7.1 | Test: ≥ 4 por país, ≥ 32 en total |
| A6 | `arquetipos.json` y `balance.json` con los valores de design §8 y §10 | LIG-10.1, LIG-12 | Test de esquema |
| A7 | `calendario.json` con la plantilla de design §2 | LIG-1.1–1.3, LIG-8 | Ver B1 |
| A8 | Reglamentos: `b_nacional`, `primera`, `copa_nacional`, `copa_condor`, `repechaje`, `desempate` | LIG-2.4, LIG-4.2, LIG-6, LIG-7 | Test de esquema |
| A9 | `noticias.json`: ≥ 3 variantes por clave de design §12 y ≥ 5 claves propias por arquetipo | LIG-13.2 | Test: toda plantilla usa solo variables conocidas |
| A10 | `temporada0.json`: tabla "anterior" de ambas divisiones, palmarés ficticio, ranking continental | LIG-6.2, LIG-7.2, LIG-16.2 | Test de esquema y coherencia con `clubes.json` |

## B. Calendario y fixture

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| B1 | `calendario.ts`: plantilla → `EventoCalendario[]` de una temporada | LIG-1.1–1.3 | Test: 38 fechas de liga (semanas 5–24 y 29–48 sin la 15 ni la 41), copas en martes y miércoles, nunca Copa Nacional y Cóndor la misma semana |
| B2 | `fixture.ts`: Berger de 20, espejo para la vuelta | LIG-3.1 | Test: cada par se cruza 2 veces con localía invertida; 10 partidos por fecha |
| B3 | Restricción de 3 seguidos de local o visitante (con reintento) | LIG-3.2 | Test sobre 500 semillas: ningún club con 3 seguidos |
| B4 | Clásicos en la fecha 10 y 29 | LIG-3.3, LIG-14.1 | Test: todos los clásicos de la división caen en F10 y F29 |
| B5 | Reparto de días (vie, sáb, dom, lun) con las reglas de design §2.1; F38 toda el domingo | LIG-1.2, LIG-1.4, LIG-3.4 | Test: ningún club con dos partidos a menos de 2 días; usuario solo sáb o dom |
| B6 | Determinismo del fixture | LIG-3.5 | Test: misma semilla ⇒ fixture idéntico; otra semilla ⇒ distinto |

## C. Tabla y temporada

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| C1 | `tabla.ts`: tabla incremental y orden con todos los criterios | LIG-4.1, LIG-4.2 | Tests con casos armados de cada criterio; recalcular de cero = incremental |
| C2 | Sanciones (quita de puntos) en la tabla | LIG-4.4 | Test: Pts = 3G + E − quitas |
| C3 | Matemáticas (asegurado título, ascenso, repechaje, descenso) | LIG-4.5 | Tests con tablas armadas en la fecha 35 |
| C4 | Partido desempate (semana 49) para título, ascenso y descenso | LIG-4.3 | Test: empate en puntos en el 1.º ⇒ se programa el desempate; tres empatados ⇒ juegan los dos mejores |
| C5 | Repechaje ida y vuelta con penales | LIG-5.3, LIG-5.4 | Test: ida en cancha de la B, vuelta en la de Primera; global empatado ⇒ penales |
| C6 | `temporada.ts`: cierre (ascenso, descenso, repechaje, historial, temporada nueva) | LIG-5.1, 5.2, 5.5 | Test: después del cierre siguen 20 + 20 y cambiaron exactamente 2 o 3 clubes de división |
| C7 | Inicio: el usuario reemplaza a un club `reemplazable`; el desplazado va al Federal; clásico por entorno | LIG-2.1, LIG-14.2 | Test |

## D. Copas

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| D1 | `llaves.ts`: llave a partido único y a ida y vuelta, global y penales | LIG-6.4, LIG-7.3 | Tests de casos |
| D2 | `sorteo.ts`: bombos con restricciones por backtracking | LIG-6.2, LIG-7.4 | Test: 1.000 sorteos sin violar restricciones |
| D3 | Copa Nacional: 64 equipos, cuadro fijo, localía del menor, sedes neutrales | LIG-6 | Test: 63 partidos, un campeón, ningún Primera contra Primera en 32avos |
| D4 | Cupos de la Cóndor (incluido el campeón de Copa Nacional de la B) | LIG-7.2, LIG-7.6 | Test con casos: repetido ⇒ entra el 5.º |
| D5 | Copa Cóndor: grupos, octavos, cuadro y final (V1) | LIG-7 | Test: 125 partidos, ningún grupo con dos del mismo país |

## E. Simulación y vida

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| E1 | `simulacion.ts`: adaptador a `partido.simularRapido` con `rng` derivado por partido | LIG-11 | Test con un doble de prueba del motor |
| E2 | Andamio provisorio (Poisson) solo para tests, hasta que llegue el modo rápido | LIG-11, LIG-17.1 | Se borra cuando `partido` entrega P1 |
| E3 | Personalidad: forma, presión, humor, salud y expectativa | LIG-10.2, 10.3, LIG-12.1, 12.6 | Tests: la forma nunca mueve más de ±6 %; un ordenado aguanta más derrotas que un loco |
| E4 | Política de mercado y señales | LIG-10.2, LIG-12.4, LIG-12.5 | Test: las señales tienen id único y se limpian a los 7 días |
| E5 | Rachas, batacazos, goleadas, papelones, crisis | LIG-12.2–12.5 | Tests con secuencias armadas |
| E6 | `noticias.ts`: plantillas, variables, importancia, tope diario, anti-repetición | LIG-13 | Test: nunca más de 4 noticias de importancia 1–2 por día; no se repite plantilla por club en 8 semanas |
| E7 | Hitos del usuario y efectos de contexto (clásico, ascenso, papelón…) | LIG-5, LIG-14.3 | Test: cada situación de design §17 emite sus efectos con `origen: 'liga'` |
| E8 | Elecciones y cambio de arquetipo (V1) | LIG-10.4 | Test sobre 50 temporadas |

## F. Integración

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| F1 | `selectores.ts` (design §11.4) | LIG-1.5, LIG-19 | Tests de cada selector |
| F2 | `index.ts`: el `Modulo<EstadoLiga>` con todos los ganchos | NUC-3.4 | Test: una semana completa avanza sin errores |
| F3 | `buzon.ts`: marcas `liga.*` aplicadas una sola vez (V1) | LIG-15 | Test: la misma marca dos días seguidos se aplica una vez |
| F4 | Ventanas de pases y ventana al exterior | LIG-8 | Test de `ventanaAbierta` en cada semana |
| F5 | Temporada completa sin pantalla: consistencia y determinismo | LIG-17.1, LIG-17.3 | Test: 52 semanas ≤ 3 s; tablas consistentes; dos corridas con la misma semilla dan lo mismo |
| F6 | Banco de balance: 200 temporadas, métricas de design §13 | LIG-17.2 | Script que imprime las métricas y falla si se van de rango |
| F7 | Historial y palmarés (V1) | LIG-16 | Test: 10 temporadas ⇒ 10 `TemporadaCerrada` |
| F8 | Amistosos de verano e invierno (Después) | LIG-18 | — |

## Orden sugerido
A1–A3, A6–A8 → B1–B6 → C1–C2 → E1–E2 → F1–F2 → C3–C7 → D1–D4 → E3–E7 → F4–F6 → A4, A5, A9, A10 → V1 (D5, E8, F3, F7).
