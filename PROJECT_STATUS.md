# Project Status

## Resumen

Proyecto: `Football Tracker`

Objetivo: reemplazar el Excel usado para organizar los partidos de futbol de los martes por una app, arrancando con un MVP web y luego llevando la operacion a mobile/Android.

Repositorio remoto:

- `https://github.com/atomaculus/football_tracker.git`

Branch actual esperada:

- `main`

## Estado actual del directorio

Raiz del proyecto:

- `README.md`
- `PROJECT_STATUS.md`
- `MVP_PLAN.md`
- `TECH_ROADMAP.md`
- `Futbol Martes.xlsx`
- `supabase/`
- `web/`

Subdirectorios principales:

- `web/`: app Next.js 16 del MVP
- `supabase/`: schema y archivos de seed/template

Estado git al momento de crear este archivo:

- repo inicializado
- remoto `origin` configurado a GitHub por HTTPS
- cambios empujados al remoto

## Estado funcional actual

La app web ya existe y se puede correr localmente.

Rutas disponibles:

- `/`
- `/confirmar`
- `/partido`
- `/historial`
- `/jugadores`
- `/admin`

Capacidades actuales:

- home responsive del MVP
- pantalla de confirmacion de asistencia
- pantalla de partido
- historial mock
- lista de jugadores del grupo
- panel admin mock
- feature de encargado de camisetas
- capa de datos preparada para Supabase
- conexion real a Supabase ya configurada en esta maquina
- fallback local con seed data si no hay credenciales

## Decisiones de producto ya definidas

- formato principal: `7v7`
- fallback valido: `6v6`
- cantidad ideal: `14 jugadores`
- minimo para jugar: `12 jugadores`
- si hay menos de `12`, la fecha deberia quedar `Suspendida`, salvo override manual
- no tiene sentido modelar partidos desbalanceados tipo `7 vs 5`
- no se va a importar el historico completo del Excel por ahora
- prioridad actual: jugadores reales + operacion semanal real
- login futuro previsto: telefono / OTP
- hay `2 admins`
- los jugadores deben poder confirmar asistencia por su cuenta
- hay dos juegos de camisetas:
  - crema / beige
  - negras con naranja
- la logistica de camisetas se quiere resolver dentro de la app
- recomendacion actual: asignacion de camisetas por `rotation`, no `random`

## Acciones tomadas hasta ahora

Producto y planning:

- se relevo el Excel para entender el flujo base
- se definio el alcance funcional del MVP
- se documento el roadmap tecnico
- se incorporo al plan el estado `Suspendido`
- se incorporo al plan la logistica de camisetas
- se dejo anotada la invitacion por QR/link como feature futura

Frontend:

- se creo una app web con Next.js
- se diseno una landing/home inicial del MVP
- se agregaron pantallas navegables reales del prototipo
- se corrigieron detalles de contraste y botones de frontend
- se agrego la vista `Jugadores`
- se agrego la vista de `Encargado de camisetas` en `Inicio` y `Admin`
- se corrigieron errores de server actions de Next.js

Datos y backend:

- se preparo cliente base de Supabase
- se creo `supabase/schema.sql`
- se creo `supabase/seed_players.sql`
- se creo `supabase/players_template.csv`
- se dejo lista la pantalla de confirmacion para persistir en `availability_responses`
- se dejo lista la lectura de `players` y `matches` desde Supabase si existen credenciales
- se agrego al schema la tabla `laundry_assignments`
- se creo proyecto real de Supabase
- se corrio `supabase/schema.sql`
- se cargaron 12 jugadores iniciales en `players`
- se creo la temporada `2026`
- se creo un partido real `open` para el martes `2026-03-24` en `Backyard` a las `21:00`

Git / repo:

- repo inicializado y conectado al remoto de GitHub
- commits locales y push realizados de forma incremental

## Commits relevantes

