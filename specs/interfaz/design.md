# Interfaz — Diseño

Estado: `en revisión` · Cubre: INT-1 a INT-8 · Stack: ver `steering/tecnica.md`

## 1. Layout de escritorio (referencia)

El juego ocupa toda la ventana del navegador. Sin marco de ninguna red.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [escudo] Club Atlético X  ★★★☆☆   Nv 3 ▓▓▓▓░░   💰 $1.2M   ⭐ Fama 4.3k  📣3 ⚙ │  HUD
│                                                                              │
│                                                                              │
│        ESTADIO (protagonista, grande)      │        LA VILLA                   │
│        la atracción principal, crece       │  oficinas, entrenamiento, prensa, │
│        categorías × estilos × piezas      │  inferiores, sede, parrilla…      │
│                                                                              │
│                                                                              │
│  ( PLAY )                                                       [ Diario ]   │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │  🏟 Predio   📣 Despacho (3)   👥 Plantel   📋 Táctica   📅 Fixture   ⋯ Más   │ │  navegación
│ └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Se diseña sobre un lienzo de referencia de **1280 × 720** que escala proporcionalmente para llenar la ventana (`transform: scale` sobre un contenedor fijo). El predio, en cambio, usa todo el espacio disponible y se puede desplazar.
- Los modales se abren centrados sobre el predio, con el fondo oscurecido.
- **Celular (V1):** HUD compacto en dos líneas y navegación como barra inferior fija.
## 2. Dirección visual (arte intermedio)

> **Nota (2026-10-07):** las secciones de isometría SVG de abajo quedaron **obsoletas** por la decisión de pasar a 3D (D2 en `requirements.md`); se reescriben con la escena 3D. Referencia visual actual: `referencias/mockups/predio-europeo.png` y `estadio-europeo-hero.png`.

**Tokens** (`ui/tema.css`):

```css
--cielo: #4FA3E0; --cielo-claro: #BDE3FF; --azul: #2F6FD0; --gris: #F2F2F2;
--panel-amarillo: #F5C518; --panel-amarillo-osc: #D9A400; --panel-crema: #FFF6D5;
--verde-cancha: #2E8B3A; --verde-claro: #5CB85C; --rojo: #E02424; --naranja: #F08A24;
--texto: #1C1E21; --texto-suave: #606770;
--borde-grueso: 3px solid #fff;  --sombra-panel: 0 4px 0 rgba(0,0,0,.25), 0 8px 16px rgba(0,0,0,.2);
--radio: 10px;
```

- **Tipografías** (Google Fonts): títulos con contorno y sombra en **Lilita One** o **Bowlby One** (la vibra gordita de BOLA); texto en **Nunito** (redonda y legible), con Tahoma / Verdana como respaldo.
- **Botones**: gordos, con gradiente vertical (claro arriba, oscuro abajo), brillo blanco semitransparente en la mitad superior, borde oscuro de 2 px, sombra inferior "sólida" de 3 px que baja al apretar.
- **Modales**: panel amarillo con degradé y borde blanco grueso, título centrado con contorno, botón X rojo redondo arriba a la derecha, fondo oscurecido.
- **Isometría** (SVG): proyección 2:1. Cada bloque tiene tres caras con el mismo color en tres tonos (techo claro, frente medio, costado oscuro), una sombra elíptica suave en el piso y un brillo en el borde superior. Césped a cuadros en dos verdes, caminos de tierra o baldosa y árboles redondos de dos tonos.
- **Estadio**: 4 tribunas independientes alrededor de la cancha. Cada pieza (tablón → cemento → platea → techada) es un SVG distinto con color del club en butacas o techo. Las luces, la pantalla y los palcos son piezas que se suman.
- **Íconos**: emoji como placeholder en el MVP. Después se reemplazan por íconos dibujados.

## 3. Navegación y rutas

Router simple por hash (`#/predio`, `#/despacho`, ...) para que funcione el botón atrás (INT-4.3).

| Ruta | Pantalla | Tipo |
|------|----------|------|
| `#/crear` | Creación (jugador → club → camiseta) | pantalla completa, primera vez |
| `#/predio` | Predio isométrico | principal |
| `#/predio/estadio` | Estructura del estadio | modal |
| `#/predio/edificio/:tipo` | Edificio | modal |
| `#/despacho` | Feed | principal |
| `#/despacho/:id` | Decisión → Desenlace | modal |
| `#/plantel` · `#/plantel/:id` | Lista · Ficha | principal · modal |
| `#/tactica` | Formación, titulares, estilo, charla, cábala | principal |
| `#/dts` · `#/mercado` · `#/sponsors` · `#/identidad` · `#/diario` | Menú "Más" | principal |
| `#/fixture` | Fixture y tablas (B Nacional / Primera) | principal |
| `#/fecha/previa` → `/sim` → `/jugada` → `/resumen` | Flujo de fecha | pantalla completa en la ventana |

