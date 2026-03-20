"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export type MatchAdminActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

export type AttendanceAdminActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

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
