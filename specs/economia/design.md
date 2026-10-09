# Economía — Diseño

Estado: `aprobado` (2026-10-09, con las respuestas del usuario; los números se recalibran con simulaciones) · Cubre: ECO-1 a ECO-6 · Todos los números van a `src/datos/economia/*.json` y se ajustan con simulaciones (NUC-7).

## 1. Escala y moneda

- **Pesos** con números grandes, a la argentina. En pantalla se abrevian: `$ 1.245M`, `$ 18,4M`.
- **Fama**: seguidores del club. Arranca en ~5.000 para un club de la B.
- Referencia de tamaño (temporada 1, sin inflación):

| | Club típico de la B Nacional | Club típico de Primera |
|---|---|---|
| Ingresos por año | ~ $ 1.200M | ~ $ 6.000M |
| Sueldos del plantel por año | ~ $ 650M (55 %) | ~ $ 3.300M (55 %) |
| Caja inicial (partida nueva) | $ 150M | — |

## 2. Fuentes de ingresos

| Concepto | Cómo se calcula | Cuándo se cobra |
|----------|-----------------|-----------------|
| **Recaudación** | `asistencia × precio entrada`. Asistencia = mín(capacidad, demanda). Demanda = base de la división (B 6.000 · Primera 25.000) × factor fama × factor momento (racha, posición) × 1,5 si es clásico. Precio base: B $ 5.000 · Primera $ 12.000 | Cada partido de local |
| **Buffet / parrilla** | asistencia × $ 800 × nivel de la parrilla | Cada partido de local |
| **TV** | B $ 15M por fecha · Primera $ 80M por fecha · copas aparte | Cada fecha |
| **Sponsors** | Contrato por temporada, pagado en 4 cuotas. Pecho B $ 150–400M · Primera $ 800M–2.500M. Manga, espalda, short y carteles: 10–30 % del pecho. Naming rights del estadio: desde categoría 4 | Trimestral |
| **Merchandising** | fama × $ 40 × nivel de la tienda oficial, por semana | Semanal |
| **Premios** | Victoria: B $ 4M · Primera $ 15M. Ascenso $ 500M. Campeón de Primera $ 2.000M. Copa nacional y continental: premio por ronda | Al ocurrir |
| **Ventas de jugadores** | Valor negociado (lo define `mercado`) | En ventanas de pases |
| **Movidas** | Recitales, eventos, ofertas, golpes de suerte | Variable |

## 2b. Precio de las entradas (lo maneja el usuario)

El usuario fija el precio de cada sector antes de cada partido de local (o deja el automático).

| Sector | Precio de referencia B / Primera | Sensibilidad al precio |
|--------|----------------------------------|------------------------|
| Popular | $ 5.000 / $ 12.000 | alta (1,3) |
| Platea | $ 12.000 / $ 35.000 | media (0,8) |
| Palcos y hospitality | $ 60.000 / $ 250.000 | baja (0,5) |

- **Demanda por sector** = demanda base × (precio de referencia / precio)^sensibilidad × fama × momento × clásico.
- **Cara:** la gente no va. Tribunas vacías, baja el Aguante, bajan la relación con los hinchas y los socios, y aparecen movidas ("la gente no va más", banderazo en contra, la prensa te mata).
- **Barata:** la demanda supera la capacidad y se arma la **sobreventa**. Sube el Aguante, suben los hinchas, pero crece el riesgo de incidentes (avalancha, gente colgada del alambrado). Eso puede terminar en multas, clausura de una tribuna por fechas o una movida de la AFA. Cuanto más pasada la sobreventa, más riesgo.
- **Justa:** estadio lleno sin sobreventa. Es el punto que tiene que encontrar el usuario, y se mueve con la inflación y con el momento del equipo.
- Los **precios de referencia** se actualizan con la inflación (§8), así que un precio que hoy es justo en tres meses es regalado.

## 3. Gastos (sumideros)

| Concepto | Cómo se calcula | Cuándo se paga |
|----------|-----------------|----------------|
| **Sueldos del plantel** | Contrato mensual de cada jugador (lo define `mercado`); B en promedio $ 2,2M por jugador al mes | Semanal (mensual / 4,33) |
| **Staff y DT** | Staff $ 0,5–3M al mes según nivel. DT: B $ 3–15M · Primera $ 15–80M al mes | Semanal |
| **Obras** | Ver §4 | Al iniciar la obra (50 %) y al terminarla (50 %) |
| **Mantenimiento** | 0,1 % por semana del **Valor** total construido (estadio + villa) | Semanal |
| **Impuestos y aportes a la AFA** | B 5 % · Primera 8 % · los 5 clubes de mayor ingreso 12 %, sobre ingresos | Mensual |
| **Compras de jugadores** | Precio de la transferencia (lo define `mercado`) | En ventanas de pases |
| **Multas y sanciones** | Por movidas (barra, incidentes, deudas) | Al ocurrir |
| **Intereses** | Préstamos (§6) | Mensual |

