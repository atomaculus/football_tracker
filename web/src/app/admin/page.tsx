import { AppShell } from "@/components/app-shell";
import { AdminAttendanceManager } from "@/components/admin-attendance-manager";
import { AdminFinalRosterManager } from "@/components/admin-final-roster-manager";
import { AdminLaundryOverrideManager } from "@/components/admin-laundry-override-manager";
import { AdminMatchControls } from "@/components/admin-match-controls";
import { AdminMatchResultManager } from "@/components/admin-match-result-manager";
import { Pill, SectionCard } from "@/components/ui";
import { requireAdminSession } from "@/lib/auth";
import { getAdminPageData, getDashboardData } from "@/lib/data";

export default async function AdminPage() {
  const viewer = await requireAdminSession("/admin");
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
      viewer={viewer}
    >
      <section className="grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <AdminMatchControls currentMatch={currentMatch} />

        <SectionCard eyebrow="Lectura real" title="Pulso operativo" collapsible>
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-lime/20 bg-lime/[0.08] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Confirmados</p>
                <p className="mt-2 text-3xl font-black text-lime">{attendanceSummary.confirmed}</p>
              </div>
              <div className="rounded-[1.4rem] border border-accent/20 bg-accent/[0.08] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Suplentes</p>
                <p className="mt-2 text-3xl font-black text-accent">{attendanceSummary.backups}</p>
              </div>
              <div className="rounded-[1.4rem] border border-white/[0.1] bg-white/[0.04] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">No van</p>
                <p className="mt-2 text-3xl font-black">{attendanceSummary.declined}</p>
              </div>
              <div className="rounded-[1.4rem] border border-line bg-surface-strong p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Respuestas</p>
                <p className="mt-2 text-3xl font-black">{attendanceSummary.totalResponses}</p>
              </div>
              <div className="rounded-[1.4rem] border border-lime/20 bg-lime/[0.08] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  Titulares proyectados
                </p>
                <p className="mt-2 text-3xl font-black text-lime">{projectedStarters}</p>
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

      <section className="grid items-start gap-6 lg:grid-cols-[0.95fr_1.05fr]">
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

      <section className="grid gap-6">
        <SectionCard eyebrow="Camisetas" title="Encargado de lavado" collapsible>
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
              <div className="rounded-[1.2rem] border border-lime/20 bg-lime/[0.08] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Modo</p>
                <p className="mt-2 text-lg font-black capitalize">
                  {laundryDuty.assignmentMode}
                </p>
              </div>
              <div className="rounded-[1.2rem] border border-star-blue/20 bg-star-blue/[0.08] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Entrega</p>
                <p className="mt-2 text-lg font-black">{laundryDuty.dueLabel}</p>
              </div>
            </div>
            <AdminLaundryOverrideManager
              currentAssigneeName={laundryDuty.assigneeName}
              currentMatchId={currentMatch.id}
              participants={actualParticipants}
            />
          </div>
        </SectionCard>
      </section>
    </AppShell>
  );
}
