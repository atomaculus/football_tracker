# Roadmap Tecnico

## Stack recomendado

Para este caso recomiendo:

- `React Native + Expo`
- `Supabase`
- `TypeScript`

### Motivo

- salida rapida para Android
- onboarding simple
- backend administrado
- auth, base de datos y storage en un solo lugar
- costo bajo para validar el producto

Si mas adelante quieren escalar, esta base sigue siendo razonable.

## Arquitectura inicial

### Frontend

- app Android en React Native
- navegacion simple por tabs + stack
- estado remoto con consultas directas a Supabase

### Backend

- base PostgreSQL en Supabase
- autenticacion por magic link o OTP
- politicas por rol
- funciones server-side solo para reglas sensibles

## Modelo de datos inicial

### `players`

- `id`
- `full_name`
- `nickname`
- `phone`
- `is_goalkeeper`
- `is_guest`
- `is_active`
- `created_at`

### `player_invites`

- `id`
- `token`
- `created_by_player_id`
- `invite_type`
  - `qr`
  - `link`
- `status`
  - `active`
  - `used`
  - `expired`
- `expires_at`
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

### `rules`

- `id`
- `code`
- `title`
- `description`
- `is_active`

## Migracion desde Excel

No hace falta importar todo perfecto al inicio. Conviene separar:

### Fase 1

- importar jugadores activos
- importar reglas del estatuto
- importar algunos anos de historial resumido si suma

### Fase 2

- importar historial de asistencias por fecha
- reconstruir metricas historicas

La recomendacion practica es que el MVP empiece a operar con datos nuevos desde la app y que el historico del Excel entre de manera incremental.

## Reglas de negocio

### En backend desde el inicio

- un jugador solo puede responder una vez por partido
- guardar siempre timestamp de respuesta
- no permitir goles para jugadores fuera de ese partido
- no permitir cerrar partido sin equipos definidos
- validar formatos reales: `14 => 7v7`, `12 => 6v6`, `<12 => suspended` salvo override admin

### Manuales al inicio

- prioridad compleja por arquero
- excepciones sociales
- suplencias decididas por consenso

## Roadmap por fases

### Fase 0

- bajar a detalle reglas del Excel
- definir pantallas
- validar alcance con ustedes

### Fase 1

- bootstrap del proyecto mobile
- auth
- jugadores
- partidos
- confirmacion de asistencia
- seed inicial de jugadores sin historial obligatorio

### Fase 2

- titulares y suplentes
- equipos
- resultado
- goles

### Fase 3

- historial
- estadisticas
- panel admin

### Fase 4

- importador de Excel
- pulido
- beta cerrada con el grupo real
- listado completo de jugadores del grupo
- invitacion por QR o link para nuevos jugadores

## Sprint 1 recomendado

Primer sprint de construccion:

- crear proyecto base
- definir tema visual
- configurar Supabase
- armar tablas principales
- implementar login
- implementar home + confirmacion de asistencia
- crear pantalla admin minima para abrir partido

## Riesgos

- si intentan automatizar todas las reglas del Excel desde el inicio, el proyecto se frena
- si el historial viejo se vuelve requisito estricto para salir, se retrasa la validacion
- si no hay un admin claramente responsable, la operacion semanal se desordena
- si se intenta importar estadisticas historicas antes de validar la operacion semanal, se pierde foco

## Decisiones recomendadas ya

1. Salir con Android primero.
2. Tener un solo admin operativo en la primera version.
3. Mantener override manual de reglas complejas.
4. Empezar con historial nuevo desde la app y migrar el viejo despues.
