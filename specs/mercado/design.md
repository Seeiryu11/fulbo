# Mercado — Diseño

Estado: `en revisión` · Cubre: MER-1 a MER-22 · Porción: `mercado` · Contrato: `specs/nucleo/design.md`
Todos los números de este documento son **valores iniciales** que van a `src/datos/mercado/*.json` y se recalibran con las simulaciones de NUC-7 junto con el agente `economia`.

Moneda: **una sola moneda mundial** para todo (nombre provisional **Áureo**, `AU 40M`; `specs/economia/design.md` §8). Sin inflación ni tipo de cambio: un pase al exterior se paga en la misma moneda que uno local. El Efecto de caja del núcleo se sigue llamando `pesos` hasta que el núcleo lo renombre (pedido en §20).

---

## 0. Alcance

| Es de `mercado` | No es de `mercado` |
|-----------------|--------------------|
| Todos los jugadores del mundo (tuyos, de los 39 rivales, libres, exterior, tus inferiores) | Táctica, titulares, charla, cábala (`partido`, PAR-8) |
| Contratos, préstamos, cláusulas, ofertas, negociaciones, historial de pases | Caja, conceptos y balance (`economia`) |
| Evolución, energía, moral, forma, lesiones, suspensiones, efectos temporales | Personalidad y objetivos de los clubes rivales (`liga`) |
| Staff, DTs (tuyo, de los rivales y libres), utilero, representantes | Edificios, niveles y **cupos** de staff (`club`) |
| Ojeo y conocimiento de jugadores ajenos, inferiores | Texto y decisiones de las movidas (`movidas`) |
| Fondos para pases de los rivales (abstracción, ver §9.3) | Fama y relaciones (se tocan con Efectos) |

---

## 1. Modelo de jugador

### 1.1 Atributos (1–99)

| Atributo | Qué representa | Lo usa el motor para |
|----------|----------------|----------------------|
| Pegada | Remate, cabezazo, tiro libre | Definición, pelota parada |
| Velocidad | Pique y velocidad punta | Desbordes, contragolpes, coberturas |
| Gambeta | Conducción y regate | Uno contra uno, retener |
| Pase | Pase corto y largo, visión | Progresión, asistencias |
| Marca | Quite, anticipo, posicionamiento | Recuperación, duelos defensivos |
| Físico | Fuerza y resistencia | Duelos, caída de energía en el partido |
| Liderazgo | Carácter, voz de mando | Moral del equipo en el partido, remontadas |
| Atajada | Arquero: reflejos, achique, salida | Atajadas (jugadores de campo: 5–25) |

Los atributos se guardan con un decimal (la evolución es gradual) y se muestran enteros.

### 1.2 Media y estrellas

Media = suma ponderada por posición (`posiciones.json`):

| Posición | Peg | Vel | Gam | Pase | Marca | Fís | Lid | Ataj |
|----------|-----|-----|-----|------|-------|-----|-----|------|
| ARQ | – | .05 | – | .10 | .05 | .10 | .10 | .60 |
| DEF | .05 | .15 | .05 | .10 | .35 | .20 | .10 | – |
| MED | .05 | .10 | .15 | .30 | .15 | .15 | .10 | – |
| DEL | .35 | .20 | .20 | .10 | – | .10 | .05 | – |

Estrellas (absolutas, para que ascender se note):

| Media | <45 | 45 | 50 | 55 | 60 | 65 | 70 | 75 | 80 | ≥85 |
|-------|-----|----|----|----|----|----|----|----|----|-----|
| ★ | 0,5 | 1 | 1,5 | 2 | 2,5 | 3 | 3,5 | 4 | 4,5 | 5 |

Referencias de nivel: B Nacional media de titulares 57–63 · Primera 63–70 · figura del medio local 74–78 · estrella del exterior 80–90.

### 1.3 Potencial

Número oculto (40–95), techo de la media. Se muestra como rango de estrellas ("potencial: 3 a 4 ★"). El ancho del rango depende del conocimiento (§12) y, para los tuyos, del ayudante de campo: ± (10 − 1,5 × nivel ayudante) puntos de media.

### 1.4 Rasgos de personalidad

0 a 2 por jugador. Incompatibles: profesional + fiestero.

| Rasgo | Prob. base | Ajuste por edad | Efecto mecánico (chico) | Para `movidas` |
|-------|-----------|-----------------|--------------------------|----------------|
| Profesional | 22 % | +10 % si > 28 | Evolución ×1,15 · caída de energía −10 % · moral más estable (deriva ×1,5) | Pocas movidas de joda; referente |
| Fiestero | 14 % | +5 % si < 25 | Evolución ×0,9 · +1 moral semanal al plantel (alegra el vestuario, tope +3) · resaca más probable | Joda, TikTok, llegada tarde |
| Cabulero | 18 % | — | Con cábala activa: +2 a atributos efectivos; si se quema, −8 moral | Cábalas, utilero, botines |
| Influencer | 12 % | +8 % si < 24, −8 % si > 30 | +0,02 % de fama semanal del club por jugador · valor +10 % · evolución ×0,95 | Redes, streamers, filtraciones |
| Calentón | 15 % | — | +2 Marca efectiva · el motor sube riesgo de tarjeta ×1,6 | Peleas, expulsiones, la barra |

Sin rasgos: ~40 % de los jugadores. Los rasgos no cambian solos en MVP; las movidas pueden sacar o poner uno (V1, pedido a núcleo §20).

### 1.5 Estado variable (0–100)

| Campo | Neutro | Qué lo mueve | Para qué sirve |
|-------|--------|--------------|----------------|
| `energia` (estado físico) | 100 | Partidos, intensidad, recuperación diaria | < 70 rinde menos; < 50 riesgo de lesión ×2 |
| `moral` | 60 | Resultados, minutos, ofertas, movidas | ±(moral − 60)/8 a los atributos efectivos |
| `forma` | 50 | Nota de los partidos | ±(forma − 50)/10 a los atributos efectivos |

**Tope de modificadores**: la suma de todo lo que mueve un atributo efectivo (moral, forma, rasgos, efectos, DT, staff) queda entre −15 y +8 sobre el atributo base, para que los bonus chicos no se acumulen y rompan el equilibrio.

### 1.6 Otros datos

- `aspecto`: piel, pelo (corto, largo, rulos, rapado, pelado), color de pelo (negro, castaño, rubio, colorado, canoso), barba, tatuajes (0–3), vincha. Se genera **antes** que el apodo para que sean coherentes.
- `altura` (cm): ARQ 182–198, DEF 175–195, MED 165–185, DEL 165–192.
- `pie`: derecho 72 %, izquierdo 23 %, ambidiestro 5 %.
- `fragilidad` (oculta, 0–100): 10 % de los jugadores son "de cristal" (≥ 70).
- `nacionalidad`: ver §2.3.

---

## 2. Generación procedural

### 2.1 Algoritmo (un jugador)

1. **Contexto**: pool (plantel de club, libres, exterior por región, camada de inferiores) con media objetivo μ y desvío σ.
2. **Perfil** según la necesidad del pool (`perfiles.json`), que fija posición, altura y un vector de atributos relativo.
3. **Edad** según el pool (tabla 2.2).
4. **Media** ~ Normal(μ, σ), recortada a [30, 92].
5. **Potencial** = media + crecimiento esperado por edad (16 años: +18 ± 8; 19: +12 ± 6; 22: +6 ± 4; 25: +2 ± 2; ≥ 27: +0), recortado a 95. 1 % de los menores de 19 son "crack": +10 extra.
6. **Atributos** = base del perfil + ruido Normal(0, 5), luego se escala para que la media ponderada dé el valor buscado. Recorte 20–99 (Atajada de campo 5–25).
7. **Aspecto, altura, pie, fragilidad**.
8. **Rasgos** (tabla 1.4).
9. **Nacionalidad, nombre y apodo** (2.3–2.5).
10. **Contrato, sueldo y valor** (§3), **representante** (35 % tiene uno de los "grandes"; ver `representantes.json`).

