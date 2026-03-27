# Project Status

## Resumen

Proyecto: `La Fecha`

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
- `.github/`
- `Futbol Martes.xlsx`
- `Futbol Martes (version 1).xlsx`
- `supabase/`
- `web/`

Subdirectorios principales:

- `web/`: app Next.js 16 del MVP operativo
- `supabase/`: schema, seed y archivos auxiliares
- `.github/workflows/`: scheduler del cierre automatico

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
- `/api/cron/close-signups`

Capacidades actuales:

- branding visible `La Fecha`
- login simple por jugador y codigo de acceso
- gating real de sesion para vistas privadas
- home responsive del MVP
- confirmacion de asistencia persistida
- bajas tardias despues del cierre
- pantalla de partido para la fecha operativa actual
- historial real con partidos cerrados o jugados ya completados
- lista de jugadores del grupo simplificada como roster
- panel admin operativo con secciones colapsables
- cierre real de convocatoria
- apertura automatica de convocatoria el domingo a las `10:00`
- cierre automatico por scheduler `90 minutos` antes del partido
- carga de asistencia real del partido con guardado masivo
- carga de equipos, resultado y asignacion por bloque
- carga de goles por cantidad, no por minuto
- asignacion real de camisetas al cerrar convocatoria
- override manual del responsable de camisetas desde admin
- estadistica de `lavados` por jugador
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
- la logistica de camisetas se resuelve por `rotation` al cerrar la lista

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
- se convirtio la barra superior en navegacion sticky compacta
- se compactaron textos y bloques del home
- se reforzo responsive en home, historial, jugadores, partido y admin
- se agrego `collapse` por seccion en el panel admin
- se paso de acciones por fila a guardados masivos en asistencia final y asignacion de equipos
- se corrigio contraste de `select` y formularios del admin
- se simplifico `/jugadores` para que funcione como roster y no como duplicado de historial

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
- se implemento cierre automatico persistido y asignacion real de camisetas
- se habilito apertura automatica de convocatoria por scheduler
- se ajusto el dashboard para no mezclar seed con datos reales cuando no existe proxima fecha
- se ajusto historial y leaderboard para considerar fechas cerradas pero ya completadas
- se dejo `/partido` atado a la fecha operativa actual y vacio si no hay datos reales

Infra:

- se agrego workflow `Close Signups` en GitHub Actions
- se agrego endpoint protegido por `CRON_SECRET`
- se valido ejecucion manual del workflow
- el mismo scheduler ahora tambien abre la fecha el domingo a las `10:00`

## Commits relevantes

- `ebd2a0e` Refine app UX and automate match closure flow
- `f2111e0` Fix match closure typing for production build
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
- `web/src/components/app-shell.tsx`
- `web/src/lib/data.ts`
- `web/src/lib/auth.ts`
- `web/src/lib/match-operations.ts`
- `web/src/types/domain.ts`

Infra:

- `.github/workflows/close-signups.yml`
- `web/src/app/api/cron/close-signups/route.ts`

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
CRON_SECRET=
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
- apertura automatica de convocatoria el domingo a las `10:00`
- cierre manual de convocatoria
- cierre automatico disparado por scheduler
- carga de participantes reales
- carga de equipos
- carga de goles
- asignacion real de camisetas
- override manual del lavado
- historial y ranking basico con fechas completas
- metrica de lavados por jugador

Lo que sigue parcial o con fallback:

- invitados externos no modelados de punta a punta
- importacion historica mas amplia del Excel
- devolucion fina de camisetas
- algunas estadisticas finas atadas a datos historicos mas completos
- auth final por OTP o magic link

## Siguiente paso recomendado

Orden recomendado para seguir sin perder foco:

1. importar historico 2026 desde Excel
2. resolver soporte real para invitados en una fecha jugada
3. completar el flujo de camisetas con devolucion
4. revisar si conviene separar mas `/jugadores` de vistas admin futuras
5. evaluar si conviene subir la auth del MVP a OTP despues del uso real

## Consideraciones importantes para otra instancia

- el usuario habla en espanol
- el proyecto esta en Windows / PowerShell
- la marca visible actual es `La Fecha`
- evitar asumir que el historico del Excel se importa ahora
- no volver a introducir el estado visible `Invitable` para jugadores del grupo base
- no modelar formatos desbalanceados tipo `7 vs 5`
- mantener la regla operativa `14 => 7v7`, `12 => 6v6`, `<12 => suspendido`
- la asignacion de camisetas ya no es demo: se persiste en `laundry_assignments`
- la home no debe inventar respuestas si no hay proxima fecha real en Supabase
- `/partido` debe mostrar la fecha operativa actual, no arrastrar automaticamente la ultima jugada
- si aparece un lock de `.next/dev/lock`, probablemente haya quedado un `next dev` viejo corriendo

## Ultimo hito conocido

Ultimo hito funcional al actualizar este archivo:

- panel admin consolidado con guardados masivos
- apertura automatica el domingo a las `10:00`
- override manual de camisetas
- home, historial y partido alineados con el estado real de Supabase
