# MVP La Fecha

## Objetivo

Convertir el Excel actual en una app web simple para gestionar los partidos de los martes, con foco en:

- confirmar asistencia semanal
- armar lista de titulares y suplentes con reglas claras
- registrar resultado y goles
- consultar historial de partidos, equipos y rendimiento

El MVP no busca reemplazar toda la logica historica del Excel el dia 1. Busca resolver bien la operacion semanal y empezar a construir un historial confiable desde la app.

## Que existe hoy en el Excel

El archivo actual ya contiene tres cosas valiosas:

- ranking historico por ano
- registro de asistencias por fecha
- reglamento con reglas de prioridad, bajas y puntajes

Tambien muestra limitaciones tipicas del formato Excel:

- no hay confirmacion semanal guiada
- no hay un flujo claro de titulares, suplentes y bajas
- el scoring de goles no parece estar modelado de forma detallada por partido
- cuesta consultar historial de equipos y de companeros o rivales
- las reglas dependen mucho de interpretacion manual

## Usuario objetivo

Hombres de 25 a 45 anos que juegan futbol amateur con amigos, conocidos y amigos de amigos, sin torneo formal y con asistencia variable semana a semana.

## Problema a resolver

Cada martes hay que resolver rapido:

- quien juega
- quien queda afuera
- quien tiene prioridad
- como quedaron los equipos
- quien hizo goles
- como impacta eso en el historial

## Estado real del MVP hoy

La V1 web ya tiene una parte importante del flujo implementado:

- login simple por jugador y codigo compartido
- confirmacion de asistencia persistida
- cierre operativo de convocatoria
- cierre automatico persistido por scheduler
- bajas tardias despues del cierre
- panel admin para lista final, asistencia real, equipos y goles
- asignacion real de camisetas al cerrar convocatoria
- historial real basico
- metrica de lavados por jugador
- home y shell responsive mas pulidos
- fallback local si faltan credenciales o datos

## Roles

- `Admin`
  - abre o cierra convocatoria
  - define lista final
  - registra asistencia real
  - carga equipos, resultado y goles
  - puede corregir datos
- `Jugador`
  - inicia sesion
  - confirma asistencia
  - se baja si ya estaba anotado
  - ve historial
  - ve lista del proximo martes
  - ve equipos y resultado

## Funcionalidades MVP

1. `Convocatoria semanal`
   - un partido por martes
   - cierre operativo automatizado
   - cada jugador marca `Voy`, `No voy` o `Suplente`
   - timestamp de confirmacion

2. `Lista de partido`
   - titulares y suplentes
   - orden de prioridad visible o derivable
   - cambios de ultimo momento
   - estado `Suspendido` si no se llega al minimo de 12 o si se cancela por clima

3. `Asistencia e historial`
   - asistencia confirmada
   - asistencia real
   - bajas tardias
   - no-show
   - estado final del partido (`played` o `suspended`)

4. `Equipos`
   - dos equipos por partido
   - asignacion manual en MVP
   - historial de equipos por fecha
   - formatos validos: `7v7` con 14 o `6v6` con 12

5. `Resultado y goles`
   - marcador final
   - goleadores por partido
   - goles por jugador acumulados

6. `Estadisticas basicas`
   - presencias
   - presencias reales
   - goles
   - diferencia de goles del equipo cuando jugo
   - porcentaje simple de victorias, empates o derrotas
   - cantidad de veces que cada jugador se llevo camisetas

7. `Logistica de camisetas`
   - asignar quien se lleva las camisetas a lavar
   - preferencia por turnos entre quienes jugaron o quedaron en la lista final
   - posibilidad de override admin si el asignado no puede
   - recordar que hay dos juegos: crema y negras con naranja

8. `Reglamento digital`
   - reglas visibles dentro de la app
   - algunas reglas automatizadas
   - otras reglas quedan manuales en esta primera version

## Reglas a automatizar en MVP

Conviene automatizar solo lo que no agregue demasiada complejidad:

- cierre operativo configurable
- orden por fecha de anotacion
- clasificacion `titular`, `suplente`, `baja`, `ausente`
- validacion `14 => 7v7`
- validacion `12 => 6v6`
- alerta o suspension cuando hay menos de `12`
- bloqueo de nuevas altas despues del cierre
- permiso de baja tardia despues del cierre
- asignacion de camisetas al cerrarse la convocatoria

## Reglas que dejaria manuales o semi-manuales

- votaciones por clima
- excepciones informales entre amigos
- prioridad especial de arqueros si no esta del todo definida
- suplentes que entran por consenso
- devolucion y override fino del flujo de camisetas

Estas reglas pueden vivir como override de admin para no trabar el MVP.

## Flujo principal semanal

1. El admin deja abierta la convocatoria del martes.
2. Los jugadores responden si van o no van.
3. El sistema cierra nuevas altas `90 minutos` antes del partido.
4. El sistema consolida lista final y asigna camisetas al cerrarse la convocatoria.
5. El admin puede registrar bajas tardias si hace falta.
6. Si no se llega a 12 jugadores o el clima obliga a frenarlo, la fecha se marca como suspendida.
7. Se cargan equipos.
8. Despues del partido se registra resultado y goles.
9. La app actualiza historial y estadisticas.

## Pantallas MVP

1. `Login`
   - seleccion de jugador
   - codigo grupal
   - acceso admin por codigo extra

2. `Inicio`
   - proximo partido
   - estado de convocatoria
   - CTA para confirmar asistencia
   - teaser del ranking

3. `Confirmar asistencia`
   - voy
   - no voy
   - suplente
   - baja tardia si corresponde

4. `Lista del martes`
   - confirmados
   - titulares
   - suplentes
   - bajas
   - aviso de partido suspendido si no se juega

5. `Partido`
   - fecha, cancha, hora
   - equipos
   - resultado
   - goleadores

6. `Historial`
   - partidos anteriores
   - detalle por fecha
   - ranking acumulado

7. `Jugadores`
   - lista completa del grupo
   - estado de cada jugador
   - admins visibles
   - metricas visibles, incluyendo `lavados`

8. `Admin`
   - cerrar convocatoria
   - mover jugadores
   - registrar asistencia real
   - cargar equipos
   - cargar resultado y goles
   - suspender fecha por clima o por no llegar al minimo
   - ver estado de camisetas

## Features adicionales recomendadas para MVP+

No las pondria en la primera entrega, pero si las dejaria disenadas:

- auth por OTP o magic link
- notificaciones de apertura y cierre
- votacion de clima
- balanceador de equipos por nivel
- ranking de companeros mas frecuentes
- deuda o registro de pago de cancha
- encuesta post partido
- invitacion por QR o link para sumar jugadores nuevos al grupo

## Reglas operativas fijas del grupo

- nunca deberia existir una fecha desbalanceada tipo `7 vs 5`
- con 14 jugadores el formato real es `7v7`
- con 12 jugadores el formato real es `6v6`
- con menos de 12 la fecha deberia quedar `Suspendida`, salvo excepcion manual

## Criterios de exito del MVP

- al menos 80% de las confirmaciones semanales se hacen desde la app
- el admin ya no necesita editar Excel para operar el martes
- cada partido queda registrado con equipos y resultado
- se puede consultar historial confiable desde el celular

## Alcance de V1 vs V2

### V1

- login simple
- convocatoria
- lista final
- cierre operativo
- cierre automatico persistido
- resultado
- goles
- historial
- estadisticas basicas
- asignacion de camisetas

### V2

- OTP o magic link
- notificaciones avanzadas
- votaciones
- armado automatico de equipos
- metricas mas complejas
- social features
