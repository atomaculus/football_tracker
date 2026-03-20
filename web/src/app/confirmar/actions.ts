"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export type AvailabilityActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
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

export async function submitAvailabilityResponse(
  _previousState: AvailabilityActionState,
  formData: FormData,
): Promise<AvailabilityActionState> {
  const matchId = String(formData.get("matchId") ?? "");
  const playerId = String(formData.get("playerId") ?? "");
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
    .maybeSingle();

  if (matchError || !match) {
    return {
      message: "No se encontro el partido para registrar la respuesta.",
      status: "error",
    };
  }

  if (match.status !== "open") {
    return {
      message:
        match.status === "suspended"
          ? "La fecha esta suspendida. No se pueden cargar respuestas."
          : "La convocatoria esta cerrada. No se pueden cambiar respuestas ahora.",
      status: "error",
    };
  }

  const signupCutoffDate = getSignupCutoffDate(match.match_date, match.start_time);

  if (signupCutoffDate && Date.now() >= signupCutoffDate.getTime()) {
    return {
      message: "La convocatoria ya cerro por horario. No se pueden cambiar respuestas ahora.",
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
      message: "No se pudo guardar la respuesta en Supabase.",
      status: "error",
    };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/confirmar");

  return {
    message: "Respuesta guardada. La lista del martes ya quedo actualizada.",
    status: "success",
  };
}
