# Economía — Diseño

Estado: `aprobado` (2026-10-09, con las respuestas del usuario; los números se recalibran con simulaciones) · Cubre: ECO-1, ECO-2, ECO-3, ECO-5, ECO-6 · Todos los números van a `src/datos/economia/*.json` y se ajustan con simulaciones (NUC-7).

## 1. Escala y moneda

- **Moneda única mundial** (nombre provisional **Áureo**, ver §8) con números grandes, realistas y algo inflados. En pantalla se abrevian: `AU 1.245M`, `AU 18,4M`.
- **Fama**: seguidores del club. Arranca en ~5.000 para un club de la B.
- Referencia de tamaño (temporada 1):

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
- **Justa:** estadio lleno sin sobreventa. Es el punto que tiene que encontrar el usuario, y se mueve con el momento del equipo, la fama y la categoría del estadio.

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

- **Préstamo bancario:** hasta el 50 % de los ingresos del último año, a una tasa fija del 12 % anual, en 12 cuotas.
- **Caja en rojo:** si la caja baja de 0 se habilita el descubierto (hasta −10 % de los ingresos anuales) con intereses altos.
- **Quiebra:** si la caja baja de −20 % de los ingresos anuales, arranca la cadena de movidas **Concurso de acreedores** (vender figuras, aceptar una gerenciadora, préstamo de un fondo con condiciones, intervención de la AFA con quita de puntos). Nunca termina la partida.

## 7. Anti bola de nieve y red de contención

- El mantenimiento crece con el Valor construido, y los jugadores piden más sueldo en un club con mucha fama.
- Impuesto progresivo (5 % / 8 % / 12 %).
- **Paracaídas:** el que desciende cobra el 50 % de la TV de Primera durante una temporada.
- **Fondo de ascenso:** $ 500M al ascender, para no llegar a Primera sin plata.

## 8. Moneda única mundial (ECO-6)

- Todo el juego usa **una sola moneda mundial**, igual en todos los países y entornos: caja, sueldos, entradas, obras, fichajes, sponsors y premios. Nombre provisional: **Áureo** (`AU 1.245M`); el nombre definitivo lo elige el usuario y se reemplaza en todos lados.
- **Sin inflación ni tipo de cambio** (decisión del usuario, 2026-10-09): simplifica la economía y la hace más legible. Los precios son estables; la progresión la dan la categoría del estadio, la división y la fama.
- Para que no haya bola de nieve sin inflación, siguen valiendo §7 (mantenimiento proporcional al Valor, impuesto progresivo) y los jugadores piden más sueldo a medida que el club crece.

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
  moneda.json        nombre, símbolo y formato de la moneda mundial
  entradas.json      precios de referencia y sensibilidad por sector, umbrales de sobreventa
  prestamos.json     límites y tasas
```

## Decisiones del usuario (2026-10-09)
- **D1** Números grandes, realistas y hasta un poco inflados ($ 1.245M). Se mantiene la escala de §1.
- **D2** El precio de la entrada lo maneja el usuario por sector: cara = no va nadie, barata = sobreventa con riesgo (§2b). Pasa a MVP.
- **D3 (corregida 2026-10-09)** Se **sacan la inflación y el tipo de cambio**: complican mucho. Una sola moneda mundial para todo.
- **D4 (2026-10-09)** Moneda única mundial, no el dólar. "Balón" se descartó por ser muy futbolero; nombre provisional **Áureo** hasta que el usuario elija.
