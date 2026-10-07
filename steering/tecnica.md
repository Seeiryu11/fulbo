# Técnica

Estado: `propuesta` (el stack es una opción recomendada, no una decisión cerrada)

## Stack propuesto

| Capa | Elección | Por qué |
|------|----------|---------|
| Lenguaje | **TypeScript** | El modelo de datos es grande (club, plantel, eventos); los tipos evitan romper cosas entre specs. |
| Build / dev server | **Vite** | Arranca al instante, recarga en vivo y genera un sitio estático que se sube a cualquier lado. |
| UI (menús, modales, HUD, Muro) | **Preact** + CSS propio | Componentes como React pero livianos. La UI es casi toda paneles y listas. |
| Predio isométrico | **SVG** generado por código | Arte intermedio vectorial: sombras, gradientes y brillo. Cada pieza del estadio es un componente que se puede cambiar por arte final sin tocar la lógica. |
| Partido jugable (fase 5) | **PixiJS** sobre canvas | Recién cuando lleguemos; no se instala antes. |
| Estado del juego | Store propio (un objeto `Partida` + acciones puras) | Lógica separada de la UI y testeable sin navegador. |
| Guardado | **localStorage** / IndexedDB en el navegador | Sin backend hasta la parte social. |
| Tests | **Vitest** | Para la lógica (economía, obras, eventos, simulación). |
| Validación de datos | **Zod** | Valida los JSON de eventos, DTs y sponsors al cargarlos (MUR-5.2). |
| App móvil (después) | PWA → Capacitor si hace falta tienda | Mismo código. |

**Requisito de entorno:** hace falta **Node.js LTS** en la PC (hoy no está instalado). Se instala igual que ffmpeg:

```bash
winget install OpenJS.NodeJS.LTS
```

## Arquitectura

```
src/
  dominio/        tipos + reglas puras (sin UI): club, estadio, economia, liga, muro, simulacion
  datos/          JSON editables: eventos, dts, sponsors, piezas, edificios, frases de relato, nombres
  estado/         la Partida en curso, acciones, guardado
  ui/
    hud/
    pantallas/    predio, muro, plantel, tactica, dts, mercado, identidad, sponsors, fixture, diario, fecha/*
    componentes/  Modal, Boton, Panel, Contador, Avatar, Escudo, Camiseta...
    iso/          SVG isométrico: Estadio, Pieza, Edificio, Terreno
  tests/
```

Regla: `dominio/` no importa nada de `ui/`. La UI solo lee el estado y llama acciones.

## Modelo de dominio (compartido por todas las specs)

