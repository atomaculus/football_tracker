export default function Home() {
  const attendance = [
    { name: "Lucas", status: "Titular", detail: "Confirmo lunes 08:07" },
    { name: "Mariano", status: "Titular", detail: "Confirmo lunes 08:11" },
    { name: "Ruben", status: "Titular", detail: "Confirmo lunes 08:14" },
    { name: "Fidel", status: "Titular", detail: "Confirmo lunes 08:31" },
    { name: "Pacho", status: "Suplente", detail: "Primero en espera" },
    { name: "Nico Arquero", status: "No va", detail: "Baja avisada" },
  ];

  const matchFlow = [
    {
      step: "01",
      title: "Convocatoria automatica",
      text: "Cada lunes se abre el partido del martes y todos responden desde el telefono.",
    },
    {
      step: "02",
      title: "Lista clara",
      text: "Admins ven titulares, suplentes, bajas tardias y prioridad sin editar Excel.",
    },
    {
      step: "03",
      title: "Cierre del partido",
      text: "Se cargan equipos, resultado y goleadores. El historial queda listo en el acto.",
    },
  ];

  const features = [
    "Confirmacion por telefono",
    "Lista 7v7 con fallback a 6v6",
    "Dos administradores",
    "Historial de equipos por fecha",
    "Scoring de goles por jugador",
    "Reglas visibles y overrides manuales",
  ];

  const leaderboard = [
    { name: "Ruben Mel", presences: 33, goals: 14, diff: "+14" },
    { name: "Esteban Larre", presences: 7, goals: 4, diff: "+4" },
    { name: "Fidel", presences: 7, goals: 3, diff: "+1" },
    { name: "Guido Marani", presences: 3, goals: 2, diff: "+2" },
  ];

  return (
    <main className="grain min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="card-shadow overflow-hidden rounded-[2rem] border border-line bg-surface">
          <div className="grid gap-6 p-6 lg:grid-cols-[1.35fr_0.9fr] lg:p-10">
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-[0.22em] text-muted">
                <span className="rounded-full bg-lime px-3 py-1 text-foreground">
                  MVP web responsive
                </span>
                <span>Martes 21:00</span>
                <span>14 jugadores</span>
                <span>7v7</span>
              </div>

              <div className="max-w-3xl">
                <p className="display text-6xl leading-none text-foreground sm:text-7xl lg:text-8xl">
                  Football
                </p>
                <p className="display -mt-2 text-6xl leading-none text-accent sm:text-7xl lg:text-8xl">
                  Tracker
                </p>
                <h1 className="mt-6 max-w-2xl text-xl font-semibold text-foreground sm:text-2xl">
                  El Excel deja de operar el martes. La app se ocupa de asistencia,
                  lista, equipos, goles e historial.
                </h1>
                <p className="mt-4 max-w-xl text-base leading-7 text-muted sm:text-lg">
                  Esta primera base esta pensada para dos administradores y jugadores que
                  se autogestionan por telefono. El formato principal es 7v7, con fallback
                  a 6v6 cuando baja la asistencia.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#proximo-martes"
                  className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition hover:bg-surface-dark"
                >
                  Ver partido actual
                </a>
                <a
                  href="#roadmap"
                  className="rounded-full border border-line bg-surface-strong px-5 py-3 text-sm font-semibold text-foreground transition hover:border-foreground"
                >
                  Ver roadmap MVP
                </a>
              </div>
            </div>

            <div className="grid gap-4">
              <article className="card-shadow rounded-[1.75rem] border border-line bg-surface-strong p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                      Proximo martes
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold">25 de marzo</h2>
                  </div>
                  <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
                    Convocatoria abierta
                  </span>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#f1ead8] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Confirmados
                    </p>
                    <p className="mt-1 text-3xl font-black">11</p>
                  </div>
                  <div className="rounded-2xl bg-[#f7ddc9] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Suplentes
                    </p>
                    <p className="mt-1 text-3xl font-black">2</p>
                  </div>
                  <div className="rounded-2xl bg-[#dae8db] p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">
                      Faltan
                    </p>
                    <p className="mt-1 text-3xl font-black">3</p>
                  </div>
                </div>

                <div className="mt-5 rounded-[1.4rem] bg-surface-dark p-4 text-white">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                    Regla operativa
                  </p>
                  <p className="mt-2 text-sm leading-6 text-white/88">
                    Si no llegamos a 14, la app marca automaticamente escenario 6v6 y
                    conserva igual el flujo de convocatoria.
                  </p>
                </div>
              </article>

              <article className="card-shadow rounded-[1.75rem] border border-line bg-[#d8ef5c] p-5 text-foreground">
                <p className="text-xs font-bold uppercase tracking-[0.24em]">
                  Login inicial
                </p>
                <h3 className="mt-2 text-3xl font-black">Telefono primero</h3>
                <p className="mt-3 max-w-sm text-sm leading-6">
                  El camino recomendado para este MVP es login por telefono y OTP. Si
                  queremos salir aun mas rapido, podemos dejar una autenticacion provisoria
                  para admins mientras armamos Supabase.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          id="proximo-martes"
          className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"
        >
          <article className="card-shadow rounded-[2rem] border border-line bg-surface p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                  Estado del partido
                </p>
                <h2 className="mt-2 text-3xl font-black">Quienes ya respondieron</h2>
              </div>
              <div className="rounded-full border border-line bg-surface-strong px-4 py-2 text-sm font-semibold text-muted">
                Cupo objetivo: 14
              </div>
            </div>

            <div className="mt-6 grid gap-3">
              {attendance.map((player) => (
                <div
                  key={player.name}
                  className="grid gap-2 rounded-[1.3rem] border border-line bg-surface-strong p-4 sm:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="text-lg font-extrabold">{player.name}</p>
                    <p className="text-sm text-muted">{player.detail}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="rounded-full bg-[#efe7d5] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                      {player.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="card-shadow rounded-[2rem] border border-line bg-surface-dark p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
              Flujo semanal
            </p>
            <div className="mt-5 space-y-5">
              {matchFlow.map((item) => (
                <div
                  key={item.step}
                  className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="display text-3xl text-lime">{item.step}</span>
                    <h3 className="text-lg font-extrabold">{item.title}</h3>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/75">{item.text}</p>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="card-shadow rounded-[2rem] border border-line bg-surface p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
              Scope MVP
            </p>
            <h2 className="mt-2 text-3xl font-black">Lo que si entra ahora</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="rounded-[1.3rem] border border-line bg-surface-strong px-4 py-4 text-sm font-semibold"
                >
                  {feature}
                </div>
              ))}
            </div>
          </article>

          <article className="card-shadow rounded-[2rem] border border-line bg-[#13261c] p-6 text-white">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                  Ranking demo
                </p>
                <h2 className="mt-2 text-3xl font-black">Resumen del historial</h2>
              </div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                Mock inicial
              </span>
            </div>

            <div className="mt-6 overflow-hidden rounded-[1.4rem] border border-white/10">
              <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] bg-white/6 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white/50">
                <span>Jugador</span>
                <span>Pres.</span>
                <span>Goles</span>
                <span>Dif.</span>
              </div>
              {leaderboard.map((player, index) => (
                <div
                  key={player.name}
                  className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] items-center border-t border-white/10 px-4 py-4 text-sm"
                >
                  <span className="font-bold text-white">
                    {index + 1}. {player.name}
                  </span>
                  <span>{player.presences}</span>
                  <span>{player.goals}</span>
                  <span className="text-lime">{player.diff}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section
          id="roadmap"
          className="card-shadow rounded-[2rem] border border-line bg-surface p-6"
        >
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                Siguiente paso
              </p>
              <h2 className="mt-2 text-3xl font-black">Sprint 1 de construccion</h2>
              <p className="mt-4 max-w-lg text-base leading-7 text-muted">
                La base visual ya quedo lista. El siguiente bloque tiene que convertir este
                mock en producto real con auth, persistencia y panel admin operativo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                "Conectar Supabase",
                "Definir tablas base",
                "Agregar login por telefono",
                "Crear pantalla de confirmacion",
                "Panel admin para abrir partido",
                "Registrar resultado y goleadores",
              ].map((item, index) => (
                <div
                  key={item}
                  className="rounded-[1.4rem] border border-line bg-surface-strong p-4"
                >
                  <p className="display text-3xl text-accent">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-2 text-sm font-extrabold uppercase tracking-[0.08em]">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
