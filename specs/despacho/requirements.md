# El Despacho (situaciones y decisiones) — Requisitos

Estado: `aprobado` · Prefijo: `DES` · Referencias: `referencias/analisis.md` (Potrero: eventos, botines del utilero, traición, última hora)

## Resumen

El Despacho es el **motor de situaciones** del club, al estilo Potrero pero aplicado a **todo** lo que rodea a un club argentino: el plantel, el cuerpo técnico, los sponsors, la política interna, la AFA, la barra, la ciudad donde está el club, la prensa, la economía y las obras. Te van pasando cosas, decidís como dueño y cada decisión tiene consecuencias, a veces inmediatas y a veces varias fechas después. Es la capa que hace que cada temporada se cuente distinta.

Cada situación llega por un **canal** que le da forma: post o video viral, audio de WhatsApp, llamado, mail, carta documento, reunión, nota de diario, comunicado de AFA, stream.

## Requisitos

### DES-0 · Ámbitos — MVP
EL SISTEMA DEBE generar situaciones de todos estos ámbitos, y cada situación declara el suyo:

| Ámbito | Qué cubre |
|--------|-----------|
| **Plantel** | Joda, tatuajes, lesiones, peleas en el vestuario, cábalas, rendimiento, renovaciones, representantes |
| **Cuerpo técnico y staff** | DT que pide refuerzos o renuncia, choques de egos, staff que se va o pide aumento |
| **Sponsors y negocios** | Ofertas, rescisiones, sponsors que quiebran o se meten en escándalos, naming rights, merchandising trucho |
| **Hinchas y barra** | Pedidos de la barra, banderazos, socios enojados, entradas, violencia, ídolos que vuelven |
| **Política institucional** | Comisión directiva, elecciones, oposición, asambleas de socios, estatuto, SAD, auditorías, renuncias |
| **AFA y torneo** | Sanciones, árbitros, fixture y horarios, derechos de TV, votaciones en AFA, cambios de formato |
| **Ciudad y región** | Intendencia, vecinos, clima, recitales en el estadio, operativos de seguridad, terrenos, rivalidad local, economía regional |
| **Prensa y redes** | Periodistas, filtraciones, viralizaciones, streamers, deepfakes, community manager |
| **Economía** | Inflación, devaluación, deudas, embargos, cheques, pagos atrasados, préstamos |
| **Obras e infraestructura** | Imprevistos de obra, clausuras, habilitaciones, cortes de luz, la cancha inundada |
| **Mercado** | Ofertas por jugadores, Arabia, el clásico rival, juveniles que se quieren ir, representantes |
| **Inferiores** | Pibes que la rompen, padres, pensión, captación de otros clubes |

### DES-1 · Las oficinas y sus situaciones — MVP
0. EL SISTEMA DEBE representar el Despacho como **las oficinas del club**, un edificio de la villa que muestra cuántas situaciones hay pendientes y se mejora como los demás (más nivel = más staff de oficina: abogado, contador, asesor de prensa).
1. EL SISTEMA DEBE mostrar las situaciones en una lista con su ámbito, su canal, el protagonista (persona o institución ficticia) y si están pendientes de decisión.
2. EL SISTEMA DEBE mostrar cada situación con la forma de su canal (video vertical, tuit, audio de WhatsApp, carta documento, comunicado, nota de diario…), dibujada con el estilo visual del juego y sin logos reales.
3. EL SISTEMA DEBE permitir filtrar por ámbito y por pendientes.
4. EL SISTEMA DEBE mostrar un contador de pendientes en el HUD.

### DES-2 · Decisiones con consecuencias — MVP
1. CUANDO abro una situación con decisión, EL SISTEMA DEBE ofrecer de 2 a 4 opciones con texto corto y con sabor.
2. CUANDO elijo una opción, EL SISTEMA DEBE aplicar sus efectos y mostrar un desenlace corto.
3. EL SISTEMA DEBE permitir que los efectos toquen: jugadores (atributos, físico, moral), plata, fama, **relaciones** (hinchas, barra, socios, comisión directiva, AFA, municipio, prensa, sponsors, plantel), obras, sponsors y **efectos temporales** sobre las próximas N fechas.
4. EL SISTEMA DEBE permitir **efectos ocultos o con probabilidad** (ej. el tatuaje "se puede infectar": 20 % de perderse la final).
5. SI una situación vence y no decido a tiempo, ENTONCES EL SISTEMA DEBE aplicar la opción por defecto ("lo dejaste pasar").

### DES-3 · Disparadores — MVP
1. EL SISTEMA DEBE elegir situaciones según condiciones: momento de la temporada (pretemporada, previa de clásico o final, mercado de pases, elecciones del club, fin de temporada), resultados, posición en la tabla, plata, relaciones, personalidad de los jugadores, sponsors activos, edificios, staff y **ambientación del club** (DES-8).
2. EL SISTEMA DEBE evitar repetir la misma situación dentro de una ventana configurable.
3. EL SISTEMA DEBE dosificar: entre 1 y 3 situaciones por fecha, mezclando ámbitos.

