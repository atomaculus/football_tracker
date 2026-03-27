import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/ui";
import { requireViewerSession } from "@/lib/auth";
import { getDashboardData, getMatchPageData } from "@/lib/data";

export default async function MatchPage() {
  const viewer = await requireViewerSession("/partido");
  const { navItems, nextMatch } = await getDashboardData();
  const { scorers, teams } = await getMatchPageData();

  return (
    <AppShell
      title="Partido y equipos"
      subtitle="Vista para revisar formacion, resultado y goleadores de una fecha puntual."
      navItems={navItems}
      nextMatch={nextMatch}
      viewer={viewer}
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard eyebrow="Equipos" title="Formacion del martes">
          {teams.length ? (
            <div className="grid gap-4 lg:grid-cols-2">
              {teams.map((team) => (
                <div
                  key={team.name}
                  className="rounded-[1.6rem] border border-line bg-surface-strong p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div
                      className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] ${team.color}`}
                    >
                      {team.name}
                    </div>
                    <p className="display text-4xl">{team.score}</p>
                  </div>
                  <div className="mt-5 space-y-2">
                    {team.players.map((player) => (
                      <div
                        key={player}
                        className="rounded-2xl border border-line bg-background/45 px-3 py-3 text-sm font-semibold"
                      >
                        {player}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-line bg-surface-strong px-4 py-4 text-sm leading-6 text-muted">
              Todavia no hay equipos cargados para la fecha actual.
            </div>
          )}
        </SectionCard>

        <SectionCard eyebrow="Scoring" title="Goleadores" dark>
          {scorers.length ? (
            <div className="space-y-3">
              {scorers.map((scorer) => (
                <div
                  key={`${scorer.name}-${scorer.team}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4"
                >
                  <div>
                    <p className="font-extrabold">{scorer.name}</p>
                    <p className="text-sm text-white/60">{scorer.team}</p>
                  </div>
                  <div className="text-right">
                    <p className="display text-3xl text-lime">{scorer.goals}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/60">goles</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4 text-sm leading-6 text-white/70">
              Todavia no hay goleadores cargados para la fecha actual.
            </div>
          )}
        </SectionCard>
      </section>
    </AppShell>
  );
}
