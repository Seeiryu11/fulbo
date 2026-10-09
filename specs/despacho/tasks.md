# El Despacho y las Movidas — Tareas

Estado: `borrador` (depende de que se apruebe `design.md`) · Prefijo de tarea: `MOV-T` · Cada tarea cita los requisitos que cubre y se cierra con su verificación.

**Bloqueos externos:** las tareas marcadas con [N1], [N2], [N3], [N5] esperan esos pedidos al núcleo (`design.md` §14). Mientras tanto se pueden programar contra un núcleo falso en los tests.

## A. Tipos, esquema y carga

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| MOV-T01 | Tipos de la porción `movidas` y de `MovidaDef` / `InstanciaMovida` / `EfectoDato` (design §2, §3) en `src/modulos/movidas/tipos.ts` | DES-5 | Compila; los tipos coinciden con el diseño |
| MOV-T02 | Esquema Zod de `MovidaDef`, con enums cerrados (ámbito, canal, etiqueta, ventana, momento, relación, concepto) | DES-5.2 | Test: las 30 movidas de muestra pasan; 10 movidas rotas a propósito fallan con mensaje claro |
| MOV-T03 | Cargador de `src/datos/movidas/*.json` + `_config`, `_elenco`, `_marcas`, `_mitigaciones`, `_balance`, `_prohibidas` | DES-5.1 | Test: carga todo; una movida inválida se descarta y se informa sin romper la carga |
| MOV-T04 | Chequeos cruzados: ids únicos y con prefijo, ámbito = archivo, variables declaradas, `programa` a ids existentes con roles heredables, `soloCadena` alcanzables, lecturas y órdenes existentes [N5][N2] | DES-5.2, DES-4 | Test con casos buenos y malos |
| MOV-T05 | Pasar el lote de muestra de `design.md` §13 a los 12 JSON | DES-0 | MOV-T02/T04 en verde |

## B. Estado y ciclo

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| MOV-T06 | `iniciar`: elenco con rng, institucional, tanda de bienvenida | DES-1, DES-8 | Test: misma semilla ⇒ mismo elenco |
| MOV-T07 | Cálculo de momentos de temporada (design §4.2) con lecturas de tiempo y liga | DES-3.1 | Test por cada momento con partidas armadas a mano |
| MOV-T08 | Evaluador de condiciones (`todas/alguna/no`, `dato`, `marca`, `momento`) sobre el registro de lecturas [N5] | DES-3.1 | Test de tabla de verdad |
| MOV-T09 | Resolución de roles con `filtro`, `prefiere`, `opcional` y anti-repetición de protagonistas | DES-3.1 | Test: el fiestero sale más en joda pero no siempre (10.000 sorteos) |
| MOV-T10 | Algoritmo de tanda (design §4.3): presupuesto semanal 1–3, enfriamiento, grupos, topes, frescura de ámbito, dosis de tono, sin ámbito ni protagonista repetido | DES-3.2, DES-3.3 | Test: en 52 semanas simuladas nunca 0 ni más de 3 por semana (salvo `forzar`), nunca dos del mismo ámbito por tanda |
| MOV-T11 | Movidas de `relleno` cuando el pool queda vacío | DES-3.3 | Test con pool vacío forzado |
| MOV-T12 | Congelar instancia: variables, compilación de efectos con referencias de magnitud, redondeo a 2 cifras, `requiere`/`visibleSi`, pistas, semilla | DES-2, DES-5.3 | Test: mismos datos ⇒ misma instancia; montos escalan entre B y Primera |
| MOV-T13 | Ganchos `despuesDelPartido`, `antesDelPartido`, `alAvanzarDia`, `alCerrarSemana`, `alCerrarTemporada` (design §3.2), con interrupciones para `urgente` y previa | NUC-2.3, DES-2.5 | Test de integración con núcleo falso |
| MOV-T14 | Anulación de instancias con roles que ya no existen | DES-2 | Test: vender al protagonista anula la movida y deja noticia |

## C. Decisión y consecuencias

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| MOV-T15 | `resolver(instancia, opcion)` puro: azar con semilla, desenlace compuesto, separación núcleo / marcas / agenda / noticias | DES-2.2, DES-2.4 | Test: misma decisión ⇒ mismo resultado; probabilidades medidas en 10.000 corridas dentro de ±2 % |
| MOV-T16 | `reducir` (`elegir`, `dejarPasar`, `marcarLeida`) + `trasAccion` que emite la Salida [N1] | DES-2.2, DES-2.5 | Test: elegir cambia plata y relaciones en la partida |
| MOV-T17 | Vencimientos: `previa`, `dias`, `semanas`, `urgente` → opción por defecto | DES-2.5 | Test por cada tipo |
| MOV-T18 | Marcas: fijar, sumar, `dura`, prefijos `club.` / `temporada.` / `j.<id>.`, limpieza al cerrar temporada o al irse el jugador | DES-4.2 | Test |
| MOV-T19 | Agenda de seguimientos: `en` en partidos del club, `p` tirada al disparar, condiciones re-chequeadas, postergación por cupo (máx. 2) | DES-4.1 | Test con la cadena del tatuaje y la de la barra completas |
| MOV-T20 | Mitigaciones de `_mitigaciones.json` aplicadas al congelar, anotadas en la instancia | DES-6 | Test: con psicóloga nivel 3 la caída de moral baja 24 % |
| MOV-T21 | Opciones bloqueadas con motivo (staff, edificio, relación) | DES-6.3 | Test |
| MOV-T22 | Noticias de desenlace, vencimiento y anulación | NUC-5 | Test |

