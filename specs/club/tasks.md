# Club — Tareas

Estado: `borrador` (se ejecutan cuando `design.md` esté `aprobado` y estén resueltos los pedidos bloqueantes N1 y N2) · Dueño: agente `club`

Convenciones: cada tarea es chica, cita los requisitos que cubre y se cierra cuando pasa su verificación. Código en `src/modulos/club/`, datos en `src/datos/club/`, tests en `tests/modulos/club/`. La escena 3D (bloque J) es fase 5, con el coordinador.

## A · Tipos, datos y validación

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| CL-01 | `tipos.ts`: identificadores, `EstadoClub`, `Obra`, `Identidad`, sponsors, `Def*`, `ModificadoresClub`, `AccionClub` (design §9) | CLU-2, 3, 4, 8, 9, 13 | `npm run typecheck` en verde |
| CL-02 | `esquemas.ts`: esquemas Zod de todos los JSON de `src/datos/club/` y cargador `cargarDatosClub()` que junta errores con ruta | CLU-2.1, CLU-13.5 | Test: un JSON roto da un error con archivo y campo; los válidos cargan |
| CL-03 | `categorias.json` y `ranuras.json` (cat. 1–6, ranuras habilitadas, huella, lujo base, salto, cupos) | CLU-2.1, 2.3 | Test: ranuras por categoría = 7 / 12 / 15 / 17 / 18 / 19 |
| CL-04 | `piezas/c1.json`, `c2.json`, `c3.json` con el catálogo de §1.8 (sin precios) | CLU-2.1 | Test de catálogo: cada ranura habilitada en cat. 1–3 tiene ≥ 2 piezas válidas por estilo MVP |
| CL-05 | `estilos.json` con `ascenso` y `europeo` completos (modificadores, kit, desbloqueo) y los otros 7 como `mvp: false` | CLU-2.1, 2.2 | Test: los 9 estilos validan; solo 2 desbloqueados al inicio |
| CL-06 | Test cruzado con economía: cada id de pieza, salto y edificio tiene precio y fechas en `src/datos/economia/obras.json`, dentro del rango de su categoría | CLU-2.1, CLU-3.1 | Test en verde (depende del pedido E1) |

## B · Estadio: cálculos y reglas

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| CL-07 | `estadio/calculos.ts`: `capPieza`, `capacidad` (nominal y habilitada, por tipo), redondeo a 50 | CLU-2.4 | Test: estado inicial = 2.200 (ascenso) / 1.700 (europeo); tabla §1.8 reproducida pieza por pieza |
| CL-08 | `lujo`: suma con modificador de estilo, bonus de coherencia ≥ 80 %, lujo base de categoría | CLU-2.4 | Test: cat. 3 de ejemplo da el valor esperado; mezclar un 25 % de piezas ajenas quita el bonus |
| CL-09 | `valor`: estadio (piezas + saltos) y villa (niveles), con precios de economía | CLU-2.4 | Test: el Valor del estado inicial es la suma de los `costoBase` de sus 4 piezas + los niveles de oficinas y entrenamiento |
| CL-10 | `requisitosSalto`: piezas de la categoría actual / ranuras, nivel de club, `ceil(0,7 × ranuras)` | CLU-2.3 | Test: inicial 4/7 no alcanza; con 5/7 y nivel 6 alcanza |
| CL-11 | Clausuras: capacidad habilitada sin la tribuna clausurada; descuento por partido de local | CLU-2.5 | Test: clausura de 2 partidos se va después de dos partidos de local y no con los de visitante |
| CL-12 | `rasgosClub`: entorno + lugar + estadio + villa + sponsors | CLU-13.4 | Test: club en montaña, pueblo, sin luces y con ApostAR incluye `altura`, `pueblo`, `sin_luces`, `apuestas` |

## C · Villa

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| CL-13 | `edificios.json`: los 12 edificios con niveles 1–5, efectos, cupos de staff, desbloqueo (MVP: oficinas, entrenamiento, ojeadores, prensa) | CLU-4 | Valida con Zod; los 4 MVP tienen los 5 niveles completos |
| CL-14 | `nivelMaxEdificio` según la categoría del estadio y `edificioActivo` (falso si está en obra) | CLU-3.4, CLU-4 | Test: con cat. 1 no se puede encolar nivel 3; edificio en obra no está activo |
| CL-15 | `modificadores(club)`: neutros → edificios activos → sponsors → accesos | CLU-4 | Test: entrenamiento nivel 3 da `entrenamiento.progreso` 1,20; en obra vuelve a 1,00 |
| CL-16 | `cuposStaff(club, edificio)` con `nivelMax` = nivel del edificio | CLU-4, CLU-5.2 | Test: oficinas nivel 3 = secretario 1, abogado 1, contador 1, nivel máx. 3 |

