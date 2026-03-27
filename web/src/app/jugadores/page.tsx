import { AppShell } from "@/components/app-shell";
import { Pill, SectionCard } from "@/components/ui";
import { requireViewerSession } from "@/lib/auth";
import { getDashboardData, getPlayersPageData } from "@/lib/data";

export default async function PlayersPage() {
  const viewer = await requireViewerSession("/jugadores");
  const { navItems, nextMatch } = await getDashboardData();
  const { clusterPlayers } = await getPlayersPageData();
  const activePlayers = clusterPlayers.filter((player) => player.status === "Activo");
  const inactivePlayers = clusterPlayers.filter((player) => player.status !== "Activo");
  const adminPlayers = clusterPlayers.filter((player) => player.role === "Admin");

  return (
    <AppShell
      title="Jugadores del grupo"
      subtitle="Base actual del grupo para ver quienes estan activos, quienes administran la app y el estado general del plantel."
      navItems={navItems}
      nextMatch={nextMatch}
      viewer={viewer}
    >
      <section className="grid gap-6">
        <SectionCard eyebrow="Resumen" title="Estado del plantel">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.3rem] border border-lime/20 bg-lime/[0.08] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Activos</p>
              <p className="mt-2 text-3xl font-black text-lime">{activePlayers.length}</p>
            </div>
            <div className="rounded-[1.3rem] border border-accent/20 bg-accent/[0.08] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Admins</p>
              <p className="mt-2 text-3xl font-black text-accent">{adminPlayers.length}</p>
            </div>
            <div className="rounded-[1.3rem] border border-white/[0.1] bg-white/[0.04] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Inactivos</p>
              <p className="mt-2 text-3xl font-black">{inactivePlayers.length}</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Cluster" title="Base actual de jugadores">
          <div className="space-y-3">
            {clusterPlayers.map((player) => (
              <div
                key={player.id}
                className="rounded-[1.4rem] border border-line bg-surface-strong px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{player.name}</p>
                    <p className="text-sm text-muted">
                      {player.role === "Admin"
                        ? "Admin del grupo"
                        : "Jugador del plantel habitual"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill tone={player.role === "Admin" ? "accent" : "default"}>
                      {player.role}
                    </Pill>
                    <Pill tone={player.status === "Activo" ? "lime" : "accent"}>
                      {player.status}
                    </Pill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
