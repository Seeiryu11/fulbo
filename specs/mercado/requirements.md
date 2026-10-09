# Mercado — Requisitos

Estado: `en revisión` · Prefijo: `MER` · Dueño: agente `mercado` · Porción del estado: `mercado`
Origen: mueve y amplía `specs/club/requirements.md` CLU-5 (staff), CLU-6 (plantel), CLU-6c (DTs) y CLU-7 (mercado y ojeadores). CLU-6b (vos sos el dueño y hacés de DT) sigue vigente: la táctica, los titulares, la charla y la cábala son del módulo `partido` (PAR-8); este módulo pone los jugadores, el DT contratado y sus bonus.

## Resumen

El mercado es **la gente del club y del mundo**: los jugadores (tuyos, de los 39 rivales, libres y del exterior), sus contratos, cómo crecen y se rompen, el mercado de pases con sus ventanas, el staff, los DTs, los ojeadores y las inferiores. Tiene que dar dos sensaciones: que **cada jugador es una persona** (nombre, apodo, cara, carácter, historia) y que **el mundo se mueve solo** (los rivales compran, venden, echan DTs, sacan pibes).

## Tabla de origen

| Antes | Ahora |
|-------|-------|
| CLU-6.1, 6.2, 6.3 | MER-1, MER-3 |
| CLU-6.4 | MER-2 |
| CLU-5 | MER-17 |
| CLU-6c | MER-18 |
| CLU-7.1, 7.2 | MER-16 |
| CLU-7.3 | MER-9 a MER-14 |

## Requisitos

### MER-1 · El jugador — MVP
**Historia:** Como dueño, quiero que cada jugador tenga datos claros y algo de carácter, para decidir rápido y encariñarme.
1. EL SISTEMA DEBE representar cada jugador con nombre, apellido, apodo opcional, nacionalidad, edad, posición (ARQ, DEF, MED, DEL), perfil (central, lateral, cinco, enganche, extremo, nueve…), pie hábil, altura y un aspecto para su avatar.
2. EL SISTEMA DEBE darle los atributos **Pegada, Velocidad, Gambeta, Pase, Marca, Físico, Liderazgo y Atajada** en escala 1 a 99 (Atajada es baja en los jugadores de campo).
3. EL SISTEMA DEBE calcular una **media** ponderada según la posición y mostrarla como **estrellas** de 0,5 a 5, como BOLA.
4. EL SISTEMA DEBE darle un **potencial** oculto (techo de media) que solo se ve como un rango estimado.
5. EL SISTEMA DEBE darle de 0 a 2 **rasgos de personalidad**: fiestero, cabulero, influencer, calentón, profesional. Cada rasgo tiene un efecto mecánico chico y dispara movidas del Despacho.
6. EL SISTEMA DEBE llevar el estado que cambia día a día: **energía** (estado físico), **moral** y **forma**, todas de 0 a 100.
7. EL SISTEMA DEBE guardar las estadísticas de la temporada (partidos, minutos, goles, asistencias, nota promedio) y un historial resumido por temporada y club.

### MER-2 · Generación creíble — MVP
**Historia:** Como dueño, quiero que los jugadores parezcan de verdad, con nombres y apodos que suenen a cancha argentina.
1. EL SISTEMA DEBE generar jugadores desde plantillas por perfil, con edad, atributos, potencial, rasgos, valor y sueldo coherentes entre sí y con el nivel del club o del lugar donde aparecen.
2. EL SISTEMA DEBE generar nombres y apodos **ficticios** con sabor argentino (y de cada nacionalidad), desde listas editables.
3. EL SISTEMA DEBE asignar apodos coherentes con el jugador: el "Colo" es pelirrojo, la "Torre" es alto, el "Tucu" es tucumano, el "Galgo" es rápido.
4. EL SISTEMA NO DEBE generar nombres completos ni apodos de futbolistas reales conocidos (lista de exclusión editable).
5. EL SISTEMA NO DEBE usar apodos basados en rasgos étnicos o que puedan leerse como discriminatorios.
6. Con la misma semilla, EL SISTEMA DEBE generar exactamente el mismo mundo.

