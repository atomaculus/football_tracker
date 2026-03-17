# Football Tracker

MVP para gestionar partidos de futbol amateur semanales entre amigos.

El proyecto nace para reemplazar un Excel usado para organizar los partidos de los martes y llevar la operacion semanal desde una app.

## Objetivo

Resolver bien la operacion del martes:

- confirmar asistencia
- armar lista de titulares y suplentes
- registrar equipos
- cargar resultado y goleadores
- consultar historial
- administrar el grupo de jugadores

## Estado actual

Hoy el proyecto tiene:

- app web responsive en Next.js
- navegacion MVP con pantallas de:
  - inicio
  - confirmar asistencia
  - partido
  - historial
  - jugadores
  - admin
- capa de datos preparada para Supabase
- fallback local con seed data
- schema SQL inicial para Supabase
- seed/template de jugadores
- plan funcional y roadmap tecnico documentados

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase JS

## Estructura

- `web/`: app frontend
- `supabase/`: schema y seeds iniciales
- `MVP_PLAN.md`: alcance funcional
- `TECH_ROADMAP.md`: roadmap tecnico
- `Futbol Martes.xlsx`: fuente operativa original, fuera del flujo principal de la app

## Datos

La app ya no depende del Excel para arrancar.

Decisiones actuales:

- no importar historico completo por ahora
- priorizar seed inicial de jugadores
- historial viejo puede entrar despues
- invitacion por QR/link queda anotada para una etapa posterior

## Como correr la app

Ir a `web/` y ejecutar:

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`

## Variables de entorno

En `web/.env.example` quedaron las variables previstas:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Mientras no se configuren, la app usa seed local.

## Archivos clave

- `web/src/lib/data.ts`
- `web/src/lib/supabase.ts`
- `web/src/lib/seed-data.ts`
- `web/src/types/domain.ts`
- `supabase/schema.sql`
- `supabase/seed_players.sql`
- `supabase/players_template.csv`

## Siguiente paso recomendado

Conectar Supabase real y reemplazar los seeds en estas dos vistas primero:

1. `Jugadores`
2. `Confirmar asistencia`

## Historial de avances

Commits principales hasta ahora:

- `47ddae1` Bootstrap web MVP base
- `3754c6b` Add navigable MVP screens
- `d8b75a1` Refine MVP UX and add players view
- `a391b3b` Add schema and player seed template
- `312d880` Prepare web app for Supabase data layer
