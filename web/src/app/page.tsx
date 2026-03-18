import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { MatchCountdown } from "@/components/match-countdown";
import { Pill, SectionCard } from "@/components/ui";
import { getDashboardData } from "@/lib/data";

export default async function Home() {
  const { attendanceBoard, laundryDuty, leaderboard, navItems, nextMatch } =
    await getDashboardData();

  return (
    <AppShell
      title="Inicio del martes"
      subtitle="Vista principal para entrar rapido a confirmar asistencia, revisar si el partido ya esta armado y consultar el pulso de la semana."
      navItems={navItems}
      nextMatch={nextMatch}
    >
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SectionCard eyebrow="Accion rapida" title="Tu estado para esta fecha">
          <div className="grid gap-4">
            <div className="rounded-[1.6rem] border border-line bg-surface-strong p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                    Proximo partido
                  </p>
                  <p className="mt-2 text-2xl font-black">
                    {nextMatch.dateLabel} {" · "} {nextMatch.timeLabel}
                  </p>
                  <p className="mt-1 text-sm text-muted">{nextMatch.venue}</p>
                </div>
                <Pill tone="accent">{nextMatch.status}</Pill>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/confirmar"
                  className="rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-white transition hover:bg-surface-dark"
                >
                  Confirmar asistencia
                </Link>
                <Link
                  href="/partido"
                  className="rounded-full border border-line bg-background/40 px-5 py-3 text-sm font-semibold transition hover:border-foreground"
                >
                  Ver partido
                </Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.5rem] bg-[#f1ead8] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Formato</p>
                <p className="mt-2 text-3xl font-black">{nextMatch.format}</p>
              </div>
              <div className="rounded-[1.5rem] bg-[#dae8db] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Objetivo</p>
                <p className="mt-2 text-3xl font-black">{nextMatch.targetPlayers}</p>
              </div>
              <div className="rounded-[1.5rem] bg-[#f7ddc9] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Fallback</p>
                <p className="mt-2 text-3xl font-black">{nextMatch.fallbackPlayers}</p>
              </div>
            </div>

            <MatchCountdown isoDate={nextMatch.isoDate} isoTime={nextMatch.isoTime} />
          </div>
        </SectionCard>

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
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard eyebrow="Atajos" title="Navegacion del MVP">
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
                className="rounded-[1.4rem] border border-line bg-surface-strong p-5 text-sm font-extrabold uppercase tracking-[0.08em] transition hover:border-foreground"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Ranking demo" title="Pulso del grupo">
          <div className="overflow-hidden rounded-[1.4rem] border border-line">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] bg-surface-strong px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-muted">
              <span>Jugador</span>
              <span>Pres.</span>
              <span>Goles</span>
              <span>Dif.</span>
            </div>
            {leaderboard.map((player, index) => (
              <div
                key={player.name}
                className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] items-center border-t border-line px-4 py-4 text-sm"
              >
                <span className="font-bold">
                  {index + 1}. {player.name}
                </span>
                <span>{player.presences}</span>
                <span>{player.goals}</span>
                <span className="text-accent-strong">{player.diff}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
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
              <div className="rounded-[1.2rem] bg-[#f1ead8] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Modo</p>
                <p className="mt-2 text-lg font-black capitalize">
                  {laundryDuty.assignmentMode}
                </p>
              </div>
              <div className="rounded-[1.2rem] bg-[#dae8db] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Entrega</p>
                <p className="mt-2 text-lg font-black">{laundryDuty.dueLabel}</p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Regla sugerida" title="Como conviene resolverlo" dark>
          <div className="space-y-4 text-sm leading-6 text-white/78">
            <p>
              Para ustedes conviene arrancar por turnos, no al azar. Asi todos cargan con
              las camisetas de forma pareja y se evita repetir a uno que ya las llevo hace
              poco.
            </p>
            <p>
              La version admin puede igual ofrecer un override manual para reasignar si el
              encargado de esa semana falta o se baja a ultimo momento.
            </p>
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