## 4. Pantallas clave

**Predio** — una aldea isométrica continua: a un costado el **estadio**, grande y protagonista, sobre su terreno reservado completo (al principio una cancha chica pero prolija, con espacio preparado para crecer); del otro lado **la villa**, con las oficinas (Despacho), entrenamiento, ojeadores, prensa y parrilla; el resto de los lotes aparecen como "terreno baldío — se desbloquea en Nv X". Sobre cada edificio: cartel con nivel y, si corresponde, una burbuja ("🚧 2 fechas", "⬆", "👤 vacante"). Abajo a la izquierda, el botón **PLAY** redondo y gigante (como BOLA). Paisaje según la ambientación.

**Estructura del estadio** — panel izquierdo con el estadio y las stats Capacidad / Valor / Lujo; panel derecho con una grilla 3×3 de piezas del sector elegido (miniatura, precio, candado con nivel). Pestañas de sector arriba. Al elegir una pieza se ve la vista previa en el estadio antes de confirmar.

**Despacho** — feed vertical de tarjetas. Cada tarjeta toma la forma de su origen, dibujada con el estilo del juego: video vertical con caption (tipo TikTok), tuit, story, burbuja de audio de WhatsApp, recorte de diario o captura de stream. Lleva avatar, autor ficticio, texto, imagen de plantilla, reacciones y 1–2 comentarios de hinchas. Las tarjetas pendientes muestran el botón **Decidir**. Arriba, un filtro: Todo / Pendientes / Jugadores / Club.

**Decisión** — modal con la imagen de plantilla, el texto y de 2 a 4 botones de opción apilados. No se muestran los efectos exactos, solo pistas de íconos (💵 🔥 😠). Después, el **Desenlace**: texto corto + lista de cambios aplicados ("Moral del Tucu −10", "Fama +2.000").

**Previa** — dos camisetas enfrentadas (como el World Battle de BOLA), comparación de equipos en barras (DEF / MED / ATQ / FÍS / MORAL), selector de charla técnica (3 tarjetas), cábala y botón **Empezar partido**.

**Simulación** — marcador grande arriba con reloj, barra de Aguante y relato en vivo que cae línea por línea ("12' ¡La agarra el Tucu, encara, la pisa...!") a velocidad x1 / x4 / Saltar.

**Jugada clave** — en el MVP es un placeholder: tarjeta "¡PENAL!" con 3 arcos para elegir (izq / centro / der) y resultado aleatorio ponderado. El minijuego real llega en la fase 4.

**Resumen** — publicación de las redes del club: "Club Atlético X 2 – 1 Deportivo Y", foto de plantilla, figura del partido, calificaciones y comentarios. Después, una secuencia de recompensas animada: Pesos, XP, Fama, obras que avanzan y eventos nuevos.

## 5. Componentes base

`HUD`, `Navegacion`, `Ventana` (contenedor escalado), `Modal`, `Boton` (variantes: amarillo, verde, rojo, azul), `Panel`, `Pestanas`, `Contador` (número animado), `BarraProgreso`, `Avatar` (generado por semilla), `Escudo`, `Camiseta` (SVG paramétrico por patrón y colores), `Post`, `TarjetaJugador`, `Iso.Terreno`, `Iso.Bloque`, `Iso.Estadio`, `Iso.Edificio`, `Toast`.

## 6. Datos mock (INT-7)

`src/datos/mock/partida.json` con una `Partida` completa según el modelo de `steering/tecnica.md`: club recién creado en la B Nacional, plantel de 22 jugadores, 6 situaciones del Despacho pendientes, 4 DTs, 5 sponsors y fixture de 20 equipos. La UI arranca desde este archivo hasta que la lógica de las fases 3 y 4 lo reemplace.

## 7. Trazabilidad

| Requisito | Dónde |
|-----------|-------|
| INT-1 | §1 layout a pantalla completa |
| INT-2 | §1 HUD, `HUD`, `Contador` |
| INT-3 | §4 Predio, `Iso.*` |
| INT-4 | §3 rutas, `Modal`, `Navegacion` |
| INT-5 | §4 Previa → Resumen |
| INT-6 | `#/crear` |
| INT-7 | §6 |
| INT-8 (V1) | §1 celular, §2 botones ≥ 44 px |
