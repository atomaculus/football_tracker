import type { SupabaseClient } from "@supabase/supabase-js";

import { buildProjectedAttendanceBoard, getPlayerName, type PreviousPlayerInput } from "@/lib/match-selection";
import type { LaundryDuty } from "@/types/domain";

type MatchStatus =
  | "scheduled"
  | "open"
  | "closed"
  | "played"
  | "cancelled"
  | "suspended";

type MatchLifecycleRow = {
  id: string;
  match_date: string;
  start_time: string | null;
  status: MatchStatus;
  target_players: number;
};

type AttendanceQueryRow = {
  player_id: string;
  players: { full_name?: string } | { full_name?: string }[] | null;
  responded_at: string | null;
  response: "going" | "backup" | "not_going" | "dropped";
};

type ExistingParticipantRow = {
  attendance_status: "confirmed" | "played" | "late_cancel" | "no_show";
  player_id: string;
  priority_note: string | null;
  priority_score: number | null;
  role: "starter" | "substitute" | "guest";
  team_id: string | null;
};

type LaundryAssignmentRow = {
  assignment_mode: "rotation" | "random";
  created_at: string;
  kit_notes: string | null;
  player_id: string;
  players: { full_name?: string } | { full_name?: string }[] | null;
  status: "assigned" | "returned" | "reassigned";
};

type EligibleLaundryRow = {
  player_id: string;
  players: { full_name?: string } | { full_name?: string }[] | null;
};

export function getSignupCutoffDate(matchDate?: string, startTime?: string | null) {
  if (!matchDate) {
    return null;
  }

  const safeTime =
    startTime && /^\d{2}:\d{2}(:\d{2})?$/.test(startTime) ? startTime : "21:00:00";
  const normalizedTime = safeTime.length === 5 ? `${safeTime}:00` : safeTime;
  const matchStart = new Date(`${matchDate}T${normalizedTime}-03:00`);

  if (Number.isNaN(matchStart.getTime())) {
    return null;
  }

  return new Date(matchStart.getTime() - 90 * 60 * 1000);
}

async function getLatestPlayedRoster(
  supabase: SupabaseClient,
  matchId: string,
): Promise<PreviousPlayerInput[] | null> {
  const { data: latestMatch, error: latestMatchError } = await supabase
    .from("matches")
    .select("id")
    .eq("status", "played")
    .neq("id", matchId)
    .order("match_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestMatchError || !latestMatch) {
    return null;
  }

  const { data, error } = await supabase
    .from("match_participants")
    .select("player_id, role, priority_note, players(full_name)")
    .eq("match_id", latestMatch.id)
    .eq("attendance_status", "played");

  if (error || !data) {
    return null;
  }

  return data as PreviousPlayerInput[];
}

export async function syncMatchParticipants(supabase: SupabaseClient, matchId: string) {
  const [
    { data: match, error: matchError },
    { data: responses, error: responsesError },
    { data: existingParticipants, error: existingParticipantsError },
    previousRoster,
  ] = await Promise.all([
    supabase
      .from("matches")
      .select("match_date, start_time, target_players")
      .eq("id", matchId)
      .maybeSingle(),
    supabase
      .from("availability_responses")
      .select("response, responded_at, player_id, players(full_name)")
      .eq("match_id", matchId)
      .order("responded_at", { ascending: false }),
    supabase
      .from("match_participants")
      .select("player_id, attendance_status, role, priority_note, priority_score, team_id")
      .eq("match_id", matchId),
    getLatestPlayedRoster(supabase, matchId),
  ]);

  if (matchError || !match || responsesError || !responses || existingParticipantsError) {
    return { error: true, message: "No se pudo leer la lista actual para cerrar la convocatoria." };
  }

  const typedResponses = (responses as AttendanceQueryRow[]).map((item) => ({
    detail: item.responded_at
      ? `Respondio ${new Intl.DateTimeFormat("es-AR", {
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          month: "2-digit",
        }).format(new Date(item.responded_at))}`
      : "Sin horario",
    name: getPlayerName(item.players),
    playerId: item.player_id,
    responseValue: item.response,
    status:
      item.response === "going"
        ? "Titular"
        : item.response === "backup"
          ? "Suplente"
          : "No va",
  }));

  const projectedBoard = buildProjectedAttendanceBoard({
    previousPlayers: previousRoster ?? [],
    responses: typedResponses,
    targetPlayers: match.target_players,
  });
  const preservedLateCancels = ((existingParticipants ?? []) as ExistingParticipantRow[])
    .filter((participant) => participant.attendance_status === "late_cancel")
    .map((participant) => ({
      attendance_status: "late_cancel",
      match_id: matchId,
      player_id: participant.player_id,
      priority_note: participant.priority_note,
      priority_score: participant.priority_score ?? -1,
      role: participant.role,
      team_id: participant.team_id,
    }));
  const preservedLateCancelIds = new Set(
    preservedLateCancels.map((participant) => participant.player_id),
  );

  const participantRows = projectedBoard.attendanceBoard
    .filter(
      (entry) =>
        entry.playerId &&
        entry.projectedRole !== "out" &&
        !preservedLateCancelIds.has(entry.playerId),
    )
    .map((entry, index) => ({
      attendance_status: "confirmed",
      match_id: matchId,
      player_id: entry.playerId,
      priority_note: entry.isPriority
        ? "Titular prioritario por haber jugado el ultimo martes."
        : `Orden de anotacion #${index + 1}.`,
      priority_score: entry.isPriority ? 1000 - index : 100 - index,
      role: entry.projectedRole === "starter" ? "starter" : "substitute",
      team_id: null,
    }));

  const { error: deleteError } = await supabase
    .from("match_participants")
    .delete()
    .eq("match_id", matchId);

  if (deleteError) {
    return { error: true, message: "No se pudo limpiar la lista previa del partido." };
  }

  const rowsToInsert = [...participantRows, ...preservedLateCancels];

  if (!rowsToInsert.length) {
    return {
      error: false,
      message: "La convocatoria se cerro, pero no habia jugadores confirmados para consolidar.",
      projectedStarters: 0,
      projectedSubstitutes: 0,
    };
  }

  const { error: insertError } = await supabase.from("match_participants").insert(rowsToInsert);

  if (insertError) {
    return { error: true, message: "No se pudo consolidar la lista final del partido." };
  }

  return {
    error: false,
    message: `Convocatoria cerrada con ${projectedBoard.projectedStarters} titulares y ${projectedBoard.projectedSubstitutes} suplentes.`,
    projectedStarters: projectedBoard.projectedStarters,
    projectedSubstitutes: projectedBoard.projectedSubstitutes,
  };
}