Perfiles (vector relativo, se suma a la media):

| Perfil | Pos. | Fuertes | Flojos |
|--------|------|---------|--------|
| arquero | ARQ | Atajada +15, Liderazgo +3 | Gambeta −25, Pegada −25 |
| central | DEF | Marca +10, Físico +8 | Gambeta −10, Velocidad −4 |
| lateral | DEF | Velocidad +8, Pase +3 | Físico −3, Pegada −6 |
| cinco | MED | Marca +8, Pase +4, Liderazgo +3 | Gambeta −5, Pegada −6 |
| volante mixto | MED | Físico +5, Pase +3 | — |
| enganche | MED | Pase +10, Gambeta +8 | Marca −12, Físico −6 |
| extremo | DEL | Velocidad +12, Gambeta +8 | Marca −15, Físico −5 |
| nueve | DEL | Pegada +12, Físico +6 | Velocidad −4, Pase −4 |
| segunda punta | DEL | Gambeta +6, Pase +5, Pegada +4 | Marca −12 |

### 2.2 Pools

| Pool | Media μ (σ) | Edad | Tamaño |
|------|-------------|------|--------|
| Plantel B Nacional | 57 (5) | 18–36, moda 25 | 24 |
| Plantel Primera | 64 (5) | 18–36, moda 26 | 26 |
| Club grande de Primera (según `liga`) | 68 (5) | 18–35 | 27 |
| Libres | 52 (7) | 60 % ≥ 29 | 40–70, se renueva en cada ventana |
| Exterior por región | según región (§12) | 19–31 | 10–20 por región, se renueva por ventana |
| Camada de inferiores | 38 + 2 × nivel pensión (5) | 15–17 | §13 |

Plantel inicial del usuario (club de la B): 23 jugadores (3 ARQ, 8 DEF, 8 MED, 4 DEL), μ 56, garantizado: **un ídolo veterano** (33–35, Liderazgo ≥ 75, hincha del club), **un pibe con potencial** (18–19, potencial ≥ 72) y **un fiestero**. Sin DT, con el utilero.

### 2.3 Nacionalidades

| Pool | ARG | URU | PAR | COL | BRA | CHI | VEN | ECU | PER | BOL | Otros |
|------|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-------|
| Ligas locales | 82 % | 5 | 4 | 3 | 1 | 2 | 1 | 1 | 0,5 | 0,5 | — |
| Exterior | según región (§12) |

MVP: nombres para ARG, URU, PAR, COL y BRA. V1: el resto. Las nacionalidades son países reales (no son marcas); los nombres siempre son inventados.

### 2.4 Nombres

`nombres/<pais>.json`: nombres con peso por generación (los de 17 se llaman Thiago, Bautista, Benjamín; los de 33, Cristian, Leandro, Jonathan) y apellidos con peso y origen (criollo, italiano, vasco, gallego, alemán, árabe, eslavo, guaraní-paraguayo). El origen del apellido habilita apodos (el Tano, el Vasco, el Gallego, el Ruso, el Polaco).

Muestras argentinas ficticias (generadas con estas reglas):

| Jugador | Edad · Perfil | Por qué el apodo |
|---------|---------------|------------------|
| Brian Ezequiel Ledesma, **el Colo** | 24 · nueve | pelo colorado |
| Elías Barrionuevo, **la Hormiga** | 21 · cinco | 1,64 m, no para de correr |
| Ramiro Echeverría, **el Vasco** | 29 · central | apellido vasco |
| Gonzalo Villafañe, **el Gato** | 33 · arquero | arquero de reflejos |
| Kevin Maidana, **el Galgo** | 22 · extremo | Velocidad 84 |
| Agustín Lombardo, **el Tano** | 27 · segunda punta | apellido italiano |
| Santiago Gauna, **el Tucu** | 26 · lateral | nació en Tucumán |
| Leandro Rearte, **el Ruso** | 30 · volante mixto | rubio |
| Facundo Bracamonte, **el Pelado** | 34 · central | pelado, ídolo |
| Cristian Ojeda, **el Toro** | 31 · central | calentón, Físico 80 |
| Valentín Paz, **Valen** | 17 · enganche | diminutivo |
| Juan Cruz Medina, **Juancru** | 19 · lateral | diminutivo |
| Ignacio Sanmartino, **Nacho** | 25 · cinco | diminutivo |
| Jonathan Villalba, **Jony** | 28 · extremo | diminutivo |
| Nahuel Quiroga, **la Torre** | 23 · nueve | 1,93 m |
| Thiago Arregui, **el Influ** | 20 · extremo | rasgo influencer |

Extranjeros: Washington Píriz, **el Pato** (URU, 30) · Derlis Riveros (PAR, 26) · Jhon Edison Cuero, **la Pantera** (COL, 23) · Luiz Fernando Oliveira, **Nandinho** (BRA, 21).

### 2.5 Apodos

60 % de los jugadores tiene apodo. Se elige con pesos entre las fuentes que **aplican** a ese jugador (`apodos.json`):

| Fuente | Condición | Ejemplos |
|--------|-----------|----------|
| Diminutivo del nombre | según nombre | Facu, Nico, Maxi, Eze, Santi, Joaco, Tincho (Martín), Pancho (Francisco), Nacho, Fede, Gonza, Seba, Lauti, Valen, Benja, Jony, Chelo (Marcelo), Guille |
| Aspecto | pelo, altura, contextura | el Colo, el Ruso, el Pelado, el Rulo, la Torre, el Enano, el Flaco, el Gordo (ARQ o veterano) |
| Origen del apellido | origen | el Tano, el Vasco, el Gallego, el Polaco, el Alemán |
| Provincia o país | lugar de nacimiento | el Tucu, el Cordobés, el Correntino, el Chaqueño, el Mendocino, el Salteño, el Pampa, el Uru, el Brasuca |
| Juego y puesto | atributos | el Galgo (Vel ≥ 80), el Tanque (Fís ≥ 80), el Mago (Gam ≥ 80), la Muralla, el Pulpo y el Gato (ARQ), el Cartero (Pase ≥ 78) |
| Animales y clásicos | genérico | el Toro, el Lobo, la Hormiga, el Conejo, el Ratón, el Pájaro, la Pantera, el Mono |
| Rasgo | rasgo | el Loco (calentón), el Brujo (cabulero), el Influ (influencer), el Profe (profesional), el Noche (fiestero) |
| Cariñosos | genérico | Coco, Pipo, Lolo, Tete, Kiki, Tato, Pato, Chiche, Nene, Fito |

Reglas: un apodo de rasgo o de juego no se repite en el mismo plantel; los apodos de aspecto se revalidan si cambia el aspecto (el Rulo que se rapa sigue siendo el Rulo: no se recalcula, es parte de la gracia). **Prohibidos** (`prohibidos.json`): apodos de rasgos étnicos (Negro, Chino, Turco, Bolita, Paragua…), apodos célebres de futbolistas reales (Pulga, Kun, Dibu, Pipita, Burrito, Apache, Brujita, Fideo, Araña, Cuti, Pocho, Pupi, Cuchu…) y nombres completos de futbolistas reales conocidos (p. ej. "Lautaro Martínez", "Enzo Fernández", "Nicolás González"). Apellidos casi únicos de cracks reales (Messi, Maradona, Riquelme, Batistuta, Agüero…) no están en las listas.

---

## 3. Valor y sueldo

### 3.1 Sueldo pedido (mensual, en AU)

`sueldoBase(m) = AU 2,0M × 1,18^(m − 58)`

| Media | 50 | 55 | 58 | 60 | 63 | 66 | 70 | 75 | 80 | 85 |
|-------|----|----|----|----|----|----|----|----|----|----|
| $/mes | 0,53M | 1,2M | 2,0M | 2,8M | 4,6M | 7,5M | 14,6M | 33M | 76M | 174M |

Chequeo contra ECO §1: un plantel de la B (medias 50–64) promedia ~AU 2,2M/mes; uno de Primera (58–76) ~AU 10M/mes. Cuadra con AU 650M y AU 3.300M al año.

