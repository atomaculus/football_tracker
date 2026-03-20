import { AppShell } from "@/components/app-shell";
import { AvailabilityForm } from "@/components/availability-form";
import { getAvailabilityPageData, getDashboardData } from "@/lib/data";

export default async function ConfirmPage() {
  const [{ navItems, nextMatch }, availabilityData] = await Promise.all([
    getDashboardData(),
    getAvailabilityPageData(),
  ]);

  return (
    <AppShell
      title="Confirmar asistencia"
      subtitle="Pantalla pensada para que cada jugador resuelva en segundos si va, no va o queda como suplente para el martes."
      navItems={navItems}
      nextMatch={nextMatch}
    >
      <AvailabilityForm
        attendanceBoard={availabilityData.attendanceBoard}
        attendanceSummary={availabilityData.attendanceSummary}
        availabilityOptions={availabilityData.availabilityOptions}
        currentMatch={availabilityData.currentMatch}
        matchId={availabilityData.matchId}
        matchNotes={availabilityData.matchNotes}
        matchStatus={availabilityData.matchStatus}
        lateDropAllowed={availabilityData.lateDropAllowed}
        mode={availabilityData.currentMode}
        players={availabilityData.players}
        submissionsOpen={availabilityData.submissionsOpen}
      />
    </AppShell>
  );
}