### MER-3 · El plantel — MVP
1. EL SISTEMA DEBE mantener el plantel profesional del usuario entre **18 y 25 jugadores**, con al menos 2 arqueros.
2. EL SISTEMA DEBE separar las **inferiores** (juveniles sin contrato profesional), que no cuentan para el cupo.
3. EL SISTEMA DEBE limitar los **extranjeros** a 6 por plantel profesional.
4. SI al cerrar una ventana el plantel queda fuera de los límites, ENTONCES EL SISTEMA DEBE avisar y completar con juveniles o libres (o pedir que liberes a alguien) antes del siguiente partido.
5. EL SISTEMA DEBE permitir marcar jugadores como **transferibles** o **intransferibles**, y eso cambia las ofertas que llegan.

### MER-4 · Evolución y entrenamiento — MVP
**Historia:** Como dueño, quiero que mis pibes crezcan si los cuido y mis veteranos se apaguen de a poco, para que el plantel cambie temporada a temporada.
1. EL SISTEMA DEBE hacer evolucionar los atributos **cada semana** según edad, potencial, minutos jugados, rasgos, nivel de la cancha de entrenamiento, staff y DT.
2. EL SISTEMA DEBE hacer crecer más a los jóvenes con margen de potencial, estancar a los de 26–29 y bajar a los mayores de 30, primero en Velocidad y Físico; el Liderazgo puede seguir subiendo.
3. EL SISTEMA DEBE dejar elegir un **foco semanal** (equilibrado, físico, ataque, defensa) y una **intensidad** (suave, normal, fuerte): fuerte acelera la mejora pero gasta energía y sube el riesgo de lesión.
4. EL SISTEMA DEBE mostrar en la ficha cuánto subió o bajó cada jugador en el último mes.

### MER-5 · Energía, moral, forma y efectos temporales — MVP
1. EL SISTEMA DEBE bajar la energía según los minutos jugados y la intensidad, y recuperarla cada día según el gimnasio, el staff y la edad.
2. EL SISTEMA DEBE mover la moral con resultados, minutos, goles, ofertas rechazadas, renovaciones y movidas, con tendencia a volver a un valor neutro.
3. EL SISTEMA DEBE actualizar la forma con la nota de cada partido.
4. EL SISTEMA DEBE mantener un **catálogo de efectos temporales** (resaca, motivado, lesión oculta, infiltrado, distraído, castigado…) con su efecto mecánico, que las movidas aplican por id.
5. EL SISTEMA DEBE exponer los **atributos efectivos** de cada jugador (con energía, moral, forma, efectos, DT y staff ya aplicados) para el motor de partido.

### MER-6 · Lesiones y suspensiones — MVP
1. CUANDO el partido informa una lesión, EL SISTEMA DEBE asignarle gravedad y duración en días, ajustadas por el departamento médico, el kinesiólogo y la fragilidad oculta del jugador.
2. EL SISTEMA DEBE poder producir lesiones de entrenamiento (raras, más probables con intensidad fuerte y energía baja).
3. SI un titular habitual sufre una lesión de más de 3 semanas, ENTONCES EL SISTEMA DEBE frenar el avance con una interrupción.
4. EL SISTEMA DEBE llevar amarillas acumuladas y suspensiones, y marcar al jugador como no disponible.
5. EL SISTEMA DEBE permitir jugar **infiltrado** (por movida o decisión) con riesgo de agravar la lesión.

### MER-7 · Valor y sueldo — MVP
1. EL SISTEMA DEBE calcular el **valor de mercado** según media, edad, potencial, contrato restante, forma y mercado (local o exterior).
2. EL SISTEMA DEBE calcular el **sueldo pedido** según media, edad, rasgos, fama y división del club que lo contrata.
3. EL SISTEMA DEBE expresar todos los valores, sueldos, primas, cláusulas y pases, locales o con el exterior, en la **moneda única mundial** del juego (nombre provisional Áureo, `AU`; ECO §8), sin tipo de cambio ni inflación.
4. EL SISTEMA DEBE hacer que los pases con el exterior sean más caros por el **mercado** (los clubes de afuera pagan y piden más según la región), no por la moneda.

