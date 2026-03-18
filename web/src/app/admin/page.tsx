import { AppShell } from "@/components/app-shell";
import { Pill, SectionCard } from "@/components/ui";
import { getAdminPageData, getDashboardData } from "@/lib/data";

export default async function AdminPage() {
  const { navItems, nextMatch } = await getDashboardData();
  const { adminActions, attendanceBoard, laundryDuty } = await getAdminPageData();

  return (
    <AppShell
      title="Panel admin"
      subtitle="Vista operativa para abrir convocatoria, mover jugadores entre lista y cerrar el partido del martes."
      navItems={navItems}
      nextMatch={nextMatch}
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard eyebrow="Acciones" title="Control semanal">
          <div className="grid gap-3 sm:grid-cols-2">
            {adminActions.map((action) => (
              <div
                key={action}
                className="rounded-[1.4rem] border border-line bg-surface-strong p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-extrabold uppercase tracking-[0.08em]">
                    {action}
                  </p>
                  <Pill>Backlog</Pill>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Esta accion queda lista para conectar en la siguiente etapa con Supabase y
                  permisos de administrador.
                </p>
              </div>
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

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <SectionCard eyebrow="Camisetas" title="Encargado de lavado">
          <div className="rounded-[1.5rem] border border-line bg-surface-strong p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-muted">
                  Asignado esta semana
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

        <SectionCard eyebrow="Backlog" title="Regla operativa" dark>
          <div className="space-y-4 text-sm leading-6 text-white/78">
            <p>
              La app puede asignar el lavado por turnos entre los que jugaron la fecha y
              permitir override manual si justo el encargado no va el martes siguiente.
            </p>
            <p>
              Mas adelante se puede agregar modo aleatorio, pero para el grupo real la
              rotacion ordenada probablemente sea mas justa y mas simple de auditar.
            </p>
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
