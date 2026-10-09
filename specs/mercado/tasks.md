# Mercado — Tareas

Estado: `en revisión` · Sale de `specs/mercado/design.md` · No se empieza ninguna tarea hasta que `requirements.md` y `design.md` estén `aprobado` y el núcleo resuelva los pedidos 1, 2, 3 y 5 (§20).

Cada tarea es chica, cita requisitos y dice cómo se verifica. Los tests van en `tests/modulos/mercado/`. Prioridad: MVP salvo que diga otra cosa.

## A. Datos y tipos

| ID | Tarea | Req. | Se verifica con |
|----|-------|------|-----------------|
| MER-T01 | Tipos de §16 en `src/modulos/mercado/tipos.ts` (porción, jugador, contrato, oferta, DT, staff, acciones) | MER-21 | Compila; `EstadoMercado` serializa y deserializa igual (test de ida y vuelta) |
| MER-T02 | Esquemas Zod de todos los JSON de `src/datos/mercado/` | MER-22 | Un JSON con un campo mal falla con mensaje legible |
| MER-T03 | `posiciones.json`, `perfiles.json`, `edades.json` (curvas y pools) | MER-1, MER-2, MER-4 | Pesos por posición suman 1 (test) |
| MER-T04 | `nombres/ar.json` (≥ 150 nombres por generación, ≥ 300 apellidos con origen), `uy`, `py`, `co`, `br` | MER-2 | Test: 10.000 nombres sin repetir más de 1 % |
| MER-T05 | `apodos.json` con fuentes y condiciones de §2.5, y `prohibidos.json` (apodos y nombres reales, rasgos étnicos) | MER-2.3–2.5 | Test: 50.000 jugadores generados, 0 coincidencias con `prohibidos.json` |
| MER-T06 | Revisión manual de ficción: buscar nombres de clubes del exterior, DTs, representantes y staff de muestra para descartar coincidencias con personas o clubes reales | MER-22.2 | Checklist firmado en el PR |
| MER-T07 | `rasgos.json`, `valores.json`, `lesiones.json`, `efectos-temporales.json` | MER-1.5, 5, 6, 7 | Esquemas pasan |
| MER-T08 | `dts.json` (12 libres + generador), `staff.json`, `representantes.json`, `regiones.json`, `ia-mercado.json`, `ventanas.json`, `clubes-exterior.json`, `textos.json` | MER-9, 15–18 | Esquemas pasan |

## B. Generación

| ID | Tarea | Req. | Se verifica con |
|----|-------|------|-----------------|
| MER-T10 | `media(jugador)` y `estrellas(media)` | MER-1.3 | Tabla de casos de §1.2 |
| MER-T11 | Generador de atributos por perfil escalado a una media dada | MER-2.1 | La media resultante cae a ± 0,5 de la pedida en 1.000 casos |
| MER-T12 | Generador de aspecto, altura, pie, fragilidad y rasgos | MER-1, 2 | Distribuciones dentro de ± 2 puntos de lo especificado en 10.000 casos; nunca profesional + fiestero |
| MER-T13 | Generador de nombre y apodo coherente con aspecto, origen y atributos | MER-2.2–2.5 | Ningún "Colo" sin pelo colorado, ninguna "Torre" < 185 cm |
| MER-T14 | Generador de jugador completo (incluye contrato, sueldo, valor, representante) | MER-2 | Misma semilla ⇒ mismo jugador (test de determinismo) |
| MER-T15 | Generación de planteles por pool (B, Primera, grande), libres y exterior | MER-2, MER-3 | Medias de titulares por división dentro de la referencia de §1.2; ≥ 2 ARQ por club |
| MER-T16 | Plantel inicial del usuario con ídolo, pibe y fiestero garantizados | MER-3 | Test de las tres garantías y 3/8/8/4 por puesto |

## C. Valor y sueldo

| ID | Tarea | Req. | Se verifica con |
|----|-------|------|-----------------|
| MER-T20 | `sueldoBase`, `sueldoPedido` y `valor` (§3.1–3.2) en AU | MER-7.1–7.2 | Ejemplos de §3.2; masa salarial promedio de la B ≈ AU 650M/año (± 15 %) |
| MER-T21 | `kMercado` por región del exterior en valores y sueldos | MER-7.4 | El mismo jugador vale ×2 vendido a Europa que a un club de la liga |

## D. Evolución y estado

