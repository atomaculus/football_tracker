"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export type AvailabilityActionState = {
  message: string;
  status: "idle" | "success" | "error" | "demo";
};

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