Sueldo pedido = sueldoBase × factor edad (≥ 31: ×1,15 si media ≥ 65, "el nombre pesa") × factor fama del club que contrata (1 + fama/1.000.000, tope ×1,4: anti bola de nieve, ECO §7) × factor división (ir a la B: ×1,2) × rasgo (influencer ×1,1) × kMercado (§3.3, si viene del exterior).

### 3.2 Valor de mercado

`valor = sueldoBase × 12 × kEdad × kPotencial × kContrato × kForma × kMercado`

| Edad | ≤ 21 | 22–25 | 26–28 | 29–30 | 31–32 | ≥ 33 |
|------|------|-------|-------|-------|-------|------|
| kEdad | 6 | 5 | 3,5 | 2,5 | 1,5 | 0,6 |

- kPotencial = 1 + max(0, potencial − media)/40 (solo < 24 años).
- kContrato: le quedan < 6 meses ×0,4 · 6–12 meses ×0,7 · más ×1.
- kForma: 0,9 a 1,1 según forma.

Ejemplos: pibe de 20, media 62, potencial 78 → ~AU 390M. Figura de 27, media 80 → ~AU 3.200M.

### 3.3 Mercado local y exterior (misma moneda)

- Todo se expresa en AU: valores, sueldos, primas, cláusulas y viáticos. No hay contratos en otra moneda ni riesgo cambiario.
- `kMercado` = 1 entre clubes de las ligas. Los clubes del **exterior** pagan y piden más según la región (`regiones.json`, §12.2): Europa ×2, Golfo ×2,5, Brasil ×1,2, resto ×1. Vender afuera es el gran negocio; comprar afuera es caro, salvo las gangas que encuentran los ojeadores.
- Quien viene del exterior también pide sueldo × su `kMercado` (está acostumbrado a cobrar más): traer a alguien de Europa duele en la masa salarial.
- Sin inflación, los sueldos no se ajustan solos: el que mejora pide aumento al renovar (§7), y el anti bola de nieve sale del factor fama y del factor división (§3.1).

---

## 4. Evolución y entrenamiento

### 4.1 Semanal (alCerrarSemana)

```
Δmedia = tasaEdad(edad) / 38 × brecha × multEntreno × multMinutos × multRasgo + ruido
brecha      = clamp((potencial − media) / 10, 0, 1)      // solo para subir
multEntreno = (1 + 0,06·nivelCancha + 0,03·nivelAyudante + bonusDT) × intensidad
multMinutos = 0,8 + 0,4 × (minutos últimos 4 partidos / 360)
ruido       ~ Normal(0; 0,05)
```

| Edad | 15–18 | 19–21 | 22–24 | 25–27 | 28–30 | 31–32 | 33–34 | 35+ |
|------|-------|-------|-------|-------|-------|-------|-------|-----|
| tasaEdad (media/temporada) | +5 | +4 | +2,5 | +1 | 0 | −1,5 | −3 | −5 |

Arqueros: la curva se corre 2 años (pican tarde, caen tarde).

El Δmedia se reparte en atributos con pesos = pesos de la posición × foco. En la caída, Velocidad y Físico pesan ×1,5 y Liderazgo **sube** +0,5 por temporada desde los 28.

| Foco | Sube más | Nota |
|------|----------|------|
| Equilibrado | según posición | default |
| Físico | Físico, Velocidad | +5 % recuperación de energía |
| Ataque | Pegada, Gambeta, Pase | — |
| Defensa | Marca, Físico | — |

| Intensidad | Multiplicador | Energía por día | Riesgo de lesión de entrenamiento |
|------------|---------------|-----------------|-----------------------------------|
| Suave | ×0,6 | +4 extra | ×0,5 |
| Normal | ×1 | — | ×1 |
| Fuerte | ×1,4 | −4 | ×2 |

Meta de calibración: un pibe de 17, media 50, potencial 80, en un club con cancha nivel 3 y minutos, llega a ~74 a los 23.

### 4.2 Energía y forma

- Partido: −(25 + 15 × min/90) × (1,2 − Físico/250). Profesional −10 %.
- Recuperación diaria: +8 + 1,5·nivel kinesiólogo + 1·nivel preparador + 0,5·nivel nutricionista − (edad > 30 ? 1 : 0). Tope 100.
- Forma tras cada partido: `forma = 0,7·forma + 0,3·(nota × 10 − 15)` (nota 6,5 ≈ 50). Sin jugar 3 semanas: tiende a 45.

### 4.3 Moral

| Evento | Δ |
|--------|---|
| Victoria / empate / derrota | +4 / 0 / −4 (titulares ×1,5) |
| Titular | +2 · Al banco 3 partidos seguidos: −3 · Sin convocar 3 semanas: −5 |
| Gol / figura del partido | +3 / +4 |
| Renovación | +10 |
| Oferta grande rechazada | −15 (−25 si es especial) |
| Cobra menos que un compañero de menor media | −1 por semana |
| Deriva | 5 % por semana hacia 60 (profesional 7,5 %) |
| Cocinero | +0,5 × nivel por semana al plantel |
| Psicólogo | caídas × (1 − 0,08 × nivel) |

---

## 5. Efectos temporales (catálogo)

`efectos-temporales.json`. Las movidas los aplican por id con el Efecto `temporal` del núcleo; este módulo define qué hacen y los descuenta.

| Id | Efecto | Dura |
|----|--------|------|
| `resaca` | −15 energía efectiva, −4 Pase y Velocidad | 1 partido |
| `motivado` | +4 a todos los atributos efectivos | 1–3 partidos |
| `distraido` | −3 a todos | N partidos |
| `lesion_oculta` | Juega, pero riesgo de lesión ×4 | hasta que el médico la detecte o se rompa |
| `infiltrado` | Juega lesionado al 85 %; 30 % de agravar (duración ×2) | 1 partido |
| `tatuaje_fresco` | 20 % de infección → `lesion` leve | 1 partido |
| `castigado` | No disponible | N partidos |
| `enojado_con_dt` | −5 moral por semana, banderas para movidas | N partidos |
| `concentrado` | Rasgo cabulero activado sin cábala | 1 partido |
| `vendido_en_su_cabeza` | −5 a todos (se quiere ir) | hasta cerrar la ventana |

Duración en **partidos** (como el contrato del núcleo); las lesiones van aparte, en días (§6).

---

## 6. Lesiones y suspensiones

- **En partido**: el motor decide si alguien se lesiona usando `riesgoLesion(jugador)` (selector, §18). Base 1,2 % por partido completo × (energía < 50 ? 2 : energía < 70 ? 1,4 : 1) × (1 + fragilidad/100) × (edad ≥ 32 ? 1,3 : 1) × (1 − 0,04·nivel gimnasio) × (1 − 0,04·nivel nutricionista).
- **Entrenamiento**: 0,05 % por jugador por día × intensidad × energía.
- **Gravedad** (la decide `mercado` con su rng):

| Tipo | Prob. | Días |
|------|-------|------|
| Leve (sobrecarga, golpe) | 60 % | 3–10 |
| Media (desgarro, esguince) | 30 % | 14–35 |
| Grave (fractura, meniscos) | 9 % | 60–150 |
| Ligamentos cruzados | 1 % | 180–270 |

- Duración × (1 − 0,06·nivel médico) × (leve: 1 − 0,06·nivel kinesiólogo).
- Al volver: energía 70 y 20 % de recaída en las 2 semanas siguientes si no tenés médico.
- Grave en un titular habitual → interrupción `lesion`.
- **Tarjetas**: 5 amarillas = 1 fecha; roja directa = 1–3 fechas (lo dice el informe del partido). MVP: un solo contador para la liga; las copas tienen el suyo en V1.

---

## 7. Contratos

