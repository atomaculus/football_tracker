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

  const recentResponses = attendanceBoard.slice(0, 5);
  const topPlayers = leaderboard.slice(0, 3);

  return (
    <AppShell
      title="La Fecha del martes"
      subtitle="Una vista clara para confirmar, seguir el pulso del grupo y llegar al partido sin ruido ni planillas duplicadas."
      navItems={navItems}
      nextMatch={nextMatch}
      viewer={viewer}
    >
      <section className="grid gap-6">
        <SectionCard eyebrow="Ritmo de semana" title="Cuenta regresiva y foco operativo">
          <div className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr] xl:items-stretch">
            <MatchCountdown isoDate={nextMatch.isoDate} isoTime={nextMatch.isoTime} compact />

            <div className="rounded-[1.9rem] border border-line bg-surface-strong p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                    Momento de la semana
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
                    {nextMatch.signupClosesLabel
                      ? `La convocatoria sigue abierta hasta ${nextMatch.signupClosesLabel}. Confirma temprano para ordenar titulares, suplentes y el cierre del martes sin correr atras.`
                      : "Confirma temprano para ordenar titulares, suplentes y el cierre del martes sin correr atras."}
                  </p>
                </div>
                <Pill tone="accent">{nextMatch.status}</Pill>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/confirmar"
                  className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-[#0a0f1c] transition hover:bg-accent-strong"
                >
                  Confirmar asistencia
                </Link>
                <Link
                  href="/partido"
                  className="rounded-full border border-line bg-background/60 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-foreground"
                >
                  Ver partido
                </Link>
                {viewer.isAdmin ? (
                  <Link
                    href="/admin"
                    className="rounded-full border border-line bg-background/60 px-5 py-3 text-sm font-semibold text-foreground transition hover:border-foreground"
                  >
                    Panel admin
                  </Link>
                ) : null}
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.35rem] border border-lime/20 bg-lime/[0.08] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Formato</p>
                  <p className="mt-2 text-3xl font-black text-lime">{nextMatch.format}</p>
                </div>
                <div className="rounded-[1.35rem] border border-accent/20 bg-accent/[0.08] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Objetivo</p>
                  <p className="mt-2 text-3xl font-black text-accent">{nextMatch.targetPlayers}</p>
                </div>
                <div className="rounded-[1.35rem] border border-white/[0.1] bg-white/[0.04] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Fallback</p>
                  <p className="mt-2 text-3xl font-black">{nextMatch.fallbackPlayers}</p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <SectionCard eyebrow="Lista en vivo" title="Ultimos movimientos">
          {recentResponses.length ? (
            <div className="space-y-3">
              {recentResponses.map((player) => (
                <div
                  key={`${player.name}-${player.detail}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-line bg-surface-strong px-4 py-4"
                >
                  <div>
                    <p className="font-extrabold">{player.name}</p>
                    <p className="text-sm text-muted">{player.detail}</p>
                  </div>
                  <Pill>{player.status}</Pill>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-line bg-surface-strong px-4 py-4 text-sm leading-6 text-muted">
              Todavia no hay respuestas cargadas para la proxima fecha.
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[1.35rem] border border-line bg-background/55 px-4 py-4">
            <p className="text-sm text-muted">
              {attendanceBoard.length > recentResponses.length
                ? `Mostrando ${recentResponses.length} de ${attendanceBoard.length} respuestas recientes.`
                : "Ya tenes a la vista la actividad reciente del grupo."}
            </p>
            <Link
              href="/confirmar"
              className="rounded-full border border-white/[0.1] bg-white/[0.06] px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent/40"
            >
              Ver lista completa
            </Link>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Pulso del grupo" title="Top 3 del momento">
          <div className="grid gap-3">
            {topPlayers.map((player, index) => (
              <div
                key={player.name}
                className="rounded-[1.5rem] border border-line bg-surface-strong p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-muted">
                      Puesto {index + 1}
                    </p>
                    <p className="mt-2 text-2xl font-black">{player.name}</p>
                  </div>
                  <Pill tone={index === 0 ? "lime" : "default"}>{index === 0 ? "On fire" : "Top"}</Pill>
                </div>

                <div className="mt-5 rounded-[1.2rem] border border-lime/20 bg-lime/[0.08] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Jugados</p>
                  <p className="mt-2 text-3xl font-black text-lime">{player.presences}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <Link
              href="/historial"
              className="inline-flex rounded-full border border-white/[0.1] bg-white/[0.06] px-4 py-2 text-sm font-semibold text-foreground transition hover:border-accent/40"
            >
              Ver historial completo
            </Link>
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard eyebrow="Logistica" title="Camisetas de la semana">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] border border-line bg-surface-strong p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                Asignacion actual
              </p>
              <p className="mt-2 text-2xl font-black">{laundryDuty.assigneeName}</p>
              <p className="mt-2 text-sm text-muted">{laundryDuty.notes}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Pill tone="lime">{laundryDuty.status}</Pill>
              <div className="w-full rounded-[1.2rem] border border-lime/20 bg-lime/[0.08] px-4 py-3 text-sm sm:w-auto">
                <span className="font-bold">Modo:</span> {laundryDuty.assignmentMode}
              </div>
              <div className="w-full rounded-[1.2rem] border border-white/[0.1] bg-white/[0.04] px-4 py-3 text-sm sm:w-auto">
                <span className="font-bold">Entrega:</span> {laundryDuty.dueLabel}
              </div>
            </div>
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
