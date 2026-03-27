"use server";

import { revalidatePath } from "next/cache";

import { requireAdminSession } from "@/lib/auth";
import {
  ensureMatchClosureIfNeeded,
  finalizeMatchClosure,
  getOpeningResponseForPlayer,
  getSignupCutoffDate,
  seedAvailabilityFromPreviousRoster,
  syncMatchParticipants,
  syncLaundryAssignment,
} from "@/lib/match-operations";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export type MatchAdminActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

export type AttendanceAdminActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

export type ParticipantAdminActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

export type MatchResultAdminActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

export type LaundryAdminActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

type MatchAdminRow = {
  match_date: string;
  start_time: string | null;
  status: "scheduled" | "open" | "closed" | "played" | "cancelled" | "suspended";
};

function getNextTuesdayIsoDate(baseDate = new Date()) {
  const nextDate = new Date(baseDate);
  const daysUntilTuesday = (2 - nextDate.getDay() + 7) % 7 || 7;
  nextDate.setDate(nextDate.getDate() + daysUntilTuesday);

  const year = nextDate.getFullYear();
  const month = String(nextDate.getMonth() + 1).padStart(2, "0");
  const day = String(nextDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

async function ensureNextScheduledMatch() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: true, matchId: null, message: "No se pudo conectar con Supabase." };
  }

  const nextTuesday = getNextTuesdayIsoDate();
  const { data: existingMatch, error: existingMatchError } = await supabase
    .from("matches")
    .select("id")
    .eq("match_date", nextTuesday)
    .in("status", ["scheduled", "open", "closed", "suspended"])
    .maybeSingle<{ id: string }>();

  if (existingMatchError) {
    return {
      error: true,
      matchId: null,
      message: "No se pudo verificar si ya existe la proxima fecha.",
    };
  }

  if (existingMatch) {
    return { error: false, matchId: existingMatch.id };
  }

  const { data: createdMatch, error: createError } = await supabase
    .from("matches")
    .insert({
      fallback_players: 12,
      format_label: "7v7",
      location: "Backyard",
      match_date: nextTuesday,
      start_time: "19:00:00",
      status: "scheduled",
      target_players: 14,
    })
    .select("id")
    .maybeSingle<{ id: string }>();

  if (createError || !createdMatch) {
    return {
      error: true,
      matchId: null,
      message: "No se pudo crear la proxima fecha automaticamente.",
    };
  }

  return { error: false, matchId: createdMatch.id };
}

async function markLateCancelParticipant(matchId: string, playerId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: true, message: "No se pudo conectar con Supabase." };
  }

  const { data: existingParticipant, error: existingParticipantError } = await supabase
    .from("match_participants")
    .select("player_id, role, priority_note, priority_score, team_id")
    .eq("match_id", matchId)
    .eq("player_id", playerId)
    .maybeSingle();

  if (existingParticipantError) {
    return { error: true, message: "No se pudo actualizar la baja tardia en la lista final." };
  }

  if (existingParticipant) {
    const { error: updateError } = await supabase
      .from("match_participants")
      .update({ attendance_status: "late_cancel" })
      .eq("match_id", matchId)
      .eq("player_id", playerId);

    if (updateError) {
      return { error: true, message: "No se pudo marcar la baja tardia del jugador." };
    }

    return { error: false, message: "" };
  }

  const { error: insertError } = await supabase.from("match_participants").insert({
    attendance_status: "late_cancel",
    match_id: matchId,
    player_id: playerId,
    priority_note: "Baja tardia despues del cierre de lista.",
    priority_score: -1,
    role: "substitute",
    team_id: null,
  });

  if (insertError) {
    return { error: true, message: "No se pudo registrar la baja tardia del jugador." };
  }

  return { error: false, message: "" };
}

async function getMatchTeams(matchId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { data: null, error: true };
  }

  const { data, error } = await supabase
    .from("teams")
    .select("id, name, color, goals")
    .eq("match_id", matchId)
    .order("name", { ascending: true });

  if (error) {
    return { data: null, error: true };
  }

  return { data, error: false };
}