### MER-8 · Contratos y renovaciones — MVP
1. EL SISTEMA DEBE dar a cada contrato sueldo mensual, vencimiento (mitad o fin de temporada), prima de firma y cláusulas.
2. CUANDO a un jugador le quedan 6 meses o menos, EL SISTEMA DEBE permitir que otros clubes le ofrezcan un **precontrato** y avisar al usuario.
3. EL SISTEMA DEBE permitir renovar en cualquier momento con una negociación simple (sueldo, años, prima).
4. SI un contrato vence sin renovar, ENTONCES EL SISTEMA DEBE dejar al jugador **libre** y publicar la noticia.
5. EL SISTEMA DEBE permitir **rescindir** pagando una parte del contrato restante.

### MER-9 · Ventanas de pases — MVP
1. EL SISTEMA DEBE abrir el mercado en la **ventana de verano** (semanas 1–4) y la **de invierno** (semanas 25–28), según el calendario de `specs/nucleo/design.md` §2.
2. MIENTRAS la ventana está cerrada, EL SISTEMA DEBE permitir solo: ojear, seguir jugadores, renovar, rescindir, firmar precontratos y fichar **libres**.
3. EL SISTEMA DEBE avisar la apertura, los últimos 3 días y el cierre, y el cierre DEBE ser un evento que frena el avance rápido (NUC-2.5).
4. EL SISTEMA DEBE concentrar la actividad de la IA en los últimos días de cada ventana ("el último día del mercado").

### MER-10 · Comprar un jugador — MVP
**Historia:** Como dueño, quiero hacer una oferta, regatear un poco y cerrar, sin perder media hora en pantallas.
1. EL SISTEMA DEBE permitir ofertar por cualquier jugador visible: compra definitiva o préstamo (MER-12).
2. CUANDO oferto, EL SISTEMA DEBE devolver la respuesta del club **al día siguiente**: acepta, rechaza o contraoferta con un monto.
3. EL SISTEMA DEBE limitar el regateo a 3 rondas y castigar las ofertas ridículas con pérdida de paciencia (el club deja de atenderte en esa ventana).
4. CUANDO el club acepta, EL SISTEMA DEBE abrir la negociación con el jugador: sueldo, años y prima. El jugador acepta según el atractivo del club (división, fama, minutos que va a tener, ambientación) y su representante.
5. EL SISTEMA DEBE mostrar un **termómetro** de la negociación cuya precisión mejora con el secretario técnico.
6. SI la caja no alcanza para pagar el pase y la prima, ENTONCES EL SISTEMA NO DEBE permitir cerrar la operación.

### MER-11 · Vender y recibir ofertas — MVP
1. MIENTRAS la ventana está abierta, EL SISTEMA DEBE generar ofertas de clubes de la liga y del exterior por jugadores del usuario, según valor, forma, visibilidad y necesidad de los compradores.
2. CUANDO llega una oferta, EL SISTEMA DEBE mostrarla como interrupción con vencimiento: aceptar, rechazar o pedir más (una sola contraoferta).
3. SI rechazo una oferta muy por encima del valor, ENTONCES EL SISTEMA DEBE bajar la moral del jugador y marcarlo como "quiere irse" (dispara movidas).
4. EL SISTEMA DEBE marcar como **especiales** las ofertas de Arabia, del clásico rival y los "bombazos", para que `movidas` las presente como movida.
5. EL SISTEMA DEBE permitir poner un jugador en la vidriera (transferible) para atraer ofertas.

### MER-12 · Préstamos — MVP (simples), V1 (con opción y cargo)
1. EL SISTEMA DEBE permitir pedir y ceder jugadores a préstamo hasta mitad o fin de temporada.
2. EL SISTEMA DEBE definir quién paga qué parte del sueldo.
3. V1: EL SISTEMA DEBE permitir préstamos con cargo y con **opción de compra** (optativa u obligatoria).
4. CUANDO termina el préstamo, EL SISTEMA DEBE devolver al jugador a su club.