## D. Validación de contenido

| ID | Tarea | Req. | Verificación |
|----|-------|------|--------------|
| MOV-T23 | Valor esperado por eje de cada opción (incluye azar, `implicito`, marcas y seguimientos a 2 niveles) | DES-2 | Test con movidas armadas de valor conocido |
| MOV-T24 | Test de opciones dominantes: error Pareto, avisos de brecha en U, de "sin dilema" y de defecto visible mejor | — | Corre sobre todo `src/datos/movidas`; 0 errores para cerrar cualquier tanda de escritura |
| MOV-T25 | Test de cobertura: mínimos por ámbito, ≥ 6 candidatas por momento, ≥ 4 por entorno MVP, ≥ 30 % buenas, ≥ 10 cadenas | DES-0, DES-8 | Reporte en consola; falla si no se cumple la meta vigente |
| MOV-T26 | Test de tono: largos de texto, palabras prohibidas, juveniles sin etiquetas `joda`/`apuestas`/`violencia` | Tono | Falla con lista de infracciones |
| MOV-T27 | Simulación de 10 temporadas × 200 partidas con 3 políticas (design §9.4): movidas por semana, % buenas, ámbitos, cadenas completadas, impacto neto en plata −8 %…+8 % de ingresos, determinismo | NUC-7 | Reporte con todas las métricas en rango |

## E. Escritura (meta)

Cada tanda de escritura se cierra con MOV-T24, T25 y T26 en verde y una lectura de tono hecha por el coordinador.

| Ámbito | Muestra (hecha) | **Meta MVP** | Meta V1 | Notas para el MVP |
|--------|-----------------|--------------|---------|-------------------|
| Plantel | 4 | **30** | 60 | La mayoría con `{jugador}` para que se reciclen; 1 por rasgo de personalidad como mínimo × 3 |
| Staff | 2 | **12** | 25 | DT (pide, renuncia, choca con un referente), utilero, preparador, psicóloga |
| Sponsors | 3 | **15** | 30 | 1–2 por rubro (cerveza, apuestas, cripto, billetera, yerba, telefonía, corralón, prepaga), cuotas que no llegan |
| Hinchas y barra | 2 | **18** | 35 | Banderazos, socios, ídolos que vuelven, entradas caras o regaladas |
| Política | 3 | **15** | 30 | Elecciones, asambleas, balance, auditoría, estatuto, SAD |
| AFA / federación | 2 | **15** | 30 | Fixture, árbitros, VAR, votaciones, TV, sanciones |
| Ciudad y región | 3 | **18** | 40 | ≥ 4 por entorno MVP (ciudad, campo, montaña) + genéricas de intendente y vecinos |
| Prensa y redes | 2 | **15** | 30 | Filtraciones, streamers, periodista del elenco, community manager |
| Economía | 3 | **15** | 30 | Deudas, embargos, préstamos, crisis de caja, auditorías, sponsors que no pagan, cheques rebotados, sobreventa y entradas caras |
| Obras | 2 | **12** | 25 | Imprevistos, clausuras, habilitaciones, cortes de luz, cancha inundada |
| Mercado | 2 | **15** | 30 | Ofertas de afuera, el clásico, representantes, cláusulas |
| Inferiores | 2 | **10** | 20 | Pibes que la rompen, padres, pensión, captación (solo situaciones deportivas y contractuales) |
| **Total** | **30** | **190** | **385** | ≥ 30 % buenas · ≥ 15 cadenas · ≥ 10 de `relleno` aparte |

| ID | Tarea | Verificación |
|----|-------|--------------|
| MOV-T28 | Tanda 1: plantel, staff, mercado, inferiores hasta la meta MVP | T24–T26 en verde |
| MOV-T29 | Tanda 2: hinchas, política, AFA, prensa | T24–T26 en verde |
| MOV-T30 | Tanda 3: sponsors, economía, obras, ciudad (con las de entorno) | T24–T26 en verde |
| MOV-T31 | 10 movidas de `relleno` y la tanda de bienvenida | T25 en verde |
| MOV-T32 | Pasada de calibración con `economia` (multiplicadores de plata) después de MOV-T27 | Impacto neto dentro de rango |

## F. V1

| ID | Tarea | Req. |
|----|-------|------|
| MOV-T33 | Ventana `entretiempo` con el gancho de `partido` | PAR-10 |
| MOV-T34 | Movidas reactivas a marcas del partido (penal errado, expulsión, gol en el clásico) | DES-3.1 |
| MOV-T35 | Escritura hasta la meta V1 | DES-0 |