### DES-4 · Cadenas — V1
1. EL SISTEMA DEBE permitir que una decisión habilite situaciones de seguimiento (ej. tatuaje → se infecta → ¿jugás infiltrado la final?; barra → aprietan al DT → sanción de AFA).
2. EL SISTEMA DEBE guardar **marcas** (flags) por jugador y por club para usarlas como condiciones más adelante.

### DES-5 · Situaciones como datos — MVP
1. EL SISTEMA DEBE cargar las situaciones desde archivos de datos (JSON), no desde código, organizados por ámbito.
2. EL SISTEMA DEBE validar cada situación contra un esquema al cargarla y avisar los errores.
3. EL SISTEMA DEBE soportar variables en los textos (`{jugador}`, `{rival}`, `{sponsor}`, `{club}`, `{ciudad}`, `{intendente}`, `{presidente_afa}`).

### DES-6 · Staff y edificios mitigan — V1
1. MIENTRAS tengo asesor de prensa o community manager, EL SISTEMA DEBE ofrecer opciones extra o suavizar el daño de escándalos.
2. MIENTRAS tengo psicólogo, EL SISTEMA DEBE reducir la caída de moral.
3. MIENTRAS tengo abogado o contador (staff de la sede), EL SISTEMA DEBE ofrecer opciones extra en situaciones de AFA, economía y política.

### DES-7 · Ofertas y tentaciones — V1
1. EL SISTEMA DEBE generar ofertas: jugador tentado por Arabia o por el clásico rival ("traición"), sponsor de casa de apuestas, fondo de inversión que quiere comprar el club (SAD), streamer que quiere hacer contenido en el vestuario, recital en el estadio.

### DES-8 · La ambientación del club — MVP
1. AL crear el club, EL SISTEMA DEBE dejarme elegir su **ambientación**: tamaño del lugar (barrio de gran ciudad, ciudad mediana, pueblo, puerto) y **paisaje y clima** (llanura, conurbano, costa, montaña y altura, nieve y frío extremo, trópico, desierto…).
2. La ambientación NO DEBE estar limitada a Argentina como país: el universo del juego tiene sabor del fútbol argentino, pero el club puede estar en una montaña andina o en un invierno tipo ruso.
3. EL SISTEMA DEBE usar la ambientación para habilitar situaciones propias (nevada que tapa la cancha, altura que ahoga a los visitantes, inundación en la costa, temporada turística, la fábrica del pueblo que cierra, el intendente que quiere sacarse la foto).
4. EL SISTEMA DEBE usar la ambientación para el paisaje del club y para los estilos de estadio disponibles al principio (CLU-2).

## Banco inicial de situaciones (ideas; se pasan a JSON en el diseño)