| ID | Tarea | Req. | Se verifica con |
|----|-------|------|-----------------|
| MER-T30 | Evolución semanal (§4.1) con foco e intensidad | MER-4 | Calibración: pibe 17/50/80 con cancha 3 llega a 74 ± 3 a los 23 (promedio de 200 corridas) |
| MER-T31 | Declive por edad con Velocidad y Físico primero y Liderazgo que sube | MER-4.2 | A los 34, Velocidad bajó más que Pase en el 90 % de los casos |
| MER-T32 | Energía (partido y recuperación diaria) | MER-5.1 | Titular de 25 años sin staff vuelve a ≥ 90 en 3 días |
| MER-T33 | Forma con nota de partido y moral (§4.3) con deriva | MER-5.2–5.3 | Tabla de eventos de §4.3 |
| MER-T34 | Catálogo de efectos temporales y descuento por partido | MER-5.4 | `resaca` dura 1 partido y desaparece |
| MER-T35 | `atributosEfectivos` con tope −15 / +8 | MER-5.5 | Ningún caso supera el tope |
| MER-T36 | `evolucionMes` para la ficha | MER-4.4 | Muestra la diferencia de las últimas 4 semanas |

## E. Lesiones y disciplina

| ID | Tarea | Req. | Se verifica con |
|----|-------|------|-----------------|
| MER-T40 | `riesgoLesion` (§6) | MER-6 | Promedio de lesiones por equipo y temporada entre 10 y 18 (simulación) |
| MER-T41 | Gravedad, duración, recaída y efecto de médico y kinesiólogo | MER-6.1 | Distribución de §6 en 10.000 casos |
| MER-T42 | Lesiones de entrenamiento con intensidad | MER-6.2 | Intensidad fuerte ≈ ×2 lesiones de entrenamiento |
| MER-T43 | Amarillas, rojas y suspensiones | MER-6.4 | 5 amarillas ⇒ 1 fecha afuera |
| MER-T44 | Infiltrado | MER-6.5 | 30 % de agravar en 10.000 casos |

## F. Contratos

| ID | Tarea | Req. | Se verifica con |
|----|-------|------|-----------------|
| MER-T50 | Renovación con pedido, aceptación y "no renueva" | MER-8.3 | Tres negativas ⇒ bandera `noRenueva` |
| MER-T51 | Vencimientos ⇒ libres, con noticia | MER-8.4 | Contrato vencido en semana 52 ⇒ `club: 'libre'` en semana 1 |
| MER-T52 | Rescisión con abogado | MER-8.5 | Costo 50 % del resto (40 % con abogado nivel 1) |
| MER-T53 | Precontratos (ofrecer y recibir) | MER-8.2, 14.2 | El jugador se incorpora al vencer su contrato |

## G. Mercado de pases

| ID | Tarea | Req. | Se verifica con |
|----|-------|------|-----------------|
| MER-T60 | Ventanas: abrir, últimos 3 días, cerrar; interrupción del cierre | MER-9 | Fuera de ventana, `ofertar` compra devuelve motivo |
| MER-T61 | Compra: respuesta del club al día siguiente, contraoferta, paciencia | MER-10.1–10.3 | Casos de la regla de §8.2 |
| MER-T62 | Termómetro con secretario técnico | MER-10.5 | Error del rango según nivel |
| MER-T63 | Negociación con el jugador (atractivo, representante) | MER-10.4 | Un club de la B paga más que uno de Primera por el mismo jugador |
| MER-T64 | Cierre con Efecto de caja y validación de caja | MER-10.6, 21 | Sin caja no cierra; con caja emite un efecto `compras` correcto |
| MER-T65 | Ofertas de la IA por tus jugadores (§8.3), con vencimiento | MER-11.1–11.2 | Transferible recibe ~3× más ofertas (simulación) |
| MER-T66 | Rechazo de oferta grande ⇒ `quiereIrse` y moral | MER-11.3 | Caso de test |
| MER-T67 | Ofertas especiales (`arabia`, `clasico`, `bombazo`) con marca para movidas | MER-11.4 | La oferta queda marcada y emite `marca` |
| MER-T68 | Fichaje de libres en cualquier momento | MER-14.1 | Funciona con ventana cerrada |
| MER-T69 | Préstamos simples (ida y vuelta, `sueldoPct`) | MER-12.1–12.2, 12.4 | Vuelve al dueño al vencer |
| MER-T70 | V1 · Préstamos con cargo y opción | MER-12.3 | Opción obligatoria se ejecuta sola |
| MER-T71 | V1 · Cláusulas (salida, futura venta, bonus, miedo) | MER-13 | La IA paga la cláusula de salida sin negociar |
| MER-T72 | Validaciones de plantel (18–25, 2 ARQ, 6 extranjeros) y completado al cierre | MER-3 | Plantel de 17 al cierre ⇒ aviso y completado |

## H. IA de los rivales