## 4. Precios de obras (temporada 1)

### Estadio

| Categoría | Pieza típica (una tribuna, techo, luces…) | Duración de la pieza | **Salto a la categoría** | Duración del salto |
|-----------|-------------------------------------------|----------------------|--------------------------|--------------------|
| 1 → 2 | $ 20–60M | 1–2 fechas | $ 400M | 6 fechas |
| 2 → 3 | $ 80–200M | 2–3 fechas | $ 1.500M | 10 fechas |
| 3 → 4 | $ 300–800M | 3–4 fechas | $ 4.000M | 15 fechas |
| 4 → 5 | $ 1.000–2.500M | 4–6 fechas | $ 10.000M | 20 fechas |
| 5 → 6 | $ 3.000–6.000M | 6–8 fechas | $ 25.000M | 30 fechas |

El salto de categoría pide tener al menos el 70 % de las piezas de la categoría actual. Se puede financiar con caja, naming rights, préstamo o movidas (inversores, el intendente, un fondo).

### Villa

Costo del nivel `n` de un edificio = `base × 1,8^(n−1)`. Duración: `n` fechas.

| Edificio | Base (nivel 1) | Nivel máx. MVP |
|----------|----------------|----------------|
| Parrilla, tienda oficial | $ 10M | 5 |
| Cancha de entrenamiento, ojeadores, prensa | $ 15M | 5 |
| Gimnasio, departamento médico, consultorio | $ 20M | 5 |
| Pensión / inferiores | $ 25M | 5 |
| Sede (el Despacho) | $ 40M | 5 |

Ejemplo: cancha de entrenamiento nivel 3 = 15 × 1,8² ≈ $ 49M, 3 fechas de obra.

## 5. Fama

- **Sube** con victorias (+0,5 %), goles lindos y highlights, ascensos (+30 %), títulos (+50 %), movidas virales, prensa y redes de nivel alto.
- **Baja** con derrotas seguidas, escándalos mal manejados y un desgaste lento (−0,3 % por semana sin novedades).
- **Sirve para:** requisitos de sponsors, demanda de entradas, merchandising y que los jugadores y DTs buenos acepten venir.

## 6. Préstamos y quiebra (sin game over)

- **Préstamo bancario:** hasta el 50 % de los ingresos del último año, a tasa = inflación + 10 %, en 12 cuotas.
- **Caja en rojo:** si la caja baja de 0 se habilita el descubierto (hasta −10 % de los ingresos anuales) con intereses altos.
- **Quiebra:** si la caja baja de −20 % de los ingresos anuales, arranca la cadena de movidas **Concurso de acreedores** (vender figuras, aceptar una gerenciadora, préstamo de un fondo con condiciones, intervención de la AFA con quita de puntos). Nunca termina la partida.

## 7. Anti bola de nieve y red de contención

- El mantenimiento crece con el Valor construido, y los jugadores piden más sueldo en un club con mucha fama.
- Impuesto progresivo (5 % / 8 % / 12 %).
- **Paracaídas:** el que desciende cobra el 50 % de la TV de Primera durante una temporada.
- **Fondo de ascenso:** $ 500M al ascender, para no llegar a Primera sin plata.

## 8. Inflación y balón (ECO-4)

> **El Balón (BLN)** es la moneda mundial del juego: la usan las transferencias internacionales, las figuras, los sponsors globales y la copa continental. Reemplaza al dólar a propósito (decisión del usuario, 2026-10-09): un mundo futbolero que no gira alrededor de la moneda yanqui. Se abrevia `BLN 40M` ("la cláusula es de 40 millones de balones").

La caja es **solo en pesos** (sin moneda premium ni ahorro en balones), pero hay dos variables que se mueven cada semana y no siempre juntas:

- **Inflación** (precios en pesos), semanal.
- **Balón** (tipo de cambio), semanal.

### Qué sigue a cada una

