# Partido — Tareas

Estado: `en revisión` · Depende de: `specs/partido/design.md` aprobado y del esqueleto del núcleo (fase 3 del roadmap).

Cada tarea es chica, cita los requisitos que cubre y dice cómo se verifica. Los tests van en `tests/modulos/partido/`. Las tareas de UI (bloque H) corresponden a la fase 6 del roadmap; las del bloque J, a la fase 7.

## A · Tipos, datos y validación

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| PAR-T01 | Tipos de §12 en `src/modulos/partido/tipos.ts` (porción, entrada, simulación, paradas, eventos, resultado, reconstrucción). | PAR-1 | Compila; `ResultadoPartido` coincide con lo acordado en el pedido N4. |
| PAR-T02 | Esquemas Zod y carga de `motor.json`, `sectores.json`, `formaciones.json`, `estilos.json`, `localia.json` con los valores de §3–§4. | PAR-1, PAR-6 | Test: los JSON cargan; un JSON roto da un error que nombra archivo y campo. |
| PAR-T03 | `formaciones.json` con 6 formaciones (4-3-1-2, 4-4-2, 4-3-3, 4-2-3-1, 3-5-2, 5-3-2): puestos, coordenadas y pesos. | PAR-8 | Test: cada formación tiene 11 puestos, 1 ARQ, coordenadas dentro de la cancha. |
| PAR-T04 | `charlas.json`, `cabalas.json` (≥ 6 cábalas), `efectos.json` (§11). | PAR-6, PAR-8 | Test de esquema; ids únicos. |

## B · Azar y determinismo

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| PAR-T05 | `azar.ts`: generador por `(semilla, flujo)` (usa el del núcleo si existe, pedido N2), con `u()`, `normal()`, `elegirPonderado()`. | PAR-1.2 | Test: misma semilla y flujo ⇒ misma secuencia; flujos distintos no correlacionan (prueba de chi² simple). |
| PAR-T06 | Cuantización de las respuestas del usuario (enteros) y `versionMotor`. | PAR-1.2 | Test: respuestas con decimales se rechazan o redondean igual siempre. |

## C · Valoración

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| PAR-T07 | Jugador efectivo (§3.1): físico, moral, efectos, posición, tarjeta. | PAR-6.1, PAR-6.2 | Tests con tabla: físico 50 ⇒ ×0,90; moral 0 ⇒ ×0,96; DEF de delantero ⇒ ×0,75; `resaca` baja velocidad 15 %. |
| PAR-T08 | Sectores, volumen por formación, ATQ / CON / FUERZA (§3.2). | PAR-6.1 | Test: 5-3-2 tiene más DEF y menos ATA que 4-3-3 con el mismo plantel; la diferencia de DEF está entre +3 % y +6 %. |
| PAR-T09 | DT (nivel, afinidad de estilo, `BonusDT`), charla y cábala (§3.4, §3.6). | PAR-6, PAR-8 | Tests: DT nivel 5 suma 2,5 puntos; estilo afín amplifica ×1,5; cábala nivel 3 = +1,5. |
| PAR-T10 | Localía, peso de la hinchada, Aguante inicial (§3.5). | PAR-7 | Tests: neutral = 1,00; puertas cerradas ⇒ peso 0; 60.000 llenos y Aguante 100 ⇒ ×1,16. |
| PAR-T11 | `armarEntrada(partida, idPartido)`: lee las porciones, arma el once automático, filtra lesionados y suspendidos. | PAR-1, PAR-6 | Test con partida fixture: nunca entra un lesionado; el rival sin táctica sale con su formación preferida. |
| PAR-T12 | `valorarEquipo` y `pronostico` analítico (Poisson con las tasas esperadas). | PAR-8, INT-5.1 | Test: el pronóstico queda a ±4 pp de lo que da simular 20.000 partidos. |