- Vencen a mitad (semana 26) o fin (semana 52) de temporada. Duración 1–4 años (juveniles hasta 5).
- **Renovación**: el jugador pide `sueldoPedido` actual × (moral < 40 ? 1,2 : 1) × (le ofrecen otros ? 1,15 : 1). Si le subís menos del 90 % del pedido, rechaza; entre 90 y 100 %, acepta con probabilidad lineal. Una negativa: −5 moral; tres: "no renueva" (cadena de movidas, se va libre).
- **Precontrato**: con 6 meses o menos, la IA puede ofrecerle a tus jugadores (aviso al usuario) y vos a los de otros. Se firma y se incorpora al vencer.
- **Rescisión**: pagás 50 % de lo que resta (−10 % por nivel de abogado, mínimo 25 %).
- **Libres**: los contratos vencidos pasan a `libre`. Los libres bajan su pedido un 5 % por mes sin club.

---

## 8. Mercado de pases

### 8.1 Ventanas

| Ventana | Semanas | Cierre |
|---------|---------|--------|
| Verano | 1–4 | viernes de la semana 4 |
| Invierno | 25–28 | viernes de la semana 28 |
| Exterior compra (V1) | 25–35 y 1–5 | permite ventas al exterior fuera de la ventana local |

Fuera de ventana: ojeo, seguimiento, renovaciones, rescisiones, precontratos y **libres** (MER-9.2).

### 8.2 Comprar (usuario → club dueño)

```
oferta (monto, tipo) ──día siguiente──► el club evalúa:
   monto ≥ pedido           → acepta
   mínimo ≤ monto < pedido  → contraoferta = (monto + pedido)/2, redondeada
   0,7·mínimo ≤ monto < mín → rechaza
   monto < 0,7·mínimo       → rechaza y paciencia −1
paciencia 0 → "no te atienden más" hasta la próxima ventana. Máx. 3 rondas.
```

- `mínimo` = valor × kPersonalidad del vendedor (`ia-mercado.json`) × (titular indiscutido ? 1,3 : 1) × (transferible ? 0,85 : 1) × (contrato < 6 meses ? 0,6 : 1). `pedido` = mínimo × 1,15–1,35 (rng).
- Paciencia inicial 2 (+1 con secretario técnico nivel ≥ 3).
- **Termómetro**: muestra el rango del mínimo con error ± (30 − 5·nivel secretario) %. Sin secretario: "ni idea".
- **Negociación con el jugador** (una pantalla): sueldo, años y prima. Pide `sueldoPedido` × atractivo, donde atractivo = división (Primera 0,9 · B 1,2) × fama × minutos esperados (si en su puesto hay 2 mejores: ×1,2) × ambientación (`regiones.json`: Caribe 0,95, frío extremo 1,1, luna 1,5). Acepta si sueldo ≥ 95 % del pedido; entre 85 y 95 % según rng; menos, rechaza. Si tiene representante: comisión 5–10 % del pase (concepto `compras`).
- **Cierre**: Efecto de caja (pase + prima + comisión), el jugador cambia de club, noticia. Si la caja no alcanza, no se puede cerrar (MER-10.6).

### 8.3 Vender (ofertas de la IA)

- Cada día de ventana, para cada jugador del usuario: `p = pBase(0,4 %) × (valor relativo) × (forma/50) × (transferible ? 3 : 1) × (intransferible ? 0,2 : 1) × (influencer ? 1,3 : 1) × curvaVentana`. `curvaVentana` sube ×3 los últimos 3 días.
- Comprador: un club de la liga con necesidad en ese puesto y fondo (§9), o el exterior (si media ≥ 68 o edad ≤ 22 con potencial ≥ 78).
- Monto: valor × (0,8–1,3) según personalidad del comprador (× `kMercado` si es del exterior).
- El usuario: aceptar, rechazar o pedir X (una vez; la IA acepta si X ≤ su máximo oculto = monto × 1,1–1,3).
- Vence en 3 días. Rechazar una oferta ≥ 1,5 × valor → `quiereIrse` y −15 moral.
- **Especiales**: `arabia` (club del Golfo, ≥ 2 × valor), `clasico` (el clásico rival que define `liga`), `bombazo` (récord de la división). Se marcan para que `movidas` las vista de movida.

### 8.4 Préstamos

- MVP: hasta mitad o fin de temporada, `sueldoPct` (0–100 % a cargo de quien lo recibe), sin cargo.
- V1: `cargo` (monto), `opcion` de compra (optativa u obligatoria, con condición: "si juega 60 % de los partidos").
- Los grandes de Primera prestan pibes (18–21, potencial ≥ 70) a la B: es la puerta barata del usuario al principio.

### 8.5 Cláusulas (V1)

`salida` (monto, opcional solo exterior; la IA la paga sin negociar) · `futura_venta` (% para el vendedor) · `bonus` (ascenso, goles, partidos) · `miedo` (el prestado no juega contra su dueño).

---

## 9. IA de los rivales

### 9.1 Personalidades (las define `liga`; acá su conducta en el mercado)

| Personalidad | Compra | Vende | Fondo de pases | kPrecio al vender | Inferiores |
|--------------|--------|-------|----------------|-------------------|------------|
| Vendedor de pibes | poco, jóvenes baratos | sub-23 a la primera oferta ≥ valor | ×0,8 | ×1,0 | sube muchos |
| Gastador | mucho, figuras y veteranos con nombre | casi nunca | ×1,5 (se endeuda) | ×1,3 | pocos |
| Ordenado | según necesidad, precio justo | si la oferta es buena | ×1,0 | ×1,1 | normal |
| Caótico | al azar, a veces malas compras | barato si necesita plata | ×0,6–1,4 por ventana | ×0,8–1,3 | normal |
| Presidente loco | compras impulsivas, ofertas absurdas | vende a la figura por bronca | ×1,2 | ×0,7–1,6 | pocos |

### 9.2 Ciclo por día de ventana

```
para cada club rival (orden aleatorio con rng):
  si rng < pActuar(personalidad) × curvaVentana:
    necesidades = puestos con < mínimo de jugadores o titulares por debajo de su media objetivo − 3
    si hay necesidad y fondo: elegir candidato (libres, transferibles, exterior, jugadores del usuario)
       por mejor relación media/precio; si es del usuario → Oferta (interrupción)
       si es de otro rival → se resuelve al instante con la regla de 8.2
    si sobra gente (> 26) o es vendedor: ofrecer / ceder a préstamo / liberar al peor
al cerrar la ventana: completar planteles < 18 con libres y juveniles generados; garantizar 2 ARQ
```

### 9.3 Fondo de pases (abstracción)

Los rivales no tienen caja real (`economia` modela solo la tuya). Al abrir cada ventana: `fondo = ingresosEstimados(división, tamaño) × 0,15 × kPersonalidad + ventas − compras` arrastrados. Vive en la porción `mercado`.

### 9.4 Calesita de DTs (V1)

Cada fecha, si un rival lleva 5 partidos sin ganar o está en zona de descenso: `pEchar = 8 % × (presidente loco ? 2,5 : 1) × (ordenado ? 0,5 : 1)`. El echado pasa al pool de DTs libres con noticia ("se fue el Vasco: lo esperan tres clubes"). El rival contrata otro del pool.

---

## 10. Staff (V1)

