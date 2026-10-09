# Interfaz — Diseño

Estado: `en revisión` · Cubre: INT-1 a INT-9 · Reescrito el 2026-10-09 para 3D (reemplaza la versión SVG isométrica, descartada).
Referencias visuales: `referencias/mockups/predio-europeo.png`, `predio-montana.png`, `estadio-europeo-hero.png`, `referencias/estadios-bola/`.

## 1. Capas de la pantalla

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ HUD  [escudo] Atlético Villa Ferro ★★★☆☆ Nv 7 ▓▓▓░  │ 💰 $ 1.245M │ ⭐ 4,3k │      │  capa 3: HUD (HTML)
│      📅 Semana 41 · martes 6 · Próximo: vs Deportivo Sur (Copa, mar 6)  ⚙       │
├───────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│     ESTADIO (protagonista, a un costado)          LA VILLA                    │  capa 1: escena 3D (canvas WebGL)
│     categoría × estilo × piezas                   sede/Despacho, prensa, …    │  capa 2: etiquetas y burbujas (HTML
│                                                                               │           proyectadas desde 3D)
│     entorno de fondo: ciudad / campo / montaña / frío / Caribe…               │
│                                                                               │
│ ( JUGAR )                                                       [ Diario ]    │  capa 3
│ ┌───────────────────────────────────────────────────────────────────────────┐ │
│ │ 🏟 Club   📣 Despacho (3)   👥 Plantel   📋 Táctica   📅 Fixture   ⋯ Más   │ │  capa 3: navegación
│ └───────────────────────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────────┘
            capa 4: modales (encima de todo, fondo oscurecido)
```

- **Capa 1 — escena 3D:** un único `<canvas>` Three.js a pantalla completa. Se pausa (no renderiza) mientras hay un modal a pantalla completa.
- **Capa 2 — etiquetas:** divs HTML posicionados proyectando puntos 3D (como en el prototipo). Se ocultan si quedan detrás de la cámara o fuera de cuadro.
- **Capa 3 — HUD y navegación:** HTML/CSS con el estilo gordito de BOLA (paneles con brillo, botones gruesos, tipografía con contorno).
- **Capa 4 — modales:** paneles BOLA para todas las pantallas secundarias.

Lienzo de referencia **1280×720**, escalado para llenar la ventana; la escena 3D usa el tamaño real de la ventana.

## 2. Escena 3D del club

> El contenido de la escena (estadio por piezas, villa, entornos) lo diseña el agente `club` en `specs/club/design.md`. Acá se define el marco común.

- **Cámara:** perspectiva con FOV ~32°, ángulo 3/4 fijo (mirando hacia el horizonte para que se vea el entorno de fondo). Se define por un **punto de mira** + **distancia**:
  - arrastrar = desplazar el punto de mira (limitado al mapa);
  - rueda / pellizco = distancia (zoom) entre un mínimo y un máximo;
  - doble clic en un edificio = acercarse a él.
  - Al abrir el juego encuadra estadio y villa completos (INT-3.2).
- **Selección:** raycast sobre los objetos del club; cada objeto seleccionable lleva `userData = { tipo: 'pieza'|'edificio'|'lote', id }`. Al pasar el mouse se resalta y aparece la etiqueta.
- **Luz:** sol direccional con sombras + luz hemisférica; el entorno define colores y niebla.
- **Rendimiento:** 60 fps en una notebook común con GPU integrada. Árboles, butacas, autos y público con `InstancedMesh`. Mapa de sombras de 2048 en juego (4096 solo para capturas).
- **Render bajo demanda:** se renderiza cuando cambia la cámara, la escena o hay animación (obras, banderas). Si no, queda quieta y no consume.

## 3. HUD

| Elemento | Contenido | Interacción |
|----------|-----------|-------------|
| Club | escudo, nombre, estrellas, división y posición, nivel y XP | abre Identidad |
| Pesos | caja actual, abreviada ($ 1.245M) | abre el balance económico |
| Fama | seguidores | tooltip con tendencia |
| **Calendario** | "Semana 41 · martes 6" y el próximo partido (rival, competición, día) | abre Fixture |
| Despacho | contador de movidas pendientes | abre el Despacho |
| Configuración | sonido, guardado, créditos | modal |

Todo número que cambia se anima ("+5.000", contador que corre).

## 4. Pantallas

| Ruta | Pantalla | Tipo |
|------|----------|------|
| `#/crear` | Creación del club: nombre → colores y escudo → camiseta → ambientación y estilo de estadio ("Al azar" en cada paso) | pantalla completa |
| `#/club` | Escena 3D (por defecto) | principal |
| `#/club/estadio` | Estadio: categoría, Capacidad/Valor/Lujo, sectores y piezas, salto de categoría | modal |
| `#/club/edificio/:id` | Edificio: nivel, efectos, mejora, staff | modal |
| `#/despacho` · `#/despacho/:id` | Movidas por ámbito · decisión → desenlace | principal · modal |
| `#/plantel` · `#/plantel/:id` | Plantel · ficha del jugador | principal · modal |
| `#/tactica` | Formación, titulares, estilo, charla, cábala | principal |
| `#/mercado` | Mercado de pases, ojeadores, ofertas recibidas | principal |
| `#/staff` | Staff y DT | principal |
| `#/fixture` | Calendario por semanas, tablas (B Nacional, Primera), copas | principal |
| `#/economia` | Balance por semana/temporada, préstamos, **precio de entradas** por sector, dólar e inflación | principal |
| `#/sponsors` · `#/identidad` · `#/diario` | Menú "Más" | principal |
| `#/fecha/previa` → `/partido` → `/jugada` → `/resumen` | Flujo del partido | pantalla completa |