## D · Bucle del motor

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| PAR-T13 | Bucle por minutos: control, ocasiones, tipo, protagonistas, resolución del remate (§4.1–4.4). | PAR-1.1, PAR-1.4 | Test: un partido produce eventos ordenados por minuto con protagonistas válidos. |
| PAR-T14 | Faltas, tarjetas, expulsiones, penales, tiros libres, córners, lesiones (§4.4). | PAR-1.4 | Test de frecuencias sobre 20.000 partidos (bandas de §5.2). |
| PAR-T15 | Fatiga, marcador, cambios automáticos e IA táctica del rival (§4.5–4.8). | PAR-6.1 | Test: con cambios automáticos nadie termina con físico < 30 si había suplentes; el que pierde en el 70 cambia a ofensivo. |
| PAR-T16 | Descuento, alargue y tanda automática según `reglas` (§7.8). | PAR-5, CLU-12.6 | Test: con `empate: 'penales'` nunca termina sin ganador; la tanda respeta 5 + muerte súbita. |
| PAR-T17 | Registradores rápido y completo; `simularRapido`, `iniciarSimulacion`, `avanzar`, `cerrar`. | PAR-1.1, PAR-1.3 | Test de propiedad (b): rápido = completo con todo salteado en 1.000 semillas. |
| PAR-T18 | Notas 1–10 y figura. | PAR-4.1 | Test: el autor de un hat-trick sale figura; notas dentro de 1–10. |
| PAR-T19 | Rendimiento. | PAR-1.3, NUC-7 | Benchmark: rápido < 0,5 ms y completo < 30 ms de mediana en PC. |

## E · Calibración

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| PAR-T20 | Verificar las referencias reales de §5.1 con datos públicos y ajustar las bandas de §5.2 si hace falta (actualizar la spec primero). | PAR-1 | Tabla de §5.1 con fuente por fila. |
| PAR-T21 | `herramientas/calibrar-partido.ts`: grilla de diferencias de fuerza, estilos y expulsiones; imprime tabla. | PAR-1 | Corre en < 30 s. |
| PAR-T22 | `calibracion.test.ts` con todas las bandas de §5.2; ajustar `motor.json` hasta que pase. | PAR-1, PAR-6, PAR-7 | Test verde. |
| PAR-T23 | Prueba de temporada: 20 equipos con 15 puntos de dispersión, 400 temporadas. | PAR-1, CLU-12 | Campeón 74–82 pts, último 24–32, mejor plantel campeón 25–40 %. |

## F · Jugadas clave y minijuegos (lógica)

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| PAR-T30 | Paradas: candidatas, presupuesto, prioridad y reserva (§7.1); `responder`. | PAR-5.1, PAR-5.3 | Test: nunca más de `maxJugadas`; con `'ninguno'` no hay paradas de jugada; penal siempre entra si hay presupuesto. |
| PAR-T31 | Penal y atajar penal: `resolverJugada` + `ejecucionAutomatica` + arquero IA + tendencias (§7.3, §7.4, §7.2). | PAR-5.4 | Test: automático 74–78 % de gol; atajar automático ~24 %; repetir zona 3 de 5 sube la adivinación del arquero. |
| PAR-T32 | Tiro libre (directo y centro) (§7.5). | PAR-5.4 | Test: automático 5–8 %; una ejecución que no pasa la barrera nunca es gol. |
| PAR-T33 | Mano a mano con postura visible y tabla (§7.6). | PAR-5.4 | Test: automático 34–40 %; elegir siempre la definición correcta contra la postura real da 50–60 %. |
| PAR-T34 | Última jugada (selector) y encadenado de minijuegos (§7.7). | PAR-5.1 | Test: solo aparece en 88'+ con las condiciones; puede encadenar mano a mano. |
| PAR-T35 | Balance jugar vs saltear: bots "hábil", "promedio" y "torpe" contra cada minijuego. | PAR-5.3 | Hábil +10–15 pp sobre automático; torpe −10 a −20 pp. |
| PAR-T36 | Entretiempo: cambios, estilo, charla y movidas "en partido" aplicadas al 2.º tiempo (§8). | PAR-10 | Test: un efecto `temporal: calentado` aplicado en el entretiempo cambia las faltas del 2.º tiempo; reproducción con `reconstruir` da lo mismo. |
| PAR-T37 | Retomar partido cortado y resolución automática de jugada abierta (§7.9). | PAR-1.2 | Test: guardar a mitad, reconstruir, terminar ⇒ igual que sin cortar (salvo la jugada abierta, que sale automática). |

