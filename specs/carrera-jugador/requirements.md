# Carrera de jugador — Requisitos

Estado: `postergado` · Prefijo: `CAR` · Referencias: `referencias/analisis.md` (Potrero)

> Separado a pedido (2026-10-07): por ahora el juego es solo de **dueño**. Esta spec junta las ideas del jugador propio para implementarlas más adelante sin perderlas. No se diseña ni se construye hasta que se reactive.

## Idea

Un modo o capa donde tenés **tu propio jugador**, estilo Potrero: decisiones en primera persona ("te tatuás antes de la final", "te subieron a TikTok", "te cazaron de joda"), progresión individual y, a largo plazo, la posibilidad de que ese jugador sea también el dueño del club.

## Requisitos candidatos (borrador sin aprobar)

- **CAR-1** Crear a tu jugador: nombre, apodo, posición (9 delantero, 10 enganche, 1 arquero…), nacionalidad, look, con opción "Al azar" y "Pibe maravilla".
- **CAR-2** Progresión individual: atributos, fama, gloria, valor, y estado en la selección (Sin chance → Uno más → Querido → Referente).
- **CAR-3** Eventos del Despacho con `alcance: yo`, en primera persona.
- **CAR-4** Lujos personales (auto, casa, mansión con cancha, yate, "el potrero de tu barrio") y staff personal (cocinero, kinesiólogo, psicólogo, asesor de prensa).
- **CAR-5** Ofertas personales: Arabia, el clásico rival ("traición"), Europa.
- **CAR-6** Integración con el club: jugar en tu propio club, o ser jugador-dueño.

## Qué hay que dejar preparado mientras tanto

- El modelo de movidas del Despacho debe permitir agregar `alcance: 'yo'` sin romper los eventos existentes.
- El jugador del plantel no debe asumir que nunca habrá uno "controlado por el usuario".