| Tipo | Edificio (`club`) | Efecto por nivel (1–5) |
|------|-------------------|------------------------|
| Abogado | Oficinas | −10 % costo de rescisiones y sanciones · opciones extra en movidas de AFA y justicia |
| Contador | Oficinas | Opciones extra en movidas de economía · `economia` lo puede usar para impuestos (pedido) |
| Secretario técnico | Oficinas | Termómetro de negociación ± (30 − 5n) % · +1 paciencia desde nivel 3 |
| Preparador físico | Cancha de entrenamiento | +1 energía/día · +4 % evolución de Físico y Velocidad · −4 % lesiones musculares |
| Ayudante de campo | Cancha de entrenamiento | +3 % evolución general · rango de potencial más fino |
| Entrenador de arqueros | Cancha de entrenamiento | +8 % evolución de Atajada |
| Kinesiólogo | Gimnasio | +1,5 energía/día · −6 % duración de lesiones leves |
| Médico | Departamento médico | −6 % duración de lesiones · detecta `lesion_oculta` y fragilidad (nivel ≥ 2) |
| Nutricionista | Comedor | −4 % riesgo de lesión · +0,5 energía/día · −10 % penalidad de fiestero |
| Cocinero | Comedor | +0,5 moral semanal al plantel ("el asado de los jueves") |
| Ojeador | Oficina de ojeadores | §12 |
| Coordinador de inferiores | Pensión | §13 |
| Community manager | Prensa y redes | +fama semanal y opciones en movidas de redes (lo leen `movidas` y `economia`) |
| Asesor de prensa | Prensa y redes | Suaviza escándalos (lo lee `movidas`) |
| Psicólogo | Consultorio | Caídas de moral × (1 − 0,08n) · +1n bajo presión (finales, clásicos: pedido a `partido`) |
| **Utilero** | ninguno | Personaje fijo desde el inicio. +1 al efecto de las cábalas. Protagonista de movidas |

- **Sueldo** (ECO §3): nivel 1 AU 0,5M · 2 AU 0,9M · 3 AU 1,4M · 4 AU 2,1M · 5 AU 3,0M al mes, + prima de 1 mes. Contrato por fechas (10, 19, 38) o temporadas (1–2). Rescisión 50 % del resto.
- **Candidatos**: 3–5 por tipo, se renuevan cada 4 semanas. Los de nivel mayor al edificio se ven bloqueados.
- **Cupos**: los define `club` (`specs/club/design.md` §2.4, selector `cuposStaff`), que además suma dos roles: **analista de video** (cancha nivel 5: +n % conocimiento por partido rival, como el DT analista) y **entrenador juvenil** (pensión nivel 3: +4 % evolución de inferiores por nivel). Varios del mismo tipo suman con rendimiento decreciente (100 %, 50 %, 25 %).
- **Edificio sin staff**: el efecto del nivel del edificio (progreso del entrenamiento, recuperación, lesiones, cantidad de mercado, regiones de ojeo, inferiores) lo calcula `club` como modificadores (`club` §2, pedido M2) y `mercado` lo lee; el staff suma encima. Así el MVP funciona sin staff.
- **Edificio en obra** → su staff no aplica efectos (CLU-3.4).
- Rasgo opcional del staff (para movidas): trabajador, chanta, mediático, leal.
- Nombres de muestra: kinesiólogo **"Pocho" Albornoz**, nutricionista **Lic. Carla Benítez**, psicóloga **Lic. Marina Sosa**, abogado **Dr. Julio César Iturralde**, utilero **Don Coco Maldonado** ("los botines se lustran con grasa de chancho, siempre fue así").

---

## 11. Directores técnicos (MVP)

| Estilo | Bonus (escala con nivel n) | Muestra ficticia |
|--------|----------------------------|------------------|
| Ofensivo / el Loco | +n Pegada y Velocidad a DEL y MED ofensivos · +estilo "ataque" en el motor · tarjetas ×1,2 | Héctor **"el Loco"** Barrionuevo |
| Físico / el Profe | +n Físico a todos · +0,5n energía/día · −5 % lesiones | Osvaldo **"el Profe"** Sanmartino |
| Táctico / el de la pizarra | +0,5n s en el minijuego de pizarra · +estilo elegido en el motor | Mario **"el Vasco"** Urquiaga |
| Motivador | +2n moral semanal (tope 85) · +n en clásicos y finales | Fabián **"el Pastor"** Godoy |
| Defensivo / el cerrojo | +n Marca a DEF y MED · los hinchas se quejan si se gana feo (movidas) | Walter **"el Capataz"** Oviedo |
| Formador | +5n % evolución de sub-21 · más chances de subir pibes | Néstor **"el Abuelo"** Ferrando |
| Analista | +n % conocimiento por partido rival · +estilo "posesión" | Lucas **"el Laptop"** Quintana |
| Mago de la pelota parada | +n Pegada en pelota parada · ayuda en minijuego de tiro libre | Darío **"el Mago"** Saravia |

- **Nivel y plata** (ECO §3, B AU 3–15M, Primera AU 15–80M por mes): n1 AU 3M · n2 AU 6M · n3 AU 12M · n4 AU 30M · n5 AU 70M; prima de 2 meses.
- **Quién acepta**: nivel 4 exige Primera o fama ≥ 50.000; nivel 5, Primera y fama ≥ 200.000.
- **Contrato**: por fechas (10, 19, 38) o por temporadas (1–2). Rescisión: 50 % del resto (CLU-6c.3), −10 % por nivel de abogado.
- **Humor del DT** (`animo` 0–100): baja con derrotas y con ventas de titulares; con < 30 marca `pideRefuerzos`, con < 15 `amenazaRenunciar`. Rasgo (calentón, mediático, perfil bajo, quejoso) para `movidas`.
- **Sugerencias**: el DT propone un once y una formación; vos decidís (CLU-6b).
- Pool inicial: 12 DTs libres + uno por club rival.

---

## 12. Ojeo y conocimiento

### 12.1 Conocimiento (MVP)

`conocimiento[idJugador]` de 0 a 100, solo para jugadores ajenos:

| % | Se ve |
|---|-------|
| 0 | Nombre, edad, club, posición |
| 10 | Estrellas aproximadas (± 1) |
| 30 | 3 atributos principales en rango ± 8 |
| 50 | Todos los atributos ± 5 · un rasgo |
| 75 | Atributos exactos · todos los rasgos · potencial ± 10 |
| 100 | Potencial ± 3 · fragilidad |

Fuentes: base por nivel de oficina de ojeadores (rivales de tu división: 10 % × nivel, tope 50 %) · cada partido contra tu equipo: +10 % a sus titulares (+n % con DT analista) · seguimiento V1.

Visibilidad del mercado (MVP, sin staff): nivel 0 = libres y transferibles de tu división · nivel 1–2 = + las dos divisiones · nivel 3 = + exterior cercano (URU/PAR/Andes) · nivel 4–5 = + todo el exterior.

### 12.2 Misiones (V1)

| Región | Nacionalidades | Media μ | kMercado | Viáticos por semana |
|--------|----------------|---------|----------|---------------------|
| AMBA y conurbano | ARG | 52 | 1 | AU 0,3M |
| Litoral, Centro, Cuyo, Norte, Patagonia | ARG | 50 | 1 | AU 0,5M |
| Río de la Plata y Paraguay | URU, PAR | 58 | 1 | AU 0,8M |
| Andes | CHI, PER, BOL, ECU | 56 | 1 | AU 0,9M |
| Caribe sudamericano | COL, VEN | 60 | 1 | AU 1M |
| Brasil | BRA | 64 | 1,2 | AU 1,2M |
| Europa (segundas líneas y vueltas) | varios + ARG que vuelven | 66 | 2 | AU 1,5M |
| Golfo y resto del mundo | varios | 62 | 2,5 | AU 1,5M |

- Pedido: puesto, edad máxima, perfil, tope de valor. Duración 1–4 semanas. Cada semana: `1 + floor(n/2)` informes; calidad +n sobre μ; conocimiento inicial 20 + 10n %.
- Ojeador **chanta** (10 %): sesgo +5 en lo que reporta (te vende humo).
- Especialidad: un ojeador de región propia rinde ×1,5.

---

## 13. Inferiores

- **Camada** en la semana 2 (la prueba de juveniles): `2 + nivelPensión + floor(nivelCoordinador/2)` juveniles de 15–17. MVP sin pensión: 2 por temporada.
- Media 38 + 2·nivelPensión (σ 5). Potencial ~ Normal(60 + 3·nivelPensión + 2·nivelCoordinador, 8); crack (+10) 1 % + 1 % por nivel de pensión.
- Evolucionan con tasaEdad × (1 + 0,08·nivelPensión). Cupo de inferiores: 8 + 2·nivelPensión.
- Promoción desde los 16: primer contrato (sueldo mínimo de la división, 3–5 años). A los 20 sin promover: decisión (promover o liberar).
- Los rivales no tienen inferiores modeladas: al cerrar la temporada suman 1–3 juveniles directo al plantel (vendedor de pibes 3–5).
- V1: `formadoEn` y derechos de formación (5 % de cada venta futura, concepto `ventas`).

