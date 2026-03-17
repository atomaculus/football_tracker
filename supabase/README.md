# Supabase Setup

Este directorio deja preparada la base de datos del MVP para cuando quieras conectar Supabase.

## Archivos

- `schema.sql`
- `seed_players.sql`
- `players_template.csv`

## Orden recomendado

1. Crear un proyecto en Supabase.
2. Ejecutar `schema.sql` en SQL Editor.
3. Ajustar `seed_players.sql` o importar `players_template.csv`.
4. Conectar la app web con las credenciales del proyecto.

## Alcance inicial

- sin importacion historica obligatoria
- foco en jugadores, partidos, asistencia y panel admin
- el historial viejo puede entrar mas adelante
