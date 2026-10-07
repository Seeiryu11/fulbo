# Producto

> Documento de dirección: vale para todas las specs. Si una spec contradice esto, se corrige la spec o se actualiza este documento a propósito.

## Pitch

> Sos el dueño de un club que arranca en la B Nacional. Armás el estadio tribuna por tribuna, contratás DTs, ojeadores y nutricionistas, firmás con una casa de apuestas, y bancás que tu 9 se tatúe la copa antes de la final y que un TikTok de anoche dé vueltas por el vestuario. Con la cara y la sensación de BOLA, el juego de Facebook de 2011, pero con el fútbol de hoy.

## Quién sos

- **El dueño del club.** Manejás todo: obras, plantel, táctica, staff, DTs, sponsors y las decisiones del Muro.
- La carrera de un jugador propio (estilo Potrero, primera persona) queda **postergada** en `specs/carrera-jugador`, para agregarla más adelante.

## Pilares

1. **El partido** — se simula con jugadas clave definidas por minijuegos. El partido jugable 3/4 estilo BOLA llega al final. → `specs/partido`
2. **El club** — estadio por piezas, predio, staff, DTs, plantel, camiseta, sponsors y liga. Se mejora por partes, estilo Clash of Clans + modo carrera. → `specs/club`
3. **El Muro** — eventos con decisiones locas, realistas y con sabor, estilo Potrero, que le pasan a tus jugadores y al club. → `specs/muro`

## Ambientación

- **Es hoy.** El fútbol argentino actual, con todo: casas de apuestas, exchanges cripto, billeteras virtuales, cerveza, TikTok, streamers, Instagram, X, VAR, Arabia, fondos que quieren comprar clubes, inflación, barras, representantes.
- **La nostalgia está en el estilo visual**: el look y la sensación de los juegos sociales de 2011 (BOLA, Playdom). **No** se imita Facebook ni ninguna red: BOLA era un juego de Facebook y eso es solo contexto.
- **Argentino de verdad**: voseo, relato radial, cábalas, el utilero, la parrilla del club, el kiosco, el dólar.

## Tono

- Humor con cariño. Se ríe del fútbol, no de personas reales.
- PG-13: joda, boliche, tatuajes, escándalos y apuestas, sí. Sexo explícito, menores en situaciones de riesgo o discurso de odio, no.
- Las apuestas y la cripto aparecen como **sátira y ambiente** (sponsors, eventos, tentaciones con consecuencias). El juego no tiene apuestas con plata real.

## Estética

- **Base BOLA/Playdom**: paneles amarillos con brillo, botones gordos, tipografía con contorno y sombra, íconos 3D chicos, isometría con volumen y césped a cuadros.
- **Arte intermedio** al principio: lindo y terminado a la vista, en vectores (SVG), reemplazable por arte final sin tocar la lógica.
- **Paleta inicial**: amarillo panel `#F5C518`, verde cancha `#2E8B3A`, azul cielo `#4FA3E0`, rojo `#E02424`, crema `#FFF6D5`.

## Reglas de contenido

- Clubes, jugadores, marcas y ligas **ficticios**. Se permiten guiños reconocibles, nunca nombres ni escudos reales.
- Sponsors ficticios por rubro: cerveza, casa de apuestas, exchange cripto, billetera virtual, yerba, telefonía, corralón, prepaga.

## Plataforma

- Navegador primero, responsive para que ande en celular, instalable como PWA. Tiendas después.
- Sesiones cortas (5–15 min) con algo para hacer siempre al volver.

## Fuera de alcance (por ahora)

- Carrera de jugador propio (`specs/carrera-jugador`, postergada).
- Multijugador en tiempo real.
- Monetización y moneda premium (solo Pesos y Fama hasta que el juego esté aceitado).
- Licencias reales.