### MER-13 · Cláusulas — V1
1. EL SISTEMA DEBE soportar: cláusula de salida (con monto, opcionalmente solo para el exterior), porcentaje de una futura venta, bonus por objetivos y la "cláusula del miedo" en préstamos.
2. CUANDO un club paga la cláusula de salida, EL SISTEMA DEBE cerrar la venta sin negociación con el club dueño.

### MER-14 · Libres y precontratos — MVP
1. EL SISTEMA DEBE mantener un grupo de **jugadores libres** que se pueden fichar en cualquier momento, sin costo de pase.
2. EL SISTEMA DEBE permitir firmar precontrato con jugadores a los que les quedan 6 meses o menos de contrato; se suman al vencer su contrato.

### MER-15 · Los rivales también compran y venden — MVP (simple), V1 (completo)
**Historia:** Como dueño, quiero ver que los otros clubes se arman, se desarman y se pelean por los mismos jugadores que yo.
1. EL SISTEMA DEBE hacer que cada club rival compre, venda, preste y libere jugadores según su **personalidad** (la define `liga`), su necesidad por puesto y su fondo para pases.
2. EL SISTEMA DEBE resolver las operaciones entre clubes de la IA sin intervención del usuario y publicar las importantes en el diario.
3. EL SISTEMA DEBE mantener cada plantel rival entre 18 y 28 jugadores con al menos 2 arqueros.
4. V1: EL SISTEMA DEBE tener la **calesita de DTs**: los rivales echan y contratan técnicos, y los echados quedan disponibles para vos.

### MER-16 · Visibilidad del mercado y ojeadores — MVP (visibilidad), V1 (misiones)
1. EL SISTEMA DEBE mostrar más jugadores y con datos más precisos cuanto más alto el nivel de la **oficina de ojeadores**.
2. EL SISTEMA DEBE llevar un **conocimiento** de 0 a 100 % por jugador ajeno, que revela de a poco posición y estrellas, después atributos en rangos, rasgos, potencial y fragilidad.
3. EL SISTEMA DEBE sumar conocimiento cuando un jugador juega contra tu equipo.
4. V1: CUANDO envío un ojeador a una región con un pedido ("un 9 rápido sub-23"), EL SISTEMA DEBE devolver informes semanales durante la misión.
5. V1: EL SISTEMA DEBE dar a cada ojeador región de especialidad, nivel y, a veces, sesgo (el ojeador chanta que te vende humo).

### MER-17 · Staff — V1
1. EL SISTEMA DEBE permitir contratar staff con nombre, especialidad, nivel (1–5), sueldo y contrato en fechas o temporadas.
2. EL SISTEMA DEBE limitar el nivel del staff al nivel de su edificio y la cantidad a los **cupos** que define `club` por nivel de edificio.
3. MIENTRAS un edificio está en obra, EL SISTEMA DEBE dejar sin efecto a su staff (CLU-3.4).
4. EL SISTEMA DEBE aplicar los efectos del staff a la evolución, la recuperación, las lesiones, la moral, la negociación, el ojeo y las inferiores, y exponerlos para que `movidas`, `club` y `economia` los usen (DES-6).
5. EL SISTEMA DEBE mostrar candidatos que superan el nivel del edificio como bloqueados ("necesitás el gimnasio nivel 3"), como incentivo.
6. EL SISTEMA DEBE incluir desde el arranque al **utilero** del club, un personaje fijo con nombre.