---

## 14. Ciclo de vida del mundo

- **Fin de temporada**: +1 año a todos · retiros: P(retiro) 33 años 10 % · 34 25 % · 35 45 % · 36 70 % · 39 100 %, ×0,6 si media ≥ 70 o profesional · contratos vencidos → libres · vuelven los préstamos · se regeneran libres y exterior.
- **Estabilidad**: después de retiros y camadas, si la media de titulares de una división se corre más de 1,5 del objetivo, se ajusta la μ de los juveniles y libres generados (no se tocan jugadores existentes).
- **Ídolos**: jugador con ≥ 5 temporadas en el club o capitán → bandera `idolo`; su retiro o su venta avisan a `movidas` (partido despedida, hinchas enojados).
- V1: algunos retirados reaparecen como DT o staff ("el Pelado Bracamonte se recibió de técnico").

Tamaño: ~1.000 jugadores en planteles + ~70 libres + ~150 exterior + tus inferiores ≈ 1.250 jugadores × ~0,5 KB ≈ 650 KB de guardado. Para recortarlo, los retirados se borran (queda una línea en el historial de pases) y el exterior no visto se descarta al regenerar.

---

## 15. Enganche con el ciclo del núcleo

| Momento | Qué hace `mercado` |
|---------|--------------------|
| `iniciar` | Genera los 40 planteles (con los datos de clubes de `liga`), libres, exterior, DTs, candidatos de staff, utilero |
| `alAvanzarDia` | Recuperación de energía · lesiones (días −1) · lesiones de entrenamiento · respuestas a tus ofertas · ofertas de la IA · operaciones entre rivales · abrir y cerrar ventana · misiones de ojeo · vencimiento de ofertas |
| `antesDelPartido` | Valida disponibles (lesión, suspensión, `castigado`); nada más |
| `despuesDelPartido` | Energía, forma, moral, goles y minutos · lesiones informadas · tarjetas · conocimiento de rivales · fechas restantes de DT y staff · humor del DT · calesita (V1) |
| `alCerrarSemana` | Evolución · deriva de moral · efectos de rasgos · sueldos (Efecto de caja) · fama de influencers |
| `alCerrarTemporada` | Edad, retiros, contratos, préstamos, regeneración, camada, rivales a 18–28 |

Rendimiento: la evolución semanal de 1.250 jugadores es un bucle de multiplicaciones; la IA de ventana revisa ~40 clubes × candidatos prefiltrados por puesto. Presupuesto objetivo: < 1,5 s de los 10 s de NUC-7.2.

---

## 16. Tipos TypeScript de la porción

```ts
type IdJugador = string; type IdClub = string; type IdStaff = string; type IdDT = string
type IdOferta = string; type IdMision = string; type IdRepresentante = string
type IdClubExterior = `ext:${string}`

type Posicion = 'ARQ' | 'DEF' | 'MED' | 'DEL'
type Perfil = 'arquero' | 'central' | 'lateral' | 'cinco' | 'volante_mixto' | 'enganche' | 'extremo' | 'nueve' | 'segunda_punta'
type Atributo = 'pegada' | 'velocidad' | 'gambeta' | 'pase' | 'marca' | 'fisico' | 'liderazgo' | 'atajada'
type Atributos = Record<Atributo, number>            // 1–99, con un decimal
type Rasgo = 'fiestero' | 'cabulero' | 'influencer' | 'calenton' | 'profesional'
type Monto = number                                  // en AU, la moneda única mundial
type Vencimiento = { temporada: number; semana: 26 | 52 }

interface Aspecto { piel: number; pelo: 'corto'|'largo'|'rulos'|'rapado'|'pelado'; colorPelo: 'negro'|'castano'|'rubio'|'colorado'|'canoso'
                    barba: number; tatuajes: 0|1|2|3; vincha: boolean }

interface Jugador {
  id: IdJugador
  nombre: string; apellido: string; apodo?: string
  nacionalidad: string                // 'ARG', 'URU'…
  lugarNacimiento?: string            // provincia o región, para apodos y movidas
  edad: number
  posicion: Posicion; perfil: Perfil; pie: 'der' | 'izq' | 'ambi'; altura: number
  aspecto: Aspecto
  atributos: Atributos
  potencial: number                   // oculto
  fragilidad: number                  // oculta
  rasgos: Rasgo[]
  energia: number; moral: number; forma: number
  efectos: { id: string; partidosRestantes: number; origen: string }[]
  lesion?: { tipo: 'leve'|'media'|'grave'|'ligamentos'; diasRestantes: number; recaidaHasta?: number }
  suspension?: { partidos: number }
  amarillas: number
  club: IdClub | IdClubExterior | 'libre'
  categoria: 'profesional' | 'inferiores'
  contrato?: Contrato
  prestamo?: Prestamo
  precontrato?: { club: IdClub; contrato: Contrato }
  representante?: IdRepresentante
  banderas: { transferible?: boolean; intransferible?: boolean; quiereIrse?: boolean; idolo?: boolean
              capitan?: boolean; noRenueva?: boolean }
  temporada: { partidos: number; minutos: number; goles: number; asistencias: number; sumaNotas: number }
  minutosRecientes: number[]          // últimos 4 partidos
  historial: { temporada: number; club: IdClub | IdClubExterior; partidos: number; goles: number }[]
  formadoEn?: IdClub
  evolucionMes: Partial<Atributos>    // para la ficha (MER-4.4)
}

type Clausula =
  | { tipo: 'salida'; monto: Monto; soloExterior: boolean }
  | { tipo: 'futura_venta'; club: IdClub; porcentaje: number }
  | { tipo: 'bonus'; condicion: 'ascenso' | 'goles' | 'partidos' | 'titulo'; umbral?: number; monto: Monto }
  | { tipo: 'miedo'; club: IdClub }

interface Contrato { sueldo: Monto; firmado: Instante; vence: Vencimiento; prima?: Monto; clausulas: Clausula[] }

interface Prestamo { duenio: IdClub | IdClubExterior; hasta: Vencimiento; sueldoPct: number
                     cargo?: Monto; opcion?: { monto: Monto; obligatoria: boolean; condicionPartidosPct?: number } }

type EstadoOferta = 'enviada' | 'contraoferta' | 'aceptada_club' | 'negociando_jugador' | 'cerrada'
                  | 'rechazada' | 'vencida' | 'cancelada'
interface Oferta {
  id: IdOferta; jugador: IdJugador
  comprador: IdClub | IdClubExterior; vendedor: IdClub | IdClubExterior | 'libre'
  tipo: 'compra' | 'prestamo' | 'precontrato'
  monto: Monto; prestamo?: Omit<Prestamo, 'duenio'>; clausulas: Clausula[]
  origen: 'usuario' | 'ia' | 'exterior' | 'clausula'
  especial?: 'arabia' | 'clasico' | 'bombazo'
  estado: EstadoOferta; ronda: number; contraoferta?: Monto
  respondeEl?: Instante; vence: Instante
  jugadorPide?: { sueldo: Monto; anios: number; prima: Monto }   // tras aceptar el club
}

interface Staff { id: IdStaff; nombre: string; apodo?: string; tipo: TipoStaff; nivel: 1|2|3|4|5
                  rasgo?: 'trabajador' | 'chanta' | 'mediatico' | 'leal'; region?: string
                  contrato?: { sueldo: Monto; fechasRestantes?: number; vence?: Vencimiento } }
type TipoStaff = 'abogado' | 'contador' | 'secretario' | 'preparador' | 'ayudante' | 'entrenador_arqueros'
               | 'kinesiologo' | 'medico' | 'nutricionista' | 'cocinero' | 'ojeador' | 'coordinador_inferiores'
               | 'community_manager' | 'asesor_prensa' | 'psicologo' | 'utilero'
               | 'analista_video' | 'entrenador_juvenil'          // roles que agrega club §2.4

type EstiloDT = 'ofensivo' | 'fisico' | 'tactico' | 'motivador' | 'defensivo' | 'formador' | 'analista' | 'pelota_parada'
interface DT { id: IdDT; nombre: string; apodo: string; estilo: EstiloDT; nivel: 1|2|3|4|5
               rasgo?: 'calenton' | 'mediatico' | 'perfil_bajo' | 'quejoso'
               club: IdClub | 'libre'; animo: number
               contrato?: { sueldo: Monto; fechasRestantes?: number; vence?: Vencimiento }
               historial: { temporada: number; club: IdClub; puntosPorPartido: number }[] }

interface MisionOjeo { id: IdMision; ojeador: IdStaff; region: string
                       pedido: { posicion?: Posicion; perfil?: Perfil; edadMax?: number; valorMax?: Monto }
                       semanasRestantes: number }
interface Informe { cuando: Instante; mision?: IdMision; jugador: IdJugador; nota: string; sesgo?: number }

interface Traspaso { cuando: Instante; jugador: IdJugador; nombre: string; de: string; a: string
                     tipo: 'compra' | 'prestamo' | 'libre' | 'retiro' | 'vuelta_prestamo'; monto?: Monto }

interface EstadoMercado {
  version: number
  proximoId: number                                  // ids deterministas: 'j-000123', 'dt-0007'…
  clubUsuario: IdClub                                // copia de lectura (ver pedidos)
  jugadores: Record<IdJugador, Jugador>
  dts: Record<IdDT, DT>
  staff: Record<IdStaff, Staff & { contratadoPor?: IdClub }>
  candidatosStaff: IdStaff[]
  representantes: Record<IdRepresentante, { nombre: string; apodo?: string; estilo: 'tiburon' | 'familiar' | 'fondo' }>
  ventana: { abierta: boolean; tipo?: 'verano' | 'invierno'; cierra?: Instante }
  ofertas: Record<IdOferta, Oferta>
  paciencia: Record<IdClub, number>                  // por ventana, clubes que te atienden
  fondosPases: Record<IdClub, Monto>                 // AU, abstracción de los rivales
  entrenamiento: { foco: 'equilibrado' | 'fisico' | 'ataque' | 'defensa'; intensidad: 'suave' | 'normal' | 'fuerte' }
  ojeo: { conocimiento: Record<IdJugador, number>; misiones: MisionOjeo[]; informes: Informe[]; seguimiento: IdJugador[] }
  historialPases: Traspaso[]                         // se recorta a las últimas 2 temporadas
  pendientes: AccionMercado[]                        // solo si el núcleo no acepta salidas en reducir (§20)
}
```

