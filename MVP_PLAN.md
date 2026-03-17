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

3. `Asistencia e historial`
   - asistencia confirmada
   - asistencia real
   - bajas tardias
   - no-show
   - invitados

4. `Equipos`
   - dos equipos por partido
   - asignacion manual en MVP
   - historial de equipos por fecha

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

7. `Reglamento digital`
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
5. Se cargan equipos.
6. Despues del partido se registra resultado y goles.
7. La app actualiza historial y estadisticas.

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

## Features adicionales recomendadas para MVP+

No las pondria en la primera entrega, pero si las dejaria disenadas:

- notificaciones push de apertura y cierre
- votacion de clima
- balanceador de equipos por nivel
- ranking de companeros mas frecuentes
- deuda o registro de pago de cancha
- encuesta post partido
- invitacion por QR o link para sumar jugadores nuevos al grupo

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