## D · Obras y cuadrillas

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| CL-17 | `obras/validar.ts`: `puedeEncolar` con todos los motivos de §4.4 y textos para la UI | CLU-2.3, CLU-3 | Test por motivo (categoría, nivel, lado, requiere, salto en curso, cola llena, conflicto de ranura) |
| CL-18 | Acciones `obra/encolar`, `obra/cancelar`, `obra/reordenar` en `reducir` | CLU-3 | Test: la cola respeta el orden; cancelar en cola la saca |
| CL-19 | Arranque de obras: cuadrillas libres (oficinas + temporales), anticipo del 50 % con la caja de economía, espera si no alcanza | CLU-3.3 | Test: con 1 cuadrilla, la 2.ª obra arranca recién cuando termina la 1.ª; sin plata queda en cola con noticia |
| CL-20 | Avance: una fecha por partido oficial (`despuesDelPartido`) y una por semana sin partido (`alCerrarSemana`); obras frenadas no avanzan | CLU-3.1, 3.2 | Test: 3 partidos = 3 fechas; 4 semanas de receso = 4 fechas; amistoso no cuenta |
| CL-21 | Fin de obra: aplica el objetivo, saldo del 50 %, XP, noticia, marca, libera cuadrilla y arranca la siguiente | CLU-3 | Test: tribuna terminada cambia la capacidad y emite los efectos esperados |
| CL-22 | Salto de categoría: bloquea obras de estadio, penalización de capacidad, al terminar sube categoría, habilita ranuras y emite inauguración | CLU-2.3 | Test: durante el salto la capacidad es × 0,75 y no se puede encolar una pieza |
| CL-23 | Reestilo de pieza y cambio de estilo principal (obra agrupada) | CLU-2.2 | Test: el estilo de la pieza cambia al terminar; los números base no |
| CL-24 | Aplicación de efectos entrantes `obra` (atrasar/adelantar por id, ranura, edificio, `estadio`, `*`) y, cuando exista, `club` | CLU-3, DES-2.3 | Test: `{ obra, edificio: 'estadio', fechas: 2 }` atrasa todas las obras de estadio |

## E · Nivel y XP

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| CL-25 | `nivel.json` y `nivel.ts`: curva `50·n·(n−1)`, fuentes de XP, subida de nivel con noticia y desbloqueo de lotes | CLU-1.4, CLU-2.3 | Test: 1.500 XP = nivel 6; pasar de nivel desbloquea el lote correspondiente |

## F · Entornos e identidad

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| CL-26 | `entornos.json` (ciudad, campo, montaña completos; resto `mvp: false`) y `lugares.json` | CLU-13.1, 13.5 | Validan; cada entorno usa solo capas existentes |
| CL-27 | Acción `ambientacion/mudar`: enfriamiento de una temporada, efectos de costo y relaciones, marca `club.mudanza`, sin tocar estadio ni villa | CLU-13.2 | Test: estadio y villa idénticos antes y después; segunda mudanza en la misma temporada rechazada |
| CL-28 | `identidad.json` + `escudoSVG(escudo, colores)` | CLU-8.1 | Test: cada forma × partición produce SVG válido; snapshot de 3 combinaciones |
| CL-29 | `pintarCamiseta(lienzo, camiseta, sponsors, cara)` (módulo compartido UI/escena) | CLU-8.2, 8.3 | Prueba manual en la página de muestras + snapshot del canvas en test con `canvas` simulado |
| CL-30 | `identidadAlAzar(rng)` con contraste mínimo entre colores y acción `club/crear` | CLU-8, INT-6.2 | Test: 1.000 sorteos sin pares de colores de bajo contraste; misma semilla = misma identidad |

## G · Sponsors

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| CL-31 | `marcas.json` (8 marcas ficticias, una por rubro) y `ofertas.json` | CLU-9.3 | Validan; revisión manual de que ningún nombre ni logo-texto es de una marca real |
| CL-32 | Generación de ofertas en `alCerrarSemana` (requisitos, exclusividad de rubro, máximo 3, vencimiento 14 días, pecho/naming interrumpen) | CLU-9.2 | Test determinista: misma semilla = mismas ofertas; nunca dos de la misma marca a la vez |
| CL-33 | Acciones `sponsor/aceptar`, `rechazar`, `rescindir` con efectos al firmar y multa | CLU-9.2 | Test: aceptar Yerba La Patrona emite hinchas +5 y socios +3; rescindir emite multa y sponsors −5 |
| CL-34 | Cláusulas al cerrar temporada (`rescinde_si`, `bonus_si`, vencimiento, renovación preferente) | CLU-9.2 | Test: con descenso, el contrato con `rescinde_si desciende` se cae con noticia de importancia 3 |
| CL-35 | Espacios disponibles por categoría (carteles y naming desde cat. 4) | CLU-9.1 | Test: cat. 2 ofrece 4 carteles y no ofrece naming |

