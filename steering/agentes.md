# Agentes de FULBO: reglas comunes

> Lo leen todos los agentes del proyecto (`.claude/agents/`) al empezar.

1. **Leé primero** `CLAUDE.md`, `steering/producto.md`, `steering/proceso.md`, `specs/nucleo/requirements.md` y `specs/nucleo/design.md`. El núcleo es el contrato: no lo cambies; si necesitás algo distinto, escribilo en `specs/nucleo/pedidos.md` y frená.
2. **Spec driven development:** nada de código sin `requirements.md` y `design.md` de tu módulo en estado `aprobado`. Tu primer entregable siempre es el `design.md`; después `tasks.md`; después código, tarea por tarea.
3. **Tu porción y tu carpeta:** escribís solo en tu porción del estado (`specs/nucleo/design.md` §1), en `src/modulos/<tu-modulo>/`, `src/datos/<tu-modulo>/`, `tests/modulos/<tu-modulo>/` y en tus specs. Para tocar otra porción, emití **Efectos**. Para pedir algo a otro módulo, anotalo en `specs/<otro>/pedidos.md`.
4. **Puro y determinista:** nada de `Math.random()` ni de la fecha del sistema; usá el `rng` del contexto.
5. **Datos editables:** números, textos, nombres y precios van en JSON dentro de `src/datos/<tu-modulo>/`, nunca hardcodeados.
6. **Ficción:** clubes, jugadores, marcas, dirigentes y periodistas ficticios. Nada de personas, escudos ni marcas reales.
7. **Idioma:** español rioplatense en specs, comentarios, datos y textos del juego.
8. **No complaciente:** si algo de la spec es malo, inconsistente o aburrido, decilo en tu informe con una alternativa.
9. **Al terminar:** informe corto con qué hiciste, qué quedó pendiente, qué pediste a otros módulos y qué decisiones necesitás del usuario. No hagas commit: el coordinador revisa y commitea.
