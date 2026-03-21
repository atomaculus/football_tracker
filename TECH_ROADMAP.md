# Roadmap Tecnico

## Objetivo actual

La base real del proyecto ya no es una app mobile desde cero. El producto vigente es un MVP web operativo pensado para resolver la operacion semanal del grupo de futbol con salida rapida, datos reales y admin usable.

La estrategia recomendada hoy es:

1. consolidar el MVP web
2. usarlo en fechas reales
3. corregir friccion operativa y bugs
4. recien despues evaluar una version mobile dedicada

## Stack actual recomendado

Para el estado presente del proyecto recomiendo mantener:

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Supabase`
- `Tailwind CSS 4`
- `Vercel`

### Motivo

- ya existe codigo funcional sobre esta base
- el deploy y la base ya estan operativos
- permite iterar muy rapido sobre UX del martes real
- reduce costo y riesgo frente a reabrir una migracion a mobile
- deja abierta una futura salida PWA o mobile mas adelante

## Arquitectura actual

### Frontend

- app web en `Next.js App Router`
- pantallas server-first con componentes cliente donde hace falta interaccion
- shell comun de navegacion y layout
- formularios y server actions para operaciones de login y admin

### Backend

- base PostgreSQL en Supabase
- cliente web con `@supabase/supabase-js`
- sesiones simples por cookie firmada en el MVP
- logica sensible y validaciones operativas centralizadas en acciones y capa de datos

## Modelo de datos actual

### `players`

- `id`
- `full_name`
- `nickname`
- `phone`
- `is_goalkeeper`
- `is_guest`
- `is_active`
- `created_at`

### `seasons`

- `id`
- `year`
- `label`

### `matches`

- `id`
- `season_id`
- `match_date`
- `location`
- `start_time`
- `status`
  - `scheduled`
  - `open`
  - `closed`
  - `played`
  - `cancelled`
  - `suspended`
- `notes`

### `availability_responses`

- `id`
- `match_id`
- `player_id`
- `response`
  - `going`
  - `not_going`
  - `backup`
  - `dropped`
- `responded_at`
- `drop_reason`

### `match_participants`

- `id`
- `match_id`
- `player_id`
- `role`
  - `starter`
  - `substitute`
  - `guest`
- `attendance_status`
  - `confirmed`
  - `played`
  - `late_cancel`
  - `no_show`
- `priority_score`
- `priority_note`
- `team_id`

### `teams`

- `id`
- `match_id`
- `name`
- `color`
- `goals`

### `goals`

- `id`
- `match_id`
- `team_id`
- `scorer_player_id`
- `minute`
- `is_own_goal`

### `laundry_assignments`

- `id`
- `match_id`
- `player_id`
- `assignment_mode`
  - `rotation`
  - `random`
- `status`
  - `assigned`
  - `returned`
  - `reassigned`
- `kit_notes`
- `created_at`

### `rules`

- `id`
- `code`
- `title`
- `description`
- `is_active`

## Reglas de negocio ya modeladas

- un jugador solo puede responder una vez por partido
- se guarda timestamp de respuesta
- la convocatoria no se cierra por completar 14
- `14 => 7v7`
- `12 => 6v6`
- `<12 => fecha en riesgo o suspendida`, salvo override admin
- el cierre operativo ocurre `90 minutos` antes del partido
- despues del cierre se permiten solo bajas tardias
- los jugadores posteriores al cupo ideal quedan como suplentes
- el ultimo martes jugado puede influir en la prioridad de la fecha siguiente

## Reglas que siguen manuales o parciales

- automatizacion completa del encargado de camisetas
- excepciones sociales entre jugadores
- posibles reglas especiales de arquero
- casos de historico viejo del Excel

## Migracion desde Excel

La recomendacion sigue siendo no importar todo perfecto al inicio.

### Estado actual

- el MVP ya opera con datos nuevos desde la app
- el Excel queda como fuente historica y referencia de reglas
- existe una segunda planilla usada para rescatar datos reales puntuales

### Estrategia recomendada

#### Fase 1

- seguir usando datos nuevos creados desde la app
- cargar manualmente las fechas necesarias para validar el flujo real

#### Fase 2

- importar historial resumido si hace falta mejorar estadisticas
- reconstruir metricas historicas solo si agrega valor real

## Hoja de ruta por fases

### Fase 0

- consolidar documentacion
- validar flujo real de cada martes
- detectar friccion operativa del panel admin

### Fase 1

- compactar UX del admin
- corregir bugs de partido, historial y jugadores
- reducir fallbacks mock innecesarios
- terminar flujo real de camisetas

### Fase 2

- endurecer validaciones admin
- mejorar estadisticas reales
- cubrir mejor partidos jugados incompletos
- pulir experiencia responsive

### Fase 3

- evaluar auth OTP o magic link
- evaluar notificaciones
- evaluar importacion parcial de historial

### Fase 4

- decidir si hace falta PWA mas fuerte o app mobile dedicada
- si hay uso real sostenido, definir si conviene `React Native + Expo`

## Sprint recomendado inmediato

Siguiente sprint de construccion:

- alinear UX del panel admin con operacion semanal real
- revisar estados de cierre y bajas tardias
- corregir inconsistencias de datos entre home, partido e historial
- mejorar legibilidad y densidad de informacion en mobile
- cerrar huecos documentales y de fallback

## Riesgos actuales

- si se reabre demasiado pronto la idea de mobile, se pierde foco del MVP usable
- si el panel admin queda demasiado largo, la operacion semanal se vuelve torpe
- si se mezclan mocks y datos reales sin criterio, la UI da senales contradictorias
- si el historico viejo se vuelve requisito estricto, se retrasa el pulido del producto real

## Decisiones recomendadas ya

1. Mantener la estrategia web-first hasta estabilizar uso real.
2. Priorizar bugs y UX operativa sobre nuevas features grandes.
3. Dejar OTP como mejora posterior, no como bloqueo actual.
4. Usar el Excel solo como apoyo historico mientras el sistema nuevo gana datos propios.
