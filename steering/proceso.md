# Proceso: Spec Driven Development

## Estructura

```
steering/          dirección general (producto, proceso, técnica). Cambia poco.
specs/<feature>/
  requirements.md  qué y por qué: historias + criterios de aceptación
  design.md        cómo: modelo de datos, arquitectura, pantallas
  tasks.md         lista de tareas chicas y verificables, cada una apunta a requisitos
referencias/       material de inspiración y su análisis
```

## Flujo por feature

1. **requirements.md** → se revisa y se aprueba (estado `aprobado`).
2. **design.md** → se escribe contra los requisitos aprobados y se aprueba.
3. **tasks.md** → se desglosa el diseño. Cada tarea cita los IDs de requisito que cubre.
4. **Implementación** tarea por tarea. Una tarea se cierra cuando sus criterios de aceptación se verifican (test o prueba manual descrita).
5. Si la implementación descubre algo que la spec no contempla, **se actualiza la spec primero**.

No se escribe código de una feature sin `requirements.md` y `design.md` aprobados.

## Convenciones

- **Estado** en el encabezado de cada archivo: `borrador` → `en revisión` → `aprobado`.
- **IDs de requisito**: `<PREFIJO>-<n>` (PAR = partido, CLU = club, DES = despacho). Criterios de aceptación: `PAR-3.2`.
- **Formato de criterios** (estilo EARS):
  - `CUANDO <evento>, EL SISTEMA DEBE <respuesta>.`
  - `MIENTRAS <estado>, EL SISTEMA DEBE <respuesta>.`
  - `SI <condición no deseada>, ENTONCES EL SISTEMA DEBE <respuesta>.`
  - `EL SISTEMA DEBE <respuesta>.` (siempre)
- **Prioridad**: `MVP` (primer prototipo), `V1`, `Después`.
- Las preguntas sin resolver van al final de cada spec, en **Preguntas abiertas**. Una spec no pasa a `aprobado` con preguntas que bloqueen.
