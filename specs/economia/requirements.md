# Economía — Requisitos

Estado: `aprobado` · Prefijo: `ECO` · Dueño: agente `economia`

## Resumen

La economía la diseña el agente `economia` y la revisa el usuario. Tiene que ser **divertida, legible y justa**: que siempre haya algo para hacer con la plata, que las malas decisiones duelan pero no terminen la partida, y que **nada que se pague con plata real dé ventaja deportiva**.

## Principios (no negociables)

1. **No pay-to-win.** Si algún día hay monetización, solo puede ser cosmética o de comodidad sin efecto deportivo (camisetas especiales, temas, estadios de exhibición). Nunca jugadores, atributos, obras, velocidad de obra ni resultados.
2. **Monedas:** solo **Pesos** (blanda) y **Fama** (seguidores). Sin moneda premium.
3. **Decisiones con trade-off:** cada gasto compite con otro (¿tribuna nueva o un 9?). No hay una estrategia obvia que gane siempre.
4. **Sin game over por plata:** quebrar dispara una cadena de movidas (concurso de acreedores, venta forzada, intervención) en vez de terminar el juego.
5. **Anti bola de nieve:** el que crece mucho paga más mantenimiento, sueldos e impuestos; el que va abajo recibe ayudas (premios por ascenso, derechos de TV mínimos).
6. **Inflación** como chiste y mecánica: precios y sueldos suben cada temporada, los ingresos acompañan.

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

### ECO-4 · Inflación — V1
1. CUANDO termina una temporada, EL SISTEMA DEBE aplicar inflación a precios y sueldos, y ajustar ingresos para que el poder de compra se mantenga cerca del objetivo de ECO-2.

## Preguntas abiertas
- **P1** Valores concretos: los propone el agente `economia` en `design.md` y los aprueba el usuario.
