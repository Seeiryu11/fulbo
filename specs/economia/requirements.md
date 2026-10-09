# Economía — Requisitos

Estado: `aprobado` · Prefijo: `ECO` · Dueño: agente `economia`

## Resumen

La economía la diseña el agente `economia` y la revisa el usuario. Tiene que ser **divertida, legible y justa**: que siempre haya algo para hacer con la plata, que las malas decisiones duelan pero no terminen la partida, y que **nada que se pague con plata real dé ventaja deportiva**.

## Principios (no negociables)

1. **No pay-to-win.** Si algún día hay monetización, solo puede ser cosmética o de comodidad sin efecto deportivo (camisetas especiales, temas, estadios de exhibición). Nunca jugadores, atributos, obras, velocidad de obra ni resultados.
2. **Monedas:** una **moneda única mundial** (nombre provisional Áureo) y la **Fama** (seguidores). Sin moneda premium.
3. **Decisiones con trade-off:** cada gasto compite con otro (¿tribuna nueva o un 9?). No hay una estrategia obvia que gane siempre.
4. **Sin game over por plata:** quebrar dispara una cadena de movidas (concurso de acreedores, venta forzada, intervención) en vez de terminar el juego.
5. **Anti bola de nieve:** el que crece mucho paga más mantenimiento, sueldos e impuestos; el que va abajo recibe ayudas (premios por ascenso, derechos de TV mínimos).
6. **Sin inflación ni tipo de cambio** (decisión 2026-10-09): precios estables y legibles.

## Requisitos

### ECO-1 · Fuentes y sumideros — MVP
1. EL SISTEMA DEBE registrar cada ingreso y gasto con su **concepto** (recaudación, sponsors, TV, premios, ventas, merchandising / sueldos, obras, mantenimiento, compras, staff, multas, impuestos).
2. EL SISTEMA DEBE mostrar un **balance** por semana y por temporada, entendible en un vistazo.

### ECO-2 · Curva de progreso — MVP
1. EL SISTEMA DEBE calibrar precios y premios para que un club bien manejado:
   - pueda hacer una obra chica cada 2–3 fechas y una grande cada 8–10;
   - pueda pelear el ascenso en su **primera o segunda** temporada;
   - llegue a un estadio de categoría 4–5 en unas 5–8 temporadas.
2. EL SISTEMA DEBE poder correr temporadas sin pantalla (NUC-7) para medir esas curvas.

### ECO-3 · Tabla de precios editable — MVP
1. EL SISTEMA DEBE tener todos los precios, sueldos, premios y factores en archivos de datos editables, no en el código.

### ECO-4 · (eliminado 2026-10-09: sin inflación)

### ECO-5 · Precio de las entradas — MVP
1. EL SISTEMA DEBE dejar que el usuario fije el precio de cada sector (popular, platea, palcos) antes de cada partido de local.
2. EL SISTEMA DEBE calcular la asistencia según el precio: muy cara = tribunas vacías y hinchas enojados; muy barata = sobreventa con riesgo de incidentes y sanciones.

### ECO-6 · Moneda única mundial — MVP
1. EL SISTEMA DEBE usar una sola moneda mundial para todo (caja, sueldos, entradas, obras, fichajes, sponsors, premios), sin inflación ni tipo de cambio.
2. EL SISTEMA DEBE tener el nombre, símbolo y formato de la moneda en datos editables, para poder cambiarlo sin tocar código.

## Preguntas abiertas
- **P1** Valores concretos: los propone el agente `economia` en `design.md` y los aprueba el usuario.
