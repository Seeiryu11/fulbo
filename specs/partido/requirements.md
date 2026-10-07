# Partido — Requisitos

Estado: `aprobado` · Prefijo: `PAR` · Referencias: `referencias/analisis.md` (BOLA partido, Potrero minijuegos)

## Resumen

El partido es el corazón jugable. Hay un solo motor de simulación que sirve para tres modos: **Jugar** (controlás vos), **Mirar** (juega la IA, acelerado, y podés entrar) y **Simular** (resultado al instante). La vista y la sensación toman de BOLA; el sabor (relato, hinchada, notificaciones) es nuestro.

## Requisitos

### PAR-1 · Motor único de simulación — MVP
**Historia:** Como jugador, quiero que un partido simulado y uno jugado se sientan coherentes, para confiar en los resultados.
1. EL SISTEMA DEBE resolver los tres modos (Jugar, Mirar, Simular) con el mismo motor.
2. EL SISTEMA DEBE ser determinista: mismo estado inicial + misma semilla + mismas entradas = mismo resultado.
3. CUANDO se elige Simular, EL SISTEMA DEBE devolver el resultado en menos de 1 segundo en un celular de gama media.
4. EL SISTEMA DEBE registrar los eventos del partido (goles, tarjetas, lesiones, atajadas, jugadas clave) con minuto y protagonistas.

### PAR-2 · Modo Jugar — V1
**Historia:** Como jugador, quiero manejar a mi equipo en la cancha como en BOLA, para sentir que el resultado depende de mí.
1. EL SISTEMA DEBE mostrar la cancha en vista 3/4 con la cámara siguiendo la pelota.
2. MIENTRAS mi equipo tiene la pelota, EL SISTEMA DEBE darme el control del jugador que la tiene y marcarlo (número + flecha).
3. CUANDO toco o hago clic en un compañero, EL SISTEMA DEBE hacer un pase hacia él.
4. CUANDO toco un espacio vacío, EL SISTEMA DEBE conducir o pasar al espacio hacia ese punto.
5. CUANDO arrastro y suelto, EL SISTEMA DEBE rematar con dirección y fuerza según el gesto, y la precisión según los atributos del jugador.
6. MIENTRAS el rival tiene la pelota, EL SISTEMA DEBE dejarme elegir a quién presionar, con riesgo de falta.
7. EL SISTEMA DEBE funcionar igual con mouse y con pantalla táctil.
8. EL SISTEMA DEBE durar entre 3 y 5 minutos reales por partido (dos tiempos con reloj acelerado).
9. EL SISTEMA DEBE mostrar marcador, reloj, minimapa y textos de evento ("¡Saque de arco!", "¡GOOOL!").

### PAR-3 · Modo Mirar — V1
1. EL SISTEMA DEBE mostrar el partido jugado por la IA a velocidad 1x, 2x o 4x.
2. CUANDO toco "Entrar", EL SISTEMA DEBE pasar a modo Jugar desde ese instante sin reiniciar el partido.

### PAR-4 · Modo Simular y resumen — MVP
1. CUANDO termina un partido simulado, EL SISTEMA DEBE mostrar un resumen con resultado, goleadores, figura y 3 a 5 momentos clave relatados.
2. EL SISTEMA DEBE presentar el resumen como **publicación de las redes del club** (foto, texto, reacciones, comentarios de hinchas generados).

### PAR-5 · Momentos clave como minijuegos — MVP
**Historia:** Como jugador apurado, quiero definir solo las jugadas importantes, como en Potrero.
1. MIENTRAS se simula un partido, EL SISTEMA DEBE poder pausar en jugadas clave (penal, tiro libre, mano a mano, última jugada) y ofrecerme un minijuego corto.
2. EL SISTEMA DEBE resolver el minijuego en menos de 20 segundos y usar el resultado como desenlace de esa jugada.
3. SI ignoro o salto el minijuego, ENTONCES EL SISTEMA DEBE resolver la jugada con la simulación normal.
4. Minijuegos iniciales: **penal / tiro libre** (apuntar + barra de fuerza) y **mano a mano** (elegir definición). Otros quedan para después.

### PAR-6 · Atributos que importan — MVP
1. EL SISTEMA DEBE usar en la simulación los atributos de cada jugador (a definir en `specs/club`), su **estado físico** y su **moral**.
2. EL SISTEMA DEBE aplicar los efectos activos que vienen del Muro (ej. resaca, lesión oculta, motivación extra).

### PAR-7 · La hinchada (Aguante) — V1
1. EL SISTEMA DEBE mostrar una barra de Aguante que sube con buenas jugadas y baja con goles en contra.
2. MIENTRAS el Aguante está lleno y soy local, EL SISTEMA DEBE dar un bonus chico a mi equipo.
3. EL SISTEMA DEBE escalar el efecto según la capacidad del estadio y la relación con los hinchas.

### PAR-8 · Previa — MVP
1. ANTES del partido, EL SISTEMA DEBE dejarme elegir formación, estilo de juego y charla técnica.
2. EL SISTEMA DEBE dejarme activar una **cábala** con un efecto chico que se refuerza si gano y se "quema" si pierdo.

### PAR-9 · Relato — MVP (texto), Después (voz)
1. EL SISTEMA DEBE narrar los eventos con frases de relato argentino, sin repetir la misma frase dos veces en un partido.
2. EL SISTEMA DEBE tomar el relato de un banco de frases editable sin tocar código.

### PAR-10 · Interrupciones del Muro — V1
1. CUANDO hay un evento del Muro marcado como "en partido", EL SISTEMA DEBE mostrarlo en el entretiempo como notificación con decisión rápida.
2. EL SISTEMA DEBE aplicar la consecuencia en el segundo tiempo.

### PAR-11 · VAR — Después
1. EL SISTEMA PUEDE revisar goles o penales con una pausa dramática y un resultado según la simulación.

## Fuera de alcance
- Multijugador en vivo. Contra amigos se juega contra su club controlado por la IA (como BOLA).
- Selecciones / World Battle (queda para una spec aparte).

## Decisiones tomadas
- **D1 (2026-10-07)** El MVP es Simular + minijuegos en jugadas clave. El partido jugable (PAR-2, PAR-3) se hace **al final**, después de toda la interfaz.

## Preguntas abiertas (no bloquean el MVP)
- **P2** ¿Cuántos jugadores por equipo en el partido jugable: 11 o fútbol 7/5 para que sea más legible en el celu?
- **P3** Vista 3/4 con sprites pre-renderizados (como BOLA) o 2D cenital más simple para el primer prototipo.