```ts
type Id = string

interface Partida {
  version: number
  semilla: number
  temporada: number            // 1, 2, 3...
  fecha: number                // fecha actual dentro de la temporada
  club: Club
  ligas: { bNacional: Liga; primera: Liga }
  muro: EventoInstancia[]
  marcas: Record<string, number | boolean>  // flags globales para cadenas (MUR-4)
}

interface Club {
  id: Id; nombre: string; apodo: string
  colores: [string, string, string?]
  escudo: { forma: string; icono: string; iniciales: string }
  camiseta: { patron: 'lisa'|'bastones'|'franja'|'banda'|'aros'|'cuartos'; colores: string[]; cuello: string }
  tema: 'barrio'|'ciudad'|'costa'|'montana'|'luna'
  nivel: number; xp: number
  pesos: number; fama: number
  ciudad: { tipo: 'conurbano'|'capital'|'interior'|'pueblo'|'puerto'|'turistica'; region: string }
  relaciones: Record<'hinchas'|'barra'|'socios'|'comision'|'afa'|'municipio'|'prensa'|'sponsors'|'plantel', number>  // 0–100
  estadio: Estadio
  edificios: Edificio[]
  cuadrillas: number
  plantel: Jugador[]
  dt?: ContratoDT
  sponsors: ContratoSponsor[]
  tactica: Tactica
}

interface Estadio {
  sectores: Record<'norte'|'sur'|'este'|'oeste'|'cancha'|'techo'|'luces'|'pantalla'|'palcos', Id | null>  // id de pieza
  obras: Obra[]
}
// Capacidad, Valor y Lujo se calculan a partir de las piezas (no se guardan).

interface Pieza { id: Id; sector: string; nombre: string; precio: number; nivelRequerido: number;
                  fechasObra: number; capacidad: number; valor: number; lujo: number }

interface Edificio { tipo: TipoEdificio; nivel: number; obra?: Obra; staff: Id[] }
interface Obra { objetivo: string; fechasRestantes: number }

interface Jugador {
  id: Id; nombre: string; apodo?: string; edad: number
  posicion: 'ARQ'|'DEF'|'MED'|'DEL'
  atributos: { pegada: number; velocidad: number; gambeta: number; pase: number;
               marca: number; fisico: number; liderazgo: number; atajada?: number }
  fisico: number; moral: number                 // 0–100, cambian fecha a fecha
  personalidad: ('fiestero'|'cabulero'|'influencer'|'calenton'|'profesional')[]
  efectos: EfectoTemporal[]                     // resaca, lesión, motivado...
  sueldo: number; contratoHasta: number
}

interface DT { id: Id; nombre: string; apodo: string; estilo: string; nivel: number; precio: number;
               duracionFechas: number; bonus: Efecto[] }
interface ContratoDT { dt: Id; fechasRestantes: number }

interface Sponsor { id: Id; marca: string; rubro: string; espacio: string; pagoPorTemporada: number;
                    requisitos: Condicion[]; efectosSecundarios: Efecto[] }

interface Liga { nombre: string; equipos: EquipoLiga[]; fixture: Partido[][]; }
interface Partido { local: Id; visitante: Id; resultado?: [number, number]; eventos?: EventoPartido[] }

// Muro
interface EventoDef {               // vive en datos/eventos/*.json
  id: string
  alcance: 'jugador'|'club'
  ambito: 'plantel'|'staff'|'sponsors'|'hinchas'|'politica'|'afa'|'ciudad'|'prensa'|'economia'|'obras'|'mercado'|'inferiores'
  canal: 'video'|'tuit'|'story'|'whatsapp'|'llamado'|'mail'|'carta_documento'|'comunicado'|'diario'|'radio'|'stream'|'reunion'
  disparador: { momento: Momento[]; condiciones: Condicion[]; peso: number; enfriamiento: number }
  texto: string                     // admite {jugador} {rival} {sponsor} {club}
  opciones: { texto: string; efectos: Efecto[]; desenlace: string; habilita?: string[] }[]
  vence?: number; opcionPorDefecto?: number
}
interface EventoInstancia { def: string; jugador?: Id; creadoEn: { temporada: number; fecha: number }; resuelto?: number }

type Efecto =
  | { tipo: 'pesos' | 'fama'; valor: number }
  | { tipo: 'relacion'; con: keyof Club['relaciones']; valor: number }
  | { tipo: 'atributo'; jugador: 'objetivo'|'plantel'; atributo: string; valor: number }
  | { tipo: 'moral' | 'fisico'; jugador: 'objetivo'|'plantel'; valor: number }
  | { tipo: 'temporal'; jugador: 'objetivo'|'plantel'; efecto: string; fechas: number }
  | { tipo: 'azar'; probabilidad: number; si: Efecto[]; sino?: Efecto[] }
  | { tipo: 'marca'; clave: string; valor: number | boolean }
```

Este modelo es una primera versión. Cada `design.md` de feature puede extenderlo, y si lo cambia, se actualiza acá.

## Preguntas abiertas
- **P1** El stack queda como **opción recomendada**, no cerrada (pedido del usuario, 2026-10-07). Se confirma al empezar la fase 2. Requiere Node.js LTS.