### MER-18 · Directores técnicos — MVP
1. EL SISTEMA DEBE ofrecer DTs ficticios con nombre, apodo, estilo (el Loco, el Profe, el Vasco de la pizarra, el motivador…), nivel (1–5 estrellas), sueldo, prima y contrato en fechas o temporadas.
2. CUANDO contrato un DT, EL SISTEMA DEBE aplicar sus bonus: atributos de un grupo del plantel, moral, efectividad de un estilo de juego, ayuda en minijuegos o evolución de juveniles.
3. EL SISTEMA DEBE permitir un solo DT activo; cambiarlo rescinde el anterior pagando el 50 % de lo que le quedaba.
4. EL SISTEMA DEBE impedir que un DT de nivel alto acepte venir a un club chico (fama y división).
5. EL SISTEMA DEBE publicar los DTs nuevos y los despidos en el diario (CLU-6c.4).
6. EL SISTEMA DEBE exponer el DT, su humor y sus pedidos para las movidas (pide refuerzos, renuncia, choque con un referente).
7. SIN DT contratado, EL SISTEMA DEBE funcionar igual: dirigís vos, sin bonus.

### MER-19 · Inferiores — MVP (camada mínima), V1 (pensión completa)
1. CUANDO arranca la pretemporada, EL SISTEMA DEBE generar una **camada** de juveniles de 15 a 17 años; la cantidad y el potencial dependen del nivel de la pensión y del coordinador de inferiores.
2. EL SISTEMA DEBE dejar promover juveniles al plantel profesional desde los 16 años, firmando su primer contrato.
3. SI un juvenil cumple 20 sin ser promovido, ENTONCES EL SISTEMA DEBE pedir una decisión: promoverlo o dejarlo ir.
4. V1: EL SISTEMA DEBE registrar el club formador y cobrar derechos de formación cuando el jugador se vende más adelante.

### MER-20 · El mundo se renueva — MVP
1. CUANDO termina una temporada, EL SISTEMA DEBE sumar un año a todos, retirar jugadores veteranos según edad y nivel, liberar contratos vencidos y regenerar libres y jugadores del exterior.
2. EL SISTEMA DEBE mantener estable el nivel medio de cada división a lo largo de las temporadas (sin inflación ni sequía de talento).
3. EL SISTEMA DEBE publicar el retiro de jugadores con historia (ídolos, capitanes) y avisar a `movidas`.

### MER-21 · Integración con el núcleo — MVP
1. EL SISTEMA DEBE escribir solo la porción `mercado` y tocar caja, fama y relaciones mediante **Efectos**.
2. EL SISTEMA DEBE emitir noticias para fichajes, ventas, lesiones graves, DTs, informes, ventanas y retiros.
3. EL SISTEMA DEBE frenar el avance con interrupciones para ofertas, respuestas de negociación, lesiones graves y cierre de ventana.
4. EL SISTEMA DEBE exponer lecturas (selectores) para que `partido`, `liga`, `movidas`, `club` y `economia` no recalculen nada de jugadores por su cuenta.
5. EL SISTEMA DEBE simular la parte de mercado de una temporada completa sin interfaz dentro del presupuesto de NUC-7.2.

### MER-22 · Datos editables y ficción — MVP
1. EL SISTEMA DEBE cargar nombres, apodos, perfiles, curvas, valores, lesiones, staff, DTs, regiones y comportamiento de la IA desde JSON en `src/datos/mercado/`, validados con esquema.
2. Todos los jugadores, DTs, staff, representantes y clubes del exterior DEBEN ser ficticios.

## Prioridades

| MVP | V1 | Después |
|-----|----|---------|
| MER-1 a 11, 12 (simple), 14, 15 (simple), 16 (visibilidad), 18, 19 (camada mínima), 20, 21, 22 | MER-12 (opción y cargo), 13, 15 (calesita), 16 (misiones), 17, 19 (pensión) | Pago de pases en cuotas, rasgos extra, entrenamiento individual |

## Decisiones tomadas
- **D1 (2026-10-09)** El módulo `mercado` es dueño de **todos** los jugadores del mundo (tuyos, rivales, libres y exterior), no solo de tu plantel. Un solo dueño evita duplicados (`specs/nucleo/design.md` §9).
- **D2 (2026-10-09)** La táctica y los titulares son de `partido`; `mercado` pone jugadores disponibles, DT y bonus.

## Preguntas abiertas
Ver `specs/mercado/design.md` § "Preguntas para el usuario". Ninguna bloquea el MVP.