## H · Módulo y selectores

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| CL-36 | `modulo.ts`: `iniciar` con el estado de §1.9 y §10, y los ganchos del ciclo | NUC-3, CLU-1 | Test con partida falsa: el orden de ganchos y los efectos esperados en una semana tipo |
| CL-37 | `selectores.ts` con la API de §8 | CLU-2.5, CLU-4 | Test: cada selector sobre el estado inicial devuelve lo esperado |
| CL-38 | Test de porción: ningún gancho ni acción del club modifica otra porción (partida congelada) | NUC-3.3 | Test en verde |
| CL-39 | Política automática para la simulación sin pantalla: elegir obras y sponsors "razonables" | NUC-7 | Una temporada sin pantalla construye al menos 5 obras y firma pecho |

## I · Vista pura

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| CL-40 | `vista.ts`: `vistaClub(partida)` según §12.2 (piezas con componente y kit, ranuras vacías, villa, entorno, identidad, carteles, ocupación) | CLU-1, 2.6 | Test: estado inicial = 4 piezas, 3 ranuras vacías, 4 lotes MVP; misma entrada = misma salida |
| CL-41 | `mapa.json`: layout del estadio, lotes de la villa, calles y límites de cámara | CLU-1.1 | Test: ningún lote se superpone con la huella reservada del estadio ni con otro lote |

## J · Escena 3D (fase 5, con el coordinador)

| # | Tarea | Cubre | Verificación |
|---|-------|-------|--------------|
| CL-42 | `geometria/`: superelipse, `anillo`, extrusión de perfil por tramo de lado | CLU-2.6 | Página de muestras: las 4 tribunas de `c2_popular_alta` cierran sin huecos ni solapes |
| CL-43 | `materiales/`: kits ascenso y europeo → materiales; texturas de grada con ocupación y patrón de butacas | CLU-2.6, 2.7 | Captura comparada con `referencias/mockups/predio-europeo.png` (europeo) |
| CL-44 | Componentes del estadio: `tribuna.perfil`, techos, luces, pantalla, palcos, fachada, cancha, accesos, servicios + adornos de los dos kits | CLU-2.6 | Página de muestras con todas las piezas de cat. 1–3 en ambos estilos |
| CL-45 | `EstadioVista` con reconciliación por clave y `liberar` | CLU-2.6 | Test en navegador: terminar una obra reconstruye solo su ranura (contador de objetos creados) y no pierde memoria en 100 cambios |
| CL-46 | Terreno preparado entre huella actual y reservada | CLU-1.2 | Captura del estado inicial revisada por el usuario: "lindo y prolijo, no vacío" |
| CL-47 | `VillaVista` con edificios paramétricos por nivel, lotes vacíos y bloqueados; ciudad deportiva por nivel | CLU-1.1, 1.3, CLU-4 | Captura de la villa en niveles 1, 3 y 5 |
| CL-48 | `EntornoVista` por capas: ciudad, campo y montaña | CLU-13 | Capturas de los 3 entornos con el mismo estadio; cambiar de entorno no reconstruye el estadio |
| CL-49 | Cámara: pan, zoom, límites, encuadre inicial que muestra estadio y villa completos, `volarA`, toma héroe | CLU-1.1, INT-3.2 | Prueba manual a 1280×720 y 1920×1080: arranca mostrando todo sin cortes |
| CL-50 | Obras a la vista (vallas, andamios, grúas, salto) y etiquetas con fechas restantes | CLU-3.1, INT-3.3 | Captura con una tribuna y un edificio en obra |
| CL-51 | Selección por raycast y vista previa (fantasma) de una pieza | CLU-1.3, CLU-2.6 | Prueba manual: tocar la tribuna sur abre su sector; la vista previa no cambia el estado |
| CL-52 | Rendimiento: render a pedido, calidad alta/media/baja, presupuesto de llamadas de dibujo | — | Medición: < 300 llamadas de dibujo y 60 fps en calidad alta en la PC del usuario |
| CL-53 | Camiseta y sponsors en la escena: carteles perimetrales, naming en fachada, trapos y banderas | CLU-8.3, CLU-9 | Captura con 3 sponsors y 2 trapos |