async function saveTeamRow(
  matchId: string,
  team: {
    color: string;
    goals: number;
    id?: string;
    name: string;
  },
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: true, message: "No se pudo conectar con Supabase." };
  }

  if (team.id) {
    const { error } = await supabase
      .from("teams")
      .update({
        color: team.color,
        goals: team.goals,
        name: team.name,
      })
      .eq("id", team.id)
      .eq("match_id", matchId);

    if (error) {
      return {
        error: true,
        message: `No se pudo actualizar el equipo ${team.name}: ${error.message}`,
      };
    }

    return { error: false, message: "" };
  }

  const { error } = await supabase.from("teams").insert({
    color: team.color,
    goals: team.goals,
    match_id: matchId,
    name: team.name,
  });

  if (error) {
    return {
      error: true,
      message: `No se pudo crear el equipo ${team.name}: ${error.message}`,
    };
  }

  return { error: false, message: "" };
}

function buildLaundryOverrideNotes(playerName: string) {
  return `${playerName} se lleva las camisetas por override manual del admin.`;
}

export async function updateMatchStatus(
  _previousState: MatchAdminActionState,
  formData: FormData,
): Promise<MatchAdminActionState> {
  await requireAdminSession("/admin");
  const requestedMatchId = String(formData.get("matchId") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!status) {
    return {
      message: "Falta el partido o el estado a actualizar.",
      status: "error",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message: "La accion admin queda lista cuando la app use Supabase real.",
      status: "demo",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      message: "No se pudo conectar con Supabase.",
      status: "error",
    };
  }

  let matchId = requestedMatchId;
  if (!matchId) {
    const nextMatchResult = await ensureNextScheduledMatch();

    if (nextMatchResult.error || !nextMatchResult.matchId) {
      return {
        message: nextMatchResult.message ?? "No se pudo preparar la proxima fecha.",
        status: "error",
      };
    }

    matchId = nextMatchResult.matchId;
  }

  const { error } = await supabase
    .from("matches")
    .update({ notes: notes || null, status })
    .eq("id", matchId);

  if (error) {
    return {
      message: "No se pudo actualizar el estado del partido.",
      status: "error",
    };
  }

  if (status === "closed") {
    const syncResult = await finalizeMatchClosure(supabase, matchId);

    if (syncResult.error) {
      return {
        message: syncResult.message,
        status: "error",
      };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/confirmar");

    return {
      message: syncResult.message,
      status: "success",
    };
  }

  if (status === "played") {
    const { data: participants, error: participantsError } = await supabase
      .from("match_participants")
      .select("attendance_status, team_id")
      .eq("match_id", matchId);

    if (participantsError || !participants) {
      return {
        message: "No se pudo validar la asistencia real del partido.",
        status: "error",
      };
    }

    const playedCount = participants.filter(
      (participant) => participant.attendance_status === "played",
    ).length;

    if (playedCount === 0) {
      await supabase.from("matches").update({ status: "closed" }).eq("id", matchId);

      return {
        message: "Antes de marcar el partido como jugado, carga al menos un participante con estado `Jugo`.",
        status: "error",
      };
    }

    const playedWithoutTeam = participants.filter(
      (participant) => participant.attendance_status === "played" && !participant.team_id,
    ).length;

    if (playedWithoutTeam > 0) {
      await supabase.from("matches").update({ status: "closed" }).eq("id", matchId);

      return {
        message: "Antes de marcar el partido como jugado, asigna equipo a todos los jugadores que realmente jugaron.",
        status: "error",
      };
    }

    const teamsResult = await getMatchTeams(matchId);

    if (teamsResult.error || !teamsResult.data || teamsResult.data.length < 2) {
      await supabase.from("matches").update({ status: "closed" }).eq("id", matchId);

      return {
        message: "Antes de marcar el partido como jugado, carga los dos equipos y el resultado.",
        status: "error",
      };
    }

    const nextMatchResult = await ensureNextScheduledMatch();
    if (nextMatchResult.error) {
      return {
        message:
          nextMatchResult.message ??
          "El partido quedo marcado como jugado, pero no se pudo preparar la proxima fecha.",
        status: "error",
      };
    }
  }

  if (status === "open") {
    const seedResult = await seedAvailabilityFromPreviousRoster(supabase, matchId);

    if (seedResult.error) {
      return {
        message: seedResult.message,
        status: "error",
      };
    }

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/confirmar");

    return {
      message: seedResult.seeded
        ? `Convocatoria abierta. ${seedResult.message}`
        : "Convocatoria abierta. La base inicial ya estaba cargada.",
      status: "success",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/confirmar");

  return {
    message: "Estado del partido actualizado.",
    status: "success",
  };
}

export async function updateAttendanceResponseByAdmin(
  _previousState: AttendanceAdminActionState,
  formData: FormData,
): Promise<AttendanceAdminActionState> {
  await requireAdminSession("/admin");
  const matchId = String(formData.get("matchId") ?? "");
  const playerId = String(formData.get("playerId") ?? "");
  const response = String(formData.get("response") ?? "");

  if (!matchId || !playerId || !response) {
    return {
      message: "Falta el jugador, el partido o la respuesta a actualizar.",
      status: "error",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message: "La edicion admin queda activa cuando la app usa Supabase real.",
      status: "demo",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      message: "No se pudo conectar con Supabase.",
      status: "error",
    };
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("match_date, start_time, status")
    .eq("id", matchId)
    .maybeSingle<MatchAdminRow>();

  if (matchError || !match) {
    return {
      message: "No se encontro el partido para editar la lista.",
      status: "error",
    };
  }

  if (match.status === "open") {
    const ensuredMatch = await ensureMatchClosureIfNeeded(supabase, matchId);

    if (ensuredMatch.error || !ensuredMatch.match) {
      return {
        message: ensuredMatch.message ?? "No se pudo validar el estado real del partido.",
        status: "error",
      };
    }

    match.status = ensuredMatch.match.status;
  }

  if (match.status === "suspended" || match.status === "cancelled" || match.status === "played") {
    return {
      message: "La lista ya no admite cambios para este partido.",
      status: "error",
    };
  }

  const signupCutoffDate = getSignupCutoffDate(match.match_date, match.start_time);
  const submissionsOpen =
    match.status === "open" &&
    (signupCutoffDate ? Date.now() < signupCutoffDate.getTime() : true);
  const lateDropRequested = response === "not_going";

  const { data: existingResponse, error: existingResponseError } = await supabase
    .from("availability_responses")
    .select("response")
    .eq("match_id", matchId)
    .eq("player_id", playerId)
    .maybeSingle<{ response: "going" | "backup" | "not_going" | "dropped" }>();

  if (existingResponseError) {
    return {
      message: "No se pudo leer la respuesta actual del jugador.",
      status: "error",
    };
  }

  const canLateDrop =
    lateDropRequested &&
    (existingResponse?.response === "going" || existingResponse?.response === "backup");

  if (!submissionsOpen && !canLateDrop) {
    return {
      message:
        match.status === "closed"
          ? "Con la lista cerrada solo se permiten bajas tardias de jugadores ya anotados."
          : "Despues del corte automatico solo se permiten bajas tardias de jugadores ya anotados.",
      status: "error",
    };
  }

  const persistedResponse = submissionsOpen
    ? await getOpeningResponseForPlayer(
        supabase,
        matchId,
        playerId,
        response as "going" | "backup" | "not_going" | "dropped",
      )
    : "dropped";

  const { error } = await supabase.from("availability_responses").upsert(
    {
      match_id: matchId,
      player_id: playerId,
      responded_at: new Date().toISOString(),
      response: persistedResponse,
    },
    {
      onConflict: "match_id,player_id",
    },
  );

  if (error) {
    return {
      message: "No se pudo actualizar la respuesta del jugador.",
      status: "error",
    };
  }

  if (!submissionsOpen && match.status === "closed") {
    const lateCancelResult = await markLateCancelParticipant(matchId, playerId);

    if (lateCancelResult.error) {
      return {
        message: lateCancelResult.message,
        status: "error",
      };
    }

    const syncResult = await syncMatchParticipants(supabase, matchId);

    if (syncResult.error) {
      return {
        message: syncResult.message,
        status: "error",
      };
    }

    const laundryResult = await syncLaundryAssignment(supabase, matchId);

    if (laundryResult.error) {
      return {
        message: laundryResult.message,
        status: "error",
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/confirmar");

  return {
    message: submissionsOpen
      ? persistedResponse === "backup" && response === "going"
        ? "Respuesta actualizada desde admin. Como no venia de la fecha anterior, quedo como suplente."
        : "Respuesta actualizada desde admin."
      : "Baja tardia aplicada. La lista final ya corrio al siguiente suplente.",
    status: "success",
  };
}

export async function updateMatchParticipantStatusByAdmin(
  _previousState: ParticipantAdminActionState,
  formData: FormData,
): Promise<ParticipantAdminActionState> {
  await requireAdminSession("/admin");
  const matchId = String(formData.get("matchId") ?? "");
  const playerId = String(formData.get("playerId") ?? "");
  const attendanceStatus = String(formData.get("attendanceStatus") ?? "");

  if (!matchId || !playerId || !attendanceStatus) {
    return {
      message: "Falta el partido, el jugador o el estado final.",
      status: "error",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message: "La carga final queda activa cuando la app usa Supabase real.",
      status: "demo",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      message: "No se pudo conectar con Supabase.",
      status: "error",
    };
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("status")
    .eq("id", matchId)
    .maybeSingle<{ status: MatchAdminRow["status"] }>();

  if (matchError || !match) {
    return {
      message: "No se encontro el partido para registrar la asistencia real.",
      status: "error",
    };
  }

  if (!["closed", "played"].includes(match.status)) {
    return {
      message: "La asistencia real se carga una vez cerrada la convocatoria.",
      status: "error",
    };
  }

  const normalizedStatus =
    attendanceStatus === "played" ||
    attendanceStatus === "late_cancel" ||
    attendanceStatus === "no_show" ||
    attendanceStatus === "confirmed"
      ? attendanceStatus
      : null;

  if (!normalizedStatus) {
    return {
      message: "El estado final del jugador no es valido.",
      status: "error",
    };
  }

  const { error } = await supabase
    .from("match_participants")
    .update({ attendance_status: normalizedStatus })
    .eq("match_id", matchId)
    .eq("player_id", playerId);

  if (error) {
    return {
      message: "No se pudo guardar el estado final del jugador.",
      status: "error",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/confirmar");

  return {
    message: "Asistencia real actualizada.",
    status: "success",
  };
}

export async function updateMatchParticipantStatusesByAdmin(
  _previousState: ParticipantAdminActionState,
  formData: FormData,
): Promise<ParticipantAdminActionState> {
  await requireAdminSession("/admin");
  const matchId = String(formData.get("matchId") ?? "");

  if (!matchId) {
    return {
      message: "Falta el partido para registrar la asistencia real.",
      status: "error",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message: "La carga final queda activa cuando la app usa Supabase real.",
      status: "demo",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      message: "No se pudo conectar con Supabase.",
      status: "error",
    };
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("status")
    .eq("id", matchId)
    .maybeSingle<{ status: MatchAdminRow["status"] }>();

  if (matchError || !match) {
    return {
      message: "No se encontro el partido para registrar la asistencia real.",
      status: "error",
    };
  }

  if (!["closed", "played"].includes(match.status)) {
    return {
      message: "La asistencia real se carga una vez cerrada la convocatoria.",
      status: "error",
    };
  }

  const updates = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("attendanceStatus:"))
    .map(([key, value]) => {
      const playerId = key.replace("attendanceStatus:", "");
      const attendanceStatus = String(value);

      return {
        attendance_status: attendanceStatus,
        player_id: playerId,
      };
    });

  if (!updates.length) {
    return {
      message: "No hay cambios de asistencia final para guardar.",
      status: "error",
    };
  }

  for (const update of updates) {
    if (!["confirmed", "played", "late_cancel", "no_show"].includes(update.attendance_status)) {
      return {
        message: "Hay un estado final invalido en la lista.",
        status: "error",
      };
    }
  }

  for (const update of updates) {
    const { error } = await supabase
      .from("match_participants")
      .update({ attendance_status: update.attendance_status })
      .eq("match_id", matchId)
      .eq("player_id", update.player_id);

    if (error) {
      return {
        message: "No se pudo guardar la asistencia final.",
        status: "error",
      };
    }
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/confirmar");

  return {
    message: `Asistencia final actualizada para ${updates.length} jugadores.`,
    status: "success",
  };
}

export async function saveMatchTeamsByAdmin(
  _previousState: MatchResultAdminActionState,
  formData: FormData,
): Promise<MatchResultAdminActionState> {
  await requireAdminSession("/admin");
  const matchId = String(formData.get("matchId") ?? "");
  const teamAId = String(formData.get("teamAId") ?? "");
  const teamAName = String(formData.get("teamAName") ?? "").trim();
  const teamAColor = String(formData.get("teamAColor") ?? "bg-lime text-foreground");
  const teamAGoals = Number(formData.get("teamAGoals") ?? 0);
  const teamBId = String(formData.get("teamBId") ?? "");
  const teamBName = String(formData.get("teamBName") ?? "").trim();
  const teamBColor = String(formData.get("teamBColor") ?? "bg-accent text-white");
  const teamBGoals = Number(formData.get("teamBGoals") ?? 0);

  if (!matchId || !teamAName || !teamBName) {
    return {
      message: "Falta el partido o los nombres de los equipos.",
      status: "error",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message: "La carga de equipos queda activa cuando la app usa Supabase real.",
      status: "demo",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      message: "No se pudo conectar con Supabase.",
      status: "error",
    };
  }

  const existingTeamsResult = await getMatchTeams(matchId);
  if (existingTeamsResult.error) {
    return {
      message: "No se pudo leer el estado actual de los equipos.",
      status: "error",
    };
  }

  const existingTeams = existingTeamsResult.data ?? [];
  const claimedIds = new Set([teamAId, teamBId].filter(Boolean));
  const unclaimedExistingTeams = existingTeams.filter((team) => !claimedIds.has(team.id));

  const teamsToSave = [
    {
      color: teamAColor,
      goals: Number.isFinite(teamAGoals) ? teamAGoals : 0,
      id: teamAId || unclaimedExistingTeams[0]?.id,
      name: teamAName,
    },
    {
      color: teamBColor,
      goals: Number.isFinite(teamBGoals) ? teamBGoals : 0,
      id: teamBId || unclaimedExistingTeams[1]?.id,
      name: teamBName,
    },
  ];

  const saveResults = await Promise.all(teamsToSave.map((team) => saveTeamRow(matchId, team)));
  const failedSave = saveResults.find((result) => result.error);

  if (failedSave) {
    return {
      message: failedSave.message,
      status: "error",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/partido");

  return {
    message: "Equipos y resultado guardados.",
    status: "success",
  };
}

export async function assignParticipantTeamByAdmin(
  _previousState: MatchResultAdminActionState,
  formData: FormData,
): Promise<MatchResultAdminActionState> {
  await requireAdminSession("/admin");
  const matchId = String(formData.get("matchId") ?? "");
  const playerId = String(formData.get("playerId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");

  if (!matchId || !playerId) {
    return {
      message: "Falta el partido o el jugador a asignar.",
      status: "error",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message: "La asignacion de equipos queda activa cuando la app usa Supabase real.",
      status: "demo",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      message: "No se pudo conectar con Supabase.",
      status: "error",
    };
  }

  const { error } = await supabase
    .from("match_participants")
    .update({ team_id: teamId || null })
    .eq("match_id", matchId)
    .eq("player_id", playerId);

  if (error) {
    return {
      message: "No se pudo asignar el equipo del jugador.",
      status: "error",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/partido");

  return {
    message: "Equipo actualizado.",
    status: "success",
  };
}

export async function assignParticipantTeamsByAdmin(
  _previousState: MatchResultAdminActionState,
  formData: FormData,
): Promise<MatchResultAdminActionState> {
  await requireAdminSession("/admin");
  const matchId = String(formData.get("matchId") ?? "");

  if (!matchId) {
    return {
      message: "Falta el partido para asignar equipos.",
      status: "error",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message: "La asignacion de equipos queda activa cuando la app usa Supabase real.",
      status: "demo",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      message: "No se pudo conectar con Supabase.",
      status: "error",
    };
  }

  const assignments = Array.from(formData.entries())
    .filter(([key]) => key.startsWith("teamId:"))
    .map(([key, value]) => ({
      player_id: key.replace("teamId:", ""),
      team_id: String(value) || null,
    }));

  if (!assignments.length) {
    return {
      message: "No hay asignaciones de equipo para guardar.",
      status: "error",
    };
  }

  for (const assignment of assignments) {
    const { error } = await supabase
      .from("match_participants")
      .update({ team_id: assignment.team_id })
      .eq("match_id", matchId)
      .eq("player_id", assignment.player_id);

    if (error) {
      return {
        message: "No se pudo guardar la asignacion de equipos.",
        status: "error",
      };
    }
  }

  revalidatePath("/admin");
  revalidatePath("/partido");

  return {
    message: `Equipos asignados para ${assignments.length} jugadores.`,
    status: "success",
  };
}

export async function addGoalByAdmin(
  _previousState: MatchResultAdminActionState,
  formData: FormData,
): Promise<MatchResultAdminActionState> {
  await requireAdminSession("/admin");
  const matchId = String(formData.get("matchId") ?? "");
  const scorerPlayerId = String(formData.get("scorerPlayerId") ?? "");
  const teamId = String(formData.get("teamId") ?? "");
  const minuteValue = String(formData.get("minute") ?? "").trim();
  const isOwnGoal = String(formData.get("isOwnGoal") ?? "") === "true";

  if (!matchId || !scorerPlayerId || !teamId) {
    return {
      message: "Falta el partido, el goleador o el equipo del gol.",
      status: "error",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message: "La carga de goles queda activa cuando la app usa Supabase real.",
      status: "demo",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      message: "No se pudo conectar con Supabase.",
      status: "error",
    };
  }

  const minute = minuteValue ? Number(minuteValue) : null;
  const { error } = await supabase.from("goals").insert({
    is_own_goal: isOwnGoal,
    match_id: matchId,
    minute: Number.isFinite(minute) ? minute : null,
    scorer_player_id: scorerPlayerId,
    team_id: teamId,
  });

  if (error) {
    return {
      message: "No se pudo registrar el gol.",
      status: "error",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/partido");

  return {
    message: "Gol registrado.",
    status: "success",
  };
}

export async function deleteGoalByAdmin(
  _previousState: MatchResultAdminActionState,
  formData: FormData,
): Promise<MatchResultAdminActionState> {
  await requireAdminSession("/admin");
  const goalId = String(formData.get("goalId") ?? "");

  if (!goalId) {
    return {
      message: "Falta el gol a eliminar.",
      status: "error",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message: "La correccion de goles queda activa cuando la app usa Supabase real.",
      status: "demo",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      message: "No se pudo conectar con Supabase.",
      status: "error",
    };
  }

  const { error } = await supabase.from("goals").delete().eq("id", goalId);

  if (error) {
    return {
      message: "No se pudo eliminar el gol.",
      status: "error",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/partido");

  return {
    message: "Gol eliminado.",
    status: "success",
  };
}

export async function overrideLaundryAssignmentByAdmin(
  _previousState: LaundryAdminActionState,
  formData: FormData,
): Promise<LaundryAdminActionState> {
  await requireAdminSession("/admin");
  const matchId = String(formData.get("matchId") ?? "");
  const playerId = String(formData.get("playerId") ?? "");

  if (!matchId || !playerId) {
    return {
      message: "Falta el partido o el jugador para reasignar las camisetas.",
      status: "error",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message: "El override de camisetas queda activo cuando la app usa Supabase real.",
      status: "demo",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      message: "No se pudo conectar con Supabase.",
      status: "error",
    };
  }

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("full_name")
    .eq("id", playerId)
    .maybeSingle<{ full_name: string }>();

  if (playerError || !player) {
    return {
      message: "No se pudo leer el jugador para reasignar las camisetas.",
      status: "error",
    };
  }

  const { error } = await supabase.from("laundry_assignments").upsert(
    {
      assignment_mode: "rotation",
      kit_notes: buildLaundryOverrideNotes(player.full_name),
      match_id: matchId,
      player_id: playerId,
      status: "reassigned",
    },
    {
      onConflict: "match_id",
    },
  );

  if (error) {
    return {
      message: "No se pudo guardar el override de camisetas.",
      status: "error",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");

  return {
    message: `Camisetas reasignadas a ${player.full_name}.`,
    status: "success",
  };
}