function buildLaundryNotes(playerName: string) {
  return `${playerName} se lleva las camisetas cuando cierra la convocatoria final.`;
}

function getPendingLaundryDuty(): LaundryDuty {
  return {
    assigneeName: "Se define al cierre",
    assignmentMode: "rotation",
    dueLabel: "Se anuncia 90 min antes",
    notes: "La Fecha asigna las camisetas cuando la convocatoria se cierra y la lista final queda consolidada.",
    status: "Pendiente",
  };
}

async function chooseLaundryAssignee(
  supabase: SupabaseClient,
  matchId: string,
): Promise<{ name: string; playerId: string } | null> {
  const { data: eligibleRows, error: eligibleError } = await supabase
    .from("match_participants")
    .select("player_id, players(full_name)")
    .eq("match_id", matchId)
    .eq("attendance_status", "confirmed")
    .in("role", ["starter", "substitute"]);

  if (eligibleError || !eligibleRows?.length) {
    return null;
  }

  const eligiblePlayers = (eligibleRows as EligibleLaundryRow[]).map((row) => ({
    name: getPlayerName(row.players),
    playerId: row.player_id,
  }));

  const { data: assignmentHistory, error: historyError } = await supabase
    .from("laundry_assignments")
    .select("player_id, created_at")
    .order("created_at", { ascending: false });

  if (historyError) {
    return eligiblePlayers[0] ?? null;
  }

  const lastAssignedAtByPlayer = new Map<string, number>();

  for (const row of assignmentHistory ?? []) {
    if (!lastAssignedAtByPlayer.has(row.player_id)) {
      lastAssignedAtByPlayer.set(row.player_id, new Date(row.created_at).getTime());
    }
  }

  eligiblePlayers.sort((left, right) => {
    const leftAssignedAt = lastAssignedAtByPlayer.get(left.playerId) ?? 0;
    const rightAssignedAt = lastAssignedAtByPlayer.get(right.playerId) ?? 0;

    if (leftAssignedAt !== rightAssignedAt) {
      return leftAssignedAt - rightAssignedAt;
    }

    return left.name.localeCompare(right.name, "es");
  });

  return eligiblePlayers[0] ?? null;
}