Los planteles **no se guardan**: se derivan de `jugador.club` con un selector memorizado. Así no hay dos fuentes de verdad.

---

## 17. Acciones del usuario (`reducir`)

```ts
type AccionMercado =
  | { tipo: 'ofertar'; jugador: IdJugador; monto: Monto; modo: 'compra' | 'prestamo' | 'precontrato'; prestamo?: Omit<Prestamo,'duenio'> }
  | { tipo: 'responderContraoferta'; oferta: IdOferta; acepta: boolean; nuevoMonto?: Monto }
  | { tipo: 'proponerContrato'; oferta: IdOferta; sueldo: Monto; anios: number; prima: Monto }
  | { tipo: 'responderOfertaRecibida'; oferta: IdOferta; respuesta: 'aceptar' | 'rechazar' | 'pedir'; monto?: Monto }
  | { tipo: 'renovar'; jugador: IdJugador; sueldo: Monto; anios: number; prima: Monto }
  | { tipo: 'rescindir'; jugador: IdJugador }
  | { tipo: 'ficharLibre'; jugador: IdJugador; sueldo: Monto; anios: number; prima: Monto }
  | { tipo: 'marcar'; jugador: IdJugador; bandera: 'transferible' | 'intransferible' | 'capitan'; valor: boolean }
  | { tipo: 'promover' | 'liberarJuvenil'; jugador: IdJugador }
  | { tipo: 'entrenamiento'; foco: EstadoMercado['entrenamiento']['foco']; intensidad: EstadoMercado['entrenamiento']['intensidad'] }
  | { tipo: 'contratarDT'; dt: IdDT; modalidad: { fechas: number } | { temporadas: number } }
  | { tipo: 'echarDT' }
  | { tipo: 'contratarStaff' | 'despedirStaff'; staff: IdStaff }
  | { tipo: 'enviarOjeador'; ojeador: IdStaff; region: string; pedido: MisionOjeo['pedido']; semanas: number }
  | { tipo: 'seguir' | 'dejarDeSeguir'; jugador: IdJugador }
```

Cada acción se valida (ventana, caja, cupos, nivel de edificio, plantel 18–25, extranjeros ≤ 6) y, si no pasa, devuelve el mismo estado con un `motivo` legible para la UI.

---

## 18. Selectores (lo que leen los demás)

| Selector | Para | Devuelve |
|----------|------|----------|
| `plantel(p, club)` | todos | jugadores profesionales del club |
| `disponibles(p, club)` | `partido` | sin lesión, suspensión ni `castigado` |
| `atributosEfectivos(p, jugador)` | `partido` | atributos con energía, moral, forma, efectos, DT y staff aplicados |
| `riesgoLesion(p, jugador)` | `partido` | probabilidad por 90' (§6) |
| `bonusDT(p, club)` | `partido` | estilo favorecido, bonus de minijuego, bonus en clásicos |
| `fuerzaPlantel(p, club)` | `liga` | media del mejor once y por línea, para simular partidos ajenos rápido |
| `masaSalarial(p, club)` | `economia` | AU por mes |
| `nivelStaff(p, tipo)` | `movidas`, `club`, `economia` | nivel efectivo (0 si no hay o si el edificio está en obra) |
| `valorJugador(p, jugador)` | UI, `movidas` | Monto y estrellas |
| `ventana(p)` | todos | abierta, tipo, días para el cierre |
| `vistaJugador(p, jugador)` | UI | lo que el usuario puede ver según conocimiento (rangos) |
| `candidatosMovida(p, filtro)` | `movidas` | jugadores por rasgo, bandera o estado, para `{jugador}` |

---

## 19. Efectos, noticias e interrupciones que emite

### Efectos

| Cuándo | Efecto |
|--------|--------|
| Cierre de compra / préstamo con cargo | caja negativo, concepto `compras` (pase + prima + comisión) |
| Venta / cesión con cargo / derechos de formación | caja positivo, concepto `ventas` |
| Cada semana | caja negativo, `sueldos` (jugadores) y `staff` (staff + DT); un efecto por concepto |
| Rescisión de jugador / de DT o staff | caja negativo, `sueldos` / `staff` |
| Viáticos de ojeo | caja negativo, `staff` |
| Fichaje de estrella (media ≥ 75) | `fama` + y `relacion hinchas` + |
| Venta del ídolo / del capitán | `relacion hinchas` − y `relacion plantel` − |
| Influencers en el plantel | `fama` + semanal |
| Pulso para movidas | `marca` (`mercado.oferta_especial`, `mercado.ventana_cierra`, `mercado.idolo_retirado`…) |

### Noticias (importancia)

Ventana abre / cierra (2) · fichaje o venta del usuario (3) · bombazo de un rival (2) · otras operaciones de rivales (1) · lesión grave en tu plantel (2) · DT nuevo, propio o ajeno (2, CLU-6c.4) · DT echado (2) · informe de ojeador (1) · camada de inferiores (2) · retiro de un ídolo (3) · jugador que se va libre (2).

### Interrupciones

`oferta`: oferta recibida, contraoferta, el club aceptó y falta el jugador, precontrato de un rival a tu jugador · `lesion`: lesión grave de un titular · `oferta` con motivo "cierra el mercado" el día antes del cierre (no hay tipo propio, ver pedidos).

