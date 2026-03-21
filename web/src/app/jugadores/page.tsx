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
      subtitle="Listado del cluster de futbol con estado actual, roles y espacio para futuras invitaciones por QR."
      navItems={navItems}
      nextMatch={nextMatch}
      viewer={viewer}
    >
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
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

        <SectionCard eyebrow="Futuro" title="Invitar gente nueva" dark>
          <div className="space-y-4 text-sm leading-6 text-white/78">
            <p>
              En una etapa siguiente esta pantalla puede generar un QR o link corto para
              sumar jugadores nuevos al grupo sin tener que cargarlos manualmente.
            </p>
            <div className="rounded-[1.5rem] border border-dashed border-white/20 bg-white/6 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/60">
                Proximamente
              </p>
              <p className="mt-3 text-lg font-extrabold">QR de invitacion al grupo</p>
              <p className="mt-2 text-white/70">
                Alta simple de jugadores nuevos con telefono, nombre y rol inicial.
              </p>
            </div>
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