export async function syncLaundryAssignment(supabase: SupabaseClient, matchId: string) {
  const { data: existingAssignment, error: existingAssignmentError } = await supabase
    .from("laundry_assignments")
    .select("player_id, assignment_mode, status, kit_notes, created_at, players(full_name)")
    .eq("match_id", matchId)
    .maybeSingle();

  if (existingAssignmentError) {
    return { error: true, message: "No se pudo leer la asignacion de camisetas actual." };
  }

  const { data: eligibleRows, error: eligibleError } = await supabase
    .from("match_participants")
    .select("player_id, players(full_name)")
    .eq("match_id", matchId)
    .eq("attendance_status", "confirmed")
    .in("role", ["starter", "substitute"]);

  if (eligibleError) {
    return { error: true, message: "No se pudo calcular el grupo elegible para las camisetas." };
  }

  const eligibleIds = new Set((eligibleRows as EligibleLaundryRow[] | null)?.map((row) => row.player_id) ?? []);
  const typedExistingAssignment = existingAssignment as LaundryAssignmentRow | null;

  if (typedExistingAssignment && eligibleIds.has(typedExistingAssignment.player_id)) {
    return {
      error: false,
      assigneeName: getPlayerName(typedExistingAssignment.players),
      message: "",
      reassigned: false,
    };
  }

  const selectedPlayer = await chooseLaundryAssignee(supabase, matchId);

  if (!selectedPlayer) {
    return {
      error: false,
      assigneeName: undefined,
      message: "No habia una lista final elegible para asignar camisetas.",
      reassigned: false,
    };
  }

  const nextStatus = typedExistingAssignment ? "reassigned" : "assigned";
  const { error: upsertError } = await supabase.from("laundry_assignments").upsert(
    {
      assignment_mode: "rotation",
      kit_notes: buildLaundryNotes(selectedPlayer.name),
      match_id: matchId,
      player_id: selectedPlayer.playerId,
      status: nextStatus,
    },
    {
      onConflict: "match_id",
    },
  );

  if (upsertError) {
    return { error: true, message: "No se pudo guardar la asignacion de camisetas." };
  }

  return {
    error: false,
    assigneeName: selectedPlayer.name,
    message: typedExistingAssignment
      ? `Camisetas reasignadas a ${selectedPlayer.name}.`
      : `Camisetas asignadas a ${selectedPlayer.name}.`,
    reassigned: Boolean(typedExistingAssignment),
  };
}

export async function finalizeMatchClosure(supabase: SupabaseClient, matchId: string) {
  const syncResult = await syncMatchParticipants(supabase, matchId);

  if (syncResult.error) {
    return syncResult;
  }

  const laundryResult = await syncLaundryAssignment(supabase, matchId);

  if (laundryResult.error) {
    return {
      error: true,
      message: laundryResult.message,
    };
  }

  const suffix = laundryResult.assigneeName
    ? ` Camisetas para ${laundryResult.assigneeName}.`
    : "";

  return {
    error: false,
    message: `${syncResult.message}${suffix}`.trim(),
  };
}

export async function ensureMatchClosureIfNeeded(
  supabase: SupabaseClient,
  matchId: string,
): Promise<{ error: boolean; match: MatchLifecycleRow | null; message?: string }> {
  const { data: initialMatch, error: initialMatchError } = await supabase
    .from("matches")
    .select("id, match_date, start_time, status, target_players")
    .eq("id", matchId)
    .maybeSingle();

  if (initialMatchError || !initialMatch) {
    return { error: true, match: null, message: "No se pudo leer el partido actual." };
  }

  const typedMatch = initialMatch as MatchLifecycleRow;

  if (typedMatch.status !== "open") {
    return { error: false, match: typedMatch };
  }

  const cutoffDate = getSignupCutoffDate(typedMatch.match_date, typedMatch.start_time);
  if (cutoffDate && Date.now() < cutoffDate.getTime()) {
    return { error: false, match: typedMatch };
  }

  const { error: closeError } = await supabase
    .from("matches")
    .update({ status: "closed" })
    .eq("id", matchId);

  if (closeError) {
    return { error: true, match: typedMatch, message: "No se pudo cerrar la convocatoria por horario." };
  }

  const finalizeResult = await finalizeMatchClosure(supabase, matchId);
  if (finalizeResult.error) {
    return { error: true, match: typedMatch, message: finalizeResult.message };
  }

  const { data: refreshedMatch, error: refreshedMatchError } = await supabase
    .from("matches")
    .select("id, match_date, start_time, status, target_players")
    .eq("id", matchId)
    .maybeSingle();

  return {
    error: Boolean(refreshedMatchError),
    match: refreshedMatchError ? typedMatch : ((refreshedMatch as MatchLifecycleRow | null) ?? typedMatch),
    message: finalizeResult.message,
  };
}

export async function getLaundryDutyForMatch(
  supabase: SupabaseClient,
  matchId?: string,
  matchStatus?: string,
): Promise<LaundryDuty | null> {
  if (!matchId) {
    return null;
  }

  if (matchStatus === "scheduled" || matchStatus === "open") {
    return getPendingLaundryDuty();
  }

  const { data, error } = await supabase
    .from("laundry_assignments")
    .select("player_id, assignment_mode, status, kit_notes, created_at, players(full_name)")
    .eq("match_id", matchId)
    .maybeSingle();

  if (error || !data) {
    return matchStatus === "closed" || matchStatus === "played"
      ? getPendingLaundryDuty()
      : null;
  }

  const assignment = data as LaundryAssignmentRow;
  const assigneeName = getPlayerName(assignment.players);

  return {
    assigneeName,
    assignmentMode: assignment.assignment_mode,
    dueLabel: "Entregar el proximo martes",
    notes: assignment.kit_notes ?? buildLaundryNotes(assigneeName),
    status:
      assignment.status === "reassigned"
        ? "Reasignado"
        : assignment.status === "returned"
          ? "Devuelto"
          : "Asignado",
  };
}
