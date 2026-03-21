# Project Status

## Resumen

Proyecto: `Football Tracker`

Objetivo vigente: operar el futbol de los martes desde una app web real, dejando el Excel como referencia historica y no como herramienta principal de operacion.

Repositorio remoto:

- `https://github.com/atomaculus/football_tracker.git`

Branch actual:

- `main`

## Estado actual del directorio

Raiz del proyecto:

- `README.md`
- `PROJECT_STATUS.md`
- `MVP_PLAN.md`
- `TECH_ROADMAP.md`
- `Futbol Martes.xlsx`
- `Futbol Martes (version 1).xlsx`
- `supabase/`
- `web/`

Subdirectorios principales:

- `web/`: app Next.js 16 del MVP operativo
- `supabase/`: schema, seed y archivos auxiliares

Estado git al actualizar este archivo:

- repo limpio
- remoto `origin` configurado
- cambios recientes ya empujados al remoto

## Estado funcional actual

La app web ya existe, se puede correr localmente y tiene flujo real conectado a Supabase.

Rutas disponibles:

- `/`
- `/login`
- `/confirmar`
- `/partido`
- `/historial`
- `/jugadores`
- `/admin`

Capacidades actuales:

- login simple por jugador y codigo de acceso
- gating real de sesion para vistas privadas
- home responsive del MVP
- confirmacion de asistencia persistida
- bajas tardias despues del cierre
- pantalla de partido
- historial real basico
- lista de jugadores del grupo
- panel admin operativo
- cierre real de convocatoria
- carga de asistencia real del partido
- carga de equipos, resultado y goles
- capa de datos conectada a Supabase
- fallback local con seed data si faltan credenciales o datos

## Decisiones de producto ya definidas

- formato principal: `7v7`
- fallback valido: `6v6`
- cantidad ideal: `14 jugadores`
- minimo para jugar: `12 jugadores`
- si hay menos de `12`, la fecha queda en riesgo o suspendida, salvo override manual
- no tiene sentido modelar partidos desbalanceados tipo `7 vs 5`
- no se va a importar el historico completo del Excel por ahora
- prioridad actual: operacion semanal real con jugadores reales
- login final previsto a futuro: telefono / OTP o magic link
- auth MVP actual: codigo grupal + cookie firmada
- hay `3 admins` visibles en el sistema actual
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
- se incorporo al plan el estado `suspended`
- se incorporo al plan la logistica de camisetas
- se adopto una estrategia web-first para salir rapido

Frontend:

- se creo una app web con Next.js
- se agregaron pantallas navegables reales del prototipo
- se incorporo login simple con sesiones
- se corrigieron detalles de contraste y navegacion
- se simplifico la shell de navegacion
- se agrego la vista `Jugadores`
- se compactaron textos de interfaz publica
- se mantuvo fallback visual razonable cuando faltan datos reales

Datos y backend:

- se preparo cliente base de Supabase
- se creo `supabase/schema.sql`
- se creo `supabase/seed_players.sql`
- se creo `supabase/players_template.csv`
- se conecto la lectura de `players`, `matches` y respuestas reales
- se conecto la persistencia de `availability_responses`
- se agrego al schema la tabla `laundry_assignments`
- se habilito cierre de convocatoria y operacion admin real
- se habilito carga de equipos y goles

Git / repo:

- repo inicializado y conectado al remoto de GitHub
- commits locales y push realizados de forma incremental

## Commits relevantes

- `39ac895` Add simple auth and admin session gating
- `c554a90` Refresh matchday UI and visible player stats
- `7241754` Build real history and leaderboard stats
- `199597c` Add admin teams and scoring workflow
- `92d506b` Add admin match closure workflow
- `c5d28e7` Allow late drops after signup close
- `7d6b891` Refresh README with deployed MVP status
- `061d004` Require login across app pages
- `0b33251` Remove test-stage messaging from public UI
- `db6ea61` Simplify app navigation shell

## Archivos clave para retomar

Documentacion:

- `README.md`
- `PROJECT_STATUS.md`
- `MVP_PLAN.md`
- `TECH_ROADMAP.md`

Frontend:

- `web/src/app/page.tsx`
- `web/src/app/login/page.tsx`
- `web/src/app/confirmar/page.tsx`
- `web/src/app/admin/page.tsx`
- `web/src/app/partido/page.tsx`
- `web/src/app/jugadores/page.tsx`
- `web/src/app/historial/page.tsx`
- `web/src/lib/data.ts`
- `web/src/lib/auth.ts`
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
APP_GROUP_ACCESS_CODE=
APP_ADMIN_ACCESS_CODE=
APP_SESSION_SECRET=
```

Sin esas variables:

- la app funciona en modo demo
- usa seed local
- no persiste confirmaciones reales

En esta maquina ya existe ademas:

- `web/.env.local`

Ese archivo no se sube a git.

## Estado tecnico exacto hoy

Lo que ya funciona con datos reales:

- login y sesion
- lectura de `players`
- lectura del proximo `match`
- lectura de respuestas de asistencia
- submit de confirmacion de asistencia
- cierre de convocatoria
- carga de participantes reales
- carga de equipos
- carga de goles
- historial y ranking basico

Lo que sigue parcial o con fallback:

- `/partido` cuando falta estructura real de `teams` o `goals`
- automatizacion end to end de camisetas
- algunas estadisticas finas atadas a datos historicos mas completos
- auth final por OTP o magic link

## Siguiente paso recomendado

Orden recomendado para seguir sin perder foco:

1. compactar UX del panel admin para operacion semanal
2. revisar bugs visibles en `/partido`, `/historial` y `/jugadores`
3. reducir dependencias de fallback mock donde ya hay datos reales
4. terminar la logistica real de camisetas
5. evaluar si conviene subir la auth del MVP a OTP despues del uso real

## Consideraciones importantes para otra instancia

- el usuario habla en espanol
- el proyecto esta en Windows / PowerShell
- evitar asumir que el historico del Excel se importa ahora
- no volver a introducir el estado visible `Invitable` para jugadores del grupo base
- no modelar formatos desbalanceados tipo `7 vs 5`
- mantener la regla operativa `14 => 7v7`, `12 => 6v6`, `<12 => suspendido`
- la funcionalidad de camisetas ya no es idea futura: ya esta incorporada al MVP aunque incompleta
- si aparece un lock de `.next/dev/lock`, probablemente haya quedado un `next dev` viejo corriendo

## Ultimo hito conocido

Ultimo commit visible al actualizar este archivo:

- `db6ea61` `Simplify app navigation shell`
