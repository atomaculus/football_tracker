"use server";

import { revalidatePath } from "next/cache";

import { getSupabaseClient, hasSupabaseEnv } from "@/lib/supabase";

export type MatchAdminActionState = {
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