---

## 20. Pedidos a otros módulos

Anotados acá por indicación del coordinador (no se escribió en carpetas ajenas).

### Núcleo (bloqueantes para programar, no para aprobar el diseño)
1. **Los ganchos no devuelven la porción.** `Salida` no tiene campo para el estado propio, así que un módulo no puede, por ejemplo, hacer evolucionar jugadores en `alCerrarSemana`. Propuesta: `Salida<P> = { porcion?: P; efectos?; noticias?; interrupcion? }`.
2. **`reducir` no tiene contexto ni salida.** Comprar requiere leer la caja, usar rng y emitir un Efecto de caja. Propuesta: `reducir(ctx, porcion, accion): Salida<P>`. Plan B sin cambio: acciones en `pendientes`, resueltas en una llamada inmediata del núcleo.
3. **Aplicar Efectos sobre `mercado`.** `jugador` y `temporal` tocan mi porción: propongo `aplicarEfecto?(porcion, efecto): P` en el contrato de módulo, para que el núcleo delegue.
4. **Ambigüedad `fisico`.** En `Efecto.jugador.campo`, `'fisico'` es a la vez el estado (energía) y el atributo Físico. Propuesta: el estado se llama `energia`. Mientras tanto, `mercado` interpreta `'fisico'` como energía.
5. **Efecto para operar el mercado desde movidas**: `{ tipo: 'mercado'; accion: AccionMercado | { tipo: 'venderA'; jugador; comprador; monto } | { tipo: 'subirSueldo'; jugador; pct } | { tipo: 'rasgo'; jugador; rasgo; quitar? } }`. Sin esto, "Arabia llama → vender" no se puede resolver.
6. **Tipo de interrupción `mercado`** para el cierre de ventana (hoy reuso `oferta`).
7. **`rng.derivar(etiqueta)`** para subflujos (generación, IA, lesiones) y que agregar una tirada en un lado no cambie todo lo demás.
8. **Id del club del usuario** en `meta` (hoy lo copio en `mercado.clubUsuario`).
9. Renombrar el Efecto `pesos` (y `Club.pesos` de `steering/tecnica.md`) a la moneda única, ahora que no hay pesos (ECO §8).
10. `steering/tecnica.md` todavía pone `plantel` y `dt` dentro de `Club`: hay que alinearlo con §1 del núcleo.

### Economía
1. Exponer en su porción la caja disponible.
2. Validar, ya sin inflación, la curva de sueldos (§3.1), la de valores (§3.2) y los `kMercado` del exterior (§3.3).
3. Confirmar que `mercado` emite los sueldos por Efecto semanal y que `economia` no los vuelve a cobrar.
4. Confirmar conceptos: `compras`, `ventas`, `sueldos`, `staff`. ¿Las comisiones de representantes van aparte?
5. Usar `nivelStaff('contador')` y `nivelStaff('community_manager')` si les dan efecto económico.

### Liga
1. Por club: `id`, `nombre`, `division`, `tamaño` (chico, mediano, grande), `personalidad` con los ids de §9.1 y `clasicoDe`.
2. Leer `fuerzaPlantel` para simular partidos ajenos (no recalcular desde jugadores).
3. Tablas y rachas accesibles para el humor de los DTs y la calesita.
4. Confirmar que los rivales no tienen caja propia (uso `fondosPases`).

### Partido
1. Usar `atributosEfectivos`, `riesgoLesion` y `bonusDT` en vez de leer atributos crudos.
2. En el `Resultado`, por jugador: minutos, nota (1–10), goles, asistencias, tarjetas y lesión (sí/no; la gravedad la pone `mercado`).
3. Aplicar el rasgo calentón (tarjetas ×1,6) y el bonus del psicólogo y del DT motivador en clásicos y finales.
4. Si no hay arquero disponible, poner a un jugador de campo (por eso todos tienen Atajada).

### Movidas
1. Leer rasgos, banderas (`quiereIrse`, `idolo`, `noRenueva`), `animo` del DT y ofertas `especial` desde la porción `mercado`.
2. Usar los ids del catálogo de efectos temporales (§5) en los Efectos `temporal`.
3. Variables nuevas para textos: `{dt}`, `{utilero}`, `{representante}`, `{comprador}`, `{juvenil}`, `{ojeador}`.
4. Que la frecuencia de movidas por rasgo la defina `movidas`; acá solo hay efectos mecánicos chicos, para no contar dos veces.

### Club
1. Cupos: tomo los de `club` §2.4 y sus ids. Alinear los ids de regiones de ojeo (`ojeadores.regiones` 1–5 de `club`) con las regiones de §12.2: propongo nivel 1 AMBA, 2 resto del país, 3 Río de la Plata/Paraguay y Andes, 4 Caribe sudamericano y Brasil, 5 Europa y Golfo.
2. No guardar ids de staff en `Edificio` (el staff vive en `mercado` con su tipo; el edificio sale del tipo).
3. Exponer nivel y estado de obra de cada edificio (cancha, gimnasio, médico, comedor, ojeadores, pensión, prensa, consultorio, oficinas).
4. CLU-5, 6, 6c y 7 se movieron a `specs/mercado/requirements.md`: dejarles una línea que apunte acá.

---

## 21. Preguntas para el usuario

1. **Escala 1–99 con estrellas visibles.** Los números se ven en la ficha y las estrellas en las listas, como un BOLA con más detalle. ¿O preferís mostrar solo estrellas y barras, sin números?
2. **Países reales con nombres inventados** (Uruguay, Paraguay, Colombia, Brasil) y regiones de ojeo argentinas (AMBA, Litoral, Cuyo…). ¿Va, o querés países inventados también para que cuadre con "la ambientación no está atada a Argentina"?
3. **Cupo de 6 extranjeros.** Es una regla real y da decisiones. ¿La dejamos?
4. **Libres en cualquier momento.** Propongo que sí (para tapar un arquero lesionado), pero que las compras y préstamos sean solo en ventana. ¿De acuerdo?
5. **Pases en cuotas** (V1) con riesgo de que no paguen e inhibición: muy argentino y da movidas, pero suma complejidad. ¿Lo querés?
6. **Rasgos extra** para V1: *del club* (no se quiere ir, cobra menos), *mercenario* (va adonde paguen), *pecho frío* (rinde menos en finales). ¿Sí, no o cuáles?
7. **Entrenamiento**: foco + intensidad para todo el plantel cada semana (propuesto, rápido) o también foco individual por jugador (V1, más gestión).

---

## 22. Críticas honestas y riesgos

- **El contrato del núcleo no alcanza para programar** (pedidos 1, 2, 3 y 5 de núcleo). No es un detalle: sin eso, ni la evolución semanal ni una compra se pueden expresar de forma pura. Conviene resolverlo antes de la fase 3.
- **MVP inconsistente en `club`**: la oficina de ojeadores y la cancha de entrenamiento son MVP, pero el staff (CLU-5) y los ojeadores (CLU-7) eran V1. Lo resolví haciendo que en MVP los edificios den efecto por nivel aunque no haya staff; con staff (V1) se suma.
- **Riesgo de pantallas eternas**: regatear con el club y después con el jugador puede aburrir en sesiones de 5–15 minutos. Por eso hay un tope de 3 rondas, respuesta al día siguiente y una sola pantalla para el jugador. Si en pruebas se hace pesado, la alternativa es "oferta con probabilidad visible" y un solo toque.
- **1.250 jugadores simulados** es mucho para un juego de navegador. Entra en tiempo y en guardado (≈ 650 KB), pero exige poda: borrar retirados y el exterior que no se vio.
- **Muchos números chicos** (rasgos, staff, DT) que se suman: si cada uno da +2, todo junto rompe el equilibrio. Propongo un tope global para los atributos efectivos (+8 sobre el atributo base) y medirlo con las simulaciones.
- **El dinero de los rivales es una abstracción** (`fondosPases`). Si `economia` algún día quiere cajas reales de los rivales, hay que migrar.
