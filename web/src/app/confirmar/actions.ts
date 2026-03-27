"use server";

import { revalidatePath } from "next/cache";

import { requireViewerSession } from "@/lib/auth";
import {
  ensureMatchClosureIfNeeded,
  getOpeningResponseForPlayer,
  getSignupCutoffDate,
} from "@/lib/match-operations";
import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export type AvailabilityActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

type MatchAvailabilityRow = {
  match_date: string;
  start_time: string | null;
  status: "scheduled" | "open" | "closed" | "played" | "cancelled" | "suspended";
};

export async function submitAvailabilityResponse(
  _previousState: AvailabilityActionState,
  formData: FormData,
): Promise<AvailabilityActionState> {
  const viewer = await requireViewerSession("/confirmar");
  const matchId = String(formData.get("matchId") ?? "");
  const playerId = viewer.playerId;
  const response = String(formData.get("response") ?? "");

  if (!playerId || !response) {
    return {
      message: "Elegi un jugador y una respuesta antes de guardar.",
      status: "error",
    };
  }

  if (!hasSupabaseEnv()) {
    return {
      message:
        "La pantalla ya esta lista. Para persistir respuestas falta conectar las credenciales de Supabase.",
      status: "demo",
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase || !matchId) {
    return {
      message: "No se encontro un partido abierto para registrar la respuesta.",
      status: "error",
    };
  }

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("match_date, start_time, status")
    .eq("id", matchId)
    .maybeSingle<MatchAvailabilityRow>();

  if (matchError || !match) {
    return {
      message: "No se encontro el partido para registrar la respuesta.",
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
      message:
        match.status === "suspended"
          ? "La fecha esta suspendida. No se pueden cargar respuestas."
          : "El partido ya no admite cambios de asistencia.",
      status: "error",
    };
  }

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

  const signupCutoffDate = getSignupCutoffDate(match.match_date, match.start_time);
  const submissionsOpen =
    match.status === "open" &&
    (signupCutoffDate ? Date.now() < signupCutoffDate.getTime() : true);
  const lateDropRequested = response === "not_going";
  const canLateDrop =
    lateDropRequested &&
    (existingResponse?.response === "going" || existingResponse?.response === "backup");

  if (!submissionsOpen && !canLateDrop) {
    return {
      message:
        match.status === "closed"
          ? "La lista ya esta cerrada. Solo se permiten bajas tardias de jugadores ya anotados."
          : "La convocatoria ya cerro por horario. Solo se permiten bajas tardias de jugadores ya anotados.",
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
      message: "No se pudo guardar la respuesta en Supabase.",
      status: "error",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/confirmar");

  return {
    message: submissionsOpen
      ? persistedResponse === "backup" && response === "going"
        ? "Respuesta guardada. Como no venias de la fecha anterior, entraste como suplente por defecto."
        : "Respuesta guardada. La lista del martes ya quedo actualizada."
      : "Baja tardia registrada. El siguiente suplente ya puede ocupar ese lugar.",
    status: "success",
  };
}
