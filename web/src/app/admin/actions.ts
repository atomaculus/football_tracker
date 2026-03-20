"use server";

import { revalidatePath } from "next/cache";

import { buildProjectedAttendanceBoard, type PreviousPlayerInput } from "@/lib/match-selection";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export type MatchAdminActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

export type AttendanceAdminActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

type AttendanceQueryRow = {
  player_id: string;
  players: { full_name?: string } | { full_name?: string }[] | null;
  responded_at: string | null;
  response: "going" | "backup" | "not_going" | "dropped";
};

function getSignupCutoffDate(matchDate?: string, startTime?: string | null) {
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
  matchId: string,
): Promise<PreviousPlayerInput[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

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

async function syncMatchParticipants(matchId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { error: true, message: "No se pudo conectar con Supabase." };
  }

  const [{ data: match, error: matchError }, { data: responses, error: responsesError }, previousRoster] =
    await Promise.all([
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
      getLatestPlayedRoster(matchId),
    ]);

  if (matchError || !match || responsesError || !responses) {
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
    name: Array.isArray(item.players)
      ? String(item.players[0]?.full_name ?? "Jugador")
      : String(item.players?.full_name ?? "Jugador"),
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

  const participantRows = projectedBoard.attendanceBoard
    .filter((entry) => entry.playerId && entry.projectedRole !== "out")
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

  if (!participantRows.length) {
    return {
      error: false,
      message: "La convocatoria se cerro, pero no habia jugadores confirmados para consolidar.",
    };
  }

  const { error: insertError } = await supabase
    .from("match_participants")
    .insert(participantRows);

  if (insertError) {
    return { error: true, message: "No se pudo consolidar la lista final del partido." };
  }

  return {
    error: false,
    message: `Convocatoria cerrada con ${projectedBoard.projectedStarters} titulares y ${projectedBoard.projectedSubstitutes} suplentes.`,
  };
}

export async function updateMatchStatus(
  _previousState: MatchAdminActionState,
  formData: FormData,
): Promise<MatchAdminActionState> {
  const matchId = String(formData.get("matchId") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!matchId || !status) {
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
    const syncResult = await syncMatchParticipants(matchId);

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
    .maybeSingle();

  if (matchError || !match) {
    return {
      message: "No se encontro el partido para editar la lista.",
      status: "error",
    };
  }

  if (match.status !== "open") {
    return {
      message: "Solo se puede editar la lista cuando la convocatoria esta abierta.",
      status: "error",
    };
  }

  const signupCutoffDate = getSignupCutoffDate(match.match_date, match.start_time);

  if (signupCutoffDate && Date.now() >= signupCutoffDate.getTime()) {
    return {
      message: "La convocatoria ya cerro por horario. La lista quedo congelada.",
      status: "error",
    };
  }

  const { error } = await supabase.from("availability_responses").upsert(
    {
      match_id: matchId,
      player_id: playerId,
      responded_at: new Date().toISOString(),
      response,
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

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/confirmar");

  return {
    message: "Respuesta actualizada desde admin.",
    status: "success",
  };
}