| ID | Tarea | Req. | Se verifica con |
|----|-------|------|-----------------|
| MER-T80 | Fondos de pases por personalidad y división | MER-15 | Gastador gasta ≈ 1,5× un ordenado en 50 temporadas simuladas |
| MER-T81 | Ciclo diario de ventana (§9.2) con curva de último día | MER-15.1, 9.4 | > 40 % de las operaciones en los últimos 3 días |
| MER-T82 | Operaciones entre rivales resueltas al instante con noticias | MER-15.2 | Sin jugadores duplicados ni en dos clubes |
| MER-T83 | Mantener planteles rivales 18–28 con 2 ARQ | MER-15.3 | Invariante tras 10 temporadas |
| MER-T84 | V1 · Calesita de DTs | MER-15.4 | Presidente loco echa ≈ 2,5× más |

## I. DTs y staff

| ID | Tarea | Req. | Se verifica con |
|----|-------|------|-----------------|
| MER-T90 | Pool de DTs, contratación con requisitos de fama y división | MER-18.1, 18.4 | Nivel 5 no acepta a un club de la B |
| MER-T91 | Bonus por estilo y nivel aplicados en evolución, moral y `bonusDT` | MER-18.2 | Tabla de §11 |
| MER-T92 | Contrato por fechas o temporadas, rescisión 50 % | MER-18.3 | Caso de test |
| MER-T93 | Humor del DT y banderas para movidas | MER-18.6 | Cinco derrotas seguidas ⇒ `pideRefuerzos` |
| MER-T94 | Utilero fijo desde el inicio | MER-17.6 | Existe en toda partida nueva |
| MER-T95 | V1 · Staff: candidatos, contratación con cupos de `club`, bloqueo por nivel | MER-17.1–17.2, 17.5 | Candidato de nivel 4 con edificio 3 ⇒ bloqueado |
| MER-T96 | V1 · Efectos del staff y `nivelStaff` (0 si el edificio está en obra) | MER-17.3–17.4 | Edificio en obra ⇒ efecto 0 |

## J. Ojeo e inferiores

| ID | Tarea | Req. | Se verifica con |
|----|-------|------|-----------------|
| MER-T100 | Conocimiento y `vistaJugador` con rangos por umbral | MER-16.2 | Con 30 % se ven 3 atributos en rango, el resto oculto |
| MER-T101 | Visibilidad del mercado por nivel de oficina de ojeadores | MER-16.1 | Nivel 0 solo ve libres y transferibles de su división |
| MER-T102 | Conocimiento por partido jugado contra tu equipo | MER-16.3 | +10 % a los titulares rivales |
| MER-T103 | V1 · Misiones de ojeo por región con informes semanales y ojeador chanta | MER-16.4–16.5 | Informes según nivel; sesgo +5 en el chanta |
| MER-T104 | Camada de inferiores (MVP: 2 por temporada) | MER-19.1 | Semana 2 de cada temporada |
| MER-T105 | Promoción y decisión a los 20 | MER-19.2–19.3 | Interrupción al cumplir 20 sin promover |
| MER-T106 | V1 · Pensión completa, coordinador y derechos de formación | MER-19.1, 19.4 | Venta futura paga 5 % al formador |

## K. Integración y mundo

| ID | Tarea | Req. | Se verifica con |
|----|-------|------|-----------------|
| MER-T110 | `iniciar` (mundo completo) | MER-2, 21 | Dos partidas con la misma semilla son idénticas |
| MER-T111 | Ganchos `alAvanzarDia`, `despuesDelPartido`, `alCerrarSemana`, `alCerrarTemporada` según §15 | MER-21 | Test de un año con ganchos llamados en orden |
| MER-T112 | Selectores de §18 (memorizados) | MER-21.4 | `plantel` derivado coincide con un recorrido directo |
| MER-T113 | Efectos, noticias e interrupciones de §19 | MER-21.1–21.3 | Snapshot de salidas en una ventana simulada |
| MER-T114 | `aplicarEfecto` para `jugador` y `temporal` (según respuesta del núcleo) | MER-21 | Efecto `moral −10` baja la moral 10 |
| MER-T115 | Fin de temporada: edad, retiros, regeneración, estabilidad de medias | MER-20 | Media de titulares de la B estable ± 1,5 en 10 temporadas |
| MER-T116 | Poda del guardado (retirados, exterior no visto, historial a 2 temporadas) | MER-21.5 | Guardado < 800 KB tras 10 temporadas |
| MER-T117 | Rendimiento | MER-21.5 | Parte de mercado de una temporada sin pantalla < 1,5 s |
| MER-T118 | Datos mock para la UI (plantel, mercado, DTs) desde el generador | MER-21 | La interfaz puede cargar un estado de ejemplo |