### Flujo del partido (INT-5)

1. **Previa:** rival, competición y estadio; comparación de equipos en barras (como el World Battle de BOLA); táctica, charla y cábala; **precio de entradas** si es de local, con asistencia estimada y riesgo de sobreventa (ECO-5).
2. **Partido simulado:** marcador, reloj, barra de Aguante y relato línea a línea, a x1 / x4 / saltar.
3. **Jugada clave:** minijuego (penal, tiro libre, mano a mano). Placeholder simple hasta que el agente `partido` lo implemente.
4. **Resumen:** publicación de las redes del club con resultado, figura y comentarios, más los **highlights 2D** (pizarra animada, PAR-12). Después: recompensas animadas, obras que avanzan y movidas nuevas.

### Pantalla de avance (NUC-2)

Al tocar JUGAR el calendario corre día por día ("miércoles 7… jueves 8…") con un mini resumen de lo que pasó. Si aparece una interrupción (movida urgente, oferta) se frena y la abre. El **avance rápido** simula varios partidos seguidos hasta el próximo evento importante.

## 5. Estilo visual de la UI

```css
--amarillo: #F5C518; --amarillo-osc: #C99500; --crema: #FFF6D5;
--azul-hud: #2F6FB5; --azul-hud-osc: #1B3F73;
--verde: #2E8B3A; --verde-claro: #5CB85C; --rojo: #C8202F; --naranja: #F08A24;
--texto: #1C1E21; --texto-suave: #606770;
--radio: 14px; --borde: 3px solid #fff;
--sombra-solida: 0 4px 0 rgba(0,0,0,.35); --brillo: inset 0 2px 0 rgba(255,255,255,.35);
```

- Tipografía: **Lilita One** para títulos y números grandes (con contorno y sombra), **Nunito** para texto.
- Botones gordos con gradiente, brillo arriba y sombra sólida que baja al apretar. Objetivos de clic de al menos 44 px.
- Modales: panel amarillo/crema con borde blanco grueso, título con contorno, X roja redonda.

## 6. Tecnología de la UI

- Escena: **Three.js** (decidido).
- Capa HTML (HUD, modales, pantallas): **opción recomendada Preact** + CSS propio; queda abierta (`steering/tecnica.md`). Se decide al empezar la fase 5.
- La UI **solo lee** la `Partida` y despacha **acciones** a los módulos (`reducir`); nunca modifica el estado directo.

## 7. Datos de prueba (INT-7)

Mientras los módulos no estén programados, la UI arranca desde `src/datos/mock/partida.json` con el mismo formato que la `Partida` del núcleo (`specs/nucleo/design.md` §7).

## 8. Trazabilidad

| Requisito | Dónde |
|-----------|-------|
| INT-1 | §1 capas, lienzo de referencia |
| INT-2 | §3 HUD |
| INT-3 | §2 escena 3D, cámara y selección |
| INT-4 | §4 rutas, §5 modales |
| INT-5 | §4 flujo del partido, pantalla de avance |
| INT-6 | §4 `#/crear` |
| INT-7 | §7 |
| INT-8 (V1) | §5 objetivos táctiles; layout celular a diseñar en V1 |
| INT-9 (después) | — |
