import { AppShell } from "@/components/app-shell";
import { Pill, SectionCard } from "@/components/ui";
import { requireViewerSession } from "@/lib/auth";
import { getDashboardData, getHistoryPageData, getPlayersPageData } from "@/lib/data";

export default async function PlayersPage() {
  const viewer = await requireViewerSession("/jugadores");
  const { navItems, nextMatch } = await getDashboardData();
  const [{ clusterPlayers }, { leaderboard }] = await Promise.all([
    getPlayersPageData(),
    getHistoryPageData(),
  ]);
  const statsByPlayer = new Map(leaderboard.map((player) => [player.name, player]));

  return (
    <AppShell
      title="Jugadores del grupo"
      subtitle="Listado del grupo con estado actual, roles y estadisticas visibles por jugador."
      navItems={navItems}
      nextMatch={nextMatch}
      viewer={viewer}
    >
      <section className="grid gap-6">
        <SectionCard eyebrow="Cluster" title="Base actual de jugadores">
          <div className="space-y-3">
            {clusterPlayers.map((player) => (
              (() => {
                const stats = statsByPlayer.get(player.name);

                return (
                  <div
                    key={player.id}
                    className="rounded-[1.4rem] border border-line bg-surface-strong px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-extrabold">{player.name}</p>
                        <p className="text-sm text-muted">{player.role}</p>
                      </div>
                      <Pill tone={player.status === "Activo" ? "lime" : "accent"}>
                        {player.status}
                      </Pill>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-4">
                      <div className="rounded-[1rem] border border-line bg-background/55 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Jugados</p>
                        <p className="mt-1 text-xl font-black">{stats?.presences ?? 0}</p>
                      </div>
                      <div className="rounded-[1rem] border border-line bg-background/55 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Goles</p>
                        <p className="mt-1 text-xl font-black">{stats?.goals ?? 0}</p>
                      </div>
                      <div className="rounded-[1rem] border border-line bg-background/55 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Exito</p>
                        <p className="mt-1 text-xl font-black">{stats?.successRate ?? "0%"}</p>
                      </div>
                      <div className="rounded-[1rem] border border-line bg-background/55 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">Dif.</p>
                        <p className="mt-1 text-xl font-black">{stats?.diff ?? "+0"}</p>
                      </div>
                    </div>
                  </div>
                );
              })()
            ))}
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