## G · Relato, resumen y highlights (lógica)

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| PAR-T40 | Motor de relato: fragmentos, condiciones, variables, no repetición (§10.2–10.5). | PAR-9.1, PAR-9.2 | Test: 1.000 partidos sin ids repetidos; ninguna línea con `{variable}` sin resolver. |
| PAR-T41 | Banco de frases MVP con los mínimos de §10.3 (frases originales, revisión de tono PG-13). | PAR-9 | Test de mínimos por clave; revisión del usuario de una muestra de 50 frases. |
| PAR-T42 | Validador de efectos: avisa ids de `efectos.json` desconocidos que lleguen en jugadores. | PAR-6.2 | Test: id desconocido ⇒ aviso, sin error. |
| PAR-T43 | Resumen como publicación: titular, crónica, reacciones, comentarios (`comentarios.json` ≥ 60). | PAR-4 | Test: siempre 3–5 momentos; comentarios coherentes con el resultado (sin "ganamos" en una derrota). |
| PAR-T44 | Selección de highlights por puntaje (§9.1). | PAR-12.2 | Test: siempre 3–6; todos los goles entran si son ≤ 6. |
| PAR-T45 | `plantillas.json` con las 12 plantillas MVP y generador de reconstrucción (§9.2–9.3). | PAR-12.1 | Tests: pelota dentro de la cancha salvo desenlace; el gol entra entre los palos; el penal jugado se ve donde apuntó el usuario. |
| PAR-T46 | `posicionesDeBloque` para el resto de los 22. | PAR-12.1 | Test: ningún jugador fuera de la cancha; el bloque sigue a la pelota. |

## H · Integración con el núcleo

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| PAR-T50 | `moduloPartido`: `iniciar`, `reducir` (táctica, previa, preferencias, sim), `antesDelPartido`, `despuesDelPartido`, `alCerrarTemporada`. | PAR-8, NUC-3 | Test: reducir es puro; antesDelPartido reemplaza lesionados y avisa. |
| PAR-T51 | `consecuencias()` y efectos/noticias de §13. | PAR-6, NUC-5 | Test: los efectos llevan `origen`; no se emiten plata ni fama. |
| PAR-T52 | Test de integración con `liga`: temporada sin pantalla usando `simularRapido`. | NUC-7 | La temporada completa corre en < 10 s y dos corridas con la misma semilla dan lo mismo. |

## I · UI (fase 6)

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| PAR-T60 | Pantalla de previa: comparación de equipos, pronóstico, formación, titulares, estilo, charla, cábala. | PAR-8, INT-5.1 | Prueba manual con datos mock. |
| PAR-T61 | Relato en vivo acelerado (1×/2×/4×), marcador, reloj y barra de Aguante. | PAR-4, PAR-7.1, INT-5.2 | Prueba manual: la barra sube con un gol propio y baja con uno en contra. |
| PAR-T62 | Minijuego de penal y atajar penal (mouse y táctil, ≤ 20 s). | PAR-5 | Prueba manual en PC y celular; saltear funciona. |
| PAR-T63 | Minijuego de tiro libre. | PAR-5 | Ídem. |
| PAR-T64 | Minijuego de mano a mano y selector de última jugada. | PAR-5 | Ídem. |
| PAR-T65 | Tanda de penales con "simular la tanda". | PAR-5, CLU-12.6 | Prueba manual. |
| PAR-T66 | Entretiempo con cambios, charla y movidas "en partido". | PAR-10 | Prueba manual con una movida mock. |
| PAR-T67 | Pizarra 2D animada de highlights con relato, Saltear y Saltear todos. | PAR-12.2–12.4 | Prueba manual; 60 fps en PC. |
| PAR-T68 | Resumen como publicación del club (forma propia, sin imitar redes reales). | PAR-4.2 | Revisión del usuario. |

## J · V1 y fase 7 (no se arrancan sin pedido)

| ID | Tarea | Req. |
|----|-------|------|
| PAR-T70 | Condiciones del partido (altura, nieve, calor, césped). | PAR-6, DES-8 |
| PAR-T71 | Highlights en el estadio 3D usando el mismo formato. | PAR-12.3 |
| PAR-T72 | VAR con pausa dramática. | PAR-11 |
| PAR-T73 | Diseño del partido jugable y Mirar (spec propia, fase 7), con test de coherencia de §15. | PAR-2, PAR-3 |