| Ámbito | Situación | Opciones (resumen) |
|--------|-----------|--------------------|
| Plantel | **Tinta antes de la final**: {jugador} quiere tatuarse la copa antes de jugarla | Dejarlo (moral ↑, riesgo de infección) · Prohibirlo (moral ↓) · "Que se tatúe el escudo" (hinchas ↑) |
| Plantel | **El TikTok de anoche**: unas chicas subieron un video con {jugador} a las 4 a.m. y ya tiene 2M de vistas | Multarlo · Bancarlo en público · TikTok del club riéndose (fama ↑↑, comisión directiva ↓) |
| Plantel | **Lo cazaron de joda**: el utilero confirma que {jugador} llegó al entrenamiento con la ropa de ayer | Al banco · Que entrene doble · "No vi nada" (plantel ↑, físico ↓) |
| Plantel | **Los botines del utilero**: el utilero dice que los botines están mufados | Te quedás con la corazonada · Cambiás |
| Staff | **El DT pide refuerzos por la radio**: "con este plantel no me alcanza" | Darle plata para un refuerzo · Hacerlo callar (DT ↓) · Echarlo |
| Sponsors | **La casa de apuestas**: "ApostAR" ofrece el pecho por el triple | Aceptar (plata ↑↑, habilita situaciones de amaño) · Rechazar (hinchas ↑) |
| Sponsors | **Cripto en la camiseta**: el exchange que te patrocina "pausó los retiros" | Rescindir · Esperar (50 %: vuelve o desaparece la plata) |
| Hinchas | **La barra pide**: entradas y micros para la final | Dar (Aguante ↑, riesgo de sanción) · Negar (Aguante ↓, cadena) |
| Hinchas | **Banderazo**: los socios quieren banderazo antes del clásico y piden el estadio | Abrir el estadio (Aguante ↑, gasto de seguridad) · No |
| Política | **Elecciones en el club**: la oposición arma lista y te acusa de vaciar el club | Debate público (fama ±) · Adelantar obras para mostrar (plata ↓, socios ↑) · Ignorar |
| Política | **El fondo extranjero**: quiere el 49 % del club (SAD) | Vender (plata ↑↑↑, socios ↓↓) · Llamar a asamblea (cadena) |
| Política | **Asamblea caliente**: los socios rechazan el balance | Pedir cuarto intermedio · Renunciar el tesorero · Imponerlo (socios ↓↓) |
| AFA | **El fixture**: AFA te pone de local un lunes a las 13 h | Protestar (AFA ↓) · Aceptar (recaudación ↓) · Mover a otro estadio |
| AFA | **Sanción**: cayó un objeto en la cancha, quieren cerrarte una tribuna | Apelar con abogado · Aceptar · Hablar "con quien corresponde" en AFA (cadena) |
| AFA | **La votación**: la AFA vota un cambio de formato y necesita tu voto | Votar a favor (AFA ↑, socios ↓) · En contra (AFA ↓) · Abstenerse |
| Ciudad | **El intendente**: {intendente} quiere inaugurar la tribuna nueva y salir en la foto | Dejarlo (municipio ↑, socios ↓) · No (municipio ↓, trabas en obras) |
| Ciudad | **Recital en el estadio**: una banda de cuarteto quiere tocar en tu cancha | Aceptar (plata ↑, césped ↓ dos fechas) · Rechazar |
| Ciudad | **Se inundó la cancha** (club del litoral) | Pedir postergación a AFA · Jugar igual · Jugar en otro estadio |
| Ciudad | **La fábrica cierra**: la fábrica que patrocinaba al club desde 1970 cierra | Bancar a los trabajadores con un evento (hinchas ↑↑, plata ↓) · Buscar otro sponsor |
| Prensa | **Filtración**: un periodista publica el sueldo de {jugador} | Desmentir · Confirmar · Cortarle la acreditación (prensa ↓) |
| Prensa | **Deepfake**: circula un video falso de {jugador} hablando mal del DT | Desmentir con video · Ignorar · Demandar |
| Economía | **Devaluación**: el dólar saltó y los contratos en dólares se duplicaron | Renegociar (plantel ↓) · Pagar (plata ↓↓) · Vender a alguien |
| Economía | **Embargo**: un ex jugador te embarga la recaudación por una deuda vieja | Pagar · Arreglar en cuotas · Ir a juicio (cadena) |
| Obras | **Imprevisto de obra**: apareció una napa debajo de la tribuna nueva | Pagar el extra · Frenar la obra 3 fechas · "Tapalo y seguí" (riesgo de clausura) |
| Mercado | **Arabia llama**: ofrecen una fortuna por {jugador} | Vender · Retener (moral ↓) · Subirle el sueldo |
| Inferiores | **El pibe**: un club grande quiere llevarse a tu juvenil de 15 años | Firmarle contrato (plata ↓) · Dejarlo ir (derechos de formación) |
| Plantel | **La abuela en la tribuna**: la abuela de {jugador} se volvió viral gritándole al árbitro | Invitarla al palco (fama ↑, hinchas ↑) · Nada |

## Fuera de alcance
- Contenido sexual explícito. Las situaciones de joda se resuelven con elipsis y humor.
- Situaciones sobre personas reales (dirigentes, políticos y periodistas son ficticios).

## Decisiones tomadas
- **D1 (2026-10-07) · Sos el dueño.** Las situaciones le pasan a un jugador o al club y vos decidís como dueño. Cada situación declara `alcance` (`jugador` | `club`) y `ambito` (DES-0). Las de primera persona quedan para `specs/carrera-jugador`.
- **D2 (2026-10-07)** Las situaciones se ilustran con **plantillas** (avatar + ícono + fondo + sello del canal), alineado con el arte intermedio.
- **D3 (2026-10-07)** Tono: alcohol, apuestas y boliches **mencionados con humor y con consecuencias**, nunca glorificados ni gráficos.
- **D4 (2026-10-07) · Situaciones de todo el club**, no solo de jugadores: sponsors, política institucional, AFA, ciudad, economía, obras… → DES-0, DES-8.

- **D5 (2026-10-07) · Se llama "El Despacho"** y son **las oficinas del club**: un edificio de la villa al que llegan las situaciones (reemplaza el nombre "Muro", que venía de Facebook).
- **D6 (2026-10-07) · La ambientación no está atada a Argentina como país.** El club pertenece a un universo futbolero de sabor argentino, pero puede estar en la montaña, en un invierno nevado tipo Rusia, en el trópico, etc. → DES-8.

## Preguntas abiertas
Ninguna bloqueante.
