import { AppShell } from "@/components/app-shell";
import { Pill, SectionCard } from "@/components/ui";
import { adminActions, attendanceBoard } from "@/lib/mock-data";

export default function AdminPage() {
  return (
    <AppShell
      title="Panel admin"
      subtitle="Vista operativa para abrir convocatoria, mover jugadores entre lista y cerrar el partido del martes."
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard eyebrow="Acciones" title="Control semanal">
          <div className="grid gap-3 sm:grid-cols-2">
            {adminActions.map((action) => (
              <button
                key={action}
                className="rounded-[1.4rem] border border-line bg-surface-strong p-4 text-left text-sm font-extrabold uppercase tracking-[0.08em] transition hover:border-foreground"
              >
                {action}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard eyebrow="Lista operativa" title="Jugadores de esta fecha" dark>
          <div className="space-y-3">
            {attendanceBoard.map((player) => (
              <div
                key={player.name}
                className="rounded-[1.4rem] border border-white/10 bg-white/6 px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-extrabold">{player.name}</p>
                    <p className="text-sm text-white/60">{player.detail}</p>
                  </div>
                  <Pill>{player.status}</Pill>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
