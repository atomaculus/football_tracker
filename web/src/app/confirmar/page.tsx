import { AppShell } from "@/components/app-shell";
import { AvailabilityForm } from "@/components/availability-form";
import { requireViewerSession } from "@/lib/auth";
import { getAvailabilityPageData, getDashboardData } from "@/lib/data";

export default async function ConfirmPage() {
  const viewer = await requireViewerSession("/confirmar");
  const [{ navItems, nextMatch }, availabilityData] = await Promise.all([
    getDashboardData(),
    getAvailabilityPageData(),
  ]);
  const currentPlayer =
    availabilityData.players.find((player) => player.id === viewer.playerId) ??
    availabilityData.currentPlayer;

  return (
    <AppShell
      title="Confirmar asistencia"
      subtitle="Pantalla pensada para que cada jugador resuelva en segundos si va, no va o queda como suplente para el martes."
      navItems={navItems}
      nextMatch={nextMatch}
      viewer={viewer}
    >
      <AvailabilityForm
        attendanceBoard={availabilityData.attendanceBoard}
        attendanceSummary={availabilityData.attendanceSummary}
        availabilityOptions={availabilityData.availabilityOptions}
        currentMatch={availabilityData.currentMatch}
        currentPlayer={currentPlayer}
        matchId={availabilityData.matchId}
        matchNotes={availabilityData.matchNotes}
        matchStatus={availabilityData.matchStatus}
        lateDropAllowed={availabilityData.lateDropAllowed}
        players={availabilityData.players}
        submissionsOpen={availabilityData.submissionsOpen}
      />
    </AppShell>
  );
}
