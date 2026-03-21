import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { MatchCountdown } from "@/components/match-countdown";
import { Pill, SectionCard } from "@/components/ui";
import { requireViewerSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/data";

export default async function Home() {
  const viewer = await requireViewerSession("/");
  const { attendanceBoard, laundryDuty, leaderboard, navItems, nextMatch } =
    await getDashboardData();

  return (
    <AppShell
      title="Inicio del martes"
      subtitle="Un tablero mas de cita grande que de planilla. Confirmar, ver el pulso del grupo y entrar en clima para el proximo partido."
      navItems={navItems}
      nextMatch={nextMatch}
      viewer={viewer}
    >
      <section className="grid gap-6">
        <SectionCard eyebrow="Noche de partido" title="El fixture del martes merece otra energia">
          <div className="grid gap-4">
            <div className="rounded-[1.9rem] border border-white/22 bg-[linear-gradient(135deg,rgba(10,31,21,0.96),rgba(22,62,41,0.88))] p-6 text-white">
              <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr] xl:items-stretch">
                <div className="flex h-full flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/55">
                        Proximo partido
                      </p>
                      <p className="mt-2 text-3xl font-black sm:text-4xl">
                        {nextMatch.dateLabel} {" · "} {nextMatch.timeLabel}
                      </p>
                      <p className="mt-2 text-sm text-white/68">{nextMatch.venue}</p>
                      {nextMatch.signupClosesLabel ? (
                        <p className="mt-4 max-w-xl text-sm leading-6 text-white/74">
                          La convocatoria cierra automaticamente {nextMatch.signupClosesLabel}. El
                          objetivo es llegar con lista, suplentes y ambiente de partido grande.
                        </p>
                      ) : null}
                    </div>
                    <Pill tone="accent">{nextMatch.status}</Pill>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/confirmar"
                      className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-[#e8efdf]"
                    >
                      Confirmar asistencia
                    </Link>
                    <Link
                      href="/partido"
                      className="rounded-full border border-white/24 bg-white/8 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/48"
                    >
                      Ver partido
                    </Link>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.35rem] border border-white/12 bg-white/8 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/52">Formato</p>
                      <p className="mt-2 text-3xl font-black">{nextMatch.format}</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/12 bg-white/8 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/52">Objetivo</p>
                      <p className="mt-2 text-3xl font-black">{nextMatch.targetPlayers}</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-white/12 bg-white/8 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-white/52">Fallback</p>
                      <p className="mt-2 text-3xl font-black">{nextMatch.fallbackPlayers}</p>
                    </div>
                  </div>
                </div>

                <MatchCountdown isoDate={nextMatch.isoDate} isoTime={nextMatch.isoTime} compact />
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionCard eyebrow="Lista en vivo" title="Ultimas respuestas" dark>
          <div className="space-y-3">
            {attendanceBoard.map((player) => (
              <div
                key={`${player.name}-${player.detail}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4"
              >
                <div>
                  <p className="font-extrabold">{player.name}</p>
                  <p className="text-sm text-white/60">{player.detail}</p>
                </div>
                <Pill>{player.status}</Pill>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Accesos" title="Entradas rapidas">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: "/confirmar", label: "Confirmar asistencia" },
              { href: "/partido", label: "Partido y equipos" },
              { href: "/historial", label: "Historial" },
              { href: "/jugadores", label: "Jugadores del grupo" },
              { href: "/admin", label: "Panel admin" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[1.5rem] border border-line bg-surface-strong p-5 text-sm font-extrabold uppercase tracking-[0.08em] transition hover:-translate-y-0.5 hover:border-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard eyebrow="Estadisticas" title="Pulso del grupo">
          <div className="overflow-hidden rounded-[1.4rem] border border-line">
            <div className="grid grid-cols-[1.45fr_0.7fr_0.7fr_0.9fr_0.8fr] bg-surface-strong px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-muted">
              <span>Jugador</span>
              <span>Jug.</span>
              <span>Goles</span>
              <span>Exito</span>
              <span>Dif.</span>
            </div>
            {leaderboard.map((player, index) => (
              <div
                key={player.name}
                className="grid grid-cols-[1.45fr_0.7fr_0.7fr_0.9fr_0.8fr] items-center border-t border-line px-4 py-4 text-sm"
              >
                <span className="font-bold">
                  {index + 1}. {player.name}
                </span>
                <span>{player.presences}</span>
                <span>{player.goals}</span>
                <span>{player.successRate ?? "0%"}</span>
                <span className="text-accent-strong">{player.diff}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Logistica" title="Encargado de camisetas">
          <div className="rounded-[1.5rem] border border-line bg-surface-strong p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                  Asignacion actual
                </p>
                <p className="mt-2 text-2xl font-black">{laundryDuty.assigneeName}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{laundryDuty.notes}</p>
              </div>
              <Pill tone="lime">{laundryDuty.status}</Pill>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.2rem] border border-[#2d6a3d]/10 bg-[#edf3e4] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Modo</p>
                <p className="mt-2 text-lg font-black capitalize">
                  {laundryDuty.assignmentMode}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-[#2d6a3d]/10 bg-[#dbe8d8] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Entrega</p>
                <p className="mt-2 text-lg font-black">{laundryDuty.dueLabel}</p>
              </div>
            </div>
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
