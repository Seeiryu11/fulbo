# Interfaz — Requisitos

Estado: `aprobado` · Prefijo: `INT` · Depende de: `steering/producto.md` (estética), `specs/club`, `specs/despacho`, `specs/partido`

## Resumen

Toda la interfaz del juego, construida **antes** que el partido jugable: HUD estilo BOLA, predio isométrico y todas las pantallas y modales. Se arranca con datos de prueba (mock) y se va conectando a la lógica real a medida que se implementa cada spec. No hay marco de Facebook ni de ninguna red: el juego ocupa toda la pantalla.

## Mapa de pantallas

```
Juego (pantalla completa)
├── HUD (escudo y nombre, nivel+XP, Pesos, Fama, contador del Despacho, configuración)
├── PREDIO (pantalla principal, isométrica)
│   ├── Estadio → modal Estructura (sectores y piezas)
│   ├── Edificio → modal Edificio (nivel, efecto, mejorar, staff)
│   └── Botón JUGAR → flujo de fecha
├── DESPACHO (feed de eventos) → modal Decisión → modal Desenlace
├── PLANTEL (lista) → ficha de jugador
├── TÁCTICA (formación, titulares, estilo, charla, cábala)
├── DTs (catálogo y contrato)
├── MERCADO / OJEADORES
├── IDENTIDAD (escudo, camiseta, nombre, tema del predio)
├── SPONSORS (espacios y ofertas)
├── FIXTURE y TABLAS (B Nacional / Primera)
├── DIARIO (novedades estilo SportNews)
├── FECHA: PREVIA → SIMULACIÓN (relato) → JUGADA CLAVE → RESUMEN (publicación del club)
└── CREACIÓN (primera vez: tu club)
```

## Requisitos

### INT-1 · Pantalla de juego — MVP
1. EL SISTEMA DEBE ocupar toda la ventana del navegador con el juego, sin imitar Facebook ni otra red social.
2. EL SISTEMA DEBE escalar el contenido para verse bien desde 1280×720 hasta pantallas grandes.

### INT-2 · HUD — MVP
1. EL SISTEMA DEBE mostrar siempre escudo y nombre del club, nivel con barra de XP, Pesos, Fama y contador de eventos pendientes del Despacho.
2. CUANDO un valor cambia, EL SISTEMA DEBE animar el cambio (contador que sube o baja, "+5.000").

### INT-3 · Predio — MVP
1. EL SISTEMA DEBE mostrar el club como una aldea isométrica con el **estadio grande a un costado** como protagonista y la **villa** (resto de edificios) agrupada del otro lado, con paisaje según la ambientación (CLU-1).
2. EL SISTEMA DEBE permitir desplazar y hacer zoom (arrastrar, rueda o pellizcar).
3. EL SISTEMA DEBE mostrar sobre cada edificio su estado: en obra (fechas restantes), mejora disponible o staff vacante.

### INT-4 · Modales y navegación — MVP
1. EL SISTEMA DEBE usar modales estilo BOLA (panel con borde grueso, título con contorno, botón X rojo) para todas las pantallas secundarias.
2. EL SISTEMA DEBE tener una barra de navegación hacia: Predio, Despacho, Plantel, Táctica, Fixture y "Más".
3. EL SISTEMA DEBE poder volver atrás con el botón del navegador o del sistema.

### INT-5 · Flujo de fecha — MVP
1. CUANDO toco JUGAR, EL SISTEMA DEBE mostrar la **previa** (rival, comparación de equipos, táctica, charla, cábala).
2. CUANDO confirmo, EL SISTEMA DEBE mostrar la **simulación** como relato en vivo acelerado (texto, marcador, reloj, barra de Aguante).
3. CUANDO llega una jugada clave, EL SISTEMA DEBE abrir el **minijuego** correspondiente (al principio puede ser un placeholder).
4. CUANDO termina, EL SISTEMA DEBE mostrar el **resumen** como publicación de las redes del club, y después las recompensas, el avance de obras y los eventos nuevos del Despacho.

### INT-6 · Creación inicial — MVP
1. LA PRIMERA VEZ, EL SISTEMA DEBE guiar la creación de tu club (nombre, colores, escudo, camiseta, tema del predio) en pocos pasos.
2. EL SISTEMA DEBE ofrecer "Al azar" en cada paso.

### INT-7 · Datos de prueba — MVP
1. EL SISTEMA DEBE poder funcionar entero con datos mock (club, plantel, eventos, DTs, sponsors, ligas) mientras la lógica no está implementada.
2. EL SISTEMA DEBE leer esos datos del mismo formato que va a usar la lógica real.

### INT-8 · Celular — V1
1. EL SISTEMA DEBE funcionar desde 360 px de ancho, con la navegación como barra inferior y sin scroll horizontal.
2. EL SISTEMA DEBE tener objetivos táctiles de al menos 44 px.

### INT-9 · Sonido — Después
1. EL SISTEMA PUEDE tener efectos de UI (monedas, clic, gol) y música de menú, con botón de silencio.

## Decisiones tomadas
- **D1 (2026-10-07, corregida) · Navegador primero, sin marco.** Se diseña para navegador de escritorio, a pantalla completa. No hay Facebook falso: BOLA era un juego de Facebook y eso era solo contexto. Celular en V1 (INT-8).
- **D2 (2026-10-07, revisada) · Arte: en revisión.** El SVG isométrico se descartó por verse infantil. Se busca un look profesional como los estadios 3D de BOLA (`referencias/estadios-bola/`). Propuesta: 3D en el navegador con Three.js (prueba: `referencias/mockups/predio-3d.png`).
- **D3 (2026-10-07) · Vos sos el dueño.** La creación inicial es solo del club; no se crea jugador propio.
