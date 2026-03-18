# MVP Futbol Martes

## Objetivo

Convertir el Excel actual en una app Android simple para gestionar los partidos de los martes, con foco en:

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
- cuesta consultar historial de equipos y de companeros/rivales
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

## Propuesta MVP

### Roles

- `Admin`
  - crea partidos
  - abre/cierra convocatoria
  - define titulares y suplentes
  - carga equipos, resultado y goles
  - puede corregir datos
- `Jugador`
  - confirma asistencia
  - se baja
  - ve su historial
  - ve lista del proximo martes
  - ve equipos y resultado

### Funcionalidades MVP

1. `Convocatoria semanal`
   - un partido por martes
   - apertura automatica de convocatoria
   - cada jugador marca `Voy`, `No voy` o `Suplente`
   - timestamp de confirmacion

2. `Lista de partido`
   - titulares y suplentes
   - orden de prioridad visible
   - motivo de prioridad resumido
   - cambios de ultimo momento
   - estado `Suspendido` si no se llega al minimo de 12 o si se cancela por clima

3. `Asistencia e historial`
   - asistencia confirmada
   - asistencia real
   - bajas tardias
   - no-show
   - estado final del partido (`jugado` o `suspendido`)

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
   - porcentaje simple de victorias/empates/derrotas

7. `Logistica de camisetas`
   - asignar quien se lleva las camisetas a lavar
   - preferencia por turnos entre quienes jugaron
   - posibilidad de override admin si el asignado no puede
   - recordar que hay dos juegos: crema y negras con naranja

8. `Reglamento digital`
   - reglas visibles dentro de la app
   - algunas reglas automatizadas
   - otras reglas quedan manuales en esta primera version

## Reglas a automatizar en MVP

Conviene automatizar solo lo que no agregue demasiada complejidad:

- apertura de lista cada lunes 08:00
- cierre operativo configurable
- orden por fecha de anotacion
- clasificacion `titular`, `suplente`, `baja`, `ausente`
- penalizacion por baja tardia
- bonus de invierno si quieren mantener esa logica

## Reglas que dejaria manuales o semi-manuales

- votaciones por clima
- excepciones informales entre amigos
- prioridad especial de arqueros si no esta del todo definida
- suplentes que entran por consenso

Estas reglas pueden vivir como override de admin para no trabar el MVP.

## Flujo principal semanal

1. El lunes se abre automaticamente la convocatoria del martes.
2. Los jugadores responden si van o no van.
3. El admin ve la lista ordenada y arma titulares/suplentes.
4. El martes se cierran cambios y se define la lista final.
   Si no se llega a 12 jugadores o el clima obliga a frenarlo, la fecha se marca como suspendida.
5. Se cargan equipos.
6. Despues del partido se registra resultado y goles.
7. La app actualiza historial y estadisticas.
8. La app deja asignado quien se lleva las camisetas para devolverlas el martes siguiente.

## Pantallas MVP

1. `Login`
   - acceso por WhatsApp OTP o magic link

2. `Inicio`
   - proximo partido
   - estado de convocatoria
   - CTA para confirmar asistencia

3. `Confirmar asistencia`
   - voy
   - no voy
   - me bajo
   - nota opcional

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

7. `Jugadores`
   - lista completa del grupo
   - estado de cada jugador
   - admins visibles

8. `Mi perfil`
   - presencias
   - goles
   - partidos jugados
   - rendimiento simple

9. `Admin`
   - crear partido
   - cerrar convocatoria
   - mover jugadores
   - cargar resultado
   - suspender fecha por clima o por no llegar al minimo
   - asignar o reasignar encargado de camisetas

## Features adicionales recomendadas para MVP+

No las pondria en la primera entrega, pero si las dejaria disenadas:

- notificaciones push de apertura y cierre
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

- convocatoria
- lista
- titulares/suplentes
- resultado
- goles
- historial
- estadisticas basicas

### V2

- clima
- notificaciones avanzadas
- votaciones
- armado automatico de equipos
- metricas mas complejas
- social features
