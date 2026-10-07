# Núcleo — Requisitos

Estado: `aprobado` · Prefijo: `NUC` · Dueño: coordinador (sesión principal) · Lo usan: todos los agentes

## Resumen

El núcleo es la columna del juego: el **tiempo** (temporada, semana, día), el **ciclo entre partidos**, el **estado de la partida** y las **reglas de convivencia** entre módulos (club, mercado, liga, partido, movidas, economía). Todo lo demás se enchufa acá. Ningún agente arranca su parte sin que el núcleo esté aprobado.

## Requisitos

### NUC-1 · El tiempo: temporada, semana y día — MVP
1. EL SISTEMA DEBE medir el tiempo en **temporada** (un año), **semana** (1 a 52) y **día** (lunes a domingo).
2. EL SISTEMA DEBE mostrar siempre la fecha actual ("Semana 41 · martes 6 de octubre") y el **próximo partido** del club.
3. Una temporada DEBE durar un año calendario, con pretemporada, liga, copa, ventanas de pases y receso.

### NUC-2 · El ciclo entre partidos — MVP
**Historia:** Como dueño, quiero que todo lo que hago (obras, compras, movidas, táctica) pase antes del próximo partido, y que tocar JUGAR me lleve a jugarlo.
1. MIENTRAS falta para el próximo partido del club, EL SISTEMA DEBE estar en **fase de gestión**: se puede construir, comprar, contratar, resolver movidas y armar la táctica.
2. CUANDO toco JUGAR, EL SISTEMA DEBE avanzar el calendario día por día hasta el día del partido, aplicando lo que pasa cada día (entrenamientos, recuperación, obras, informes de ojeadores, movidas nuevas, partidos de otros equipos).
3. SI en el camino aparece algo que requiere decisión (una movida con vencimiento, una oferta), ENTONCES EL SISTEMA DEBE frenar el avance y mostrarlo.
4. CUANDO llega el día del partido, EL SISTEMA DEBE pasar por **previa → partido → resumen**, y después volver a la fase de gestión hacia el siguiente partido.
5. EL SISTEMA DEBE ofrecer **avance rápido**: simular varios partidos seguidos hasta el próximo evento importante (fin de mercado, final, movida grave), para que una temporada de 38 fechas no se haga eterna.

### NUC-3 · Estado de la partida y módulos — MVP
1. EL SISTEMA DEBE guardar toda la partida en un único estado serializable (JSON) con versión.
2. EL SISTEMA DEBE dividir el estado en **porciones**, una por módulo: `club`, `mercado`, `liga`, `partido`, `movidas`, `economia`.
3. Cada módulo DEBE escribir solo su porción. Para cambiar algo de otra porción, DEBE emitir un **Efecto** (lenguaje común definido en el diseño) que el núcleo aplica.
4. EL SISTEMA DEBE permitir que cada módulo se enganche en momentos fijos del ciclo: inicio de partida, cada día, antes del partido, después del partido, fin de semana, fin de temporada.

### NUC-4 · Azar con semilla — MVP
1. EL SISTEMA DEBE usar un generador de azar con semilla, con un flujo separado por módulo, para que la misma partida con las mismas decisiones dé siempre lo mismo (repeticiones, pruebas, depuración).

### NUC-5 · Noticias — MVP
1. EL SISTEMA DEBE tener un registro de **noticias** al que todos los módulos pueden escribir (resultados, fichajes, obras terminadas, movidas), que alimenta el diario y las notificaciones.

### NUC-6 · Guardado — MVP
1. EL SISTEMA DEBE guardar automáticamente después de cada partido y de cada decisión importante.
2. EL SISTEMA DEBE poder migrar partidas guardadas cuando cambia la versión del estado.

### NUC-7 · Simulación sin pantalla — MVP
1. EL SISTEMA DEBE poder correr una temporada completa **sin interfaz** (para pruebas y balance), tomando decisiones automáticas por defecto.
2. Una temporada completa sin interfaz DEBE correr en menos de 10 segundos en una compu normal.

## Decisiones tomadas
- **D1 (2026-10-07)** El tiempo se cuenta en semanas y días; todo lo que hacés queda antes del próximo partido (ej.: semana 41, partido el martes 6; después el sábado 10; después semana 42, martes 13).
- **D2 (2026-10-07)** El núcleo lo arma el coordinador antes que los agentes; los agentes trabajan sobre sus contratos.

## Preguntas abiertas
Ninguna bloqueante.