- `47ddae1` Bootstrap web MVP base
- `3754c6b` Add navigable MVP screens
- `d8b75a1` Refine MVP UX and add players view
- `a391b3b` Add schema and player seed template
- `312d880` Prepare web app for Supabase data layer
- `44516b8` Document project status and setup
- `6519107` Wire availability flow and Supabase-ready dashboard
- `b7b6802` Fix confirm action export for Next server actions
- `1d286cf` Align MVP rules with real match formats
- `7c43870` Add jersey laundry duty MVP flow

## Archivos clave para retomar

Documentacion:

- `README.md`
- `PROJECT_STATUS.md`
- `MVP_PLAN.md`
- `TECH_ROADMAP.md`

Frontend:

- `web/src/app/page.tsx`
- `web/src/app/confirmar/page.tsx`
- `web/src/app/confirmar/actions.ts`
- `web/src/app/admin/page.tsx`
- `web/src/app/jugadores/page.tsx`
- `web/src/lib/data.ts`
- `web/src/lib/seed-data.ts`
- `web/src/lib/supabase.ts`
- `web/src/types/domain.ts`

Backend / datos:

- `supabase/schema.sql`
- `supabase/seed_players.sql`
- `supabase/players_template.csv`

## Como correr la app localmente

Desde `web/`:

```bash
npm install
npm run dev
```

Abrir:

- `http://localhost:3000`

## Variables de entorno

Archivo base:

- `web/.env.example`

Variables previstas:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Sin esas variables:

- la app funciona en modo demo
- usa seed local
- no persiste confirmaciones reales

En esta maquina ya existe ademas:

- `web/.env.local`

Ese archivo no se sube a git.

## Estado tecnico exacto hoy

Lo que ya funciona con datos mock:

- navegacion
- historial demo
- encargado de camisetas demo

Lo que ya esta preparado para datos reales:

- lectura de `players`
- lectura del proximo `match`
- lectura de respuestas de asistencia
- submit de confirmacion de asistencia

Lo que ya quedo conectado de verdad en Supabase:

- `players`
- `seasons`
- `matches`

Estado real actual de la base:

- temporada `2026` creada
- 12 jugadores cargados
- partido abierto para `2026-03-24`

Lo que todavia no esta conectado end to end:

- login por telefono / OTP
- admin real para abrir, cerrar o suspender partido
- asignacion real por turnos del encargado de camisetas
- equipos reales
- resultado y goleadores reales

## Siguiente paso recomendado

Orden recomendado para seguir sin perder foco:

1. probar `/jugadores` con datos reales
2. probar `/confirmar` guardando respuestas reales
3. probar refresh de `/` y `/admin`
4. reemplazar el `attendanceBoard` seed por respuestas reales completas
5. construir panel admin real para abrir / cerrar / suspender fecha

## Bloque siguiente despues de Supabase

Una vez conectado Supabase:

1. panel admin real para abrir / cerrar / suspender partido
2. validacion de minimo 12 jugadores
3. asignacion real de camisetas por turnos entre los que jugaron
4. carga de equipos
5. carga de resultado
6. carga de goleadores
7. historial real

## Consideraciones importantes para otra instancia

- el usuario habla en espanol
- el proyecto esta en Windows / PowerShell
- evitar asumir que el historico del Excel se importa ahora
- no volver a introducir el estado visible `Invitable` para jugadores del grupo base
- no modelar formatos desbalanceados tipo `7 vs 5`
- mantener la regla operativa `14 => 7v7`, `12 => 6v6`, `<12 => suspendido`
- la funcionalidad de camisetas ya no es idea futura: ya esta incorporada al MVP
- si aparece un lock de `.next/dev/lock`, probablemente haya quedado un `next dev` viejo corriendo

## Ultimo hito conocido

Ultimo commit funcional relevante al crear este archivo:

- `7c43870` `Add jersey laundry duty MVP flow`

## Update 2026-03-18

Supabase quedo conectado con exito y el backend minimo ya no esta vacio.

Datos cargados manualmente:

- `season`: `2026`
- `match`: martes `2026-03-24`, `21:00`, `Backyard`, estado `open`
- `players`: 12 registros iniciales

Proximo objetivo inmediato:

- validar el flujo real de confirmacion desde la UI
