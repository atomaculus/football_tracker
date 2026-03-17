import { AppShell } from "@/components/app-shell";
import { SectionCard } from "@/components/ui";
import { historyMatches, leaderboard } from "@/lib/mock-data";

export default function HistoryPage() {
  return (
    <AppShell
      title="Historial"
      subtitle="Resumen de partidos anteriores, resultados y rendimiento acumulado del grupo."
    >
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard eyebrow="Ultimos partidos" title="Fechas recientes">
          <div className="space-y-3">
            {historyMatches.map((match) => (
              <div
                key={match.date}
                className="rounded-[1.5rem] border border-line bg-surface-strong p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-lg font-extrabold">{match.date}</p>
                    <p className="text-sm text-muted">{match.attendance}</p>
                  </div>
                  <p className="rounded-full bg-[#efe7d5] px-3 py-1 text-xs font-bold uppercase tracking-[0.2em]">
                    {match.result}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{match.notes}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Ranking" title="Rendimiento acumulado" dark>
          <div className="overflow-hidden rounded-[1.4rem] border border-white/10">
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
        </SectionCard>
      </section>
    </AppShell>
  );
}
