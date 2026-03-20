import { AppShell } from "@/components/app-shell";
import { AdminAttendanceManager } from "@/components/admin-attendance-manager";
import { AdminFinalRosterManager } from "@/components/admin-final-roster-manager";
import { AdminMatchControls } from "@/components/admin-match-controls";
import { AdminMatchResultManager } from "@/components/admin-match-result-manager";
import { Pill, SectionCard } from "@/components/ui";
import { getAdminPageData, getDashboardData } from "@/lib/data";

export default async function AdminPage() {
  const { navItems, nextMatch } = await getDashboardData();
  const {
    adminInsights,
    actualParticipants,
    actualParticipantSummary,
    attendanceBoard,
    attendanceSummary,
    currentMatch,
    goalEntries,
    laundryDuty,
    matchTeams,
    projectedStarters,
    projectedSubstitutes,
  } = await getAdminPageData();

  return (
    <AppShell
      title="Panel admin"
      subtitle="Vista operativa para abrir convocatoria, mover jugadores entre lista y cerrar el partido del martes."
      navItems={navItems}
      nextMatch={nextMatch}
    >
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AdminMatchControls currentMatch={currentMatch} />

        <SectionCard eyebrow="Lectura real" title="Pulso operativo">
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-[#2d6a3d]/10 bg-[#edf3e4] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Confirmados</p>
                <p className="mt-2 text-3xl font-black">{attendanceSummary.confirmed}</p>
              </div>
              <div className="rounded-[1.4rem] border border-[#d96d2d]/12 bg-[#f4ddcf] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Suplentes</p>
                <p className="mt-2 text-3xl font-black">{attendanceSummary.backups}</p>
              </div>
              <div className="rounded-[1.4rem] border border-[#2d6a3d]/10 bg-[#dbe8d8] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">No van</p>
                <p className="mt-2 text-3xl font-black">{attendanceSummary.declined}</p>
              </div>
              <div className="rounded-[1.4rem] border border-line bg-surface-strong p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Respuestas</p>
                <p className="mt-2 text-3xl font-black">{attendanceSummary.totalResponses}</p>
              </div>
              <div className="rounded-[1.4rem] border border-[#2d6a3d]/10 bg-[#dbe8d8] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  Titulares proyectados
                </p>
                <p className="mt-2 text-3xl font-black">{projectedStarters}</p>
              </div>
              <div className="rounded-[1.4rem] border border-line bg-surface-strong p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  Suplentes proyectados
                </p>
                <p className="mt-2 text-3xl font-black">{projectedSubstitutes}</p>
              </div>
            </div>

            {adminInsights.map((insight) => (
              <div
                key={insight.label}
                className="rounded-[1.4rem] border border-line bg-surface-strong p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-extrabold uppercase tracking-[0.08em]">
                    {insight.label}
                  </p>
                  <Pill tone={insight.tone}>{insight.value}</Pill>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {insight.detail}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <AdminAttendanceManager
          attendanceBoard={attendanceBoard}
          attendanceSummary={attendanceSummary}
          currentMatchId={currentMatch.id}
          editable={Boolean(currentMatch.submissionsOpen)}
          lateDropAllowed={Boolean(currentMatch.lateDropAllowed)}
          projectedStarters={projectedStarters}
          projectedSubstitutes={projectedSubstitutes}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <AdminFinalRosterManager
          currentMatchId={currentMatch.id}
          editable={currentMatch.rawStatus === "closed" || currentMatch.rawStatus === "played"}
          participantSummary={actualParticipantSummary}
          participants={actualParticipants}
        />

        <AdminMatchResultManager
          goalEntries={goalEntries}
          matchId={currentMatch.id}
          participants={actualParticipants}
          teams={matchTeams}
        />
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

        <SectionCard eyebrow="Roadmap" title="Etapas pendientes" dark>
          <div className="space-y-4 text-sm leading-6 text-white/78">
            <p>
              Etapa 5 en curso: cierre real del partido desde admin para alimentar prioridad,
              historial y estadisticas sin depender del Excel.
            </p>
            <p>
              Etapa 6: carga de equipos, resultado y goleadores.
            </p>
            <p>
              Etapa 7: historial real, estadisticas acumuladas y logistica completa de
              camisetas.
            </p>
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