| Sigue a la **inflación** (en pesos) | Sigue al **balón** (precio en BLN convertido) |
|-------------------------------------|-----------------------------------------------|
| Obras con materiales locales, sueldos de jugadores locales, staff, entradas, buffet, multas, TV local | Fichajes de y hacia el exterior, sueldos de extranjeros y figuras, sponsors internacionales, premios de la copa continental, la parte importada de las obras (pantallas LED, techo retráctil, césped híbrido: entre 20 % y 60 % de su costo) |

### Regímenes (el clima económico del país)

Cada temporada arranca en un régimen y puede cambiar por movidas:

| Régimen | Inflación | Balón | Qué se siente en el juego |
|---------|-----------|-------|---------------------------|
| **Calma** | ~2 % mensual | acompaña | Todo estable |
| **Atraso cambiario** ("todo carísimo en balones") | 3–5 % mensual | ~1 % mensual | Lo local se encarece en balones. Comprar jugadores y equipamiento afuera conviene; vender afuera rinde pocos pesos; los sueldos locales se comen la caja |
| **Devaluación** | se dispara después del salto | salto de 30–100 % en una semana | Vender afuera rinde fortunas en pesos; lo importado (y las deudas en balones) se vuelve impagable. Llega con una movida |
| **Hiperinflación** (movida rara, ~3 % por temporada) | 30–50 % mensual durante 8–12 semanas | corre atrás | Precios que cambian todas las semanas, entradas regaladas si no las actualizás, hinchas y plantel reclamando aumentos |

- TV, entradas de referencia y sponsors locales se actualizan por inflación **con 8 semanas de atraso**: apretón chico, sin romper el poder de compra.
- Los contratos se pueden firmar **en pesos o en balones** (sueldos de figuras, préstamos, sponsors internacionales). En balones, el riesgo cambiario es del club: es una decisión, no un detalle.
- Las noticias y las movidas anuncian los cambios de régimen ("se viene una devaluación", "el balón está planchado", "remarcan precios todos los días").

## 9. Objetivos de balance (ECO-2) y cómo se miden

Se corren 200 partidas de 10 temporadas sin pantalla, con una política automática "razonable", y se mide:

| Métrica | Objetivo |
|---------|----------|
| Fechas entre obras chicas (≤ $ 50M) | 2–3 |
| Fechas entre obras grandes de villa (≥ $ 80M) | 8–10 |
| Temporada en que se asciende (mediana) | 1–2 |
| Temporada en que se llega a estadio categoría 4 | 4–6 |
| Temporada en que se llega a estadio categoría 5 | 6–8 |
| Partidas que entran en concurso de acreedores | < 10 % |
| Diferencia entre el mejor y el peor club de Primera en ingresos | ≤ 6× |

Si alguna métrica se va de rango, se ajustan los JSON, no el código.

## 10. No pay-to-win (regla de diseño)

No existe moneda premium. Si en el futuro hay algo pago, solo puede ser **cosmético o de comodidad sin efecto deportivo**: camisetas, temas, estadios de exhibición, celebraciones. Nunca jugadores, atributos, obras, velocidad de obra, plata del juego ni resultados. Cualquier propuesta que lo rompa se rechaza.

## 11. Datos

```
src/datos/economia/
  base.json          escalas por división, caja inicial, precios de entrada, TV
  obras.json         precios y duraciones de piezas, saltos de categoría y edificios
  premios.json       victorias, ascenso, títulos, copas por ronda
  impuestos.json     tramos y aportes
  inflacion.json     regímenes (calma, atraso, devaluación, hiper), probabilidades y atraso de actualización
  balon.json         tipo de cambio inicial y dinámica por régimen; qué conceptos se valúan en BLN
  entradas.json      precios de referencia y sensibilidad por sector, umbrales de sobreventa
  prestamos.json     límites y tasas
```

## Decisiones del usuario (2026-10-09)
- **D1** Números grandes, realistas y hasta un poco inflados ($ 1.245M). Se mantiene la escala de §1.
- **D2** El precio de la entrada lo maneja el usuario por sector: cara = no va nadie, barata = sobreventa con riesgo (§2b). Pasa a MVP.
- **D3** Inflación con regímenes, incluida la **hiperinflación** como movida rara y el **atraso cambiario** ("todo caro en balones", como hoy en Argentina) (§8).
- **D4 (2026-10-09)** La moneda mundial es el **Balón (BLN)**, no el dólar. La caja del club sigue en **pesos**; el Balón es la referencia para todo lo internacional.
