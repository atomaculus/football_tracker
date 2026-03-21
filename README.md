# La Fecha

App web para operar los partidos de futbol de los martes sin depender del Excel como herramienta principal.

El proyecto nacio para reemplazar `Futbol Martes.xlsx` y hoy ya cubre el flujo base del MVP con datos reales en Supabase, deploy en Vercel y scheduler externo para cierres automaticos.

## Estado actual

Hoy el proyecto ya tiene:

- app web en `Next.js 16`
- branding visible de `La Fecha`
- deploy realizado en `Vercel`
- base real en `Supabase`
- login simple por cookie firmada
- permisos admin reales
- confirmacion de asistencia persistida
- lista proyectada con prioridad del ultimo martes jugado
- cierre automatico operativo `90 minutos` antes
- cierre persistido por scheduler y endpoint protegido
- bajas tardias permitidas despues del cierre
- cierre real del partido desde admin
- carga de equipos, resultado y goles desde admin
- asignacion real de camisetas al cerrar la convocatoria
- historial real y ranking real basico
- metrica de `lavados` por jugador
- home y layouts mas compactos y responsive
- fallback a seed local cuando faltan datos

## Reglas operativas ya modeladas

- formato ideal: `14 jugadores => 7v7`
- fallback operativo: `12 jugadores => 6v6`
- con menos de `12` la fecha queda en riesgo o suspendida
- la convocatoria no se cierra por cupo completo
- despues de los `14` primeros, los demas quedan como suplentes
- el ultimo martes jugado da prioridad para la fecha siguiente
- la convocatoria cierra automaticamente `90 minutos` antes del partido
- despues del cierre se permiten solo bajas tardias, no nuevas altas
- al cerrarse la lista se asigna el encargado de camisetas entre quienes efectivamente quedaron en la lista final

## Auth simple actual

La auth del MVP no usa OTP todavia. Usa:

- seleccion de jugador
- `APP_GROUP_ACCESS_CODE`
- `APP_ADMIN_ACCESS_CODE` para entrar en modo admin
- cookie de sesion firmada con `APP_SESSION_SECRET`

Admins reales cargados hoy:

- `Pablo Ferrara`
- `Lucas Lopez`
- `Atilio Maculus`

## Flujo real que ya existe

### Jugador

- entra por `/login`
- accede a `/confirmar`
- confirma `Voy`, `Suplente` o `No voy`
- si la convocatoria ya cerro, solo puede darse de baja

### Admin

- entra por `/login` en modo admin
- opera `/admin`
- mueve jugadores entre titular, suplente y no va
- cierra convocatoria
- registra asistencia real del partido
- carga equipos
- asigna jugadores a equipos
- carga goles
- marca el partido como `played`

## Automatizacion actual

- `GitHub Actions` ejecuta el workflow `Close Signups`
- el workflow llama a `/api/cron/close-signups`
- la ruta esta protegida con `CRON_SECRET`
- al detectar que paso el cutoff, el sistema:
  - cierra el partido
  - consolida `match_participants`
  - asigna camisetas por `rotation`

## Que sigue siendo parcial o mejorable

- `/partido` cae al mock si un partido jugado no tiene `teams` y `goals` reales cargados
- el panel admin ya mejoro, pero sigue siendo el area con mas friccion potencial
- la logistica de camisetas ahora si se asigna real, pero todavia no tiene panel propio de devolucion o override fino
- la auth es suficiente para MVP, pero no es la version final tipo OTP o magic link
- parte de las estadisticas reales dependen de que el partido jugado tenga equipos y goles cargados

## Stack

- `Next.js 16`
- `React 19`
- `TypeScript`
- `Tailwind CSS 4`
- `Supabase JS`
- `Vercel`
- `GitHub Actions`

## Estructura

- `web/`: app frontend
- `supabase/`: schema, seed y archivos auxiliares
- `.github/workflows/`: jobs programados
- `MVP_PLAN.md`: alcance funcional del MVP web
- `TECH_ROADMAP.md`: roadmap tecnico actualizado desde el MVP web actual
- `PROJECT_STATUS.md`: continuidad y estado consolidado del proyecto
- `Futbol Martes.xlsx`: fuente original
- `Futbol Martes (version 1).xlsx`: variante usada para rescatar datos reales de una fecha

## Variables de entorno

En `web/.env.example` quedaron las variables previstas:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
APP_GROUP_ACCESS_CODE=
APP_ADMIN_ACCESS_CODE=
APP_SESSION_SECRET=
CRON_SECRET=
```

## Desarrollo local

Ir a `web/` y ejecutar:

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`

## Archivos clave para retomar

- `web/src/lib/data.ts`
- `web/src/lib/auth.ts`
- `web/src/lib/match-operations.ts`
- `web/src/app/login/actions.ts`
- `web/src/app/confirmar/actions.ts`
- `web/src/app/admin/actions.ts`
- `web/src/app/admin/page.tsx`
- `web/src/app/api/cron/close-signups/route.ts`
- `web/src/components/admin-match-result-manager.tsx`
- `web/src/components/app-shell.tsx`
- `web/src/types/domain.ts`
- `.github/workflows/close-signups.yml`
- `supabase/schema.sql`

## Commits recientes importantes

- `ebd2a0e` Refine app UX and automate match closure flow
- `f2111e0` Fix match closure typing for production build
- `db6ea61` Simplify app navigation shell

## Nota importante sobre estadisticas

Si en `Historial` o `Jugadores` aparece poca senal estadistica, no significa que el calculo este roto necesariamente. Puede pasar que el partido jugado tenga:

- participantes reales cargados
- pero sin `teams`
- y sin `goals`

En ese caso:

- las presencias reales si se ven
- la diferencia y el detalle fino quedan limitados
- el sistema usa fallback cuando puede, pero no reemplaza resultado real

## Proximo foco recomendado

No es backend critico, sino operacion y pulido:

1. compactar y simplificar mejor el panel admin
2. cerrar friccion responsive fina despues de uso real
3. mejorar `/partido` cuando falten datos reales
4. agregar override y devolucion de camisetas
5. si hace falta, pasar de auth simple a OTP
