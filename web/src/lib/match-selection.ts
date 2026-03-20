import type { AttendanceEntry } from "@/types/domain";

export type PreviousPlayerInput = {
  player_id: string;
  players: { full_name?: string } | { full_name?: string }[] | null;
  priority_note: string | null;
  role: "starter" | "substitute" | "guest";
};

export function getPlayerName(
  playerData: { full_name?: string } | { full_name?: string }[] | null,
) {
  const normalized = Array.isArray(playerData) ? playerData[0] : playerData;

  return normalized && typeof normalized === "object" && "full_name" in normalized
    ? String(normalized.full_name)
    : "Jugador";
}

export function buildProjectedAttendanceBoard({
  previousPlayers,
  responses,
  targetPlayers,
}: {
  previousPlayers: PreviousPlayerInput[];
  responses: AttendanceEntry[];
  targetPlayers: number;
}) {
  const responseByPlayerId = new Map<string, AttendanceEntry>();
  const responseOrder = [...responses].reverse();

  for (const response of responseOrder) {
    if (response.playerId) {
      responseByPlayerId.set(response.playerId, response);
    }
  }

  const previousPriorityEntries = previousPlayers
    .map((player) => {
      const currentResponse = responseByPlayerId.get(player.player_id);

      if (
        currentResponse?.responseValue === "not_going" ||
        currentResponse?.responseValue === "dropped"
      ) {
        return null;
      }

      return {
        detail:
          currentResponse?.detail ??
          (player.priority_note
            ? `Prioridad del ultimo martes. ${player.priority_note}`
            : "Prioridad del ultimo martes."),
        isPriority: true,
        name: currentResponse?.name ?? getPlayerName(player.players),
        playerId: player.player_id,
        projectedRole: "starter" as const,
        responseValue: currentResponse?.responseValue ?? "going",
        status: "Titular",
      };
    })
    .filter((entry) => entry !== null);

  const previousPriorityIds = new Set(previousPriorityEntries.map((entry) => entry.playerId));
  const notGoingEntries = responses
    .filter(
      (entry) => entry.responseValue === "not_going" || entry.responseValue === "dropped",
    )
    .map((entry) => ({
      ...entry,
      projectedRole: "out" as const,
      status: "No va",
    }));

  const directGoingEntries = responseOrder.filter(
    (entry) =>
      entry.responseValue === "going" &&
      entry.playerId &&
      !previousPriorityIds.has(entry.playerId),
  );
  const backupEntries = responseOrder.filter((entry) => entry.responseValue === "backup");

  const remainingStarterSlots = Math.max(targetPlayers - previousPriorityEntries.length, 0);
  const additionalStarters = directGoingEntries.slice(0, remainingStarterSlots).map((entry) => ({
    ...entry,
    projectedRole: "starter" as const,
    status: "Titular",
  }));

  const overflowGoing = directGoingEntries.slice(remainingStarterSlots).map((entry) => ({
    ...entry,
    projectedRole: "substitute" as const,
    status: "Suplente",
  }));
  const projectedBackups = backupEntries.map((entry) => ({
    ...entry,
    projectedRole: "substitute" as const,
    status: "Suplente",
  }));

  const starters = [...previousPriorityEntries, ...additionalStarters];
  const substitutes = [...overflowGoing, ...projectedBackups];

  return {
    attendanceBoard: [...starters, ...substitutes, ...notGoingEntries],
    projectedStarters: starters.length,
    projectedSubstitutes: substitutes.length,
  };
}
